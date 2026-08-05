import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, created, badRequest, invalidBody, conflict, internalError } from "@/lib/http/responses";
import type { UnitOfMeasureInput } from "@/lib/validators/unitValidator";
import {
  listAllUnits,
  createUnit,
  ValidationFailedError,
  DuplicateNameError,
  DuplicateAbbreviationError,
} from "@/lib/unitService";

export async function GET() {
  const denied = await requireProductionChain();
  if (denied) return denied;

  try {
    const units = await listAllUnits();
    return ok(units);
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
    const unit = await createUnit(body as UnitOfMeasureInput);
    return created(unit);
  } catch (err) {
    if (err instanceof ValidationFailedError) return badRequest(err.errors);
    if (err instanceof DuplicateNameError) {
      return conflict("DUPLICATE_NAME", `Já existe uma unidade com o nome "${err.name}".`, { name: err.name });
    }
    if (err instanceof DuplicateAbbreviationError) {
      return conflict(
        "DUPLICATE_ABBREVIATION",
        `Já existe uma unidade com o símbolo "${err.abbreviation}".`,
        { abbreviation: err.abbreviation },
      );
    }
    return internalError();
  }
}
