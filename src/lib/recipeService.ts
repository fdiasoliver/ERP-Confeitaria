import type { ValidationError } from "@/lib/types";
import {
  createRecipeWithItems,
  findRecipeById,
  findRecipeByName,
  listActiveRecipes,
  listAllRecipes,
  updateRecipe as updateRecipeInRepo,
  activateRecipe as activateRecipeInRepo,
  deactivateRecipe as deactivateRecipeInRepo,
  type RecipeWithItems,
} from "@/lib/repositories/recipeRepository";
import {
  countItemsByRecipe,
  createItem,
  deleteItem,
  findItemByRecipeAndIngredient,
  findItemById,
  updateItem,
  type RecipeIngredientWithRelations,
} from "@/lib/repositories/recipeIngredientRepository";
import { findIngredientById } from "@/lib/repositories/ingredientRepository";
import { findUnitById } from "@/lib/repositories/unitRepository";
import { findConversion } from "@/lib/repositories/unitConversionRepository";
import {
  validateRecipeCreate,
  validateRecipeUpdate,
  validateRecipeItemInput,
  validateRecipeItemUpdate,
  type RecipeInput,
  type RecipeItemInput,
} from "@/lib/validators/recipeValidator";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class RecipeNotFoundError extends Error {
  constructor(public id: string) {
    super(`Receita não encontrada: ${id}`);
  }
}

export class RecipeItemNotFoundError extends Error {
  constructor(public itemId: string) {
    super(`Item da receita não encontrado: ${itemId}`);
  }
}

export class RecipeValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class DuplicateRecipeNameError extends Error {
  constructor(public name: string) {
    super(`Já existe uma receita com o nome "${name}".`);
  }
}

export class InvalidIngredientReferenceError extends Error {
  constructor(public ingredientId: string) {
    super(`Ingrediente não encontrado: ${ingredientId}`);
  }
}

export class InactiveIngredientError extends Error {
  constructor(public ingredientName: string) {
    super(`Ingrediente "${ingredientName}" está inativo e não pode ser usado em receitas.`);
  }
}

export class InvalidUnitReferenceError extends Error {
  constructor(public unitId: string) {
    super(`Unidade de medida não encontrada: ${unitId}`);
  }
}

export class IncompatibleUnitError extends Error {
  constructor() {
    super(
      "A unidade escolhida não é compatível com a unidade do ingrediente (nenhuma conversão registrada entre elas).",
    );
  }
}

export class DuplicateIngredientInRecipeError extends Error {
  constructor(public ingredientId: string) {
    super("Este ingrediente já está nesta receita.");
  }
}

export class LastItemRemovalError extends Error {
  constructor() {
    super("A receita deve ter pelo menos um ingrediente — não é possível remover o último item.");
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

export interface RecipeItemDTO {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unitId: string;
  unitName: string;
  unitAbbreviation: string;
}

export interface RecipeDTO {
  id: string;
  name: string;
  description: string | null;
  yieldQuantity: number;
  yieldUnit: string;
  prepTimeMinutes: number;
  active: boolean;
  items: RecipeItemDTO[];
  totalCost: number;
  unitCost: number;
  createdAt: string;
  updatedAt: string;
}

function mapItem(item: RecipeIngredientWithRelations): RecipeItemDTO {
  return {
    id: item.id,
    ingredientId: item.ingredientId,
    ingredientName: item.ingredient.name,
    quantity: item.quantity.toNumber(),
    unitId: item.unitId,
    unitName: item.unit.name,
    unitAbbreviation: item.unit.abbreviation,
  };
}

/**
 * REGRAS_NEGOCIO.md 6.5: quando a unidade do item difere da unidade do ingrediente,
 * é preciso um fator de conversão registrado — em qualquer direção (a inversa é aceita
 * como 1/fator, já que o módulo UnitConversion não gera automaticamente o par inverso).
 *
 * Exportada (Sprint 2.K.1) para reaproveitamento em `orderService.getConsolidation` —
 * mesma necessidade de conversão de unidade, agora fora do domínio de Receitas. Nenhuma
 * mudança de comportamento; apenas visibilidade do módulo.
 */
export async function resolveConversionFactor(fromUnitId: string, toUnitId: string): Promise<number | null> {
  const direct = await findConversion(fromUnitId, toUnitId);
  if (direct) return direct.factor.toNumber();

  const inverse = await findConversion(toUnitId, fromUnitId);
  if (inverse) {
    const factor = inverse.factor.toNumber();
    return factor === 0 ? null : 1 / factor;
  }

  return null;
}

async function assertUnitCompatible(itemUnitId: string, ingredientUnitId: string): Promise<void> {
  if (itemUnitId === ingredientUnitId) return;
  const factor = await resolveConversionFactor(itemUnitId, ingredientUnitId);
  if (factor === null) throw new IncompatibleUnitError();
}

/** REGRAS_NEGOCIO.md 6.4/6.5 — custo sempre recalculado a partir do currentPrice atual, nunca armazenado. */
async function calculateCost(
  items: RecipeIngredientWithRelations[],
  yieldQuantity: number,
): Promise<{ totalCost: number; unitCost: number }> {
  let totalCost = 0;

  for (const item of items) {
    const { ingredient } = item;
    const quantity = item.quantity.toNumber();
    const currentPrice = ingredient.currentPrice.toNumber();

    let quantityInIngredientUnit = quantity;
    if (item.unitId !== ingredient.unitId) {
      const factor = await resolveConversionFactor(item.unitId, ingredient.unitId);
      quantityInIngredientUnit = factor === null ? quantity : quantity * factor;
    }

    totalCost += quantityInIngredientUnit * currentPrice;
  }

  const unitCost = yieldQuantity > 0 ? totalCost / yieldQuantity : 0;
  return { totalCost, unitCost };
}

async function mapToDTO(recipe: RecipeWithItems): Promise<RecipeDTO> {
  const { totalCost, unitCost } = await calculateCost(recipe.items, recipe.yieldQuantity.toNumber());
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    yieldQuantity: recipe.yieldQuantity.toNumber(),
    yieldUnit: recipe.yieldUnit,
    prepTimeMinutes: recipe.prepTimeMinutes,
    active: recipe.active,
    items: recipe.items.map(mapItem),
    totalCost,
    unitCost,
    createdAt: recipe.createdAt.toISOString(),
    updatedAt: recipe.updatedAt.toISOString(),
  };
}

// ─── Validação cruzada de referências ────────────────────────────────────────

async function assertIngredientUsable(ingredientId: string, unitId: string) {
  const ingredient = await findIngredientById(ingredientId);
  if (!ingredient) throw new InvalidIngredientReferenceError(ingredientId);
  if (!ingredient.active) throw new InactiveIngredientError(ingredient.name);

  const unit = await findUnitById(unitId);
  if (!unit) throw new InvalidUnitReferenceError(unitId);

  await assertUnitCompatible(unitId, ingredient.unitId);
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function listRecipes(activeOnly = false): Promise<RecipeDTO[]> {
  const recipes = activeOnly ? await listActiveRecipes() : await listAllRecipes();
  return Promise.all(recipes.map(mapToDTO));
}

export async function getRecipeById(id: string): Promise<RecipeDTO> {
  const recipe = await findRecipeById(id);
  if (!recipe) throw new RecipeNotFoundError(id);
  return mapToDTO(recipe);
}

// ─── Criação ──────────────────────────────────────────────────────────────────
//
// Fluxo: validator (nome, rendimento, itens ≥ 1, duplicidade de ingrediente) →
// unicidade de nome → cada item: ingrediente existe e ativo, unidade existe e
// compatível → Repository (criação aninhada Recipe + RecipeIngredient) → map

export async function createRecipe(input: RecipeInput): Promise<RecipeDTO> {
  const errors = validateRecipeCreate(input);
  if (errors.length > 0) throw new RecipeValidationFailedError(errors);

  const trimmedName = input.name.trim();
  const existing = await findRecipeByName(trimmedName);
  if (existing) throw new DuplicateRecipeNameError(trimmedName);

  const items = input.items as RecipeItemInput[];
  for (const item of items) {
    await assertIngredientUsable(item.ingredientId, item.unitId);
  }

  const created = await createRecipeWithItems({
    name: trimmedName,
    description: input.description ?? null,
    yieldQuantity: input.yieldQuantity,
    yieldUnit: input.yieldUnit.trim(),
    prepTimeMinutes: input.prepTimeMinutes ?? 0,
    items: items.map((item) => ({
      ingredientId: item.ingredientId,
      quantity: item.quantity,
      unitId: item.unitId,
    })),
  });

  return mapToDTO(created);
}

// ─── Atualização ──────────────────────────────────────────────────────────────
//
// Altera somente os campos escalares da própria receita — nunca a lista de itens
// (gerenciada por addRecipeItem/updateRecipeItem/removeRecipeItem, conforme a
// separação explícita entre operações de Receita e de Itens da Receita).

export async function updateRecipe(
  id: string,
  input: Partial<Omit<RecipeInput, "items">>,
): Promise<RecipeDTO> {
  const existing = await findRecipeById(id);
  if (!existing) throw new RecipeNotFoundError(id);

  const errors = validateRecipeUpdate(input);
  if (errors.length > 0) throw new RecipeValidationFailedError(errors);

  const trimmedName = input.name !== undefined ? input.name.trim() : undefined;
  if (trimmedName !== undefined && trimmedName !== existing.name) {
    const duplicate = await findRecipeByName(trimmedName);
    if (duplicate) throw new DuplicateRecipeNameError(trimmedName);
  }

  const updated = await updateRecipeInRepo(id, {
    name: trimmedName,
    description: input.description === undefined ? undefined : input.description,
    yieldQuantity: input.yieldQuantity,
    yieldUnit: input.yieldUnit?.trim(),
    prepTimeMinutes: input.prepTimeMinutes,
  });

  return mapToDTO(updated);
}

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

export async function activateRecipe(id: string): Promise<RecipeDTO> {
  const existing = await findRecipeById(id);
  if (!existing) throw new RecipeNotFoundError(id);
  const updated = await activateRecipeInRepo(id);
  return mapToDTO(updated);
}

export async function deactivateRecipe(id: string): Promise<RecipeDTO> {
  const existing = await findRecipeById(id);
  if (!existing) throw new RecipeNotFoundError(id);
  const updated = await deactivateRecipeInRepo(id);
  return mapToDTO(updated);
}

// ─── Itens da receita ─────────────────────────────────────────────────────────

export async function addRecipeItem(recipeId: string, input: RecipeItemInput): Promise<RecipeDTO> {
  const recipe = await findRecipeById(recipeId);
  if (!recipe) throw new RecipeNotFoundError(recipeId);

  const errors = validateRecipeItemInput(input);
  if (errors.length > 0) throw new RecipeValidationFailedError(errors);

  const duplicate = await findItemByRecipeAndIngredient(recipeId, input.ingredientId);
  if (duplicate) throw new DuplicateIngredientInRecipeError(input.ingredientId);

  await assertIngredientUsable(input.ingredientId, input.unitId);

  await createItem({
    recipeId,
    ingredientId: input.ingredientId,
    quantity: input.quantity,
    unitId: input.unitId,
  });

  const updated = await findRecipeById(recipeId);
  return mapToDTO(updated as RecipeWithItems);
}

export async function updateRecipeItem(
  recipeId: string,
  itemId: string,
  input: { quantity?: number; unitId?: string },
): Promise<RecipeDTO> {
  const recipe = await findRecipeById(recipeId);
  if (!recipe) throw new RecipeNotFoundError(recipeId);

  const item = await findItemById(itemId);
  if (!item || item.recipeId !== recipeId) throw new RecipeItemNotFoundError(itemId);

  const errors = validateRecipeItemUpdate(input);
  if (errors.length > 0) throw new RecipeValidationFailedError(errors);

  const targetUnitId = input.unitId ?? item.unitId;
  if (targetUnitId !== item.unitId) {
    const unit = await findUnitById(targetUnitId);
    if (!unit) throw new InvalidUnitReferenceError(targetUnitId);
  }
  await assertUnitCompatible(targetUnitId, item.ingredient.unitId);

  await updateItem(itemId, { quantity: input.quantity, unitId: input.unitId });

  const updated = await findRecipeById(recipeId);
  return mapToDTO(updated as RecipeWithItems);
}

export async function removeRecipeItem(recipeId: string, itemId: string): Promise<RecipeDTO> {
  const recipe = await findRecipeById(recipeId);
  if (!recipe) throw new RecipeNotFoundError(recipeId);

  const item = await findItemById(itemId);
  if (!item || item.recipeId !== recipeId) throw new RecipeItemNotFoundError(itemId);

  const total = await countItemsByRecipe(recipeId);
  if (total <= 1) throw new LastItemRemovalError();

  await deleteItem(itemId);

  const updated = await findRecipeById(recipeId);
  return mapToDTO(updated as RecipeWithItems);
}
