# REVIEW.md — Auditoria Técnica: Doce Menina

Auditoria completa do código-fonte. Nenhuma alteração foi feita — apenas diagnóstico.

---

## 1. Código duplicado

### 1.1 Estrutura do header repetida em 3 arquivos

**Arquivos:**
- `src/components/layout/Header.tsx` linha 10
- `src/app/admin/producao/page.tsx` linha 20
- `src/app/admin/page.tsx` linha 17

**Problema:** A mesma string de classes Tailwind do header está copiada:
```
"sticky top-0 z-10 flex items-center justify-between border-b border-sand bg-white px-5 py-4"
```
O `admin/page.tsx` tem variação (`justify-between` ausente) gerando inconsistência visual.

**Impacto:** Mudanças de layout exigem atualização em 3 lugares. Já existe inconsistência.

**Solução:** Usar `<HeaderMinimal>` ou `<Header>` de `src/components/layout/Header.tsx` em vez de replicar a estrutura inline.

---

### 1.2 Controles de quantidade (+/−) duplicados

**Arquivos:**
- `src/components/vitrine/ProductCard.tsx` linhas 28–51
- `src/components/layout/CartDrawer.tsx` linhas 43–65

**Problema:** JSX quase idêntico repetido:
```tsx
<div className="flex items-center gap-1 rounded-lg bg-sand p-1">
  <button className="flex h-8 w-8 items-center justify-center rounded-md bg-white font-bold">−</button>
  <span className="min-w-[24px] text-center text-sm font-semibold">{quantity}</span>
  <button className="flex h-8 w-8 items-center justify-center rounded-md bg-white font-bold">+</button>
</div>
```

Além da duplicação, já existe uma **divergência de comportamento**: `ProductCard` tem `disabled={quantity === 0}` no botão de diminuir; `CartDrawer` não tem — o que abre caminho para o bug de quantidade negativa descrito na seção de bugs.

**Impacto:** Qualquer melhoria de UX precisa ser aplicada nos dois lugares.

**Solução:** Extrair `src/components/ui/QuantitySelector.tsx` com props `value`, `onChange`, `min?`.

---

### 1.3 Layout-wrapper de página repetido

**Arquivos:**
- `src/app/checkout/page.tsx` linhas 58–62
- `src/app/pedidos/page.tsx` linha 34
- `src/app/login/page.tsx` linha 12

**Problema:** Todas as pages secundárias repetem o mesmo wrapper:
```tsx
<div className="mx-auto min-h-screen max-w-app bg-cream">
  <HeaderMinimal title="..." />
  <div className="px-5 py-4">
```

**Impacto:** Mudança de padding ou cor de fundo exige editar múltiplos arquivos.

**Solução:** Criar `src/components/layout/PageShell.tsx` que encapsula esse padrão.

---

### 1.4 Estilo de card repetido em 5 lugares

**Arquivos:**
- `src/app/pedidos/page.tsx` linha 46: `"shadow-card mb-3 rounded-2xl bg-white p-4"`
- `src/app/admin/producao/page.tsx` linhas 69, 104
- `src/app/admin/page.tsx` linha 29
- `src/components/vitrine/ProductCard.tsx` linha 16: `"overflow-hidden rounded-2xl bg-white shadow-card"`

**Problema:** A classe `.shadow-card` já existe em `globals.css`, mas a composição completa do card (`rounded-2xl bg-white shadow-card`) está hardcoded em cada uso.

**Solução:** Adicionar `.card` em `globals.css`:
```css
.card { @apply rounded-2xl bg-white shadow-card; }
```

---

### 1.5 Formatação de data repetida

**Arquivos:**
- `src/app/pedidos/page.tsx` linha 53
- `src/app/admin/producao/page.tsx` linha 28

**Problema:** Lógica de formatação de data duplicada com `toLocaleDateString("pt-BR", {...})`.

**Solução:** Extrair para `src/lib/utils.ts` como `formatDate(dateString)`.

---

## 2. Componentes duplicados

### 2.1 `Toast` exportado a partir do CartDrawer

**Arquivo:** `src/components/layout/CartDrawer.tsx` linhas 122–131

**Problema:** O componente `Toast` está exportado a partir de `CartDrawer.tsx`, mas é semanticamente independente do carrinho. É uma notificação global.

**Impacto:** Qualquer rota que queira exibir toast precisa importar de `CartDrawer`.

**Solução:** Mover para `src/components/ui/Toast.tsx`.

---

### 2.2 `Field` e `Row` definidos dentro de checkout/page.tsx

**Arquivo:** `src/app/checkout/page.tsx` linhas 255–289

**Problema:** Dois componentes reutilizáveis estão declarados no mesmo arquivo da página:
```tsx
function Field({ label, children }) { ... }   // linhas 255–268
function Row({ label, value, muted, bold }) { ... }  // linhas 270–289
```

`Field` é um campo de formulário genérico. `Row` é um item de resumo de preço. Ambos poderiam ser reutilizados no módulo admin, em detalhes de pedido, etc.

**Impacto:** Não descobríveis; não reutilizáveis.

**Solução:** Mover para `src/components/form/FormField.tsx` e `src/components/ui/PriceRow.tsx`.

---

## 3. Código morto e funções não utilizadas

### ~~3.1 Estado da tela de checkout nunca é submetido~~ ✅ CORRIGIDO

**Arquivo:** `src/app/checkout/page.tsx`

**Correção aplicada:** `handleConfirm` agora chama `createOrder` de `src/services/orderService.ts`, passando todos os campos do formulário. Inclui `isSubmitting` para proteger duplo clique, tratamento de erro com feedback visual, e exibe o `orderNumber` retornado pela API na tela de confirmação.

---

### ~~3.2 Estado do OTP nunca é submetido~~ ✅ RESOLVIDO

**Arquivo:** `src/app/login/page.tsx`

**Correção aplicada (Sprint A2):** O login do cliente foi reescrito. Fluxo em 2 passos: telefone (com validação de DDD) → nome → `signIn("customer", { phone, name, redirect: false })`. O estado `otp` morto foi removido. O login cria ou recupera o `Customer` real no banco via upsert no provider NextAuth. A tela redireciona para `callbackUrl` ou `/pedidos` após autenticação.

---

### ~~3.3 Links mortos no hub administrativo~~ ✅ CORRIGIDO

**Arquivo:** `src/app/admin/page.tsx`

**Correção aplicada:** Os 7 módulos não implementados agora apontam para `/admin/em-construcao?modulo=NomeDoModulo`. A página `/admin/em-construcao` lê o parâmetro via `useSearchParams` e exibe um placeholder com título correto e badge "em breve". O card de Produção mantém `ready: true` e link direto.

---

## 4. Bugs potenciais

### 4.1 ~~Botão `−` sem `disabled` no CartDrawer~~ ✅ CORRIGIDO

**Arquivo:** `src/components/layout/CartDrawer.tsx`

**Correção aplicada:** Quando `item.quantity === 1`, o botão exibe 🗑 e o `aria-label` muda para "Remover item", sinalizando ao usuário que o próximo clique elimina o item do carrinho. O comportamento interno permanece idêntico (`updateQuantity(productId, 0)` → `CartContext` remove o item).

---

### ~~4.2 Bug de timezone na exibição de data~~ ✅ CORRIGIDO

**Arquivo:** `src/lib/utils.ts`

**Correção aplicada:** Criada `formatDate(dateString)` em `src/lib/utils.ts`. A função concatena `T12:00:00` (meio-dia local) para evitar que datas UTC `00:00:00Z` sejam interpretadas como o dia anterior em UTC-3. O motivo está documentado no comentário inline. Todos os usos de `toLocaleDateString` inline foram substituídos por esta função.

---

### ~~4.3 Badge de status sem estilo para todos os valores do enum~~ ✅ CORRIGIDO

**Arquivo:** `src/app/pedidos/page.tsx`

**Correção aplicada:** `STATUS_CLASS` agora mapeia todos os 7 valores de `OrderStatus`: `RASCUNHO` (bg-sand/muted), `CONFIRMADO` (rose), `EM_PRODUCAO` (amber), `PRONTO` (sage), `SAIU_ENTREGA` (blue), `ENTREGUE` (sand/muted), `CANCELADO` (red). O fallback `?? "bg-sand"` permanece como segurança para valores futuros.

---

### ~~4.4 `loadFromOrder` descarta produtos sem aviso~~ ✅ CORRIGIDO

**Arquivo:** `src/context/CartContext.tsx` + `src/app/pedidos/page.tsx`

**Correção aplicada:** `loadFromOrder` foi refatorado para receber `CartItem[]` prontos (desacoplado de `PRODUCTS`). A lógica de resolução de produtos moveu para `handleRepeat` em `pedidos/page.tsx`, que acumula nomes dos itens não encontrados e exibe `alert()` de aviso antes de redirecionar. `CartContext` não importa mais nada de `mock-data`.

---

### ~~4.5 Checkout sem proteção de duplo clique~~ ✅ CORRIGIDO

**Arquivo:** `src/app/checkout/page.tsx`

**Correção aplicada:** Estado `isSubmitting` adicionado. Botão tem `disabled={isSubmitting}` e classe `disabled:opacity-60`. Label muda para "Confirmando…" durante o submit. Guard `if (isSubmitting) return` no início do handler evita chamadas duplicadas mesmo sem o `disabled`.

---

### ~~4.6 `getMinDeliveryDate` não considera finais de semana~~ ✅ CORRIGIDO

**Arquivo:** `src/lib/utils.ts`

**Correção aplicada:** `getMinDeliveryDate` foi movida para `utils.ts` e agora avança a data para segunda-feira se o resultado cair em sábado (`day === 6`, +2 dias) ou domingo (`day === 0`, +1 dia). A lógica está documentada com comentário inline.

---

## 5. Problemas de arquitetura

### ~~5.1 `CartContext` acoplado diretamente ao mock-data~~ ✅ CORRIGIDO

**Arquivo:** `src/context/CartContext.tsx`

**Correção aplicada:** `loadFromOrder` agora recebe `CartItem[]` prontos como argumento. O import de `PRODUCTS` foi removido do contexto. A resolução de produtos ficou no chamador (`handleRepeat` em `pedidos/page.tsx`), que também avisa sobre itens indisponíveis.

---

### ~~5.2 Ausência total de camada de serviços~~ ✅ CORRIGIDO

**Arquivos:** `src/services/`

**Correção aplicada:** Criada camada `src/services/` com dois módulos:
- `orderService.ts` — `createOrder`, `getOrdersByPhone`, `updateOrderStatus`
- `productService.ts` — `getProducts`

Cada função encapsula `fetch` + tratamento de erro + normalização de tipos. Componentes e hooks consomem serviços; nunca chamam `fetch` diretamente.

---

### 5.3 Ausência de Error Boundaries

**Arquivos:** Todas as páginas e `src/app/layout.tsx`

**Problema:** Nenhum Error Boundary no projeto. Se qualquer componente lançar uma exceção durante renderização, a página inteira quebra com tela em branco.

**Impacto:** Fragilidade total em produção.

**Solução:** Criar `src/components/ErrorBoundary.tsx` (class component — obrigatório para Error Boundaries em React) e envolver pelo menos o `layout.tsx`.

---

### 5.4 Ausência de loading states e empty states

**Arquivos:** `src/app/pedidos/page.tsx`, `src/app/admin/producao/page.tsx`

**Problema:** Nenhuma página tem estado de carregamento (skeleton/spinner) ou estado vazio com UI adequada. Quando o backend for integrado, as telas ficarão em branco durante o fetch.

**Impacto:** UX pobre; regressão visual garantida ao conectar ao backend.

---

### ~~5.5 Validação de variáveis de ambiente ausente~~ ✅ CORRIGIDO

**Arquivo:** `src/lib/env.ts`

**Correção aplicada:** Criado `src/lib/env.ts` que valida `DATABASE_URL`, `NEXTAUTH_SECRET` e `NEXTAUTH_URL` na inicialização, lançando `Error` descritivo com instrução para copiar `.env.example` caso alguma variável esteja ausente.

---

## 6. Problemas de organização

### 6.1 Funções utilitárias dentro de `mock-data.ts`

**Arquivo:** `src/lib/mock-data.ts` linhas 202–215

**Problema:** Três funções utilitárias estão no arquivo de dados mockados:
- `formatCurrency(value)` — formatação de moeda; genérica, sem dependência de dados
- `getMaxLeadTimeDays(productIds)` — usa `PRODUCTS` (acoplado ao mock)
- `getMinDeliveryDate(leadTimeDays)` — cálculo de data; genérica, sem dependência de dados

**Impacto:** Componentes importam utilitários de um arquivo chamado "mock-data" — confuso e semanticamente errado.

**Solução:** Mover `formatCurrency` e `getMinDeliveryDate` para `src/lib/utils.ts`. `getMaxLeadTimeDays` deve migrar quando o backend for implementado.

---

### 6.2 `STATUS_CLASS` definido dentro de uma página

**Arquivo:** `src/app/pedidos/page.tsx` linhas 10–15

**Problema:** A constante de estilos de status é específica de UI mas relacionada ao domínio `OrderStatus`. Será necessária também no dashboard de produção e em detalhes de pedido.

**Solução:** Mover para `src/lib/types.ts` junto com `STATUS_LABELS`, ou para `src/lib/statusStyles.ts`.

---

### 6.3 Ausência de diretórios estruturais esperados

**Problema:** O projeto não tem:
- `src/hooks/` — hooks customizados (`useDeliveryCalculations`, `useCurrentUser`, etc.)
- `src/services/` — camada de serviços para comunicação com API
- `src/constants/` — constantes globais (taxas de entrega, limites de arquivo, etc.)
- `src/app/api/` — API Routes do Next.js (backend)

**Impacto:** Sem estrutura clara, novos arquivos tendem a acumular em `src/lib/`, misturando tipos, dados, utilitários e lógica de negócio.

---

### 6.4 Valores hardcoded de entrega dentro de componente de página

**Arquivo:** `src/app/checkout/page.tsx` linhas 16–24

**Problema:**
```tsx
const DELIVERY_OPTIONS = [
  { type: "RETIRADA", fee: 0 },
  { type: "ENTREGA_GRATIS", fee: 0, distanceKm: 1.8 },
  { type: "ENTREGA_APP", fee: 18 },  // R$ 18 hardcoded
];
```

A taxa de entrega (`18`) e a distância mockada (`1.8`) estão embutidas no componente. Esses valores deveriam vir de `StoreConfig` no banco (que já tem `freeDeliveryRadiusKm`).

**Impacto:** Qualquer mudança de preço exige alteração de código.

---

## 7. Oportunidades de refatoração

### 7.1 `checkout/page.tsx` tem 9 responsabilidades em 290 linhas

**Arquivo:** `src/app/checkout/page.tsx`

**Responsabilidades atuais:**
1. Seleção de data de entrega
2. Seleção de tipo de entrega e cálculo de taxa
3. Coleta de endereço e destinatário
4. Observações gerais
5. Observações por item
6. Upload de fotos (placeholder)
7. Seleção de método de pagamento
8. Resumo de preços
9. Submissão e tela de confirmação

**Refatoração sugerida:**
```
src/components/checkout/
  DeliverySection.tsx     (data + tipo de entrega)
  AddressSection.tsx      (endereço + destinatário)
  ItemsSection.tsx        (itens + observações por item)
  PaymentSection.tsx      (método de pagamento)
  OrderSummary.tsx        (subtotal + taxa + total)
  OrderConfirmed.tsx      (tela de sucesso)
```

O `checkout/page.tsx` passaria a ser um orchestrador de ~50 linhas.

---

### 7.2 Padrão de seleção de opções (option card) repetido

**Arquivo:** `src/app/checkout/page.tsx` linhas 113–132 e 206–220

**Problema:** O mesmo padrão de botões de seleção com `.option-card.selected` aparece duas vezes no checkout (entrega e pagamento) e reaparecerá em outros módulos.

**Solução:** Criar `src/components/form/OptionGroup.tsx`:
```tsx
<OptionGroup
  options={[{ value: "RETIRADA", label: "Retirada na loja", description: "Sem custo" }, ...]}
  value={deliveryType}
  onChange={setDeliveryType}
/>
```

---

### 7.3 Hooks `useCurrentUser` e `useUserOrders`

**Arquivos:** `src/app/pedidos/page.tsx`, `src/app/checkout/page.tsx`

**Problema:** Ambos os arquivos importam `MOCK_CUSTOMER` e `MOCK_ORDERS` diretamente. Quando o backend for integrado, esses imports precisarão ser substituídos em cada arquivo.

**Solução:**
- `src/hooks/useCurrentUser.ts` — retorna `Customer` (mock ou real via API)
- `src/hooks/useUserOrders.ts` — retorna `Order[]` com loading/error

---

### 7.4 Botão primário sem classe utilitária compartilhada

**Arquivos:** `checkout/page.tsx`, `pedidos/page.tsx` e outros

**Problema:** O botão principal (`bg-chocolate py-4 font-semibold text-white rounded-xl`) e o botão secundário (`border-2 border-sand py-3`) aparecem repetidos sem uma classe reutilizável.

**Solução:** Adicionar em `globals.css`:
```css
.btn-primary   { @apply w-full rounded-xl bg-chocolate py-4 font-semibold text-white; }
.btn-secondary { @apply w-full rounded-xl border-2 border-sand py-3 font-semibold text-chocolate; }
```

---

### 7.5 Dados mockados do Kanban dentro do componente de produção

**Arquivo:** `src/app/admin/producao/page.tsx` linhas 8–13

**Problema:** Arrays `TABS` e `KANBAN` com dados hardcoded vivem dentro do arquivo do componente.

**Solução imediata:** Extrair para `src/lib/admin/mockData.ts` para que o componente fique sem dados embutidos — e a substituição por dados reais fique isolada em um único lugar.

---

## 8. Dependências ausentes

| Dependência | Uso esperado | Prioridade | Status |
|-------------|-------------|-----------|--------|
| `next-auth` + `bcryptjs` | Auth da equipe interna | Alta | ✅ Adicionadas no Sprint 0 |
| `react-hook-form` + `zod` | Validação de formulários (checkout, login) | Alta | Sprint 1 |
| `@tanstack/react-query` ou `swr` | Cache de estado de servidor | Alta | Sprint 1 |
| `date-fns` | Manipulação de datas sem bugs de timezone | Média | Sprint 1 |
| `next-pwa` | Service worker para PWA | Baixa | P3.6 |
| `vitest` + `@testing-library/react` | Testes unitários | Média | A definir |

---

## Resumo executivo

### Status por categoria — Sprint 0

| Categoria | Itens | Corrigidos | Pendentes |
|-----------|:-----:|:----------:|:---------:|
| Código morto / não submetido | 3 | 2 ✅ | 1 (OTP — aguarda P1.2) |
| Bugs potenciais | 6 | **6 ✅** | 0 |
| Problemas de arquitetura | 5 | **5 ✅** | 0 |
| Código duplicado | 5 | 0 | 5 (dívida técnica, sem impacto funcional) |
| Componentes duplicados | 2 | 0 | 2 (dívida técnica) |
| Problemas de organização | 4 | 0 | 4 (dívida técnica) |
| Oportunidades de refatoração | 5 | 0 | 5 (dívida técnica) |

---

### ✅ Sprint 0 — Concluído em 28/06/2026

**Todos os bugs críticos e problemas de arquitetura foram corrigidos.** O projeto compila sem erros de TypeScript, passa no ESLint, e o build de produção gera 14 rotas corretamente.

#### O que foi entregue

| Entrega | Descrição |
|---------|-----------|
| Utilitários | `utils.ts` com `formatCurrency`, `formatDate` (timezone fix), `getMinDeliveryDate` (skip fim de semana) |
| Env validation | `env.ts` valida variáveis obrigatórias no startup |
| Serviços | `src/services/` com `orderService.ts` e `productService.ts` |
| Hooks | `useCurrentUser`, `useUserOrders` (com loading/error/refetch) |
| API Routes | `GET /api/products`, `GET /api/orders`, `POST /api/orders`, `PATCH /api/orders/[id]/status` |
| Auth admin | NextAuth CredentialsProvider + bcrypt, `/admin/login`, middleware, `next-auth.d.ts` |
| UI fixes | Admin hub com links reais, badge de status completo, indicador de remoção no CartDrawer |
| Checkout | Submit real via `createOrder`, `isSubmitting`, feedback de erro, número do pedido confirmado |
| Pedidos | Loading skeleton, empty state, error state, aviso de itens indisponíveis |

#### Pendente para Sprint 1 (não é bloqueio)

- **Bug 3.2 (OTP):** Login de cliente sem backend — aguarda P1.2 (auth OTP via WhatsApp)
- **Dívida técnica (seções 1, 2, 6, 7):** Código duplicado, refatorações de componentes — não impactam funcionalidade
- **Error Boundary (5.3):** Sem impacto no MVP; recomendado antes da produção
- **`npm run db:generate` pós-install:** Necessário ao clonar/mover o projeto — adicionar ao README

---

### ✅ Sprint 0.5 — Infraestrutura — Concluído em 29/06/2026

Aplicação totalmente operacional com banco de dados real e autenticação funcional.

#### O que foi entregue

| Entrega | Descrição |
|---------|-----------|
| Banco de dados | Supabase PostgreSQL conectado via porta 5432; schema sincronizado com `prisma db push` |
| Seed | 8 produtos, 3 categorias, 7 ocasiões, 1 admin, 1 StoreConfig |
| Auth admin | NextAuth CredentialsProvider + bcrypt; login em `/admin/login` funcionando |
| Proxy | `src/proxy.ts` (Next.js 16 convention) com `getToken` para proteção de `/admin/*` |
| Validação | 14 rotas OK no build; API retorna dados reais do Supabase |

#### Problemas encontrados e resolvidos nesta sprint

| ID | Problema | Resolução |
|----|----------|-----------|
| I01 | Next.js 16 renomeou `middleware.ts` para `proxy.ts` | Arquivo `src/proxy.ts` + `export async function proxy(...)` + restart do servidor |
| I02 | `&` na senha quebrava `DATABASE_URL` | URL-encode `&` → `%26` |
| I03 | `getToken` retornava `null` no Edge runtime sem `secret` | Passar `secret: process.env.NEXTAUTH_SECRET` explicitamente |
| I04 | `tx` implicitly `any` no Prisma transaction | `import { Prisma }` + tipo `Prisma.TransactionClient` |
| I05 | ESLint `react-hooks/set-state-in-effect` em 2 arquivos | Disable comentado com justificativa; fix em `useUserOrders.ts` |

---

### ✅ Sprint 0.6 — Correções Críticas — Concluído em 29/06/2026

#### O que foi entregue

| Entrega | Descrição |
|---------|-----------|
| Persistência de pedidos | `POST /api/orders` cria Customer + Address + Order + OrderItems + StatusHistory em uma transação |
| Endereços reais | Checkout coleta campos de endereço (rua, número, bairro, CEP); API cria registro `Address` no banco |
| RETIRADA sem endereço | `addressId: null` quando deliveryType = RETIRADA — sem FK constraint |
| `/pedidos` com dados reais | Remove `MOCK_ORDERS`; usa `useUserOrders(customer.phone)` que chama `GET /api/orders?phone=` |
| `handleRepeat` sem mock | Reconstrói `CartItem` a partir do snapshot do pedido — sem dependência de `PRODUCTS` mock |
| Checkout sem mock addressId | Remove select de endereços mockados; remove `getMaxLeadTimeDays` (agora usa `items.map(i => i.product.leadTimeDays)`) |

#### Decisão arquitetural: endereços

O `Address` é sempre criado como entidade de primeira classe no banco, na mesma transação do pedido. Isso é compatível com a arquitetura definitiva:
- Quando o módulo de Clientes (P2.4) for implementado, os endereços já existirão no banco e poderão ser listados/gerenciados
- O checkout, após auth do cliente existir, adicionará a opção "selecionar endereço salvo" — estamos construindo o caminho de "novo endereço"
- Zero alterações no schema; `DeliveryAddressInput` adicionado em `types.ts`

#### Validação

| Cenário | Resultado |
|---------|-----------|
| `POST /api/orders` (ENTREGA_GRATIS com endereço) | ✅ 201, `addressId` = CUID real |
| `POST /api/orders` (RETIRADA sem endereço) | ✅ 201, `addressId` = null |
| `GET /api/orders?phone=` | ✅ 200, retorna os 2 pedidos criados |
| `npm run build` | ✅ 14 rotas, 0 erros TypeScript, 0 erros ESLint |

---

#### Pendências conhecidas (não são bloqueios para Sprint 1)

| ID | Descrição | Impacto | KI ref |
|----|-----------|---------|--------|
| ~~PEN-01~~ | ~~Checkout não persiste pedido no banco~~ | ✅ Resolvido Sprint 0.6 | — |
| ~~PEN-02~~ | ~~`/pedidos` usa `MOCK_ORDERS`~~ | ✅ Resolvido Sprint 0.6 | — |
| PEN-03 | `/admin/producao` usa dados hardcoded | Médio | KI-04 |
| PEN-04 | Auth OTP do cliente sem backend | Médio | KI-05 |
| PEN-05 | Produtos no banco têm `imageUrl: null` — vitrine usa `imageEmoji` do tipo TS | Baixo | KI-06 |

---

### ✅ Sprint 1.1 + 1.2 — Módulo Configuração da Empresa — Concluído em 30/06/2026

#### Arquitetura implementada

```
Route (/api/config) → Service (storeConfigService) → Validator (validators/storeConfig)
                                                    → Repository (storeConfigRepository)
                                                    → Repository (themeConfigRepository)
                                                    → Prisma singleton
```

#### MT-1 — Migration do schema ✅

**Arquivos alterados:** `prisma/schema.prisma`

| Mudança | Detalhe |
|---------|---------|
| `enum PixKeyType` (novo) | `CPF \| CNPJ \| EMAIL \| TELEFONE \| ALEATORIA` |
| `legalName String?` | Razão social — NFe/DRE (Fase 7) |
| `cnpj String?` | 14 dígitos — integrações fiscais (Fase 7) |
| `instagram String?` | Handle de redes sociais |
| `addressComplement String?` | Complemento ausente vs. `Address.complement` |
| `ibgeCode String?` | Código IBGE — NFe (Fase 7) |
| `pixKeyType PixKeyType?` | Enum (não String) — alteração arquitetural #1 |
| `pixKey String?` | Chave PIX literal |
| `ThemeConfig.faviconUrl String?` (Sprint 1.2) | URL do favicon no Supabase Storage |

**Validação:** `GET /api/config` → 200, todos os campos presentes no JSON.

#### Sprint 1.2 — Camadas restantes ✅

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/validators/storeConfig.ts` | `validateStoreConfig(): ValidationError[]` — 11 regras, zero dependências externas |
| `src/lib/repositories/storeConfigRepository.ts` | findFirst / update / create via Prisma singleton |
| `src/lib/repositories/themeConfigRepository.ts` | `$executeRaw`/`$queryRaw` (faviconUrl não regenerado ainda) |
| `src/lib/storeConfigService.ts` | Auth admin, validação, upsert singleton, Decimal→number |
| `src/app/api/config/route.ts` | GET (merged StoreConfig+ThemeConfig) + PATCH thin |
| `src/app/api/admin/upload/route.ts` | Upload para Supabase Storage; validação de tipo/tamanho |
| `src/app/admin/config/page.tsx` | 6 seções, máscaras, ViaCEP, preview PIX, upload, toasts, skeleton |
| `src/proxy.ts` | `"/admin/config": ["ADMIN"]` adicionado |
| `src/app/admin/page.tsx` | Card Configurações ⚙️ adicionado |
| `.env.example` | `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` documentados |

**Nota técnica:** `themeConfigRepository` usa raw SQL enquanto `db:generate` não for re-executado com `faviconUrl`. Após stop/generate/restart, pode ser migrado para o client tipado.

**TypeScript:** `npx tsc --noEmit` → 0 erros.

---

### ✅ Sprint A2 — Consolidação da Arquitetura — Concluído em 29/06/2026

Sprint de eliminação de dívidas técnicas. Sem novos módulos de negócio.

#### O que foi entregue

| Entrega | Descrição |
|---------|-----------|
| Auth cliente real | Provider NextAuth `"customer"` faz upsert de `Customer` no banco; sessão JWT com phone + userType |
| `Providers.tsx` | Wrapper client para `SessionProvider` + `CartProvider` no layout raiz |
| `useCurrentUser` real | Lê `useSession()`, retorna `Customer \| null`, sem mock |
| Login cliente funcional | `/login` chama `signIn("customer")` com redirect; OTP fica para Fase 8 |
| Proxy bloqueando clientes | `token.userType === "admin"` impede clientes de acessar `/admin/*` |
| Validação de endereço | Checkout valida campos obrigatórios antes de criar pedido |
| `GET /api/config` | Retorna StoreConfig do banco (novo endpoint) |
| `GET /api/occasions` | Retorna OccasionTag do banco (novo endpoint) |
| Ocasiões da API | Vitrine busca ocasiões do banco via fetch; fallback para mock em erro |
| Categorias dinâmicas | Agrupamento por `categoryName` derivado dos produtos reais |
| `imageUrl` no tipo | `Product.imageUrl?: string` alinhado com schema Prisma; mapeado no serviço |
| `paymentStatus` no tipo | `PaymentStatus` type + campo `paymentStatus?` na interface `Order` |
| Tipos `any` removidos | Interfaces `RawProduct`, `RawOrder` etc. nos serviços |

#### Problemas resolvidos (de 16 identificados na A1)

| ID | Criticidade | Resolvido? |
|----|------------|-----------|
| KI-01 | Crítico | ✅ |
| KI-02 | Crítico | ✅ (coberto por KI-01) |
| KI-03 | Alto | ❌ BLOQUEADO (API externa) |
| KI-04 | Alto | ❌ ADIADO (Sprint 1) |
| KI-05 | Alto | 🟡 Parcial (sem OTP) |
| KI-06 | Médio | ✅ |
| KI-07 | Médio | ✅ |
| KI-08 | Médio | 🟡 Parcial (mapa de roles vazio) |
| KI-09 | Médio | ✅ |
| KI-10 | Baixo | ❌ ADIADO (módulo Clientes) |
| KI-11 | Baixo | ✅ |
| KI-12 | Baixo | ✅ |
| KI-13 | Baixo | ✅ |
| KI-14 | Baixo | ✅ |
| KI-15 | Baixo | ❌ Aguardando regra de negócio |
| KI-16 | Baixo | ❌ ADIADO (Fase 3) |

#### Pendências para Sprint 1

| ID | Descrição |
|----|-----------|
| KI-03 | WhatsApp + PIX — requer API externa |
| KI-04 | `/admin/producao` com dados reais (Kanban + filtros) |
| KI-08 | Preencher `ROLE_REQUIRED` quando módulos financeiros forem implementados |
| KI-10 | Deduplicação de Address — módulo Clientes |

---

### ✅ Sprint A1 — Revisão Arquitetural — Concluído em 29/06/2026

Sprint de análise e documentação. Nenhum código alterado.

#### O que foi produzido

| Arquivo | Conteúdo |
|---------|----------|
| `ARCHITECTURE.md` (novo) | Arquitetura em camadas, decisões, 7 pontos fortes, 10 de melhoria, 7 riscos, convenções |
| `DOMAIN_MODEL.md` (novo) | 26+ entidades com propósito/status/regras, diagrama de relacionamentos, fluxos de jornada |
| `MODULES.md` (novo) | Mapa de módulos por fase (Fase 1–10), símbolos de status, dívida técnica TD-01 a TD-15 |
| `CHANGELOG.md` (novo) | Histórico cronológico de sprints Sprint 0 → A1 |
| `KNOWN_ISSUES.md` (novo) | 16 problemas registrados KI-01 a KI-16 com prioridade, arquivos e resolução |
| `PLAN.md` (atualizado) | Sprints 0.6 e A1 adicionados; tabela de documentação de arquitetura; PEN-01 e PEN-02 marcados ✅ |
| `REVIEW.md` (este arquivo) | Pendências PEN-03/04/05 com referências KI; Sprint A1 adicionada |
| `CLAUDE.md` (atualizado) | Status, estrutura de pastas e seção de documentação de arquitetura |

#### 16 problemas identificados e catalogados

| ID | Prioridade | Arquivo principal |
|----|-----------|-----------------|
| KI-01 | Alta — useCurrentUser retorna mock | src/hooks/useCurrentUser.ts |
| KI-02 | Alta — MOCK_CUSTOMER no checkout | src/app/checkout/page.tsx |
| KI-03 | Alta — WhatsApp e PIX ausentes | — |
| KI-04 | Alta — /admin/producao 100% mock | src/app/admin/producao/page.tsx |
| KI-05 | Alta — Auth OTP sem backend | src/app/login/page.tsx |
| KI-06 | Média — imageEmoji vs imageUrl | src/lib/types.ts, src/services/productService.ts |
| KI-07 | Média — StoreConfig nunca lida | src/app/api/* |
| KI-08 | Média — Autorização por papel ausente | src/proxy.ts |
| KI-09 | Média — Checkout sem validação de endereço | src/app/checkout/page.tsx |
| KI-10 | Baixa — Address acumula sem deduplicação | src/app/api/orders/route.ts |
| KI-11 | Baixa — `any` em serviços | src/services/*.ts |
| KI-12 | Baixa — paymentStatus ausente no tipo Order | src/lib/types.ts |
| KI-13 | Baixa — OCCASIONS de mock-data | src/app/page.tsx |
| KI-14 | Baixa — CATEGORY_NAMES hardcoded | src/app/page.tsx |
| KI-15 | Baixa — getMinDeliveryDate ignora fins de semana | src/lib/utils.ts |
| KI-16 | Baixa — costPrice sempre 0 | prisma/seed.ts |

#### Próximas sprints recomendadas

1. **Sprint 1:** Conectar /admin/producao a dados reais (KI-04), validação do checkout (KI-09), GET /api/config (KI-07)
2. **Sprint 2:** Auth OTP do cliente (KI-05 / KI-01 / KI-02), CRUD de Produtos admin
3. **Sprint 3:** WhatsApp e PIX (KI-03), upload de imagens (KI-06)
