# Playbook: Documentation

Playbook do AI Operating System (Sprint G.5.6), conforme `playbooks/PLAYBOOK_ARCHITECTURE.md`. Especialização do `MISSION_PLAYBOOK.md` para missões cujo objetivo central é documentação (não um subproduto de outra missão) — ex. reorganizar `docs/`, corrigir referências cruzadas quebradas em massa, atualizar roadmap.

## 1. Objetivo / Escopo

Padronizar missões dedicadas a documentação do ERP ou da própria infraestrutura de IA — distinto do Protocol `documentation` (que cobre a atualização pontual de PLAN/CHANGELOG ao final de qualquer missão).

**Quando utilizar:** reorganização de `docs/`, correção de referências cruzadas quebradas identificadas em auditoria, atualização de roadmap/handoff, criação de novo documento de arquitetura de produto.
**Quando NÃO utilizar:** atualização pontual de PLAN.md/CHANGELOG.md ao final de uma missão de código — isso é o Protocol `documentation`, disparado dentro de `IMPLEMENTATION_PLAYBOOK`/outros, não este Playbook próprio.

## 2. Pré-condições / Pós-condições

**Pré-condições:** inventário do que precisa mudar (não assumir que uma referência antiga ainda é válida sem conferir — lição real já registrada em `documentation/SKILL.md`).
**Pós-condições:** documentos atualizados, zero referência cruzada quebrada remanescente no escopo tocado.

## 3. Entradas / Saídas

**Entradas:** lista de documentos/referências a atualizar, ou um achado de auditoria (`AUDIT_PLAYBOOK`) que aponta staleness.
**Saídas:** documentos corrigidos/criados, com referências válidas.

## 4. Artefatos produzidos

`.md` do projeto (raiz, `docs/`, ou `.claude/`) — nunca `.claude/skills/*/SKILL.md` diretamente sem passar pela meta-skill (isso seria escopo de `ARCHITECTURE_PLAYBOOK`, não deste).

## 5. Skills necessárias / Contracts utilizados / Operational Protocols utilizados / Sub-agents participantes

**Skills:** `documentation`, `governance`.
**Contracts:** `artifact-contract.md` (nomenclatura padronizada).
**Operational Protocols:** `documentation` (o protocolo central), `review` (conferência final por `ai-governance-officer`).
**Sub-agents:** `ai-documentation-engineer` lidera; `ai-governance-officer` revisa se a mudança documental tem implicação de governança.

## 6. Sequência completa de execução

1. `ai-project-manager` recebe o pedido e delega para `ai-documentation-engineer`.
2. `ai-documentation-engineer` faz o inventário real (grep/leitura) do que precisa mudar — nunca assume.
3. Atualiza os documentos, conferindo cada caminho de arquivo referenciado antes de escrever.
4. Protocol `review`: `ai-governance-officer` confere se alguma mudança documental tem implicação de governança não percebida.
5. Protocol `completion`: relatório final.

## 7. Critérios de sucesso / interrupção / retorno ao Orchestrator

**Sucesso:** documentos atualizados, zero referência quebrada nova, nenhuma decisão de conteúdo de negócio tomada sem autorização.
**Interrupção:** a mudança documental revela uma decisão de arquitetura/governança não tomada ainda (escalar para `ARCHITECTURE_PLAYBOOK`/`GOVERNANCE_PLAYBOOK`).
**Retorno ao Orchestrator:** ao final, com a lista de documentos tocados.

## 8. Exemplos completos

**Exemplo real:** a correção das 3 (depois 4) referências cruzadas quebradas apontadas pela Auditoria G.5.2.1 — `repository-pattern/SKILL.md`, `schema-pattern/SKILL.md`, `SKILL_DEPENDENCIES.md`, `CONFLICT_RESOLUTION.md` — foi executada como "correção obrigatória" dentro da FASE 0 da Sprint G.5.3, um caso real de escopo de `DOCUMENTATION_PLAYBOOK` embutido em outra missão maior, exatamente o padrão que este Playbook formaliza para quando a correção documental é o objetivo principal, não um efeito colateral.

---

Precedência: em caso de conflito entre este Playbook e `playbooks/PLAYBOOK_ARCHITECTURE.md` ou qualquer Contract/Protocol/Sub-agent, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.6 (Implementação dos Playbooks). -->
