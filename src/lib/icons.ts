import {
  Cake,
  Gift,
  Candy,
  Briefcase,
  Heart,
  Coffee,
  Calendar,
  LayoutGrid,
  Tag,
  type LucideIcon,
} from "lucide-react";

// Mapa explícito (não lookup dinâmico pelo pacote inteiro) — melhor
// tree-shaking, só os ícones realmente usados entram no bundle. Nomes batem
// com OccasionTag.icon (Sprint DS.4) — cadastrar aqui ao adicionar um ícone
// novo em `/admin/ocasioes`; nomes fora deste mapa caem no fallback `Tag`.
const ICON_MAP: Record<string, LucideIcon> = {
  cake: Cake,
  gift: Gift,
  candy: Candy,
  briefcase: Briefcase,
  heart: Heart,
  coffee: Coffee,
  calendar: Calendar,
  "layout-grid": LayoutGrid,
};

export function resolveOccasionIcon(name: string): LucideIcon {
  return ICON_MAP[name.toLowerCase()] ?? Tag;
}
