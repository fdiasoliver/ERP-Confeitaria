import type { ValidationError } from "@/lib/types";
import {
  validatePackagingPriceHistoryCreate,
  type PackagingPriceHistoryInput,
} from "@/lib/validators/packagingPriceHistoryValidator";
import {
  addPackagingPriceHistoryEntry,
  listPackagingPriceHistory as dbListPackagingPriceHistory,
} from "@/lib/repositories/packagingPriceHistoryRepository";
import type { PackagingPriceHistory } from "@prisma/client";

// Arquivo dedicado (não co-localizado em packagingService.ts, diferente do
// precedente de Ingredient) — mesma divergência já registrada para o Repository
// na Sprint 2.H.2, por exigência explícita da Ordem de Missão da Sprint 2.H.3.
// Chamado por packagingService.ts (createPackaging/updatePackaging) após
// alteração de unitCost — REGRAS_NEGOCIO.md Seção 8.1: "toda alteração de custo
// gera registro em PackagingPriceHistory".

export class PackagingPriceHistoryValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export interface PackagingPriceHistoryDTO {
  id: string;
  price: number;
  notes: string | null;
  recordedAt: string;
}

function mapPriceHistory(raw: PackagingPriceHistory): PackagingPriceHistoryDTO {
  return {
    id: raw.id,
    price: raw.price.toNumber(),
    notes: raw.notes,
    recordedAt: raw.recordedAt.toISOString(),
  };
}

export async function recordPriceChange(
  packagingId: string,
  price: number,
  notes?: string | null,
): Promise<PackagingPriceHistoryDTO> {
  const input: PackagingPriceHistoryInput = { packagingId, price, notes };
  const errors = validatePackagingPriceHistoryCreate(input);
  if (errors.length > 0) throw new PackagingPriceHistoryValidationFailedError(errors);

  const raw = await addPackagingPriceHistoryEntry({ packagingId, price, notes: notes ?? null });
  return mapPriceHistory(raw);
}

export async function getPackagingPriceHistory(packagingId: string): Promise<PackagingPriceHistoryDTO[]> {
  const rows = await dbListPackagingPriceHistory(packagingId);
  return rows.map(mapPriceHistory);
}
