import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { activateOccasion, NotFoundError } from "@/lib/occasionTagService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const occasion = await activateOccasion(id);
    return ok(occasion);
  } catch (err) {
    if (err instanceof NotFoundError) return notFound("Ocasião não encontrada.");
    return internalError();
  }
}
