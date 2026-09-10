"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ChefHat,
  Users,
  ShoppingBag,
  Tags,
  PartyPopper,
  Scale,
  Egg,
  ClipboardList,
  Factory,
  Package,
  BarChart3,
  Wallet,
  UserCog,
  Palette,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";

// Papéis por rota — espelha src/proxy.ts ROLE_REQUIRED (rotas ausentes daquele
// mapa aceitam qualquer admin autenticado; aqui listamos explícito para poder
// filtrar a navegação por papel).
interface NavItem {
  href: string;
  label: string;
  roles: string[];
  icon: LucideIcon;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const ALL_ROLES = ["ADMIN", "ATENDIMENTO", "PRODUCAO", "FINANCEIRO"];

// Ícones por item (referência visual trazida pelo Product Owner, DS.6) — só a
// estrutura/uso de ícone foi adotada, mantendo a paleta clara do design
// system (a referência era um tema escuro — trocar a cor de marca exige
// alinhamento explícito, não decisão implícita desta sprint).
const NAV: NavGroup[] = [
  { items: [{ href: "/admin", label: "Painel", roles: ALL_ROLES, icon: LayoutDashboard }] },
  {
    items: [
      { href: "/admin/producao", label: "Produção", roles: ALL_ROLES, icon: ChefHat },
      { href: "/admin/clientes", label: "Clientes", roles: ["ADMIN", "ATENDIMENTO"], icon: Users },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/produtos", label: "Produtos", roles: ["ADMIN"], icon: ShoppingBag },
      { href: "/admin/categorias", label: "Categorias", roles: ["ADMIN"], icon: Tags },
      { href: "/admin/ocasioes", label: "Ocasiões", roles: ["ADMIN"], icon: PartyPopper },
    ],
  },
  {
    label: "Cadeia produtiva",
    items: [
      { href: "/admin/unidades", label: "Unidades", roles: ["ADMIN", "PRODUCAO"], icon: Scale },
      { href: "/admin/ingredientes", label: "Ingredientes", roles: ["ADMIN", "PRODUCAO"], icon: Egg },
      { href: "/admin/receitas", label: "Receitas", roles: ["ADMIN", "PRODUCAO"], icon: ClipboardList },
      { href: "/admin/fornecedores", label: "Fornecedores", roles: ["ADMIN", "PRODUCAO"], icon: Factory },
      { href: "/admin/embalagens", label: "Embalagens", roles: ["ADMIN", "PRODUCAO"], icon: Package },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/admin/relatorios", label: "Relatórios", roles: ["ADMIN", "FINANCEIRO"], icon: BarChart3 },
      { href: "/admin/despesas", label: "Despesas", roles: ["ADMIN", "FINANCEIRO"], icon: Wallet },
    ],
  },
  { items: [{ href: "/admin/usuarios", label: "Usuários", roles: ["ADMIN"], icon: UserCog }] },
  {
    items: [
      { href: "/admin/tema", label: "Tema", roles: ["ADMIN"], icon: Palette },
      { href: "/admin/config", label: "Configurações", roles: ["ADMIN"], icon: Settings },
    ],
  },
];

function initials(nameOrEmail: string): string {
  const parts = nameOrEmail.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const visibleGroups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !role || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);

  const flatItems = visibleGroups.flatMap((g) => g.items);

  return (
    <>
      {/* Desktop/tablet — sidebar vertical fixa. print:hidden: telas com exportação
          em PDF via window.print() (ex: /admin/relatorios) não devem imprimir o menu. */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sand bg-white md:flex print:hidden">
        <div className="px-5 py-5">
          <Link href="/admin" className="font-display text-lg font-semibold text-chocolate">
            Doce Menina
          </Link>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {visibleGroups.map((group) => (
            <div key={group.label ?? group.items[0].href}>
              {group.label && (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive(pathname, item.href)
                        ? "bg-surface-2 font-semibold text-sage"
                        : "text-chocolate hover:bg-surface-2/60"
                    }`}
                  >
                    <ItemIcon size={18} className="shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-sand p-3">
          <div className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chocolate text-xs font-semibold text-cream">
              {initials(session?.user?.name ?? session?.user?.email ?? "?")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-chocolate">
                {session?.user?.name ?? session?.user?.email ?? "…"}
              </p>
              <p className="truncate text-[11px] text-muted">{role}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              aria-label="Sair"
              title="Sair"
              className="shrink-0 text-muted hover:text-rose"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile — barra horizontal com rolagem */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-sand bg-white px-4 py-3 scrollbar-none md:hidden print:hidden">
        <Link href="/admin" className="font-display shrink-0 text-base font-semibold text-chocolate">
          DM
        </Link>
        {flatItems.map((item) => {
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive(pathname, item.href) ? "bg-chocolate text-white" : "bg-surface-2 text-chocolate"
              }`}
            >
              <ItemIcon size={14} className="shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
