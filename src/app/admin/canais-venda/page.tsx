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
import type { SalesChannel, SalesChannelInput } from "@/lib/types";
import * as salesChannelApi from "@/lib/api/salesChannelApi";

// ── Local types ────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";
type StatusFilter = "all" | "active" | "inactive";
interface ChannelForm { name: string; sortOrder: number; color: string; icon: string }
const EMPTY_FORM: ChannelForm = { name: "", sortOrder: 0, color: "#E8A598", icon: "layout-grid" };
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// ── Local helper components ────────────────────────────────────────────────────

function ChannelModal({ mode, form, errors, submitting, onClose, onChange, onSubmit }: {
  mode: ModalMode;
  form: ChannelForm;
  errors: Record<string, string>;
  submitting: boolean;
  onClose: () => void;
  onChange: <K extends keyof ChannelForm>(key: K, value: ChannelForm[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <EntityForm
      title={mode === "create" ? "Novo canal" : "Editar canal"}
      submitting={submitting}
      submitLabel={mode === "create" ? "Criar" : "Salvar"}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Field label="Nome" required htmlFor="channel-name" error={errors.name}>
        <input
          id="channel-name"
          className={`input-field ${errors.name ? "border-rose" : ""}`}
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Ex: Loja física"
          maxLength={100}
          disabled={submitting}
        />
      </Field>

      <Field label="Ordem de exibição" htmlFor="channel-sort-order" error={errors.sortOrder}>
        <input
          id="channel-sort-order"
          type="number"
          className={`input-field ${errors.sortOrder ? "border-rose" : ""}`}
          value={form.sortOrder}
          min={0}
          onChange={(e) => onChange("sortOrder", parseInt(e.target.value, 10) || 0)}
          disabled={submitting}
        />
      </Field>

      <Field label="Cor (#RRGGBB)" htmlFor="channel-color-hex" error={errors.color}>
        <div className="flex gap-2">
          <input
            id="channel-color-picker"
            type="color"
            aria-label="Seletor de cor"
            className="h-[46px] w-12 cursor-pointer rounded-xl border border-sand bg-white p-1"
            value={form.color}
            onChange={(e) => onChange("color", e.target.value)}
            disabled={submitting}
          />
          <input
            id="channel-color-hex"
            className={`input-field flex-1 font-mono uppercase ${errors.color ? "border-rose" : ""}`}
            value={form.color}
            onChange={(e) => onChange("color", e.target.value.toUpperCase())}
            maxLength={7}
            placeholder="#E8A598"
            disabled={submitting}
          />
        </div>
      </Field>

      <Field label="Ícone (nome Lucide)" htmlFor="channel-icon" error={errors.icon}>
        <div className="flex gap-2">
          <div
            className="flex h-[46px] w-12 items-center justify-center rounded-xl border border-sand bg-sand/40"
            aria-hidden="true"
          >
            <ResolvedIcon name={form.icon} size={20} />
          </div>
          <input
            id="channel-icon"
            className={`input-field flex-1 ${errors.icon ? "border-rose" : ""}`}
            value={form.icon}
            onChange={(e) => onChange("icon", e.target.value)}
            placeholder="layout-grid"
            maxLength={50}
            disabled={submitting}
          />
        </div>
      </Field>
    </EntityForm>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function CanaisVendaAdminPage() {
  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useViewMode("canais-venda");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [editing, setEditing] = useState<SalesChannel | null>(null);
  const [form, setForm] = useState<ChannelForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<SalesChannel | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadChannels(silent = false) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const rows = await salesChannelApi.listChannels();
      setChannels([...rows].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Erro ao carregar canais de venda.");
      } else {
        toast.error("Erro ao atualizar lista de canais de venda.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadChannels(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return channels
      .filter((c) => !term || c.name.toLowerCase().includes(term))
      .filter((c) => statusFilter === "all" || (statusFilter === "active" ? c.isActive : !c.isActive));
  }, [channels, search, statusFilter]);

  const hasActiveFilter = search.trim() !== "" || statusFilter !== "all";

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditing(null);
    setModal("create");
  }

  function openEdit(channel: SalesChannel) {
    setForm({ name: channel.name, sortOrder: channel.sortOrder, color: channel.color, icon: channel.icon });
    setFormErrors({});
    setEditing(channel);
    setModal("edit");
  }

  function closeModal() { setModal(null); setEditing(null); setFormErrors({}); }

  function setField<K extends keyof ChannelForm>(key: K, value: ChannelForm[K]) {
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

  async function handleSubmit() {
    if (!validateForm()) return;
    setSubmitting(true);
    const toastId = toast.loading(modal === "create" ? "Criando canal…" : "Salvando alterações…");
    try {
      const payload: Pick<SalesChannelInput, "name" | "sortOrder" | "color" | "icon"> = {
        name: form.name, sortOrder: form.sortOrder, color: form.color, icon: form.icon,
      };
      if (modal === "create") {
        await salesChannelApi.createChannel(payload);
        toast.success("Canal criado com sucesso.", { id: toastId });
      } else if (editing) {
        await salesChannelApi.updateChannel(editing.id, payload);
        toast.success("Canal atualizado.", { id: toastId });
      }
      closeModal();
      await loadChannels(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar canal.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleActivate(channel: SalesChannel) {
    setActionLoading(channel.id);
    const toastId = toast.loading("Ativando canal…");
    try {
      await salesChannelApi.activateChannel(channel.id);
      toast.success(`"${channel.name}" ativado com sucesso.`, { id: toastId });
      await loadChannels(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar canal.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmDeactivate) return;
    const channel = confirmDeactivate;
    setConfirmDeactivate(null);
    setActionLoading(channel.id);
    const toastId = toast.loading("Desativando canal…");
    try {
      await salesChannelApi.deactivateChannel(channel.id);
      toast.success(`"${channel.name}" desativado.`, { id: toastId });
      await loadChannels(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao desativar canal.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  // Mesmas ações nas duas visões — mesmo padrão de admin/categorias/page.tsx.
  function renderActions(channel: SalesChannel, variant: "card" | "row") {
    const base =
      variant === "card"
        ? "flex-1 rounded-xl py-2 text-sm font-semibold"
        : "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold";
    const neutral = "border border-sand transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50";
    const busy = actionLoading === channel.id;
    return (
      <>
        <button
          type="button"
          onClick={() => openEdit(channel)}
          disabled={busy}
          aria-label={`Editar canal ${channel.name}`}
          className={`${base} ${neutral} text-chocolate`}
        >
          Editar
        </button>
        {channel.isActive ? (
          <button
            type="button"
            onClick={() => setConfirmDeactivate(channel)}
            disabled={busy}
            aria-label={`Desativar canal ${channel.name}`}
            className={`${base} ${neutral} text-muted`}
          >
            {busy ? "…" : "Desativar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleActivate(channel)}
            disabled={busy}
            aria-label={`Ativar canal ${channel.name}`}
            className={`${base} bg-sage/10 text-sage transition-colors hover:bg-sage/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:opacity-50`}
          >
            {busy ? "…" : "Ativar"}
          </button>
        )}
      </>
    );
  }

  const columns: EntityColumn<SalesChannel>[] = [
    {
      key: "name",
      header: "Nome",
      render: (c) => (
        <div className="flex items-center gap-3">
          <span
            className="h-6 w-6 shrink-0 rounded-md border border-sand"
            style={{ backgroundColor: c.color }}
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-chocolate">{c.name}</span>
            <StatusBadge isActive={c.isActive} activeLabel="Ativo" inactiveLabel="Inativo" />
          </div>
        </div>
      ),
    },
    {
      key: "icon",
      header: "Ícone",
      className: "hidden md:table-cell",
      render: (c) => <ResolvedIcon name={c.icon} size={18} aria-hidden="true" />,
    },
    {
      key: "sortOrder",
      header: "Ordem",
      className: "hidden text-right sm:table-cell",
      render: (c) => <span className="text-muted">{c.sortOrder}</span>,
    },
  ];

  return (
    <PageContainer>
      <HeaderMinimal title="Canais de Venda" />

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${filtered.length} ${filtered.length !== 1 ? "canais" : "canal"}`}
          </p>
          <div className="flex items-center gap-2">
            {!loading && !error && <ViewToggle value={view} onChange={setView} />}
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"
            >
              + Novo canal
            </button>
          </div>
        </div>

        {!loading && !error && (
          <div className="space-y-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Pesquisar por nome…"
              ariaLabel="Pesquisar canal por nome"
            />
            <FilterChips
              label="Status"
              selected={statusFilter}
              onSelect={setStatusFilter}
              options={[
                { value: "all", label: "Todos" },
                { value: "active", label: "Ativos" },
                { value: "inactive", label: "Inativos" },
              ]}
            />
          </div>
        )}

        {loading && <LoadingState count={3} />}
        {!loading && error && <ErrorState message={error} onRetry={() => loadChannels(false)} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title={hasActiveFilter ? "Nenhum canal encontrado" : "Nenhum canal cadastrado"}
            description={
              hasActiveFilter
                ? "Ajuste a pesquisa ou os filtros para ver todos os canais."
                : "Cadastre o primeiro canal de venda."
            }
            actionLabel={!hasActiveFilter ? "+ Novo canal" : undefined}
            onAction={!hasActiveFilter ? openCreate : undefined}
          />
        )}
        {!loading && !error && filtered.length > 0 && view === "grid" && (
          <ResponsiveGrid cols={3}>
            {filtered.map((channel) => (
              <EntityCard
                key={channel.id}
                title={channel.name}
                badges={<StatusBadge isActive={channel.isActive} activeLabel="Ativo" inactiveLabel="Inativo" />}
                actions={renderActions(channel, "card")}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-8 w-8 shrink-0 rounded-lg border border-sand"
                    style={{ backgroundColor: channel.color }}
                    aria-hidden="true"
                  />
                  <p className="truncate text-xs text-muted font-mono">{channel.slug}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <ResolvedIcon name={channel.icon} size={18} className="mx-auto" aria-hidden="true" />
                    <p className="mt-0.5 text-[10px] text-muted">Ícone</p>
                  </div>
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <p className="text-sm font-semibold leading-none text-chocolate">{channel.sortOrder}</p>
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
            getKey={(c) => c.id}
            renderActions={(c) => renderActions(c, "row")}
          />
        )}
      </div>

      {modal && (
        <ChannelModal
          mode={modal}
          form={form}
          errors={formErrors}
          submitting={submitting}
          onClose={closeModal}
          onChange={setField}
          onSubmit={handleSubmit}
        />
      )}

      {confirmDeactivate && (
        <ConfirmDialog
          title="Desativar canal?"
          description={
            <>
              O canal <strong className="text-chocolate">{'"'}{confirmDeactivate.name}{'"'}</strong> ficará indisponível para novos vínculos.
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
