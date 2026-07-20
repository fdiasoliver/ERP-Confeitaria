export interface IngredientCategory {
  id: string;
  name: string;
}

export interface IngredientCategoryInput {
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

export async function listIngredientCategories(): Promise<IngredientCategory[]> {
  return request<IngredientCategory[]>("/api/admin/ingredient-categories");
}

export async function createIngredientCategory(input: IngredientCategoryInput): Promise<IngredientCategory> {
  return request<IngredientCategory>("/api/admin/ingredient-categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateIngredientCategory(
  id: string,
  input: Partial<IngredientCategoryInput>,
): Promise<IngredientCategory> {
  return request<IngredientCategory>(`/api/admin/ingredient-categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteIngredientCategory(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/api/admin/ingredient-categories/${id}`, { method: "DELETE" });
}
