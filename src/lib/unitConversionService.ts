import type { ValidationError } from "@/lib/types";
import {
  validateConversionCreate,
  validateConversionUpdate,
  type UnitConversionInput,
} from "@/lib/validators/unitConversionValidator";
import {
  listAllConversions as dbListAllConversions,
  findConversionById,
  findConversion,
  createConversion as dbCreateConversion,
  updateConversion as dbUpdateConversion,
  deleteConversion as dbDeleteConversion,
  type UnitConversionWithUnits,
} from "@/lib/repositories/unitConversionRepository";
import { findUnitById } from "@/lib/repositories/unitRepository";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class ConversionNotFoundError extends Error {
  constructor(public id: string) {
    super(`Conversão não encontrada: ${id}`);
  }
}

export class ConversionValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class DuplicateConversionError extends Error {
  constructor(public fromUnitId: string, public toUnitId: string) {
    super("Já existe uma conversão cadastrada entre essas duas unidades.");
  }
}

export class InvalidUnitReferenceError extends Error {
  constructor(public field: "fromUnitId" | "toUnitId", public unitId: string) {
    super(`Unidade não encontrada: ${unitId}`);
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

type UnitConversionDTO = {
  id: string;
  fromUnitId: string;
  fromUnitName: string;
  fromUnitAbbreviation: string;
  toUnitId: string;
  toUnitName: string;
  toUnitAbbreviation: string;
  factor: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapToConversion(raw: UnitConversionWithUnits): UnitConversionDTO {
  return {
    id: raw.id,
    fromUnitId: raw.fromUnitId,
    fromUnitName: raw.fromUnit.name,
    fromUnitAbbreviation: raw.fromUnit.abbreviation,
    toUnitId: raw.toUnitId,
    toUnitName: raw.toUnit.name,
    toUnitAbbreviation: raw.toUnit.abbreviation,
    factor: raw.factor.toNumber(),
    description: raw.description,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

// ─── Validação cruzada de existência das unidades ────────────────────────────

async function assertUnitsExist(fromUnitId: string, toUnitId: string): Promise<void> {
  const [fromUnit, toUnit] = await Promise.all([findUnitById(fromUnitId), findUnitById(toUnitId)]);
  if (!fromUnit) throw new InvalidUnitReferenceError("fromUnitId", fromUnitId);
  if (!toUnit) throw new InvalidUnitReferenceError("toUnitId", toUnitId);
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function listAllConversions(): Promise<UnitConversionDTO[]> {
  const rows = await dbListAllConversions();
  return rows.map(mapToConversion);
}

export async function getConversionById(id: string): Promise<UnitConversionDTO> {
  const raw = await findConversionById(id);
  if (!raw) throw new ConversionNotFoundError(id);
  return mapToConversion(raw);
}

// ─── Criação ──────────────────────────────────────────────────────────────────
//
// Fluxo: validator → unidades existem → duplicidade (fromUnitId, toUnitId) → Repository → map

export async function createConversion(input: UnitConversionInput): Promise<UnitConversionDTO> {
  const errors = validateConversionCreate(input);
  if (errors.length > 0) throw new ConversionValidationFailedError(errors);

  await assertUnitsExist(input.fromUnitId, input.toUnitId);

  const conflict = await findConversion(input.fromUnitId, input.toUnitId);
  if (conflict) throw new DuplicateConversionError(input.fromUnitId, input.toUnitId);

  const raw = await dbCreateConversion({
    fromUnitId: input.fromUnitId,
    toUnitId: input.toUnitId,
    factor: input.factor,
    description: input.description,
  });
  return mapToConversion(raw);
}

// ─── Atualização ──────────────────────────────────────────────────────────────

export async function updateConversion(
  id: string,
  input: Partial<UnitConversionInput>,
): Promise<UnitConversionDTO> {
  const existing = await findConversionById(id);
  if (!existing) throw new ConversionNotFoundError(id);

  const errors = validateConversionUpdate(input);
  if (errors.length > 0) throw new ConversionValidationFailedError(errors);

  const nextFromUnitId = input.fromUnitId ?? existing.fromUnitId;
  const nextToUnitId = input.toUnitId ?? existing.toUnitId;

  if (input.fromUnitId !== undefined || input.toUnitId !== undefined) {
    await assertUnitsExist(nextFromUnitId, nextToUnitId);

    if (nextFromUnitId !== existing.fromUnitId || nextToUnitId !== existing.toUnitId) {
      const conflict = await findConversion(nextFromUnitId, nextToUnitId);
      if (conflict) throw new DuplicateConversionError(nextFromUnitId, nextToUnitId);
    }
  }

  const raw = await dbUpdateConversion(id, {
    fromUnitId: input.fromUnitId,
    toUnitId: input.toUnitId,
    factor: input.factor,
    description: input.description,
  });
  return mapToConversion(raw);
}

// ─── Exclusão ─────────────────────────────────────────────────────────────────
//
// UnitConversion não tem campo isActive no schema (diferente de UnitOfMeasure) —
// decisão registrada na Sprint 2.D.7: exclusão física, sem soft delete. Justificativa:
// é dado de referência matemática estática (ex. "1 kg = 1000 g"), sem histórico próprio
// a preservar, e nenhuma outra entidade referencia UnitConversion via FK (apenas
// UnitConversion referencia UnitOfMeasure, nunca o inverso) — nenhum risco de
// integridade referencial órfã ao remover.

export async function deleteConversion(id: string): Promise<void> {
  const existing = await findConversionById(id);
  if (!existing) throw new ConversionNotFoundError(id);
  await dbDeleteConversion(id);
}
