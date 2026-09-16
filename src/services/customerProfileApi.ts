// Cliente HTTP do cadastro complementar do cliente (Nome/Endereço/Data de
// nascimento) — consome /api/customers/me e /api/customers/me/addresses,
// ambas autenticadas via sessão NextAuth de cliente (cookie, sem telefone
// no payload). Envelope de resposta { success, data } / { success: false, error }
// — mesmo padrão de src/lib/api/customerApi.ts (lado ADMIN), mas replicado
// aqui em vez de importado: domínios de import separados (client vs admin),
// mesmo princípio já usado entre customerService.ts (admin) e
// customerProfileService.ts (cliente) no backend.

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  birthDate: string | null;
  isProfileComplete: boolean;
}

export interface SavedAddress {
  id: string;
  label: string | null;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: string;
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

export async function getMyProfile(): Promise<CustomerProfile> {
  return request<CustomerProfile>("/api/customers/me");
}

export async function updateMyProfile(input: { name?: string; birthDate?: string | null }): Promise<CustomerProfile> {
  return request<CustomerProfile>("/api/customers/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function listMyAddresses(): Promise<SavedAddress[]> {
  return request<SavedAddress[]>("/api/customers/me/addresses");
}

export async function createMyAddress(input: {
  label?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city?: string;
  state?: string;
  zipCode: string;
}): Promise<SavedAddress> {
  return request<SavedAddress>("/api/customers/me/addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
