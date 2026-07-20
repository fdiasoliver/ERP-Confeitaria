import type { ValidationError } from "@/lib/types";

const ALLOWED_PRICE_SOURCES = ["MANUAL", "CONAB_CEASA", "CEPEA", "NOTA_FISCAL"] as const;
export type PriceSourceValue = (typeof ALLOWED_PRICE_SOURCES)[number];

export interface IngredientInput {
  name: string;
  categoryId?: string | null;
  unitId: string;
  currentPrice: number;
  stockQuantity?: number;
  minStock?: number;
  supplier?: string | null;
  externalCode?: string | null;
  externalSource?: PriceSourceValue | null;
  /** Fonte do registro em IngredientPriceHistory para esta criação/atualização (REGRAS_NEGOCIO.md 7.2). Default: MANUAL. */
  priceSource?: PriceSourceValue;
}

// Regras técnicas de integridade (preço > 0, estoque/estoque mínimo >= 0) — mesma categoria
// de sortOrder >= 0 em unitValidator.ts e factor > 0 em unitConversionValidator.ts: restrição
// óbvia do significado do campo, não citação literal de REGRAS_NEGOCIO.md.

function validateShared(input: Partial<IngredientInput>, errors: ValidationError[]): void {
  if (input.stockQuantity !== undefined) {
    if (typeof input.stockQuantity !== "number" || Number.isNaN(input.stockQuantity) || input.stockQuantity < 0) {
      errors.push({ field: "stockQuantity", code: "INVALID_VALUE", message: "Estoque atual deve ser um número maior ou igual a 0." });
    }
  }

  if (input.minStock !== undefined) {
    if (typeof input.minStock !== "number" || Number.isNaN(input.minStock) || input.minStock < 0) {
      errors.push({ field: "minStock", code: "INVALID_VALUE", message: "Estoque mínimo deve ser um número maior ou igual a 0." });
    }
  }

  if (input.supplier !== undefined && input.supplier !== null && input.supplier.length > 150) {
    errors.push({ field: "supplier", code: "MAX_LENGTH", message: "Fornecedor deve ter no máximo 150 caracteres." });
  }

  if (input.externalCode !== undefined && input.externalCode !== null && input.externalCode.length > 50) {
    errors.push({ field: "externalCode", code: "MAX_LENGTH", message: "Código externo deve ter no máximo 50 caracteres." });
  }

  if (
    input.externalSource !== undefined &&
    input.externalSource !== null &&
    !ALLOWED_PRICE_SOURCES.includes(input.externalSource as PriceSourceValue)
  ) {
    errors.push({ field: "externalSource", code: "INVALID_VALUE", message: "Fonte externa inválida." });
  }

  if (
    input.priceSource !== undefined &&
    !ALLOWED_PRICE_SOURCES.includes(input.priceSource as PriceSourceValue)
  ) {
    errors.push({ field: "priceSource", code: "INVALID_VALUE", message: "Fonte do preço inválida." });
  }
}

export function validateIngredientCreate(input: IngredientInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim() === "") {
    errors.push({ field: "name", code: "REQUIRED", message: "Nome é obrigatório." });
  } else {
    const name = input.name.trim();
    if (name.length < 2) errors.push({ field: "name", code: "MIN_LENGTH", message: "Nome deve ter pelo menos 2 caracteres." });
    else if (name.length > 100) errors.push({ field: "name", code: "MAX_LENGTH", message: "Nome deve ter no máximo 100 caracteres." });
  }

  if (!input.unitId || input.unitId.trim() === "") {
    errors.push({ field: "unitId", code: "REQUIRED", message: "Unidade de medida é obrigatória." });
  }

  if (input.currentPrice === undefined || input.currentPrice === null || Number.isNaN(input.currentPrice)) {
    errors.push({ field: "currentPrice", code: "REQUIRED", message: "Preço atual é obrigatório." });
  } else if (input.currentPrice <= 0) {
    errors.push({ field: "currentPrice", code: "INVALID_VALUE", message: "Preço atual deve ser maior que zero." });
  }

  validateShared(input, errors);

  return errors;
}

export function validateIngredientUpdate(input: Partial<IngredientInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.name !== undefined) {
    if (input.name.trim() === "") {
      errors.push({ field: "name", code: "REQUIRED", message: "Nome não pode ser vazio." });
    } else {
      const name = input.name.trim();
      if (name.length < 2) errors.push({ field: "name", code: "MIN_LENGTH", message: "Nome deve ter pelo menos 2 caracteres." });
      else if (name.length > 100) errors.push({ field: "name", code: "MAX_LENGTH", message: "Nome deve ter no máximo 100 caracteres." });
    }
  }

  if (input.unitId !== undefined && input.unitId.trim() === "") {
    errors.push({ field: "unitId", code: "REQUIRED", message: "Unidade de medida não pode ser vazia." });
  }

  if (input.currentPrice !== undefined) {
    if (input.currentPrice === null || Number.isNaN(input.currentPrice)) {
      errors.push({ field: "currentPrice", code: "REQUIRED", message: "Preço atual não pode ser vazio." });
    } else if (input.currentPrice <= 0) {
      errors.push({ field: "currentPrice", code: "INVALID_VALUE", message: "Preço atual deve ser maior que zero." });
    }
  }

  validateShared(input, errors);

  return errors;
}
