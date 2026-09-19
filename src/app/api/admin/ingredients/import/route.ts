import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, badRequest, internalError } from "@/lib/http/responses";
import { importIngredientsFromXlsx } from "@/lib/ingredientImportService";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = [".xlsx"];

export async function POST(request: Request) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return badRequest([{ field: "file", code: "INVALID_BODY", message: "Falha ao ler os dados do arquivo." }]);
  }

  const file = formData.get("file") as File | null;

  if (!file || !(file instanceof File)) {
    return badRequest([{ field: "file", code: "REQUIRED", message: "Nenhum arquivo enviado." }]);
  }
  if (!ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))) {
    return badRequest([{ field: "file", code: "INVALID_FORMAT", message: "Envie um arquivo .xlsx." }]);
  }
  if (file.size > MAX_SIZE) {
    return badRequest([{ field: "file", code: "TOO_LARGE", message: "Arquivo muito grande. Limite: 5 MB." }]);
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const report = await importIngredientsFromXlsx(Buffer.from(arrayBuffer));
    return ok(report);
  } catch {
    return internalError();
  }
}
