import type { ValidationError } from "@/lib/types";

export interface PackagingPriceHistoryInput {
  packagingId: string;
  price: number;
  notes?: string | null;
}

// Só validação estrutural — registro é imutável (nunca atualizado/deletado, mesma
// regra de IngredientPriceHistory), por isso não existe validatePackagingPriceHistoryUpdate.

export function validatePackagingPriceHistoryCreate(input: PackagingPriceHistoryInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.packagingId || input.packagingId.trim() === "") {
    errors.push({ field: "packagingId", code: "REQUIRED", message: "Embalagem é obrigatória." });
  }

  if (input.price === undefined || input.price === null || Number.isNaN(input.price)) {
    errors.push({ field: "price", code: "REQUIRED", message: "Preço é obrigatório." });
  } else if (input.price < 0) {
    errors.push({ field: "price", code: "INVALID_VALUE", message: "Preço não pode ser negativo." });
  }

  if (input.notes !== undefined && input.notes !== null && input.notes.length > 500) {
    errors.push({ field: "notes", code: "MAX_LENGTH", message: "Observação deve ter no máximo 500 caracteres." });
  }

  return errors;
}
