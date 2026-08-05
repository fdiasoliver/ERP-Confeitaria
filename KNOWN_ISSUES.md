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
**Status:** ✅ Resolvido — Módulo 2.K (Sprints 2.K.1–2.K.4), 02/08/2026
**Arquivo:** `src/app/admin/producao/page.tsx`
**Descrição:** Stats, Kanban com pedidos fictícios, consolidação batch — tudo hardcoded. Nenhuma API é chamada.
**Impacto:** A equipe de produção não vê pedidos reais.
**Resolução aplicada:** `orderRepository.ts`/`orderService.ts`/`cmvService.ts` (2.K.1), `GET/PATCH /api/admin/orders*`, `GET /api/admin/orders/consolidation`, `GET /api/admin/cmv` (2.K.2/2.K.4), página reescrita consumindo dado real — Kanban, stats, seção Urgente, Consolidação de ingredientes e CMV, todos reais (2.K.3/2.K.4). Validado por Playwright contra banco real, 13/13 cenários aprovados, 0 bugs — ver `MODULE_2K_CLOSURE.md`.
**Prioridade:** Alta

### ✅ KI-05 — Auth OTP sem backend (PEN-04)
**Status:** PARCIALMENTE RESOLVIDO em Sprint A2
**Arquivo:** `src/app/login/page.tsx`
**Resolução:** O login do cliente agora funciona: telefone + nome → `signIn("customer")` → `NextAuth.authorize` → upsert do `Customer` no banco → sessão JWT com phone e userType. O campo de OTP foi substituído pelo campo de nome (temporário). O fluxo de OTP via WhatsApp será adicionado na Fase 8 na função `authorize` do provider, sem alterar estrutura.
**Nota:** O estado `otp` morto da versão anterior foi removido.

---

## Problemas Médios (afetam qualidade ou bloqueiam módulos futuros)

### ✅ KI-18 — Chave React duplicada na vitrine (`/`)
**Status:** RESOLVIDO em 03/08/2026 (investigação dedicada, fora da Sprint DS.1 onde foi encontrado incidentalmente)
**Arquivo:** `src/lib/mock-data.ts`
**Causa raiz real, confirmada por reprodução ao vivo (Playwright, não suposição):** não era produto duplicado — `OCCASIONS` (mock, usado como fallback inicial antes do fetch real de `/api/occasions` resolver) já incluía `{ id: "all", name: "Todos" }` como primeiro item. `src/app/page.tsx` (linha 29) prepend explicitamente `ALL_OCCASION` (`{ id: "all", name: "Todos" }`) na frente desse array, criando dois itens com `id: "all"` simultaneamente — mas só durante a primeira renderização (mock), antes do `useEffect` substituir por dados reais (que não têm essa entrada). `CategoryChips` usa `key={occ.id}`, daí o erro.
**Descoberta:** reproduzido ao vivo via Playwright MCP (`browser_navigate` + `browser_console_messages`) — confirmado erro fresco a cada `mount` da página, nunca ao interagir depois (consistente com um bug só no estado inicial de mock, não nos dados reais). `/api/products` e `/api/occasions` verificados diretamente via `curl` — nenhum dado duplicado real no banco.
**Resolução:** removida a entrada redundante `{ id: "all", name: "Todos" }` de `OCCASIONS` em `mock-data.ts` — confirmado (`grep`) que não é usada em nenhum outro lugar do projeto. `ALL_OCCASION` continua sendo a única fonte do pseudo-item "Todos", em ambos os caminhos (mock e real).
**Validação:** `tsc`/`lint` 0 erros; console do navegador confirmado limpo (0 erros) em `/` após a correção.

### ✅ KI-06 — imageEmoji vs imageUrl (divergência de tipo)
**Status:** RESOLVIDO em Sprint A2
**Arquivos:** `src/lib/types.ts`, `src/services/productService.ts`
**Resolução:** `imageUrl?: string` adicionado à interface `Product` em `types.ts`. `productService.ts` mapeia `imageUrl: p.imageUrl ?? undefined`. O componente `ProductCard.tsx` mantém o emoji como fallback de exibição — quando upload de imagem (Supabase/S3) for implementado, `ProductCard` exibirá `<img src={imageUrl}>` com prioridade.

### ✅ KI-07 — StoreConfig nunca lida
**Status:** RESOLVIDO em Sprint A2
**Resolução:** Criado `GET /api/config` em `src/app/api/config/route.ts` — retorna o registro `StoreConfig` do banco. Os valores hardcoded no checkout (`distanceKm: 1.8`, taxa de entrega) permanecem temporariamente; a integração com `/api/config` está agendada para o módulo de Configurações.

### ✅ KI-08 — Autorização por papel ausente
**Status:** RESOLVIDO para Clientes/Pedidos/Produção/Financeiro/Upload — Sprints `PRIV.1`/`PRIV.2` (03/08/2026)
**Arquivo:** `src/proxy.ts`, `src/lib/auth/requireRole.ts`, `requireOrderAccess.ts`, `requireFinance.ts`
**Resolução original (Sprint A2):** O proxy verifica `token.userType === "admin"` — impede que clientes autenticados acessem rotas `/admin/*`. Mapa `ROLE_REQUIRED` preparado, vazio.
**Resolução PRIV.1 (Clientes):** `requireRole()` criado (ADR-020); `/admin/clientes` + `/api/admin/customers/**` restritos a `ADMIN`+`ATENDIMENTO`.
**Resolução PRIV.2 (Pedidos/Produção/Financeiro/Upload):** `requireOrderAccess()`/`requireFinance()` criados (ADR-021); `/admin/producao` + `/api/admin/orders/**` restritos a `ADMIN`+`ATENDIMENTO`+`PRODUCAO` (`FINANCEIRO` também na página, por ver dados de CMV); `/api/admin/cmv` restrito a `ADMIN`+`FINANCEIRO`; `upload/route.ts` normalizado para `requireAdmin()`.
**Pendência remanescente:** as rotas de Catálogo e Cadeia Produtiva (categorias, ocasiões, produtos, ingredientes, receitas, embalagens, unidades, fornecedores — 45 rotas) permanecem `ADMIN`-only, sem papel definido em `REGRAS_NEGOCIO.md` (ver Seção 16) — decisão explícita do Product Owner de deixar fora do escopo de `PRIV.2`.

### ✅ KI-09 — Checkout sem validação de campos de endereço
**Status:** RESOLVIDO em Sprint A2
**Arquivo:** `src/app/checkout/page.tsx` função `handleConfirm`
**Resolução:** Antes de chamar `createOrder`, `handleConfirm` valida `street`, `addressNumber`, `neighborhood` e `zipCode` quando `deliveryType !== "RETIRADA"`. Exibe mensagem de erro inline se algum estiver vazio. Campos marcados com `*` no formulário.

### KI-10 — Address acumula sem deduplicação
**Status:** PARCIAL — decisão de escopo tomada no Planejamento do Módulo 2.L (02/08/2026)
**Arquivo:** `src/app/api/orders/route.ts` (causa raiz) e `/admin/clientes/[id]` (exibição, Módulo 2.L)
**Descrição:** A cada pedido com entrega, um novo `Address` é criado com `label="Entrega"`. Um cliente recorrente acumula um Address por pedido.
**Resolução aplicada (Módulo 2.L, Sprint 2.L.2):** deduplicação **apenas de exibição** em `/admin/clientes/[id]` (agrupamento visual, nenhuma escrita em `Address`/`Order.addressId`) — decisão do `ai-solution-architect`: mesclar de verdade reescreveria histórico de pedidos e exigiria hard delete de entidade referenciada, proibido sem ADR (`Address` não tem campo `active`, diferente do padrão soft-delete do projeto).
**Causa raiz NÃO resolvida (backlog separado):** `POST /api/orders` continua criando um `Address` novo a cada pedido, mesmo para cliente recorrente com endereço já cadastrado — pertence ao domínio Orders/Checkout, fora do escopo do Módulo 2.L. Corrigir exigiria reutilizar `Address` existente do cliente quando idêntico, decisão de produto/arquitetura própria, sem sprint numerada ainda.
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

### ✅ KI-16 — Product.costPrice sempre 0
**Status:** RESOLVIDO — Módulos 2.I (Receitas) e 2.J (Produtos Fase 2, RecipeLinker), 17/07/2026
**Descrição original:** Todos os produtos tinham `costPrice=0`. A precificação automática não existia.
**Resolução:** `calculateCostPrice()` (`src/lib/productService.ts`) soma o custo de cada `Recipe` vinculada via `ProductRecipe` (`recipe.unitCost * link.quantity`), recalculado automaticamente a cada vínculo. `Product.costPrice` (`prisma/schema.prisma`) armazena o valor calculado, nunca editado manualmente (Regra 11, `REGRAS_NEGOCIO.md`). Validado com dados reais e casos recém-criados na Sprint I.3 — ver `MODULE_2J_CLOSURE.md`.
**Achado ao revisar em 05/08/2026:** esta entrada permaneceu marcada "ADIADO" mesmo depois de 2.I/2.J concluídos (17/07/2026) — corrigida agora por estar desatualizada, não por resolução nova.
**Pendência remanescente, registrada em outro lugar:** `Product.costPrice` ainda não soma o custo de `ProductPackaging` (embalagem) — ver Módulo 2.H, Regra 11, e `PLAN.md`.

### KI-19 — Autorização dentro do Service em vez do Route Handler (`storeConfigService.ts`)
**Status:** ABERTO — dívida técnica, achado no planejamento da Sprint `PRIV.2` (03/08/2026)
**Arquivo:** `src/lib/storeConfigService.ts` (linhas ~87-88), consumido por `PATCH /api/config`
**Descrição:** `upsertStoreConfig()` verifica `session.user.role !== "ADMIN"` dentro do Service — violação da separação de camadas do projeto (autorização é responsabilidade do Route Handler, não do Service). Distinto de simples duplicação de checagem: é o Service decidindo uma resposta HTTP/autorização, papel que não é dele.
**Impacto:** Nenhum impacto funcional hoje (checagem funciona, resultado correto) — risco é de manutenção/consistência arquitetural.
**Resolução:** Mover a checagem para `PATCH /api/config` via `requireAdmin()`/`requireRole()`, e o Service voltar a assumir que quem o chama já validou autorização — decisão explícita do Product Owner de tratar em sprint técnica dedicada, fora do escopo de `PRIV.2` (ADR-021, `CLAUDE.md`).
**Prioridade:** Baixa

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
