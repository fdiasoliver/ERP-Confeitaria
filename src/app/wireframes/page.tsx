import Link from "next/link";

const WIREFRAMES = [
  { href: "/wireframes/vitrine.html", file: "wireframes/vitrine.html", title: "Vitrine (Vendas)" },
  { href: "/wireframes/carrinho.html", file: "wireframes/carrinho.html", title: "Carrinho" },
  { href: "/wireframes/checkout.html", file: "wireframes/checkout.html", title: "Checkout" },
  { href: "/wireframes/pedidos.html", file: "wireframes/pedidos.html", title: "Meus Pedidos" },
  { href: "/wireframes/producao.html", file: "wireframes/producao.html", title: "Dashboard Produção" },
];

export default function WireframesPage() {
  return (
    <div className="mx-auto min-h-screen max-w-app bg-cream p-8">
      <Link href="/" className="text-muted text-sm">
        ← App
      </Link>
      <h1 className="font-display mt-4 text-2xl font-semibold">Wireframes</h1>
      <p className="text-muted mt-2 mb-2 text-sm">
        Protótipos estáticos HTML/CSS em <code className="text-chocolate">wireframes/</code>.
        O app Next.js implementa a vitrine interativa em <Link href="/" className="text-rose">/</Link>.
      </p>
      <p className="text-muted mb-6 text-xs">
        Também abra <strong>wireframes/index.html</strong> diretamente no navegador (duplo clique).
      </p>
      <nav className="flex flex-col gap-3">
        {WIREFRAMES.map((w) => (
          <div
            key={w.title}
            className="shadow-card flex items-center justify-between rounded-2xl bg-white p-4"
          >
            <span className="font-semibold">{w.title}</span>
            <span className="text-muted text-xs">{w.file}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
