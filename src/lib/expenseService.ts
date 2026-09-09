import type { ValidationError } from "@/lib/types";
import {
  validateExpenseCreate,
  validateExpenseUpdate,
  type ExpenseInput,
} from "@/lib/validators/expenseValidator";
import {
  findExpenseById,
  listExpensesPaged,
  createExpense as dbCreateExpense,
  updateExpense as dbUpdateExpense,
  deleteExpense as dbDeleteExpense,
  markExpensePaid as dbMarkExpensePaid,
  markExpensePending as dbMarkExpensePending,
  type ListExpensesParams,
  type PagedResult,
  type ExpenseWithSupplier,
} from "@/lib/repositories/expenseRepository";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class ExpenseNotFoundError extends Error {
  constructor(public id: string) {
    super(`Despesa não encontrada: ${id}`);
  }
}

export class ExpenseValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

export type ExpenseDTO = Omit<ExpenseWithSupplier, "amount" | "dueDate" | "paidDate" | "createdAt" | "updatedAt"> & {
  amount: number;
  dueDate: string | null;
  paidDate: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapToExpense(raw: ExpenseWithSupplier): ExpenseDTO {
  return {
    ...raw,
    amount: Number(raw.amount),
    dueDate: raw.dueDate ? raw.dueDate.toISOString().slice(0, 10) : null,
    paidDate: raw.paidDate ? raw.paidDate.toISOString().slice(0, 10) : null,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

function parseDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value.trim() === "") return null;
  return new Date(`${value}T00:00:00`);
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function getExpenseById(id: string): Promise<ExpenseDTO> {
  const raw = await findExpenseById(id);
  if (!raw) throw new ExpenseNotFoundError(id);
  return mapToExpense(raw);
}

export async function listExpenses(params: ListExpensesParams): Promise<PagedResult<ExpenseDTO>> {
  const result = await listExpensesPaged(params);
  return { ...result, items: result.items.map(mapToExpense) };
}

// ─── Criação ──────────────────────────────────────────────────────────────────

export async function createExpense(input: ExpenseInput): Promise<ExpenseDTO> {
  const trimmedDescription = input.description.trim();

  const errors = validateExpenseCreate({ ...input, description: trimmedDescription });
  if (errors.length > 0) throw new ExpenseValidationFailedError(errors);

  const raw = await dbCreateExpense({
    description: trimmedDescription,
    category: input.category,
    amount: input.amount,
    dueDate: parseDate(input.dueDate) ?? null,
    supplierId: input.supplierId ?? null,
    notes: input.notes ?? null,
  });
  return mapToExpense(raw);
}

// ─── Atualização ──────────────────────────────────────────────────────────────

export async function updateExpense(id: string, input: Partial<ExpenseInput>): Promise<ExpenseDTO> {
  const existing = await findExpenseById(id);
  if (!existing) throw new ExpenseNotFoundError(id);

  const trimmedDescription = input.description !== undefined ? input.description.trim() : undefined;

  const errors = validateExpenseUpdate({ ...input, description: trimmedDescription });
  if (errors.length > 0) throw new ExpenseValidationFailedError(errors);

  const raw = await dbUpdateExpense(id, {
    description: trimmedDescription,
    category: input.category,
    amount: input.amount,
    dueDate: parseDate(input.dueDate),
    supplierId: input.supplierId,
    notes: input.notes,
  });
  return mapToExpense(raw);
}

// ─── Exclusão ─────────────────────────────────────────────────────────────────

export async function deleteExpense(id: string): Promise<void> {
  const existing = await findExpenseById(id);
  if (!existing) throw new ExpenseNotFoundError(id);
  await dbDeleteExpense(id);
}

// ─── Status (Pendente ⇄ Pago) ──────────────────────────────────────────────────

export async function markExpensePaid(id: string): Promise<ExpenseDTO> {
  const existing = await findExpenseById(id);
  if (!existing) throw new ExpenseNotFoundError(id);
  const raw = await dbMarkExpensePaid(id, new Date());
  return mapToExpense(raw);
}

export async function markExpensePending(id: string): Promise<ExpenseDTO> {
  const existing = await findExpenseById(id);
  if (!existing) throw new ExpenseNotFoundError(id);
  const raw = await dbMarkExpensePending(id);
  return mapToExpense(raw);
}
