"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

// Papéis por rota — espelha src/proxy.ts ROLE_REQUIRED (rotas ausentes daquele
// mapa aceitam qualquer admin autenticado; aqui listamos explícito para poder
// filtrar a navegação por papel).
interface NavItem {
  href: string;
  label: string;
  roles: string[];
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const ALL_ROLES = ["ADMIN", "ATENDIMENTO", "PRODUCAO", "FINANCEIRO"];

const NAV: NavGroup[] = [
  { items: [{ href: "/admin", label: "Painel", roles: ALL_ROLES }] },
  {
    items: [
      { href: "/admin/producao", label: "Produção", roles: ALL_ROLES },
      { href: "/admin/clientes", label: "Clientes", roles: ["ADMIN", "ATENDIMENTO"] },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/produtos", label: "Produtos", roles: ["ADMIN"] },
      { href: "/admin/categorias", label: "Categorias", roles: ["ADMIN"] },
      { href: "/admin/ocasioes", label: "Ocasiões", roles: ["ADMIN"] },
    ],
  },
  {
    label: "Cadeia produtiva",
    items: [
      { href: "/admin/unidades", label: "Unidades", roles: ["ADMIN", "PRODUCAO"] },
      { href: "/admin/ingredientes", label: "Ingredientes", roles: ["ADMIN", "PRODUCAO"] },
      { href: "/admin/receitas", label: "Receitas", roles: ["ADMIN", "PRODUCAO"] },
      { href: "/admin/fornecedores", label: "Fornecedores", roles: ["ADMIN", "PRODUCAO"] },
      { href: "/admin/embalagens", label: "Embalagens", roles: ["ADMIN", "PRODUCAO"] },
    ],
  },
  { items: [{ href: "/admin/config", label: "Configurações", roles: ["ADMIN"] }] },
];

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
      {/* Desktop/tablet — sidebar vertical fixa */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sand bg-white md:flex">
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
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive(pathname, item.href)
                      ? "bg-surface-2 font-semibold text-rose"
                      : "text-chocolate hover:bg-surface-2/60"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-sand px-5 py-4 text-xs">
          <p className="truncate font-semibold text-chocolate">
            {session?.user?.name ?? session?.user?.email ?? "…"}
          </p>
          <p className="text-muted">{role}</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="mt-2 font-semibold text-rose"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile — barra horizontal com rolagem */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-sand bg-white px-4 py-3 scrollbar-none md:hidden">
        <Link href="/admin" className="font-display shrink-0 text-base font-semibold text-chocolate">
          DM
        </Link>
        {flatItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive(pathname, item.href) ? "bg-chocolate text-white" : "bg-surface-2 text-chocolate"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}
