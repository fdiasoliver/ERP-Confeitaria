# PROTOCOL_INDEX.md — Navegação dos 10 Operational Protocols

Ponto de entrada de navegação pura. Não repete conteúdo — só aponta. Agrupados por fase da missão (ver `.claude/architecture/EXECUTION_FLOW.md` para o fluxo completo).

## Abertura

| Protocol | Resumo |
|---|---|
| [`mission/PROTOCOL.md`](mission/PROTOCOL.md) | Recebimento da missão, abertura, planejamento, inicialização. |
| [`delegation/PROTOCOL.md`](delegation/PROTOCOL.md) | Delegação entre Sub-agents, retorno, escalonamento, redistribuição. |

## Execução

| Protocol | Resumo |
|---|---|
| [`context/PROTOCOL.md`](context/PROTOCOL.md) | Compartilhamento, isolamento, economia e persistência de contexto. |
| [`communication/PROTOCOL.md`](communication/PROTOCOL.md) | Troca de informações, formato de mensagens/respostas/artefatos entre camadas. |
| [`validation/PROTOCOL.md`](validation/PROTOCOL.md) | Checagem técnica (tsc/lint/build/regressão) — nunca corrige, só reporta. |
| [`review/PROTOCOL.md`](review/PROTOCOL.md) | Revisão crítica técnica, arquitetural e documental — conformidade e governança. |

## Fechamento

| Protocol | Resumo |
|---|---|
| [`documentation/PROTOCOL.md`](documentation/PROTOCOL.md) | Atualização de PLAN.md/CHANGELOG.md/governança/ADR/relatórios, sempre após validação. |
| [`handoff/PROTOCOL.md`](handoff/PROTOCOL.md) | Transferência de trabalho entre Sub-agents dentro da mesma missão. |
| [`completion/PROTOCOL.md`](completion/PROTOCOL.md) | Encerramento da missão inteira — DoD, relatório final, estado Closed. |

## Transversal (pode ativar em qualquer fase)

| Protocol | Resumo |
|---|---|
| [`error-handling/PROTOCOL.md`](error-handling/PROTOCOL.md) | Bloqueio, erro de ferramenta/infraestrutura, decisão de rollback documental. |

---

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
