import type { ValidationError } from "@/lib/types";
import {
  validatePackagingCategoryCreate,
  validatePackagingCategoryUpdate,
  type PackagingCategoryInput,
} from "@/lib/validators/packagingCategoryValidator";
import {
  listAllPackagingCategories as dbListAllPackagingCategories,
  findPackagingCategoryById,
  findPackagingCategoryByName,
  createPackagingCategory as dbCreatePackagingCategory,
  updatePackagingCategory as dbUpdatePackagingCategory,
  deletePackagingCategory as dbDeletePackagingCategory,
} from "@/lib/repositories/packagingCategoryRepository";
import { countPackagingsByCategory } from "@/lib/repositories/packagingRepository";
import type { PackagingCategory as PrismaPackagingCategory } from "@prisma/client";

// Mirror de ingredientCategoryService.ts — mesma forma (delete físico bloqueado
// por contagem de uso), mesma ausência de transação (checagem + delete não são
// atômicos aqui, mesmo risco pré-existente e aceito no precedente).

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class PackagingCategoryNotFoundError extends Error {
  constructor(public id: string) {
    super(`Categoria de embalagem não encontrada: ${id}`);
  }
}

export class PackagingCategoryValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class DuplicatePackagingCategoryNameError extends Error {
  constructor(public name: string) {
    super(`Já existe uma categoria de embalagem com o nome "${name}".`);
  }
}

export class PackagingCategoryHasPackagingsError extends Error {
  constructor(
    public id: string,
    public count: number,
  ) {
    super(`Categoria possui ${count} embalagem(ns) vinculada(s) e não pode ser excluída.`);
  }
}

// ─── DTO ──────────────────────────────────────────────────────────────────────

type PackagingCategoryDTO = PrismaPackagingCategory;

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function listAllPackagingCategoriesService(): Promise<PackagingCategoryDTO[]> {
  return dbListAllPackagingCategories();
}

export async function getPackagingCategoryById(id: string): Promise<PackagingCategoryDTO> {
  const raw = await findPackagingCategoryById(id);
  if (!raw) throw new PackagingCategoryNotFoundError(id);
  return raw;
}

// ─── Criação ──────────────────────────────────────────────────────────────────

export async function createPackagingCategory(input: PackagingCategoryInput): Promise<PackagingCategoryDTO> {
  const trimmedName = input.name.trim();

  const errors = validatePackagingCategoryCreate({ name: trimmedName });
  if (errors.length > 0) throw new PackagingCategoryValidationFailedError(errors);

  const conflict = await findPackagingCategoryByName(trimmedName);
  if (conflict) throw new DuplicatePackagingCategoryNameError(trimmedName);

  return dbCreatePackagingCategory({ name: trimmedName });
}

// ─── Atualização ──────────────────────────────────────────────────────────────

export async function updatePackagingCategory(
  id: string,
  input: Partial<PackagingCategoryInput>,
): Promise<PackagingCategoryDTO> {
  const existing = await findPackagingCategoryById(id);
  if (!existing) throw new PackagingCategoryNotFoundError(id);

  const trimmedName = input.name !== undefined ? input.name.trim() : undefined;

  const errors = validatePackagingCategoryUpdate({ name: trimmedName });
  if (errors.length > 0) throw new PackagingCategoryValidationFailedError(errors);

  if (trimmedName !== undefined && trimmedName !== existing.name) {
    const conflict = await findPackagingCategoryByName(trimmedName);
    if (conflict) throw new DuplicatePackagingCategoryNameError(trimmedName);
  }

  return dbUpdatePackagingCategory(id, { name: trimmedName });
}

// ─── Exclusão ─────────────────────────────────────────────────────────────────

export async function deletePackagingCategory(id: string): Promise<void> {
  const existing = await findPackagingCategoryById(id);
  if (!existing) throw new PackagingCategoryNotFoundError(id);

  const count = await countPackagingsByCategory(id);
  if (count > 0) throw new PackagingCategoryHasPackagingsError(id, count);

  await dbDeletePackagingCategory(id);
}
