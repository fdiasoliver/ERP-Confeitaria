export function StatusBadge({ isActive, activeLabel = "Ativo", inactiveLabel = "Inativo" }: {
  isActive: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
      isActive ? "bg-sage/10 text-sage" : "bg-sand text-muted"
    }`}>
      {isActive ? activeLabel : inactiveLabel}
    </span>
  );
}
