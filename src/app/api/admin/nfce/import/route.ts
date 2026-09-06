import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, invalidBody, badRequest, internalError } from "@/lib/http/responses";
import { importNfceItems, type NfceImportMapping } from "@/lib/nfceImportService";

interface ImportBody {
  accessKey?: unknown;
  mappings?: unknown;
}

export async function POST(request: NextRequest) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  let body: ImportBody;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  if (typeof body.accessKey !== "string" || !/^\d{44}$/.test(body.accessKey)) {
    return badRequest([{ field: "accessKey", code: "INVALID_VALUE", message: "Chave de acesso inválida." }]);
  }
  if (!Array.isArray(body.mappings) || body.mappings.length === 0) {
    return badRequest([{ field: "mappings", code: "REQUIRED", message: "Ao menos um item deve ser vinculado a um ingrediente." }]);
  }

  const mappings = body.mappings as NfceImportMapping[];

  try {
    const results = await importNfceItems(body.accessKey, mappings);
    return ok(results);
  } catch {
    return internalError();
  }
}
