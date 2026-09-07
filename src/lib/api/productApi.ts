export interface ProductRecipe {
  recipeId: string;
  recipeName: string;
  quantity: number;
  unitCost: number;
}

export interface ProductPackagingLink {
  packagingId: string;
  packagingName: string;
  quantity: number;
  unitCost: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  imageUrl: string | null;
  basePrice: number;
  costPrice: number;
  margin: number;
  prepTimeMinutes: number;
  laborCost: number;
  fixedCostShare: number;
  totalCost: number;
  suggestedPrice: number;
  leadTimeDays: number;
  active: boolean;
  featured: boolean;
  recipes: ProductRecipe[];
  packagings: ProductPackagingLink[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductRecipeInput {
  recipeId: string;
  quantity: number;
}

export interface ProductInput {
  name: string;
  description?: string | null;
  categoryId: string;
  imageUrl?: string | null;
  basePrice: number;
  leadTimeDays?: number;
  featured?: boolean;
  recipes?: ProductRecipeInput[];
}

export interface PagedProducts {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  active?: boolean;
  orderBy?: "name" | "basePrice" | "createdAt";
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

function buildQuery(params: ListProductsParams): string {
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

export async function listProductsPaged(params: ListProductsParams = {}): Promise<PagedProducts> {
  return request<PagedProducts>(`/api/admin/products${buildQuery(params)}`);
}

/** Convenience: lista completa (sem paginação visível), usada quando nenhuma UI de paginação é necessária. */
export async function listProducts(): Promise<Product[]> {
  const result = await listProductsPaged({ pageSize: 1000 });
  return result.items;
}

export async function getProduct(id: string): Promise<Product> {
  return request<Product>(`/api/admin/products/${id}`);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  return request<Product>("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  return request<Product>(`/api/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function activateProduct(id: string): Promise<Product> {
  return request<Product>(`/api/admin/products/${id}/activate`, { method: "PATCH" });
}

export async function deactivateProduct(id: string): Promise<Product> {
  return request<Product>(`/api/admin/products/${id}/deactivate`, { method: "PATCH" });
}

export async function deleteProduct(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/api/admin/products/${id}`, { method: "DELETE" });
}
