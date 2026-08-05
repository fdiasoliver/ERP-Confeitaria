import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import {
  updateRecipeItem,
  removeRecipeItem,
  RecipeNotFoundError,
  RecipeItemNotFoundError,
  RecipeValidationFailedError,
  InvalidUnitReferenceError,
  IncompatibleUnitError,
  LastItemRemovalError,
} from "@/lib/recipeService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id, itemId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const recipe = await updateRecipeItem(id, itemId, body as { quantity?: number; unitId?: string });
    return ok(recipe);
  } catch (err) {
    if (err instanceof RecipeNotFoundError) return notFound("Receita não encontrada.");
    if (err instanceof RecipeItemNotFoundError) return notFound("Item da receita não encontrado.");
    if (err instanceof RecipeValidationFailedError) return badRequest(err.errors);
    if (err instanceof InvalidUnitReferenceError) return notFound("Unidade de medida não encontrada.");
    if (err instanceof IncompatibleUnitError) return conflict("INCOMPATIBLE_UNIT", err.message);
    return internalError();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id, itemId } = await params;

  try {
    const recipe = await removeRecipeItem(id, itemId);
    return ok(recipe);
  } catch (err) {
    if (err instanceof RecipeNotFoundError) return notFound("Receita não encontrada.");
    if (err instanceof RecipeItemNotFoundError) return notFound("Item da receita não encontrado.");
    if (err instanceof LastItemRemovalError) return conflict("LAST_ITEM", err.message);
    return internalError();
  }
}
