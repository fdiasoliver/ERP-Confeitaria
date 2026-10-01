import type { RecipeProductMarginDTO } from "@/lib/types";
import { listProducts } from "@/lib/productService";

// ─── Margem e lucro por receita (01/10/2026) ───────────────────────────────────
// Receita não tem preço de venda — a margem e o lucro de uma receita são os dos
// produtos que a usam (decisão do Product Owner): para cada Produto vinculado
// via ProductRecipe, mesmos números de "Margem real" de /admin/produtos/[id]
// (preço praticado − custo de ingredientes + embalagens). Serviço próprio, e
// não dentro de recipeService.ts, porque productService já importa
// recipeService (evita import circular).

export async function listRecipeProductMargins(): Promise<Record<string, RecipeProductMarginDTO[]>> {
  const products = await listProducts();
  const byRecipe: Record<string, RecipeProductMarginDTO[]> = {};
  for (const product of products) {
    for (const link of product.recipes) {
      (byRecipe[link.recipeId] ??= []).push({
        productId: product.id,
        productName: product.name,
        active: product.active,
        recipeQuantity: link.quantity,
        basePrice: product.basePrice,
        costPrice: product.costPrice,
        margin: product.margin,
        profit: product.basePrice - product.costPrice,
      });
    }
  }
  for (const list of Object.values(byRecipe)) {
    list.sort((a, b) => a.productName.localeCompare(b.productName, "pt-BR"));
  }
  return byRecipe;
}
