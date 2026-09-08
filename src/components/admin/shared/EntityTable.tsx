import { Card } from "@/components/ui/card";

export interface EntityColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  /** Classes aplicadas ao <th> e ao <td> da coluna — usar para esconder colunas
   * secundárias em telas estreitas (ex: "hidden lg:table-cell") ou alinhar. */
  className?: string;
}

/** Visão de lista (tabela) das telas de cadastro — alternativa à visão de cards
 * (EntityCard + ResponsiveGrid), escolhida pelo usuário via ViewToggle.
 * As colunas são definidas por cada página, porque cada entidade expõe campos
 * diferentes; só a estrutura da tabela é compartilhada. */
export function EntityTable<T>({ items, columns, getKey, renderActions }: {
  items: T[];
  columns: EntityColumn<T>[];
  getKey: (item: T) => string;
  renderActions: (item: T) => React.ReactNode;
}) {
  return (
    <Card className="shadow-card gap-0 overflow-hidden rounded-2xl py-0">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-sand bg-surface-2/60 text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
              <th
                scope="col"
                className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-muted"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={getKey(item)}
                className="border-b border-sand/60 transition-colors last:border-0 hover:bg-surface-2/40"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 align-middle ${col.className ?? ""}`}>
                    {col.render(item)}
                  </td>
                ))}
                <td className="px-4 py-3 align-middle">
                  <div className="flex justify-end gap-2">{renderActions(item)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
