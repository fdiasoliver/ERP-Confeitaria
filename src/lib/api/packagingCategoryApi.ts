export interface PackagingCategory {
  id: string;
  name: string;
}

export interface PackagingCategoryInput {
  name: string;
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

export async function listPackagingCategories(): Promise<PackagingCategory[]> {
  return request<PackagingCategory[]>("/api/admin/packaging-categories");
}

export async function createPackagingCategory(input: PackagingCategoryInput): Promise<PackagingCategory> {
  return request<PackagingCategory>("/api/admin/packaging-categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePackagingCategory(
  id: string,
  input: Partial<PackagingCategoryInput>,
): Promise<PackagingCategory> {
  return request<PackagingCategory>(`/api/admin/packaging-categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deletePackagingCategory(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/api/admin/packaging-categories/${id}`, { method: "DELETE" });
}
