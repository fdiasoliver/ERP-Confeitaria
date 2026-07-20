# STATE_MACHINE.md — Máquina de Estados Oficial

Parte da meta-skill `project-skill-governance`. Não implementa código, não altera arquivos do projeto, não produz documentação do ERP — governa apenas o estado formal de uma Sprint.

---

## ⚠️ Divergência não resolvida — leia antes de usar este documento

Este arquivo foi solicitado com um conjunto de 9 estados (`Backlog → Planning → Ready → Executing → Review → Audit → Documentation → Approved → Closed`) **diferente** do conjunto de 8 estados já formalizado e em uso real na skill `sprint-governance` (item 4) e em `AI_PROMPT_ORCHESTRATOR.md` (seção "Estados da Sprint"): `PLANEJADA → ORQUESTRADA → VALIDADA → EM IMPLEMENTAÇÃO → IMPLEMENTADA → AUTOAUDITADA → AUDITADA → ENCERRADA`.

**Esta divergência não foi resolvida por este documento.** Ela está registrada como Problema Encontrado (ver seção de entrega desta tarefa) para decisão do Product Owner/Orchestrator na consolidação da Sprint G.5.1. Este arquivo documenta o esquema de 9 estados **exatamente como pedido**, com uma tabela de equivalência aproximada para o esquema de 8 já em produção — ele **não substitui, não deprecia e não prevalece** sobre `sprint-governance` item 4 até que essa decisão seja tomada explicitamente.

Até a reconciliação: qualquer IA executando uma sprint real neste projeto deve continuar seguindo o esquema de 8 estados de `sprint-governance`/`AI_PROMPT_ORCHESTRATOR.md`, que é o que está de fato referenciado pelo restante da governança (FASE 0–FASE 6, os dois artefatos `SPRINT_X.md`/`SPRINT_AUDIT.md`, o Fluxo Oficial de Auditoria).

---

## Os dois esquemas, lado a lado

| # | Esquema pedido nesta sprint (9 estados) | Esquema já em produção — `sprint-governance` (8 estados) |
|---|---|---|
| 1 | Backlog | PLANEJADA |
| 2 | Planning | ORQUESTRADA |
| 3 | Ready | VALIDADA |
| 4 | Executing | EM IMPLEMENTAÇÃO |
| 5 | Review | IMPLEMENTADA |
| 6 | Audit | AUTOAUDITADA |
| 7 | Documentation | *(sem estado próprio — etapa dentro do ciclo, não um estado)* |
| 8 | Approved | AUDITADA |
| 9 | Closed | ENCERRADA |

## Tabela de equivalência aproximada

| Estado pedido | ≈ Estado em produção | Observação |
|---|---|---|
| Backlog | PLANEJADA | Equivalência direta — sprint aprovada pelo Product Owner, ainda sem `SPRINT_X.md`/`SPRINT_AUDIT.md`. |
| Planning | ORQUESTRADA | Equivalência direta — FASE 0 concluída, os dois artefatos produzidos. |
| Ready | VALIDADA | Equivalência direta — Executor concluiu FASE -1 e FASE 0.5. |
| Executing | EM IMPLEMENTAÇÃO | Equivalência direta. |
| Review | IMPLEMENTADA + AUTOAUDITADA (parcial) | O esquema de 9 estados junta "implementação concluída" e "autoauditoria" em um único estado "Review"; o de 8 os separa em dois. |
| Audit | AUTOAUDITADA (parcial) + AUDITADA (parcial) | Nome ambíguo entre os dois esquemas: "Audit" no de 9 estados fica entre autoauditoria e auditoria independente; não há um único estado equivalente. |
| Documentation | *(sem equivalente de estado)* | No esquema de 8 estados, atualização de `PLAN.md`/`CHANGELOG.md` é uma **etapa** dentro do fluxo de fases (`sprint-governance` item 3: "Auditoria Documental → Atualização de PLAN.md/CHANGELOG.md"), não um estado separado da sprint. Tratar "Documentation" como estado próprio é uma diferença estrutural real, não só de nome. |
| Approved | AUDITADA | Equivalência direta — Auditor concluiu revisão independente com parecer APROVADO. |
| Closed | ENCERRADA | Equivalência direta. |

---

## Definição de cada um dos 9 estados pedidos

### 1. Backlog

- **Entrada:** a sprint foi identificada como próxima no roadmap (`PLAN.md`), mas ainda não recebeu aprovação formal.
- **Saída:** Product Owner aprova explicitamente a execução da sprint.
- **Responsável:** Product Owner.
- **Critério de mudança:** aprovação explícita registrada (equivalente ao checkpoint (a) de `sprint-execution` item 6).
- **Artefatos:** nenhum ainda — `SPRINT_X.md`/`SPRINT_AUDIT.md` não existem neste estado.

### 2. Planning

- **Entrada:** sprint aprovada (saiu de Backlog).
- **Saída:** Orchestrator conclui a FASE 0 (Análise Arquitetural) e produz os dois artefatos completos.
- **Responsável:** Orchestrator.
- **Critério de mudança:** `SPRINT_X.md` e `SPRINT_AUDIT.md` existem e estão completos (11 itens cada, ver `sprint-governance` item 2).
- **Artefatos:** `SPRINT_X.md`, `SPRINT_AUDIT.md` (produzidos durante este estado).

### 3. Ready

- **Entrada:** os dois artefatos existem e estão completos.
- **Saída:** Executor conclui FASE -1 (validação de estrutura) e FASE 0.5 (auditoria de contratos) sem bloqueio.
- **Responsável:** Executor.
- **Critério de mudança:** nenhum item obrigatório de FASE -1 está ausente; nenhum contrato necessário está faltando (ou um bloqueio real foi identificado e resolvido/aprovado).
- **Artefatos:** nenhum novo — apenas confirmação sobre os artefatos existentes.

### 4. Executing

- **Entrada:** sprint validada (Ready).
- **Saída:** todas as microtarefas da sprint foram implementadas.
- **Responsável:** Executor.
- **Critério de mudança:** código completo conforme "Arquivos permitidos" do `SPRINT_X.md`; nenhuma microtarefa pendente.
- **Artefatos:** código-fonte alterado/criado dentro do escopo declarado.

### 5. Review

- **Entrada:** implementação concluída.
- **Saída:** Executor realiza sua própria autoauditoria e executa as validações previstas (`tsc`/`lint`/`build` conforme `SPRINT_X.md`).
- **Responsável:** Executor.
- **Critério de mudança:** validações executadas com resultado registrado (sucesso ou falha tratada).
- **Artefatos:** resultado de `tsc`/`lint`/`build`, relatório de autoauditoria.

### 6. Audit

- **Entrada:** autoauditoria concluída.
- **Saída:** Auditor conclui o Fluxo Oficial de Auditoria (9 passos, ver `sprint-audit`) e emite parecer.
- **Responsável:** Auditor.
- **Critério de mudança:** parecer emitido — mas o parecer em si não define a saída deste estado especificamente para "Approved"; ver observação abaixo.
- **Artefatos:** relatório de auditoria, achados classificados (Inconsistência/Observação Técnica/Melhoria Futura).
- **Observação:** este é o estado com maior sobreposição conceitual entre os dois esquemas — no de 8 estados, "AUTOAUDITADA" e "AUDITADA" são estados distintos e sequenciais; aqui "Audit" tenta cobrir ambos, o que é impreciso. Ver Problema Encontrado.

### 7. Documentation

- **Entrada:** auditoria concluída (ou, dependendo da reconciliação, pode preceder a auditoria — ver Problema Encontrado, pois no esquema de 8 estados a atualização documental ocorre *antes* da auditoria formal, não depois).
- **Saída:** `PLAN.md` e `CHANGELOG.md` atualizados conforme as regras de `governance` itens 6–7, sem duplicidade (verificada por técnica objetiva, `sprint-audit` item 5).
- **Responsável:** Executor (quem atualiza) — Auditor confere.
- **Critério de mudança:** entrada única por sprint em `PLAN.md`, seção única em `CHANGELOG.md`, texto estritamente factual.
- **Artefatos:** `PLAN.md`, `CHANGELOG.md` atualizados.

### 8. Approved

- **Entrada:** documentação atualizada e auditoria com parecer.
- **Saída:** parecer do Auditor é APROVADO (não NECESSITA CORREÇÃO nem BLOQUEADO — ver `sprint-audit` item 10, árvore de decisão).
- **Responsável:** Auditor.
- **Critério de mudança:** zero Inconsistência (categoria A) em aberto.
- **Artefatos:** parecer formal de aprovação.

### 9. Closed

- **Entrada:** sprint aprovada.
- **Saída:** FASE 6 (Evolução da Governança) avaliada; resumo apresentado; aceite explícito do Product Owner recebido (checkpoint (b) de `sprint-execution` item 6).
- **Responsável:** Product Owner (aceite final) — Orchestrator conduz FASE 6.
- **Critério de mudança:** aceite explícito registrado.
- **Artefatos:** nenhum novo — é o estado terminal.

---

## Regra de transição

Igual em ambos os esquemas: **transição somente para frente, nunca há retorno de estado** (`sprint-governance` item 4). Se um problema é encontrado em um estado avançado (ex.: Audit) que exige retrabalho de um estado anterior (ex.: Executing), isso não é modelado como "voltar de estado" — é uma nova iteração dentro do mesmo estado até a saída ser satisfeita, ou (se o parecer for NECESSITA CORREÇÃO/BLOQUEADO) uma pausa até resolução, não uma regressão formal de estado.

---

Precedência: em caso de conflito entre este documento e `sprint-governance`/`AI_PROMPT_ORCHESTRATOR.md` quanto aos estados de sprint, **nenhum dos dois prevalece automaticamente** — esta é exatamente a divergência não resolvida descrita no topo deste arquivo. Em qualquer outro conflito, `PROJECT_GOVERNANCE.md` prevalece sobre todos.
