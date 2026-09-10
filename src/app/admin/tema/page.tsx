"use client";

import { useState, useEffect } from "react";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { LoadingState } from "@/components/admin/shared/LoadingState";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import * as themeApi from "@/lib/api/themeApi";
import { ApiRequestError, type ThemePreset } from "@/lib/api/themeApi";

// Presets pré-aprovados, não um seletor de cor livre — decisão explícita do
// Product Owner (planejamento do Módulo Tema, 09-10/09/2026): CLAUDE.md proíbe
// alterar as cores do design system sem alinhamento; as paletas aqui já foram
// validadas (contraste WCAG) em sprints anteriores (ver src/lib/theme-presets.ts).

function Swatches({ preset }: { preset: ThemePreset }) {
  const colors = [
    preset.tokens.cream,
    preset.tokens.chocolate,
    preset.tokens.rose,
    preset.tokens.sage,
    preset.tokens.caramel,
    preset.tokens.sand,
  ];
  return (
    <div className="flex gap-1.5">
      {colors.map((color, i) => (
        <span key={i} className="h-8 w-8 rounded-full border border-sand" style={{ backgroundColor: color }} aria-hidden="true" />
      ))}
    </div>
  );
}

export default function TemaAdminPage() {
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmPreset, setConfirmPreset] = useState<ThemePreset | null>(null);
  const [applying, setApplying] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const status = await themeApi.getThemeStatus();
      setPresets(status.presets);
      setActivePresetId(status.activePresetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar temas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  async function handleConfirmApply() {
    if (!confirmPreset) return;
    const preset = confirmPreset;
    setConfirmPreset(null);
    setApplying(true);
    const toastId = toast.loading(`Aplicando tema "${preset.name}"…`);
    try {
      await themeApi.setThemePreset(preset.id);
      setActivePresetId(preset.id);
      toast.success(`Tema "${preset.name}" aplicado em todo o site.`, { id: toastId });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao aplicar tema.", { id: toastId });
      }
    } finally {
      setApplying(false);
    }
  }

  return (
    <PageContainer>
      <HeaderMinimal title="Tema" />

      <div className="space-y-4 p-5">
        <p className="text-sm text-muted">
          Escolha uma paleta pré-aprovada para o site inteiro (loja e admin). A mudança pode levar até 1 hora para
          aparecer em todas as páginas (cache).
        </p>

        {loading && <LoadingState count={2} />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {presets.map((preset) => {
              const isActive = preset.id === activePresetId;
              return (
                <Card key={preset.id} className="shadow-card gap-3 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-2 font-semibold text-chocolate">
                        {preset.name}
                        {isActive && (
                          <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-sage">
                            <Check size={12} /> Ativo
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{preset.description}</p>
                    </div>
                  </div>

                  <Swatches preset={preset} />

                  <button
                    type="button"
                    onClick={() => setConfirmPreset(preset)}
                    disabled={isActive || applying}
                    className="rounded-xl border border-sand py-2 text-sm font-semibold text-chocolate transition-colors hover:bg-sand/60 disabled:opacity-50"
                  >
                    {isActive ? "Já está ativo" : "Aplicar este tema"}
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {confirmPreset && (
        <ConfirmDialog
          title={`Aplicar o tema "${confirmPreset.name}"?`}
          description={
            <>
              As cores de <strong className="text-chocolate">todo o site</strong> (loja e admin) vão mudar para essa
              paleta. Pode ser revertido a qualquer momento voltando para o outro tema.
            </>
          }
          cancelLabel="Cancelar"
          confirmLabel="Aplicar"
          destructive={false}
          busy={applying}
          onCancel={() => setConfirmPreset(null)}
          onConfirm={handleConfirmApply}
        />
      )}
    </PageContainer>
  );
}
