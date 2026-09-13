import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { deactivateSalesChannel, NotFoundError } from "@/lib/salesChannelService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const channel = await deactivateSalesChannel(id);
    return ok(channel);
  } catch (err) {
    if (err instanceof NotFoundError) return notFound("Canal de venda não encontrado.");
    return internalError();
  }
}
