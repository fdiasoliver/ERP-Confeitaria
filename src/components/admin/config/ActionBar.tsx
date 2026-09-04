"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
  submitting: boolean;
}

export function ActionBar({ submitting }: ActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-sand bg-card/90 px-5 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin">← Voltar</Link>
        </Button>
        <Button type="submit" disabled={submitting} className="px-8">
          {submitting ? "Salvando…" : "Salvar configurações"}
        </Button>
      </div>
    </div>
  );
}
