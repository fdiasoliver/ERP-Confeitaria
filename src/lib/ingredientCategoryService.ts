import type { ValidationError } from "@/lib/types";
import {
  validateIngredientCategoryCreate,
  validateIngredientCategoryUpdate,
  type IngredientCategoryInput,
} from "@/lib/validators/ingredientCategoryValidator";
import {
  listAllIngredientCategories as dbListAllIngredientCategories,
  findIngredientCategoryById,
  findIngredientCategoryByName,
  createIngredientCategory as dbCreateIngredientCategory,
  updateIngredientCategory as dbUpdateIngredientCategory,
  deleteIngredientCategory as dbDeleteIngredientCategory,
} from "@/lib/repositories/ingredientCategoryRepository";
import { countIngredientsByCategory } from "@/lib/repositories/ingredientRepository";
import type { IngredientCategory as PrismaIngredientCategory } from "@prisma/client";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class IngredientCategoryNotFoundError extends Error {
  constructor(public id: string) {
    super(`Categoria de ingrediente não encontrada: ${id}`);
  }
}

export class IngredientCategoryValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class DuplicateIngredientCategoryNameError extends Error {
  constructor(public name: string) {
    super(`Já existe uma categoria de ingrediente com o nome "${name}".`);
  }
}

export class IngredientCategoryHasIngredientsError extends Error {
  constructor(public id: string, public count: number) {
    super(`Categoria possui ${count} ingrediente(s) vinculado(s) e não pode ser excluída.`);
  }
}

// ─── DTO ──────────────────────────────────────────────────────────────────────

type IngredientCategoryDTO = PrismaIngredientCategory;

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function listAllIngredientCategoriesService(): Promise<IngredientCategoryDTO[]> {
  return dbListAllIngredientCategories();
}

export async function getIngredientCategoryById(id: string): Promise<IngredientCategoryDTO> {
  const raw = await findIngredientCategoryById(id);
  if (!raw) throw new IngredientCategoryNotFoundError(id);
  return raw;
}

// ─── Criação ──────────────────────────────────────────────────────────────────

export async function createIngredientCategory(input: IngredientCategoryInput): Promise<IngredientCategoryDTO> {
  const trimmedName = input.name.trim();

  const errors = validateIngredientCategoryCreate({ name: trimmedName });
  if (errors.length > 0) throw new IngredientCategoryValidationFailedError(errors);

  const conflict = await findIngredientCategoryByName(trimmedName);
  if (conflict) throw new DuplicateIngredientCategoryNameError(trimmedName);

  return dbCreateIngredientCategory({ name: trimmedName });
}

// ─── Atualização ──────────────────────────────────────────────────────────────

export async function updateIngredientCategory(
  id: string,
  input: Partial<IngredientCategoryInput>,
): Promise<IngredientCategoryDTO> {
  const existing = await findIngredientCategoryById(id);
  if (!existing) throw new IngredientCategoryNotFoundError(id);

  const trimmedName = input.name !== undefined ? input.name.trim() : undefined;

  const errors = validateIngredientCategoryUpdate({ name: trimmedName });
  if (errors.length > 0) throw new IngredientCategoryValidationFailedError(errors);

  if (trimmedName !== undefined && trimmedName !== existing.name) {
    const conflict = await findIngredientCategoryByName(trimmedName);
    if (conflict) throw new DuplicateIngredientCategoryNameError(trimmedName);
  }

  return dbUpdateIngredientCategory(id, { name: trimmedName });
}

// ─── Exclusão ─────────────────────────────────────────────────────────────────
//
// IngredientCategory não tem campo active/isActive no schema — exclusão física,
// bloqueada se houver Ingredient vinculado (mesmo espírito de CategoryHasProductsError
// para ProductCategory, adaptado para exclusão física em vez de bloqueio de desativação,
// já que esta entidade não tem ciclo de vida ativo/inativo no schema atual).

export async function deleteIngredientCategory(id: string): Promise<void> {
  const existing = await findIngredientCategoryById(id);
  if (!existing) throw new IngredientCategoryNotFoundError(id);

  const count = await countIngredientsByCategory(id);
  if (count > 0) throw new IngredientCategoryHasIngredientsError(id, count);

  await dbDeleteIngredientCategory(id);
}
