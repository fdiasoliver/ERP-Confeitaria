import type { ValidationError } from "@/lib/types";
import {
  validatePackagingCreate,
  validatePackagingUpdate,
  type PackagingInput,
} from "@/lib/validators/packagingValidator";
import {
  listActivePackagings as dbListActivePackagings,
  listPackagingsPaged as dbListPackagingsPaged,
  findPackagingById,
  findPackagingByName,
  createPackaging as dbCreatePackaging,
  updatePackaging as dbUpdatePackaging,
  activatePackaging as dbActivatePackaging,
  deactivatePackaging as dbDeactivatePackaging,
  type PackagingWithRelations,
  type ListPackagingsParams,
  type PagedResult,
} from "@/lib/repositories/packagingRepository";
import { findPackagingCategoryById } from "@/lib/repositories/packagingCategoryRepository";
import { findSupplierById } from "@/lib/repositories/supplierRepository";
import { recordPriceChange } from "@/lib/packagingPriceHistoryService";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class PackagingNotFoundError extends Error {
  constructor(public id: string) {
    super(`Embalagem não encontrada: ${id}`);
  }
}

export class PackagingValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class DuplicatePackagingNameError extends Error {
  constructor(public name: string) {
    super(`Já existe uma embalagem com o nome "${name}".`);
  }
}

export class InvalidPackagingCategoryReferenceError extends Error {
  constructor(public categoryId: string) {
    super(`Categoria de embalagem não encontrada: ${categoryId}`);
  }
}

export class InvalidSupplierReferenceError extends Error {
  constructor(public supplierId: string) {
    super(`Fornecedor não encontrado: ${supplierId}`);
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

export interface PackagingDTO {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  unitCost: number;
  stockQuantity: number;
  minStock: number;
  /** Derivado de stockQuantity <= minStock — mesmo mecanismo de Ingredient (REGRAS_NEGOCIO.md Seção 8.1). */
  isLowStock: boolean;
  supplierId: string | null;
  supplierName: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapToPackaging(raw: PackagingWithRelations): PackagingDTO {
  return {
    id: raw.id,
    name: raw.name,
    categoryId: raw.categoryId,
    categoryName: raw.category?.name ?? null,
    unitCost: raw.unitCost.toNumber(),
    stockQuantity: raw.stockQuantity,
    minStock: raw.minStock,
    isLowStock: raw.stockQuantity <= raw.minStock,
    supplierId: raw.supplierId,
    supplierName: raw.supplier?.name ?? null,
    active: raw.active,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

// ─── Validação cruzada de referências ────────────────────────────────────────

async function assertCategoryExists(categoryId: string): Promise<void> {
  const category = await findPackagingCategoryById(categoryId);
  if (!category) throw new InvalidPackagingCategoryReferenceError(categoryId);
}

async function assertSupplierExists(supplierId: string): Promise<void> {
  const supplier = await findSupplierById(supplierId);
  if (!supplier) throw new InvalidSupplierReferenceError(supplierId);
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function listActivePackagings(): Promise<PackagingDTO[]> {
  const rows = await dbListActivePackagings();
  return rows.map(mapToPackaging);
}

export async function listPackagingsPaged(params: ListPackagingsParams): Promise<PagedResult<PackagingDTO>> {
  const result = await dbListPackagingsPaged(params);
  return { ...result, items: result.items.map(mapToPackaging) };
}

export async function getPackagingById(id: string): Promise<PackagingDTO> {
  const raw = await findPackagingById(id);
  if (!raw) throw new PackagingNotFoundError(id);
  return mapToPackaging(raw);
}

// ─── Criação ──────────────────────────────────────────────────────────────────
//
// Fluxo: trim(name) → validator → unicidade de nome → categoria existe (se
// informada) → fornecedor existe (se informado) → Repository → registro em
// PackagingPriceHistory (REGRAS_NEGOCIO.md Seção 8.1) → map.
// Sem transação entre create + recordPriceChange — mesmo padrão não-transacional
// já aceito em ingredientService.createIngredient (risco pré-existente e
// equivalente, não introduzido por esta sprint; ver Fase 5 do relatório).

export async function createPackaging(input: PackagingInput): Promise<PackagingDTO> {
  const trimmedName = input.name.trim();
  const errors = validatePackagingCreate({ ...input, name: trimmedName });
  if (errors.length > 0) throw new PackagingValidationFailedError(errors);

  const nameConflict = await findPackagingByName(trimmedName);
  if (nameConflict) throw new DuplicatePackagingNameError(trimmedName);

  if (input.categoryId) await assertCategoryExists(input.categoryId);
  if (input.supplierId) await assertSupplierExists(input.supplierId);

  const raw = await dbCreatePackaging({
    name: trimmedName,
    categoryId: input.categoryId ?? null,
    unitCost: input.unitCost,
    stockQuantity: input.stockQuantity,
    minStock: input.minStock,
    supplierId: input.supplierId ?? null,
  });

  await recordPriceChange(raw.id, input.unitCost);

  return mapToPackaging(raw);
}

// ─── Atualização ──────────────────────────────────────────────────────────────

export async function updatePackaging(id: string, input: Partial<PackagingInput>): Promise<PackagingDTO> {
  const existing = await findPackagingById(id);
  if (!existing) throw new PackagingNotFoundError(id);

  const trimmedName = input.name !== undefined ? input.name.trim() : undefined;
  const errors = validatePackagingUpdate({ ...input, name: trimmedName });
  if (errors.length > 0) throw new PackagingValidationFailedError(errors);

  if (trimmedName !== undefined && trimmedName !== existing.name) {
    const nameConflict = await findPackagingByName(trimmedName);
    if (nameConflict) throw new DuplicatePackagingNameError(trimmedName);
  }

  if (input.categoryId) await assertCategoryExists(input.categoryId);
  if (input.supplierId) await assertSupplierExists(input.supplierId);

  const priceChanged = input.unitCost !== undefined && input.unitCost !== existing.unitCost.toNumber();

  const raw = await dbUpdatePackaging(id, {
    name: trimmedName,
    categoryId: input.categoryId,
    unitCost: input.unitCost,
    stockQuantity: input.stockQuantity,
    minStock: input.minStock,
    supplierId: input.supplierId,
  });

  if (priceChanged) {
    await recordPriceChange(id, input.unitCost as number);
  }

  return mapToPackaging(raw);
}

// ─── Ciclo de vida ────────────────────────────────────────────────────────────
//
// "Embalagem inativa não pode ser adicionada a novos vínculos com produto"
// (MODULE_2H_PLANNING.md Regra 7) é validada em productPackagingService.ts, não
// aqui — mesma separação de responsabilidade já usada em ingredientService.ts
// (restrição do lado de Receitas fica no domínio de Receitas).

export async function activatePackaging(id: string): Promise<PackagingDTO> {
  const existing = await findPackagingById(id);
  if (!existing) throw new PackagingNotFoundError(id);
  const raw = await dbActivatePackaging(id);
  return mapToPackaging(raw);
}

export async function deactivatePackaging(id: string): Promise<PackagingDTO> {
  const existing = await findPackagingById(id);
  if (!existing) throw new PackagingNotFoundError(id);
  const raw = await dbDeactivatePackaging(id);
  return mapToPackaging(raw);
}
