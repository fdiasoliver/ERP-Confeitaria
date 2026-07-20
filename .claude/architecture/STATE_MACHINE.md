# STATE_MACHINE.md — Máquina de Estados do AI Operating System

Parte da arquitetura do AI Operating System (Sprint G.5.3). Define os 10 estados oficiais de uma **missão** (qualquer trabalho conduzido por este AI Operating System — sprint de código do ERP, sprint de governança de Skill, ou sprint de arquitetura como a própria G.5.3), mais amplo que o ciclo de sprint de código do ERP. Não repete `AI_OPERATING_SYSTEM.md` (hierarquia) nem `LAYER_MODEL.md` (camadas) — consulte-os primeiro.

**Este é o terceiro vocabulário de estado deste projeto**, ao lado de dois já existentes e explicitamente não reconciliados entre si:
1. Os 8 estados de `sprint-governance` (`PLANEJADA → ORQUESTRADA → VALIDADA → EM IMPLEMENTAÇÃO → IMPLEMENTADA → AUTOAUDITADA → AUDITADA → ENCERRADA`) — escopo: sprint de código do ERP.
2. Os 9 estados já documentados (e não resolvidos) em `project-skill-governance/references/STATE_MACHINE.md` (`Backlog → Planning → Ready → Executing → Review → Audit → Documentation → Approved → Closed`).
3. Os 10 estados deste documento — escopo: qualquer missão do AI Operating System, incluindo sprints de arquitetura pura (sem implementação de código), que os outros dois esquemas não previam como fase própria.

Esta sprint **não decide qual dos três é o vocabulário definitivo**. Documenta o terceiro com o mesmo rigor dos outros dois, e mostra onde há correspondência real e onde não há — a decisão de unificação, se um dia for tomada, é do Product Owner.

## Os 10 estados

```
Backlog → Planning → Architecture → Development → Review → Audit → Validation → Documentation → Release → Closed
```

## Definição de cada estado

### 1. Backlog
- **Entrada:** a missão foi identificada (em `PLAN.md`, ou em uma ordem de missão explícita do Product Owner) mas ainda não aprovada.
- **Saída:** Product Owner aprova explicitamente o início.
- **Responsável:** Product Owner.
- **Artefatos:** nenhum.
- **Critério de transição:** aprovação explícita registrada (mensagem do Product Owner, ou ordem de missão já é a própria aprovação — como nesta sprint).

### 2. Planning
- **Entrada:** missão aprovada.
- **Saída:** escopo, fora-de-escopo, arquivos permitidos/proibidos e dependências definidos e completos.
- **Responsável:** Orchestrator.
- **Artefatos:** `SPRINT_X.md`-equivalente (para sprints de código) ou a própria ordem de missão detalhada (para sprints de arquitetura/governança, como esta).
- **Critério de transição:** escopo fechado, sem ambiguidade de "o que está dentro/fora".

### 3. Architecture
- **Entrada:** planejamento concluído, decisão tomada de que a missão precisa (ou é inteiramente) de definição arquitetural antes de qualquer implementação.
- **Saída:** modelo de camadas, contratos, fluxo e responsabilidades da missão estão documentados e coerentes entre si (autoauditoria interna já feita).
- **Responsável:** Orchestrator/Executor atuando como arquiteto.
- **Artefatos:** documentos de arquitetura (ex. os produzidos nesta própria Sprint G.5.3).
- **Critério de transição:** nenhuma decisão arquitetural em aberto que bloqueie a fase seguinte.
- **Nota:** estado sem equivalente direto nos esquemas de 8 e 9 estados já existentes — nenhum dos dois previa uma missão que fosse *só* arquitetura, sem código. Ver tabela de equivalência abaixo.

### 4. Development
- **Entrada:** arquitetura (quando aplicável) concluída, ou planejamento concluído diretamente (missões sem fase de arquitetura própria).
- **Saída:** toda a implementação prevista está completa.
- **Responsável:** Executor.
- **Artefatos:** código-fonte ou documentos, conforme o tipo de missão.
- **Critério de transição:** nenhuma tarefa prevista no planejamento está pendente.

### 5. Review
- **Entrada:** desenvolvimento concluído.
- **Saída:** autoauditoria do próprio Executor concluída.
- **Responsável:** Executor.
- **Artefatos:** relatório de autoauditoria.
- **Critério de transição:** autoauditoria registrada, com achados já classificados (Inconsistência/Observação Técnica/Melhoria Futura).

### 6. Audit
- **Entrada:** autoauditoria concluída.
- **Saída:** auditoria independente concluída, com parecer emitido.
- **Responsável:** Auditor (papel distinto do Executor, mesmo que a mesma sessão de IA assuma os dois papéis em momentos diferentes).
- **Artefatos:** relatório de auditoria (ex. o Laudo de Certificação da Sprint G.5.2.1).
- **Critério de transição:** parecer emitido — o valor do parecer (aprovado/necessita correção/bloqueado) não determina a transição de estado em si, só o conteúdo da fase seguinte.

### 7. Validation
- **Entrada:** auditoria concluída.
- **Saída:** validações técnicas objetivas executadas (para código: `tsc`/`lint`/`build`; para arquitetura/documentação: verificação de referências, hierarquia e aderência à documentação oficial — ver item "Validações" do relatório final desta sprint).
- **Responsável:** Executor, conferido pelo Auditor.
- **Artefatos:** resultado das validações (sucesso/falha por item).
- **Critério de transição:** todas as validações previstas para o tipo de missão executadas e registradas.
- **Nota:** estado sem equivalente próprio nos esquemas de 8 e 9 estados — nos dois, a validação técnica está implícita dentro de "Review"/"IMPLEMENTADA"/"AUTOAUDITADA", nunca separada. Este esquema de 10 estados a torna explícita.

### 8. Documentation
- **Entrada:** validações concluídas com sucesso.
- **Saída:** documentação permanente do projeto atualizada (quando a missão exige — nem toda missão altera `PLAN.md`/`CHANGELOG.md`/`PROJECT_GOVERNANCE.md`).
- **Responsável:** Executor (atualiza), Auditor (confere).
- **Artefatos:** `PLAN.md`/`CHANGELOG.md`/documentos de arquitetura atualizados, apenas quando há alteração real — nunca registro artificial.
- **Critério de transição:** documentação consistente com o que foi de fato implementado/decidido.

### 9. Release
- **Entrada:** documentação atualizada.
- **Saída:** a missão está formalmente pronta para ser considerada concluída e disponível para a próxima missão depender dela.
- **Responsável:** Auditor emite o veredito final; Product Owner registra aceite.
- **Artefatos:** relatório final da missão (ex. o Relatório Final desta própria sprint).
- **Critério de transição:** zero Inconsistência (categoria A) em aberto sem tratamento explícito.
- **Nota:** nomeado "Release" (não "Approved", como no esquema de 9 estados) porque o AI Operating System trata a conclusão de uma missão de arquitetura como uma **entrega** que a próxima missão consome diretamente (ex.: esta sprint entrega a base que a G.5.4 vai consumir), não apenas uma aprovação documental. Equivalência aproximada com "Approved" (9 estados) e "AUDITADA" (8 estados) — não idêntica, ver tabela abaixo.

### 10. Closed
- **Entrada:** missão liberada (Release).
- **Saída:** nenhuma — estado terminal.
- **Responsável:** Product Owner.
- **Artefatos:** nenhum novo.
- **Critério de transição:** não aplicável (estado final).

## Regra de transição

Mesma regra dos outros dois esquemas já em produção: **somente para frente, nunca há retorno de estado**. Retrabalho necessário após um estado avançado não é modelado como regressão — é iteração dentro do mesmo estado até a saída ser satisfeita.

## Tabela de equivalência entre os três esquemas

| 10 estados (este documento — AI Operating System) | 9 estados (`project-skill-governance`) | 8 estados (`sprint-governance`) | Correspondência |
|---|---|---|---|
| Backlog | Backlog | PLANEJADA | Direta nos três |
| Planning | Planning | ORQUESTRADA | Direta nos três |
| **Architecture** | *(sem equivalente)* | *(sem equivalente)* | **Sem correspondência** — estado novo, específico de missões de arquitetura pura |
| Development | Executing | EM IMPLEMENTAÇÃO | Direta com os dois, mas "Ready"(9)/"VALIDADA"(8) não têm estado próprio aqui — a checagem de prontidão fica implícita na transição Architecture/Planning → Development |
| Review | Review | IMPLEMENTADA | Aproximada — "IMPLEMENTADA" (8) é mais estreito, não inclui autoauditoria |
| Audit | Audit | AUTOAUDITADA + AUDITADA (parcial) | Mesma ambiguidade já registrada no esquema de 9 estados — não resolvida aqui também |
| **Validation** | *(implícito em "Review")* | *(implícito em "IMPLEMENTADA"/"AUTOAUDITADA")* | **Sem correspondência própria** — estado novo, explicitando algo que os outros dois deixam implícito |
| Documentation | Documentation | *(sem estado próprio — é etapa de fluxo, não estado, no esquema de 8)* | Mesma divergência estrutural já registrada no esquema de 9 |
| Release | Approved | AUDITADA | Aproximada, não idêntica — nome e ênfase diferentes (entrega vs. aprovação documental), ver nota do estado 9 acima |
| Closed | Closed | ENCERRADA | Direta nos três |

Nenhuma das três divergências marcadas em negrito é resolvida por este documento — são registradas, com a mesma ressalva já usada em `project-skill-governance/references/STATE_MACHINE.md`: até uma decisão explícita do Product Owner, cada esquema continua válido no seu próprio escopo (8 estados para sprint de código do ERP; 10 estados para missão do AI Operating System em sentido amplo, incluindo arquitetura pura).

---

Precedência: em caso de conflito entre este documento e `PROJECT_GOVERNANCE.md`/`AI_PROMPT_ORCHESTRATOR.md` quanto a estados de sprint de código do ERP, prevalece `sprint-governance` (8 estados) — este documento cobre o escopo mais amplo de missão do AI Operating System, não substitui o esquema já em produção para sprints de código.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
