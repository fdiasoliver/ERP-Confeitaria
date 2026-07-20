# SKILL_DEPENDENCIES.md — Mapa de Dependências das Skills

Parte da meta-skill `project-skill-governance`. Cobre exclusivamente as relações de dependência entre as 17 Skills de domínio existentes em `.claude/skills/`. Não repete o conteúdo de nenhuma delas. (`schema-pattern` inserida na Sprint G.5.2, corrigindo uma omissão real — existia desde a G.5.1 mas nunca tinha sido mapeada aqui. `product-review` inserida na Sprint G.6, 16ª Skill, nova — não uma omissão anterior. `platform-review` inserida na Sprint G.6.1, 17ª Skill, nova — `product-review` preservada sem alteração.)

## Nota de correção sobre a cadeia original

A cadeia fornecida na Sprint G.5.1 listava 13 skills e omitia `sprint-governance`. O projeto tem **14** skills reais. `sprint-governance` foi inserida logo após `project-bootstrap` porque é a skill que resume o ciclo completo de sprint (papéis, os dois artefatos, fases, estados, fluxo de auditoria) e é a mais referenciada por todas as skills de processo criadas depois dela (`orchestrator`, `sprint-planning`, `sprint-execution`, `sprint-audit`, `documentation` apontam para ela). Sem essa inserção, o mapa de dependências ficaria incompleto e o próprio `orchestrator` teria uma dependência não declarada.

## Cadeia principal (ordem de entendimento recomendada)

```
project-bootstrap
        ↓
sprint-governance      ← inserida nesta sprint (ver nota acima)
        ↓
orchestrator
        ↓
governance
        ↓
architecture
        ↓
coding-standards
        ↓
repository-pattern
        ↓
api-pattern
        ↓
frontend-pattern
        ↓
schema-pattern         ← inserida na Sprint G.5.2 (ver nota abaixo)
        ↓
product-review         ← inserida na Sprint G.6 (nova Skill, não omissão anterior)
        ↓
platform-review        ← inserida na Sprint G.6.1 (nova Skill, não omissão anterior; product-review preservada)
        ↓
sprint-planning
        ↓
sprint-execution
        ↓
documentation
        ↓
sprint-audit
        ↓
engineering-reviewer
```

Esta cadeia é uma ordem de **entendimento recomendada**, não uma ordem de execução obrigatória — uma sessão que só precisa escrever um Repository não precisa ler `frontend-pattern` antes. `engineering-reviewer` é a única skill que genuinamente pressupõe leitura de todas as 14 anteriores (ela é o índice-mestre).

**Nota sobre `schema-pattern`:** posicionada aqui por afinidade temática (skill de camada, como `repository-pattern`/`api-pattern`/`frontend-pattern`), não por uma dependência textual real confirmada em todas as skills de camada anteriores — seu próprio `SKILL.md` só referencia `architecture` (itens 6–7) e `sprint-audit` diretamente.

## 1. Quem depende de quem (pré-requisito de entendimento, confirmado no texto real de cada skill)

| Skill | Depende de |
|---|---|
| `project-bootstrap` | Nenhuma — ponto de entrada |
| `sprint-governance` | `project-bootstrap` (contexto do projeto) |
| `orchestrator` | `sprint-governance` (papéis, FASE 0, artefatos já definidos lá — texto real: "Não repete o que já está resumido em `sprint-governance`... nem em `project-bootstrap`") |
| `governance` | `sprint-governance` + `project-bootstrap` (texto real: "distinta de `sprint-governance`... e `project-bootstrap`") |
| `architecture` | `sprint-governance` + `governance` (texto real: "não é processo de sprint (`sprint-governance`) nem governança documental (`governance`)"; item 8 referencia `governance` item 8) |
| `coding-standards` | `architecture` + `governance` (texto real: "não é responsabilidade de camada (`architecture`) nem governança documental (`governance`)") |
| `repository-pattern` | `architecture` (item 4 + `references/layers.md`) + `coding-standards` |
| `api-pattern` | `architecture` (item 4 + `references/layers.md`) + `coding-standards` |
| `frontend-pattern` | `architecture` (item 4 + `references/layers.md`) + `coding-standards` + `governance` |
| `schema-pattern` | `architecture` (item 4 + `references/layers.md`) — texto real: "Não repete o resumo geral já em `architecture`" |
| `product-review` | `frontend-pattern` (Seção 11: "não repete `frontend-pattern`") + `engineering-reviewer`/`sprint-execution` (Seções 3/11: distingue-se explicitamente dos dois) |
| `platform-review` | Nenhuma Skill existente diretamente (Seção 11: distingue-se de `product-review`/`engineering-reviewer`/`governance`, mas não os cita como pré-requisito de conteúdo) — depende de `ERP_PRODUCT_VISION.md`/`PLATFORM_OVERVIEW.md` (documentos, não Skills) |
| `sprint-planning` | `orchestrator` (itens 1–2) + `governance` (item 3) + `sprint-governance` (item 7) + `architecture` (item 1) |
| `sprint-execution` | `sprint-governance` (itens 2–3) + `governance` (item 3) |
| `documentation` | `project-bootstrap` (itens 3–4) + `governance` (itens 2, 6, 10) |
| `sprint-audit` | `sprint-governance` (itens 5–6) + `governance` (item 5) + `orchestrator` (item 1) |
| `engineering-reviewer` | Todas as 14 skills existentes até a Sprint G.5.2 (inclusive `schema-pattern`) — **não inclui `product-review` (Sprint G.6) nem `platform-review` (Sprint G.6.1)**: o texto real de `engineering-reviewer/SKILL.md` ainda não foi atualizado para referenciar nenhuma das duas; ambas são etapas paralelas e distintas (qualidade de produto/conformidade de plataforma, não conformidade arquitetural/documental), não incorporadas ao índice-mestre nesta sprint. Registrado como Melhoria Futura, não resolvido aqui (fora do escopo de G.6/G.6.1, que não autorizam alterar `engineering-reviewer`). |

## 2. Quem chama quem (referências cruzadas reais, encontradas no texto de cada skill)

| Skill de origem | Referencia explicitamente |
|---|---|
| `sprint-governance` | Nenhuma skill irmã — foi a primeira criada nesta sessão, só referencia `AI_PROMPT_ORCHESTRATOR.md`/`PROJECT_GOVERNANCE.md` |
| `project-bootstrap` | `sprint-governance` |
| `orchestrator` | `sprint-governance`, `project-bootstrap` |
| `governance` | `sprint-governance`, `project-bootstrap` |
| `architecture` | `sprint-governance`, `governance` |
| `coding-standards` | `architecture`, `governance` |
| `repository-pattern` | `architecture`, `coding-standards` |
| `api-pattern` | `architecture`, `coding-standards` |
| `frontend-pattern` | `architecture`, `coding-standards`, `governance` |
| `schema-pattern` | `architecture`, `sprint-audit` |
| `product-review` | `frontend-pattern`, `engineering-reviewer`, `sprint-execution` (distingue-se dos dois últimos, não os cita como dependência de conteúdo) |
| `platform-review` | `product-review`, `engineering-reviewer`/`governance` (distingue-se dos três, não os cita como dependência de conteúdo) |
| `sprint-planning` | `orchestrator`, `governance`, `sprint-governance`, `architecture` |
| `sprint-execution` | `sprint-governance`, `governance`, `architecture`, `api-pattern`, `repository-pattern`, `coding-standards` |
| `sprint-audit` | `sprint-governance`, `governance`, `orchestrator`, `architecture`, `api-pattern`, `repository-pattern`, `frontend-pattern`, `coding-standards` |
| `documentation` | `project-bootstrap`, `governance`, `architecture`, `sprint-governance`, `orchestrator`, `sprint-planning`, `sprint-execution`, `sprint-audit` |
| `engineering-reviewer` | Todas as outras 14, sem exceção — é o único índice completo |

## 3. Quem nunca conversa diretamente

Pares de skills sem nenhuma referência cruzada em nenhum sentido (confirmado por ausência no levantamento acima):

| Par | Observação |
|---|---|
| `repository-pattern` ↔ `frontend-pattern` | Ambas passam por `architecture`; nunca se citam entre si, mesmo estando nas duas pontas do fluxo de uma requisição |
| `repository-pattern` ↔ `api-pattern` | Idem — ambas citam `architecture`/`coding-standards`, nunca uma à outra |
| `api-pattern` ↔ `frontend-pattern` | Idem, apesar de conceitualmente adjacentes (o cliente HTTP do front-end chama a rota) |
| `sprint-planning` ↔ qualquer skill de camada (`repository-pattern`, `api-pattern`, `frontend-pattern`, `coding-standards`) | Planejamento opera em nível de sprint/módulo, nunca desce a nível de camada de código |
| `documentation` ↔ qualquer skill de camada (`architecture`, `coding-standards`, `repository-pattern`, `api-pattern`, `frontend-pattern`) | `documentation` cobre o ecossistema de documentos de produto/processo, nunca código |
| `project-bootstrap` ↔ qualquer skill de camada | Orientação inicial não desce a nível de implementação |

## 4. Quem nunca pode executar junto (papéis/fases mutuamente exclusivos)

Baseado em `AI_PROMPT_ORCHESTRATOR.md` v1.2 e no conteúdo real das skills de papel:

| Fase/papel A | Fase/papel B | Motivo (fonte real) |
|---|---|---|
| `orchestrator` (FASE 0) | `sprint-execution` (implementação) | `orchestrator` item 4: "O Orchestrator **não participa da execução**." — são sequenciais, nunca simultâneas |
| `sprint-execution` (autoauditoria) | `sprint-audit` (auditoria independente) | Estado `AUTOAUDITADA` precede `AUDITADA` na máquina de estados de `sprint-governance` — a auditoria do Auditor só começa depois que a autoauditoria do Executor termina |
| `orchestrator` (gerar próxima sprint) | `governance`/FASE 6 (evolução da governança) | `orchestrator` item 7: FASE 6 acontece antes do Orchestrator gerar o próximo `SPRINT_X.md` — não em paralelo |
| `engineering-reviewer` | `sprint-execution` | `engineering-reviewer` ativa explicitamente "ao final de cada sprint" — nunca durante a implementação em curso |

---

Precedência: em caso de conflito entre este mapa e o conteúdo real de qualquer uma das Skills, o `SKILL.md` da skill específica sempre prevalece — este documento é um índice derivado, não uma fonte primária.
