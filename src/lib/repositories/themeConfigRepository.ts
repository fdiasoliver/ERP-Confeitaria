import { prisma } from "@/lib/prisma";
import type { ThemeConfig as PrismaThemeConfig } from "@prisma/client";

export async function findActiveThemeConfig(): Promise<PrismaThemeConfig | null> {
  return prisma.themeConfig.findFirst({ where: { isActive: true } });
}

export async function updateThemeConfigBranding(
  id: string,
  logoUrl: string | null,
  faviconUrl: string | null,
): Promise<PrismaThemeConfig> {
  return prisma.themeConfig.update({
    where: { id },
    data: { logoUrl, faviconUrl },
  });
}

export async function createDefaultThemeConfig(
  logoUrl: string | null,
  faviconUrl: string | null,
): Promise<PrismaThemeConfig> {
  return prisma.themeConfig.create({
    data: { logoUrl, faviconUrl },
  });
}

export async function getThemeBranding(): Promise<{ logoUrl: string | null; faviconUrl: string | null }> {
  const result = await prisma.themeConfig.findFirst({
    where: { isActive: true },
    select: { logoUrl: true, faviconUrl: true },
  });
  return result ?? { logoUrl: null, faviconUrl: null };
}

// ─── Preset de tema (Módulo Tema, 09-10/09/2026) ──────────────────────────────

export async function getActiveThemeState(): Promise<{ activePreset: string; customTokens: unknown } | null> {
  return prisma.themeConfig.findFirst({
    where: { isActive: true },
    select: { activePreset: true, customTokens: true },
  });
}

export async function setActivePresetId(presetId: string): Promise<PrismaThemeConfig> {
  const existing = await prisma.themeConfig.findFirst({ where: { isActive: true } });
  if (existing) {
    return prisma.themeConfig.update({ where: { id: existing.id }, data: { activePreset: presetId } });
  }
  return prisma.themeConfig.create({ data: { activePreset: presetId } });
}

/** Salva os 8 tokens personalizados e já ativa o preset "personalizado" — uma
 * transação lógica só (o admin sempre quer ver o resultado imediatamente
 * depois de salvar, não um passo separado de "salvar" + "aplicar"). */
export async function saveCustomTokens(tokensJson: object): Promise<PrismaThemeConfig> {
  const existing = await prisma.themeConfig.findFirst({ where: { isActive: true } });
  if (existing) {
    return prisma.themeConfig.update({
      where: { id: existing.id },
      data: { activePreset: "personalizado", customTokens: tokensJson },
    });
  }
  return prisma.themeConfig.create({
    data: { activePreset: "personalizado", customTokens: tokensJson },
  });
}
