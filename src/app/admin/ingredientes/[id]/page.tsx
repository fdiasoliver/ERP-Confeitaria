"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { formatCurrency } from "@/lib/formatters/currency";
import * as ingredientApi from "@/lib/api/ingredientApi";
import type { Ingredient, IngredientPriceHistoryEntry, PriceSource } from "@/lib/api/ingredientApi";
import * as recipeApi from "@/lib/api/recipeApi";
import type { Recipe } from "@/lib/api/recipeApi";

// Página de detalhe do ingrediente (01/10/2026) — mesmo layout de
// /admin/embalagens/[id]: dados, estoque, histórico de preços (já gravado em
// IngredientPriceHistory a cada mudança de preço e na importação de NFC-e) e
// receitas que usam o ingrediente. A edição reaproveita o formulário da
// listagem (/admin/ingredientes?edit=id).

const SOURCE_LABELS: Record<PriceSource, string> = {
  MANUAL: "Manual",
  CONAB_CEASA: "CONAB/CEASA",
  CEPEA: "CEPEA",
  NOTA_FISCAL: "Nota fiscal",
};

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatQuantity(value: number): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="shadow-card h-40 animate-pulse rounded-2xl bg-white" />
      <div className="shadow-card h-24 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}

export default function IngredienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [priceHistory, setPriceHistory] = useState<IngredientPriceHistoryEntry[]>([]);
  const [usedIn, setUsedIn] = useState<{ recipe: Recipe; quantity: number; unit: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  async function loadAll(silent = false) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const [ingredientRows, historyRows, recipeRows] = await Promise.all([
        ingredientApi.listIngredients(),
        ingredientApi.getPriceHistory(id),
        recipeApi.listRecipes(),
      ]);
      const found = ingredientRows.find((i) => i.id === id);
      if (!found) throw new Error("Ingrediente não encontrado.");
      setIngredient(found);
      setPriceHistory(historyRows);
      setUsedIn(
        recipeRows.flatMap((recipe) =>
          recipe.items
            .filter((item) => item.ingredientId === id)
            .map((item) => ({ recipe, quantity: item.quantity, unit: item.unitAbbreviation })),
        ),
      );
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : "Erro ao carregar ingrediente.");
      else toast.error("Erro ao atualizar ingrediente.");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  async function handleActivate() {
    setStatusLoading(true);
    const toastId = toast.loading("Ativando ingrediente…");
    try {
      await ingredientApi.activateIngredient(id);
      toast.success("Ingrediente ativado.", { id: toastId });
      await loadAll(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar ingrediente.", { id: toastId });
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleDeactivateConfirm() {
    setConfirmDeactivate(false);
    setStatusLoading(true);
    const toastId = toast.loading("Desativando ingrediente…");
    try {
      await ingredientApi.deactivateIngredient(id);
      toast.success("Ingrediente desativado.", { id: toastId });
      await loadAll(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao desativar ingrediente.", { id: toastId });
    } finally {
      setStatusLoading(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <HeaderMinimal title="Ingrediente" />
        <div className="p-5"><LoadingState /></div>
      </PageContainer>
    );
  }

  if (error || !ingredient) {
    return (
      <PageContainer>
        <HeaderMinimal title="Ingrediente" />
        <div className="p-5"><ErrorState message={error ?? "Ingrediente não encontrado."} onRetry={() => loadAll()} /></div>
      </PageContainer>
    );
  }

  const stockValue = ingredient.stockQuantity * ingredient.currentPrice;
  const unit = ingredient.unitAbbreviation;

  return (
    <PageContainer>
      <HeaderMinimal title="Ingrediente" />

      <div className="space-y-4 p-5">
        <Link href="/admin/ingredientes" className="text-sm font-medium text-chocolate underline">
          ← Voltar para Ingredientes
        </Link>

        <div className="shadow-card rounded-2xl bg-white p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-chocolate">{ingredient.name}</h1>
            <StatusBadge isActive={ingredient.active} activeLabel="Ativo" inactiveLabel="Inativo" />
            {ingredient.isLowStock && (
              <span className="inline-flex rounded-full bg-rose/10 px-2 py-0.5 text-xs font-semibold text-rose">
                Estoque baixo
              </span>
            )}
          </div>
          <p className="mb-4 text-sm text-muted">
            {ingredient.categoryName ?? "Sem categoria"} · {ingredient.unitName}
            {ingredient.supplier ? ` · Fornecedor: ${ingredient.supplier}` : ""}
            {ingredient.externalCode ? ` · Código: ${ingredient.externalCode}` : ""}
          </p>

          <div className="mb-4 grid grid-cols-2 gap-2 text-center md:grid-cols-4">
            <div className="rounded-lg bg-sand/60 px-2 py-2">
              <p className="text-base font-semibold leading-none text-chocolate">
                {formatCurrency(ingredient.currentPrice)}/{unit}
              </p>
              <p className="mt-1 text-[10px] text-muted">Preço atual</p>
            </div>
            <div className="rounded-lg bg-sand/60 px-2 py-2">
              <p className={`text-base font-semibold leading-none ${ingredient.isLowStock ? "text-rose" : "text-chocolate"}`}>
                {formatQuantity(ingredient.stockQuantity)} {unit}
              </p>
              <p className="mt-1 text-[10px] text-muted">Estoque</p>
            </div>
            <div className="rounded-lg bg-sand/60 px-2 py-2">
              <p className="text-base font-semibold leading-none text-chocolate">{formatQuantity(ingredient.minStock)} {unit}</p>
              <p className="mt-1 text-[10px] text-muted">Mínimo</p>
            </div>
            <div className="rounded-lg bg-sand/60 px-2 py-2">
              <p className="text-base font-semibold leading-none text-chocolate">{formatCurrency(stockValue)}</p>
              <p className="mt-1 text-[10px] text-muted">Valor em estoque</p>
            </div>
          </div>

          {ingredient.packagePrice !== null && ingredient.packageQuantity !== null && (
            <p className="mb-4 text-xs text-muted">
              Preço por embalagem: {formatCurrency(ingredient.packagePrice)} a cada {formatQuantity(ingredient.packageQuantity)} {unit}
            </p>
          )}

          <div className="flex gap-2">
            <Link
              href={`/admin/ingredientes?edit=${ingredient.id}`}
              className="flex-1 rounded-xl border border-sand py-2 text-center text-sm font-semibold text-chocolate"
            >
              Editar ingrediente
            </Link>
            <button
              type="button"
              onClick={() => (ingredient.active ? setConfirmDeactivate(true) : handleActivate())}
              disabled={statusLoading}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold disabled:opacity-50 ${
                ingredient.active ? "border border-sand text-muted" : "bg-sage/10 text-sage"
              }`}
            >
              {statusLoading ? "…" : ingredient.active ? "Desativar" : "Ativar"}
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-chocolate">Histórico de Preços</p>
          {priceHistory.length === 0 ? (
            <p className="text-sm text-muted">Nenhum registro de preço.</p>
          ) : (
            <div className="space-y-2">
              {priceHistory.map((entry) => (
                <div key={entry.id} className="shadow-card flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
                  <p className="text-sm font-semibold text-chocolate">{formatCurrency(entry.price)}/{unit}</p>
                  <p className="text-right text-xs text-muted">
                    {formatDate(entry.recordedAt)} · {SOURCE_LABELS[entry.source]}
                    {entry.notes ? ` · ${entry.notes}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-chocolate">
            Usado em {usedIn.length} receita{usedIn.length !== 1 ? "s" : ""}
          </p>
          {usedIn.length === 0 ? (
            <EmptyState title="Nenhuma receita usa este ingrediente" description="Adicione o ingrediente a uma receita na página da receita." />
          ) : (
            <div className="space-y-2">
              {usedIn.map((row) => (
                <Link
                  key={row.recipe.id}
                  href={`/admin/receitas/${row.recipe.id}`}
                  className="shadow-card flex items-center justify-between rounded-2xl bg-white p-3 transition-colors hover:bg-sand/30"
                >
                  <p className="text-sm font-semibold text-chocolate">{row.recipe.name}</p>
                  <p className="text-xs text-muted">{formatQuantity(row.quantity)} {row.unit} · Ver →</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmDeactivate && (
        <ConfirmDialog
          title="Desativar ingrediente?"
          description={
            <>
              <strong className="text-chocolate">{'"'}{ingredient.name}{'"'}</strong> não poderá ser adicionado a novas receitas.
            </>
          }
          cancelLabel="Manter ativo"
          confirmLabel="Desativar"
          busy={statusLoading}
          onCancel={() => setConfirmDeactivate(false)}
          onConfirm={handleDeactivateConfirm}
        />
      )}
    </PageContainer>
  );
}
