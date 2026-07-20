import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, created, badRequest, invalidBody, conflict, notFound, internalError } from "@/lib/http/responses";
import type { IngredientInput } from "@/lib/validators/ingredientValidator";
import {
  listAllIngredients,
  createIngredient,
  IngredientValidationFailedError,
  DuplicateIngredientNameError,
  InvalidUnitReferenceError,
  InvalidCategoryReferenceError,
} from "@/lib/ingredientService";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const ingredients = await listAllIngredients();
    return ok(ingredients);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const ingredient = await createIngredient(body as IngredientInput);
    return created(ingredient);
  } catch (err) {
    if (err instanceof IngredientValidationFailedError) return badRequest(err.errors);
    if (err instanceof InvalidUnitReferenceError) return notFound("Unidade de medida não encontrada.");
    if (err instanceof InvalidCategoryReferenceError) return notFound("Categoria de ingrediente não encontrada.");
    if (err instanceof DuplicateIngredientNameError) {
      return conflict("DUPLICATE_NAME", `Já existe um ingrediente com o nome "${err.name}".`, { name: err.name });
    }
    return internalError();
  }
}
