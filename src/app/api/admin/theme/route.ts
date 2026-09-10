import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, badRequest, invalidBody, internalError } from "@/lib/http/responses";
import { listThemePresets, getActiveThemePreset, setThemePreset, InvalidPresetError } from "@/lib/themeConfigService";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const [active, presets] = await Promise.all([getActiveThemePreset(), listThemePresets()]);
    return ok({ activePresetId: active.id, presets });
  } catch {
    return internalError();
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  const presetId = (body as { presetId?: unknown })?.presetId;
  if (typeof presetId !== "string" || presetId.trim() === "") {
    return badRequest([{ field: "presetId", code: "REQUIRED", message: "presetId é obrigatório." }]);
  }

  try {
    const preset = await setThemePreset(presetId);
    return ok(preset);
  } catch (err) {
    if (err instanceof InvalidPresetError) {
      return badRequest([{ field: "presetId", code: "INVALID_VALUE", message: err.message }]);
    }
    return internalError();
  }
}
