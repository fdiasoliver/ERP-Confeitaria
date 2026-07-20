# Doce Menina — Confeitaria App

Aplicativo responsivo para gestão de encomendas de confeitaria artesanal: vitrine de vendas, checkout, pedidos do cliente, dashboard de produção e backoffice administrativo.

## Estrutura do projeto

```
confeitaria-app/
├── prisma/schema.prisma    # Schema completo do banco (PostgreSQL)
├── docs/SCHEMA.md          # Documentação do modelo de dados
├── wireframes/             # Protótipos HTML/CSS estáticos
├── src/
│   ├── app/                # Páginas Next.js (App Router)
│   ├── components/         # UI reutilizável
│   ├── context/            # Carrinho (CartContext)
│   └── lib/                # Types, mock data, Prisma client
└── .env.example
```

## Telas implementadas (MVP demo)

| Rota | Descrição |
|------|-----------|
| `/` | Vitrine — produtos, categorias, carrinho flutuante |
| `/checkout` | Entrega, pagamento, observações por item |
| `/pedidos` | Histórico e repetir pedido |
| `/login` | Auth OTP por celular (UI) |
| `/admin` | Hub dos módulos administrativos |
| `/admin/producao` | Dashboard de produção |
| `/wireframes` | Links para protótipos HTML |

## Wireframes estáticos

Abra diretamente no navegador (sem npm):

- `wireframes/index.html` — índice de todas as telas

Ou via app: `/wireframes` após `npm run dev`

## Decisões de produto incorporadas

- **Entrega:** retirada grátis · Uber/99 (cliente paga) · grátis até 3 km
- **Pagamento:** PIX online · PIX/dinheiro/cartão na entrega
- **Prazo:** `leadTimeDays` por produto
- **Personalização:** observação por item + campo geral + upload de fotos (UI pronta)
- **WhatsApp:** schema `WhatsAppLog` + fluxo OTP na tela de login

## Setup

### 1. Instalar dependências

Recomendado executar em pasta local (evitar Google Drive durante `npm install`):

```bash
cd confeitaria-app
npm install
```

### 2. Configurar banco

```bash
cp .env.example .env
# Edite DATABASE_URL no .env

npm run db:generate
npm run db:push
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Stack

- **Next.js 16** + TypeScript + Tailwind CSS 4
- **Prisma** + PostgreSQL
- **PWA** (próxima fase)

## Próximos passos (Fase 1 continuação)

1. Conectar Prisma às APIs (produtos, pedidos, clientes)
2. Auth OTP real (WhatsApp API — Z-API / Evolution)
3. PIX integrado (Asaas, Mercado Pago)
4. Upload de fotos (Supabase Storage)
5. Google Maps Distance Matrix (raio 3 km)
6. Módulos admin: insumos, receitas, precificação
7. Notificações WhatsApp automáticas por status

## Schema

Ver documentação completa em [`docs/SCHEMA.md`](docs/SCHEMA.md) e [`prisma/schema.prisma`](prisma/schema.prisma).

## Design

Paleta **Doce Menina**: creme `#FAF7F2`, chocolate `#3D2B1F`, rosa `#E8A598`, sage `#7A9E7E`.

Fontes: Fraunces (títulos) + DM Sans (UI).
