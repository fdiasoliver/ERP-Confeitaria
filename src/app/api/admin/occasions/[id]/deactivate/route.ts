import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, notFound, conflict, internalError } from "@/lib/http/responses";
import { deactivateOccasion, NotFoundError, OccasionHasProductsError } from "@/lib/occasionTagService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const occasion = await deactivateOccasion(id);
    return ok(occasion);
  } catch (err) {
    if (err instanceof NotFoundError) return notFound("Ocasião não encontrada.");
    if (err instanceof OccasionHasProductsError) {
      return conflict(
        "OCCASION_HAS_PRODUCTS",
        `A ocasião possui ${err.count} produto(s) vinculado(s). Mova ou inative os produtos antes de desativar.`,
        { count: err.count },
      );
    }
    return internalError();
  }
}
