# README.md — Operational Protocols (Doce Menina confeitaria-app)

Porta de entrada humana desta pasta. Não repete o conteúdo de nenhum `PROTOCOL.md` — só orienta a navegação. Para o arquivo ativável de cada comportamento, vá direto ao `{protocolo}/PROTOCOL.md`.

## O que é um Operational Protocol

Parte da arquitetura do AI Operating System (Sprint G.5.5), inserida como Camada 5 em `.claude/architecture/LAYER_MODEL.md`, entre Contracts e Sub-agents. Definição oficial de distinção (`LAYER_MODEL.md`):

> Contracts definem **interfaces** (formato/estrutura verificável). Operational Protocols definem **comportamentos** (como as camadas colaboram durante uma missão — sequência, eventos, critérios de transição). Sub-agents **executam** comportamentos. Playbooks **orquestram** comportamentos. Skills **fornecem conhecimento**.

Um Protocol nunca define quem faz o quê (isso é papel de cada persona de Sub-agent), nunca define o formato de um artefato (isso é `contracts/artifact-contract.md`), e nunca fornece conhecimento de domínio (isso é Skill).

## Os 10 Protocols

`mission`, `delegation`, `context`, `communication`, `validation`, `review`, `documentation`, `handoff`, `completion`, `error-handling` — cada um em `{nome}/PROTOCOL.md`, seguindo a mesma estrutura fixa de 10 seções.

## Documentos desta pasta

| Arquivo | Cobre |
|---|---|
| `PROTOCOL_INDEX.md` | Navegação rápida — os 10 Protocols agrupados por fase da missão |
| `PROTOCOL_MATRIX.md` | Matriz objetivo/consumidores/produtores/Skills/Contracts/Sub-agents/artefatos por Protocol |
| `RESPONSIBILITIES.md` | Quem inicia/executa/valida/documenta/encerra cada Protocol |
| `EXECUTION_MODEL.md` | Fluxo oficial Orchestrator → Protocol → Sub-agent → Protocol → Orchestrator |

**Comece por `PROTOCOL_INDEX.md`.**

---

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
