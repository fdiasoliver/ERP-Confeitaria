import { getActiveThemePreset } from "@/lib/themeConfigService";
import { DEFAULT_PRESET_ID } from "@/lib/theme-presets";

/** Server Component — busca o preset ativo (getActiveThemePreset nunca lança;
 * cai no padrão "moderno" se o banco falhar). Só renderiza uma sobrescrita de
 * CSS quando o preset ativo NÃO é "moderno" — o padrão já é exatamente o que
 * globals.css já define, então não injeta nada e o site fica idêntico ao que
 * já era antes do Módulo Tema existir. `html:root` (especificidade maior que
 * o `:root` puro de globals.css) garante a sobrescrita independente da ordem
 * de renderização das duas tags no <head>. */
export async function ThemeStyleOverride() {
  const preset = await getActiveThemePreset();
  if (preset.id === DEFAULT_PRESET_ID) return null;

  const { tokens } = preset;
  const css = `html:root{--cream:${tokens.cream};--chocolate:${tokens.chocolate};--rose:${tokens.rose};--sage:${tokens.sage};--caramel:${tokens.caramel};--sand:${tokens.sand};--muted:${tokens.muted};--surface-2:${tokens.surface2};}`;

  // Seguro mesmo para o preset "personalizado" (cores vindas do banco, não de
  // theme-presets.ts): getActiveThemePreset() só usa customTokens depois de
  // isCompleteThemeTokens() validar as 8 contra /^#[0-9A-Fa-f]{6}$/ — nenhum
  // valor que chegue aqui pode fugir desse formato, então não há como injetar
  // `</style>`/HTML através de uma cor.
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
