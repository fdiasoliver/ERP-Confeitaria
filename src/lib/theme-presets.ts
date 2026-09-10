// Presets de tema — Módulo Tema (09-10/09/2026). "moderno" é a paleta
// ATUALMENTE ao vivo em globals.css (por isso não gera sobrescrita de CSS
// quando selecionado, ver ThemeStyleOverride) e permanece fixo — CLAUDE.md
// proíbe alterar as variáveis do design system sem alinhamento, e as sprints
// DS.1-DS.5 escolheram essa paleta com verificação de contraste WCAG.
//
// "personalizado" (adicionado 10/09/2026, a pedido explícito do Product
// Owner) é o segundo slot: cor livre por token, guardada em
// ThemeConfig.customTokens. TOKENS_STARTER preenche o formulário antes do
// primeiro salvamento — reaproveita a paleta "Ateliê Clássico" (já usada e
// validada em sprint anterior, ver CHANGELOG.md DS.1/DS.2.1) como ponto de
// partida, só para não começar de um formulário vazio/preto — depois de
// salvo pela 1ª vez, o valor do banco manda, não mais este starter.

export interface ThemeTokens {
  cream: string;
  chocolate: string;
  rose: string;
  sage: string;
  caramel: string;
  sand: string;
  muted: string;
  surface2: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  tokens: ThemeTokens;
}

export const MODERNO_PRESET: ThemePreset = {
  id: "moderno",
  name: "Ateliê Moderno",
  description: "Paleta atual do site — contraste, chocolate escuro e cereja.",
  tokens: {
    cream: "#FAF6EF",
    chocolate: "#191715",
    rose: "#C42E3C",
    sage: "#4F7530",
    caramel: "#8A5B22",
    sand: "#E3DCCB",
    muted: "#726A5F",
    surface2: "#F5EFE1",
  },
};

export const CUSTOM_PRESET_ID = "personalizado";
export const DEFAULT_PRESET_ID = MODERNO_PRESET.id;

export const CUSTOM_PRESET_STARTER_TOKENS: ThemeTokens = {
  cream: "#FBF6EF",
  chocolate: "#2E1B14",
  rose: "#A8324F",
  sage: "#5C6A3E",
  caramel: "#8A5B22",
  sand: "#E9DDC8",
  muted: "#6F6357",
  surface2: "#F5EFE1",
};

export const TOKEN_LABELS: Record<keyof ThemeTokens, string> = {
  cream: "Fundo (creme)",
  chocolate: "Texto principal (chocolate)",
  rose: "Destaque / erro (cereja)",
  sage: "Sucesso (verde)",
  caramel: "Acento (caramelo)",
  sand: "Bordas / fundo neutro (areia)",
  muted: "Texto secundário",
  surface2: "Fundo de cartão",
};

export function isValidPresetId(id: string): boolean {
  return id === MODERNO_PRESET.id || id === CUSTOM_PRESET_ID;
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function isCompleteThemeTokens(value: unknown): value is ThemeTokens {
  if (typeof value !== "object" || value === null) return false;
  const keys: (keyof ThemeTokens)[] = ["cream", "chocolate", "rose", "sage", "caramel", "sand", "muted", "surface2"];
  return keys.every((k) => {
    const v = (value as Record<string, unknown>)[k];
    return typeof v === "string" && isValidHexColor(v);
  });
}
