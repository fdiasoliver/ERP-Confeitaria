"use client";

import { useEffect, useRef } from "react";

/**
 * Modal de criação/edição de entidade — bottom sheet em mobile, centralizado em
 * desktop (DESIGN_SYSTEM.md #7). Trap de foco e fechamento por Escape/overlay
 * implementados aqui uma única vez, para todos os módulos que o adotarem.
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
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const firstField = fieldsRef.current?.querySelector<HTMLElement>("input, select, textarea");
    firstField?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 md:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="entity-form-title"
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-5 md:max-w-lg md:rounded-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="entity-form-title" className="font-display text-lg font-semibold text-chocolate">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-xl text-muted transition-colors hover:bg-sand hover:text-chocolate focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"
          >
            ✕
          </button>
        </div>

        <div ref={fieldsRef} className="space-y-4">
          {children}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-sand py-3 text-sm font-semibold text-chocolate transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-chocolate py-3 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50"
          >
            {submitting ? "Salvando…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
