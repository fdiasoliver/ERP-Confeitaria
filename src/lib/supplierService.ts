import type { ValidationError } from "@/lib/types";
import {
  validateSupplierCreate,
  validateSupplierUpdate,
  type SupplierInput,
} from "@/lib/validators/supplierValidator";
import {
  findSupplierById,
  findSupplierByCnpj,
  listSuppliersPaged,
  createSupplier as dbCreateSupplier,
  updateSupplier as dbUpdateSupplier,
  activateSupplier as dbActivateSupplier,
  deactivateSupplier as dbDeactivateSupplier,
  type ListSuppliersParams,
  type PagedResult,
} from "@/lib/repositories/supplierRepository";
import type { Supplier as PrismaSupplier } from "@prisma/client";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class SupplierNotFoundError extends Error {
  constructor(public id: string) {
    super(`Fornecedor não encontrado: ${id}`);
  }
}

export class SupplierValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class DuplicateCnpjError extends Error {
  constructor(public cnpj: string) {
    super(`Já existe um fornecedor com o CNPJ "${cnpj}".`);
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

export type SupplierDTO = Omit<PrismaSupplier, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

function mapToSupplier(raw: PrismaSupplier): SupplierDTO {
  return {
    ...raw,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

// ─── Normalização ─────────────────────────────────────────────────────────────
// Mesmo padrão já adotado em storeConfigService.ts: CNPJ e telefone são
// persistidos sem máscara (só dígitos) — nunca o que o usuário digitou literalmente.

function normalizeDigits(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const digits = value.replace(/\D/g, "");
  return digits === "" ? null : digits;
}

// ─── Regras de negócio dependentes do banco ───────────────────────────────────
//
// Só o que exige consulta ao banco entra aqui (duplicidade de CNPJ). Formato e
// consistência sintática já foram resolvidos pelo Validator antes desta função
// ser chamada — nunca duplicados aqui.

export async function validateBusinessRules(
  input: { cnpj?: string | null },
  excludeId?: string,
): Promise<void> {
  if (input.cnpj) {
    const conflict = await findSupplierByCnpj(input.cnpj);
    if (conflict && conflict.id !== excludeId) {
      throw new DuplicateCnpjError(input.cnpj);
    }
  }
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function getSupplierById(id: string): Promise<SupplierDTO> {
  const raw = await findSupplierById(id);
  if (!raw) throw new SupplierNotFoundError(id);
  return mapToSupplier(raw);
}

export async function listSuppliers(params: ListSuppliersParams): Promise<PagedResult<SupplierDTO>> {
  const result = await listSuppliersPaged(params);
  return { ...result, items: result.items.map(mapToSupplier) };
}

// ─── Criação ──────────────────────────────────────────────────────────────────
//
// Fluxo: trim(name) + normaliza(cnpj, phone) → Validator → validateBusinessRules
// (duplicidade de CNPJ) → Repository → map

export async function createSupplier(input: SupplierInput): Promise<SupplierDTO> {
  const trimmedName = input.name.trim();
  const normalizedCnpj = normalizeDigits(input.cnpj);
  const normalizedPhone = normalizeDigits(input.phone);

  const errors = validateSupplierCreate({
    ...input,
    name: trimmedName,
    cnpj: normalizedCnpj,
    phone: normalizedPhone,
  });
  if (errors.length > 0) throw new SupplierValidationFailedError(errors);

  await validateBusinessRules({ cnpj: normalizedCnpj });

  const raw = await dbCreateSupplier({
    name: trimmedName,
    phone: normalizedPhone,
    cnpj: normalizedCnpj,
    leadTimeDays: input.leadTimeDays,
    notes: input.notes,
  });
  return mapToSupplier(raw);
}

// ─── Atualização ──────────────────────────────────────────────────────────────

export async function updateSupplier(id: string, input: Partial<SupplierInput>): Promise<SupplierDTO> {
  const existing = await findSupplierById(id);
  if (!existing) throw new SupplierNotFoundError(id);

  const trimmedName = input.name !== undefined ? input.name.trim() : undefined;
  const normalizedCnpj = normalizeDigits(input.cnpj);
  const normalizedPhone = normalizeDigits(input.phone);

  const errors = validateSupplierUpdate({
    ...input,
    name: trimmedName,
    cnpj: normalizedCnpj,
    phone: normalizedPhone,
  });
  if (errors.length > 0) throw new SupplierValidationFailedError(errors);

  if (normalizedCnpj !== undefined && normalizedCnpj !== null && normalizedCnpj !== existing.cnpj) {
    await validateBusinessRules({ cnpj: normalizedCnpj }, id);
  }

  const raw = await dbUpdateSupplier(id, {
    name: trimmedName,
    phone: normalizedPhone,
    cnpj: normalizedCnpj,
    leadTimeDays: input.leadTimeDays,
    notes: input.notes,
  });
  return mapToSupplier(raw);
}

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

export async function activateSupplier(id: string): Promise<SupplierDTO> {
  const existing = await findSupplierById(id);
  if (!existing) throw new SupplierNotFoundError(id);
  const raw = await dbActivateSupplier(id);
  return mapToSupplier(raw);
}

export async function deactivateSupplier(id: string): Promise<SupplierDTO> {
  const existing = await findSupplierById(id);
  if (!existing) throw new SupplierNotFoundError(id);
  const raw = await dbDeactivateSupplier(id);
  return mapToSupplier(raw);
}
