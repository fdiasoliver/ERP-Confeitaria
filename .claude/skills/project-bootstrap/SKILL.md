---
name: project-bootstrap
description: Use this skill when starting a new session on the Doce Menina confeitaria-app project, or whenever an AI needs to orient itself in the project for the first time — project objective, stack, architecture, mandatory documents, official reading order, and criteria before starting any sprint. This is the onboarding/orientation skill. For the detailed sprint execution process (Orchestrator/Executor/Auditor roles, FASEs, Estados da Sprint, SPRINT_X.md/SPRINT_AUDIT.md), use the sprint-governance skill instead — this skill only points to it.
---

# Project Bootstrap — Doce Menina (confeitaria-app)

Esta Skill orienta qualquer IA que esteja assumindo este projeto pela primeira vez em uma sessão. Ela **não** substitui os documentos originais — apenas consolida o essencial para não começar a trabalhar sem contexto, e aponta para onde está o detalhamento completo de cada assunto. Não repete o processo de sprint (isso é `sprint-governance`) nem regras de código de camada (isso é `architecture` e as demais skills de camada).

Fonte de verdade permanece nos documentos originais: `CLAUDE.md`, `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, `AI_PROMPT_ORCHESTRATOR.md`. Em caso de dúvida ou conflito, releia o documento referenciado.

## 1. Objetivo

Dar a qualquer IA nova neste projeto o contexto mínimo — objetivo, stack, arquitetura, documentos obrigatórios, ordem de leitura — antes de tocar em qualquer arquivo.

## 2. Quando utilizar

- No primeiro contato de uma sessão com este projeto.
- Sempre que uma IA precisar se reorientar após perder contexto (ex.: nova sessão, handoff entre IAs).

## 3. Quando NÃO utilizar

- Para executar, planejar ou auditar uma sprint em andamento — usar `sprint-governance`, `orchestrator`, `sprint-planning`, `sprint-execution` ou `sprint-audit` diretamente.
- Para escrever código — usar `architecture`, `api-pattern`, `repository-pattern`, `frontend-pattern`, `schema-pattern` ou `coding-standards`.
- No meio de uma sessão que já leu os documentos originais — reler esta Skill nesse ponto é redundante, não agrega nada novo.

## 4. Responsabilidades

### 4.1 Objetivo do projeto

**Doce Menina** é um sistema de gestão de encomendas para uma confeitaria artesanal. Abrange dois domínios:

- **Cliente final:** vitrine de produtos, carrinho, checkout, histórico de pedidos.
- **Equipe interna:** dashboard de produção (Kanban), backoffice administrativo (ERP).

Ver `CLAUDE.md` (seção "Objetivo do sistema") e `VISION.md` para a visão estratégica de produto.

### 4.2 Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js (App Router) |
| UI | React |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS |
| ORM | Prisma |
| Banco de dados | PostgreSQL |
| Auth | NextAuth |
| Fontes | Fraunces (display) + DM Sans (UI) |

Versões exatas e dependências completas: `CLAUDE.md`, seções "Stack utilizada" e "Dependências importantes".

### 4.3 Arquitetura

Fluxo de camadas obrigatório, sem inversão de responsabilidades:

```
Route Handler → Service → Validator → Repository → Prisma
(src/app/api)    (src/lib)  (src/lib)   (src/lib)   (singleton)
```

Detalhamento de responsabilidades e proibições de cada camada: `PROJECT_GOVERNANCE.md` Seção 8; aprofundamento técnico: skill `architecture`.

Estrutura de pastas principal:
- `src/app/` — páginas (App Router) e rotas de API (`src/app/api/`)
- `src/components/` — componentes React, organizados por domínio (`admin/`, `layout/`, `vitrine/`)
- `src/lib/` — `types.ts` (tipos centrais), `prisma.ts` (singleton), `repositories/`, `validators/`, `*Service.ts`, `api/` (clientes HTTP do front-end)
- `src/context/`, `src/hooks/` — estado global e hooks
- `prisma/schema.prisma` — schema do banco

Padrões de nomenclatura: `CLAUDE.md`, seção "Convenções de nomenclatura"; `PROJECT_GOVERNANCE.md` Seção 3; aprofundamento: skill `coding-standards`.

### 4.4 Documentos obrigatórios

| Documento | Quando consultar |
|-----------|-------------------|
| `CLAUDE.md` | Sempre, antes de qualquer implementação — visão geral, stack, convenções |
| `PROJECT_GOVERNANCE.md` | Sempre — regras de arquitetura e processo, não-negociável |
| `REGRAS_NEGOCIO.md` | Sempre — fonte de verdade das regras de negócio do domínio |
| `PLAN.md` | Sempre — estado atual do roadmap e dos módulos |
| `CHANGELOG.md` | Sempre — histórico factual de sprints |
| `docs/ai/AI_PROMPT_ORCHESTRATOR.md` | Sempre — processo oficial de execução de sprints (skill `sprint-governance`) |
| `ARCHITECTURE.md` | Antes de mudanças estruturais |
| `DOMAIN_MODEL.md` | Antes de adicionar entidades ou rotas |
| `MODULES.md` | Antes de planejar uma sprint |
| `KNOWN_ISSUES.md` | Antes de implementar qualquer feature |
| `MENU_STRUCTURE.md` | Antes de criar qualquer rota admin |
| `SCREENS.md` | Antes de implementar qualquer tela |
| `USER_FLOW.md` | Antes de implementar qualquer fluxo |
| `DESIGN_SYSTEM.md` / `UX_GUIDELINES.md` | Antes de implementar qualquer tela ou componente |
| `VISION.md` | Para validar decisões de produto |

Lista completa e descrição de cada documento: `CLAUDE.md`, seção "Documentação de arquitetura e produto".

### 4.5 Responsabilidades (papéis)

| Papel | Responsabilidade central |
|-------|---------------------------|
| Product Owner | Define requisitos, aprova funcionalidades e prioridades, aprova alterações arquiteturais |
| Orchestrator | Analisa impacto arquitetural e gera `SPRINT_X.md` + `SPRINT_AUDIT.md` — não implementa código |
| Executor | Valida, implementa, executa validações, produz relatórios — não decide arquitetura sem autorização |
| Auditor | Revisa implementação e documentação, classifica achados, aprova ou solicita correção — não implementa código |

Papéis são arquiteturais, não ferramentas específicas — qualquer IA pode assumir qualquer papel. Definições completas: `AI_PROMPT_ORCHESTRATOR.md` Seção 2.

### 4.6 Metodologia

- Cada **sprint** é uma entrega técnica atômica de **uma única camada** de um módulo (schema, repository, validator, service, API, front-end ou documentação) — nunca várias camadas na mesma sprint.
- Implementação sempre **uma microtarefa por vez** — não avançar sem concluir e validar a atual.
- **Aprovação explícita** do Product Owner é exigida em cada ponto de decisão: início de sprint, avanço entre microtarefas e encerramento.
- Módulos de correção seguem regra de isolamento: cada sprint toca uma única camada, sem misturar Schema/TypeScript/Repository na mesma entrega.

Definições completas: `PROJECT_GOVERNANCE.md` Seções 2 e 3.

### 4.7 Boas práticas (resumo)

- TypeScript: nunca usar `any`; `type` para union types/enums, `interface` para objetos.
- Componentes React: `"use client"` obrigatório com hooks; `type="button"` explícito em botões; `aria-label` em ícones/botões sem texto.
- Estilização: apenas as cores do design system (`cream`, `chocolate`, `rose`, `sage`, `sand`, `muted`); classes utilitárias existentes (`.max-w-app`, `.shadow-card`, `.input-field`, `.option-card`); `.font-display` para títulos.
- Dados: usar utilitários já existentes (`formatCurrency`, `getMaxLeadTimeDays`, `getMinDeliveryDate`) em vez de reimplementar; preservar snapshots em `OrderItem`.
- Qualidade de código: sem função duplicada; sem lógica de negócio em Route Handler; sem acesso direto ao Prisma fora de Repository; sem `new PrismaClient()` fora de `src/lib/prisma.ts`.

Listas completas: `CLAUDE.md` seção "Boas práticas que devem ser seguidas"; `PROJECT_GOVERNANCE.md` Seção 7.

### 4.8 Documentos que nunca podem ser ignorados

- **`PROJECT_GOVERNANCE.md`** — não-negociável durante implementação; qualquer alteração exige aprovação explícita e registro de ADR.
- **`REGRAS_NEGOCIO.md`** — fonte de verdade das regras de negócio do domínio.
- **`docs/ai/AI_PROMPT_ORCHESTRATOR.md`** — define o processo oficial de execução de sprints; complementa `PROJECT_GOVERNANCE.md` e nunca o substitui (em conflito, `PROJECT_GOVERNANCE.md` sempre prevalece).
- **`CLAUDE.md`** — deve ser lido antes de qualquer implementação, segundo o próprio documento.

## 5. Fluxo resumido

**Ordem oficial de leitura**, antes de qualquer ação de sprint:

1. `PROJECT_GOVERNANCE.md`
2. `REGRAS_NEGOCIO.md`
3. `PLAN.md`
4. `CHANGELOG.md`
5. `docs/ai/AI_PROMPT_ORCHESTRATOR.md`
6. `SPRINT_X.md` da sprint corrente (quando existir)
7. `SPRINT_AUDIT.md` da sprint corrente (quando existir)

Texto oficial completo: `AI_PROMPT_ORCHESTRATOR.md` Seção 5 ("Leitura obrigatória").

**Fluxo das Sprints** (resumo — processo completo em `sprint-governance`):

```
Product Owner aprova
  → Orchestrator (FASE 0 — Análise Arquitetural)
  → SPRINT_X.md + SPRINT_AUDIT.md
  → Executor (FASE -1 → FASE 0.5 → Implementação → Autoauditoria → Validações)
  → Auditor (Fluxo Oficial de Auditoria → APROVADO / NECESSITA CORREÇÃO / BLOQUEADO)
  → FASE 6 — Evolução da Governança
  → Encerramento
```

## 6. Arquivos auxiliares disponíveis

| Arquivo | Conteúdo |
|---|---|
| `checklists/checklist.md` | Checklist de bootstrap de sessão + critérios para iniciar uma sprint |

## 7. Como carregar os arquivos auxiliares

- **Ao assumir o projeto pela primeira vez:** carregar `checklists/checklist.md` (seção "Checklist de bootstrap") depois de ler os documentos da Seção 5 acima.
- **Antes de começar a implementar uma sprint:** carregar `checklists/checklist.md` (seção "Critérios para iniciar uma Sprint").

## 8. Critérios de sucesso

Bootstrap está completo quando o checklist de sessão em `checklists/checklist.md` foi cumprido integralmente e os critérios para iniciar uma sprint (mesmo arquivo) estão satisfeitos antes da primeira linha de código.

## 9. Limitações

- Esta Skill não decide nada — apenas informa e orienta.
- Não substitui a leitura integral dos documentos originais listados na Seção 4.4.
- Não cobre o processo detalhado de execução/auditoria de sprint — isso é `sprint-governance`.

## 10. Anti-patterns

- Assumir que ler esta Skill dispensa a leitura dos documentos originais.
- Pular a ordem oficial de leitura (Seção 5) e ir direto para `SPRINT_X.md`.
- Usar esta Skill no meio de uma sprint já em andamento — ela serve ao primeiro contato, não à execução.
- Assumir escopo de tarefa sem `SPRINT_X.md` existente.

## 11. Referências cruzadas

`CLAUDE.md`, `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, `AI_PROMPT_ORCHESTRATOR.md` — documentos-fonte, sempre a autoridade final. Skills irmãs: `sprint-governance` (processo completo de sprint), `architecture` (arquitetura de código), `coding-standards` (nomenclatura).

### Compatibilidade com Sub-agents

Nenhum Sub-agent foi criado neste projeto ainda (previsto para a Sprint G.5.3). Quando existirem:

- **Deveria pré-carregar esta Skill**: qualquer subagent de propósito geral que vá operar de forma ampla neste projeto a partir de um contexto frio (ex.: um futuro `general-purpose` de projeto), para não precisar redescobrir objetivo/stack/documentos a cada invocação.
- **Não deveria pré-carregá-la**: subagents com tarefa estreita e já delimitada por quem os invocou (ex.: "leia este arquivo e resuma"); os agentes embutidos `Explore`/`Plan`, que já pulam `CLAUDE.md` por design para manter a pesquisa rápida — pré-carregar bootstrap contrariaria esse propósito.
- **Conhecimento fornecido:** objetivo do projeto, stack, arquitetura de camadas, lista de documentos obrigatórios, ordem oficial de leitura, papéis do processo de sprint.
- **Artefatos produzidos:** nenhum — apenas orientação.
- **Entradas esperadas:** nenhuma pré-condição, é o ponto de entrada.
- **Saídas entregues:** checklist de bootstrap cumprido; direcionamento para `sprint-governance`.

---

Precedência: em caso de conflito entre esta Skill e `CLAUDE.md`, `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md` ou `AI_PROMPT_ORCHESTRATOR.md`, o documento original sempre prevalece.

<!-- Histórico: v2.0 em 13/07/2026 — Sprint G.5.2: renomeada skill.md→SKILL.md, corpo reestruturado nas 11 seções oficiais, checklists extraídas para checklists/checklist.md, adicionadas "Quando NÃO utilizar" e "Compatibilidade com Sub-agents". -->
