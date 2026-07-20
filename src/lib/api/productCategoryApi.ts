import type { ProductCategory, ProductCategoryInput, ProductCategoryWithCount } from "@/lib/types";

interface ApiSuccess<T> { success: true; data: T }
interface ApiError { success: false; error: { code: string; message: string; details?: unknown } }
type ApiResponse<T> = ApiSuccess<T> | ApiError;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error.message);
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
