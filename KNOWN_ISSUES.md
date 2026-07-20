# KNOWN_ISSUES.md — Problemas Conhecidos

Registro de todos os problemas identificados, dívidas técnicas e pendências.
Produzido na Sprint A1 — Revisão Arquitetural (29/06/2026).
Atualizado na Sprint A2 — Consolidação da Arquitetura (29/06/2026).

---

## Problemas Críticos (bloqueiam uso real em produção)

### ✅ KI-01 — useCurrentUser retorna mock
**Status:** RESOLVIDO em Sprint A2
**Arquivo:** `src/hooks/useCurrentUser.ts`
**Descrição:** O hook retornava `MOCK_CUSTOMER` fixo. Todos os pedidos criados pelo checkout eram vinculados a um número fixo, independente do usuário real.
**Resolução:** O hook agora lê a sessão NextAuth via `useSession()`. Retorna `Customer | null`. Um provider `"customer"` foi adicionado ao NextAuth (`id: "customer"`) — aceita `phone + name`, faz upsert real do `Customer` no banco, e armazena phone e userType no JWT.
**Nota:** OTP via WhatsApp fica para Fase 8 — o ponto de extensão (na função `authorize`) está marcado com `TODO`.

### ✅ KI-02 — MOCK_CUSTOMER no checkout
**Status:** RESOLVIDO em Sprint A2 (coberto por KI-01)
**Arquivo:** `src/app/checkout/page.tsx`
**Resolução:** Removido `MOCK_CUSTOMER`. O checkout usa `useCurrentUser()` + `useSession()`. Se não autenticado: exibe tela de login. Se autenticado: preenche dados do destinatário a partir da sessão via `useEffect` + `useRef` (inicialização única).

### KI-03 — WhatsApp e PIX ausentes
**Status:** BLOQUEADO — requer integração com API externa (Fase 8)
**Descrição:** Nenhuma notificação WhatsApp é enviada após pedido criado, status atualizado ou produto pronto. Nenhuma integração PIX existe — o pagamento é apenas um campo enum no banco.
**Impacto:** Operação real do negócio não funciona sem notificações automáticas.
**Resolução:** Fase 8 (Integrações) — WhatsApp OTP + Notificações + PIX integrado.
**Prioridade:** Alta (para uso em produção)

---

## Problemas Altos (afetam funcionalidade em produção)

### KI-04 — producao 100% mock (PEN-03)
**Status:** ADIADO — Sprint 1 (criação de APIs de filtro é módulo novo)
**Arquivo:** `src/app/admin/producao/page.tsx`
**Descrição:** Stats, Kanban com pedidos fictícios, consolidação batch — tudo hardcoded. Nenhuma API é chamada.
**Impacto:** A equipe de produção não vê pedidos reais.
**Resolução:** Criar filtros na API de pedidos (`GET /api/orders?date=&status=`) e conectar à página. Kanban deve chamar `PATCH /api/orders/[id]/status` ao mover cards.
**Prioridade:** Alta

### ✅ KI-05 — Auth OTP sem backend (PEN-04)
**Status:** PARCIALMENTE RESOLVIDO em Sprint A2
**Arquivo:** `src/app/login/page.tsx`
**Resolução:** O login do cliente agora funciona: telefone + nome → `signIn("customer")` → `NextAuth.authorize` → upsert do `Customer` no banco → sessão JWT com phone e userType. O campo de OTP foi substituído pelo campo de nome (temporário). O fluxo de OTP via WhatsApp será adicionado na Fase 8 na função `authorize` do provider, sem alterar estrutura.
**Nota:** O estado `otp` morto da versão anterior foi removido.

---

## Problemas Médios (afetam qualidade ou bloqueiam módulos futuros)

### ✅ KI-06 — imageEmoji vs imageUrl (divergência de tipo)
**Status:** RESOLVIDO em Sprint A2
**Arquivos:** `src/lib/types.ts`, `src/services/productService.ts`
**Resolução:** `imageUrl?: string` adicionado à interface `Product` em `types.ts`. `productService.ts` mapeia `imageUrl: p.imageUrl ?? undefined`. O componente `ProductCard.tsx` mantém o emoji como fallback de exibição — quando upload de imagem (Supabase/S3) for implementado, `ProductCard` exibirá `<img src={imageUrl}>` com prioridade.

### ✅ KI-07 — StoreConfig nunca lida
**Status:** RESOLVIDO em Sprint A2
**Resolução:** Criado `GET /api/config` em `src/app/api/config/route.ts` — retorna o registro `StoreConfig` do banco. Os valores hardcoded no checkout (`distanceKm: 1.8`, taxa de entrega) permanecem temporariamente; a integração com `/api/config` está agendada para o módulo de Configurações.

### ✅ KI-08 — Autorização por papel ausente
**Status:** PARCIALMENTE RESOLVIDO em Sprint A2
**Arquivo:** `src/proxy.ts`
**Resolução:** O proxy agora verifica `token.userType === "admin"` — impede que clientes autenticados (userType: "customer") acessem rotas `/admin/*`. Um mapa `ROLE_REQUIRED` está preparado para adicionar restrições granulares por role quando os módulos sensíveis forem implementados.
**Pendência:** Nenhuma rota está restrita por role ainda (mapa vazio). Preencher ao implementar módulos de Financeiro e Configurações.

### ✅ KI-09 — Checkout sem validação de campos de endereço
**Status:** RESOLVIDO em Sprint A2
**Arquivo:** `src/app/checkout/page.tsx` função `handleConfirm`
**Resolução:** Antes de chamar `createOrder`, `handleConfirm` valida `street`, `addressNumber`, `neighborhood` e `zipCode` quando `deliveryType !== "RETIRADA"`. Exibe mensagem de erro inline se algum estiver vazio. Campos marcados com `*` no formulário.

### KI-10 — Address acumula sem deduplicação
**Status:** ADIADO — módulo Clientes (Fase 2)
**Arquivo:** `src/app/api/orders/route.ts`
**Descrição:** A cada pedido com entrega, um novo `Address` é criado com `label="Entrega"`. Um cliente recorrente acumula um Address por pedido.
**Resolução:** Deduplicar durante a implementação do módulo de Clientes.
**Prioridade:** Baixa

---

## Dívida Técnica (qualidade, não funcionalidade)

### ✅ KI-11 — Tipos `any` em serviços
**Status:** RESOLVIDO em Sprint A2
**Arquivos:** `src/services/productService.ts`, `src/services/orderService.ts`
**Resolução:** Interfaces tipadas definidas (`RawProduct`, `RawProductOccasion`, `RawOrder`, `RawOrderItem`) em cada serviço. Nenhum `any` explícito remanescente.

### ✅ KI-12 — paymentStatus ausente na interface Order
**Status:** RESOLVIDO em Sprint A2; valores corrigidos em Sprint 2.A.2
**Arquivo:** `src/lib/types.ts`
**Resolução:** Tipo `PaymentStatus` adicionado e campo `paymentStatus?: PaymentStatus` incluído na interface `Order`. `orderService.ts` mapeia `paymentStatus` da resposta da API. Valores corrigidos na Sprint 2.A.2 (KI-17): `"PENDENTE" | "PAGO" | "PARCIAL" | "ESTORNADO"`.

### ✅ KI-13 — OCCASIONS importadas de mock-data
**Status:** RESOLVIDO em Sprint A2
**Arquivo:** `src/app/page.tsx`
**Resolução:** Criado `GET /api/occasions` em `src/app/api/occasions/route.ts` — retorna `OccasionTag` do banco. A vitrine busca ocasiões da API no `useEffect`; `OCCASIONS_FALLBACK` (mock) permanece como estado inicial e fallback em caso de erro.

### ✅ KI-14 — CATEGORY_NAMES hardcoded na vitrine
**Status:** RESOLVIDO em Sprint A2
**Arquivo:** `src/app/page.tsx`
**Resolução:** Removido o array `CATEGORY_NAMES`. O agrupamento por categoria é gerado dinamicamente a partir da propriedade `categoryName` dos produtos retornados pela API, preservando a ordem de aparição.

### ✅ KI-15 — getMinDeliveryDate não considera fins de semana
**Status:** PARCIALMENTE RESOLVIDO em Sprint C1 (implementação aplicada; regra de negócio ainda não formalizada)
**Arquivo:** `src/lib/utils.ts`
**Descrição:** A função avança para segunda-feira quando o resultado cai em sábado (+2) ou domingo (+1). Implementação consistente com uso artesanal (sem entregas no fim de semana).
**Pendência:** Formalizar a regra em REGRAS_NEGOCIO.md para evitar regressão futura.
**Prioridade:** Baixa

### KI-16 — Product.costPrice sempre 0
**Status:** ADIADO — Fase 3 (Receitas)
**Descrição:** Todos os produtos têm `costPrice=0`. A precificação automática não existe.
**Resolução:** Implementar quando `Recipe` e `RecipeIngredient` forem populados na Fase 3.
**Prioridade:** Baixa (pré-requisito para Fase 4)

---

## Bug Crítico (introduzido na Sprint A2)

### ✅ KI-17 — PaymentStatus divergente entre TypeScript e banco de dados
**Status:** RESOLVIDO em Sprint 2.A.2 (01/07/2026)
**Arquivos:** `src/lib/types.ts`
**Descrição:** Os valores do enum `PaymentStatus` estavam divergentes entre TypeScript e Prisma/banco.
- TypeScript tinha: `"FALHOU" | "REEMBOLSADO"` — inexistentes no banco
- Banco/Prisma tinha: `PARCIAL | ESTORNADO` — ausentes no TypeScript
**Resolução:** Corrigidos os valores em `src/lib/types.ts`: `"FALHOU"→"PARCIAL"`, `"REEMBOLSADO"→"ESTORNADO"`. Confirmado via grep: 0 ocorrências de `FALHOU`/`REEMBOLSADO` em todo o projeto. TypeScript, Prisma e banco agora idênticos: `PENDENTE | PAGO | PARCIAL | ESTORNADO`.

---

## Pendências por ID (referência cruzada com REVIEW.md)

| ID | Descrição | Status | KI ref |
|----|-----------|--------|--------|
| PEN-01 | Checkout não persistia pedidos | ✅ Resolvido (Sprint 0.6) | — |
| PEN-02 | /pedidos usava MOCK_ORDERS | ✅ Resolvido (Sprint 0.6) | — |
| PEN-03 | /admin/producao usa dados hardcoded | 🔲 Aberto — Sprint 1 | KI-04 |
| PEN-04 | Auth OTP cliente sem backend | 🟡 Parcial — login funciona sem OTP | KI-05 |
| PEN-05 | Produtos têm imageUrl=null, vitrine usa imageEmoji | ✅ Tipo alinhado — upload pendente Fase 8 | KI-06 |

---

## Problemas Resolvidos (histórico)

| ID | Descrição | Resolvido em |
|----|-----------|-------------|
| BUG-01 a 06 | Bugs de UI/UX na vitrine | Sprint 0 |
| INFRA-01 a 05 | Problemas de infraestrutura | Sprint 0.5 |
| PEN-01 | addressId mock causava FK constraint no banco | Sprint 0.6 |
| PEN-02 | handleRepeat usava PRODUCTS mock para buscar itens | Sprint 0.6 |
| KI-01 | useCurrentUser retornava MOCK_CUSTOMER | Sprint A2 |
| KI-02 | MOCK_CUSTOMER no checkout | Sprint A2 |
| KI-05 | Auth OTP sem backend (parcial — sem WhatsApp) | Sprint A2 |
| KI-06 | imageEmoji vs imageUrl — divergência de tipo | Sprint A2 |
| KI-07 | StoreConfig nunca lida | Sprint A2 |
| KI-08 | Autorização por papel ausente (parcial — mapa vazio) | Sprint A2 |
| KI-09 | Checkout sem validação de endereço | Sprint A2 |
| KI-11 | Tipos `any` em serviços | Sprint A2 |
| KI-12 | paymentStatus ausente no tipo Order | Sprint A2 |
| KI-13 | OCCASIONS importadas de mock-data | Sprint A2 |
| KI-14 | CATEGORY_NAMES hardcoded na vitrine | Sprint A2 |
| KI-17 | PaymentStatus divergente (FALHOU/REEMBOLSADO) entre TypeScript e banco | Sprint 2.A.2 |
| IC-02 | UnitConversion sem `@relation` explícito — sem enforcement referencial no Prisma | Sprint 2.A.1 |
| IC-07 | UnitConversion sem `@@unique([fromUnitId, toUnitId])` — conversões duplicadas possíveis | Sprint 2.A.1 |
| DT-01 | themeConfigRepository usava `$executeRaw`/`$queryRaw` — tipagem manual, SQL injection possível | Sprint 2.A.3 |
