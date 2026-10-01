import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, internalError } from "@/lib/http/responses";
import { listRecipeProductMargins } from "@/lib/recipeMarginService";

// Margem/lucro por receita, a partir dos produtos que a usam — mapa
// recipeId → produtos. Mesmo papel das demais rotas de Receitas (ADMIN +
// PRODUCAO), que não têm acesso à API de Produtos.
export async function GET() {
  const denied = await requireProductionChain();
  if (denied) return denied;

  try {
    return ok(await listRecipeProductMargins());
  } catch {
    return internalError();
  }
}
