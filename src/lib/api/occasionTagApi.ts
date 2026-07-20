import type { OccasionTag, OccasionTagInput } from "@/lib/types";

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

export async function listOccasions(): Promise<OccasionTag[]> {
  return request<OccasionTag[]>("/api/admin/occasions");
}

export async function createOccasion(
  input: Pick<OccasionTagInput, "name" | "sortOrder" | "color" | "icon">,
): Promise<OccasionTag> {
  return request<OccasionTag>("/api/admin/occasions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateOccasion(
  id: string,
  input: Partial<Pick<OccasionTagInput, "name" | "sortOrder" | "color" | "icon">>,
): Promise<OccasionTag> {
  return request<OccasionTag>(`/api/admin/occasions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function activateOccasion(id: string): Promise<OccasionTag> {
  return request<OccasionTag>(`/api/admin/occasions/${id}/activate`, { method: "PATCH" });
}

export async function deactivateOccasion(id: string): Promise<OccasionTag> {
  return request<OccasionTag>(`/api/admin/occasions/${id}/deactivate`, { method: "PATCH" });
}
