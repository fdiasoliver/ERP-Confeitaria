import { ok, internalError } from "@/lib/http/responses";
import { listActiveOccasions } from "@/lib/occasionTagService";

// GET /api/occasions — retorna ocasiões ativas (OccasionTag)
export async function GET() {
  try {
    const occasions = await listActiveOccasions();
    return ok(occasions);
  } catch {
    return internalError();
  }
}
