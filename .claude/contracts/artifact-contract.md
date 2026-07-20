# artifact-contract.md — Catálogo Oficial de Artefatos

Parte da arquitetura do AI Operating System (Sprint G.5.3). Deriva de `../architecture/ARTIFACT_MODEL.md` (ciclo de vida e categorias) — não repete essa explicação, apenas opera sobre ela: fixa um nome canônico por artefato real do projeto e elimina os sinônimos encontrados pela Auditoria 8 (Sprint G.5.2.1).

Este é um contrato **prospectivo**: Skills e documentos já existentes com nomenclatura divergente da tabela abaixo não precisam ser retroativamente corrigidos por este contrato — a correção acontece na próxima vez que cada documento for tocado por outra sprint, seguindo a mesma política de não-retrofit-obrigatório já usada para outras convenções deste projeto (`.claude/skills/project-skill-governance/SKILL.md` item 8).

## Catálogo

| Nome canônico | Sinônimos descontinuados | Formato | Onde vive | Produz | Consome |
|---|---|---|---|---|---|
| `SPRINT_X.md` | "documento de sprint", "prompt da sprint" | Markdown | Raiz do projeto (ou pasta de sprint, se convencionado) | Orchestrator | Executor, Auditor |
| `SPRINT_AUDIT.md` | — (já consistente) | Markdown | Junto ao `SPRINT_X.md` correspondente | Orchestrator (esqueleto) + Auditor (preenchimento) | Executor, Auditor |
| `PLAN.md` | — (já consistente) | Markdown, cumulativo | Raiz do projeto | Executor (após validação) | Todos os papéis, toda sprint futura |
| `CHANGELOG.md` | — (já consistente) | Markdown, cumulativo | Raiz do projeto | Executor (após validação) | Todos os papéis |
| `KNOWN_ISSUES.md` | — (já consistente) | Markdown, cumulativo, IDs `KI-N`/`DT-N`/`IC-N` | Raiz do projeto | `engineering-reviewer`, qualquer sessão que encontre dívida técnica | Sprints futuras que tocam o módulo afetado |
| **Resumo Executivo** | "Relatório Executivo" (usado por `engineering-reviewer`) | Seção de relatório, linguagem não técnica | Dentro do relatório final de uma missão | Auditor/Revisor | Product Owner |
| **Relatório Técnico** | — (já consistente) | Seção de relatório, detalhamento técnico | Dentro do relatório final de uma missão | Auditor/Revisor | Executor (para corrigir), Orchestrator (para a próxima sprint) |
| **Relatório Final** | "Laudo de Certificação" (usado na Sprint G.5.2.1 para o caso específico de auditoria de infraestrutura — mantido como um **subtipo nomeado** de Relatório Final, não um artefato à parte) | Composto: Resumo Executivo + Relatório Técnico + Inconsistências + Observações Técnicas + Melhorias Futuras + Prompt da próxima missão | Entregue ao final de uma missão | Auditor/Revisor | Product Owner, Orchestrator |
| **Prompt (da próxima missão)** | "Prompt da próxima Sprint" (`engineering-reviewer`), "Gerar Prompt da próxima Sprint" (`sprint-audit`/`WORKFLOW.md`) | Texto/rascunho, não um arquivo formal até virar `SPRINT_X.md` | Bloco final do Relatório Final | Auditor/Revisor | Orchestrator (na próxima missão) |
| **Checklist** | — (já usado de forma consistente como conteúdo, não como nome de artefato-arquivo próprio) | Lista de itens verificáveis, geralmente dentro de um `SKILL.md`/`references/` | Dentro de Skills, contratos ou relatórios | Quem define o critério de conclusão de uma etapa | Quem executa/audita a etapa |
| **Plano** | — | Termo genérico; **desambiguar sempre** para `SPRINT_X.md` (plano de sprint) ou `PLAYBOOK_ARCHITECTURE.md`/futuro Playbook (plano de missão recorrente) — "Plano" sozinho nunca é um nome de arquivo válido neste projeto |
| **ADR** (Architectural Decision Record) | — | Entrada em tabela, hoje registrada em `CLAUDE.md` (raiz), seção "Decisões arquiteturais tomadas" | `CLAUDE.md` (raiz) | Quem toma a decisão (com aprovação do Product Owner) | Toda sessão futura que toque a área decidida |
| **Decision Log** | — | **Não é um artefato separado neste projeto** — é o nome genérico da tabela "Decisões arquiteturais tomadas" em `CLAUDE.md` (raiz), que já é o log agregado de ADRs. Ver observação abaixo. | — | — | — |
| **Arquitetura** | — | Documento estrutural | **Dois locais distintos e não intercambiáveis** — ver observação abaixo | Quem projeta a camada/módulo | Quem implementa |
| **Mapa** | — | Tabela de relações (dependências, referências) | `project-skill-governance/references/SKILL_DEPENDENCIES.md` e docs equivalentes | Sessão de governança de Skill | Quem planeja uma sprint multi-camada |
| **Matriz** | — | Tabela de papel × verbo | `SKILL_MATRIX.md`, `RESPONSIBILITY_MATRIX.md` | Sessão de governança | Quem precisa saber "quem faz o quê" |
| **Diff** | — | Saída padrão de `git diff`, não um documento autoral | Efêmero — nunca persistido como artefato próprio | Ferramenta (Bash/git) | Quem revisa a mudança |
| **Patch** | — | Diff aplicado/persistido, quando necessário (ex. anexo de PR) | Fora do fluxo padrão deste projeto — usar apenas se uma ferramenta externa exigir | Ferramenta | Sistema externo (ex. GitHub) |

## Observação — ADR vs. Decision Log

Não são o mesmo artefato, mas também não são independentes: **ADR é o registro individual de uma decisão**; **"Decision Log" é o nome genérico do log agregado**, que neste projeto já existe e se chama, na prática, a tabela "Decisões arquiteturais tomadas" dentro de `CLAUDE.md` (raiz) — não um arquivo `DECISION_LOG.md` separado. Forçar a criação de um `DECISION_LOG.md` novo duplicaria essa tabela sem necessidade real. Recomendação: manter como está — "Decision Log" é um termo válido para se referir à tabela existente, não um artefato-arquivo novo a criar.

## Observação — colisão de nome "Arquitetura"

Existem hoje **dois locais legítimos e não intercambiáveis** chamados/relacionados a "arquitetura": `ARCHITECTURE.md` (raiz do projeto — arquitetura de **código do ERP**: camadas, decisões técnicas, riscos) e `.claude/architecture/*.md` (esta Sprint G.5.3 — arquitetura do **AI Operating System**: como a IA opera sobre o projeto). São públicos-alvo e assuntos diferentes, mas o nome sozinho ("me mostra a arquitetura") é ambíguo. Recomendação para sprints futuras: sempre qualificar — "arquitetura do ERP" (`ARCHITECTURE.md`) vs. "arquitetura do AI Operating System" (`.claude/architecture/`). Não renomeado aqui porque `ARCHITECTURE.md` é documento de governança do ERP, fora do escopo de alteração desta sprint.

---

Precedência: em caso de conflito entre este contrato e `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, qualquer ADR ou `CLAUDE.md` (raiz), o documento original sempre prevalece.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
