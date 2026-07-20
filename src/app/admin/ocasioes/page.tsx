"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { HeaderMinimal } from "@/components/layout/Header";
import { ValidationSummary } from "@/components/admin/config/ValidationSummary";
import type { ToastState } from "@/components/admin/config/ValidationSummary";
import type { OccasionTag, OccasionTagInput, ValidationError } from "@/lib/types";
import * as occasionApi from "@/lib/api/occasionTagApi";
import { ApiRequestError } from "@/lib/api/occasionTagApi";

// ── Local types ────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";
interface OccasionForm { name: string; sortOrder: number; color: string; icon: string }
const EMPTY_FORM: OccasionForm = { name: "", sortOrder: 0, color: "#E8A598", icon: "calendar" };
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// ── Local helper components ────────────────────────────────────────────────────

function Field({ label, required, error, htmlFor, children }: {
  label: string; required?: boolean; error?: string; htmlFor?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-chocolate">
        {label}{required && <span className="ml-0.5 text-rose">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose">{error}</p>}
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
      isActive ? "bg-sage/10 text-sage" : "bg-sand text-muted"
    }`}>
      {isActive ? "Ativa" : "Inativa"}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="shadow-card h-24 animate-pulse rounded-2xl bg-white" />
      ))}
    </div>
  );
}

function EmptyState({ onCreate, hasFilter }: { onCreate: () => void; hasFilter: boolean }) {
  return (
    <div className="shadow-card rounded-2xl bg-white p-8 text-center">
      <p className="font-display mb-1 text-lg font-semibold text-chocolate">
        {hasFilter ? "Nenhuma ocasião encontrada" : "Nenhuma ocasião"}
      </p>
      <p className="mb-4 text-sm text-muted">
        {hasFilter
          ? "Ajuste a pesquisa ou limpe o filtro para ver todas as ocasiões."
          : "Crie a primeira ocasião para organizar as campanhas da vitrine."}
      </p>
      {!hasFilter && (
        <button
          type="button"
          onClick={onCreate}
          className="rounded-xl bg-chocolate px-5 py-2 text-sm font-semibold text-white"
        >
          + Criar ocasião
        </button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="shadow-card rounded-2xl bg-white p-6 text-center">
      <p className="mb-1 text-sm font-semibold text-rose">Erro ao carregar</p>
      <p className="mb-4 text-sm text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl border border-sand px-4 py-2 text-sm font-semibold text-chocolate"
      >
        Tentar novamente
      </button>
    </div>
  );
}

function OccasionCard({ occasion, actionLoading, onEdit, onActivate, onDeactivate }: {
  occasion: OccasionTag;
  actionLoading: boolean;
  onEdit: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  return (
    <div className="shadow-card rounded-2xl bg-white p-4">
      <div className="mb-3 flex items-start gap-3">
        <span
          className="mt-0.5 h-8 w-8 shrink-0 rounded-lg border border-sand"
          style={{ backgroundColor: occasion.color }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-chocolate">{occasion.name}</p>
            <StatusBadge isActive={occasion.isActive} />
          </div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-sand/60 px-2 py-1.5">
          <p className="text-lg leading-none">{occasion.icon}</p>
          <p className="mt-0.5 text-[10px] text-muted">Ícone</p>
        </div>
        <div className="rounded-lg bg-sand/60 px-2 py-1.5">
          <p className="text-sm font-semibold leading-none text-chocolate">{occasion.sortOrder}</p>
          <p className="mt-0.5 text-[10px] text-muted">Ordem</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={actionLoading}
          aria-label={`Editar ocasião ${occasion.name}`}
          className="flex-1 rounded-xl border border-sand py-2 text-sm font-semibold text-chocolate disabled:opacity-50"
        >
          Editar
        </button>
        {occasion.isActive ? (
          <button
            type="button"
            onClick={onDeactivate}
            disabled={actionLoading}
            aria-label={`Desativar ocasião ${occasion.name}`}
            className="flex-1 rounded-xl border border-sand py-2 text-sm font-semibold text-muted disabled:opacity-50"
          >
            {actionLoading ? "…" : "Desativar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onActivate}
            disabled={actionLoading}
            aria-label={`Ativar ocasião ${occasion.name}`}
            className="flex-1 rounded-xl bg-sage/10 py-2 text-sm font-semibold text-sage disabled:opacity-50"
          >
            {actionLoading ? "…" : "Ativar"}
          </button>
        )}
      </div>
    </div>
  );
}

function OccasionModal({ mode, form, errors, submitting, isActive, onClose, onChange, onSubmit }: {
  mode: ModalMode;
  form: OccasionForm;
  errors: Record<string, string>;
  submitting: boolean;
  isActive: boolean | null;
  onClose: () => void;
  onChange: <K extends keyof OccasionForm>(key: K, value: OccasionForm[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full rounded-t-3xl bg-white pb-8 pt-5 px-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-chocolate">
            {mode === "create" ? "Nova ocasião" : "Editar ocasião"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-muted text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <Field label="Nome" required htmlFor="occ-name" error={errors.name}>
            <input
              id="occ-name"
              className={`input-field ${errors.name ? "border-rose" : ""}`}
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Ex: Aniversário"
              maxLength={100}
              disabled={submitting}
            />
          </Field>

          <Field label="Ordem de exibição" htmlFor="occ-sort-order" error={errors.sortOrder}>
            <input
              id="occ-sort-order"
              type="number"
              className={`input-field ${errors.sortOrder ? "border-rose" : ""}`}
              value={form.sortOrder}
              min={0}
              onChange={(e) => onChange("sortOrder", parseInt(e.target.value, 10) || 0)}
              disabled={submitting}
            />
          </Field>

          <Field label="Cor (#RRGGBB)" htmlFor="occ-color-hex" error={errors.color}>
            <div className="flex gap-2">
              <input
                id="occ-color-picker"
                type="color"
                aria-label="Seletor de cor"
                className="h-[46px] w-12 cursor-pointer rounded-xl border border-sand bg-white p-1"
                value={form.color}
                onChange={(e) => onChange("color", e.target.value)}
                disabled={submitting}
              />
              <input
                id="occ-color-hex"
                className={`input-field flex-1 font-mono uppercase ${errors.color ? "border-rose" : ""}`}
                value={form.color}
                onChange={(e) => onChange("color", e.target.value.toUpperCase())}
                maxLength={7}
                placeholder="#E8A598"
                disabled={submitting}
              />
            </div>
          </Field>

          <Field label="Ícone (nome Lucide)" htmlFor="occ-icon" error={errors.icon}>
            <div className="flex gap-2">
              <div
                className="flex h-[46px] w-12 items-center justify-center rounded-xl border border-sand bg-sand/40 text-xl"
                aria-hidden="true"
              >
                {form.icon}
              </div>
              <input
                id="occ-icon"
                className={`input-field flex-1 ${errors.icon ? "border-rose" : ""}`}
                value={form.icon}
                onChange={(e) => onChange("icon", e.target.value)}
                placeholder="calendar"
                maxLength={50}
                disabled={submitting}
              />
            </div>
          </Field>

          {mode === "edit" && isActive !== null && (
            <Field label="Ativo">
              <div className="flex items-center justify-between rounded-xl border border-sand bg-sand/30 px-4 py-3">
                <StatusBadge isActive={isActive} />
                <p className="text-xs text-muted">
                  Use os botões Ativar/Desativar na listagem para alterar o status.
                </p>
              </div>
            </Field>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-sand py-3 text-sm font-semibold text-chocolate disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-chocolate py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Salvando…" : mode === "create" ? "Criar" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ occasion, onConfirm, onCancel }: {
  occasion: OccasionTag;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-5">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6">
        <p className="font-display mb-2 font-semibold text-chocolate">Desativar ocasião?</p>
        <p className="mb-4 text-sm text-muted">
          A ocasião <strong className="text-chocolate">{'"'}{occasion.name}{'"'}</strong> deixará de aparecer nos filtros da vitrine.
          Se houver produtos vinculados, a desativação será bloqueada.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-sand py-2.5 text-sm font-semibold text-chocolate"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose py-2.5 text-sm font-semibold text-white"
          >
            Desativar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function OcasioesAdminPage() {
  const [occasions, setOccasions] = useState<OccasionTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [editing, setEditing] = useState<OccasionTag | null>(null);
  const [form, setForm] = useState<OccasionForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<OccasionTag | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(type: ToastState["type"], message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    if (type !== "loading") toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  async function loadOccasions(silent = false) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const rows = await occasionApi.listOccasions();
      setOccasions([...rows].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Erro ao carregar ocasiões.");
      } else {
        showToast("error", "Erro ao atualizar lista de ocasiões.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadOccasions(); }, []); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return occasions;
    return occasions.filter((occ) => occ.name.toLowerCase().includes(term));
  }, [occasions, search]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditing(null);
    setModal("create");
  }

  function openEdit(occ: OccasionTag) {
    setForm({ name: occ.name, sortOrder: occ.sortOrder, color: occ.color, icon: occ.icon });
    setFormErrors({});
    setEditing(occ);
    setModal("edit");
  }

  function closeModal() { setModal(null); setEditing(null); setFormErrors({}); }

  function setField<K extends keyof OccasionForm>(key: K, value: OccasionForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    const name = form.name.trim();
    if (!name) errs.name = "Nome é obrigatório.";
    else if (name.length < 2) errs.name = "Mínimo 2 caracteres.";
    else if (name.length > 100) errs.name = "Máximo 100 caracteres.";
    if (!Number.isInteger(form.sortOrder) || form.sortOrder < 0) errs.sortOrder = "Número inteiro ≥ 0.";
    if (!HEX_RE.test(form.color)) errs.color = "Formato #RRGGBB (ex: #E8A598).";
    const icon = form.icon.trim();
    if (!icon) errs.icon = "Ícone não pode ser vazio.";
    else if (icon.length > 50) errs.icon = "Máximo 50 caracteres.";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function applyServerValidationErrors(details: unknown) {
    if (!Array.isArray(details)) return false;
    const errs: Record<string, string> = {};
    (details as ValidationError[]).forEach((e) => { errs[e.field] = e.message; });
    if (Object.keys(errs).length === 0) return false;
    setFormErrors(errs);
    return true;
  }

  async function handleSubmit() {
    if (!validateForm()) return;
    setSubmitting(true);
    showToast("loading", modal === "create" ? "Criando ocasião…" : "Salvando alterações…");
    try {
      const payload: Pick<OccasionTagInput, "name" | "sortOrder" | "color" | "icon"> = {
        name: form.name, sortOrder: form.sortOrder, color: form.color, icon: form.icon,
      };
      if (modal === "create") {
        await occasionApi.createOccasion(payload);
        showToast("success", "Ocasião criada com sucesso.");
      } else if (editing) {
        await occasionApi.updateOccasion(editing.id, payload);
        showToast("success", "Ocasião atualizada.");
      }
      closeModal();
      await loadOccasions(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        showToast("error", "Corrija os campos destacados.");
      } else {
        showToast("error", err instanceof Error ? err.message : "Erro ao salvar ocasião.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleActivate(occ: OccasionTag) {
    setActionLoading(occ.id);
    showToast("loading", "Ativando ocasião…");
    try {
      await occasionApi.activateOccasion(occ.id);
      showToast("success", `"${occ.name}" ativada com sucesso.`);
      await loadOccasions(true);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Erro ao ativar ocasião.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmDeactivate) return;
    const occ = confirmDeactivate;
    setConfirmDeactivate(null);
    setActionLoading(occ.id);
    showToast("loading", "Desativando ocasião…");
    try {
      await occasionApi.deactivateOccasion(occ.id);
      showToast("success", `"${occ.name}" desativada.`);
      await loadOccasions(true);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Erro ao desativar ocasião.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-app bg-cream pb-8">
      <HeaderMinimal title="Ocasiões" />

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${filtered.length} ocasião${filtered.length !== 1 ? "ões" : ""}`}
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white"
          >
            + Nova
          </button>
        </div>

        {!loading && !error && (
          <input
            type="search"
            className="input-field"
            placeholder="Pesquisar por nome…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Pesquisar ocasião por nome"
          />
        )}

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={loadOccasions} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState onCreate={openCreate} hasFilter={search.trim() !== ""} />
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((occ) => (
              <OccasionCard
                key={occ.id}
                occasion={occ}
                actionLoading={actionLoading === occ.id}
                onEdit={() => openEdit(occ)}
                onActivate={() => handleActivate(occ)}
                onDeactivate={() => setConfirmDeactivate(occ)}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <OccasionModal
          mode={modal}
          form={form}
          errors={formErrors}
          submitting={submitting}
          isActive={editing ? editing.isActive : null}
          onClose={closeModal}
          onChange={setField}
          onSubmit={handleSubmit}
        />
      )}

      {confirmDeactivate && (
        <ConfirmModal
          occasion={confirmDeactivate}
          onConfirm={handleDeactivateConfirm}
          onCancel={() => setConfirmDeactivate(null)}
        />
      )}

      <ValidationSummary toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
