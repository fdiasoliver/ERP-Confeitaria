"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import * as productApi from "@/lib/api/productApi";
import type { Product } from "@/lib/api/productApi";
import * as productPackagingApi from "@/lib/api/productPackagingApi";
import { ApiRequestError as PPApiRequestError, type ProductPackaging } from "@/lib/api/productPackagingApi";
import * as packagingApi from "@/lib/api/packagingApi";
import type { Packaging } from "@/lib/api/packagingApi";

// ── Local types ────────────────────────────────────────────────────────────────

interface AddPackagingForm {
  packagingId: string;
  quantity: string;
}
const EMPTY_ADD_FORM: AddPackagingForm = { packagingId: "", quantity: "1" };

// ── Local helper components ────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="shadow-card h-36 animate-pulse rounded-2xl bg-white" />
      <div className="shadow-card h-20 animate-pulse rounded-2xl bg-white" />
      <div className="shadow-card h-20 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}

function PackagingLinkCard({ link, actionLoading, onEdit, onRemove }: {
  link: ProductPackaging;
  actionLoading: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="shadow-card flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-chocolate">{link.packagingName}</p>
        <p className="text-sm text-muted">{link.quantity}× · {formatCurrency(link.unitCost)} cada</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={actionLoading}
          aria-label={`Editar quantidade de ${link.packagingName}`}
          className="rounded-xl border border-sand px-3 py-2 text-xs font-semibold text-chocolate disabled:opacity-50"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={actionLoading}
          aria-label={`Remover ${link.packagingName}`}
          className="rounded-xl border border-sand px-3 py-2 text-xs font-semibold text-rose disabled:opacity-50"
        >
          {actionLoading ? "…" : "Remover"}
        </button>
      </div>
    </div>
  );
}

function AddPackagingModal({ form, errors, submitting, packagings, onClose, onChange, onSubmit }: {
  form: AddPackagingForm;
  errors: Record<string, string>;
  submitting: boolean;
  packagings: Packaging[];
  onClose: () => void;
  onChange: <K extends keyof AddPackagingForm>(key: K, value: AddPackagingForm[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <EntityForm title="Adicionar embalagem" submitting={submitting} submitLabel="Adicionar" onClose={onClose} onSubmit={onSubmit}>
      <Field label="Embalagem" required htmlFor="add-packaging-id" error={errors.packagingId}>
        <select
          id="add-packaging-id"
          className={`input-field ${errors.packagingId ? "border-rose" : ""}`}
          value={form.packagingId}
          onChange={(e) => onChange("packagingId", e.target.value)}
          disabled={submitting}
        >
          <option value="">Selecione…</option>
          {packagings.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.unitCost)})</option>
          ))}
        </select>
      </Field>

      <Field label="Quantidade" required htmlFor="add-packaging-qty" error={errors.quantity}>
        <input
          id="add-packaging-qty"
          type="number"
          step="1"
          min={1}
          className={`input-field ${errors.quantity ? "border-rose" : ""}`}
          value={form.quantity}
          onChange={(e) => onChange("quantity", e.target.value)}
          disabled={submitting}
        />
      </Field>
    </EntityForm>
  );
}

function EditPackagingQuantityModal({ link, quantity, error, submitting, onClose, onChange, onSubmit }: {
  link: ProductPackaging;
  quantity: string;
  error?: string;
  submitting: boolean;
  onClose: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <EntityForm title={`Editar ${link.packagingName}`} submitting={submitting} submitLabel="Salvar" onClose={onClose} onSubmit={onSubmit}>
      <Field label="Quantidade" required htmlFor="edit-packaging-qty" error={error}>
        <input
          id="edit-packaging-qty"
          type="number"
          step="1"
          min={1}
          className={`input-field ${error ? "border-rose" : ""}`}
          value={quantity}
          onChange={(e) => onChange(e.target.value)}
          disabled={submitting}
        />
      </Field>
    </EntityForm>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ProdutoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [links, setLinks] = useState<ProductPackaging[]>([]);
  const [activePackagings, setActivePackagings] = useState<Packaging[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddPackagingForm>(EMPTY_ADD_FORM);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  const [editingLink, setEditingLink] = useState<ProductPackaging | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editError, setEditError] = useState<string | undefined>(undefined);

  const [removingLink, setRemovingLink] = useState<ProductPackaging | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [linkActionLoading, setLinkActionLoading] = useState<string | null>(null);

  async function loadAll(silent = false) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const [productRow, linkRows, packagingRows] = await Promise.all([
        productApi.getProduct(id),
        productPackagingApi.listProductPackagings(id),
        packagingApi.listActivePackagings(),
      ]);
      setProduct(productRow);
      setLinks(linkRows);
      setActivePackagings(packagingRows);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Erro ao carregar produto.");
      } else {
        toast.error("Erro ao atualizar produto.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  // "Editar produto" reutiliza o modal já existente em /admin/produtos (não
  // duplicado aqui) — navega de volta com ?edit={id}, mesma convenção de
  // /?cart=open já documentada em CLAUDE.md.
  function goToEditProduct() {
    router.push(`/admin/produtos?edit=${id}`);
  }

  // ── Adicionar embalagem ──────────────────────────────────────────────────────

  const linkedPackagingIds = new Set(links.map((l) => l.packagingId));
  const packagingOptions = activePackagings.filter((p) => !linkedPackagingIds.has(p.id));

  function openAdd() {
    setAddForm(EMPTY_ADD_FORM);
    setAddErrors({});
    setAddOpen(true);
  }

  function setAddField<K extends keyof AddPackagingForm>(key: K, value: AddPackagingForm[K]) {
    setAddForm((prev) => ({ ...prev, [key]: value }));
    setAddErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateAddForm(): boolean {
    const errs: Record<string, string> = {};
    if (!addForm.packagingId) errs.packagingId = "Selecione uma embalagem.";
    const qty = parseInt(addForm.quantity, 10);
    if (addForm.quantity.trim() === "" || !Number.isInteger(qty) || qty <= 0) {
      errs.quantity = "Quantidade deve ser um número inteiro maior que zero.";
    }
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleAddSubmit() {
    if (!validateAddForm()) return;
    setSubmitting(true);
    const toastId = toast.loading("Adicionando embalagem…");
    try {
      await productPackagingApi.addProductPackaging(id, {
        packagingId: addForm.packagingId,
        quantity: parseInt(addForm.quantity, 10),
      });
      toast.success("Embalagem adicionada.", { id: toastId });
      setAddOpen(false);
      await loadAll(true);
    } catch (err) {
      if (err instanceof PPApiRequestError && (err.code === "INACTIVE_PACKAGING" || err.code === "DUPLICATE_PACKAGING")) {
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao adicionar embalagem.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Editar quantidade ────────────────────────────────────────────────────────

  function openEditLink(link: ProductPackaging) {
    setEditingLink(link);
    setEditQuantity(String(link.quantity));
    setEditError(undefined);
  }

  async function handleEditLinkSubmit() {
    if (!editingLink) return;
    const qty = parseInt(editQuantity, 10);
    if (editQuantity.trim() === "" || !Number.isInteger(qty) || qty <= 0) {
      setEditError("Quantidade deve ser um número inteiro maior que zero.");
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading("Salvando quantidade…");
    try {
      await productPackagingApi.updateProductPackaging(id, editingLink.id, { quantity: qty });
      toast.success("Quantidade atualizada.", { id: toastId });
      setEditingLink(null);
      await loadAll(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar quantidade.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Remover vínculo ──────────────────────────────────────────────────────────

  async function handleRemoveConfirm() {
    if (!removingLink) return;
    const link = removingLink;
    setRemovingLink(null);
    setLinkActionLoading(link.id);
    const toastId = toast.loading("Removendo embalagem…");
    try {
      await productPackagingApi.removeProductPackaging(id, link.id);
      toast.success("Embalagem removida.", { id: toastId });
      await loadAll(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover embalagem.", { id: toastId });
    } finally {
      setLinkActionLoading(null);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <HeaderMinimal title="Produto" />
        <div className="p-5"><LoadingState /></div>
      </PageContainer>
    );
  }

  if (error || !product) {
    return (
      <PageContainer>
        <HeaderMinimal title="Produto" />
        <div className="p-5">
          <ErrorState message={error ?? "Produto não encontrado."} onRetry={() => loadAll()} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderMinimal title="Produto" />

      <div className="space-y-4 p-5">
        <Link href="/admin/produtos" className="text-sm font-medium text-chocolate underline">
          ← Voltar para Produtos
        </Link>

        <div className="shadow-card rounded-2xl bg-white p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-chocolate">{product.name}</h1>
            <StatusBadge isActive={product.active} activeLabel="Ativo" inactiveLabel="Inativo" />
          </div>
          <p className="mb-4 text-sm text-muted">{product.categoryName}</p>

          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-sand/60 px-2 py-2">
              <p className="text-base font-semibold leading-none text-chocolate">{formatCurrency(product.basePrice)}</p>
              <p className="mt-1 text-[10px] text-muted">Preço praticado</p>
            </div>
            <div className="rounded-lg bg-sand/60 px-2 py-2">
              <p className="text-base font-semibold leading-none text-chocolate">{formatCurrency(product.costPrice)}</p>
              <p className="mt-1 text-[10px] text-muted">Custo (ingred. + embal.)</p>
            </div>
            <div className="rounded-lg bg-sand/60 px-2 py-2">
              <p className="text-base font-semibold leading-none text-chocolate">{(product.margin * 100).toFixed(0)}%</p>
              <p className="mt-1 text-[10px] text-muted">Margem real</p>
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-sand p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Preço sugerido (P3.1)</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Custo ingredientes + embalagem</span>
                <span>{formatCurrency(product.costPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Mão de obra ({product.prepTimeMinutes} min)</span>
                <span>{formatCurrency(product.laborCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Rateio de custo fixo</span>
                <span>{formatCurrency(product.fixedCostShare)}</span>
              </div>
              <div className="flex justify-between border-t border-sand pt-1 font-semibold text-chocolate">
                <span>Custo total</span>
                <span>{formatCurrency(product.totalCost)}</span>
              </div>
              <div className="flex justify-between font-semibold text-chocolate">
                <span>Preço sugerido</span>
                <span>{formatCurrency(product.suggestedPrice)}</span>
              </div>
            </div>
            {product.basePrice < product.suggestedPrice && (
              <p className="mt-2 text-xs text-rose">
                Preço praticado está {formatCurrency(product.suggestedPrice - product.basePrice)} abaixo do sugerido.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={goToEditProduct}
            className="w-full rounded-xl border border-sand py-2 text-sm font-semibold text-chocolate"
          >
            Editar produto
          </button>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-chocolate">Receitas ({product.recipes.length})</p>
          {product.recipes.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma receita vinculada.</p>
          ) : (
            <div className="space-y-2">
              {product.recipes.map((r) => (
                <div key={r.recipeId} className="shadow-card flex items-center justify-between rounded-2xl bg-white p-3">
                  <p className="text-sm font-semibold text-chocolate">{r.recipeName}</p>
                  <p className="text-xs text-muted">{r.quantity}×</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-1 text-[11px] text-muted">Somente leitura aqui — editar receitas em &quot;Editar produto&quot;.</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-chocolate">Embalagens ({links.length})</p>
          <button
            type="button"
            onClick={openAdd}
            disabled={packagingOptions.length === 0}
            className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            + Adicionar
          </button>
        </div>

        {links.length === 0 ? (
          <EmptyState
            title="Nenhuma embalagem vinculada"
            description="Adicione embalagens usadas para acondicionar este produto."
            actionLabel={packagingOptions.length > 0 ? "+ Adicionar" : undefined}
            onAction={packagingOptions.length > 0 ? openAdd : undefined}
          />
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <PackagingLinkCard
                key={link.id}
                link={link}
                actionLoading={linkActionLoading === link.id}
                onEdit={() => openEditLink(link)}
                onRemove={() => setRemovingLink(link)}
              />
            ))}
          </div>
        )}
      </div>

      {addOpen && (
        <AddPackagingModal
          form={addForm}
          errors={addErrors}
          submitting={submitting}
          packagings={packagingOptions}
          onClose={() => setAddOpen(false)}
          onChange={setAddField}
          onSubmit={handleAddSubmit}
        />
      )}

      {editingLink && (
        <EditPackagingQuantityModal
          link={editingLink}
          quantity={editQuantity}
          error={editError}
          submitting={submitting}
          onClose={() => setEditingLink(null)}
          onChange={setEditQuantity}
          onSubmit={handleEditLinkSubmit}
        />
      )}

      {removingLink && (
        <ConfirmDialog
          title="Remover embalagem?"
          description={
            <>
              <strong className="text-chocolate">{removingLink.packagingName}</strong> será removida deste produto.
            </>
          }
          cancelLabel="Cancelar"
          confirmLabel="Remover"
          busy={linkActionLoading === removingLink.id}
          onCancel={() => setRemovingLink(null)}
          onConfirm={handleRemoveConfirm}
        />
      )}
    </PageContainer>
  );
}
