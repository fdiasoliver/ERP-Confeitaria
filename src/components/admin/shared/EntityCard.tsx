import Link from "next/link";
import { Card } from "@/components/ui/card";

export function EntityCard({ title, href, badges, children, actions }: {
  title: string;
  /** Quando informado, título + conteúdo ficam dentro de um <Link> (card clicável navega
   * para o detalhe) — caso de uso real: Receitas (`/admin/receitas/[id]`). As ações do
   * rodapé nunca ficam dentro do link, para não conflitar com os próprios botões. */
  href?: string;
  badges?: React.ReactNode;
  children?: React.ReactNode;
  actions: React.ReactNode;
}) {
  const body = (
    <>
      <div className="mb-3 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-chocolate">{title}</p>
            {badges}
          </div>
        </div>
      </div>
      {children && <div className="mb-3 space-y-1">{children}</div>}
    </>
  );

  return (
    <Card className="shadow-card gap-0 rounded-2xl p-4">
      {href ? <Link href={href} className="block">{body}</Link> : body}
      <div className="flex gap-2">{actions}</div>
    </Card>
  );
}
