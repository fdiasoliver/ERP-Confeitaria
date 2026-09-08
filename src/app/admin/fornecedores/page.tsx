"use client";

import { useState, useEffect, useRef } from "react";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { Field, Section } from "@/components/admin/config/FormPrimitives";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { ResponsiveGrid } from "@/components/admin/shared/ResponsiveGrid";
import { StatCard } from "@/components/admin/shared/StatCard";
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
import { maskCNPJ } from "@/lib/formatters/cnpj";
import { maskPhone } from "@/lib/formatters/phone";
import * as supplierApi from "@/lib/api/supplierApi";
import { ApiRequestError, type Supplier, type SupplierInput } from "@/lib/api/supplierApi";

// ── Local types ────────────────────────────────────────────────────────────────

interface SupplierForm {
  name: string;
  phone: string;
  cnpj: string;
  leadTimeDays: string;
  notes: string;
}

const EMPTY_FORM: SupplierForm = { name: "", phone: "", cnpj: "", leadTimeDays: "", notes: "" };

type ModalMode = "create" | "edit";
type StatusFilter = "all" | "active" | "inactive";

const PAGE_SIZE = 12;

const SORT_OPTIONS: {
  value: string;
  label: string;
  orderBy: "name" | "createdAt";
  orderDirection: "asc" | "desc";
}[] = [
  { value: "name-asc", label: "Nome (A-Z)", orderBy: "name", orderDirection: "asc" },
  { value: "name-desc", label: "Nome (Z-A)", orderBy: "name", orderDirection: "desc" },
  { value: "createdAt-desc", label: "Mais recentes", orderBy: "createdAt", orderDirection: "desc" },
  { value: "createdAt-asc", label: "Mais antigos", orderBy: "createdAt", orderDirection: "asc" },
];

// ── Main page ──────────────────────────────────────────────────────────────────

export default function FornecedoresAdminPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<{ total: number; active: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<string>("name-asc");
  const [page, setPage] = useState(1);
  const [view, setView] = useViewMode("fornecedores");

  const [modal, setModal] = useState<ModalMode | null>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [confirmDeactivate, setConfirmDeactivate] = useState<Supplier | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const hasLoadedOnce = useRef(false);

  // Debounce da pesquisa (~300ms) — evita um fetch por caractere digitado (busca é server-side).
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const sortOption = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  // Faixa de estatísticas (Total/Ativos/Inativos) — independente do filtro atual da
  // listagem; 2 chamadas leves (pageSize: 1, só o `total` importa), sem tocar a API.
  async function loadStats() {
    try {
      const [all, active] = await Promise.all([
        supplierApi.listSuppliersPaged({ pageSize: 1 }),
        supplierApi.listSuppliersPaged({ pageSize: 1, active: true }),
      ]);
      setStats({ total: all.total, active: active.total });
    } catch {
      setStats(null);
    }
  }

  async function loadSuppliers(silent = hasLoadedOnce.current) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await supplierApi.listSuppliersPaged({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        active: statusFilter === "all" ? undefined : statusFilter === "active",
        orderBy: sortOption.orderBy,
        orderDirection: sortOption.orderDirection,
      });
      setSuppliers(result.items);
      setTotal(result.total);
      hasLoadedOnce.current = true;
    } catch (err) {
      if (silent) {
        toast.error("Erro ao atualizar lista de fornecedores.");
      } else {
        setError(err instanceof Error ? err.message : "Erro ao carregar fornecedores.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // Toda mudança de busca/filtro/ordenação/página refaz o fetch — nunca filtra em memória.
  useEffect(() => {
    loadSuppliers(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [page, debouncedSearch, statusFilter, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadStats(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilter = searchInput.trim() !== "" || statusFilter !== "all";

  function handleStatusFilterChange(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleSortChange(value: string) {
    setSort(value);
    setPage(1);
  }

  // ── Formulário de criar/editar ─────────────────────────────────────────────

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditing(null);
    setModal("create");
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      phone: supplier.phone ?? "",
      cnpj: supplier.cnpj ?? "",
      leadTimeDays: supplier.leadTimeDays !== null ? String(supplier.leadTimeDays) : "",
      notes: supplier.notes ?? "",
    });
    setFormErrors({});
    setModal("edit");
  }

  function closeModal() { setModal(null); setEditing(null); setFormErrors({}); }

  function setField<K extends keyof SupplierForm>(key: K, value: SupplierForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateForm(): boolean {
    const errs: Record<string, string> = {};

    const name = form.name.trim();
    if (!name) errs.name = "Nome é obrigatório.";
    else if (name.length < 2) errs.name = "Mínimo 2 caracteres.";
    else if (name.length > 150) errs.name = "Máximo 150 caracteres.";

    if (form.cnpj.trim() !== "" && form.cnpj.replace(/\D/g, "").length !== 14) {
      errs.cnpj = "CNPJ deve ter 14 dígitos.";
    }

    if (form.phone.trim() !== "") {
      const digits = form.phone.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 11) errs.phone = "Telefone inválido. Use DDD + número.";
    }

    if (form.leadTimeDays.trim() !== "") {
      const lead = Number(form.leadTimeDays);
      if (!Number.isInteger(lead) || lead < 0) errs.leadTimeDays = "Número inteiro ≥ 0.";
    }

    if (form.notes.length > 500) errs.notes = "Máximo 500 caracteres.";

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
    const toastId = toast.loading(modal === "create" ? "Criando fornecedor…" : "Salvando alterações…");
    try {
      const input: SupplierInput = {
        name: form.name.trim(),
        cnpj: form.cnpj.trim() === "" ? null : form.cnpj,
        phone: form.phone.trim() === "" ? null : form.phone,
        leadTimeDays: form.leadTimeDays.trim() === "" ? null : Number(form.leadTimeDays),
        notes: form.notes.trim() === "" ? null : form.notes.trim(),
      };

      if (modal === "create") {
        await supplierApi.createSupplier(input);
        toast.success("Fornecedor criado com sucesso.", { id: toastId });
      } else if (editing) {
        await supplierApi.updateSupplier(editing.id, input);
        toast.success("Fornecedor atualizado.", { id: toastId });
      }
      closeModal();
      await Promise.all([loadSuppliers(true), loadStats()]);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else if (err instanceof ApiRequestError && err.code === "DUPLICATE_CNPJ") {
        setFormErrors({ cnpj: err.message });
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar fornecedor.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Ativar/Desativar ────────────────────────────────────────────────────────

  async function handleActivate(supplier: Supplier) {
    setActionLoading(supplier.id);
    const toastId = toast.loading("Ativando fornecedor…");
    try {
      await supplierApi.activateSupplier(supplier.id);
      toast.success(`"${supplier.name}" ativado com sucesso.`, { id: toastId });
      await Promise.all([loadSuppliers(true), loadStats()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar fornecedor.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmDeactivate) return;
    const supplier = confirmDeactivate;
    setConfirmDeactivate(null);
    setActionLoading(supplier.id);
    const toastId = toast.loading("Desativando fornecedor…");
    try {
      await supplierApi.deactivateSupplier(supplier.id);
      toast.success(`"${supplier.name}" desativado.`, { id: toastId });
      await Promise.all([loadSuppliers(true), loadStats()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao desativar fornecedor.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  // Mesmas ações nas duas visões — mesmo padrão de admin/ingredientes/page.tsx.
  function renderActions(supplier: Supplier, variant: "card" | "row") {
    const base =
      variant === "card"
        ? "flex-1 rounded-xl py-2 text-sm font-semibold"
        : "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold";
    const neutral = "border border-sand transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50";
    const busy = actionLoading === supplier.id;
    return (
      <>
        <button
          type="button"
          onClick={() => openEdit(supplier)}
          disabled={busy}
          aria-label={`Editar fornecedor ${supplier.name}`}
          className={`${base} ${neutral} text-chocolate`}
        >
          Editar
        </button>
        {supplier.active ? (
          <button
            type="button"
            onClick={() => setConfirmDeactivate(supplier)}
            disabled={busy}
            aria-label={`Desativar fornecedor ${supplier.name}`}
            className={`${base} ${neutral} text-muted`}
          >
            {busy ? "…" : "Desativar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleActivate(supplier)}
            disabled={busy}
            aria-label={`Ativar fornecedor ${supplier.name}`}
            className={`${base} bg-sage/10 text-sage transition-colors hover:bg-sage/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:opacity-50`}
          >
            {busy ? "…" : "Ativar"}
          </button>
        )}
      </>
    );
  }

  const columns: EntityColumn<Supplier>[] = [
    {
      key: "name",
      header: "Nome",
      render: (s) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-chocolate">{s.name}</span>
          <StatusBadge isActive={s.active} />
        </div>
      ),
    },
    {
      key: "cnpj",
      header: "CNPJ",
      className: "hidden md:table-cell",
      render: (s) => <span className="text-muted">{s.cnpj ? maskCNPJ(s.cnpj) : "—"}</span>,
    },
    {
      key: "phone",
      header: "Telefone",
      className: "hidden lg:table-cell",
      render: (s) => <span className="text-muted">{s.phone ? maskPhone(s.phone) : "—"}</span>,
    },
    {
      key: "leadTime",
      header: "Prazo de entrega",
      className: "hidden text-right sm:table-cell",
      render: (s) => <span className="text-chocolate">{s.leadTimeDays !== null ? `${s.leadTimeDays}d` : "—"}</span>,
    },
  ];

  return (
    <PageContainer>
      <HeaderMinimal title="Fornecedores" />

      <div className="space-y-4 p-5">
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard value={stats.total} label="Total" />
            <StatCard value={stats.active} label="Ativos" />
            <StatCard value={stats.total - stats.active} label="Inativos" />
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${total} fornecedor${total !== 1 ? "es" : ""}`}
          </p>
          <div className="flex items-center gap-2">
            <ViewToggle value={view} onChange={setView} />
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate md:self-auto"
            >
              + Novo
            </button>
          </div>
        </div>

        {!error && (
          <div className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="md:flex-1">
                <SearchBar
                  value={searchInput}
                  onChange={setSearchInput}
                  placeholder="Pesquisar por nome…"
                  ariaLabel="Pesquisar fornecedor por nome"
                />
              </div>
              <div className="md:w-56">
                <label htmlFor="filter-sort" className="sr-only">Ordenar por</label>
                <select
                  id="filter-sort"
                  className="input-field"
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <FilterChips
              label="Status"
              selected={statusFilter}
              onSelect={handleStatusFilterChange}
              options={[
                { value: "all", label: "Todos" },
                { value: "active", label: "Ativos" },
                { value: "inactive", label: "Inativos" },
              ]}
            />
          </div>
        )}

        {loading && <LoadingState count={3} />}
        {!loading && error && <ErrorState message={error} onRetry={() => loadSuppliers(false)} />}
        {!loading && !error && suppliers.length === 0 && (
          <EmptyState
            title={hasActiveFilter ? "Nenhum fornecedor encontrado" : "Nenhum fornecedor cadastrado"}
            description={
              hasActiveFilter
                ? "Ajuste a pesquisa ou os filtros para ver todos os fornecedores."
                : "Cadastre o primeiro fornecedor."
            }
            actionLabel={hasActiveFilter ? undefined : "+ Criar fornecedor"}
            onAction={hasActiveFilter ? undefined : openCreate}
          />
        )}
        {!loading && !error && suppliers.length > 0 && (
          <>
            {view === "grid" && (
              <ResponsiveGrid cols={3}>
                {suppliers.map((supplier) => (
                  <EntityCard
                    key={supplier.id}
                    title={supplier.name}
                    badges={<StatusBadge isActive={supplier.active} />}
                    actions={renderActions(supplier, "card")}
                  >
                    <p className="text-xs text-muted">
                      {supplier.cnpj ? maskCNPJ(supplier.cnpj) : "Sem CNPJ"}
                      {supplier.phone ? ` · ${maskPhone(supplier.phone)}` : ""}
                    </p>
                    {supplier.leadTimeDays !== null && (
                      <p className="text-xs text-muted">
                        Prazo de entrega: <span className="font-semibold text-chocolate">{supplier.leadTimeDays} dia{supplier.leadTimeDays !== 1 ? "s" : ""}</span>
                      </p>
                    )}
                    {supplier.notes && <p className="text-xs text-muted">{supplier.notes}</p>}
                  </EntityCard>
                ))}
              </ResponsiveGrid>
            )}
            {view === "list" && (
              <EntityTable
                items={suppliers}
                columns={columns}
                getKey={(s) => s.id}
                renderActions={(s) => renderActions(s, "row")}
              />
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-xl border border-sand px-4 py-2 text-sm font-semibold text-chocolate disabled:opacity-50"
                >
                  ‹ Anterior
                </button>
                <p className="text-xs text-muted">Página {page} de {totalPages}</p>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-xl border border-sand px-4 py-2 text-sm font-semibold text-chocolate disabled:opacity-50"
                >
                  Próxima ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <EntityForm
          title={modal === "create" ? "Novo fornecedor" : "Editar fornecedor"}
          submitting={submitting}
          submitLabel={modal === "create" ? "Criar" : "Salvar"}
          onClose={closeModal}
          onSubmit={handleSubmit}
        >
          <Section title="Identificação">
            <Field label="Nome" required htmlFor="supplier-name" error={formErrors.name}>
              <input
                id="supplier-name"
                className={`input-field ${formErrors.name ? "border-rose" : ""}`}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Ex: Distribuidora ABC"
                maxLength={150}
                disabled={submitting}
              />
            </Field>

            <Field label="CNPJ (opcional)" htmlFor="supplier-cnpj" error={formErrors.cnpj}>
              <input
                id="supplier-cnpj"
                className={`input-field ${formErrors.cnpj ? "border-rose" : ""}`}
                value={maskCNPJ(form.cnpj)}
                onChange={(e) => setField("cnpj", e.target.value.replace(/\D/g, ""))}
                placeholder="00.000.000/0000-00"
                disabled={submitting}
              />
            </Field>

            {modal === "edit" && editing && (
              <Field label="Status">
                <div className="flex items-center justify-between rounded-xl border border-sand bg-sand/30 px-4 py-3">
                  <StatusBadge isActive={editing.active} />
                  <p className="text-xs text-muted">
                    Use os botões Ativar/Desativar na listagem para alterar o status.
                  </p>
                </div>
              </Field>
            )}
          </Section>

          <Section title="Contato">
            <Field label="Telefone (opcional)" htmlFor="supplier-phone" error={formErrors.phone}>
              <input
                id="supplier-phone"
                inputMode="numeric"
                className={`input-field ${formErrors.phone ? "border-rose" : ""}`}
                value={maskPhone(form.phone)}
                onChange={(e) => setField("phone", e.target.value.replace(/\D/g, ""))}
                placeholder="(11) 99999-8888"
                disabled={submitting}
              />
            </Field>
          </Section>

          <Section title="Operação">
            <Field label="Prazo de entrega (dias, opcional)" htmlFor="supplier-lead-time" error={formErrors.leadTimeDays}>
              <input
                id="supplier-lead-time"
                type="number"
                inputMode="numeric"
                step="1"
                min={0}
                className={`input-field ${formErrors.leadTimeDays ? "border-rose" : ""}`}
                value={form.leadTimeDays}
                onChange={(e) => setField("leadTimeDays", e.target.value)}
                disabled={submitting}
              />
            </Field>
          </Section>

          <Section title="Observações">
            <Field label="Notas (opcional)" htmlFor="supplier-notes" error={formErrors.notes}>
              <textarea
                id="supplier-notes"
                className={`input-field ${formErrors.notes ? "border-rose" : ""}`}
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Condições de pagamento, mínimo de compra etc."
                maxLength={500}
                rows={3}
                disabled={submitting}
              />
            </Field>
          </Section>
        </EntityForm>
      )}

      {confirmDeactivate && (
        <ConfirmDialog
          title="Desativar fornecedor?"
          description={
            <>
              <strong className="text-chocolate">{'"'}{confirmDeactivate.name}{'"'}</strong> deixará de aparecer nas opções de cadastro de ingredientes e embalagens.
            </>
          }
          cancelLabel="Manter ativo"
          confirmLabel="Desativar"
          busy={actionLoading === confirmDeactivate.id}
          onCancel={() => setConfirmDeactivate(null)}
          onConfirm={handleDeactivateConfirm}
        />
      )}
    </PageContainer>
  );
}
