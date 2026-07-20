# AI Operating System — Doce Menina (confeitaria-app)

Documento raiz da arquitetura do AI Operating System deste projeto. Produzido na Sprint G.5.3, sobre a infraestrutura de Skills certificada (com ressalva pontual, já corrigida) na Sprint G.5.2.1. Este documento define visão, filosofia, princípios, hierarquia e o mapa dos demais documentos — não repete o conteúdo detalhado de nenhum deles.

---

## 1. Visão geral

O AI Operating System é a camada de processo e conhecimento que permite a múltiplas sessões de IA (hoje: uma única sessão executando papéis distintos; a partir da Sprint G.5.4: Sub-agents especializados) trabalhar no projeto Doce Menina de forma consistente, sem redescobrir convenções a cada sessão e sem depender da memória de uma conversa específica.

Ele não é o ERP. Não é código. É a infraestrutura que **governa como o código do ERP é produzido, revisado e documentado por IA**.

## 2. Filosofia

- **Conhecimento carrega sob demanda, não por padrão.** Herdada de `CLAUDE.md` (raiz) e formalizada em `.claude/CLAUDE.md`: `CLAUDE.md` é sempre carregado; Skills carregam quando invocadas; Sub-agents carregam Skills pré-selecionadas na inicialização. Nenhuma camada deveria forçar tudo em contexto o tempo todo — ver `CONTEXT_MODEL.md`.
- **Referenciar, nunca duplicar.** A mesma regra usada em toda Skill deste projeto (`.claude/CLAUDE.md`) se aplica aqui: cada documento desta arquitetura aponta para a fonte, não copia.
- **Sinalizar, não resolver sozinho.** Toda ambiguidade real encontrada durante esta sprint foi registrada explicitamente (ver decisões arquiteturais no relatório final da sprint), nunca decidida em silêncio.
- **Documentar antes de implementar.** Esta sprint (G.5.3) só produz arquitetura — nenhum Sub-agent, nenhum Playbook, nenhum código. A implementação (G.5.4) parte de uma arquitetura já fechada, não a redefine.
- **Correção pertence a quem encontrou o problema, não a uma sprint nova.** Princípio já aplicado nesta sessão (Sprint G.5.2.1 → correção na própria G.5.3, sem criar G.5.2.2) — evita fragmentação infinita de sprints corretivas.

## 3. Objetivos

1. Permitir que dezenas de sprints futuras sejam executadas por IA sem redefinir arquitetura a cada vez.
2. Permitir que múltiplos Sub-agents (Sprint G.5.4+) operem em paralelo com responsabilidades e limites claros, sem sobreposição nem conflito.
3. Permitir que Playbooks (procedimentos reutilizáveis de ponta a ponta, ex. "adicionar um módulo CRUD completo") sejam compostos a partir de Skills, Contratos e Sub-agents já existentes, sem reinventar processo a cada vez.
4. Preservar economia de contexto em cada camada adicionada — nenhuma camada nova deveria aumentar o custo fixo de uma sessão comum.
5. Manter uma única fonte de verdade por assunto, com hierarquia de precedência explícita quando duas fontes parecem conflitar.

## 4. Hierarquia

```
PROJECT_GOVERNANCE.md  (governança do ERP, mais alta precedência)
        ↓
REGRAS_NEGOCIO.md
        ↓
ADR (decisões arquiteturais congeladas, ex. ADR-005)
        ↓
AI_PROMPT_ORCHESTRATOR.md  (papéis e fluxo operacional tool-agnostic)
        ↓
CLAUDE.md (raiz)  (documentação permanente do ERP)
        ↓
.claude/CLAUDE.md  (princípios da infraestrutura de IA)
        ↓
project-skill-governance (meta-skill)  (governa as Skills)
        ↓
AI_OPERATING_SYSTEM.md + demais documentos de .claude/architecture/  (este nível — arquitetura do AI OS)
        ↓
.claude/contracts/*  (contratos formais — interfaces)
        ↓
Skills (.claude/skills/*)
        ↓
.claude/protocols/*  (Operational Protocols — comportamentos, Sprint G.5.5)
        ↓
Sub-agents (.claude/agents/* — implementados na Sprint G.5.4)
        ↓
Playbooks (.claude/playbooks/* — Sprint G.5.6)
        ↓
ERP (src/, prisma/)
```

Nenhum nível pode contrariar um nível acima. Regras de desempate completas: `project-skill-governance/references/CONFLICT_RESOLUTION.md` — este documento não as repete, apenas insere `AI_OPERATING_SYSTEM.md`/`architecture/`/`contracts/`/`agents/`/`playbooks/` na posição correta da cadeia já existente.

## 5. Responsabilidades desta camada (arquitetura do AI OS)

- Definir o modelo de camadas, fluxo de execução, estados, matriz de responsabilidades, modelo de comunicação, delegação, contexto e artefatos — cada um em seu próprio documento (ver item 8).
- Definir os contratos formais que Skills, futuros Sub-agents, artefatos, comunicação e delegação devem seguir.
- Definir a arquitetura (não a implementação) dos Sub-agents e dos Playbooks.

## 6. Limites (o que esta camada nunca faz)

- Nunca implementa Sub-agents (`.claude/agents/*.md` reais) ou Playbooks executáveis — isso é escopo de sprints futuras (G.5.4+).
- Nunca altera código do ERP (`src/`, `prisma/`).
- Nunca decide conteúdo de negócio do ERP — isso continua em `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md`.
- Nunca substitui a meta-skill `project-skill-governance` — a meta-skill continua sendo a única fonte de verdade sobre a coerência **entre Skills**; esta camada arquitetural é uma nova camada **acima** de Skills, não uma substituta.

## 7. Ciclo de vida do AI Operating System

```
Sprint G.5.0/G.5.1  →  Infraestrutura de Skills + Meta-Skill criadas
Sprint G.5.2         →  Skills refatoradas para o padrão oficial do Claude Code
Sprint G.5.2.1        →  Certificação (auditoria, sem correção)
Sprint G.5.3           →  Arquitetura completa do AI Operating System (este documento e os demais, 7 camadas)
Sprint G.5.4            →  Sub-agents implementados (9 arquivos reais em .claude/agents/), a partir da arquitetura, sem redefini-la
Sprint G.5.5            →  Camada Operational Protocols inserida (.claude/protocols/, 10 protocolos) — 8 camadas
Sprint G.5.6            →  Playbooks implementados (.claude/playbooks/, 10 playbooks), compondo Skills + Contratos + Protocols + Sub-agents
Sprint G.5.7            →  Certificação, correções e Baseline v1.0 — congelamento da infraestrutura
Sprint G.6              →  Product Review System — 10º Sub-agent (product-reviewer), Skill product-review, Contract e Playbook dedicados, evolução de infraestrutura em modo de manutenção (PROJECT_GOVERNANCE.md Seção 13.7), ADR registrado em CLAUDE.md raiz
Sprint G.6.1 (esta)     →  Platform & Product Architecture Consolidation — 11º Sub-agent (platform-reviewer), Skill platform-review, Contract dedicado, ERP_PRODUCT_VISION.md + PLATFORM_OVERVIEW.md criados. Encerra oficialmente a fase de evolução arquitetural do projeto — próximos trabalhos priorizam exclusivamente módulos de negócio
```

Este documento e os demais desta pasta são o **ponto de não-retorno arquitetural**: a partir daqui, mudar o modelo de camadas, o fluxo de execução ou os contratos é uma decisão de arquitetura nova, não um ajuste de sprint de implementação.

## 8. Mapa dos documentos desta arquitetura

| Documento | Cobre |
|---|---|
| `BASELINE_V1.md` | Certificação e congelamento oficial (Sprint G.5.7) — escopo, componentes, limitações, premissas, critérios de evolução |
| `LAYER_MODEL.md` | As 8 camadas do sistema, uma por uma: objetivo, responsabilidade, entradas/saídas, dependências, consumidores/produtores, limites, regras |
| `ARCHITECTURE_OVERVIEW.md` | Visão consolidada de como as camadas se conectam na prática, com exemplo real ponta a ponta |
| `EXECUTION_FLOW.md` | O fluxo oficial de uma missão, do Backlog ao Closed |
| `STATE_MACHINE.md` | Os 10 estados oficiais do AI Operating System (distinto dos 8 estados de `sprint-governance` — reconciliação tratada explicitamente lá) |
| `RESPONSIBILITY_MATRIX.md` | Quem planeja/executa/documenta/audita/valida/entrega/coordena/revisa, nesta camada (distinto de `SKILL_MATRIX.md`, que cobre as Skills) |
| `COMMUNICATION_MODEL.md` | Como camadas/agentes trocam informação, contexto e artefatos |
| `DELEGATION_MODEL.md` | Quem pode delegar, quando, e os critérios de retorno/escalonamento/interrupção |
| `CONTEXT_MODEL.md` | O que cada camada carrega em contexto e quando |
| `ARTIFACT_MODEL.md` | Como um artefato nasce, é validado e é entregue nesta camada (distinto do catálogo de nomes, que é `contracts/artifact-contract.md`) |
| `../protocols/` (README.md + 10 `{nome}/PROTOCOL.md`) | Operational Protocols — comportamentos de colaboração entre Sub-agents durante uma missão (Sprint G.5.5) |
| `agents/AGENT_ARCHITECTURE.md` + `agents/personas/*.md` | Arquitetura de cada persona de Sub-agent (implementadas como Sub-agents reais em `.claude/agents/*.md` na Sprint G.5.4) |
| `../playbooks/PLAYBOOK_ARCHITECTURE.md` | O que é um Playbook neste projeto e como ele se integra às demais camadas |
| `../contracts/*.md` | Os 5 contratos formais (agent, skill, artifact, communication, delegation) |

## 9. Integração entre componentes (resumo)

Uma Skill hoje já é consumida diretamente por uma sessão de IA. A partir da Sprint G.5.4, um Sub-agent pré-carrega um conjunto de Skills (via `skills:` no seu frontmatter oficial do Claude Code) definido pelo seu contrato (`contracts/agent-contract.md`) e pela sua arquitetura de persona (`architecture/agents/personas/*.md`). Um Playbook, quando existir, orquestra múltiplos Sub-agents e Skills em sequência, seguindo o `DELEGATION_MODEL.md` e produzindo artefatos conforme `ARTIFACT_MODEL.md`. Fluxo completo, com diagrama: `EXECUTION_FLOW.md`.

## 10. Decisão arquitetural registrada nesta sprint

**`.claude/agents/` é um caminho reservado pelo mecanismo oficial do Claude Code** (qualquer `.md` ali com frontmatter `name`/`description` é descoberto e se torna um Sub-agent real e invocável). Como esta sprint proíbe explicitamente implementar Sub-agents, a arquitetura de cada persona foi documentada em `.claude/architecture/agents/` — fora do caminho reservado — em vez de `.claude/agents/`, evitando criar Sub-agents funcionais por acidente. Divergência da estrutura literal pedida pela ordem de missão, tecnicamente necessária e não uma escolha de estilo.

---

Precedência: em caso de conflito entre este documento e `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, qualquer ADR, `AI_PROMPT_ORCHESTRATOR.md` ou `CLAUDE.md` (raiz), o documento original sempre prevalece (ver item 4, Hierarquia).

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). v1.1 em 15/07/2026 — Sprint G.5.5: inserida a camada Operational Protocols (.claude/protocols/) na hierarquia (item 4) e no mapa de documentos (item 8), entre Contracts/Skills e Sub-agents; Sub-agents atualizados para "implementados" (G.5.4 concluída). v1.2 em 15/07/2026 — Sprint G.6: item 7 (Ciclo de vida) recebeu a linha do Product Review System — 10º Sub-agent, sem alterar o modelo de 8 camadas nem a hierarquia do item 4. v1.3 em 15/07/2026 — Sprint G.6.1: item 7 recebeu a linha do Platform & Product Architecture Consolidation — 11º Sub-agent, sem alterar o modelo de 8 camadas. Esta é a última evolução arquitetural prevista antes do retorno exclusivo ao desenvolvimento funcional. -->
