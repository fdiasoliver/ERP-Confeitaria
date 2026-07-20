export function LoadingState({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Carregando conteúdo">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shadow-card h-32 animate-pulse rounded-2xl bg-white" />
      ))}
    </div>
  );
}
