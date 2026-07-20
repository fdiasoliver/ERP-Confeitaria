"use client";

import { useEffect, useRef } from "react";

export function ConfirmDialog({
  title,
  description,
  cancelLabel,
  confirmLabel,
  destructive = true,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: React.ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  destructive?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6">
        <p id="confirm-dialog-title" className="font-display mb-2 font-semibold text-chocolate">
          {title}
        </p>
        <div className="mb-4 text-sm text-muted">{description}</div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-xl border border-sand py-2.5 text-sm font-semibold text-chocolate transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${
              destructive
                ? "bg-rose hover:bg-rose/90 focus-visible:outline-rose"
                : "bg-chocolate hover:bg-chocolate/90 focus-visible:outline-chocolate"
            }`}
          >
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
