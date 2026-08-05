export interface ProductPackaging {
  id: string;
  productId: string;
  packagingId: string;
  packagingName: string;
  unitCost: number;
  quantity: number;
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

export async function listProductPackagings(productId: string): Promise<ProductPackaging[]> {
  return request<ProductPackaging[]>(`/api/admin/products/${productId}/packagings`);
}

export async function addProductPackaging(
  productId: string,
  input: { packagingId: string; quantity: number },
): Promise<ProductPackaging> {
  return request<ProductPackaging>(`/api/admin/products/${productId}/packagings`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProductPackaging(
  productId: string,
  linkId: string,
  input: { quantity?: number },
): Promise<ProductPackaging> {
  return request<ProductPackaging>(`/api/admin/products/${productId}/packagings/${linkId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function removeProductPackaging(productId: string, linkId: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/api/admin/products/${productId}/packagings/${linkId}`, { method: "DELETE" });
}
