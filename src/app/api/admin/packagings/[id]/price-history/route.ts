import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { getPackagingPriceHistory } from "@/lib/packagingPriceHistoryService";
import { getPackagingById, PackagingNotFoundError } from "@/lib/packagingService";

// Só leitura — mesmo padrão de /api/admin/ingredients/[id]/price-history. O
// registro é criado internamente por packagingService (create/update de
// Packaging), nunca diretamente via API — sem POST nesta rota.

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id } = await params;

  try {
    await getPackagingById(id);
    const history = await getPackagingPriceHistory(id);
    return ok(history);
  } catch (err) {
    if (err instanceof PackagingNotFoundError) return notFound("Embalagem não encontrada.");
    return internalError();
  }
}
