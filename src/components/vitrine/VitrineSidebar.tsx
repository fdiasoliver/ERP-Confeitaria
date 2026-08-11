"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveOccasionIcon } from "@/lib/icons";

interface SidebarOccasion {
  id: string;
  name: string;
  icon?: string;
}

interface VitrineSidebarProps {
  occasions: SidebarOccasion[];
  selected: string;
  onSelect: (id: string) => void;
}

// Sidebar de categorias/ocasiões da Vitrine (Sprint DS.4) — mesma linguagem
// visual da Sidebar do admin (Sprint DS.2), mas componente próprio: filtra por
// ocasião pública (API), não por papel/sessão, então não reaproveita
// src/components/admin/shared/Sidebar.tsx (decisão do ai-solution-architect).
// Recolhível (modo só-ícone) a pedido do Product Owner — breakpoint md, igual
// ao admin. Em mobile (<768px) fica escondida; CategoryChips assume sozinho.
export function VitrineSidebar({ occasions, selected, onSelect }: VitrineSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sand bg-white transition-[width] duration-200 md:flex ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className={`flex items-center px-4 py-5 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <span className="font-display text-lg font-semibold text-chocolate">Categorias</span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expandir menu de categorias" : "Recolher menu de categorias"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {occasions.map((occ) => {
          const Icon = resolveOccasionIcon(occ.icon ?? "tag");
          const isActive = occ.id === selected;
          return (
            <button
              key={occ.id}
              type="button"
              onClick={() => onSelect(occ.id)}
              title={collapsed ? occ.name : undefined}
              aria-label={occ.name}
              aria-current={isActive ? "true" : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? "justify-center" : ""
              } ${isActive ? "bg-chocolate text-white" : "text-chocolate hover:bg-surface-2"}`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{occ.name}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
