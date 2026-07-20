# SKILL_MATRIX.md — Matriz de Ações das 17 Skills

Parte da meta-skill `project-skill-governance` (Sprint G.5.1 — AI Operating System Foundation; linha `schema-pattern` adicionada na Sprint G.5.2, corrigindo omissão real; linha `product-review` adicionada na Sprint G.6, Skill nova; linha `platform-review` adicionada na Sprint G.6.1, Skill nova). Não repete o conteúdo de nenhuma das 17 Skills — apenas classifica objetivamente qual ação cada uma orienta a executar.

## Metodologia

Cada célula ✅ exige que o **conteúdo próprio** da Skill (não uma referência a outra Skill) instrua diretamente a execução daquele verbo. Uma Skill que apenas *menciona* ou *referencia* onde uma ação acontece em outro lugar recebe ❌ naquela coluna, mesmo que o tema apareça no seu texto. Nunca "às vezes" — toda célula ambígua foi resolvida para ❌ com nota de rodapé explicando o critério.

Definição de cada verbo, para consistência entre as 112 células:

- **Planeja** — definir o que será feito antes da implementação (escopo, divisão, dependências, DoR).
- **Executa** — orientar a implementação em si (escrever código, seguir a sequência de microtarefas).
- **Audita** — verificar/classificar trabalho já feito quanto à conformidade.
- **Documenta** — orientar a escrita/atualização de artefatos de documentação do projeto.
- **Valida** — especificar comandos técnicos de validação (tsc/lint/build/QA) e quando rodá-los.
- **Aprova** — emitir o veredito formal final (APROVADO/NECESSITA CORREÇÃO/BLOQUEADO).
- **Revisa** — conduzir uma passagem crítica estruturada que amarra múltiplas dimensões (mais amplo que Audita).
- **Decide** — aplicar um critério de julgamento entre alternativas (ex.: classificar um achado).

## Matriz

| Skill | Planeja | Executa | Audita | Documenta | Valida | Aprova | Revisa | Decide |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `sprint-governance` | ❌ | ❌ | ❌ | ✅¹ | ❌ | ❌ | ❌ | ❌ |
| `project-bootstrap` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `orchestrator` | ✅² | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `governance` | ❌ | ❌ | ❌ | ✅³ | ❌ | ❌ | ❌ | ❌ |
| `architecture` | ❌ | ✅⁴ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `coding-standards` | ❌ | ✅⁴ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `repository-pattern` | ❌ | ✅⁴ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `api-pattern` | ❌ | ✅⁴ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `frontend-pattern` | ❌ | ✅⁴ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `schema-pattern` | ❌ | ✅⁴ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `sprint-planning` | ✅⁵ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `sprint-execution` | ❌ | ✅⁶ | ❌ | ✅⁷ | ✅⁸ | ❌ | ❌ | ❌ |
| `sprint-audit` | ❌ | ❌ | ✅⁹ | ❌ | ❌ | ❌ | ❌ | ✅¹⁰ |
| `documentation` | ❌ | ❌ | ❌ | ✅¹¹ | ❌ | ❌ | ❌ | ❌ |
| `engineering-reviewer` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅¹² | ❌ |
| `product-review` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅¹⁵ | ✅¹⁶ |
| `platform-review` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅¹⁷ | ✅¹⁸ |

**Nenhuma das 17 Skills tem ✅ em Aprova.** Isso não é uma lacuna — é intencional (ver nota ¹³).

## Justificativas (por célula ✅)

1. `sprint-governance` item 8 — regra direta e acionável de PLAN.md/CHANGELOG.md ("uma única entrada por módulo e por sprint — nunca duplicar..."), não apenas uma referência.
2. `orchestrator` itens 2–3 — FASE 0 e sua tradução direta em `SPRINT_X.md` são o conteúdo central da Skill.
3. `governance` itens 6, 7, 10 — regras completas de PLAN.md, CHANGELOG.md e tabela de atualização documental; mais detalhado que `sprint-governance` item 8, que apenas resume.
4. `architecture`/`coding-standards`/`repository-pattern`/`api-pattern`/`frontend-pattern`/`schema-pattern` — cada uma orienta diretamente a escrita de uma camada real de código (Service/nomenclatura/Repository/Route/Front-end/Schema), com exemplos e checklists próprios.
5. `sprint-planning` itens 1–9 — divisão de módulo em sprints, escopo, dependências, DoR; conteúdo próprio, não referência.
6. `sprint-execution` item 2 — sequência de microtarefas.
7. `sprint-execution` item 3 — ordem obrigatória entre validação e atualização de PLAN.md/CHANGELOG.md (conteúdo próprio, distinto da regra geral já em `governance`).
8. `sprint-execution` item 4 — o que roda em qual sprint (`tsc`/`lint`/`build`/`db push`), com exemplo real (Sprint 2.D.5).
9. `sprint-audit` itens 1–7 — técnica de auditoria (releitura, verificação por busca de texto, o que checar por camada).
10. `sprint-audit` itens 2 e 10 — o teste de duas perguntas para classificar Inconsistência, e a árvore de decisão entre os 3 vereditos, são ambos procedimentos de **decisão/classificação**. Distinto de Aprova: `sprint-audit` fornece o critério de decisão, mas o ato formal de emitir o parecer (Etapa 5 do Fluxo Operacional, `AI_PROMPT_ORCHESTRATOR.md`) pertence ao papel Auditor, não à Skill em si — por isso Aprova permanece ❌ aqui.
11. `documentation` itens 1–2, 4, 6, 8, 9, 11 — README, docs/, roadmap, documentos de produto, handoff, templates, tabela de atualização complementar.
12. `engineering-reviewer` itens 1–13 — é literalmente a "Revisão Crítica de Engenharia"; orquestra as outras 13 Skills em uma única passagem, o que é por definição mais amplo que "Audita" (que é a técnica específica de `sprint-audit`).
15. `product-review` Seção 4 — percorrer os 4 checklists (UX/UI/Funcional/Navegação) e confrontar contra `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md` é uma passagem crítica estruturada que amarra múltiplas dimensões de produto, mesma natureza de "Revisa" já aplicada a `engineering-reviewer` — mas com escopo de produto, não de conformidade/arquitetura, por isso ambas têm ✅ em Revisa sem se sobreporem (`product-review` Seção 3 declara isso explicitamente).
16. `product-review` Seção 4 — classificar cada achado em exatamente uma categoria (A–F) é aplicar um critério de julgamento objetivo entre alternativas, mesma natureza de "Decide" já aplicada a `sprint-audit` (nota 10) — critério análogo (teste do checklist Funcional para "isto é categoria A?"), aplicado a um domínio diferente (produto, não conformidade de sprint).
17. `platform-review` Seção 4 — percorrer o checklist de plataforma e confrontar contra `PLATFORM_OVERVIEW.md`/`ERP_PRODUCT_VISION.md` é a mesma natureza de "Revisa" já reconhecida em `product-review` (nota 15) e `engineering-reviewer` (nota 12) — escopo de arquitetura de plataforma (Multi-tenant/Branding/White Label/Theme Engine), nunca sobreposto aos outros dois.
18. `platform-review` Seção 4 — classificar cada achado como bloqueante/não-bloqueante é um critério de julgamento objetivo, mesma natureza de "Decide" já aplicada a `sprint-audit` (nota 10) e `product-review` (nota 16) — critério análogo (teste do checklist de plataforma para "isto já deveria estar parametrizado?"), aplicado a um domínio diferente (conformidade de plataforma).

## Notas de ambiguidade resolvida

**13. Nenhuma Skill marcada com Aprova.** `sprint-governance` item 6 e `sprint-audit` item 10 documentam os 3 vereditos possíveis (APROVADO/NECESSITA CORREÇÃO/BLOQUEADO), mas nenhuma das duas *emite* o veredito — isso é um ato do papel Auditor na Etapa 5 do Fluxo Operacional (`AI_PROMPT_ORCHESTRATOR.md` Seção 4), não uma ação que uma Skill realiza por si. `engineering-reviewer` item 13.1 pede um "veredito final" no seu Relatório Executivo, o que tensiona com essa leitura — mas o próprio item 12 da mesma Skill afirma explicitamente que a árvore de decisão continua sendo de `sprint-audit`, então resolvi a ambiguidade mantendo Aprova ❌ para todas as 14, com esta nota em vez de decidir silenciosamente.

**14. `engineering-reviewer` não recebeu Decide**, apesar de ser "a mais próxima" segundo o contexto herdado desta sessão. A Skill orienta *que* uma decisão de aprovação será tomada (item 12), mas não contém ela própria um critério de julgamento aplicável (isso está em `sprint-audit` itens 2 e 10) — por isso Decide ficou com `sprint-audit`, não com `engineering-reviewer`.

## Checklist desta entrega

- [x] Li as 14 Skills reais (não 13) antes de montar a matriz original; linha `schema-pattern` (15ª) adicionada na Sprint G.5.2.
- [x] Cada célula ✅ tem uma justificativa numerada apontando o item exato da Skill.
- [x] Nenhuma célula marcada como "às vezes" — toda ambiguidade genuína foi resolvida para ❌ com nota.
- [x] Nenhum outro arquivo criado ou alterado.

## Problemas encontrados

Nenhuma inconsistência real entre as 14 Skills originais que impedisse preencher a matriz — todas usam terminologia consistente (papéis, FASEs, estados) sem se contradizerem. `schema-pattern` (15ª Skill) ficou de fora desta matriz até a Sprint G.5.2 — omissão real, corrigida agora, não uma inconsistência de conteúdo.

## Melhorias (não implementadas aqui)

- Nenhuma Skill cobre explicitamente "Aprova" como ação própria — se o desenho do AI Operating System eventualmente quiser uma Skill dedicada ao ato formal de aprovação (distinta de `sprint-audit`, que só fornece o critério), essa é uma lacuna real, não apenas uma ausência esperada.

## Dependências

Este arquivo pressupõe a existência dos outros arquivos da meta-skill (`README.md`, `SKILL.md`, `SKILL_DEPENDENCIES.md`, `RESPONSIBILITIES.md`, `WORKFLOW.md`, `STATE_MACHINE.md`, `CONFLICT_RESOLUTION.md`), originalmente produzidos por forks irmãos em paralelo na Sprint G.5.1 e reorganizados (`SKILL.md` + `references/`) na Sprint G.5.2 — não os referenciei por conteúdo, apenas por nome, já que a consolidação final é responsabilidade do Orchestrator de cada sprint, não desta tarefa.
