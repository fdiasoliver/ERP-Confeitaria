import { fetchNfceByQrCode, type NfceItem } from "@/lib/clients/nfceClient";
import {
  addPriceHistoryEntry,
  findPriceHistoryEntriesByNfceAccessKey,
  listActiveIngredients,
} from "@/lib/repositories/ingredientRepository";
import type { PriceSource } from "@prisma/client";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class NfceFetchFailedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// ─── Preview (sem gravar nada) ────────────────────────────────────────────────

export interface NfceImportPreviewItem extends NfceItem {
  /** Sugestão de ingrediente já cadastrado, por correspondência simples de nome — o admin sempre confirma/troca antes de importar. */
  suggestedIngredientId: string | null;
}

export interface NfceImportPreview {
  accessKey: string;
  issuerName: string;
  emittedAt: Date | null;
  items: NfceImportPreviewItem[];
  /** Ingredientes que já têm uma linha de histórico gravada a partir dessa mesma nota. */
  alreadyImportedIngredientIds: string[];
}

function suggestIngredientId(description: string, ingredients: { id: string; name: string }[]): string | null {
  const normalizedDesc = description.toLowerCase();
  const match = ingredients.find((ing) => {
    const name = ing.name.toLowerCase();
    return normalizedDesc.includes(name) || name.includes(normalizedDesc);
  });
  return match?.id ?? null;
}

export async function previewNfceImport(qrCodeContent: string): Promise<NfceImportPreview> {
  const result = await fetchNfceByQrCode(qrCodeContent);
  if (!result.success) {
    throw new NfceFetchFailedError(result.error);
  }

  const [alreadyImportedEntries, ingredients] = await Promise.all([
    findPriceHistoryEntriesByNfceAccessKey(result.data.accessKey),
    listActiveIngredients(),
  ]);

  return {
    accessKey: result.data.accessKey,
    issuerName: result.data.issuerName,
    emittedAt: result.data.emittedAt,
    items: result.data.items.map((item) => ({
      ...item,
      suggestedIngredientId: suggestIngredientId(item.description, ingredients),
    })),
    alreadyImportedIngredientIds: alreadyImportedEntries.map((entry) => entry.ingredientId),
  };
}

// ─── Import (grava IngredientPriceHistory) ────────────────────────────────────

export interface NfceImportMapping {
  ingredientId: string;
  price: number;
}

export interface NfceImportResultItem {
  ingredientId: string;
  success: boolean;
  error?: string;
}

export async function importNfceItems(
  accessKey: string,
  mappings: NfceImportMapping[],
): Promise<NfceImportResultItem[]> {
  const results: NfceImportResultItem[] = [];

  for (const mapping of mappings) {
    if (!mapping.ingredientId) {
      results.push({ ingredientId: mapping.ingredientId, success: false, error: "Ingrediente não informado." });
      continue;
    }
    if (typeof mapping.price !== "number" || Number.isNaN(mapping.price) || mapping.price <= 0) {
      results.push({ ingredientId: mapping.ingredientId, success: false, error: "Preço deve ser maior que zero." });
      continue;
    }

    try {
      await addPriceHistoryEntry({
        ingredientId: mapping.ingredientId,
        price: mapping.price,
        source: "NOTA_FISCAL" as PriceSource,
        notes: `Importado da NFC-e ${accessKey}`,
        nfceAccessKey: accessKey,
      });
      results.push({ ingredientId: mapping.ingredientId, success: true });
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "P2002") {
        results.push({
          ingredientId: mapping.ingredientId,
          success: false,
          error: "Este ingrediente já recebeu um preço importado dessa mesma nota.",
        });
      } else if (code === "P2003" || code === "P2025") {
        results.push({ ingredientId: mapping.ingredientId, success: false, error: "Ingrediente não encontrado." });
      } else {
        results.push({ ingredientId: mapping.ingredientId, success: false, error: "Erro ao gravar o histórico de preço." });
      }
    }
  }

  return results;
}
