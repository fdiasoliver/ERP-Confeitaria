import { ok, internalError } from "@/lib/http/responses";
import { listActiveUnits } from "@/lib/unitService";

// GET /api/units — retorna unidades ativas (UnitOfMeasure)
export async function GET() {
  try {
    const units = await listActiveUnits();
    return ok(units);
  } catch {
    return internalError();
  }
}
