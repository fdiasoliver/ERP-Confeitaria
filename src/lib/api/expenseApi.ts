export type ExpenseCategory = "ALUGUEL" | "SALARIOS" | "MARKETING" | "IMPOSTOS" | "SERVICOS" | "MANUTENCAO" | "OUTROS";
export type ExpenseStatus = "PENDENTE" | "PAGO";

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  ALUGUEL: "Aluguel",
  SALARIOS: "Salários",
  MARKETING: "Marketing",
  IMPOSTOS: "Impostos",
  SERVICOS: "Serviços",
  MANUTENCAO: "Manutenção",
  OUTROS: "Outros",
};

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  status: ExpenseStatus;
  dueDate: string | null;
  paidDate: string | null;
  supplierId: string | null;
  supplier: { id: string; name: string } | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  description: string;
  category: ExpenseCategory;
  amount: number;
  dueDate?: string | null;
  supplierId?: string | null;
  notes?: string | null;
}

export interface PagedExpenses {
  items: Expense[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListExpensesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  orderBy?: "dueDate" | "createdAt" | "amount";
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

function buildQuery(params: ListExpensesParams): string {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.pageSize !== undefined) search.set("pageSize", String(params.pageSize));
  if (params.search !== undefined && params.search.trim() !== "") search.set("search", params.search);
  if (params.status !== undefined) search.set("status", params.status);
  if (params.category !== undefined) search.set("category", params.category);
  if (params.startDate !== undefined) search.set("startDate", params.startDate);
  if (params.endDate !== undefined) search.set("endDate", params.endDate);
  if (params.orderBy !== undefined) search.set("orderBy", params.orderBy);
  if (params.orderDirection !== undefined) search.set("orderDirection", params.orderDirection);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function listExpensesPaged(params: ListExpensesParams = {}): Promise<PagedExpenses> {
  return request<PagedExpenses>(`/api/admin/expenses${buildQuery(params)}`);
}

export async function getExpense(id: string): Promise<Expense> {
  return request<Expense>(`/api/admin/expenses/${id}`);
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  return request<Expense>("/api/admin/expenses", { method: "POST", body: JSON.stringify(input) });
}

export async function updateExpense(id: string, input: Partial<ExpenseInput>): Promise<Expense> {
  return request<Expense>(`/api/admin/expenses/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteExpense(id: string): Promise<void> {
  await request<{ deleted: boolean }>(`/api/admin/expenses/${id}`, { method: "DELETE" });
}

export async function markExpensePaid(id: string): Promise<Expense> {
  return request<Expense>(`/api/admin/expenses/${id}/pay`, { method: "PATCH" });
}

export async function markExpensePending(id: string): Promise<Expense> {
  return request<Expense>(`/api/admin/expenses/${id}/pending`, { method: "PATCH" });
}
