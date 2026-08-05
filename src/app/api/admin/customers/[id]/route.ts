import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { ok, badRequest, invalidBody, notFound, internalError } from "@/lib/http/responses";
import type { CustomerNotesInput } from "@/lib/validators/customerValidator";
import {
  getCustomerById,
  updateCustomerNotes,
  CustomerNotFoundError,
  CustomerValidationFailedError,
} from "@/lib/customerService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireRole(["ADMIN", "ATENDIMENTO"]);
  if (denied) return denied;

  const { id } = await params;

  try {
    const customer = await getCustomerById(id);
    return ok(customer);
  } catch (err) {
    if (err instanceof CustomerNotFoundError) return notFound("Cliente não encontrado.");
    return internalError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireRole(["ADMIN", "ATENDIMENTO"]);
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  // Somente `notes` é aceito — `phone`/`name`/`email` são ignorados silenciosamente
  // caso presentes no body, reforçando a imutabilidade de `phone` já decidida no
  // Planejamento (Customer é criado via upsert no checkout, fora deste módulo).
  const { notes } = (body ?? {}) as CustomerNotesInput;

  try {
    const customer = await updateCustomerNotes(id, { notes });
    return ok(customer);
  } catch (err) {
    if (err instanceof CustomerValidationFailedError) return badRequest(err.errors);
    if (err instanceof CustomerNotFoundError) return notFound("Cliente não encontrado.");
    return internalError();
  }
}
