import { NextRequest } from "next/server";
import { ok, invalidBody, badRequest, internalError } from "@/lib/http/responses";
import type { ValidationError } from "@/lib/types";
import { requestOtp } from "@/lib/otpService";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  const phone = (body as { phone?: string })?.phone?.trim();
  if (!phone) {
    const error: ValidationError = {
      field: "phone",
      code: "REQUIRED",
      message: "Telefone é obrigatório.",
    };
    return badRequest([error]);
  }

  try {
    await requestOtp(phone);
    return ok({ sent: true });
  } catch {
    return internalError();
  }
}
