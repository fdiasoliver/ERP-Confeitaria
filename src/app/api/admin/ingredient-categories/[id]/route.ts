import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { IngredientCategoryInput } from "@/lib/validators/ingredientCategoryValidator";
import {
  updateIngredientCategory,
  deleteIngredientCategory,
  IngredientCategoryNotFoundError,
  IngredientCategoryValidationFailedError,
  DuplicateIngredientCategoryNameError,
  IngredientCategoryHasIngredientsError,
  InvalidTransferTargetError,
} from "@/lib/ingredientCategoryService";

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id } = await params;
  // ?transferTo=<id> move os itens vinculados para outra categoria;
  // ?transferTo=none deixa-os sem categoria; ausente = exclusão sem transferência.
  const rawTransfer = request.nextUrl.searchParams.get("transferTo");
  const transferTo = rawTransfer === null ? undefined : rawTransfer === "none" ? null : rawTransfer;

  try {
    await deleteIngredientCategory(id, transferTo);
    return ok({ id });
  } catch (err) {
    if (err instanceof IngredientCategoryNotFoundError) return notFound("Categoria não encontrada.");
    if (err instanceof InvalidTransferTargetError) {
      return badRequest([{ field: "transferTo", code: "INVALID_TARGET", message: err.message }]);
    }
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
