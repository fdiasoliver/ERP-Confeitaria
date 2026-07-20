"use client";

import { HeaderMinimal } from "@/components/layout/Header";

function FieldSkeleton() {
  return <div className="h-12 w-full animate-pulse rounded-[10px] bg-sand" />;
}

function SectionSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div className="shadow-card rounded-2xl bg-white p-5">
      <div className="mb-4 h-5 w-32 animate-pulse rounded bg-sand" />
      <div className="space-y-3">
        {Array.from({ length: fields }).map((_, i) => (
          <FieldSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-cream pb-24">
      <HeaderMinimal title="Configurações" />
      <div className="space-y-4 p-5">
        <SectionSkeleton fields={2} />
        <SectionSkeleton fields={4} />
        <SectionSkeleton fields={2} />
        <SectionSkeleton fields={8} />
        <SectionSkeleton fields={3} />
        <SectionSkeleton fields={4} />
      </div>
    </div>
  );
}
