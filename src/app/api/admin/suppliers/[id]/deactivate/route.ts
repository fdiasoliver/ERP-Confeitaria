import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { deactivateSupplier, SupplierNotFoundError } from "@/lib/supplierService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id } = await params;

  try {
    const supplier = await deactivateSupplier(id);
    return ok(supplier);
  } catch (err) {
    if (err instanceof SupplierNotFoundError) return notFound("Fornecedor não encontrado.");
    return internalError();
  }
}
