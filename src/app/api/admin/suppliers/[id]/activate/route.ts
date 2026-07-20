import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { activateSupplier, SupplierNotFoundError } from "@/lib/supplierService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const supplier = await activateSupplier(id);
    return ok(supplier);
  } catch (err) {
    if (err instanceof SupplierNotFoundError) return notFound("Fornecedor não encontrado.");
    return internalError();
  }
}
