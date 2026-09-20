import { randomBytes } from "node:crypto";
import type { DeliveryType, DeliveryAddressInput, OrderStatus, PaymentMethod, PaymentStatus, QuoteStatus, RescheduleStatus, ValidationError } from "@/lib/types";
import type {
  OrderStatus as PrismaOrderStatus,
  RescheduleStatus as PrismaRescheduleStatus,
  QuoteStatus as PrismaQuoteStatus,
  CustomerType,
} from "@prisma/client";
import {
  findByDateAndStatus,
  findOrderById,
  findOrderByShareToken,
  countByDateAndStatus,
  sumItemQuantityByDateAndStatus,
  countByDateExcludingStatus,
  countOrdersByDeliveryDateInRange,
  findItemsForConsolidation,
  updateStatusWithHistory,
  updateRescheduleFields,
  createOrderWithItems,
  updateQuoteStatus,
  setShareToken,
  updateItemQuantityAndTotals,
  removeItemAndRecalculateTotals,
  type OrderWithItems,
  type OrderWithItemsAndCustomer,
  type QuoteStatusFilter,
} from "@/lib/repositories/orderRepository";
import { resolveConversionFactor } from "@/lib/recipeService";
import { notifyOrderStatus, notifyRescheduleSuggested, notifyQuoteShared } from "@/lib/whatsappNotificationService";
import { findCustomerPhoneById, findCustomerById } from "@/lib/repositories/customerRepository";
import { findAddressById, createAddress } from "@/lib/repositories/addressRepository";
import { getStoreConfig } from "@/lib/storeConfigService";
import { checkFreeDeliveryEligibility, DistanceCalculationFailedError } from "@/lib/deliveryService";
import { CustomerNotFoundError } from "@/lib/customerService";
import { env } from "@/lib/env";

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

// ─── Erros de domínio — Orçamentos (Módulo Order.status = RASCUNHO) ───────────

export class InvalidQuoteTransitionError extends Error {
  constructor(
    public from: QuoteStatus,
    public to: QuoteStatus,
  ) {
    super(`Transição de status de orçamento inválida: ${from} → ${to}`);
  }
}

export class QuoteNotEditableError extends Error {
  constructor(public orderId: string) {
    super(`O orçamento ${orderId} não pode mais ser editado.`);
  }
}

export class CustomerHasNoPhoneError extends Error {
  constructor(public orderId: string) {
    super(`O cliente do pedido ${orderId} não possui telefone cadastrado.`);
  }
}

export class QuoteMinItemsError extends Error {
  constructor(public orderId: string) {
    super(`O orçamento ${orderId} precisa ter ao menos um item.`);
  }
}

// Mensagem propositalmente genérica — nunca revelar qual campo (telefone/CNPJ)
// nem os dígitos corretos (ver orderService.ts, decideQuote).
export class QuoteConfirmationMismatchError extends Error {
  constructor() {
    super("Confirmação inválida.");
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

// ─── Transições de status de Orçamento (Módulo Order.status = RASCUNHO) ───────
// Nunca regressiva, mesmo espírito de VALID_TRANSITIONS acima — ver decideQuote.

export const QUOTE_VALID_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  PENDENTE: ["EM_REVISAO", "APROVADO", "RECUSADO"],
  EM_REVISAO: ["APROVADO", "RECUSADO"],
  APROVADO: [],
  RECUSADO: [],
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
  // Não pedidos explicitamente no escopo desta microtarefa — adicionados por
  // consistência: sem eles, o filtro novo de listOrders (quotesOnly/quoteStatus)
  // não teria como o consumidor da API enxergar o status do orçamento retornado.
  quoteStatus: QuoteStatus | null;
  shareToken: string | null;
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
    quoteStatus: order.quoteStatus as QuoteStatus | null,
    shareToken: order.shareToken,
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

  // Todo Order criado por este fluxo administrativo com status RASCUNHO é um
  // orçamento — shareToken gerado já na criação (não lazy, ao contrário de
  // ensureShareToken abaixo, que cobre o caso de reenvio de um orçamento
  // criado antes desta sprint, sem token) e quoteStatus inicial PENDENTE
  // (REGRAS_NEGOCIO — decisão do Product Owner, ver histórico completo em
  // listOrders/QUOTE_VALID_TRANSITIONS mais abaixo).
  const isQuote = status === "RASCUNHO";

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
    shareToken: isQuote ? randomBytes(32).toString("base64url") : undefined,
    quoteStatus: isQuote ? ("PENDENTE" as PrismaQuoteStatus) : undefined,
    items: input.items,
  });

  return mapOrderDTO(createdOrder);
}

// ─── Leitura — listagem simples por status (orçamentos pendentes) ─────────────
// Reaproveita findByDateAndStatus (já usado pelo Kanban, acima) sem filtro de
// data — não duplica uma segunda função de leitura no Repository.
//
// `quotesOnly`/`quoteStatus` (novos nesta sprint): decisão do Product Owner —
// a tela /admin/orcamentos deve mostrar histórico completo de orçamentos
// (todo Order com quoteStatus não nulo), independente do Order.status atual
// (um orçamento aprovado e depois confirmado continua com quoteStatus
// preenchido e visível). `quotesOnly: true` aplica exatamente esse filtro
// (quoteStatus IS NOT NULL); `quoteStatus` restringe a um valor específico.
// Nenhum dos dois altera o filtro `status` já existente, usado hoje por
// src/app/api/admin/orders/route.ts sem nenhuma mudança de comportamento.

export interface ListOrdersFilters {
  status?: OrderStatus;
  quotesOnly?: boolean;
  quoteStatus?: QuoteStatus;
}

export async function listOrders(filters: ListOrdersFilters = {}): Promise<OrderDTO[]> {
  const quoteStatusFilter: QuoteStatusFilter | undefined = filters.quoteStatus
    ? (filters.quoteStatus as PrismaQuoteStatus)
    : filters.quotesOnly
      ? "ANY"
      : undefined;

  const orders = await findByDateAndStatus(undefined, filters.status as PrismaOrderStatus | undefined, quoteStatusFilter);
  return orders.map(mapOrderDTO);
}

// ─── Orçamentos — link público (Módulo Order.status = RASCUNHO) ───────────────
// Fluxo: admin cria orçamento (createOrder, acima, já grava shareToken +
// quoteStatus: "PENDENTE") → sendQuote gera o link (lazy, via ensureShareToken,
// para orçamentos criados antes desta sprint sem token) e notifica o cliente
// por WhatsApp → cliente acessa /orcamento/[token] (getPublicQuote), pode
// ajustar quantidade/remover item (updatePublicQuoteItemQuantity/
// removePublicQuoteItem) e decidir (decideQuote, com confirmação de
// segurança) → RECUSADO cascateia para Order.status = "CANCELADO";
// APROVADO não cascateia — "Confirmar pedido" (updateOrderStatus →
// "CONFIRMADO") continua uma ação administrativa separada.

export interface PublicQuoteItemDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// DTO minimizado — nunca reaproveita OrderDTO inteiro (vazaria customerId e
// outros dados internos a um destinatário não autenticado, que só possui o
// token da URL).
export interface PublicQuoteAddressDTO {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

export interface PublicQuoteDTO {
  orderNumber: number;
  quoteStatus: QuoteStatus;
  deliveryDate: string;
  createdAt: string;
  deliveryType: DeliveryType;
  receiverName: string;
  receiverPhone: string | null;
  // null para DeliveryType.RETIRADA (sem Address associado, ver createOrder) —
  // ver seção "III. Entrega" do doc renderizado em orcamento/[token]/page.tsx.
  address: PublicQuoteAddressDTO | null;
  customer: {
    name: string;
    phone: string | null;
    cnpj: string | null;
    companyName: string | null;
    type: CustomerType;
  };
  items: PublicQuoteItemDTO[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  orderNotes: string | null;
  editable: boolean;
}

function mapPublicQuoteDTO(order: OrderWithItemsAndCustomer): PublicQuoteDTO {
  // Garantido não-nulo por todo chamador desta função (getPublicQuote,
  // updatePublicQuoteItemQuantity, removePublicQuoteItem já checam antes).
  const quoteStatus = order.quoteStatus as QuoteStatus;

  return {
    orderNumber: order.orderNumber,
    quoteStatus,
    deliveryDate: order.deliveryDate.toISOString().slice(0, 10),
    createdAt: order.createdAt.toISOString(),
    deliveryType: order.deliveryType as DeliveryType,
    receiverName: order.receiverName,
    receiverPhone: order.receiverPhone,
    address: order.address
      ? {
          street: order.address.street,
          number: order.address.number,
          complement: order.address.complement,
          neighborhood: order.address.neighborhood,
          city: order.address.city,
          state: order.address.state,
        }
      : null,
    customer: {
      name: order.customer.name,
      phone: order.customer.phone,
      cnpj: order.customer.cnpj,
      companyName: order.customer.companyName,
      type: order.customer.type,
    },
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
      totalPrice: item.totalPrice.toNumber(),
    })),
    subtotal: order.subtotal.toNumber(),
    deliveryFee: order.deliveryFee.toNumber(),
    total: order.total.toNumber(),
    paymentMethod: order.paymentMethod as PaymentMethod,
    orderNotes: order.orderNotes,
    editable: quoteStatus === "PENDENTE" || quoteStatus === "EM_REVISAO",
  };
}

// Geração lazy — sem backfill de orçamentos antigos (decisão do Product Owner).
export async function ensureShareToken(orderId: string): Promise<string> {
  const existing = await findOrderById(orderId);
  if (!existing) throw new OrderNotFoundError(orderId);
  if (existing.shareToken) return existing.shareToken;

  const token = randomBytes(32).toString("base64url");
  await setShareToken(orderId, token);
  return token;
}

export async function sendQuote(orderId: string): Promise<OrderDTO> {
  const existing = await findOrderById(orderId);
  if (!existing) throw new OrderNotFoundError(orderId);
  if (!existing.quoteStatus) throw new OrderNotFoundError(orderId);

  const phone = await findCustomerPhoneById(existing.customerId);
  if (!phone) throw new CustomerHasNoPhoneError(orderId);

  const shareToken = await ensureShareToken(orderId);

  // Reenvio idempotente quanto ao status: só PENDENTE avança para EM_REVISAO;
  // EM_REVISAO/APROVADO/RECUSADO permanecem como estão.
  const updated =
    existing.quoteStatus === "PENDENTE"
      ? await updateQuoteStatus(orderId, "EM_REVISAO" as PrismaQuoteStatus)
      : existing;
  const dto = mapOrderDTO(updated);

  // Best-effort — nunca bloqueia nem falha a função principal (mesmo padrão de
  // updateOrderStatus/suggestReschedule acima; notifyQuoteShared já engole os
  // próprios erros, ver whatsappNotificationService.ts).
  const customer = await findCustomerById(existing.customerId).catch(() => null);
  await notifyQuoteShared({
    orderId: dto.id,
    phone,
    orderNumber: dto.orderNumber,
    customerName: customer?.name ?? existing.receiverName,
    shareToken,
  });

  return dto;
}

export async function decideQuote(
  source: "ADMIN" | "PUBLIC_TOKEN",
  orderId: string,
  decision: "APROVADO" | "RECUSADO",
  confirmation?: { last4: string },
): Promise<OrderDTO> {
  const existing = await findOrderById(orderId);
  if (!existing) throw new OrderNotFoundError(orderId);

  const currentQuoteStatus = existing.quoteStatus as QuoteStatus | null;
  if (!currentQuoteStatus) throw new OrderNotFoundError(orderId);

  const allowed = QUOTE_VALID_TRANSITIONS[currentQuoteStatus];
  if (!allowed.includes(decision)) {
    throw new InvalidQuoteTransitionError(currentQuoteStatus, decision);
  }

  if (source === "PUBLIC_TOKEN") {
    if (!confirmation?.last4) throw new QuoteConfirmationMismatchError();

    const customer = await findCustomerById(existing.customerId);
    const phoneLast4 = customer?.phone ? customer.phone.replace(/\D/g, "").slice(-4) : null;
    const cnpjLast4 = customer?.cnpj ? customer.cnpj.replace(/\D/g, "").slice(-4) : null;

    const matches =
      (phoneLast4 !== null && phoneLast4 === confirmation.last4) ||
      (cnpjLast4 !== null && cnpjLast4 === confirmation.last4);
    if (!matches) throw new QuoteConfirmationMismatchError();
  }

  await updateQuoteStatus(orderId, decision as PrismaQuoteStatus);

  // APROVADO não cascateia Order.status (permanece RASCUNHO, aguardando
  // "Confirmar pedido" administrativo separado). RECUSADO reaproveita a
  // transição já válida RASCUNHO→CANCELADO de VALID_TRANSITIONS/updateOrderStatus
  // — nunca duplicada aqui.
  if (decision === "RECUSADO") {
    return updateOrderStatus(orderId, "CANCELADO");
  }

  const updated = await findOrderById(orderId);
  if (!updated) throw new OrderNotFoundError(orderId);
  return mapOrderDTO(updated);
}

export async function getPublicQuote(token: string): Promise<PublicQuoteDTO> {
  const order = await findOrderByShareToken(token);
  if (!order || !order.quoteStatus) throw new OrderNotFoundError(token);
  return mapPublicQuoteDTO(order);
}

// Resolve token → orderId para chamadores públicos que precisam operar sobre o
// pedido (ex.: decideQuote, que exige orderId real) sem expor o id no DTO —
// PublicQuoteDTO é deliberadamente minimizado (ver acima). Mesmo padrão de
// checagem de getPublicQuote (order.quoteStatus não nulo).
export async function resolveOrderIdByShareToken(token: string): Promise<string> {
  const order = await findOrderByShareToken(token);
  if (!order || !order.quoteStatus) throw new OrderNotFoundError(token);
  return order.id;
}

export async function updatePublicQuoteItemQuantity(
  token: string,
  itemId: string,
  quantity: number,
): Promise<PublicQuoteDTO> {
  const order = await findOrderByShareToken(token);
  if (!order || !order.quoteStatus) throw new OrderNotFoundError(token);

  if (order.quoteStatus !== "PENDENTE" && order.quoteStatus !== "EM_REVISAO") {
    throw new QuoteNotEditableError(order.id);
  }

  const item = order.items.find((i) => i.id === itemId);
  if (!item) throw new OrderNotFoundError(itemId);

  // Recalculado no servidor — nunca confia em valor vindo do cliente.
  const newItemTotal = item.unitPrice.toNumber() * quantity;
  const otherItemsTotal = order.items
    .filter((i) => i.id !== itemId)
    .reduce((sum, i) => sum + i.totalPrice.toNumber(), 0);
  const newSubtotal = otherItemsTotal + newItemTotal;
  const newTotal = newSubtotal + order.deliveryFee.toNumber();

  const updated = await updateItemQuantityAndTotals(order.id, itemId, quantity, newItemTotal, newSubtotal, newTotal);
  return mapPublicQuoteDTO(updated);
}

export async function removePublicQuoteItem(token: string, itemId: string): Promise<PublicQuoteDTO> {
  const order = await findOrderByShareToken(token);
  if (!order || !order.quoteStatus) throw new OrderNotFoundError(token);

  if (order.quoteStatus !== "PENDENTE" && order.quoteStatus !== "EM_REVISAO") {
    throw new QuoteNotEditableError(order.id);
  }

  const item = order.items.find((i) => i.id === itemId);
  if (!item) throw new OrderNotFoundError(itemId);

  // Bloqueia remoção do último item restante — mínimo 1 item sempre, mesma
  // regra de criação (decisão do Product Owner).
  if (order.items.length <= 1) {
    throw new QuoteMinItemsError(order.id);
  }

  const newSubtotal = order.items
    .filter((i) => i.id !== itemId)
    .reduce((sum, i) => sum + i.totalPrice.toNumber(), 0);
  const newTotal = newSubtotal + order.deliveryFee.toNumber();

  const updated = await removeItemAndRecalculateTotals(order.id, itemId, newSubtotal, newTotal);
  return mapPublicQuoteDTO(updated);
}

// Ação administrativa "Copiar link" — sem enviar WhatsApp, sem mudar quoteStatus.
export async function getOrCreateShareLink(orderId: string): Promise<{ shareToken: string; url: string }> {
  const shareToken = await ensureShareToken(orderId);
  const url = `${env.NEXTAUTH_URL}/orcamento/${shareToken}`;
  return { shareToken, url };
}
