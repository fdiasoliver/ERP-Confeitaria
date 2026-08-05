"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { HeaderMinimal } from "@/components/layout/Header";
import { PageContainer } from "@/components/admin/shared/PageContainer";

function EmConstrucaoContent() {
  const searchParams = useSearchParams();
  const modulo = searchParams.get("modulo") ?? "Módulo";

  return (
    <PageContainer>
      <HeaderMinimal title={modulo} />
      <div className="flex flex-col items-center justify-center px-5 py-24 text-center">
        <span className="mb-4 text-5xl">🔧</span>
        <h2 className="font-display mb-2 text-xl font-semibold">Em construção</h2>
        <p className="text-muted text-sm">
          Este módulo será implementado em uma próxima Sprint.
        </p>
      </div>
    </PageContainer>
  );
}

export default function EmConstrucaoPage() {
  return (
    <Suspense>
      <EmConstrucaoContent />
    </Suspense>
  );
}
