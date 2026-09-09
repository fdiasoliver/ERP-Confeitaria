import { NextRequest } from "next/server";
import { requireFinance } from "@/lib/auth/requireFinance";
import { ok, created, badRequest, invalidBody, internalError } from "@/lib/http/responses";
import type { ExpenseInput } from "@/lib/validators/expenseValidator";
import type { ListExpensesParams } from "@/lib/repositories/expenseRepository";
import type { ExpenseCategory, ExpenseStatus } from "@prisma/client";
import { EXPENSE_CATEGORIES } from "@/lib/validators/expenseValidator";
import { listExpenses, createExpense, ExpenseValidationFailedError } from "@/lib/expenseService";

function parseListParams(searchParams: URLSearchParams): ListExpensesParams {
  const params: ListExpensesParams = {};

  const page = searchParams.get("page");
  if (page !== null) {
    const parsed = Number(page);
    if (Number.isFinite(parsed)) params.page = parsed;
  }

  const pageSize = searchParams.get("pageSize");
  if (pageSize !== null) {
    const parsed = Number(pageSize);
    if (Number.isFinite(parsed)) params.pageSize = parsed;
  }

  const search = searchParams.get("search");
  if (search !== null && search.trim().length > 0) params.search = search;

  const status = searchParams.get("status");
  if (status === "PENDENTE" || status === "PAGO") params.status = status as ExpenseStatus;

  const category = searchParams.get("category");
  if (category !== null && EXPENSE_CATEGORIES.includes(category as ExpenseCategory)) {
    params.category = category as ExpenseCategory;
  }

  const startDate = searchParams.get("startDate");
  if (startDate !== null && startDate.trim() !== "") params.startDate = new Date(`${startDate}T00:00:00`);

  const endDate = searchParams.get("endDate");
  if (endDate !== null && endDate.trim() !== "") params.endDate = new Date(`${endDate}T00:00:00`);

  const orderBy = searchParams.get("orderBy");
  if (orderBy === "dueDate" || orderBy === "createdAt" || orderBy === "amount") params.orderBy = orderBy;

  const orderDirection = searchParams.get("orderDirection");
  if (orderDirection === "asc" || orderDirection === "desc") params.orderDirection = orderDirection;

  return params;
}

export async function GET(request: NextRequest) {
  const denied = await requireFinance();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);

  try {
    const result = await listExpenses(parseListParams(searchParams));
    return ok(result);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireFinance();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const expense = await createExpense(body as ExpenseInput);
    return created(expense);
  } catch (err) {
    if (err instanceof ExpenseValidationFailedError) return badRequest(err.errors);
    return internalError();
  }
}
