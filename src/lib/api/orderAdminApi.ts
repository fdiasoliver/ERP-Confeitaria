import type { DeliveryType, OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/types";

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
  items: OrderItemDTO[];
  createdAt: string;
  updatedAt: string;
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
