import type { DeliveryAddressInput, DeliveryType, OrderStatus, PaymentMethod, PaymentStatus, QuoteStatus, RescheduleStatus } from "@/lib/types";

// ── Tipos de exibição (DTO) ──────────────────────────────────────────────────
// Espelham src/lib/orderService.ts (KanbanOrderDTO/KanbanDataDTO/OrderDTO), sem
// importar o arquivo de Service (server-side) — mesmo padrão de unitApi.ts/
// packagingApi.ts: o cliente HTTP declara localmente o tipo de exibição.

export type KanbanColumn = "CONFIRMADO" | "EM_PRODUCAO" | "PRONTO" | "ENTREGUE";

export interface KanbanOrderItemDTO {
  productName: string;
  quantity: number;
  observation: string | null;
}

export interface KanbanOrderDTO {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  receiverName: string;
  deliveryDate: string;
  deliveryTimeSlot: string | null;
  deliveryType: DeliveryType;
  orderNotes: string | null;
  items: KanbanOrderItemDTO[];
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

export interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  observation: string | null;
}

// Espelham src/lib/orderService.ts (ConsolidatedIngredientDTO) e
// src/lib/cmvService.ts (CMVResultDTO/CMVLineDTO) — mesmo padrão acima: o
// cliente HTTP declara localmente o tipo de exibição, sem importar Service.

export interface ConsolidatedIngredientDTO {
  ingredientId: string;
  ingredientName: string;
  totalQuantity: number;
  unitId: string;
  unitName: string;
  unitAbbreviation: string;
}

export interface CMVLineDTO {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  totalCost: number;
}

export interface CMVResultDTO {
  totalCMV: number;
  items: CMVLineDTO[];
}

// Espelha src/lib/orderService.ts (ProductionLoadDayDTO) — carga de produção
// por dia, P3.3 (Calendário de produção).
export interface ProductionLoadDayDTO {
  date: string;
  orderCount: number;
  isOverloaded: boolean;
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
  quoteStatus: QuoteStatus | null;
  shareToken: string | null;
  items: OrderItemDTO[];
  createdAt: string;
  updatedAt: string;
}

// Espelha CreateOrderInput de src/lib/orderService.ts (criação de orçamento pela
// equipe) — mesmo padrão acima: o cliente HTTP declara localmente o tipo de
// entrada, sem importar o Service (server-side).
export interface CreateOrderItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  observation?: string;
}

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
  items: CreateOrderItemInput[];
}

// ── Cliente HTTP ──────────────────────────────────────────────────────────────

export class ApiRequestError extends Error {
  constructor(public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

interface ApiSuccess<T> { success: true; data: T }
interface ApiError { success: false; error: { code: string; message: string; details?: unknown } }
type ApiResponse<T> = ApiSuccess<T> | ApiError;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new ApiRequestError(json.error.code, json.error.message, json.error.details);
  return json.data;
}

/** `date` no formato YYYY-MM-DD. Quando omitido, a API retorna todos os pedidos
 * elegíveis para o Kanban, sem filtro de data (ver orderService.ts). */
export async function getKanbanData(date?: string): Promise<KanbanDataDTO> {
  const qs = date ? `?date=${date}` : "";
  return request<KanbanDataDTO>(`/api/admin/orders${qs}`);
}

/** Lista pedidos por status, sem o agrupamento por coluna do Kanban — usada pela
 * fila de orçamentos pendentes (status=RASCUNHO). Ver GET /api/admin/orders?status=
 * em src/app/api/admin/orders/route.ts. */
export async function listOrdersByStatus(status: OrderStatus): Promise<OrderDTO[]> {
  return request<OrderDTO[]>(`/api/admin/orders?status=${status}`);
}

/** Cria um orçamento (Order com status RASCUNHO) para um cliente já cadastrado —
 * contraparte administrativa de POST /api/orders (checkout público, não usado
 * aqui). Ver POST /api/admin/orders em src/app/api/admin/orders/route.ts. */
export async function createOrder(input: CreateOrderInput): Promise<OrderDTO> {
  return request<OrderDTO>(`/api/admin/orders`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  notes?: string,
): Promise<OrderDTO> {
  return request<OrderDTO>(`/api/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify(notes !== undefined ? { status, notes } : { status }),
  });
}

/** `newDate` no formato YYYY-MM-DD (ver src/app/api/admin/orders/[id]/reschedule/route.ts). */
export async function suggestReschedule(orderId: string, newDate: string): Promise<OrderDTO> {
  return request<OrderDTO>(`/api/admin/orders/${orderId}/reschedule`, {
    method: "PATCH",
    body: JSON.stringify({ newDate }),
  });
}

// ── Orçamentos — link público (ver src/lib/orderService.ts) ────────────────

/** Gera (na primeira vez) o shareToken e notifica o cliente por WhatsApp.
 * PENDENTE avança para EM_REVISAO; reenvio em EM_REVISAO é idempotente quanto
 * ao status. Ver POST .../send-quote em orderService.ts (sendQuote). */
export async function sendQuote(orderId: string): Promise<OrderDTO> {
  return request<OrderDTO>(`/api/admin/orders/${orderId}/send-quote`, { method: "PATCH" });
}

/** Gera (se ainda não existir) e retorna o link público do orçamento, sem
 * notificar o cliente — usado pelo botão "Copiar link". */
export async function getOrCreateShareLink(orderId: string): Promise<{ shareToken: string; url: string }> {
  return request<{ shareToken: string; url: string }>(`/api/admin/orders/${orderId}/share-link`, {
    method: "PATCH",
  });
}

/** Decisão administrativa em nome do cliente (ex.: confirmação por telefone),
 * sem a confirmação de segurança exigida no link público (ver decideQuote em
 * orderService.ts, source: "ADMIN"). RECUSADO cascateia para Order.status =
 * CANCELADO no backend — a lista de orçamentos (RASCUNHO) reflete isso ao
 * recarregar. */
export async function updateQuoteStatus(
  orderId: string,
  quoteStatus: "APROVADO" | "RECUSADO",
): Promise<OrderDTO> {
  return request<OrderDTO>(`/api/admin/orders/${orderId}/quote-status`, {
    method: "PATCH",
    body: JSON.stringify({ quoteStatus }),
  });
}

/** `startDate`/`endDate` no formato YYYY-MM-DD. Ambos obrigatórios (ver
 * src/app/api/admin/orders/consolidation/route.ts). */
export async function getConsolidation(
  startDate: string,
  endDate: string,
): Promise<ConsolidatedIngredientDTO[]> {
  return request<ConsolidatedIngredientDTO[]>(
    `/api/admin/orders/consolidation?startDate=${startDate}&endDate=${endDate}`,
  );
}

/** `startDate`/`endDate` no formato YYYY-MM-DD. Ambos obrigatórios (ver
 * src/app/api/admin/cmv/route.ts). */
export async function getCMV(startDate: string, endDate: string): Promise<CMVResultDTO> {
  return request<CMVResultDTO>(`/api/admin/cmv?startDate=${startDate}&endDate=${endDate}`);
}

/** `startDate`/`endDate` no formato YYYY-MM-DD. Ambos obrigatórios (ver
 * src/app/api/admin/orders/load/route.ts). */
export async function getProductionLoad(startDate: string, endDate: string): Promise<ProductionLoadDayDTO[]> {
  return request<ProductionLoadDayDTO[]>(`/api/admin/orders/load?startDate=${startDate}&endDate=${endDate}`);
}
