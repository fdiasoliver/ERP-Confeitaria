import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/requireCustomer";
import { ok, created, invalidBody, badRequest, notFound, internalError } from "@/lib/http/responses";
import {
  listMyAddresses,
  createMyAddress,
  CustomerNotFoundError,
  AddressValidationFailedError,
} from "@/lib/customerProfileService";
import type { AddressCreateInput } from "@/lib/validators/addressValidator";

export async function GET() {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;
  const { phone } = auth;

  try {
    const addresses = await listMyAddresses(phone);
    return ok(addresses);
  } catch (err) {
    if (err instanceof CustomerNotFoundError) return notFound("Cliente não encontrado.");
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;
  const { phone } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const address = await createMyAddress(phone, body as AddressCreateInput);
    return created(address);
  } catch (err) {
    if (err instanceof AddressValidationFailedError) return badRequest(err.errors);
    if (err instanceof CustomerNotFoundError) return notFound("Cliente não encontrado.");
    return internalError();
  }
}
