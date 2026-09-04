"use client";

import { useRef } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
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
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  submitting: boolean;
  submitLabel: string;
  cancelLabel?: string;
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
          className="fixed inset-x-0 bottom-0 z-40 max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-card px-5 pb-8 pt-5 outline-none data-open:animate-in data-open:slide-in-from-bottom-10 data-closed:animate-out data-closed:slide-out-to-bottom-10 md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:data-open:slide-in-from-bottom-0 md:data-closed:slide-out-to-bottom-0"
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

          <div ref={fieldsRef} className="space-y-4">
            {children}
          </div>

          <div className="mt-6 flex gap-3">
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
