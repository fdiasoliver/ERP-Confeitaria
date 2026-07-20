# AGENT_ARCHITECTURE.md — Arquitetura das Personas de Sub-agent

Parte da arquitetura do AI Operating System (Sprint G.5.3). Hub de navegação para a arquitetura de todas as personas de Sub-agent deste projeto — não repete o detalhe de nenhuma (isso vive em `personas/{slug}.md`) nem o contrato estrutural (isso vive em `.claude/contracts/agent-contract.md`). Fonte de verdade da camada: `../LAYER_MODEL.md` (Camada 5, Sub-agents) e `../AI_OPERATING_SYSTEM.md` item 10 (decisão sobre `.claude/agents/` ser caminho reservado).

## 1. O que é uma persona

Uma **persona** é a especificação arquitetural de um Sub-agent: papel, Skills pré-carregadas, ferramentas permitidas e limites — documentada aqui como arquitetura, não como implementação. Nenhum arquivo `.claude/agents/{nome}.md` real é criado nesta sprint; a implementação pertence à Sprint G.5.4, que deve seguir estes documentos sem redefini-los. Todo arquivo de persona segue a estrutura do `.claude/contracts/agent-contract.md` — não repetida aqui.

## 2. Catálogo de personas (9)

| Persona | Slug do arquivo |
|---|---|
| AI Project Manager | `personas/ai-project-manager.md` |
| AI Solution Architect | `personas/ai-solution-architect.md` |
| AI Backend Engineer | `personas/ai-backend-engineer.md` |
| AI Frontend Engineer | `personas/ai-frontend-engineer.md` |
| AI Documentation Engineer | `personas/ai-documentation-engineer.md` |
| AI QA Engineer | `personas/ai-qa-engineer.md` |
| AI Governance Officer | `personas/ai-governance-officer.md` |
| AI Refactoring Engineer | `personas/ai-refactoring-engineer.md` |
| AI Release Manager | `personas/ai-release-manager.md` |

## 3. Matriz comparativa

| Persona | Papel resumido | Skills pré-carregadas | Pode delegar? | Camada predominante |
|---|---|---|---|---|
| AI Project Manager | Recebe a missão, aciona `sprint-planning`/`orchestrator`, coordena as demais personas | `sprint-governance`, `orchestrator`, `sprint-planning` | Sim — única persona de coordenação com `tools: Agent(tipo)` autorizado por padrão | Meta-Skill / Skills (processo) |
| AI Solution Architect | Resolve FASE 0 (análise arquitetural), decide em qual camada uma mudança pertence | `architecture`, `schema-pattern`, `governance` | Não | Skills (arquitetura de código) |
| AI Backend Engineer | Implementa/revisa Schema, Repository, Service, Route Handler | `schema-pattern`, `repository-pattern`, `api-pattern`, `architecture`, `coding-standards` | Não | Skills (camadas de backend) → ERP |
| AI Frontend Engineer | Implementa/revisa página admin e cliente HTTP | `frontend-pattern`, `coding-standards`, `architecture` | Não | Skills (camada de front-end) → ERP |
| AI Documentation Engineer | Atualiza README/docs/handoff/referências cruzadas | `documentation`, `governance` | Não | Skills (documentação) |
| AI QA Engineer | Valida (tsc/lint/build/QA de regressão), sem corrigir | `sprint-execution` (consulta `engineering-reviewer/references/checklist.md` sob demanda, sem pré-carregar) | Não | Skills (validação) |
| AI Governance Officer | ADR, DoD, classificação de auditoria, evolução da governança | `governance`, `sprint-audit`, `engineering-reviewer` | Não | Meta-Skill / Contracts |
| AI Refactoring Engineer | Dívida técnica, `KNOWN_ISSUES.md`, melhorias sem mudar comportamento | `architecture`, `coding-standards` (+ Skill de camada do arquivo-alvo, decidida em tempo de execução) | Não | Skills (camadas de código, modo revisão) |
| AI Release Manager | Encerramento de sprint, `PLAN.md`/`CHANGELOG.md`, corte de release | `governance`, `sprint-governance`, `engineering-reviewer` | Não | Meta-Skill / Artifact Model |

Todas as 9 seguem a regra de responsabilidade única do `agent-contract.md` item 4 — nenhuma acumula duas personas do catálogo.

## 4. Avaliação da contagem de 9

**Mantida em 9, sem alteração.** Avaliação: o projeto tem 15 Skills de domínio cobrindo 6 camadas de código (Route/Service/Validator/Repository/Schema/Front-end) + 6 Skills de processo/governança + 1 de documentação + 1 meta-skill de revisão (`engineering-reviewer`). As 9 personas cobrem esse espaço sem lacuna real: Backend Engineer absorve Route+Service+Validator+Repository+Schema como um fluxo contíguo (já é como `architecture` os trata — uma única cadeia, não 5 personas separadas), o que é consistente com a regra do item 5 abaixo (camadas adjacentes do mesmo fluxo). Considerei separar "AI Schema Engineer" da "AI Backend Engineer" dado que `schema-pattern` é uma Skill própria — descartado: schema é upstream do mesmo fluxo de implementação de um recurso (schema → repository → service → api), raramente tocado isoladamente sem as camadas seguintes, e a Skill `schema-pattern` já existe precisamente para o caso em que for necessário aprofundar só essa camada, sem exigir uma persona dedicada. Nenhuma lacuna de Skill sem persona correspondente foi encontrada.

## 5. Regras de composição de persona

- Nenhuma persona deveria pré-carregar Skills de mais de 2 camadas de código diferentes sem justificativa registrada no próprio arquivo de persona. `AI Backend Engineer` pré-carregando `schema-pattern`+`repository-pattern`+`api-pattern` é aceitável — são camadas adjacentes do mesmo fluxo de implementação de um recurso. Pré-carregar `frontend-pattern` também nessa persona não seria aceitável sem justificativa: front-end é consumidor da API, não parte do mesmo fluxo de escrita de backend.
- Nenhuma persona pré-carrega Skills de processo (`sprint-*`, `orchestrator`, `governance`) junto com Skills de camada de código, exceto `AI Project Manager`/`AI Governance Officer`/`AI Release Manager`, cujo papel é justamente de coordenação/processo.
- Toda persona nova proposta em sprint futura deve passar por esta mesma avaliação de contagem (item 4) antes de ser adicionada ao catálogo — evita crescimento não justificado do número de personas.

## 6. Como usar este documento

Ao implementar a Sprint G.5.4: para cada linha da tabela do item 3, criar `.claude/agents/{slug-sem-prefixo-ai}.md` seguindo `.claude/contracts/agent-contract.md`, usando o arquivo de persona correspondente (`personas/{slug}.md`) como fonte do prompt de sistema e do papel.

---

Precedência: em caso de conflito entre este documento e `LAYER_MODEL.md`, `AI_OPERATING_SYSTEM.md` ou `contracts/agent-contract.md`, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
