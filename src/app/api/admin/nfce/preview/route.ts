import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, invalidBody, badRequest, internalError } from "@/lib/http/responses";
import { previewNfceImport, NfceFetchFailedError } from "@/lib/nfceImportService";

export async function POST(request: NextRequest) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  const qrCodeContent = (body as { qrCodeContent?: unknown })?.qrCodeContent;
  if (typeof qrCodeContent !== "string" || qrCodeContent.trim() === "") {
    return badRequest([{ field: "qrCodeContent", code: "REQUIRED", message: "Conteúdo do QR Code é obrigatório." }]);
  }

  try {
    const preview = await previewNfceImport(qrCodeContent);
    return ok(preview);
  } catch (err) {
    if (err instanceof NfceFetchFailedError) {
      return badRequest([{ field: "qrCodeContent", code: "NFCE_FETCH_FAILED", message: err.message }]);
    }
    return internalError();
  }
}
