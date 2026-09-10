import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, badRequest, invalidBody, internalError } from "@/lib/http/responses";
import { MODERNO_PRESET, CUSTOM_PRESET_ID } from "@/lib/theme-presets";
import {
  getThemeStatus,
  activatePreset,
  setCustomTheme,
  InvalidPresetError,
  InvalidThemeTokensError,
} from "@/lib/themeConfigService";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const status = await getThemeStatus();
    return ok({ ...status, modernoPreset: MODERNO_PRESET });
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

  const { presetId, tokens } = (body ?? {}) as { presetId?: unknown; tokens?: unknown };

  if (presetId === CUSTOM_PRESET_ID) {
    try {
      const saved = await setCustomTheme(tokens);
      return ok({ activePresetId: CUSTOM_PRESET_ID, tokens: saved });
    } catch (err) {
      if (err instanceof InvalidThemeTokensError) {
        return badRequest([{ field: "tokens", code: "INVALID_VALUE", message: err.message }]);
      }
      return internalError();
    }
  }

  if (typeof presetId !== "string" || presetId.trim() === "") {
    return badRequest([{ field: "presetId", code: "REQUIRED", message: "presetId é obrigatório." }]);
  }

  try {
    await activatePreset(presetId);
    return ok({ activePresetId: presetId });
  } catch (err) {
    if (err instanceof InvalidPresetError) {
      return badRequest([{ field: "presetId", code: "INVALID_VALUE", message: err.message }]);
    }
    return internalError();
  }
}
