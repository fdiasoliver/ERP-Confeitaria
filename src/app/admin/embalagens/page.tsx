"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { Field } from "@/components/admin/config/FormPrimitives";
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
import { EntityTable, type EntityColumn } from "@/components/shared/EntityTable";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { EntityForm } from "@/components/admin/shared/EntityForm";
import { useViewMode } from "@/hooks/useViewMode";
import { formatCurrency } from "@/lib/formatters/currency";
import type { ValidationError } from "@/lib/types";
import * as packagingApi from "@/lib/api/packagingApi";
import { ApiRequestError, type Packaging, type PackagingInput } from "@/lib/api/packagingApi";
import * as packagingCategoryApi from "@/lib/api/packagingCategoryApi";
import type { PackagingCategory } from "@/lib/api/packagingCategoryApi";
import * as supplierApi from "@/lib/api/supplierApi";
import type { Supplier } from "@/lib/api/supplierApi";

// ── Local types ────────────────────────────────────────────────────────────────

interface PackagingForm {
  name: string;
  categoryId: string;
  unitCost: string;
  stockQuantity: string;
  minStock: string;
  supplierId: string;
}

const EMPTY_FORM: PackagingForm = {
  name: "",
  categoryId: "",
  unitCost: "",
  stockQuantity: "0",
  minStock: "0",
  supplierId: "",
};

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

export default function EmbalagensAdminPage() {
  const [packagings, setPackagings] = useState<Packaging[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<{ total: number; active: number; lowStock: number } | null>(null);
  const [categories, setCategories] = useState<PackagingCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sort, setSort] = useState<string>("name-asc");
  const [page, setPage] = useState(1);
  const [view, setView] = useViewMode("embalagens");

  const [modal, setModal] = useState<"create" | null>(null);
  const [form, setForm] = useState<PackagingForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [confirmDeactivate, setConfirmDeactivate] = useState<Packaging | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const hasLoadedOnce = useRef(false);

  // Dados de apoio (categorias e fornecedores ativos) — carregados uma única vez,
  // usados nos filtros e no formulário. Mesmo padrão de produtos/page.tsx.
  useEffect(() => {
    (async () => {
      try {
        const [categoryRows, supplierRows] = await Promise.all([
          packagingCategoryApi.listPackagingCategories(),
          supplierApi.listSuppliersPaged({ pageSize: 1000, active: true }),
        ]);
        setCategories(categoryRows);
        setSuppliers(supplierRows.items);
      } catch {
        toast.error("Erro ao carregar categorias e fornecedores de apoio.");
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
      const [all, active, low] = await Promise.all([
        packagingApi.listPackagingsPaged({ pageSize: 1 }),
        packagingApi.listPackagingsPaged({ pageSize: 1, active: true }),
        packagingApi.listActivePackagings(),
      ]);
      setStats({ total: all.total, active: active.total, lowStock: low.filter((p) => p.isLowStock).length });
    } catch {
      setStats(null);
    }
  }

  async function loadPackagings(silent = hasLoadedOnce.current) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await packagingApi.listPackagingsPaged({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        active: statusFilter === "all" ? undefined : statusFilter === "active",
        orderBy: sortOption.orderBy,
        orderDirection: sortOption.orderDirection,
      });
      const items = lowStockOnly ? result.items.filter((p) => p.isLowStock) : result.items;
      setPackagings(items);
      setTotal(lowStockOnly ? items.length : result.total);
      hasLoadedOnce.current = true;
    } catch (err) {
      if (silent) {
        toast.error("Erro ao atualizar lista de embalagens.");
      } else {
        setError(err instanceof Error ? err.message : "Erro ao carregar embalagens.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadPackagings(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [page, debouncedSearch, statusFilter, categoryFilter, lowStockOnly, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadStats(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilter = searchInput.trim() !== "" || statusFilter !== "all" || categoryFilter !== "all" || lowStockOnly;

  function handleStatusFilterChange(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleCategoryFilterChange(value: string) {
    setCategoryFilter(value);
    setPage(1);
  }

  function handleSortChange(value: string) {
    setSort(value);
    setPage(1);
  }

  // ── Formulário de criação (e duplicação) ───────────────────────────────────

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModal("create");
  }

  function openDuplicate(source: Packaging) {
    setForm({
      name: `${source.name} (cópia)`,
      categoryId: source.categoryId ?? "",
      unitCost: String(source.unitCost),
      stockQuantity: "0",
      minStock: String(source.minStock),
      supplierId: source.supplierId ?? "",
    });
    setFormErrors({});
    setModal("create");
  }

  function closeModal() { setModal(null); setFormErrors({}); }

  function setField<K extends keyof PackagingForm>(key: K, value: PackagingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    const name = form.name.trim();
    if (!name) errs.name = "Nome é obrigatório.";
    else if (name.length < 2) errs.name = "Mínimo 2 caracteres.";
    else if (name.length > 150) errs.name = "Máximo 150 caracteres.";

    const cost = parseFloat(form.unitCost);
    if (form.unitCost.trim() === "" || Number.isNaN(cost)) errs.unitCost = "Custo unitário é obrigatório.";
    else if (cost < 0) errs.unitCost = "Não pode ser negativo.";

    const stock = parseInt(form.stockQuantity, 10);
    if (form.stockQuantity.trim() !== "" && (!Number.isInteger(stock) || stock < 0)) {
      errs.stockQuantity = "Número inteiro ≥ 0.";
    }
    const min = parseInt(form.minStock, 10);
    if (form.minStock.trim() !== "" && (!Number.isInteger(min) || min < 0)) {
      errs.minStock = "Número inteiro ≥ 0.";
    }

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
    const toastId = toast.loading("Criando embalagem…");
    try {
      const input: PackagingInput = {
        name: form.name.trim(),
        categoryId: form.categoryId === "" ? null : form.categoryId,
        unitCost: parseFloat(form.unitCost),
        stockQuantity: form.stockQuantity.trim() === "" ? 0 : parseInt(form.stockQuantity, 10),
        minStock: form.minStock.trim() === "" ? 0 : parseInt(form.minStock, 10),
        supplierId: form.supplierId === "" ? null : form.supplierId,
      };
      await packagingApi.createPackaging(input);
      toast.success("Embalagem criada com sucesso.", { id: toastId });
      closeModal();
      await Promise.all([loadPackagings(true), loadStats()]);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else if (err instanceof ApiRequestError && err.code === "DUPLICATE_NAME") {
        setFormErrors({ name: err.message });
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao criar embalagem.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Ativar/Desativar ────────────────────────────────────────────────────────

  async function handleActivate(packaging: Packaging) {
    setActionLoading(packaging.id);
    const toastId = toast.loading("Ativando embalagem…");
    try {
      await packagingApi.activatePackaging(packaging.id);
      toast.success(`"${packaging.name}" ativada com sucesso.`, { id: toastId });
      await Promise.all([loadPackagings(true), loadStats()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar embalagem.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmDeactivate) return;
    const packaging = confirmDeactivate;
    setConfirmDeactivate(null);
    setActionLoading(packaging.id);
    const toastId = toast.loading("Desativando embalagem…");
    try {
      await packagingApi.deactivatePackaging(packaging.id);
      toast.success(`"${packaging.name}" desativada.`, { id: toastId });
      await Promise.all([loadPackagings(true), loadStats()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao desativar embalagem.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  // Mesmas ações nas duas visões — mesmo padrão de admin/ingredientes/page.tsx.
  function renderActions(packaging: Packaging, variant: "card" | "row") {
    const base =
      variant === "card"
        ? "flex-1 rounded-xl py-2 text-sm font-semibold"
        : "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold";
    const neutral = "border border-sand transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50";
    const busy = actionLoading === packaging.id;
    return (
      <>
        <button
          type="button"
          onClick={() => openDuplicate(packaging)}
          disabled={busy}
          aria-label={`Duplicar embalagem ${packaging.name}`}
          className={`${base} ${neutral} text-chocolate`}
        >
          Duplicar
        </button>
        {packaging.active ? (
          <button
            type="button"
            onClick={() => setConfirmDeactivate(packaging)}
            disabled={busy}
            aria-label={`Desativar embalagem ${packaging.name}`}
            className={`${base} ${neutral} text-muted`}
          >
            {busy ? "…" : "Desativar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleActivate(packaging)}
            disabled={busy}
            aria-label={`Ativar embalagem ${packaging.name}`}
            className={`${base} bg-sage/10 text-sage transition-colors hover:bg-sage/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:opacity-50`}
          >
            {busy ? "…" : "Ativar"}
          </button>
        )}
      </>
    );
  }

  const columns: EntityColumn<Packaging>[] = [
    {
      key: "name",
      header: "Nome",
      render: (p) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-chocolate">{p.name}</span>
          <StatusBadge isActive={p.active} activeLabel="Ativa" inactiveLabel="Inativa" />
          {p.isLowStock && (
            <span className="inline-flex rounded-full bg-rose/10 px-2 py-0.5 text-xs font-semibold text-rose">
              Estoque baixo
            </span>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Categoria",
      className: "hidden md:table-cell",
      render: (p) => <span className="text-muted">{p.categoryName ?? "Sem categoria"}</span>,
    },
    {
      key: "supplier",
      header: "Fornecedor",
      className: "hidden lg:table-cell",
      render: (p) => <span className="text-muted">{p.supplierName ?? "—"}</span>,
    },
    {
      key: "unitCost",
      header: "Custo unitário",
      className: "text-right",
      render: (p) => <span className="font-semibold text-chocolate">{formatCurrency(p.unitCost)}</span>,
    },
    {
      key: "stock",
      header: "Estoque",
      className: "hidden text-right sm:table-cell",
      render: (p) => <span className={p.isLowStock ? "text-rose" : "text-chocolate"}>{p.stockQuantity}</span>,
    },
  ];

  return (
    <PageContainer>
      <HeaderMinimal title="Embalagens" />

      <div className="space-y-4 p-5">
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard value={stats.total} label="Total" />
            <StatCard value={stats.active} label="Ativas" />
            <StatCard value={stats.lowStock} label="Estoque baixo" />
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted">
              {loading ? "Carregando…" : `${total} embalage${total !== 1 ? "ns" : "m"}`}
            </p>
            <Link href="/admin/embalagens/categorias" className="text-sm font-medium text-chocolate underline">
              Categorias
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle value={view} onChange={setView} />
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate md:self-auto"
            >
              + Nova
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
                  ariaLabel="Pesquisar embalagem por nome"
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
                { value: "all", label: "Todas" },
                { value: "active", label: "Ativas" },
                { value: "inactive", label: "Inativas" },
              ]}
            />

            {categories.length > 0 && (
              <FilterChips
                label="Categoria"
                selected={categoryFilter}
                onSelect={handleCategoryFilterChange}
                options={[
                  { value: "all", label: "Todas" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            )}

            <label className="flex items-center gap-2 text-sm text-chocolate">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }}
              />
              Somente estoque baixo
            </label>
          </div>
        )}

        {loading && <LoadingState count={3} />}
        {!loading && error && <ErrorState message={error} onRetry={() => loadPackagings(false)} />}
        {!loading && !error && packagings.length === 0 && (
          <EmptyState
            title={hasActiveFilter ? "Nenhuma embalagem encontrada" : "Nenhuma embalagem cadastrada"}
            description={
              hasActiveFilter
                ? "Ajuste a pesquisa ou os filtros para ver todas as embalagens."
                : "Cadastre a primeira embalagem."
            }
            actionLabel={hasActiveFilter ? undefined : "+ Criar embalagem"}
            onAction={hasActiveFilter ? undefined : openCreate}
          />
        )}
        {!loading && !error && packagings.length > 0 && (
          <>
            {view === "grid" && (
              <ResponsiveGrid cols={3}>
                {packagings.map((packaging) => (
                  <EntityCard
                    key={packaging.id}
                    href={`/admin/embalagens/${packaging.id}`}
                    title={packaging.name}
                    badges={<StatusBadge isActive={packaging.active} activeLabel="Ativa" inactiveLabel="Inativa" />}
                    actions={renderActions(packaging, "card")}
                  >
                    <p className="text-xs text-muted">
                      {packaging.categoryName ?? "Sem categoria"}
                      {packaging.supplierName ? ` · ${packaging.supplierName}` : ""}
                    </p>
                    <p className="text-sm font-semibold text-chocolate">{formatCurrency(packaging.unitCost)}</p>
                    <p className={`text-xs ${packaging.isLowStock ? "text-rose" : "text-muted"}`}>
                      Estoque: {packaging.stockQuantity}{packaging.isLowStock ? " ⚠ abaixo do mínimo" : ""}
                    </p>
                  </EntityCard>
                ))}
              </ResponsiveGrid>
            )}
            {view === "list" && (
              <EntityTable
                items={packagings}
                columns={columns}
                getKey={(p) => p.id}
                renderActions={(p) => renderActions(p, "row")}
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
          title="Nova embalagem"
          submitting={submitting}
          submitLabel="Criar"
          onClose={closeModal}
          onSubmit={handleSubmit}
        >
          <Field label="Nome" required htmlFor="packaging-name" error={formErrors.name}>
            <input
              id="packaging-name"
              className={`input-field ${formErrors.name ? "border-rose" : ""}`}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ex: Caixa 25cm"
              maxLength={150}
              disabled={submitting}
            />
          </Field>

          <Field label="Categoria (opcional)" htmlFor="packaging-category">
            <select
              id="packaging-category"
              className="input-field"
              value={form.categoryId}
              onChange={(e) => setField("categoryId", e.target.value)}
              disabled={submitting}
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Custo unitário" required htmlFor="packaging-cost" error={formErrors.unitCost}>
            <input
              id="packaging-cost"
              type="number"
              step="any"
              min={0}
              className={`input-field ${formErrors.unitCost ? "border-rose" : ""}`}
              value={form.unitCost}
              onChange={(e) => setField("unitCost", e.target.value)}
              placeholder="Ex: 3.20"
              disabled={submitting}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Estoque atual" htmlFor="packaging-stock" error={formErrors.stockQuantity}>
              <input
                id="packaging-stock"
                type="number"
                step="1"
                min={0}
                className={`input-field ${formErrors.stockQuantity ? "border-rose" : ""}`}
                value={form.stockQuantity}
                onChange={(e) => setField("stockQuantity", e.target.value)}
                disabled={submitting}
              />
            </Field>
            <Field label="Estoque mínimo" htmlFor="packaging-min-stock" error={formErrors.minStock}>
              <input
                id="packaging-min-stock"
                type="number"
                step="1"
                min={0}
                className={`input-field ${formErrors.minStock ? "border-rose" : ""}`}
                value={form.minStock}
                onChange={(e) => setField("minStock", e.target.value)}
                disabled={submitting}
              />
            </Field>
          </div>

          <Field label="Fornecedor (opcional)" htmlFor="packaging-supplier">
            <select
              id="packaging-supplier"
              className="input-field"
              value={form.supplierId}
              onChange={(e) => setField("supplierId", e.target.value)}
              disabled={submitting}
            >
              <option value="">Sem fornecedor</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
        </EntityForm>
      )}

      {confirmDeactivate && (
        <ConfirmDialog
          title="Desativar embalagem?"
          description={
            <>
              <strong className="text-chocolate">{'"'}{confirmDeactivate.name}{'"'}</strong> não poderá ser vinculada a novos produtos.
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
