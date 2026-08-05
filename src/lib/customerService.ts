import type { DeliveryType, OrderStatus, PaymentMethod, PaymentStatus, ValidationError } from "@/lib/types";
import type { Address, Customer } from "@prisma/client";
import {
  findAllCustomers,
  findCustomerById,
  updateCustomerNotes as dbUpdateCustomerNotes,
  type ListCustomersParams,
  type CustomerRow,
  type CustomerWithDetail,
} from "@/lib/repositories/customerRepository";
import { validateCustomerNotesUpdate, type CustomerNotesInput } from "@/lib/validators/customerValidator";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class CustomerNotFoundError extends Error {
  constructor(public id: string) {
    super(`Cliente não encontrado: ${id}`);
  }
}

export class CustomerValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

export interface CustomerDTO {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapCustomerDTO(customer: Customer): CustomerDTO {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    notes: customer.notes,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
}

export interface CustomerListItemDTO {
  id: string;
  name: string;
  phone: string;
  ltv: number;
  lastOrderAt: string | null;
}

function mapCustomerListItemDTO(row: CustomerRow): CustomerListItemDTO {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    ltv: row.ltv,
    lastOrderAt: row.lastOrderAt ? row.lastOrderAt.toISOString() : null,
  };
}

// Histórico de pedidos do cliente — formato simples (sem itens), suficiente para a
// listagem de histórico da tela de detalhe (`/admin/clientes/[id]`, Sprint 2.L.4).
// `CustomerWithDetail.orders` (customerRepository.ts) não inclui `items` — se uma
// sprint futura de Frontend precisar dos itens de cada pedido, o include do
// Repository precisa ser estendido primeiro (fora do escopo desta sprint).
export interface CustomerOrderHistoryItemDTO {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryDate: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: string;
  addressId: string | null;
}

function mapOrderHistoryItemDTO(order: CustomerWithDetail["orders"][number]): CustomerOrderHistoryItemDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status as OrderStatus,
    deliveryType: order.deliveryType as DeliveryType,
    deliveryDate: order.deliveryDate.toISOString().slice(0, 10),
    paymentMethod: order.paymentMethod as PaymentMethod,
    paymentStatus: order.paymentStatus as PaymentStatus,
    total: order.total.toNumber(),
    createdAt: order.createdAt.toISOString(),
    addressId: order.addressId,
  };
}

// ─── Agregação de exibição — deduplicação de endereços (KI-10/BT-11) ──────────
//
// Decisão já tomada no Planejamento desta sprint: isto é agregação SÓ DE EXIBIÇÃO
// para a tela `/admin/clientes/[id]` — nunca escreve/mescla nada no banco. Função
// pura, síncrona, não toca `prisma`.

export interface AddressDTO {
  id: string;
  label: string | null;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: string;
}

function mapAddressDTO(address: Address): AddressDTO {
  return {
    id: address.id,
    label: address.label,
    street: address.street,
    number: address.number,
    complement: address.complement,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
  };
}

// Chave de agrupamento: `street` + `number` + `zipCode`, normalizados (trim +
// lowercase + colapso de espaços extras) — os três campos que, juntos, identificam
// um mesmo endereço físico digitado de formas ligeiramente diferentes ao longo de
// pedidos distintos (ex.: "Rua das Flores" vs "rua das flores  "). `complement` e
// `neighborhood` deliberadamente fora da chave — variações nesses campos não
// significam endereços físicos diferentes.
function normalizeAddressKeyPart(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function addressGroupKey(address: Address): string {
  return [
    normalizeAddressKeyPart(address.street),
    normalizeAddressKeyPart(address.number),
    normalizeAddressKeyPart(address.zipCode),
  ].join("|");
}

export interface AddressGroupDTO {
  representative: AddressDTO;
  addressIds: string[];
}

/**
 * Agrupa endereços "iguais" (mesma rua+número+CEP, normalizados) para exibição —
 * nunca escreve/mescla nada no banco. Cada grupo retorna o endereço mais recente
 * (por `createdAt`) como representante.
 *
 * Contagem de pedidos por grupo: **não incluída aqui**, por decisão desta sprint —
 * a assinatura desta função (`listAddressesGrouped(addresses: Address[])`, fixada
 * no Planejamento) recebe só endereços, não pedidos. Derivar a contagem exigiria
 * cruzar com `Order.addressId` — não é trivial sem estender a assinatura ou tocar
 * `Order` dentro desta função. Em vez disso, cada grupo expõe `addressIds` (todos os
 * IDs de `Address` agrupados); `CustomerOrderHistoryItemDTO.addressId` (correção
 * pontual desta sprint) agora expõe `Order.addressId` em `CustomerDetailDTO.orders`,
 * permitindo ao Frontend cruzar `orders[].addressId` com `addressGroups[].addressIds`
 * e derivar a contagem "usado em N pedidos" por grupo sem exigir uma segunda
 * consulta ao banco.
 */
export function listAddressesGrouped(addresses: Address[]): AddressGroupDTO[] {
  const groups = new Map<string, Address[]>();

  for (const address of addresses) {
    const key = addressGroupKey(address);
    const existing = groups.get(key);
    if (existing) {
      existing.push(address);
    } else {
      groups.set(key, [address]);
    }
  }

  return Array.from(groups.values()).map((group) => {
    const representative = group.reduce((latest, current) => (current.createdAt > latest.createdAt ? current : latest));
    return {
      representative: mapAddressDTO(representative),
      addressIds: group.map((address) => address.id),
    };
  });
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export interface PagedCustomersDTO {
  items: CustomerListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listCustomers(params: ListCustomersParams = {}): Promise<PagedCustomersDTO> {
  const result = await findAllCustomers(params);
  return {
    items: result.items.map(mapCustomerListItemDTO),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

export interface CustomerDetailDTO extends CustomerDTO {
  orders: CustomerOrderHistoryItemDTO[];
  addressGroups: AddressGroupDTO[];
}

export async function getCustomerById(id: string): Promise<CustomerDetailDTO> {
  const customer = await findCustomerById(id);
  if (!customer) throw new CustomerNotFoundError(id);

  return {
    ...mapCustomerDTO(customer),
    orders: customer.orders.map(mapOrderHistoryItemDTO),
    addressGroups: listAddressesGrouped(customer.addresses),
  };
}

// ─── Atualização — apenas `notes` ──────────────────────────────────────────────

export async function updateCustomerNotes(id: string, input: CustomerNotesInput): Promise<CustomerDTO> {
  const errors = validateCustomerNotesUpdate(input);
  if (errors.length > 0) throw new CustomerValidationFailedError(errors);

  const existing = await findCustomerById(id);
  if (!existing) throw new CustomerNotFoundError(id);

  const updated = await dbUpdateCustomerNotes(id, input.notes ?? null);
  return mapCustomerDTO(updated);
}
