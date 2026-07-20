---
name: documentation
description: Use this skill when creating or updating any project document, using an official template (Sprint/Revisão Técnica/QA/Critérios de Aceite), handing off state between sessions, registering a decision, or navigating the documentation ecosystem of the Doce Menina confeitaria-app project (README, docs/, roadmap, product architecture docs). NOT about code architecture (Route/Service/Repository/Prisma) — use the architecture skill for that instead.
---

# Documentação do Projeto — Doce Menina (confeitaria-app)

Esta Skill cobre o ecossistema de documentação do projeto como um todo — mais amplo que `governance` (mecânica dos documentos de governança em si) e `project-bootstrap` (orientação inicial resumida). **Não confundir com a skill `architecture`**, que é sobre arquitetura de código (Route/Service/Repository/Prisma) — aqui tratamos do documento `ARCHITECTURE.md` (arquitetura de produto/decisões técnicas), uma coisa diferente com nome parecido.

## 1. Objetivo

Garantir que toda criação ou atualização de documento do projeto aponte para a fonte de verdade correta, sem duplicar conteúdo já coberto por outra Skill, e que handoff entre sessões seja sempre um ponteiro objetivo, nunca uma decisão antecipada.

## 2. Quando utilizar

- Criar ou atualizar `README.md`, `docs/`, ou qualquer documento de arquitetura de produto (`ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `MODULES.md`, `KNOWN_ISSUES.md`).
- Usar um dos 4 templates oficiais de `PROJECT_GOVERNANCE.md` (Sprint/Revisão Técnica/QA/Critérios de Aceite).
- Registrar handoff de estado pendente para a próxima sessão.
- Navegar o roadmap (`PLAN.md`, `EPICO_N.md`).
- Decidir onde um documento de produto/UX deve ser atualizado.

## 3. Quando NÃO utilizar

- Arquitetura de código (Route/Service/Repository/Prisma) → skill `architecture`.
- Mecânica dos documentos de governança em si (ADR, DoD de módulo, versionamento, estado atual do projeto) → skill `governance`.
- Checklist de assumir o projeto pela primeira vez → skill `project-bootstrap`.
- Processo de sprint ponta a ponta → skills `sprint-governance`, `orchestrator`, `sprint-planning`, `sprint-execution`, `sprint-audit`.
- Processo completo de ADR (decision log) → skill `governance`.

## 4. Responsabilidades

### 4.1 README

`README.md` na raiz do projeto: setup, rotas, decisões de produto e próximos passos (fonte: `CLAUDE.md`, "Documentação e prototipagem"). Nenhum documento-fonte declara uma sprint obrigatória para mantê-lo atualizado — mantenha-o coerente com o estado real quando fizer sentido, mas não trate isso como uma obrigação formal que não existe.

### 4.2 docs/

- `docs/SCHEMA.md` — diagrama de relacionamentos e decisões de modelagem do banco.
- `docs/ai/AI_PROMPT_ORCHESTRATOR.md` — processo oficial de IA (ver skills `sprint-governance`/`orchestrator`).

**Lição real desta sessão:** a referência de caminho para `AI_PROMPT_ORCHESTRATOR.md` dentro de `PROJECT_GOVERNANCE.md` ficou incorreta em um momento (citava `docs/ai/` quando o arquivo real estava em `docs/`), foi corrigida para `docs/`, e depois o arquivo real se moveu de volta para `docs/ai/` — tornando a referência original correta de novo, por coincidência de dois eventos independentes. **Caminhos de arquivo citados em texto são frágeis: sempre confira com Glob/Read no momento do uso, nunca assuma que a citação está atualizada.**

### 4.3 Roadmap

`PLAN.md`: tabela de Épicos + tabela de Módulos 2.A–2.L. Roadmap **congelado** desde a Sprint 2.0.6 — alterar a ordem dos módulos exige ADR formal (`PROJECT_GOVERNANCE.md` Seção 13, ver skill `governance`).

Documentos `EPICO_N.md` registram o encerramento formal de um épico inteiro (distinto do encerramento de módulo — DoD, skill `governance`) — exemplo real já existente: `EPICO_1.md`, referenciado em `PLAN.md` como registro do encerramento do ÉPICO 1.

### 4.4 Documentos de arquitetura de produto

Distintos da skill `architecture` (que é sobre código). Fonte: `CLAUDE.md`, tabela "Documentação de arquitetura e produto":

| Documento | Consultar antes de |
|---|---|
| `ARCHITECTURE.md` | Mudanças estruturais |
| `DOMAIN_MODEL.md` | Adicionar entidades ou rotas |
| `MODULES.md` | Planejar uma sprint |
| `KNOWN_ISSUES.md` | Implementar qualquer feature |

### 4.5 Handoff entre sessões

Como uma sessão comunica estado pendente para a próxima:

- Linha **"Próximo: Sprint X.Y — descrição"** ao final de entradas do `CHANGELOG.md` (exemplo real: "Próximo: Sprint 2.C.7 — QA e encerramento do Módulo 2.C").
- `KNOWN_ISSUES.md` para dívida técnica ou problema identificado mas não resolvido na sprint corrente.

Handoff nunca registra uma decisão não tomada como se fosse tomada — é sempre um ponteiro objetivo do que vem a seguir, nunca uma antecipação de resultado.

### 4.6 Templates oficiais

`PROJECT_GOVERNANCE.md` tem 4 templates prontos — usar como estrutura-base, nunca reinventar a cada sprint:

- **Seção 19** — template de nova Sprint (Objetivo, Dependências, Bloqueadores conhecidos, Arquivos a criar/editar, Microtarefas, Critérios de aceite).
- **Seção 20** — template de Revisão Técnica.
- **Seção 21** — template de QA.
- **Seção 22** — template de Critérios de Aceite.

### 4.7 Atualização dos documentos

A skill `governance` já cobre os documentos centrais de governança (CHANGELOG.md, KNOWN_ISSUES.md, DOMAIN_MODEL.md, ARCHITECTURE.md, MODULES.md, PLAN.md, PROJECT_GOVERNANCE.md, EPICO_N.md). Complementar — documentos de produto/UX ainda não cobertos lá, fonte `CLAUDE.md`:

| Documento | Atualizar/consultar quando |
|---|---|
| `SCREENS.md` | Antes de implementar qualquer tela |
| `USER_FLOW.md` | Antes de implementar qualquer fluxo |
| `USER_JOURNEY.md` | Para validar decisões de produto |
| `DESIGN_SYSTEM.md` / `UX_GUIDELINES.md` | Antes de implementar qualquer tela ou componente |
| `MENU_STRUCTURE.md` | Antes de criar qualquer rota admin |

## 5. Fluxo resumido

Não há fluxo sequencial próprio — esta Skill é consultada pontualmente conforme o tipo de documento sendo criado/atualizado (ver Responsabilidades, item 4). Para o fluxo de sprint ponta a ponta que gera a maior parte dessas atualizações, ver `project-skill-governance/references/WORKFLOW.md`.

## 6. Arquivos auxiliares disponíveis

Nenhum. O conteúdo desta Skill é coeso e cabe integralmente no hub — não há material extenso o bastante para justificar `references/`, `examples/`, `checklists/` ou `templates/` próprios (os templates oficiais já vivem em `PROJECT_GOVERNANCE.md`, apenas referenciados no item 4.6).

## 7. Como carregar os arquivos auxiliares

Não aplicável — nenhum arquivo auxiliar (ver item 6).

## 8. Critérios de sucesso

- O documento atualizado aponta para a fonte certa sem duplicar conteúdo já coberto por outra Skill ou documento.
- Todo caminho de arquivo referenciado foi conferido com Glob/Read no momento da escrita, não assumido de memória.
- Handoff registrado como ponteiro objetivo do que vem a seguir, nunca como decisão antecipada.

## 9. Limitações

- Não decide o conteúdo de negócio dos documentos de produto — isso é decisão do Product Owner/Orchestrator.
- Não cobre a mecânica de governança/ADR (skill `governance`).
- Não cobre arquitetura de código (skill `architecture`).

## 10. Anti-patterns

- Duplicar conteúdo já coberto por outro documento em vez de referenciá-lo.
- Assumir que uma citação de caminho antiga ainda está correta sem conferir (caso real, item 4.2).
- Registrar handoff como se uma decisão pendente já tivesse sido tomada.
- Reinventar um template de sprint/revisão/QA/critérios de aceite em vez de usar os 4 já oficiais (item 4.6).

## 11. Referências cruzadas

Convenção usada em todo o projeto: citar **"ver DOCUMENTO.md Seção N"** em vez de duplicar texto, e citar Skills irmãs pelo nome (não por número de seção, que muda a cada refatoração). Ao criar ou editar qualquer documento, **verifique que o caminho/seção referenciado realmente existe no momento da escrita** — nunca assuma (ver item 4.2 para o caso real).

Skills irmãs: `governance` (mecânica de governança), `project-bootstrap` (bootstrap inicial), `architecture` (arquitetura de código), `sprint-governance`/`orchestrator`/`sprint-planning`/`sprint-execution`/`sprint-audit` (processo de sprint).

### Compatibilidade com Sub-agents

- **Pré-carregaria via `skills:`:** um subagent futuro dedicado a encerramento de sprint (ex. "sprint-documenter", responsável por atualizar CHANGELOG/PLAN/handoff ao final de uma sprint) se beneficiaria de carregar esta Skill integralmente na inicialização.
- **Não deveria pré-carregar:** agentes somente-leitura de exploração (`Explore`/`Plan`, que já pulam CLAUDE.md por design) ou agentes de implementação pura de código (ex. um futuro `api-implementer`/`backend-implementer`) — não ganham nada de convenções de documentação de produto.
- **Conhecimento fornecido:** onde cada tipo de documento vive e quando atualizá-lo/consultá-lo.
- **Artefatos produzidos:** nenhum arquivo próprio — orienta edições em `README.md`, `docs/`, `PLAN.md`, `EPICO_N.md`, `CHANGELOG.md` (linha de handoff).
- **Entradas esperadas:** contexto da sprint/mudança sendo documentada.
- **Saídas entregues:** documento atualizado, coerente com a fonte de verdade correta, mais linha de handoff quando aplicável.

---

Precedência: em caso de conflito entre esta Skill e qualquer documento original, o documento original sempre prevalece.

<!-- Histórico: v2.0 em 13/07/2026 — Sprint G.5.2: renomeado skill.md → SKILL.md, corpo reestruturado nas 11 seções oficiais do Claude Code, adicionadas "Quando NÃO utilizar" e "Compatibilidade com Sub-agents". Conteúdo técnico preservado integralmente. -->
