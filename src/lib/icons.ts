import { createElement, type ComponentProps } from "react";
import {
  Cake,
  Gift,
  Candy,
  Briefcase,
  Heart,
  Coffee,
  Calendar,
  LayoutGrid,
  Package,
  Tag,
  type LucideIcon,
} from "lucide-react";

// Mapa explícito (não lookup dinâmico pelo pacote inteiro) — melhor
// tree-shaking, só os ícones realmente usados entram no bundle. Nomes batem
// com OccasionTag.icon (Sprint DS.4) e ProductCategory.icon (mesma convenção,
// usado em /admin/categorias) — cadastrar aqui ao adicionar um ícone novo em
// qualquer uma das duas telas; nomes fora deste mapa caem no fallback `Tag`.
const ICON_MAP: Record<string, LucideIcon> = {
  cake: Cake,
  gift: Gift,
  candy: Candy,
  briefcase: Briefcase,
  heart: Heart,
  coffee: Coffee,
  calendar: Calendar,
  "layout-grid": LayoutGrid,
  package: Package,
};

export function resolveOccasionIcon(name: string): LucideIcon {
  return ICON_MAP[name.toLowerCase()] ?? Tag;
}

// Componente estático (não uma função que resolve e retorna JSX inline) —
// resolver o ícone dentro do render de outro componente via variável
// PascalCase viola a regra react-hooks/static-components do React Compiler;
// aqui a resolução fica encapsulada num componente de verdade, mesmo padrão
// já usado em VitrineSidebar.tsx (que resolve dentro de um .map(), não direto
// no corpo do componente — por isso não era pego pela regra).
export function ResolvedIcon({
  name,
  fallback = "tag",
  ...props
}: { name: string; fallback?: string } & ComponentProps<LucideIcon>) {
  const Icon = resolveOccasionIcon(name || fallback);
  return createElement(Icon, props);
}
