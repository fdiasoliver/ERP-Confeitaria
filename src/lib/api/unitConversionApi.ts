import { ApiRequestError } from "@/lib/api/unitApi";

export interface UnitConversion {
  id: string;
  fromUnitId: string;
  fromUnitName: string;
  fromUnitAbbreviation: string;
  toUnitId: string;
  toUnitName: string;
  toUnitAbbreviation: string;
  factor: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UnitConversionInput {
  fromUnitId: string;
  toUnitId: string;
  factor: number;
  description?: string;
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

export async function listConversions(): Promise<UnitConversion[]> {
  return request<UnitConversion[]>("/api/admin/units/conversions");
}

export async function createConversion(input: UnitConversionInput): Promise<UnitConversion> {
  return request<UnitConversion>("/api/admin/units/conversions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateConversion(
  id: string,
  input: Partial<UnitConversionInput>,
): Promise<UnitConversion> {
  return request<UnitConversion>(`/api/admin/units/conversions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteConversion(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/api/admin/units/conversions/${id}`, { method: "DELETE" });
}

export { ApiRequestError };
