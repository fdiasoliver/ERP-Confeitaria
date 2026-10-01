import type { ProductCategory, ProductCategoryInput, ProductCategoryWithCount } from "@/lib/types";

interface ApiSuccess<T> { success: true; data: T }
interface ApiError { success: false; error: { code: string; message: string; details?: unknown } }
type ApiResponse<T> = ApiSuccess<T> | ApiError;

export class ApiRequestError extends Error {
  constructor(public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new ApiRequestError(json.error.code, json.error.message, json.error.details);
  return json.data;
}

export async function listCategories(): Promise<ProductCategoryWithCount[]> {
  return request<ProductCategoryWithCount[]>("/api/admin/categories");
}

export async function createCategory(
  input: Pick<ProductCategoryInput, "name" | "sortOrder" | "color" | "icon">,
): Promise<ProductCategory> {
  return request<ProductCategory>("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCategory(
  id: string,
  input: Partial<Pick<ProductCategoryInput, "name" | "sortOrder" | "color" | "icon">>,
): Promise<ProductCategory> {
  return request<ProductCategory>(`/api/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function activateCategory(id: string): Promise<ProductCategory> {
  return request<ProductCategory>(`/api/admin/categories/${id}/activate`, { method: "PATCH" });
}

export async function deactivateCategory(id: string): Promise<ProductCategory> {
  return request<ProductCategory>(`/api/admin/categories/${id}/deactivate`, { method: "PATCH" });
}

/** Exclui a categoria; com produtos vinculados exige `transferTo` (categoria
 * ativa de destino) — senão 409 CATEGORY_HAS_PRODUCTS com `details.count`. */
export async function deleteCategory(id: string, transferTo?: string): Promise<{ id: string }> {
  const query = transferTo ? `?transferTo=${encodeURIComponent(transferTo)}` : "";
  return request<{ id: string }>(`/api/admin/categories/${id}${query}`, { method: "DELETE" });
}
