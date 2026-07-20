import type { ValidationError } from "@/lib/types";

export interface SupplierInput {
  name: string;
  phone?: string | null;
  cnpj?: string | null;
  leadTimeDays?: number | null;
  notes?: string | null;
}

// Mesmo critério de formato já usado em src/lib/validators/storeConfig.ts (CNPJ = 14
// dígitos, telefone = 10-11 dígitos com DDD) — sem dígito verificador de CNPJ, mesma
// profundidade de validação já adotada no projeto.

function validateShared(input: Partial<SupplierInput>, errors: ValidationError[]): void {
  if (input.phone !== undefined && input.phone !== null && input.phone.trim() !== "") {
    const digits = input.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      errors.push({ field: "phone", code: "INVALID_FORMAT", message: "Telefone inválido. Use DDD + número." });
    }
  }

  if (input.cnpj !== undefined && input.cnpj !== null && input.cnpj.trim() !== "") {
    const digits = input.cnpj.replace(/\D/g, "");
    if (digits.length !== 14) {
      errors.push({ field: "cnpj", code: "INVALID_FORMAT", message: "CNPJ deve ter 14 dígitos." });
    }
  }

  if (input.leadTimeDays !== undefined && input.leadTimeDays !== null) {
    if (!Number.isInteger(input.leadTimeDays) || input.leadTimeDays < 0) {
      errors.push({ field: "leadTimeDays", code: "INVALID_VALUE", message: "Prazo de entrega deve ser um número inteiro maior ou igual a 0." });
    }
  }

  if (input.notes !== undefined && input.notes !== null && input.notes.length > 500) {
    errors.push({ field: "notes", code: "MAX_LENGTH", message: "Observações devem ter no máximo 500 caracteres." });
  }
}

export function validateSupplierCreate(input: SupplierInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim() === "") {
    errors.push({ field: "name", code: "REQUIRED", message: "Nome é obrigatório." });
  } else {
    const name = input.name.trim();
    if (name.length < 2) errors.push({ field: "name", code: "MIN_LENGTH", message: "Nome deve ter pelo menos 2 caracteres." });
    else if (name.length > 150) errors.push({ field: "name", code: "MAX_LENGTH", message: "Nome deve ter no máximo 150 caracteres." });
  }

  validateShared(input, errors);

  return errors;
}

export function validateSupplierUpdate(input: Partial<SupplierInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.name !== undefined) {
    if (input.name.trim() === "") {
      errors.push({ field: "name", code: "REQUIRED", message: "Nome não pode ser vazio." });
    } else {
      const name = input.name.trim();
      if (name.length < 2) errors.push({ field: "name", code: "MIN_LENGTH", message: "Nome deve ter pelo menos 2 caracteres." });
      else if (name.length > 150) errors.push({ field: "name", code: "MAX_LENGTH", message: "Nome deve ter no máximo 150 caracteres." });
    }
  }

  validateShared(input, errors);

  return errors;
}
