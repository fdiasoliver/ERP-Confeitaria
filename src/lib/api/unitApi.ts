import type { UnitOfMeasureInput } from "@/lib/validators/unitValidator";

export type UnitType = "MASS" | "VOLUME" | "UNIT";

export interface UnitOfMeasure {
  id: string;
  name: string;
  abbreviation: string;
  type: UnitType;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export async function listUnits(): Promise<UnitOfMeasure[]> {
  return request<UnitOfMeasure[]>("/api/admin/units");
}

export async function createUnit(input: UnitOfMeasureInput): Promise<UnitOfMeasure> {
  return request<UnitOfMeasure>("/api/admin/units", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateUnit(
  id: string,
  input: Partial<UnitOfMeasureInput>,
): Promise<UnitOfMeasure> {
  return request<UnitOfMeasure>(`/api/admin/units/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function activateUnit(id: string): Promise<UnitOfMeasure> {
  return request<UnitOfMeasure>(`/api/admin/units/${id}/activate`, { method: "PATCH" });
}

export async function deactivateUnit(id: string): Promise<UnitOfMeasure> {
  return request<UnitOfMeasure>(`/api/admin/units/${id}/deactivate`, { method: "PATCH" });
}
