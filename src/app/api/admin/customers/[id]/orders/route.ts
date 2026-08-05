import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { getCustomerById, CustomerNotFoundError } from "@/lib/customerService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireRole(["ADMIN", "ATENDIMENTO"]);
  if (denied) return denied;

  const { id } = await params;

  try {
    const customer = await getCustomerById(id);
    return ok(customer.orders);
  } catch (err) {
    if (err instanceof CustomerNotFoundError) return notFound("Cliente não encontrado.");
    return internalError();
  }
}
