import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { UnitOfMeasureInput } from "@/lib/validators/unitValidator";
import {
  updateUnit,
  NotFoundError,
  ValidationFailedError,
  DuplicateNameError,
  DuplicateAbbreviationError,
} from "@/lib/unitService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const input = body as Partial<UnitOfMeasureInput>;
    const unit = await updateUnit(id, input);
    return ok(unit);
  } catch (err) {
    if (err instanceof NotFoundError) return notFound("Unidade não encontrada.");
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
