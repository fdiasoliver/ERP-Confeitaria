import type { ValidationError } from "@/lib/types";
import {
  validateIngredientCreate,
  validateIngredientUpdate,
  type IngredientInput,
} from "@/lib/validators/ingredientValidator";
import {
  listAllIngredients as dbListAllIngredients,
  listActiveIngredients as dbListActiveIngredients,
  findIngredientById,
  findIngredientByName,
  createIngredient as dbCreateIngredient,
  updateIngredient as dbUpdateIngredient,
  activateIngredient as dbActivateIngredient,
  deactivateIngredient as dbDeactivateIngredient,
  addPriceHistoryEntry,
  listPriceHistory as dbListPriceHistory,
  type IngredientWithRelations,
} from "@/lib/repositories/ingredientRepository";
import { findUnitById } from "@/lib/repositories/unitRepository";
import { findIngredientCategoryById } from "@/lib/repositories/ingredientCategoryRepository";
import type { PriceSource, IngredientPriceHistory } from "@prisma/client";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class IngredientNotFoundError extends Error {
  constructor(public id: string) {
    super(`Ingrediente não encontrado: ${id}`);
  }
}

export class IngredientValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class DuplicateIngredientNameError extends Error {
  constructor(public name: string) {
    super(`Já existe um ingrediente com o nome "${name}".`);
  }
}

export class InvalidUnitReferenceError extends Error {
  constructor(public unitId: string) {
    super(`Unidade de medida não encontrada: ${unitId}`);
  }
}

export class InvalidCategoryReferenceError extends Error {
  constructor(public categoryId: string) {
    super(`Categoria de ingrediente não encontrada: ${categoryId}`);
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

type IngredientDTO = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  unitId: string;
  unitName: string;
  unitAbbreviation: string;
  currentPrice: number;
  stockQuantity: number;
  minStock: number;
  /** Derivado de stockQuantity <= minStock — sinaliza o alerta previsto em REGRAS_NEGOCIO.md 3.3/7.3. */
  isLowStock: boolean;
  supplier: string | null;
  externalCode: string | null;
  externalSource: PriceSource | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

function mapToIngredient(raw: IngredientWithRelations): IngredientDTO {
  const stockQuantity = raw.stockQuantity.toNumber();
  const minStock = raw.minStock.toNumber();
  return {
    id: raw.id,
    name: raw.name,
    categoryId: raw.categoryId,
    categoryName: raw.category?.name ?? null,
    unitId: raw.unitId,
    unitName: raw.unit.name,
    unitAbbreviation: raw.unit.abbreviation,
    currentPrice: raw.currentPrice.toNumber(),
    stockQuantity,
    minStock,
    isLowStock: stockQuantity <= minStock,
    supplier: raw.supplier,
    externalCode: raw.externalCode,
    externalSource: raw.externalSource,
    active: raw.active,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

type PriceHistoryDTO = {
  id: string;
  price: number;
  source: PriceSource;
  notes: string | null;
  recordedAt: string;
};

function mapPriceHistory(raw: IngredientPriceHistory): PriceHistoryDTO {
  return {
    id: raw.id,
    price: raw.price.toNumber(),
    source: raw.source,
    notes: raw.notes,
    recordedAt: raw.recordedAt.toISOString(),
  };
}

// ─── Validação cruzada de referências ────────────────────────────────────────

async function assertUnitExists(unitId: string): Promise<void> {
  const unit = await findUnitById(unitId);
  if (!unit) throw new InvalidUnitReferenceError(unitId);
}

async function assertCategoryExists(categoryId: string): Promise<void> {
  const category = await findIngredientCategoryById(categoryId);
  if (!category) throw new InvalidCategoryReferenceError(categoryId);
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function listAllIngredients(): Promise<IngredientDTO[]> {
  const rows = await dbListAllIngredients();
  return rows.map(mapToIngredient);
}

export async function listActiveIngredients(): Promise<IngredientDTO[]> {
  const rows = await dbListActiveIngredients();
  return rows.map(mapToIngredient);
}

export async function getIngredientById(id: string): Promise<IngredientDTO> {
  const raw = await findIngredientById(id);
  if (!raw) throw new IngredientNotFoundError(id);
  return mapToIngredient(raw);
}

export async function getPriceHistory(id: string): Promise<PriceHistoryDTO[]> {
  const existing = await findIngredientById(id);
  if (!existing) throw new IngredientNotFoundError(id);
  const rows = await dbListPriceHistory(id);
  return rows.map(mapPriceHistory);
}

// ─── Criação ──────────────────────────────────────────────────────────────────
//
// Fluxo: trim(name) → validator → unicidade de nome → unidade existe → categoria
// existe (se informada) → Repository → registro em IngredientPriceHistory
// (REGRAS_NEGOCIO.md 7.2: "Toda atualização de preço deve gerar um registro") → map

export async function createIngredient(input: IngredientInput): Promise<IngredientDTO> {
  const trimmedName = input.name.trim();
  const errors = validateIngredientCreate({ ...input, name: trimmedName });
  if (errors.length > 0) throw new IngredientValidationFailedError(errors);

  const nameConflict = await findIngredientByName(trimmedName);
  if (nameConflict) throw new DuplicateIngredientNameError(trimmedName);

  await assertUnitExists(input.unitId);
  if (input.categoryId) await assertCategoryExists(input.categoryId);

  const raw = await dbCreateIngredient({
    name: trimmedName,
    categoryId: input.categoryId ?? null,
    unitId: input.unitId,
    currentPrice: input.currentPrice,
    stockQuantity: input.stockQuantity,
    minStock: input.minStock,
    supplier: input.supplier ?? null,
    externalCode: input.externalCode ?? null,
    externalSource: input.externalSource ?? null,
  });

  await addPriceHistoryEntry({
    ingredientId: raw.id,
    price: input.currentPrice,
    source: input.priceSource ?? "MANUAL",
  });

  return mapToIngredient(raw);
}

// ─── Atualização ──────────────────────────────────────────────────────────────

export async function updateIngredient(
  id: string,
  input: Partial<IngredientInput>,
): Promise<IngredientDTO> {
  const existing = await findIngredientById(id);
  if (!existing) throw new IngredientNotFoundError(id);

  const trimmedName = input.name !== undefined ? input.name.trim() : undefined;
  const errors = validateIngredientUpdate({ ...input, name: trimmedName });
  if (errors.length > 0) throw new IngredientValidationFailedError(errors);

  if (trimmedName !== undefined && trimmedName !== existing.name) {
    const nameConflict = await findIngredientByName(trimmedName);
    if (nameConflict) throw new DuplicateIngredientNameError(trimmedName);
  }

  if (input.unitId !== undefined) await assertUnitExists(input.unitId);
  if (input.categoryId) await assertCategoryExists(input.categoryId);

  const priceChanged = input.currentPrice !== undefined && input.currentPrice !== existing.currentPrice.toNumber();

  const raw = await dbUpdateIngredient(id, {
    name: trimmedName,
    categoryId: input.categoryId,
    unitId: input.unitId,
    currentPrice: input.currentPrice,
    stockQuantity: input.stockQuantity,
    minStock: input.minStock,
    supplier: input.supplier,
    externalCode: input.externalCode,
    externalSource: input.externalSource,
  });

  if (priceChanged) {
    await addPriceHistoryEntry({
      ingredientId: id,
      price: input.currentPrice as number,
      source: input.priceSource ?? "MANUAL",
    });
  }

  return mapToIngredient(raw);
}

// ─── Ciclo de vida ────────────────────────────────────────────────────────────
//
// "Ingrediente inativo (active: false) não pode ser adicionado a novas receitas"
// (REGRAS_NEGOCIO.md 3.3) é uma regra que pertence à validação de RecipeIngredient
// (domínio Receitas, Sprint 2.I — fora de escopo desta sprint). Aqui só o campo
// active é exposto/alternado; a restrição do lado de Receitas não é implementada
// ainda, pois Receitas não existe nesta sprint.

export async function activateIngredient(id: string): Promise<IngredientDTO> {
  const existing = await findIngredientById(id);
  if (!existing) throw new IngredientNotFoundError(id);
  const raw = await dbActivateIngredient(id);
  return mapToIngredient(raw);
}

export async function deactivateIngredient(id: string): Promise<IngredientDTO> {
  const existing = await findIngredientById(id);
  if (!existing) throw new IngredientNotFoundError(id);
  const raw = await dbDeactivateIngredient(id);
  return mapToIngredient(raw);
}
