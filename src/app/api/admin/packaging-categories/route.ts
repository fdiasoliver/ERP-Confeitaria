import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, created, badRequest, invalidBody, conflict, internalError } from "@/lib/http/responses";
import type { PackagingCategoryInput } from "@/lib/validators/packagingCategoryValidator";
import {
  listAllPackagingCategoriesService,
  createPackagingCategory,
  PackagingCategoryValidationFailedError,
  DuplicatePackagingCategoryNameError,
} from "@/lib/packagingCategoryService";

export async function GET() {
  const denied = await requireProductionChain();
  if (denied) return denied;

  try {
    const categories = await listAllPackagingCategoriesService();
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
    const category = await createPackagingCategory(body as PackagingCategoryInput);
    return created(category);
  } catch (err) {
    if (err instanceof PackagingCategoryValidationFailedError) return badRequest(err.errors);
    if (err instanceof DuplicatePackagingCategoryNameError) {
      return conflict("DUPLICATE_NAME", `Já existe uma categoria de embalagem com o nome "${err.name}".`, { name: err.name });
    }
    return internalError();
  }
}
