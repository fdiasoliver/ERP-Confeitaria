// Só restringe a largura — HeaderMinimal e o conteúdo interno de cada página
// já gerenciam seu próprio padding (sticky header full-bleed + p-5 no corpo).
// min-h-screen/bg-cream ficam no shell (AdminShell), não aqui.
// max-w-7xl (era max-w-5xl até a Sprint DS.6) — 1024px centralizado deixava
// margens enormes em monitores grandes (achado do Product Owner, print real
// de /admin em ~1920px); 1280px aproveita melhor o espaço sem virar full-bleed.
export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl pb-8">{children}</div>;
}
