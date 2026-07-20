import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { deactivateProduct, ProductNotFoundError } from "@/lib/productService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const product = await deactivateProduct(id);
    return ok(product);
  } catch (err) {
    if (err instanceof ProductNotFoundError) return notFound("Produto não encontrado.");
    return internalError();
  }
}
