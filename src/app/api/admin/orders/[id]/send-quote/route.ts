import { NextRequest } from "next/server";
import { requireOrderAccess } from "@/lib/auth/requireOrderAccess";
import { ok, notFound, badRequest, internalError } from "@/lib/http/responses";
import { sendQuote, OrderNotFoundError, CustomerHasNoPhoneError } from "@/lib/orderService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireOrderAccess();
  if (denied) return denied;

  const { id } = await params;

  try {
    const order = await sendQuote(id);
    return ok(order);
  } catch (err) {
    if (err instanceof OrderNotFoundError) return notFound("Pedido não encontrado.");
    if (err instanceof CustomerHasNoPhoneError) {
      return badRequest([
        {
          field: "customerId",
          code: "CUSTOMER_HAS_NO_PHONE",
          message: "Cliente não tem telefone cadastrado.",
        },
      ]);
    }
    return internalError();
  }
}
