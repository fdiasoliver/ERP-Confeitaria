export interface Packaging {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  unitCost: number;
  stockQuantity: number;
  minStock: number;
  isLowStock: boolean;
  supplierId: string | null;
  supplierName: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackagingInput {
  name: string;
  categoryId?: string | null;
  unitCost: number;
  stockQuantity?: number;
  minStock?: number;
  supplierId?: string | null;
}

export interface PackagingPriceHistoryEntry {
  id: string;
  price: number;
  notes: string | null;
  recordedAt: string;
}

export interface PackagingUsage {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
}

export interface PagedPackagings {
  items: Packaging[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListPackagingsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
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

function buildQuery(params: ListPackagingsParams): string {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.pageSize !== undefined) search.set("pageSize", String(params.pageSize));
  if (params.search !== undefined && params.search.trim() !== "") search.set("search", params.search);
  if (params.categoryId !== undefined && params.categoryId !== "") search.set("categoryId", params.categoryId);
  if (params.active !== undefined) search.set("active", String(params.active));
  if (params.orderBy !== undefined) search.set("orderBy", params.orderBy);
  if (params.orderDirection !== undefined) search.set("orderDirection", params.orderDirection);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function listPackagingsPaged(params: ListPackagingsParams = {}): Promise<PagedPackagings> {
  return request<PagedPackagings>(`/api/admin/packagings${buildQuery(params)}`);
}

/** Convenience: lista completa de embalagens ativas, para popular <select> (ex: vincular a um produto). */
export async function listActivePackagings(): Promise<Packaging[]> {
  const result = await listPackagingsPaged({ pageSize: 1000, active: true });
  return result.items;
}

export async function getPackaging(id: string): Promise<Packaging> {
  return request<Packaging>(`/api/admin/packagings/${id}`);
}

export async function createPackaging(input: PackagingInput): Promise<Packaging> {
  return request<Packaging>("/api/admin/packagings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePackaging(id: string, input: Partial<PackagingInput>): Promise<Packaging> {
  return request<Packaging>(`/api/admin/packagings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function activatePackaging(id: string): Promise<Packaging> {
  return request<Packaging>(`/api/admin/packagings/${id}/activate`, { method: "PATCH" });
}

export async function deactivatePackaging(id: string): Promise<Packaging> {
  return request<Packaging>(`/api/admin/packagings/${id}/deactivate`, { method: "PATCH" });
}

export async function getPackagingPriceHistory(id: string): Promise<PackagingPriceHistoryEntry[]> {
  return request<PackagingPriceHistoryEntry[]>(`/api/admin/packagings/${id}/price-history`);
}

export async function getPackagingUsage(id: string): Promise<PackagingUsage[]> {
  return request<PackagingUsage[]>(`/api/admin/packagings/${id}/usage`);
}
