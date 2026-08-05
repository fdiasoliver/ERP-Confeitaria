import { NextRequest } from "next/server";
import { requireOrderAccess } from "@/lib/auth/requireOrderAccess";
import { ok, badRequest, internalError } from "@/lib/http/responses";
import type { ValidationError } from "@/lib/types";
import { getKanbanData } from "@/lib/orderService";

export async function GET(request: NextRequest) {
  const denied = await requireOrderAccess();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);

  const dateParam = searchParams.get("date");
  let date: Date | undefined;
  if (dateParam !== null && dateParam.trim().length > 0) {
    const parsed = new Date(`${dateParam}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      const error: ValidationError = {
        field: "date",
        code: "INVALID_DATE",
        message: "Data inválida. Use o formato YYYY-MM-DD.",
      };
      return badRequest([error]);
    }
    date = parsed;
  }

  try {
    const result = await getKanbanData(date);
    return ok(result);
  } catch {
    return internalError();
  }
}
