import type { ValidationError } from "@/lib/types";
import type { ExpenseCategory } from "@prisma/client";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "ALUGUEL",
  "SALARIOS",
  "MARKETING",
  "IMPOSTOS",
  "SERVICOS",
  "MANUTENCAO",
  "OUTROS",
];

export interface ExpenseInput {
  description: string;
  category: ExpenseCategory;
  amount: number;
  dueDate?: string | null; // YYYY-MM-DD
  supplierId?: string | null;
  notes?: string | null;
}

function validateShared(input: Partial<ExpenseInput>, errors: ValidationError[]): void {
  if (input.category !== undefined && !EXPENSE_CATEGORIES.includes(input.category)) {
    errors.push({ field: "category", code: "INVALID_VALUE", message: "Categoria inválida." });
  }

  if (input.amount !== undefined) {
    if (typeof input.amount !== "number" || Number.isNaN(input.amount) || input.amount <= 0) {
      errors.push({ field: "amount", code: "INVALID_VALUE", message: "Valor deve ser maior que zero." });
    }
  }

  if (input.dueDate !== undefined && input.dueDate !== null && input.dueDate.trim() !== "") {
    if (Number.isNaN(new Date(`${input.dueDate}T00:00:00`).getTime())) {
      errors.push({ field: "dueDate", code: "INVALID_DATE", message: "Data de vencimento inválida. Use o formato YYYY-MM-DD." });
    }
  }

  if (input.notes !== undefined && input.notes !== null && input.notes.length > 500) {
    errors.push({ field: "notes", code: "MAX_LENGTH", message: "Observações devem ter no máximo 500 caracteres." });
  }
}

export function validateExpenseCreate(input: ExpenseInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.description || input.description.trim() === "") {
    errors.push({ field: "description", code: "REQUIRED", message: "Descrição é obrigatória." });
  } else {
    const description = input.description.trim();
    if (description.length < 2) errors.push({ field: "description", code: "MIN_LENGTH", message: "Descrição deve ter pelo menos 2 caracteres." });
    else if (description.length > 200) errors.push({ field: "description", code: "MAX_LENGTH", message: "Descrição deve ter no máximo 200 caracteres." });
  }

  if (input.category === undefined) {
    errors.push({ field: "category", code: "REQUIRED", message: "Categoria é obrigatória." });
  }

  if (input.amount === undefined) {
    errors.push({ field: "amount", code: "REQUIRED", message: "Valor é obrigatório." });
  }

  validateShared(input, errors);

  return errors;
}

export function validateExpenseUpdate(input: Partial<ExpenseInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.description !== undefined) {
    if (input.description.trim() === "") {
      errors.push({ field: "description", code: "REQUIRED", message: "Descrição não pode ser vazia." });
    } else {
      const description = input.description.trim();
      if (description.length < 2) errors.push({ field: "description", code: "MIN_LENGTH", message: "Descrição deve ter pelo menos 2 caracteres." });
      else if (description.length > 200) errors.push({ field: "description", code: "MAX_LENGTH", message: "Descrição deve ter no máximo 200 caracteres." });
    }
  }

  validateShared(input, errors);

  return errors;
}
