import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { IngredientCategoryInput } from "@/lib/validators/ingredientCategoryValidator";
import {
  updateIngredientCategory,
  deleteIngredientCategory,
  IngredientCategoryNotFoundError,
  IngredientCategoryValidationFailedError,
  DuplicateIngredientCategoryNameError,
  IngredientCategoryHasIngredientsError,
} from "@/lib/ingredientCategoryService";

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
    const category = await updateIngredientCategory(id, body as Partial<IngredientCategoryInput>);
    return ok(category);
  } catch (err) {
    if (err instanceof IngredientCategoryNotFoundError) return notFound("Categoria não encontrada.");
    if (err instanceof IngredientCategoryValidationFailedError) return badRequest(err.errors);
    if (err instanceof DuplicateIngredientCategoryNameError) {
      return conflict("DUPLICATE_NAME", `Já existe uma categoria com o nome "${err.name}".`, { name: err.name });
    }
    return internalError();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    await deleteIngredientCategory(id);
    return ok({ id });
  } catch (err) {
    if (err instanceof IngredientCategoryNotFoundError) return notFound("Categoria não encontrada.");
    if (err instanceof IngredientCategoryHasIngredientsError) {
      return conflict(
        "CATEGORY_HAS_INGREDIENTS",
        `Categoria possui ${err.count} ingrediente(s) vinculado(s) e não pode ser excluída.`,
        { count: err.count },
      );
    }
    return internalError();
  }
}
