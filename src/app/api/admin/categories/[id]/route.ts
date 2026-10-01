import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { ProductCategoryInput } from "@/lib/types";
import {
  updateProductCategory,
  deleteProductCategory,
  NotFoundError,
  ValidationFailedError,
  CategoryInUseError,
  InvalidTransferTargetError,
} from "@/lib/productCategoryService";

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

// Exclusão (01/10/2026): com produtos vinculados exige ?transferTo=<id da
// categoria ativa de destino> — produtos e despesas são movidos na mesma
// transação. Sem produtos, exclui direto.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const transferTo = request.nextUrl.searchParams.get("transferTo") ?? undefined;

  try {
    await deleteProductCategory(id, transferTo);
    return ok({ id });
  } catch (err) {
    if (err instanceof NotFoundError) return notFound("Categoria não encontrada.");
    if (err instanceof CategoryInUseError) {
      return conflict("CATEGORY_HAS_PRODUCTS", err.message, { count: err.count });
    }
    if (err instanceof InvalidTransferTargetError) {
      return badRequest([{ field: "transferTo", code: "INVALID_TARGET", message: err.message }]);
    }
    return internalError();
  }
}
