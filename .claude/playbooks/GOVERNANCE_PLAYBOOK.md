# Playbook: Governance

Playbook do AI Operating System (Sprint G.5.6), conforme `playbooks/PLAYBOOK_ARCHITECTURE.md`. Especialização do `MISSION_PLAYBOOK.md` para evolução da governança documental do ERP — ADR, DoD, Política de Evolução da Governança (`PROJECT_GOVERNANCE.md` Seção 26). Distinto de `ARCHITECTURE_PLAYBOOK` (evolução da arquitetura do AI Operating System em si).

## 1. Objetivo / Escopo

Padronizar a criação/alteração de uma regra de governança do ERP — nova ADR, novo item de DoD, ou mudança em `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md`.

**Quando utilizar:** inconsistência recorrente identificada (não isolada); decisão aprovada via ADR que precisa ser formalizada; a Política de Evolução da Governança (`PROJECT_GOVERNANCE.md` Seção 26) indica que uma regra nova é necessária.
**Quando NÃO utilizar:** caso isolado de uma sprint específica — a própria Seção 26 proíbe criar regra nova para caso isolado; mudança de arquitetura do AI Operating System em si (isso é `ARCHITECTURE_PLAYBOOK`).

## 2. Pré-condições / Pós-condições

**Pré-condições:** um dos 3 gatilhos válidos da Política de Evolução da Governança presente (inconsistência recorrente / decisão ADR aprovada / lacuna de auditoria não resolvível); aprovação do Product Owner para a mudança de regra.
**Pós-condições:** `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md` atualizado (só por `ai-governance-officer` mediante autorização — nunca autônomo); ADR registrada em `CLAUDE.md` (raiz).

## 3. Entradas / Saídas

**Entradas:** proposta de nova regra de governança, com o gatilho válido identificado.
**Saídas:** regra formalizada (com ADR) ou negada, com justificativa registrada.

## 4. Artefatos produzidos

ADR (tabela "Decisões arquiteturais tomadas" em `CLAUDE.md` raiz), atualização de `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md` quando aprovada.

## 5. Skills necessárias / Contracts utilizados / Operational Protocols utilizados / Sub-agents participantes

**Skills:** `governance` (fonte primária), `sprint-audit` (técnica de classificação de achado que frequentemente motiva a proposta).
**Contracts:** `artifact-contract.md` (ADR como artefato canônico, distinto de "Decision Log" — decisão já registrada em `artifact-contract.md` da G.5.3: são o mesmo conceito).
**Operational Protocols:** `review` (avaliação do gatilho), `documentation` (registro formal).
**Sub-agents:** `ai-governance-officer` lidera — **nunca redige a ADR sozinho sem aprovação do Product Owner** (limite explícito já registrado em `agents/ai-governance-officer.md`).

## 6. Sequência completa de execução

1. `ai-project-manager` ou `ai-governance-officer` identifica um dos 3 gatilhos válidos (`PROJECT_GOVERNANCE.md` Seção 26).
2. `ai-governance-officer` avalia se o gatilho é genuíno (não um caso isolado disfarçado de padrão) — se não for, **recusa e explica por quê**, não força a criação da regra.
3. Se genuíno: `ai-governance-officer` prepara a proposta de ADR, mas **escala para o Product Owner antes de formalizar** — nunca decide sozinho.
4. Após aprovação: `ai-governance-officer` registra a ADR em `CLAUDE.md` (raiz) e atualiza `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md` conforme aprovado.
5. Protocol `documentation`: `ai-documentation-engineer` confere se algum outro documento referencia a regra antiga e precisa de atualização cruzada.
6. Protocol `completion`.

## 7. Critérios de sucesso / interrupção / retorno ao Orchestrator

**Sucesso:** regra formalizada (ou formalmente negada, com justificativa) e registrada.
**Interrupção:** nenhum dos 3 gatilhos válidos está presente (o pedido é, na verdade, um caso isolado) — interrompe e devolve ao solicitante com a explicação, não avança.
**Retorno ao Orchestrator:** sempre antes de qualquer edição real de `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md` — aprovação do Product Owner é pré-condição de execução, não pós-condição de revisão.

## 8. Exemplos completos

**Exemplo real:** a regra "toda Skill nova nasce de `SKILL_TEMPLATE.md` e é validada pela meta-skill antes de incorporação" (formalizada nesta sessão) seguiu exatamente este padrão — motivada por uma inconsistência recorrente real (múltiplas Skills criadas com formatos diferentes ao longo de G.5.0/G.5.1), não um caso isolado, e registrada de forma permanente em `project-skill-governance/SKILL.md` e `.claude/CLAUDE.md`.

**Exemplo negativo (já citado como proibição real do projeto):** criar uma regra de governança nova para resolver um problema que apareceu em uma única sprint — a própria Seção 26 de `PROJECT_GOVERNANCE.md` já registra um caso histórico de sub-sprint proibida (Sprints G.1/G.2) como o exemplo do que este Playbook nunca deve fazer.

---

Precedência: em caso de conflito entre este Playbook e `playbooks/PLAYBOOK_ARCHITECTURE.md` ou qualquer Contract/Protocol/Sub-agent, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.6 (Implementação dos Playbooks). -->
