// Só restringe a largura — HeaderMinimal e o conteúdo interno de cada página
// já gerenciam seu próprio padding (sticky header full-bleed + p-5 no corpo).
// min-h-screen/bg-cream ficam no shell (AdminShell), não aqui.
export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl pb-8">{children}</div>;
}
