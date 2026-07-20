import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { deactivateIngredient, IngredientNotFoundError } from "@/lib/ingredientService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const ingredient = await deactivateIngredient(id);
    return ok(ingredient);
  } catch (err) {
    if (err instanceof IngredientNotFoundError) return notFound("Ingrediente não encontrado.");
    return internalError();
  }
}
