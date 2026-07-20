import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { UnitConversionInput } from "@/lib/validators/unitConversionValidator";
import {
  updateConversion,
  deleteConversion,
  ConversionNotFoundError,
  ConversionValidationFailedError,
  DuplicateConversionError,
  InvalidUnitReferenceError,
} from "@/lib/unitConversionService";

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
    const input = body as Partial<UnitConversionInput>;
    const conversion = await updateConversion(id, input);
    return ok(conversion);
  } catch (err) {
    if (err instanceof ConversionNotFoundError) return notFound("Conversão não encontrada.");
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    await deleteConversion(id);
    return ok({ id });
  } catch (err) {
    if (err instanceof ConversionNotFoundError) return notFound("Conversão não encontrada.");
    return internalError();
  }
}
