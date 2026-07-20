import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { activateProductCategory, NotFoundError } from "@/lib/productCategoryService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const category = await activateProductCategory(id);
    return ok(category);
  } catch (err) {
    if (err instanceof NotFoundError) return notFound("Categoria não encontrada.");
    return internalError();
  }
}
