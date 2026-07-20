"use client";

import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";

const MODULES = [
  { href: "/admin/producao", title: "Produção", desc: "Dashboard do dia e semana", icon: "👩‍🍳", ready: true },
  { href: "/admin/categorias", title: "Categorias", desc: "Organização do catálogo de produtos", icon: "🏷️", ready: true },
  { href: "/admin/ocasioes", title: "Ocasiões", desc: "Tags de campanha para a vitrine", icon: "🎉", ready: true },
  { href: "/admin/em-construcao?modulo=Usuários", title: "Usuários", desc: "Equipe e permissões", icon: "👥" },
  { href: "/admin/em-construcao?modulo=Clientes", title: "Clientes", desc: "Cadastro por celular", icon: "📱" },
  { href: "/admin/ingredientes", title: "Ingredientes", desc: "Estoque e histórico de preços", icon: "🥚", ready: true },
  { href: "/admin/fornecedores", title: "Fornecedores", desc: "Cadastro de fornecedores de insumos", icon: "🏭", ready: true },
  { href: "/admin/receitas", title: "Receitas", desc: "Composição e custo", icon: "📋", ready: true },
  { href: "/admin/produtos", title: "Produtos", desc: "Catálogo e precificação", icon: "🎂", ready: true },
  { href: "/admin/unidades", title: "Unidades", desc: "Medidas usadas em ingredientes e receitas", icon: "⚖️", ready: true },
  { href: "/admin/em-construcao?modulo=Tema", title: "Tema", desc: "Cores e identidade visual", icon: "🎨" },
  { href: "/admin/config", title: "Configurações", desc: "Dados da empresa, endereço, PIX e precificação", icon: "⚙️", ready: true },
];

export default function AdminPage() {
  return (
    <div className="mx-auto min-h-screen max-w-app bg-cream pb-8">
      <HeaderMinimal title="Administração" />

      <div className="grid gap-3 p-5">
        {MODULES.map((mod) => (
          <Link
            key={mod.title}
            href={mod.href}
            className="shadow-card flex items-center gap-4 rounded-2xl bg-white p-4 transition hover:-translate-y-0.5"
          >
            <span className="text-2xl">{mod.icon}</span>
            <div className="flex-1">
              <p className="font-semibold">{mod.title}</p>
              <p className="text-muted text-sm">{mod.desc}</p>
            </div>
            {!mod.ready && (
              <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold text-muted uppercase tracking-wide">
                em breve
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
