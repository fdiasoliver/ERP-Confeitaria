import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, notFound, conflict, unauthorized, internalError } from "@/lib/http/responses";
import { deactivateUser, UserNotFoundError, SelfDeactivationError, LastActiveAdminError } from "@/lib/userService";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();

  const { id } = await params;

  try {
    const user = await deactivateUser(id, session.user.id);
    return ok(user);
  } catch (err) {
    if (err instanceof UserNotFoundError) return notFound("Usuário não encontrado.");
    if (err instanceof SelfDeactivationError) return conflict("SELF_DEACTIVATION", err.message);
    if (err instanceof LastActiveAdminError) return conflict("LAST_ACTIVE_ADMIN", err.message);
    return internalError();
  }
}
