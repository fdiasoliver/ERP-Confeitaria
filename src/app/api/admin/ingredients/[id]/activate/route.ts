import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { activateIngredient, IngredientNotFoundError } from "@/lib/ingredientService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id } = await params;

  try {
    const ingredient = await activateIngredient(id);
    return ok(ingredient);
  } catch (err) {
    if (err instanceof IngredientNotFoundError) return notFound("Ingrediente não encontrado.");
    return internalError();
  }
}
