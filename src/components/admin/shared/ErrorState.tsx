export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="shadow-card rounded-2xl bg-white p-6 text-center">
      <p className="mb-1 text-sm font-semibold text-rose">Erro ao carregar</p>
      <p className="mb-4 text-sm text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl border border-sand px-4 py-2 text-sm font-semibold text-chocolate transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"
      >
        Tentar novamente
      </button>
    </div>
  );
}
