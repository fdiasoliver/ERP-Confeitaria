import { Fraunces } from "next/font/google";
import { ClientShell } from "@/components/layout/ClientShell";

// Fonte de destaque só da Vitrine (redesign do Módulo Vitrine, 20/09/2026) —
// escopada à área cliente via variável CSS neste layout, para não carregar
// peso extra de fonte no admin. Manrope continua a fonte única de corpo/UI
// (Sprint DS.3) em toda a área cliente, incluindo aqui — Fraunces é usada só
// nos títulos/eyebrows da Vitrine (utilitário Tailwind `font-serif`).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["500", "600"],
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={fraunces.variable}>
      <ClientShell>{children}</ClientShell>
    </div>
  );
}
