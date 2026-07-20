# ARCHITECTURE_OVERVIEW.md — Visão Prática das 8 Camadas

Parte da arquitetura do AI Operating System (Sprint G.5.3; atualizado na Sprint G.5.5 com a camada Operational Protocols). Complemento **prático** de `AI_OPERATING_SYSTEM.md` (visão/filosofia) e `LAYER_MODEL.md` (contrato camada-por-camada) — não repete nenhum dos dois, só mostra como as 8 camadas se conectam de fato, com um exemplo real.

## 1. Diagrama de dependência real (não só a cadeia linear)

```
CLAUDE.md (raiz) ───────────────────────────────┐
      │ sempre carregado                        │ sempre carregado
      ▼                                          ▼
Meta-Skill (project-skill-governance) ──governa──► Skills (.claude/skills/*)
      │                                                  │
      │ define formato/dependência                       │ pré-carregada via `skills:`
      ▼                                                  ▼
architecture/*_MODEL.md ──deriva──► contracts/*.md (interfaces) ──►┐
                                                                     │
architecture/*_MODEL.md ──deriva──► protocols/*/PROTOCOL.md (comportamentos) ──►┤
                                                                     │
                                                                     ▼
                                                          Sub-agents (.claude/agents/* — G.5.4, implementados)
                                                                              │
                                                                              │ orquestrado por
                                                                              ▼
                                                                      Playbooks (.claude/playbooks/* — G.5.6)
                                                                              │
                                                                              │ produz/altera
                                                                              ▼
                                                                        ERP (src/, prisma/)
```

Pontos de dependência que a cadeia linear de `LAYER_MODEL.md` não deixa explícitos:
- Todo `contracts/*.md` **deriva** de um `architecture/*_MODEL.md` — nunca o contrário (`LAYER_MODEL.md`, Camada 4).
- Todo `protocols/*/PROTOCOL.md` **deriva** de um `architecture/*_MODEL.md` (em especial `DELEGATION_MODEL.md`/`COMMUNICATION_MODEL.md`/`CONTEXT_MODEL.md`/`ARTIFACT_MODEL.md`) — mesma relação de Contracts, nunca o contrário (`LAYER_MODEL.md`, Camada 5, Sprint G.5.5).
- Contracts definem **interfaces** (formato); Protocols definem **comportamentos** (sequência/tempo) — um Sub-agent consome os dois, mas eles nunca se sobrepõem.
- Um Sub-agent consome Skills diretamente via `skills:` no seu frontmatter oficial — não passa pela Meta-Skill em tempo de execução, só em tempo de criação (a Meta-Skill valida a Skill antes de ela existir, não a cada uso).
- `CLAUDE.md` (raiz) é a única camada lida por **todas** as demais simultaneamente, porque é sempre carregada — nenhuma outra camada tem esse alcance direto.

## 2. Exemplo real ponta a ponta

Caso real já registrado neste projeto: a Sprint 2.D.1 implementou a camada Schema para o módulo de Configuração da Empresa. Mapeando essa mesma sequência para a arquitetura do AI OS, hoje:

| Etapa real da Sprint 2.D.1 | Camada do AI OS | Skill/documento consultado |
|---|---|---|
| Definir `StoreConfig` em `prisma/schema.prisma` | Camada 3 (Skills) → Camada 7 (ERP) | `schema-pattern` |
| Escrever `storeConfigRepository.ts` | Camada 3 → Camada 7 | `repository-pattern` |
| Escrever `storeConfigService.ts` + Validator | Camada 3 → Camada 7 | `architecture` (fluxo de camadas) + `references/layers.md` |
| Escrever `GET`/`PATCH /api/config` | Camada 3 → Camada 7 | `api-pattern` |
| Escrever `/admin/config` (6 seções) | Camada 3 → Camada 7 | `frontend-pattern` |
| Revisão final da sprint | Camada 3 | `engineering-reviewer` (orquestra as demais) |

Nenhuma dessas etapas hoje passa por Camada 4 (Contracts) nem Camada 5 (Sub-agents) — elas não existiam antes desta sprint. **A partir da Sprint G.5.4**, a mesma sequência passaria a ser delegada: um Sub-agent `ai-backend-engineer` (ver `agents/personas/ai-backend-engineer.md`) pré-carregaria `schema-pattern` + `repository-pattern` + `architecture` + `api-pattern` para as 4 primeiras etapas, e um `ai-frontend-engineer` assumiria a quinta, com handoff formal entre os dois (ver `COMMUNICATION_MODEL.md`) em vez de uma única sessão trocando de Skill mentalmente.

## 3. O que muda com a Sprint G.5.4

| Aspecto | Hoje (sessão única) | Com Sub-agents (G.5.4+) |
|---|---|---|
| Troca de Skill | A mesma sessão carrega `repository-pattern`, depois `api-pattern`, etc., sequencialmente, acumulando tudo no mesmo contexto | Cada Sub-agent pré-carrega só as Skills do seu papel (`skills:`), em contexto isolado — ver `CONTEXT_MODEL.md` |
| Delegação | Implícita — não há "chamador" e "chamado", é a mesma sessão decidindo o que fazer a seguir | Explícita — regida por `DELEGATION_MODEL.md` e `contracts/delegation-contract.md` |
| Responsabilidade | Uma sessão desempenha todos os papéis de `AI_PROMPT_ORCHESTRATOR.md` (Product Owner à parte) | Cada persona (`agents/personas/*.md`) assume um papel fixo, reduzindo o risco de uma sessão "esquecer" de trocar de chapéu |
| Handoff de artefato | Direto — a sessão já tem tudo em contexto | Formal — segue `contracts/artifact-contract.md` e `COMMUNICATION_MODEL.md` |
| Paralelização | Limitada (uma sessão, sequencial, salvo uso manual de forks) | Nativa — múltiplos Sub-agents podem ser delegados em paralelo quando não há dependência entre eles |

Esta sprint (G.5.3) **não implementa** nenhuma dessas mudanças — define a arquitetura para que a G.5.4 as implemente sem precisar redesenhar nada aqui.

## 4. Tabela — o que define vs. o que operacionaliza cada camada

| Camada | Documento(s) que a definem | Documento(s) que a operacionalizam |
|---|---|---|
| CLAUDE.md (raiz) | O próprio arquivo | — (não tem contrato; é fato, não processo) |
| Meta-Skill | `project-skill-governance/SKILL.md` | `references/skill-format.md`, `SKILL_TEMPLATE.md` |
| Skills | `LAYER_MODEL.md` Camada 3 | `contracts/skill-contract.md` |
| Contracts | `LAYER_MODEL.md` Camada 4 | Os próprios 5 contratos (não têm contrato de si mesmos — são o nível operacional) |
| Operational Protocols | `LAYER_MODEL.md` Camada 5 (Sprint G.5.5) | Os próprios 10 `protocols/*/PROTOCOL.md` (mesmo nível operacional dos Contracts, mas para comportamento em vez de formato) |
| Sub-agents | `LAYER_MODEL.md` Camada 6, `agents/AGENT_ARCHITECTURE.md` | `contracts/agent-contract.md` + Operational Protocols aplicáveis |
| Playbooks | `LAYER_MODEL.md` Camada 7, `../playbooks/PLAYBOOK_ARCHITECTURE.md` | (nenhum contrato dedicado ainda — implementação agendada para a Sprint G.5.6) |
| ERP | `CLAUDE.md` (raiz), `ARCHITECTURE.md`, `DOMAIN_MODEL.md` | Skills de camada de código |

---

Precedência: em caso de conflito entre este documento e `AI_OPERATING_SYSTEM.md`, `LAYER_MODEL.md`, `PROJECT_GOVERNANCE.md` ou `CLAUDE.md` (raiz), o documento original sempre prevalece.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). v1.1 em 15/07/2026 — Sprint G.5.5: diagrama e tabela atualizados com a camada Operational Protocols; Sub-agents/Playbooks atualizados para refletir status real (G.5.4 implementada, G.5.6 agendada). -->
