import { NextRequest } from "next/server";
import { requireFinance } from "@/lib/auth/requireFinance";
import { ok, badRequest, invalidBody, notFound, internalError } from "@/lib/http/responses";
import type { ExpenseInput } from "@/lib/validators/expenseValidator";
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
  ExpenseNotFoundError,
  ExpenseValidationFailedError,
} from "@/lib/expenseService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireFinance();
  if (denied) return denied;

  const { id } = await params;

  try {
    const expense = await getExpenseById(id);
    return ok(expense);
  } catch (err) {
    if (err instanceof ExpenseNotFoundError) return notFound("Despesa não encontrada.");
    return internalError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireFinance();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const expense = await updateExpense(id, body as Partial<ExpenseInput>);
    return ok(expense);
  } catch (err) {
    if (err instanceof ExpenseNotFoundError) return notFound("Despesa não encontrada.");
    if (err instanceof ExpenseValidationFailedError) return badRequest(err.errors);
    return internalError();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireFinance();
  if (denied) return denied;

  const { id } = await params;

  try {
    await deleteExpense(id);
    return ok({ deleted: true });
  } catch (err) {
    if (err instanceof ExpenseNotFoundError) return notFound("Despesa não encontrada.");
    return internalError();
  }
}
