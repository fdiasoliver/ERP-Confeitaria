import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { UserUpdateInput } from "@/lib/validators/userValidator";
import {
  getUserById,
  updateUser,
  UserNotFoundError,
  UserValidationFailedError,
  DuplicateEmailError,
} from "@/lib/userService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const user = await getUserById(id);
    return ok(user);
  } catch (err) {
    if (err instanceof UserNotFoundError) return notFound("Usuário não encontrado.");
    return internalError();
  }
}

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
    const user = await updateUser(id, body as UserUpdateInput);
    return ok(user);
  } catch (err) {
    if (err instanceof UserNotFoundError) return notFound("Usuário não encontrado.");
    if (err instanceof UserValidationFailedError) return badRequest(err.errors);
    if (err instanceof DuplicateEmailError) return conflict("DUPLICATE_EMAIL", err.message, { email: err.email });
    return internalError();
  }
}
