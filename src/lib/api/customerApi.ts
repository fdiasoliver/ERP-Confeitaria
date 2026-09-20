import type { DeliveryType, OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/types";

// Tipos locais espelhando os DTOs de src/lib/customerService.ts — não importados
// diretamente (padrão já usado em productApi.ts/packagingApi.ts), com exceção dos
// enums de domínio compartilhados (OrderStatus/DeliveryType/PaymentMethod/PaymentStatus),
// que já vivem em @/lib/types.ts (fonte única, mesmo padrão de productApi.ts para
// esses mesmos enums no histórico de pedidos).

// Cliente corporativo + consumidor final (Sprint de Orçamento — 16/09/2026):
// `type` espelha o enum Prisma `CustomerType` (customerRepository.ts) — string
// literal, nunca importado do Prisma no cliente HTTP (mesmo padrão de
// UnitOfMeasure.type em unitApi.ts).
export type CustomerType = "CONSUMIDOR_FINAL" | "CORPORATIVO";

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  CONSUMIDOR_FINAL: "Consumidor final",
  CORPORATIVO: "Corporativo",
};

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string | null;
  ltv: number;
  lastOrderAt: string | null;
  active: boolean;
}

export interface PagedCustomers {
  items: CustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  orderBy?: "name" | "phone" | "createdAt";
  orderDirection?: "asc" | "desc";
}

export interface Address {
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

export interface AddressGroup {
  representative: Address;
  addressIds: string[];
}

// Espelha AddressCreateInput de src/lib/validators/addressValidator.ts — mesmo
// payload aceito na criação e na edição (PATCH reaproveita o mesmo Validator).
export interface AddressInput {
  label?: string | null;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city?: string;
  state?: string;
  zipCode: string;
}

export interface CustomerOrderHistoryItem {
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

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  type: CustomerType;
  cnpj: string | null;
  companyName: string | null;
  tradeName: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetail extends Customer {
  orders: CustomerOrderHistoryItem[];
  addressGroups: AddressGroup[];
}

// Espelha CustomerCreateInput de src/lib/validators/customerValidator.ts — mesmo
// padrão de não importar o Validator (server-side) no cliente HTTP.
export interface CustomerCreateInput {
  name: string;
  type: CustomerType;
  phone?: string | null;
  cnpj?: string | null;
  companyName?: string | null;
  tradeName?: string | null;
  email?: string | null;
  notes?: string | null;
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

function buildQuery(params: ListCustomersParams): string {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.pageSize !== undefined) search.set("pageSize", String(params.pageSize));
  if (params.search !== undefined && params.search.trim() !== "") search.set("search", params.search);
  if (params.active !== undefined) search.set("active", String(params.active));
  if (params.orderBy !== undefined) search.set("orderBy", params.orderBy);
  if (params.orderDirection !== undefined) search.set("orderDirection", params.orderDirection);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function listCustomers(params: ListCustomersParams = {}): Promise<PagedCustomers> {
  return request<PagedCustomers>(`/api/admin/customers${buildQuery(params)}`);
}

export async function createCustomer(input: CustomerCreateInput): Promise<Customer> {
  return request<Customer>(`/api/admin/customers`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCustomer(id: string): Promise<CustomerDetail> {
  return request<CustomerDetail>(`/api/admin/customers/${id}`);
}

// Somente `notes` é aceito pela API (PATCH /api/admin/customers/[id]) — `phone`/
// `name`/`email` são sempre somente-leitura neste módulo (decisão já registrada:
// Customer é criado via upsert no checkout, fora deste módulo).
export async function updateCustomerNotes(id: string, notes: string | null): Promise<Customer> {
  return request<Customer>(`/api/admin/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ notes }),
  });
}

export async function getCustomerOrders(id: string): Promise<CustomerOrderHistoryItem[]> {
  return request<CustomerOrderHistoryItem[]>(`/api/admin/customers/${id}/orders`);
}

export async function activateCustomer(id: string): Promise<Customer> {
  return request<Customer>(`/api/admin/customers/${id}/activate`, { method: "PATCH" });
}

export async function deactivateCustomer(id: string): Promise<Customer> {
  return request<Customer>(`/api/admin/customers/${id}/deactivate`, { method: "PATCH" });
}

export async function deleteCustomer(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/api/admin/customers/${id}`, { method: "DELETE" });
}

export async function createCustomerAddress(customerId: string, input: AddressInput): Promise<Address> {
  return request<Address>(`/api/admin/customers/${customerId}/addresses`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCustomerAddress(
  customerId: string,
  addressId: string,
  input: AddressInput,
): Promise<Address> {
  return request<Address>(`/api/admin/customers/${customerId}/addresses/${addressId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteCustomerAddress(customerId: string, addressId: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/api/admin/customers/${customerId}/addresses/${addressId}`, {
    method: "DELETE",
  });
}
