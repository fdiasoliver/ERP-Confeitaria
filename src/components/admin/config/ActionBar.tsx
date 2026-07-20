"use client";

import Link from "next/link";

interface ActionBarProps {
  submitting: boolean;
}

export function ActionBar({ submitting }: ActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-sand bg-white/90 px-5 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link
          href="/admin"
          className="rounded-xl border border-sand px-5 py-2.5 text-sm font-medium text-muted transition hover:border-chocolate hover:text-chocolate"
        >
          ← Voltar
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-chocolate px-8 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Salvando…" : "Salvar configurações"}
        </button>
      </div>
    </div>
  );
}
