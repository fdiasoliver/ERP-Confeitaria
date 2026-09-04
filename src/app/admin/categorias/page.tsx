"use client";

import { useState, useEffect } from "react";
import { HeaderMinimal } from "@/components/layout/Header";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { EntityForm } from "@/components/admin/shared/EntityForm";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { ProductCategoryInput, ProductCategoryWithCount } from "@/lib/types";
import * as categoryApi from "@/lib/api/productCategoryApi";

// ── Local types ────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";
interface CategoryForm { name: string; sortOrder: number; color: string; icon: string }
const EMPTY_FORM: CategoryForm = { name: "", sortOrder: 0, color: "#E8A598", icon: "package" };
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

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
        <div key={i} className="shadow-card h-24 animate-pulse rounded-2xl bg-white" />
      ))}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="shadow-card rounded-2xl bg-white p-8 text-center">
      <p className="font-display mb-1 text-lg font-semibold text-chocolate">Nenhuma categoria</p>
      <p className="mb-4 text-sm text-muted">Crie a primeira categoria para organizar o catálogo.</p>
      <button
        type="button"
        onClick={onCreate}
        className="rounded-xl bg-chocolate px-5 py-2 text-sm font-semibold text-white"
      >
        + Criar categoria
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="shadow-card rounded-2xl bg-white p-6 text-center">
      <p className="mb-1 text-sm font-semibold text-rose">Erro ao carregar</p>
      <p className="mb-4 text-sm text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl border border-sand px-4 py-2 text-sm font-semibold text-chocolate"
      >
        Tentar novamente
      </button>
    </div>
  );
}

function CategoryCard({ category, actionLoading, onEdit, onActivate, onDeactivate }: {
  category: ProductCategoryWithCount;
  actionLoading: boolean;
  onEdit: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  return (
    <Card className="shadow-card gap-0 rounded-2xl p-4">
      <div className="mb-3 flex items-start gap-3">
        <span
          className="mt-0.5 h-8 w-8 shrink-0 rounded-lg border border-sand"
          style={{ backgroundColor: category.color }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-chocolate">{category.name}</p>
            <StatusBadge isActive={category.isActive} activeLabel="Ativa" inactiveLabel="Inativa" />
          </div>
          <p className="mt-0.5 text-xs text-muted font-mono">{category.slug}</p>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-sand/60 px-2 py-1.5">
          <p className="text-lg leading-none">{category.icon}</p>
          <p className="mt-0.5 text-[10px] text-muted">Ícone</p>
        </div>
        <div className="rounded-lg bg-sand/60 px-2 py-1.5">
          <p className="text-sm font-semibold leading-none text-chocolate">{category.sortOrder}</p>
          <p className="mt-0.5 text-[10px] text-muted">Ordem</p>
        </div>
        <div className="rounded-lg bg-sand/60 px-2 py-1.5">
          <p className="text-sm font-semibold leading-none text-chocolate">{category.productCount}</p>
          <p className="mt-0.5 text-[10px] text-muted">Produtos</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={actionLoading}
          aria-label={`Editar categoria ${category.name}`}
          className="flex-1 rounded-xl border border-sand py-2 text-sm font-semibold text-chocolate disabled:opacity-50"
        >
          Editar
        </button>
        {category.isActive ? (
          <button
            type="button"
            onClick={onDeactivate}
            disabled={actionLoading}
            aria-label={`Desativar categoria ${category.name}`}
            className="flex-1 rounded-xl border border-sand py-2 text-sm font-semibold text-muted disabled:opacity-50"
          >
            {actionLoading ? "…" : "Desativar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onActivate}
            disabled={actionLoading}
            aria-label={`Ativar categoria ${category.name}`}
            className="flex-1 rounded-xl bg-sage/10 py-2 text-sm font-semibold text-sage disabled:opacity-50"
          >
            {actionLoading ? "…" : "Ativar"}
          </button>
        )}
      </div>
    </Card>
  );
}

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
                className="flex h-[46px] w-12 items-center justify-center rounded-xl border border-sand bg-sand/40 text-xl"
                aria-hidden="true"
              >
                {form.icon}
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
      setCategories(await categoryApi.listCategories());
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

  return (
    <PageContainer>
      <HeaderMinimal title="Categorias" />

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${categories.length} categoria${categories.length !== 1 ? "s" : ""}`}
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white"
          >
            + Nova
          </button>
        </div>

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={loadCategories} />}
        {!loading && !error && categories.length === 0 && <EmptyState onCreate={openCreate} />}
        {!loading && !error && categories.length > 0 && (
          <div className="space-y-3">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                actionLoading={actionLoading === cat.id}
                onEdit={() => openEdit(cat)}
                onActivate={() => handleActivate(cat)}
                onDeactivate={() => setConfirmDeactivate(cat)}
              />
            ))}
          </div>
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
