import type { SalesChannel, SalesChannelInput, ValidationError } from "@/lib/types";
import { validateSalesChannelCreate, validateSalesChannelUpdate } from "@/lib/validators/salesChannelValidator";
import {
  findActiveChannels,
  findAllChannels,
  findChannelById,
  findChannelBySlug,
  createChannel,
  updateChannel,
  activateChannel,
  deactivateChannel,
} from "@/lib/repositories/salesChannelRepository";
import type { SalesChannel as PrismaSalesChannel } from "@prisma/client";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class NotFoundError extends Error {
  constructor(public id: string) {
    super(`Canal de venda não encontrado: ${id}`);
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

export class NameConflictError extends Error {
  constructor(public name: string) {
    super(`Já existe um canal de venda com o nome "${name}".`);
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

function mapToSalesChannel(raw: PrismaSalesChannel): SalesChannel {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    sortOrder: raw.sortOrder,
    color: raw.color,
    icon: raw.icon,
    isActive: raw.isActive,
  };
}

// ─── Geração de slug ──────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove combining diacritical marks after NFD decomposition
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")    // non-alphanumeric sequences → single hyphen
    .replace(/-{2,}/g, "-")          // colapso defensivo de hífens consecutivos
    .replace(/^-+|-+$/g, "");        // remove hífens nas bordas
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function listActiveSalesChannels(): Promise<SalesChannel[]> {
  const rows = await findActiveChannels();
  return rows.map(mapToSalesChannel);
}

export async function listSalesChannels(): Promise<SalesChannel[]> {
  const rows = await findAllChannels();
  return rows.map(mapToSalesChannel);
}

export async function getSalesChannelById(id: string): Promise<SalesChannel> {
  const raw = await findChannelById(id);
  if (!raw) throw new NotFoundError(id);
  return mapToSalesChannel(raw);
}

// ─── Criação ──────────────────────────────────────────────────────────────────
//
// Fluxo:
//   name recebido → trim() → validar tamanho → gerar slug → validar unicidade → Repository

export async function createSalesChannel(input: SalesChannelInput): Promise<SalesChannel> {
  const trimmedName = input.name.trim();

  const errors = validateSalesChannelCreate({ ...input, name: trimmedName });
  if (errors.length > 0) throw new ValidationFailedError(errors);

  const slug = slugify(trimmedName);

  const conflict = await findChannelBySlug(slug);
  if (conflict) throw new SlugConflictError(slug);

  try {
    const raw = await createChannel({
      name: trimmedName,
      slug,
      sortOrder: input.sortOrder,
      color: input.color,
      icon: input.icon,
    });
    return mapToSalesChannel(raw);
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") {
      throw new NameConflictError(trimmedName);
    }
    throw err;
  }
}

// ─── Atualização ──────────────────────────────────────────────────────────────

export async function updateSalesChannel(
  id: string,
  input: Partial<Pick<SalesChannelInput, "name" | "sortOrder" | "color" | "icon">>,
): Promise<SalesChannel> {
  const existing = await findChannelById(id);
  if (!existing) throw new NotFoundError(id);

  const trimmedName = input.name !== undefined ? input.name.trim() : undefined;

  const errors = validateSalesChannelUpdate({ ...input, name: trimmedName });
  if (errors.length > 0) throw new ValidationFailedError(errors);

  const raw = await updateChannel(id, {
    name: trimmedName,
    sortOrder: input.sortOrder,
    color: input.color,
    icon: input.icon,
  });

  return mapToSalesChannel(raw);
}

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

export async function activateSalesChannel(id: string): Promise<SalesChannel> {
  const existing = await findChannelById(id);
  if (!existing) throw new NotFoundError(id);
  const raw = await activateChannel(id);
  return mapToSalesChannel(raw);
}

export async function deactivateSalesChannel(id: string): Promise<SalesChannel> {
  const existing = await findChannelById(id);
  if (!existing) throw new NotFoundError(id);
  const raw = await deactivateChannel(id);
  return mapToSalesChannel(raw);
}
