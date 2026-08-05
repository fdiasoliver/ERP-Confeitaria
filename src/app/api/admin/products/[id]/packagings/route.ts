import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, created, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import {
  listProductPackagings,
  addProductPackaging,
  InvalidProductReferenceError,
  InvalidPackagingReferenceError,
  InactivePackagingError,
  DuplicatePackagingInProductError,
  ProductPackagingValidationFailedError,
} from "@/lib/productPackagingService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const packagings = await listProductPackagings(id);
    return ok(packagings);
  } catch (err) {
    if (err instanceof InvalidProductReferenceError) return notFound("Produto não encontrado.");
    return internalError();
  }
}

export async function POST(
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
    const link = await addProductPackaging(id, body as { packagingId: string; quantity: number });
    return created(link);
  } catch (err) {
    if (err instanceof InvalidProductReferenceError) return notFound("Produto não encontrado.");
    if (err instanceof ProductPackagingValidationFailedError) return badRequest(err.errors);
    if (err instanceof InvalidPackagingReferenceError) return notFound("Embalagem não encontrada.");
    if (err instanceof InactivePackagingError) {
      return conflict("INACTIVE_PACKAGING", err.message, { packagingName: err.packagingName });
    }
    if (err instanceof DuplicatePackagingInProductError) {
      return conflict("DUPLICATE_PACKAGING", err.message, { packagingId: err.packagingId });
    }
    return internalError();
  }
}
