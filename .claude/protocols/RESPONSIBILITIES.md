# RESPONSIBILITIES.md — Quem Faz o Quê entre os 10 Operational Protocols

Parte da documentação de `.claude/protocols/` (Sprint G.5.5). Distinto de `PROTOCOL_MATRIX.md` (objetivo/artefato por protocolo) — este documento classifica os 10 protocolos pelos 5 verbos pedidos pela ordem de missão: quem inicia, quem executa, quem valida, quem documenta, quem encerra (o próprio protocolo, não a missão inteira — "quem encerra a missão" é sempre `completion`, ver linha própria).

| Protocolo | Quem inicia | Quem executa | Quem valida | Quem documenta | Quem encerra (este protocolo) |
|---|---|---|---|---|---|
| `mission` | Product Owner (via `ai-project-manager`) | `ai-project-manager` | — (não valida conteúdo; a checagem de dependências em `PLAN.md` é parte do próprio fluxo) | `ai-project-manager` (produz `SPRINT_X.md`/plano) | `ai-project-manager`, ao transicionar para `delegation` |
| `delegation` | Delegador (`ai-project-manager` ou sessão principal) | Delegado (Sub-agent autorizado) | — (a validação de conformidade do resultado é do protocolo `review`, não deste) | — | Delegado, ao devolver resumo estruturado; ou delegador, ao escalar/interromper |
| `context` | Qualquer camada, ao ser inicializada | Mecanismo oficial do Claude Code (carregamento) + decisão de `skills:` tomada em tempo de criação do Sub-agent | — | — | A própria camada, ao retornar o resumo (contexto é descartado) |
| `communication` | Camada chamadora | Ambas as camadas (formatam a mensagem em cada ponta) | — (formato verificado por `communication-contract.md`, não por este protocolo em si) | — | Chamador, ao consolidar o retorno |
| `validation` | `ai-backend-engineer`/`ai-frontend-engineer`, ao concluir uma parte | `ai-qa-engineer` | `ai-qa-engineer` | — (não documenta; devolve resumo, nunca escreve em `PLAN.md`/`CHANGELOG.md`) | `ai-qa-engineer`, ao entregar o resumo passou/falhou |
| `review` | Transição automática pós-`validation` | `ai-governance-officer` | `ai-governance-officer` (emite veredito APROVADO/NECESSITA CORREÇÃO/BLOQUEADO) | `ai-governance-officer` (registra em `KNOWN_ISSUES.md` quando há dívida técnica) | `ai-governance-officer`, ao emitir o veredito |
| `documentation` | Transição pós-`validation`, ou detecção de referência quebrada | `ai-documentation-engineer` | — (confere caminhos antes de escrever, mas não emite veredito de conformidade — isso é `review`) | `ai-documentation-engineer` | `ai-documentation-engineer` |
| `handoff` | Sub-agent que conclui sua parte | `ai-project-manager` (coordena a transição) | `ai-project-manager` (confirma pré-condição do Sub-agent seguinte) | `ai-project-manager` (registra no relatório consolidado da missão) | Sub-agent seguinte, ao confirmar que pode começar |
| `completion` | `ai-project-manager`, ao chegar na etapa de Encerramento | `ai-release-manager` | `ai-release-manager` (checklist de DoD) | `ai-release-manager` (Relatório Executivo) | `ai-release-manager` — **este protocolo também encerra a missão inteira**, distinto dos demais |
| `error-handling` | Qualquer camada que encontra o erro | A própria camada (classifica e relata) | — | — (relato textual, não persistido como documento) | Delegador/Orchestrator, ao decidir o próximo passo — nunca a camada que falhou |

## Regra geral confirmada nos 10 protocolos

Nenhum protocolo tem a mesma entidade em "quem executa" e "quem valida" quando ambos existem (`validation`/`review` sempre separam execução técnica de revisão de conformidade) — mesmo princípio de separação de papéis já usado em `sprint-execution`/`sprint-audit` (Skills) e preservado aqui na camada de comportamento.

---

Precedência: em caso de conflito entre este documento e o conteúdo real de qualquer `PROTOCOL.md`, o `PROTOCOL.md` específico sempre prevalece.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
