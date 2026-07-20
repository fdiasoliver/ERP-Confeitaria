# Playbook: Bugfix

Playbook do AI Operating System (Sprint G.5.6), conforme `playbooks/PLAYBOOK_ARCHITECTURE.md`. Especialização do `MISSION_PLAYBOOK.md` para correção de comportamento incorreto ativo — mais rápido e restrito que `IMPLEMENTATION_PLAYBOOK`, pois o escopo já é conhecido (o bug), não precisa de FASE 0 de planejamento amplo.

## 1. Objetivo / Escopo

Corrigir um comportamento incorreto já identificado, com o menor raio de mudança possível, sem introduzir funcionalidade nova.

**Quando utilizar:** um comportamento real diverge do esperado (bug reportado ou encontrado); a correção é localizada a uma ou poucas camadas.
**Quando NÃO utilizar:** a "correção" na verdade exige redesenho (isso é `REFACTORING_PLAYBOOK` ou `ARCHITECTURE_PLAYBOOK`); o problema é incidente crítico com impacto amplo/produção (isso é `EMERGENCY_PLAYBOOK`, mais urgente e com regras de interrupção diferentes).

## 2. Pré-condições / Pós-condições

**Pré-condições:** bug reproduzido/confirmado (não uma suspeita); camada(s) afetada(s) identificada(s).
**Pós-condições:** comportamento correto confirmado por `validation`; nenhuma regressão nova introduzida nas 5 funcionalidades-âncora.

## 3. Entradas / Saídas

**Entradas:** descrição do bug + passos para reproduzir.
**Saídas:** código corrigido, confirmação de que o bug não ocorre mais.

## 4. Artefatos produzidos

Código corrigido (`src/`, `prisma/` se aplicável); entrada em `CHANGELOG.md` (correção é sempre registrada, mesmo pequena).

## 5. Skills necessárias / Contracts utilizados / Operational Protocols utilizados / Sub-agents participantes

**Skills:** a Skill de camada onde o bug vive (`api-pattern`/`repository-pattern`/`frontend-pattern`/`schema-pattern`), `architecture`.
**Contracts:** `artifact-contract.md`.
**Operational Protocols:** `validation` (confirmar a correção e ausência de regressão), `documentation` (CHANGELOG).
**Sub-agents:** `ai-backend-engineer` ou `ai-frontend-engineer` (conforme a camada do bug); `ai-qa-engineer` confirma.

## 6. Sequência completa de execução

1. `ai-project-manager` identifica a camada do bug e delega diretamente ao Sub-agent de execução correspondente (pula a etapa de `ai-solution-architect`, salvo se a causa raiz for ambígua entre camadas).
2. Sub-agent de execução reproduz, corrige com o menor raio de mudança.
3. Protocol `validation`: `ai-qa-engineer` confirma que o bug não ocorre mais E que as 5 funcionalidades-âncora continuam funcionando (regressão).
4. Protocol `documentation`: `ai-documentation-engineer` registra em `CHANGELOG.md` (factual: o que foi corrigido, não por quê em prosa longa).
5. Protocol `completion`.

## 7. Critérios de sucesso / interrupção / retorno ao Orchestrator

**Sucesso:** bug não reproduz mais, zero regressão nova.
**Interrupção:** a causa raiz do bug é ambígua entre duas camadas (escalar para `ai-solution-architect` decidir); a correção exigiria mudar um contrato/comportamento já documentado como intencional em alguma Skill (parar e confirmar com Product Owner antes de "corrigir" algo que pode ser comportamento correto).
**Retorno ao Orchestrator:** ao final da validação.

## 8. Exemplos completos

**Exemplo hipotético, mas com padrão real do projeto:** um `PATCH /api/config` aceitando `isActive` no payload apesar de `frontend-pattern/SKILL.md` já proibir explicitamente enviar campo somente-leitura no payload de PATCH — seria um Bugfix real: `ai-backend-engineer` remove a aceitação do campo na Validator, `ai-qa-engineer` confirma que o restante do endpoint continua funcionando, `ai-documentation-engineer` registra a correção no CHANGELOG.

---

Precedência: em caso de conflito entre este Playbook e `playbooks/PLAYBOOK_ARCHITECTURE.md` ou qualquer Contract/Protocol/Sub-agent, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.6 (Implementação dos Playbooks). -->
