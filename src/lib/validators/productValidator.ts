import type { ValidationError } from "@/lib/types";

export interface ProductRecipeInput {
  recipeId: string;
  quantity: number;
}

export interface ProductInput {
  name: string;
  description?: string | null;
  categoryId: string;
  imageUrl?: string | null;
  basePrice: number;
  leadTimeDays?: number;
  featured?: boolean;
  recipes?: ProductRecipeInput[];
}

function validateRecipeLink(item: ProductRecipeInput, index: number, errors: ValidationError[]): void {
  const prefix = `recipes[${index}]`;
  if (!item.recipeId || item.recipeId.trim().length === 0) {
    errors.push({ field: `${prefix}.recipeId`, code: "REQUIRED", message: "Receita é obrigatória." });
  }
  if (item.quantity === undefined || item.quantity === null || Number.isNaN(item.quantity)) {
    errors.push({ field: `${prefix}.quantity`, code: "REQUIRED", message: "Quantidade é obrigatória." });
  } else if (item.quantity <= 0) {
    errors.push({ field: `${prefix}.quantity`, code: "INVALID_VALUE", message: "Quantidade deve ser maior que zero." });
  }
}

function validateRecipesList(recipes: ProductRecipeInput[] | undefined, errors: ValidationError[]): void {
  if (!recipes) return;
  recipes.forEach((item, index) => validateRecipeLink(item, index, errors));

  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of recipes) {
    if (item.recipeId && seen.has(item.recipeId)) duplicates.add(item.recipeId);
    if (item.recipeId) seen.add(item.recipeId);
  }
  if (duplicates.size > 0) {
    errors.push({ field: "recipes", code: "DUPLICATE_RECIPE", message: "O produto não pode ter a mesma receita repetida." });
  }
}

export function validateProductCreate(input: ProductInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim().length < 2 || input.name.trim().length > 150) {
    errors.push({ field: "name", code: "INVALID_LENGTH", message: "Nome deve ter entre 2 e 150 caracteres." });
  }
  if (!input.categoryId || input.categoryId.trim().length === 0) {
    errors.push({ field: "categoryId", code: "REQUIRED", message: "Categoria é obrigatória." });
  }
  if (
    input.basePrice === undefined ||
    input.basePrice === null ||
    Number.isNaN(input.basePrice) ||
    input.basePrice <= 0
  ) {
    errors.push({ field: "basePrice", code: "INVALID_VALUE", message: "Preço de venda deve ser maior que zero." });
  }
  if (input.leadTimeDays !== undefined && (Number.isNaN(input.leadTimeDays) || input.leadTimeDays < 0)) {
    errors.push({ field: "leadTimeDays", code: "INVALID_VALUE", message: "Prazo mínimo não pode ser negativo." });
  }
  if (input.description !== undefined && input.description !== null && input.description.length > 500) {
    errors.push({ field: "description", code: "MAX_LENGTH", message: "Descrição deve ter no máximo 500 caracteres." });
  }

  validateRecipesList(input.recipes, errors);

  return errors;
}

export function validateProductUpdate(
  input: Partial<Omit<ProductInput, "recipes">> & { recipes?: ProductRecipeInput[] },
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.name !== undefined && (input.name.trim().length < 2 || input.name.trim().length > 150)) {
    errors.push({ field: "name", code: "INVALID_LENGTH", message: "Nome deve ter entre 2 e 150 caracteres." });
  }
  if (input.categoryId !== undefined && input.categoryId.trim().length === 0) {
    errors.push({ field: "categoryId", code: "REQUIRED", message: "Categoria é obrigatória." });
  }
  if (input.basePrice !== undefined && (Number.isNaN(input.basePrice) || input.basePrice <= 0)) {
    errors.push({ field: "basePrice", code: "INVALID_VALUE", message: "Preço de venda deve ser maior que zero." });
  }
  if (input.leadTimeDays !== undefined && (Number.isNaN(input.leadTimeDays) || input.leadTimeDays < 0)) {
    errors.push({ field: "leadTimeDays", code: "INVALID_VALUE", message: "Prazo mínimo não pode ser negativo." });
  }
  if (input.description !== undefined && input.description !== null && input.description.length > 500) {
    errors.push({ field: "description", code: "MAX_LENGTH", message: "Descrição deve ter no máximo 500 caracteres." });
  }

  validateRecipesList(input.recipes, errors);

  return errors;
}
