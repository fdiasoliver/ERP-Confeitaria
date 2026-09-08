import { NextRequest } from "next/server";
import { requireFinance } from "@/lib/auth/requireFinance";
import { ok, badRequest, internalError } from "@/lib/http/responses";
import type { ValidationError } from "@/lib/types";
import { getFinancialReport, type RevenueBasis } from "@/lib/reportsService";

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

function parseBasis(param: string | null): RevenueBasis | ValidationError {
  if (param === null || param === "entregue") return "ENTREGUE";
  if (param === "pago") return "PAGO";
  return {
    field: "basis",
    code: "INVALID_VALUE",
    message: "O campo basis deve ser 'entregue' ou 'pago'.",
  };
}

export async function GET(request: NextRequest) {
  const denied = await requireFinance();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);

  const startDateResult = parseRequiredDate(searchParams.get("startDate"), "startDate");
  const endDateResult = parseRequiredDate(searchParams.get("endDate"), "endDate");
  const basisResult = parseBasis(searchParams.get("basis"));

  const errors: ValidationError[] = [];
  if (!(startDateResult instanceof Date)) errors.push(startDateResult);
  if (!(endDateResult instanceof Date)) errors.push(endDateResult);
  if (typeof basisResult !== "string") errors.push(basisResult);
  if (errors.length > 0) return badRequest(errors);

  try {
    const result = await getFinancialReport(
      startDateResult as Date,
      endDateResult as Date,
      basisResult as RevenueBasis,
    );
    return ok(result);
  } catch {
    return internalError();
  }
}
