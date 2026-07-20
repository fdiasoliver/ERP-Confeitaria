# PLAN.md — Plano de Evolução: Doce Menina

---

> **Mudança oficial de fase (Sprint T.1 — 15/07/2026).** A fase de infraestrutura de IA (Sprints G.5.0–G.5.7, trilha separada dos Épicos abaixo, sem alteração de funcionalidade do ERP) foi encerrada e congelada como Baseline v1.0 — ver [AIOS_BASELINE_v1.md](AIOS_BASELINE_v1.md). A partir de agora, todas as sprints seguem exclusivamente [ERP_DEVELOPMENT_WORKFLOW.md](ERP_DEVELOPMENT_WORKFLOW.md) e retomam o desenvolvimento funcional do ERP a partir do ÉPICO 2 (Módulo 2.D, próximo item planejado abaixo). Nenhum item do roadmap abaixo foi alterado por essa transição.

## Épicos

| Épico | Descrição | Status |
|-------|-----------|--------|
| **ÉPICO 1** | Fundação: front-end, infraestrutura, arquitetura, documentação, módulo Configuração | ✅ Encerrado 30/06/2026 — ver [EPICO_1.md](EPICO_1.md) |
| **ÉPICO 2** | Cadastros mestres + Fundação produtiva completa: 12 módulos (2.A–2.L) — correções, catálogo, cadeia produtiva (unidades, fornecedores, produtos, ingredientes, embalagens, receitas, produtos fase 2), dashboard, clientes | Em andamento |
| **ÉPICO 3** | Inteligência Operacional: Precificação automática avançada (P3.1), Dashboard Executivo — DRE + fluxo de caixa, Relatórios financeiros | Planejado |
| **ÉPICO 4** | Expansão Operacional: Calendário de Produção, Usuários/Roles, Módulo Tema, Cálculo de distância, PWA | Planejado |
| **ÉPICO 5** | Integrações Externas: OTP WhatsApp, Notificações, PIX, Google Maps, CONAB/CEASA | Planejado |
| **ÉPICO 6** | Experiência do Cliente: Detalhe de pedido, Fotos de referência, PWA | Planejado |

---

## ÉPICO 1 — Sprints concluídas

| Sprint | Descrição | Status |
|--------|-----------|--------|
| Sprint 0 | Front-end completo, dados mockados, bugs corrigidos | ✅ Concluído 28/06/2026 |
| Sprint 0.5 | Infraestrutura: banco, auth, proxy, API routes, seed | ✅ Concluído 29/06/2026 |
| Sprint 0.6 | Correções críticas: persistência real de pedidos, /pedidos com dados reais | ✅ Concluído 29/06/2026 |
| Sprint A1 | Revisão arquitetural: 5 novos documentos, análise de 16 problemas | ✅ Concluído 29/06/2026 |
| Sprint A2 | Consolidação da arquitetura: KI-01,02,05–09,11–14 resolvidos | ✅ Concluído 29/06/2026 |
| Sprint P1 | Planejamento funcional: 33 telas, menu lateral, fluxos por módulo, jornadas por persona | ✅ Concluído 29/06/2026 |
| Sprint P2 | Design System: 20 componentes documentados (DESIGN_SYSTEM.md) | ✅ Concluído 29/06/2026 |
| Sprint P3 | UX Guidelines: 18 seções de diretrizes de interface (UX_GUIDELINES.md) | ✅ Concluído 29/06/2026 |
| Sprint C1 | Revisão final da fundação: consistência entre docs, KI-17 identificado | ✅ Concluído 30/06/2026 |
| Sprint 1.1 + 1.2 | Módulo Configuração da Empresa (`/admin/config`) — schema, tipos, validator, repositories, service, API, upload, UI | ✅ Concluído 30/06/2026 |
| Sprint 1.3 | Refatoração arquitetural: componentes, formatters, StorageService, ViaCepService | ✅ Concluído 30/06/2026 |

## ÉPICO 2 — Governança e Módulos

| Sprint | Descrição | Status |
|--------|-----------|--------|
| Sprint 2.0 | Planejamento arquitetural: análise de 10 módulos × 16 questões, Domain Map, revisão do schema | ✅ Concluído 01/07/2026 |
| Sprint 2.0.1 | Consolidação: novo roadmap 2.A–2.H, decisões arquiteturais, justificativas | ✅ Concluído 01/07/2026 |
| Sprint 2.0.2 | Governança: criação de PROJECT_GOVERNANCE.md — regras, templates, convenções | ✅ Concluído 01/07/2026 |
| Sprint 2.0.3 | Blueprint funcional do ERP: ERP_BLUEPRINT.md — 18 módulos documentados | ✅ Concluído 01/07/2026 |
| Sprint 2.0.4 | Revisão do roadmap: nova ordem 2.B–2.J — produtores antes de consumidores | ✅ Concluído 01/07/2026 |
| Sprint 2.0.5 | Revisão final do roadmap: ordem definitiva 2.B–2.L, Produtos em duas fases formais, CMV em 2.J | ✅ Concluído 01/07/2026 |
| Sprint 2.0.6 | Higienização da documentação: módulos 2.E–2.L padronizados; SM-01–04 e BT-01–07 marcados resolvidos; Roadmap congelado | ✅ Concluído 01/07/2026 |
| Sprint 2.0.7 | Consolidação final da governança: DoD de Módulo (Seção 23), Política de ADR (Seção 13) — Fase de Planejamento encerrada | ✅ Concluído 01/07/2026 |
| Sprint 2.0.8 | ADR-005: padrão oficial de identificadores (CUID) formalizado e congelado — ver [ADR-005.md](ADR-005.md) | ✅ Concluído 02/07/2026 |
| Sprint I.1 | Infrastructure Validation & Database Synchronization — variáveis de ambiente, Prisma, comparação schema × banco físico, migrações, Storage, seeds. Nenhuma funcionalidade/regra de negócio/Frontend alterados | ✅ Concluído 17/07/2026 — ver `CHANGELOG.md`. Divergências reais confirmadas (`UnitOfMeasure`/`UnitConversion`/`UnitType`, dados zerados em `UnitOfMeasure`/`Ingredient`/`IngredientCategory`/`Recipe`/`RecipeIngredient`, Storage não configurado). Nenhuma correção estrutural aplicada. Decisão do Product Owner (17/07/2026): módulos 2.D/2.G/2.I permanecem "Concluído (condicionado à regularização da infraestrutura em Sprint I.2)" |
| Sprint I.2 | Infraestrutura: regularização das divergências confirmadas na Sprint I.1 — schema × banco confirmado sincronizado por evidência (`UnitOfMeasure`/`UnitConversion`/`UnitType`); seeds idempotentes de `UnitOfMeasure`/`IngredientCategory`/`Ingredient`/`Recipe`/`RecipeIngredient`/`ProductRecipe` criados (`prisma/seeds/production-chain.ts`) | ✅ Concluído 17/07/2026 — ver `CHANGELOG.md`. Credenciais de Storage (`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`) permanecem pendentes — fora do escopo desta sprint |
| Sprint I.3 | Functional Revalidation & Closure: revalidação funcional completa de 2.D/2.G/2.I/2.J em ambiente sincronizado com dados reais (CRUD, integração Unidade→Ingrediente→Receita→Produto, cálculo de custo, atualização automática, regressão) | ✅ Concluído 17/07/2026 — ver `CHANGELOG.md`. 2.D/2.G/2.I/2.J oficialmente encerrados, sem pendências de infraestrutura. Projeto liberado para retomar o roadmap funcional (2.E, 2.F, 2.H, 2.K, 2.L) |
| Sprint G.8 | Design System Consolidation & Legacy Migration: migração de Unidades/Ingredientes/Receitas/Produtos para os componentes compartilhados de `src/components/admin/shared/` (Sprint 2.E.7); endereça TD-19 | ✅ **Concluído 20/07/2026** — Microtarefas 1–4 concluídas: `unidades/conversoes/page.tsx`, `ingredientes/categorias/page.tsx` e `receitas/[id]/page.tsx` migradas nas partes classificadas como seguras; `LoadingState`/`EntityCard` adiados por dependência documentada (não pendência de execução); `DESIGN_SYSTEM.md` Seção 21 atualizada; `MODULE_G8_CLOSURE.md` criado e revisado com Cartografia de Compatibilidade (5 categorias + coluna Pré-requisitos); validação `tsc`/`lint`/`build` (0 erros) + smoke test Playwright funcional nas 3 páginas (0 erros de console, 0 requisições 4xx/5xx inesperadas). Aceite formal do Product Owner registrado em `CHANGELOG.md`. Pendência não bloqueante: `UX_GUIDELINES.md` sem menção aos componentes compartilhados (Melhoria Futura) |

Ver [PROJECT_GOVERNANCE.md](PROJECT_GOVERNANCE.md) — referência obrigatória para todas as implementações.

## ÉPICO 2 — Módulos (2.A–2.L)

> **Roadmap congelado (Sprint 2.0.6 — 01/07/2026).** Ordem definitiva: correções técnicas → catálogo base → cadeia produtiva completa → Produtos Fase 2 (RecipeLinker + costPrice + CMV) → Dashboard Operacional → Clientes. Alterações estruturais requerem ADR formal (PROJECT_GOVERNANCE.md Seção 13).

| Módulo | Descrição | Dependências | Status |
|--------|-----------|-------------|--------|
| **2.A** | Consolidação Técnica: Schema → TypeScript → Repository → Validação | — | ✅ Concluído 01/07/2026 |
| **2.B** | Categorias: CRUD admin de `ProductCategory` | Nenhuma | ✅ Concluído 02/07/2026 — Sprints 2.B.1–2.B.6 |
| **2.C** | Ocasiões: CRUD admin de `OccasionTag` | Nenhuma | ✅ Concluído 06/07/2026 |
| **2.D** | Unidades de Medida: CRUD `UnitOfMeasure` + `UnitConversion` | Nenhuma | ✅ **Concluído** — 15/07/2026 (Sprints 2.D.1–2.D.7) — ver [MODULE_2D_CLOSURE.md](MODULE_2D_CLOSURE.md). Divergência de infraestrutura identificada na Sprint I.1 e regularizada na Sprint I.2 (17/07/2026); **revalidação funcional completa em ambiente sincronizado executada na Sprint I.3 (17/07/2026)** — CRUD, pesquisa, filtros, validações e persistência confirmados com dados reais, 0 regressões — ver `CHANGELOG.md`, Sprints I.1/I.2/I.3 |
| **2.E** | Fornecedores: schema `Supplier` + CRUD admin | Schema sprint obrigatória | ✅ **Concluído** — 18/07/2026 (Sprints 2.E.1–2.E.7: Schema, Repository+Validator, Service, API, Frontend Inicial, UX/UI Foundation, UX/UI Implementation) — ver [MODULE_2E_CLOSURE.md](MODULE_2E_CLOSURE.md) e `CHANGELOG.md`. Rota `/admin/fornecedores` redesenhada (`max-w-5xl`, grid responsivo, 71% de uso de largura em desktop — igual ao módulo Config), 12 componentes compartilhados em `src/components/admin/shared/` (primeiro conjunto do Design System para Cadastro Mestre). Backlog técnico: TD-18, TD-19, TD-20 — ver `MODULES.md` |
| **2.F** | Produtos (Fase 1): CRUD admin + upload de imagem — `costPrice = 0`, sem RecipeLinker | 2.B + 2.C | Planejado |
| **2.G** | Ingredientes: CRUD `Ingredient` + `IngredientCategory` + histórico de preços + alertas | 2.D (2.E não é dependência real — `Ingredient.supplier` é campo texto, sem FK para `Supplier`; ver `REGRAS_NEGOCIO.md` Seção 7.4, "Entidade Fornecedor: A definir") | ✅ **Concluído** — 15/07/2026 (Sprints 2.G.1–2.G.3) — ver [MODULE_2G_CLOSURE.md](MODULE_2G_CLOSURE.md). Dados ausentes identificados na Sprint I.1 e regularizados na Sprint I.2 (17/07/2026); **revalidação funcional completa em ambiente sincronizado executada na Sprint I.3 (17/07/2026)** — CRUD, histórico de preço, pesquisa, filtros e persistência confirmados com dados reais, efeito em cascata sobre custo de receitas/produtos confirmado, 0 regressões — ver `CHANGELOG.md`, Sprints I.1/I.2/I.3 |
| **2.H** | Embalagens: schema `Packaging`/`PackagingCategory`/`PackagingPriceHistory`/`ProductPackaging` + CRUD admin | 2.E (opcional, `supplierId`) + 2.J (obrigatória, `ProductPackaging`); **2.D não é mais dependência** — decisão de quantidade sempre inteira (ADR-014) remove a necessidade de `UnitOfMeasure` | 🟡 **Blueprint completo (Sprint 2.H.0, 20/07/2026)** — ver [MODULE_2H_PLANNING.md](MODULE_2H_PLANNING.md) e `CLAUDE.md` ADR-014 (vínculo com `Product`, não `Recipe` — supera a decisão de 30/06/2026). Implementação (Sprints 2.H.1–2.H.7) ainda não iniciada |
| **2.I** | Receitas: CRUD `Recipe` + `RecipeIngredient` + custo calculado automaticamente | 2.G + 2.D (2.H não é dependência real — `RecipeIngredient` não tem nenhum campo/relação com `Packaging`, confirmado no schema e em `REGRAS_NEGOCIO.md` Seção 6; embalagem afeta custo do Produto, não da Receita) | ✅ **Concluído** — 15/07/2026 (Sprints 2.I.1–2.I.3) — ver [MODULE_2I_CLOSURE.md](MODULE_2I_CLOSURE.md). Módulo de referência oficial para fluxos Mestre/Detalhe do ERP. Dados ausentes identificados na Sprint I.1 e regularizados na Sprint I.2 (17/07/2026); **revalidação funcional completa em ambiente sincronizado executada na Sprint I.3 (17/07/2026)** — CRUD de receita e itens, bloqueio de duplicidade/último item, cálculo de custo e atualização automática confirmados com dados reais, 0 regressões — ver `CHANGELOG.md`, Sprints I.1/I.2/I.3 |
| **2.J** | Produtos (Fase 2): RecipeLinker + `costPrice` automático + CMV base | 2.I (2.F não é dependência técnica do Backend — ver ADR-011 em `CLAUDE.md`; histórico original da dependência "2.F + 2.I" preservado em `CHANGELOG.md`, Sprint 2.J.1) | ✅ **Concluído** — 17/07/2026 (Sprints 2.J.1–2.J.2.1 + QA/Homologação na Sprint I.3) — ver [MODULE_2J_CLOSURE.md](MODULE_2J_CLOSURE.md). Bloqueio de infraestrutura levantado por hipótese na Sprint 2.J.2.1, confirmado por evidência na Sprint I.1 e regularizado na Sprint I.2; **QA Funcional e Homologação executados na Sprint I.3** — RecipeLinker validado ponta a ponta com dados reais e recém-criados (`costPrice`/margem corretos em dois casos, atualização automática confirmada), 0 regressões — ver `CHANGELOG.md`, Sprints I.1/I.2/I.3 |
| **2.K** | Dashboard Operacional: Kanban real + consolidação de ingredientes + CMV do dia/semana (KI-04) | 2.I + 2.J + Orders | Planejado |
| **2.L** | Clientes: visão admin de `Customer` + histórico + notas internas + LTV | Orders (existem) | Planejado |

### Estrutura do Módulo 2.A — Sprints

Módulo de correção: cada sprint toca **uma única camada** para isolar regressões.

| Sprint | Camada | Escopo | Status |
|--------|--------|--------|--------|
| **Sprint 2.A.1** | Schema | Correções de relacionamentos, `UnitConversion`, constraints, índices e enums do banco | ✅ Concluído 01/07/2026 |
| **Sprint 2.A.2** | TypeScript | Corrigir `PaymentStatus` (`FALHOU→PARCIAL`, `REEMBOLSADO→ESTORNADO`) em `types.ts` | ✅ Concluído 01/07/2026 |
| **Sprint 2.A.3** | Repository | Eliminar `$executeRaw`/`$queryRaw`; migrar `themeConfigRepository.ts` para Prisma Client tipado | ✅ Concluído 01/07/2026 |
| **Sprint 2.A.4** | Validação | `db push` + `lint` + `tsc` + `build` + `dev`; validar `/api/config`; fechar KI-17, IC-02, IC-07, DT-01 | ✅ Concluído 01/07/2026 |

Ver detalhes e sprints em [EPICO_2_PLANEJAMENTO.md](EPICO_2_PLANEJAMENTO.md) — Seção 7.

### Estrutura do Módulo 2.C — Sprints

| Sprint | Camada | Escopo | Status |
|--------|--------|--------|--------|
| **Sprint 2.C.1** | Arquitetural / Documental | Auditoria do relacionamento `Product ↔ OccasionTag`; formalização de `ProductOccasion` como padrão oficial para N:N com potencial de evolução; atualização de `REGRAS_NEGOCIO.md`, `PROJECT_GOVERNANCE.md`, `PLAN.md`, `CHANGELOG.md` | ✅ Concluído 02/07/2026 |
| **Sprint 2.C.2** | Schema | Expandir `OccasionTag` com campos faltantes (`sortOrder`, `color`, `icon`, `isActive`, `createdAt`, `updatedAt`); adicionar `OccasionTag` e `OccasionTagInput` em `types.ts`; `db push` + `generate` + `tsc` | ✅ Concluído 06/07/2026 |
| **Sprint 2.C.3** | Repository + Validator | `occasionTagRepository.ts` + `occasionTagValidator.ts` | ✅ Concluído 06/07/2026 |
| **Sprint 2.C.4** | Service | `occasionTagService.ts` + erros de domínio | ✅ Concluído 06/07/2026 |
| **Sprint 2.C.5** | API | `/api/admin/occasions` — GET + POST + PATCH + PATCH/:id/activate + PATCH/:id/deactivate | ✅ Concluído 06/07/2026 |
| **Sprint 2.C.5.1** | Ajuste arquitetural | Adaptação do consumidor de `/api/occasions` em `page.tsx` ao contrato `{success, data}`; confirmação dos critérios obrigatórios (Service-only, `responses.ts`, `requireAdmin()`) antes da implementação definitiva de 2.C.5 | ✅ Concluído 06/07/2026 |
| **Sprint 2.C.6** | Front-end | `/admin/ocasioes` — página de CRUD (padrão Módulo 2.B) | ✅ Concluído 06/07/2026 |
| **Sprint 2.C.7** | QA | `tsc` + `lint` + `build` + validação funcional completa; fechar Módulo 2.C | ✅ Concluído 06/07/2026 |

### Estrutura do Módulo 2.D — Sprints

| Sprint | Camada | Escopo | Status |
|--------|--------|--------|--------|
| **Sprint 2.D.1** | Schema | Ajustes arquiteturais em `UnitOfMeasure` + `UnitConversion` identificados em auditoria: `isActive`, `updatedAt`, `sortOrder`, `name @unique` em `UnitOfMeasure`; `updatedAt` em `UnitConversion`; `type` promovido de `String` para `enum UnitType` (MASS, VOLUME, UNIT); correção do comentário órfão de IC-05 no schema | ✅ Concluído 06/07/2026 |
| **Sprint 2.D.2** | Repository + Validator | `unitRepository.ts` (incl. `findUnitByName` + `findUnitByAbbreviation`) + `unitValidator.ts` | ✅ Concluído 06/07/2026 |
| **Sprint 2.D.3** | Service | `unitService.ts` — CRUD + erros de domínio (`NotFoundError`, `ValidationFailedError`, `DuplicateNameError`, `DuplicateAbbreviationError`) | ✅ Concluído 06/07/2026 |
| **Sprint 2.D.4** | API | `/api/units` (pública) + `/api/admin/units` (GET+POST) + `/api/admin/units/[id]` (PATCH) + `/[id]/activate` + `/[id]/deactivate` | ✅ Concluído 06/07/2026 |
| **Sprint 2.D.5** | Front-end | `/admin/unidades` — página de CRUD (padrão Módulo 2.C) + `unitApi.ts` + link no hub administrativo | ✅ Concluído 06/07/2026 |

### Documentação de arquitetura (Sprint A1)

| Arquivo | Conteúdo |
|---------|----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Visão geral técnica, decisões, riscos, convenções, 8 perguntas do arquiteto |
| [DOMAIN_MODEL.md](DOMAIN_MODEL.md) | 26+ entidades com status, regras, diagrama de relacionamentos e fluxos |
| [MODULES.md](MODULES.md) | Mapa de módulos por fase (1–10) com status + inventário de dívida técnica |
| [CHANGELOG.md](CHANGELOG.md) | Histórico cronológico de todas as sprints |
| [KNOWN_ISSUES.md](KNOWN_ISSUES.md) | 17 problemas conhecidos (KI-01 a KI-17) com prioridade e arquivos afetados |

### Planejamento funcional (Sprint P1)

| Arquivo | Conteúdo |
|---------|----------|
| [MENU_STRUCTURE.md](MENU_STRUCTURE.md) | Menu lateral completo: rotas, roles, fases, mapa ROLE_REQUIRED |
| [SCREENS.md](SCREENS.md) | 33 telas com Objetivo, Campos, Filtros, Ações, Permissões, Dependências, Status |
| [USER_FLOW.md](USER_FLOW.md) | Fluxos por módulo: navegação, condicionais, APIs chamadas |
| [USER_JOURNEY.md](USER_JOURNEY.md) | Jornadas das 4 personas (Ana/Carla/Marina/Paulo) |

### Design e UX (Sprints P2–P3)

| Arquivo | Conteúdo |
|---------|----------|
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | 20 componentes de UI documentados com comportamento, estados, acessibilidade |
| [UX_GUIDELINES.md](UX_GUIDELINES.md) | 18 seções de diretrizes: formulários, erros, mobile, dark/light mode |

---

# Funcionalidades existentes

## Front-end (cliente)

### Vitrine (`/`)
- Listagem de produtos com emoji como imagem
- Seção de destaques (`featured: true`)
- Agrupamento por categoria (Bolos, Doces & Docinhos, Kits & Coffee Break)
- Filtro por ocasião via `CategoryChips` (Todos, Aniversário, Docinhos, Café, Casamento, Corporativo, Mesversário)
- Exibição de preço base e prazo mínimo (`leadTimeDays`) por produto
- Controles de quantidade por produto (−/+) integrados ao carrinho

### Carrinho
- Estado global via `CartContext` (React Context API)
- Adicionar item com toast de confirmação (auto-dismiss 2s)
- Remover item
- Atualizar quantidade (0 remove o item)
- Adicionar observação por item
- Limpar carrinho (`clearCart`)
- Carregar itens de um pedido anterior (`loadFromOrder`)
- Cálculo memoizado de `itemCount` e `subtotal`
- `CartFab` flutuante com total e contagem (oculto quando vazio)
- `CartDrawer` (bottom sheet) com lista de itens e controles
- Toast de notificação global

### Checkout (`/checkout`)
- Seletor de data de entrega com data mínima calculada a partir de `leadTimeDays` máximo dos itens
- Seleção de tipo de entrega: Retirada (grátis), Entrega gratuita (até 3 km), Uber/99 (taxa fixa mockada)
- Campos condicionais de endereço e destinatário (visíveis apenas quando há entrega)
- Seleção de endereço salvo do cliente
- Observação geral do pedido
- Observação por item (personalização individual)
- Placeholder de upload de fotos de referência (UI pronta)
- Seleção de método de pagamento: PIX online, PIX na entrega, Dinheiro, Cartão de crédito
- Resumo com subtotal, taxa de entrega e total
- Tela de confirmação pós-pedido com mensagem de WhatsApp esperada
- Texto "Login necessário em produção · Demo sem autenticação"

### Histórico de pedidos (`/pedidos`)
- Listagem de pedidos mockados com número, status badge e data
- Estilo de badge por status (amber = Em Produção, sage = Pronto, sand = Entregue, rose = Confirmado)
- Botão "Ver detalhes" (sem ação implementada)
- Botão "Pedir novamente" (pedido em andamento → carrega itens sem observações → redireciona para vitrine)
- Botão "Pedir e personalizar" (pedido entregue → carrega itens com observações → redireciona para checkout)

### Autenticação (`/login`)
- Campo de telefone (passo 1)
- Campo de código OTP de 6 dígitos (passo 2)
- Gerenciamento de estado dos dois passos via `useState`
- Link direto para `/admin/producao`

## Front-end (equipe interna)

### Hub administrativo (`/admin`)
- Grade com 8 módulos: Produção, Usuários, Clientes, Insumos, Receitas, Produtos, Unidades, Tema
- Cada card tem emoji, título e descrição
- Link para `/admin/producao` (único módulo implementado)
- Demais módulos sem rota de destino

### Dashboard de produção (`/admin/producao`)
- Abas de período: Hoje, Amanhã, Semana, Calendário
- Cards de estatísticas: Pedidos, Itens, Urgentes (dados hardcoded)
- Seção "Urgente — entrega hoje" com card de destaque (border vermelho)
- Kanban board com 4 colunas: Confirmado, Em prod., Pronto, Entregue (dados hardcoded)
- Seção "Consolidação (batch)" com ingredientes agregados (dados hardcoded)
- Exibição da data atual formatada em pt-BR

## Infraestrutura

### Design system
- Paleta de cores: cream, chocolate, rose, sage, sand, muted (variáveis CSS + classes Tailwind)
- Fontes: Fraunces (display, títulos) + DM Sans (UI, corpo)
- Classes utilitárias customizadas: `.max-w-app`, `.shadow-card`, `.input-field`, `.option-card`, `.option-card.selected`, `.scrollbar-none`
- Layout mobile-first com max-width de 480px para páginas cliente

### Tipos e dados
- Interfaces TypeScript completas: `Product`, `CartItem`, `Address`, `Customer`, `Order`, `OrderItemSnapshot`
- Enums como union types: `DeliveryType`, `PaymentMethod`, `OrderStatus`
- Label dictionaries: `DELIVERY_LABELS`, `PAYMENT_LABELS`, `STATUS_LABELS`
- Funções utilitárias: `formatCurrency`, `getMaxLeadTimeDays`, `getMinDeliveryDate`
- Mock data completa: 8 produtos, 3 categorias, 7 ocasiões, 1 cliente, 2 pedidos

### Banco de dados e API (✅ Sprint 0.5)
- Supabase PostgreSQL conectado — schema sincronizado via `prisma db push`
- Seed com 8 produtos, 3 categorias, 7 ocasiões, 1 admin, 1 StoreConfig
- `GET /api/products` — produtos reais com categoria e ocasiões
- `GET /api/orders?phone=` — pedidos por telefone do cliente
- `POST /api/orders` — criação de pedido com transaction (snapshot de itens)
- `PATCH /api/orders/[id]/status` — atualização de status + histórico
- Autenticação admin via NextAuth (email + senha + bcrypt)
- Proxy de proteção em `src/proxy.ts` (Next.js 16) — rotas `/admin/*` requerem sessão

### Banco de dados (schema)
- Schema Prisma completo com 20+ modelos para PostgreSQL
- Modelos: `StoreConfig`, `ThemeConfig`, `User`, `Customer`, `Address`, `OtpCode`, `UnitOfMeasure`, `UnitConversion`, `IngredientCategory`, `Ingredient`, `IngredientPriceHistory`, `Recipe`, `RecipeIngredient`, `ProductCategory`, `OccasionTag`, `Product`, `ProductRecipe`, `ProductOccasion`, `Order`, `OrderItem`, `OrderAttachment`, `OrderStatusHistory`, `WhatsAppLog`
- Enums no banco: `UserRole`, `DeliveryType`, `PaymentMethod`, `PaymentStatus`, `OrderStatus`, `PriceSource`, `PixKeyType`
- Índices definidos para campos de busca frequente

### Documentação e prototipagem
- `README.md` com setup, rotas, decisões de produto e próximos passos
- `docs/SCHEMA.md` com diagrama de relacionamentos e decisões de modelagem
- `CLAUDE.md` com documentação permanente para sessões AI
- 6 wireframes HTML/CSS estáticos (index, vitrine, carrinho, checkout, pedidos, produção)
- `.env.example` documentando todas as variáveis de ambiente necessárias

---

# Funcionalidades incompletas

## 1. Autenticação OTP via WhatsApp
**O que existe:** Tela de login com UI de dois passos (telefone → código OTP), estado local gerenciado.
**O que falta:** Backend (API Route), integração com WhatsApp (Z-API/Evolution), criação/validação de `OtpCode` no banco, sessão de cliente autenticado, proteção de rotas.

## 2. Upload de fotos de referência
**O que existe:** Área de upload no checkout com placeholder visual ("📷 Toque para enviar fotos"), campo marcado como "MVP: em breve". Modelo `OrderAttachment` no schema do banco.
**O que falta:** Input real de arquivo, upload para storage (Supabase/S3), salvamento de URL em `OrderAttachment`, exibição das fotos no dashboard de produção.

## 3. Pagamento PIX
**O que existe:** Opção "PIX agora" no checkout, campo `pixTxId` no modelo `Order` do banco, variáveis `PIX_PROVIDER`/`PIX_API_KEY`/`PIX_WEBHOOK_SECRET` no `.env.example`.
**O que falta:** Integração com gateway (Asaas/Mercado Pago), geração de QR Code PIX, webhook para confirmação de pagamento, atualização de `paymentStatus` no banco.

## 4. Cálculo de distância para entrega gratuita
**O que existe:** Tipo `ENTREGA_GRATIS` com distância mockada de 1,8 km no checkout, campo `freeDeliveryRadiusKm` em `StoreConfig` (padrão: 3 km), campo `deliveryDistanceKm` em `Order`, variável `GOOGLE_MAPS_API_KEY` no `.env.example`.
**O que falta:** Integração com Google Maps Distance Matrix API, validação real da distância no checkout, exibição dinâmica da distância calculada.

## 5. ~~Dashboard de produção com dados reais~~ → Módulo 2.K do ÉPICO 2
**O que existe:** Layout completo do Kanban, seção de urgentes, consolidação de batch, abas de período — tudo com dados hardcoded.
**Implementação planejada:** Módulo 2.K — Kanban real + consolidação de ingredientes + CMV. Depende de Receitas (2.I) e `costPrice` (2.J).

## 6. Módulos administrativos → ÉPICO 2 (Módulos 2.B–2.L)
**O que existe:** Cards no hub `/admin` com descrição para 11 módulos.
**Implementação planejada:** Módulos 2.B (Categorias) a 2.L (Clientes) — ver roadmap congelado em EPICO_2_PLANEJAMENTO.md Seção 7.

## 7. Ver detalhes do pedido
**O que existe:** Botão "Ver detalhes" em cada card de pedido em `/pedidos`.
**O que falta:** Ação do botão, página ou modal de detalhe com itens, observações, status history, fotos de referência.

## ~~8. Persistência real de pedidos~~ ✅ Concluído Sprint 0.6
**O que existe:** `POST /api/orders` cria Customer + Address + Order + OrderItems + OrderStatusHistory em uma transação Prisma. Checkout exibe `orderNumber` real. `/pedidos` busca pedidos reais via `GET /api/orders?phone=`.

## 9. Notificações WhatsApp
**O que existe:** Modelo `WhatsAppLog` no schema, campo `template` para tipo de mensagem, variáveis de ambiente no `.env.example`.
**O que falta:** Serviço de envio (Z-API/Evolution), triggers por mudança de `OrderStatus`, templates de mensagem.

---

# Funcionalidades futuras

## Prioridade 1 — Base operacional (sistema mínimo viável real)

Sem estes módulos, o sistema não pode operar em produção. São os únicos que geram valor imediato para o negócio.

---

### P1.1 — API Routes + Conexão ao banco de dados

**Objetivo:** Conectar o front-end ao PostgreSQL via Prisma, eliminando os dados mockados.

**Entregas:**
- `GET /api/products` — lista produtos ativos com categorias e ocasiões
- `POST /api/orders` — cria pedido com itens e snapshots
- `GET /api/orders?customerId=` — histórico de pedidos do cliente
- `PATCH /api/orders/[id]/status` — atualização de status (equipe interna)
- `GET /api/orders?date=&status=` — pedidos por data/status (produção)
- Substituição de todos os imports de `MOCK_*` por chamadas de API

**Dependências:** PostgreSQL configurado, `DATABASE_URL` no `.env`, `npm run db:push` executado.
**Complexidade:** Média — o schema está pronto; é questão de implementar as rotas e substituir mocks.
**Impacto para o negócio:** Crítico — sem isso, nenhum pedido real pode ser registrado.

---

### P1.2 — Autenticação OTP real (cliente via WhatsApp)

**Objetivo:** Permitir que o cliente faça login pelo celular via código enviado no WhatsApp.

**Entregas:**
- `POST /api/auth/otp/send` — gera `OtpCode` e envia via WhatsApp API
- `POST /api/auth/otp/verify` — valida código, cria sessão
- Proteção de rotas `/pedidos` e `/checkout` para clientes autenticados
- Criação automática de `Customer` se número não existe

**Dependências:** P1.1 (banco), conta WhatsApp Business + Z-API ou Evolution API, `WHATSAPP_*` no `.env`.
**Complexidade:** Alta — envolve integração externa, expiração de tokens, sessão segura.
**Impacto para o negócio:** Crítico — sem autenticação, qualquer pessoa acessa pedidos de qualquer cliente.

---

### P1.3 — Autenticação da equipe interna

**Objetivo:** Proteger os módulos `/admin/*` com login por e-mail e senha, com controle por `UserRole`.

**Entregas:**
- Login `/admin/login` com e-mail e senha
- Sessão via NextAuth.js (já previsto no `.env.example`)
- Middleware de proteção para todas as rotas `/admin/*`
- Controle de acesso por role (ADMIN vê tudo; PRODUCAO só vê `/admin/producao`)

**Dependências:** P1.1 (banco), `NEXTAUTH_SECRET` no `.env`.
**Complexidade:** Média — NextAuth.js já está previsto; é configuração + middleware.
**Impacto para o negócio:** Crítico — sem isso, qualquer pessoa acessa o painel interno.

---

### ~~P1.4 — Módulo Produtos (admin)~~ → Coberto por ÉPICO 2 (Módulos 2.F + 2.J)

> **ÉPICO 2 absorveu este item.** Módulo 2.F (Produtos Fase 1): CRUD admin + upload de imagem. Módulo 2.J (Produtos Fase 2): RecipeLinker + `costPrice` automático. Ver [EPICO_2_PLANEJAMENTO.md](EPICO_2_PLANEJAMENTO.md) Seção 7.

**Objetivo original:** Permitir que a equipe cadastre e gerencie o catálogo de produtos sem tocar em código.

**Entregas (planejadas em Módulos 2.F e 2.J):**
- `/admin/produtos` — listagem com filtro por categoria e status
- Formulário de criação/edição: nome, descrição, categoria, preço, prazo, destaque, ocasiões
- Ativar/desativar produto; upload de imagem (substitui `imageEmoji`)
- RecipeLinker + `costPrice` automático (2.J)

**Complexidade:** Média. **Impacto:** Alto.

---

### ~~P1.5 — Dashboard de produção com dados reais~~ → Coberto por ÉPICO 2 (Módulo 2.K)

> **ÉPICO 2 absorveu este item.** Módulo 2.K (Dashboard Operacional): Kanban real + consolidação de ingredientes + CMV. Depende de Receitas (2.I) e costPrice (2.J). Ver [EPICO_2_PLANEJAMENTO.md](EPICO_2_PLANEJAMENTO.md) Seção 7 — Módulo 2.K.

**Objetivo original:** Substituir os dados hardcoded do Kanban e consolidação por dados reais do banco.

**Entregas (planejadas em Módulo 2.K):**
- Kanban com pedidos reais; mover card registra `OrderStatusHistory`
- Seção "Urgente" dinâmica; contadores reais
- Consolidação de batch: `RecipeIngredient.quantity × OrderItem.quantity` por ingrediente
- CMV do dia/semana via `cmvService.calculateCMV`

**Complexidade:** Alta. **Impacto:** Alto.

---

## Prioridade 2 — Operação completa

Estes módulos tornam o sistema autossuficiente: sem eles, processos críticos ainda dependem de ferramentas externas (WhatsApp manual, planilhas, etc.).

---

### P2.1 — Persistência real do pedido no checkout

**Objetivo:** Salvar o pedido no banco ao confirmar o checkout.

**Entregas:**
- Chamada `POST /api/orders` ao confirmar pedido
- Resposta com `orderNumber` gerado automaticamente
- Tela de confirmação exibindo o número real do pedido
- Rollback em caso de falha

**Dependências:** P1.1, P1.2 (cliente autenticado para associar `customerId`).
**Complexidade:** Baixa — o schema está pronto; é implementar a chamada e tratar resposta.
**Impacto para o negócio:** Crítico operacionalmente — sem isso, nenhum pedido é gravado.

---

### P2.2 — Notificações WhatsApp automáticas

**Objetivo:** Enviar mensagens automáticas ao cliente quando o status do pedido muda.

**Entregas:**
- Serviço de envio (`src/lib/whatsapp.ts`) com template por status
- Templates: confirmação do pedido, em produção, pronto para retirada, saiu para entrega, entregue
- Registro em `WhatsAppLog` (incluindo falhas)
- Trigger ao `PATCH /api/orders/[id]/status`

**Dependências:** P1.1, P1.5 (mudança de status no Kanban), WhatsApp API configurada.
**Complexidade:** Média — integração com API externa + sistema de templates.
**Impacto para o negócio:** Alto — elimina comunicação manual via WhatsApp da atendente.

---

### P2.3 — Pagamento PIX integrado

**Objetivo:** Gerar cobrança PIX no checkout e confirmar pagamento via webhook.

**Entregas:**
- Geração de QR Code PIX ao confirmar pedido com `PIX_ONLINE`
- Tela de pagamento com QR Code e código copia-e-cola
- Webhook `POST /api/webhooks/pix` para receber confirmação do gateway
- Atualização de `paymentStatus` para PAGO ao receber confirmação
- Notificação WhatsApp de confirmação de pagamento

**Dependências:** P2.1 (pedido no banco), P2.2 (notificações), `PIX_API_KEY` no `.env`.
**Complexidade:** Alta — integração com gateway externo, webhooks, segurança com `PIX_WEBHOOK_SECRET`.
**Impacto para o negócio:** Alto — viabiliza pagamento antecipado, reduz inadimplência.

---

### ~~P2.4 — Módulo Clientes (admin)~~ → Coberto por ÉPICO 2 (Módulo 2.L)

> **ÉPICO 2 absorveu este item.** Módulo 2.L (Clientes): listagem, perfil, LTV, histórico, notas internas, deduplicação de endereços (KI-10). Ver [EPICO_2_PLANEJAMENTO.md](EPICO_2_PLANEJAMENTO.md) Seção 7 — Módulo 2.L.

**Objetivo original:** Permitir que a equipe visualize e gerencie a base de clientes.

**Complexidade:** Média. **Impacto:** Médio.

---

### P2.5 — Upload de fotos de referência

**Objetivo:** Permitir que o cliente envie fotos no checkout para guiar a personalização.

**Entregas:**
- Input de arquivo no checkout com preview
- Upload para Supabase Storage ou S3
- Salvamento de URL em `OrderAttachment`
- Exibição das fotos no card de urgente e detalhes do pedido no dashboard de produção

**Dependências:** P2.1 (pedido no banco), `STORAGE_BUCKET_URL` no `.env`.
**Complexidade:** Média — integração com storage externo, validação de tipo/tamanho.
**Impacto para o negócio:** Alto — reduz erros de personalização, alinha expectativa cliente × confeitaria.

---

### ~~P2.6 — Módulo Insumos (admin)~~ → Coberto por ÉPICO 2 (Módulo 2.G)

> **ÉPICO 2 absorveu este item.** Módulo 2.G (Ingredientes): CRUD + `IngredientCategory` + histórico de preços + alertas de estoque mínimo. Ver [EPICO_2_PLANEJAMENTO.md](EPICO_2_PLANEJAMENTO.md) Seção 7 — Módulo 2.G.

**Objetivo original:** Cadastrar e controlar o estoque de matérias-primas com histórico de preços.

**Complexidade:** Média. **Impacto:** Alto.

---

### ~~P2.7 — Módulo Unidades de medida (admin)~~ → Coberto por ÉPICO 2 (Módulo 2.D)

> **ÉPICO 2 absorveu este item.** Módulo 2.D (Unidades de Medida): CRUD `UnitOfMeasure` + `UnitConversion`. Ver [EPICO_2_PLANEJAMENTO.md](EPICO_2_PLANEJAMENTO.md) Seção 7 — Módulo 2.D.

**Objetivo original:** Cadastrar unidades (g, kg, ml, L, unidade) e conversões entre elas.

**Complexidade:** Baixa. **Impacto:** Médio.

---

### ~~P2.8 — Módulo Receitas (admin)~~ → Coberto por ÉPICO 2 (Módulo 2.I)

> **ÉPICO 2 absorveu este item.** Módulo 2.I (Receitas): CRUD `Recipe` + `RecipeIngredient` + `PackagingItem` + custo calculado automaticamente + conversão de unidades. Ver [EPICO_2_PLANEJAMENTO.md](EPICO_2_PLANEJAMENTO.md) Seção 7 — Módulo 2.I.

**Objetivo original:** Cadastrar receitas associando ingredientes e quantidades, calculando custo automaticamente.

**Complexidade:** Alta. **Impacto:** Alto.

---

## Prioridade 3 — Crescimento e inteligência de negócio

Estes módulos agregam valor estratégico após o sistema estar operacional.

---

### P3.1 — Precificação automática

**Objetivo:** Calcular o preço sugerido de venda com base em custo de receita + custos fixos + margem.

**Entregas:**
- Custo de produção = soma dos ingredientes da receita no preço atual
- Custo total = custo de produção + rateio de custo fixo + custo de mão de obra
- Preço sugerido = custo total ÷ (1 - margem%)
- Comparação entre `costPrice` (calculado) e `basePrice` (praticado) em `/admin/produtos`
- Configuração de parâmetros em `StoreConfig` (custo/hora, custo fixo mensal, produção mensal, margem)

**Dependências:** P2.6, P2.7, P2.8, P1.4.
**Complexidade:** Alta — requer cadeia completa de dados; cálculo com múltiplas variáveis.
**Impacto para o negócio:** Muito alto — elimina precificação empírica; aumenta lucratividade.

---

### P3.2 — Relatórios financeiros

**Objetivo:** Visão consolidada de faturamento, custos e lucratividade por período.

**Entregas:**
- Dashboard financeiro: faturamento, ticket médio, pedidos por período
- Breakdown por categoria de produto
- Comparativo de receita vs custo (margem real)
- Relatório de métodos de pagamento
- Exportação para CSV/PDF

**Dependências:** P2.1 (pedidos reais), P3.1 (custos calculados).
**Complexidade:** Média — consultas agregadas no banco; visualização com gráficos simples.
**Impacto para o negócio:** Alto — visibilidade financeira para decisões estratégicas.

---

### P3.3 — Calendário de produção

**Objetivo:** Visualizar a carga de produção por dia/semana em formato de calendário.

**Entregas:**
- Aba "Calendário" funcional em `/admin/producao`
- Visualização de pedidos por data de entrega com indicador de carga
- Alerta de sobreposição (muitos pedidos no mesmo dia)
- Possibilidade de sugerir reagendamento ao cliente

**Dependências:** P1.5 (produção com dados reais).
**Complexidade:** Média — componente de calendário + lógica de carga por dia.
**Impacto para o negócio:** Alto — evita overbooking; melhora planejamento da confeiteira.

---

### P3.4 — Página de detalhes do pedido (cliente)

**Objetivo:** Exibir detalhes completos do pedido para o cliente, com histórico de status.

**Entregas:**
- `/pedidos/[id]` — detalhe do pedido
- Timeline de status com datas e horários
- Lista de itens com observações e fotos de referência
- Informações de entrega (endereço, data, destinatário)
- Botão "Cancelar pedido" (quando status = CONFIRMADO)

**Dependências:** P2.1, P2.5 (fotos), P1.2 (cliente autenticado).
**Complexidade:** Baixa — leitura e exibição de dados já modelados.
**Impacto para o negócio:** Médio — reduz mensagens de "onde está meu pedido" no WhatsApp.

---

### P3.5 — Módulo Tema (admin)

**Objetivo:** Permitir personalização visual da vitrine sem alterar código.

**Entregas:**
- `/admin/tema` — editor de cores (primária, secundária, fundo, destaque)
- Upload de logo
- Preview em tempo real
- Salvamento em `ThemeConfig` no banco
- Aplicação dinâmica das cores no front-end via CSS variables

**Dependências:** P1.1, P1.3.
**Complexidade:** Média — editor de tema com preview; aplicação via CSS variables.
**Impacto para o negócio:** Médio — valor para escalabilidade (multi-tenant futuro).

---

### P3.6 — PWA (Progressive Web App)

**Objetivo:** Tornar o app instalável no celular do cliente como se fosse um app nativo.

**Entregas:**
- `manifest.json` com nome, ícones, cores e `start_url`
- Service worker para cache de assets estáticos
- Prompt de instalação no iOS e Android
- Ícone na tela inicial

**Dependências:** Nenhuma técnica — pode ser feito a qualquer momento.
**Complexidade:** Baixa — Next.js suporta nativamente via `next-pwa` ou configuração manual.
**Impacto para o negócio:** Médio — aumenta recorrência; cliente acessa mais facilmente.

---

### P3.7 — Sincronização de preços de insumos (CONAB/CEASA)

**Objetivo:** Atualizar automaticamente os preços de insumos a partir de fontes externas.

**Entregas:**
- Job agendado (cron) para buscar preços da CONAB/CEASA
- Mapeamento de `Ingredient.externalCode` para códigos externos
- Registro de atualização em `IngredientPriceHistory` com `source = CONAB_CEASA`
- Alerta quando variação de preço supera threshold configurável

**Dependências:** P2.6 (módulo insumos), P3.1 (precificação automática).
**Complexidade:** Alta — integração com APIs externas, mapeamento de produtos, tratamento de variações.
**Impacto para o negócio:** Médio — mantém precificação atualizada automaticamente.

---

### P3.8 — Cálculo de distância de entrega (Google Maps)

**Objetivo:** Determinar automaticamente se a entrega é gratuita ou paga com base na distância real.

**Entregas:**
- Chamada à Google Maps Distance Matrix API no checkout
- Validação: se distância ≤ `StoreConfig.freeDeliveryRadiusKm`, oferece `ENTREGA_GRATIS`
- Exibição da distância calculada no card de entrega gratuita
- Salvamento de `deliveryDistanceKm` no `Order`

**Dependências:** P2.1 (pedido real), `GOOGLE_MAPS_API_KEY` no `.env`.
**Complexidade:** Baixa — uma chamada de API no checkout; resultado salvo no pedido.
**Impacto para o negócio:** Médio — elimina decisão manual sobre frete grátis.
