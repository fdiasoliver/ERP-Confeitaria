import type { ValidationError } from "@/lib/types";

export interface PackagingInput {
  name: string;
  categoryId?: string | null;
  unitCost: number;
  stockQuantity?: number;
  minStock?: number;
  supplierId?: string | null;
}

// stockQuantity/minStock são sempre inteiros (MODULE_2H_PLANNING.md Seção 2.6 — sem
// unidade de medida, diferente de Ingredient). unitCost aceita 0 (diferente de
// Ingredient.currentPrice, que exige > 0) — embalagem pode ter custo zero (ex: brinde
// do fornecedor), decisão já registrada no blueprint (Seção 2.3).

function validateShared(input: Partial<PackagingInput>, errors: ValidationError[]): void {
  if (input.stockQuantity !== undefined) {
    if (!Number.isInteger(input.stockQuantity) || input.stockQuantity < 0) {
      errors.push({
        field: "stockQuantity",
        code: "INVALID_VALUE",
        message: "Estoque atual deve ser um número inteiro maior ou igual a 0.",
      });
    }
  }

  if (input.minStock !== undefined) {
    if (!Number.isInteger(input.minStock) || input.minStock < 0) {
      errors.push({
        field: "minStock",
        code: "INVALID_VALUE",
        message: "Estoque mínimo deve ser um número inteiro maior ou igual a 0.",
      });
    }
  }
}

export function validatePackagingCreate(input: PackagingInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim() === "") {
    errors.push({ field: "name", code: "REQUIRED", message: "Nome é obrigatório." });
  } else {
    const name = input.name.trim();
    if (name.length < 2) errors.push({ field: "name", code: "MIN_LENGTH", message: "Nome deve ter pelo menos 2 caracteres." });
    else if (name.length > 150) errors.push({ field: "name", code: "MAX_LENGTH", message: "Nome deve ter no máximo 150 caracteres." });
  }

  if (input.unitCost === undefined || input.unitCost === null || Number.isNaN(input.unitCost)) {
    errors.push({ field: "unitCost", code: "REQUIRED", message: "Custo unitário é obrigatório." });
  } else if (input.unitCost < 0) {
    errors.push({ field: "unitCost", code: "INVALID_VALUE", message: "Custo unitário não pode ser negativo." });
  }

  validateShared(input, errors);

  return errors;
}

export function validatePackagingUpdate(input: Partial<PackagingInput>): ValidationError[] {
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

  if (input.unitCost !== undefined) {
    if (input.unitCost === null || Number.isNaN(input.unitCost)) {
      errors.push({ field: "unitCost", code: "REQUIRED", message: "Custo unitário não pode ser vazio." });
    } else if (input.unitCost < 0) {
      errors.push({ field: "unitCost", code: "INVALID_VALUE", message: "Custo unitário não pode ser negativo." });
    }
  }

  validateShared(input, errors);

  return errors;
}
