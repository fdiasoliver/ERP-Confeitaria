# WORKFLOW.md — Fluxo Oficial do AI Operating System

Parte da meta-skill `project-skill-governance` (Sprint G.5.1). Este documento formaliza o fluxo de 11 etapas fornecido pelo Product Owner para esta sprint, e o reconcilia com o fluxo já oficial em `docs/ai/AI_PROMPT_ORCHESTRATOR.md` Seção 3 (11 documentos-fonte deste projeto — não substitui nenhum deles).

Esta meta-skill **nunca implementa código, nunca altera arquivos, nunca produz documentação do projeto** — apenas governa como as 14 skills operacionais se relacionam entre si.

---

## 1. O fluxo, etapa por etapa

### 1.1 Nova Sprint

- **Responsabilidade:** decisão de iniciar um novo ciclo de trabalho.
- **Skill(s):** `sprint-governance` (item 4, "Estados da Sprint").
- **Papel (`AI_PROMPT_ORCHESTRATOR.md` §2):** Product Owner.
- **Entrada:** necessidade de negócio identificada pelo Product Owner.
- **Saída:** Sprint aprovada — estado `PLANEJADA`.
- **Checkpoint de aprovação:** não é um dos dois checkpoints formais (ver `sprint-execution` item 6) — é o próprio ato de aprovação que origina o ciclo, distinto dos checkpoints (a)/(b) definidos adiante.

### 1.2 Bootstrap

- **Responsabilidade:** carregar contexto do projeto antes de qualquer ação.
- **Skill(s):** `project-bootstrap`; `sprint-governance` item 0 ("Leitura obrigatória").
- **Papel:** quem for atuar em seguida (tipicamente Orchestrator, ao preparar a FASE 0).
- **Entrada:** sessão/agente sem contexto carregado.
- **Saída:** os 5 documentos obrigatórios lidos (`PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, `PLAN.md`, `CHANGELOG.md`, `AI_PROMPT_ORCHESTRATOR.md`) + as Skills relevantes.
- **Checkpoint de aprovação:** nenhum — etapa de preparação, não de decisão.
- **Nota:** esta etapa **não existe como fase nomeada** em `AI_PROMPT_ORCHESTRATOR.md` — é tratada ali como pré-requisito implícito ("Leitura obrigatória", Seção 5), não como uma fase numerada do Fluxo Oficial (Seção 3). Ver "Problemas encontrados".

### 1.3 Orchestrator

- **Responsabilidade:** análise arquitetural completa antes de qualquer implementação.
- **Skill(s):** `orchestrator` (itens 1–2); `sprint-governance` item 3.
- **Papel:** Orchestrator.
- **Entrada:** Sprint no estado `PLANEJADA`.
- **Saída:** `SPRINT_X.md` + `SPRINT_AUDIT.md` completos — estado `ORQUESTRADA`.
- **Checkpoint de aprovação:** nenhum ainda — o checkpoint (a) só ocorre ao final da etapa 1.4 (Planning), quando o plano é apresentado ao Product Owner.
- **Equivalência oficial:** `FASE 0 — Análise Arquitetural` (`AI_PROMPT_ORCHESTRATOR.md`).

### 1.4 Planning

- **Responsabilidade:** tradução prática da FASE 0 em escopo, dependências e critérios de aceite verificáveis.
- **Skill(s):** `sprint-planning` (todos os itens); `orchestrator` item 3.
- **Papel:** Orchestrator (autor) + Product Owner (aprovador).
- **Entrada:** `SPRINT_X.md`/`SPRINT_AUDIT.md` produzidos na etapa anterior.
- **Saída:** plano validado contra o checklist de `sprint-planning` item 9 (DoR).
- **Checkpoint de aprovação — SIM, checkpoint (a):** `PROJECT_GOVERNANCE.md` Seção 4 exige aguardar aprovação explícita do Product Owner **após o planejamento, antes de iniciar a implementação** (ver `sprint-execution` item 6). Este é o primeiro dos dois únicos checkpoints formais do processo.
- **Nota:** `orchestrator` item 3 afirma textualmente que "o planejamento nunca é entregue separado da FASE 0 — é o produto dela". Ver "Problemas encontrados" — Orchestrator e Planning não são duas fases sequenciais distintas no processo oficial, são a mesma FASE 0 vista de dois ângulos (análise vs. tradução em plano verificável).

### 1.5 Execution

- **Responsabilidade:** validação da sprint, auditoria de contratos, e implementação propriamente dita.
- **Skill(s):** `sprint-execution` (todos os itens); `sprint-governance` itens 2–3.
- **Papel:** Executor.
- **Entrada:** plano aprovado (checkpoint a superado) — estado `ORQUESTRADA`.
- **Saída:** código implementado e validado — passa por `VALIDADA` → `EM IMPLEMENTAÇÃO` → `IMPLEMENTADA`.
- **Checkpoint de aprovação:** nenhum interno — a regra de "uma microtarefa por vez, validar antes de avançar" (`sprint-execution` item 2) não é um checkpoint de aprovação do Product Owner, é uma disciplina de validação técnica.
- **Equivalência oficial:** `FASE -1 — Validação da Sprint` → `FASE 0.5 — Auditoria de Contratos` → `Implementação`.

### 1.6 Documentation

- **Responsabilidade:** atualizar `PLAN.md`/`CHANGELOG.md` — **somente depois** de todas as validações executadas.
- **Skill(s):** `documentation` (ecossistema completo); `sprint-execution` item 3 (ordem obrigatória); `governance` itens 6–7 (regras).
- **Papel:** Executor.
- **Entrada:** validações (`tsc`/`lint`/`build` quando previstos) já concluídas com sucesso.
- **Saída:** `PLAN.md` com status substituído, `CHANGELOG.md` com entrada nova — nenhuma duplicidade.
- **Checkpoint de aprovação:** nenhum — mas há uma **proibição explícita de ordem**: `PROJECT_GOVERNANCE.md` ("Atualização do PLAN.md") proíbe atualizar `PLAN.md` antes de validar.
- **Equivalência oficial:** `Atualização da Documentação` (entre "Validações" e "Auditoria" no diagrama de `AI_PROMPT_ORCHESTRATOR.md` Seção 3).

### 1.7 Engineering Review

- **Responsabilidade:** checklist-mestre de revisão crítica (arquitetura, código, documentação, governança, PLAN, CHANGELOG, escopo, regressão, riscos, dívida técnica).
- **Skill(s):** `engineering-reviewer` (todos os itens — orquestra as outras 13).
- **Papel:** Executor (autoauditoria) — **não** o Auditor.
- **Entrada:** implementação concluída (`IMPLEMENTADA`).
- **Saída:** os 6 blocos obrigatórios de relatório (`engineering-reviewer` item 13) — estado `AUTOAUDITADA`.
- **Checkpoint de aprovação:** nenhum formal — é autoauditoria do próprio Executor, não uma aprovação externa.
- **Equivalência oficial:** `Autoauditoria Arquitetural`.
- **Correção aplicada (ver "Problemas encontrados"):** a ordem originalmente fornecida nesta sprint listava "Audit" antes de "Engineering Review". Corrigido por confirmação explícita do Product Owner — a `description` de `engineering-reviewer` diz "before declaring it ready for audit", e a sequência oficial de estados (`AUTOAUDITADA` precede `AUDITADA`) confirma que Engineering Review vem antes de Audit.

### 1.8 Audit

- **Responsabilidade:** revisão independente do trabalho do Executor.
- **Skill(s):** `sprint-audit` (todos os itens); `sprint-governance` itens 5–6.
- **Papel:** Auditor.
- **Entrada:** log completo da execução (incluindo o relatório de Engineering Review da etapa anterior), repassado pelo Product Owner (Etapa 4 do Fluxo Operacional).
- **Saída:** parecer — `APROVADO` / `NECESSITA CORREÇÃO` / `BLOQUEADO` — estado `AUDITADA`.
- **Checkpoint de aprovação:** o próprio parecer do Auditor funciona como um gate de qualidade, mas não é um dos dois checkpoints formais de "aguardar aprovação do Product Owner" — é uma decisão do papel Auditor, distinta.
- **Equivalência oficial:** `Auditoria (Auditor)` — segue o `Fluxo Oficial de Auditoria` (9 passos).

### 1.9 Governance

- **Responsabilidade:** identificar melhorias permanentes de processo após uma sprint auditada.
- **Skill(s):** `orchestrator` item 6; `sprint-audit` item 4 (o ciclo real de Melhoria Futura → regra oficial).
- **Papel:** Orchestrator (a etapa está descrita sob o título "Governança" na própria skill `orchestrator`, item 6).
- **Entrada:** estado `AUDITADA`.
- **Saída:** possível atualização de `PROJECT_GOVERNANCE.md`/`AI_PROMPT_ORCHESTRATOR.md`, ou criação de ADR. **Nunca altera código** (`orchestrator` item 6, `AI_PROMPT_ORCHESTRATOR.md` "FASE 6").
- **Checkpoint de aprovação:** qualquer atualização de `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md` exige autorização explícita (`governance` item 1) — não é um dos dois checkpoints de sprint, é a regra geral de imutabilidade desses documentos.
- **Equivalência oficial:** `FASE 6 — Evolução da Governança`.

### 1.10 Encerramento

- **Responsabilidade:** ACEITE formal — resumo apresentado, arquivos listados, validações confirmadas.
- **Skill(s):** `sprint-execution` item 5.
- **Papel:** Executor apresenta; Product Owner aceita.
- **Entrada:** FASE 6 avaliada, documentação atualizada.
- **Saída:** estado `ENCERRADA`.
- **Checkpoint de aprovação — SIM, checkpoint (b):** o segundo e último checkpoint formal — aguardar aprovação explícita antes de avançar para a próxima sprint (`sprint-execution` item 6).
- **Equivalência oficial:** `Encerramento da Sprint` — estado `ENCERRADA`.

### 1.11 Próxima Sprint

- **Responsabilidade:** reiniciar o ciclo.
- **Skill(s):** `orchestrator` item 7; `sprint-audit` item 4 (passo 9 do Fluxo Oficial de Auditoria: "Gerar Prompt da próxima Sprint").
- **Papel:** Orchestrator.
- **Entrada:** sprint anterior `ENCERRADA`.
- **Saída:** nova FASE 0 iniciada — o ciclo retorna à etapa 1.3.
- **Checkpoint de aprovação:** o mesmo checkpoint (b) da etapa anterior cobre esta transição — não é um checkpoint adicional.

---

## 2. Tabela de equivalência de vocabulário

O fluxo desta sprint (inglês, 11 etapas) e o fluxo já oficial de `AI_PROMPT_ORCHESTRATOR.md` Seção 3 (português, nomes de FASE) são **o mesmo processo**, não dois processos concorrentes.

| Etapa (Sprint G.5.1) | Equivalente oficial (`AI_PROMPT_ORCHESTRATOR.md`) | Observação |
|---|---|---|
| Nova Sprint | Estado `PLANEJADA` | — |
| Bootstrap | "Leitura obrigatória" (Seção 5) | Não é uma fase numerada no Fluxo Oficial (Seção 3) — é pré-requisito implícito |
| Orchestrator | `FASE 0 — Análise Arquitetural` | — |
| Planning | Produto da `FASE 0` (o próprio `SPRINT_X.md`) | Não é uma fase separada no processo oficial — ver Problema 1 |
| Execution | `FASE -1` → `FASE 0.5` → `Implementação` | Três sub-fases oficiais agrupadas em uma etapa nesta sprint |
| Documentation | `Atualização da Documentação` | Posição idêntica em ambos os fluxos |
| Engineering Review | `Autoauditoria Arquitetural` | Ordem corrigida — ver Problema 2 |
| Audit | `Auditoria (Auditor)` | — |
| Governance | `FASE 6 — Evolução da Governança` | — |
| Encerramento | `Encerramento da Sprint` (estado `ENCERRADA`) | — |
| Próxima Sprint | Retorno à `FASE 0` | — |

---

## 3. Checklist de verificação desta reconciliação

- [x] Todas as 11 etapas mapeadas para um equivalente oficial ou sinalizadas como sem equivalente direto (Bootstrap).
- [x] Os dois checkpoints formais (`sprint-execution` item 6) localizados corretamente no fluxo de 11 etapas: (a) fim de Planning, (b) fim de Encerramento.
- [x] Papéis (`AI_PROMPT_ORCHESTRATOR.md` §2) atribuídos a cada etapa.
- [x] Nenhuma responsabilidade inventada — toda linha cita a skill/seção exata de origem.
- [x] Divergências reais entre o fluxo pedido e o processo oficial registradas — seção 4. Problema 2 (ordem Audit/Engineering Review) corrigido após confirmação explícita do Product Owner; Problema 1 permanece apenas documentado, sem alteração.

## 4. Problemas encontrados

**Problema 1 — Orchestrator e Planning não são fases sequenciais distintas no processo oficial.** `orchestrator` item 3 declara textualmente: "O planejamento nunca é entregue separado da FASE 0 — é o produto dela." O fluxo de 11 etapas desta sprint os trata como dois blocos sequenciais. Não é uma contradição grave (Planning pode ser lido como "a parte final da FASE 0, onde o plano é formalizado e aprovado"), mas é uma diferença de modelagem que vale registrar — não corrigida nesta tabela, apenas documentada.

**Problema 2 — CORRIGIDO.** O fluxo de 11 etapas fornecido originalmente para esta sprint listava "Audit" antes de "Engineering Review". A `description` de `engineering-reviewer` afirma que a skill deve ser usada "before declaring [a sprint] ready for audit" — ou seja, **antes** de Audit, não depois — e a sequência oficial de estados confirma isso: `AUTOAUDITADA` (Engineering Review / Autoauditoria) vem **antes** de `AUDITADA` (Audit) em `AI_PROMPT_ORCHESTRATOR.md`, "Estados da Sprint". Sinalizado nesta entrega e corrigido por confirmação explícita do Product Owner: a ordem na seção 1 e na tabela acima agora é **Engineering Review → Audit**.

**Nenhuma outra divergência real** foi encontrada entre o vocabulário desta sprint e o processo já oficial — as demais 9 etapas mapeiam de forma direta e sem ambiguidade.

## 5. Melhorias (registradas, não implementadas)

- Problema 2 já corrigido nesta entrega — `AI_PROMPT_ORCHESTRATOR.md` já estava correto; o ajuste necessário era só na comunicação do fluxo de 11 etapas, já aplicado.
- "Bootstrap" como fase nomeada (Problema 1 do vocabulário) poderia ser formalizada como uma fase explícita em `AI_PROMPT_ORCHESTRATOR.md`, já que hoje existe apenas como seção de "Leitura obrigatória" sem nome de fase — isso tornaria os dois vocabulários idênticos, não apenas equivalentes.

## 6. Dependências

Este documento depende de, e não pode contradizer: `PROJECT_GOVERNANCE.md`, `docs/ai/AI_PROMPT_ORCHESTRATOR.md`, e as 8 skills citadas (`sprint-governance`, `orchestrator`, `sprint-planning`, `sprint-execution`, `documentation`, `sprint-audit`, `engineering-reviewer`, `governance`). Depende também dos demais arquivos desta mesma meta-skill (`SKILL.md`, `SKILL_DEPENDENCIES.md`, `SKILL_MATRIX.md`, `RESPONSIBILITIES.md`, `STATE_MACHINE.md`, `CONFLICT_RESOLUTION.md`, `README.md`) — originalmente produzidos por forks irmãos em paralelo na Sprint G.5.1; eventuais inconsistências entre este arquivo e os demais devem ser resolvidas na consolidação final da sprint, não por este documento isoladamente.

---

Precedência: em caso de conflito entre este documento e `PROJECT_GOVERNANCE.md` ou `AI_PROMPT_ORCHESTRATOR.md`, os documentos originais sempre prevalecem.
