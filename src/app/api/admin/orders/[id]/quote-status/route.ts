import { NextRequest } from "next/server";
import { requireOrderAccess } from "@/lib/auth/requireOrderAccess";
import { ok, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import { decideQuote, OrderNotFoundError, InvalidQuoteTransitionError } from "@/lib/orderService";

interface QuoteStatusBody {
  quoteStatus: "APROVADO" | "RECUSADO";
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

  if (
    typeof body !== "object" ||
    body === null ||
    !("quoteStatus" in body) ||
    ((body as QuoteStatusBody).quoteStatus !== "APROVADO" &&
      (body as QuoteStatusBody).quoteStatus !== "RECUSADO")
  ) {
    return invalidBody();
  }

  const { quoteStatus } = body as QuoteStatusBody;

  try {
    const order = await decideQuote("ADMIN", id, quoteStatus);
    return ok(order);
  } catch (err) {
    if (err instanceof OrderNotFoundError) return notFound("Pedido não encontrado.");
    if (err instanceof InvalidQuoteTransitionError) {
      return conflict(
        "INVALID_QUOTE_TRANSITION",
        err.message,
        { from: err.from, to: err.to },
      );
    }
    return internalError();
  }
}
