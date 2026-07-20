# project-skill-governance — README

Porta de entrada humana desta pasta. Distinto de `SKILL.md` (o arquivo ativável pelo mecanismo de Skills do Claude Code, consultado por uma IA em execução) — este README é para quem abre a pasta manualmente para entender o que ela é.

## 1. O que é esta Meta-Skill

`project-skill-governance` governa a coerência entre as demais Skills de domínio já existentes no projeto **Doce Menina** (confeitaria-app). Ela é uma meta-skill: não implementa código, não altera arquivos, não produz documentação de produto. Sua única responsabilidade é governar a relação **entre** as demais Skills — dependências, responsabilidades, fluxo, estados e resolução de conflito.

## 2. Quando utilizar

- Ao criar uma nova Skill de domínio (para saber onde ela se encaixa nas dependências e na matriz de responsabilidades já existentes).
- Ao suspeitar de conflito entre duas Skills existentes (ex.: duas skills prescrevendo comportamentos incompatíveis).
- Ao planejar uma sprint que atravessa múltiplas camadas e for preciso saber a ordem correta de consulta entre as Skills.

## 3. Quando NÃO utilizar

- Para executar uma sprint específica — usar `sprint-governance`, `orchestrator`, `sprint-planning`, `sprint-execution`, `sprint-audit` ou `engineering-reviewer` diretamente.
- Para escrever código — usar `architecture`, `api-pattern`, `repository-pattern`, `frontend-pattern` ou `coding-standards`.
- Para questões de governança documental específica (ADR, DoD, PLAN/CHANGELOG) — usar `governance`.

Esta meta-skill nunca substitui a skill de domínio certa para a tarefa — ela só ajuda a identificar qual é.

## 4. Como carregar

A ordem oficial completa de carregamento do projeto está em `.claude/CLAUDE.md` (ponto de entrada oficial). Em resumo: ler `SKILL.md` desta pasta **antes** de decidir qual das Skills de domínio carregar para uma tarefa específica — ela existe justamente para evitar carregar a Skill errada ou na ordem errada.

## 5. Como funciona

Esta meta-skill não é "executada" como as demais — ela é **consultada como referência estrutural**. `SKILL.md` na raiz é o arquivo ativável; os 7 mapas de apoio vivem em `references/`:

| Arquivo | Papel |
|---|---|
| `SKILL.md` | Arquivo ativável/índice — ponto de entrada da meta-skill em si |
| `references/SKILL_DEPENDENCIES.md` | Mapa de dependências entre as Skills |
| `references/SKILL_MATRIX.md` | Matriz Planeja/Executa/Audita/Documenta/Valida/Aprova/Revisa/Decide por Skill |
| `references/RESPONSIBILITIES.md` | Responsabilidades detalhadas por Skill (arquivos permitidos/proibidos, decisões permitidas/proibidas, entradas/saídas) |
| `references/WORKFLOW.md` | Fluxo oficial ponta a ponta, do Bootstrap ao Encerramento |
| `references/STATE_MACHINE.md` | Máquina de estados desta infraestrutura — **nota:** há uma divergência real entre os estados definidos nesta sprint e os já existentes na Skill `sprint-governance` ("Estados da Sprint"); a divergência está detalhada no próprio `STATE_MACHINE.md`, não resolvida aqui |
| `references/CONFLICT_RESOLUTION.md` | Hierarquia definitiva e regras de resolução de conflito entre Skills, documentos, regras e agentes |
| `references/skill-format.md` | Procedimento completo de como escrever um `SKILL.md` (migrado de `.claude/CLAUDE.md` na Sprint G.5.2) |

## 6. Dependências

Esta meta-skill está subordinada, nesta ordem de precedência, a: `PROJECT_GOVERNANCE.md` → `REGRAS_NEGOCIO.md` → ADRs → `AI_PROMPT_ORCHESTRATOR.md` → `CLAUDE.md` (raiz). Detalhe completo da hierarquia: `references/CONFLICT_RESOLUTION.md`.

Ela está **acima** das demais Skills de domínio e dos Templates — nenhuma delas pode contrariá-la.

## 7. Arquivos desta pasta

| Arquivo | Propósito |
|---|---|
| `README.md` | Este arquivo — porta de entrada humana |
| `SKILL.md` | Arquivo ativável da meta-skill (11 seções oficiais: Objetivo, Quando utilizar/NÃO utilizar, Responsabilidades, Fluxo, Arquivos auxiliares, Como carregar, Critérios de sucesso, Limitações, Anti-patterns, Referências cruzadas) |
| `references/SKILL_DEPENDENCIES.md` | Mapa de dependências |
| `references/SKILL_MATRIX.md` | Matriz de responsabilidades por ação |
| `references/RESPONSIBILITIES.md` | Responsabilidades detalhadas por Skill |
| `references/WORKFLOW.md` | Fluxo oficial ponta a ponta |
| `references/STATE_MACHINE.md` | Máquina de estados |
| `references/CONFLICT_RESOLUTION.md` | Hierarquia e resolução de conflitos |
| `references/skill-format.md` | Procedimento de formatação de Skills |

## 8. Fluxos

Não repetido aqui — ver `references/WORKFLOW.md` para o fluxo oficial completo, do Bootstrap ao Encerramento de Sprint.

---

Precedência: em caso de conflito entre este README e `SKILL.md`/`references/CONFLICT_RESOLUTION.md`, os arquivos normativos desta mesma pasta prevalecem sobre o README (que é só orientação de navegação).
