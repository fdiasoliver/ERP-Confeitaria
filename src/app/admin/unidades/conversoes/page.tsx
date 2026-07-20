"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { ValidationSummary } from "@/components/admin/config/ValidationSummary";
import type { ToastState } from "@/components/admin/config/ValidationSummary";
import type { ValidationError } from "@/lib/types";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import * as conversionApi from "@/lib/api/unitConversionApi";
import { ApiRequestError, type UnitConversion } from "@/lib/api/unitConversionApi";
import * as unitApi from "@/lib/api/unitApi";
import type { UnitOfMeasure } from "@/lib/api/unitApi";

// ── Local types ────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";
interface ConversionForm { fromUnitId: string; toUnitId: string; factor: string; description: string }
const EMPTY_FORM: ConversionForm = { fromUnitId: "", toUnitId: "", factor: "", description: "" };

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

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="shadow-card h-20 animate-pulse rounded-2xl bg-white" />
      ))}
    </div>
  );
}

function ConversionCard({ conversion, actionLoading, onEdit, onDelete }: {
  conversion: UnitConversion;
  actionLoading: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="shadow-card rounded-2xl bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-sm">
        <span className="font-semibold text-chocolate">
          {conversion.fromUnitName} ({conversion.fromUnitAbbreviation})
        </span>
        <span className="text-muted">→</span>
        <span className="font-semibold text-chocolate">
          {conversion.toUnitName} ({conversion.toUnitAbbreviation})
        </span>
      </div>
      <p className="mb-1 text-sm text-muted">
        1 {conversion.fromUnitAbbreviation} = <strong className="text-chocolate">{conversion.factor}</strong> {conversion.toUnitAbbreviation}
      </p>
      {conversion.description && <p className="mb-3 text-xs text-muted">{conversion.description}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={actionLoading}
          aria-label={`Editar conversão de ${conversion.fromUnitName} para ${conversion.toUnitName}`}
          className="flex-1 rounded-xl border border-sand py-2 text-sm font-semibold text-chocolate disabled:opacity-50"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={actionLoading}
          aria-label={`Excluir conversão de ${conversion.fromUnitName} para ${conversion.toUnitName}`}
          className="flex-1 rounded-xl border border-sand py-2 text-sm font-semibold text-rose disabled:opacity-50"
        >
          {actionLoading ? "…" : "Excluir"}
        </button>
      </div>
    </div>
  );
}

function ConversionModal({ mode, form, errors, submitting, units, onClose, onChange, onSubmit }: {
  mode: ModalMode;
  form: ConversionForm;
  errors: Record<string, string>;
  submitting: boolean;
  units: UnitOfMeasure[];
  onClose: () => void;
  onChange: <K extends keyof ConversionForm>(key: K, value: ConversionForm[K]) => void;
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
            {mode === "create" ? "Nova conversão" : "Editar conversão"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-muted text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <Field label="Unidade de origem" required htmlFor="conv-from" error={errors.fromUnitId}>
            <select
              id="conv-from"
              className={`input-field ${errors.fromUnitId ? "border-rose" : ""}`}
              value={form.fromUnitId}
              onChange={(e) => onChange("fromUnitId", e.target.value)}
              disabled={submitting}
            >
              <option value="">Selecione…</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
              ))}
            </select>
          </Field>

          <Field label="Unidade de destino" required htmlFor="conv-to" error={errors.toUnitId}>
            <select
              id="conv-to"
              className={`input-field ${errors.toUnitId ? "border-rose" : ""}`}
              value={form.toUnitId}
              onChange={(e) => onChange("toUnitId", e.target.value)}
              disabled={submitting}
            >
              <option value="">Selecione…</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
              ))}
            </select>
          </Field>

          <Field label="Fator (1 origem = quantos destino)" required htmlFor="conv-factor" error={errors.factor}>
            <input
              id="conv-factor"
              type="number"
              step="any"
              min={0}
              className={`input-field ${errors.factor ? "border-rose" : ""}`}
              value={form.factor}
              onChange={(e) => onChange("factor", e.target.value)}
              placeholder="Ex: 1000"
              disabled={submitting}
            />
          </Field>

          <Field label="Descrição (opcional)" htmlFor="conv-description" error={errors.description}>
            <input
              id="conv-description"
              className={`input-field ${errors.description ? "border-rose" : ""}`}
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="Ex: 1 kg = 1000 g"
              maxLength={200}
              disabled={submitting}
            />
          </Field>
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

function ConfirmModal({ conversion, onConfirm, onCancel }: {
  conversion: UnitConversion;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-5">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6">
        <p className="font-display mb-2 font-semibold text-chocolate">Excluir conversão?</p>
        <p className="mb-4 text-sm text-muted">
          A conversão de <strong className="text-chocolate">{conversion.fromUnitName}</strong> para{" "}
          <strong className="text-chocolate">{conversion.toUnitName}</strong> será excluída permanentemente. Esta ação não pode ser desfeita.
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
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ConversoesAdminPage() {
  const [conversions, setConversions] = useState<UnitConversion[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [editing, setEditing] = useState<UnitConversion | null>(null);
  const [form, setForm] = useState<ConversionForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<UnitConversion | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(type: ToastState["type"], message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    if (type !== "loading") toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  async function loadAll(silent = false) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const [conversionRows, unitRows] = await Promise.all([
        conversionApi.listConversions(),
        unitApi.listUnits(),
      ]);
      setConversions(conversionRows);
      setUnits(unitRows);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Erro ao carregar conversões.");
      } else {
        showToast("error", "Erro ao atualizar lista de conversões.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversions;
    return conversions.filter(
      (c) => c.fromUnitName.toLowerCase().includes(term) || c.toUnitName.toLowerCase().includes(term),
    );
  }, [conversions, search]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditing(null);
    setModal("create");
  }

  function openEdit(conversion: UnitConversion) {
    setForm({
      fromUnitId: conversion.fromUnitId,
      toUnitId: conversion.toUnitId,
      factor: String(conversion.factor),
      description: conversion.description ?? "",
    });
    setFormErrors({});
    setEditing(conversion);
    setModal("edit");
  }

  function closeModal() { setModal(null); setEditing(null); setFormErrors({}); }

  function setField<K extends keyof ConversionForm>(key: K, value: ConversionForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    if (!form.fromUnitId) errs.fromUnitId = "Selecione a unidade de origem.";
    if (!form.toUnitId) errs.toUnitId = "Selecione a unidade de destino.";
    if (form.fromUnitId && form.toUnitId && form.fromUnitId === form.toUnitId) {
      errs.toUnitId = "Deve ser diferente da unidade de origem.";
    }
    const factorNum = parseFloat(form.factor);
    if (form.factor.trim() === "" || Number.isNaN(factorNum)) errs.factor = "Fator é obrigatório.";
    else if (factorNum <= 0) errs.factor = "Fator deve ser maior que zero.";
    if (form.description.length > 200) errs.description = "Máximo 200 caracteres.";
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
    showToast("loading", modal === "create" ? "Criando conversão…" : "Salvando alterações…");
    try {
      const payload = {
        fromUnitId: form.fromUnitId,
        toUnitId: form.toUnitId,
        factor: parseFloat(form.factor),
        description: form.description.trim() || undefined,
      };
      if (modal === "create") {
        await conversionApi.createConversion(payload);
        showToast("success", "Conversão criada com sucesso.");
      } else if (editing) {
        await conversionApi.updateConversion(editing.id, payload);
        showToast("success", "Conversão atualizada.");
      }
      closeModal();
      await loadAll(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        showToast("error", "Corrija os campos destacados.");
      } else {
        showToast("error", err instanceof Error ? err.message : "Erro ao salvar conversão.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!confirmDelete) return;
    const conversion = confirmDelete;
    setConfirmDelete(null);
    setActionLoading(conversion.id);
    showToast("loading", "Excluindo conversão…");
    try {
      await conversionApi.deleteConversion(conversion.id);
      showToast("success", "Conversão excluída.");
      await loadAll(true);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Erro ao excluir conversão.");
    } finally {
      setActionLoading(null);
    }
  }

  const canCreate = units.length >= 2;

  return (
    <div className="mx-auto min-h-screen max-w-app bg-cream pb-8">
      <HeaderMinimal title="Conversões de Unidade" />

      <div className="space-y-4 p-5">
        <Link href="/admin/unidades" className="text-sm font-medium text-chocolate underline">
          ← Voltar para Unidades
        </Link>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${filtered.length} conversão${filtered.length !== 1 ? "ões" : ""}`}
          </p>
          <button
            type="button"
            onClick={openCreate}
            disabled={!canCreate}
            className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            + Nova
          </button>
        </div>

        {!loading && !error && (
          <input
            type="search"
            className="input-field"
            placeholder="Pesquisar por unidade…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Pesquisar conversão por unidade"
          />
        )}

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={loadAll} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title={search.trim() !== "" ? "Nenhuma conversão encontrada" : "Nenhuma conversão cadastrada"}
            description={
              search.trim() !== ""
                ? "Ajuste a pesquisa para ver todas as conversões."
                : canCreate
                  ? "Cadastre a primeira conversão entre unidades (ex: 1 kg = 1000 g)."
                  : "Cadastre pelo menos 2 unidades de medida antes de criar uma conversão."
            }
            actionLabel={search.trim() === "" && canCreate ? "+ Criar conversão" : undefined}
            onAction={search.trim() === "" && canCreate ? openCreate : undefined}
          />
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((conversion) => (
              <ConversionCard
                key={conversion.id}
                conversion={conversion}
                actionLoading={actionLoading === conversion.id}
                onEdit={() => openEdit(conversion)}
                onDelete={() => setConfirmDelete(conversion)}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ConversionModal
          mode={modal}
          form={form}
          errors={formErrors}
          submitting={submitting}
          units={units}
          onClose={closeModal}
          onChange={setField}
          onSubmit={handleSubmit}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          conversion={confirmDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <ValidationSummary toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
