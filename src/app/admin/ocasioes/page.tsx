"use client";

import { useState, useEffect, useMemo } from "react";
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
import { EntityTable, type EntityColumn } from "@/components/shared/EntityTable";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { EntityForm } from "@/components/admin/shared/EntityForm";
import { useViewMode } from "@/hooks/useViewMode";
import { ResolvedIcon } from "@/lib/icons";
import type { OccasionTag, OccasionTagInput, ValidationError } from "@/lib/types";
import * as occasionApi from "@/lib/api/occasionTagApi";
import { ApiRequestError } from "@/lib/api/occasionTagApi";

// ── Local types ────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";
type StatusFilter = "all" | "active" | "inactive";
interface OccasionForm { name: string; sortOrder: number; color: string; icon: string }
const EMPTY_FORM: OccasionForm = { name: "", sortOrder: 0, color: "#E8A598", icon: "calendar" };
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// ── Local helper components ────────────────────────────────────────────────────

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
    <EntityForm
      title={mode === "create" ? "Nova ocasião" : "Editar ocasião"}
      submitting={submitting}
      submitLabel={mode === "create" ? "Criar" : "Salvar"}
      onClose={onClose}
      onSubmit={onSubmit}
    >
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
            className="flex h-[46px] w-12 items-center justify-center rounded-xl border border-sand bg-sand/40"
            aria-hidden="true"
          >
            <ResolvedIcon name={form.icon} fallback="calendar" size={20} />
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
            <StatusBadge isActive={isActive} activeLabel="Ativa" inactiveLabel="Inativa" />
            <p className="text-xs text-muted">
              Use os botões Ativar/Desativar na listagem para alterar o status.
            </p>
          </div>
        </Field>
      )}
    </EntityForm>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function OcasioesAdminPage() {
  const [occasions, setOccasions] = useState<OccasionTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useViewMode("ocasioes");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [editing, setEditing] = useState<OccasionTag | null>(null);
  const [form, setForm] = useState<OccasionForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<OccasionTag | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        toast.error("Erro ao atualizar lista de ocasiões.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadOccasions(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return occasions
      .filter((o) => !term || o.name.toLowerCase().includes(term))
      .filter((o) => statusFilter === "all" || (statusFilter === "active" ? o.isActive : !o.isActive));
  }, [occasions, search, statusFilter]);

  const hasActiveFilter = search.trim() !== "" || statusFilter !== "all";

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
    const toastId = toast.loading(modal === "create" ? "Criando ocasião…" : "Salvando alterações…");
    try {
      const payload: Pick<OccasionTagInput, "name" | "sortOrder" | "color" | "icon"> = {
        name: form.name, sortOrder: form.sortOrder, color: form.color, icon: form.icon,
      };
      if (modal === "create") {
        await occasionApi.createOccasion(payload);
        toast.success("Ocasião criada com sucesso.", { id: toastId });
      } else if (editing) {
        await occasionApi.updateOccasion(editing.id, payload);
        toast.success("Ocasião atualizada.", { id: toastId });
      }
      closeModal();
      await loadOccasions(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar ocasião.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleActivate(occ: OccasionTag) {
    setActionLoading(occ.id);
    const toastId = toast.loading("Ativando ocasião…");
    try {
      await occasionApi.activateOccasion(occ.id);
      toast.success(`"${occ.name}" ativada com sucesso.`, { id: toastId });
      await loadOccasions(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar ocasião.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmDeactivate) return;
    const occ = confirmDeactivate;
    setConfirmDeactivate(null);
    setActionLoading(occ.id);
    const toastId = toast.loading("Desativando ocasião…");
    try {
      await occasionApi.deactivateOccasion(occ.id);
      toast.success(`"${occ.name}" desativada.`, { id: toastId });
      await loadOccasions(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao desativar ocasião.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  // Mesmas ações nas duas visões — mesmo padrão de admin/ingredientes/page.tsx.
  function renderActions(occ: OccasionTag, variant: "card" | "row") {
    const base =
      variant === "card"
        ? "flex-1 rounded-xl py-2 text-sm font-semibold"
        : "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold";
    const neutral = "border border-sand transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50";
    const busy = actionLoading === occ.id;
    return (
      <>
        <button
          type="button"
          onClick={() => openEdit(occ)}
          disabled={busy}
          aria-label={`Editar ocasião ${occ.name}`}
          className={`${base} ${neutral} text-chocolate`}
        >
          Editar
        </button>
        {occ.isActive ? (
          <button
            type="button"
            onClick={() => setConfirmDeactivate(occ)}
            disabled={busy}
            aria-label={`Desativar ocasião ${occ.name}`}
            className={`${base} ${neutral} text-muted`}
          >
            {busy ? "…" : "Desativar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleActivate(occ)}
            disabled={busy}
            aria-label={`Ativar ocasião ${occ.name}`}
            className={`${base} bg-sage/10 text-sage transition-colors hover:bg-sage/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:opacity-50`}
          >
            {busy ? "…" : "Ativar"}
          </button>
        )}
      </>
    );
  }

  const columns: EntityColumn<OccasionTag>[] = [
    {
      key: "name",
      header: "Nome",
      render: (o) => (
        <div className="flex items-center gap-3">
          <span
            className="h-6 w-6 shrink-0 rounded-md border border-sand"
            style={{ backgroundColor: o.color }}
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-chocolate">{o.name}</span>
            <StatusBadge isActive={o.isActive} activeLabel="Ativa" inactiveLabel="Inativa" />
          </div>
        </div>
      ),
    },
    {
      key: "icon",
      header: "Ícone",
      className: "hidden md:table-cell",
      render: (o) => <ResolvedIcon name={o.icon} fallback="calendar" size={18} aria-hidden="true" />,
    },
    {
      key: "sortOrder",
      header: "Ordem",
      className: "text-right",
      render: (o) => <span className="text-muted">{o.sortOrder}</span>,
    },
  ];

  return (
    <PageContainer>
      <HeaderMinimal title="Ocasiões" />

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${filtered.length} ${filtered.length !== 1 ? "ocasiões" : "ocasião"}`}
          </p>
          <div className="flex items-center gap-2">
            {!loading && !error && <ViewToggle value={view} onChange={setView} />}
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
              ariaLabel="Pesquisar ocasião por nome"
            />
            <FilterChips
              label="Status"
              selected={statusFilter}
              onSelect={setStatusFilter}
              options={[
                { value: "all", label: "Todas" },
                { value: "active", label: "Ativas" },
                { value: "inactive", label: "Inativas" },
              ]}
            />
          </div>
        )}

        {loading && <LoadingState count={3} />}
        {!loading && error && <ErrorState message={error} onRetry={() => loadOccasions(false)} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title={hasActiveFilter ? "Nenhuma ocasião encontrada" : "Nenhuma ocasião"}
            description={
              hasActiveFilter
                ? "Ajuste a pesquisa ou os filtros para ver todas as ocasiões."
                : "Crie a primeira ocasião para organizar as campanhas da vitrine."
            }
            actionLabel={!hasActiveFilter ? "+ Criar ocasião" : undefined}
            onAction={!hasActiveFilter ? openCreate : undefined}
          />
        )}
        {!loading && !error && filtered.length > 0 && view === "grid" && (
          <ResponsiveGrid cols={3}>
            {filtered.map((occ) => (
              <EntityCard
                key={occ.id}
                title={occ.name}
                badges={<StatusBadge isActive={occ.isActive} activeLabel="Ativa" inactiveLabel="Inativa" />}
                actions={renderActions(occ, "card")}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-8 w-8 shrink-0 rounded-lg border border-sand"
                    style={{ backgroundColor: occ.color }}
                    aria-hidden="true"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <ResolvedIcon name={occ.icon} fallback="calendar" size={18} className="mx-auto" aria-hidden="true" />
                    <p className="mt-0.5 text-[10px] text-muted">Ícone</p>
                  </div>
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <p className="text-sm font-semibold leading-none text-chocolate">{occ.sortOrder}</p>
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
            getKey={(o) => o.id}
            renderActions={(o) => renderActions(o, "row")}
          />
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
        <ConfirmDialog
          title="Desativar ocasião?"
          description={
            <>
              A ocasião <strong className="text-chocolate">{'"'}{confirmDeactivate.name}{'"'}</strong> deixará de aparecer nos filtros da vitrine.
              Se houver produtos vinculados, a desativação será bloqueada.
            </>
          }
          cancelLabel="Cancelar"
          confirmLabel="Desativar"
          onConfirm={handleDeactivateConfirm}
          onCancel={() => setConfirmDeactivate(null)}
        />
      )}
    </PageContainer>
  );
}
