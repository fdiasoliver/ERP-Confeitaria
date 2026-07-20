---
name: governance
description: Use this skill for questions about the project's own governance mechanics in the Doce Menina confeitaria-app project — when and how to register an ADR, the difference between Sprint DoD and Module DoD, which checklist applies to sprint vs. module closure, how to classify audit findings (Inconsistência / Observação Técnica / Melhoria Futura), the rules for updating PLAN.md and CHANGELOG.md, where shared types must live, how document versioning works, and when PROJECT_GOVERNANCE.md itself is allowed to evolve. Not for executing a sprint end-to-end (use sprint-governance instead) or for general project orientation (use project-bootstrap instead).
---

# Governança Documental — Doce Menina (confeitaria-app)

Esta Skill cobre como e quando os próprios documentos de governança podem ser consultados e alterados — distinta de `sprint-governance` (executar o ciclo de uma sprint) e `project-bootstrap` (orientação inicial no projeto). Onde um item já está resumido em uma dessas duas, esta Skill aponta para lá em vez de repetir. Fonte de verdade permanece em `PROJECT_GOVERNANCE.md` e `AI_PROMPT_ORCHESTRATOR.md`.

## 1. Objetivo

Governar como e quando os documentos de governança do projeto podem ser consultados e alterados: ADR, DoD de Sprint vs. Módulo, checklists de encerramento, classificação de achados de auditoria, regras de `PLAN.md`/`CHANGELOG.md`, tipos compartilhados, versionamento documental e evolução do próprio `PROJECT_GOVERNANCE.md`.

## 2. Quando utilizar

- Ao precisar saber se uma decisão exige registro de ADR.
- Ao encerrar uma sprint ou um módulo e precisar saber qual checklist/DoD se aplica.
- Ao classificar um achado de auditoria (Inconsistência / Observação Técnica / Melhoria Futura).
- Ao atualizar `PLAN.md` ou `CHANGELOG.md` e precisar confirmar a regra correta.
- Ao decidir onde um tipo TypeScript deve residir.
- Ao avaliar se `PROJECT_GOVERNANCE.md` pode receber uma regra nova.

## 3. Quando NÃO utilizar

- Para executar o ciclo completo de uma sprint ponta a ponta — usar `sprint-governance`.
- Para orientação inicial de alguém novo no projeto — usar `project-bootstrap`.
- Para regras de código/arquitetura de camada — usar `architecture` e as Skills de camada (`api-pattern`, `repository-pattern`, `frontend-pattern`, `schema-pattern`, `coding-standards`).
- Para decidir o conteúdo de negócio de uma sprint específica do ERP — isso é escopo do Orchestrator/Product Owner, não desta Skill.

## 4. Responsabilidades

### 4.1 PROJECT_GOVERNANCE.md

Documento **não-negociável durante a implementação** (Seção 1). Só pode ser alterado com aprovação explícita do usuário **e** registro de ADR (ver 4.2) — nunca por iniciativa própria de uma IA, mesmo diante de uma boa razão técnica. O rodapé do documento registra cada atualização ("Atualizado em ... — Sprint X — ...").

### 4.2 ADR (Architectural Decision Record)

**Quando registrar** (Seção 13.2): escolha entre abordagens com impactos distintos; mudança de convenção existente; introdução de nova biblioteca/ferramenta; mudança de schema com impacto em dados existentes; alteração de ordem/escopo do roadmap; qualquer decisão que contradiga `PROJECT_GOVERNANCE.md` ou `CLAUDE.md`.

**Onde registrar** (Seção 13.3): registro principal em `CLAUDE.md`, seção "Decisões arquiteturais tomadas"; registro secundário em `ARCHITECTURE.md`, seção "Decisões Pendentes / Já tomadas".

**Template oficial** (Seção 13.4):
```
| Decisão | Escolha adotada | Alternativa descartada | Justificativa | Data |
Documentos impactados: {lista explícita}
Aprovado por: {usuário} em {data}
```

**Imutabilidade** (Seção 13.5): uma ADR registrada não é questionada em sessões futuras. Revertê-la exige uma **nova** ADR, explicitamente aprovada, com justificativa documentada.

### 4.3 DoD (Definition of Done) — Sprint vs. Módulo

Dois checklists distintos, não intercambiáveis:

- **DoD de Sprint** — Seções 6 e 7 de `PROJECT_GOVERNANCE.md`. Aplica-se ao encerrar **cada sprint individual**.
- **DoD de Módulo** — Seção 23 de `PROJECT_GOVERNANCE.md`. Aplica-se apenas ao encerrar o **módulo completo**, depois de todas as suas sprints concluídas. Um módulo com todas as sprints concluídas mas com pendência em qualquer item da Seção 23 **não está concluído**.

### 4.4 Checklists

| Checklist | Quando usar | Fonte |
|---|---|---|
| Início de sprint | Antes de escrever qualquer código | `PROJECT_GOVERNANCE.md` Seção 5 |
| Encerramento de sprint | Ao final de cada sprint individual | `PROJECT_GOVERNANCE.md` Seções 6–7 |
| Encerramento de módulo (DoD) | Após a última sprint do módulo | `PROJECT_GOVERNANCE.md` Seção 23 |
| Checklist complementar de módulo | Verificação rápida adicional ao DoD | `PROJECT_GOVERNANCE.md` Seção 25 |

O checklist da Seção 25 **complementa** o DoD da Seção 23 e **nunca** prevalece sobre ele em caso de conflito; é executado **uma única vez**, apenas no encerramento oficial do módulo — nunca no encerramento de uma sprint.

### 4.5 Auditoria — classificação de achados

Toda auditoria classifica cada achado em exatamente uma categoria (`PROJECT_GOVERNANCE.md` Seção 24):

- **Inconsistência** — viola regra obrigatória de `PROJECT_GOVERNANCE.md` ou `REGRAS_NEGOCIO.md`. Única categoria com caráter bloqueante — deve ser corrigida antes do encerramento.
- **Observação Técnica** — decisão arquitetural válida, consequência natural do domínio ou de escopo já aprovado. Não bloqueia.
- **Melhoria Futura** — evolução possível, não decorrente de violação. Não exige ação imediata.

Nunca misturar categorias. Fluxo completo de quem aplica essa classificação e quando: skill `sprint-governance`.

### 4.6 PLAN.md

- Exatamente **uma única entrada** por módulo, por sprint e por épico — nunca duplicar.
- Ao concluir, a linha "Planejado" é **substituída** por "Concluído" — os dois status nunca coexistem para o mesmo item.
- Proibido adicionar nova linha para um módulo/sprint já existente.
- Preserva ordem, descrição, escopo, dependências e datas já registradas.
- Representa **apenas o estado atual** do projeto — histórico pertence exclusivamente ao `CHANGELOG.md`.

Fonte: seção "Atualização do PLAN.md" de `PROJECT_GOVERNANCE.md`.

### 4.7 CHANGELOG.md

Representa **exclusivamente o histórico**. Estritamente factual — nunca opinião, recomendação futura, decisão não implementada ou planejamento. Uma seção por sprint, cronologia preservada, sem duplicidade.

Fonte: `PROJECT_GOVERNANCE.md` Seção 12; `AI_PROMPT_ORCHESTRATOR.md` Seção 9 ("Regras de Documentação"). Regras de uso operacional já resumidas em skill `sprint-governance`.

### 4.8 Tipos compartilhados

- Tipos **públicos** (usados por API, Service **e** Front-end) devem residir em `src/lib/types.ts`.
- Tipos **locais** só são permitidos enquanto o domínio ainda está em implementação, ou quando `types.ts` estiver explicitamente fora do escopo da sprint corrente.
- Ao consolidar um tipo público em `types.ts`, o tipo local equivalente **deve ser removido** — nunca manter os dois definidos simultaneamente.

Fonte: `PROJECT_GOVERNANCE.md` Seção 8.7.

### 4.9 Versionamento documental

Não existe versionamento semântico formal para os documentos de governança. O rastreamento é feito por:

- rodapé de `PROJECT_GOVERNANCE.md`: linha "Atualizado em {data} — {sprint} — {resumo}" adicionada a cada mudança;
- tabela "Histórico" (Versão / Data / Descrição) ao final de `AI_PROMPT_ORCHESTRATOR.md`.

Não inventar um esquema de versionamento (ex.: SemVer) além do que já existe nesses dois pontos.

### 4.10 Atualização documental — quando atualizar cada documento

| Documento | Atualizar quando |
|---|---|
| `CHANGELOG.md` | Toda sprint concluída — entrada no topo |
| `KNOWN_ISSUES.md` | KI resolvido (✅) ou novo KI identificado |
| `DOMAIN_MODEL.md` | Nova entidade ou relacionamento criado |
| `ARCHITECTURE.md` | Nova decisão arquitetural ou mudança de padrão |
| `MODULES.md` | Módulo de fase muda de status |
| `PLAN.md` | Sprint concluída ou épico encerrado |
| `PROJECT_GOVERNANCE.md` | Nova convenção aprovada ou ADR registrado |
| `EPICO_N.md` | Encerramento de épico |

Fonte: `PROJECT_GOVERNANCE.md` Seção 12.

### 4.11 Regras permanentes de evolução da própria governança

`PROJECT_GOVERNANCE.md` é considerado um documento **estável** (Seção 26, "Política de Evolução da Governança"). Novas regras só podem ser adicionadas mediante pelo menos uma destas situações:

- inconsistência arquitetural recorrente entre módulos;
- decisão de arquitetura aprovada por ADR;
- lacuna identificada em auditoria que as regras existentes não resolvem.

Proibido criar regra para resolver caso isolado de uma única sprint. Sempre que possível, uma regra nova deve generalizar um padrão reutilizável para todo o projeto — objetivo: manter o documento enxuto, estável e aplicável durante todo o ciclo de vida do projeto.

Proibições operacionais gerais (não alterar arquitetura/roadmap sem autorização, não criar sub-sprints, não inferir requisitos, etc.): já resumidas em skill `sprint-governance` — não duplicadas aqui.

## 5. Fluxo resumido

Esta Skill não executa um fluxo sequencial próprio — é consultada pontualmente em qualquer etapa do ciclo de sprint sempre que surge uma dúvida de governança documental. Para o fluxo ponta a ponta de uma sprint, ver skill `sprint-governance`.

## 6. Arquivos auxiliares disponíveis

Nenhum. O conteúdo (11 subitens de referência rápida) cabe integralmente neste `SKILL.md` sem prejuízo de navegação — nenhum bloco é longo o bastante para justificar extração.

## 7. Como carregar os arquivos auxiliares

Não aplicável — ver item 6.

## 8. Critérios de sucesso

Uma consulta a esta Skill é bem-sucedida quando: (a) a seção exata de `PROJECT_GOVERNANCE.md` ou `AI_PROMPT_ORCHESTRATOR.md` aplicável é citada; (b) nenhuma regra é inventada além do que os documentos-fonte já dizem; (c) quando a resposta pertence a `sprint-governance` ou `project-bootstrap`, a pergunta é redirecionada para lá em vez de respondida aqui por completude.

## 9. Limitações

- Não decide sozinha se uma situação nova justifica ADR — apenas informa o critério (item 4.2); a decisão de registrar é do usuário/Orchestrator.
- Não substitui a leitura de `PROJECT_GOVERNANCE.md`/`AI_PROMPT_ORCHESTRATOR.md` quando o caso é uma borda não coberta aqui.

## 10. Anti-patterns

- Misturar DoD de Sprint (Seções 6–7) com DoD de Módulo (Seção 23).
- Adicionar linha nova em `PLAN.md` para módulo/sprint já existente em vez de atualizar o status da linha existente.
- Registrar opinião, recomendação futura ou plano não implementado em `CHANGELOG.md`.
- Criar regra nova em `PROJECT_GOVERNANCE.md` para resolver caso isolado de uma única sprint.
- Manter tipo local e tipo público equivalente definidos simultaneamente após consolidação em `types.ts`.
- Misturar as três categorias de achado de auditoria (Inconsistência / Observação Técnica / Melhoria Futura) em uma classificação híbrida.

## 11. Referências cruzadas

- `PROJECT_GOVERNANCE.md` — fonte de verdade primária de todo o conteúdo desta Skill.
- `AI_PROMPT_ORCHESTRATOR.md` — fonte de verdade secundária (regras de `CHANGELOG.md`, histórico de versionamento).
- Skill `sprint-governance` — fluxo completo de aplicação da classificação de auditoria e proibições operacionais gerais de sprint.
- Skill `project-bootstrap` — orientação inicial no projeto (não repetida aqui).

### Compatibilidade com Sub-agents

Os 11 Sub-agents reais (9 implementados na Sprint G.5.4 + `product-reviewer` na Sprint G.6 + `platform-reviewer` na Sprint G.6.1, `.claude/agents/*.md`):

- **Pré-carregam esta Skill** (via `skills:` no frontmatter): `ai-governance-officer` (governança/ADR/classificação de auditoria) e `ai-release-manager` (DoD, validação de `PLAN.md`/`CHANGELOG.md` no encerramento).
- **Não pré-carregam**: `ai-backend-engineer`/`ai-frontend-engineer`/`product-reviewer`/`platform-reviewer` (usam `architecture`/`coding-standards`/`frontend-pattern`/`product-review`/`platform-review`/Skills de camada), nem `Explore`/`Plan` (agentes somente-leitura embutidos, que já pulam CLAUDE.md por design).
- **Conhecimento fornecido:** regras de ADR, DoD, classificação de auditoria, regras de `PLAN.md`/`CHANGELOG.md`, tipos compartilhados, versionamento documental, evolução da própria governança.
- **Artefatos produzidos:** nenhum arquivo — apenas orientação.
- **Entradas esperadas:** uma dúvida específica de governança documental (ex.: "isso precisa de ADR?", "qual DoD se aplica aqui?").
- **Saídas entregues:** resposta com a seção exata de `PROJECT_GOVERNANCE.md`/`AI_PROMPT_ORCHESTRATOR.md` aplicável citada.

---

Precedência: em caso de conflito entre esta Skill e `PROJECT_GOVERNANCE.md` ou `AI_PROMPT_ORCHESTRATOR.md`, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em data anterior à Sprint G.5.2. v2.0 em 13/07/2026 — Sprint G.5.2: renomeada skill.md→SKILL.md, corpo reestruturado nas 11 seções oficiais, adicionadas "Quando NÃO utilizar" e "Compatibilidade com Sub-agents". -->
