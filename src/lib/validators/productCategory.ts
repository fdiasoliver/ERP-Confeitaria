import type { ProductCategoryInput, ValidationError } from "@/lib/types";

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

export function validateProductCategoryCreate(input: ProductCategoryInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // name — obrigatório, sem espaços isolados, mín 2 e máx 100 chars
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

  // sortOrder — inteiro >= 0 se fornecido
  if (input.sortOrder !== undefined) {
    if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) {
      errors.push({ field: "sortOrder", code: "INVALID_VALUE", message: "Ordem deve ser um número inteiro maior ou igual a 0." });
    }
  }

  // color — hexadecimal #RRGGBB se fornecido
  if (input.color !== undefined) {
    if (!HEX_COLOR_RE.test(input.color)) {
      errors.push({ field: "color", code: "INVALID_FORMAT", message: "Cor deve estar no formato hexadecimal #RRGGBB (ex: #E8A598)." });
    }
  }

  // icon — string não-vazia, máx 50 chars se fornecido
  if (input.icon !== undefined) {
    if (input.icon.trim() === "") {
      errors.push({ field: "icon", code: "INVALID_VALUE", message: "Ícone não pode ser uma string vazia." });
    } else if (input.icon.trim().length > 50) {
      errors.push({ field: "icon", code: "MAX_LENGTH", message: "Ícone deve ter no máximo 50 caracteres." });
    }
  }

  // isActive — não faz parte do fluxo de criação; ignorado silenciosamente

  return errors;
}

export function validateProductCategoryUpdate(
  input: Partial<Pick<ProductCategoryInput, "name" | "sortOrder" | "color" | "icon">>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // name — se fornecido, aplica as mesmas regras de criação
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

  // sortOrder — inteiro >= 0 se fornecido
  if (input.sortOrder !== undefined) {
    if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) {
      errors.push({ field: "sortOrder", code: "INVALID_VALUE", message: "Ordem deve ser um número inteiro maior ou igual a 0." });
    }
  }

  // color — hexadecimal #RRGGBB se fornecido
  if (input.color !== undefined) {
    if (!HEX_COLOR_RE.test(input.color)) {
      errors.push({ field: "color", code: "INVALID_FORMAT", message: "Cor deve estar no formato hexadecimal #RRGGBB (ex: #E8A598)." });
    }
  }

  // icon — string não-vazia, máx 50 chars se fornecido
  if (input.icon !== undefined) {
    if (input.icon.trim() === "") {
      errors.push({ field: "icon", code: "INVALID_VALUE", message: "Ícone não pode ser uma string vazia." });
    } else if (input.icon.trim().length > 50) {
      errors.push({ field: "icon", code: "MAX_LENGTH", message: "Ícone deve ter no máximo 50 caracteres." });
    }
  }

  return errors;
}
