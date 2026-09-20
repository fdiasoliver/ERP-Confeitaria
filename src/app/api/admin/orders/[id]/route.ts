import { NextRequest } from "next/server";
import { requireOrderAccess } from "@/lib/auth/requireOrderAccess";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import { CustomerNotFoundError } from "@/lib/customerService";
import {
  updateOrder,
  OrderNotFoundError,
  OrderValidationFailedError,
  OrderInvalidAddressError,
  QuoteNotEditableError,
  type CreateOrderInput,
} from "@/lib/orderService";

// Editor completo de orçamento (itens + data + entrega + pagamento) — só
// PATCH; não existe DELETE aqui (excluir um orçamento é "Cancelar", que já
// muda o status, ver PATCH .../status). Ver updateOrder em orderService.ts.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireOrderAccess();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const result = await updateOrder(id, body as CreateOrderInput);
    return ok(result);
  } catch (err) {
    if (err instanceof OrderValidationFailedError) return badRequest(err.errors);
    if (err instanceof OrderInvalidAddressError) {
      return badRequest([{ field: "addressId", code: "INVALID_ADDRESS", message: err.message }]);
    }
    if (err instanceof OrderNotFoundError) return notFound("Pedido não encontrado.");
    if (err instanceof CustomerNotFoundError) return notFound("Cliente não encontrado.");
    if (err instanceof QuoteNotEditableError) {
      return conflict("QUOTE_NOT_EDITABLE", err.message);
    }
    return internalError();
  }
}
