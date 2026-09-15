import { NextRequest } from "next/server";
import { requireOrderAccess } from "@/lib/auth/requireOrderAccess";
import { ok, invalidBody, notFound, badRequest, internalError } from "@/lib/http/responses";
import {
  suggestReschedule,
  OrderNotFoundError,
  InvalidRescheduleStateError,
} from "@/lib/orderService";

interface RescheduleOrderBody {
  newDate: string;
}

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

  if (typeof body !== "object" || body === null || !("newDate" in body)) {
    return invalidBody();
  }

  const { newDate } = body as RescheduleOrderBody;
  const parsedDate = new Date(newDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return invalidBody();
  }

  try {
    const order = await suggestReschedule(id, parsedDate);
    return ok(order);
  } catch (err) {
    if (err instanceof OrderNotFoundError) return notFound("Pedido não encontrado.");
    if (err instanceof InvalidRescheduleStateError) {
      return badRequest([{ field: "orderId", code: "INVALID_RESCHEDULE_STATE", message: err.message }]);
    }
    return internalError();
  }
}
