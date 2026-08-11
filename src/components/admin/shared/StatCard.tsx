interface StatCardTrend {
  direction: "up" | "down";
  text: string;
}

interface StatCardProps {
  value: string | number;
  label: string;
  trend?: StatCardTrend;
  note?: string;
}

// Estilo "kpi" do modelo de referência (Sprint DS.3) — label+badge de variação
// no topo, valor grande, nota pequena embaixo. `trend`/`note` são opcionais e
// hoje não têm fonte de dado real em nenhuma tela (nenhuma API calcula "vs.
// período anterior") — ficam prontos visualmente para quando existir.
export function StatCard({ value, label, trend, note }: StatCardProps) {
  return (
    <div className="shadow-card rounded-2xl border border-sand bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-muted">{label}</p>
        {trend && (
          <span
            className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
              trend.direction === "up" ? "bg-sage/10 text-sage" : "bg-rose/10 text-rose"
            }`}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.text}
          </span>
        )}
      </div>
      <p className="font-display mt-2 text-2xl font-semibold text-chocolate">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}
