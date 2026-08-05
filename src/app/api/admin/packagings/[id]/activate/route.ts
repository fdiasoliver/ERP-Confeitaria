import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { activatePackaging, PackagingNotFoundError } from "@/lib/packagingService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id } = await params;

  try {
    const packaging = await activatePackaging(id);
    return ok(packaging);
  } catch (err) {
    if (err instanceof PackagingNotFoundError) return notFound("Embalagem não encontrada.");
    return internalError();
  }
}
