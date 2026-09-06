# PLAN.md — Plano de Evolução: Doce Menina

---

> **Mudança oficial de fase (Sprint T.1 — 15/07/2026).** A fase de infraestrutura de IA (Sprints G.5.0–G.5.7, trilha separada dos Épicos abaixo, sem alteração de funcionalidade do ERP) foi encerrada e congelada como Baseline v1.0 — ver [AIOS_BASELINE_v1.md](AIOS_BASELINE_v1.md). A partir de agora, todas as sprints seguem exclusivamente [ERP_DEVELOPMENT_WORKFLOW.md](ERP_DEVELOPMENT_WORKFLOW.md) e retomam o desenvolvimento funcional do ERP a partir do ÉPICO 2 (Módulo 2.D, próximo item planejado abaixo). Nenhum item do roadmap abaixo foi alterado por essa transição.

## Épicos

| Épico | Descrição | Status |
|-------|-----------|--------|
| **ÉPICO 1** | Fundação: front-end, infraestrutura, arquitetura, documentação, módulo Configuração | ✅ Encerrado 30/06/2026 — ver [EPICO_1.md](EPICO_1.md) |
| **ÉPICO 2** | Cadastros mestres + Fundação produtiva completa: 12 módulos (2.A–2.L) — correções, catálogo, cadeia produtiva (unidades, fornecedores, produtos, ingredientes, embalagens, receitas, produtos fase 2), dashboard, clientes | ✅ **Encerrado 02/08/2026** — 12/12 módulos concluídos e revalidados, ver `MODULE_2L_CLOSURE.md` (último) e `CHANGELOG.md`. Próximo épico a definir pelo Product Owner |
| **ÉPICO 3** | Inteligência Operacional: Precificação automática avançada (P3.1), Dashboard Executivo — DRE + fluxo de caixa, Relatórios financeiros | Planejado |
| **ÉPICO 4** | Expansão Operacional: Calendário de Produção, Usuários/Roles, Módulo Tema, Cálculo de distância, PWA | Planejado |
| **ÉPICO 5** | Integrações Externas: OTP WhatsApp, Notificações, PIX, Google Maps, CONAB/CEASA | 🟡 **Em andamento — iniciado 05/08/2026.** Escolhido pelo Product Owner por resolver o único problema Crítico ainda aberto (`KI-03`). Planejamento arquitetural inicial concluído (5 sub-domínios mapeados, quebra em módulos `5.A`–`5.E` proposta). Módulo `5.B` (WhatsApp OTP + Notificações) ✅ concluído — ver abaixo |
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
| Sprint I.4 | Deploy em produção: Vercel + Supabase + Hostgator — projeto vinculado (`doce-menina/confeitaria-app`, GitHub conectado), variáveis de ambiente de Produção (`DATABASE_URL`, `NEXTAUTH_SECRET`/`URL`, WhatsApp, Supabase Storage), subdomínio `app.confeitariadocemenina.com.br` (registro A na Hostgator), bucket `store-assets` criado | 🟡 **Em andamento — iniciado 04/09/2026, Storage concluído 05/09/2026.** Ver `CHANGELOG.md`. Deploy de produção real no ar, dados reais do Supabase confirmados via smoke test (`/api/config`, `/api/products`, `/admin/login`); push em `main` já aciona redeploy automático via integração GitHub↔Vercel. Upload de imagens (logo/favicon/produto/categoria/banner/cliente/fornecedor) configurado em produção — bucket `store-assets` público criado, `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` no ambiente de Produção. **Pendências:** PIX e Google Maps ainda não configurados em produção (mesmo gap já registrado desde a Sprint I.2); documento de encerramento (`MODULE_I4_CLOSURE.md`) ainda não criado |
| Sprint G.8 | Design System Consolidation & Legacy Migration: migração de Unidades/Ingredientes/Receitas/Produtos para os componentes compartilhados de `src/components/admin/shared/` (Sprint 2.E.7); endereça TD-19 | ✅ **Concluído 20/07/2026** — Microtarefas 1–4 concluídas: `unidades/conversoes/page.tsx`, `ingredientes/categorias/page.tsx` e `receitas/[id]/page.tsx` migradas nas partes classificadas como seguras; `LoadingState`/`EntityCard` adiados por dependência documentada (não pendência de execução); `DESIGN_SYSTEM.md` Seção 21 atualizada; `MODULE_G8_CLOSURE.md` criado e revisado com Cartografia de Compatibilidade (5 categorias + coluna Pré-requisitos); validação `tsc`/`lint`/`build` (0 erros) + smoke test Playwright funcional nas 3 páginas (0 erros de console, 0 requisições 4xx/5xx inesperadas). Aceite formal do Product Owner registrado em `CHANGELOG.md`. Pendência não bloqueante: `UX_GUIDELINES.md` sem menção aos componentes compartilhados (Melhoria Futura) |
| Sprint 2.I.0 | Consolidação da Metodologia de Desenvolvimento do ERP: retrospectiva do Módulo 2.H, Fluxo Oficial de Desenvolvimento de Módulo (11 etapas) formalizado em `PROJECT_GOVERNANCE.md` Seção 27, `QUALITY_GUIDELINES.md` criado (classificação oficial de achados, checklists por etapa, padrão de homologação) | ✅ **Concluído 20/07/2026** — ver `CHANGELOG.md`. `MODULE_2H_CLOSURE.md` criado retroativamente (lacuna do único módulo sem documento de encerramento). **Achado registrado, não resolvido unilateralmente (mesmo padrão da ADR-009):** Platform Review/Product Review/Demo Validation (`ERP_DEVELOPMENT_WORKFLOW.md`, ADR-006/007/008) nunca foram executados no ciclo 2.H.1–2.H.7 — divergência real entre processo documentado e prática, decisão de reconciliação fica com o Product Owner |
| Sprint 2.I.1 (Governança) | Consolidação do Ciclo de Governança do Produto: auditoria completa de todos os processos documentados, matriz comparativa fluxo documentado × executado no ciclo 2.H, classificação (ATIVO/LEGADO/OBSOLETO/FUTURO/EXPERIMENTAL), análise individual e recomendação fundamentada para Platform Review/Product Review/Demo Validation, `GOVERNANCE_DECISIONS.md` criado, Mapa de Governança (`QUALITY_GUIDELINES.md` Seção 6) | ✅ **Concluído 20/07/2026** — ver `CHANGELOG.md`. **Achado central desta sprint — colisão de numeração:** este identificador ("Sprint 2.I.1", nome definido pela própria Ordem de Missão) colide com `2.I` = Módulo Receitas (`PROJECT_GOVERNANCE.md` Seção 3, sprints reais `2.I.1`/`2.I.2`/`2.I.3` de 15/07/2026) **e** com o prefixo `I.x` já reservado a Sprints de Infraestrutura (Seção 4.4, `I.1`/`I.2`/`I.3`). Nenhuma entrada já commitada foi renomeada retroativamente; recomendação de usar `G.x` a partir da próxima sprint de governança registrada em `GOVERNANCE_DECISIONS.md` GD-004. **Nenhuma decisão sobre Platform/Product/Demo Review foi implementada automaticamente** — três recomendações fundamentadas (GD-001/002/003) aguardam aprovação do Product Owner |
| Sprint G.9 | Evolução da Governança — Implantação do `PROJECT_STATE.md`: snapshot executivo do estado do ERP para sincronização de contexto entre IAs (ChatGPT, Gemini, Copilot, outras sessões), sem duplicar nem substituir documentação oficial | ✅ **Concluído 22/07/2026** — ver `CHANGELOG.md`. `PROJECT_STATE.md` criado na raiz. Estratégia de atualização registrada em `PROJECT_GOVERNANCE.md` Seção 12 e `QUALITY_GUIDELINES.md` Seção 6: atualizado ao final de toda Sprint Oficial, só depois de CHANGELOG/PLAN/ADRs. GD-004 (pendente desde a Sprint 2.I.1) aplicada nesta própria sprint, mediante confirmação explícita do Product Owner — promovida a ADR-016 |
| Sprint G.10 | Ativação da orquestração por Sub-agents: Arquiteto (antes ChatGPT, perdendo contexto) + Desenvolvedor centralizados no Claude Code, via os 11 Sub-agents já existentes em `.claude/agents/` (Sprint G.5.4, nunca usados até então) | ✅ **Concluído 31/07/2026** — ver `CHANGELOG.md`. ADR-017 registrada em `CLAUDE.md`. Nenhum agente novo criado — ativação, não construção, evitando duplicar trabalho já pronto. `PROJECT_GOVERNANCE.md` Seção 18 e `PROJECT_STATE.md` atualizados. `platform-reviewer`/`product-reviewer` mantidos obrigatórios no fluxo por decisão explícita do Product Owner, até GD-001/GD-002 (`GOVERNANCE_DECISIONS.md`) serem decididas. **Pendência:** fluxo ainda não exercitado em missão real |

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
| **2.F** | Produtos (Fase 1): CRUD admin + upload de imagem — `costPrice = 0`, sem RecipeLinker | 2.B + 2.C | ✅ **Concluído — 23/07/2026** (Sprint 2.F) — ver [MODULE_2F_CLOSURE.md](MODULE_2F_CLOSURE.md) e `CHANGELOG.md`. **Achado central:** o CRUD visual completo já estava implementado desde os Módulos 2.J (Sprints 2.J.2/2.J.2.1) e 2.H (Sprint 2.H.6) — nunca formalmente fechado sob o nome "2.F". Esta Sprint não construiu nada novo (Backend/Frontend preservados intactos, conforme restrição explícita da Ordem de Missão); executou Validação Técnica (tsc/lint/build/prisma, 0 erros) e Validação Funcional formal (15/15 cenários, Playwright, banco real) pela primeira vez sob este nome, e Homologação do Product Owner (nenhum defeito bloqueante). 1 achado não-bloqueante classificado Backlog/Evolução (tela de detalhes não exibe descrição/prazo/destaque) |
| **2.G** | Ingredientes: CRUD `Ingredient` + `IngredientCategory` + histórico de preços + alertas | 2.D (2.E não é dependência real — `Ingredient.supplier` é campo texto, sem FK para `Supplier`; ver `REGRAS_NEGOCIO.md` Seção 7.4, "Entidade Fornecedor: A definir") | ✅ **Concluído** — 15/07/2026 (Sprints 2.G.1–2.G.3) — ver [MODULE_2G_CLOSURE.md](MODULE_2G_CLOSURE.md). Dados ausentes identificados na Sprint I.1 e regularizados na Sprint I.2 (17/07/2026); **revalidação funcional completa em ambiente sincronizado executada na Sprint I.3 (17/07/2026)** — CRUD, histórico de preço, pesquisa, filtros e persistência confirmados com dados reais, efeito em cascata sobre custo de receitas/produtos confirmado, 0 regressões — ver `CHANGELOG.md`, Sprints I.1/I.2/I.3 |
| **2.H** | Embalagens: schema `Packaging`/`PackagingCategory`/`PackagingPriceHistory`/`ProductPackaging` + CRUD admin | 2.E (opcional, `supplierId`) + 2.J (obrigatória, `ProductPackaging`); **2.D não é mais dependência** — decisão de quantidade sempre inteira (ADR-014) remove a necessidade de `UnitOfMeasure` | ✅ **Concluído — 20/07/2026** (Sprints 2.H.0–2.H.7) — ver `CHANGELOG.md`. Blueprint (2.H.0, `MODULE_2H_PLANNING.md`), Schema (2.H.1), Repository+Validator (2.H.2), Service (2.H.3), API (2.H.4, 27/27 testes), UX Foundation (2.H.5, `MODULE_2H_UX_FOUNDATION.md`) e Frontend (2.H.6, 27/27 cenários funcionais) concluídos e homologados individualmente. **Homologação final do Product Owner (Sprint 2.H.7):** revisão documental (blueprint × regras de negócio × implementação, 13/13 regras verificadas), homologação funcional sob ótica de negócio (10/10 fluxos aprovados, nenhum defeito bloqueante, 1 ajuste de linguagem realizado), validação do negócio, revisão de qualidade — **módulo oficialmente encerrado**. 5 telas em produção (`/admin/embalagens`, `/admin/embalagens/categorias`, `/admin/embalagens/[id]`, `/admin/produtos/[id]` — as duas últimas novas), 100% Design System reutilizado. **Pendência de escopo mantida (não bloqueante, decisão já aprovada):** `Product.costPrice` ainda não soma o custo de `ProductPackaging` (Regra 11) — candidata a módulo/sprint futura dedicada. **Débito documental registrado (pré-existente, não específico deste módulo):** `MENU_STRUCTURE.md`/`SCREENS.md` desatualizados desde a Sprint P1. **`MODULE_2H_CLOSURE.md` criado retroativamente na Sprint 2.I.0** (lacuna identificada — único módulo sem documento de encerramento dedicado até então) |
| **2.I** | Receitas: CRUD `Recipe` + `RecipeIngredient` + custo calculado automaticamente | 2.G + 2.D (2.H não é dependência real — `RecipeIngredient` não tem nenhum campo/relação com `Packaging`, confirmado no schema e em `REGRAS_NEGOCIO.md` Seção 6; embalagem afeta custo do Produto, não da Receita) | ✅ **Concluído** — 15/07/2026 (Sprints 2.I.1–2.I.3) — ver [MODULE_2I_CLOSURE.md](MODULE_2I_CLOSURE.md). Módulo de referência oficial para fluxos Mestre/Detalhe do ERP. Dados ausentes identificados na Sprint I.1 e regularizados na Sprint I.2 (17/07/2026); **revalidação funcional completa em ambiente sincronizado executada na Sprint I.3 (17/07/2026)** — CRUD de receita e itens, bloqueio de duplicidade/último item, cálculo de custo e atualização automática confirmados com dados reais, 0 regressões — ver `CHANGELOG.md`, Sprints I.1/I.2/I.3 |
| **2.J** | Produtos (Fase 2): RecipeLinker + `costPrice` automático + CMV base | 2.I (2.F não é dependência técnica do Backend — ver ADR-011 em `CLAUDE.md`; histórico original da dependência "2.F + 2.I" preservado em `CHANGELOG.md`, Sprint 2.J.1) | ✅ **Concluído** — 17/07/2026 (Sprints 2.J.1–2.J.2.1 + QA/Homologação na Sprint I.3) — ver [MODULE_2J_CLOSURE.md](MODULE_2J_CLOSURE.md). Bloqueio de infraestrutura levantado por hipótese na Sprint 2.J.2.1, confirmado por evidência na Sprint I.1 e regularizado na Sprint I.2; **QA Funcional e Homologação executados na Sprint I.3** — RecipeLinker validado ponta a ponta com dados reais e recém-criados (`costPrice`/margem corretos em dois casos, atualização automática confirmada), 0 regressões — ver `CHANGELOG.md`, Sprints I.1/I.2/I.3 |
| **2.K** | Dashboard Operacional: Kanban real + consolidação de ingredientes + CMV do dia/semana (KI-04) | 2.I + 2.J + Orders | ✅ **Concluído — 02/08/2026** (Sprints 2.K.1–2.K.4) — ver [MODULE_2K_CLOSURE.md](MODULE_2K_CLOSURE.md) e `CHANGELOG.md`. Primeiro módulo conduzido integralmente pela orquestração de Sub-agents (ADR-017) — `ai-project-manager` (planejamento), `ai-backend-engineer` (2.K.1/2.K.2/2.K.4 + correção do contador de urgentes), `ai-frontend-engineer` (2.K.3/2.K.4). Resolve KI-04/TD-11/BT-08. **Achado de segurança corrigido:** rota antiga `PATCH /api/orders/[id]/status` (sem `requireAdmin()`) removida. **Achado de regra de negócio corrigido:** `REGRAS_NEGOCIO.md` 14.1 ajustada (urgente exclui `RASCUNHO`/`CANCELADO`). **Achado de constatação:** IC-06/BT-12 já estavam resolvidos em `src/app/pedidos/page.tsx` antes deste módulo — fechados por constatação, não por implementação. Validação Funcional (13/13) e Homologação sem bloqueantes — 2 achados Backlog/Evolução. Pedido de redesign visual do Product Owner registrado como Backlog Suggestion (ver seção própria acima), não implementado |
| **2.L** | Clientes: visão admin de `Customer` + histórico + notas internas + LTV | Orders (existem) | ✅ **Concluído — 02/08/2026** (Sprints 2.L.1–2.L.5) — ver [MODULE_2L_CLOSURE.md](MODULE_2L_CLOSURE.md) e `CHANGELOG.md`. **Último módulo do Épico 2 — épico inteiro (12 módulos, 2.A–2.L) encerrado.** Deduplicação de `Address` (KI-10/BT-11) implementada como agregação só de exibição, sem nenhuma escrita em `Address`/`Order` — decisão do `ai-solution-architect`. Divergência real (`addressId` ausente no histórico) encontrada e corrigida na mesma sprint. Validação Funcional 13/13, Homologação sem nenhum achado (primeira vez no projeto). LGPD/privacidade e causa raiz de KI-10 seguem como Backlog Suggestions, por decisão do Product Owner |

### Backlog Suggestions (sem numeração — `PROJECT_GOVERNANCE.md` Seção 4.2)

Propostas registradas mas ainda não aprovadas como Sprint Oficial — não interferem na sprint em andamento (Seção 4.3: enquanto o Módulo 2.K estiver aberto, entre aprovação e encerramento, nenhuma Sprint Oficial nova pode ser criada; toda melhoria identificada nesse intervalo fica registrada aqui).

| Proposta | Origem | Descrição |
|---|---|---|
| ~~**Redesign do Design System**~~ → ✅ **Concluído como Sprint `DS.1`, 03/08/2026** | Product Owner, 02/08/2026, durante a Sprint 2.K.3 | Direção "Ateliê Contemporâneo" escolhida entre 3 opções apresentadas visualmente (Artifact, comparação lado a lado no mesmo Painel de Produção real). Implementada trocando só os 6 valores hex dos tokens já usados em todo o app (`globals.css`) — propagação automática para admin e cliente final, sem editar página por página. Contraste WCAG verificado e um valor ajustado (`sage`) antes de aplicar. Validação visual 8/8 páginas aprovadas. Achado incidental fora de escopo: `KI-18` (chave React duplicada na vitrine, não relacionado à cor) registrado em `KNOWN_ISSUES.md`. Ver `CHANGELOG.md`, Sprint DS.1. |
| ~~**Redesenho de front-end mais amplo (layout + componentes, não só cor)**~~ → ✅ **Concluído como Sprint `DS.2`, 04–05/08/2026** | Product Owner, 04/08/2026 | Direção "A × C" escolhida por comparação visual (Artifact, 3 direções + 1 combinação pedida explicitamente pelo PO), mesmo processo de DS.1. Paleta nova (6 tokens + `surface-2`, contraste WCAG ajustado em `rose`/`sage`), produto-herói + gradiente determinístico na Vitrine (substitui emoji cru), sidebar de admin filtrada por papel (20 páginas, especificada em `UX_GUIDELINES.md` desde a Sprint P1, nunca implementada até agora), `PageContainer` revisado + 7 páginas legadas migradas, acento de coluna ativa no Kanban. Validação funcional real em 3 breakpoints (desktop/tablet/mobile, `ADR-010`) + filtro de papel testado com usuário `PRODUCAO` real. Ver `CHANGELOG.md`, Sprint DS.2. |
| ~~**Redesenho a partir de modelo de referência real ("Modelo 1")**~~ → ✅ **Concluído como Sprint `DS.3`, 10/08/2026** | Product Owner, 10/08/2026 | Substitui a direção `DS.2` em todo o app (admin + cliente final), a partir de um arquivo HTML real fornecido pelo PO (painel de Estoque & Financeiro, visual SaaS/back-office). Fonte única `Manrope` (substitui Fraunces+DM Sans), token novo `--caramel` (contraste WCAG calibrado, valor cru do modelo falhava como texto), correção de sobreposição de significado de `rose` em 4 lugares (item ativo da Sidebar, coluna "Em produção" do Kanban, badge "Destaque", `STATUS_CLASS` de `/pedidos` — este último também corrigindo Tailwind cru pré-existente fora do design system). `ProductCard`/`ProductHero` migrados de gradiente para ícone flat + borda (mesma linguagem do admin); `getProductGradientClass()` removido (código morto). Componentes novos sem tela consumidora real ainda, construídos por decisão explícita do PO: `BarChart`, `StockItem`, badge de variação em `StatCard`. Bug real encontrado e corrigido durante a implementação: `.font-display` ficaria silenciosamente quebrado (fallback serifado) após a troca de fonte, se não corrigido. Validação funcional real em 3 breakpoints, 0 erros de console. Ver `CHANGELOG.md`, Sprint DS.3. |
| ~~**Política de LGPD/privacidade**~~ → ✅ **Concluído como Sprint `PRIV.1`, 03/08/2026** | `ai-project-manager`, 02/08/2026, Planejamento do Módulo 2.L | O Módulo 2.L (Clientes) expõe telefone, endereço e notas internas de clientes reais no admin, sem nenhuma política registrada em `REGRAS_NEGOCIO.md` e sem controle de granularidade por `UserRole` sobre quem pode ver essas notas. **Priorizado pelo Product Owner em 03/08/2026** — novo prefixo `PRIV.x` criado (ADR-019). Implementado como fatia restrita ao domínio Clientes (ADR-020): `requireRole.ts` (nova primitiva genérica), `/api/admin/customers/**` e `/admin/clientes` restritos a `ADMIN`+`ATENDIMENTO` (`notes` com acesso total, sem redação condicional por campo), `src/proxy.ts` corrigido para cobrir sub-rotas dinâmicas. `REGRAS_NEGOCIO.md` Seção 15.6 (regra 18, nova). As outras 51 rotas `/api/admin/**` (mesma inconsistência binária ADMIN-ou-nada) ficam como Backlog Suggestion para uma futura `PRIV.2`. Ver seção "Backlog Suggestions" acima para a nota de escopo (salvaguardas técnicas, não substitui revisão jurídica); ver `CHANGELOG.md`, Sprint PRIV.1. |
| ~~**Granularidade por `UserRole` nas demais 51 rotas `/api/admin/**`**~~ → ✅ **Concluído como Sprint `PRIV.2`, 03/08/2026** | `ai-solution-architect`, 03/08/2026, Planejamento da Sprint PRIV.1 | Achado ao planejar PRIV.1: `requireAdmin()` era (e continua sendo, fora do escopo tratado) binário `ADMIN`-ou-nada. **Escopo efetivamente implementado (ADR-021):** Pedidos/Produção (`requireOrderAccess()` — `ADMIN`+`ATENDIMENTO`+`PRODUCAO`, união por não existir `/admin/pedidos` separada de `/admin/producao`), Financeiro (`requireFinance()` — `ADMIN`+`FINANCEIRO`), `src/proxy.ts` (`/admin/producao`), normalização de `upload/route.ts` para `requireAdmin()`. **Decisão explícita do Product Owner, fora do escopo:** as 45 rotas de Catálogo (categorias/ocasiões/produtos) e Cadeia Produtiva (unidades/ingredientes/receitas/embalagens/fornecedores) permanecem `ADMIN`-only — sem papel definido em `REGRAS_NEGOCIO.md` (pendência registrada na Seção 16). Achado à parte, também fora do escopo: `storeConfigService.ts` verifica papel dentro do Service (violação de camada) — registrado como `KI-19`, dívida técnica para sprint dedicada. Validação funcional real (Playwright, 4 papéis) confirmou a matriz completa em `/admin/producao` + APIs de pedidos/CMV/upload, 0 divergências. Ver `CHANGELOG.md`, Sprint PRIV.2. |
| ~~**Papel para Cadeia Produtiva (33 rotas, pendência de PRIV.2)**~~ → ✅ **Concluído como Sprint `PRIV.3`, 04/08/2026** | Product Owner, 04/08/2026, logo após o encerramento de PRIV.2 | **Escopo efetivamente implementado (ADR-022):** `requireProductionChain()` (`ADMIN`+`PRODUCAO`) aplicado às 31 rotas "puras" de Unidades/Ingredientes/Receitas/Fornecedores/Embalagens + 5 entradas em `src/proxy.ts` (`/admin/unidades`, `/admin/ingredientes`, `/admin/receitas`, `/admin/fornecedores`, `/admin/embalagens`). **Decisão explícita do Product Owner:** Catálogo (categorias/ocasiões/produtos) permanece `ADMIN`-only, sem mudança — pendência mantida em `REGRAS_NEGOCIO.md` Seção 16. **Exceção dentro da Cadeia Produtiva, decisão explícita:** `products/[id]/packagings/**` (2 rotas) mantido `ADMIN`-only — única UI consumidora (`/admin/produtos/[id]`) é página de Catálogo `ADMIN`-only, sem caminho de uso real para `PRODUCAO` hoje; revisitar se essa página for desmembrada no futuro. Validação funcional real (Playwright, papéis `PRODUCAO`/`ATENDIMENTO`/`ADMIN`) confirmou a matriz completa nas 5 páginas + 7 sub-domínios de API + exceção de `products/[id]/packagings`, 0 divergências. Ver `CHANGELOG.md`, Sprint PRIV.3. |
| ~~**Redistribuição responsiva da área cliente (Vitrine + Checkout/Pedidos/Login)**~~ → ✅ **Concluído como Sprint `DS.4`, 11/08/2026** | Product Owner, 11/08/2026 | Cores/tipografia da Sprint DS.3 já corretas; o pedido foi especificamente sobre layout/responsividade — a área cliente não aproveitava a largura em telas maiores, ao contrário do admin (DS.2). **Escopo efetivamente implementado (ADR-024):** route group `src/app/(client)/` + `ClientShell.tsx` (paralelo a `AdminShell.tsx`); `VitrineSidebar.tsx` recolhível com ícones reais de `lucide-react` (`OccasionTag.icon`, antes sempre `"calendar"`, atualizado com um ícone por ocasião); breakpoint `md` (768px, igual ao admin — decisão explícita do PO, não a recomendação original `lg`) em vez de um breakpoint próprio da área cliente; carrinho (`CartFab`/`CartDrawer`/`Toast`) centralizado no `ClientShell`, disponível em todas as páginas cliente (decisão explícita do PO); `CartDrawer` ganhou variante desktop (painel `w-96` ancorado à direita). Checkout: 2 colunas em `lg:`+; Pedidos: grid `lg:grid-cols-2`; Login: centralizado verticalmente. **Achado corrigido durante a validação funcional:** `CartFab` global sobrepunha o botão final de confirmação do Checkout em mobile — corrigido ocultando o `CartFab` especificamente nessa rota, validado com o Product Owner. Validação funcional real em 3 breakpoints (mobile/tablet/desktop, incluindo o limite exato de 768px) com pedidos reais criados e removidos após o teste, 0 erros de console. Ver `CHANGELOG.md`, Sprint DS.4. |
| ~~**Redesign completo com shadcn/ui (admin + cliente)**~~ → ✅ **Concluído como Sprint `DS.5`, 27–28/08/2026** | Product Owner, 27/08/2026 | Insatisfação recorrente com o resultado visual mesmo após 4 rounds de redesign (`DS.1`–`DS.4`), que só trocaram paleta/tokens/layout — nunca a implementação dos componentes. Diagnóstico: Tailwind CSS não era o limitador, a ausência de uma camada de componentes testada (focus trap, diálogos acessíveis, variantes consistentes) era. **Escopo efetivamente implementado (ADR-025):** shadcn/ui adotado (Radix + Tailwind, código copiado para o repo) em 7 microtarefas (`DS.5.1`–`DS.5.7`), mapeando os 8 tokens já existentes para as variáveis semânticas do shadcn — nenhuma cor nova. `EntityForm`/`ConfirmDialog`/`StatusBadge`/`EntityCard` (13 páginas consumidoras) migrados para `Dialog`/`AlertDialog`/`Badge`/`Card`; 2 páginas legadas (`categorias`, `ocasioes`) que ainda duplicavam esses componentes localmente foram migradas para os compartilhados; Módulo Configuração (`FormPrimitives`, `ActionBar`, `UploadImage`); `CartDrawer`/`CartFab` migrados para `Sheet`; toasts (carrinho + `ValidationSummary`, 17 páginas admin) migrados para `sonner` com padrão `loading→success/error` via `id` — `ValidationSummary.tsx` removido (código morto). **Dois achados reais do próprio `shadcn init`, corrigidos antes de validar:** sobrescreveu `src/lib/utils.ts` inteiro (apagando `getMinDeliveryDate`) e adicionou uma fonte Geist não solicitada, contra a decisão de fonte única da Sprint `DS.3` — ambos revertidos. **Erro cometido e corrigido na sessão:** alterou `bg-red-50`/`text-red-700` das mensagens de erro de `checkout`/`login`/`pedidos` sem checar o histórico — decisão já tomada e reafirmada nas Sprints `DS.1`/`DS.3` de mantê-las como cor semântica crua, fora da identidade de marca; revertido ao valor original. Validação funcional real (Playwright) em cada microtarefa. Ver `CHANGELOG.md`, Sprint DS.5. |

## ÉPICO 5 — Módulos (5.A–5.E, proposta)

> **Planejamento arquitetural inicial (05/08/2026).** Mesmo padrão da Sprint `2.0` do Épico 2: análise de escopo por sub-domínio antes de qualquer implementação. Nomenclatura e sequência **propostas**, não uma ordem fixa imposta — o Product Owner escolhe o próximo módulo a cada etapa. `PIX` (`5.D`) tem risco de bloqueio de infraestrutura (webhook exige domínio público com HTTPS em produção, não confirmado); recomendado ficar por último entre os que atacam `KI-03`.

| Módulo | Descrição | Dependências | Status |
|--------|-----------|---------------|--------|
| **5.A** | Google Maps (Distance Matrix) — substitui `distanceKm` hardcoded no checkout | Nenhuma | Planejado |
| **5.B** | WhatsApp OTP (login real do cliente) + Notificações (mudança de status de pedido) | Nenhuma | ✅ **Concluído — 05/08/2026** — ver `CHANGELOG.md`. `whatsappClient.ts` (Evolution API, ADR-023), `otpService.ts` (`OtpCode.attempts`, máx. 3 tentativas), `authorize()` do NextAuth validando código real, `whatsappNotificationService.ts` (4 status disparam mensagem: Confirmado/Pronto/Saiu para entrega/Entregue, textos aprovados em `REGRAS_NEGOCIO.md` 12.10). Resolve `KI-05`. Validação funcional real (Playwright, banco real): fluxo completo de login (código errado/certo, tentativas, sessão) e hook de notificação (`EM_PRODUCAO`→`PRONTO`) confirmados ponta a ponta — só o envio real da mensagem (chegando de fato no WhatsApp) depende do Product Owner preencher as credenciais reais da instância Evolution API no `.env` |
| **5.C** | ~~Notificações WhatsApp~~ | — | Absorvido pelo Módulo `5.B` (mesmo client, decisão de escopo do Product Owner ao iniciar a implementação) |
| **5.D** | PIX (geração de cobrança + webhook `PIX_ONLINE`) | Confirmação de domínio/HTTPS público em produção (infraestrutura, fora do controle desta sprint) | Planejado |
| **5.E** | ~~CONAB/CEASA~~ → **Importador de NFC-e** (preço real de compra via `PriceSource.NOTA_FISCAL`, schema já pronto desde o Módulo 2.G) | Nenhuma | ✅ **Concluído — 06/09/2026** — ver `CHANGELOG.md`. Escopo redefinido após pesquisa real confirmar que CONAB/CEASA não têm API pública; substituído por importador de nota fiscal (`/admin/ingredientes/importar-nota`), sugestão do Product Owner. Consulta o portal público da SEFAZ-SP a partir do link completo do QR Code (cobre só notas de São Paulo, `cUF=35`); admin sempre confirma manualmente o vínculo item↔ingrediente antes de gravar. Validado com nota fiscal real via Playwright + banco real |

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
