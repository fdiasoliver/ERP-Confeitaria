import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, badRequest, invalidBody, notFound, internalError } from "@/lib/http/responses";
import type { SalesChannelInput } from "@/lib/types";
import { updateSalesChannel, NotFoundError, ValidationFailedError } from "@/lib/salesChannelService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const input = body as Partial<Pick<SalesChannelInput, "name" | "sortOrder" | "color" | "icon">>;
    const channel = await updateSalesChannel(id, input);
    return ok(channel);
  } catch (err) {
    if (err instanceof NotFoundError) return notFound("Canal de venda não encontrado.");
    if (err instanceof ValidationFailedError) return badRequest(err.errors);
    return internalError();
  }
}
