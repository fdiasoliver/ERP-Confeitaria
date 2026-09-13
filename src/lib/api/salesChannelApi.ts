import type { SalesChannel, SalesChannelInput } from "@/lib/types";

interface ApiSuccess<T> { success: true; data: T }
interface ApiError { success: false; error: { code: string; message: string; details?: unknown } }
type ApiResponse<T> = ApiSuccess<T> | ApiError;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error.message);
  return json.data;
}

export async function listChannels(): Promise<SalesChannel[]> {
  return request<SalesChannel[]>("/api/admin/sales-channels");
}

export async function createChannel(
  input: Pick<SalesChannelInput, "name" | "sortOrder" | "color" | "icon">,
): Promise<SalesChannel> {
  return request<SalesChannel>("/api/admin/sales-channels", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateChannel(
  id: string,
  input: Partial<Pick<SalesChannelInput, "name" | "sortOrder" | "color" | "icon">>,
): Promise<SalesChannel> {
  return request<SalesChannel>(`/api/admin/sales-channels/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function activateChannel(id: string): Promise<SalesChannel> {
  return request<SalesChannel>(`/api/admin/sales-channels/${id}/activate`, { method: "PATCH" });
}

export async function deactivateChannel(id: string): Promise<SalesChannel> {
  return request<SalesChannel>(`/api/admin/sales-channels/${id}/deactivate`, { method: "PATCH" });
}
