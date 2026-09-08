"use client";

import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "grid" | "list";

const OPTIONS: { value: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { value: "grid", label: "Cards", icon: LayoutGrid },
  { value: "list", label: "Lista", icon: List },
];

// Cross-domain (admin + área do cliente) — vive em components/shared, não em
// components/admin/, desde que a Sprint DS.6 passou a usar este toggle também
// em /pedidos.
export function ViewToggle({ value, onChange }: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Modo de visualização"
      className="inline-flex shrink-0 gap-0.5 rounded-xl border border-sand p-0.5"
    >
      {OPTIONS.map((opt) => {
        const OptionIcon = opt.icon;
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            title={`Visualizar em ${opt.label.toLowerCase()}`}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate ${
              selected ? "bg-chocolate text-white" : "text-chocolate hover:bg-sand/60"
            }`}
          >
            <OptionIcon size={14} aria-hidden="true" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
