# PROTOCOL_MATRIX.md — Matriz dos 10 Operational Protocols

Parte da documentação de `.claude/protocols/` (Sprint G.5.5). Dados extraídos diretamente das seções 1, 5 e 6 de cada `PROTOCOL.md` — não repete o conteúdo completo de nenhum, apenas classifica objetivamente.

| Protocolo | Objetivo | Consumidores | Produtores | Skills | Contracts | Sub-agents | Artefatos |
|---|---|---|---|---|---|---|---|
| `mission` | Padronizar recebimento, planejamento e inicialização de uma missão | `delegation` (transição) | `ai-project-manager` | `sprint-governance`, `orchestrator`, `sprint-planning`, `project-bootstrap` | `artifact-contract.md`, `delegation-contract.md` | `ai-project-manager` | Produz: `SPRINT_X.md`/plano. Consome: `PLAN.md`/`CHANGELOG.md` |
| `delegation` | Padronizar delegação, retorno, escalonamento, redistribuição | Qualquer par delegador/delegado | `ai-project-manager` (único delegador com `tools: Agent(...)`) | Nenhuma diretamente | `delegation-contract.md` | `ai-project-manager` (delega); todos os demais (delegados) | Nenhum próprio. Consome: prompt de delegação |
| `context` | Padronizar compartilhamento, isolamento, economia e persistência de contexto | Todas as camadas | Mecanismo oficial do Claude Code + `skills:` decidido em tempo de criação do Sub-agent | Nenhuma específica | `agent-contract.md` | Todos os 9 | Nenhum — produz decisão de carregamento |
| `communication` | Padronizar troca de mensagens, respostas e artefatos entre camadas | Camada chamadora (consolida) | Qualquer Sub-agent ao retornar | Nenhuma | `communication-contract.md` | Qualquer par; tipicamente `ai-project-manager` como chamador | Nenhum próprio (salvo se a tarefa delegada pedir arquivo) |
| `validation` | Padronizar checagem técnica funcional (tsc/lint/build/regressão) | `review` (próxima etapa) | `ai-qa-engineer` | `sprint-execution` | `artifact-contract.md`, `communication-contract.md` | `ai-qa-engineer` | Produz: relatório de validação. Consome: código-fonte, `SPRINT_X.md` |
| `review` | Padronizar revisão crítica de conformidade/qualidade/governança | `completion`/`handoff` | `ai-governance-officer` | `engineering-reviewer`, `sprint-audit`, `governance` | `artifact-contract.md`, `communication-contract.md` | `ai-governance-officer` | Produz: relatório de revisão, `KNOWN_ISSUES.md`. Consome: `SPRINT_X.md`, `PLAN.md`, `CHANGELOG.md`, resultado de `validation` |
| `documentation` | Padronizar atualização de PLAN/CHANGELOG/docs/referências | `completion`/`handoff` | `ai-documentation-engineer` | `documentation`, `governance` | `artifact-contract.md`, `communication-contract.md` | `ai-documentation-engineer` | Produz: `PLAN.md`/`CHANGELOG.md`/README/docs. Consome: resumo da etapa anterior |
| `handoff` | Padronizar transferência de trabalho entre Sub-agents na mesma missão | Sub-agent seguinte | Sub-agent que conclui + `ai-project-manager` (coordena) | Nenhuma própria (herda dos dois Sub-agents envolvidos) | `communication-contract.md`, `artifact-contract.md` | Todos os de execução + `ai-project-manager` | Nenhum próprio (evento de coordenação). Consome: artefato real do Sub-agent anterior |
| `completion` | Padronizar encerramento formal da missão inteira | Product Owner (via `ai-project-manager`) | `ai-release-manager` | `governance`, `sprint-governance`, `engineering-reviewer` | `agent-contract.md`, `communication-contract.md`, `artifact-contract.md` | `ai-release-manager` | Produz: Relatório Executivo. Consome: DoD, `PLAN.md`/`CHANGELOG.md`, resumos de cada Sub-agent |
| `error-handling` | Padronizar tratamento de erro/bloqueio/interrupção | Delegador/Orchestrator | Qualquer camada que encontrar o erro | Nenhuma | `delegation-contract.md` | Qualquer um pode reportar; nenhum decide sozinho | Nenhum (relato textual, não persistido) |

---

Precedência: em caso de conflito entre esta matriz e o conteúdo real de qualquer `PROTOCOL.md`, o `PROTOCOL.md` específico sempre prevalece — este documento é um índice derivado, não fonte primária.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
