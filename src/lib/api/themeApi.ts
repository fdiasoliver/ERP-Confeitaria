export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  tokens: {
    cream: string;
    chocolate: string;
    rose: string;
    sage: string;
    caramel: string;
    sand: string;
    muted: string;
    surface2: string;
  };
}

export interface ThemeStatus {
  activePresetId: string;
  presets: ThemePreset[];
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

export async function getThemeStatus(): Promise<ThemeStatus> {
  return request<ThemeStatus>("/api/admin/theme");
}

export async function setThemePreset(presetId: string): Promise<ThemePreset> {
  return request<ThemePreset>("/api/admin/theme", { method: "PATCH", body: JSON.stringify({ presetId }) });
}
