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
import { formatCurrency } from "@/lib/formatters/currency";
import * as ingredientApi from "@/lib/api/ingredientApi";
import { ApiRequestError, type Ingredient } from "@/lib/api/ingredientApi";
import * as categoryApi from "@/lib/api/ingredientCategoryApi";
import type { IngredientCategory } from "@/lib/api/ingredientCategoryApi";
import * as unitApi from "@/lib/api/unitApi";
import type { UnitOfMeasure } from "@/lib/api/unitApi";

// ── Local types ────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";
interface IngredientForm {
  name: string;
  categoryId: string;
  unitId: string;
  currentPrice: string;
  stockQuantity: string;
  minStock: string;
  supplier: string;
  externalCode: string;
}
const EMPTY_FORM: IngredientForm = {
  name: "", categoryId: "", unitId: "", currentPrice: "", stockQuantity: "0", minStock: "0", supplier: "", externalCode: "",
};

type StatusFilter = "all" | "active" | "inactive";

// Exclusivo deste módulo — não é um componente duplicado em outro lugar do
// admin, por isso não foi promovido para src/components/admin/shared/.
function LowStockBadge() {
  return (
    <span className="inline-flex rounded-full bg-rose/10 px-2 py-0.5 text-xs font-semibold text-rose">
      Estoque baixo
    </span>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function IngredientesAdminPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useViewMode("ingredientes");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [form, setForm] = useState<IngredientForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<Ingredient | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadAll(silent = false) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const [ingredientRows, categoryRows, unitRows] = await Promise.all([
        ingredientApi.listIngredients(),
        categoryApi.listIngredientCategories(),
        unitApi.listUnits(),
      ]);
      setIngredients(ingredientRows);
      setCategories(categoryRows);
      setUnits(unitRows);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Erro ao carregar ingredientes.");
      } else {
        toast.error("Erro ao atualizar lista de ingredientes.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return ingredients
      .filter((i) => !term || i.name.toLowerCase().includes(term))
      .filter((i) => statusFilter === "all" || (statusFilter === "active" ? i.active : !i.active))
      .filter((i) => categoryFilter === "all" || i.categoryId === categoryFilter)
      .filter((i) => !lowStockOnly || i.isLowStock)
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [ingredients, search, statusFilter, categoryFilter, lowStockOnly]);

  const hasActiveFilter = search.trim() !== "" || statusFilter !== "all" || categoryFilter !== "all" || lowStockOnly;
  const canCreate = units.length > 0;

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditing(null);
    setModal("create");
  }

  function openEdit(ingredient: Ingredient) {
    setForm({
      name: ingredient.name,
      categoryId: ingredient.categoryId ?? "",
      unitId: ingredient.unitId,
      currentPrice: String(ingredient.currentPrice),
      stockQuantity: String(ingredient.stockQuantity),
      minStock: String(ingredient.minStock),
      supplier: ingredient.supplier ?? "",
      externalCode: ingredient.externalCode ?? "",
    });
    setFormErrors({});
    setEditing(ingredient);
    setModal("edit");
  }

  function closeModal() { setModal(null); setEditing(null); setFormErrors({}); }

  function setField<K extends keyof IngredientForm>(key: K, value: IngredientForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    const name = form.name.trim();
    if (!name) errs.name = "Nome é obrigatório.";
    else if (name.length < 2) errs.name = "Mínimo 2 caracteres.";
    else if (name.length > 100) errs.name = "Máximo 100 caracteres.";

    if (!form.unitId) errs.unitId = "Selecione a unidade de medida.";

    const price = parseFloat(form.currentPrice);
    if (form.currentPrice.trim() === "" || Number.isNaN(price)) errs.currentPrice = "Preço é obrigatório.";
    else if (price <= 0) errs.currentPrice = "Preço deve ser maior que zero.";

    const stock = parseFloat(form.stockQuantity);
    if (form.stockQuantity.trim() !== "" && (Number.isNaN(stock) || stock < 0)) errs.stockQuantity = "Deve ser maior ou igual a 0.";

    const minStock = parseFloat(form.minStock);
    if (form.minStock.trim() !== "" && (Number.isNaN(minStock) || minStock < 0)) errs.minStock = "Deve ser maior ou igual a 0.";

    if (form.supplier.length > 150) errs.supplier = "Máximo 150 caracteres.";
    if (form.externalCode.length > 50) errs.externalCode = "Máximo 50 caracteres.";

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
    const toastId = toast.loading(modal === "create" ? "Criando ingrediente…" : "Salvando alterações…");
    try {
      const payload = {
        name: form.name,
        categoryId: form.categoryId || null,
        unitId: form.unitId,
        currentPrice: parseFloat(form.currentPrice),
        stockQuantity: form.stockQuantity.trim() === "" ? undefined : parseFloat(form.stockQuantity),
        minStock: form.minStock.trim() === "" ? undefined : parseFloat(form.minStock),
        supplier: form.supplier.trim() || null,
        externalCode: form.externalCode.trim() || null,
      };
      if (modal === "create") {
        await ingredientApi.createIngredient(payload);
        toast.success("Ingrediente criado com sucesso.", { id: toastId });
      } else if (editing) {
        await ingredientApi.updateIngredient(editing.id, payload);
        toast.success("Ingrediente atualizado.", { id: toastId });
      }
      closeModal();
      await loadAll(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar ingrediente.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleActivate(ingredient: Ingredient) {
    setActionLoading(ingredient.id);
    const toastId = toast.loading("Ativando ingrediente…");
    try {
      await ingredientApi.activateIngredient(ingredient.id);
      toast.success(`"${ingredient.name}" ativado com sucesso.`, { id: toastId });
      await loadAll(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar ingrediente.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmDeactivate) return;
    const ingredient = confirmDeactivate;
    setConfirmDeactivate(null);
    setActionLoading(ingredient.id);
    const toastId = toast.loading("Desativando ingrediente…");
    try {
      await ingredientApi.deactivateIngredient(ingredient.id);
      toast.success(`"${ingredient.name}" desativado.`, { id: toastId });
      await loadAll(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao desativar ingrediente.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  // Mesmas ações nas duas visões — só a forma muda: na visão de cards os botões
  // ocupam a largura toda do rodapé; na lista ficam compactos no fim da linha.
  function renderActions(ingredient: Ingredient, variant: "card" | "row") {
    const base =
      variant === "card"
        ? "flex-1 rounded-xl py-2 text-sm font-semibold"
        : "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold";
    const neutral = "border border-sand transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50";
    const busy = actionLoading === ingredient.id;
    return (
      <>
        <button
          type="button"
          onClick={() => openEdit(ingredient)}
          disabled={busy}
          aria-label={`Editar ingrediente ${ingredient.name}`}
          className={`${base} ${neutral} text-chocolate`}
        >
          Editar
        </button>
        {ingredient.active ? (
          <button
            type="button"
            onClick={() => setConfirmDeactivate(ingredient)}
            disabled={busy}
            aria-label={`Desativar ingrediente ${ingredient.name}`}
            className={`${base} ${neutral} text-muted`}
          >
            {busy ? "…" : "Desativar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleActivate(ingredient)}
            disabled={busy}
            aria-label={`Ativar ingrediente ${ingredient.name}`}
            className={`${base} bg-sage/10 text-sage transition-colors hover:bg-sage/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:opacity-50`}
          >
            {busy ? "…" : "Ativar"}
          </button>
        )}
      </>
    );
  }

  const columns: EntityColumn<Ingredient>[] = [
    {
      key: "name",
      header: "Nome",
      render: (i) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-chocolate">{i.name}</span>
          <StatusBadge isActive={i.active} />
          {i.isLowStock && <LowStockBadge />}
        </div>
      ),
    },
    {
      key: "category",
      header: "Categoria",
      className: "hidden md:table-cell",
      render: (i) => <span className="text-muted">{i.categoryName ?? "Sem categoria"}</span>,
    },
    {
      key: "unit",
      header: "Unidade",
      className: "hidden lg:table-cell",
      render: (i) => <span className="text-muted">{i.unitName} ({i.unitAbbreviation})</span>,
    },
    {
      key: "price",
      header: "Preço",
      className: "text-right",
      render: (i) => (
        <span className="font-semibold text-chocolate">{formatCurrency(i.currentPrice)}</span>
      ),
    },
    {
      key: "stock",
      header: "Estoque",
      className: "text-right",
      render: (i) => <span className="text-chocolate">{i.stockQuantity}</span>,
    },
    {
      key: "minStock",
      header: "Mínimo",
      className: "hidden text-right sm:table-cell",
      render: (i) => <span className="text-muted">{i.minStock}</span>,
    },
  ];

  return (
    <PageContainer>
      <HeaderMinimal title="Ingredientes" />

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/admin/ingredientes/categorias" className="text-sm font-medium text-chocolate underline">
            Categorias de ingrediente →
          </Link>
          <Link href="/admin/ingredientes/importar-nota" className="text-sm font-medium text-chocolate underline">
            Importar nota fiscal →
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${filtered.length} ingrediente${filtered.length !== 1 ? "s" : ""}`}
          </p>
          <div className="flex items-center gap-2">
            {!loading && !error && <ViewToggle value={view} onChange={setView} />}
            <button
              type="button"
              onClick={openCreate}
              disabled={!canCreate}
              className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50"
            >
              + Novo
            </button>
          </div>
        </div>

        {!loading && !error && (
          <div className="space-y-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Pesquisar por nome…"
              ariaLabel="Pesquisar ingrediente por nome"
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
            {categories.length > 0 && (
              <FilterChips
                label="Categoria"
                selected={categoryFilter}
                onSelect={setCategoryFilter}
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
                onChange={(e) => setLowStockOnly(e.target.checked)}
              />
              Somente estoque baixo
            </label>
          </div>
        )}

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={loadAll} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title={hasActiveFilter ? "Nenhum ingrediente encontrado" : "Nenhum ingrediente cadastrado"}
            description={
              hasActiveFilter
                ? "Ajuste a pesquisa ou os filtros para ver todos os ingredientes."
                : canCreate
                  ? "Cadastre o primeiro ingrediente."
                  : "Cadastre pelo menos uma unidade de medida antes de criar um ingrediente."
            }
            actionLabel={!hasActiveFilter && canCreate ? "+ Criar ingrediente" : undefined}
            onAction={!hasActiveFilter && canCreate ? openCreate : undefined}
          />
        )}
        {!loading && !error && filtered.length > 0 && view === "grid" && (
          <ResponsiveGrid cols={3}>
            {filtered.map((ingredient) => (
              <EntityCard
                key={ingredient.id}
                title={ingredient.name}
                badges={
                  <>
                    <StatusBadge isActive={ingredient.active} />
                    {ingredient.isLowStock && <LowStockBadge />}
                  </>
                }
                actions={renderActions(ingredient, "card")}
              >
                <p className="text-xs text-muted">
                  {ingredient.categoryName ?? "Sem categoria"} · {ingredient.unitName} ({ingredient.unitAbbreviation})
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <p className="text-sm font-semibold leading-none text-chocolate">{formatCurrency(ingredient.currentPrice)}</p>
                    <p className="mt-0.5 text-[10px] text-muted">Preço/{ingredient.unitAbbreviation}</p>
                  </div>
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <p className="text-sm font-semibold leading-none text-chocolate">{ingredient.stockQuantity}</p>
                    <p className="mt-0.5 text-[10px] text-muted">Estoque</p>
                  </div>
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <p className="text-sm font-semibold leading-none text-chocolate">{ingredient.minStock}</p>
                    <p className="mt-0.5 text-[10px] text-muted">Mínimo</p>
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
            getKey={(i) => i.id}
            renderActions={(i) => renderActions(i, "row")}
          />
        )}
      </div>

      {modal && (
        <EntityForm
          title={modal === "create" ? "Novo ingrediente" : "Editar ingrediente"}
          submitting={submitting}
          submitLabel={modal === "create" ? "Criar" : "Salvar"}
          onClose={closeModal}
          onSubmit={handleSubmit}
        >
          <Field label="Nome" required htmlFor="ing-name" error={formErrors.name}>
            <input
              id="ing-name"
              className={`input-field ${formErrors.name ? "border-rose" : ""}`}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ex: Farinha de trigo"
              maxLength={100}
              disabled={submitting}
            />
          </Field>

          <Field label="Categoria" htmlFor="ing-category" error={formErrors.categoryId}>
            <select
              id="ing-category"
              className={`input-field ${formErrors.categoryId ? "border-rose" : ""}`}
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

          <Field label="Unidade de medida" required htmlFor="ing-unit" error={formErrors.unitId}>
            <select
              id="ing-unit"
              className={`input-field ${formErrors.unitId ? "border-rose" : ""}`}
              value={form.unitId}
              onChange={(e) => setField("unitId", e.target.value)}
              disabled={submitting}
            >
              <option value="">Selecione…</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
              ))}
            </select>
          </Field>

          <Field label="Preço atual (por unidade)" required htmlFor="ing-price" error={formErrors.currentPrice}>
            <input
              id="ing-price"
              type="number"
              step="any"
              min={0}
              className={`input-field ${formErrors.currentPrice ? "border-rose" : ""}`}
              value={form.currentPrice}
              onChange={(e) => setField("currentPrice", e.target.value)}
              placeholder="Ex: 5.90"
              disabled={submitting}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Estoque atual" htmlFor="ing-stock" error={formErrors.stockQuantity}>
              <input
                id="ing-stock"
                type="number"
                step="any"
                min={0}
                className={`input-field ${formErrors.stockQuantity ? "border-rose" : ""}`}
                value={form.stockQuantity}
                onChange={(e) => setField("stockQuantity", e.target.value)}
                disabled={submitting}
              />
            </Field>
            <Field label="Estoque mínimo" htmlFor="ing-min-stock" error={formErrors.minStock}>
              <input
                id="ing-min-stock"
                type="number"
                step="any"
                min={0}
                className={`input-field ${formErrors.minStock ? "border-rose" : ""}`}
                value={form.minStock}
                onChange={(e) => setField("minStock", e.target.value)}
                disabled={submitting}
              />
            </Field>
          </div>

          <Field label="Fornecedor (opcional)" htmlFor="ing-supplier" error={formErrors.supplier}>
            <input
              id="ing-supplier"
              className={`input-field ${formErrors.supplier ? "border-rose" : ""}`}
              value={form.supplier}
              onChange={(e) => setField("supplier", e.target.value)}
              maxLength={150}
              disabled={submitting}
            />
          </Field>

          <Field label="Código externo (opcional)" htmlFor="ing-external-code" error={formErrors.externalCode}>
            <input
              id="ing-external-code"
              className={`input-field ${formErrors.externalCode ? "border-rose" : ""}`}
              value={form.externalCode}
              onChange={(e) => setField("externalCode", e.target.value)}
              maxLength={50}
              disabled={submitting}
            />
          </Field>
        </EntityForm>
      )}

      {confirmDeactivate && (
        <ConfirmDialog
          title="Desativar ingrediente?"
          description={
            <>
              <strong className="text-chocolate">{'"'}{confirmDeactivate.name}{'"'}</strong> deixará de aparecer nas opções de cadastro de receitas.
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
