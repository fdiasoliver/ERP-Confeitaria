import { NextRequest } from "next/server";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { getPublicQuote, OrderNotFoundError } from "@/lib/orderService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  try {
    const quote = await getPublicQuote(token);
    return ok(quote);
  } catch (err) {
    if (err instanceof OrderNotFoundError) return notFound("Orçamento não encontrado.");
    return internalError();
  }
}
