"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface DeleteCategoryDialogProps {
  category: { id: string; name: string };
  /** Categorias possíveis de destino (a própria categoria é ignorada). */
  options: { id: string; name: string }[];
  /** Plural do que fica vinculado à categoria — ex.: "produtos", "ingredientes". */
  itemsLabel: string;
  /** Singular correspondente — ex.: "produto". */
  itemLabel: string;
  /** Permite mover os itens para "Sem categoria" (ingredientes e embalagens). */
  allowNoCategory?: boolean;
  /** Chama a API. `transferTo`: undefined = sem transferência; string = destino;
   * null = sem categoria. Deve lançar o erro da API (com `details.count`) quando
   * a categoria tiver itens vinculados e não houver destino. */
  onDelete: (transferTo?: string | null) => Promise<void>;
  onCancel: () => void;
  onDeleted: () => void;
}

function linkedCount(err: unknown): number | null {
  const details = (err as { details?: { count?: unknown } } | null)?.details;
  return typeof details?.count === "number" && details.count > 0 ? details.count : null;
}

/**
 * Exclusão de categoria com transferência (01/10/2026). Primeiro confirma a
 * exclusão; se a API responder que há itens vinculados, mostra quantos são e
 * pede a categoria de destino — os itens são movidos e a categoria excluída
 * numa única operação no servidor.
 */
export function DeleteCategoryDialog({
  category,
  options,
  itemsLabel,
  itemLabel,
  allowNoCategory = false,
  onDelete,
  onCancel,
  onDeleted,
}: DeleteCategoryDialogProps) {
  const [count, setCount] = useState<number | null>(null);
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const destinations = options.filter((o) => o.id !== category.id);

  async function run(transferTo?: string | null) {
    setBusy(true);
    setError(null);
    try {
      await onDelete(transferTo);
      onDeleted();
    } catch (err) {
      const linked = linkedCount(err);
      if (linked !== null && transferTo === undefined) setCount(linked);
      else setError(err instanceof Error ? err.message : "Erro ao excluir categoria.");
    } finally {
      setBusy(false);
    }
  }

  function confirmTransfer() {
    if (!target) {
      setError("Escolha para onde mover os itens.");
      return;
    }
    run(target === "__none__" ? null : target);
  }

  return (
    <AlertDialog open onOpenChange={(open) => { if (!open && !busy) onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-chocolate">Excluir categoria?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted">
            {count === null ? (
              <>A categoria <strong className="text-chocolate">{`"${category.name}"`}</strong> será excluída permanentemente.</>
            ) : (
              <>
                <strong className="text-chocolate">{`"${category.name}"`}</strong> tem {count} {count === 1 ? itemLabel : itemsLabel} nesta categoria.
                Escolha para onde movê-los antes de excluir.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {count !== null && (
          <div>
            <label htmlFor="delete-category-target" className="mb-1 block text-sm font-medium text-chocolate">
              Mover {itemsLabel} para
            </label>
            <select
              id="delete-category-target"
              className="input-field"
              value={target}
              onChange={(e) => { setTarget(e.target.value); setError(null); }}
              disabled={busy}
            >
              <option value="">Selecione a categoria…</option>
              {allowNoCategory && <option value="__none__">Sem categoria</option>}
              {destinations.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            {destinations.length === 0 && !allowNoCategory && (
              <p className="mt-1 text-xs text-muted">Crie (ou ative) outra categoria para poder mover os {itemsLabel}.</p>
            )}
          </div>
        )}

        {error && <p className="rounded-lg bg-rose/10 px-3 py-2 text-xs text-rose">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel type="button" disabled={busy}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              if (count === null) run(undefined);
              else confirmTransfer();
            }}
          >
            {busy ? "…" : count === null ? "Excluir" : "Mover e excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
