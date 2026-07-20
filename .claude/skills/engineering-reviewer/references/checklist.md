# checklist.md — Regressão, Riscos, Dívida Técnica e Relatório Final

Parte da Skill `engineering-reviewer`. Conteúdo de execução da revisão final de sprint — carregar apenas ao efetivamente conduzir a revisão, não para consultas rápidas sobre qual Skill cobre qual camada (isso fica em `SKILL.md`).

## Regressão

Fonte: `PROJECT_GOVERNANCE.md` Seção 17, bloco "QA de Regressão". Após **qualquer** sprint, independentemente do módulo tocado, confirmar que estas 5 funcionalidades-âncora continuam funcionando:

- `GET /api/config` retorna o JSON esperado.
- `GET /api/products` retorna produtos reais do banco.
- `POST /api/orders` cria pedido corretamente.
- `/admin/config` carrega e salva, exibindo toast de sucesso.
- `/` (vitrine) exibe produtos e o carrinho funciona.

Uma sprint que "não parece relacionada" a essas funcionalidades não está isenta desta checagem — regressão silenciosa é exatamente o tipo de problema que só aparece quando ninguém testa o que não mudou.

## Riscos

Fonte: `PROJECT_GOVERNANCE.md` Seção 14, tabela de priorização de dívida técnica — usada aqui como lente geral para qualquer achado da revisão, não só dívida técnica formal:

| Prioridade | Critério | Ação |
|---|---|---|
| Crítica | Bloqueia implementação ou causa bug em produção | Resolver antes da próxima sprint |
| Alta | Impede módulo futuro ou gera inconsistência de dados | Resolver no mesmo épico |
| Média | Gera retrabalho se não resolvida | Resolver antes do épico que depende dela |
| Baixa | Melhoria sem impacto imediato | Resolver em sprint de refatoração dedicada |

Regra de não acumulação: dívida crítica ou alta nunca é adiada além do épico corrente; nenhum módulo novo começa com dívida crítica não resolvida no módulo anterior.

## Dívida técnica

`KNOWN_ISSUES.md` é o registro formal — convenção de IDs sequenciais: `KI-N` (issues), `DT-N` (dívida técnica), `IC-N` (inconsistências). Exemplos reais já usados neste projeto: `IC-02`/`IC-07` (relacionamento sem `@relation`/`@@unique`, corrigidos na Sprint 2.A.1), `KI-17` (`PaymentStatus` divergente entre schema e `types.ts`). Cada entrada registra arquivo afetado, impacto e o que bloqueia (fonte: `PROJECT_GOVERNANCE.md` Seção 14, "Registro").

Toda dívida técnica identificada durante esta revisão final **deve** ser registrada em `KNOWN_ISSUES.md` — nunca deixada apenas mencionada em um relatório de sprint e esquecida depois.

## Checklist final

Antes de aprovar uma sprint, confirmar que:

- [ ] Todas as revisões de `SKILL.md` (camadas, código, documentação, governança, PLAN, CHANGELOG, escopo) foram percorridas — não apenas as que pareciam relevantes para esta sprint específica.
- [ ] Nenhuma skill de camada relevante foi pulada.
- [ ] `PLAN.md` e `CHANGELOG.md` verificados por técnica objetiva (skill `sprint-audit`), não só lidos.
- [ ] As 5 funcionalidades-âncora de regressão confirmadas (ver acima).
- [ ] Toda dívida técnica nova identificada foi registrada em `KNOWN_ISSUES.md`, não só mencionada.

## Critérios de aprovação

Árvore de decisão completa (APROVADO / NECESSITA CORREÇÃO / BLOQUEADO): skill `sprint-audit` — não repetida aqui. Lembrete específico desta Skill: Regressão, Riscos e Dívida técnica (acima) também alimentam essa decisão — uma sprint pode não ter Inconsistência de código e ainda assim não estar apta se quebrou uma funcionalidade-âncora ou deixou dívida crítica não registrada.

## Relatório final obrigatório

Toda revisão crítica conduzida com esta Skill produz obrigatoriamente, nesta ordem:

1. **Relatório Executivo** — linguagem não técnica: o que foi revisado, veredito final.
2. **Relatório Técnico** — detalhamento de cada revisão do `SKILL.md` item 4, com achados específicos (não genéricos).
3. **Inconsistências** — lista, ou "Nenhuma". Cada achado classificado pelo teste de duas perguntas (skill `sprint-audit`).
4. **Observações Técnicas** — lista, ou "Nenhuma". Formato fato + causa raiz + por que não é violação (skill `sprint-audit`).
5. **Melhorias Futuras** — lista, ou "Nenhuma". Registradas de forma reaproveitável para uma futura FASE 6 — o ciclo real da proibição de sub-sprints (skill `sprint-audit`) é o modelo: uma Melhoria Futura bem escrita hoje pode virar regra oficial amanhã.
6. **Prompt sugerido para a próxima Sprint** — rascunho do próximo `SPRINT_X.md` (ao menos Objetivo + Escopo + Dependências), preparando a FASE 0 do Orchestrator (skill `orchestrator`; passo 9 do Fluxo Oficial de Auditoria, skills `sprint-audit`/`sprint-governance`).

Nunca declarar uma sprint pronta para auditoria sem produzir os 6 blocos acima.
