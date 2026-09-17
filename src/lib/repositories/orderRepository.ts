import { prisma } from "@/lib/prisma";
import type { Prisma, OrderStatus, RescheduleStatus, DeliveryType, PaymentMethod, QuoteStatus } from "@prisma/client";

// ─── Tipos e includes ──────────────────────────────────────────────────────────

const withItems = {
  items: true,
} satisfies Prisma.OrderInclude;

export type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof withItems }>;

// Include dedicado para o fluxo de Orçamentos (link público) — só usado pelas
// funções novas desta seção. O include padrão (`withItems`, acima) não ganha
// `customer` para não alterar o shape de retorno das funções já existentes
// (Kanban, listagem, reagendamento) que não precisam desse dado.
const withItemsAndCustomer = {
  items: true,
  customer: true,
} satisfies Prisma.OrderInclude;

export type OrderWithItemsAndCustomer = Prisma.OrderGetPayload<{ include: typeof withItemsAndCustomer }>;

const withConsolidationRelations = {
  product: {
    include: {
      recipes: {
        include: {
          recipe: {
            include: {
              items: {
                include: {
                  ingredient: { include: { unit: true } },
                  unit: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.OrderItemInclude;

export type OrderItemForConsolidation = Prisma.OrderItemGetPayload<{
  include: typeof withConsolidationRelations;
}>;

// ─── Helpers de query (não expostos — só formam o `where`) ────────────────────

function dayRange(date: Date): { gte: Date; lte: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { gte: start, lte: end };
}

// `quoteStatus`: um valor específico do enum filtra por aquele status exato;
// a string literal "ANY" filtra `quoteStatus IS NOT NULL` (histórico completo
// de orçamentos, independente de `status` — ver orderService.ts, listOrders).
export type QuoteStatusFilter = QuoteStatus | "ANY";

function buildWhere(date?: Date, status?: OrderStatus, quoteStatus?: QuoteStatusFilter): Prisma.OrderWhereInput {
  return {
    ...(date ? { deliveryDate: dayRange(date) } : {}),
    ...(status ? { status } : {}),
    ...(quoteStatus === "ANY" ? { quoteStatus: { not: null } } : quoteStatus ? { quoteStatus } : {}),
  };
}

// ─── Leitura — Kanban (A-03) ───────────────────────────────────────────────────

export async function findByDateAndStatus(
  date?: Date,
  status?: OrderStatus,
  quoteStatus?: QuoteStatusFilter,
): Promise<OrderWithItems[]> {
  return prisma.order.findMany({
    where: buildWhere(date, status, quoteStatus),
    include: withItems,
    orderBy: [{ deliveryDate: "asc" }, { createdAt: "asc" }],
  });
}

export async function findOrderById(id: string): Promise<OrderWithItems | null> {
  return prisma.order.findUnique({ where: { id }, include: withItems });
}

// ─── Leitura — agregações para os stat cards (A-03) ────────────────────────────
// Cada função aceita apenas filtros estruturais (data/status) — a decisão de
// negócio de qual filtro representa "urgente", "hoje" etc. é do Service.

export async function countByDateAndStatus(date?: Date, status?: OrderStatus): Promise<number> {
  return prisma.order.count({ where: buildWhere(date, status) });
}

export async function sumItemQuantityByDateAndStatus(date?: Date, status?: OrderStatus): Promise<number> {
  const result = await prisma.orderItem.aggregate({
    where: { order: buildWhere(date, status) },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

export async function countByDateExcludingStatus(date: Date, excludeStatuses: OrderStatus[]): Promise<number> {
  return prisma.order.count({
    where: { deliveryDate: dayRange(date), status: { notIn: excludeStatuses } },
  });
}

// ─── Leitura — consolidação de batch (A-03) ────────────────────────────────────

export async function findItemsForConsolidation(
  startDate: Date,
  endDate: Date,
  excludeStatuses: OrderStatus[] = [],
): Promise<OrderItemForConsolidation[]> {
  return prisma.orderItem.findMany({
    where: {
      order: {
        deliveryDate: { gte: dayRange(startDate).gte, lte: dayRange(endDate).lte },
        ...(excludeStatuses.length > 0 ? { status: { notIn: excludeStatuses } } : {}),
      },
    },
    include: withConsolidationRelations,
  });
}

// ─── Leitura — CMV (REGRAS_NEGOCIO.md 13.7) ────────────────────────────────────

export async function findItemsGroupedByProduct(
  startDate: Date,
  endDate: Date,
  status: OrderStatus,
): Promise<{ productId: string; quantity: number }[]> {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: {
        deliveryDate: { gte: dayRange(startDate).gte, lte: dayRange(endDate).lte },
        status,
      },
    },
    _sum: { quantity: true },
  });

  return grouped.map((g) => ({ productId: g.productId, quantity: g._sum.quantity ?? 0 }));
}

// ─── Leitura — carga de produção por dia (P3.3, calendário) ───────────────────

export async function countOrdersByDeliveryDateInRange(
  startDate: Date,
  endDate: Date,
  excludeStatuses: OrderStatus[] = [],
): Promise<{ date: Date; count: number }[]> {
  const grouped = await prisma.order.groupBy({
    by: ["deliveryDate"],
    where: {
      deliveryDate: { gte: dayRange(startDate).gte, lte: dayRange(endDate).lte },
      ...(excludeStatuses.length > 0 ? { status: { notIn: excludeStatuses } } : {}),
    },
    _count: true,
  });
  return grouped.map((g) => ({ date: g.deliveryDate, count: g._count }));
}

// ─── Leitura — relatório financeiro (P3.2, REGRAS_NEGOCIO.md 13/14) ───────────
// "basis" decide o critério de faturamento (Product Owner, planejamento do
// P3.2): ENTREGUE reflete pedidos de fato concluídos (mesmo critério já usado
// pelo CMV abaixo); PAGO segue a Seção 13.1 literalmente (dinheiro recebido,
// independente de status de entrega). CMV continua sempre ENTREGUE (13.7) —
// o basis nunca altera essa regra, só a leitura de faturamento.

export type RevenueBasis = "ENTREGUE" | "PAGO";

function buildRevenueWhere(startDate: Date, endDate: Date, basis: RevenueBasis): Prisma.OrderWhereInput {
  const range = { deliveryDate: { gte: dayRange(startDate).gte, lte: dayRange(endDate).lte } };
  return basis === "ENTREGUE" ? { ...range, status: "ENTREGUE" } : { ...range, paymentStatus: "PAGO" };
}

export async function sumOrderTotals(
  startDate: Date,
  endDate: Date,
  basis: RevenueBasis,
): Promise<{ total: number; count: number }> {
  const result = await prisma.order.aggregate({
    where: buildRevenueWhere(startDate, endDate, basis),
    _sum: { total: true },
    _count: true,
  });
  return { total: Number(result._sum.total ?? 0), count: result._count };
}

export async function findItemsGroupedByProductInRange(
  startDate: Date,
  endDate: Date,
  basis: RevenueBasis,
): Promise<{ productId: string; quantity: number; totalPrice: number }[]> {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: buildRevenueWhere(startDate, endDate, basis) },
    _sum: { quantity: true, totalPrice: true },
  });
  return grouped.map((g) => ({
    productId: g.productId,
    quantity: g._sum.quantity ?? 0,
    totalPrice: Number(g._sum.totalPrice ?? 0),
  }));
}

export async function groupOrdersByPaymentMethod(
  startDate: Date,
  endDate: Date,
  basis: RevenueBasis,
): Promise<{ paymentMethod: string; total: number; count: number }[]> {
  const grouped = await prisma.order.groupBy({
    by: ["paymentMethod"],
    where: buildRevenueWhere(startDate, endDate, basis),
    _sum: { total: true },
    _count: true,
  });
  return grouped.map((g) => ({
    paymentMethod: g.paymentMethod,
    total: Number(g._sum.total ?? 0),
    count: g._count,
  }));
}

// ─── Escrita — transição de status ─────────────────────────────────────────────
// Update do pedido + criação de OrderStatusHistory na mesma transação — migrado de
// src/app/api/orders/[id]/status/route.ts (Sprint 2.K.2 removerá a rota antiga).

export async function updateStatusWithHistory(
  orderId: string,
  newStatus: OrderStatus,
  notes?: string,
): Promise<OrderWithItems> {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: withItems,
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: newStatus,
        notes: notes ?? null,
      },
    });

    return updated;
  });
}

// ─── Escrita — criação (orçamento admin) ───────────────────────────────────────
// Contraparte, para o admin, da transação hoje embutida em
// src/app/api/orders/route.ts (checkout público, não alterado por esta sprint) —
// mesmo padrão de snapshot em OrderItem (productName/unitPrice/totalPrice) e
// registro em OrderStatusHistory na mesma transação. Recebe dados já resolvidos
// (customerId, addressId, deliveryDistanceKm) — resolução de endereço/frete é
// responsabilidade do Service (orderService.ts), não desta função.

export interface CreateOrderWithItemsInput {
  customerId: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryDate: Date;
  deliveryTimeSlot?: string | null;
  addressId?: string | null;
  receiverName: string;
  receiverPhone?: string | null;
  deliveryFee: number;
  deliveryDistanceKm?: number | null;
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  orderNotes?: string | null;
  createdById?: string | null;
  statusHistoryNotes?: string | null;
  // Ambos preenchidos juntos pelo Service quando `status: "RASCUNHO"` (orçamento) —
  // ver orderService.ts, createOrder. `quoteStatus` não estava no escopo original
  // desta assinatura (só `shareToken` foi pedido), mas precisa ser gravado no mesmo
  // insert para não deixar um orçamento novo com `shareToken` preenchido e
  // `quoteStatus` nulo mesmo que passageiramente.
  shareToken?: string | null;
  quoteStatus?: QuoteStatus | null;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    observation?: string | null;
  }[];
}

export async function createOrderWithItems(data: CreateOrderWithItemsInput): Promise<OrderWithItems> {
  return prisma.$transaction(async (tx) => {
    return tx.order.create({
      data: {
        customerId: data.customerId,
        status: data.status,
        deliveryType: data.deliveryType,
        deliveryDate: data.deliveryDate,
        deliveryTimeSlot: data.deliveryTimeSlot ?? null,
        addressId: data.addressId ?? null,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone ?? null,
        deliveryFee: data.deliveryFee,
        deliveryDistanceKm: data.deliveryDistanceKm ?? null,
        subtotal: data.subtotal,
        total: data.total,
        paymentMethod: data.paymentMethod,
        paymentStatus: "PENDENTE",
        orderNotes: data.orderNotes ?? null,
        createdById: data.createdById ?? null,
        shareToken: data.shareToken ?? null,
        quoteStatus: data.quoteStatus ?? null,
        items: {
          create: data.items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
            observation: i.observation ?? null,
          })),
        },
        statusHistory: {
          create: {
            status: data.status,
            notes: data.statusHistoryNotes ?? null,
          },
        },
      },
      include: withItems,
    });
  });
}

// ─── Escrita — reagendamento negociado ─────────────────────────────────────────
// Sem tabela de histórico dedicada (decisão arquitetural — ver orderService.ts,
// suggestReschedule/respondToReschedule): apenas os 2 campos escalares do
// pedido são atualizados, sem transação (uma única query `update`, ao contrário
// de updateStatusWithHistory acima, que grava em duas tabelas).

export async function updateRescheduleFields(
  orderId: string,
  data: {
    deliveryDate?: Date;
    suggestedDeliveryDate: Date | null;
    rescheduleStatus: RescheduleStatus;
  },
): Promise<OrderWithItems> {
  return prisma.order.update({
    where: { id: orderId },
    data,
    include: withItems,
  });
}

// ─── Orçamentos — link público (shareToken/quoteStatus) ────────────────────────
// Ver orderService.ts (ensureShareToken, sendQuote, decideQuote, getPublicQuote,
// updatePublicQuoteItemQuantity, removePublicQuoteItem) para a orquestração que
// consome estas funções.

export async function findOrderByShareToken(token: string): Promise<OrderWithItemsAndCustomer | null> {
  return prisma.order.findUnique({
    where: { shareToken: token },
    include: withItemsAndCustomer,
  });
}

export async function updateQuoteStatus(orderId: string, quoteStatus: QuoteStatus): Promise<OrderWithItems> {
  return prisma.order.update({
    where: { id: orderId },
    data: { quoteStatus },
    include: withItems,
  });
}

export async function setShareToken(orderId: string, token: string): Promise<OrderWithItems> {
  return prisma.order.update({
    where: { id: orderId },
    data: { shareToken: token },
    include: withItems,
  });
}

// Recálculo de subtotal/total sempre feito no Service, nunca aqui — esta função
// só persiste os valores já recalculados, na mesma transação do item mutado.
export async function updateItemQuantityAndTotals(
  orderId: string,
  itemId: string,
  quantity: number,
  newItemTotal: number,
  newSubtotal: number,
  newTotal: number,
): Promise<OrderWithItemsAndCustomer> {
  return prisma.$transaction(async (tx) => {
    await tx.orderItem.update({
      where: { id: itemId },
      data: { quantity, totalPrice: newItemTotal },
    });

    return tx.order.update({
      where: { id: orderId },
      data: { subtotal: newSubtotal, total: newTotal },
      include: withItemsAndCustomer,
    });
  });
}

export async function removeItemAndRecalculateTotals(
  orderId: string,
  itemId: string,
  newSubtotal: number,
  newTotal: number,
): Promise<OrderWithItemsAndCustomer> {
  return prisma.$transaction(async (tx) => {
    await tx.orderItem.delete({ where: { id: itemId } });

    return tx.order.update({
      where: { id: orderId },
      data: { subtotal: newSubtotal, total: newTotal },
      include: withItemsAndCustomer,
    });
  });
}
