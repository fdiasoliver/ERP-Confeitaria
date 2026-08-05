import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, badRequest, invalidBody, notFound, internalError } from "@/lib/http/responses";
import {
  updateProductPackagingQuantity,
  removeProductPackaging,
  InvalidProductReferenceError,
  ProductPackagingNotFoundError,
  ProductPackagingValidationFailedError,
} from "@/lib/productPackagingService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, linkId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const link = await updateProductPackagingQuantity(id, linkId, body as { quantity?: number });
    return ok(link);
  } catch (err) {
    if (err instanceof InvalidProductReferenceError) return notFound("Produto não encontrado.");
    if (err instanceof ProductPackagingNotFoundError) return notFound("Vínculo de embalagem não encontrado.");
    if (err instanceof ProductPackagingValidationFailedError) return badRequest(err.errors);
    return internalError();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, linkId } = await params;

  try {
    await removeProductPackaging(id, linkId);
    return ok({ id: linkId });
  } catch (err) {
    if (err instanceof InvalidProductReferenceError) return notFound("Produto não encontrado.");
    if (err instanceof ProductPackagingNotFoundError) return notFound("Vínculo de embalagem não encontrado.");
    return internalError();
  }
}
