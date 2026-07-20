export type PriceSource = "MANUAL" | "CONAB_CEASA" | "CEPEA" | "NOTA_FISCAL";

export interface Ingredient {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  unitId: string;
  unitName: string;
  unitAbbreviation: string;
  currentPrice: number;
  stockQuantity: number;
  minStock: number;
  isLowStock: boolean;
  supplier: string | null;
  externalCode: string | null;
  externalSource: PriceSource | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IngredientInput {
  name: string;
  categoryId?: string | null;
  unitId: string;
  currentPrice: number;
  stockQuantity?: number;
  minStock?: number;
  supplier?: string | null;
  externalCode?: string | null;
  externalSource?: PriceSource | null;
  priceSource?: PriceSource;
}

export interface IngredientPriceHistoryEntry {
  id: string;
  price: number;
  source: PriceSource;
  notes: string | null;
  recordedAt: string;
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

export async function listIngredients(): Promise<Ingredient[]> {
  return request<Ingredient[]>("/api/admin/ingredients");
}

export async function createIngredient(input: IngredientInput): Promise<Ingredient> {
  return request<Ingredient>("/api/admin/ingredients", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateIngredient(id: string, input: Partial<IngredientInput>): Promise<Ingredient> {
  return request<Ingredient>(`/api/admin/ingredients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function activateIngredient(id: string): Promise<Ingredient> {
  return request<Ingredient>(`/api/admin/ingredients/${id}/activate`, { method: "PATCH" });
}

export async function deactivateIngredient(id: string): Promise<Ingredient> {
  return request<Ingredient>(`/api/admin/ingredients/${id}/deactivate`, { method: "PATCH" });
}

export async function getPriceHistory(id: string): Promise<IngredientPriceHistoryEntry[]> {
  return request<IngredientPriceHistoryEntry[]>(`/api/admin/ingredients/${id}/price-history`);
}
