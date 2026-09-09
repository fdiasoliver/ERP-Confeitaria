import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, notFound, internalError } from "@/lib/http/responses";
import { activateUser, UserNotFoundError } from "@/lib/userService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const user = await activateUser(id);
    return ok(user);
  } catch (err) {
    if (err instanceof UserNotFoundError) return notFound("Usuário não encontrado.");
    return internalError();
  }
}
