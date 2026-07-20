# Protocol: Mission

Operational Protocol do AI Operating System (Sprint G.5.5). Define o comportamento de recebimento, abertura, planejamento e inicialização de uma missão — não redefine papéis (isso é Sub-agents/personas), conhecimento (isso é Skills) nem formato de artefato (isso é Contracts). Deriva de `architecture/EXECUTION_FLOW.md` e `architecture/DELEGATION_MODEL.md` — não repete a explicação conceitual de nenhum dos dois.

## 1. Objetivo / Escopo

Padronizar as 4 primeiras etapas de `EXECUTION_FLOW.md` (Nova Missão → Planejamento, com a transição para Delegação) para que toda missão do AI Operating System comece da mesma forma, independentemente do tipo (implementação, arquitetura, auditoria, governança). Fora de escopo: a execução da missão em si (isso é o comportamento executado por cada Sub-agent), a delegação propriamente dita entre personas (isso é `protocols/delegation/PROTOCOL.md`).

## 2. Quando utilizar / Quando NÃO utilizar

**Utilizar quando:** uma missão nova chega ao Product Owner/Orchestrator e ainda não tem escopo declarado.
**NÃO utilizar quando:** a missão já está em andamento (usar `protocols/delegation/PROTOCOL.md` para o próximo passo); é apenas uma pergunta pontual sem necessidade de planejamento formal (ex. "essa mudança precisa de ADR?" vai direto para `ai-governance-officer`, sem passar por este protocolo — mesmo exemplo já registrado em `ai-project-manager.md` item 13).

## 3. Pré-condições / Pós-condições

**Pré-condições:** existe um pedido de missão com objetivo identificável em uma frase (mesmo critério de `EXECUTION_FLOW.md` 1.1).
**Pós-condições:** escopo, fora-de-escopo, dependências e critérios de aceite estão explícitos; a missão está pronta para a etapa de Delegação.

## 4. Entradas / Saídas

**Entradas:** o pedido de missão em linguagem natural do Product Owner.
**Saídas:** plano de missão (escopo/fora-de-escopo/dependências), no formato mínimo definido por `contracts/artifact-contract.md`.

## 5. Artefatos produzidos / consumidos

**Produz:** `SPRINT_X.md` ou artefato de planejamento equivalente (conforme `contracts/artifact-contract.md`).
**Consome:** `PLAN.md`/`CHANGELOG.md`, para checar se as dependências declaradas já estão concluídas.

## 6. Skills utilizadas / Contracts utilizados / Sub-agents envolvidos

**Skills:** `sprint-governance`, `orchestrator`, `sprint-planning`, `project-bootstrap` — as mesmas quatro pré-carregadas por `ai-project-manager` (ver `agents/ai-project-manager.md` item 6), pois é essa persona que executa este protocolo na prática.
**Contracts:** `artifact-contract.md` (formato do plano produzido), `delegation-contract.md` (checklist a cumprir antes de sair deste protocolo para o de Delegação).
**Sub-agents:** `ai-project-manager` (único ponto de entrada de missão coordenada — `agents/ai-project-manager.md` item 3: "não pode ser acionado por nenhuma outra persona").

## 7. Eventos de início / término

**Início:** recebimento de um pedido de missão pelo Product Owner/Orchestrator.
**Término:** escopo aprovado e primeira delegação prestes a ser disparada (transição para `protocols/delegation/PROTOCOL.md`).

## 8. Critérios de sucesso / interrupção / retorno

**Sucesso:** a missão tem objetivo, escopo, fora-de-escopo e dependências declarados sem ambiguidade — mesmo critério de avanço de `EXECUTION_FLOW.md` 1.2.
**Interrupção:** ambiguidade real sobre o que a missão deveria produzir (bloqueio real de `EXECUTION_FLOW.md` 1.1); dependência declarada ainda não concluída em `PLAN.md`.
**Retorno ao Orchestrator:** sempre que a etapa de Planejamento não conseguir eliminar uma ambiguidade sozinha — nunca decidir o escopo por conta própria quando o pedido original é genuinamente ambíguo (mesmo princípio de `DELEGATION_MODEL.md` item 5, "sinalizar, não resolver sozinho").

## 9. Fluxo operacional

```
Receber missão (Product Owner descreve objetivo)
        ↓
Planejamento (identificar escopo, fora-de-escopo, dependências, critérios de aceite)
        ↓
Verificar dependências em PLAN.md (bloqueia se dependência não "Concluído")
        ↓
Produzir artefato de planejamento (SPRINT_X.md ou equivalente)
        ↓
Transição para Delegation Protocol
```

## 10. Exemplos positivos / negativos

**Exemplo positivo:** "Adicionar um módulo CRUD de Insumos ao admin" chega ao `ai-project-manager`, que aplica este protocolo — identifica que depende de decisão de schema, produz o plano com escopo (schema+backend+frontend+validação+documentação) e fora-de-escopo (não inclui o módulo de Receitas), antes de delegar (mesmo exemplo de `ai-project-manager.md` item 12).

**Exemplo negativo:** delegar direto para `ai-backend-engineer` sem produzir nenhum plano, quando a missão na verdade tem escopo ambíguo (ex. "melhorar o módulo de pedidos" sem especificar o quê) — pula o Mission Protocol e viola a pré-condição de `DELEGATION_MODEL.md` item 3 (tarefa "isolável, com entrada e saída bem definidas").

---

Precedência: em caso de conflito entre este Protocol e `architecture/EXECUTION_FLOW.md`, `architecture/DELEGATION_MODEL.md` ou os Contracts, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
