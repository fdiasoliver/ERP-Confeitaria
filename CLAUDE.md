
# CLAUDE.md — Doce Menina: Confeitaria App

Documentação permanente para sessões Claude Code.
Leia este arquivo antes de qualquer implementação.

---

## Objetivo do sistema

Sistema de gestão de encomendas para confeitaria artesanal **Doce Menina**.

Abrange dois domínios:
- **Cliente final:** vitrine de produtos, carrinho, checkout, histórico de pedidos
- **Equipe interna:** dashboard de produção (Kanban), backoffice administrativo

---

## Stack utilizada

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.2.9 |
| UI | React | 19.2.4 |
| Linguagem | TypeScript | ^5 |
| Estilização | Tailwind CSS | ^4 |
| ORM | Prisma | ^6.9.0 |
| Banco de dados | PostgreSQL | — |
| Fonte display | Fraunces (Google Fonts) | — |
| Fonte UI | DM Sans (Google Fonts) | — |

**Status atual:** Sprint 1.1 + 1.2 + 1.3 concluídas (30/06/2026). Módulo Configuração da Empresa (`/admin/config`) 100% implementado e refatorado: schema, tipos, validator, repositories, service, API (GET+PATCH), upload de imagens, página com 6 seções (171 linhas). Próximo: Dashboard de produção real (KI-04) ou outro módulo. Ver [KNOWN_ISSUES.md](KNOWN_ISSUES.md) e os documentos P1 abaixo. **Nota:** esta linha está desatualizada frente ao `CHANGELOG.md` (que já registra os Épicos 2/G/T) — não reescrita nesta sprint por estar fora do escopo da Sprint T.3 (Demo Environment); a Plataforma de Demonstração formalizada nesta sprint (16/07/2026, ver "Decisões arquiteturais tomadas", ADR-008) é infraestrutura de produto, não um novo módulo funcional.

---

## Estrutura das pastas

```
confeitaria-app/
├── ARCHITECTURE.md            # Arquitetura técnica: camadas, decisões, riscos, convenções
├── DOMAIN_MODEL.md            # Modelo de domínio: 26+ entidades, relacionamentos, fluxos
├── MODULES.md                 # Evolução de módulos por fase (Fase 1–10) + dívida técnica
├── CHANGELOG.md               # Histórico de sprints
├── KNOWN_ISSUES.md            # 16 problemas conhecidos (KI-01 a KI-16) com prioridade
├── PLAN.md                    # Plano de evolução e roadmap
├── REVIEW.md                  # Auditoria técnica e revisão de código
├── VISION.md                  # Visão estratégica do produto
├── REGRAS_NEGOCIO.md          # Regras de negócio e invariantes do domínio
├── DEMO_ENVIRONMENT.md        # Arquitetura da Plataforma de Demonstração (Sprint T.3)
├── DEMO_DATASET.md            # Conteúdo oficial do ambiente de demonstração (Sprint T.3)
├── DEMO_GUIDE.md              # Guia de uso do ambiente de demonstração (Sprint T.3)
├── prisma/
│   └── schema.prisma          # Esquema completo PostgreSQL (20+ modelos)
├── docs/
│   └── SCHEMA.md              # Documentação do modelo de dados
├── wireframes/                # Protótipos HTML/CSS estáticos (sem npm)
│   ├── index.html
│   ├── vitrine.html
│   ├── carrinho.html
│   ├── checkout.html
│   ├── pedidos.html
│   ├── producao.html
│   └── styles/wireframe.css
├── src/
│   ├── app/                   # Páginas — Next.js App Router
│   │   ├── layout.tsx         # Root layout: CartProvider + fontes
│   │   ├── globals.css        # Tokens de design + utilitários Tailwind
│   │   ├── page.tsx           # Vitrine (home)
│   │   ├── checkout/page.tsx  # Fluxo de checkout
│   │   ├── pedidos/page.tsx   # Histórico de pedidos
│   │   ├── login/page.tsx     # Auth OTP (UI sem backend)
│   │   ├── admin/page.tsx     # Hub administrativo
│   │   ├── admin/login/page.tsx     # Login da equipe interna (NextAuth)
│   │   ├── admin/producao/page.tsx  # Dashboard de produção
│   │   ├── admin/em-construcao/page.tsx  # Placeholder para módulos não implementados
│   │   ├── api/auth/[...nextauth]/route.ts  # NextAuth handler (admin + customer providers)
│   │   ├── api/config/route.ts     # GET /api/config (StoreConfig)
│   │   ├── api/occasions/route.ts  # GET /api/occasions (OccasionTag)
│   │   ├── api/products/route.ts   # GET /api/products
│   │   ├── api/orders/route.ts     # GET + POST /api/orders
│   │   ├── api/orders/[id]/status/route.ts  # PATCH /api/orders/[id]/status
│   │   └── wireframes/page.tsx     # Links para wireframes HTML
│   ├── components/
│   │   ├── Providers.tsx      # SessionProvider + CartProvider (client wrapper para layout.tsx)
│   │   ├── layout/
│   │   │   ├── Header.tsx     # Header sticky + CartButton + HeaderMinimal
│   │   │   └── CartDrawer.tsx # CartDrawer + CartFab + Toast
│   │   └── vitrine/
│   │       └── ProductCard.tsx  # ProductCard + CategoryChips
│   ├── context/
│   │   └── CartContext.tsx    # Estado global do carrinho (CartProvider + useCart)
│   ├── hooks/
│   │   ├── useCurrentUser.ts  # Retorna Customer da sessão NextAuth (null se não autenticado ou se admin)
│   │   └── useUserOrders.ts   # Retorna Order[] com loading/error/refetch; aceita phone: string | null
│   ├── services/
│   │   ├── orderService.ts    # createOrder, getOrdersByPhone, updateOrderStatus
│   │   └── productService.ts  # getProducts
│   └── lib/
│       ├── types.ts           # Interfaces TypeScript e enums (fonte da verdade)
│       ├── mock-data.ts       # Dados de demonstração (substituir progressivamente)
│       ├── utils.ts           # formatCurrency, formatDate, getMinDeliveryDate
│       ├── env.ts             # Validação de variáveis de ambiente no startup
│       └── prisma.ts          # Singleton do Prisma Client
│   └── proxy.ts               # Proteção de rotas /admin/* (Next.js 16 convention)
├── prisma/
│   ├── schema.prisma          # Esquema completo PostgreSQL (20+ modelos)
│   ├── seed.ts                # Seed: produtos, categorias, admin, StoreConfig
│   └── demo-seeds/
│       └── README.md          # Arquitetura da pasta de seed de demonstração (Sprint T.3 — sem dado real ainda)
├── .env.example               # Variáveis de ambiente necessárias
├── package.json
└── tsconfig.json
```

---

## Documentação de arquitetura e produto

### Arquitetura (Sprint A1)

| Documento | Descrição | Quando ler |
|-----------|-----------|-----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Camadas, decisões técnicas, riscos, convenções obrigatórias, 8 perguntas do arquiteto | Antes de mudanças estruturais |
| [DOMAIN_MODEL.md](DOMAIN_MODEL.md) | 26+ entidades com status (Schema/API/UI), regras e diagrama de relacionamentos | Antes de adicionar entidades ou rotas |
| [MODULES.md](MODULES.md) | Mapa de todos os módulos por fase (Fase 1–10) e inventário de dívida técnica (TD-01 a TD-15) | Antes de planejar uma sprint |
| [KNOWN_ISSUES.md](KNOWN_ISSUES.md) | 16 problemas conhecidos com prioridade, arquivo afetado e resolução recomendada | Antes de implementar qualquer feature |
| [CHANGELOG.md](CHANGELOG.md) | Histórico cronológico de sprints e decisões arquiteturais | Para contexto histórico |

### Planejamento funcional (Sprint P1)

| Documento | Descrição | Quando ler |
|-----------|-----------|-----------|
| [MENU_STRUCTURE.md](MENU_STRUCTURE.md) | Menu lateral completo: rotas, roles, fases, mapa ROLE_REQUIRED para proxy.ts | Antes de criar qualquer rota admin |
| [SCREENS.md](SCREENS.md) | 33 telas: Objetivo, Campos, Filtros, Ações, Permissões, Integrações, Dependências, Status | Antes de implementar qualquer tela |
| [USER_FLOW.md](USER_FLOW.md) | Fluxos de usuário por módulo: navegação, condicionais, transições, APIs chamadas | Antes de implementar qualquer fluxo |
| [USER_JOURNEY.md](USER_JOURNEY.md) | Jornadas por persona (Ana/Carla/Marina/Paulo): narrativa + fluxo textual | Para validar decisões de produto |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | 20 componentes de UI: Botões, Inputs, Cards, Modais, Toasts, Tabelas, Gráficos e mais | Antes de implementar qualquer tela ou componente |
| [UX_GUIDELINES.md](UX_GUIDELINES.md) | Diretrizes de UX: princípios, formulários, erros, validações, navegação, mobile, desktop, dark/light mode | Antes de tomar qualquer decisão de interface |

---

## Padrões arquiteturais encontrados

### 1. Next.js App Router com componentes client-side
Toda interatividade usa `"use client"` no topo do arquivo. Componentes de servidor são apenas `layout.tsx` e `src/lib/prisma.ts`.

### 2. Context API para estado global
O carrinho é gerenciado exclusivamente via `CartContext` (`src/context/CartContext.tsx`). Nenhuma biblioteca de gerenciamento de estado externo (Redux, Zustand) é usada.

### 3. Memoização explícita no Context
`useMemo` para `itemCount` e `subtotal`; `useCallback` para todas as funções mutadoras do carrinho, para evitar re-renders desnecessários.

### 4. Componentes exportados múltiplos por arquivo
Um arquivo pode exportar vários componentes relacionados:
- `CartDrawer.tsx` exporta: `CartDrawer`, `CartFab`, `Toast`
- `Header.tsx` exporta: `Header`, `HeaderMinimal`
- `ProductCard.tsx` exporta: `ProductCard`, `CategoryChips`

### 5. Helper components locais (sem extração)
Componentes auxiliares como `Field` e `Row` em `checkout/page.tsx` são declarados no mesmo arquivo onde são usados, sem extração para arquivos separados.

### 6. Tipos centralizados em `src/lib/types.ts`
Todos os enums e interfaces são definidos em `types.ts` e importados pelo resto da aplicação. O Prisma Schema usa os mesmos nomes de enum (`OrderStatus`, `DeliveryType`, `PaymentMethod`, etc.), mantendo coerência entre o front-end e o banco.

### 7. Label dictionaries junto aos tipos
`DELIVERY_LABELS`, `PAYMENT_LABELS` e `STATUS_LABELS` são `const` exportados de `types.ts`, co-localizados com os tipos que descrevem.

### 8. Mock data como fonte de dados temporária
`src/lib/mock-data.ts` substitui chamadas de API. Quando a API for implementada, cada importação de `MOCK_*` e `PRODUCTS` será substituída por fetch/Prisma.

### 9. Prisma com singleton global
`src/lib/prisma.ts` usa o padrão de singleton com `global` para evitar múltiplas instâncias em dev com hot reload.

### 10. Design mobile-first com `max-w-app`
Todas as páginas clientes usam `mx-auto max-w-app` (480px). O dashboard de produção usa `max-w-5xl` por ser orientado a desktop.

---

## Convenções de nomenclatura

### Arquivos e pastas
- Páginas: `src/app/<rota>/page.tsx` (kebab-case para rotas)
- Componentes: `PascalCase.tsx` dentro de `src/components/<domínio>/`
- Contextos: `NomeContext.tsx` dentro de `src/context/`
- Utilitários: `kebab-case.ts` dentro de `src/lib/`

### TypeScript
- Interfaces: `PascalCase` (ex: `CartItem`, `Product`, `Address`)
- Enums como union types: `SCREAMING_SNAKE_CASE` como valor (ex: `"EM_PRODUCAO"`, `"PIX_ONLINE"`)
- Label dictionaries: `SCREAMING_SNAKE_CASE` (ex: `STATUS_LABELS`, `PAYMENT_LABELS`)
- Constantes de dados: `SCREAMING_SNAKE_CASE` (ex: `PRODUCTS`, `MOCK_CUSTOMER`, `OCCASIONS`)
- Funções utilitárias: `camelCase` (ex: `formatCurrency`, `getMaxLeadTimeDays`)
- Props de componente: interface local `NomeComponenteProps`

### CSS / Tailwind
- Classes utilitárias customizadas em `globals.css`: kebab-case (`.max-w-app`, `.shadow-card`, `.input-field`, `.option-card`, `.scrollbar-none`)
- Cores do design system: variáveis CSS (`--cream`, `--chocolate`, `--rose`, `--sage`, `--sand`, `--muted`) expostas como classes Tailwind via `@theme inline`

---

## Fluxo da aplicação

### Fluxo do cliente

```
/ (Vitrine)
  → Filtro por ocasião (CategoryChips)
  → Produto adicionado ao carrinho (CartContext.addItem)
  → CartFab aparece com total
  → CartDrawer abre (bottom sheet)
  → "Finalizar pedido" → /checkout

/checkout
  → Seleciona data de entrega (respeita leadTimeDays máximo dos itens)
  → Seleciona tipo de entrega (RETIRADA | ENTREGA_GRATIS | ENTREGA_APP)
  → Preenche endereço e dados do destinatário (se entrega)
  → Adiciona observações por item e gerais
  → Seleciona método de pagamento
  → "Confirmar pedido" → tela de confirmação + clearCart()
  → Link para /pedidos

/pedidos
  → Lista MOCK_ORDERS com status
  → "Pedir novamente" → loadFromOrder() → /
  → "Pedir e personalizar" → loadFromOrder() → /checkout
```

### Fluxo interno (equipe)

```
/login → /admin → /admin/producao
  → Aba Hoje/Amanhã/Semana/Calendário
  → Seção Urgente (border vermelho)
  → Kanban: Confirmado → Em prod. → Pronto → Entregue
  → Consolidação batch (ingredientes agregados)
```

---

## Dependências importantes

### Produção (`dependencies`)
| Pacote | Uso |
|--------|-----|
| `next` 16.2.9 | Framework principal, App Router, SSR/SSG |
| `react` 19.2.4 | UI e hooks |
| `react-dom` 19.2.4 | Renderização DOM |
| `@prisma/client` ^6.9.0 | ORM para PostgreSQL |

### Desenvolvimento (`devDependencies`)
| Pacote | Uso |
|--------|-----|
| `prisma` ^6.9.0 | CLI do Prisma (`db:push`, `generate`, `studio`) |
| `typescript` ^5 | Tipagem estática |
| `tailwindcss` ^4 | Framework CSS utility-first |
| `@tailwindcss/postcss` ^4 | Plugin PostCSS para Tailwind 4 |
| `eslint` ^9 | Linting |
| `eslint-config-next` | Regras Next.js para ESLint |

### Variáveis de ambiente (`.env`)
```env
DATABASE_URL              # PostgreSQL — obrigatório para rodar com banco real
NEXTAUTH_SECRET           # Segredo de sessão
NEXTAUTH_URL              # URL da aplicação (http://localhost:3000 em dev)
WHATSAPP_API_URL          # Z-API ou Evolution API
WHATSAPP_API_TOKEN        # Token de autenticação WhatsApp
WHATSAPP_INSTANCE_ID      # ID da instância do bot
PIX_PROVIDER              # "asaas", "mercadopago", etc.
PIX_API_KEY               # Chave da API do provedor PIX
PIX_WEBHOOK_SECRET        # Segredo para verificar webhooks de pagamento
GOOGLE_MAPS_API_KEY       # Distance Matrix API (raio de 3 km)
STORAGE_BUCKET_URL        # Supabase Storage ou S3 para fotos de referência
```

---

## Como executar o projeto

> **Atenção:** O projeto está em um Google Drive. Execute `npm install` em uma pasta local para evitar erros de sistema de arquivos.

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco de dados
```bash
cp .env.example .env
# Editar DATABASE_URL no .env

npm run db:generate   # Gera o Prisma Client
npm run db:push       # Sincroniza o schema com o banco PostgreSQL
```

### 3. Iniciar em desenvolvimento
```bash
npm run dev
# Acesse http://localhost:3000
```

### 4. Outros comandos
```bash
npm run build         # Build de produção
npm run start         # Servidor de produção
npm run lint          # Verificação ESLint
npm run db:studio     # Interface gráfica do banco (Prisma Studio)
```

### 5. Wireframes estáticos
Abrir `wireframes/index.html` diretamente no navegador (sem npm) ou acessar `/wireframes` com o app rodando.

---

## Como criar novas funcionalidades

### Nova página
1. Criar `src/app/<rota>/page.tsx`
2. Adicionar `"use client"` se houver interatividade
3. Usar `mx-auto min-h-screen max-w-app bg-cream` como wrapper raiz
4. Usar `<Header />` ou `<HeaderMinimal title="Título" />` no topo

### Novo componente reutilizável
1. Criar em `src/components/<domínio>/NomeComponente.tsx`
2. Adicionar `"use client"` se usar hooks
3. Definir interface `NomeComponenteProps` localmente
4. Exportar com `export function NomeComponente()`

### Novo tipo ou interface
1. Adicionar em `src/lib/types.ts`
2. Se for um enum como union type, adicionar o label dictionary correspondente no mesmo arquivo

### Nova rota de API (quando implementar backend)
1. Criar `src/app/api/<recurso>/route.ts`
2. Usar o singleton `prisma` importado de `@/lib/prisma`
3. Substituir os imports de `MOCK_*` em `mock-data.ts` pelos fetches correspondentes

### Novo modelo no banco de dados
1. Adicionar ao `prisma/schema.prisma`
2. Executar `npm run db:push` para sincronizar
3. Executar `npm run db:generate` para regenerar o cliente

---

## Fluxo obrigatório para implementação de Sprints

Todo trabalho de implementação segue exatamente este processo — sem exceção.

### Etapa 1 — Planejamento (antes de alterar qualquer arquivo)

- Ler toda a documentação relevante do projeto
- Verificar dependências entre módulos
- Identificar impacto arquitetural (schema, API, UI, proxy, tipos)
- Listar todos os arquivos que serão alterados
- Explicar a estratégia de implementação

**Aguardar aprovação explícita antes de iniciar a Etapa 2.**

### Etapa 2 — Implementação

Dividir a Sprint em microtarefas. Cada microtarefa deve ter:

- Objetivo claro
- Arquivos alterados
- Dependências de outras microtarefas
- Critérios de conclusão

**Implementar apenas uma microtarefa por vez.** Não avançar para a próxima sem concluir e validar a atual.

### Etapa 3 — Validação (após cada microtarefa)

- Executar testes quando existirem
- Validar TypeScript (`npm run build` ou verificação de tipos)
- Validar build quando aplicável
- Validar APIs afetadas (testar rotas manualmente)
- Validar interface no navegador

### Etapa 4 — Documentação

- Atualizar apenas os documentos impactados pela mudança
- Nunca criar novos documentos sem necessidade real
- CLAUDE.md, CHANGELOG.md e documentos de arquitetura são os candidatos prioritários

### Etapa 5 — Encerramento

Apresentar ao final da Sprint:

- Resumo do que foi implementado
- Lista de arquivos alterados
- Testes executados e resultados
- Pendências identificadas
- Riscos conhecidos
- Próximos passos sugeridos

**Aguardar autorização para continuar para a próxima Sprint.**

---

## Boas práticas que devem ser seguidas

### TypeScript
- Todos os tipos de dados do domínio devem estar em `src/lib/types.ts`
- Nunca usar `any`; usar tipos específicos ou `unknown` quando necessário
- Usar `type` para union types e enums; usar `interface` para objetos com forma definida

### Componentes React
- Sempre adicionar `"use client"` em componentes que usam hooks (`useState`, `useEffect`, `useContext`, `useRouter`, etc.)
- Componentes interativos de formulário devem ter `type="button"` explícito em `<button>` para evitar submit acidental
- Usar `aria-label` em ícones e botões sem texto visível
- Memoizar funções de callback com `useCallback` em Contexts; valores computados com `useMemo`

### Estilização
- Usar apenas as cores do design system: `cream`, `chocolate`, `rose`, `sage`, `sand`, `muted`
- Usar as classes utilitárias customizadas: `.max-w-app`, `.shadow-card`, `.input-field`, `.option-card`
- Usar `.font-display` para títulos (Fraunces); o corpo usa DM Sans por padrão
- Mobile-first: containers de página usam `max-w-app` (480px); dashboard admin usa `max-w-5xl`
- Esconder scrollbars horizontais com `.scrollbar-none`

### Formulários
- Campos de formulário usam a classe `.input-field`
- Cards de seleção (entrega, pagamento) usam `.option-card` e `.option-card.selected`
- Componentes auxiliares de formulário (`Field`, `Row`) podem ser declarados no mesmo arquivo da página quando são específicos daquela página

### Navegação
- Usar `<Link>` do Next.js para navegação interna (nunca `<a href>`)
- O carrinho é aberto via query string `/?cart=open` (detecção via `useSearchParams`)
- Usar `useRouter().push()` para navegação programática pós-ação

### Dados
- `formatCurrency(value)` de `@/lib/mock-data` para formatar valores monetários (BRL)
- `getMaxLeadTimeDays(productIds)` para calcular prazo máximo de um conjunto de produtos
- `getMinDeliveryDate(leadTimeDays)` para calcular a data mínima de entrega
- Snapshots de dados no `OrderItem` (`productName`, `unitPrice`, `totalPrice`) preservam o estado no momento do pedido — não referenciar apenas o ID

---

## Infraestrutura atual (Sprint 0.5)

### Banco de dados
- **Provedor:** Supabase PostgreSQL — projeto `vqootzdtkgcbltrlfgzq`
- **Conexão:** porta 5432 (direta). **Nunca usar porta 6543 (pooler)** — quebra o Prisma Migrate
- **Senha contém `&`** — no `DATABASE_URL`, encode como `%26`
- Credenciais de admin: `admin@doceatelier.com.br` / `admin123` (hash bcrypt no banco)

### Proxy (Next.js 16)
- O arquivo de middleware chama-se `proxy.ts` (não `middleware.ts`) — convenção do Next.js 16
- Localização: `src/proxy.ts` (não na raiz do projeto)
- Exportação: `export async function proxy(...)` (não `middleware`)
- **ATENÇÃO:** O hot reload do Turbopack não recompila `proxy.ts` automaticamente. Ao alterar esse arquivo, reiniciar o servidor dev obrigatoriamente.
- `getToken` requer `secret: process.env.NEXTAUTH_SECRET` explícito no Edge runtime

### Após clonar o projeto
```bash
npm install
npm run db:generate   # obrigatório após npm install — gera o Prisma Client
```

---

## Regras para futuras implementações

### Banco de dados e API
- Ao implementar API Routes, usar o Prisma Client via `import { prisma } from "@/lib/prisma"` (singleton — nunca instanciar `new PrismaClient()` diretamente em rotas)
- `OrderItem` armazena snapshot do produto (`productName`, `unitPrice`, `totalPrice`) — manter esse padrão ao implementar a criação real de pedidos
- `Customer` é identificado por `phone` (campo `@unique`) — o login OTP deve usar o número de celular como chave, não e-mail

### Autenticação
- A autenticação da equipe interna usa `NEXTAUTH_SECRET`/`NEXTAUTH_URL` (já no `.env.example`)
- A autenticação do cliente usa o provider `"customer"` do NextAuth (`id: "customer"`) — aceita `phone + name`, faz upsert de `Customer` no banco, armazena `phone` e `userType: "customer"` no JWT
- OTP via WhatsApp (Fase 8): adicionar verificação de código na função `authorize()` do provider `"customer"` em `src/app/api/auth/[...nextauth]/route.ts` — sem alterar estrutura de sessão
- As rotas `/admin/*` são protegidas em `src/proxy.ts` com verificação de `token.userType === "admin"`. Restrições por `UserRole` são configuradas no mapa `ROLE_REQUIRED` no mesmo arquivo
- `useCurrentUser()` retorna `Customer | null` — null quando não autenticado OU quando autenticado como admin
- Os tipos de sessão NextAuth são estendidos em `src/types/next-auth.d.ts`

### Endereços de entrega
- `Address` é sempre criado como entidade de primeira classe no banco, na mesma transação do pedido
- O checkout coleta campos de endereço (rua, número, bairro, CEP); cidade e estado default para "São Paulo" / "SP"
- `Order.addressId` aponta para o `Address` criado — nunca é enviado como ID mock
- Para `DeliveryType.RETIRADA`, `addressId` é `null` — nenhum `Address` é criado
- Quando o módulo de Clientes (P2.4) existir, o checkout poderá oferecer "endereço salvo" — o caminho de "novo endereço" já está implementado e é compatível
- `DeliveryAddressInput` em `src/lib/types.ts` é o tipo canônico para o payload do checkout → API

### Entrega
- A lógica de entrega gratuita usa `freeDeliveryRadiusKm` da tabela `StoreConfig` (padrão: 3 km)
- O cálculo de distância usa Google Maps Distance Matrix API (`GOOGLE_MAPS_API_KEY`)
- `DeliveryType.ENTREGA_GRATIS` = confeitaria paga; `ENTREGA_APP` = cliente paga via Uber/99

### WhatsApp
- Toda mensagem enviada deve ser registrada em `WhatsAppLog` (incluindo erros)
- Templates de mensagem são identificados pelo campo `template` (ex: `"order_confirmed"`, `"order_ready"`)
- O `OtpCode` expira — verificar `expiresAt` antes de validar

### Estilo e design
- Não alterar as variáveis de cor do design system sem alinhamento — são a identidade visual do negócio
- Não introduzir bibliotecas de componentes externas (Material UI, Shadcn, etc.) sem decisão explícita
- Não usar `imageEmoji` como solução permanente — quando `imageUrl` estiver disponível (Supabase/S3), ele tem prioridade no modelo `Product`

### Módulos admin ainda não implementados
Os seguintes módulos existem no hub admin mas não têm páginas ainda:
- Usuários (`/admin/usuarios`)
- Clientes (`/admin/clientes`)
- Insumos (`/admin/insumos`)
- Receitas (`/admin/receitas`)
- Produtos (`/admin/produtos`)
- Unidades (`/admin/unidades`)
- Tema (`/admin/tema`)

---

## Decisões arquiteturais tomadas

Registro permanente de decisões que já foram tomadas e não devem ser questionadas em sessões futuras.

| Decisão | Escolha | Justificativa | Data |
|---------|---------|---------------|------|
| **[ADR-005] Padrão de IDs** | `id String @id @default(cuid())` obrigatório em todos os modelos persistentes | CUID é nativo do Prisma, globalmente único, não expõe volume de registros, evita colisões entre ambientes, prepara sincronizações futuras. Alternativas rejeitadas: `autoincrement()`, UUID misto, NanoID, ULID, KSUID. `slug` proibido como chave técnica de relacionamento. Ver [ADR-005.md](ADR-005.md). | 02/07/2026 |
| **Embalagens** | Entidade própria (`Packaging`) separada de `Ingredient` | Embalagens têm regras de negócio distintas: cadastro próprio, estoque próprio, fornecedores próprios, custos próprios. Evita campos condicionais e acoplamento entre matéria-prima e embalagem. Favorece evolução dos módulos de Compras, Estoque, Produção e Custos. **Superado parcialmente por [ADR-014]** (abaixo): a parte "entidade própria separada de `Ingredient`" permanece válida e não questionada; a parte "a `Recipe` referenciará tanto `RecipeIngredient` quanto `PackagingItem`" foi **revertida** — nunca chegou a ser implementada e o Módulo 2.I (Receitas) foi concluído e encerrado sem ela. | 30/06/2026 |
| **[ADR-014] Packaging vincula-se ao Product, não ao Recipe** | `Packaging` relaciona-se a `Product` via novo join `ProductPackaging` (mesmo padrão de `ProductRecipe`) — não a `Recipe`. `Product.costPrice = Σ(ProductRecipe cost) + Σ(ProductPackaging cost)`. `Recipe`/`RecipeIngredient` não recebem nenhuma alteração. | **Alternativa descartada:** manter a decisão original de 30/06/2026 (`PackagingItem` vinculado a `Recipe`, com `unitId`) — descartada porque exigiria reabrir o schema/service do Módulo 2.I (Receitas), já encerrado (`MODULE_2I_CLOSURE.md`, Sprint I.3), sem Ordem de Missão específica para isso, e porque a própria evidência técnica já disponível (`PLAN.md` linha 70, escrita quando 2.I foi de fato implementado: *"RecipeIngredient não tem nenhum campo/relação com Packaging, confirmado no schema... embalagem afeta custo do Produto, não da Receita"*) já apontava nessa direção antes mesmo desta ADR. **Origem:** Fase 1 (Auditoria) da Sprint 2.H.0 encontrou uma contradição real entre 4 documentos que ainda registravam a decisão original (`CLAUDE.md`, `ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `EPICO_2_PLANEJAMENTO.md`) e 3 documentos que já refletiam a Versão B na prática (`PLAN.md`, `CHANGELOG.md`, `REGRAS_NEGOCIO.md`). Ver `MODULE_2H_PLANNING.md` Seções 0, 1.5 e 2.6 para o inventário completo e o detalhamento de schema. **Documentos impactados (Regra 3, `PROJECT_GOVERNANCE.md` Seção 13.1):** `CLAUDE.md` (esta entrada), `ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `REGRAS_NEGOCIO.md`, `PLAN.md`, `CHANGELOG.md`, `MODULE_2H_PLANNING.md` (novo). Fora do escopo desta ADR (achado, não corrigido): `VISION.md`, `ERP_BLUEPRINT.md`, `MODULES.md`, `EPICO_2_PLANEJAMENTO.md` (Módulo 5) — ver `MODULE_2H_PLANNING.md` Seção 1.5. Aprovado pelo Product Owner nesta sessão. | 20/07/2026 |
| **[ADR-015] Fluxo Oficial de Desenvolvimento de Módulo** | Consolidada como padrão oficial do ERP a metodologia validada na prática no ciclo completo do Módulo 2.H (Sprints 2.H.0–2.H.7): 11 etapas — Planejamento Arquitetural → Blueprint → Schema → Repository+Validator → Service → API → UX Foundation → Frontend → Validação Funcional → Homologação do Product Owner → Encerramento do Módulo — registradas em `PROJECT_GOVERNANCE.md` Seção 27, com objetivo/entrada/saída/critério de sucesso por etapa. Formaliza a distinção entre Validação Técnica, Validação Funcional e Homologação do Product Owner (nenhuma substitui outra). Novo documento `QUALITY_GUIDELINES.md` — companion operacional: classificação oficial de achados (Bug/Backlog/Evolução/Dívida Técnica/Decisão Arquitetural, mapeada para a classificação de auditoria já existente em `PROJECT_GOVERNANCE.md` Seção 24, não duplicada), 10 checklists por etapa, padrões de qualidade obrigatórios. **`MODULE_2H_CLOSURE.md` criado retroativamente** — auditoria desta sprint confirmou que todo módulo anterior (2.D/2.E/2.G/2.I/2.J) produziu um documento de encerramento dedicado, mas o Módulo 2.H não; a etapa "Encerramento do Módulo" (Seção 27) passa a exigir `MODULE_{N}{LETRA}_CLOSURE.md` explicitamente. **Achado registrado, não resolvido unilateralmente (mesmo padrão de transparência da ADR-009):** `ERP_DEVELOPMENT_WORKFLOW.md`/ADR-006/007/008 documentam Platform Review/Product Review/Demo Validation como etapas do fluxo oficial — nenhuma foi executada durante o ciclo 2.H.1–2.H.7; esta ADR não revoga nem reconcilia essa divergência, apenas a registra como decisão pendente do Product Owner. Documentos impactados: `PROJECT_GOVERNANCE.md` (Seção 27, nova), `QUALITY_GUIDELINES.md` (novo), `MODULE_2H_CLOSURE.md` (novo), `PLAN.md`, `CHANGELOG.md`. Aprovado pelo Product Owner nesta sessão. | 20/07/2026 |
| **[ADR-006] Product Review System** | Nova etapa obrigatória `Backend → API → Frontend → Product Review → QA → Encerramento`; novo Sub-agent `product-reviewer`, Skill `product-review`, Contract `product-review-contract.md`, Playbook `PRODUCT_REVIEW_PLAYBOOK.md` (`.claude/`). `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md` (já existentes desde as Sprints P2/P3) permanecem a fonte de verdade de produto — não duplicados. Somente achado de categoria A (Problema Funcional) bloqueia a homologação técnica; B–F (UX/UI/Navegação/Acessibilidade/Melhoria) viram backlog priorizado. Evolução de infraestrutura autorizada via Ordem de Missão dedicada e explícita do Product Owner (Sprint G.6), conforme `PROJECT_GOVERNANCE.md` Seção 13.7 — **nota de transparência**: a condição 1 dessa seção ("bloqueio real identificado durante o desenvolvimento do ERP") não estava documentada como bloqueio explícito em nenhuma sprint anterior (2.D–2.I); as condições 2–4 (aprovação explícita do PO, ordem de missão dedicada, registro documental) estão integralmente satisfeitas por esta própria ordem. Registrado como ressalva, não como violação — decisão do Product Owner prevalece. | 15/07/2026 |
| **[ADR-007] Platform & Product Architecture Consolidation** | O ERP evolui, na visão de produto, para uma plataforma SaaS white-label multi-tenant (`ERP_PRODUCT_VISION.md`, `PLATFORM_OVERVIEW.md`, ambos criados nesta sprint) — Doce Atelier passa a ser tratada como tenant de referência, não como parte fixa da arquitetura. **Nenhuma implementação funcional foi feita**: schema, código e este próprio `CLAUDE.md` continuam 100% single-tenant hoje — ver a nota de transparência obrigatória no topo de `ERP_PRODUCT_VISION.md`. Novo Sub-agent `platform-reviewer`, Skill `platform-review`, Contract `platform-review-contract.md` (`.claude/`) — `product-reviewer`/`product-review` (ADR-006) preservados sem nenhuma alteração, conforme exigido pela ordem de missão. Novo fluxo: `Backend → API → Frontend → Platform Review → Product Review → QA → Encerramento`. **Nota de transparência sobre `PROJECT_GOVERNANCE.md` Seção 13.7**: mesma ressalva já registrada no ADR-006 — condição 1 (bloqueio real já documentado) não estava evidenciada em sprint anterior; condições 2–4 satisfeitas pela própria ordem de missão do Product Owner. Esta sprint encerra oficialmente a fase de evolução arquitetural — próximos trabalhos priorizam exclusivamente módulos de negócio (`PROJECT_GOVERNANCE.md` Seção 13.7, "É proibido criar novas estruturas arquiteturais sem necessidade técnica real comprovada"). | 15/07/2026 |
| **[ADR-008] Demo Environment & Product Validation Platform** | A Plataforma de Demonstração passa a ser capacidade permanente do produto (`DEMO_ENVIRONMENT.md`, `DEMO_DATASET.md`, `DEMO_GUIDE.md`, `prisma/demo-seeds/README.md`, todos criados nesta sprint). Novo fluxo oficial: `Backend → API → Frontend → Platform Review → Product Review → Demo Validation → QA → Encerramento` (`PROJECT_GOVERNANCE.md` Seção 4 item 3.6 e Seção 16.6; `ERP_DEVELOPMENT_WORKFLOW.md` item 5.6). Novo critério acrescentado a `.claude/skills/product-review/checklists/ux-checklist.md` — Skill já congelada na Baseline v1.0 (`PROJECT_GOVERNANCE.md` Seção 13.6), exigindo esta ADR antes da alteração. Nenhum dado real implementado em `prisma/demo-seeds/` — apenas arquitetura, conforme a Restrição Final da própria ordem de missão. **Nota de transparência sobre `PROJECT_GOVERNANCE.md` Seção 13.7** — diferente de ADR-006/ADR-007, a condição 1 desta vez está genuinamente satisfeita: a Sprint T.2C confirmou por evidência real (não suposição) que o Playwright MCP está indisponível nesta instalação, o que é o bloqueio real que motiva uma infraestrutura própria de homologação manual; condições 2–4 satisfeitas pela ordem de missão desta sprint e pela aprovação explícita do Product Owner registrada no `CHANGELOG.md`. **Ressalva registrada, não como violação**: o ADR-007 (linha acima) declarou "esta sprint encerra oficialmente a fase de evolução arquitetural — próximos trabalhos priorizam exclusivamente módulos de negócio"; esta ADR-008 é, na prática, mais uma sprint de infraestrutura/processo, não um módulo de negócio, na sequência imediata dessa declaração — e uma Sprint G.6.2 (Product Runtime Standards), também de padronização e não de módulo de negócio, já está registrada como próxima. O Product Owner aprovou explicitamente ambas nesta sessão, ciente do teor desta nota. | 16/07/2026 |
| **[ADR-009] Sprint Backlog Governance** | Registrado o **fluxo operacional vigente** — o que conduz de fato toda Sprint do projeto, confirmado pelo histórico real (`PROJECT_GOVERNANCE.md` Seção 4.1): o fluxo de 5 etapas desta seção do `CLAUDE.md`, espelhado em `PROJECT_GOVERNANCE.md` Seção 4. Isso preserva, sem invalidar, a hierarquia documental existente (`CLAUDE.md` → Skills → Contracts → Protocols → Sub-agents → Playbooks → AI Operating System): `docs/ai/AI_PROMPT_ORCHESTRATOR.md` (papéis Orchestrator/Executor/Auditor, artefatos `SPRINT_X.md`/`SPRINT_AUDIT.md`, máquina de 8 estados) e os esquemas de 9 e 10 estados (`project-skill-governance/references/STATE_MACHINE.md`, `.claude/architecture/STATE_MACHINE.md`) permanecem válidos como arquitetura expandida de orquestração — nenhum revogado, nenhuma reconciliação forçada entre os três. Formalizada a distinção **Sprint Oficial** (numeração definitiva, executável, entra no fluxo de governança) vs. **Backlog Suggestion** (proposta sem numeração, não executável, não interfere na Sprint em andamento) e a regra de bloqueio: nenhuma Sprint Oficial nova pode ser criada enquanto outra estiver entre os dois checkpoints ⛔ de `PROJECT_GOVERNANCE.md` Seção 4 (aprovada, ainda não encerrada) — melhorias identificadas nesse intervalo viram Backlog Suggestion. Regras de uma Sprint de governança só produzem efeito após conclusão + aprovação formal + documentação atualizada (regra de vigência, proposta como Backlog Suggestion nesta própria sessão e incorporada em `PROJECT_GOVERNANCE.md` Seção 4.3) — não retroativa. | 16/07/2026 |
| **[ADR-010] Product Runtime Standards** | Formalizados padrões técnicos permanentes de produto (`PROJECT_GOVERNANCE.md` Seção 8.8, nova Seção 11.1): o ERP é sistema **Web**, **totalmente responsivo** (critério mínimo de aceite: Desktop, Tablet, Smartphone — `UX_GUIDELINES.md` Seções 14–16 continuam sendo a fonte de verdade de design, não duplicada), ambiente oficial de produção é **VPS Linux**, scripts novos priorizam compatibilidade Linux e evitam dependência exclusiva de Windows. Diretrizes permanentes de performance: paginação/filtros server-side, evitar carregamento desnecessário, otimizar consultas/renderização — aplicável a recursos com volume crescente, não retroativo a rotas já implementadas. **Nenhuma funcionalidade alterada, nenhum código de `src/` tocado** — apenas convenção formalizada, conforme a Restrição Final da própria ordem de missão. `PLATFORM_OVERVIEW.md` ganhou seção "Qual é o ambiente de execução oficial?" apontando para esta seção, sem duplicar o conteúdo. | 16/07/2026 |
| **[ADR-011] Reordenação do Roadmap — Sprint 2.J.1 antes do Módulo 2.F** | A Ordem de Missão da Sprint 2.J.1 (Backend Completo — Módulo Produtos) solicitou diretamente a implementação do Backend de `Product` (Repository/Validator/Service), sem execução prévia do Módulo 2.F (Produtos Fase 1: CRUD admin + upload de imagem, `costPrice = 0`, sem RecipeLinker) — o roadmap original (`PLAN.md`, congelado desde a Sprint 2.0.6) registrava "2.J" como dependente de "2.F + 2.I". Durante a implementação, constatou-se por evidência que o Backend de 2.J (`productRepository.ts`, `productValidator.ts`, `productService.ts`) **não possui nenhuma dependência técnica de código do Módulo 2.F** — não importa, não referencia e não pressupõe nenhum artefato de 2.F (API/Frontend de CRUD simples). A dependência "2.F + 2.I" do roadmap original era uma dependência de **sequenciamento de entrega** (Fase 1 do Produto antes da Fase 2 do mesmo módulo), não uma dependência técnica de implementação — o Backend de `Product` é autocontido e só depende, de fato, de `ProductCategory` (já existente) e de `Recipe`/`RecipeService` (Módulo 2.I, concluído). Sequência oficial do roadmap atualizada em `PLAN.md`: Backend de 2.J passa a poder preceder 2.F; a ordem histórica original (2.F antes de 2.J) permanece registrada em `CHANGELOG.md` e nesta ADR, não apagada. Documentos impactados: `PLAN.md` (dependência de "2.J" atualizada), `CHANGELOG.md` (Sprint 2.J.1). Aprovado pelo Product Owner nesta sessão, com instrução explícita de não caracterizar esta reordenação como violação de governança ou inconsistência — é decisão registrada, não desvio de processo. | 16/07/2026 |
| **[ADR-012] Interrupção de Sprint funcional por inconsistência de infraestrutura** | Nova Seção 4.4 em `PROJECT_GOVERNANCE.md`: sempre que uma Sprint funcional encontrar, durante sua execução, uma inconsistência de infraestrutura (banco de dados, ambiente, Storage, migrations, autenticação ou serviços externos), a Sprint funcional é interrompida, a inconsistência é registrada em `CHANGELOG.md`/`PLAN.md`, e uma Sprint Oficial de Infraestrutura dedicada (nomenclatura `I.x`) é aberta e aprovada pelo Product Owner antes de qualquer continuidade do roadmap funcional dependente da área afetada. Correções estruturais dentro da própria Sprint de infraestrutura continuam exigindo autorização explícita adicional — confirmar por evidência não é autorização para corrigir. **Lacuna identificada em auditoria real, não caso isolado**: a Sprint 2.J.2.1 (funcional) levantou por hipótese uma dessincronização de schema; nenhuma regra existente até então obrigava a interrupção do roadmap funcional (Sprint 2.J.3 seria o próximo passo natural) até a confirmação — a Sprint I.1, aberta por instrução direta do Product Owner, confirmou a hipótese por evidência e revelou escopo maior (dados ausentes nos módulos já encerrados 2.D/2.G/2.I). Documentos impactados: `PROJECT_GOVERNANCE.md` Seção 4.4, `CLAUDE.md` (esta ADR). Aprovado pelo Product Owner nesta sessão. | 17/07/2026 |
| **[ADR-013] Critério de evidência para encerramento de módulo** | Novo parágrafo em `PROJECT_GOVERNANCE.md` Seção 23 (DoD de Módulo), bloco `VALIDAÇÃO FUNCIONAL`: um módulo só pode ser declarado oficialmente encerrado com evidência de validação funcional em **ambiente sincronizado** — banco compatível com `schema.prisma` (schema × banco físico confirmados coincidentes, não apenas `prisma generate` bem-sucedido) — e **dados reais ou seeds oficiais** (não dados hipotéticos, não ambiente com tabelas vazias). Compilação (`tsc`), lint, build ou revisão de código, isoladamente, **não satisfazem** este critério e não encerram um módulo. **Origem:** a Sprint I.2 (17/07/2026) validou `/admin/unidades`, `/admin/ingredientes`, `/admin/receitas` e `/admin/produtos` exatamente segundo este critério (banco introspectado por evidência direta + seeds idempotentes reais + navegação real no browser) — o Product Owner formalizou o critério logo em seguida, generalizando-o para todo encerramento de módulo futuro, não apenas para módulos de infraestrutura. Não retroativo às declarações de "Concluído" já registradas em `PLAN.md` para 2.D/2.G/2.I antes da Sprint I.2 — essas já foram re-homologadas com este mesmo padrão de evidência na própria Sprint I.2 (ver `CHANGELOG.md`). Documentos impactados: `PROJECT_GOVERNANCE.md` Seção 23, `CLAUDE.md` (esta ADR). Aprovado pelo Product Owner nesta sessão. | 17/07/2026 |
| **[ADR-016] Prefixo de numeração `G.x` reservado para sprints de governança** | Confirmado e aplicado, resolvendo GD-004 (`GOVERNANCE_DECISIONS.md`): sprints de governança do produto/metodologia usam exclusivamente o prefixo `G.x` (sequência real: G.1, G.2, G.5.x, G.6.x, G.8, **G.9**), nunca um prefixo `{N}.{LETRA}` já pertencente a um Módulo do Épico 2 (ex.: `2.I` = Receitas) nem o prefixo `I.x` já reservado a Infraestrutura (`PROJECT_GOVERNANCE.md` Seção 4.4). **Origem:** a Sprint 2.I.1 (20/07/2026, ela própria uma sprint de governança) encontrou, por evidência direta em `CHANGELOG.md`, que fora nomeada com um prefixo que colide simultaneamente com o Módulo 2.I (Receitas, sprints reais de 15/07/2026) e com o prefixo `I.x` (Infraestrutura, sprints reais `I.1`–`I.3`) — registrou a recomendação como `GOVERNANCE_DECISIONS.md` GD-004, sem aplicá-la unilateralmente. **Não renomeia** retroativamente `Sprint 2.I.0`/`Sprint 2.I.1` (governança, 20/07/2026) em `CHANGELOG.md`/`PLAN.md` — permanecem registradas como estão, com a colisão documentada. Aprovado pelo Product Owner na Sprint G.9 (22/07/2026), que já nasceu com o novo prefixo aplicado. | 22/07/2026 |
| **[ADR-017] Papéis de Arquiteto e Desenvolvedor centralizados no Claude Code, via os 11 Sub-agents já existentes em `.claude/agents/`** | O fluxo de trabalho até aqui usava um Arquiteto externo (ChatGPT), com o Product Owner retransmitindo decisões arquiteturais como Ordens de Missão para o Claude Code (Desenvolvedor). **Motivo da mudança:** o ChatGPT vinha perdendo contexto do projeto entre conversas, comprometendo a evolução — problema relatado diretamente pelo Product Owner nesta sessão. **Decisão:** os papéis de Arquiteto e Desenvolvedor passam a ser centralizados no Claude Code, através da arquitetura de 11 Sub-agents já implementada na Sprint G.5.4 (15/07/2026) — `ai-project-manager` (orquestração) → `ai-solution-architect` (decisão arquitetural, equivalente ao papel antes exercido pelo ChatGPT) → `ai-backend-engineer`/`ai-frontend-engineer` (implementação) → `platform-reviewer` → `product-reviewer` → `ai-qa-engineer` → `ai-documentation-engineer` → `ai-release-manager`, conforme `.claude/agents/EXECUTION_FLOW.md` (não redefinido aqui). **Achado que motivou a ativação, não a criação:** essa estrutura já existia integralmente, mas nunca havia sido usada em nenhuma sprint real (confirmado por auditoria na Sprint 2.I.1, 20/07/2026, classificada como EXPERIMENTAL) — todo o trabalho até aqui, incluindo o Módulo 2.H completo e a Sprint 2.F, foi executado por implementação direta, sem passar pelos Sub-agents. Criar agentes novos teria duplicado um trabalho já pronto; a decisão foi ativar o que já existe, não construir de novo. **O que não muda:** toda trava de aprovação já vigente (`PROJECT_GOVERNANCE.md` Seção 18, "O que a IA NUNCA faz sem aprovação explícita") continua valendo — o Product Owner segue aprovando plano antes de execução e aceite antes de encerramento, agora com `ai-project-manager` como ponto de entrada em vez de execução direta. **Tensão registrada, não resolvida por esta ADR:** o fluxo já desenhado em `EXECUTION_FLOW.md` trata `platform-reviewer`/`product-reviewer` como etapas sempre obrigatórias quando há Backend/Frontend — em conflito direto com as recomendações GD-001/GD-002 (`GOVERNANCE_DECISIONS.md`, Sprint 2.I.1, ainda pendentes) de tornar essas duas etapas opcionais/fundidas. Por decisão explícita do Product Owner nesta sessão, a ativação ocorre **mantendo as duas obrigatórias por enquanto**, até GD-001/GD-002 serem decididas — não é uma reversão dessas recomendações, é uma sequência de decisão explícita. `PROJECT_STATE.md` mantido como está, útil independentemente do papel do ChatGPT no fluxo. Documentos impactados: `CLAUDE.md` (esta ADR), `PROJECT_GOVERNANCE.md` Seção 18, `GOVERNANCE_DECISIONS.md` (nota cruzada em GD-001/GD-002), `PROJECT_STATE.md`. Aprovado pelo Product Owner nesta sessão. | 31/07/2026 |
| **[ADR-019] Prefixo `PRIV.x` reservado para sprints de Privacidade/LGPD** | Novo prefixo de numeração, mesmo padrão de `DS.x` (ADR-018) — reservado a sprints de política de dado pessoal transversais, que afetam múltiplos módulos já implementados (qualquer módulo que exponha telefone/endereço/nome de cliente), não um Módulo de Épico isolado. **Origem:** o Planejamento do Módulo 2.L (02/08/2026) encontrou que o módulo expõe telefone, endereço e notas internas de clientes reais no admin, sem nenhuma política registrada em `REGRAS_NEGOCIO.md` e sem controle de granularidade por `UserRole` — registrado então como Backlog Suggestion (`PLAN.md`), por decisão explícita do Product Owner de tratar depois, sem bloquear o Módulo 2.L. Priorizado pelo Product Owner em 03/08/2026, com o Épico 2 e o redesign (DS.1) já encerrados. Primeira sprint: `PRIV.1`. **Nota de escopo, não uma limitação desta ADR:** este projeto trata a Sprint `PRIV.x` como implementação de salvaguardas técnicas/de produto (controle de acesso, minimização de dado exibido, base para retenção/auditoria) alinhadas aos princípios geralmente aceitos de LGPD — não substitui revisão jurídica real; nenhuma sprint de IA declara conformidade legal por si só. | 03/08/2026 |
| **[ADR-018] Prefixo `DS.x` reservado para sprints de Design System** | Novo prefixo de numeração, análogo a `G.x` (governança) e `I.x` (infraestrutura) — reservado a sprints que não pertencem a um Módulo de um Épico específico e afetam telas de múltiplos módulos já implementados (visual/UX transversal). **Origem:** o Product Owner pediu, durante a Sprint 2.K.3 (02/08/2026), um redesign do Design System — registrado então como Backlog Suggestion (`PLAN.md`), sem numeração, por não se encaixar em nenhum prefixo existente e por o Módulo 2.K estar aberto (`PROJECT_GOVERNANCE.md` Seção 4.3). Com o Épico 2 encerrado (Módulo 2.L, mesma data), o Product Owner priorizou o redesign — confirmado explicitamente que nenhum prefixo já usado servia (não é Módulo de Épico, não é governança, não é infraestrutura), optou-se por um prefixo novo em vez de forçar `G.x` (que já tem 10 sprints de significado consolidado como "governança/metodologia de IA", não "produto/visual"). Primeira sprint: `DS.1`. Documentado em `PROJECT_GOVERNANCE.md` Seção 3 ("Prefixos reservados fora do Épico"), consolidando `G.x`/`I.x`/`DS.x` num único lugar — nenhum dos outros dois prefixos foi alterado. | 02/08/2026 |
| **[ADR-020] Autorização por papel granular (`requireRole`), aplicada primeiro ao domínio Clientes** | Nova primitiva genérica `src/lib/auth/requireRole.ts` (`requireRole(roles: UserRole[])`); `requireAdmin.ts` refatorado para delegar a `requireRole(["ADMIN"])`, comportamento externo idêntico nas 49 rotas que já o usavam. Aplicada nesta sprint às 3 rotas de `/api/admin/customers/**` e à página `/admin/clientes` (`src/proxy.ts`): `ADMIN` + `ATENDIMENTO` têm acesso total, incluindo `notes` sem redação condicional por campo; `PRODUCAO`/`FINANCEIRO` recebem 403/redirecionamento. **Achado que motivou o desenho:** antes desta sprint, `requireAdmin()` era binário (`ADMIN` ou nada) em todas as 52 rotas `/api/admin/**` — nenhum outro papel acessava nenhuma API admin, contradizendo `REGRAS_NEGOCIO.md` Seção 3.11 (`ATENDIMENTO` deveria acessar pedidos e clientes). Também corrigido: `src/proxy.ts` fazia lookup de `ROLE_REQUIRED` por igualdade exata de `pathname`, nunca cobrindo sub-rotas dinâmicas (`/admin/clientes/[id]`) — generalizado para prefixo (`pathname === key \|\| pathname.startsWith(key + "/")`), sem alterar o comportamento da única entrada pré-existente (`/admin/config`). **Alternativa descartada:** restringir `notes` só a `ADMIN` (DTO condicional por papel) — descartada por decisão do Product Owner, a favor da leitura literal de `REGRAS_NEGOCIO.md` 3.11 e de uma mudança menos invasiva. **Fora do escopo desta ADR (achado registrado, não corrigido):** as outras 51 rotas `/api/admin/**` (pedidos, produção, financeiro etc.) mantêm a mesma inconsistência binária pré-existente — registrado como Backlog Suggestion para uma sprint `PRIV.2` futura, por decisão explícita do Product Owner de manter esta sprint como fatia pequena (nota de escopo já prevista na ADR-019). Documentos impactados: `CLAUDE.md` (esta ADR), `REGRAS_NEGOCIO.md` Seção 15.6 (regra 18, nova), `PLAN.md`, `CHANGELOG.md`. Aprovado pelo Product Owner nesta sessão. | 03/08/2026 |
| **[ADR-021] Autorização por papel granular estendida a Pedidos/Produção/Financeiro; Catálogo e Cadeia Produtiva permanecem `ADMIN`-only** | Dois novos wrappers finos sobre `requireRole` (padrão ADR-020): `src/lib/auth/requireOrderAccess.ts` → `requireRole(["ADMIN","ATENDIMENTO","PRODUCAO"])`, aplicado às 3 rotas `/api/admin/orders/**`; `src/lib/auth/requireFinance.ts` → `requireRole(["ADMIN","FINANCEIRO"])`, aplicado a `/api/admin/cmv`. `src/proxy.ts` ganha `"/admin/producao": ["ADMIN","ATENDIMENTO","PRODUCAO","FINANCEIRO"]` (inclui `FINANCEIRO` por ser a única página com dados de CMV hoje). `src/app/api/admin/upload/route.ts` normalizado de checagem de sessão inline para `requireAdmin()` — mesmo papel exigido (`ADMIN`), formato de corpo de erro em 401/403 passa a ser o padrão `{success:false,error:{code,message}}` em vez de `{error:"..."}` (decisão explícita do Product Owner: aceitar a mensagem genérica exibida ao usuário nesse caminho de erro específico, em troca de consistência com o resto da API). **União de papéis em `orders/**` (decisão explícita do Product Owner, não inferida):** `REGRAS_NEGOCIO.md` Seção 3.11 trata "pedidos" (`ATENDIMENTO`) e "produção" (`PRODUCAO`) como domínios distintos, mas não existe hoje `/admin/pedidos` separada de `/admin/producao` — ambos os papéis foram unidos nas mesmas rotas; separar de fato exigiria uma sprint de Front-end futura, registrada como pendência aceita, não endereçada aqui. **Fora do escopo desta ADR, decisão explícita do Product Owner:** as 45 rotas de Catálogo (categorias/ocasiões/produtos) e Cadeia Produtiva (unidades/ingredientes/receitas/embalagens/fornecedores) permanecem `ADMIN`-only — nenhuma delas tem papel definido em `REGRAS_NEGOCIO.md` (registrado como pendência em `REGRAS_NEGOCIO.md` Seção 16); reescrever sem mudança de comportamento foi avaliado como risco sem ganho pelo `ai-solution-architect` e aceito pelo Product Owner. **Achado à parte, também fora do escopo, registrado como dívida técnica:** `src/lib/storeConfigService.ts` faz checagem de autorização (`session.user.role !== "ADMIN"`) dentro do Service em vez de no Route Handler — violação de camada distinta de simples duplicação; decisão do Product Owner de tratar em sprint técnica dedicada, não nesta. Documentos impactados: `CLAUDE.md` (esta ADR), `REGRAS_NEGOCIO.md` Seção 15.5 (regra 19, nova) e Seção 16, `PLAN.md`, `CHANGELOG.md`, `KNOWN_ISSUES.md` (achado de `storeConfigService.ts`). Aprovado pelo Product Owner nesta sessão. | 03/08/2026 |
| **[ADR-022] Autorização por papel granular estendida à Cadeia Produtiva (`PRODUCAO`); Catálogo permanece `ADMIN`-only** | Novo wrapper `src/lib/auth/requireProductionChain.ts` → `requireRole(["ADMIN","PRODUCAO"])`, aplicado às 31 rotas "puras" de Cadeia Produtiva: `units/**` (6, incl. `conversions`), `ingredient-categories/**` (2), `ingredients/**` (5), `recipes/**` (6), `suppliers/**` (4), `packaging-categories/**` (2), `packagings/**` (6). `src/proxy.ts` ganha 5 entradas (`/admin/unidades`, `/admin/ingredientes`, `/admin/receitas`, `/admin/fornecedores`, `/admin/embalagens` → `["ADMIN","PRODUCAO"]`), cobrindo sub-rotas dinâmicas automaticamente via o lookup por prefixo já existente (ADR-020) — nenhuma mudança no mecanismo do proxy em si. **Decisão de negócio explícita do Product Owner, não inferida:** receitas/ingredientes/embalagens/unidades/fornecedores são insumos diretos do trabalho de quem produz — hoje `PRODUCAO` só via o Kanban, sem acesso ao que alimenta a produção. **Catálogo (categorias/ocasiões/produtos) permanece `ADMIN`-only, decisão explícita separada:** nenhuma mudança nesta sprint — pendência mantida em `REGRAS_NEGOCIO.md` Seção 16. **Exceção dentro da própria Cadeia Produtiva, com alternativas avaliadas (ver ADR e `REGRAS_NEGOCIO.md` 15.5 regra 20):** `products/[id]/packagings/**` (vínculo Produto↔Embalagem, 2 rotas) é conceitualmente Cadeia Produtiva mas ficou `ADMIN`-only — a única UI que a consome é `/admin/produtos/[id]`, página de Catálogo já decidida `ADMIN`-only; abrir a API sem abrir a página criaria uma permissão sem caminho de uso real. Registrado como Backlog Suggestion (`PLAN.md`): revisitar se `/admin/produtos/[id]` for desmembrado no futuro. **Naming, achado registrado, não resolvido unilateralmente:** o prefixo `PRIV.x` (ADR-019) nasceu com escopo de "dado pessoal/LGPD"; Catálogo/Cadeia Produtiva não são dado pessoal — já esticado uma vez em `PRIV.2` (Pedidos/Produção/Financeiro) e esticado de novo aqui. Decisão explícita do Product Owner nesta sessão: manter o prefixo `PRIV.x` por ser continuação direta do mesmo trabalho de granularidade por papel, em vez de abrir um prefixo novo para uma única sprint — mesmo padrão de transparência de outras ADRs do projeto, não uma reinterpretação silenciosa do escopo original da ADR-019. Documentos impactados: `CLAUDE.md` (esta ADR), `REGRAS_NEGOCIO.md` Seção 15.5 (regra 20, nova) e Seção 16, `PLAN.md`, `CHANGELOG.md`. Aprovado pelo Product Owner nesta sessão. | 04/08/2026 |

---

## A definir

- **Estratégia de cache:** Nenhuma estratégia de cache (React Query, SWR, Next.js `fetch` cache) foi definida para as futuras API Routes
- **Testes:** Nenhum arquivo de teste existe no projeto. A estratégia de testes (unitário, integração, e2e) não foi definida
- **PWA:** O README menciona PWA como próxima fase, mas não há configuração de service worker ou manifest
- **Internacionalização:** O app está em pt-BR mas não há configuração de i18n
- **Acessibilidade:** Sem auditoria formal; apenas `aria-label` pontual em ícones
- **Rate limiting:** Sem estratégia definida para endpoints de OTP e pagamento
- **Variável `imageEmoji` vs `imageUrl`:** O modelo `Product` no Prisma tem `imageUrl` (String?), mas o tipo TypeScript usa `imageEmoji` (string) — a migração entre eles não está definida
