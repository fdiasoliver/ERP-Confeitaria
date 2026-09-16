import type { DeliveryType, DeliveryAddressInput, OrderStatus, PaymentMethod, PaymentStatus, RescheduleStatus, ValidationError } from "@/lib/types";
import type { OrderStatus as PrismaOrderStatus, RescheduleStatus as PrismaRescheduleStatus } from "@prisma/client";
import {
  findByDateAndStatus,
  findOrderById,
  countByDateAndStatus,
  sumItemQuantityByDateAndStatus,
  countByDateExcludingStatus,
  countOrdersByDeliveryDateInRange,
  findItemsForConsolidation,
  updateStatusWithHistory,
  updateRescheduleFields,
  createOrderWithItems,
  type OrderWithItems,
} from "@/lib/repositories/orderRepository";
import { resolveConversionFactor } from "@/lib/recipeService";
import { notifyOrderStatus, notifyRescheduleSuggested } from "@/lib/whatsappNotificationService";
import { findCustomerPhoneById, findCustomerById } from "@/lib/repositories/customerRepository";
import { findAddressById, createAddress } from "@/lib/repositories/addressRepository";
import { getStoreConfig } from "@/lib/storeConfigService";
import { checkFreeDeliveryEligibility, DistanceCalculationFailedError } from "@/lib/deliveryService";
import { CustomerNotFoundError } from "@/lib/customerService";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class OrderNotFoundError extends Error {
  constructor(public id: string) {
    super(`Pedido não encontrado: ${id}`);
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(
    public from: OrderStatus,
    public to: OrderStatus,
  ) {
    super(`Transição de status inválida: ${from} → ${to}`);
  }
}

export class InvalidRescheduleStateError extends Error {
  constructor(
    public orderId: string,
    public reason: string,
  ) {
    super(`Reagendamento inválido para o pedido ${orderId}: ${reason}`);
  }
}

export class CustomerPhoneMismatchError extends Error {
  constructor(public orderId: string) {
    super(`O telefone informado não corresponde ao cliente do pedido ${orderId}.`);
  }
}

// Criação de orçamento (admin) — ver createOrder, seção "Criação" mais abaixo.
export class OrderValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

// Endereço salvo (addressId) inválido ou pertencente a outro cliente — mesmo
// significado de InvalidAddressError em src/app/api/orders/route.ts (rota
// pública, não alterada por esta sprint), reimplementado aqui porque aquela
// classe não é exportada por aquele arquivo.
export class OrderInvalidAddressError extends Error {
  constructor() {
    super("Endereço inválido.");
  }
}

// ─── Transições de status (REGRAS_NEGOCIO.md 15.1.4) ──────────────────────────
// Migrado de src/app/api/orders/[id]/status/route.ts (VALID_TRANSITIONS) — mesma
// regra, mesmos valores, agora validada no Service em vez de só na rota. "Nunca
// retroceder status sem autorização de ADMIN": a garantia de que só um admin chega
// até aqui é de `requireAdmin()` na rota (Sprint 2.K.2); esta tabela nunca permite
// nenhuma transição regressiva, para nenhum papel — não existe hoje um caminho de
// "retrocesso autorizado por ADMIN" implementado em nenhuma camada (rota antiga
// incluída) — ver divergência reportada ao final da Sprint 2.K.1.

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  RASCUNHO: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EM_PRODUCAO", "CANCELADO"],
  EM_PRODUCAO: ["PRONTO", "CANCELADO"],
  PRONTO: ["SAIU_ENTREGA", "ENTREGUE"],
  SAIU_ENTREGA: ["ENTREGUE"],
  ENTREGUE: [],
  CANCELADO: [],
};

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

export interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  observation: string | null;
}

export interface OrderDTO {
  id: string;
  orderNumber: number;
  customerId: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryDate: string;
  deliveryTimeSlot: string | null;
  addressId: string | null;
  receiverName: string;
  receiverPhone: string | null;
  deliveryFee: number;
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderNotes: string | null;
  suggestedDeliveryDate: string | null;
  rescheduleStatus: RescheduleStatus;
  items: OrderItemDTO[];
  createdAt: string;
  updatedAt: string;
}

function mapOrderDTO(order: OrderWithItems): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    status: order.status as OrderStatus,
    deliveryType: order.deliveryType as DeliveryType,
    deliveryDate: order.deliveryDate.toISOString().slice(0, 10),
    deliveryTimeSlot: order.deliveryTimeSlot,
    addressId: order.addressId,
    receiverName: order.receiverName,
    receiverPhone: order.receiverPhone,
    deliveryFee: order.deliveryFee.toNumber(),
    subtotal: order.subtotal.toNumber(),
    total: order.total.toNumber(),
    paymentMethod: order.paymentMethod as PaymentMethod,
    paymentStatus: order.paymentStatus as PaymentStatus,
    orderNotes: order.orderNotes,
    suggestedDeliveryDate: order.suggestedDeliveryDate ? order.suggestedDeliveryDate.toISOString().slice(0, 10) : null,
    rescheduleStatus: order.rescheduleStatus as RescheduleStatus,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
      totalPrice: item.totalPrice.toNumber(),
      observation: item.observation,
    })),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

// ─── Kanban (A-03 — SCREENS.md) ────────────────────────────────────────────────
//
// SCREENS.md A-03 documenta 4 colunas visuais: Confirmado → Em prod. → Pronto →
// Entregue. O enum OrderStatus tem 7 valores. RASCUNHO e CANCELADO nunca aparecem
// no Kanban (RASCUNHO ainda não foi confirmado pelo cliente; CANCELADO saiu do
// fluxo de produção). SAIU_ENTREGA é a única divergência real entre os 4 valores
// documentados e os 7 do schema — decisão tomada nesta sprint, não pelo Solution
// Architect: agrupado dentro da coluna ENTREGUE (do ponto de vista da produção,
// o pedido já não exige mais nenhuma ação depois de PRONTO → SAIU_ENTREGA). Ver
// divergência reportada ao final da Sprint 2.K.1 para o Product Owner confirmar.

export type KanbanColumn = "CONFIRMADO" | "EM_PRODUCAO" | "PRONTO" | "ENTREGUE";

const KANBAN_COLUMN_BY_STATUS: Partial<Record<OrderStatus, KanbanColumn>> = {
  CONFIRMADO: "CONFIRMADO",
  EM_PRODUCAO: "EM_PRODUCAO",
  PRONTO: "PRONTO",
  SAIU_ENTREGA: "ENTREGUE",
  ENTREGUE: "ENTREGUE",
};

export interface KanbanOrderDTO {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  receiverName: string;
  deliveryDate: string;
  deliveryTimeSlot: string | null;
  deliveryType: DeliveryType;
  orderNotes: string | null;
  items: { productName: string; quantity: number; observation: string | null }[];
}

function mapKanbanOrderDTO(order: OrderWithItems): KanbanOrderDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status as OrderStatus,
    receiverName: order.receiverName,
    deliveryDate: order.deliveryDate.toISOString().slice(0, 10),
    deliveryTimeSlot: order.deliveryTimeSlot,
    deliveryType: order.deliveryType as DeliveryType,
    orderNotes: order.orderNotes,
    items: order.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      observation: item.observation,
    })),
  };
}

export interface KanbanStatsDTO {
  orderCount: number;
  itemCount: number;
  urgentCount: number;
}

export interface KanbanDataDTO {
  stats: KanbanStatsDTO;
  columns: Record<KanbanColumn, KanbanOrderDTO[]>;
}

/**
 * `date` filtra a coluna de pedidos exibida (aba Hoje/Amanhã/Calendário de A-03) —
 * quando omitido, retorna todos os pedidos elegíveis para o Kanban, sem filtro de
 * data (uso esperado: aba "Semana", que hoje não tem suporte a intervalo de datas
 * nesta assinatura — ver divergência reportada ao final da Sprint 2.K.1).
 *
 * `urgentCount` (REGRAS_NEGOCIO.md 14.1: "deliveryDate = hoje e status ≠ ENTREGUE, RASCUNHO
 * ou CANCELADO") é sempre calculado sobre a data real de hoje — independente do `date`
 * recebido — porque "urgente" é uma métrica fixa do dia corrente, não do filtro de exibição.
 * `RASCUNHO`/`CANCELADO` são excluídos porque nunca aparecem no Kanban (sem coluna própria) —
 * contá-los como urgentes divergiria da lista de cards exibida no Frontend (Sprint 2.K.1).
 */
export async function getKanbanData(date?: Date): Promise<KanbanDataDTO> {
  const orders = await findByDateAndStatus(date);

  const columns: Record<KanbanColumn, KanbanOrderDTO[]> = {
    CONFIRMADO: [],
    EM_PRODUCAO: [],
    PRONTO: [],
    ENTREGUE: [],
  };

  for (const order of orders) {
    const column = KANBAN_COLUMN_BY_STATUS[order.status as OrderStatus];
    if (!column) continue;
    columns[column].push(mapKanbanOrderDTO(order));
  }

  const today = new Date();
  const [orderCount, itemCount, urgentCount] = await Promise.all([
    countByDateAndStatus(date),
    sumItemQuantityByDateAndStatus(date),
    countByDateExcludingStatus(today, ["ENTREGUE", "RASCUNHO", "CANCELADO"] as PrismaOrderStatus[]),
  ]);

  return {
    stats: { orderCount, itemCount, urgentCount },
    columns,
  };
}

// ─── Carga de produção por dia (P3.3 — Calendário de produção) ────────────────
//
// Aba "Calendário"/"Semana" em /admin/producao (antes "Em construção" — a API
// de Kanban só aceitava um único dia). RASCUNHO (ainda não confirmado) e
// CANCELADO (não vai ser produzido) ficam fora da contagem — carga real de
// produção, não "quantos registros de Order existem nessa data" (diferente do
// `orderCount` do Kanban de um único dia, que não faz essa exclusão — aqui a
// distinção importa mais, porque o objetivo é alertar sobrecarga real).
//
// Limiar de sobrecarga: StoreConfig.monthlyProductionUnits (já configurado em
// /admin/config para o cálculo de precificação do P3.1) ÷ 30 — reaproveita um
// número que o Product Owner já forneceu, em vez de inventar uma constante
// nova. Heurística simples, ajustável depois se não fizer sentido na prática.

export interface ProductionLoadDayDTO {
  date: string; // YYYY-MM-DD
  orderCount: number;
  isOverloaded: boolean;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getProductionLoad(startDate: Date, endDate: Date): Promise<ProductionLoadDayDTO[]> {
  const [grouped, storeConfig] = await Promise.all([
    countOrdersByDeliveryDateInRange(startDate, endDate, ["RASCUNHO", "CANCELADO"] as PrismaOrderStatus[]),
    getStoreConfig(),
  ]);

  const dailyCapacity = Math.max(1, Math.round(storeConfig.monthlyProductionUnits / 30));
  const countByDate = new Map(grouped.map((g) => [toDateKey(g.date), g.count]));

  const days: ProductionLoadDayDTO[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const key = toDateKey(cursor);
    const orderCount = countByDate.get(key) ?? 0;
    days.push({ date: key, orderCount, isOverloaded: orderCount > dailyCapacity });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

// ─── Consolidação de batch (A-03) ──────────────────────────────────────────────
//
// REGRAS_NEGOCIO.md 6.5: conversão de unidade sempre que RecipeIngredient.unitId
// difere de Ingredient.unitId — reaproveita `resolveConversionFactor` de
// recipeService.ts (mesma função usada por recipeService.calculateCost), nunca
// duplicada. Pedidos CANCELADO são excluídos — decisão de negócio deste Service
// (não do Repository, que só recebe a lista de status a excluir).

export interface ConsolidatedIngredientDTO {
  ingredientId: string;
  ingredientName: string;
  totalQuantity: number;
  unitId: string;
  unitName: string;
  unitAbbreviation: string;
}

export async function getConsolidation(startDate: Date, endDate: Date): Promise<ConsolidatedIngredientDTO[]> {
  const orderItems = await findItemsForConsolidation(startDate, endDate, ["CANCELADO" as PrismaOrderStatus]);

  const totals = new Map<string, ConsolidatedIngredientDTO>();

  for (const orderItem of orderItems) {
    for (const productRecipe of orderItem.product.recipes) {
      const recipeLinkQuantity = productRecipe.quantity.toNumber();

      for (const recipeIngredient of productRecipe.recipe.items) {
        const baseQuantity = recipeIngredient.quantity.toNumber() * recipeLinkQuantity * orderItem.quantity;

        let quantityInIngredientUnit = baseQuantity;
        if (recipeIngredient.unitId !== recipeIngredient.ingredient.unitId) {
          const factor = await resolveConversionFactor(recipeIngredient.unitId, recipeIngredient.ingredient.unitId);
          quantityInIngredientUnit = factor === null ? baseQuantity : baseQuantity * factor;
        }

        const key = recipeIngredient.ingredientId;
        const existing = totals.get(key);
        if (existing) {
          existing.totalQuantity += quantityInIngredientUnit;
        } else {
          totals.set(key, {
            ingredientId: recipeIngredient.ingredientId,
            ingredientName: recipeIngredient.ingredient.name,
            totalQuantity: quantityInIngredientUnit,
            unitId: recipeIngredient.ingredient.unitId,
            unitName: recipeIngredient.ingredient.unit.name,
            unitAbbreviation: recipeIngredient.ingredient.unit.abbreviation,
          });
        }
      }
    }
  }

  return Array.from(totals.values()).sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
}

// ─── Transição de status ────────────────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, notes?: string): Promise<OrderDTO> {
  const existing = await findOrderById(orderId);
  if (!existing) throw new OrderNotFoundError(orderId);

  const currentStatus = existing.status as OrderStatus;
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed.includes(newStatus)) {
    throw new InvalidStatusTransitionError(currentStatus, newStatus);
  }

  const updated = await updateStatusWithHistory(orderId, newStatus as PrismaOrderStatus, notes);
  const dto = mapOrderDTO(updated);

  // Best-effort — nunca bloqueia nem falha a mutação principal de status
  // (notifyOrderStatus já engole os próprios erros, ver whatsappNotificationService.ts).
  const phone = await findCustomerPhoneById(dto.customerId).catch(() => null);
  if (phone) {
    await notifyOrderStatus({
      orderId: dto.id,
      phone,
      orderNumber: dto.orderNumber,
      status: dto.status,
      deliveryDate: dto.deliveryDate,
      deliveryType: dto.deliveryType,
    });
  }

  return dto;
}

// ─── Reagendamento negociado (Sprint 4/4 — Dashboard Executivo + Calendário) ──
// Sem tabela de histórico dedicada (decisão arquitetural): a trilha de auditoria
// mínima vem do WhatsAppLog da notificação disparada por suggestReschedule
// (template "order_reschedule_suggested"). OrderStatusHistory não é reaproveitado
// aqui — é tipado estritamente para OrderStatus, não para RescheduleStatus.

export async function suggestReschedule(orderId: string, newDate: Date): Promise<OrderDTO> {
  const existing = await findOrderById(orderId);
  if (!existing) throw new OrderNotFoundError(orderId);

  const currentStatus = existing.status as OrderStatus;
  if (currentStatus === "CANCELADO" || currentStatus === "ENTREGUE") {
    throw new InvalidRescheduleStateError(orderId, `pedido está com status ${currentStatus}`);
  }

  const updated = await updateRescheduleFields(orderId, {
    suggestedDeliveryDate: newDate,
    rescheduleStatus: "PENDENTE" as PrismaRescheduleStatus,
  });
  const dto = mapOrderDTO(updated);

  // Best-effort — nunca bloqueia nem falha a mutação principal (mesmo padrão de
  // updateOrderStatus acima; notifyRescheduleSuggested já engole os próprios erros).
  const phone = await findCustomerPhoneById(dto.customerId).catch(() => null);
  if (phone) {
    await notifyRescheduleSuggested({
      orderId: dto.id,
      phone,
      orderNumber: dto.orderNumber,
      suggestedDate: newDate,
    });
  }

  return dto;
}

export async function respondToReschedule(
  orderId: string,
  customerPhone: string,
  response: "ACEITO" | "RECUSADO",
): Promise<OrderDTO> {
  const existing = await findOrderById(orderId);
  if (!existing) throw new OrderNotFoundError(orderId);

  if (existing.rescheduleStatus !== "PENDENTE") {
    throw new InvalidRescheduleStateError(orderId, "não há reagendamento pendente para este pedido");
  }

  const ownerPhone = await findCustomerPhoneById(existing.customerId);
  if (ownerPhone !== customerPhone) {
    throw new CustomerPhoneMismatchError(orderId);
  }

  const updated = await updateRescheduleFields(orderId, {
    deliveryDate: response === "ACEITO" ? (existing.suggestedDeliveryDate ?? existing.deliveryDate) : undefined,
    suggestedDeliveryDate: null,
    rescheduleStatus: "NONE" as PrismaRescheduleStatus,
  });

  return mapOrderDTO(updated);
}

// ─── Criação — orçamento (admin) ───────────────────────────────────────────────
// Contraparte administrativa de src/app/api/orders/route.ts (checkout público,
// não alterado por esta sprint) — mesma regra de resolução de endereço e de
// recálculo de frete grátis, mas recebe `customerId` (não `customerPhone`/upsert)
// e devolve OrderDTO em vez do registro bruto do Prisma. `status` e `createdById`
// são parâmetros — quem chama decide (a Route usa "RASCUNHO" e o id do admin
// autenticado, resolvido via getServerSession, nunca recalculado aqui).

export interface CreateOrderInput {
  customerId: string;
  deliveryDate: string;
  deliveryType: DeliveryType;
  deliveryFee: number;
  addressId?: string;
  deliveryAddress?: DeliveryAddressInput;
  receiverName?: string;
  receiverPhone?: string;
  orderNotes?: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  total: number;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    observation?: string;
  }[];
}

export async function createOrder(
  input: CreateOrderInput,
  status: OrderStatus,
  createdById: string | null,
): Promise<OrderDTO> {
  const errors: ValidationError[] = [];
  if (!input.items || input.items.length === 0) {
    errors.push({ field: "items", code: "REQUIRED", message: "Pelo menos um item é obrigatório." });
  }
  if (errors.length > 0) throw new OrderValidationFailedError(errors);

  const customer = await findCustomerById(input.customerId);
  if (!customer) throw new CustomerNotFoundError(input.customerId);

  // Recalcula a distância/elegibilidade de entrega grátis no servidor — nunca confia
  // no que foi enviado (mesma regra de src/app/api/orders/route.ts, não simplificada
  // nem pulada aqui).
  let deliveryDistanceKm: number | null = null;
  if (input.deliveryType === "ENTREGA_GRATIS" && input.deliveryAddress) {
    try {
      const eligibility = await checkFreeDeliveryEligibility(input.deliveryAddress);
      if (!eligibility.isWithinFreeRadius) {
        throw new OrderValidationFailedError([
          {
            field: "deliveryType",
            code: "OUT_OF_FREE_RADIUS",
            message: `Este endereço está a ${eligibility.distanceKm.toFixed(1)} km, fora do raio de entrega grátis (${eligibility.freeDeliveryRadiusKm} km). Escolha outra forma de entrega.`,
          },
        ]);
      }
      deliveryDistanceKm = eligibility.distanceKm;
    } catch (err) {
      if (err instanceof OrderValidationFailedError) throw err;
      if (err instanceof DistanceCalculationFailedError) {
        throw new OrderValidationFailedError([
          { field: "deliveryAddress", code: "DISTANCE_CALCULATION_FAILED", message: err.message },
        ]);
      }
      throw err;
    }
  }

  // Endereço salvo (addressId) reaproveitado — checagem de ownership obrigatória —
  // ou novo Address criado, mesmo padrão da rota pública (nunca ambos).
  let resolvedAddressId: string | null = null;
  if (input.addressId) {
    const address = await findAddressById(input.addressId);
    if (!address || address.customerId !== customer.id) {
      throw new OrderInvalidAddressError();
    }
    resolvedAddressId = address.id;
  } else if (input.deliveryType !== "RETIRADA" && input.deliveryAddress) {
    const addr = await createAddress(customer.id, {
      label: "Entrega",
      street: input.deliveryAddress.street,
      number: input.deliveryAddress.number,
      complement: input.deliveryAddress.complement ?? null,
      neighborhood: input.deliveryAddress.neighborhood,
      city: input.deliveryAddress.city,
      state: input.deliveryAddress.state,
      zipCode: input.deliveryAddress.zipCode,
    });
    resolvedAddressId = addr.id;
  }

  const createdOrder = await createOrderWithItems({
    customerId: customer.id,
    status: status as PrismaOrderStatus,
    deliveryType: input.deliveryType,
    deliveryDate: new Date(input.deliveryDate + "T12:00:00"),
    addressId: resolvedAddressId,
    receiverName: input.receiverName ?? customer.name,
    receiverPhone: input.receiverPhone ?? null,
    deliveryFee: input.deliveryType === "ENTREGA_GRATIS" ? 0 : input.deliveryFee,
    deliveryDistanceKm,
    subtotal: input.subtotal,
    total: input.total,
    paymentMethod: input.paymentMethod,
    orderNotes: input.orderNotes ?? null,
    createdById,
    statusHistoryNotes: "Orçamento criado pela equipe",
    items: input.items,
  });

  return mapOrderDTO(createdOrder);
}

// ─── Leitura — listagem simples por status (orçamentos pendentes) ─────────────
// Reaproveita findByDateAndStatus (já usado pelo Kanban, acima) sem filtro de
// data — não duplica uma segunda função de leitura no Repository.

export interface ListOrdersFilters {
  status?: OrderStatus;
}

export async function listOrders(filters: ListOrdersFilters = {}): Promise<OrderDTO[]> {
  const orders = await findByDateAndStatus(undefined, filters.status as PrismaOrderStatus | undefined);
  return orders.map(mapOrderDTO);
}
