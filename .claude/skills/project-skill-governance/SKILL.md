---
name: project-skill-governance
description: Use this skill when creating a new Skill in this project, suspecting a conflict or overlap between two existing Skills, or planning a sprint that touches multiple layers and needs to know the correct dependency order between Skills. This is the meta-skill that governs all 17 other domain Skills — it never implements code, never edits any project file, and never produces project/business documentation. It only governs the coherence of the Skill system itself.
when_to_use: Also load before writing SKILL.md for a new Skill, or after any Skill's content changes in a way that could affect dependencies or responsibilities.
---

# Governança das Skills (Meta-Skill) — Doce Menina (confeitaria-app)

Esta é a **meta-skill** que governa a coerência entre as demais Skills operacionais do projeto (`sprint-governance`, `project-bootstrap`, `orchestrator`, `governance`, `architecture`, `coding-standards`, `repository-pattern`, `api-pattern`, `frontend-pattern`, `sprint-planning`, `sprint-execution`, `sprint-audit`, `documentation`, `engineering-reviewer`, `schema-pattern`, `product-review`, `platform-review`). Ela não repete o conteúdo de nenhuma delas nem dos documentos-fonte — aponta para onde a profundidade real vive. Fonte de verdade desta pasta: `README.md` + os 7 arquivos em `references/` (`skill-format.md`, `SKILL_DEPENDENCIES.md`, `SKILL_MATRIX.md`, `RESPONSIBILITIES.md`, `WORKFLOW.md`, `STATE_MACHINE.md`, `CONFLICT_RESOLUTION.md`) e `.claude/CLAUDE.md` (princípios gerais de `.claude/`, Sprint G.5.0/G.5.2).

**Exceção documentada:** esta é a única Skill do projeto cuja pasta contém, além do `SKILL.md`, um `README.md` na raiz — porta de entrada humana distinta do arquivo ativável, justificada por esta Skill estar no topo da hierarquia e precisar de mapas próprios que não cabem, nem deveriam caber, dentro de um único arquivo ativável. Os mapas em si vivem em `references/`, como qualquer Skill deste projeto.

## 1. Objetivo

Governar a coerência entre as Skills do projeto. Ser o ponto de checagem obrigatório antes de qualquer Skill nova ser criada ou qualquer Skill existente ser alterada.

## 2. Quando utilizar

- Antes de criar qualquer Skill nova.
- Ao suspeitar de conflito ou sobreposição entre duas Skills existentes.
- Ao planejar uma sprint que toca múltiplas camadas, para confirmar a ordem/dependência correta entre as Skills envolvidas.

## 3. Quando NÃO utilizar

- Para executar uma sprint específica — usar `sprint-governance`, `orchestrator`, `sprint-planning`, `sprint-execution`, `sprint-audit` ou `engineering-reviewer` diretamente.
- Para escrever código — usar `architecture`, `api-pattern`, `repository-pattern`, `frontend-pattern`, `schema-pattern` ou `coding-standards`.
- Para questões de governança documental específica (ADR, DoD, PLAN/CHANGELOG) — usar `governance`.
- Para decidir o conteúdo de negócio de uma sprint específica do ERP — esta meta-skill governa as Skills de processo ao nível estrutural (se estão bem posicionadas, sem sobreposição), nunca ao nível de decisão de sprint.

Esta meta-skill nunca substitui a Skill de domínio certa para a tarefa — ela só ajuda a identificar qual é.

## 4. Responsabilidades

Manter e ser a fonte de verdade sobre:

| Aspecto | Arquivo |
|---|---|
| Como formatar/escrever qualquer `SKILL.md` (frontmatter, seções, estilo, versionamento) | `references/skill-format.md` |
| Quem depende de quem, quem nunca conversa direto | `references/SKILL_DEPENDENCIES.md` |
| Matriz de papéis (Planeja/Executa/Audita/Documenta/Valida/Aprova/Revisa/Decide) por Skill | `references/SKILL_MATRIX.md` |
| Responsabilidades, arquivos permitidos/proibidos, entradas/saídas por Skill | `references/RESPONSIBILITIES.md` |
| Sequência oficial de uma sprint ponta a ponta | `references/WORKFLOW.md` |
| Estados possíveis de uma sprint e transições | `references/STATE_MACHINE.md` |
| Como resolver conflito entre Skills, documentos, regras ou agentes | `references/CONFLICT_RESOLUTION.md` |

Esta Skill **nunca**: implementa código; altera arquivos de código, schema, ou documentos de governança (`PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, `AI_PROMPT_ORCHESTRATOR.md`, `PLAN.md`, `CHANGELOG.md`); produz documentação de produto/negócio do ERP (isso é `documentation`).

## 5. Fluxo resumido

O ciclo oficial de uma sprint tem 11 etapas: Nova Sprint → Bootstrap → Orchestrator → Planning → Execution → Documentation → Engineering Review → Audit → Governance → Encerramento → Próxima Sprint, com dois checkpoints formais de aprovação do Product Owner (fim de Planning; fim de Encerramento). Detalhe completo, papéis, skills e equivalência com as fases de `AI_PROMPT_ORCHESTRATOR.md`: `references/WORKFLOW.md`.

**Nota:** existe uma divergência real entre um esquema de 9 estados citado nesta sprint (Backlog/Planning/Ready/Executing/Review/Audit/Documentation/Approved/Closed) e os 8 estados já em produção na Skill `sprint-governance` (PLANEJADA/ORQUESTRADA/VALIDADA/EM IMPLEMENTAÇÃO/IMPLEMENTADA/AUTOAUDITADA/AUDITADA/ENCERRADA) — não reconciliada, ver `references/STATE_MACHINE.md`.

## 6. Arquivos auxiliares disponíveis

| Arquivo | Conteúdo |
|---|---|
| `README.md` | Porta de entrada humana — visão geral não ativável desta meta-skill |
| `references/skill-format.md` | Procedimento completo de como escrever um `SKILL.md` (migrado de `.claude/CLAUDE.md` na Sprint G.5.2) |
| `references/SKILL_DEPENDENCIES.md` | Mapa de dependências entre Skills |
| `references/SKILL_MATRIX.md` | Matriz de ações (Planeja/Executa/Audita/...) por Skill |
| `references/RESPONSIBILITIES.md` | Responsabilidades detalhadas por Skill |
| `references/WORKFLOW.md` | Fluxo oficial ponta a ponta |
| `references/STATE_MACHINE.md` | Máquina de estados (com a divergência não resolvida documentada) |
| `references/CONFLICT_RESOLUTION.md` | Hierarquia definitiva e regras de resolução de conflito |

## 7. Como carregar os arquivos auxiliares

- **Criando uma Skill nova:** carregar `references/skill-format.md` + `references/SKILL_DEPENDENCIES.md` + `references/RESPONSIBILITIES.md`, nesta ordem.
- **Suspeitando de conflito entre Skills:** carregar `references/CONFLICT_RESOLUTION.md`.
- **Planejando sprint multi-camada:** carregar `references/SKILL_DEPENDENCIES.md` + `references/WORKFLOW.md`.
- **Verificando o estado de uma sprint:** carregar `references/STATE_MACHINE.md` + `references/WORKFLOW.md`.
- Nunca carregar os 7 arquivos de uma vez por hábito — cada um resolve uma pergunta específica; carregar só o necessário para a tarefa em mãos (economia de contexto).

## 8. Critérios de sucesso

Uma Skill nova só está pronta quando: (a) foi gerada a partir de `.claude/templates/SKILL_TEMPLATE.md`; (b) não duplica mais de 30% do conteúdo de nenhuma das Skills já existentes — **verificado por leitura real das candidatas a sobreposição, nunca assumido**; (c) está corretamente posicionada em `references/SKILL_DEPENDENCIES.md`, com suas dependências e quem depende dela explícitas; (d) passou pelo checklist abaixo sem pendência aberta; (e) seu arquivo ativável se chama exatamente `SKILL.md`.

**Checklist antes de criar qualquer Skill nova:**
- [ ] Ler `references/skill-format.md` (convenções de formato).
- [ ] Ler `references/SKILL_DEPENDENCIES.md` (onde a nova Skill se encaixa).
- [ ] Ler `references/RESPONSIBILITIES.md` (confirmar que não sobrepõe responsabilidade já coberta por outra Skill).
- [ ] Gerar a partir de `.claude/templates/SKILL_TEMPLATE.md` — nunca escrever `SKILL.md` do zero.
- [ ] Após validada, atualizar `references/SKILL_MATRIX.md` e `references/SKILL_DEPENDENCIES.md` com a nova entrada.

**Regra vigente a partir da Sprint G.5.1 (formalizada na G.5.2):** toda Skill nova usa `SKILL_TEMPLATE.md` e passa por este checklist antes de ser incorporada ao projeto. As Skills já existentes antes de cada uma dessas sprints ficam dispensadas retroativamente — mesmo espírito do versionamento (`references/skill-format.md` item 8). Retrofit de `references/SKILL_MATRIX.md`/`references/SKILL_DEPENDENCIES.md` para Skills antigas continua não obrigatório até uma sprint dedicada.

## 9. Limitações

- Esta Skill **não resolve** conflitos por conta própria — ela só documenta a regra de resolução (`references/CONFLICT_RESOLUTION.md`). A decisão final de mérito continua com o Product Owner/Orchestrator.
- A divergência de 9 vs. 8 estados (item 5 acima) permanece deliberadamente não reconciliada — não é lacuna desta Skill, é uma decisão pendente registrada para o Product Owner.
- Não cobre criação ou configuração de Sub-agents (`.claude/agents/*.md`) — mecanismo distinto, fora do escopo desta meta-skill; ver item 11.

## 10. Anti-patterns

- Criar uma Skill nova sem ler as existentes potencialmente sobrepostas.
- Duplicar mais de 30% de conteúdo já coberto em outra Skill.
- Uma Skill de processo (ex.: `sprint-planning`) decidindo uma regra de código — isso é escopo de `architecture` e das Skills de camada (`api-pattern`, `repository-pattern`, `frontend-pattern`, `coding-standards`, `schema-pattern`).
- Esta própria meta-skill sendo usada para decidir o conteúdo de uma sprint específica do ERP — ver item 3 (Quando NÃO utilizar).
- Criar um arquivo `skill.md` minúsculo — o Claude Code só descobre `SKILL.md` maiúsculo.

## 11. Referências cruzadas

Hierarquia completa (não repetida aqui): `references/CONFLICT_RESOLUTION.md`. Resumo: `PROJECT_GOVERNANCE.md` → `REGRAS_NEGOCIO.md` → ADR → `AI_PROMPT_ORCHESTRATOR.md` → `CLAUDE.md` (raiz) → esta meta-skill → demais Skills → Templates. Nenhuma Skill pode contrariar essa ordem. **Nota (Sprint G.5.7):** este resumo cobre apenas o nível de Skill — a partir da Sprint G.5.3 existe uma hierarquia mais ampla, que insere `architecture/`, `contracts/`, `protocols/`, `agents/` e `playbooks/` entre `CLAUDE.md` (raiz) e esta meta-skill; fonte de verdade completa e atualizada: `architecture/AI_OPERATING_SYSTEM.md` item 4.

### Compatibilidade com Sub-agents

Os 11 Sub-agents reais (9 implementados na Sprint G.5.4 + `product-reviewer` na Sprint G.6 + `platform-reviewer` na Sprint G.6.1, `.claude/agents/*.md`):

- **Pré-carregam esta Skill** (via `skills:` no frontmatter): nenhum dos 11 diretamente — a meta-skill governa a coerência entre Skills e é consultada sob demanda (ex. ao propor uma Skill nova), não pré-carregada por um Sub-agent de execução. `ai-governance-officer` é o mais próximo em espírito, mas pré-carrega `governance`/`sprint-audit`/`engineering-reviewer`, não esta meta-skill.
- **Não pré-carregam**: nenhum dos 11 Sub-agents de execução (`ai-backend-engineer`/`ai-frontend-engineer`/`product-reviewer`/`platform-reviewer`/etc.) — eles precisam de `architecture`/`coding-standards`/Skills de camada, não de governança de Skills. Também não `Explore`/`Plan` (agentes somente-leitura embutidos, que já pulam CLAUDE.md por design).
- **Conhecimento fornecido:** hierarquia de precedência, mapa de dependências entre Skills, matriz de responsabilidades, regras de resolução de conflito.
- **Artefatos produzidos:** nenhum arquivo — apenas orientação/validação.
- **Entradas esperadas:** uma Skill nova proposta, ou um conflito suspeito entre duas Skills, ou uma dúvida de ordem de dependência.
- **Saídas entregues:** posição correta no mapa de dependências; validação passa/falha contra o checklist do item 8.

---

Precedência: em caso de conflito entre esta Skill e `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, `AI_PROMPT_ORCHESTRATOR.md` ou `CLAUDE.md` (raiz), o documento original sempre prevalece (ver item 11, Referências cruzadas).

<!-- Histórico: v1.0 criada em 20/07/2026 — Sprint G.5.1 (AI Operating System Foundation). v2.0 em 13/07/2026 — Sprint G.5.2: renomeada skill.md→SKILL.md, mapas movidos para references/, corpo reestruturado nas 11 seções oficiais, procedimento de formato incorporado de .claude/CLAUDE.md. v2.1 em 15/07/2026 — Sprint G.5.7: nota de hierarquia (item 11) e subseção "Compatibilidade com Sub-agents" atualizadas — Sub-agents foram implementados na G.5.4, referências a "ainda não criados"/"previsto para G.5.3" corrigidas. -->
