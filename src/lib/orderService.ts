import type { DeliveryType, OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/types";
import type { OrderStatus as PrismaOrderStatus } from "@prisma/client";
import {
  findByDateAndStatus,
  findOrderById,
  countByDateAndStatus,
  sumItemQuantityByDateAndStatus,
  countByDateExcludingStatus,
  findItemsForConsolidation,
  updateStatusWithHistory,
  type OrderWithItems,
} from "@/lib/repositories/orderRepository";
import { resolveConversionFactor } from "@/lib/recipeService";
import { notifyOrderStatus } from "@/lib/whatsappNotificationService";
import { findCustomerPhoneById } from "@/lib/repositories/customerRepository";

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
