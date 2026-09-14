import { requireFinance } from "@/lib/auth/requireFinance";
import { ok, internalError } from "@/lib/http/responses";
import { getAccountsPayableReport } from "@/lib/reportsService";

export async function GET() {
  const denied = await requireFinance();
  if (denied) return denied;

  try {
    const result = await getAccountsPayableReport();
    return ok(result);
  } catch {
    return internalError();
  }
}
