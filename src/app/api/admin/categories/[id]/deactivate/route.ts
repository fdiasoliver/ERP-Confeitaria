import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, notFound, conflict, internalError } from "@/lib/http/responses";
import { deactivateProductCategory, NotFoundError, CategoryHasProductsError } from "@/lib/productCategoryService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const category = await deactivateProductCategory(id);
    return ok(category);
  } catch (err) {
    if (err instanceof NotFoundError) return notFound("Categoria não encontrada.");
    if (err instanceof CategoryHasProductsError) {
      return conflict(
        "CATEGORY_HAS_PRODUCTS",
        `A categoria possui ${err.count} produto(s) vinculado(s). Mova ou inative os produtos antes de desativar.`,
        { count: err.count },
      );
    }
    return internalError();
  }
}
