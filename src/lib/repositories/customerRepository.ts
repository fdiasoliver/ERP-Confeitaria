import { prisma } from "@/lib/prisma";
import type { Prisma, Customer, CustomerType } from "@prisma/client";

// ─── Tipos e includes ──────────────────────────────────────────────────────────

export interface ListCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  orderBy?: "name" | "phone" | "createdAt";
  orderDirection?: "asc" | "desc";
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// LTV (soma de Order.total) e data do último pedido são calculados aqui, não no
// Service — são o resultado direto de uma agregação Prisma (groupBy), sem nenhuma
// decisão de negócio envolvida (mesmo princípio de countByX/sumByX já usados em
// orderRepository.ts). A deduplicação de Address (KI-10/BT-11) NÃO acontece aqui —
// fica exclusivamente no Service (Sprint 2.L.2), conforme decisão já tomada no
// Planejamento desta sprint.
export interface CustomerRow extends Customer {
  ltv: number;
  lastOrderAt: Date | null;
}

const withDetail = {
  orders: { orderBy: { createdAt: "desc" } },
  addresses: true,
} satisfies Prisma.CustomerInclude;

export type CustomerWithDetail = Prisma.CustomerGetPayload<{ include: typeof withDetail }>;

// ─── Helpers de query (não expostos — só formam o `where`) ────────────────────

function buildWhere(params: Pick<ListCustomersParams, "search" | "active">): Prisma.CustomerWhereInput {
  return {
    ...(params.active !== undefined ? { active: params.active } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" } },
            { phone: { contains: params.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

// ─── Leitura — listagem paginada com LTV e último pedido ──────────────────────

export async function findAllCustomers(params: ListCustomersParams): Promise<PagedResult<CustomerRow>> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 20;
  const where = buildWhere(params);
  const orderByField = params.orderBy ?? "name";
  const orderDirection = params.orderDirection ?? "asc";

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { [orderByField]: orderDirection },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where }),
  ]);

  const customerIds = customers.map((c) => c.id);

  // Uma única query de agregação para a página inteira (evita N+1 — uma consulta por
  // cliente). Mesmo padrão já usado em orderRepository.findItemsGroupedByProduct.
  const aggregates =
    customerIds.length > 0
      ? await prisma.order.groupBy({
          by: ["customerId"],
          where: { customerId: { in: customerIds } },
          _sum: { total: true },
          _max: { createdAt: true },
        })
      : [];

  const aggregateByCustomerId = new Map(
    aggregates.map((a) => [a.customerId, { ltv: Number(a._sum.total ?? 0), lastOrderAt: a._max.createdAt }]),
  );

  const items: CustomerRow[] = customers.map((customer) => {
    const aggregate = aggregateByCustomerId.get(customer.id);
    return {
      ...customer,
      ltv: aggregate?.ltv ?? 0,
      lastOrderAt: aggregate?.lastOrderAt ?? null,
    };
  });

  return { items, total, page, pageSize };
}

// ─── Leitura — detalhe (histórico de pedidos + endereços, sem deduplicar) ─────

export async function findCustomerById(id: string): Promise<CustomerWithDetail | null> {
  return prisma.customer.findUnique({ where: { id }, include: withDetail });
}

// Leitura mínima (só telefone) — usada pelo hook de notificação WhatsApp em
// updateOrderStatus (orderService.ts), evita puxar endereços/pedidos à toa.
export async function findCustomerPhoneById(id: string): Promise<string | null> {
  const customer = await prisma.customer.findUnique({ where: { id }, select: { phone: true } });
  return customer?.phone ?? null;
}

// ─── Escrita — apenas `notes` ──────────────────────────────────────────────────

export async function updateCustomerNotes(id: string, notes: string | null): Promise<Customer> {
  return prisma.customer.update({ where: { id }, data: { notes } });
}

// ─── Leitura/escrita — cadastro complementar do cliente (name/birthDate) ──────
// Usadas por customerProfileService.ts (o próprio cliente editando os próprios
// dados) — diferente de updateCustomerNotes acima, que é o Service ADMIN
// editando `notes` de um Customer de terceiros.

export async function findCustomerByPhone(
  phone: string,
): Promise<Pick<Customer, "id" | "name" | "phone" | "birthDate"> | null> {
  return prisma.customer.findUnique({
    where: { phone },
    select: { id: true, name: true, phone: true, birthDate: true },
  });
}

export async function updateCustomerProfile(
  id: string,
  data: { name?: string; birthDate?: Date | null },
): Promise<Customer> {
  return prisma.customer.update({ where: { id }, data });
}

// ─── Leitura — checagem de duplicidade por CNPJ (cliente corporativo) ─────────
// Equivalente a findCustomerByPhone (acima) para o campo cnpj (@unique) — mesmo
// padrão, seleção mínima, usada só para checagem de duplicidade no Service.

export async function findCustomerByCnpj(cnpj: string): Promise<Pick<Customer, "id"> | null> {
  return prisma.customer.findUnique({ where: { cnpj }, select: { id: true } });
}

// ─── Escrita — criação (cliente corporativo + consumidor final) ───────────────

export async function createCustomer(data: {
  name: string;
  type: CustomerType;
  phone?: string | null;
  cnpj?: string | null;
  companyName?: string | null;
  tradeName?: string | null;
  email?: string | null;
  notes?: string | null;
}): Promise<Customer> {
  return prisma.customer.create({ data });
}

// ─── Uso/vínculo — exclusão protegida ──────────────────────────────────────────

export async function countCustomerOrders(id: string): Promise<number> {
  return prisma.order.count({ where: { customerId: id } });
}

// ─── Ciclo de vida — ativar/desativar/excluir ─────────────────────────────────

export async function activateCustomer(id: string): Promise<Customer> {
  return prisma.customer.update({ where: { id }, data: { active: true } });
}

export async function deactivateCustomer(id: string): Promise<Customer> {
  return prisma.customer.update({ where: { id }, data: { active: false } });
}

export async function deleteCustomer(id: string): Promise<void> {
  await prisma.customer.delete({ where: { id } });
}
