import { NextRequest } from "next/server";
import { requireOrderAccess } from "@/lib/auth/requireOrderAccess";
import { ok, badRequest, internalError } from "@/lib/http/responses";
import type { ValidationError } from "@/lib/types";
import { getProductionLoad } from "@/lib/orderService";

function parseRequiredDate(param: string | null, field: string): Date | ValidationError {
  if (param === null || param.trim().length === 0) {
    return {
      field,
      code: "REQUIRED",
      message: `O campo ${field} é obrigatório. Use o formato YYYY-MM-DD.`,
    };
  }

  const parsed = new Date(`${param}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return {
      field,
      code: "INVALID_DATE",
      message: `Data inválida em ${field}. Use o formato YYYY-MM-DD.`,
    };
  }

  return parsed;
}

export async function GET(request: NextRequest) {
  const denied = await requireOrderAccess();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);

  const startDateResult = parseRequiredDate(searchParams.get("startDate"), "startDate");
  const endDateResult = parseRequiredDate(searchParams.get("endDate"), "endDate");

  const errors: ValidationError[] = [];
  if (!(startDateResult instanceof Date)) errors.push(startDateResult);
  if (!(endDateResult instanceof Date)) errors.push(endDateResult);
  if (errors.length > 0) return badRequest(errors);

  try {
    const result = await getProductionLoad(startDateResult as Date, endDateResult as Date);
    return ok(result);
  } catch {
    return internalError();
  }
}
