"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { ValidationSummary } from "@/components/admin/config/ValidationSummary";
import type { ToastState } from "@/components/admin/config/ValidationSummary";
import { Field } from "@/components/admin/config/FormPrimitives";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { ResponsiveGrid } from "@/components/admin/shared/ResponsiveGrid";
import { SearchBar } from "@/components/admin/shared/SearchBar";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { LoadingState } from "@/components/admin/shared/LoadingState";
import { EntityCard } from "@/components/admin/shared/EntityCard";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { EntityForm } from "@/components/admin/shared/EntityForm";
import type { ValidationError } from "@/lib/types";
import * as categoryApi from "@/lib/api/packagingCategoryApi";
import { ApiRequestError, type PackagingCategory } from "@/lib/api/packagingCategoryApi";

// ── Local types ────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";
interface CategoryForm { name: string }
const EMPTY_FORM: CategoryForm = { name: "" };

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PackagingCategoriasAdminPage() {
  const [categories, setCategories] = useState<PackagingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [editing, setEditing] = useState<PackagingCategory | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<PackagingCategory | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(type: ToastState["type"], message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    if (type !== "loading") toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  async function loadCategories(silent = false) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      setCategories(await categoryApi.listPackagingCategories());
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Erro ao carregar categorias.");
      } else {
        showToast("error", "Erro ao atualizar lista de categorias.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadCategories(); }, []); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(term));
  }, [categories, search]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditing(null);
    setModal("create");
  }

  function openEdit(category: PackagingCategory) {
    setForm({ name: category.name });
    setFormErrors({});
    setEditing(category);
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
    showToast("loading", modal === "create" ? "Criando categoria…" : "Salvando alterações…");
    try {
      if (modal === "create") {
        await categoryApi.createPackagingCategory({ name: form.name });
        showToast("success", "Categoria criada com sucesso.");
      } else if (editing) {
        await categoryApi.updatePackagingCategory(editing.id, { name: form.name });
        showToast("success", "Categoria atualizada.");
      }
      closeModal();
      await loadCategories(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        showToast("error", "Corrija os campos destacados.");
      } else {
        showToast("error", err instanceof Error ? err.message : "Erro ao salvar categoria.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!confirmDelete) return;
    const category = confirmDelete;
    setConfirmDelete(null);
    setActionLoading(category.id);
    showToast("loading", "Excluindo categoria…");
    try {
      await categoryApi.deletePackagingCategory(category.id);
      showToast("success", "Categoria excluída.");
      await loadCategories(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "CATEGORY_HAS_PACKAGINGS") {
        showToast("error", err.message);
      } else {
        showToast("error", err instanceof Error ? err.message : "Erro ao excluir categoria.");
      }
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <PageContainer>
      <HeaderMinimal title="Categorias de Embalagem" />

      <div className="space-y-4 p-5">
        <Link href="/admin/embalagens" className="text-sm font-medium text-chocolate underline">
          ← Voltar para Embalagens
        </Link>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${filtered.length} categoria${filtered.length !== 1 ? "s" : ""}`}
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white"
          >
            + Nova
          </button>
        </div>

        {!loading && !error && (
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por nome…"
            ariaLabel="Pesquisar categoria por nome"
          />
        )}

        {loading && <LoadingState count={2} />}
        {!loading && error && <ErrorState message={error} onRetry={loadCategories} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title={search.trim() !== "" ? "Nenhuma categoria encontrada" : "Nenhuma categoria de embalagem"}
            description={
              search.trim() !== ""
                ? "Ajuste a pesquisa para ver todas as categorias."
                : "Crie a primeira categoria para agrupar embalagens (ex: Caixas, Saquinhos)."
            }
            actionLabel={search.trim() === "" ? "+ Criar categoria" : undefined}
            onAction={search.trim() === "" ? openCreate : undefined}
          />
        )}
        {!loading && !error && filtered.length > 0 && (
          <ResponsiveGrid cols={2}>
            {filtered.map((category) => (
              <EntityCard
                key={category.id}
                title={category.name}
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      disabled={actionLoading === category.id}
                      aria-label={`Editar categoria ${category.name}`}
                      className="flex-1 rounded-xl border border-sand py-2 text-sm font-semibold text-chocolate disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(category)}
                      disabled={actionLoading === category.id}
                      aria-label={`Excluir categoria ${category.name}`}
                      className="flex-1 rounded-xl border border-sand py-2 text-sm font-semibold text-rose disabled:opacity-50"
                    >
                      {actionLoading === category.id ? "…" : "Excluir"}
                    </button>
                  </>
                }
              />
            ))}
          </ResponsiveGrid>
        )}
      </div>

      {modal && (
        <EntityForm
          title={modal === "create" ? "Nova categoria" : "Editar categoria"}
          submitting={submitting}
          submitLabel={modal === "create" ? "Criar" : "Salvar"}
          onClose={closeModal}
          onSubmit={handleSubmit}
        >
          <Field label="Nome" required htmlFor="packaging-cat-name" error={formErrors.name}>
            <input
              id="packaging-cat-name"
              className={`input-field ${formErrors.name ? "border-rose" : ""}`}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ex: Caixas"
              maxLength={100}
              disabled={submitting}
            />
          </Field>
        </EntityForm>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir categoria?"
          description={
            <>
              A categoria <strong className="text-chocolate">{'"'}{confirmDelete.name}{'"'}</strong> será excluída permanentemente. Categorias com embalagens vinculadas não podem ser excluídas.
            </>
          }
          cancelLabel="Cancelar"
          confirmLabel="Excluir"
          busy={actionLoading === confirmDelete.id}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      <ValidationSummary toast={toast} onDismiss={() => setToast(null)} />
    </PageContainer>
  );
}
