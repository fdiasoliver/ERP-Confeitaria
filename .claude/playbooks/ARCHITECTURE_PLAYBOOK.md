# Playbook: Architecture

Playbook do AI Operating System (Sprint G.5.6), conforme `playbooks/PLAYBOOK_ARCHITECTURE.md`. Especialização de `MISSION_PLAYBOOK.md` para evolução da própria arquitetura do AI Operating System (não confundir com decisão de arquitetura de uma missão específica do ERP — isso é `ai-solution-architect` dentro de `IMPLEMENTATION_PLAYBOOK.md`). Orquestra Operational Protocols e Sub-agents.

## 1. Objetivo / Escopo

Padronizar o fluxo de evolução da arquitetura do próprio AI Operating System — criação ou alteração de camadas, contratos, protocolos ou do modelo de personas (`architecture/*`, `contracts/*`, `protocols/*`, `agents/AGENT_ARCHITECTURE.md`). Nunca cobre decisão de arquitetura de código do ERP para uma missão pontual.

**Quando utilizar:** uma proposta exige adicionar/alterar uma camada do `LAYER_MODEL.md`, criar/alterar um Contract ou Protocol, ou redesenhar o catálogo de personas de Sub-agent.
**Quando NÃO utilizar:** a decisão é sobre em qual camada de código do ERP uma mudança pertence (isso é `ai-solution-architect` dentro de `IMPLEMENTATION_PLAYBOOK.md`); a mudança é conteúdo de negócio (`REGRAS_NEGOCIO.md`/Product Owner); a mudança é correção pontual sem redesenho estrutural (isso é `BUGFIX_PLAYBOOK.md` ou `REFACTORING_PLAYBOOK.md`).

## 2. Pré-condições / Pós-condições

**Pré-condições:** proposta de evolução arquitetural aprovada pelo Product Owner; nenhum bloqueio real pendente na arquitetura atual (confirmado por FASE 0 de leitura completa).
**Pós-condições:** nova camada/contrato/protocolo documentado e integrado (referenciado nos documentos de nível superior — `AI_OPERATING_SYSTEM.md`, `LAYER_MODEL.md`); nenhuma redefinição de Contract/Sub-agent já existente sem ADR.

## 3. Entradas / Saídas

**Entradas:** uma ordem de missão de arquitetura (ex. as próprias Sprints G.5.3/G.5.5 desta sessão), ou um bloqueio real encontrado em FASE 0 de outra missão que exige decisão de nível de projeto.
**Saídas:** documentos de arquitetura novos/atualizados, hierarquia revisada, relatório final com decisões arquiteturais registradas.

## 4. Artefatos produzidos

Documentos em `.claude/architecture/` (novos ou atualizados), novos `.claude/contracts/*.md` ou `.claude/protocols/*/PROTOCOL.md` quando aplicável, relatório final da missão (conforme `contracts/artifact-contract.md`). Nunca produz código (`src/`, `prisma/`).

## 5. Skills necessárias / Contracts utilizados / Operational Protocols utilizados / Sub-agents participantes

**Skills:** `architecture`, `schema-pattern` (quando a mudança toca modelagem), `governance` (quando exige ADR).
**Contracts:** todos os 5 são candidatos a consulta — `agent-contract.md`/`skill-contract.md` quando a mudança cria camada nova que precisa de contrato próprio.
**Operational Protocols:** `mission` (abertura), `review` (revisão arquitetural antes de fechar), `documentation` (registrar decisão), `completion` (encerramento).
**Sub-agents participantes:** `ai-solution-architect` (decisão técnica), `ai-governance-officer` (revisão de conformidade e necessidade de ADR — nunca redige a ADR sozinho), `ai-documentation-engineer` (atualização dos documentos de arquitetura).

## 6. Sequência completa de execução

```
FASE 0: leitura completa da arquitetura, contratos, protocolos, sub-agents e skills existentes
        ↓
Validar consistência — bloqueio real? → interromper e escalar ao Product Owner
        ↓ (sem bloqueio)
ai-solution-architect decide o desenho da nova camada/contrato/protocolo
        ↓
Documentos-fundação atualizados primeiro (AI_OPERATING_SYSTEM.md, LAYER_MODEL.md) — nunca em paralelo com o resto, risco de renumeração incorreta
        ↓
Conteúdo detalhado delegado (em lotes pequenos, cada Sub-agent/sessão com escopo de arquivo único e explícito)
        ↓
protocols/review — ai-governance-officer revisa consistência, referências, duplicidade
        ↓
Correções aplicadas (sem nova sprint, conforme a própria ordem de missão de arquitetura)
        ↓
protocols/documentation — ai-documentation-engineer atualiza PLAN.md/CHANGELOG.md se houver alteração real
        ↓
protocols/completion — relatório final, encerramento
```

## 7. Critérios de sucesso / interrupção / retorno ao Orchestrator

**Sucesso:** nova camada/contrato/protocolo documentado, integrado nos documentos de nível superior, sem referência quebrada, sem redefinição não autorizada de Contract/Sub-agent existente.
**Interrupção:** bloqueio arquitetural real encontrado em FASE 0 (ex. um conceito exigido pela ordem de missão não existe em nenhum lugar do projeto — caso real: "Operational Protocols" citado na G.5.6 original sem nunca ter sido definido, que gerou a própria Sprint G.5.5).
**Retorno ao Orchestrator:** ao final de cada missão de arquitetura, com o relatório completo — nunca inicia a implementação de Sub-agents/Playbooks derivados sem esse retorno primeiro.

## 8. Exemplos completos

**Exemplo positivo (Sprint G.5.3 real):** ordem de missão pediu arquitetura completa do AI Operating System. FASE 0 não encontrou bloqueio real. `ai-solution-architect` (papel exercido diretamente, pois Sub-agents ainda não existiam) definiu a hierarquia de 7 camadas em `AI_OPERATING_SYSTEM.md`/`LAYER_MODEL.md` primeiro, depois delegou os 8 documentos de modelo + 5 contratos + 9 personas em lotes paralelos. Um achado real (colisão `.claude/agents/` reservado pelo Claude Code) foi resolvido com desvio documentado, não silenciado. Encerrada com relatório de 20 itens.

**Exemplo positivo (Sprint G.5.5 real):** ordem de missão original da G.5.6 citava "Operational Protocols" sem essa camada existir — FASE 0 corretamente classificou isso como bloqueio real e **interrompeu**, em vez de inventar a camada sozinha. O Product Owner confirmou que era uma sprint faltando; a G.5.5 foi executada exatamente com este Playbook (fundação primeiro, 10 protocolos em 3 lotes, revisão, documentos-hub) antes de a G.5.6 poder ser retomada.

**Exemplo negativo:** decidir sozinho, sem interromper, o que "Operational Protocols" deveria significar, e implementar Playbooks integrados a uma camada inventada sem confirmação do Product Owner — violaria tanto este Playbook (Pré-condições, item 2) quanto o princípio geral de "sinalizar, não resolver sozinho" já estabelecido em toda a sessão.

---

Precedência: em caso de conflito entre este Playbook e `playbooks/PLAYBOOK_ARCHITECTURE.md`, `MISSION_PLAYBOOK.md` ou qualquer Contract/Protocol/Sub-agent, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.6 (Implementação dos Playbooks). -->
