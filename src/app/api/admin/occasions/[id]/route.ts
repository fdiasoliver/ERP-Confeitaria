import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, badRequest, invalidBody, notFound, internalError } from "@/lib/http/responses";
import type { OccasionTagInput } from "@/lib/types";
import { updateOccasion, NotFoundError, ValidationFailedError } from "@/lib/occasionTagService";

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
    const input = body as Partial<Pick<OccasionTagInput, "name" | "sortOrder" | "color" | "icon">>;
    const occasion = await updateOccasion(id, input);
    return ok(occasion);
  } catch (err) {
    if (err instanceof NotFoundError) return notFound("Ocasião não encontrada.");
    if (err instanceof ValidationFailedError) return badRequest(err.errors);
    return internalError();
  }
}
