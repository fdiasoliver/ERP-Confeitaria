# DEPENDENCIES.md — Grafo de Dependências dos 11 Sub-agents

Parte da documentação de `.claude/agents/` (Sprint G.5.4; `product-reviewer` adicionado na Sprint G.6, inserido entre `ai-frontend-engineer` e `ai-qa-engineer`; `platform-reviewer` adicionado na Sprint G.6.1, inserido entre `ai-frontend-engineer` e `product-reviewer`). Cobre exclusivamente as relações de delegação/dependência entre os 11 Sub-agents reais — não repete `SKILL_DEPENDENCIES.md` (dependências entre Skills, documento distinto em `project-skill-governance/references/`).

## Grafo completo (único ponto de delegação: `ai-project-manager`)

```
                    ai-project-manager
                    /   |    |    |    |    |    \    \
                   /    |    |    |    |    |     \    \
    ai-solution-  ai-backend- ai-frontend- platform- product- ai-documentation- ai-qa- ai-release-
    architect     engineer    engineer     reviewer  reviewer engineer          engineer manager
```

Nenhum outro agente tem `tools: Agent(...)` — todos os 10 restantes são folhas do grafo (não delegam adiante). Confirmado por leitura do frontmatter real dos 11 arquivos.

## Dependências (quem só é acionado depois de quem)

| Agente | Depende de (pré-condição real) |
|---|---|
| `ai-project-manager` | Nenhuma — ponto de entrada |
| `ai-solution-architect` | `ai-project-manager` já ter definido escopo |
| `ai-backend-engineer` | `ai-solution-architect` concluído, se a tarefa exigia decisão de arquitetura |
| `ai-frontend-engineer` | `ai-backend-engineer` concluído (API já implementada — regra real de `frontend-pattern`) |
| `platform-reviewer` | `ai-backend-engineer`/`ai-frontend-engineer` concluídos (o que existir) — nova etapa a partir da Sprint G.6.1, obrigatória sempre que a missão implementou Backend e/ou Frontend |
| `product-reviewer` | `ai-frontend-engineer` concluído — etapa da Sprint G.6, obrigatória sempre que a missão implementou Frontend; executa em paralelo/logo após `platform-reviewer` (Sprint G.6.1) |
| `ai-qa-engineer` | `ai-backend-engineer`/`ai-frontend-engineer` concluídos **e**, quando aplicável, `platform-reviewer` (sempre que houve Backend/Frontend, Sprint G.6.1) **e** `product-reviewer` (quando houve Frontend, Sprint G.6) concluídos sem achado bloqueante |
| `ai-governance-officer` | Nenhuma pré-condição fixa — pode ser acionado a qualquer momento que uma dúvida de governança surgir |
| `ai-documentation-engineer` | `ai-qa-engineer` concluído (só documenta o que já foi validado) |
| `ai-refactoring-engineer` | Item de dívida técnica já priorizado em `KNOWN_ISSUES.md` |
| `ai-release-manager` | `ai-qa-engineer` E `ai-documentation-engineer` concluídos — nunca antes |

## Dependências proibidas (confirmadas por ausência de `tools: Agent` no frontmatter real)

- Nenhum agente de execução (`ai-backend-engineer`, `ai-frontend-engineer`, `ai-refactoring-engineer`) pode acionar outro diretamente — sempre via `ai-project-manager`.
- `ai-release-manager` nunca é acionado antes de `ai-qa-engineer`/`ai-documentation-engineer` (ver `EXECUTION_FLOW.md`).
- `ai-solution-architect` nunca delega (correção aplicada na FASE 0 desta sprint — ver histórico em `architecture/agents/personas/ai-solution-architect.md`).

## Ciclos

**Nenhum.** O grafo é uma árvore de profundidade 1 a partir de `ai-project-manager` — nenhum agente folha pode delegar de volta para `ai-project-manager` nem para qualquer outro agente (nenhum tem `tools: Agent`). Confirmado por inspeção de frontmatter dos 11 arquivos reais, não apenas por design pretendido.

## Limites

Profundidade máxima de delegação: **1** (chamador → `ai-project-manager` → agente folha). Consistente com `delegation-contract.md` item 5 ("limite de profundidade... não encadear delegações além de um nível razoável sem justificativa").

---

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.4 (Implementação dos Sub-agents). -->
