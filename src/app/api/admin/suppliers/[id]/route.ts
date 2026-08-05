import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { SupplierInput } from "@/lib/validators/supplierValidator";
import {
  getSupplierById,
  updateSupplier,
  SupplierNotFoundError,
  SupplierValidationFailedError,
  DuplicateCnpjError,
} from "@/lib/supplierService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id } = await params;

  try {
    const supplier = await getSupplierById(id);
    return ok(supplier);
  } catch (err) {
    if (err instanceof SupplierNotFoundError) return notFound("Fornecedor não encontrado.");
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
    const supplier = await updateSupplier(id, body as Partial<SupplierInput>);
    return ok(supplier);
  } catch (err) {
    if (err instanceof SupplierNotFoundError) return notFound("Fornecedor não encontrado.");
    if (err instanceof SupplierValidationFailedError) return badRequest(err.errors);
    if (err instanceof DuplicateCnpjError) {
      return conflict("DUPLICATE_CNPJ", err.message, { cnpj: err.cnpj });
    }
    return internalError();
  }
}
