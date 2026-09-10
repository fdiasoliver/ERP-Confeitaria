import type { ThemeTokens } from "@/lib/theme-presets";

function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  const rgb = [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16) / 255);
  const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste WCAG entre duas cores hex (#RRGGBB). 1:1 = sem
 * contraste, 21:1 = preto sobre branco. AA para texto normal exige ≥4.5:1. */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

export const WCAG_AA_MIN_CONTRAST = 4.5;

export interface ContrastCheck {
  label: string;
  ratio: number;
  passes: boolean;
}

/** Pares texto/fundo que realmente aparecem na interface (mesmos verificados
 * manualmente nas sprints DS.1-DS.5 antes de cada troca de paleta) — checagem
 * ao vivo enquanto o admin ajusta o preset "Personalizado" (Módulo Tema,
 * 10/09/2026). Consultivo, não bloqueia salvar — o Product Owner pode ter um
 * motivo para aceitar um contraste mais baixo num caso específico. */
export function checkThemeContrast(tokens: ThemeTokens): ContrastCheck[] {
  const pairs: { label: string; fg: string; bg: string }[] = [
    { label: "Texto principal sobre fundo", fg: tokens.chocolate, bg: tokens.cream },
    { label: "Destaque sobre fundo", fg: tokens.rose, bg: tokens.cream },
    { label: "Sucesso sobre fundo", fg: tokens.sage, bg: tokens.cream },
    { label: "Acento sobre fundo", fg: tokens.caramel, bg: tokens.cream },
    { label: "Texto secundário sobre fundo", fg: tokens.muted, bg: tokens.cream },
    { label: "Fundo sobre texto principal (botões)", fg: tokens.cream, bg: tokens.chocolate },
    { label: "Texto principal sobre cartão", fg: tokens.chocolate, bg: tokens.surface2 },
  ];

  return pairs.map(({ label, fg, bg }) => {
    const ratio = contrastRatio(fg, bg);
    return { label, ratio, passes: ratio >= WCAG_AA_MIN_CONTRAST };
  });
}
