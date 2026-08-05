import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { created, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { RecipeItemInput } from "@/lib/validators/recipeValidator";
import {
  addRecipeItem,
  RecipeNotFoundError,
  RecipeValidationFailedError,
  InvalidIngredientReferenceError,
  InvalidUnitReferenceError,
  InactiveIngredientError,
  IncompatibleUnitError,
  DuplicateIngredientInRecipeError,
} from "@/lib/recipeService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const recipe = await addRecipeItem(id, body as RecipeItemInput);
    return created(recipe);
  } catch (err) {
    if (err instanceof RecipeNotFoundError) return notFound("Receita não encontrada.");
    if (err instanceof RecipeValidationFailedError) return badRequest(err.errors);
    if (err instanceof InvalidIngredientReferenceError) return notFound("Ingrediente não encontrado.");
    if (err instanceof InvalidUnitReferenceError) return notFound("Unidade de medida não encontrada.");
    if (err instanceof InactiveIngredientError) {
      return conflict("INACTIVE_INGREDIENT", err.message, { ingredientName: err.ingredientName });
    }
    if (err instanceof IncompatibleUnitError) return conflict("INCOMPATIBLE_UNIT", err.message);
    if (err instanceof DuplicateIngredientInRecipeError) {
      return conflict("DUPLICATE_INGREDIENT", err.message, { ingredientId: err.ingredientId });
    }
    return internalError();
  }
}
