import type { Metadata } from "next";

// Tela paralela de PRÉ-VISUALIZAÇÃO da Vitrine mobile (24/09/2026) — não
// substitui nem altera a Vitrine real (`src/app/(client)/page.tsx`). Fora do
// route group `(client)` de propósito: não herda o ClientShell (CartFab
// global), que se sobreporia à barra inferior desta tela. Não indexável.
export const metadata: Metadata = {
  title: "Pré-visualização da Vitrine",
  robots: { index: false, follow: false },
};

export default function VitrinePreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
