export function EmptyState({ title, description, actionLabel, onAction }: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="shadow-card rounded-2xl bg-white p-8 text-center">
      <p className="font-display mb-1 text-lg font-semibold text-chocolate">{title}</p>
      <p className="mb-4 text-sm text-muted">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-xl bg-chocolate px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
