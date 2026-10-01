"use client";

import { useRef } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Largura no desktop (01/10/2026 — cadastro e edição com o mesmo layout largo):
 * `wide` (padrão) = até 896px, campos em 2 colunas a partir de `md`; filhos que
 * precisam da linha inteira usam `md:col-span-2`. `compact` = 512px, 1 coluna,
 * só para formulários de 1–2 campos.
 *
 * Modal de criação/edição de entidade — bottom sheet em mobile, centralizado em
 * desktop (DESIGN_SYSTEM.md #7). Radix Dialog (via shadcn/ui, ADR-025) fornece
 * trap de foco, fechamento por Escape/overlay e aria-* de graça — a alternância
 * bottom-sheet↔dialog é resolvida aqui com Tailwind responsivo, já que nenhuma
 * primitiva shadcn cobre os dois modos sozinha (Sprint DS.5.2).
 */
export function EntityForm({
  title,
  submitting,
  submitLabel,
  cancelLabel = "Cancelar",
  size = "wide",
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  submitting: boolean;
  submitLabel: string;
  cancelLabel?: string;
  size?: "wide" | "compact";
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  const fieldsRef = useRef<HTMLDivElement>(null);

  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => {
            const first = fieldsRef.current?.querySelector<HTMLElement>("input, select, textarea");
            if (first) {
              e.preventDefault();
              first.focus();
            }
          }}
          className={`fixed inset-x-0 bottom-0 z-40 max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-card px-5 pb-8 pt-5 outline-none data-open:animate-in data-open:slide-in-from-bottom-10 data-closed:animate-out data-closed:slide-out-to-bottom-10 md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[calc(100%-3rem)] ${size === "wide" ? "md:max-w-4xl md:px-7" : "md:max-w-lg"} md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:data-open:slide-in-from-bottom-0 md:data-closed:slide-out-to-bottom-0`}
        >
          <div className="mb-5 flex items-center justify-between">
            <DialogPrimitive.Title className="font-display text-lg font-semibold text-chocolate">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Fechar">
                <XIcon />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div
            ref={fieldsRef}
            className={
              size === "wide"
                ? "space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-x-6 md:gap-y-4 md:space-y-0"
                : "space-y-4"
            }
          >
            {children}
          </div>

          <div className={`mt-6 flex gap-3${size === "wide" ? " md:ml-auto md:max-w-md" : ""}`}>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={submitting}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={onSubmit}
              disabled={submitting}
            >
              {submitting ? "Salvando…" : submitLabel}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
