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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { ProductCategoryInput, ProductCategoryWithCount } from "@/lib/types";
import * as categoryApi from "@/lib/api/productCategoryApi";

// ── Local types ────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";
type StatusFilter = "all" | "active" | "inactive";
interface CategoryForm { name: string; sortOrder: number; color: string; icon: string }
const EMPTY_FORM: CategoryForm = { name: "", sortOrder: 0, color: "#E8A598", icon: "package" };
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// ── Local helper components ────────────────────────────────────────────────────

function CategoryModal({ mode, form, errors, submitting, onClose, onChange, onSubmit }: {
  mode: ModalMode;
  form: CategoryForm;
  errors: Record<string, string>;
  submitting: boolean;
  onClose: () => void;
  onChange: <K extends keyof CategoryForm>(key: K, value: CategoryForm[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <EntityForm
      title={mode === "create" ? "Nova categoria" : "Editar categoria"}
      submitting={submitting}
      submitLabel={mode === "create" ? "Criar" : "Salvar"}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Field label="Nome" required htmlFor="cat-name" error={errors.name}>
        <input
          id="cat-name"
          className={`input-field ${errors.name ? "border-rose" : ""}`}
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Ex: Bolos Especiais"
          maxLength={100}
          disabled={submitting}
        />
      </Field>

      <Field label="Ordem de exibição" htmlFor="cat-sort-order" error={errors.sortOrder}>
        <input
          id="cat-sort-order"
          type="number"
          className={`input-field ${errors.sortOrder ? "border-rose" : ""}`}
          value={form.sortOrder}
          min={0}
          onChange={(e) => onChange("sortOrder", parseInt(e.target.value, 10) || 0)}
          disabled={submitting}
        />
      </Field>

      <Field label="Cor (#RRGGBB)" htmlFor="cat-color-hex" error={errors.color}>
        <div className="flex gap-2">
          <input
            id="cat-color-picker"
            type="color"
            aria-label="Seletor de cor"
            className="h-[46px] w-12 cursor-pointer rounded-xl border border-sand bg-white p-1"
            value={form.color}
            onChange={(e) => onChange("color", e.target.value)}
            disabled={submitting}
          />
          <input
            id="cat-color-hex"
            className={`input-field flex-1 font-mono uppercase ${errors.color ? "border-rose" : ""}`}
            value={form.color}
            onChange={(e) => onChange("color", e.target.value.toUpperCase())}
            maxLength={7}
            placeholder="#E8A598"
            disabled={submitting}
          />
        </div>
      </Field>

      <Field label="Ícone (nome Lucide)" htmlFor="cat-icon" error={errors.icon}>
        <div className="flex gap-2">
          <div
            className="flex h-[46px] w-12 items-center justify-center rounded-xl border border-sand bg-sand/40"
            aria-hidden="true"
          >
            <ResolvedIcon name={form.icon} size={20} />
          </div>
          <input
            id="cat-icon"
            className={`input-field flex-1 ${errors.icon ? "border-rose" : ""}`}
            value={form.icon}
            onChange={(e) => onChange("icon", e.target.value)}
            placeholder="package"
            maxLength={50}
            disabled={submitting}
          />
        </div>
      </Field>
    </EntityForm>
  );
}

/** Variante informativa (sem ação destrutiva) do fluxo de desativação — categoria
 * com produtos vinculados não pode ser desativada. Usa as primitivas AlertDialog
 * do shadcn/ui diretamente (ConfirmDialog compartilhado sempre exige 2 botões). */
function BlockedDeactivateDialog({ category, onClose }: {
  category: ProductCategoryWithCount;
  onClose: () => void;
}) {
  return (
    <AlertDialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-chocolate">Não é possível desativar</AlertDialogTitle>
          <AlertDialogDescription className="text-muted">
            A categoria <strong className="text-chocolate">{'"'}{category.name}{'"'}</strong> possui{" "}
            <strong className="text-rose">
              {category.productCount} produto{category.productCount !== 1 ? "s" : ""} vinculado{category.productCount !== 1 ? "s" : ""}
            </strong>. Remova ou mova os produtos desta categoria antes de desativá-la.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction type="button" onClick={onClose}>Fechar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function CategoriasAdminPage() {
  const [categories, setCategories] = useState<ProductCategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useViewMode("categorias");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [editing, setEditing] = useState<ProductCategoryWithCount | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<ProductCategoryWithCount | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadCategories(silent = false) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const rows = await categoryApi.listCategories();
      setCategories([...rows].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Erro ao carregar categorias.");
      } else {
        toast.error("Erro ao atualizar lista de categorias.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadCategories(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories
      .filter((c) => !term || c.name.toLowerCase().includes(term))
      .filter((c) => statusFilter === "all" || (statusFilter === "active" ? c.isActive : !c.isActive));
  }, [categories, search, statusFilter]);

  const hasActiveFilter = search.trim() !== "" || statusFilter !== "all";

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditing(null);
    setModal("create");
  }

  function openEdit(cat: ProductCategoryWithCount) {
    setForm({ name: cat.name, sortOrder: cat.sortOrder, color: cat.color, icon: cat.icon });
    setFormErrors({});
    setEditing(cat);
    setModal("edit");
  }

  function closeModal() { setModal(null); setEditing(null); setFormErrors({}); }

  function setField<K extends keyof CategoryForm>(key: K, value: CategoryForm[K]) {
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
    const toastId = toast.loading(modal === "create" ? "Criando categoria…" : "Salvando alterações…");
    try {
      const payload: Pick<ProductCategoryInput, "name" | "sortOrder" | "color" | "icon"> = {
        name: form.name, sortOrder: form.sortOrder, color: form.color, icon: form.icon,
      };
      if (modal === "create") {
        await categoryApi.createCategory(payload);
        toast.success("Categoria criada com sucesso.", { id: toastId });
      } else if (editing) {
        await categoryApi.updateCategory(editing.id, payload);
        toast.success("Categoria atualizada.", { id: toastId });
      }
      closeModal();
      await loadCategories(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar categoria.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleActivate(cat: ProductCategoryWithCount) {
    setActionLoading(cat.id);
    const toastId = toast.loading("Ativando categoria…");
    try {
      await categoryApi.activateCategory(cat.id);
      toast.success(`"${cat.name}" ativada com sucesso.`, { id: toastId });
      await loadCategories(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar categoria.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmDeactivate) return;
    const cat = confirmDeactivate;
    setConfirmDeactivate(null);
    setActionLoading(cat.id);
    const toastId = toast.loading("Desativando categoria…");
    try {
      await categoryApi.deactivateCategory(cat.id);
      toast.success(`"${cat.name}" desativada.`, { id: toastId });
      await loadCategories(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao desativar categoria.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  // Mesmas ações nas duas visões — mesmo padrão de admin/ingredientes/page.tsx.
  function renderActions(cat: ProductCategoryWithCount, variant: "card" | "row") {
    const base =
      variant === "card"
        ? "flex-1 rounded-xl py-2 text-sm font-semibold"
        : "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold";
    const neutral = "border border-sand transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50";
    const busy = actionLoading === cat.id;
    return (
      <>
        <button
          type="button"
          onClick={() => openEdit(cat)}
          disabled={busy}
          aria-label={`Editar categoria ${cat.name}`}
          className={`${base} ${neutral} text-chocolate`}
        >
          Editar
        </button>
        {cat.isActive ? (
          <button
            type="button"
            onClick={() => setConfirmDeactivate(cat)}
            disabled={busy}
            aria-label={`Desativar categoria ${cat.name}`}
            className={`${base} ${neutral} text-muted`}
          >
            {busy ? "…" : "Desativar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleActivate(cat)}
            disabled={busy}
            aria-label={`Ativar categoria ${cat.name}`}
            className={`${base} bg-sage/10 text-sage transition-colors hover:bg-sage/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:opacity-50`}
          >
            {busy ? "…" : "Ativar"}
          </button>
        )}
      </>
    );
  }

  const columns: EntityColumn<ProductCategoryWithCount>[] = [
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
            <StatusBadge isActive={c.isActive} activeLabel="Ativa" inactiveLabel="Inativa" />
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
    {
      key: "productCount",
      header: "Produtos",
      className: "text-right",
      render: (c) => <span className="font-semibold text-chocolate">{c.productCount}</span>,
    },
  ];

  return (
    <PageContainer>
      <HeaderMinimal title="Categorias" />

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${filtered.length} categoria${filtered.length !== 1 ? "s" : ""}`}
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
              ariaLabel="Pesquisar categoria por nome"
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
        {!loading && error && <ErrorState message={error} onRetry={() => loadCategories(false)} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title={hasActiveFilter ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}
            description={
              hasActiveFilter
                ? "Ajuste a pesquisa ou os filtros para ver todas as categorias."
                : "Cadastre a primeira categoria para organizar o catálogo."
            }
            actionLabel={!hasActiveFilter ? "+ Criar categoria" : undefined}
            onAction={!hasActiveFilter ? openCreate : undefined}
          />
        )}
        {!loading && !error && filtered.length > 0 && view === "grid" && (
          <ResponsiveGrid cols={3}>
            {filtered.map((cat) => (
              <EntityCard
                key={cat.id}
                title={cat.name}
                badges={<StatusBadge isActive={cat.isActive} activeLabel="Ativa" inactiveLabel="Inativa" />}
                actions={renderActions(cat, "card")}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-8 w-8 shrink-0 rounded-lg border border-sand"
                    style={{ backgroundColor: cat.color }}
                    aria-hidden="true"
                  />
                  <p className="truncate text-xs text-muted font-mono">{cat.slug}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <ResolvedIcon name={cat.icon} size={18} className="mx-auto" aria-hidden="true" />
                    <p className="mt-0.5 text-[10px] text-muted">Ícone</p>
                  </div>
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <p className="text-sm font-semibold leading-none text-chocolate">{cat.sortOrder}</p>
                    <p className="mt-0.5 text-[10px] text-muted">Ordem</p>
                  </div>
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <p className="text-sm font-semibold leading-none text-chocolate">{cat.productCount}</p>
                    <p className="mt-0.5 text-[10px] text-muted">Produtos</p>
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
        <CategoryModal
          mode={modal}
          form={form}
          errors={formErrors}
          submitting={submitting}
          onClose={closeModal}
          onChange={setField}
          onSubmit={handleSubmit}
        />
      )}

      {confirmDeactivate && confirmDeactivate.productCount > 0 && (
        <BlockedDeactivateDialog
          category={confirmDeactivate}
          onClose={() => setConfirmDeactivate(null)}
        />
      )}

      {confirmDeactivate && confirmDeactivate.productCount === 0 && (
        <ConfirmDialog
          title="Desativar categoria?"
          description={
            <>
              A categoria <strong className="text-chocolate">{'"'}{confirmDeactivate.name}{'"'}</strong> ficará invisível no catálogo.
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
