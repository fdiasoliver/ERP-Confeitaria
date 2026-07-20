"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { HeaderMinimal } from "@/components/layout/Header";

function EmConstrucaoContent() {
  const searchParams = useSearchParams();
  const modulo = searchParams.get("modulo") ?? "Módulo";

  return (
    <div className="mx-auto min-h-screen max-w-app bg-cream">
      <HeaderMinimal title={modulo} />
      <div className="flex flex-col items-center justify-center px-5 py-24 text-center">
        <span className="mb-4 text-5xl">🔧</span>
        <h2 className="font-display mb-2 text-xl font-semibold">Em construção</h2>
        <p className="text-muted text-sm">
          Este módulo será implementado em uma próxima Sprint.
        </p>
      </div>
    </div>
  );
}

export default function EmConstrucaoPage() {
  return (
    <Suspense>
      <EmConstrucaoContent />
    </Suspense>
  );
}
