"use client";

import Link from "next/link";
import { useState } from "react";

const TABS = ["Hoje", "Amanhã", "Semana", "Calendário"] as const;

const KANBAN = {
  Confirmado: ["#1845 · Doces casamento", "#1846 · Coffee break", "#1847 · Mesversário"],
  "Em prod.": ["#1842 · Bolo Red", "#1840 · 150 brigadeiros", "#1839 · Bolo corporativo"],
  Pronto: ["#1835 · Mini cakes", "#1836 · Kit festa"],
  Entregue: ["#1830 · Retirada", "#1831 · Uber 99"],
};

export default function ProducaoPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Hoje");

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-cream pb-8">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-sand bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted text-sm">
            ←
          </Link>
          <h1 className="font-display text-lg font-semibold">Produção</h1>
        </div>
        <span className="text-muted text-sm">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </span>
      </header>

      <div className="flex gap-1 px-5 py-4">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold ${
              tab === t ? "bg-chocolate text-white" : "bg-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 px-5 pb-4">
        {[
          { value: "12", label: "Pedidos" },
          { value: "28", label: "Itens" },
          { value: "3", label: "Urgentes" },
        ].map((s) => (
          <div
            key={s.label}
            className="shadow-card rounded-xl bg-white p-3 text-center"
          >
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="text-muted text-[10px] uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="px-5 pb-6">
        <h2 className="font-display mb-3 font-semibold">Urgente — entrega hoje</h2>
        <div className="shadow-card rounded-2xl border-l-4 border-red-500 bg-white p-4">
          <p className="text-muted text-xs">#1842 · Maria · 14h · Entrega gratuita</p>
          <p className="mt-1 font-semibold">Bolo Red Velvet 2kg + 24 brigadeiros</p>
          <p className="text-muted mt-1 text-sm">
            &quot;Topper unicórnio&quot; · 📷 2 fotos ref.
          </p>
          <span className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-800">
            Em produção
          </span>
        </div>
      </section>

      <section className="px-5 pb-6">
        <h2 className="font-display mb-3 font-semibold">Kanban</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Object.entries(KANBAN).map(([col, cards]) => (
            <div key={col}>
              <h4 className="text-muted mb-2 text-center text-[10px] font-bold uppercase">
                {col} ({cards.length})
              </h4>
              {cards.map((card) => (
                <div
                  key={card}
                  className="shadow-card mb-2 rounded-lg bg-white p-2.5 text-xs"
                >
                  {card}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5">
        <h2 className="font-display mb-3 font-semibold">Consolidação (batch)</h2>
        <div className="shadow-card rounded-2xl border-l-4 border-sage bg-white p-4 text-sm leading-relaxed">
          🥣 Massa baunilha: <strong>4 bolos</strong>
          <br />
          🍫 Brigadeiro: <strong>150 un</strong> (3 pedidos)
          <br />
          🧈 Buttercream: <strong>2,5 kg</strong> total
        </div>
      </section>

      <nav className="mt-8 flex justify-center gap-4 text-sm">
        <Link href="/admin" className="text-muted hover:text-chocolate">
          Admin
        </Link>
        <Link href="/wireframes" className="text-muted hover:text-chocolate">
          Wireframes
        </Link>
      </nav>
    </div>
  );
}
