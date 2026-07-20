export function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="shadow-card rounded-2xl bg-white px-4 py-3 text-center">
      <p className="font-display text-2xl font-semibold text-chocolate">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
