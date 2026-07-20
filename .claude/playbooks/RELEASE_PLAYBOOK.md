# Playbook: Release

Playbook do AI Operating System (Sprint G.5.6), conforme `playbooks/PLAYBOOK_ARCHITECTURE.md`. Especialização do `MISSION_PLAYBOOK.md` para preparação de release/encerramento formal de sprint ou módulo — instancia concentradamente o Protocol `completion`.

## 1. Objetivo / Escopo

Padronizar o fechamento formal de uma sprint ou módulo: checklist de DoD, confirmação de `PLAN.md`/`CHANGELOG.md`, Relatório Executivo de encerramento.

**Quando utilizar:** ao final de qualquer sprint/módulo, depois que Validação e Documentação já foram concluídas por outro Playbook (nunca antes).
**Quando NÃO utilizar:** como substituto de `validation`/`documentation` — este Playbook pressupõe que ambos já rodaram; se não rodaram, retornar para o Playbook de origem primeiro.

## 2. Pré-condições / Pós-condições

**Pré-condições:** Protocol `validation` concluído (código conforme); Protocol `documentation` concluído (`PLAN.md`/`CHANGELOG.md` já atualizados).
**Pós-condições:** estado da missão = Closed; checklist de DoD (`PROJECT_GOVERNANCE.md` Seção 23) confirmado.

## 3. Entradas / Saídas

**Entradas:** sprint/módulo com Validação e Documentação já concluídas.
**Saídas:** Relatório Executivo de encerramento; estado formal atualizado.

## 4. Artefatos produzidos

Relatório Executivo (conforme `artifact-contract.md`); nenhuma alteração de código nesta etapa.

## 5. Skills necessárias / Contracts utilizados / Operational Protocols utilizados / Sub-agents participantes

**Skills:** `governance`, `sprint-governance`, `engineering-reviewer`.
**Contracts:** `artifact-contract.md`, `agent-contract.md`.
**Operational Protocols:** `completion` (o protocolo central desta missão), `review` (parecer final antes do fechamento).
**Sub-agents:** `ai-release-manager` lidera, único ponto de entrada (ver `agents/ai-release-manager.md`: "só ativa na etapa de Encerramento"); `ai-governance-officer` emite o parecer final.

## 6. Sequência completa de execução

1. `ai-project-manager` confirma que Validação e Documentação já concluíram (pré-condição obrigatória) antes de acionar este Playbook.
2. `ai-release-manager` confere o checklist de DoD (`PROJECT_GOVERNANCE.md` Seção 23).
3. `ai-release-manager` confirma `PLAN.md`/`CHANGELOG.md` já refletem a sprint/módulo corretamente.
4. Protocol `review`: `ai-governance-officer` emite parecer final (APROVADO/NECESSITA CORREÇÃO/BLOQUEADO).
5. Se APROVADO: `ai-release-manager` produz o Relatório Executivo de encerramento.
6. Protocol `completion`: estado formal = Closed/ENCERRADA.

## 7. Critérios de sucesso / interrupção / retorno ao Orchestrator

**Sucesso:** DoD completo, `PLAN.md`/`CHANGELOG.md` conferidos, Relatório Executivo entregue, estado Closed.
**Interrupção:** DoD incompleto; `ai-governance-officer` emite NECESSITA CORREÇÃO ou BLOQUEADO (retorna para o Playbook de origem, nunca fecha mesmo assim).
**Retorno ao Orchestrator:** ao final, com o Relatório Executivo e o parecer.

## 8. Exemplos completos

**Exemplo real:** o encerramento de cada uma das Sprints G.5.0 a G.5.5 desta sessão seguiu exatamente esta sequência — checklist de critério de sucesso conferido, `PLAN.md`/`CHANGELOG.md` atualizados "somente quando necessário" (regra real já aplicada, nem toda sprint de infraestrutura de IA gerou entrada), Relatório Executivo com itens numerados conforme cada ordem de missão pedia.

---

Precedência: em caso de conflito entre este Playbook e `playbooks/PLAYBOOK_ARCHITECTURE.md` ou qualquer Contract/Protocol/Sub-agent, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.6 (Implementação dos Playbooks). -->
