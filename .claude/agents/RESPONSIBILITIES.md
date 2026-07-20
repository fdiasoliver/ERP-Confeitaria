# RESPONSIBILITIES.md — Quem faz o quê entre os 11 Sub-agents

Parte da documentação de `.claude/agents/` (Sprint G.5.4; `product-reviewer` e a coluna "Revisa (produto)" adicionados na Sprint G.6; `platform-reviewer` e a coluna "Revisa (plataforma)" adicionados na Sprint G.6.1). Distinto de `MATRIX.md` (ação/artefato por agente) — este documento classifica os 11 agentes pelos verbos pedidos pela ordem de missão: quem faz, quem nunca faz, quem coordena, quem implementa, quem audita, quem documenta, quem valida, quem revisa (arquitetura), quem revisa (produto), quem revisa (plataforma).

| Agente | Coordena | Implementa | Audita | Documenta | Valida | Revisa (arquitetura) | Revisa (produto) | Revisa (plataforma) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ai-project-manager` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `ai-solution-architect` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `ai-backend-engineer` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `ai-frontend-engineer` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `ai-qa-engineer` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `ai-governance-officer` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `ai-documentation-engineer` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `ai-refactoring-engineer` | ❌ | ✅ (modo migração) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `ai-release-manager` | ✅ (só encerramento) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `product-reviewer` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `platform-reviewer` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**"Revisa (produto)", "Revisa (plataforma)" e "Revisa (arquitetura)" nunca se sobrepõem, nem com "Audita"**: `ai-solution-architect` revisa decisão técnica/camada de uma missão específica; `ai-governance-officer` audita conformidade de processo/documentação; `product-reviewer` revisa exclusivamente qualidade de experiência entregue ao usuário (UX/UI/navegação/usabilidade/responsividade); `platform-reviewer` revisa exclusivamente conformidade com a arquitetura de plataforma (Multi-tenant/Branding/White Label/Theme Engine/isolamento de dados) — ver `PLATFORM_OVERVIEW.md`, "Experience Review vs. Platform Review" para a distinção completa.

## Quem nunca faz o quê (limites cruzados, confirmados no corpo de cada `{slug}.md`, seção 5)

- **Nunca implementa código**: `ai-project-manager`, `ai-solution-architect`, `ai-qa-engineer`, `ai-governance-officer`, `ai-release-manager`, `product-reviewer`, `platform-reviewer` — todos read-only ou quase (exceção: `ai-documentation-engineer` edita apenas `.md`).
- **Nunca corrige o que encontra** (só reporta): `ai-qa-engineer` (técnico), `ai-governance-officer` (conformidade), `product-reviewer` (produto), `platform-reviewer` (plataforma) — separação de papéis deliberada, mesmo princípio de `sprint-audit`/`sprint-execution` nunca serem a mesma sessão.
- **Nunca decide arquitetura**: todos exceto `ai-solution-architect`.
- **Nunca delega**: todos exceto `ai-project-manager` (ver `MATRIX.md`, coluna "Pode delegar?").
- **Nunca introduz funcionalidade nova**: `ai-refactoring-engineer` — se a tarefa exige isso, escala (deixa de ser refatoração).
- **Nunca decide conteúdo de negócio do ERP**: todos os 9 — isso permanece em `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md`/Product Owner, nenhuma persona tem essa autoridade.

## Quem audita quem (separação de papéis)

`ai-governance-officer` audita conformidade de qualquer missão coordenada por `ai-project-manager`, incluindo o trabalho de `ai-backend-engineer`/`ai-frontend-engineer`/`ai-refactoring-engineer` — nunca audita a si mesmo, nunca é acionado pela persona que está sendo auditada.

---

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.4 (Implementação dos Sub-agents). -->
