import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, created, badRequest, invalidBody, conflict, internalError } from "@/lib/http/responses";
import type { ProductCategoryInput } from "@/lib/types";
import {
  listAllCategoriesWithCount,
  createProductCategory,
  ValidationFailedError,
  SlugConflictError,
  NameConflictError,
} from "@/lib/productCategoryService";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const categories = await listAllCategoriesWithCount();
    return ok(categories);
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
    const category = await createProductCategory(body as ProductCategoryInput);
    return created(category);
  } catch (err) {
    if (err instanceof ValidationFailedError) return badRequest(err.errors);
    if (err instanceof SlugConflictError) {
      return conflict("SLUG_CONFLICT", `Já existe uma categoria com o slug "${err.slug}".`, { slug: err.slug });
    }
    if (err instanceof NameConflictError) {
      return conflict("NAME_CONFLICT", err.message, { name: err.name });
    }
    return internalError();
  }
}
