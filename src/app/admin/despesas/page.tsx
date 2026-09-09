"use client";

import { useState, useEffect, useRef } from "react";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { Field } from "@/components/admin/config/FormPrimitives";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { ResponsiveGrid } from "@/components/admin/shared/ResponsiveGrid";
import { StatCard } from "@/components/admin/shared/StatCard";
import { SearchBar } from "@/components/admin/shared/SearchBar";
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
import { formatCurrency } from "@/lib/formatters/currency";
import type { ValidationError } from "@/lib/types";
import * as expenseApi from "@/lib/api/expenseApi";
import {
  ApiRequestError,
  EXPENSE_CATEGORY_LABELS,
  type Expense,
  type ExpenseCategory,
  type ExpenseStatus,
  type ExpenseInput,
} from "@/lib/api/expenseApi";
import * as supplierApi from "@/lib/api/supplierApi";
import type { Supplier } from "@/lib/api/supplierApi";

// ── Local types ────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";

interface ExpenseForm {
  description: string;
  category: ExpenseCategory;
  amount: string;
  dueDate: string;
  supplierId: string;
  notes: string;
}

const EMPTY_FORM: ExpenseForm = { description: "", category: "OUTROS", amount: "", dueDate: "", supplierId: "", notes: "" };

type StatusFilter = "all" | ExpenseStatus;
type CategoryFilter = "all" | ExpenseCategory;

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: string; label: string; orderBy: "dueDate" | "createdAt" | "amount"; orderDirection: "asc" | "desc" }[] = [
  { value: "dueDate-asc", label: "Vencimento (mais próximo)", orderBy: "dueDate", orderDirection: "asc" },
  { value: "dueDate-desc", label: "Vencimento (mais distante)", orderBy: "dueDate", orderDirection: "desc" },
  { value: "amount-desc", label: "Valor (maior primeiro)", orderBy: "amount", orderDirection: "desc" },
  { value: "createdAt-desc", label: "Mais recentes", orderBy: "createdAt", orderDirection: "desc" },
];

function statusBadgeClass(status: ExpenseStatus): string {
  return status === "PAGO" ? "bg-sage/10 text-sage" : "bg-caramel/10 text-caramel";
}

function statusLabel(status: ExpenseStatus): string {
  return status === "PAGO" ? "Pago" : "Pendente";
}

function formatShortDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function DespesasAdminPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<{ pendingTotal: number; paidTotal: number } | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<string>("dueDate-asc");
  const [page, setPage] = useState(1);
  const [view, setView] = useViewMode("despesas");

  const [modal, setModal] = useState<ModalMode | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<ExpenseForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Expense | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await supplierApi.listSuppliersPaged({ pageSize: 1000, active: true });
        setSuppliers(result.items);
      } catch {
        toast.error("Erro ao carregar fornecedores de apoio.");
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const sortOption = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  async function loadStats() {
    try {
      const [pending, paid] = await Promise.all([
        expenseApi.listExpensesPaged({ pageSize: 1000, status: "PENDENTE" }),
        expenseApi.listExpensesPaged({ pageSize: 1000, status: "PAGO" }),
      ]);
      setStats({
        pendingTotal: pending.items.reduce((sum, e) => sum + e.amount, 0),
        paidTotal: paid.items.reduce((sum, e) => sum + e.amount, 0),
      });
    } catch {
      setStats(null);
    }
  }

  async function loadExpenses(silent = hasLoadedOnce.current) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await expenseApi.listExpensesPaged({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        status: statusFilter === "all" ? undefined : statusFilter,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        orderBy: sortOption.orderBy,
        orderDirection: sortOption.orderDirection,
      });
      setExpenses(result.items);
      setTotal(result.total);
      hasLoadedOnce.current = true;
    } catch (err) {
      if (silent) {
        toast.error("Erro ao atualizar lista de despesas.");
      } else {
        setError(err instanceof Error ? err.message : "Erro ao carregar despesas.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [page, debouncedSearch, statusFilter, categoryFilter, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadStats(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilter = searchInput.trim() !== "" || statusFilter !== "all" || categoryFilter !== "all";

  function handleStatusFilterChange(value: StatusFilter) { setStatusFilter(value); setPage(1); }
  function handleCategoryFilterChange(value: CategoryFilter) { setCategoryFilter(value); setPage(1); }
  function handleSortChange(value: string) { setSort(value); setPage(1); }

  // ── Formulário de criar/editar ─────────────────────────────────────────────

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditing(null);
    setModal("create");
  }

  function openEdit(expense: Expense) {
    setForm({
      description: expense.description,
      category: expense.category,
      amount: String(expense.amount),
      dueDate: expense.dueDate ?? "",
      supplierId: expense.supplierId ?? "",
      notes: expense.notes ?? "",
    });
    setFormErrors({});
    setEditing(expense);
    setModal("edit");
  }

  function closeModal() { setModal(null); setEditing(null); setFormErrors({}); }

  function setField<K extends keyof ExpenseForm>(key: K, value: ExpenseForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    const description = form.description.trim();
    if (!description) errs.description = "Descrição é obrigatória.";
    else if (description.length < 2) errs.description = "Mínimo 2 caracteres.";
    else if (description.length > 200) errs.description = "Máximo 200 caracteres.";

    const amount = parseFloat(form.amount);
    if (form.amount.trim() === "" || Number.isNaN(amount)) errs.amount = "Valor é obrigatório.";
    else if (amount <= 0) errs.amount = "Valor deve ser maior que zero.";

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
    const toastId = toast.loading(modal === "create" ? "Criando despesa…" : "Salvando alterações…");
    try {
      const payload: ExpenseInput = {
        description: form.description,
        category: form.category,
        amount: parseFloat(form.amount),
        dueDate: form.dueDate.trim() === "" ? null : form.dueDate,
        supplierId: form.supplierId === "" ? null : form.supplierId,
        notes: form.notes.trim() === "" ? null : form.notes,
      };
      if (modal === "create") {
        await expenseApi.createExpense(payload);
        toast.success("Despesa criada com sucesso.", { id: toastId });
      } else if (editing) {
        await expenseApi.updateExpense(editing.id, payload);
        toast.success("Despesa atualizada.", { id: toastId });
      }
      closeModal();
      await Promise.all([loadExpenses(true), loadStats()]);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar despesa.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Marcar pago/pendente, excluir ───────────────────────────────────────────

  async function handleTogglePaid(expense: Expense) {
    setActionLoading(expense.id);
    const toastId = toast.loading(expense.status === "PAGO" ? "Marcando como pendente…" : "Marcando como pago…");
    try {
      if (expense.status === "PAGO") {
        await expenseApi.markExpensePending(expense.id);
        toast.success("Despesa marcada como pendente.", { id: toastId });
      } else {
        await expenseApi.markExpensePaid(expense.id);
        toast.success("Despesa marcada como paga.", { id: toastId });
      }
      await Promise.all([loadExpenses(true), loadStats()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar status.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!confirmDelete) return;
    const expense = confirmDelete;
    setConfirmDelete(null);
    setActionLoading(expense.id);
    const toastId = toast.loading("Excluindo despesa…");
    try {
      await expenseApi.deleteExpense(expense.id);
      toast.success("Despesa excluída.", { id: toastId });
      await Promise.all([loadExpenses(true), loadStats()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir despesa.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  // ── Visões (Cards/Lista) ─────────────────────────────────────────────────────

  function renderActions(expense: Expense, variant: "card" | "row") {
    const base = variant === "card" ? "flex-1 rounded-xl py-2 text-sm font-semibold" : "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold";
    const neutral = "border border-sand transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50";
    const busy = actionLoading === expense.id;
    return (
      <>
        <button type="button" onClick={() => openEdit(expense)} disabled={busy} aria-label={`Editar despesa ${expense.description}`} className={`${base} ${neutral} text-chocolate`}>
          Editar
        </button>
        <button
          type="button"
          onClick={() => handleTogglePaid(expense)}
          disabled={busy}
          aria-label={expense.status === "PAGO" ? `Marcar ${expense.description} como pendente` : `Marcar ${expense.description} como pago`}
          className={`${base} ${expense.status === "PAGO" ? neutral + " text-muted" : "bg-sage/10 text-sage transition-colors hover:bg-sage/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:opacity-50"}`}
        >
          {busy ? "…" : expense.status === "PAGO" ? "Marcar pendente" : "Marcar pago"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmDelete(expense)}
          disabled={busy}
          aria-label={`Excluir despesa ${expense.description}`}
          className={`${variant === "card" ? "rounded-xl px-3 py-2 text-sm" : "shrink-0 rounded-lg px-3 py-1.5 text-xs"} border border-rose/40 font-semibold text-rose transition-colors hover:bg-rose/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose disabled:opacity-50`}
        >
          Excluir
        </button>
      </>
    );
  }

  const columns: EntityColumn<Expense>[] = [
    {
      key: "description",
      header: "Descrição",
      render: (e) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-chocolate">{e.description}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(e.status)}`}>{statusLabel(e.status)}</span>
        </div>
      ),
    },
    { key: "category", header: "Categoria", className: "hidden md:table-cell", render: (e) => <span className="text-muted">{EXPENSE_CATEGORY_LABELS[e.category]}</span> },
    { key: "dueDate", header: "Vencimento", className: "hidden lg:table-cell", render: (e) => <span className="text-muted">{e.dueDate ? formatShortDate(e.dueDate) : "—"}</span> },
    { key: "amount", header: "Valor", className: "text-right", render: (e) => <span className="font-semibold text-chocolate">{formatCurrency(e.amount)}</span> },
  ];

  return (
    <PageContainer>
      <HeaderMinimal title="Despesas" />

      <div className="space-y-4 p-5">
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard value={formatCurrency(stats.pendingTotal)} label="Total pendente" />
            <StatCard value={formatCurrency(stats.paidTotal)} label="Total pago" />
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${total} despesa${total !== 1 ? "s" : ""}`}
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

        {!error && (
          <div className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="md:flex-1">
                <SearchBar value={searchInput} onChange={setSearchInput} placeholder="Pesquisar por descrição…" ariaLabel="Pesquisar despesa por descrição" />
              </div>
              <div className="md:w-64">
                <label htmlFor="filter-sort" className="sr-only">Ordenar por</label>
                <select id="filter-sort" className="input-field" value={sort} onChange={(e) => handleSortChange(e.target.value)}>
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <FilterChips
              label="Status"
              selected={statusFilter}
              onSelect={handleStatusFilterChange}
              options={[
                { value: "all", label: "Todas" },
                { value: "PENDENTE", label: "Pendentes" },
                { value: "PAGO", label: "Pagas" },
              ]}
            />
            <FilterChips
              label="Categoria"
              selected={categoryFilter}
              onSelect={handleCategoryFilterChange}
              options={[{ value: "all", label: "Todas" }, ...(Object.entries(EXPENSE_CATEGORY_LABELS) as [ExpenseCategory, string][]).map(([value, label]) => ({ value, label }))]}
            />
          </div>
        )}

        {loading && <LoadingState count={3} />}
        {!loading && error && <ErrorState message={error} onRetry={() => loadExpenses(false)} />}
        {!loading && !error && expenses.length === 0 && (
          <EmptyState
            title={hasActiveFilter ? "Nenhuma despesa encontrada" : "Nenhuma despesa cadastrada"}
            description={hasActiveFilter ? "Ajuste a pesquisa ou os filtros para ver todas as despesas." : "Cadastre a primeira despesa."}
            actionLabel={hasActiveFilter ? undefined : "+ Criar despesa"}
            onAction={hasActiveFilter ? undefined : openCreate}
          />
        )}
        {!loading && !error && expenses.length > 0 && (
          <>
            {view === "grid" && (
              <ResponsiveGrid cols={3}>
                {expenses.map((expense) => (
                  <EntityCard
                    key={expense.id}
                    title={expense.description}
                    badges={<span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(expense.status)}`}>{statusLabel(expense.status)}</span>}
                    actions={renderActions(expense, "card")}
                  >
                    <p className="text-xs text-muted">
                      {EXPENSE_CATEGORY_LABELS[expense.category]}
                      {expense.supplier ? ` · ${expense.supplier.name}` : ""}
                      {expense.dueDate ? ` · vence ${formatShortDate(expense.dueDate)}` : ""}
                    </p>
                    <p className="text-sm font-semibold text-chocolate">{formatCurrency(expense.amount)}</p>
                  </EntityCard>
                ))}
              </ResponsiveGrid>
            )}
            {view === "list" && (
              <EntityTable items={expenses} columns={columns} getKey={(e) => e.id} renderActions={(e) => renderActions(e, "row")} />
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-xl border border-sand px-4 py-2 text-sm font-semibold text-chocolate disabled:opacity-50">
                  ‹ Anterior
                </button>
                <p className="text-xs text-muted">Página {page} de {totalPages}</p>
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-xl border border-sand px-4 py-2 text-sm font-semibold text-chocolate disabled:opacity-50">
                  Próxima ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <EntityForm
          title={modal === "create" ? "Nova despesa" : "Editar despesa"}
          submitting={submitting}
          submitLabel={modal === "create" ? "Criar" : "Salvar"}
          onClose={closeModal}
          onSubmit={handleSubmit}
        >
          <Field label="Descrição" required htmlFor="exp-description" error={formErrors.description}>
            <input
              id="exp-description"
              className={`input-field ${formErrors.description ? "border-rose" : ""}`}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Ex: Aluguel de setembro"
              maxLength={200}
              disabled={submitting}
            />
          </Field>

          <Field label="Categoria" required htmlFor="exp-category">
            <select id="exp-category" className="input-field" value={form.category} onChange={(e) => setField("category", e.target.value as ExpenseCategory)} disabled={submitting}>
              {(Object.entries(EXPENSE_CATEGORY_LABELS) as [ExpenseCategory, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          <Field label="Valor" required htmlFor="exp-amount" error={formErrors.amount}>
            <input
              id="exp-amount"
              type="number"
              step="any"
              min={0}
              className={`input-field ${formErrors.amount ? "border-rose" : ""}`}
              value={form.amount}
              onChange={(e) => setField("amount", e.target.value)}
              placeholder="Ex: 1200.00"
              disabled={submitting}
            />
          </Field>

          <Field label="Vencimento (opcional)" htmlFor="exp-due-date" error={formErrors.dueDate}>
            <input
              id="exp-due-date"
              type="date"
              className={`input-field ${formErrors.dueDate ? "border-rose" : ""}`}
              value={form.dueDate}
              onChange={(e) => setField("dueDate", e.target.value)}
              disabled={submitting}
            />
          </Field>

          <Field label="Fornecedor (opcional)" htmlFor="exp-supplier">
            <select id="exp-supplier" className="input-field" value={form.supplierId} onChange={(e) => setField("supplierId", e.target.value)} disabled={submitting}>
              <option value="">Sem fornecedor</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>

          <Field label="Observações (opcional)" htmlFor="exp-notes" error={formErrors.notes}>
            <textarea
              id="exp-notes"
              className={`input-field ${formErrors.notes ? "border-rose" : ""}`}
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              maxLength={500}
              rows={3}
              disabled={submitting}
            />
          </Field>
        </EntityForm>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir despesa?"
          description={<><strong className="text-chocolate">{'"'}{confirmDelete.description}{'"'}</strong> será excluída permanentemente.</>}
          cancelLabel="Cancelar"
          confirmLabel="Excluir"
          busy={actionLoading === confirmDelete.id}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </PageContainer>
  );
}
