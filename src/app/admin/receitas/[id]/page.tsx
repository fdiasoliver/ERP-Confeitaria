"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { ValidationSummary } from "@/components/admin/config/ValidationSummary";
import type { ToastState } from "@/components/admin/config/ValidationSummary";
import type { ValidationError } from "@/lib/types";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { formatCurrency } from "@/lib/formatters/currency";
import * as recipeApi from "@/lib/api/recipeApi";
import { ApiRequestError, type Recipe, type RecipeItem } from "@/lib/api/recipeApi";
import * as ingredientApi from "@/lib/api/ingredientApi";
import type { Ingredient } from "@/lib/api/ingredientApi";
import * as unitApi from "@/lib/api/unitApi";
import type { UnitOfMeasure } from "@/lib/api/unitApi";

// ── Local types ────────────────────────────────────────────────────────────────

interface RecipeEditForm {
  name: string;
  description: string;
  yieldQuantity: string;
  yieldUnit: string;
  prepTimeMinutes: string;
}

interface AddItemForm {
  ingredientId: string;
  quantity: string;
  unitId: string;
}
const EMPTY_ADD_ITEM_FORM: AddItemForm = { ingredientId: "", quantity: "", unitId: "" };

interface EditItemForm {
  quantity: string;
  unitId: string;
}

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
      <div className="shadow-card h-32 animate-pulse rounded-2xl bg-white" />
      <div className="shadow-card h-20 animate-pulse rounded-2xl bg-white" />
      <div className="shadow-card h-20 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}

function ItemCard({ item, actionLoading, canRemove, onEdit, onRemove }: {
  item: RecipeItem;
  actionLoading: boolean;
  canRemove: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="shadow-card flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-chocolate">{item.ingredientName}</p>
        <p className="text-sm text-muted">{item.quantity} {item.unitAbbreviation}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={actionLoading}
          aria-label={`Editar item ${item.ingredientName}`}
          className="rounded-xl border border-sand px-3 py-2 text-xs font-semibold text-chocolate disabled:opacity-50"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={actionLoading || !canRemove}
          aria-label={`Remover item ${item.ingredientName}`}
          title={!canRemove ? "A receita deve ter pelo menos um ingrediente." : undefined}
          className="rounded-xl border border-sand px-3 py-2 text-xs font-semibold text-rose disabled:opacity-50"
        >
          {actionLoading ? "…" : "Remover"}
        </button>
      </div>
    </div>
  );
}

function RecipeEditModal({ form, errors, submitting, onClose, onChange, onSubmit }: {
  form: RecipeEditForm;
  errors: Record<string, string>;
  submitting: boolean;
  onClose: () => void;
  onChange: <K extends keyof RecipeEditForm>(key: K, value: RecipeEditForm[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white pb-8 pt-5 px-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-chocolate">Editar receita</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-muted text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <Field label="Nome" required htmlFor="rec-edit-name" error={errors.name}>
            <input
              id="rec-edit-name"
              className={`input-field ${errors.name ? "border-rose" : ""}`}
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              maxLength={150}
              disabled={submitting}
            />
          </Field>

          <Field label="Descrição (opcional)" htmlFor="rec-edit-description" error={errors.description}>
            <textarea
              id="rec-edit-description"
              className={`input-field ${errors.description ? "border-rose" : ""}`}
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              maxLength={500}
              rows={2}
              disabled={submitting}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Rendimento" required htmlFor="rec-edit-yield-qty" error={errors.yieldQuantity}>
              <input
                id="rec-edit-yield-qty"
                type="number"
                step="any"
                min={0}
                className={`input-field ${errors.yieldQuantity ? "border-rose" : ""}`}
                value={form.yieldQuantity}
                onChange={(e) => onChange("yieldQuantity", e.target.value)}
                disabled={submitting}
              />
            </Field>
            <Field label="Unidade de rendimento" required htmlFor="rec-edit-yield-unit" error={errors.yieldUnit}>
              <input
                id="rec-edit-yield-unit"
                className={`input-field ${errors.yieldUnit ? "border-rose" : ""}`}
                value={form.yieldUnit}
                onChange={(e) => onChange("yieldUnit", e.target.value)}
                maxLength={60}
                disabled={submitting}
              />
            </Field>
          </div>

          <Field label="Tempo de preparo (minutos)" htmlFor="rec-edit-prep-time" error={errors.prepTimeMinutes}>
            <input
              id="rec-edit-prep-time"
              type="number"
              step="1"
              min={0}
              className={`input-field ${errors.prepTimeMinutes ? "border-rose" : ""}`}
              value={form.prepTimeMinutes}
              onChange={(e) => onChange("prepTimeMinutes", e.target.value)}
              disabled={submitting}
            />
          </Field>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-sand py-3 text-sm font-semibold text-chocolate disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-chocolate py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddItemModal({ form, errors, submitting, ingredients, units, onClose, onChange, onSubmit }: {
  form: AddItemForm;
  errors: Record<string, string>;
  submitting: boolean;
  ingredients: Ingredient[];
  units: UnitOfMeasure[];
  onClose: () => void;
  onChange: <K extends keyof AddItemForm>(key: K, value: AddItemForm[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full rounded-t-3xl bg-white pb-8 pt-5 px-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-chocolate">Adicionar ingrediente</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-muted text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <Field label="Ingrediente" required htmlFor="add-item-ingredient" error={errors.ingredientId}>
            <select
              id="add-item-ingredient"
              className={`input-field ${errors.ingredientId ? "border-rose" : ""}`}
              value={form.ingredientId}
              onChange={(e) => onChange("ingredientId", e.target.value)}
              disabled={submitting}
            >
              <option value="">Selecione…</option>
              {ingredients.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantidade" required htmlFor="add-item-qty" error={errors.quantity}>
              <input
                id="add-item-qty"
                type="number"
                step="any"
                min={0}
                className={`input-field ${errors.quantity ? "border-rose" : ""}`}
                value={form.quantity}
                onChange={(e) => onChange("quantity", e.target.value)}
                disabled={submitting}
              />
            </Field>
            <Field label="Unidade" required htmlFor="add-item-unit" error={errors.unitId}>
              <select
                id="add-item-unit"
                className={`input-field ${errors.unitId ? "border-rose" : ""}`}
                value={form.unitId}
                onChange={(e) => onChange("unitId", e.target.value)}
                disabled={submitting}
              >
                <option value="">Selecione…</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-sand py-3 text-sm font-semibold text-chocolate disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-chocolate py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Adicionando…" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditItemModal({ item, form, errors, submitting, units, onClose, onChange, onSubmit }: {
  item: RecipeItem;
  form: EditItemForm;
  errors: Record<string, string>;
  submitting: boolean;
  units: UnitOfMeasure[];
  onClose: () => void;
  onChange: <K extends keyof EditItemForm>(key: K, value: EditItemForm[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full rounded-t-3xl bg-white pb-8 pt-5 px-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-chocolate">Editar {item.ingredientName}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-muted text-xl">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantidade" required htmlFor="edit-item-qty" error={errors.quantity}>
            <input
              id="edit-item-qty"
              type="number"
              step="any"
              min={0}
              className={`input-field ${errors.quantity ? "border-rose" : ""}`}
              value={form.quantity}
              onChange={(e) => onChange("quantity", e.target.value)}
              disabled={submitting}
            />
          </Field>
          <Field label="Unidade" required htmlFor="edit-item-unit" error={errors.unitId}>
            <select
              id="edit-item-unit"
              className={`input-field ${errors.unitId ? "border-rose" : ""}`}
              value={form.unitId}
              onChange={(e) => onChange("unitId", e.target.value)}
              disabled={submitting}
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-sand py-3 text-sm font-semibold text-chocolate disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-chocolate py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmRemoveItemModal({ item, onConfirm, onCancel }: {
  item: RecipeItem;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-5">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6">
        <p className="font-display mb-2 font-semibold text-chocolate">Remover ingrediente?</p>
        <p className="mb-4 text-sm text-muted">
          <strong className="text-chocolate">{item.ingredientName}</strong> será removido desta receita. O custo será recalculado.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-sand py-2.5 text-sm font-semibold text-chocolate"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose py-2.5 text-sm font-semibold text-white"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ReceitaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<RecipeEditForm>({ name: "", description: "", yieldQuantity: "", yieldUnit: "", prepTimeMinutes: "0" });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addItemForm, setAddItemForm] = useState<AddItemForm>(EMPTY_ADD_ITEM_FORM);
  const [addItemErrors, setAddItemErrors] = useState<Record<string, string>>({});

  const [editingItem, setEditingItem] = useState<RecipeItem | null>(null);
  const [editItemForm, setEditItemForm] = useState<EditItemForm>({ quantity: "", unitId: "" });
  const [editItemErrors, setEditItemErrors] = useState<Record<string, string>>({});

  const [removingItem, setRemovingItem] = useState<RecipeItem | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [itemActionLoading, setItemActionLoading] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(type: ToastState["type"], message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    if (type !== "loading") toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  async function loadAll(silent = false) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const [recipeRow, ingredientRows, unitRows] = await Promise.all([
        recipeApi.getRecipe(id),
        ingredientApi.listIngredients(),
        unitApi.listUnits(),
      ]);
      setRecipe(recipeRow);
      setIngredients(ingredientRows.filter((i) => i.active));
      setUnits(unitRows.filter((u) => u.isActive));
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Erro ao carregar receita.");
      } else {
        showToast("error", "Erro ao atualizar receita.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  function applyServerValidationErrors(details: unknown, setter: (errs: Record<string, string>) => void) {
    if (!Array.isArray(details)) return false;
    const errs: Record<string, string> = {};
    (details as ValidationError[]).forEach((e) => { errs[e.field] = e.message; });
    if (Object.keys(errs).length === 0) return false;
    setter(errs);
    return true;
  }

  // ── Editar receita (campos escalares) ──────────────────────────────────────

  function openEdit() {
    if (!recipe) return;
    setEditForm({
      name: recipe.name,
      description: recipe.description ?? "",
      yieldQuantity: String(recipe.yieldQuantity),
      yieldUnit: recipe.yieldUnit,
      prepTimeMinutes: String(recipe.prepTimeMinutes),
    });
    setEditErrors({});
    setEditModalOpen(true);
  }

  function setEditField<K extends keyof RecipeEditForm>(key: K, value: RecipeEditForm[K]) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
    setEditErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateEditForm(): boolean {
    const errs: Record<string, string> = {};
    const name = editForm.name.trim();
    if (!name || name.length < 2 || name.length > 150) errs.name = "Nome deve ter entre 2 e 150 caracteres.";

    const yieldQty = parseFloat(editForm.yieldQuantity);
    if (editForm.yieldQuantity.trim() === "" || Number.isNaN(yieldQty) || yieldQty <= 0) {
      errs.yieldQuantity = "Rendimento deve ser maior que zero.";
    }
    if (!editForm.yieldUnit.trim() || editForm.yieldUnit.length > 60) {
      errs.yieldUnit = "Unidade de rendimento é obrigatória (máx. 60 caracteres).";
    }
    const prepTime = parseFloat(editForm.prepTimeMinutes);
    if (editForm.prepTimeMinutes.trim() !== "" && (Number.isNaN(prepTime) || prepTime < 0)) {
      errs.prepTimeMinutes = "Deve ser maior ou igual a 0.";
    }
    if (editForm.description.length > 500) errs.description = "Máximo 500 caracteres.";

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleEditSubmit() {
    if (!validateEditForm()) return;
    setSubmitting(true);
    showToast("loading", "Salvando alterações…");
    try {
      await recipeApi.updateRecipe(id, {
        name: editForm.name,
        description: editForm.description.trim() || null,
        yieldQuantity: parseFloat(editForm.yieldQuantity),
        yieldUnit: editForm.yieldUnit,
        prepTimeMinutes: editForm.prepTimeMinutes.trim() === "" ? undefined : parseFloat(editForm.prepTimeMinutes),
      });
      showToast("success", "Receita atualizada.");
      setEditModalOpen(false);
      await loadAll(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details, setEditErrors)) {
        showToast("error", "Corrija os campos destacados.");
      } else {
        showToast("error", err instanceof Error ? err.message : "Erro ao salvar receita.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Ativar/Desativar ────────────────────────────────────────────────────────

  async function handleToggleActive() {
    if (!recipe) return;
    setStatusLoading(true);
    showToast("loading", recipe.active ? "Desativando receita…" : "Ativando receita…");
    try {
      if (recipe.active) {
        await recipeApi.deactivateRecipe(id);
        showToast("success", "Receita desativada.");
      } else {
        await recipeApi.activateRecipe(id);
        showToast("success", "Receita ativada.");
      }
      await loadAll(true);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Erro ao alterar status da receita.");
    } finally {
      setStatusLoading(false);
    }
  }

  // ── Adicionar ingrediente ───────────────────────────────────────────────────

  function openAddItem() {
    setAddItemForm(EMPTY_ADD_ITEM_FORM);
    setAddItemErrors({});
    setAddItemOpen(true);
  }

  function setAddItemField<K extends keyof AddItemForm>(key: K, value: AddItemForm[K]) {
    setAddItemForm((prev) => ({ ...prev, [key]: value }));
    setAddItemErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateAddItemForm(): boolean {
    const errs: Record<string, string> = {};
    if (!addItemForm.ingredientId) errs.ingredientId = "Selecione um ingrediente.";
    if (!addItemForm.unitId) errs.unitId = "Selecione uma unidade.";
    const qty = parseFloat(addItemForm.quantity);
    if (addItemForm.quantity.trim() === "" || Number.isNaN(qty) || qty <= 0) {
      errs.quantity = "Quantidade deve ser maior que zero.";
    }
    setAddItemErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleAddItemSubmit() {
    if (!validateAddItemForm()) return;
    setSubmitting(true);
    showToast("loading", "Adicionando ingrediente…");
    try {
      await recipeApi.addRecipeItem(id, {
        ingredientId: addItemForm.ingredientId,
        quantity: parseFloat(addItemForm.quantity),
        unitId: addItemForm.unitId,
      });
      showToast("success", "Ingrediente adicionado. Custo atualizado.");
      setAddItemOpen(false);
      await loadAll(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details, setAddItemErrors)) {
        showToast("error", "Corrija os campos destacados.");
      } else if (err instanceof ApiRequestError && (err.code === "INACTIVE_INGREDIENT" || err.code === "INCOMPATIBLE_UNIT" || err.code === "DUPLICATE_INGREDIENT")) {
        showToast("error", err.message);
      } else {
        showToast("error", err instanceof Error ? err.message : "Erro ao adicionar ingrediente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Editar item ──────────────────────────────────────────────────────────────

  function openEditItem(item: RecipeItem) {
    setEditingItem(item);
    setEditItemForm({ quantity: String(item.quantity), unitId: item.unitId });
    setEditItemErrors({});
  }

  function setEditItemField<K extends keyof EditItemForm>(key: K, value: EditItemForm[K]) {
    setEditItemForm((prev) => ({ ...prev, [key]: value }));
    setEditItemErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateEditItemForm(): boolean {
    const errs: Record<string, string> = {};
    if (!editItemForm.unitId) errs.unitId = "Selecione uma unidade.";
    const qty = parseFloat(editItemForm.quantity);
    if (editItemForm.quantity.trim() === "" || Number.isNaN(qty) || qty <= 0) {
      errs.quantity = "Quantidade deve ser maior que zero.";
    }
    setEditItemErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleEditItemSubmit() {
    if (!editingItem || !validateEditItemForm()) return;
    setSubmitting(true);
    showToast("loading", "Salvando item…");
    try {
      await recipeApi.updateRecipeItem(id, editingItem.id, {
        quantity: parseFloat(editItemForm.quantity),
        unitId: editItemForm.unitId,
      });
      showToast("success", "Item atualizado. Custo recalculado.");
      setEditingItem(null);
      await loadAll(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details, setEditItemErrors)) {
        showToast("error", "Corrija os campos destacados.");
      } else if (err instanceof ApiRequestError && err.code === "INCOMPATIBLE_UNIT") {
        showToast("error", err.message);
      } else {
        showToast("error", err instanceof Error ? err.message : "Erro ao salvar item.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Remover item ─────────────────────────────────────────────────────────────

  async function handleRemoveConfirm() {
    if (!removingItem) return;
    const item = removingItem;
    setRemovingItem(null);
    setItemActionLoading(item.id);
    showToast("loading", "Removendo ingrediente…");
    try {
      await recipeApi.removeRecipeItem(id, item.id);
      showToast("success", "Ingrediente removido. Custo recalculado.");
      await loadAll(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "LAST_ITEM") {
        showToast("error", err.message);
      } else {
        showToast("error", err instanceof Error ? err.message : "Erro ao remover ingrediente.");
      }
    } finally {
      setItemActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto min-h-screen max-w-app bg-cream pb-8">
        <HeaderMinimal title="Receita" />
        <div className="p-5"><LoadingState /></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="mx-auto min-h-screen max-w-app bg-cream pb-8">
        <HeaderMinimal title="Receita" />
        <div className="p-5"><ErrorState message={error ?? "Receita não encontrada."} onRetry={loadAll} /></div>
      </div>
    );
  }

  const canRemoveItem = recipe.items.length > 1;

  return (
    <div className="mx-auto min-h-screen max-w-app bg-cream pb-8">
      <HeaderMinimal title="Receita" />

      <div className="space-y-4 p-5">
        <Link href="/admin/receitas" className="text-sm font-medium text-chocolate underline">
          ← Voltar para Receitas
        </Link>

        <div className="shadow-card rounded-2xl bg-white p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-chocolate">{recipe.name}</h1>
            <StatusBadge isActive={recipe.active} activeLabel="Ativa" inactiveLabel="Inativa" />
          </div>
          {recipe.description && <p className="mb-3 text-sm text-muted">{recipe.description}</p>}
          <p className="mb-4 text-sm text-muted">
            Rende {recipe.yieldQuantity} {recipe.yieldUnit}
            {recipe.prepTimeMinutes > 0 && ` · ${recipe.prepTimeMinutes} min de preparo`}
          </p>

          <div className="mb-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-sand/60 px-2 py-2">
              <p className="text-base font-semibold leading-none text-chocolate">{formatCurrency(recipe.totalCost)}</p>
              <p className="mt-1 text-[10px] text-muted">Custo total</p>
            </div>
            <div className="rounded-lg bg-sand/60 px-2 py-2">
              <p className="text-base font-semibold leading-none text-chocolate">{formatCurrency(recipe.unitCost)}</p>
              <p className="mt-1 text-[10px] text-muted">Custo por {recipe.yieldUnit}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={openEdit}
              className="flex-1 rounded-xl border border-sand py-2 text-sm font-semibold text-chocolate"
            >
              Editar receita
            </button>
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={statusLoading}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold disabled:opacity-50 ${
                recipe.active ? "border border-sand text-muted" : "bg-sage/10 text-sage"
              }`}
            >
              {statusLoading ? "…" : recipe.active ? "Desativar" : "Ativar"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-chocolate">
            Ingredientes ({recipe.items.length})
          </p>
          <button
            type="button"
            onClick={openAddItem}
            disabled={ingredients.length === 0}
            className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            + Adicionar
          </button>
        </div>

        <div className="space-y-3">
          {recipe.items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              actionLoading={itemActionLoading === item.id}
              canRemove={canRemoveItem}
              onEdit={() => openEditItem(item)}
              onRemove={() => setRemovingItem(item)}
            />
          ))}
        </div>
      </div>

      {editModalOpen && (
        <RecipeEditModal
          form={editForm}
          errors={editErrors}
          submitting={submitting}
          onClose={() => setEditModalOpen(false)}
          onChange={setEditField}
          onSubmit={handleEditSubmit}
        />
      )}

      {addItemOpen && (
        <AddItemModal
          form={addItemForm}
          errors={addItemErrors}
          submitting={submitting}
          ingredients={ingredients}
          units={units}
          onClose={() => setAddItemOpen(false)}
          onChange={setAddItemField}
          onSubmit={handleAddItemSubmit}
        />
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          form={editItemForm}
          errors={editItemErrors}
          submitting={submitting}
          units={units}
          onClose={() => setEditingItem(null)}
          onChange={setEditItemField}
          onSubmit={handleEditItemSubmit}
        />
      )}

      {removingItem && (
        <ConfirmRemoveItemModal
          item={removingItem}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setRemovingItem(null)}
        />
      )}

      <ValidationSummary toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
