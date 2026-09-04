import { Badge } from "@/components/ui/badge";

export function StatusBadge({
  isActive,
  activeLabel = "Ativo",
  inactiveLabel = "Inativo",
}: {
  isActive: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={isActive ? "border-transparent bg-sage/10 text-sage" : "border-transparent bg-sand text-muted"}
    >
      {isActive ? activeLabel : inactiveLabel}
    </Badge>
  );
}
