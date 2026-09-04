"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { Field } from "@/components/admin/config/FormPrimitives";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { EntityForm } from "@/components/admin/shared/EntityForm";
import { formatCurrency } from "@/lib/formatters/currency";
import type { ValidationError } from "@/lib/types";
import * as packagingApi from "@/lib/api/packagingApi";
import { ApiRequestError, type Packaging, type PackagingInput, type PackagingPriceHistoryEntry, type PackagingUsage } from "@/lib/api/packagingApi";
import * as packagingCategoryApi from "@/lib/api/packagingCategoryApi";
import type { PackagingCategory } from "@/lib/api/packagingCategoryApi";
import * as supplierApi from "@/lib/api/supplierApi";
import type { Supplier } from "@/lib/api/supplierApi";

// ── Local types ────────────────────────────────────────────────────────────────

interface PackagingEditForm {
  name: string;
  categoryId: string;
  unitCost: string;
  stockQuantity: string;
  minStock: string;
  supplierId: string;
}

// PackagingPriceHistoryEntry.recordedAt é DateTime completo (não Date puro como
// Order.deliveryDate) — formatDate de src/lib/formatters/date.ts não se aplica
// aqui (assume string só de data, sem horário); formatação local dedicada.
function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Local helper components ────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="shadow-card h-40 animate-pulse rounded-2xl bg-white" />
      <div className="shadow-card h-24 animate-pulse rounded-2xl bg-white" />
      <div className="shadow-card h-24 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}

function PackagingEditModal({ form, errors, submitting, categories, suppliers, onClose, onChange, onSubmit }: {
  form: PackagingEditForm;
  errors: Record<string, string>;
  submitting: boolean;
  categories: PackagingCategory[];
  suppliers: Supplier[];
  onClose: () => void;
  onChange: <K extends keyof PackagingEditForm>(key: K, value: PackagingEditForm[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <EntityForm title="Editar embalagem" submitting={submitting} submitLabel="Salvar" onClose={onClose} onSubmit={onSubmit}>
      <Field label="Nome" required htmlFor="packaging-edit-name" error={errors.name}>
        <input
          id="packaging-edit-name"
          className={`input-field ${errors.name ? "border-rose" : ""}`}
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          maxLength={150}
          disabled={submitting}
        />
      </Field>

      <Field label="Categoria (opcional)" htmlFor="packaging-edit-category">
        <select
          id="packaging-edit-category"
          className="input-field"
          value={form.categoryId}
          onChange={(e) => onChange("categoryId", e.target.value)}
          disabled={submitting}
        >
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      <Field label="Custo unitário" required htmlFor="packaging-edit-cost" error={errors.unitCost}>
        <input
          id="packaging-edit-cost"
          type="number"
          step="any"
          min={0}
          className={`input-field ${errors.unitCost ? "border-rose" : ""}`}
          value={form.unitCost}
          onChange={(e) => onChange("unitCost", e.target.value)}
          disabled={submitting}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Estoque atual" htmlFor="packaging-edit-stock" error={errors.stockQuantity}>
          <input
            id="packaging-edit-stock"
            type="number"
            step="1"
            min={0}
            className={`input-field ${errors.stockQuantity ? "border-rose" : ""}`}
            value={form.stockQuantity}
            onChange={(e) => onChange("stockQuantity", e.target.value)}
            disabled={submitting}
          />
        </Field>
        <Field label="Estoque mínimo" htmlFor="packaging-edit-min-stock" error={errors.minStock}>
          <input
            id="packaging-edit-min-stock"
            type="number"
            step="1"
            min={0}
            className={`input-field ${errors.minStock ? "border-rose" : ""}`}
            value={form.minStock}
            onChange={(e) => onChange("minStock", e.target.value)}
            disabled={submitting}
          />
        </Field>
      </div>

      <Field label="Fornecedor (opcional)" htmlFor="packaging-edit-supplier">
        <select
          id="packaging-edit-supplier"
          className="input-field"
          value={form.supplierId}
          onChange={(e) => onChange("supplierId", e.target.value)}
          disabled={submitting}
        >
          <option value="">Sem fornecedor</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </Field>
    </EntityForm>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function EmbalagemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [packaging, setPackaging] = useState<Packaging | null>(null);
  const [priceHistory, setPriceHistory] = useState<PackagingPriceHistoryEntry[]>([]);
  const [usage, setUsage] = useState<PackagingUsage[]>([]);
  const [categories, setCategories] = useState<PackagingCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<PackagingEditForm>({
    name: "", categoryId: "", unitCost: "", stockQuantity: "0", minStock: "0", supplierId: "",
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  async function loadAll(silent = false) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const [packagingRow, historyRows, usageRows, categoryRows, supplierRows] = await Promise.all([
        packagingApi.getPackaging(id),
        packagingApi.getPackagingPriceHistory(id),
        packagingApi.getPackagingUsage(id),
        packagingCategoryApi.listPackagingCategories(),
        supplierApi.listSuppliersPaged({ pageSize: 1000, active: true }),
      ]);
      setPackaging(packagingRow);
      setPriceHistory(historyRows);
      setUsage(usageRows);
      setCategories(categoryRows);
      setSuppliers(supplierRows.items);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Erro ao carregar embalagem.");
      } else {
        toast.error("Erro ao atualizar embalagem.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  function applyServerValidationErrors(details: unknown) {
    if (!Array.isArray(details)) return false;
    const errs: Record<string, string> = {};
    (details as ValidationError[]).forEach((e) => { errs[e.field] = e.message; });
    if (Object.keys(errs).length === 0) return false;
    setEditErrors(errs);
    return true;
  }

  // ── Editar embalagem ────────────────────────────────────────────────────────

  function openEdit() {
    if (!packaging) return;
    setEditForm({
      name: packaging.name,
      categoryId: packaging.categoryId ?? "",
      unitCost: String(packaging.unitCost),
      stockQuantity: String(packaging.stockQuantity),
      minStock: String(packaging.minStock),
      supplierId: packaging.supplierId ?? "",
    });
    setEditErrors({});
    setEditModalOpen(true);
  }

  function setEditField<K extends keyof PackagingEditForm>(key: K, value: PackagingEditForm[K]) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
    setEditErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateEditForm(): boolean {
    const errs: Record<string, string> = {};
    const name = editForm.name.trim();
    if (!name || name.length < 2 || name.length > 150) errs.name = "Nome deve ter entre 2 e 150 caracteres.";

    const cost = parseFloat(editForm.unitCost);
    if (editForm.unitCost.trim() === "" || Number.isNaN(cost) || cost < 0) {
      errs.unitCost = "Custo unitário deve ser um número maior ou igual a 0.";
    }
    const stock = parseInt(editForm.stockQuantity, 10);
    if (editForm.stockQuantity.trim() !== "" && (!Number.isInteger(stock) || stock < 0)) {
      errs.stockQuantity = "Número inteiro ≥ 0.";
    }
    const min = parseInt(editForm.minStock, 10);
    if (editForm.minStock.trim() !== "" && (!Number.isInteger(min) || min < 0)) {
      errs.minStock = "Número inteiro ≥ 0.";
    }

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleEditSubmit() {
    if (!validateEditForm()) return;
    setSubmitting(true);
    const toastId = toast.loading("Salvando alterações…");
    try {
      const input: Partial<PackagingInput> = {
        name: editForm.name.trim(),
        categoryId: editForm.categoryId === "" ? null : editForm.categoryId,
        unitCost: parseFloat(editForm.unitCost),
        stockQuantity: editForm.stockQuantity.trim() === "" ? 0 : parseInt(editForm.stockQuantity, 10),
        minStock: editForm.minStock.trim() === "" ? 0 : parseInt(editForm.minStock, 10),
        supplierId: editForm.supplierId === "" ? null : editForm.supplierId,
      };
      await packagingApi.updatePackaging(id, input);
      toast.success("Embalagem atualizada.", { id: toastId });
      setEditModalOpen(false);
      await loadAll(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else if (err instanceof ApiRequestError && err.code === "DUPLICATE_NAME") {
        setEditErrors({ name: err.message });
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar embalagem.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Ativar/Desativar ────────────────────────────────────────────────────────

  async function handleActivate() {
    if (!packaging) return;
    setStatusLoading(true);
    const toastId = toast.loading("Ativando embalagem…");
    try {
      await packagingApi.activatePackaging(id);
      toast.success("Embalagem ativada.", { id: toastId });
      await loadAll(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar embalagem.", { id: toastId });
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleDeactivateConfirm() {
    setConfirmDeactivate(false);
    setStatusLoading(true);
    const toastId = toast.loading("Desativando embalagem…");
    try {
      await packagingApi.deactivatePackaging(id);
      toast.success("Embalagem desativada.", { id: toastId });
      await loadAll(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao desativar embalagem.", { id: toastId });
    } finally {
      setStatusLoading(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <HeaderMinimal title="Embalagem" />
        <div className="p-5"><LoadingState /></div>
      </PageContainer>
    );
  }

  if (error || !packaging) {
    return (
      <PageContainer>
        <HeaderMinimal title="Embalagem" />
        <div className="p-5"><ErrorState message={error ?? "Embalagem não encontrada."} onRetry={loadAll} /></div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderMinimal title="Embalagem" />

      <div className="space-y-4 p-5">
        <Link href="/admin/embalagens" className="text-sm font-medium text-chocolate underline">
          ← Voltar para Embalagens
        </Link>

        <div className="shadow-card rounded-2xl bg-white p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-chocolate">{packaging.name}</h1>
            <StatusBadge isActive={packaging.active} activeLabel="Ativa" inactiveLabel="Inativa" />
          </div>
          <p className="mb-4 text-sm text-muted">
            {packaging.categoryName ?? "Sem categoria"}
            {packaging.supplierName ? ` · Fornecedor: ${packaging.supplierName}` : ""}
          </p>

          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-sand/60 px-2 py-2">
              <p className="text-base font-semibold leading-none text-chocolate">{formatCurrency(packaging.unitCost)}</p>
              <p className="mt-1 text-[10px] text-muted">Custo atual</p>
            </div>
            <div className="rounded-lg bg-sand/60 px-2 py-2">
              <p className={`text-base font-semibold leading-none ${packaging.isLowStock ? "text-rose" : "text-chocolate"}`}>{packaging.stockQuantity}</p>
              <p className="mt-1 text-[10px] text-muted">Estoque</p>
            </div>
            <div className="rounded-lg bg-sand/60 px-2 py-2">
              <p className="text-base font-semibold leading-none text-chocolate">{packaging.minStock}</p>
              <p className="mt-1 text-[10px] text-muted">Mínimo</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={openEdit}
              className="flex-1 rounded-xl border border-sand py-2 text-sm font-semibold text-chocolate"
            >
              Editar embalagem
            </button>
            <button
              type="button"
              onClick={() => (packaging.active ? setConfirmDeactivate(true) : handleActivate())}
              disabled={statusLoading}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold disabled:opacity-50 ${
                packaging.active ? "border border-sand text-muted" : "bg-sage/10 text-sage"
              }`}
            >
              {statusLoading ? "…" : packaging.active ? "Desativar" : "Ativar"}
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-chocolate">Histórico de Preços</p>
          {priceHistory.length === 0 ? (
            <p className="text-sm text-muted">Nenhum registro de custo.</p>
          ) : (
            <div className="space-y-2">
              {priceHistory.map((entry) => (
                <div key={entry.id} className="shadow-card flex items-center justify-between rounded-2xl bg-white p-3">
                  <p className="text-sm font-semibold text-chocolate">{formatCurrency(entry.price)}</p>
                  <p className="text-xs text-muted">{formatDateTime(entry.recordedAt)}{entry.notes ? ` · ${entry.notes}` : ""}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-chocolate">Usado em {usage.length} produto{usage.length !== 1 ? "s" : ""}</p>
          {usage.length === 0 ? (
            <EmptyState title="Nenhum produto usa esta embalagem" description="Vincule esta embalagem a um produto na página de detalhe do produto." />
          ) : (
            <div className="space-y-2">
              {usage.map((row) => (
                <Link
                  key={row.id}
                  href={`/admin/produtos/${row.productId}`}
                  className="shadow-card flex items-center justify-between rounded-2xl bg-white p-3 transition-colors hover:bg-sand/30"
                >
                  <p className="text-sm font-semibold text-chocolate">{row.productName}</p>
                  <p className="text-xs text-muted">{row.quantity}× · Ver →</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {editModalOpen && (
        <PackagingEditModal
          form={editForm}
          errors={editErrors}
          submitting={submitting}
          categories={categories}
          suppliers={suppliers}
          onClose={() => setEditModalOpen(false)}
          onChange={setEditField}
          onSubmit={handleEditSubmit}
        />
      )}

      {confirmDeactivate && (
        <ConfirmDialog
          title="Desativar embalagem?"
          description={
            <>
              <strong className="text-chocolate">{'"'}{packaging.name}{'"'}</strong> não poderá ser vinculada a novos produtos.
            </>
          }
          cancelLabel="Manter ativa"
          confirmLabel="Desativar"
          busy={statusLoading}
          onCancel={() => setConfirmDeactivate(false)}
          onConfirm={handleDeactivateConfirm}
        />
      )}
    </PageContainer>
  );
}
