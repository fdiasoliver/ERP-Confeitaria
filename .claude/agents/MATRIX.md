# MATRIX.md — Matriz de Ação dos 11 Sub-agents

Parte da documentação de `.claude/agents/` (Sprint G.5.4; `product-reviewer` adicionado na Sprint G.6; `platform-reviewer` na Sprint G.6.1). Não repete `CATALOG.md` (frontmatter) nem os 14 seções de cada `{slug}.md` — classifica objetivamente cada agente pelos 9 campos pedidos pela ordem de missão.

| Agente | Missão (1 linha) | Responsabilidade central | Skills utilizadas | Contracts utilizados | Artefatos produzidos | Artefatos consumidos | Pode delegar? | Recebe delegação? |
|---|---|---|---|---|---|---|:---:|:---:|
| `ai-project-manager` | Coordena missão ponta a ponta | Planejar, delegar, consolidar | sprint-governance, orchestrator, sprint-planning, project-bootstrap | agent, delegation, communication, artifact | Plano de missão, relatório consolidado | Pedido de missão | ✅ | Do usuário/Orchestrator |
| `ai-solution-architect` | Decide arquitetura técnica de uma missão | Camada/schema/ADR-necessário | architecture, schema-pattern, governance | agent, delegation | Decisão arquitetural registrada | Delegação de `ai-project-manager` | ❌ | De `ai-project-manager` |
| `ai-backend-engineer` | Implementa/revisa backend completo | Schema→Repository→Service→Route | architecture, schema-pattern, repository-pattern, api-pattern, coding-standards | agent, communication, artifact | Código conforme (`src/app/api`, `src/lib`, `prisma/schema.prisma`) | Escopo + decisão de `ai-solution-architect` | ❌ | De `ai-project-manager` |
| `ai-frontend-engineer` | Implementa/revisa front-end admin | Página + cliente HTTP | architecture, frontend-pattern, coding-standards | agent, communication, artifact | Código conforme (`src/app/admin`, `src/lib/api`) | API já pronta de `ai-backend-engineer` | ❌ | De `ai-project-manager` |
| `ai-qa-engineer` | Valida tecnicamente, nunca corrige | tsc/lint/build/regressão | sprint-execution | agent, communication | Relatório de validação | Código de `ai-backend-engineer`/`ai-frontend-engineer`, relatório de `product-reviewer` | ❌ | De `ai-project-manager` |
| `product-reviewer` | Revisa qualidade de produto, nunca corrige | UX/UI/navegação/usabilidade/responsividade | frontend-pattern, product-review | agent, communication, product-review | Relatório de Product Review classificado (A–F) | Código de `ai-frontend-engineer`, `DESIGN_SYSTEM.md`, `UX_GUIDELINES.md` | ❌ | De `ai-project-manager` ou `ai-frontend-engineer` |
| `platform-reviewer` | Revisa arquitetura de plataforma, nunca corrige | Multi-tenant/branding/white label/Theme Engine | platform-review | agent, communication, platform-review | Relatório de Platform Review (bloqueante/não-bloqueante) | Código de `ai-backend-engineer`/`ai-frontend-engineer`, `PLATFORM_OVERVIEW.md`, `ERP_PRODUCT_VISION.md` | ❌ | De `ai-project-manager`, `ai-backend-engineer` ou `ai-frontend-engineer` |
| `ai-governance-officer` | Audita conformidade de governança | ADR/DoD/classificação | governance, sprint-audit, engineering-reviewer | agent, communication | Parecer de conformidade | Missão a auditar | ❌ | De `ai-project-manager` ou qualquer persona |
| `ai-documentation-engineer` | Mantém documentação do ERP em dia | PLAN/CHANGELOG/README/docs | documentation, governance | agent, communication, artifact | `PLAN.md`/`CHANGELOG.md`/README atualizados | Resumo de implementação validada | ❌ | De `ai-project-manager` |
| `ai-refactoring-engineer` | Reduz dívida técnica sem quebrar comportamento | Migração para padrão-alvo | architecture, coding-standards (+ camada sob demanda) | agent, communication, artifact | Código migrado; `KNOWN_ISSUES.md` atualizado | `KNOWN_ISSUES.md` priorizado | ❌ | De `ai-project-manager`/`ai-solution-architect` |
| `ai-release-manager` | Coordena encerramento formal | DoD + relatório executivo | governance, sprint-governance, engineering-reviewer | agent, communication, artifact | Relatório Executivo de encerramento | Validação + documentação já concluídas | ❌ | Só de `ai-project-manager`, na etapa de Encerramento |

**Apenas 1 de 11 pode delegar** (`ai-project-manager`) — decisão intencional, não lacuna: evita cadeias de delegação descontroladas (`delegation-contract.md` item 5, limite de profundidade).

---

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.4 (Implementação dos Sub-agents). -->
