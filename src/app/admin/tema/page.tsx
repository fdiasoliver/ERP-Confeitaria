"use client";

import { useState, useEffect, useMemo } from "react";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { LoadingState } from "@/components/admin/shared/LoadingState";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { Card } from "@/components/ui/card";
import { Check, AlertTriangle } from "lucide-react";
import * as themeApi from "@/lib/api/themeApi";
import { ApiRequestError, type ThemeStatus, type ThemeTokens } from "@/lib/api/themeApi";
import { TOKEN_LABELS, CUSTOM_PRESET_ID } from "@/lib/theme-presets";
import { checkThemeContrast, WCAG_AA_MIN_CONTRAST } from "@/lib/wcag";

// Presets pré-aprovados + 1 slot personalizado — decisão explícita do Product
// Owner (10/09/2026): manter "Ateliê Moderno" fixo como referência segura e
// abrir cor livre no segundo slot, com aviso de contraste (não bloqueio) —
// ver src/lib/theme-presets.ts e src/lib/wcag.ts.

function Swatches({ tokens }: { tokens: ThemeTokens }) {
  const colors = [tokens.cream, tokens.chocolate, tokens.rose, tokens.sage, tokens.caramel, tokens.sand];
  return (
    <div className="flex gap-1.5">
      {colors.map((color, i) => (
        <span key={i} className="h-8 w-8 rounded-full border border-sand" style={{ backgroundColor: color }} aria-hidden="true" />
      ))}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          aria-label={`Seletor de cor — ${label}`}
          className="h-[42px] w-11 shrink-0 cursor-pointer rounded-lg border border-sand bg-white p-1"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
        />
        <input
          className="input-field flex-1 font-mono uppercase"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          maxLength={7}
          placeholder="#RRGGBB"
        />
      </div>
    </div>
  );
}

export default function TemaAdminPage() {
  const [status, setStatus] = useState<ThemeStatus | null>(null);
  const [customForm, setCustomForm] = useState<ThemeTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModerno, setConfirmModerno] = useState(false);
  const [applying, setApplying] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await themeApi.getThemeStatus();
      setStatus(result);
      setCustomForm(result.customTokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar temas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const contrastResults = useMemo(() => (customForm ? checkThemeContrast(customForm) : []), [customForm]);
  const failingCount = contrastResults.filter((r) => !r.passes).length;

  function setToken<K extends keyof ThemeTokens>(key: K, value: string) {
    setCustomForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleApplyModerno() {
    setConfirmModerno(false);
    setApplying(true);
    const toastId = toast.loading('Aplicando "Ateliê Moderno"…');
    try {
      await themeApi.activatePreset("moderno");
      setStatus((prev) => (prev ? { ...prev, activePresetId: "moderno" } : prev));
      toast.success('Tema "Ateliê Moderno" aplicado em todo o site.', { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aplicar tema.", { id: toastId });
    } finally {
      setApplying(false);
    }
  }

  async function handleSaveCustom() {
    if (!customForm) return;
    const invalidField = Object.entries(customForm).find(([, v]) => !/^#[0-9A-Fa-f]{6}$/.test(v));
    if (invalidField) {
      toast.error(`Cor inválida em "${TOKEN_LABELS[invalidField[0] as keyof ThemeTokens]}" — use o formato #RRGGBB.`);
      return;
    }

    setApplying(true);
    const toastId = toast.loading("Salvando e aplicando tema personalizado…");
    try {
      await themeApi.saveCustomTheme(customForm);
      setStatus((prev) => (prev ? { ...prev, activePresetId: CUSTOM_PRESET_ID, customTokens: customForm } : prev));
      toast.success("Tema personalizado aplicado em todo o site.", { id: toastId });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar tema.", { id: toastId });
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
          Escolha a paleta do site inteiro (loja e admin). A mudança aparece assim que você recarregar a página.
        </p>

        {loading && <LoadingState count={2} />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && status && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="shadow-card gap-3 rounded-2xl p-4">
              <div>
                <p className="flex items-center gap-2 font-semibold text-chocolate">
                  {status.modernoPreset.name}
                  {status.activePresetId === "moderno" && (
                    <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-sage">
                      <Check size={12} /> Ativo
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted">{status.modernoPreset.description}</p>
              </div>

              <Swatches tokens={status.modernoPreset.tokens} />

              <button
                type="button"
                onClick={() => setConfirmModerno(true)}
                disabled={status.activePresetId === "moderno" || applying}
                className="rounded-xl border border-sand py-2 text-sm font-semibold text-chocolate transition-colors hover:bg-sand/60 disabled:opacity-50"
              >
                {status.activePresetId === "moderno" ? "Já está ativo" : "Aplicar este tema"}
              </button>
            </Card>

            <Card className="shadow-card gap-3 rounded-2xl p-4">
              <div>
                <p className="flex items-center gap-2 font-semibold text-chocolate">
                  Personalizado
                  {status.activePresetId === CUSTOM_PRESET_ID && (
                    <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-sage">
                      <Check size={12} /> Ativo
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted">Defina cada cor livremente.</p>
              </div>

              {customForm && (
                <>
                  <Swatches tokens={customForm} />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(Object.keys(TOKEN_LABELS) as (keyof ThemeTokens)[]).map((key) => (
                      <ColorField key={key} label={TOKEN_LABELS[key]} value={customForm[key]} onChange={(v) => setToken(key, v)} />
                    ))}
                  </div>

                  <div className="rounded-xl border border-sand bg-sand/30 p-3">
                    <p className="mb-2 text-xs font-semibold text-chocolate">
                      Contraste (legibilidade) — mínimo recomendado {WCAG_AA_MIN_CONTRAST}:1
                    </p>
                    <div className="space-y-1">
                      {contrastResults.map((r) => (
                        <div key={r.label} className="flex items-center justify-between text-xs">
                          <span className={r.passes ? "text-muted" : "flex items-center gap-1 text-rose"}>
                            {!r.passes && <AlertTriangle size={12} />}
                            {r.label}
                          </span>
                          <span className={r.passes ? "text-muted" : "font-semibold text-rose"}>{r.ratio.toFixed(2)}:1</span>
                        </div>
                      ))}
                    </div>
                    {failingCount > 0 && (
                      <p className="mt-2 text-xs text-rose">
                        {failingCount} combinação{failingCount !== 1 ? "ões" : ""} abaixo do mínimo recomendado — o texto pode
                        ficar difícil de ler. Você ainda pode salvar assim mesmo.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveCustom}
                    disabled={applying}
                    className="rounded-xl bg-chocolate py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 disabled:opacity-50"
                  >
                    {applying ? "Salvando…" : "Salvar e aplicar"}
                  </button>
                </>
              )}
            </Card>
          </div>
        )}
      </div>

      {confirmModerno && (
        <ConfirmDialog
          title='Aplicar o tema "Ateliê Moderno"?'
          description={
            <>
              As cores de <strong className="text-chocolate">todo o site</strong> (loja e admin) vão mudar para essa
              paleta. Suas cores personalizadas ficam salvas e podem ser reaplicadas depois.
            </>
          }
          cancelLabel="Cancelar"
          confirmLabel="Aplicar"
          destructive={false}
          busy={applying}
          onCancel={() => setConfirmModerno(false)}
          onConfirm={handleApplyModerno}
        />
      )}
    </PageContainer>
  );
}
