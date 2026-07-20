# COMMUNICATION_MODEL.md — Modelo de Comunicação do AI Operating System

Parte da arquitetura do AI Operating System (Sprint G.5.3). Define como as 7 camadas de `LAYER_MODEL.md` trocam informação, contexto e artefatos entre si — não repete o conteúdo desse documento nem de `AI_OPERATING_SYSTEM.md`, apenas o modelo de comunicação propriamente dito. Economia de contexto (o que cada camada carrega e quando) é aprofundada em `CONTEXT_MODEL.md`, documento irmão — aqui só a regra de fluxo, não a de carga.

## 1. Fluxo de comunicação entre camadas

Comunicação direta só acontece entre camadas **adjacentes** na cadeia do `LAYER_MODEL.md`. Nenhuma camada "pula" outra:

- **Skills nunca invocam outras Skills diretamente.** Quem orquestra o carregamento de múltiplas Skills é sempre a sessão (hoje) ou o Sub-agent (G.5.4+) que as tem disponíveis — uma Skill só *referencia* outra em texto ("ver skill X"), nunca a invoca como chamada de função.
- **Um Sub-agent devolve resultado ao chamador, nunca a outro Sub-agent diretamente** — a menos que seja um subagent aninhado explicitamente autorizado pelo campo `tools: Agent(...)` do subagent pai (mecanismo oficial do Claude Code). Comunicação entre dois Sub-agents irmãos sempre passa pelo chamador comum.
- **Playbooks (quando existirem) orquestram Sub-agents e Skills, mas não são invocados por eles** — a direção de controle é sempre de cima para baixo na cadeia de camadas; nunca uma Skill ou Sub-agent dispara um Playbook.
- **Todas as camadas podem ler `CLAUDE.md`/`PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md` diretamente** — exceção deliberada à regra de adjacência, porque esses documentos são carregados sempre, não sob demanda (ver `CONTEXT_MODEL.md`).

## 2. Compartilhamento de contexto (o que cada camada vê por padrão)

| Camada | Vê da camada acima | Vê da camada abaixo |
|---|---|---|
| Meta-Skill | `CLAUDE.md` (sempre) | Conteúdo de uma Skill só quando lida explicitamente durante criação/validação |
| Skills | `CLAUDE.md` + descrição de outras Skills (sempre em contexto) | Nada por padrão — corpo de outra Skill só se referenciado e carregado |
| Sub-agents | Skills pré-carregadas via `skills:` (conteúdo integral, na inicialização) | Nada do ERP além do que a tarefa delegada fornece |
| Playbooks | Contratos + arquitetura de personas | Resultado resumido de cada Sub-agent que orquestra, nunca o transcript interno dele |

Regra central, já confirmada pela documentação oficial do Claude Code: um Sub-agent **não vê o histórico da conversa principal** — recebe apenas o prompt de delegação (a tarefa) e, se declarado, as Skills pré-carregadas. Isso é isolamento de contexto por padrão, não uma configuração opcional.

## 3. Transferência de artefatos

Artefato produzido em uma camada chega à camada seguinte sempre por um destes dois caminhos:

1. **Arquivo persistido** — ex.: `SPRINT_X.md` escrito pelo Orchestrator é lido pelo Executor; um `SKILL.md` novo é lido pela meta-skill antes de validação. Vale para qualquer artefato que precise sobreviver ao fim da sessão que o criou.
2. **Texto de retorno da ferramenta Agent** — quando um Sub-agent termina, seu resultado (não o histórico de chamadas de ferramenta) vira uma mensagem de texto que o chamador recebe. É assim que a maior parte da comunicação Sub-agent → chamador acontece — nenhum artefato intermediário obrigatório, a menos que a tarefa delegada explicitamente peça um arquivo.

Formato/nomenclatura de cada tipo de artefato: `contracts/artifact-contract.md` (documento irmão desta mesma sprint) — não repetido aqui.

## 4. Regras de isolamento

- Um Sub-agent nunca devolve o log bruto de chamadas de ferramenta como resultado — apenas o resumo relevante à tarefa delegada (mecanismo oficial: o chamador só recebe a mensagem final do subagent, não sua transcrição completa).
- Nenhuma camada abaixo de Contracts pode alterar um contrato para "passar" em uma validação — o contrato é imutável do ponto de vista de quem o consome.
- Comunicação entre camadas nunca inclui segredo/credencial — nenhuma camada desta arquitetura lida com `.env`/tokens; isso permanece fora do AI Operating System.
- Um Playbook nunca reimplementa a lógica de uma camada que orquestra — ele só encaminha e recebe artefatos, exatamente como já declarado em `LAYER_MODEL.md` (Camada 6, "Regras").

## 5. Economia de contexto neste modelo

Este modelo evita que uma camada pague o custo total de todas as camadas abaixo dela porque cada transferência (item 3) é **resumida antes de cruzar a fronteira de camada** — nunca o estado bruto completo. O aprofundamento de quando cada camada carrega o quê (e por quanto tempo permanece em contexto) é do `CONTEXT_MODEL.md`, não repetido aqui.

## 6. Exemplo real já em uso nesta sessão

Este modelo não é hipotético — já foi seguido durante as Sprints G.5.0 a G.5.2.1 desta mesma sessão: o Orchestrator (sessão principal) delegou a criação de cada Skill/documento a uma sessão fork paralela, e cada fork devolveu um resumo estruturado (Diagnóstico, Problemas encontrados, Melhorias aplicadas, Estrutura final, Arquivos criados/removidos, Ganho estimado) — nunca o transcript completo de suas chamadas de ferramenta. O Orchestrator consolidou os resumos sem nunca carregar o histórico bruto de nenhum fork. Esse é exatamente o padrão descrito nos itens 3 e 4 acima, já validado na prática antes mesmo deste documento existir.

---

Precedência: em caso de conflito entre este documento e `AI_OPERATING_SYSTEM.md`, `LAYER_MODEL.md`, `PROJECT_GOVERNANCE.md` ou `CLAUDE.md` (raiz), o documento de maior hierarquia sempre prevalece.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
