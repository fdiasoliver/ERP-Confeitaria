# Playbook: Implementation

Playbook do AI Operating System (Sprint G.5.6), conforme `playbooks/PLAYBOOK_ARCHITECTURE.md`. Especialização de `MISSION_PLAYBOOK.md` para desenvolvimento de funcionalidades novas — instancia como Playbook real o exemplo antes apenas ilustrativo de `PLAYBOOK_ARCHITECTURE.md` item 8 ("Adicionar Módulo CRUD Completo"). Orquestra Operational Protocols e Sub-agents — nunca reimplementa regra de negócio de Skill.

## 1. Objetivo / Escopo

Padronizar o fluxo ponta a ponta de desenvolvimento de uma funcionalidade nova no ERP que toca mais de uma camada (schema → repository → service → api → front-end), reutilizando a sequência já resolvida em vez de replanejar do zero a cada módulo novo.

**Quando utilizar:** uma missão pede um recurso/módulo novo (ou extensão de um existente) que precisa de model Prisma, Repository, Service/Validator, Route Handler e página admin — o padrão já observado nas Sprints reais deste projeto (ex. Sprint 2.D.1, Configuração da Empresa).
**Quando NÃO utilizar:** a mudança toca uma única camada isolada (usar diretamente o Sub-agent de camada, sem o Playbook completo); é uma correção de comportamento existente sem funcionalidade nova (`BUGFIX_PLAYBOOK.md`); é uma migração de padrão sem funcionalidade nova (`REFACTORING_PLAYBOOK.md`); a mudança é de arquitetura do próprio AI Operating System (`ARCHITECTURE_PLAYBOOK.md`).

## 2. Pré-condições / Pós-condições

**Pré-condições:** missão já recebida e planejada (`protocols/mission/PROTOCOL.md` concluído); escopo e fora-de-escopo declarados.
**Pós-condições:** funcionalidade implementada em todas as camadas necessárias, validada, documentada, e a missão encerrada (`protocols/completion/PROTOCOL.md`).

## 3. Entradas / Saídas

**Entradas:** descrição da funcionalidade/módulo a implementar, com escopo já delimitado pelo `ai-project-manager`.
**Saídas:** código conforme em todas as camadas tocadas, `PLAN.md`/`CHANGELOG.md` atualizados, Relatório Executivo da missão.

## 4. Artefatos produzidos

Model Prisma (`prisma/schema.prisma`), Repository/Service/Validator/Route Handler (`src/lib/`, `src/app/api/`), página admin (`src/app/admin/`), entrada em `PLAN.md`/`CHANGELOG.md` (conforme `contracts/artifact-contract.md`), Relatório Executivo final.

## 5. Skills necessárias / Contracts utilizados / Operational Protocols utilizados / Sub-agents participantes

**Skills:** `architecture`, `schema-pattern`, `repository-pattern`, `api-pattern`, `frontend-pattern`, `coding-standards`.
**Contracts:** `agent-contract.md`, `artifact-contract.md`, `delegation-contract.md`, `communication-contract.md`.
**Operational Protocols:** `mission` (abertura), `delegation` (cada transição), `handoff` (entre camadas), `context`/`communication` (durante execução), `validation`, `documentation`, `completion` (encerramento).
**Sub-agents participantes:** `ai-project-manager` (coordena), `ai-solution-architect` (decide schema/camada), `ai-backend-engineer`, `ai-frontend-engineer`, `ai-qa-engineer`, `ai-documentation-engineer`, `ai-release-manager`.

## 6. Sequência completa de execução

```
ai-project-manager recebe a missão (protocols/mission)
        ↓ delegation
ai-solution-architect decide schema (Prisma) e contratos de API
        ↓ handoff
ai-backend-engineer implementa schema-pattern + repository-pattern + api-pattern
        ↓ handoff (pré-condição: API implementada e testada)
ai-frontend-engineer implementa frontend-pattern (página admin)
        ↓ handoff
ai-qa-engineer valida (protocols/validation: tsc/lint/build/regressão) — nunca corrige
        ↓ handoff (se reprovado, retorna ao Sub-agent responsável pela camada com falha)
ai-documentation-engineer atualiza PLAN.md/CHANGELOG.md/docs afetados (protocols/documentation)
        ↓ handoff
ai-release-manager encerra a missão (protocols/completion): DoD, Relatório Executivo
```

## 7. Critérios de sucesso / interrupção / retorno ao Orchestrator

**Sucesso:** todas as camadas tocadas conformes às Skills respectivas; `ai-qa-engineer` reporta validação sem falha; `PLAN.md`/`CHANGELOG.md` atualizados nesta ordem (nunca antes da validação, regra real de `governance`).
**Interrupção:** `ai-qa-engineer` reporta falha — retorna ao Sub-agent da camada correspondente, não avança para documentação (mesmo critério de `protocols/validation/PROTOCOL.md`); `ai-solution-architect` identifica que a mudança exigiria contrariar uma regra congelada (ex. ADR-005) — escala para `ai-governance-officer`/Product Owner.
**Retorno ao Orchestrator:** ao final de `completion`, ou se qualquer Sub-agent encontrar um bloqueio que nenhuma persona envolvida tem autoridade para resolver (`protocols/error-handling/PROTOCOL.md`).

## 8. Exemplos completos

**Exemplo positivo:** o próprio caso real já documentado em `architecture/ARCHITECTURE_OVERVIEW.md` item 2 (Sprint 2.D.1, módulo de Configuração da Empresa) — se executado hoje via este Playbook, seguiria exatamente a sequência do item 6, com `ai-backend-engineer` cobrindo `storeConfigRepository.ts`/Service/Validator/rota, e `ai-frontend-engineer` cobrindo as 6 seções de `/admin/config`.

**Exemplo negativo:** delegar diretamente a `ai-frontend-engineer` antes de `ai-backend-engineer` concluir — viola a pré-condição real de `frontend-pattern` ("API já implementada e testada") e o `handoff` Protocol (item 10 de `protocols/handoff/PROTOCOL.md`).

---

Precedência: em caso de conflito entre este Playbook e `playbooks/PLAYBOOK_ARCHITECTURE.md`, `MISSION_PLAYBOOK.md` ou qualquer Contract/Protocol/Sub-agent, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.6 (Implementação dos Playbooks). -->
