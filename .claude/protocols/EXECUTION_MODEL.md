# EXECUTION_MODEL.md — Modelo de Execução dos Operational Protocols

Parte da documentação de `.claude/protocols/` (Sprint G.5.5). Modela o ciclo genérico pelo qual um Operational Protocol dispara durante uma missão — não repete o conteúdo de nenhum dos 10 `PROTOCOL.md` nem de `architecture/EXECUTION_FLOW.md`, apenas mostra como eles se encaixam no tempo.

## 1. O ciclo genérico

```
Orchestrator
    ↓
Protocol
    ↓
Sub-agent
    ↓
Protocol
    ↓
Orchestrator
```

Um Protocol sempre **inicia e termina no papel que decide** — a sessão principal atuando como Orchestrator, ou um Sub-agent de coordenação com `tools: Agent(...)` explícito (hoje, só `ai-project-manager`). Um Sub-agent de execução pura (`ai-backend-engineer`, `ai-frontend-engineer` etc.) nunca decide sozinho quando um Protocol começa ou termina — ele só executa dentro da janela que o Protocol já abriu, e sinaliza de volta quando termina (`protocols/communication/PROTOCOL.md`). Isso não é uma regra nova: é a mesma distinção que `contracts/agent-contract.md` item 5 já faz ("nunca gera outro Sub-agent sem `tools: Agent(tipo)` explícito") aplicada ao nível de comportamento, não de ferramenta.

## 2. Instância concreta — uma missão real percorrendo o ciclo

```
Orchestrator recebe pedido de missão
        │
        ▼
   [Mission Protocol]  ── objetivo, escopo, fora-de-escopo, dependências (protocols/mission)
        │
        ▼
   [Delegation Protocol]  ── declara escopo/contexto/critério de conclusão, delega (protocols/delegation)
        │
        ▼
Sub-agent executa
        │  usa [Context Protocol] durante o trabalho (isolamento, economia — protocols/context)
        │  usa [Communication Protocol] para formatar o retorno (protocols/communication)
        ▼
   [Delegation Protocol]  ── retorno: resumo estruturado ao delegador (protocols/delegation, evento de término)
        │
        ├── há próxima etapa dependente? ──sim──► [Handoff Protocol] ── transferência para o próximo Sub-agent (protocols/handoff)
        │                                              │
        │                                              └──► volta a "Sub-agent executa" (próximo Sub-agent)
        │
        └──não (era a última etapa)
                │
                ▼
        [Validation Protocol] ── tsc/lint/build/regressão, ai-qa-engineer (protocols/validation)
                │
                ▼
        [Review Protocol] ── conformidade/governança, ai-governance-officer, se a missão exigir (protocols/review)
                │
                ▼
        [Documentation Protocol] ── PLAN.md/CHANGELOG.md só após validação (protocols/documentation)
                │
                ▼
        [Completion Protocol] ── DoD, Relatório Executivo, ai-release-manager (protocols/completion)
                │
                ▼
Orchestrator recebe o encerramento formal da missão
```

Em qualquer ponto desta cadeia, um erro de infraestrutura ou um bloqueio real dispara **[Error Handling Protocol]** (`protocols/error-handling`) em vez de prosseguir — o Sub-agent que encontrou o erro reporta e para; nunca assume o escopo de outra etapa da cadeia (violação real já registrada em `protocols/delegation/PROTOCOL.md` item 10 e evitada de propósito nesta própria sprint, ver `protocols/error-handling/PROTOCOL.md`).

## 3. Por que o ciclo sempre retorna ao Orchestrator

Nenhum Protocol termina em um Sub-agent — mesmo `Completion Protocol`, que é o último elo antes do encerramento, devolve o resultado a `ai-project-manager` (que age como Orchestrator delegado), não decide por si que a missão está de fato aceita. Isso preserva a regra de responsabilidade única já estabelecida em `contracts/agent-contract.md` item 4: um Sub-agent nunca acumula autoridade de aceite fora do seu papel.

## 4. Mapa rápido — qual Protocol em qual momento

| Momento da missão | Protocol | Papel que decide |
|---|---|---|
| Início | `mission` | Orchestrator |
| Antes de cada delegação | `delegation` | Orchestrator / `ai-project-manager` |
| Durante a execução de um Sub-agent | `context`, `communication` | O próprio Sub-agent, dentro dos limites do Protocol |
| Entre dois Sub-agents dependentes | `handoff` | `ai-project-manager` |
| Antes do encerramento | `validation`, `review` (se aplicável) | `ai-qa-engineer`, `ai-governance-officer` |
| Atualização documental | `documentation` | `ai-documentation-engineer` |
| Encerramento | `completion` | `ai-release-manager` |
| Qualquer momento, diante de erro | `error-handling` | Quem encontrou o erro reporta; Orchestrator decide o próximo passo |

---

Precedência: em caso de conflito entre este documento e `architecture/EXECUTION_FLOW.md` ou qualquer `PROTOCOL.md` individual, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
