import { prisma } from "@/lib/prisma";
import type { PackagingPriceHistory } from "@prisma/client";

// Arquivo dedicado, diferente do precedente de Ingredient (onde addPriceHistoryEntry/
// listPriceHistory vivem dentro de ingredientRepository.ts) — decisão explícita da
// Ordem de Missão da Sprint 2.H.2 (Fase 2: "PackagingPriceHistoryRepository" como
// arquivo próprio). Ver CHANGELOG.md, Sprint 2.H.2, para o registro da divergência.

export async function addPackagingPriceHistoryEntry(data: {
  packagingId: string;
  price: number;
  notes?: string | null;
}): Promise<PackagingPriceHistory> {
  return prisma.packagingPriceHistory.create({ data });
}

export async function listPackagingPriceHistory(packagingId: string): Promise<PackagingPriceHistory[]> {
  return prisma.packagingPriceHistory.findMany({
    where: { packagingId },
    orderBy: { recordedAt: "desc" },
  });
}
