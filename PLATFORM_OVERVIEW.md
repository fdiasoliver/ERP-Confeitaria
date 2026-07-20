# PLATFORM_OVERVIEW.md — Porta de Entrada da Plataforma Doce Menina

Documento de entrada única da plataforma, criado na Sprint G.6.1 (Platform & Product Architecture Consolidation). Não duplica nenhum documento já existente — aponta para a fonte de verdade de cada assunto e formaliza o que ainda não tinha um lar documental próprio (Multi-tenant, White Label, Theme Engine, Experience Review vs. Platform Review).

---

## O que é esta plataforma?

Um ERP vertical de gestão de encomendas para confeitarias artesanais, evoluindo para uma plataforma SaaS white-label multi-tenant (`ERP_PRODUCT_VISION.md`). Domínio de negócio completo em `CLAUDE.md` (raiz) e `REGRAS_NEGOCIO.md`. **Estado atual:** single-tenant, um único cliente de referência (Doce Atelier) — ver a nota de transparência em `ERP_PRODUCT_VISION.md` antes de assumir que multi-tenência já existe no código.

## Qual é o ambiente de execução oficial?

Sistema **Web**, totalmente **responsivo** (Desktop, Tablet, Smartphone — critério mínimo de aceite, `PROJECT_GOVERNANCE.md` Seção 8.8). Produção roda em **VPS Linux** — scripts e automação novos priorizam compatibilidade com Linux, evitando dependência exclusiva de Windows. Formalizado na Sprint G.6.2 (Product Runtime Standards, ADR-010) — detalhe completo em `PROJECT_GOVERNANCE.md` Seção 8.8, não duplicado aqui.

## Como está organizada?

```
Documentação de produto/negócio (raiz)         → CLAUDE.md, REGRAS_NEGOCIO.md, DOMAIN_MODEL.md, DESIGN_SYSTEM.md, UX_GUIDELINES.md
Documentação de governança/processo (raiz)     → PROJECT_GOVERNANCE.md, ERP_DEVELOPMENT_WORKFLOW.md, PLAN.md, CHANGELOG.md
Documentação de visão de plataforma (raiz)     → ERP_PRODUCT_VISION.md, PLATFORM_OVERVIEW.md (este documento)
Infraestrutura de IA (.claude/)                 → Skills, Sub-agents, Contracts, Protocols, Playbooks, Architecture
Código do ERP (src/, prisma/)                   → o produto real
```

## Quais documentos ler primeiro?

1. `CLAUDE.md` (raiz) — sempre, é carregado em toda sessão.
2. `PROJECT_GOVERNANCE.md` — antes de qualquer sprint.
3. `ERP_PRODUCT_VISION.md` — antes de decisão que toque identidade de tenant/branding/multi-tenência.
4. Este documento — para se orientar na estrutura completa.
5. `.claude/CLAUDE.md` — antes de criar/alterar qualquer Skill/Sub-agent/Contract/Playbook.
6. `REGRAS_NEGOCIO.md`/`DOMAIN_MODEL.md` — antes de implementar qualquer entidade de domínio.

## Quais agentes existem?

11 Sub-agents reais (`.claude/agents/`, ver `CATALOG.md`/`README.md` daquela pasta): 9 implementados na Sprint G.5.4 (`ai-project-manager`, `ai-solution-architect`, `ai-backend-engineer`, `ai-frontend-engineer`, `ai-qa-engineer`, `ai-governance-officer`, `ai-documentation-engineer`, `ai-refactoring-engineer`, `ai-release-manager`), `product-reviewer` (10º, Sprint G.6) e `platform-reviewer` (11º, Sprint G.6.1).

## Quais Skills existem?

17 Skills de domínio (`.claude/skills/`, ver `project-skill-governance/references/SKILL_MATRIX.md`) + a meta-skill `project-skill-governance`: as 14 originais (processo de sprint, camadas de código, governança), `schema-pattern` (G.5.2), `product-review` (G.6) e `platform-review` (G.6.1, esta sprint).

## Como funciona o AI Operating System?

8 camadas (`CLAUDE.md` raiz → Meta-Skill → Skills → Contracts → Operational Protocols → Sub-agents → Playbooks → ERP) — detalhe completo em `.claude/architecture/AI_OPERATING_SYSTEM.md` e `LAYER_MODEL.md`. Não repetido aqui.

## Como funciona o Workflow?

Toda Ordem de Missão de desenvolvimento do ERP segue `ERP_DEVELOPMENT_WORKFLOW.md` — fluxo oficial atual:

```
Backend → API → Frontend → Platform Review → Product Review → Demo Validation → QA → Encerramento
```

`Platform Review`, `Product Review` e `Demo Validation` só se aplicam quando a missão implementou/alterou o código correspondente (Platform Review sempre que há Backend ou Frontend novo; Product Review e Demo Validation só quando há Frontend). Ver Seção "Experience Review vs. Platform Review" abaixo para a distinção entre as três disciplinas de revisão — Demo Validation avalia o fluxo de negócio ponta a ponta (`DEMO_GUIDE.md`), nunca a experiência de uma página isolada (isso é Product Review) nem a arquitetura de plataforma (isso é Platform Review).

## Como desenvolver novos módulos?

Seguir `ERP_DEVELOPMENT_WORKFLOW.md` (fluxo) + a Skill de camada aplicável (`schema-pattern`/`repository-pattern`/`api-pattern`/`frontend-pattern`) + `coding-standards` — nenhuma novidade desta sprint, apenas apontado aqui para quem chega pela primeira vez.

## Como ocorre uma Sprint?

`PROJECT_GOVERNANCE.md` Seção 4 (fluxo obrigatório: Planejamento → Implementação → Revisão Técnica → Product Review/Platform Review (quando aplicável) → QA → Documentação → Aceite). Ver também `.claude/skills/sprint-governance/SKILL.md`.

## Como funciona o SaaS?

Ver `ERP_PRODUCT_VISION.md` Seção 4. Resumo: cada tenant opera com dados isolados; o tenant de referência atual (Doce Atelier) não é parte fixa da arquitetura, é um cliente entre outros possíveis; multi-tenência estrutural (schema) ainda não implementada — trabalho futuro, com ADR dedicada.

## Como funciona o White Label?

### O que pode ser customizado por tenant

| Item | Customizável | Mecanismo |
|---|---|---|
| Nome fantasia | ✅ | `StoreConfig` |
| Razão social | ✅ | `StoreConfig` |
| Logo | ✅ | `StoreConfig` (upload já existente, `/admin/config`) |
| Favicon | ✅ | Theme Engine (ver Seção abaixo) |
| Cor primária/secundária | ✅ — dentro do conjunto suportado pelo Theme Engine | Theme Engine |
| Ícones | ✅ — dentro do conjunto suportado | Theme Engine |
| Tipografia | ⚠️ Quando suportado (não implementado hoje — `DESIGN_SYSTEM.md` usa Fraunces/DM Sans fixos) | Theme Engine (futuro) |
| Rodapé | ✅ | `StoreConfig`/templates |
| Login | ✅ (logo/nome exibidos) | `StoreConfig` |
| PDFs/Relatórios/Impressões | ✅ (identidade visual) | Theme Engine (templates) |
| WhatsApp | ✅ (identidade nas mensagens) | Theme Engine (templates) |
| QR Code PIX | ✅ (dados da chave PIX do tenant) | `StoreConfig` |
| Templates de e-mail | ✅ | Theme Engine (templates) |
| Menu (estrutura) | ❌ | Fixo — estrutura de navegação é parte do produto |

### O que nunca pode ser customizado por tenant

- Estrutura de dados (`prisma/schema.prisma`) — mesmo schema para todos os tenants.
- Regras de negócio (`REGRAS_NEGOCIO.md`) — mesmo comportamento para todos os tenants.
- Arquitetura de camadas (`PROJECT_GOVERNANCE.md` Seção 8) — Route → Service → Validator → Repository → Prisma, sempre.
- Estrutura de menu/navegação (`MENU_STRUCTURE.md`) — a navegação é o produto, não a casca visual dele.
- Fluxo de sprint/governança (`PROJECT_GOVERNANCE.md`) — um único processo de desenvolvimento para toda a plataforma.

## Como funciona o Multi-tenant?

Ver `ERP_PRODUCT_VISION.md` Seções 4 e 6. **Estado atual: não implementado no schema.** Todo módulo novo deve, a partir de agora, evitar hardcode de identidade de tenant (verificado por `platform-reviewer`), preparando o terreno para a implementação futura sem se antecipar a ela.

---

## Theme Engine (arquitetura documental — nenhuma implementação nesta sprint)

Suporte documentado (não implementado) para: Logo, Nome fantasia, Razão social, Cor primária, Cor secundária, Ícones, Favicon, Tipografia (quando suportado), Rodapé, Login, PDFs, Relatórios, Impressões, WhatsApp, QR Code PIX, Templates de e-mail.

**Estado hoje:** `StoreConfig` (Prisma, já implementado desde a Sprint 0.5/2.D) já cobre nome fantasia, razão social, logo (upload), endereço, PIX — é o precursor funcional do Theme Engine, para um único tenant. O Theme Engine formal (por tenant, com fallback de tema, múltiplos temas simultâneos) é a evolução futura de `StoreConfig` quando a multi-tenência for implementada — mesmo padrão de dado, escopo mais amplo. Nenhum campo novo, model novo ou migração foi criado nesta sprint.

## Experience Review vs. Platform Review

Duas disciplinas de revisão, complementares e nunca sobrepostas, ambas executadas entre Implementação e QA:

| | Experience Review (`product-review`, Sprint G.6) | Platform Review (`platform-review`, Sprint G.6.1) |
|---|---|---|
| Avalia | UX, UI, Navegação, Fluxos, Produtividade, Consistência visual, Responsividade, Acessibilidade, Branding, White Label **na experiência entregue ao usuário** | Multi-tenant, Branding, White Label, Theme Engine, Isolamento de dados, Parametrização **na arquitetura do módulo** |
| Pergunta central | "A experiência é boa?" | "Isto quebraria se rodasse para um segundo tenant com identidade diferente?" |
| Sub-agent | `product-reviewer` | `platform-reviewer` |
| Bloqueia quando | Categoria A — Problema Funcional (`PROJECT_GOVERNANCE.md` Seção 16.5) | Quebra de parametrização já existente (não lacuna de escopo futuro) |

**Nota de formalização (Sprint G.6.1):** a Sprint G.6 criou Product Review como disciplina de qualidade de produto; esta sprint formaliza que Product Review passa a fazer parte de uma disciplina mais ampla, **Experience Review**, que agora inclui explicitamente Branding e White Label como dimensões avaliadas — sem alterar `product-review/SKILL.md` nem `product-reviewer.md` (ambos preservados intactos, conforme exigido pela Ordem de Missão desta sprint). Branding/White Label do lado de **experiência do usuário** (ex.: o logo aparece corretamente na tela? o nome da empresa está correto no rodapé?) são responsabilidade de Product Review dentro dessa disciplina mais ampla; Branding/White Label do lado de **arquitetura** (ex.: o logo está hardcoded no componente ou vem de `StoreConfig`?) são responsabilidade de Platform Review. A distinção evita que os dois papéis avaliem a mesma coisa por ângulos redundantes.

---

Precedência: em caso de conflito entre este documento e `PROJECT_GOVERNANCE.md`, `ERP_PRODUCT_VISION.md`, `CLAUDE.md` (raiz) ou `.claude/architecture/AI_OPERATING_SYSTEM.md`, os documentos originais sempre prevalecem — este documento é um mapa de navegação, não uma fonte primária.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.6.1 (Platform & Product Architecture Consolidation). v1.1 em 16/07/2026 — Sprint T.3 (Demo Environment & Product Validation Platform): diagrama "Como funciona o Workflow?" atualizado com a etapa Demo Validation. v1.2 em 16/07/2026 — Sprint G.6.2 (Product Runtime Standards, ADR-010): nova seção "Qual é o ambiente de execução oficial?". -->
