# CONTEXT_MODEL.md — Modelo de Contexto do AI Operating System

Parte da arquitetura do AI Operating System (Sprint G.5.3). Define o que cada uma das 7 camadas do `LAYER_MODEL.md` carrega em contexto e quando — não repete o conteúdo de cada camada (isso é `LAYER_MODEL.md`), só a dimensão de custo/momento de carregamento. Fonte dos mecanismos oficiais citados: [documentação de Skills](https://code.claude.com/docs/pt/skills) e [Sub-agents](https://code.claude.com/docs/pt/sub-agents) do Claude Code.

## Por camada

| Camada | O que entra em contexto | Quando |
|---|---|---|
| 1. `CLAUDE.md` (raiz) | Conteúdo integral | Sempre, em toda sessão — carregamento fixo, não sob demanda. |
| 2. Meta-Skill (`project-skill-governance`) | `description` (listagem de skills disponíveis) | Sempre, junto com a listagem de todas as Skills. Corpo completo (`SKILL.md` + `references/*`) só quando invocada — ex. ao criar/revisar uma Skill nova. |
| 3. Skills | `description` + `when_to_use` de cada Skill (juntos, truncados em 1.536 caracteres na listagem — limite oficial) | Sempre, para todas as Skills disponíveis (é o que permite ao Claude decidir qual invocar). Corpo completo de uma Skill específica só quando ela é de fato invocada; auto-compactação da conversa mantém as invocações mais recentes de Skills, com orçamento combinado de 25.000 tokens (25% deste total por skill reanexada, no máximo 5.000 tokens cada) — mecanismo oficial, não específico deste projeto. |
| 4. Contracts | Nada por padrão | Só sob demanda de quem está criando/validando um Sub-agent, uma Skill nova ou um artefato — nenhum contrato é carregado automaticamente por nenhuma sessão comum. |
| 5. Sub-agents | Prompt de sistema do subagent + Skills listadas em `skills:` (conteúdo **integral**, não resumo) | Na inicialização do subagent — distinto do comportamento padrão de Skills (sob demanda): um subagent com `skills: [architecture, coding-standards]` recebe o corpo completo de ambas já na primeira mensagem, mecanismo oficial de "pré-carregamento". Ainda não implementado neste projeto (Sprint G.5.4+). |
| 6. Playbooks | Nada além do que os Sub-agents que ele delega já carregam | Um Playbook não deveria precisar repassar contexto adicional — cada Sub-agent delegado já chega com seu próprio contexto pré-carregado via `skills:`. Ainda não implementado. |
| 7. ERP (código) | Não é contexto de IA | O código é o alvo, lido/escrito pelas ferramentas durante a execução — não faz parte deste modelo de carregamento de conhecimento. Mencionado aqui só por completude da cadeia de camadas. |

## Regra geral herdada

A mesma regra do `.claude/CLAUDE.md` e de `AI_OPERATING_SYSTEM.md` item 2 (Filosofia) se aplica a todas as 7 camadas: **conhecimento carrega sob demanda, nunca por padrão**, com duas exceções oficiais e deliberadas — `CLAUDE.md` (camada 1, sempre carregado) e Sub-agents com `skills:` (camada 5, pré-carregamento integral por design, para eliminar a etapa de descoberta em um contexto que já nasce isolado).

## Orçamento de contexto por sessão típica

Estimativa qualitativa, sem números de token medidos (nenhuma medição real foi feita nesta sprint):

- **Custo fixo baixo:** `CLAUDE.md` (raiz) + listagem de `description`/`when_to_use` de todas as Skills — paga-se em toda sessão, independentemente da tarefa.
- **Custo fixo zero:** Contracts, corpo das Skills não invocadas, arquitetura de personas de Sub-agent, Playbooks — nenhum destes é carregado a menos que a tarefa precise deles.
- **Custo variável médio:** corpo de uma Skill invocada (a Auditoria 3 da Sprint G.5.2.1 mediu isso concretamente para as 16 Skills reais deste projeto — nenhum `SKILL.md` passa de ~205 linhas; não repetido aqui, ver aquele relatório).
- **Custo variável alto, mas isolado:** contexto de um Sub-agent com múltiplas Skills pré-carregadas via `skills:` — alto na inicialização do subagent, mas isolado da conversa principal (é exatamente o ganho de usar Sub-agent em vez de inline, ver `COMMUNICATION_MODEL.md`).

O modelo de 7 camadas deste AI Operating System preserva o objetivo 4 de `AI_OPERATING_SYSTEM.md` (nenhuma camada nova aumenta o custo fixo de uma sessão comum): Contracts, Sub-agents e Playbooks — as 3 camadas novas/futuras desta sprint — têm custo fixo zero por construção, todas sob demanda.

---

Precedência: em caso de conflito entre este documento e `AI_OPERATING_SYSTEM.md`, `LAYER_MODEL.md` ou a documentação oficial do Claude Code, os documentos/fontes originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
