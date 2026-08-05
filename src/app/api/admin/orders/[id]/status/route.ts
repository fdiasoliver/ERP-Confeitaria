import { NextRequest } from "next/server";
import { requireOrderAccess } from "@/lib/auth/requireOrderAccess";
import { ok, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { OrderStatus } from "@/lib/types";
import {
  updateOrderStatus,
  OrderNotFoundError,
  InvalidStatusTransitionError,
} from "@/lib/orderService";

interface UpdateOrderStatusBody {
  status: OrderStatus;
  notes?: string;
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

  if (typeof body !== "object" || body === null || !("status" in body)) {
    return invalidBody();
  }

  const { status, notes } = body as UpdateOrderStatusBody;

  try {
    const order = await updateOrderStatus(id, status, notes);
    return ok(order);
  } catch (err) {
    if (err instanceof OrderNotFoundError) return notFound("Pedido não encontrado.");
    if (err instanceof InvalidStatusTransitionError) {
      return conflict(
        "INVALID_STATUS_TRANSITION",
        err.message,
        { from: err.from, to: err.to },
      );
    }
    return internalError();
  }
}
