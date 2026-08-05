import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, created, badRequest, invalidBody, conflict, notFound, internalError } from "@/lib/http/responses";
import type { RecipeInput } from "@/lib/validators/recipeValidator";
import {
  listRecipes,
  createRecipe,
  RecipeValidationFailedError,
  DuplicateRecipeNameError,
  InvalidIngredientReferenceError,
  InvalidUnitReferenceError,
  InactiveIngredientError,
  IncompatibleUnitError,
} from "@/lib/recipeService";

export async function GET() {
  const denied = await requireProductionChain();
  if (denied) return denied;

  try {
    const recipes = await listRecipes();
    return ok(recipes);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const recipe = await createRecipe(body as RecipeInput);
    return created(recipe);
  } catch (err) {
    if (err instanceof RecipeValidationFailedError) return badRequest(err.errors);
    if (err instanceof InvalidIngredientReferenceError) return notFound("Ingrediente não encontrado.");
    if (err instanceof InvalidUnitReferenceError) return notFound("Unidade de medida não encontrada.");
    if (err instanceof InactiveIngredientError) {
      return conflict("INACTIVE_INGREDIENT", err.message, { ingredientName: err.ingredientName });
    }
    if (err instanceof IncompatibleUnitError) return conflict("INCOMPATIBLE_UNIT", err.message);
    if (err instanceof DuplicateRecipeNameError) {
      return conflict("DUPLICATE_NAME", `Já existe uma receita com o nome "${err.name}".`, { name: err.name });
    }
    return internalError();
  }
}
