---
name: sprint-execution
description: Use this skill while executing a sprint that has already passed FASE -1 (Validação da Sprint) and FASE 0.5 (Auditoria de Contratos) in the Doce Menina confeitaria-app project — the microtask sequencing rule, when to run tsc/lint/build, the exact order for updating PLAN.md/CHANGELOG.md relative to validations, the two approval checkpoints, and the pre-acceptance checklist. This is operational detail for the implementation phase itself; for the overall phase/state flow use sprint-governance instead, and for DoD/checklist mechanics use governance instead.
---

# Execução de Sprint — Doce Menina (confeitaria-app)

Esta Skill cobre o detalhe operacional de **executar** uma sprint já validada (`SPRINT_X.md`/`SPRINT_AUDIT.md` completos, FASE -1 e FASE 0.5 concluídas — ver skill `sprint-governance`). Não repete fases, estados ou artefatos — apenas ancora onde a execução começa e detalha o que nenhuma outra Skill ainda cobre: a sequência de microtarefas, a ordem exata entre validação e atualização documental, e os únicos dois pontos do fluxo que pausam para aprovação explícita. Fonte de verdade: `PROJECT_GOVERNANCE.md` Seção 4 e Seção 7.

## 1. Objetivo

Garantir que a implementação de uma sprint já validada siga a sequência correta de microtarefas, a ordem obrigatória entre validação técnica e atualização documental, e pare exatamente nos dois pontos de aprovação explícita previstos.

## 2. Quando utilizar

Ao executar (implementar) uma sprint que já passou por FASE -1 (Validação da Sprint) e FASE 0.5 (Auditoria de Contratos) — ver skill `sprint-governance`.

## 3. Quando NÃO utilizar

- Antes da sprint estar validada (FASE -1/FASE 0.5 pendentes) — isso é escopo de `sprint-governance`/`sprint-planning`.
- Para decidir regra de código de uma camada específica (Route/Service/Repository/Validator) — isso é `architecture`, `api-pattern`, `repository-pattern`, `coding-standards`.
- Para o DoD de **módulo** (distinto do encerramento de sprint individual) — isso é `governance`.
- Para auditar uma sprint já implementada — isso é `sprint-audit`/`engineering-reviewer`.

## 4. Responsabilidades

### 4.1 Onde a execução começa

A execução começa depois que o Executor já concluiu FASE -1 (validação da estrutura do `SPRINT_X.md`) e FASE 0.5 (auditoria de contratos — DTOs/Types/interfaces já verificados, nenhum contrato público novo sem autorização). Ver skill `sprint-governance` para o detalhe dessas duas fases — não repetido aqui.

### 4.2 Sequência obrigatória — uma microtarefa por vez

Regra central (`PROJECT_GOVERNANCE.md` Seção 4, bloco "2. IMPLEMENTAÇÃO"): **uma microtarefa por vez**. Na prática:

1. Implementar **uma** microtarefa (unidade atômica: verbo + objeto + arquivo — ex. "criar função `validateSupplier` em `supplierValidator.ts`").
2. Validar essa microtarefa isoladamente antes de seguir adiante — nunca acumular duas ou mais microtarefas sem validação intermediária.
3. Só então avançar para a próxima microtarefa.

Isso não significa rodar `tsc`/`lint`/`build` completos a cada microtarefa (isso é o item 4.4, abaixo) — significa não deixar código incompleto ou não verificado se acumular antes de seguir. "Não avançar sem concluir e validar a atual" é a regra, não uma sequência de comandos fixa por microtarefa.

### 4.3 Atualizações documentais — ordem obrigatória

Regra crítica de ordem, com uma proibição explícita em `PROJECT_GOVERNANCE.md` (seção "Atualização do PLAN.md"): **"É proibido atualizar o PLAN.md antes da execução das validações obrigatórias."**

Sequência oficial completa (fonte: `PROJECT_GOVERNANCE.md`, seção "Fluxo obrigatório de encerramento de Sprint"):

1. Concluir todas as alterações de código previstas na sprint.
2. Executar todas as validações obrigatórias aplicáveis (`tsc`, `lint`, `build`, testes — quando previstos no `SPRINT_X.md`).
3. Atualizar o `PLAN.md`, substituindo o status da sprint.
4. Atualizar o `CHANGELOG.md`, registrando a conclusão.
5. Revisar integralmente o `PLAN.md`, garantindo ausência de duplicidades.
6. Somente após todas essas etapas, declarar oficialmente a sprint como concluída.

Nunca inverter esta ordem — em particular, nunca escrever em `PLAN.md` "antecipando" um resultado de validação ainda não executada.

### 4.4 Validações — o que roda em qual sprint

- **`tsc`/`lint`** — sempre, em toda sprint de código desta sessão (Schema, Repository+Validator, Service, API, Front-end).
- **`build`** — apenas quando a sprint envolve mudança estrutural relevante, ou é a sprint de QA/encerramento de módulo. Caso real: a Sprint 2.D.5 (Front-end) **não** rodou build — justificativa registrada no `CHANGELOG.md`: "reservado para a sprint de QA/encerramento do módulo (mesmo padrão das Sprints 2.B.5/2.C.6)".
- **`db push`/`prisma generate`** — apenas em sprints de Schema.
- Nunca executar uma validação que não esteja prevista no `SPRINT_X.md` da sprint corrente.

### 4.5 Checkpoints — os dois únicos pontos de pausa obrigatória

`PROJECT_GOVERNANCE.md` Seção 4 define exatamente dois pontos "⛔ AGUARDAR APROVAÇÃO EXPLÍCITA":

- **(a) Após o planejamento, antes de iniciar a implementação** — o plano (arquivos, microtarefas, critérios de aceite) é apresentado e a execução só começa com aprovação explícita.
- **(b) Após o encerramento (ACEITE), antes de avançar para a próxima sprint** — ver item 4.3 e "Critérios de sucesso" abaixo.

Nenhum outro ponto do fluxo pausa para aprovação por padrão. Em particular, a implementação microtarefa-por-microtarefa (item 4.2) **não** pausa a cada microtarefa — ela valida a cada microtarefa, mas só solicita aprovação explícita nos dois checkpoints acima.

## 5. Fluxo resumido

1. Confirmar que FASE -1 e FASE 0.5 já foram concluídas (skill `sprint-governance`).
2. Implementar uma microtarefa por vez, validando cada uma antes de avançar (item 4.2).
3. Concluir todas as mudanças de código previstas na sprint.
4. Rodar as validações obrigatórias aplicáveis (item 4.4).
5. Atualizar `PLAN.md`, depois `CHANGELOG.md` — nunca antes das validações (item 4.3).
6. Revisar `PLAN.md` por duplicidade.
7. Apresentar o encerramento da sprint (ver "Critérios de sucesso") e aguardar aprovação explícita — checkpoint (b) do item 4.5.

## 6. Arquivos auxiliares disponíveis

Nenhum. O conteúdo desta Skill é operacional e enxuto o suficiente para caber inteiramente neste `SKILL.md` — não há material extenso o bastante para justificar `references/`, `checklists/` ou `examples/`.

## 7. Como carregar os arquivos auxiliares

Não aplicável — esta Skill não possui arquivos auxiliares (ver item 6).

## 8. Critérios de sucesso

Encerramento de **sprint individual** — distinto do DoD de **módulo** (ver skill `governance`, não repetido aqui). Fonte: `PROJECT_GOVERNANCE.md` Seção 4, bloco "6. ACEITE":

- Resumo da sprint apresentado ao usuário.
- Arquivos criados/alterados listados.
- Validações executadas confirmadas (tsc, lint, QA).
- Aprovação explícita obtida antes de avançar para a próxima sprint.

Checklist real de `PROJECT_GOVERNANCE.md` Seção 7 ("Checklist obrigatório antes do aceite"), a confirmar antes de declarar a sprint pronta:

- **Qualidade de código** — sem `any`, sem função duplicada, sem lógica de negócio em Route Handler, sem acesso direto ao Prisma fora de Repository, sem `new PrismaClient()` fora do singleton. Detalhe de cada regra: skills `architecture`, `api-pattern`, `repository-pattern` (não repetido aqui).
- **Padrões** — nomenclatura de arquivos/funções/tipos. Detalhe: skill `coding-standards` (não repetido aqui).
- **Validação técnica** — `tsc`/`lint`/`dev` (ver item 4.4 para quando cada um se aplica).
- **QA funcional** — API testada (método + rota + corpo esperado), UI navegada no browser quando aplicável, casos de erro validados (campo vazio, tipo errado, auth ausente).
- **Documentação** — `CHANGELOG.md` atualizado (ver item 4.3 para a ordem correta), `KNOWN_ISSUES.md` revisado quando aplicável.

## 9. Limitações

- Não cobre as fases anteriores de planejamento/validação (`sprint-governance`/`sprint-planning`).
- Não cobre o DoD de módulo, apenas o encerramento de sprint individual (`governance`).
- Não decide regra de código específica de nenhuma camada — apenas referencia onde essa regra vive.
- Não cobre a auditoria pós-execução (`sprint-audit`/`engineering-reviewer`).

## 10. Anti-patterns

- Acumular múltiplas microtarefas sem validação intermediária.
- Atualizar `PLAN.md` antes das validações obrigatórias — proibição explícita do `PROJECT_GOVERNANCE.md`.
- Pausar pedindo aprovação fora dos dois checkpoints oficiais, ou deixar de pausar nesses dois pontos.
- Rodar uma validação não prevista no `SPRINT_X.md` da sprint corrente (ex. rodar `build` numa sprint que não previu isso).

## 11. Referências cruzadas

- Skill `sprint-governance` — fases anteriores à execução (FASE -1, FASE 0.5) e estados da sprint.
- Skill `governance` — DoD de módulo (distinto do encerramento de sprint individual desta Skill).
- Skills `architecture`, `api-pattern`, `repository-pattern`, `coding-standards` — regras de código por camada citadas no checklist de aceite (item 8).
- Skills `sprint-audit`, `engineering-reviewer` — auditoria da sprint após esta execução.
- `PROJECT_GOVERNANCE.md` Seção 4 ("2. IMPLEMENTAÇÃO", "6. ACEITE") e Seção 7 ("Checklist obrigatório antes do aceite") — fonte de verdade desta Skill.

### Compatibilidade com Sub-agents

- **Pré-carregar via `skills:`:** um subagent futuro do tipo `sprint-executor`/implementador de microtarefas se beneficiaria de ter esta Skill sempre carregada — o sequenciamento de microtarefas e a ordem validação-antes-de-documentação são regras permanentes da tarefa, não conhecimento pontual.
- **Não pré-carregar:** subagents somente-leitura (`Explore`, `Plan`) ou de auditoria pura (um futuro `sprint-auditor`) — eles precisam avaliar *se* a execução seguiu essas regras, não executá-las; para eles, `sprint-audit`/`engineering-reviewer` são as Skills relevantes.
- **Conhecimento fornecido:** ordem de execução de microtarefas, quando rodar cada validação técnica, os dois checkpoints de aprovação obrigatória.
- **Artefatos produzidos:** nenhum diretamente — orienta como `PLAN.md`/`CHANGELOG.md` devem ser atualizados por quem executa a sprint.
- **Entradas esperadas:** `SPRINT_X.md` já validado (FASE -1 e FASE 0.5 concluídas).
- **Saídas entregues:** sprint implementada, validada tecnicamente e documentada, pronta para o checkpoint de aceite.

---

Precedência: em caso de conflito entre esta Skill e `PROJECT_GOVERNANCE.md`, o documento original sempre prevalece.

<!-- Histórico: v2.0 em 13/07/2026 — Sprint G.5.2: migrado de skill.md para SKILL.md (padrão oficial Claude Code), corpo reestruturado nas 11 seções oficiais, adicionadas "Quando NÃO utilizar" e "Compatibilidade com Sub-agents". -->
