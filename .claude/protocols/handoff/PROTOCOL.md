# Protocol: Handoff

Operational Protocol do AI Operating System (Sprint G.5.5). Define o comportamento de transferência de trabalho entre Sub-agents dentro da mesma missão — distinto de `completion` (encerramento da missão inteira) e de `delegation` (início de uma nova delegação), este protocolo cobre especificamente a continuidade quando um Sub-agent termina sua parte e outro assume a próxima. Não redefine papéis, conhecimento nem formato de artefato. Deriva de `architecture/EXECUTION_FLOW.md` e `architecture/DELEGATION_MODEL.md`.

## 1. Objetivo / Escopo

Padronizar a transição de trabalho de um Sub-agent para o próximo dentro de uma mesma missão já em andamento — o que precisa ser transferido, em que formato, e como o Sub-agent seguinte confirma que pode começar. Fora de escopo: o início da missão (`protocols/mission/PROTOCOL.md`), a decisão de para quem delegar (`protocols/delegation/PROTOCOL.md`) e o encerramento da missão inteira (`protocols/completion/PROTOCOL.md`).

## 2. Quando utilizar / Quando NÃO utilizar

**Utilizar quando:** um Sub-agent concluiu sua parte de uma missão e o próximo passo depende do trabalho dele (ex. `ai-backend-engineer` termina a API e `ai-frontend-engineer` precisa começar).
**NÃO utilizar quando:** é a primeira delegação da missão (isso é `protocols/mission/PROTOCOL.md` → `protocols/delegation/PROTOCOL.md`); é o encerramento final da missão inteira, sem próximo Sub-agent a assumir (isso é `protocols/completion/PROTOCOL.md`); dois Sub-agents trabalham em paralelo sem dependência entre si (não há handoff, apenas delegação simultânea via `protocols/delegation/PROTOCOL.md`).

## 3. Pré-condições / Pós-condições

**Pré-condições:** o Sub-agent que está encerrando sua parte já produziu o artefato/resultado esperado pela sua persona (ver `agents/{persona}.md` item "Critérios de encerramento / interrupção").
**Pós-condições:** o Sub-agent seguinte recebeu tudo o que precisa para começar sem precisar redescobrir contexto perdido; `ai-project-manager` registrou a transição no relatório consolidado da missão (`agents/ai-project-manager.md` item 5, "Consolidar o retorno de cada delegação").

## 4. Entradas / Saídas

**Entradas:** o resultado resumido do Sub-agent que está encerrando (formato de `protocols/communication/PROTOCOL.md`), mais o artefato real produzido (ex. rota de API implementada).
**Saídas:** confirmação de que o Sub-agent seguinte tem pré-condição satisfeita para começar (ex. `ai-frontend-engineer` confirma que a API existe e está no formato esperado).

## 5. Artefatos produzidos / consumidos

**Produz:** nenhum artefato de documento próprio — o handoff em si é um evento de coordenação, registrado como uma entrada no relatório consolidado de `ai-project-manager`.
**Consome:** o artefato real produzido pelo Sub-agent anterior (código, decisão arquitetural, etc.), conforme `contracts/artifact-contract.md`.

## 6. Skills utilizadas / Contracts utilizados / Sub-agents envolvidos

**Skills:** nenhuma própria — herda as Skills já pré-carregadas pelos dois Sub-agents envolvidos na transição.
**Contracts:** `communication-contract.md` (formato do resumo transferido), `artifact-contract.md` (formato do artefato transferido).
**Sub-agents:** todos os de execução (`ai-solution-architect`, `ai-backend-engineer`, `ai-frontend-engineer`, `ai-qa-engineer`, `ai-documentation-engineer`, `ai-refactoring-engineer`, `ai-release-manager`) podem ser ponta de origem ou destino de um handoff; `ai-project-manager` coordena e registra a transição (único com `tools: Agent(...)`, ver `agents/ai-project-manager.md`).

## 7. Eventos de início / término

**Início:** um Sub-agent declara sua parte concluída (evento de "Critérios de encerramento" da sua própria persona).
**Término:** o Sub-agent seguinte confirma pré-condição satisfeita e inicia sua própria execução.

## 8. Critérios de sucesso / interrupção / retorno

**Sucesso:** o Sub-agent seguinte começa sem precisar pedir de volta informação que já deveria ter recebido no handoff.
**Interrupção:** o artefato produzido pelo Sub-agent anterior não satisfaz a pré-condição do seguinte (ex. API incompleta) — retorna ao Sub-agent anterior, não avança o handoff.
**Retorno ao Orchestrator:** quando a pré-condição do Sub-agent seguinte depende de uma decisão que nenhum dos dois tem autoridade para tomar (ex. mudança de escopo) — mesmo princípio de `DELEGATION_MODEL.md` item 5.

## 9. Fluxo operacional

```
Sub-agent A declara "Critérios de encerramento" satisfeitos
        ↓
Resultado resumido + artefato entregues a ai-project-manager (Communication Protocol)
        ↓
ai-project-manager confirma pré-condição do Sub-agent B contra o artefato de A
        ↓
   pré-condição OK? ──não──► retorna a A (Interrupção)
        │ sim
        ▼
ai-project-manager delega para Sub-agent B (Delegation Protocol)
        ↓
Handoff registrado no relatório consolidado da missão
```

## 10. Exemplos positivos / negativos

**Exemplo positivo:** o exemplo real já documentado em `architecture/ARCHITECTURE_OVERVIEW.md` item 2 — `ai-backend-engineer` conclui schema+repository+service+api de um módulo, `ai-project-manager` confirma que a rota existe e está conforme `api-pattern`, e só então delega a `ai-frontend-engineer`, que já sabe exatamente qual contrato de API consumir (pré-condição real de `frontend-pattern`: "API já implementada e testada").

**Exemplo negativo:** `ai-frontend-engineer` ser acionado antes de `ai-backend-engineer` terminar, obrigando-o a adivinhar o formato da API ainda não implementada — viola tanto a pré-condição já registrada em `agents/ai-frontend-engineer.md` quanto este protocolo.

---

Precedência: em caso de conflito entre este Protocol e `architecture/EXECUTION_FLOW.md`, `architecture/DELEGATION_MODEL.md` ou `agents/ai-project-manager.md`, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
