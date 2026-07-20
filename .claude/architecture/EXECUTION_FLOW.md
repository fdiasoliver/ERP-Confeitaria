# EXECUTION_FLOW.md — Fluxo de Execução de uma Missão do AI Operating System

Parte da arquitetura do AI Operating System (Sprint G.5.3). Modela o fluxo genérico de qualquer **missão** do AI OS — um conceito mais amplo que "sprint de código do ERP": uma missão pode ser uma sprint de implementação, uma sprint de governança de Skill, uma sprint de arquitetura (como a própria G.5.3), ou, no futuro, a execução de um Playbook. Não repete o conteúdo do fluxo de 11 etapas já oficial para sprints de código do ERP (`project-skill-governance/references/WORKFLOW.md`) — reconcilia os dois explicitamente na Seção 2. Fonte de verdade: `AI_OPERATING_SYSTEM.md` item 7 (Ciclo de vida) e a ordem de missão desta sprint.

## 1. O fluxo, etapa por etapa

```
Nova Missão → Planejamento → Arquitetura → Implementação → Autoauditoria → Correções → Validações → Documentação → Relatório Executivo → Encerramento
```

### 1.1 Nova Missão

- **Entra:** necessidade identificada pelo Product Owner (funcionalidade, correção, evolução de infraestrutura de IA).
- **Sai:** missão aprovada para prosseguir.
- **Responsável (papel):** Product Owner.
- **Critério de avanço:** a missão tem um objetivo declarável em uma frase e não se sobrepõe a uma missão já em andamento.
- **Bloqueio real:** ambiguidade sobre o que a missão deveria produzir — interrompe aqui, antes de qualquer leitura.

### 1.2 Planejamento

- **Entra:** missão aprovada.
- **Sai:** escopo, fora-de-escopo, dependências e critérios de aceite explícitos.
- **Responsável:** Orchestrator (ou quem assume esse papel na missão).
- **Critério de avanço:** as perguntas obrigatórias de planejamento foram respondidas (ver `sprint-planning`/`orchestrator` para a instância de sprint de código; esta etapa é genérica o suficiente para cobrir também o planejamento de uma missão de arquitetura ou auditoria).
- **Bloqueio real:** dependência não concluída, ou escopo que exigiria alterar camada fora do permitido pela missão.

### 1.3 Arquitetura

- **Entra:** plano aprovado.
- **Sai:** decisões arquiteturais registradas — desde uma confirmação simples ("nenhuma mudança de arquitetura necessária") até um conjunto completo de documentos (como esta própria sprint produziu).
- **Responsável:** Orchestrator, ou uma missão dedicada de arquitetura (caso da G.5.3).
- **Critério de avanço:** nenhum bloqueio arquitetural real pendente; toda divergência entre o pedido e uma restrição técnica real foi resolvida e justificada, não ignorada.
- **Bloqueio real:** conflito entre o que a missão pede e uma regra de hierarquia superior (`PROJECT_GOVERNANCE.md`, ADR, ou um mecanismo reservado do Claude Code — ver `AI_OPERATING_SYSTEM.md` item 10 para o exemplo real desta própria sprint).

### 1.4 Implementação

- **Entra:** arquitetura fechada (etapa anterior sem bloqueio).
- **Sai:** o artefato principal da missão — código, documento, ou estrutura nova.
- **Responsável:** Executor (ou os Sub-agents/forks delegados, quando existirem).
- **Critério de avanço:** todos os itens do escopo declarados na etapa 1.2 foram produzidos.
- **Bloqueio real:** um item do escopo depender de algo fora do que foi arquitetado na etapa 1.3.

### 1.5 Autoauditoria

- **Entra:** implementação concluída.
- **Sai:** lista de achados (duplicidade, sobreposição, referência quebrada, inconsistência) — mesmo que a lista seja vazia.
- **Responsável:** quem implementou (autoauditoria — distinto de uma auditoria externa/independente).
- **Critério de avanço:** todos os artefatos produzidos na etapa 1.4 foram revisados pelo menos uma vez.
- **Bloqueio real:** nenhum — esta etapa só produz a lista, não decide se ela impede o avanço (isso é a etapa 1.6).

### 1.6 Correções

- **Entra:** lista de achados da Autoauditoria.
- **Sai:** achados corrigidos diretamente, sem abrir uma missão nova — mesmo princípio já aplicado nesta sessão (Sprint G.5.2.1 encontrou 3 inconsistências; a correção aconteceu na abertura desta própria Sprint G.5.3, não em uma "G.5.2.2").
- **Responsável:** quem implementou.
- **Critério de avanço:** nenhum achado classificado como bloqueante (ver taxonomia de `PROJECT_GOVERNANCE.md`: Inconsistência) permanece sem correção.
- **Bloqueio real:** uma correção necessária exigiria tocar um arquivo fora do escopo permitido pela missão — aí sim vira uma missão nova, não uma sub-missão.

### 1.7 Validações

- **Entra:** achados corrigidos.
- **Sai:** confirmação técnica de que o resultado está correto — validação documental, arquitetural, de referências, de consistência, de hierarquia, de aderência à documentação oficial (quando aplicável).
- **Responsável:** quem implementou, ou uma missão de auditoria dedicada (caso a missão original assim exija, como a G.5.2.1).
- **Critério de avanço:** todas as validações aplicáveis ao tipo de missão passaram.
- **Bloqueio real:** uma validação falha de forma que só é corrigível fora do escopo da missão atual.

### 1.8 Documentação

- **Entra:** resultado validado.
- **Sai:** documentação atualizada **somente onde existe alteração real** — nunca registro artificial (mesmo princípio já em `governance`/`sprint-execution` para `PLAN.md`/`CHANGELOG.md`).
- **Responsável:** quem implementou.
- **Critério de avanço:** nenhuma alteração real ficou sem registro correspondente.
- **Bloqueio real:** nenhum — esta etapa é mecânica uma vez que a etapa 1.7 passou.

### 1.9 Relatório Executivo

- **Entra:** missão documentada.
- **Sai:** resumo em linguagem não técnica do que foi feito, decisões tomadas, e o que fica pendente.
- **Responsável:** quem implementou/orquestrou a missão.
- **Critério de avanço:** o relatório responde objetivamente se a missão cumpriu seu objetivo declarado na etapa 1.1.
- **Bloqueio real:** nenhum.

### 1.10 Encerramento

- **Entra:** relatório apresentado.
- **Sai:** missão concluída — estado `Closed` (ver `STATE_MACHINE.md`).
- **Responsável:** Product Owner aceita; quem implementou apresenta.
- **Critério de avanço:** nenhum item do escopo original ficou sem endereçamento (feito, ou explicitamente adiado com justificativa).
- **Bloqueio real:** nenhum — é o fim do ciclo.

## 2. Reconciliação com o fluxo já oficial de sprint de código (`WORKFLOW.md`, 11 etapas)

**Este fluxo (10 etapas) é o modelo genérico do AI Operating System. `WORKFLOW.md` é a instância específica desse modelo já aplicada a sprints de código do ERP desde a Sprint G.5.1.** Não é uma correspondência 1:1 limpa — há 3 divergências reais, documentadas abaixo em vez de forçadas.

| Este fluxo (genérico, G.5.3) | `WORKFLOW.md` (11 etapas, sprint de código) | Relação |
|---|---|---|
| Nova Missão | Nova Sprint | Equivalente direto |
| Planejamento | Bootstrap + Orchestrator + Planning | `WORKFLOW.md` separa em 3 sub-etapas o que aqui é 1 — cobrindo o mesmo território |
| Arquitetura | *(sem etapa nomeada própria)* | **Divergência real 1**: em `WORKFLOW.md`, análise arquitetural é parte da FASE 0 (Orchestrator), não uma etapa separada com artefato próprio. Este fluxo genérico eleva Arquitetura a etapa própria porque cobre também missões *dedicadas* a arquitetura (como a G.5.3), onde ela não é um subproduto do planejamento — é o entregável principal. |
| Implementação | Execution | Equivalente direto |
| Autoauditoria | Engineering Review | Equivalente direto (mesmo conceito, nome traduzido) |
| Correções | *(sem etapa nomeada própria)* | **Divergência real 2**: em `WORKFLOW.md`, correção é uma consequência implícita de um parecer "NECESSITA CORREÇÃO" do Auditor — não é uma etapa nomeada e não tem artefato próprio. Este fluxo genérico a torna explícita, refletindo o padrão já usado nesta sessão (corrigir na hora em que o problema é achado, sem abrir sub-missão). |
| Validações | *(dentro de Execution/`sprint-execution`)* | `WORKFLOW.md` trata validação técnica (tsc/lint/build) como parte de Execution, não como etapa separada; este fluxo a separa para cobrir também validações não-técnicas (documental, arquitetural, de referências) que uma missão de arquitetura ou auditoria precisa e uma sprint de código normalmente não nomeia à parte. |
| Documentação | Documentation | Equivalente direto |
| Relatório Executivo | *(dentro de Engineering Review, item "Relatório final obrigatório")* | Este fluxo genérico eleva a etapa a um passo nomeado; em `WORKFLOW.md` está embutida no relatório de 6 blocos do `engineering-reviewer`. |
| Encerramento | Encerramento | Equivalente direto |
| *(sem equivalente aqui)* | Audit (papel Auditor independente) | **Divergência real 3, na direção oposta**: `WORKFLOW.md` tem uma etapa de auditoria por um papel externo e independente (Auditor), distinta de quem implementou. Este fluxo genérico de 10 etapas, conforme fornecido pela ordem de missão desta sprint, não nomeia essa etapa separadamente — a Autoauditoria + Validações cobrem o caso onde a própria missão se audita (como esta G.5.3 fez, via "Autoauditoria" obrigatória na própria ordem). Quando uma missão específica exige revisão por um papel independente, ela deve inserir isso explicitamente entre Validações e Documentação — o modelo genérico não proíbe, apenas não o torna obrigatório para toda missão. |
| Governance (FASE 6) | Governance | **Observação**: `WORKFLOW.md` tem uma etapa "Governance" (FASE 6) entre Audit e Encerramento, ausente do fluxo genérico de 10 etapas fornecido para esta sprint. Não foi adicionada aqui por não fazer parte da lista fornecida pela ordem de missão — mas toda missão que gerar candidato a regra permanente (mesmo critério de `orchestrator/references/fase6.md`) deveria passar por ela antes do Encerramento, na prática. Divergência sinalizada, não corrigida silenciosamente. |

## 3. Quando usar qual fluxo

- **Sprint de código do ERP** (schema, repository, service, API, front-end): usar `WORKFLOW.md` (11 etapas), que já é mais detalhado para esse caso específico.
- **Missão de arquitetura, governança de Skill, ou auditoria pura** (como G.5.0–G.5.3): usar este fluxo de 10 etapas — mais genérico, cobre casos que `WORKFLOW.md` não nomeia (Arquitetura como entregável principal, Correções explícitas).
- **Playbook** (quando existir): deverá compor múltiplas instâncias deste fluxo genérico, uma por Sub-agent delegado — ver `PLAYBOOK_ARCHITECTURE.md`.

---

Precedência: em caso de conflito entre este documento e `AI_OPERATING_SYSTEM.md`, `PROJECT_GOVERNANCE.md`, `AI_PROMPT_ORCHESTRATOR.md` ou `project-skill-governance/references/WORKFLOW.md`, os documentos de hierarquia superior sempre prevalecem (ver `AI_OPERATING_SYSTEM.md` item 4).

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
