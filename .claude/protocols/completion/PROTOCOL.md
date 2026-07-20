# Protocol: Completion

Operational Protocol do AI Operating System (Sprint G.5.5). Define o comportamento de encerramento de uma missão inteira — checklist de DoD, relatório final, validação de que nenhuma delegação ficou pendente. Distinto de `handoff` (transição parcial dentro da missão, entre Sub-agents). Não redefine papéis, conhecimento nem formato de artefato. Deriva de `architecture/EXECUTION_FLOW.md` (etapa Encerramento) e `agents/ai-release-manager.md`.

## 1. Objetivo / Escopo

Padronizar o encerramento formal de uma missão do AI Operating System: confirmar DoD, confirmar `PLAN.md`/`CHANGELOG.md` atualizados, produzir o Relatório Executivo, e transicionar a missão para o estado Encerrada/Closed. Fora de escopo: qualquer transição parcial durante a missão (isso é `protocols/handoff/PROTOCOL.md`) e a validação técnica em si (isso é `protocols/validation/PROTOCOL.md`, já concluída antes deste protocolo começar).

## 2. Quando utilizar / Quando NÃO utilizar

**Utilizar quando:** uma missão já passou pelas etapas de Validações e Documentação do `EXECUTION_FLOW.md` e está pronta para ser formalmente fechada.

**NÃO utilizar quando:** a missão ainda não foi validada (`ai-qa-engineer`) ou documentada (`ai-documentation-engineer`) — encerramento nunca roda fora de ordem; é uma transição parcial entre dois Sub-agents dentro da mesma missão ainda em andamento (`protocols/handoff/PROTOCOL.md`); é uma dúvida de ADR/classificação de auditoria durante a execução (`ai-governance-officer`, papel distinto de encerramento, mesma distinção já registrada em `ai-release-manager.md` item 2).

## 3. Pré-condições / Pós-condições

**Pré-condições:** Validações e Documentação já concluídas (mesmo critério de `ai-release-manager.md` item 7); checklist de DoD Sprint×Módulo (`governance`) disponível para conferência.
**Pós-condições:** missão no estado Encerrada/Closed (`architecture/STATE_MACHINE.md`); Relatório Executivo produzido; `PLAN.md`/`CHANGELOG.md` confirmados atualizados por técnica objetiva, não só leitura visual.

## 4. Entradas / Saídas

**Entradas:** uma missão já validada e documentada, com todas as delegações abertas já retornadas.
**Saídas:** confirmação de encerramento formal, ou lista explícita do que falta para encerrar (nunca um encerramento parcial silencioso).

## 5. Artefatos produzidos / consumidos

**Produz:** Relatório Executivo de encerramento (nomenclatura conforme `contracts/artifact-contract.md`).
**Consome:** checklist de DoD, `PLAN.md`/`CHANGELOG.md` já atualizados, o resumo estruturado devolvido por cada Sub-agent que participou da missão (formato de `protocols/communication/PROTOCOL.md`).

## 6. Skills utilizadas / Contracts utilizados / Sub-agents envolvidos

**Skills:** `governance` (DoD, regras de PLAN/CHANGELOG), `sprint-governance` (ciclo/estados da missão), `engineering-reviewer` (checklist final e os 6 blocos do relatório) — as mesmas três pré-carregadas por `ai-release-manager` (`agents/ai-release-manager.md` item 6).
**Contracts:** `agent-contract.md`, `communication-contract.md`, `artifact-contract.md` (nomenclatura do Relatório Executivo).
**Sub-agents:** `ai-release-manager` — único ponto de entrada deste protocolo (`agents/ai-release-manager.md` item 3: só `ai-project-manager` pode acioná-lo, exclusivamente na etapa de Encerramento).

## 7. Eventos de início / término

**Início:** `ai-project-manager` aciona `ai-release-manager` ao chegar na etapa de Encerramento de `EXECUTION_FLOW.md`.
**Término:** Relatório Executivo entregue e missão confirmada no estado Encerrada/Closed.

## 8. Critérios de sucesso / interrupção / retorno

**Sucesso:** DoD completo, `PLAN.md`/`CHANGELOG.md` atualizados, Relatório Executivo produzido — os três juntos, nunca parcial.
**Interrupção:** checklist de DoD incompleto, ou dívida técnica crítica/alta não registrada (`engineering-reviewer`, tabela de priorização) — nunca aceita encerramento incompleto por pressão de prazo (mesmo limite já registrado em `ai-release-manager.md` item 5).
**Retorno ao Orchestrator:** sempre ao final — este é o último elo da cadeia de delegação de uma missão (`ai-release-manager.md` item 10: "é o fim da cadeia"); se houver bloqueio real, escala ao Product Owner em vez de decidir sozinho (`DELEGATION_MODEL.md` item 5).

## 9. Fluxo operacional

```
Validações concluídas (protocols/validation) + Documentação concluída (protocols/documentation)
        ↓
ai-project-manager aciona ai-release-manager
        ↓
Confirmar checklist de DoD Sprint×Módulo
        ↓
Confirmar PLAN.md/CHANGELOG.md atualizados (técnica objetiva, não leitura visual)
        ↓
Produzir Relatório Executivo
        ↓
Missão → estado Encerrada/Closed
        ↓
Retorno final ao Product Owner via ai-project-manager
```

## 10. Exemplos positivos / negativos

**Exemplo positivo:** a Sprint 2.D.6 (hipotético, mesmo padrão de `ai-release-manager.md` item 12) foi validada e documentada — `ai-release-manager` confirma DoD, confirma `PLAN.md`/`CHANGELOG.md`, produz o Relatório Executivo, missão passa a Encerrada.

**Exemplo negativo:** encerrar uma missão porque "está quase pronta", sem o checklist de DoD completo, ou aceitar o encerramento apenas porque `ai-backend-engineer` reportou sucesso, sem confirmar que `ai-qa-engineer` e `ai-documentation-engineer` de fato concluíram suas etapas — viola a pré-condição do item 3 e o critério de interrupção do item 8.

---

Precedência: em caso de conflito entre este Protocol e `architecture/EXECUTION_FLOW.md`, `agents/ai-release-manager.md` ou `skills/governance/SKILL.md`, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
