import { getActiveThemeState, setActivePresetId, saveCustomTokens } from "@/lib/repositories/themeConfigRepository";
import {
  MODERNO_PRESET,
  CUSTOM_PRESET_ID,
  CUSTOM_PRESET_STARTER_TOKENS,
  DEFAULT_PRESET_ID,
  isValidPresetId,
  isCompleteThemeTokens,
  type ThemePreset,
  type ThemeTokens,
} from "@/lib/theme-presets";

export class InvalidPresetError extends Error {
  constructor(public presetId: string) {
    super(`Preset de tema inválido: "${presetId}".`);
  }
}

export class InvalidThemeTokensError extends Error {
  constructor() {
    super("As 8 cores devem ser informadas em formato hexadecimal (#RRGGBB).");
  }
}

/** Nunca lança — se o banco falhar, não houver preset salvo, ou o preset
 * "personalizado" ainda não tiver cores salvas, cai no padrão ("moderno"), a
 * paleta já ao vivo em globals.css. Chamado a partir do layout raiz
 * (cacheado, ver src/app/layout.tsx) — precisa ser seguro mesmo sob
 * instabilidade de banco, mesma cautela já aplicada em manifest.ts (PWA). */
export async function getActiveThemePreset(): Promise<ThemePreset> {
  try {
    const state = await getActiveThemeState();
    if (!state || state.activePreset === DEFAULT_PRESET_ID) return MODERNO_PRESET;

    if (state.activePreset === CUSTOM_PRESET_ID && isCompleteThemeTokens(state.customTokens)) {
      return { id: CUSTOM_PRESET_ID, name: "Personalizado", description: "Cores definidas pela equipe.", tokens: state.customTokens };
    }

    return MODERNO_PRESET;
  } catch {
    return MODERNO_PRESET;
  }
}

/** Cores salvas do preset "personalizado", para pré-preencher o formulário em
 * /admin/tema — mesmo quando ele não está ativo no momento (o admin pode
 * estar em "Moderno" mas querer reabrir/ajustar o personalizado sem perder o
 * que já tinha configurado). Cai no ponto de partida (paleta já validada,
 * "Ateliê Clássico") se nunca foi salvo. */
export async function getCustomThemeTokens(): Promise<ThemeTokens> {
  const state = await getActiveThemeState();
  if (state && isCompleteThemeTokens(state.customTokens)) return state.customTokens;
  return CUSTOM_PRESET_STARTER_TOKENS;
}

export async function getThemeStatus(): Promise<{ activePresetId: string; customTokens: ThemeTokens }> {
  const state = await getActiveThemeState();
  // Normaliza qualquer valor não reconhecido (ex: "classico", de antes do
  // preset "personalizado" existir) para o padrão — sem isso, nenhum card da
  // tela mostraria "Ativo" até o admin escolher de novo.
  const storedPreset = state?.activePreset;
  const activePresetId = storedPreset && isValidPresetId(storedPreset) ? storedPreset : DEFAULT_PRESET_ID;
  const customTokens = state && isCompleteThemeTokens(state.customTokens) ? state.customTokens : CUSTOM_PRESET_STARTER_TOKENS;
  return { activePresetId, customTokens };
}

export async function activatePreset(presetId: string): Promise<void> {
  if (!isValidPresetId(presetId)) throw new InvalidPresetError(presetId);
  if (presetId === CUSTOM_PRESET_ID) {
    throw new InvalidPresetError(presetId); // "personalizado" só ativa via setCustomTheme (precisa de cores)
  }
  await setActivePresetId(presetId);
}

export async function setCustomTheme(tokens: unknown): Promise<ThemeTokens> {
  if (!isCompleteThemeTokens(tokens)) throw new InvalidThemeTokensError();
  await saveCustomTokens(tokens);
  return tokens;
}
