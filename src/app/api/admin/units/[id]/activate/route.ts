import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { activateUnit, NotFoundError } from "@/lib/unitService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id } = await params;

  try {
    const unit = await activateUnit(id);
    return ok(unit);
  } catch (err) {
    if (err instanceof NotFoundError) return notFound("Unidade não encontrada.");
    return internalError();
  }
}
