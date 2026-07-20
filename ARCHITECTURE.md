# ARCHITECTURE.md — Doce Menina ERP

Documento de arquitetura técnica do sistema.
Produzido na Sprint A1 — Revisão Arquitetural (29/06/2026).
Atualizar sempre que uma decisão arquitetural for alterada.

---

## 1. Arquitetura Atual

### 1.1 Visão geral

O sistema Doce Menina é uma aplicação web monolítica construída com Next.js 16 App Router. Combina front-end e back-end em um único projeto, com separação clara por camadas:

```
Cliente (navegador)
  ↕ HTTP / fetch
Camada de Apresentação (React + Tailwind)
  ↕ Context API (carrinho)
Camada de Serviços (src/services/)
  ↕ fetch /api/*
Camada de API (Next.js Route Handlers)
  ↕ Prisma Client
Banco de Dados (PostgreSQL / Supabase)
```

### 1.2 Decisões arquiteturais documentadas

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Framework | Next.js 16 App Router | SSR, routing, API Routes em um projeto |
| ORM | Prisma 6 | Type-safe, migrations, schema declarativo |
| Banco | PostgreSQL (Supabase) | Relacional, bem suportado por Prisma |
| Auth admin | NextAuth v4 (CredentialsProvider) | Integrado ao Next.js, sessão com JWT |
| Auth cliente | OTP via WhatsApp (planejado) | Sem senha, identificado por celular |
| Estado global | Context API (CartProvider) | Suficiente para o carrinho; sem Redux |
| Estilização | Tailwind CSS 4 + design system próprio | Controle total, sem dependência externa de UI |
| Tipagem | TypeScript strict, sem `any` | Segurança em tempo de compilação |
| Middleware | proxy.ts (Next.js 16) | Protege /admin/* no Edge runtime |

### 1.3 Camadas e responsabilidades

#### Páginas (`src/app/*/page.tsx`)
- Composição de componentes
- Gerenciamento de estado local (`useState`, `useEffect`)
- Chamada de hooks customizados (`useCart`, `useCurrentUser`, `useUserOrders`)
- Sem lógica de negócio embutida

#### Componentes (`src/components/`)
- Blocos de UI reutilizáveis
- Sem chamadas de API diretas (exceto `src/app/*/page.tsx`)
- Props fortemente tipadas com interfaces locais

#### Context (`src/context/CartContext.tsx`)
- Estado único global: carrinho de compras
- `useMemo` para valores computados (itemCount, subtotal)
- `useCallback` para todas as funções mutadoras

#### Hooks (`src/hooks/`)
- Encapsulam lógica de estado derivado
- `useCurrentUser` — identidade do cliente (atualmente mock)
- `useUserOrders` — pedidos do cliente com loading/error/refetch

#### Serviços (`src/services/`)
- Encapsulam chamadas HTTP às API Routes
- Transformam a resposta da API para o formato do domínio front-end
- `createOrder`, `getOrdersByPhone`, `updateOrderStatus`
- `getProducts`

#### API Routes (`src/app/api/*/route.ts`)
- Toda lógica de negócio do servidor
- Usam Prisma via singleton `@/lib/prisma`
- Validação de entrada nas bordas
- Transações Prisma para operações atômicas

#### Biblioteca (`src/lib/`)
- `types.ts` — contratos TypeScript do domínio (fonte da verdade)
- `prisma.ts` — singleton do PrismaClient
- `mock-data.ts` — dados temporários (substituição progressiva)
- `utils.ts` — funções utilitárias puras
- `env.ts` — validação de variáveis de ambiente no startup

---

## 2. Pontos Fortes

1. **Snapshot em OrderItem**: productName, unitPrice e totalPrice armazenados no momento do pedido. Pedidos históricos não são afetados por mudanças no catálogo.

2. **Address como entidade de primeira classe**: endereço criado na mesma transação do pedido. Quando o módulo de Clientes for implementado, endereços acumulados estarão disponíveis sem migração.

3. **VALID_TRANSITIONS na API de status**: regra de máquina de estados implementada no servidor. Garante que transições inválidas (ex: ENTREGUE → CONFIRMADO) sejam rejeitadas com HTTP 422.

4. **OrderStatusHistory automático**: toda mudança de status gera registro com data/hora. Auditoria completa do ciclo de vida do pedido.

5. **Prisma singleton global**: sem risco de múltiplas instâncias em dev com hot reload.

6. **Memoização correta no CartContext**: `useMemo` e `useCallback` aplicados onde geram valor real.

7. **Design system proprietário**: cores e classes utilitárias customizadas em globals.css, sem dependência de biblioteca de componentes externa.

---

## 3. Pontos de Melhoria

1. **useCurrentUser retorna mock**: bloqueia a vinculação real de pedidos a clientes. Prioridade alta.

2. **imageEmoji diverge de imageUrl**: o campo imageEmoji existe apenas no TypeScript; o Prisma tem imageUrl. O mapeamento em productService.ts hardcoda "🎂".

3. **OCCASIONS e CATEGORY_NAMES hardcoded**: a vitrine usa listas fixas em vez de buscar da API.

4. **StoreConfig não é lida**: valores de configuração (raio de entrega, custo de mão de obra, margem) estão no banco mas nunca são consultados.

5. **Autorização por papel ausente**: proxy.ts verifica autenticação mas não role. Usuário PRODUCAO vê módulos de FINANCEIRO.

6. **Address acumula sem deduplicação**: cada pedido com entrega cria um novo registro.

7. **Tipos usam `any`**: productService.ts e orderService.ts fazem mapeamento manual sem tipagem forte.

8. **costPrice sempre 0**: nenhum ponto do código calcula o custo a partir das receitas.

9. **Checkout sem validação de campos obrigatórios**: endereço vazio passa para a API se deliveryType !== RETIRADA.

10. **producao totalmente mock**: /admin/producao não consome nenhuma API.

---

## 4. Riscos Arquiteturais

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|--------------|---------|-----------|
| R01 | Identidade do cliente em mock bloqueia uso real | Certa (estado atual) | Alto | Implementar OTP na Fase 2 |
| R02 | Tipos TypeScript divergem silenciosamente do schema | Média | Médio | Revisar types.ts a cada alteração do schema |
| R03 | proxy.ts como convenção Next.js 16 pode ser removida | Baixa | Alto | Monitorar changelogs do Next.js |
| R04 | Address sem deduplicação gera ruído de dados | Baixa | Baixo | Deduplicar ao implementar módulo de Clientes |
| R05 | Ausência de rate limiting em /api/orders | Baixa (dev) | Alto (prod) | Implementar antes do deploy de produção |
| R06 | StoreConfig hardcoded bloqueia configuração dinâmica | Certa | Médio | Criar GET /api/config antes da Fase 2 |
| R07 | Escopo financeiro subestimado | Média | Alto | Planejar Fase 7 com antecedência |

---

## 5. Convenções que devem ser mantidas

- **Nunca instanciar `new PrismaClient()` fora de `src/lib/prisma.ts`**
- **Nunca usar `any` em TypeScript** — apenas em mapeamentos transitórios com comentário explicando
- **Toda lógica de negócio fica nas API Routes**, não nos componentes ou hooks
- **Toda mudança de status de pedido registra `OrderStatusHistory`**
- **Tipos de domínio são definidos em `src/lib/types.ts`** e importados pelo resto
- **Componentes de cliente usam `"use client"`** no topo do arquivo
- **Formulários têm `type="button"` explícito** para evitar submit acidental
- **Proxy (src/proxy.ts) exige restart do servidor após alteração** — hot reload não o recompila

---

## 6. Decisões Pendentes (A definir)

Antes de implementar os respectivos módulos, as seguintes decisões arquiteturais precisam ser tomadas:

| Módulo | Decisão pendente |
|--------|-----------------|
| Produtos | imageEmoji vs imageUrl — usar campo imageUrl com upload, ou manter emoji temporário? |
| Pedidos | Snapshot de costPrice no momento da produção (para CMV exato)? |
| Produção | Consumo de estoque em qual evento: criação do pedido, EM_PRODUCAO, ou ENTREGUE? |
| Financeiro | Estrutura de contas (conta bancária, categoria de despesa)? |
| Auth | OTP via WhatsApp (Z-API/Evolution API) — qual provedor? |
| Pagamento | PIX via Asaas ou Mercado Pago? |
| Multi-role | Proteção granular por rota ou por módulo? |

### Decisões já tomadas

| Módulo | Decisão | Data |
|--------|---------|------|
| **Embalagens** | Entidade própria `Packaging` (Opção B) — **não** usar `IngredientCategory "Embalagem"`. Embalagens têm cadastro, estoque, fornecedores e custos independentes. Impacto: novos modelos `Packaging` e `PackagingItem`/`ProductPackaging` no schema. | 30/06/2026 |
| **[ADR-014] Embalagens — vínculo com Product, não Recipe** | `Packaging` relaciona-se a `Product` via `ProductPackaging` (mirror de `ProductRecipe`), **não** a `Recipe`. Supera a frase acima ("Recipe referenciará RecipeIngredient e PackagingItem em linhas separadas"), que nunca foi implementada — o Módulo 2.I (Receitas) já foi encerrado sem essa relação. Detalhamento completo em `MODULE_2H_PLANNING.md` Seções 0, 1.5, 2. Ver `CLAUDE.md`, tabela "Decisões arquiteturais tomadas". | 20/07/2026 |

---

## 7. Perguntas do Arquiteto — Respostas

### 1. A arquitetura atual suporta o crescimento para ERP completo sem refatorações estruturais?

Sim, com ressalvas. O schema Prisma está bem modelado para as fases futuras (receitas, ingredientes, histórico de preços, movimentações financeiras estão planejados mas ausentes). A estrutura de API Routes é extensível. O maior risco não é estrutural, mas de acoplamento com mock data — especialmente `useCurrentUser` e `OCCASIONS`.

### 2. Quais são os 3 maiores riscos arquiteturais atuais?

(a) Identidade do cliente baseada em mock — toda vinculação de pedidos a clientes reais depende da implementação OTP, que ainda não tem backend. (b) Ausência de autorização por papel — qualquer usuário autenticado vê tudo no /admin/*. (c) Tipos TypeScript desacoplados do schema Prisma — o mapeamento manual em serviços usa `any` e pode divergir silenciosamente.

### 3. O padrão de snapshot em OrderItem é adequado a longo prazo?

Sim. O snapshot (productName, unitPrice, totalPrice no momento do pedido) é uma decisão arquitetural correta e imutável por design. O único gap é que `costPrice` do produto no momento da produção não é armazenado — quando o módulo financeiro calcular CMV, usará o `costPrice` atual do produto, não o do momento da venda. Isso é uma lacuna a definir antes da Fase 7.

### 4. A escolha de CartContext (sem Redux/Zustand) escala para o ERP completo?

Para o domínio do cliente (vitrine, checkout), sim — o carrinho é estado local de curta duração. Para o domínio admin (produção, financeiro), o Context API não deve ser estendido. Cada módulo admin deve buscar seus dados diretamente das API Routes, sem estado global compartilhado.

### 5. O schema Prisma precisa de mudanças antes da Fase 2?

Sim, três ajustes a considerar antes de iniciar a Fase 2: (a) Adicionar entidade `Embalagem` se for incluída no custo do produto — a decisão precisa ser tomada antes de implementar Receitas. (b) Considerar campo `slug` em `Product` para URLs amigáveis no futuro. (c) Adicionar índice em `Order.orderNumber` se buscas por número de pedido forem frequentes (atualmente só há índice em customerId e deliveryDate/status).

### 6. A convenção proxy.ts (Next.js 16) é estável para o longo prazo?

Incerta. O uso de `proxy.ts` em vez de `middleware.ts` é uma convenção do Next.js 16.2.9 com Turbopack. Futuras versões do Next.js podem retornar ao padrão `middleware.ts`. Documentar isso claramente em CLAUDE.md e monitorar changelogs do Next.js. O comportamento atual funciona, mas é um risco de manutenção.

### 7. Como garantir consistência entre tipos TypeScript e schema Prisma à medida que o ERP cresce?

O gap atual (imageEmoji vs imageUrl, paymentStatus ausente em Order) precisa de uma estratégia. Duas opções: (a) Gerar tipos TypeScript diretamente do Prisma Client e usá-los nas interfaces (mais acoplado, mas elimina divergência); (b) Manter os tipos em types.ts como contrato explícito do domínio front-end, e documentar os pontos de divergência. Recomendado: criar um processo de revisão onde a cada mudança no schema.prisma, types.ts é atualizado na mesma sessão.

### 8. Quais módulos podem ser implementados em paralelo sem conflito?

As seguintes duplas podem ser desenvolvidas em paralelo sem interdependência: (a) CRUD de Produtos + Auth OTP cliente; (b) CRUD de Ingredientes + Módulo de Clientes; (c) Módulo de Receitas + Dashboard de Produção real. O que NUNCA deve ser paralelo: dois módulos que modificam o mesmo schema Prisma simultaneamente (Receitas e Precificação devem ser sequenciais porque Precificação depende de Receitas).
