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
import { EntityForm } from "@/components/admin/shared/EntityForm";
import type { ValidationError } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters/currency";
import * as recipeApi from "@/lib/api/recipeApi";
import { ApiRequestError, type Recipe } from "@/lib/api/recipeApi";
import * as ingredientApi from "@/lib/api/ingredientApi";
import type { Ingredient } from "@/lib/api/ingredientApi";
import * as unitApi from "@/lib/api/unitApi";
import type { UnitOfMeasure } from "@/lib/api/unitApi";

// ── Local types ────────────────────────────────────────────────────────────────

interface ItemRowForm {
  ingredientId: string;
  quantity: string;
  unitId: string;
}
const EMPTY_ITEM_ROW: ItemRowForm = { ingredientId: "", quantity: "", unitId: "" };

interface RecipeForm {
  name: string;
  description: string;
  yieldQuantity: string;
  yieldUnit: string;
  prepTimeMinutes: string;
  items: ItemRowForm[];
}
const EMPTY_FORM: RecipeForm = {
  name: "",
  description: "",
  yieldQuantity: "",
  yieldUnit: "",
  prepTimeMinutes: "0",
  items: [{ ...EMPTY_ITEM_ROW }],
};

type StatusFilter = "all" | "active" | "inactive";

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ReceitasAdminPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<RecipeForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<Recipe | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadAll(silent = false) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const [recipeRows, ingredientRows, unitRows] = await Promise.all([
        recipeApi.listRecipes(),
        ingredientApi.listIngredients(),
        unitApi.listUnits(),
      ]);
      setRecipes(recipeRows);
      setIngredients(ingredientRows.filter((i) => i.active));
      setUnits(unitRows.filter((u) => u.isActive));
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Erro ao carregar receitas.");
      } else {
        toast.error("Erro ao atualizar lista de receitas.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return recipes
      .filter((r) => !term || r.name.toLowerCase().includes(term))
      .filter((r) => statusFilter === "all" || (statusFilter === "active" ? r.active : !r.active))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [recipes, search, statusFilter]);

  const hasActiveFilter = search.trim() !== "" || statusFilter !== "all";
  const canCreate = ingredients.length > 0 && units.length > 0;

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setFormErrors({}); }

  function setField<K extends keyof Omit<RecipeForm, "items">>(key: K, value: RecipeForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function setItemField(index: number, key: keyof ItemRowForm, value: string) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));
    setFormErrors((prev) => {
      const n = { ...prev };
      delete n[`items[${index}].${key}`];
      delete n.items;
      return n;
    });
  }

  function addItemRow() {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM_ROW }] }));
  }

  function removeItemRow(index: number) {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    const name = form.name.trim();
    if (!name) errs.name = "Nome é obrigatório.";
    else if (name.length < 2) errs.name = "Mínimo 2 caracteres.";
    else if (name.length > 150) errs.name = "Máximo 150 caracteres.";

    const yieldQty = parseFloat(form.yieldQuantity);
    if (form.yieldQuantity.trim() === "" || Number.isNaN(yieldQty)) errs.yieldQuantity = "Rendimento é obrigatório.";
    else if (yieldQty <= 0) errs.yieldQuantity = "Deve ser maior que zero.";

    if (!form.yieldUnit.trim()) errs.yieldUnit = "Unidade de rendimento é obrigatória.";
    else if (form.yieldUnit.length > 60) errs.yieldUnit = "Máximo 60 caracteres.";

    const prepTime = parseFloat(form.prepTimeMinutes);
    if (form.prepTimeMinutes.trim() !== "" && (Number.isNaN(prepTime) || prepTime < 0)) {
      errs.prepTimeMinutes = "Deve ser maior ou igual a 0.";
    }

    if (form.description.length > 500) errs.description = "Máximo 500 caracteres.";

    form.items.forEach((item, index) => {
      if (!item.ingredientId) errs[`items[${index}].ingredientId`] = "Selecione um ingrediente.";
      if (!item.unitId) errs[`items[${index}].unitId`] = "Selecione uma unidade.";
      const qty = parseFloat(item.quantity);
      if (item.quantity.trim() === "" || Number.isNaN(qty)) errs[`items[${index}].quantity`] = "Informe a quantidade.";
      else if (qty <= 0) errs[`items[${index}].quantity`] = "Deve ser maior que zero.";
    });

    const ids = form.items.map((i) => i.ingredientId).filter(Boolean);
    if (new Set(ids).size !== ids.length) errs.items = "Não repita o mesmo ingrediente na receita.";

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
    const toastId = toast.loading("Criando receita…");
    try {
      await recipeApi.createRecipe({
        name: form.name,
        description: form.description.trim() || null,
        yieldQuantity: parseFloat(form.yieldQuantity),
        yieldUnit: form.yieldUnit,
        prepTimeMinutes: form.prepTimeMinutes.trim() === "" ? undefined : parseFloat(form.prepTimeMinutes),
        items: form.items.map((item) => ({
          ingredientId: item.ingredientId,
          quantity: parseFloat(item.quantity),
          unitId: item.unitId,
        })),
      });
      toast.success("Receita criada com sucesso.", { id: toastId });
      closeModal();
      await loadAll(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else if (err instanceof ApiRequestError && (err.code === "INACTIVE_INGREDIENT" || err.code === "INCOMPATIBLE_UNIT" || err.code === "DUPLICATE_NAME")) {
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao criar receita.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleActivate(recipe: Recipe) {
    setActionLoading(recipe.id);
    const toastId = toast.loading("Ativando receita…");
    try {
      await recipeApi.activateRecipe(recipe.id);
      toast.success(`"${recipe.name}" ativada com sucesso.`, { id: toastId });
      await loadAll(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar receita.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmDeactivate) return;
    const recipe = confirmDeactivate;
    setConfirmDeactivate(null);
    setActionLoading(recipe.id);
    const toastId = toast.loading("Desativando receita…");
    try {
      await recipeApi.deactivateRecipe(recipe.id);
      toast.success(`"${recipe.name}" desativada.`, { id: toastId });
      await loadAll(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao desativar receita.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <PageContainer>
      <HeaderMinimal title="Receitas" />

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${filtered.length} receita${filtered.length !== 1 ? "s" : ""}`}
          </p>
          <button
            type="button"
            onClick={openCreate}
            disabled={!canCreate}
            className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50"
          >
            + Nova
          </button>
        </div>

        {!loading && !error && (
          <div className="space-y-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Pesquisar por nome…"
              ariaLabel="Pesquisar receita por nome"
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

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={loadAll} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title={hasActiveFilter ? "Nenhuma receita encontrada" : "Nenhuma receita cadastrada"}
            description={
              hasActiveFilter
                ? "Ajuste a pesquisa ou os filtros para ver todas as receitas."
                : canCreate
                  ? "Cadastre a primeira receita."
                  : "Cadastre pelo menos um ingrediente ativo antes de criar uma receita."
            }
            actionLabel={!hasActiveFilter && canCreate ? "+ Criar receita" : undefined}
            onAction={!hasActiveFilter && canCreate ? openCreate : undefined}
          />
        )}
        {!loading && !error && filtered.length > 0 && (
          <ResponsiveGrid cols={3}>
            {filtered.map((recipe) => (
              <EntityCard
                key={recipe.id}
                title={recipe.name}
                href={`/admin/receitas/${recipe.id}`}
                badges={<StatusBadge isActive={recipe.active} activeLabel="Ativa" inactiveLabel="Inativa" />}
                actions={
                  <>
                    <Link
                      href={`/admin/receitas/${recipe.id}`}
                      className="flex-1 rounded-xl border border-sand py-2 text-center text-sm font-semibold text-chocolate transition-colors hover:bg-sand/60"
                    >
                      Ver receita
                    </Link>
                    {recipe.active ? (
                      <button
                        type="button"
                        onClick={() => setConfirmDeactivate(recipe)}
                        disabled={actionLoading === recipe.id}
                        aria-label={`Desativar receita ${recipe.name}`}
                        className="flex-1 rounded-xl border border-sand py-2 text-sm font-semibold text-muted transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50"
                      >
                        {actionLoading === recipe.id ? "…" : "Desativar"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleActivate(recipe)}
                        disabled={actionLoading === recipe.id}
                        aria-label={`Ativar receita ${recipe.name}`}
                        className="flex-1 rounded-xl bg-sage/10 py-2 text-sm font-semibold text-sage transition-colors hover:bg-sage/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:opacity-50"
                      >
                        {actionLoading === recipe.id ? "…" : "Ativar"}
                      </button>
                    )}
                  </>
                }
              >
                <p className="text-xs text-muted">
                  Rende {recipe.yieldQuantity} {recipe.yieldUnit} · {recipe.items.length} ingrediente{recipe.items.length !== 1 ? "s" : ""}
                  {recipe.prepTimeMinutes > 0 && ` · ${recipe.prepTimeMinutes} min de preparo`}
                </p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <p className="text-sm font-semibold leading-none text-chocolate">{formatCurrency(recipe.totalCost)}</p>
                    <p className="mt-0.5 text-[10px] text-muted">Custo total</p>
                  </div>
                  <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                    <p className="text-sm font-semibold leading-none text-chocolate">{formatCurrency(recipe.unitCost)}</p>
                    <p className="mt-0.5 text-[10px] text-muted">Custo por {recipe.yieldUnit}</p>
                  </div>
                </div>
              </EntityCard>
            ))}
          </ResponsiveGrid>
        )}
      </div>

      {modalOpen && (
        <EntityForm
          title="Nova receita"
          submitting={submitting}
          submitLabel="Criar receita"
          onClose={closeModal}
          onSubmit={handleSubmit}
        >
          <Field label="Nome" required htmlFor="rec-name" error={formErrors.name}>
            <input
              id="rec-name"
              className={`input-field ${formErrors.name ? "border-rose" : ""}`}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ex: Bolo de chocolate 25cm"
              maxLength={150}
              disabled={submitting}
            />
          </Field>

          <Field label="Descrição (opcional)" htmlFor="rec-description" error={formErrors.description}>
            <textarea
              id="rec-description"
              className={`input-field ${formErrors.description ? "border-rose" : ""}`}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              maxLength={500}
              rows={2}
              disabled={submitting}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Rendimento" required htmlFor="rec-yield-qty" error={formErrors.yieldQuantity}>
              <input
                id="rec-yield-qty"
                type="number"
                step="any"
                min={0}
                className={`input-field ${formErrors.yieldQuantity ? "border-rose" : ""}`}
                value={form.yieldQuantity}
                onChange={(e) => setField("yieldQuantity", e.target.value)}
                placeholder="Ex: 1"
                disabled={submitting}
              />
            </Field>
            <Field label="Unidade de rendimento" required htmlFor="rec-yield-unit" error={formErrors.yieldUnit}>
              <input
                id="rec-yield-unit"
                className={`input-field ${formErrors.yieldUnit ? "border-rose" : ""}`}
                value={form.yieldUnit}
                onChange={(e) => setField("yieldUnit", e.target.value)}
                placeholder="Ex: bolo 25cm"
                maxLength={60}
                disabled={submitting}
              />
            </Field>
          </div>

          <Field label="Tempo de preparo (minutos)" htmlFor="rec-prep-time" error={formErrors.prepTimeMinutes}>
            <input
              id="rec-prep-time"
              type="number"
              step="1"
              min={0}
              className={`input-field ${formErrors.prepTimeMinutes ? "border-rose" : ""}`}
              value={form.prepTimeMinutes}
              onChange={(e) => setField("prepTimeMinutes", e.target.value)}
              disabled={submitting}
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-chocolate">
                Ingredientes <span className="text-rose">*</span>
              </p>
              <button
                type="button"
                onClick={addItemRow}
                disabled={submitting}
                className="text-sm font-semibold text-chocolate underline disabled:opacity-50"
              >
                + Adicionar linha
              </button>
            </div>
            {formErrors.items && <p className="mb-2 text-xs text-rose">{formErrors.items}</p>}

            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="rounded-xl border border-sand p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-muted">Ingrediente {index + 1}</p>
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        disabled={submitting}
                        aria-label={`Remover ingrediente ${index + 1}`}
                        className="text-xs font-semibold text-rose disabled:opacity-50"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <select
                      className={`input-field ${formErrors[`items[${index}].ingredientId`] ? "border-rose" : ""}`}
                      value={item.ingredientId}
                      onChange={(e) => setItemField(index, "ingredientId", e.target.value)}
                      disabled={submitting}
                      aria-label={`Ingrediente da linha ${index + 1}`}
                    >
                      <option value="">Selecione o ingrediente…</option>
                      {ingredients.map((i) => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                    {formErrors[`items[${index}].ingredientId`] && (
                      <p className="text-xs text-rose">{formErrors[`items[${index}].ingredientId`]}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="any"
                        min={0}
                        className={`input-field ${formErrors[`items[${index}].quantity`] ? "border-rose" : ""}`}
                        value={item.quantity}
                        onChange={(e) => setItemField(index, "quantity", e.target.value)}
                        placeholder="Quantidade"
                        disabled={submitting}
                        aria-label={`Quantidade da linha ${index + 1}`}
                      />
                      <select
                        className={`input-field ${formErrors[`items[${index}].unitId`] ? "border-rose" : ""}`}
                        value={item.unitId}
                        onChange={(e) => setItemField(index, "unitId", e.target.value)}
                        disabled={submitting}
                        aria-label={`Unidade da linha ${index + 1}`}
                      >
                        <option value="">Unidade…</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>{u.abbreviation}</option>
                        ))}
                      </select>
                    </div>
                    {(formErrors[`items[${index}].quantity`] || formErrors[`items[${index}].unitId`]) && (
                      <p className="text-xs text-rose">
                        {formErrors[`items[${index}].quantity`] || formErrors[`items[${index}].unitId`]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </EntityForm>
      )}

      {confirmDeactivate && (
        <ConfirmDialog
          title="Desativar receita?"
          description={
            <>
              <strong className="text-chocolate">{'"'}{confirmDeactivate.name}{'"'}</strong> deixará de aparecer nas opções de vínculo com produtos.
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
