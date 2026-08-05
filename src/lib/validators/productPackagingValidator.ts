import type { ValidationError } from "@/lib/types";

// validateProductPackagingsList (Sprint 2.H.2) espelha ProductRecipeInput/
// validateRecipeLink/validateRecipesList de productValidator.ts — útil se uma
// futura extensão de productService.ts adotar substituição em lote (mesmo padrão
// de ProductRecipe). validateProductPackagingItem/-Update (Sprint 2.H.3) espelham
// validateRecipeItemInput/validateRecipeItemUpdate de recipeValidator.ts — usados
// por productPackagingService.ts, que expõe operações item a item (adicionar/
// atualizar quantidade/remover uma embalagem por vez), decisão justificada no
// relatório da Sprint 2.H.3 (Fase 1/2: repository de junção já dedicado, mesmo
// padrão de RecipeIngredient, com precedente real de rota aninhada por item —
// /api/admin/recipes/[id]/items/[itemId]). As duas formas de validação coexistem
// porque a Sprint 2.H.3 não decide, sozinha, como uma futura Sprint 2.H.4 (API)
// vai expor a escrita — ambas ficam disponíveis.

export interface ProductPackagingInput {
  packagingId: string;
  quantity: number;
}

function validateLink(item: ProductPackagingInput, index: number, errors: ValidationError[]): void {
  const prefix = `packagings[${index}]`;
  if (!item.packagingId || item.packagingId.trim().length === 0) {
    errors.push({ field: `${prefix}.packagingId`, code: "REQUIRED", message: "Embalagem é obrigatória." });
  }
  if (item.quantity === undefined || item.quantity === null || Number.isNaN(item.quantity)) {
    errors.push({ field: `${prefix}.quantity`, code: "REQUIRED", message: "Quantidade é obrigatória." });
  } else if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
    errors.push({ field: `${prefix}.quantity`, code: "INVALID_VALUE", message: "Quantidade deve ser um número inteiro maior que zero." });
  }
}

export function validateProductPackagingsList(
  items: ProductPackagingInput[] | undefined,
  errors: ValidationError[],
): void {
  if (!items) return;
  items.forEach((item, index) => validateLink(item, index, errors));

  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of items) {
    if (item.packagingId && seen.has(item.packagingId)) duplicates.add(item.packagingId);
    if (item.packagingId) seen.add(item.packagingId);
  }
  if (duplicates.size > 0) {
    errors.push({ field: "packagings", code: "DUPLICATE_PACKAGING", message: "O produto não pode ter a mesma embalagem repetida." });
  }
}

// ─── Validação item a item (Sprint 2.H.3 — productPackagingService.ts) ────────

export interface ProductPackagingItemInput {
  packagingId: string;
  quantity: number;
}

export function validateProductPackagingItem(input: ProductPackagingItemInput): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!input.packagingId || input.packagingId.trim().length === 0) {
    errors.push({ field: "packagingId", code: "REQUIRED", message: "Embalagem é obrigatória." });
  }
  if (input.quantity === undefined || input.quantity === null || Number.isNaN(input.quantity)) {
    errors.push({ field: "quantity", code: "REQUIRED", message: "Quantidade é obrigatória." });
  } else if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    errors.push({ field: "quantity", code: "INVALID_VALUE", message: "Quantidade deve ser um número inteiro maior que zero." });
  }
  return errors;
}

export function validateProductPackagingItemUpdate(input: { quantity?: number }): ValidationError[] {
  const errors: ValidationError[] = [];
  if (input.quantity !== undefined) {
    if (input.quantity === null || Number.isNaN(input.quantity)) {
      errors.push({ field: "quantity", code: "REQUIRED", message: "Quantidade não pode ser vazia." });
    } else if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      errors.push({ field: "quantity", code: "INVALID_VALUE", message: "Quantidade deve ser um número inteiro maior que zero." });
    }
  }
  return errors;
}
