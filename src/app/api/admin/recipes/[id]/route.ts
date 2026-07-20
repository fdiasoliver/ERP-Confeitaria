import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { RecipeInput } from "@/lib/validators/recipeValidator";
import {
  getRecipeById,
  updateRecipe,
  RecipeNotFoundError,
  RecipeValidationFailedError,
  DuplicateRecipeNameError,
} from "@/lib/recipeService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const recipe = await getRecipeById(id);
    return ok(recipe);
  } catch (err) {
    if (err instanceof RecipeNotFoundError) return notFound("Receita não encontrada.");
    return internalError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const recipe = await updateRecipe(id, body as Partial<Omit<RecipeInput, "items">>);
    return ok(recipe);
  } catch (err) {
    if (err instanceof RecipeNotFoundError) return notFound("Receita não encontrada.");
    if (err instanceof RecipeValidationFailedError) return badRequest(err.errors);
    if (err instanceof DuplicateRecipeNameError) {
      return conflict("DUPLICATE_NAME", `Já existe uma receita com o nome "${err.name}".`, { name: err.name });
    }
    return internalError();
  }
}
