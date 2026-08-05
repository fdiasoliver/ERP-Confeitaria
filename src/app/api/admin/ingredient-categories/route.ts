import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, created, badRequest, invalidBody, conflict, internalError } from "@/lib/http/responses";
import type { IngredientCategoryInput } from "@/lib/validators/ingredientCategoryValidator";
import {
  listAllIngredientCategoriesService,
  createIngredientCategory,
  IngredientCategoryValidationFailedError,
  DuplicateIngredientCategoryNameError,
} from "@/lib/ingredientCategoryService";

export async function GET() {
  const denied = await requireProductionChain();
  if (denied) return denied;

  try {
    const categories = await listAllIngredientCategoriesService();
    return ok(categories);
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
    const category = await createIngredientCategory(body as IngredientCategoryInput);
    return created(category);
  } catch (err) {
    if (err instanceof IngredientCategoryValidationFailedError) return badRequest(err.errors);
    if (err instanceof DuplicateIngredientCategoryNameError) {
      return conflict("DUPLICATE_NAME", `Já existe uma categoria com o nome "${err.name}".`, { name: err.name });
    }
    return internalError();
  }
}
