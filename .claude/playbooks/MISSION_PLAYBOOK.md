# Playbook: Mission (Genérico)

Playbook do AI Operating System (Sprint G.5.6), conforme `playbooks/PLAYBOOK_ARCHITECTURE.md`. Orquestra Operational Protocols e Sub-agents — nunca reimplementa uma regra de negócio de Skill, nunca redefine um Contract/Protocol/Sub-agent. Este é o fluxo genérico do qual os demais 8 Playbooks desta pasta são especializações.

## 1. Objetivo / Escopo

Orquestrar o ciclo completo de uma missão do AI Operating System, do recebimento ao encerramento, compondo os 10 Operational Protocols e os 11 Sub-agents já implementados.

**Quando utilizar:** como fluxo de referência para qualquer missão nova que não se encaixe exatamente em um dos 8 Playbooks especializados desta pasta (Implementation/Architecture/Audit/Documentation/Refactoring/Bugfix/Release/Governance), ou como base conceitual da qual os especializados derivam.
**Quando NÃO utilizar:** quando a missão já corresponde claramente a um Playbook especializado — use-o diretamente, ele já instancia este fluxo genérico com Sub-agents/Protocols específicos.

## 2. Pré-condições / Pós-condições

**Pré-condições:** missão aprovada pelo Product Owner; nenhuma outra missão em conflito de escopo em andamento (ver `protocols/delegation/PROTOCOL.md`).
**Pós-condições:** estado da missão = Closed (`architecture/STATE_MACHINE.md`); `PLAN.md`/`CHANGELOG.md` atualizados quando aplicável; Relatório Executivo entregue.

## 3. Entradas / Saídas

**Entradas:** pedido de missão (texto do Product Owner ou Orchestrator).
**Saídas:** conjunto de artefatos produzidos pela missão + Relatório Executivo consolidado.

## 4. Artefatos produzidos

`SPRINT_X.md`/plano (etapa Planejamento), artefatos de código/documentação conforme a natureza da missão, Relatório Executivo (etapa final) — nomenclatura conforme `contracts/artifact-contract.md`.

## 5. Skills necessárias / Contracts utilizados / Operational Protocols utilizados / Sub-agents participantes

**Skills:** `sprint-governance`, `orchestrator`, `sprint-planning` (mínimo — as demais dependem da natureza da missão).
**Contracts:** todos os 5 (`agent-contract.md`, `skill-contract.md`, `artifact-contract.md`, `communication-contract.md`, `delegation-contract.md`).
**Operational Protocols:** `mission` (abertura), `delegation` (cada transição), `context`/`communication` (durante execução), `validation`/`review` (antes de encerrar), `documentation` (antes do encerramento), `handoff` (entre Sub-agents), `completion` (encerramento), `error-handling` (transversal, sob demanda).
**Sub-agents:** `ai-project-manager` coordena; qualquer um dos outros 8 participa conforme a natureza da missão.

## 6. Sequência completa de execução

1. **Receber missão** — Protocol `mission` inicia; `ai-project-manager` recebe o pedido.
2. **Planejamento** — `ai-project-manager` define escopo/fora-de-escopo/dependências (equivalente à FASE 0 de `orchestrator`).
3. **Delegação** — Protocol `delegation`; `ai-project-manager` delega para a(s) persona(s) certa(s) (`ai-solution-architect` se há decisão arquitetural; `ai-backend-engineer`/`ai-frontend-engineer` se há implementação; etc.).
4. **Execução** — Sub-agent(s) delegado(s) trabalham, usando `context`/`communication` Protocols; `handoff` Protocol entre Sub-agents quando há mais de um.
5. **Autoauditoria** — cada Sub-agent confere seu próprio resultado antes de retornar (mesmo princípio da etapa AUTOAUDITADA de `sprint-governance`).
6. **Correções** — Sub-agent corrige o que sua própria autoauditoria encontrou, sem nova delegação.
7. **Validações** — Protocol `validation`; `ai-qa-engineer` roda tsc/lint/build/regressão.
8. **Documentação** — Protocol `documentation`; `ai-documentation-engineer` atualiza `PLAN.md`/`CHANGELOG.md`/docs, sempre depois da etapa 7.
9. **Relatório Executivo** — Protocol `review`; `ai-governance-officer` classifica achados (Inconsistência/Observação Técnica/Melhoria Futura) e emite parecer.
10. **Encerramento** — Protocol `completion`; `ai-release-manager` confirma DoD e fecha a missão; retorna a `ai-project-manager`, que reporta ao Orchestrator/Product Owner.

## 7. Critérios de sucesso / interrupção / retorno ao Orchestrator

**Sucesso:** as 10 etapas concluídas, nenhuma Inconsistência bloqueante aberta, artefatos entregues conforme `artifact-contract.md`.
**Interrupção:** bloqueio arquitetural real (ver `protocols/error-handling/PROTOCOL.md`); escopo contraria `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md`; limite de sessão/erro de infraestrutura sem trabalho salvo verificável.
**Retorno ao Orchestrator:** ao final da etapa 10, ou imediatamente em caso de interrupção — nunca silenciosamente.

## 8. Exemplos completos

**Exemplo real já ocorrido nesta sessão:** as Sprints G.5.0 a G.5.5 desta própria sessão são, cada uma, uma instância deste fluxo genérico — recebidas como "ORDEM DE MISSÃO", planejadas (FASE 0), delegadas (forks paralelos), executadas, autoauditadas, validadas e encerradas com relatório final nos moldes exigidos por cada ordem. A Sprint G.5.2.1 (Certificação) é a etapa 9 (Relatório/Review) isolada como missão própria, sem as etapas 3-8 — evidência de que os Playbooks especializados desta pasta são recortes válidos deste fluxo-mestre, não fluxos desconexos.

---

Precedência: em caso de conflito entre este Playbook e `playbooks/PLAYBOOK_ARCHITECTURE.md`, `architecture/EXECUTION_FLOW.md` ou qualquer Contract/Protocol/Sub-agent, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.6 (Implementação dos Playbooks). -->
