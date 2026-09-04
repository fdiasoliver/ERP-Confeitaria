"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import type { ValidationError, ProductCategoryWithCount } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters/currency";
import * as productApi from "@/lib/api/productApi";
import { ApiRequestError, type Product, type ProductInput } from "@/lib/api/productApi";
import * as productCategoryApi from "@/lib/api/productCategoryApi";
import * as recipeApi from "@/lib/api/recipeApi";
import type { Recipe } from "@/lib/api/recipeApi";
import { UploadImage } from "@/components/admin/config/UploadImage";
import { Field, Section } from "@/components/admin/config/FormPrimitives";
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
import { EntityForm } from "@/components/admin/shared/EntityForm";

// ── Local types ────────────────────────────────────────────────────────────────

interface RecipeLinkForm {
  recipeId: string;
  quantity: string;
}

interface ProductForm {
  name: string;
  description: string;
  categoryId: string;
  imageUrl: string | null;
  basePrice: string;
  leadTimeDays: string;
  featured: boolean;
  recipes: RecipeLinkForm[];
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  categoryId: "",
  imageUrl: null,
  basePrice: "",
  leadTimeDays: "0",
  featured: false,
  recipes: [],
};

type StatusFilter = "all" | "active" | "inactive";
type ModalMode = "create" | "edit";

interface ConfirmAction {
  type: "deactivate" | "delete";
  product: Product;
}

const PAGE_SIZE = 12;

const SORT_OPTIONS: {
  value: string;
  label: string;
  orderBy: "name" | "basePrice" | "createdAt";
  orderDirection: "asc" | "desc";
}[] = [
  { value: "name-asc", label: "Nome (A-Z)", orderBy: "name", orderDirection: "asc" },
  { value: "name-desc", label: "Nome (Z-A)", orderBy: "name", orderDirection: "desc" },
  { value: "basePrice-asc", label: "Preço (menor primeiro)", orderBy: "basePrice", orderDirection: "asc" },
  { value: "basePrice-desc", label: "Preço (maior primeiro)", orderBy: "basePrice", orderDirection: "desc" },
  { value: "createdAt-desc", label: "Mais recentes", orderBy: "createdAt", orderDirection: "desc" },
  { value: "createdAt-asc", label: "Mais antigos", orderBy: "createdAt", orderDirection: "asc" },
];

// ── Máscara monetária (Sprint 2.J.2.1, Item 3) ──────────────────────────────────
// `form.basePrice` continua sendo uma string decimal simples ("89.9"), compatível
// com `parseFloat` já usado em validação/envio — a máscara é só de exibição.

function formatBRLInput(decimalString: string): string {
  const value = parseFloat(decimalString);
  return formatCurrency(Number.isNaN(value) ? 0 : value);
}

function parseBRLInput(rawTyped: string): string {
  const digits = rawTyped.replace(/\D/g, "");
  if (digits === "") return "";
  const cents = parseInt(digits, 10);
  return (cents / 100).toFixed(2);
}

// ── Ícones — exclusivos deste módulo, sem duplicação em outro lugar do admin ────

function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" width={14} height={14} {...props}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

function IconRecipe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={16} height={16} {...props}>
      <path d="M5 3h7l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M12 3v3h3M7 10h6M7 13h6" />
    </svg>
  );
}

function IconPackage(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={20} height={20} {...props}>
      <path d="M3 6.5L10 3l7 3.5-7 3.5-7-3.5z" />
      <path d="M3 6.5V14l7 3.5 7-3.5V6.5M10 10v7.5" />
    </svg>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

// useSearchParams() (usado para reabrir o modal via ?edit=id) exige um limite de
// Suspense — mesma convenção já usada em src/app/page.tsx (?cart=open).
export default function ProdutosAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Carregando…</div>}>
      <ProdutosAdminPageContent />
    </Suspense>
  );
}

function ProdutosAdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<ProductCategoryWithCount[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<string>("name-asc");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<ModalMode | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const hasLoadedOnce = useRef(false);

  // Dados de apoio (categorias e receitas ativas) — carregados uma única vez,
  // usados no filtro de categoria e no formulário de vínculo de receitas.
  useEffect(() => {
    (async () => {
      try {
        const [categoryRows, recipeRows] = await Promise.all([
          productCategoryApi.listCategories(),
          recipeApi.listRecipes(),
        ]);
        setCategories(categoryRows);
        setRecipes(recipeRows);
      } catch {
        toast.error("Erro ao carregar categorias e receitas de apoio.");
      }
    })();
  }, []);

  // Reabre o modal de edição a partir de /admin/produtos/[id] ("Editar produto")
  // — mesma convenção de /?cart=open já documentada em CLAUDE.md. Busca o produto
  // direto pela API (não depende da página paginada atual já conter o item) e
  // limpa o parâmetro da URL depois de abrir, para não reabrir em um refresh.
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId) return;
    (async () => {
      try {
        const product = await productApi.getProduct(editId);
        openEdit(product);
      } catch {
        toast.error("Produto não encontrado.");
      } finally {
        router.replace("/admin/produtos");
      }
    })();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce da pesquisa (~300ms) — evita um fetch por caractere digitado (busca é server-side).
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const sortOption = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  async function loadProducts(silent = hasLoadedOnce.current) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await productApi.listProductsPaged({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        categoryId: categoryFilter,
        active: statusFilter === "all" ? undefined : statusFilter === "active",
        orderBy: sortOption.orderBy,
        orderDirection: sortOption.orderDirection,
      });
      setProducts(result.items);
      setTotal(result.total);
      hasLoadedOnce.current = true;
    } catch (err) {
      if (silent) {
        toast.error("Erro ao atualizar lista de produtos.");
      } else {
        setError(err instanceof Error ? err.message : "Erro ao carregar produtos.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // Toda mudança de busca/filtro/ordenação/página refaz o fetch — nunca filtra em memória.
  useEffect(() => {
    loadProducts(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [page, debouncedSearch, categoryFilter, statusFilter, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilter = searchInput.trim() !== "" || categoryFilter !== "" || statusFilter !== "all";
  const canCreate = categories.some((c) => c.isActive);

  function handleCategoryFilterChange(id: string) {
    setCategoryFilter(id);
    setPage(1);
  }

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

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description ?? "",
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      basePrice: String(product.basePrice),
      leadTimeDays: String(product.leadTimeDays),
      featured: product.featured,
      recipes: product.recipes.map((r) => ({ recipeId: r.recipeId, quantity: String(r.quantity) })),
    });
    setFormErrors({});
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditing(null);
    setFormErrors({});
  }

  function setField<K extends keyof Omit<ProductForm, "recipes">>(key: K, value: ProductForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function setRecipeField(index: number, key: keyof RecipeLinkForm, value: string) {
    setForm((prev) => ({
      ...prev,
      recipes: prev.recipes.map((r, i) => (i === index ? { ...r, [key]: value } : r)),
    }));
    setFormErrors((prev) => {
      const n = { ...prev };
      delete n[`recipes[${index}].${key}`];
      delete n.recipes;
      return n;
    });
  }

  function addRecipeRow() {
    setForm((prev) => ({ ...prev, recipes: [...prev.recipes, { recipeId: "", quantity: "" }] }));
  }

  function removeRecipeRow(index: number) {
    setForm((prev) => ({ ...prev, recipes: prev.recipes.filter((_, i) => i !== index) }));
  }

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    const name = form.name.trim();
    if (!name || name.length < 2 || name.length > 150) errs.name = "Nome deve ter entre 2 e 150 caracteres.";

    if (!form.categoryId) errs.categoryId = "Categoria é obrigatória.";

    const basePrice = parseFloat(form.basePrice);
    if (form.basePrice.trim() === "" || Number.isNaN(basePrice) || basePrice <= 0) {
      errs.basePrice = "Preço de venda deve ser maior que zero.";
    }

    if (form.leadTimeDays.trim() !== "") {
      const lead = parseFloat(form.leadTimeDays);
      if (Number.isNaN(lead) || lead < 0) errs.leadTimeDays = "Prazo de produção não pode ser negativo.";
    }

    if (form.description.length > 500) errs.description = "Descrição deve ter no máximo 500 caracteres.";

    form.recipes.forEach((row, index) => {
      if (!row.recipeId) errs[`recipes[${index}].recipeId`] = "Selecione uma receita.";
      const qty = parseFloat(row.quantity);
      if (row.quantity.trim() === "" || Number.isNaN(qty)) errs[`recipes[${index}].quantity`] = "Informe a quantidade.";
      else if (qty <= 0) errs[`recipes[${index}].quantity`] = "Deve ser maior que zero.";
    });

    const ids = form.recipes.map((r) => r.recipeId).filter(Boolean);
    if (new Set(ids).size !== ids.length) errs.recipes = "O produto não pode ter a mesma receita repetida.";

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
    const toastId = toast.loading(modal === "create" ? "Criando produto…" : "Salvando alterações…");
    try {
      const input: ProductInput = {
        name: form.name.trim(),
        description: form.description.trim() === "" ? null : form.description.trim(),
        categoryId: form.categoryId,
        imageUrl: form.imageUrl,
        basePrice: parseFloat(form.basePrice),
        leadTimeDays: form.leadTimeDays.trim() === "" ? undefined : parseFloat(form.leadTimeDays),
        featured: form.featured,
        recipes: form.recipes.map((r) => ({ recipeId: r.recipeId, quantity: parseFloat(r.quantity) })),
      };

      if (modal === "create") {
        await productApi.createProduct(input);
        toast.success("Produto criado com sucesso.", { id: toastId });
      } else if (editing) {
        await productApi.updateProduct(editing.id, input);
        toast.success("Produto atualizado.", { id: toastId });
      }
      closeModal();
      await loadProducts();
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else if (err instanceof ApiRequestError && err.code === "INACTIVE_CATEGORY") {
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar produto.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Ativar/Desativar/Excluir ────────────────────────────────────────────────

  async function handleActivate(product: Product) {
    setActionLoading(product.id);
    const toastId = toast.loading("Ativando produto…");
    try {
      await productApi.activateProduct(product.id);
      toast.success(`"${product.name}" ativado com sucesso.`, { id: toastId });
      await loadProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar produto.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;
    const { type, product } = confirmAction;
    setConfirmAction(null);
    setActionLoading(product.id);
    const toastId = toast.loading(type === "deactivate" ? "Desativando produto…" : "Excluindo produto…");
    try {
      if (type === "deactivate") {
        await productApi.deactivateProduct(product.id);
        toast.success(`"${product.name}" desativado.`, { id: toastId });
      } else {
        await productApi.deleteProduct(product.id);
        toast.success(`"${product.name}" excluído.`, { id: toastId });
      }
      await loadProducts();
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "PRODUCT_IN_USE") {
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao processar a ação.", { id: toastId });
      }
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <PageContainer>
      <HeaderMinimal title="Produtos" />

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${total} produto${total !== 1 ? "s" : ""}`}
          </p>
          <button
            type="button"
            onClick={openCreate}
            disabled={!canCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50"
          >
            <IconPlus /> Novo
          </button>
        </div>

        {!error && (
          <div className="space-y-3">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Pesquisar por nome…"
              ariaLabel="Pesquisar produto por nome"
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label htmlFor="filter-category" className="mb-1.5 block text-xs font-medium text-muted">
                  Categoria
                </label>
                <select
                  id="filter-category"
                  className="input-field"
                  value={categoryFilter}
                  onChange={(e) => handleCategoryFilterChange(e.target.value)}
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{!c.isActive ? " (inativa)" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filter-sort" className="mb-1.5 block text-xs font-medium text-muted">
                  Ordenar por
                </label>
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
        {!loading && error && <ErrorState message={error} onRetry={() => loadProducts(false)} />}
        {!loading && !error && products.length === 0 && (
          <EmptyState
            title={hasActiveFilter ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
            description={
              hasActiveFilter
                ? "Ajuste a pesquisa ou os filtros para ver todos os produtos."
                : canCreate
                  ? "Cadastre o primeiro produto."
                  : "Cadastre pelo menos uma categoria ativa antes de criar um produto."
            }
            actionLabel={!hasActiveFilter && canCreate ? "+ Criar produto" : undefined}
            onAction={!hasActiveFilter && canCreate ? openCreate : undefined}
          />
        )}
        {!loading && !error && products.length > 0 && (
          <>
            <ResponsiveGrid cols={3}>
              {products.map((product) => (
                <EntityCard
                  key={product.id}
                  href={`/admin/produtos/${product.id}`}
                  title={product.name}
                  badges={
                    <>
                      <StatusBadge isActive={product.active} />
                      {product.featured && (
                        <span className="rounded-full bg-caramel/10 px-2 py-0.5 text-xs font-semibold text-caramel">Destaque</span>
                      )}
                    </>
                  }
                  actions={
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-sand py-2 text-sm font-semibold text-chocolate transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"
                      >
                        Editar
                      </button>
                      {product.active ? (
                        <button
                          type="button"
                          onClick={() => setConfirmAction({ type: "deactivate", product })}
                          disabled={actionLoading === product.id}
                          aria-label={`Desativar produto ${product.name}`}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-sand py-2 text-sm font-semibold text-muted transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50"
                        >
                          {actionLoading === product.id ? "…" : "Desativar"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleActivate(product)}
                          disabled={actionLoading === product.id}
                          aria-label={`Ativar produto ${product.name}`}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-sage/10 py-2 text-sm font-semibold text-sage transition-colors hover:bg-sage/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:opacity-50"
                        >
                          {actionLoading === product.id ? "…" : "Ativar"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirmAction({ type: "delete", product })}
                        disabled={actionLoading === product.id}
                        aria-label={`Excluir produto ${product.name}`}
                        className="flex items-center gap-1.5 rounded-xl border border-rose/40 px-3 py-2 text-sm font-semibold text-rose transition-colors hover:bg-rose/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose disabled:opacity-50"
                      >
                        Excluir
                      </button>
                    </>
                  }
                >
                  <div className="flex gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sand">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <IconPackage className="text-muted" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 truncate text-xs text-muted">{product.categoryName}</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                          <p className="text-sm font-semibold leading-none text-chocolate">{formatCurrency(product.basePrice)}</p>
                          <p className="mt-0.5 text-[10px] text-muted">Preço</p>
                        </div>
                        <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                          <p className="text-sm font-semibold leading-none text-chocolate">{formatCurrency(product.costPrice)}</p>
                          <p className="mt-0.5 text-[10px] text-muted">Custo</p>
                        </div>
                        <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                          <p className="text-sm font-semibold leading-none text-chocolate">{(product.margin * 100).toFixed(0)}%</p>
                          <p className="mt-0.5 text-[10px] text-muted">Margem</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </EntityCard>
              ))}
            </ResponsiveGrid>

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
          title={modal === "create" ? "Novo produto" : "Editar produto"}
          submitting={submitting}
          submitLabel={modal === "create" ? "Criar produto" : "Salvar alterações"}
          onClose={closeModal}
          onSubmit={handleSubmit}
        >
          <Section title="Informações gerais">
            <Field label="Nome" required htmlFor="prod-name" error={formErrors.name}>
              <input
                id="prod-name"
                className={`input-field ${formErrors.name ? "border-rose" : ""}`}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Ex: Bolo de chocolate 25cm"
                maxLength={150}
                disabled={submitting}
              />
            </Field>

            <Field label="Descrição (opcional)" htmlFor="prod-description" error={formErrors.description}>
              <textarea
                id="prod-description"
                className={`input-field ${formErrors.description ? "border-rose" : ""}`}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                maxLength={500}
                rows={2}
                disabled={submitting}
              />
            </Field>

            <Field label="Categoria" required htmlFor="prod-category" error={formErrors.categoryId}>
              <select
                id="prod-category"
                className={`input-field ${formErrors.categoryId ? "border-rose" : ""}`}
                value={form.categoryId}
                onChange={(e) => setField("categoryId", e.target.value)}
                disabled={submitting}
              >
                <option value="">Selecione a categoria…</option>
                {categories.filter((c) => c.isActive || c.id === form.categoryId).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{!c.isActive ? " (inativa)" : ""}</option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Comercial">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço de venda" required htmlFor="prod-price" error={formErrors.basePrice}>
                <input
                  id="prod-price"
                  type="text"
                  inputMode="decimal"
                  className={`input-field ${formErrors.basePrice ? "border-rose" : ""}`}
                  value={form.basePrice === "" ? "" : formatBRLInput(form.basePrice)}
                  onChange={(e) => setField("basePrice", parseBRLInput(e.target.value))}
                  placeholder="R$ 0,00"
                  disabled={submitting}
                />
              </Field>
              <Field label="Prazo de produção (dias)" htmlFor="prod-lead-time" error={formErrors.leadTimeDays}>
                <input
                  id="prod-lead-time"
                  type="number"
                  step="1"
                  min={0}
                  className={`input-field ${formErrors.leadTimeDays ? "border-rose" : ""}`}
                  value={form.leadTimeDays}
                  onChange={(e) => setField("leadTimeDays", e.target.value)}
                  disabled={submitting}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-chocolate">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setField("featured", e.target.checked)}
                disabled={submitting}
                className="h-4 w-4"
              />
              Produto em destaque
            </label>

            {modal === "edit" && editing && (
              <div>
                <p className="mb-1 block text-sm font-medium text-chocolate">Status</p>
                <div className="flex items-center gap-2">
                  <StatusBadge isActive={editing.active} />
                  <p className="text-xs text-muted">Alterado apenas pelos botões Ativar/Desativar na listagem.</p>
                </div>
              </div>
            )}
          </Section>

          <Section title="Imagem">
            <UploadImage
              label="Imagem do produto"
              value={form.imageUrl}
              type="product"
              accept="image/jpeg,image/png,image/webp"
              hint="JPEG, PNG ou WebP · máx. 2 MB"
              onUpload={(url) => setField("imageUrl", url)}
              disabled={submitting}
            />
          </Section>

          <Section title="Receitas vinculadas">
            <div className="-mt-1 flex items-center justify-between">
              <p className="text-xs text-muted">Opcional — usado para calcular o custo do produto.</p>
              <button
                type="button"
                onClick={addRecipeRow}
                disabled={submitting || recipes.filter((r) => r.active || form.recipes.some((fr) => fr.recipeId === r.id)).length === 0}
                className="flex items-center gap-1 text-sm font-semibold text-chocolate underline disabled:opacity-50"
              >
                <IconPlus /> Adicionar receita
              </button>
            </div>
            {formErrors.recipes && <p className="text-xs text-rose">{formErrors.recipes}</p>}

            {(() => {
              const recipeOptions = recipes.filter((r) => r.active || form.recipes.some((fr) => fr.recipeId === r.id));
              return (
                <>
                  {recipeOptions.length === 0 && (
                    <p className="text-xs text-muted">
                      Nenhuma receita ativa cadastrada — o vínculo é opcional, mas para usá-lo{" "}
                      <Link href="/admin/receitas" className="font-semibold text-chocolate underline">
                        cadastre uma receita primeiro
                      </Link>.
                    </p>
                  )}
                  {recipeOptions.length > 0 && form.recipes.length === 0 && (
                    <p className="text-xs text-muted">Nenhuma receita vinculada (opcional).</p>
                  )}

                  <div className="space-y-3">
                    {form.recipes.map((row, index) => {
                      const selectedRecipe = recipes.find((r) => r.id === row.recipeId);
                      return (
                        <div key={index} className="rounded-xl border border-sand p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                              <IconRecipe /> Receita {index + 1}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeRecipeRow(index)}
                              disabled={submitting}
                              aria-label={`Remover receita ${index + 1}`}
                              className="text-xs font-semibold text-rose underline-offset-2 hover:underline disabled:opacity-50"
                            >
                              Remover
                            </button>
                          </div>
                          <div className="space-y-2">
                            <select
                              className={`input-field ${formErrors[`recipes[${index}].recipeId`] ? "border-rose" : ""}`}
                              value={row.recipeId}
                              onChange={(e) => setRecipeField(index, "recipeId", e.target.value)}
                              disabled={submitting}
                              aria-label={`Receita da linha ${index + 1}`}
                            >
                              <option value="">Selecione a receita…</option>
                              {recipeOptions.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                            {formErrors[`recipes[${index}].recipeId`] && (
                              <p className="text-xs text-rose">{formErrors[`recipes[${index}].recipeId`]}</p>
                            )}
                            <input
                              type="number"
                              step="any"
                              min={0}
                              className={`input-field ${formErrors[`recipes[${index}].quantity`] ? "border-rose" : ""}`}
                              value={row.quantity}
                              onChange={(e) => setRecipeField(index, "quantity", e.target.value)}
                              placeholder="Quantidade"
                              disabled={submitting}
                              aria-label={`Quantidade da linha ${index + 1}`}
                            />
                            {formErrors[`recipes[${index}].quantity`] && (
                              <p className="text-xs text-rose">{formErrors[`recipes[${index}].quantity`]}</p>
                            )}
                            {selectedRecipe && (
                              <p className="text-xs text-muted">
                                Custo unitário da receita: {formatCurrency(selectedRecipe.unitCost)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </Section>

          {modal === "edit" && editing && (
            <Section title="Resumo financeiro">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-sand/60 px-2 py-2">
                  <p className="text-base font-semibold leading-none text-chocolate">{formatCurrency(editing.costPrice)}</p>
                  <p className="mt-1 text-[10px] text-muted">Custo total do produto</p>
                </div>
                <div className="rounded-lg bg-sand/60 px-2 py-2">
                  <p className="text-base font-semibold leading-none text-chocolate">{(editing.margin * 100).toFixed(0)}%</p>
                  <p className="mt-1 text-[10px] text-muted">Margem</p>
                </div>
                <p className="col-span-2 text-[10px] text-muted">
                  Calculado no último salvamento — atualizado após salvar novamente.
                </p>
              </div>
            </Section>
          )}
        </EntityForm>
      )}

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.type === "delete" ? "Excluir produto?" : "Desativar produto?"}
          description={
            confirmAction.type === "delete" ? (
              <>
                <strong className="text-chocolate">{confirmAction.product.name}</strong> será excluído permanentemente.
                Se ele já tiver sido usado em algum pedido, a exclusão será bloqueada.
              </>
            ) : (
              <>
                <strong className="text-chocolate">{confirmAction.product.name}</strong> deixará de aparecer no catálogo da vitrine.
                Ele pode ser reativado a qualquer momento.
              </>
            )
          }
          cancelLabel="Cancelar"
          confirmLabel={confirmAction.type === "delete" ? "Excluir" : "Desativar"}
          busy={actionLoading === confirmAction.product.id}
          onCancel={() => setConfirmAction(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </PageContainer>
  );
}
