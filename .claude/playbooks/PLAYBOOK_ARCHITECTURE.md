# PLAYBOOK_ARCHITECTURE.md — Arquitetura de Playbooks

Parte da arquitetura do AI Operating System (Sprint G.5.3, Camada 6 — `architecture/LAYER_MODEL.md`). Define o conceito e a arquitetura de Playbook — **nenhum Playbook real é criado por este documento**, nem nesta sprint, nem na Sprint G.5.4. Não repete o conteúdo de `EXECUTION_FLOW.md`, `contracts/agent-contract.md` ou `contracts/delegation-contract.md` — referencia e opera sobre eles.

## 1. Conceito

Um Playbook é um procedimento reutilizável de ponta a ponta que compõe múltiplos Sub-agents e Skills para cumprir uma **missão recorrente** — um padrão que já se repetiu, não uma tarefa única. Um Playbook nunca reimplementa uma regra de negócio já coberta por uma Skill: ele orquestra sequência, critérios de transição entre etapas e o conjunto de artefatos esperado ao final. Se um Playbook precisa "saber" uma regra de negócio, é sinal de que essa regra deveria estar em uma Skill sendo referenciada, não escrita dentro do Playbook.

## 2. Responsabilidades

- Definir a **ordem de delegação** entre personas de Sub-agent (ver `architecture/agents/AGENT_ARCHITECTURE.md` e `architecture/agents/personas/*.md`, escritos em paralelo nesta mesma sprint — este documento não define conteúdo de persona, apenas assume que o catálogo existe).
- Definir os **critérios de transição** entre etapas — quando a etapa N está pronta para a etapa N+1 delegar.
- Definir os **artefatos esperados ao final** da execução completa do Playbook.

## 3. Integração com Skills

Um Playbook **nunca acessa uma Skill diretamente**. Ele delega para um Sub-agent que já tem a Skill pré-carregada (via `skills:`, ver `contracts/agent-contract.md` item 2) — a mesma regra de comunicação por camada adjacente de `architecture/LAYER_MODEL.md`. Um Playbook que tentasse "invocar uma Skill" pularia a Camada 5 (Sub-agents), violando o modelo de camadas.

## 4. Integração com Contracts

Todo Playbook deve:
- Produzir artefatos conformes a `contracts/artifact-contract.md` (nome canônico, formato, local).
- Delegar conforme `contracts/delegation-contract.md` (escopo declarado, critério de conclusão, formato de retorno).

Este documento não repete esses dois contratos — apenas declara a obrigação de conformidade.

## 5. Integração com Sub-agents

Um Playbook **não é ele mesmo um Sub-agent** — é um roteiro que uma persona coordenadora (ex. um futuro `AI Project Manager`, ver `architecture/agents/personas/ai-project-manager.md`) segue, delegando em sequência conforme `contracts/agent-contract.md` item 6 (Critérios de delegação). Na prática, um Playbook é uma sequência pré-definida de delegações, cada uma já resolvida de antemão — é isso que o torna reutilizável em vez de uma missão planejada do zero a cada vez.

## 6. Ciclo de vida de um Playbook

```
Rascunhado → Formalizado → Versionado → Descontinuado
```

- **Rascunhado**: um padrão de missão se repetiu 2 ou mais vezes de forma reconhecível (mesmo critério, em espírito, de quando uma regra vira Melhoria Futura candidata a regra oficial — ver `orchestrator/references/fase6.md`).
- **Formalizado**: documentado como Playbook, com etapas e critérios objetivos de transição — só então pode ser disparado por nome.
- **Versionado**: mudanças no Playbook são rastreadas (mesmo princípio de versionamento já usado nas Skills, `project-skill-governance/references/skill-format.md`).
- **Descontinuado**: o padrão deixou de ser útil (ex. módulo do ERP que o Playbook automatizava não é mais construído dessa forma) — o Playbook é marcado como descontinuado, não apenas apagado silenciosamente.

## 7. Fluxo

Um Playbook segue o mesmo `EXECUTION_FLOW.md` desta sprint (Nova Missão → Planejamento → Arquitetura → Implementação → Autoauditoria → Correções → Validações → Documentação → Relatório Executivo → Encerramento), com uma diferença estrutural: as etapas **Planejamento** e **Arquitetura** já vêm pré-resolvidas pelo próprio Playbook no momento em que ele foi Formalizado (item 6). É exatamente isso que torna um Playbook reutilizável — uma missão que usa um Playbook já formalizado não precisa redescobrir escopo nem arquitetura, só executar a sequência.

## 8. Exemplo ilustrativo (não é um Playbook real — nenhum arquivo criado a partir disto)

**"Playbook: Adicionar Módulo CRUD Completo"** — sequência hipotética de delegação:

```
AI Solution Architect   → decide schema (Prisma) e contratos de API
        ↓
AI Backend Engineer     → schema-pattern + repository-pattern + api-pattern
        ↓
AI Frontend Engineer    → frontend-pattern (página admin)
        ↓
AI QA Engineer          → validação (regressão, tsc/lint/build)
        ↓
AI Documentation Engineer → atualiza PLAN.md/CHANGELOG.md/docs afetados
        ↓
AI Release Manager      → encerramento, relatório final
```

Este exemplo serve apenas para ilustrar como a arquitetura acima se aplicaria — as personas citadas são as mesmas do catálogo de `architecture/agents/`, mas nenhuma delas, nem este Playbook, é implementada por esta sprint.

---

Precedência: em caso de conflito entre este documento e `AI_OPERATING_SYSTEM.md`, `LAYER_MODEL.md`, `EXECUTION_FLOW.md`, `contracts/agent-contract.md` ou `contracts/delegation-contract.md`, os documentos dos quais este deriva sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
