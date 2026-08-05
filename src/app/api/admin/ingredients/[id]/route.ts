import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { IngredientInput } from "@/lib/validators/ingredientValidator";
import {
  updateIngredient,
  IngredientNotFoundError,
  IngredientValidationFailedError,
  DuplicateIngredientNameError,
  InvalidUnitReferenceError,
  InvalidCategoryReferenceError,
} from "@/lib/ingredientService";

export async function PATCH(
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
    const ingredient = await updateIngredient(id, body as Partial<IngredientInput>);
    return ok(ingredient);
  } catch (err) {
    if (err instanceof IngredientNotFoundError) return notFound("Ingrediente não encontrado.");
    if (err instanceof IngredientValidationFailedError) return badRequest(err.errors);
    if (err instanceof InvalidUnitReferenceError) return notFound("Unidade de medida não encontrada.");
    if (err instanceof InvalidCategoryReferenceError) return notFound("Categoria de ingrediente não encontrada.");
    if (err instanceof DuplicateIngredientNameError) {
      return conflict("DUPLICATE_NAME", `Já existe um ingrediente com o nome "${err.name}".`, { name: err.name });
    }
    return internalError();
  }
}
