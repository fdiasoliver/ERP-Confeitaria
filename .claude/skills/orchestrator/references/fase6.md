# FASE 6 — Evolução da Governança (detalhamento)

Parte da Skill `orchestrator`. Carregar apenas quando uma sprint acabou de ser auditada (estado AUDITADA) e é preciso avaliar se ela gera governança permanente.

## Quando FASE 6 precisa produzir algo (critério objetivo)

`PROJECT_GOVERNANCE.md` Seção 26 ("Política de Evolução da Governança") limita quando uma nova regra permanente pode nascer daqui — só quando pelo menos uma condição é verdadeira:

1. **Inconsistência arquitetural recorrente entre módulos** — o mesmo problema apareceu em mais de uma sprint/módulo, não é um caso isolado.
2. **Decisão de arquitetura aprovada por ADR** — a FASE 6 formaliza uma decisão já tomada, não decide sozinha.
3. **Lacuna identificada em auditoria que as regras existentes não resolvem** — `sprint-audit`/`engineering-reviewer` encontraram algo para o qual não há regra aplicável.

Se nenhuma das três se aplica, FASE 6 é um passo vazio nesta sprint (registrar "nenhuma melhoria de governança identificada" e seguir para o Encerramento) — **não force uma regra nova para justificar a etapa**. `PROJECT_GOVERNANCE.md` Seção 26 é explícita: "não devem ser adicionadas regras para resolver casos isolados de uma única sprint" e "sempre que possível, novas regras devem generalizar um padrão reutilizável para todo o projeto".

## Ciclo real já observado neste projeto

A proibição de sub-sprints (`2.D.2.1`, `2.D.2.2`) nasceu exatamente deste caminho: identificada como Melhoria Futura durante uma auditoria (condição 3 acima — lacuna que a governança da época não cobria), não implementada na hora, e só formalizada depois em `PROJECT_GOVERNANCE.md`/`AI_PROMPT_ORCHESTRATOR.md` nas Sprints G.1/G.2 — sprints de FASE 6 dedicadas, separadas da sprint de código que originou a observação. Esse é o padrão a seguir: FASE 6 raramente altera governança na mesma sprint em que a lacuna foi vista; ela normalmente **acumula candidatos** (registrados como Melhoria Futura, ver skill `sprint-audit`) até que uma sprint de governança dedicada os processe.

## Checklist de FASE 6

- [ ] As 6 perguntas de avaliação (padrões repetitivos → prevenção de retrabalho, ver `SKILL.md` item 4.6) foram percorridas, mesmo que a resposta seja "nenhuma".
- [ ] Toda Melhoria Futura vinda de `sprint-audit`/`engineering-reviewer` desta sprint foi considerada como candidata.
- [ ] Se uma regra nova está sendo proposta, ela se encaixa em pelo menos uma das 3 condições da Seção 26 — não é caso isolado.
- [ ] Se nenhuma condição se aplica, isso foi registrado explicitamente (não omitido silenciosamente) e a sprint segue para o Encerramento sem alteração de governança.
- [ ] Qualquer alteração real de `PROJECT_GOVERNANCE.md`/`AI_PROMPT_ORCHESTRATOR.md` teve aprovação explícita do Product Owner — nunca decidida sozinha pelo Orchestrator.
