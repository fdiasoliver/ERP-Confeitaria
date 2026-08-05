import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { listPackagingUsage, InvalidPackagingReferenceError } from "@/lib/productPackagingService";

// Painel "Usado em N produtos" — MODULE_2H_PLANNING.md Seção 6.3/Fase 4. Só
// leitura, sem precedente exato de rota nos módulos irmãos (o mais próximo,
// receitas/[id], mostra a direção inversa — ingredientes de uma receita).

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id } = await params;

  try {
    const usage = await listPackagingUsage(id);
    return ok(usage);
  } catch (err) {
    if (err instanceof InvalidPackagingReferenceError) return notFound("Embalagem não encontrada.");
    return internalError();
  }
}
