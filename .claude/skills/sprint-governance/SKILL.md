---
name: sprint-governance
description: Use this skill whenever starting, planning, implementing, self-auditing, or independently auditing a development sprint in the Doce Menina confeitaria-app project. Triggers on requests like "iniciar sprint", "executar sprint", "criar SPRINT_X.md", "auditar sprint", "encerrar sprint/módulo", or when acting as Orchestrator, Executor, or Auditor for this project. Do not use for one-off unscoped edits explicitly declared out of the sprint process.
---

# Governança de Sprint — Doce Menina (confeitaria-app)

Esta Skill operacionaliza o processo de desenvolvimento já formalizado em 5 documentos do projeto. Ela **não** cria regras novas — apenas resume e sequencia o que já está documentado, para que cada sprint seja executada sem reexplicação manual. Não repete o aprofundamento de cada papel/fase — isso vive em `orchestrator` (papel Orchestrator), `sprint-planning` (planejamento), `sprint-execution` (execução), `sprint-audit` (técnica de auditoria) e `governance` (mecânica de ADR/DoD).

Fonte de verdade permanece nos documentos originais. Em caso de dúvida ou conflito, releia o documento referenciado — esta Skill é um roteiro operacional, não a autoridade final.

## 1. Objetivo

Ser o ponto de entrada único do processo de sprint: identificar em qual fase/estado uma sprint está e apontar para a Skill mais específica a seguir, sem reexplicar o processo a cada sessão.

## 2. Quando utilizar

Ao iniciar, planejar, implementar, autoauditar ou auditar uma sprint; ao criar `SPRINT_X.md`/`SPRINT_AUDIT.md`; ao encerrar sprint ou módulo; ao assumir o papel de Orchestrator, Executor ou Auditor neste projeto.

## 3. Quando NÃO utilizar

- Edição pontual, sem escopo de sprint, já declarada fora do processo pelo Product Owner — não force os 2 artefatos obrigatórios nesse caso.
- Aprofundamento do papel Orchestrator (FASE 0, 7 perguntas) → `orchestrator`.
- Prática de dividir um módulo em sprints → `sprint-planning`.
- Execução operacional microtarefa a microtarefa → `sprint-execution`.
- Técnica de auditoria (teste de duas perguntas, veredito) → `sprint-audit`.
- Mecânica de ADR/DoD/versionamento → `governance`.
- Checklist-mestre de revisão final → `engineering-reviewer`.

## 4. Responsabilidades

### 4.1 Leitura obrigatória (sempre, nesta ordem)

Antes de qualquer ação de sprint, ler integralmente: `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, `PLAN.md`, `CHANGELOG.md`, `docs/ai/AI_PROMPT_ORCHESTRATOR.md`, `SPRINT_X.md` e `SPRINT_AUDIT.md` da sprint corrente (quando existirem). Texto oficial completo: `AI_PROMPT_ORCHESTRATOR.md` Seção 5.

### 4.2 Papéis

Product Owner, Orchestrator, Executor, Auditor — papéis arquiteturais, não ferramentas específicas (qualquer IA pode assumir qualquer papel). Definições completas: `AI_PROMPT_ORCHESTRATOR.md` Seção 2.

### 4.3 Nenhuma sprint sem os dois artefatos

Toda sprint exige **`SPRINT_X.md`** (Objetivo, Escopo, Fora do Escopo, Arquivos permitidos/proibidos, Dependências, Critérios técnicos/aceite, Validações obrigatórias, Atualização documental, Resultado esperado) e **`SPRINT_AUDIT.md`** (Objetivo da auditoria, Escopo esperado, Checklists, Critérios de aprovação/bloqueio, Resultado esperado), produzidos pelo Orchestrator na FASE 0, antes de qualquer implementação. Se qualquer um estiver ausente: **PARAR**, solicitar o documento, nunca inferir ou assumir escopo. Estrutura completa: `AI_PROMPT_ORCHESTRATOR.md` Seção 5.

### 4.4 Classificação de achados — sempre uma das três

- **Inconsistência** — viola regra obrigatória de `PROJECT_GOVERNANCE.md` ou `REGRAS_NEGOCIO.md`. Bloqueia o encerramento.
- **Observação Técnica** — decisão arquitetural válida, consequência natural do domínio ou do escopo já aprovado. Não bloqueia.
- **Melhoria Futura** — evolução possível, não decorrente de violação. Não exige ação imediata.

Nunca misturar categorias. Definição oficial: `PROJECT_GOVERNANCE.md` Seção 24. Técnica prática de classificação: `sprint-audit`.

### 4.5 PLAN.md e CHANGELOG.md

- `PLAN.md`: representa **apenas o estado atual**. Uma única entrada por módulo e por sprint — nunca duplicar, nunca manter "Planejado" e "Concluído" simultaneamente para o mesmo item, nunca alterar cronologia.
- `CHANGELOG.md`: representa **apenas o histórico**. Uma seção por sprint, estritamente factual — sem opiniões, recomendações futuras ou planejamento não implementado.

Regras completas: `PROJECT_GOVERNANCE.md` (seção "Atualização do PLAN.md" e Seção 12) e `AI_PROMPT_ORCHESTRATOR.md` Seção 9.

### 4.6 Encerramento de módulo (não confundir com encerramento de sprint)

Checklist de módulo é distinto do checklist de sprint — usar somente ao encerrar um módulo inteiro (após todas as suas sprints), nunca a cada sprint individual. Ver `PROJECT_GOVERNANCE.md` Seção 23 (DoD) e Seção 25 (checklist complementar — em caso de conflito, prevalece a Seção 23).

## 5. Fluxo resumido

```
FASE 0 (Análise Arquitetural, Orchestrator)
  → SPRINT_X.md + SPRINT_AUDIT.md
  → FASE -1 (Validação da Sprint, Executor — confere estrutura do SPRINT_X.md antes de ler código)
  → FASE 0.5 (Auditoria de Contratos, Executor — confere DTOs/Types/contratos antes de criar arquivos)
  → Implementação
  → Autoauditoria
  → Validações (tsc/lint/build — só as previstas no SPRINT_X.md)
  → Auditoria Documental
  → Atualização de PLAN.md/CHANGELOG.md
  → Auditoria (Auditor, ver Fluxo Oficial de Auditoria em `sprint-audit`)
  → FASE 6 (Evolução da Governança)
  → Encerramento
```

**Estados da Sprint** (transição somente para frente, nunca há retorno): `PLANEJADA → ORQUESTRADA → VALIDADA → EM IMPLEMENTAÇÃO → IMPLEMENTADA → AUTOAUDITADA → AUDITADA → ENCERRADA`. Definição de cada estado: `AI_PROMPT_ORCHESTRATOR.md` Seção "Estados da Sprint".

Diagrama completo e detalhamento de cada fase: `AI_PROMPT_ORCHESTRATOR.md` Seções 3, 4, "FASE 0", "FASE -1", "FASE 0.5", "FASE 6", 11.

## 6. Arquivos auxiliares disponíveis

Nenhum — esta Skill é um roteiro operacional compacto, sem material longo o bastante para justificar `references/`/`checklists/` próprios.

## 7. Como carregar os arquivos auxiliares

Não aplicável (ver item 6).

## 8. Critérios de sucesso

- Nenhuma sprint avança sem `SPRINT_X.md` + `SPRINT_AUDIT.md`.
- Estados avançam apenas para frente, nunca retrocedem.
- Todo achado é classificado em exatamente uma das três categorias do item 4.4.
- `PLAN.md` é atualizado só depois das validações obrigatórias, nunca antes.

## 9. Limitações

Esta Skill não define a técnica de auditoria em detalhe (isso é `sprint-audit`), não aprofunda o papel Orchestrator (isso é `orchestrator`) e não decide sozinha sobre alteração de `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md` (isso exige ADR, via `governance`). Existe uma divergência conhecida e não resolvida entre os 8 estados listados no item 5 e uma proposta de 9 estados registrada em `project-skill-governance/references/STATE_MACHINE.md` — não reconciliada aqui, aguardando decisão do Product Owner. **Nota de vigência (Sprint G.6.4):** os 8 estados aqui descritos, junto com os artefatos `SPRINT_X.md`/`SPRINT_AUDIT.md`, permanecem válidos como arquitetura expandida de orquestração — nenhum foi revogado. O fluxo operacional vigente do projeto é `PROJECT_GOVERNANCE.md` Seção 4.1 (mais simples, sem esses artefatos), confirmado pelo histórico real de sprints em `CHANGELOG.md`. Ver `PROJECT_GOVERNANCE.md` Seção 4.1–4.3 para o registro completo, incluindo a distinção Sprint Oficial vs. Backlog Suggestion.

## 10. Anti-patterns

É proibido: alterar arquivos fora do escopo do `SPRINT_X.md`; ampliar escopo por iniciativa própria; alterar arquitetura ou roadmap sem autorização; criar sub-sprints (ex. `2.D.2.1`) para ajustes pontuais fora de planejamento prévio; criar contratos públicos, DTOs ou tipos duplicados sem autorização explícita; alterar `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md` sem autorização explícita; criar ADRs sem autorização; inferir requisitos não descritos no `SPRINT_X.md`; executar comandos/validações não previstos no `SPRINT_X.md`.

Diante de bloqueio técnico real: **interromper**, explicar tecnicamente, aguardar decisão do Product Owner — nunca assumir a solução.

Lista completa: `AI_PROMPT_ORCHESTRATOR.md` Seção 8 ("Regras Gerais"). Regras arquiteturais de camada (Route→Service→Repository→Prisma, responsabilidades de cada camada, tipos compartilhados): `PROJECT_GOVERNANCE.md` Seção 8 e Seção 8.7; aprofundamento: skill `architecture`.

## 11. Referências cruzadas

`AI_PROMPT_ORCHESTRATOR.md` (fonte de todo o fluxo de fases/estados/regras gerais), `PROJECT_GOVERNANCE.md` (classificação de achados, PLAN/CHANGELOG, DoD). Skills irmãs: `orchestrator`, `sprint-planning`, `sprint-execution`, `sprint-audit`, `governance`, `engineering-reviewer`, `project-skill-governance` (para a divergência de estados citada no item 9).

**Compatibilidade com Sub-agents:** um subagent futuro de orquestração de sprint (ex. `sprint-orchestrator`) se beneficiaria de pré-carregar esta Skill via `skills:` — é o roteiro de entrada de todo o processo. Um subagent somente-leitura de exploração de código (`Explore`) não ganha nada dela. Conhecimento fornecido: papéis, artefatos obrigatórios, fluxo de fases/estados, classificação de achados. Artefato produzido: nenhum diretamente (orienta a produção de `SPRINT_X.md`/`SPRINT_AUDIT.md`). Entrada esperada: aprovação do Product Owner para iniciar. Saída: identificação da fase/estado atual e da Skill mais específica a consultar a seguir.

---

Precedência: em caso de conflito entre esta Skill e `PROJECT_GOVERNANCE.md` ou `AI_PROMPT_ORCHESTRATOR.md`, o documento original sempre prevalece.

<!-- Histórico: v2.0 em 13/07/2026 — Sprint G.5.2: renomeado skill.md→SKILL.md, corpo reestruturado nas 11 seções oficiais do padrão Claude Code, adicionadas "Quando NÃO utilizar" e "Compatibilidade com Sub-agents". v2.1 em 16/07/2026 — Sprint G.6.4 (Sprint Backlog Governance, ADR-009): nota de vigência adicionada ao item 9, apontando `PROJECT_GOVERNANCE.md` Seção 4.1 como fluxo operacional vigente. Nenhum conteúdo normativo desta Skill foi removido. -->
