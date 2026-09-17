import { NextRequest } from "next/server";
import { ok, invalidBody, notFound, conflict, badRequest, internalError } from "@/lib/http/responses";
import {
  updatePublicQuoteItemQuantity,
  removePublicQuoteItem,
  OrderNotFoundError,
  QuoteNotEditableError,
  QuoteMinItemsError,
} from "@/lib/orderService";

interface UpdateQuantityBody {
  quantity: number;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; itemId: string }> },
) {
  const { token, itemId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("quantity" in body) ||
    typeof (body as UpdateQuantityBody).quantity !== "number" ||
    !Number.isFinite((body as UpdateQuantityBody).quantity) ||
    !Number.isInteger((body as UpdateQuantityBody).quantity) ||
    (body as UpdateQuantityBody).quantity <= 0
  ) {
    return invalidBody();
  }

  const { quantity } = body as UpdateQuantityBody;

  try {
    const quote = await updatePublicQuoteItemQuantity(token, itemId, quantity);
    return ok(quote);
  } catch (err) {
    if (err instanceof OrderNotFoundError) return notFound("Orçamento não encontrado.");
    if (err instanceof QuoteNotEditableError) {
      return conflict("QUOTE_NOT_EDITABLE", "Este orçamento não pode mais ser alterado.");
    }
    return internalError();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string; itemId: string }> },
) {
  const { token, itemId } = await params;

  try {
    const quote = await removePublicQuoteItem(token, itemId);
    return ok(quote);
  } catch (err) {
    if (err instanceof OrderNotFoundError) return notFound("Orçamento não encontrado.");
    if (err instanceof QuoteNotEditableError) {
      return conflict("QUOTE_NOT_EDITABLE", "Este orçamento não pode mais ser alterado.");
    }
    if (err instanceof QuoteMinItemsError) {
      return badRequest([
        { field: "itemId", code: "QUOTE_MIN_ITEMS", message: "O orçamento precisa ter ao menos um item." },
      ]);
    }
    return internalError();
  }
}
