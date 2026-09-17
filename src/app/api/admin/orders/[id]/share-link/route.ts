import { NextRequest } from "next/server";
import { requireOrderAccess } from "@/lib/auth/requireOrderAccess";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { getOrCreateShareLink, OrderNotFoundError } from "@/lib/orderService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireOrderAccess();
  if (denied) return denied;

  const { id } = await params;

  try {
    const result = await getOrCreateShareLink(id);
    return ok(result);
  } catch (err) {
    if (err instanceof OrderNotFoundError) return notFound("Pedido não encontrado.");
    return internalError();
  }
}
