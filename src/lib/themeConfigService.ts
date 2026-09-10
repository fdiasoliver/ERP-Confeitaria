import { getActivePresetId, setActivePresetId } from "@/lib/repositories/themeConfigRepository";
import { THEME_PRESETS, DEFAULT_PRESET_ID, isValidPresetId, type ThemePreset } from "@/lib/theme-presets";

export class InvalidPresetError extends Error {
  constructor(public presetId: string) {
    super(`Preset de tema inválido: "${presetId}".`);
  }
}

/** Nunca lança — se o banco falhar ou não houver preset salvo, cai no padrão
 * ("moderno"), que é a paleta já ao vivo em globals.css. Chamado a partir do
 * layout raiz (cacheado, ver src/app/layout.tsx) — precisa ser seguro mesmo
 * sob instabilidade de banco, mesma cautela já aplicada em manifest.ts (PWA). */
export async function getActiveThemePreset(): Promise<ThemePreset> {
  try {
    const presetId = await getActivePresetId();
    return THEME_PRESETS[presetId ?? DEFAULT_PRESET_ID] ?? THEME_PRESETS[DEFAULT_PRESET_ID];
  } catch {
    return THEME_PRESETS[DEFAULT_PRESET_ID];
  }
}

export function listThemePresets(): ThemePreset[] {
  return Object.values(THEME_PRESETS);
}

export async function setThemePreset(presetId: string): Promise<ThemePreset> {
  if (!isValidPresetId(presetId)) throw new InvalidPresetError(presetId);
  await setActivePresetId(presetId);
  return THEME_PRESETS[presetId];
}
