"use client";

export type ToastType = "success" | "error" | "warning" | "loading";

export interface ToastState {
  type: ToastType;
  message: string;
}

const TOAST_STYLES: Record<ToastType, string> = {
  success: "bg-sage/10 border border-sage text-sage",
  error: "bg-rose/15 border border-rose text-rose",
  warning: "bg-sand border border-sand text-chocolate",
  loading: "bg-sand border border-sand text-muted",
};

const TOAST_ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  loading: "…",
};

export function ValidationSummary({
  toast,
  onDismiss,
}: {
  toast: ToastState | null;
  onDismiss: () => void;
}) {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl px-4 py-3 shadow-card ${TOAST_STYLES[toast.type]}`}
    >
      <span className="text-lg font-bold">{TOAST_ICONS[toast.type]}</span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      {toast.type !== "loading" && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-inherit opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}
