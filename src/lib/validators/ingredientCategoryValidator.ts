import type { ValidationError } from "@/lib/types";

export interface IngredientCategoryInput {
  name: string;
}

export function validateIngredientCategoryCreate(input: IngredientCategoryInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim() === "") {
    errors.push({ field: "name", code: "REQUIRED", message: "Nome é obrigatório." });
  } else {
    const name = input.name.trim();
    if (name.length < 2) {
      errors.push({ field: "name", code: "MIN_LENGTH", message: "Nome deve ter pelo menos 2 caracteres." });
    } else if (name.length > 100) {
      errors.push({ field: "name", code: "MAX_LENGTH", message: "Nome deve ter no máximo 100 caracteres." });
    }
  }

  return errors;
}

export function validateIngredientCategoryUpdate(input: Partial<IngredientCategoryInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.name !== undefined) {
    if (input.name.trim() === "") {
      errors.push({ field: "name", code: "REQUIRED", message: "Nome não pode ser vazio." });
    } else {
      const name = input.name.trim();
      if (name.length < 2) {
        errors.push({ field: "name", code: "MIN_LENGTH", message: "Nome deve ter pelo menos 2 caracteres." });
      } else if (name.length > 100) {
        errors.push({ field: "name", code: "MAX_LENGTH", message: "Nome deve ter no máximo 100 caracteres." });
      }
    }
  }

  return errors;
}
