# README.md — Sub-agents do AI Operating System (Doce Menina confeitaria-app)

Esta pasta contém os 11 Sub-agents **reais e funcionais** do Claude Code — 9 implementados na Sprint G.5.4, a partir da arquitetura de persona definida na Sprint G.5.3 (`.claude/architecture/agents/`) e do contrato formal `.claude/contracts/agent-contract.md`; `product-reviewer` (10º) adicionado na Sprint G.6 (Product Review System); `platform-reviewer` (11º) adicionado na Sprint G.6.1 (Platform & Product Architecture Consolidation). Comece por `INDEX.md` para navegação rápida — este documento é a porta de entrada humana, não repete o que já está nos outros 6.

## O que é um Sub-agent aqui

Um arquivo `.md` nesta pasta com frontmatter `name`/`description` é descoberto automaticamente pelo Claude Code e se torna invocável — por você (`@nome` ou linguagem natural) ou automaticamente por outro agente autorizado a delegar. Cada um pré-carrega um conjunto fixo de Skills (`skills:` no frontmatter) e opera com um conjunto restrito de ferramentas (`tools:`), conforme decidido na arquitetura da Sprint G.5.3 e formalizado em `agent-contract.md`.

## Os 11 agentes

1. `ai-project-manager` — coordena uma missão, delega para os demais.
2. `ai-solution-architect` — decide arquitetura técnica de uma missão.
3. `ai-backend-engineer` — implementa/revisa Schema/Repository/Service/Route.
4. `ai-frontend-engineer` — implementa/revisa página admin e cliente HTTP.
5. `platform-reviewer` — revisa conformidade de plataforma (Multi-tenant/Branding/White Label/Theme Engine), nunca corrige. **(Sprint G.6.1)**
6. `product-reviewer` — revisa qualidade de produto (UX/UI/navegação/usabilidade/responsividade), nunca corrige. **(Sprint G.6)**
7. `ai-qa-engineer` — valida tecnicamente (tsc/lint/build/regressão), nunca corrige.
8. `ai-governance-officer` — audita conformidade com `PROJECT_GOVERNANCE.md`, nunca corrige.
9. `ai-documentation-engineer` — mantém documentação do ERP sincronizada.
10. `ai-refactoring-engineer` — reduz dívida técnica sem mudar comportamento.
11. `ai-release-manager` — coordena o encerramento de uma missão.

Detalhe completo de cada um: `CATALOG.md` (resumo) ou o arquivo real `{slug}.md` (completo, 14 seções cada, ver `agent-contract.md`).

## Como usar

Peça em linguagem natural ("use o ai-backend-engineer para implementar X") ou @-mencione. Para uma missão completa, comece por `ai-project-manager` — ele decide a sequência de delegação, seguindo `EXECUTION_FLOW.md`.

## O que esta pasta nunca contém

Nenhum documento de arquitetura conceitual (isso é `.claude/architecture/agents/`), nenhum contrato formal (isso é `.claude/contracts/`), nenhuma Skill (isso é `.claude/skills/`). Esta pasta é só a implementação real.

---

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.4 (Implementação dos Sub-agents). -->
