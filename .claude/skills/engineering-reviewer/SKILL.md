---
name: engineering-reviewer
description: Use this skill at the end of every sprint in the Doce Menina confeitaria-app project, before declaring it ready for audit/acceptance. It is the master review checklist that orchestrates all other project skills into one critical review pass (architecture, code, docs, governance, PLAN, CHANGELOG, scope, regression, risk, technical debt) and mandates the final report structure (Executive Report, Technical Report, Inconsistências, Observações Técnicas, Melhorias Futuras, suggested next-sprint prompt). This is the most important skill in the series — it does not replace any other skill, it ties them together.
---

# Revisão Crítica de Engenharia — Doce Menina (confeitaria-app)

Esta é a Skill de **revisão final de sprint** — o checklist-mestre que orquestra as demais Skills deste projeto em uma única passagem crítica, e acrescenta apenas o que nenhuma delas cobre ainda: regressão, riscos e dívida técnica (ver `references/checklist.md`). Ela não reinventa nada — cada item da seção 4 aponta para a Skill exata com o detalhe. Fonte de verdade: `PROJECT_GOVERNANCE.md` Seções 7, 14 e 17.

## 1. Objetivo

Garantir que nenhuma sprint seja declarada pronta para auditoria sem uma revisão crítica que cubra todas as camadas tocadas, código, documentação, governança, `PLAN.md`/`CHANGELOG.md`, escopo, regressão, risco e dívida técnica.

## 2. Quando utilizar

Ao final de toda sprint, antes de declará-la pronta para auditoria/aceite.

## 3. Quando NÃO utilizar

- Durante a implementação em si → `sprint-execution`.
- Para decidir se uma sprint pode começar → `sprint-planning`/`orchestrator`.
- Para o fluxo de auditoria formal em si → `sprint-audit` — esta Skill alimenta a auditoria, não a substitui.

## 4. Responsabilidades

**Revisão arquitetural** — percorrer a linha de cada camada que a sprint tocou, sem pular nenhuma sob a justificativa de "não parecer relevante":

| Camada | Skill a consultar |
|---|---|
| Schema (`prisma/schema.prisma`) | `schema-pattern` |
| Route Handler / API | `api-pattern` |
| Service / Validator | `architecture` (seção 4, Responsabilidades) |
| Repository | `repository-pattern` |
| Front-end admin | `frontend-pattern` |

**Revisão de código** — nomenclatura e organização: `coding-standards`. Padrões proibidos gerais: `architecture` seção 10 (Anti-patterns). Anti-patterns específicos de camada: seção 10 de `schema-pattern`, `api-pattern`, `repository-pattern` e `frontend-pattern`. Não repetir nenhuma dessas listas aqui — apenas confirmar que cada uma foi checada.

**Revisão documental** — ecossistema completo (README, `docs/`, templates oficiais, handoff, referências cruzadas): `documentation`.

**Revisão da governança** — ADR, DoD de Sprint × Módulo, checklists, tipos compartilhados, versionamento, Política de Evolução da Governança: `governance`.

**Revisão do PLAN** — regras: `governance`. Técnica objetiva de verificação (contagem de ocorrências, nunca só leitura visual): `sprint-audit`.

**Revisão do CHANGELOG** — regras: `governance`. Teste "relata ou opina?" para garantir texto estritamente factual: `sprint-audit`.

**Revisão do escopo** — escopo/fora-de-escopo declarados no `SPRINT_X.md`: `sprint-planning`. Proibição de ampliar escopo por iniciativa própria durante a execução: `sprint-execution` + `sprint-governance`.

**Regressão, riscos e dívida técnica** — conteúdo próprio desta Skill, não coberto por nenhuma outra: ver `references/checklist.md`.

## 5. Fluxo resumido

Percorrer, nesta ordem: camadas tocadas (item 4, tabela) → código → documentação → governança → PLAN/CHANGELOG → escopo → regressão/riscos/dívida técnica (`references/checklist.md`) → checklist final → critérios de aprovação → produzir o relatório final obrigatório (`references/checklist.md`).

## 6. Arquivos auxiliares disponíveis

| Arquivo | Conteúdo |
|---|---|
| `references/checklist.md` | Regressão (5 funcionalidades-âncora), tabela de priorização de riscos, convenção de dívida técnica (`KNOWN_ISSUES.md`), checklist final, critérios de aprovação e a estrutura obrigatória do relatório final (6 blocos) |

## 7. Como carregar os arquivos auxiliares

Ao efetivamente conduzir a revisão final de uma sprint — não é necessário para uma consulta rápida de "qual Skill cobre a camada X" (item 4 já basta).

## 8. Critérios de sucesso

Uma sprint só é declarada pronta para auditoria quando todos os itens do "Checklist final" em `references/checklist.md` estão marcados e os 6 blocos do relatório final foram produzidos.

## 9. Limitações

Não substitui `sprint-audit` (fluxo formal de auditoria) nem decide sozinha a aprovação de `PLAN.md`/`CHANGELOG.md` — usa `governance`/`sprint-audit` para isso. Não corrige achados por conta própria: registra e reporta.

## 10. Anti-patterns

- Pular a revisão de uma camada sob a justificativa de "não parecer relevante para esta sprint".
- Declarar uma sprint pronta para auditoria sem produzir os 6 blocos do relatório final (`references/checklist.md`).
- Mencionar dívida técnica no relatório sem registrá-la em `KNOWN_ISSUES.md`.
- Verificar `PLAN.md`/`CHANGELOG.md` só por leitura visual, sem a técnica objetiva de `sprint-audit`.

## 11. Referências cruzadas

`architecture`, `schema-pattern`, `api-pattern`, `repository-pattern`, `frontend-pattern`, `coding-standards`, `documentation`, `governance`, `sprint-planning`, `sprint-execution`, `sprint-governance`, `sprint-audit`, `orchestrator`; `PROJECT_GOVERNANCE.md` Seções 7, 14 e 17.

### Compatibilidade com Sub-agents

Nenhum Sub-agent foi criado neste projeto ainda (previsto para a Sprint G.5.3).

- **Deveria pré-carregar esta Skill:** um futuro subagent de revisão/auditoria de sprint (ex.: `sprint-reviewer` ou `sprint-auditor`) — é a Skill inteira de orquestração da revisão final.
- **Não deveria pré-carregá-la:** qualquer subagent de implementação pura (ex.: `api-implementer`, `backend-implementer`), que usa as Skills de camada diretamente, não o checklist-mestre; também `Explore`/`Plan`.
- **Conhecimento fornecido:** roteiro completo de revisão final de sprint, mapeado por camada/documento/risco.
- **Artefatos produzidos:** o relatório final obrigatório (6 blocos, ver `references/checklist.md`); entradas em `KNOWN_ISSUES.md` quando dívida técnica é encontrada.
- **Entradas esperadas:** uma sprint implementada, aguardando revisão antes da auditoria.
- **Saídas entregues:** veredito (pronta / necessita correção / bloqueada) + os 6 blocos do relatório.

---

Precedência: em caso de conflito entre esta Skill e `PROJECT_GOVERNANCE.md`, o documento original sempre prevalece.

<!-- Histórico: v1.0 criada nesta sessão (Sprint de criação das 14 Skills). v2.0 em 13/07/2026 — Sprint G.5.2: renomeada skill.md→SKILL.md, corpo reestruturado nas 11 seções oficiais, conteúdo de Regressão/Riscos/Dívida técnica/Checklist final/Relatório final movido para references/checklist.md, referências cruzadas por número de item corrigidas para citação por seção nomeada, adicionada Compatibilidade com Sub-agents. -->
