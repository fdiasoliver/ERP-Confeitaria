import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/requireCustomer";
import { ok, invalidBody, notFound, forbidden, badRequest, internalError } from "@/lib/http/responses";
import {
  respondToReschedule,
  OrderNotFoundError,
  InvalidRescheduleStateError,
  CustomerPhoneMismatchError,
} from "@/lib/orderService";

interface RescheduleResponseBody {
  response: "ACEITO" | "RECUSADO";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;
  const { phone } = auth;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("response" in body) ||
    ((body as RescheduleResponseBody).response !== "ACEITO" && (body as RescheduleResponseBody).response !== "RECUSADO")
  ) {
    return invalidBody();
  }

  const { response } = body as RescheduleResponseBody;

  try {
    const order = await respondToReschedule(id, phone, response);
    return ok(order);
  } catch (err) {
    if (err instanceof OrderNotFoundError) return notFound("Pedido não encontrado.");
    if (err instanceof CustomerPhoneMismatchError) return forbidden();
    if (err instanceof InvalidRescheduleStateError) {
      return badRequest([{ field: "orderId", code: "INVALID_RESCHEDULE_STATE", message: err.message }]);
    }
    return internalError();
  }
}
