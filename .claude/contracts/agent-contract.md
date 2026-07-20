# agent-contract.md — Contrato de Sub-agent

Parte da arquitetura do AI Operating System (Sprint G.5.3). Deriva de `architecture/LAYER_MODEL.md` (Camada 5), `architecture/DELEGATION_MODEL.md` e `architecture/CONTEXT_MODEL.md` — não repete a explicação conceitual de nenhum, só a checklist operacional. Aplica-se a todo `.claude/agents/{nome}.md` real, a partir da Sprint G.5.4. Nenhum Sub-agent é criado por este documento.

## 1. Campos obrigatórios (frontmatter)

| Campo | Regra |
|---|---|
| `name` | kebab-case, único em todo `.claude/agents/` (e subpastas) do projeto. |
| `description` | Em inglês (mesma convenção de `description` de Skill). Deve declarar: (a) o papel do subagent, (b) quando delegar para ele, (c) **convenção própria deste projeto** — quais Skills ele tipicamente usa, citadas pelo nome exato. |

## 2. Campos opcionais recomendados (para este projeto)

| Campo | Recomendação |
|---|---|
| `tools` | Lista de permissão explícita — nunca herdar todas as ferramentas por padrão para um subagent de execução. Subagents de coordenação podem justificar herança mais ampla. |
| `skills` | Decidido a partir da subseção "Compatibilidade com Sub-agents" (já presente nas 16 `SKILL.md` existentes) — pré-carregar exatamente as Skills que essa subseção já indica para o papel equivalente. |
| `model` | Default: `inherit`. Só especificar um modelo diferente com justificativa técnica registrada no próprio arquivo do subagent. |
| `disallowedTools` | Usar para remover ferramentas herdadas perigosas para o papel (ex. um subagent de auditoria não deveria ter `Write`/`Edit`). |

## 3. Estrutura obrigatória do corpo (prompt de sistema)

1. Papel (uma frase).
2. Responsabilidades (lista).
3. Limites explícitos — o que este subagent nunca faz.
4. Critério de quando escalar/pedir ajuda em vez de decidir sozinho (mesmo princípio de `DELEGATION_MODEL.md` item 5).

## 4. Regra de responsabilidade única

Um Sub-agent nunca acumula mais de uma persona (ver `architecture/agents/AGENT_ARCHITECTURE.md` para o catálogo de personas propostas). Se uma tarefa parece exigir duas personas, a delegação correta é duas invocações (sequenciais ou via subagent de coordenação), nunca um subagent híbrido.

## 5. Limites obrigatórios de todo Sub-agent

- Nunca contraria `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md`.
- Nunca implementa fora do escopo declarado da sua persona.
- Nunca gera outro Sub-agent (ferramenta `Agent`) sem `tools: Agent(tipo)` explícito autorizando (ver `DELEGATION_MODEL.md` item 2 — regra padrão é **não pode**).
- Nunca devolve o histórico bruto de chamadas de ferramenta como resultado — sempre um resumo estruturado (ver `CONTEXT_MODEL.md`/`COMMUNICATION_MODEL.md`).

## 6. Critérios de delegação (quando delegar para este subagent)

A tarefa corresponde à `description` do subagent E pelo menos um critério de `DELEGATION_MODEL.md` item 3 se aplica (ruído de ferramentas, isolável, paraleliza bem).

## 7. Critérios de encerramento

O subagent considera sua tarefa concluída quando entrega o resultado no formato mínimo definido em `DELEGATION_MODEL.md` item 4 (o que foi feito, arquivos tocados, achados relevantes, decisões sinalizadas) — nunca encerra silenciosamente sem esse resumo.

## 8. Critérios de validação (checklist para a Sprint G.5.4 usar)

Um Sub-agent está pronto quando:

- [ ] `name`/`description` presentes e conformes ao item 1.
- [ ] `description` cita as Skills que tipicamente usa.
- [ ] `skills:` (se usado) corresponde ao que a subseção "Compatibilidade com Sub-agents" das Skills pré-carregadas já indica.
- [ ] Corpo segue a estrutura do item 3.
- [ ] Responsabilidade única (item 4) — não é um híbrido de duas personas do catálogo.
- [ ] `tools`/`disallowedTools` compatíveis com o papel (um subagent de leitura não deveria ter `Write`/`Edit`).
- [ ] Nenhuma menção a implementar Sub-agent aninhado sem `tools: Agent(tipo)` explícito.

---

Precedência: em caso de conflito entre este contrato e `LAYER_MODEL.md`, `DELEGATION_MODEL.md`, `CONTEXT_MODEL.md` ou a documentação oficial de Sub-agents do Claude Code, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
