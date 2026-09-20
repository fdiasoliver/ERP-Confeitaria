import type { PaymentMethod, DeliveryType } from "@/lib/types";

// ── Tipos de exibição (DTO) ──────────────────────────────────────────────────
// Espelha src/lib/orderService.ts (PublicQuoteDTO/PublicQuoteItemDTO), sem
// importar o arquivo de Service (server-side) — mesmo padrão de orderAdminApi.ts.

export type CustomerType = "CONSUMIDOR_FINAL" | "CORPORATIVO";

export interface PublicQuoteItemDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

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
  quoteStatus: "PENDENTE" | "EM_REVISAO" | "APROVADO" | "RECUSADO";
  deliveryDate: string;
  createdAt: string;
  deliveryType: DeliveryType;
  receiverName: string;
  receiverPhone: string | null;
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

export async function getPublicQuote(token: string): Promise<PublicQuoteDTO> {
  return request<PublicQuoteDTO>(`/api/public/orcamento/${token}`);
}

export async function updateItemQuantity(
  token: string,
  itemId: string,
  quantity: number,
): Promise<PublicQuoteDTO> {
  return request<PublicQuoteDTO>(`/api/public/orcamento/${token}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeItem(token: string, itemId: string): Promise<PublicQuoteDTO> {
  return request<PublicQuoteDTO>(`/api/public/orcamento/${token}/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function decideQuote(
  token: string,
  decision: "APROVADO" | "RECUSADO",
  last4: string,
): Promise<PublicQuoteDTO> {
  return request<PublicQuoteDTO>(`/api/public/orcamento/${token}/decision`, {
    method: "PATCH",
    body: JSON.stringify({ decision, last4 }),
  });
}
