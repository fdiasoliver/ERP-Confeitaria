import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, created, badRequest, invalidBody, conflict, notFound, internalError } from "@/lib/http/responses";
import type { UnitConversionInput } from "@/lib/validators/unitConversionValidator";
import {
  listAllConversions,
  createConversion,
  ConversionValidationFailedError,
  DuplicateConversionError,
  InvalidUnitReferenceError,
} from "@/lib/unitConversionService";

export async function GET() {
  const denied = await requireProductionChain();
  if (denied) return denied;

  try {
    const conversions = await listAllConversions();
    return ok(conversions);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const conversion = await createConversion(body as UnitConversionInput);
    return created(conversion);
  } catch (err) {
    if (err instanceof ConversionValidationFailedError) return badRequest(err.errors);
    if (err instanceof InvalidUnitReferenceError) {
      return notFound(`Unidade não encontrada (${err.field === "fromUnitId" ? "origem" : "destino"}).`);
    }
    if (err instanceof DuplicateConversionError) {
      return conflict(
        "DUPLICATE_CONVERSION",
        "Já existe uma conversão cadastrada entre essas duas unidades.",
        { fromUnitId: err.fromUnitId, toUnitId: err.toUnitId },
      );
    }
    return internalError();
  }
}
