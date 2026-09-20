import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { created, badRequest, invalidBody, notFound, internalError } from "@/lib/http/responses";
import {
  createCustomerAddress,
  CustomerNotFoundError,
  AddressValidationFailedError,
} from "@/lib/customerService";
import type { AddressCreateInput } from "@/lib/validators/addressValidator";

export async function POST(
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

  try {
    const address = await createCustomerAddress(id, body as AddressCreateInput);
    return created(address);
  } catch (err) {
    if (err instanceof AddressValidationFailedError) return badRequest(err.errors);
    if (err instanceof CustomerNotFoundError) return notFound("Cliente não encontrado.");
    return internalError();
  }
}
