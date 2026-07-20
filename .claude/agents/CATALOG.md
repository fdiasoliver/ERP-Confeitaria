# CATALOG.md — Catálogo dos 11 Sub-agents

Lista de registro dos 11 Sub-agents reais, com frontmatter resumido. Fonte de verdade de cada campo é o próprio arquivo `{slug}.md` — este catálogo é um índice, não repete o corpo de 14 seções de nenhum. `product-reviewer` (10º) adicionado na Sprint G.6; `platform-reviewer` (11º) adicionado na Sprint G.6.1.

| # | `name` | Arquivo | `tools` | `skills` | `model` |
|---|---|---|---|---|---|
| 1 | `ai-project-manager` | `ai-project-manager.md` | Read, Grep, Glob, `Agent(ai-solution-architect, ai-backend-engineer, ai-frontend-engineer, ai-documentation-engineer, ai-qa-engineer, ai-release-manager)` | sprint-governance, orchestrator, sprint-planning, project-bootstrap | inherit |
| 2 | `ai-solution-architect` | `ai-solution-architect.md` | Read, Grep, Glob | architecture, schema-pattern, governance | inherit |
| 3 | `ai-backend-engineer` | `ai-backend-engineer.md` | Read, Grep, Glob, Edit, Write, Bash | architecture, schema-pattern, repository-pattern, api-pattern, coding-standards | inherit |
| 4 | `ai-frontend-engineer` | `ai-frontend-engineer.md` | Read, Grep, Glob, Edit, Write | architecture, frontend-pattern, coding-standards | inherit |
| 5 | `ai-qa-engineer` | `ai-qa-engineer.md` | Read, Grep, Glob, Bash (`disallowedTools`: Write, Edit) | sprint-execution | inherit |
| 10 | `product-reviewer` | `product-reviewer.md` | Read, Grep, Glob | frontend-pattern, product-review | inherit |
| 11 | `platform-reviewer` | `platform-reviewer.md` | Read, Grep, Glob | platform-review | inherit |
| 6 | `ai-governance-officer` | `ai-governance-officer.md` | Read, Grep, Glob (`disallowedTools`: Write, Edit) | governance, sprint-audit, engineering-reviewer | inherit |
| 7 | `ai-documentation-engineer` | `ai-documentation-engineer.md` | Read, Grep, Glob, Edit | documentation, governance | inherit |
| 8 | `ai-refactoring-engineer` | `ai-refactoring-engineer.md` | Read, Grep, Glob, Edit | architecture, coding-standards (+ Skill de camada sob demanda) | inherit |
| 9 | `ai-release-manager` | `ai-release-manager.md` | Read, Grep, Glob | governance, sprint-governance, engineering-reviewer | inherit |

**Único agente com `tools: Agent(...)`:** `ai-project-manager` — é o único ponto de delegação em cadeia do sistema (decisão da Sprint G.5.3, formalizada em `agent-contract.md` item 5: "regra padrão é não pode").

**Único agente com `model` diferente de `inherit`:** nenhum — todos herdam o modelo da sessão que os invoca, sem exceção registrada nesta sprint.

---

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.4 (Implementação dos Sub-agents). -->
