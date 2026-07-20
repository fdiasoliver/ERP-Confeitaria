export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  cnpj: string | null;
  leadTimeDays: number | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierInput {
  name: string;
  phone?: string | null;
  cnpj?: string | null;
  leadTimeDays?: number | null;
  notes?: string | null;
}

export interface PagedSuppliers {
  items: Supplier[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListSuppliersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  orderBy?: "name" | "createdAt";
  orderDirection?: "asc" | "desc";
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

function buildQuery(params: ListSuppliersParams): string {
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

export async function listSuppliersPaged(params: ListSuppliersParams = {}): Promise<PagedSuppliers> {
  return request<PagedSuppliers>(`/api/admin/suppliers${buildQuery(params)}`);
}

export async function getSupplier(id: string): Promise<Supplier> {
  return request<Supplier>(`/api/admin/suppliers/${id}`);
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  return request<Supplier>("/api/admin/suppliers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateSupplier(id: string, input: Partial<SupplierInput>): Promise<Supplier> {
  return request<Supplier>(`/api/admin/suppliers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function activateSupplier(id: string): Promise<Supplier> {
  return request<Supplier>(`/api/admin/suppliers/${id}/activate`, { method: "PATCH" });
}

export async function deactivateSupplier(id: string): Promise<Supplier> {
  return request<Supplier>(`/api/admin/suppliers/${id}/deactivate`, { method: "PATCH" });
}
