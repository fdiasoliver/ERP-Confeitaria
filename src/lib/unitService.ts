import type { ValidationError } from "@/lib/types";
import { validateUnitCreate, validateUnitUpdate, type UnitOfMeasureInput } from "@/lib/validators/unitValidator";
import {
  listAllUnits as dbListAllUnits,
  listActiveUnits as dbListActiveUnits,
  findUnitById,
  findUnitByName,
  findUnitByAbbreviation,
  createUnit as dbCreateUnit,
  updateUnit as dbUpdateUnit,
  activateUnit as dbActivateUnit,
  deactivateUnit as dbDeactivateUnit,
} from "@/lib/repositories/unitRepository";
import type { UnitOfMeasure as PrismaUnitOfMeasure, UnitType } from "@prisma/client";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class NotFoundError extends Error {
  constructor(public id: string) {
    super(`Unidade não encontrada: ${id}`);
  }
}

export class ValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class DuplicateNameError extends Error {
  constructor(public name: string) {
    super(`Já existe uma unidade com o nome "${name}".`);
  }
}

export class DuplicateAbbreviationError extends Error {
  constructor(public abbreviation: string) {
    super(`Já existe uma unidade com o símbolo "${abbreviation}".`);
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

type UnitOfMeasureDTO = Omit<PrismaUnitOfMeasure, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

function mapToUnit(raw: PrismaUnitOfMeasure): UnitOfMeasureDTO {
  return {
    ...raw,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function listAllUnits(): Promise<UnitOfMeasureDTO[]> {
  const rows = await dbListAllUnits();
  return rows.map(mapToUnit);
}

export async function listActiveUnits(): Promise<UnitOfMeasureDTO[]> {
  const rows = await dbListActiveUnits();
  return rows.map(mapToUnit);
}

export async function getUnitById(id: string): Promise<UnitOfMeasureDTO> {
  const raw = await findUnitById(id);
  if (!raw) throw new NotFoundError(id);
  return mapToUnit(raw);
}

// ─── Criação ──────────────────────────────────────────────────────────────────
//
// Fluxo: trim(name, abbreviation) → validator → unicidade de name → unicidade de abbreviation → Repository → map

export async function createUnit(input: UnitOfMeasureInput): Promise<UnitOfMeasureDTO> {
  const trimmedName = input.name.trim();
  const trimmedAbbreviation = input.abbreviation.trim();

  const errors = validateUnitCreate({ ...input, name: trimmedName, abbreviation: trimmedAbbreviation });
  if (errors.length > 0) throw new ValidationFailedError(errors);

  const nameConflict = await findUnitByName(trimmedName);
  if (nameConflict) throw new DuplicateNameError(trimmedName);

  const abbreviationConflict = await findUnitByAbbreviation(trimmedAbbreviation);
  if (abbreviationConflict) throw new DuplicateAbbreviationError(trimmedAbbreviation);

  const raw = await dbCreateUnit({
    name: trimmedName,
    abbreviation: trimmedAbbreviation,
    type: input.type as UnitType,
    sortOrder: input.sortOrder,
  });
  return mapToUnit(raw);
}

// ─── Atualização ──────────────────────────────────────────────────────────────

export async function updateUnit(
  id: string,
  input: Partial<UnitOfMeasureInput>,
): Promise<UnitOfMeasureDTO> {
  const existing = await findUnitById(id);
  if (!existing) throw new NotFoundError(id);

  const trimmedName = input.name !== undefined ? input.name.trim() : undefined;
  const trimmedAbbreviation = input.abbreviation !== undefined ? input.abbreviation.trim() : undefined;

  const errors = validateUnitUpdate({ ...input, name: trimmedName, abbreviation: trimmedAbbreviation });
  if (errors.length > 0) throw new ValidationFailedError(errors);

  if (trimmedName !== undefined && trimmedName !== existing.name) {
    const nameConflict = await findUnitByName(trimmedName);
    if (nameConflict) throw new DuplicateNameError(trimmedName);
  }

  if (trimmedAbbreviation !== undefined && trimmedAbbreviation !== existing.abbreviation) {
    const abbreviationConflict = await findUnitByAbbreviation(trimmedAbbreviation);
    if (abbreviationConflict) throw new DuplicateAbbreviationError(trimmedAbbreviation);
  }

  const raw = await dbUpdateUnit(id, {
    name: trimmedName,
    abbreviation: trimmedAbbreviation,
    type: input.type as UnitType | undefined,
    sortOrder: input.sortOrder,
  });
  return mapToUnit(raw);
}

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

export async function activateUnit(id: string): Promise<UnitOfMeasureDTO> {
  const existing = await findUnitById(id);
  if (!existing) throw new NotFoundError(id);
  const raw = await dbActivateUnit(id);
  return mapToUnit(raw);
}

export async function deactivateUnit(id: string): Promise<UnitOfMeasureDTO> {
  const existing = await findUnitById(id);
  if (!existing) throw new NotFoundError(id);
  const raw = await dbDeactivateUnit(id);
  return mapToUnit(raw);
}
