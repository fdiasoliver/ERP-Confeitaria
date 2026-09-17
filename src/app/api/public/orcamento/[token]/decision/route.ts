import { NextRequest } from "next/server";
import { ok, invalidBody, notFound, forbidden, conflict, internalError } from "@/lib/http/responses";
import {
  decideQuote,
  getPublicQuote,
  resolveOrderIdByShareToken,
  OrderNotFoundError,
  QuoteConfirmationMismatchError,
  InvalidQuoteTransitionError,
} from "@/lib/orderService";

interface DecisionBody {
  decision: "APROVADO" | "RECUSADO";
  last4: string;
}

function isValidBody(body: unknown): body is DecisionBody {
  if (typeof body !== "object" || body === null) return false;
  const { decision, last4 } = body as Partial<DecisionBody>;
  if (decision !== "APROVADO" && decision !== "RECUSADO") return false;
  if (typeof last4 !== "string" || !/^\d{4}$/.test(last4)) return false;
  return true;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  if (!isValidBody(body)) return invalidBody();

  const { decision, last4 } = body;

  try {
    const orderId = await resolveOrderIdByShareToken(token);
    await decideQuote("PUBLIC_TOKEN", orderId, decision, { last4 });
    // Nunca retorna o OrderDTO de decideQuote (uso administrativo) a um
    // chamador que só possui o token — reconsulta o DTO minimizado, mesmo
    // princípio de getPublicQuote/mapPublicQuoteDTO em orderService.ts.
    const quote = await getPublicQuote(token);
    return ok(quote);
  } catch (err) {
    if (err instanceof OrderNotFoundError) return notFound("Orçamento não encontrado.");
    if (err instanceof QuoteConfirmationMismatchError) return forbidden();
    if (err instanceof InvalidQuoteTransitionError) {
      return conflict("INVALID_QUOTE_TRANSITION", err.message, { from: err.from, to: err.to });
    }
    return internalError();
  }
}
