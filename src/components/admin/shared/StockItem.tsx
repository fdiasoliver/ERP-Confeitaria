type StockItemStatus = "low" | "mid" | "ok";

interface StockItemProps {
  icon: string;
  name: string;
  sub: string;
  qty: string;
  status: StockItemStatus;
}

const STATUS_LABEL: Record<StockItemStatus, string> = {
  low: "Repor",
  mid: "Atenção",
  ok: "Ok",
};

const STATUS_CLASS: Record<StockItemStatus, string> = {
  low: "bg-rose/10 text-rose",
  mid: "bg-caramel/10 text-caramel",
  ok: "bg-sage/10 text-sage",
};

// Padrão "stock-item" do modelo de referência (Sprint DS.3) — item de estoque
// crítico com tag de status. Sem tela consumidora real ainda (não existe
// módulo de Insumos/Estoque implementado); pronto para quando existir.
export function StockItem({ icon, name, sub, qty, status }: StockItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-sand bg-white px-3.5 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-2 text-base">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold text-chocolate">{name}</p>
        <p className="text-[11.5px] text-muted">{sub}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[13.5px] font-extrabold text-chocolate">{qty}</p>
        <span
          className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_CLASS[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>
    </div>
  );
}
