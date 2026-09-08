"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { Field } from "@/components/admin/config/FormPrimitives";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { ResponsiveGrid } from "@/components/admin/shared/ResponsiveGrid";
import { SearchBar } from "@/components/admin/shared/SearchBar";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { LoadingState } from "@/components/admin/shared/LoadingState";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { FilterChips } from "@/components/admin/shared/FilterChips";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { EntityCard } from "@/components/admin/shared/EntityCard";
import { EntityTable, type EntityColumn } from "@/components/admin/shared/EntityTable";
import { ViewToggle } from "@/components/admin/shared/ViewToggle";
import { EntityForm } from "@/components/admin/shared/EntityForm";
import { useViewMode } from "@/hooks/useViewMode";
import type { ValidationError } from "@/lib/types";
import * as unitApi from "@/lib/api/unitApi";
import { ApiRequestError, type UnitOfMeasure, type UnitType } from "@/lib/api/unitApi";

// ── Local types ────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";
interface UnitForm { name: string; abbreviation: string; type: UnitType; sortOrder: number }
const EMPTY_FORM: UnitForm = { name: "", abbreviation: "", type: "UNIT", sortOrder: 0 };
const ABBREVIATION_RE = /^[\p{L}0-9.%/]+$/u;

const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  MASS: "Massa",
  VOLUME: "Volume",
  UNIT: "Unidade",
};

type StatusFilter = "all" | "active" | "inactive";
type TypeFilter = "all" | UnitType;

// ── Main page ──────────────────────────────────────────────────────────────────

export default function UnidadesAdminPage() {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useViewMode("unidades");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [editing, setEditing] = useState<UnitOfMeasure | null>(null);
  const [form, setForm] = useState<UnitForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<UnitOfMeasure | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadUnits(silent = false) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const rows = await unitApi.listUnits();
      setUnits([...rows].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Erro ao carregar unidades.");
      } else {
        toast.error("Erro ao atualizar lista de unidades.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadUnits(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return units
      .filter((u) => !term || u.name.toLowerCase().includes(term))
      .filter((u) => statusFilter === "all" || (statusFilter === "active" ? u.isActive : !u.isActive))
      .filter((u) => typeFilter === "all" || u.type === typeFilter)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "pt-BR"));
  }, [units, search, statusFilter, typeFilter]);

  const hasActiveFilter = search.trim() !== "" || statusFilter !== "all" || typeFilter !== "all";

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditing(null);
    setModal("create");
  }

  function openEdit(unit: UnitOfMeasure) {
    setForm({ name: unit.name, abbreviation: unit.abbreviation, type: unit.type, sortOrder: unit.sortOrder });
    setFormErrors({});
    setEditing(unit);
    setModal("edit");
  }

  function closeModal() { setModal(null); setEditing(null); setFormErrors({}); }

  function setField<K extends keyof UnitForm>(key: K, value: UnitForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateForm(): boolean {
    const errs: Record<string, string> = {};

    const name = form.name.trim();
    if (!name) errs.name = "Nome é obrigatório.";
    else if (name.length < 2) errs.name = "Mínimo 2 caracteres.";
    else if (name.length > 100) errs.name = "Máximo 100 caracteres.";

    const abbreviation = form.abbreviation.trim();
    if (!abbreviation) errs.abbreviation = "Sigla é obrigatória.";
    else if (abbreviation.length > 10) errs.abbreviation = "Máximo 10 caracteres.";
    else if (!ABBREVIATION_RE.test(abbreviation)) errs.abbreviation = "Contém caracteres não permitidos.";

    if (form.type !== "MASS" && form.type !== "VOLUME" && form.type !== "UNIT") {
      errs.type = "Tipo deve ser Massa, Volume ou Unidade.";
    }

    if (!Number.isInteger(form.sortOrder) || form.sortOrder < 0) errs.sortOrder = "Número inteiro ≥ 0.";

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
    const toastId = toast.loading(modal === "create" ? "Criando unidade…" : "Salvando alterações…");
    try {
      const payload = {
        name: form.name,
        abbreviation: form.abbreviation,
        type: form.type,
        sortOrder: form.sortOrder,
      };
      if (modal === "create") {
        await unitApi.createUnit(payload);
        toast.success("Unidade criada com sucesso.", { id: toastId });
      } else if (editing) {
        await unitApi.updateUnit(editing.id, payload);
        toast.success("Unidade atualizada.", { id: toastId });
      }
      closeModal();
      await loadUnits(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar unidade.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleActivate(unit: UnitOfMeasure) {
    setActionLoading(unit.id);
    const toastId = toast.loading("Ativando unidade…");
    try {
      await unitApi.activateUnit(unit.id);
      toast.success(`"${unit.name}" ativada com sucesso.`, { id: toastId });
      await loadUnits(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar unidade.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmDeactivate) return;
    const unit = confirmDeactivate;
    setConfirmDeactivate(null);
    setActionLoading(unit.id);
    const toastId = toast.loading("Desativando unidade…");
    try {
      await unitApi.deactivateUnit(unit.id);
      toast.success(`"${unit.name}" desativada.`, { id: toastId });
      await loadUnits(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao desativar unidade.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  // Mesmas ações nas duas visões — mesmo padrão de admin/ingredientes/page.tsx.
  function renderActions(unit: UnitOfMeasure, variant: "card" | "row") {
    const base =
      variant === "card"
        ? "flex-1 rounded-xl py-2 text-sm font-semibold"
        : "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold";
    const neutral = "border border-sand transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50";
    const busy = actionLoading === unit.id;
    return (
      <>
        <button
          type="button"
          onClick={() => openEdit(unit)}
          disabled={busy}
          aria-label={`Editar unidade ${unit.name}`}
          className={`${base} ${neutral} text-chocolate`}
        >
          Editar
        </button>
        {unit.isActive ? (
          <button
            type="button"
            onClick={() => setConfirmDeactivate(unit)}
            disabled={busy}
            aria-label={`Desativar unidade ${unit.name}`}
            className={`${base} ${neutral} text-muted`}
          >
            {busy ? "…" : "Desativar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleActivate(unit)}
            disabled={busy}
            aria-label={`Ativar unidade ${unit.name}`}
            className={`${base} bg-sage/10 text-sage transition-colors hover:bg-sage/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:opacity-50`}
          >
            {busy ? "…" : "Ativar"}
          </button>
        )}
      </>
    );
  }

  const columns: EntityColumn<UnitOfMeasure>[] = [
    {
      key: "name",
      header: "Nome",
      render: (u) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-chocolate">{u.name}</span>
          <StatusBadge isActive={u.isActive} activeLabel="Ativa" inactiveLabel="Inativa" />
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipo",
      className: "hidden md:table-cell",
      render: (u) => <span className="text-muted">{UNIT_TYPE_LABELS[u.type]}</span>,
    },
    {
      key: "abbreviation",
      header: "Sigla",
      className: "text-right",
      render: (u) => <span className="font-semibold text-chocolate">{u.abbreviation}</span>,
    },
    {
      key: "sortOrder",
      header: "Ordem",
      className: "hidden text-right sm:table-cell",
      render: (u) => <span className="text-muted">{u.sortOrder}</span>,
    },
  ];

  return (
    <PageContainer>
      <HeaderMinimal title="Unidades" />

      <div className="space-y-4 p-5">
        <Link href="/admin/unidades/conversoes" className="text-sm font-medium text-chocolate underline">
          Conversões entre unidades →
        </Link>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${filtered.length} unidade${filtered.length !== 1 ? "s" : ""}`}
          </p>
          <div className="flex items-center gap-2">
            <ViewToggle value={view} onChange={setView} />
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"
            >
              + Nova
            </button>
          </div>
        </div>

        {!loading && !error && (
          <div className="space-y-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Pesquisar por nome…"
              ariaLabel="Pesquisar unidade por nome"
            />
            <FilterChips
              label="Status"
              selected={statusFilter}
              onSelect={setStatusFilter}
              options={[
                { value: "all", label: "Todos" },
                { value: "active", label: "Ativas" },
                { value: "inactive", label: "Inativas" },
              ]}
            />
            <FilterChips
              label="Tipo"
              selected={typeFilter}
              onSelect={setTypeFilter}
              options={[
                { value: "all", label: "Todos" },
                { value: "MASS", label: UNIT_TYPE_LABELS.MASS },
                { value: "VOLUME", label: UNIT_TYPE_LABELS.VOLUME },
                { value: "UNIT", label: UNIT_TYPE_LABELS.UNIT },
              ]}
            />
          </div>
        )}

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={loadUnits} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title={hasActiveFilter ? "Nenhuma unidade encontrada" : "Nenhuma unidade"}
            description={
              hasActiveFilter
                ? "Ajuste a pesquisa ou limpe o filtro para ver todas as unidades."
                : "Crie a primeira unidade de medida para usar em ingredientes e receitas."
            }
            actionLabel={hasActiveFilter ? undefined : "+ Criar unidade"}
            onAction={hasActiveFilter ? undefined : openCreate}
          />
        )}
        {!loading && !error && filtered.length > 0 && view === "grid" && (
          <ResponsiveGrid cols={3}>
            {filtered.map((unit) => (
              <EntityCard
                key={unit.id}
                title={unit.name}
                badges={<StatusBadge isActive={unit.isActive} activeLabel="Ativa" inactiveLabel="Inativa" />}
                actions={renderActions(unit, "card")}
              >
                <p className="text-xs text-muted">{UNIT_TYPE_LABELS[unit.type]}</p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <p className="text-sm font-semibold leading-none text-chocolate">{unit.abbreviation}</p>
                    <p className="mt-0.5 text-[10px] text-muted">Sigla</p>
                  </div>
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <p className="text-sm font-semibold leading-none text-chocolate">{unit.sortOrder}</p>
                    <p className="mt-0.5 text-[10px] text-muted">Ordem</p>
                  </div>
                </div>
              </EntityCard>
            ))}
          </ResponsiveGrid>
        )}
        {!loading && !error && filtered.length > 0 && view === "list" && (
          <EntityTable
            items={filtered}
            columns={columns}
            getKey={(u) => u.id}
            renderActions={(u) => renderActions(u, "row")}
          />
        )}
      </div>

      {modal && (
        <EntityForm
          title={modal === "create" ? "Nova unidade" : "Editar unidade"}
          submitting={submitting}
          submitLabel={modal === "create" ? "Criar" : "Salvar"}
          onClose={closeModal}
          onSubmit={handleSubmit}
        >
          <Field label="Nome" required htmlFor="unit-name" error={formErrors.name}>
            <input
              id="unit-name"
              className={`input-field ${formErrors.name ? "border-rose" : ""}`}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ex: Quilograma"
              maxLength={100}
              disabled={submitting}
            />
          </Field>

          <Field label="Sigla" required htmlFor="unit-abbreviation" error={formErrors.abbreviation}>
            <input
              id="unit-abbreviation"
              className={`input-field ${formErrors.abbreviation ? "border-rose" : ""}`}
              value={form.abbreviation}
              onChange={(e) => setField("abbreviation", e.target.value)}
              placeholder="Ex: kg"
              maxLength={10}
              disabled={submitting}
            />
          </Field>

          <Field label="Tipo" required htmlFor="unit-type" error={formErrors.type}>
            <select
              id="unit-type"
              className={`input-field ${formErrors.type ? "border-rose" : ""}`}
              value={form.type}
              onChange={(e) => setField("type", e.target.value as UnitType)}
              disabled={submitting}
            >
              <option value="MASS">Massa</option>
              <option value="VOLUME">Volume</option>
              <option value="UNIT">Unidade</option>
            </select>
          </Field>

          <Field label="Ordem de exibição" htmlFor="unit-sort-order" error={formErrors.sortOrder}>
            <input
              id="unit-sort-order"
              type="number"
              className={`input-field ${formErrors.sortOrder ? "border-rose" : ""}`}
              value={form.sortOrder}
              min={0}
              onChange={(e) => setField("sortOrder", parseInt(e.target.value, 10) || 0)}
              disabled={submitting}
            />
          </Field>

          {modal === "edit" && editing && (
            <Field label="Status">
              <div className="flex items-center justify-between rounded-xl border border-sand bg-sand/30 px-4 py-3">
                <StatusBadge isActive={editing.isActive} activeLabel="Ativa" inactiveLabel="Inativa" />
                <p className="text-xs text-muted">
                  Use os botões Ativar/Desativar na listagem para alterar o status.
                </p>
              </div>
            </Field>
          )}
        </EntityForm>
      )}

      {confirmDeactivate && (
        <ConfirmDialog
          title="Desativar unidade?"
          description={
            <>
              A unidade <strong className="text-chocolate">{'"'}{confirmDeactivate.name}{'"'}</strong> deixará de aparecer nas opções de cadastro de ingredientes e receitas.
            </>
          }
          cancelLabel="Manter ativa"
          confirmLabel="Desativar"
          busy={actionLoading === confirmDeactivate.id}
          onCancel={() => setConfirmDeactivate(null)}
          onConfirm={handleDeactivateConfirm}
        />
      )}
    </PageContainer>
  );
}
