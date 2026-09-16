import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/requireCustomer";
import { ok, invalidBody, badRequest, notFound, internalError } from "@/lib/http/responses";
import {
  getMyProfile,
  updateMyProfile,
  CustomerNotFoundError,
  ProfileValidationFailedError,
} from "@/lib/customerProfileService";
import type { CustomerProfileUpdateInput } from "@/lib/validators/customerProfileValidator";

export async function GET() {
  const auth = await requireCustomer();
  if (auth instanceof NextResponse) return auth;
  const { phone } = auth;

  try {
    const profile = await getMyProfile(phone);
    return ok(profile);
  } catch (err) {
    if (err instanceof CustomerNotFoundError) return notFound("Cliente não encontrado.");
    return internalError();
  }
}

export async function PATCH(request: NextRequest) {
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
    const profile = await updateMyProfile(phone, body as CustomerProfileUpdateInput);
    return ok(profile);
  } catch (err) {
    if (err instanceof ProfileValidationFailedError) return badRequest(err.errors);
    if (err instanceof CustomerNotFoundError) return notFound("Cliente não encontrado.");
    return internalError();
  }
}
