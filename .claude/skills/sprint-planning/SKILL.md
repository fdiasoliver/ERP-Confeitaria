---
name: sprint-planning
description: Use this skill when planning how to divide a module into sprints, defining scope/out-of-scope for a sprint, checking dependencies before starting, or verifying a sprint is ready to begin (Definition of Ready) in the Doce Menina confeitaria-app project. This is the practical planning craft; for the formal Orchestrator role and FASE 0 process use orchestrator instead, and for DoD/checklist mechanics use governance instead.
---

# Planejamento de Sprint — Doce Menina (confeitaria-app)

Esta Skill é sobre a **prática de planejar** uma sprint — como dividir um módulo, definir escopo, verificar dependências e confirmar que uma sprint está pronta para começar. Não repete o papel formal do Orchestrator (`orchestrator`) nem a mecânica de DoD/checklists (`governance`) — referencia ambas. Fonte de verdade: `PROJECT_GOVERNANCE.md`, `PLAN.md`, `AI_PROMPT_ORCHESTRATOR.md`.

## 1. Objetivo

Garantir que toda sprint nasce de um plano concreto — divisão por camada única, escopo e fora-de-escopo explícitos, dependências confirmadas e Definition of Ready atendida — antes de qualquer implementação começar.

## 2. Quando utilizar

- Ao dividir um módulo novo em sprints.
- Ao definir o que uma sprint "Pode alterar" e "Não pode alterar".
- Ao verificar se as dependências de uma sprint já estão concluídas em `PLAN.md`.
- Ao confirmar a Definition of Ready antes de aprovar o início de uma sprint.

## 3. Quando NÃO utilizar

- Papel formal do Orchestrator e a FASE 0 (Análise Arquitetural) — usar `orchestrator`.
- Mecânica de DoD (Sprint × Módulo) e checklists formais — usar `governance`.
- Execução de uma sprint já planejada — usar `sprint-execution`.
- Auditoria de uma sprint já implementada — usar `sprint-audit`.

## 4. Responsabilidades

O ponto de partida é sempre a FASE 0 — Análise Arquitetural (skill `orchestrator`, não repetida aqui). Esta Skill cobre o passo seguinte: traduzir essa análise em um plano concreto de sprints.

**Regra estrutural:** uma sprint corresponde a uma única camada de um módulo — Schema, Repository + Validator, Service, API, Front-end, ou Documentação/QA. Fonte: `PROJECT_GOVERNANCE.md` Seção 3, "Camadas padrão de sprint por módulo".

**Divisão** — exemplo real completo desta sessão, Módulo 2.D (Unidades de Medida):

```
Sprint 2.D.1 — Schema
Sprint 2.D.2 — Repository + Validator
Sprint 2.D.3 — Service
Sprint 2.D.4 — API
Sprint 2.D.5 — Front-end
Sprint 2.D.6 — QA (pendente)
```

Módulos simples podem combinar camadas — 2.D.2 combinou Repository + Validator na mesma sprint (permitido, `PROJECT_GOVERNANCE.md` Seção 3: "Módulos simples podem combinar camadas ex.: Sprint {M}.2 — Repository + Validator + Service"). Nunca dividir uma única camada em mais de uma sprint sem justificativa registrada explicitamente no `SPRINT_X.md`.

**Escopo** — todo `SPRINT_X.md` declara explicitamente "Pode alterar" e "Não pode alterar", nunca assumido implicitamente (`AI_PROMPT_ORCHESTRATOR.md` Seção 5, item 2 "Escopo"). Declarar fora-de-escopo explicitamente previne inferência incorreta por semelhança com outros módulos — caso real: a Sprint 2.D.2 listou `slug`, `color` e `icon` como fora de escopo porque `UnitOfMeasure` não possui esses campos, evitando que o Executor os implementasse por analogia com Categorias/Ocasiões.

**Dependências** — declaradas na tabela de módulos de `PLAN.md`. Exemplos reais: Módulo 2.G (Ingredientes) depende de 2.D + 2.E; Módulo 2.I (Receitas) depende de 2.G + 2.D + 2.H. Nunca iniciar uma sprint cuja dependência declarada não esteja com status "✅ Concluído" em `PLAN.md`.

**Sequência** — o roadmap de `PLAN.md` está **congelado** desde a Sprint 2.0.6 (ordem definitiva 2.A–2.L); alterar a ordem dos módulos exige ADR formal (`PROJECT_GOVERNANCE.md` Seção 13). Dentro de um módulo, a sequência de camadas também é fixa — Schema antes de Repository, Repository antes de Service, Service antes de API, API antes de Front-end (skill `architecture`).

## 5. Fluxo resumido

FASE 0 (`orchestrator`) → dividir o módulo em sprints por camada única → declarar escopo e fora-de-escopo no `SPRINT_X.md` → confirmar dependências como "✅ Concluído" em `PLAN.md` → verificar Definition of Ready (item 8 abaixo) → aprovação explícita do usuário.

## 6. Arquivos auxiliares disponíveis

Nenhum. O conteúdo é coeso e cabe em um único hub — não há material extenso o suficiente para justificar `references/`, `checklists/` ou `templates/` nesta Skill.

## 7. Como carregar os arquivos auxiliares

Não aplicável (ver item 6).

## 8. Critérios de sucesso

DoR — Definition of Ready ("pronta para começar"), critérios de `PROJECT_GOVERNANCE.md` Seção 5 ("Critérios obrigatórios para início de uma Sprint"):

- [ ] Módulo e sprint identificados com nomenclatura oficial (`Sprint {N}.{LETRA}.{número} — {Camada}`).
- [ ] Documentação relevante lida.
- [ ] Dependências confirmadas como existentes.
- [ ] Arquivos a criar/alterar listados explicitamente.
- [ ] Microtarefas declaradas (verbo + objeto + arquivo).
- [ ] Critérios de aceite definidos.
- [ ] Aprovação explícita do usuário recebida.
- [ ] Complementar, pós Sprint G.1/G.2: os dois artefatos `SPRINT_X.md` e `SPRINT_AUDIT.md` existem antes de qualquer leitura de código (FASE -1 — skill `sprint-governance`).
- [ ] As 7 perguntas obrigatórias do Orchestrator foram respondidas (skill `orchestrator`).
- [ ] Escopo ("Pode alterar") e fora-de-escopo ("Não pode alterar") explícitos.
- [ ] Nenhuma sub-sprint sendo criada para ajuste pontual não planejado previamente (ver item 4 e item 10 abaixo).

## 9. Limitações

Esta Skill não decide DoD (Sprint × Módulo) — isso é `governance`. Não decide o conteúdo arquitetural da FASE 0 — isso é `orchestrator`. Não altera a ordem congelada do roadmap de `PLAN.md` — isso exige ADR formal, fora do escopo de planejamento. Não executa nem audita a sprint planejada.

## 10. Anti-patterns

- Criar sub-sprint para um ajuste pontual não planejado previamente. Caso real: durante a Sprint 2.D.2, um ajuste pontual foi inicialmente registrado como sprint separada `2.D.2.1`; o usuário determinou que ajustes encontrados durante uma sprint pertencem à própria sprint, e `2.D.2.1` foi consolidada de volta em `2.D.2` (skill `sprint-governance`).
- Dividir uma única camada em mais de uma sprint sem justificativa registrada no `SPRINT_X.md`.
- Iniciar uma sprint com dependência declarada que ainda não está "✅ Concluído" em `PLAN.md`.
- Deixar escopo/fora-de-escopo implícitos em vez de declará-los explicitamente no `SPRINT_X.md`.
- Alterar a ordem do roadmap de `PLAN.md` sem ADR formal.

## 11. Referências cruzadas

- `orchestrator` — FASE 0 (Análise Arquitetural) e papel formal do Orchestrator.
- `governance` — mecânica de DoD (Sprint × Módulo) e checklists formais.
- `sprint-governance` — FASE -1, os artefatos `SPRINT_X.md`/`SPRINT_AUDIT.md`, e a regra de proibição de sub-sprints.
- `architecture` — sequência fixa de camadas (Schema → Repository → Service → API → Front-end).
- `sprint-execution` — execução de uma sprint já planejada.
- `sprint-audit` — auditoria de uma sprint já implementada.
- `PROJECT_GOVERNANCE.md` Seções 3, 5 e 13; `PLAN.md`; `AI_PROMPT_ORCHESTRATOR.md` Seção 5.

### Compatibilidade com Sub-agents

Um futuro subagent com papel de planejamento/orquestração (ex.: um `sprint-planner` que traduz uma FASE 0 já feita em `SPRINT_X.md`) se beneficiaria de pré-carregar esta Skill via `skills:` no seu frontmatter — o conhecimento aqui é exatamente o que ele precisa antes de agir. Um subagent de implementação pura (que só escreve código dentro de uma sprint já aprovada) não precisa dela pré-carregada; e os agentes somente-leitura `Explore`/`Plan` não se beneficiam, já que pulam CLAUDE.md/Skills por design. Conhecimento fornecido: critérios de DoR, regra de camada única por sprint, regra de fora-de-escopo explícito. Artefato produzido: a decisão de divisão/escopo que alimenta o `SPRINT_X.md` (o arquivo em si é responsabilidade do Orchestrator). Entrada esperada: a FASE 0 já concluída. Saída: módulo dividido em sprints com escopo, dependências e DoR verificados.

---

Precedência: em caso de conflito entre esta Skill e `PROJECT_GOVERNANCE.md`, `PLAN.md` ou `AI_PROMPT_ORCHESTRATOR.md`, os documentos originais sempre prevalecem.
