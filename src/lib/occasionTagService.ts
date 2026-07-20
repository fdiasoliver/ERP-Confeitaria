import type { OccasionTag, OccasionTagInput, ValidationError } from "@/lib/types";
import { validateOccasionCreate, validateOccasionUpdate } from "@/lib/validators/occasionTagValidator";
import {
  findAllOccasions,
  findActiveOccasions,
  findOccasionById,
  findOccasionBySlug,
  createOccasion as dbCreateOccasion,
  updateOccasion as dbUpdateOccasion,
  activateOccasion as dbActivateOccasion,
  deactivateOccasion as dbDeactivateOccasion,
  countProductsByOccasion,
} from "@/lib/repositories/occasionTagRepository";
import type { OccasionTag as PrismaOccasionTag } from "@prisma/client";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class NotFoundError extends Error {
  constructor(public id: string) {
    super(`Ocasião não encontrada: ${id}`);
  }
}

export class ValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class SlugConflictError extends Error {
  constructor(public slug: string) {
    super(`Slug já em uso: ${slug}`);
  }
}

export class OccasionHasProductsError extends Error {
  constructor(public id: string, public count: number) {
    super(`Ocasião possui ${count} produto(s) vinculado(s) e não pode ser desativada.`);
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

function mapToOccasionTag(raw: PrismaOccasionTag): OccasionTag {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    sortOrder: raw.sortOrder,
    color: raw.color,
    icon: raw.icon,
    isActive: raw.isActive,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

// ─── Geração de slug ──────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove combining diacritical marks after NFD decomposition
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function listActiveOccasions(): Promise<OccasionTag[]> {
  const rows = await findActiveOccasions();
  return rows.map(mapToOccasionTag);
}

export async function listAllOccasions(): Promise<OccasionTag[]> {
  const rows = await findAllOccasions();
  return rows.map(mapToOccasionTag);
}

export async function getOccasionById(id: string): Promise<OccasionTag> {
  const raw = await findOccasionById(id);
  if (!raw) throw new NotFoundError(id);
  return mapToOccasionTag(raw);
}

// ─── Criação ──────────────────────────────────────────────────────────────────
//
// Fluxo: trim → toUpperCase(color) → validator → slugify → conflito slug → Repository → map

export async function createOccasion(input: OccasionTagInput): Promise<OccasionTag> {
  const trimmedName = input.name.trim();
  const normalizedColor = input.color !== undefined ? input.color.toUpperCase() : undefined;

  const errors = validateOccasionCreate({ ...input, name: trimmedName, color: normalizedColor });
  if (errors.length > 0) throw new ValidationFailedError(errors);

  const slug = slugify(trimmedName);

  const conflict = await findOccasionBySlug(slug);
  if (conflict) throw new SlugConflictError(slug);

  const raw = await dbCreateOccasion({
    name: trimmedName,
    slug,
    sortOrder: input.sortOrder,
    color: normalizedColor,
    icon: input.icon,
  });
  return mapToOccasionTag(raw);
}

// ─── Atualização ──────────────────────────────────────────────────────────────
//
// slug é imutável — nunca recalculado nem atualizado

export async function updateOccasion(
  id: string,
  input: Partial<Pick<OccasionTagInput, "name" | "sortOrder" | "color" | "icon">>,
): Promise<OccasionTag> {
  const existing = await findOccasionById(id);
  if (!existing) throw new NotFoundError(id);

  const trimmedName = input.name !== undefined ? input.name.trim() : undefined;
  const normalizedColor = input.color !== undefined ? input.color.toUpperCase() : undefined;

  const errors = validateOccasionUpdate({ ...input, name: trimmedName, color: normalizedColor });
  if (errors.length > 0) throw new ValidationFailedError(errors);

  const raw = await dbUpdateOccasion(id, {
    name: trimmedName,
    sortOrder: input.sortOrder,
    color: normalizedColor,
    icon: input.icon,
  });
  return mapToOccasionTag(raw);
}

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

export async function activateOccasion(id: string): Promise<OccasionTag> {
  const existing = await findOccasionById(id);
  if (!existing) throw new NotFoundError(id);
  const raw = await dbActivateOccasion(id);
  return mapToOccasionTag(raw);
}

export async function deactivateOccasion(id: string): Promise<OccasionTag> {
  const existing = await findOccasionById(id);
  if (!existing) throw new NotFoundError(id);

  const count = await countProductsByOccasion(id);
  if (count > 0) throw new OccasionHasProductsError(id, count);

  const raw = await dbDeactivateOccasion(id);
  return mapToOccasionTag(raw);
}
