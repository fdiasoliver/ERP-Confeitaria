# Playbook: Refactoring

Playbook do AI Operating System (Sprint G.5.6), conforme `playbooks/PLAYBOOK_ARCHITECTURE.md`. Especialização do `MISSION_PLAYBOOK.md` para dívida técnica e refatoração sem alterar comportamento externo.

## 1. Objetivo / Escopo

Migrar código já existente para o padrão-alvo já documentado (Skills de camada), sem introduzir funcionalidade nova e sem alterar comportamento observável.

**Quando utilizar:** item de `KNOWN_ISSUES.md` priorizado para uma sprint; código que diverge do padrão documentado sem ADR justificando a divergência.
**Quando NÃO utilizar:** a mudança introduz comportamento novo (isso é `IMPLEMENTATION_PLAYBOOK`); a correção é um bug ativo afetando usuário (isso é `BUGFIX_PLAYBOOK`, mais urgente).

## 2. Pré-condições / Pós-condições

**Pré-condições:** o padrão-alvo já está documentado em alguma Skill (`architecture`/`coding-standards`/Skill de camada) — este Playbook nunca decide o padrão-alvo, só migra para ele.
**Pós-condições:** código conforme o padrão documentado; comportamento externo idêntico (confirmado por `validation`).

## 3. Entradas / Saídas

**Entradas:** item de dívida técnica identificado (`KNOWN_ISSUES.md`) ou divergência encontrada em `review`.
**Saídas:** código migrado, dívida técnica removida do registro.

## 4. Artefatos produzidos

Código conforme (`src/`, `prisma/`); `KNOWN_ISSUES.md` atualizado (item fechado).

## 5. Skills necessárias / Contracts utilizados / Operational Protocols utilizados / Sub-agents participantes

**Skills:** `architecture`, `coding-standards`, mais a Skill de camada específica do código sendo refatorado (`repository-pattern`/`api-pattern`/`frontend-pattern`/`schema-pattern`, decidida em tempo de execução).
**Contracts:** `artifact-contract.md`.
**Operational Protocols:** `validation` (obrigatório — confirmar que comportamento não mudou), `review`, `documentation` (fechar o item em `KNOWN_ISSUES.md`).
**Sub-agents:** `ai-refactoring-engineer` lidera. **Lacuna já conhecida (herdada da G.5.3/G.5.4, não resolvida aqui):** não existe Skill dedicada a técnica de migração segura — `ai-refactoring-engineer` usa a Skill de camada normalmente, que documenta o padrão-alvo, não a técnica de chegar até ele sem quebrar nada.

## 6. Sequência completa de execução

1. `ai-project-manager` delega para `ai-refactoring-engineer` com o item de dívida técnica específico.
2. `ai-refactoring-engineer` confirma o padrão-alvo na Skill de camada correspondente (nunca inventa um padrão novo).
3. Migra o código, mudança mínima necessária.
4. Protocol `validation`: `ai-qa-engineer` confirma que o comportamento externo não mudou (regressão das 5 funcionalidades-âncora, no mínimo).
5. Protocol `review`: `ai-governance-officer` confirma que nada além do escopo declarado foi tocado.
6. Protocol `documentation`: item fechado em `KNOWN_ISSUES.md`.
7. Protocol `completion`.

## 7. Critérios de sucesso / interrupção / retorno ao Orchestrator

**Sucesso:** código conforme, comportamento idêntico, item de dívida técnica fechado.
**Interrupção:** a migração exigiria mudar comportamento observável (deixa de ser refatoração pura — escalar para `IMPLEMENTATION_PLAYBOOK`); o padrão-alvo não está claramente documentado em nenhuma Skill (escalar para `ARCHITECTURE_PLAYBOOK` decidir o padrão primeiro).
**Retorno ao Orchestrator:** ao final da validação, com confirmação de que o comportamento não mudou.

## 8. Exemplos completos

**Exemplo real (candidato futuro, não executado ainda):** as duas divergências de nomenclatura já documentadas em `coding-standards/SKILL.md` (`unitRepository.ts` usando `list` em vez de `find`; `productCategory.ts` sem sufixo `Validator`) são Observações Técnicas explicitamente marcadas como "retrofit não obrigatório sem sprint dedicada" — são exatamente o tipo de item que, se priorizado, seguiria este Playbook: `ai-refactoring-engineer` renomeia as funções, `ai-qa-engineer` confirma que nada quebrou, sem nenhuma mudança de comportamento.

---

Precedência: em caso de conflito entre este Playbook e `playbooks/PLAYBOOK_ARCHITECTURE.md` ou qualquer Contract/Protocol/Sub-agent, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.6 (Implementação dos Playbooks). -->
