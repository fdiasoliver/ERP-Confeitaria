import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import {
  updateCustomerAddress,
  deleteCustomerAddress,
  CustomerNotFoundError,
  AddressNotFoundError,
  AddressValidationFailedError,
  AddressInUseError,
} from "@/lib/customerService";
import type { AddressCreateInput } from "@/lib/validators/addressValidator";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; addressId: string }> },
) {
  const denied = await requireRole(["ADMIN", "ATENDIMENTO"]);
  if (denied) return denied;

  const { id, addressId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const address = await updateCustomerAddress(id, addressId, body as AddressCreateInput);
    return ok(address);
  } catch (err) {
    if (err instanceof AddressValidationFailedError) return badRequest(err.errors);
    if (err instanceof CustomerNotFoundError) return notFound("Cliente não encontrado.");
    if (err instanceof AddressNotFoundError) return notFound("Endereço não encontrado.");
    return internalError();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; addressId: string }> },
) {
  const denied = await requireRole(["ADMIN", "ATENDIMENTO"]);
  if (denied) return denied;

  const { id, addressId } = await params;

  try {
    await deleteCustomerAddress(id, addressId);
    return ok({ id: addressId });
  } catch (err) {
    if (err instanceof CustomerNotFoundError) return notFound("Cliente não encontrado.");
    if (err instanceof AddressNotFoundError) return notFound("Endereço não encontrado.");
    if (err instanceof AddressInUseError) {
      return conflict("ADDRESS_IN_USE", err.message, { orderCount: err.orderCount });
    }
    return internalError();
  }
}
