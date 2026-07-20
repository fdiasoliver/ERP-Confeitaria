import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { activateRecipe, RecipeNotFoundError } from "@/lib/recipeService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const recipe = await activateRecipe(id);
    return ok(recipe);
  } catch (err) {
    if (err instanceof RecipeNotFoundError) return notFound("Receita não encontrada.");
    return internalError();
  }
}
