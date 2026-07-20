import type { ValidationError } from "@/lib/types";

export interface RecipeItemInput {
  ingredientId: string;
  quantity: number;
  unitId: string;
}

export interface RecipeInput {
  name: string;
  description?: string | null;
  yieldQuantity: number;
  yieldUnit: string;
  prepTimeMinutes?: number;
  items?: RecipeItemInput[];
}

function validateItem(item: RecipeItemInput, index: number, errors: ValidationError[]): void {
  const prefix = `items[${index}]`;
  if (!item.ingredientId || item.ingredientId.trim().length === 0) {
    errors.push({ field: `${prefix}.ingredientId`, code: "REQUIRED", message: "Ingrediente é obrigatório." });
  }
  if (!item.unitId || item.unitId.trim().length === 0) {
    errors.push({ field: `${prefix}.unitId`, code: "REQUIRED", message: "Unidade é obrigatória." });
  }
  if (item.quantity === undefined || item.quantity === null || Number.isNaN(item.quantity)) {
    errors.push({ field: `${prefix}.quantity`, code: "REQUIRED", message: "Quantidade é obrigatória." });
  } else if (item.quantity <= 0) {
    errors.push({ field: `${prefix}.quantity`, code: "INVALID_VALUE", message: "Quantidade deve ser maior que zero." });
  }
}

function validateItemsList(items: RecipeItemInput[] | undefined, errors: ValidationError[]): void {
  if (!items || items.length === 0) {
    errors.push({ field: "items", code: "REQUIRED", message: "A receita deve ter pelo menos um ingrediente." });
    return;
  }
  items.forEach((item, index) => validateItem(item, index, errors));

  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of items) {
    if (item.ingredientId && seen.has(item.ingredientId)) duplicates.add(item.ingredientId);
    if (item.ingredientId) seen.add(item.ingredientId);
  }
  if (duplicates.size > 0) {
    errors.push({ field: "items", code: "DUPLICATE_INGREDIENT", message: "A receita não pode ter o mesmo ingrediente repetido." });
  }
}

export function validateRecipeCreate(input: RecipeInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim().length < 2 || input.name.trim().length > 150) {
    errors.push({ field: "name", code: "INVALID_LENGTH", message: "Nome deve ter entre 2 e 150 caracteres." });
  }
  if (!input.yieldUnit || input.yieldUnit.trim().length < 1 || input.yieldUnit.trim().length > 60) {
    errors.push({ field: "yieldUnit", code: "REQUIRED", message: "Unidade de rendimento é obrigatória (máx. 60 caracteres)." });
  }
  if (
    input.yieldQuantity === undefined ||
    input.yieldQuantity === null ||
    Number.isNaN(input.yieldQuantity) ||
    input.yieldQuantity <= 0
  ) {
    errors.push({ field: "yieldQuantity", code: "INVALID_VALUE", message: "Rendimento deve ser maior que zero." });
  }
  if (input.description !== undefined && input.description !== null && input.description.length > 500) {
    errors.push({ field: "description", code: "MAX_LENGTH", message: "Descrição deve ter no máximo 500 caracteres." });
  }
  if (
    input.prepTimeMinutes !== undefined &&
    input.prepTimeMinutes !== null &&
    (Number.isNaN(input.prepTimeMinutes) || input.prepTimeMinutes < 0)
  ) {
    errors.push({ field: "prepTimeMinutes", code: "INVALID_VALUE", message: "Tempo de preparo não pode ser negativo." });
  }

  validateItemsList(input.items, errors);

  return errors;
}

export function validateRecipeUpdate(input: Partial<Omit<RecipeInput, "items">>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.name !== undefined && (input.name.trim().length < 2 || input.name.trim().length > 150)) {
    errors.push({ field: "name", code: "INVALID_LENGTH", message: "Nome deve ter entre 2 e 150 caracteres." });
  }
  if (
    input.yieldUnit !== undefined &&
    (input.yieldUnit.trim().length < 1 || input.yieldUnit.trim().length > 60)
  ) {
    errors.push({ field: "yieldUnit", code: "REQUIRED", message: "Unidade de rendimento é obrigatória (máx. 60 caracteres)." });
  }
  if (input.yieldQuantity !== undefined && (Number.isNaN(input.yieldQuantity) || input.yieldQuantity <= 0)) {
    errors.push({ field: "yieldQuantity", code: "INVALID_VALUE", message: "Rendimento deve ser maior que zero." });
  }
  if (input.description !== undefined && input.description !== null && input.description.length > 500) {
    errors.push({ field: "description", code: "MAX_LENGTH", message: "Descrição deve ter no máximo 500 caracteres." });
  }
  if (input.prepTimeMinutes !== undefined && (Number.isNaN(input.prepTimeMinutes) || input.prepTimeMinutes < 0)) {
    errors.push({ field: "prepTimeMinutes", code: "INVALID_VALUE", message: "Tempo de preparo não pode ser negativo." });
  }

  return errors;
}

export function validateRecipeItemInput(input: RecipeItemInput): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!input.ingredientId || input.ingredientId.trim().length === 0) {
    errors.push({ field: "ingredientId", code: "REQUIRED", message: "Ingrediente é obrigatório." });
  }
  if (!input.unitId || input.unitId.trim().length === 0) {
    errors.push({ field: "unitId", code: "REQUIRED", message: "Unidade é obrigatória." });
  }
  if (input.quantity === undefined || input.quantity === null || Number.isNaN(input.quantity)) {
    errors.push({ field: "quantity", code: "REQUIRED", message: "Quantidade é obrigatória." });
  } else if (input.quantity <= 0) {
    errors.push({ field: "quantity", code: "INVALID_VALUE", message: "Quantidade deve ser maior que zero." });
  }
  return errors;
}

export function validateRecipeItemUpdate(input: { quantity?: number; unitId?: string }): ValidationError[] {
  const errors: ValidationError[] = [];
  if (input.unitId !== undefined && input.unitId.trim().length === 0) {
    errors.push({ field: "unitId", code: "REQUIRED", message: "Unidade é obrigatória." });
  }
  if (input.quantity !== undefined && (Number.isNaN(input.quantity) || input.quantity <= 0)) {
    errors.push({ field: "quantity", code: "INVALID_VALUE", message: "Quantidade deve ser maior que zero." });
  }
  return errors;
}
