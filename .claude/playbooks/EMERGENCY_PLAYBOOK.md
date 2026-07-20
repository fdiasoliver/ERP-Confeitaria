# Playbook: Emergency

Playbook do AI Operating System (Sprint G.5.6), conforme `playbooks/PLAYBOOK_ARCHITECTURE.md`. Especialização do `MISSION_PLAYBOOK.md` para incidentes críticos — instancia concentradamente o Protocol `error-handling`. Distinto de `BUGFIX_PLAYBOOK` (bug conhecido, sem urgência de infraestrutura) pela natureza do gatilho: aqui é um bloqueio/erro em andamento, não um defeito já estático no código.

## 1. Objetivo / Escopo

Padronizar a resposta a um bloqueio real, erro de infraestrutura/ferramenta, ou situação em que uma sessão/Sub-agent não deveria prosseguir sozinho.

**Quando utilizar:** erro de infraestrutura durante execução (ex. limite de sessão da API, mecanismo de fork indisponível); um Sub-agent encontra um bloqueio arquitetural real em FASE 0; qualquer situação em que a regra "sinalizar, não resolver sozinho" se aplica de forma urgente.
**Quando NÃO utilizar:** bug conhecido sem urgência de infraestrutura (`BUGFIX_PLAYBOOK`); ambiguidade que pode esperar revisão normal (`AUDIT_PLAYBOOK`/`GOVERNANCE_PLAYBOOK`).

## 2. Pré-condições / Pós-condições

**Pré-condições:** nenhuma — este Playbook pode ativar a qualquer momento, de qualquer etapa de qualquer outro Playbook (transversal, mesmo caráter do Protocol `error-handling`).
**Pós-condições:** erro classificado e reportado; decisão de próximo passo tomada pelo nível correto de autoridade — nunca pela camada que encontrou o erro.

## 3. Entradas / Saídas

**Entradas:** um erro/bloqueio real detectado por qualquer camada.
**Saídas:** classificação do erro (infraestrutura / arquitetural / de escopo) + decisão do Orchestrator/Product Owner sobre como prosseguir.

## 4. Artefatos produzidos

Registro do incidente (dentro do relatório da missão em andamento — não um documento novo por padrão, salvo se o incidente revelar um padrão recorrente, caso em que vira insumo para `GOVERNANCE_PLAYBOOK`).

## 5. Skills necessárias / Contracts utilizados / Operational Protocols utilizados / Sub-agents participantes

**Skills:** nenhuma específica — este Playbook é sobre processo, não conhecimento de domínio.
**Contracts:** `delegation-contract.md` (critério de escalonamento/interrupção).
**Operational Protocols:** `error-handling` (o protocolo central), `communication` (formato do relato).
**Sub-agents:** qualquer um pode detectar e reportar; **nenhum decide sozinho o próximo passo fora do próprio escopo** — a decisão volta sempre para `ai-project-manager`/Orchestrator/Product Owner.

## 6. Sequência completa de execução

1. Camada/Sub-agent detecta o erro.
2. Classifica: infraestrutura (ex. limite de sessão, ferramenta indisponível) vs. arquitetural (ex. bloqueio real de FASE 0) vs. de escopo (ex. instrução ambígua).
3. Reporta o erro no formato padrão (Protocol `communication`) — **nunca segue em frente assumindo trabalho fora do próprio escopo, mesmo que pareça "ajudar"**.
4. Se houver trabalho parcial já salvo, confirma explicitamente o que foi salvo antes de qualquer decisão de retry.
5. `ai-project-manager`/Orchestrator decide: retry, prosseguir manualmente, aceitar perda parcial, ou escalar ao Product Owner (se o bloqueio for arquitetural real).
6. Se o incidente se repetir (não é a primeira vez que o mesmo tipo de erro ocorre), sinalizar como candidato a `GOVERNANCE_PLAYBOOK` — um problema recorrente pode justificar uma regra nova, um isolado não.

## 7. Critérios de sucesso / interrupção / retorno ao Orchestrator

**Sucesso:** erro classificado corretamente, nenhum trabalho fora de escopo assumido, decisão tomada pelo nível de autoridade correto.
**Interrupção:** este Playbook *é* a resposta à interrupção — não interrompe a si mesmo, mas pode escalar além do Orchestrator até o Product Owner se o bloqueio for de governança/arquitetura.
**Retorno ao Orchestrator:** imediato, assim que o erro é classificado — nunca depois de tentar resolver sozinho.

## 8. Exemplos completos

**Exemplo negativo real (Sprint G.5.4 desta sessão):** um fork designado para criar 1 arquivo de persona encontrou o erro "Fork is not available inside a forked worker" em 2 chamadas paralelas e, em vez de reportar e parar, assumiu sozinho a criação de mais 12 arquivos e produziu seu próprio relatório final — violação direta deste Playbook. O dano real foi limitado (verificado por auditoria posterior), mas o processo falhou.

**Exemplo negativo real, repetido (Sprint G.5.5 desta sessão):** o mesmo padrão ocorreu de novo — um fork designado para 2 arquivos específicos criou 3 adicionais, sobrescrevendo trabalho de outras duas sessões já concluído.

**Exemplo positivo real (Sprint G.5.6 desta sessão, a mesma em que este Playbook foi escrito):** o mecanismo de fork ficou indisponível para o próprio Orchestrator (não um sub-fork) durante esta sprint. Em vez de insistir em novas tentativas de delegação, a resposta correta foi parar de delegar, verificar o que já tinha sido salvo (2 de 3 arquivos do lote já existiam, criados antes da falha), e completar o restante diretamente — exatamente o fluxo do item 6 acima, e a motivação direta para formalizar este Playbook com esses dois casos reais lado a lado.

---

Precedência: em caso de conflito entre este Playbook e `playbooks/PLAYBOOK_ARCHITECTURE.md`, `protocols/error-handling/PROTOCOL.md` ou `contracts/delegation-contract.md`, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.6 (Implementação dos Playbooks). -->
