import { prisma } from "@/lib/prisma";
import type { Prisma, OrderStatus } from "@prisma/client";

// ─── Tipos e includes ──────────────────────────────────────────────────────────

const withItems = {
  items: true,
} satisfies Prisma.OrderInclude;

export type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof withItems }>;

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

function buildWhere(date?: Date, status?: OrderStatus): Prisma.OrderWhereInput {
  return {
    ...(date ? { deliveryDate: dayRange(date) } : {}),
    ...(status ? { status } : {}),
  };
}

// ─── Leitura — Kanban (A-03) ───────────────────────────────────────────────────

export async function findByDateAndStatus(date?: Date, status?: OrderStatus): Promise<OrderWithItems[]> {
  return prisma.order.findMany({
    where: buildWhere(date, status),
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
