import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { deactivateUnit, NotFoundError } from "@/lib/unitService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const unit = await deactivateUnit(id);
    return ok(unit);
  } catch (err) {
    if (err instanceof NotFoundError) return notFound("Unidade não encontrada.");
    return internalError();
  }
}
