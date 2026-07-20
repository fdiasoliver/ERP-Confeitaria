# RESPONSIBILITY_MATRIX.md — Matriz de Responsabilidades do AI Operating System

Parte da arquitetura do AI Operating System (Sprint G.5.3). **Esta matriz é de camadas e papéis do AI Operating System — não de Skills individuais.** A matriz de Skills já existe e continua sendo a fonte de verdade para "o que cada Skill faz": `project-skill-governance/references/SKILL_MATRIX.md` (15 Skills × Planeja/Executa/Audita/Documenta/Valida/Aprova/Revisa/Decide). Este documento não a repete nem a substitui — opera um nível acima, nas 7 camadas de `LAYER_MODEL.md`.

## Metodologia

Mesma disciplina de `SKILL_MATRIX.md`: célula ✅ só quando o **conteúdo/função própria** da camada realiza aquele verbo diretamente, não quando apenas referencia onde a ação acontece. Os 8 verbos desta matriz (definidos pela ordem de missão da Sprint G.5.3) são parcialmente distintos dos 8 verbos de `SKILL_MATRIX.md`: **Planeja, Executa, Documenta, Audita** coincidem; **Valida, Entrega, Coordena, Revisa** são específicos desta matriz (`SKILL_MATRIX.md` usa Aprova/Decide em vez desses quatro — vocabulários deliberadamente diferentes, um por Skill individual, outro por camada arquitetural).

- **Planeja** — define arquitetura/escopo antes de outra camada agir.
- **Executa** — produz artefato/código diretamente, como função própria da camada.
- **Documenta** — mantém registro permanente e consultável.
- **Audita** — verifica conformidade de um artefato/trabalho já produzido por outra camada.
- **Valida** — checa um critério técnico objetivo antes de aceitar algo como pronto.
- **Entrega** — produz o artefato final que sai desta camada para a camada seguinte.
- **Coordena** — orquestra/delega entre outras camadas ou agentes.
- **Revisa** — passagem crítica ampla que amarra múltiplas dimensões (mais amplo que Audita).

## Matriz — 7 Camadas (`LAYER_MODEL.md`)

| Camada | Planeja | Executa | Documenta | Audita | Valida | Entrega | Coordena | Revisa |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| CLAUDE.md (raiz) | ❌ | ❌ | ✅¹ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Meta-Skill | ❌ | ❌ | ❌ | ❌ | ✅² | ❌ | ❌ | ❌ |
| Skills | ✅³ | ✅⁴ | ✅⁵ | ✅⁶ | ✅⁷ | ❌ | ❌ | ✅⁸ |
| Contracts | ❌ | ❌ | ❌ | ❌ | ✅⁹ | ❌ | ❌ | ❌ |
| Sub-agents | ❌ | ✅¹⁰ | ❌ | ❌ | ❌ | ✅¹¹ | ✅¹² | ❌ |
| Playbooks | ✅¹³ | ❌ | ❌ | ❌ | ❌ | ✅¹⁴ | ✅¹⁵ | ❌ |
| ERP | ❌ | ❌ | ❌ | ❌ | ❌ | ✅¹⁶ | ❌ | ❌ |

**Nota de status:** as linhas `Sub-agents` e `Playbooks` são **prospectivas** — nenhuma das duas camadas está implementada ainda (ver `LAYER_MODEL.md`, Camadas 5 e 6). As células ✅ ali descrevem o que a camada fará quando implementada (G.5.4+), não uma capacidade real hoje. As linhas `CLAUDE.md`, `Meta-Skill`, `Skills`, `Contracts` e `ERP` descrevem capacidade real e presente.

### Justificativas

1. `CLAUDE.md` (raiz) é, por definição, documentação — não planeja, executa, audita, valida, entrega, coordena ou revisa nada por si.
2. Meta-Skill: `project-skill-governance/SKILL.md` item 8 (Critérios de sucesso) — "passou pelo checklist... sem pendência aberta" é um critério técnico objetivo de aceite, não uma auditoria de trabalho já feito nem uma revisão ampla (confirmado pela Auditoria 5 da Sprint G.5.2.1: a meta-skill nunca audita).
3. Skills: `sprint-planning`/`orchestrator` planejam sprint/módulo (ver `SKILL_MATRIX.md` linhas correspondentes).
4. Skills: `architecture`/`coding-standards`/`repository-pattern`/`api-pattern`/`frontend-pattern`/`schema-pattern`/`sprint-execution` orientam execução direta de código/sprint.
5. Skills: `documentation`/`governance`/`sprint-execution` orientam a escrita/atualização de documentos.
6. Skills: `sprint-audit` verifica conformidade de trabalho já feito.
7. Skills: `sprint-execution` especifica comandos técnicos de validação (`tsc`/`lint`/`build`) e quando rodá-los.
8. Skills: `engineering-reviewer` é a única Skill com `Revisa` ✅ em `SKILL_MATRIX.md` — passagem crítica que amarra as demais 14.
9. Contracts: por natureza, todo contrato desta camada (`skill-contract.md`, `agent-contract.md` etc.) define um critério de conformidade verificável — essa é a função central da camada, não uma referência a outra.
10. Sub-agents (prospectivo): a função primária de um Sub-agent é executar a tarefa delegada (`LAYER_MODEL.md` Camada 5, "Objetivo").
11. Sub-agents (prospectivo): retornam um resultado resumido ao chamador — esse resultado é a entrega da camada (`LAYER_MODEL.md` Camada 5, "Saídas").
12. Sub-agents (prospectivo): um Sub-agent autorizado pode delegar a outro, conforme `DELEGATION_MODEL.md` — coordenação lateral entre Sub-agents, não coordenação de camadas inteiras (distinto de `Coordena` em Playbooks, que é coordenação de missão ponta a ponta).
13. Playbooks (prospectivo): por definição, um Playbook planeja a sequência de uma missão recorrente antes de disparar qualquer Sub-agent (`LAYER_MODEL.md` Camada 6, "Objetivo").
14. Playbooks (prospectivo): entrega o conjunto de artefatos da missão completa mais um relatório consolidado (`LAYER_MODEL.md` Camada 6, "Saídas").
15. Playbooks (prospectivo): orquestrar Sub-agents e Skills é a responsabilidade central desta camada (`LAYER_MODEL.md` Camada 6, "Responsabilidade" — "Orquestrar, nunca reimplementar").
16. ERP: entrega o produto funcionando ao usuário final (`LAYER_MODEL.md` Camada 7, "Saídas").

## Matriz — Papéis operacionais (`AI_PROMPT_ORCHESTRATOR.md`) aplicados a esta camada arquitetural

Os 4 papéis (Product Owner, Orchestrator, Executor, Auditor) já são definidos em `AI_PROMPT_ORCHESTRATOR.md` — não redefinidos aqui, apenas mapeados contra os mesmos 8 verbos, especificamente para o trabalho **nesta camada de arquitetura** (criar/manter `.claude/architecture/`, `.claude/contracts/` etc.), não para o ciclo geral de sprint do ERP (que já está coberto por `SKILL_MATRIX.md`/`RESPONSIBILITIES.md` da meta-skill).

| Papel | Planeja | Executa | Documenta | Audita | Valida | Entrega | Coordena | Revisa |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Product Owner | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Orchestrator | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Executor | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Auditor | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |

**Nota sobre Product Owner:** nenhuma célula ✅ nesta matriz porque a ação própria do Product Owner — aprovar/rejeitar — é o verbo **Aprova**, que não está entre os 8 verbos desta matriz (pertence ao vocabulário de `SKILL_MATRIX.md`). Isso replica, deliberadamente, o mesmo achado já registrado lá: nenhuma Skill nem papel "aprova" dentro desta matriz de 8 verbos — aprovação é ato formal do papel Product Owner/Auditor na Etapa 5 do Fluxo Operacional, fora do escopo de classificação por verbo de execução.

---

Precedência: em caso de conflito entre este documento e `AI_PROMPT_ORCHESTRATOR.md`, `project-skill-governance/references/SKILL_MATRIX.md` ou `PROJECT_GOVERNANCE.md`, o documento original sempre prevalece.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
