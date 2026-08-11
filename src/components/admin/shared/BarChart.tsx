interface BarChartDatum {
  label: string;
  value: number;
  highlight?: boolean;
}

interface BarChartProps {
  data: BarChartDatum[];
}

// Gráfico de barras simples, CSS puro (sem lib) — padrão do modelo de
// referência (Sprint DS.3). Sem tela consumidora real ainda; pronto para
// quando um módulo com série temporal (ex.: faturamento diário) existir.
export function BarChart({ data }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex h-[150px] items-end gap-3 px-1">
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <div
            className={`w-full rounded-t-lg rounded-b-sm ${d.highlight ? "bg-sage" : "bg-sage/20"}`}
            style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
          />
          <span className="text-[10.5px] font-semibold text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
