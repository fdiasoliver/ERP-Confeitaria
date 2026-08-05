import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { PackagingInput } from "@/lib/validators/packagingValidator";
import {
  getPackagingById,
  updatePackaging,
  PackagingNotFoundError,
  PackagingValidationFailedError,
  DuplicatePackagingNameError,
  InvalidPackagingCategoryReferenceError,
  InvalidSupplierReferenceError,
} from "@/lib/packagingService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id } = await params;

  try {
    const packaging = await getPackagingById(id);
    return ok(packaging);
  } catch (err) {
    if (err instanceof PackagingNotFoundError) return notFound("Embalagem não encontrada.");
    return internalError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const packaging = await updatePackaging(id, body as Partial<PackagingInput>);
    return ok(packaging);
  } catch (err) {
    if (err instanceof PackagingNotFoundError) return notFound("Embalagem não encontrada.");
    if (err instanceof PackagingValidationFailedError) return badRequest(err.errors);
    if (err instanceof InvalidPackagingCategoryReferenceError) return notFound("Categoria de embalagem não encontrada.");
    if (err instanceof InvalidSupplierReferenceError) return notFound("Fornecedor não encontrado.");
    if (err instanceof DuplicatePackagingNameError) {
      return conflict("DUPLICATE_NAME", `Já existe uma embalagem com o nome "${err.name}".`, { name: err.name });
    }
    return internalError();
  }
}
