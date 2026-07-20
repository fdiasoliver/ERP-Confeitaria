import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, badRequest, invalidBody, notFound, internalError } from "@/lib/http/responses";
import type { ProductCategoryInput } from "@/lib/types";
import { updateProductCategory, NotFoundError, ValidationFailedError } from "@/lib/productCategoryService";

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
    const input = body as Partial<Pick<ProductCategoryInput, "name" | "sortOrder" | "color" | "icon">>;
    const category = await updateProductCategory(id, input);
    return ok(category);
  } catch (err) {
    if (err instanceof NotFoundError) return notFound("Categoria não encontrada.");
    if (err instanceof ValidationFailedError) return badRequest(err.errors);
    return internalError();
  }
}
