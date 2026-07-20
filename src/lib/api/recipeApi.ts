export interface RecipeItem {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unitId: string;
  unitName: string;
  unitAbbreviation: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string | null;
  yieldQuantity: number;
  yieldUnit: string;
  prepTimeMinutes: number;
  active: boolean;
  items: RecipeItem[];
  totalCost: number;
  unitCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeItemInput {
  ingredientId: string;
  quantity: number;
  unitId: string;
}

export interface RecipeInput {
  name: string;
  description?: string | null;
  yieldQuantity: number;
  yieldUnit: string;
  prepTimeMinutes?: number;
  items?: RecipeItemInput[];
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

export async function listRecipes(): Promise<Recipe[]> {
  return request<Recipe[]>("/api/admin/recipes");
}

export async function getRecipe(id: string): Promise<Recipe> {
  return request<Recipe>(`/api/admin/recipes/${id}`);
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  return request<Recipe>("/api/admin/recipes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateRecipe(id: string, input: Partial<Omit<RecipeInput, "items">>): Promise<Recipe> {
  return request<Recipe>(`/api/admin/recipes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function activateRecipe(id: string): Promise<Recipe> {
  return request<Recipe>(`/api/admin/recipes/${id}/activate`, { method: "PATCH" });
}

export async function deactivateRecipe(id: string): Promise<Recipe> {
  return request<Recipe>(`/api/admin/recipes/${id}/deactivate`, { method: "PATCH" });
}

export async function addRecipeItem(recipeId: string, input: RecipeItemInput): Promise<Recipe> {
  return request<Recipe>(`/api/admin/recipes/${recipeId}/items`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateRecipeItem(
  recipeId: string,
  itemId: string,
  input: { quantity?: number; unitId?: string },
): Promise<Recipe> {
  return request<Recipe>(`/api/admin/recipes/${recipeId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function removeRecipeItem(recipeId: string, itemId: string): Promise<Recipe> {
  return request<Recipe>(`/api/admin/recipes/${recipeId}/items/${itemId}`, { method: "DELETE" });
}
