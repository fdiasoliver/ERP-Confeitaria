"use client";

import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { ResponsiveGrid } from "@/components/admin/shared/ResponsiveGrid";
import { Card } from "@/components/ui/card";
import {
  ChefHat,
  Tags,
  PartyPopper,
  UserCog,
  Users,
  Egg,
  Factory,
  Package,
  ClipboardList,
  ShoppingBag,
  Scale,
  Palette,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

// Mesmos ícones da Sidebar (src/components/admin/shared/Sidebar.tsx, DS.6) —
// consistência visual entre o hub e o menu lateral para o mesmo módulo.
const MODULES: { href: string; title: string; desc: string; icon: LucideIcon; ready?: boolean }[] = [
  { href: "/admin/producao", title: "Produção", desc: "Dashboard do dia e semana", icon: ChefHat, ready: true },
  { href: "/admin/categorias", title: "Categorias", desc: "Organização do catálogo de produtos", icon: Tags, ready: true },
  { href: "/admin/ocasioes", title: "Ocasiões", desc: "Tags de campanha para a vitrine", icon: PartyPopper, ready: true },
  { href: "/admin/em-construcao?modulo=Usuários", title: "Usuários", desc: "Equipe e permissões", icon: UserCog },
  { href: "/admin/clientes", title: "Clientes", desc: "Histórico, LTV e notas internas", icon: Users, ready: true },
  { href: "/admin/ingredientes", title: "Ingredientes", desc: "Estoque e histórico de preços", icon: Egg, ready: true },
  { href: "/admin/fornecedores", title: "Fornecedores", desc: "Cadastro de fornecedores de insumos", icon: Factory, ready: true },
  { href: "/admin/embalagens", title: "Embalagens", desc: "Caixas, saquinhos e custos de embalagem", icon: Package, ready: true },
  { href: "/admin/receitas", title: "Receitas", desc: "Composição e custo", icon: ClipboardList, ready: true },
  { href: "/admin/produtos", title: "Produtos", desc: "Catálogo e precificação", icon: ShoppingBag, ready: true },
  { href: "/admin/unidades", title: "Unidades", desc: "Medidas usadas em ingredientes e receitas", icon: Scale, ready: true },
  { href: "/admin/em-construcao?modulo=Tema", title: "Tema", desc: "Cores e identidade visual", icon: Palette },
  { href: "/admin/relatorios", title: "Relatórios", desc: "Faturamento, margem e métodos de pagamento", icon: BarChart3, ready: true },
  { href: "/admin/config", title: "Configurações", desc: "Dados da empresa, endereço, PIX e precificação", icon: Settings, ready: true },
];

export default function AdminPage() {
  return (
    <PageContainer>
      <HeaderMinimal title="Administração" />

      <div className="p-5">
        <ResponsiveGrid cols={3}>
          {MODULES.map((mod) => (
            <Link key={mod.title} href={mod.href} className="block">
              <Card className="shadow-card flex-row items-center gap-4 p-4 transition hover:-translate-y-0.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-chocolate">
                  <mod.icon size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{mod.title}</p>
                  <p className="text-muted text-sm">{mod.desc}</p>
                </div>
                {!mod.ready && (
                  <span className="shrink-0 rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold text-muted uppercase tracking-wide">
                    em breve
                  </span>
                )}
              </Card>
            </Link>
          ))}
        </ResponsiveGrid>
      </div>
    </PageContainer>
  );
}
