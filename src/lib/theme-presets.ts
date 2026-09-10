// Presets de tema — Módulo Tema (09-10/09/2026). Decisão explícita do Product
// Owner: paletas pré-aprovadas, não um seletor de cor livre — CLAUDE.md proíbe
// alterar as variáveis do design system sem alinhamento, e as sprints DS.1-DS.5
// escolheram a paleta atual com verificação de contraste WCAG. Os valores
// abaixo são reaproveitados de paletas já usadas e validadas em sprints reais
// deste projeto (ver CHANGELOG.md, DS.1 e DS.2.1/DS.3) — contraste
// recalculado e confirmado (≥4.5:1 em todos os pares texto/fundo relevantes)
// antes de virarem preset, não só copiados.
//
// "moderno" é a paleta ATUALMENTE ao vivo em globals.css — por isso não gera
// nenhuma sobrescrita de CSS quando selecionado (ver ThemeStyleOverride).
// Só adicionar um preset novo aqui depois de recalcular o contraste.

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  tokens: {
    cream: string;
    chocolate: string;
    rose: string;
    sage: string;
    caramel: string;
    sand: string;
    muted: string;
    surface2: string;
  };
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  moderno: {
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
  },
  classico: {
    id: "classico",
    name: "Ateliê Clássico",
    description: "Tons mais quentes e aconchegantes — café e vinho.",
    tokens: {
      cream: "#FBF6EF",
      chocolate: "#2E1B14",
      rose: "#A8324F",
      sage: "#5C6A3E",
      caramel: "#8A5B22",
      sand: "#E9DDC8",
      muted: "#6F6357",
      surface2: "#F5EFE1",
    },
  },
};

export const DEFAULT_PRESET_ID = "moderno";

export function isValidPresetId(id: string): boolean {
  return id in THEME_PRESETS;
}

export function getPreset(id: string): ThemePreset {
  return THEME_PRESETS[id] ?? THEME_PRESETS[DEFAULT_PRESET_ID];
}
