import { NextRequest } from "next/server";
import { requireFinance } from "@/lib/auth/requireFinance";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { markExpensePending, ExpenseNotFoundError } from "@/lib/expenseService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireFinance();
  if (denied) return denied;

  const { id } = await params;

  try {
    const expense = await markExpensePending(id);
    return ok(expense);
  } catch (err) {
    if (err instanceof ExpenseNotFoundError) return notFound("Despesa não encontrada.");
    return internalError();
  }
}
