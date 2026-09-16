import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { deactivateCustomer, CustomerNotFoundError } from "@/lib/customerService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireRole(["ADMIN", "ATENDIMENTO"]);
  if (denied) return denied;

  const { id } = await params;

  try {
    const customer = await deactivateCustomer(id);
    return ok(customer);
  } catch (err) {
    if (err instanceof CustomerNotFoundError) return notFound("Cliente não encontrado.");
    return internalError();
  }
}
