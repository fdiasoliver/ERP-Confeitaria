export type UserRole = "ADMIN" | "ATENDIMENTO" | "PRODUCAO" | "FINANCEIRO";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  ATENDIMENTO: "Atendimento",
  PRODUCAO: "Produção",
  FINANCEIRO: "Financeiro",
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface PagedUsers {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  active?: boolean;
  orderBy?: "name" | "createdAt";
  orderDirection?: "asc" | "desc";
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

function buildQuery(params: ListUsersParams): string {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.pageSize !== undefined) search.set("pageSize", String(params.pageSize));
  if (params.search !== undefined && params.search.trim() !== "") search.set("search", params.search);
  if (params.role !== undefined) search.set("role", params.role);
  if (params.active !== undefined) search.set("active", String(params.active));
  if (params.orderBy !== undefined) search.set("orderBy", params.orderBy);
  if (params.orderDirection !== undefined) search.set("orderDirection", params.orderDirection);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function listUsersPaged(params: ListUsersParams = {}): Promise<PagedUsers> {
  return request<PagedUsers>(`/api/admin/users${buildQuery(params)}`);
}

export async function getUser(id: string): Promise<User> {
  return request<User>(`/api/admin/users/${id}`);
}

export async function createUser(input: UserCreateInput): Promise<User> {
  return request<User>("/api/admin/users", { method: "POST", body: JSON.stringify(input) });
}

export async function updateUser(id: string, input: UserUpdateInput): Promise<User> {
  return request<User>(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function activateUser(id: string): Promise<User> {
  return request<User>(`/api/admin/users/${id}/activate`, { method: "PATCH" });
}

export async function deactivateUser(id: string): Promise<User> {
  return request<User>(`/api/admin/users/${id}/deactivate`, { method: "PATCH" });
}
