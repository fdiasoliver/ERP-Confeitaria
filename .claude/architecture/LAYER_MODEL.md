# LAYER_MODEL.md — Modelo de Camadas do AI Operating System

Parte da arquitetura do AI Operating System (Sprint G.5.3; Camada 5 "Operational Protocols" inserida na Sprint G.5.5). Documenta oficialmente as 8 camadas do sistema — não repete o conteúdo de nenhuma Skill nem da meta-skill, apenas define o contrato de cada camada e como elas se encadeiam. Fonte de verdade desta cadeia: `AI_OPERATING_SYSTEM.md` item 4 (Hierarquia).

## As 8 camadas

```
CLAUDE.md (raiz)
        ↓
Meta-Skill (project-skill-governance)
        ↓
Skills (.claude/skills/*)
        ↓
Contracts (.claude/contracts/*)
        ↓
Operational Protocols (.claude/protocols/* — Sprint G.5.5+)
        ↓
Sub-agents (.claude/agents/* — Sprint G.5.4+, implementados)
        ↓
Playbooks (.claude/playbooks/* — Sprint G.5.6)
        ↓
ERP (src/, prisma/)
```

Cada camada só se comunica com a camada imediatamente adjacente por padrão (ver `COMMUNICATION_MODEL.md` para as exceções documentadas — ex. qualquer camada pode ler `CLAUDE.md`/`PROJECT_GOVERNANCE.md` diretamente, pois são carregados sempre, não sob demanda).

**Definição oficial de distinção (Sprint G.5.5):** Contracts definem **interfaces** (formato/estrutura obrigatórios, verificáveis). Operational Protocols definem **comportamentos** (como as camadas colaboram durante uma missão — sequência, eventos, critérios de transição). Sub-agents **executam** comportamentos. Playbooks **orquestram** comportamentos (compõem múltiplos Protocols/Sub-agents). Skills **fornecem conhecimento** (o quê, não o como colaborar). Nenhuma das cinco se sobrepõe às demais — um Contract nunca descreve sequência/tempo; um Protocol nunca define o formato de um artefato (isso é `artifact-contract.md`); uma Skill nunca descreve como dois Sub-agents se coordenam (isso é Protocol).

---

## Camada 1 — CLAUDE.md (raiz)

| Campo | Valor |
|---|---|
| Objetivo | Documentação permanente do ERP: stack, arquitetura de pastas, convenções, fluxo de sprint. Carregado em toda sessão, sem exceção. |
| Responsabilidade | Ser a fonte de contexto de projeto que nenhuma sessão de IA deveria ter que redescobrir. |
| Entradas | Nenhuma — é o ponto de partida de toda sessão. |
| Saídas | Contexto de projeto para todas as camadas abaixo. |
| Dependências | Nenhuma dentro do AI Operating System — depende apenas de `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md`/ADRs, que estão fora desta pilha de camadas (são governança do ERP, não do AI OS). |
| Consumidores | Todas as demais 6 camadas. |
| Produtores | Mantido manualmente pelo Product Owner/Orchestrator, atualizado quando a Etapa 4 (Documentação) de uma sprint o exige. |
| Limites | Nunca contém procedimento de Skill nem decisão de sprint específica — só fato permanente do projeto. |
| Regras | Sempre carregado; nunca invocado sob demanda (distinto de Skill). |

## Camada 2 — Meta-Skill (`project-skill-governance`)

| Campo | Valor |
|---|---|
| Objetivo | Governar a coerência entre as Skills (dependências, responsabilidades, conflitos, formato). |
| Responsabilidade | Ponto de checagem obrigatório antes de criar/alterar qualquer Skill. Nunca implementa, documenta ou audita o ERP. |
| Entradas | Uma Skill nova proposta, ou suspeita de conflito entre Skills. |
| Saídas | Validação passa/falha; posição no mapa de dependências. |
| Dependências | `CLAUDE.md` (raiz) + `.claude/CLAUDE.md`. |
| Consumidores | Toda sessão que cria/altera uma Skill; a partir da G.5.4, todo Sub-agent que precisar entender a coerência entre Skills antes de compor um Playbook. |
| Produtores | Sessões de IA executando sprints de governança de Skill (ex. G.5.0-G.5.2). |
| Limites | Nunca decide o conteúdo de negócio de uma sprint do ERP; nunca decide arquitetura acima do nível de Skill (isso é escopo desta camada de `architecture/`, adicionada na G.5.3). |
| Regras | Único ponto de verdade para "esta Skill nova sobrepõe outra existente?". |

## Camada 3 — Skills (`.claude/skills/*`)

| Campo | Valor |
|---|---|
| Objetivo | Conhecimento e procedimento carregado sob demanda para uma tarefa específica (camada de código, processo de sprint, governança documental). |
| Responsabilidade | Cada Skill cobre exatamente um domínio, sem sobreposição não resolvida com outra (garantido pela Camada 2). |
| Entradas | Uma tarefa que corresponde à `description` da Skill. |
| Saídas | Orientação aplicada à tarefa; nenhuma Skill de camada de código produz artefato de documento próprio. |
| Dependências | Outras Skills (mapeadas em `project-skill-governance/references/SKILL_DEPENDENCIES.md`), `CLAUDE.md` (raiz), `PROJECT_GOVERNANCE.md`. |
| Consumidores | Sessão de IA atual (hoje); Sub-agents via `skills:` no frontmatter (a partir da G.5.4). |
| Produtores | Sessões de IA seguindo `project-skill-governance/references/skill-format.md` e `SKILL_TEMPLATE.md`. |
| Limites | `SKILL.md` não deveria passar de 500 linhas (ver `CONTEXT_MODEL.md`); nunca duplica mais de 30% de outra Skill. |
| Regras | Arquivo de entrada sempre `SKILL.md` (maiúsculo) — exigência funcional do Claude Code, não estilo. |

## Camada 4 — Contracts (`.claude/contracts/*`)

**Camada nova, criada nesta sprint (G.5.3).** Formaliza o que antes só existia como convenção em prosa dentro de cada Skill.

| Campo | Valor |
|---|---|
| Objetivo | Definir o padrão estrutural obrigatório que Sub-agents, Skills, artefatos, comunicação e delegação devem seguir — de forma verificável, não apenas descritiva. |
| Responsabilidade | Ser a referência única de "como isto deve ser formatado/estruturado", para que múltiplos autores (sessões, e futuramente Sub-agents) produzam artefatos compatíveis entre si sem coordenação direta. |
| Entradas | Um novo Sub-agent, Skill, artefato, mensagem de delegação ou handoff de comunicação sendo criado. |
| Saídas | Conformidade/não conformidade contra o contrato aplicável. |
| Dependências | `LAYER_MODEL.md` (esta), `RESPONSIBILITY_MATRIX.md`, `ARTIFACT_MODEL.md`, `COMMUNICATION_MODEL.md`, `DELEGATION_MODEL.md` — cada contrato deriva do modelo correspondente, nunca o contrário. |
| Consumidores | Sub-agents (a partir da G.5.4) e sessões de IA criando Skills/artefatos/mensagens. |
| Produtores | Esta sprint (G.5.3) cria os 5 contratos iniciais; sprints futuras podem adicionar novos contratos, nunca contrariar os existentes sem ADR. |
| Limites | Um contrato nunca decide conteúdo de negócio — só estrutura/formato. |
| Regras | Todo contrato referencia o modelo (`*_MODEL.md`) do qual deriva — nunca duplica a explicação conceitual, só a checklist operacional. |

## Camada 5 — Operational Protocols (`.claude/protocols/*`)

**Camada nova, criada na Sprint G.5.5.** Formaliza comportamentos de colaboração que antes só existiam como padrão implícito, repetido em prosa em várias Skills/Contracts/Sub-agents (ex. o formato de retorno de fork, o critério de escalonamento) sem um dono único.

| Campo | Valor |
|---|---|
| Objetivo | Definir COMO as camadas (em especial os Sub-agents) colaboram durante uma missão — sequência, eventos de início/término, critérios de sucesso/interrupção/retorno — de forma reutilizável entre missões distintas. |
| Responsabilidade | Ser a referência única de comportamento operacional. Nunca define quem faz o quê (isso é `RESPONSIBILITY_MATRIX.md`/personas), nunca define formato de artefato (isso é `contracts/artifact-contract.md`), nunca fornece conhecimento de domínio (isso é Skill). |
| Entradas | Um evento operacional (início de missão, necessidade de delegar, necessidade de validar, etc.) que corresponde ao escopo de um Protocol específico. |
| Saídas | Comportamento executado conforme o fluxo operacional do Protocol; nenhum Protocol produz artefato de código. |
| Dependências | `DELEGATION_MODEL.md`, `COMMUNICATION_MODEL.md`, `CONTEXT_MODEL.md`, `ARTIFACT_MODEL.md` (cada Protocol deriva do(s) `*_MODEL.md` correspondente(s), mesma relação que Contracts têm com os Models — nunca o contrário). |
| Consumidores | Sub-agents (executam o comportamento) e Playbooks (compõem múltiplos Protocols em sequência). |
| Produtores | Sprint G.5.5 cria os 10 Protocols iniciais; sprints futuras podem adicionar novos, nunca contrariar os existentes sem ADR. |
| Limites | Um Protocol nunca decide conteúdo de negócio nem redefine um Contract/Sub-agent já existente. |
| Regras | Todo `.claude/protocols/{nome}/PROTOCOL.md` segue a estrutura fixa de 10 seções definida em `protocols/README.md` — mesma disciplina de uniformidade já aplicada aos 9 Sub-agents na G.5.4. |

## Camada 6 — Sub-agents (`.claude/agents/*`)

**Implementados na Sprint G.5.4** (9 Sub-agents reais em `.claude/agents/*.md`); 10º Sub-agent (`product-reviewer`) adicionado na Sprint G.6 (Product Review System); 11º Sub-agent (`platform-reviewer`) adicionado na Sprint G.6.1 (Platform & Product Architecture Consolidation) — ambos seguindo o mesmo padrão já estabelecido, sem alterar esta camada estruturalmente.

| Campo | Valor |
|---|---|
| Objetivo | Executar uma tarefa especializada em contexto isolado, com prompt de sistema, ferramentas e Skills pré-carregadas próprias. |
| Responsabilidade | Cumprir exatamente o papel definido pela sua persona (ver `architecture/agents/personas/*.md`) e pelo `contracts/agent-contract.md`, executando os Operational Protocols aplicáveis (Camada 5) durante a missão. |
| Entradas | Uma delegação da sessão principal ou de outro Sub-agent autorizado (ver `DELEGATION_MODEL.md` e `protocols/delegation/PROTOCOL.md`). |
| Saídas | Um resultado resumido devolvido ao chamador — nunca o histórico completo de ferramentas usadas (ver `CONTEXT_MODEL.md` e `protocols/communication/PROTOCOL.md`). |
| Dependências | Skills pré-carregadas (via `skills:`), `contracts/agent-contract.md`, Operational Protocols aplicáveis, `LAYER_MODEL.md`. |
| Consumidores | Playbooks (Sprint G.5.6) e a sessão principal. |
| Produtores | Sprint G.5.4 (implementação, concluída). |
| Limites | Nunca contraria `agent-contract.md` nem os Operational Protocols que executa. |
| Regras | Todo Sub-agent real (`.claude/agents/{nome}.md`) satisfaz `agent-contract.md` — critério já verificado na G.5.4. |

## Camada 7 — Playbooks (`.claude/playbooks/*`)

**Arquitetura definida na Sprint G.5.3 (`PLAYBOOK_ARCHITECTURE.md`); implementação agendada para a Sprint G.5.6.**

| Campo | Valor |
|---|---|
| Objetivo | Procedimento reutilizável de ponta a ponta que compõe múltiplos Operational Protocols e Sub-agents para cumprir uma missão recorrente (ex. "adicionar um módulo CRUD completo: schema → repository → service → api → front-end"). |
| Responsabilidade | Orquestrar, nunca reimplementar — um Playbook nunca contém a regra de negócio de uma camada, nem redefine um Protocol/Contract, apenas a sequência e os critérios de transição entre Sub-agents. |
| Entradas | Uma missão que corresponde a um padrão já resolvido antes (não uma tarefa única). |
| Saídas | O conjunto de artefatos que a missão completa produz, mais um relatório consolidado. |
| Dependências | Sub-agents (Camada 6), Operational Protocols (Camada 5), Skills (Camada 3), Contracts (Camada 4). |
| Consumidores | Product Owner/Orchestrator (para disparar) e o próprio ciclo de sprint. |
| Produtores | Sprint G.5.6 (agendada, ainda não implementada). |
| Limites | Nunca implementado antes da Sprint G.5.6. |
| Regras | Ver `PLAYBOOK_ARCHITECTURE.md` para conceito completo, ciclo de vida e integração. |

## Camada 8 — ERP (`src/`, `prisma/`)

| Campo | Valor |
|---|---|
| Objetivo | O produto real — Doce Menina, o sistema de gestão de encomendas. |
| Responsabilidade | Nenhuma responsabilidade de processo de IA — é o alvo, não um participante da pilha de governança. |
| Entradas | Código produzido/revisado seguindo Skills de camada (`architecture`, `api-pattern`, `repository-pattern`, `frontend-pattern`, `schema-pattern`, `coding-standards`). |
| Saídas | O produto funcionando (build, testes, deploy). |
| Dependências | Todas as camadas acima, indiretamente, através do processo que produziu o código. |
| Consumidores | Usuário final do sistema (cliente da confeitaria, equipe interna). |
| Produtores | Sessões de implementação seguindo as Skills de camada. |
| Limites | Nenhuma camada de IA acima decide o produto — decisões de produto vêm de `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md`/Product Owner. |
| Regras | Esta sprint (G.5.3) e a G.5.4 nunca tocam esta camada diretamente — é a única regra absoluta reafirmada em toda ordem de missão desta série. |

---

Precedência: em caso de conflito entre este documento e `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, qualquer ADR ou `CLAUDE.md` (raiz), o documento original sempre prevalece.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). v2.0 em 15/07/2026 — Sprint G.5.5: inserida Camada 5 "Operational Protocols" entre Contracts e Sub-agents; renumeradas Sub-agents (5→6), Playbooks (6→7), ERP (7→8); Sub-agents atualizados de "não implementado" para "implementado na G.5.4". v2.1 em 15/07/2026 — Sprint G.6: Camada 6 (Sub-agents) nota o 10º Sub-agent (`product-reviewer`), sem alterar a estrutura de 8 camadas. v2.2 em 15/07/2026 — Sprint G.6.1: Camada 6 nota o 11º Sub-agent (`platform-reviewer`), sem alterar a estrutura de 8 camadas. -->
