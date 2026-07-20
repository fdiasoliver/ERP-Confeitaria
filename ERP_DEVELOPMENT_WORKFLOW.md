# ERP_DEVELOPMENT_WORKFLOW.md — Fluxo Oficial de Ordens de Missão

Documento de governança produzido na Sprint T.1. A partir de agora, **todas** as futuras Ordens de Missão deste projeto (implementação de funcionalidade do ERP) seguem exclusivamente este fluxo. Não repete o conteúdo de `AI_PROMPT_ORCHESTRATOR.md` (papéis, FASE 0, artefatos — continua vigente e é a fonte primária de tudo isso) nem de nenhuma Skill/Contract/Protocol/Sub-agent/Playbook — apenas os orquestra num único fluxo operacional, agora que a infraestrutura de IA está congelada (`AIOS_BASELINE_v1.md`).

**Regra central desta sprint:** é proibido criar prompts separados de auditoria, documentação ou correção. Toda Ordem de Missão é autocontida — um único prompt cobre FASE 0, implementação, autoauditoria, correções, validações, documentação e relatório.

---

## 1. Ciclo de vida da Ordem de Missão

```
FASE 0 (Planejamento)
    ↓
Implementação (Backend → API → Frontend, conforme o escopo)
    ↓
Platform Review (Sprint G.6.1 — obrigatório quando a missão implementou/alterou Backend e/ou Frontend; ver item 5.4)
    ↓
Product Review (Sprint G.6 — obrigatório quando a missão implementou/alterou Frontend; ver item 5.5)
    ↓
Demo Validation (Sprint T.3 — obrigatório quando a missão implementou/alterou Frontend; ver item 5.6)
    ↓
Autoauditoria
    ↓
Correções automáticas
    ↓
Validações
    ↓
Atualização documental (quando necessária)
    ↓
Relatório Executivo
```

Mesmo esqueleto de `MISSION_PLAYBOOK.md` (`.claude/playbooks/`), já certificado na Sprint G.5.7 — este documento não o redefine, apenas confirma que é o fluxo vigente para toda Ordem de Missão do ERP a partir de agora, com a etapa Product Review inserida na Sprint G.6 (`PROJECT_GOVERNANCE.md` Seção 16.5) e a etapa Platform Review inserida na Sprint G.6.1 (`PROJECT_GOVERNANCE.md` Seção 16.4), antes de Product Review.

## 2. Papéis envolvidos

Product Owner, Orchestrator, Executor, Auditor — definidos em `AI_PROMPT_ORCHESTRATOR.md`, não redefinidos aqui. Cada papel pode ser exercido por uma sessão única (padrão usado até aqui) ou por um Sub-agent real dedicado (`.claude/agents/*.md`, Sprint G.5.4), à escolha de quem opera a sessão — este documento não obriga o uso de Sub-agents, apenas os disponibiliza.

## 3. Fluxo do Orchestrator

Segue `skills/orchestrator/SKILL.md` — FASE 0 (análise arquitetural, 7 perguntas obrigatórias), produção de `SPRINT_X.md`/`SPRINT_AUDIT.md`. Quando um Sub-agent dedicado for usado, é `ai-project-manager` (`.claude/agents/ai-project-manager.md`) quem assume esse papel.

## 4. Fluxo dos Sub-agents

Quando usados, os 11 Sub-agents reais (`.claude/agents/*.md` — `product-reviewer` adicionado na Sprint G.6, `platform-reviewer` na Sprint G.6.1) seguem `contracts/agent-contract.md` e os Operational Protocols aplicáveis (item 6). `ai-project-manager` é a única persona com autoridade de delegação (`tools: Agent(...)` restrito às outras 10) — nenhuma cadeia de delegação além disso é autorizada sem uma nova ADR.

## 5.4. Platform Review (a partir da Sprint G.6.1)

Toda missão que implementa ou altera Backend e/ou Frontend executa Platform Review (`platform-reviewer`, `skills/platform-review/SKILL.md`) depois da implementação e antes do Product Review (item 5.5)/QA (item 10). Achados são classificados como bloqueante (quebra de parametrização já existente) ou não-bloqueante (lacuna de multi-tenência ainda não implementada, fora de escopo) — `PROJECT_GOVERNANCE.md` Seção 16.4. `product-review`/`product-reviewer` (Sprint G.6) permanecem inalterados; Platform Review é uma disciplina paralela e distinta, nunca sobreposta (ver `PLATFORM_OVERVIEW.md`).

## 5.5. Product Review (a partir da Sprint G.6)

Toda missão que implementa ou altera Frontend executa Product Review (`product-reviewer`, `skills/product-review/SKILL.md`, `playbooks/PRODUCT_REVIEW_PLAYBOOK.md`) depois do Platform Review (item 5.4, quando aplicável) e antes do QA (item 10) — nunca depois do QA, nunca como substituto dele. Achados são classificados A–F (`PROJECT_GOVERNANCE.md` Seção 16.5); somente categoria A (Problema Funcional) bloqueia a passagem para o QA. Missões exclusivamente de Backend/API pulam esta etapa (mas não pulam o Platform Review, que se aplica também a Backend puro).

## 5.6. Demo Validation (a partir da Sprint T.3)

Toda missão que implementa ou altera Frontend executa Demo Validation depois do Product Review (item 5.5) e antes da Autoauditoria (item 8)/Validações (item 10), seguindo `DEMO_GUIDE.md` ("Fluxo sugerido") contra o conteúdo de `DEMO_DATASET.md`. Achados são classificados como Quebra de fluxo (bloqueante) ou Lacuna de escopo futuro (não-bloqueante) — `PROJECT_GOVERNANCE.md` Seção 16.6. Distinto de Product Review (item 5.5): Product Review avalia a experiência de uma página isolada; Demo Validation avalia o fluxo de negócio ponta a ponta atravessando várias páginas/módulos. Missões exclusivamente de Backend/API pulam esta etapa, mesma regra já aplicada a Product Review.

## 5. Uso obrigatório das Skills

Toda implementação de código consulta a Skill de camada correspondente antes de escrever: `architecture` (sempre, para o fluxo de camadas), `schema-pattern`/`repository-pattern`/`api-pattern`/`frontend-pattern` (conforme a camada tocada), `coding-standards` (sempre, nomenclatura). Toda sprint de processo consulta `sprint-governance`/`sprint-planning`/`sprint-execution`/`sprint-audit`/`governance`/`engineering-reviewer` conforme a etapa.

## 6. Uso obrigatório dos Operational Protocols

`.claude/protocols/` — os 10 Protocols continuam vigentes e se aplicam independentemente de a missão usar sessão única ou Sub-agents reais: `mission` (abertura), `delegation` (se houver delegação), `context`/`communication` (durante a execução), `validation`/`review` (antes de considerar pronto), `documentation` (ao final), `handoff` (entre etapas, se houver mais de um executor), `completion` (encerramento), `error-handling` (transversal — ver item 9).

## 7. Uso obrigatório dos Playbooks

`.claude/playbooks/` — escolher o Playbook pelo tipo de missão antes de começar (`PLAYBOOK_INDEX.md` orienta a escolha): `IMPLEMENTATION_PLAYBOOK.md` para funcionalidade nova (o caso mais comum no desenvolvimento do ERP a partir de agora), `BUGFIX_PLAYBOOK.md` para correção de comportamento incorreto, `REFACTORING_PLAYBOOK.md` para dívida técnica sem mudar comportamento, `RELEASE_PLAYBOOK.md` para encerramento de módulo/épico, `PRODUCT_REVIEW_PLAYBOOK.md` (Sprint G.6) sempre que a missão implementou/alterou Frontend, entre a implementação e o QA. Os demais (`ARCHITECTURE_PLAYBOOK.md`, `AUDIT_PLAYBOOK.md`, `DOCUMENTATION_PLAYBOOK.md`, `GOVERNANCE_PLAYBOOK.md`, `EMERGENCY_PLAYBOOK.md`) só se aplicam nos casos raros de evolução de infraestrutura (item 7 de `AIOS_BASELINE_v1.md`) ou incidente — não no desenvolvimento funcional comum.

## 8. Processo de Autoauditoria

Dentro da mesma Ordem de Missão (nunca em prompt separado): seguir `protocols/validation/PROTOCOL.md` (checagem técnica: tsc/lint/build/regressão) e `protocols/review/PROTOCOL.md` (conformidade/qualidade) em sequência, ambos executados por quem implementou — a auditoria independente (papel Auditor) acontece depois, dentro da mesma sprint, nunca como sprint separada.

## 9. Processo de Correção Automática

Corrigir tudo que a Autoauditoria (item 8) encontrar, **na mesma Ordem de Missão** — nunca criar uma sprint corretiva nova (mesmo princípio já usado com sucesso nesta sessão: G.5.2.1→correção na G.5.3, sem criar G.5.2.2). Se o achado for um bloqueio arquitetural real (não uma correção simples), seguir `protocols/error-handling/PROTOCOL.md`: classificar, reportar, nunca decidir sozinho fora do próprio escopo, escalar ao Orchestrator/Product Owner.

## 10. Processo de Validação

`npm run build` / `tsc` / `lint`, nesta ordem, antes de qualquer atualização documental (regra já vigente em `sprint-execution`) — nunca depois. As 5 funcionalidades-âncora de regressão (`engineering-reviewer`) são conferidas em toda Ordem de Missão, independentemente do módulo tocado. Quando a missão implementou/alterou Backend/Frontend, o Processo de Validação só se inicia depois que o Platform Review (item 5.4) entregou veredito sem achado bloqueante pendente; quando há Frontend, também depois que o Product Review (item 5.5) entregou veredito sem achado de categoria A pendente e depois que o Demo Validation (item 5.6) entregou veredito sem Quebra de Fluxo pendente.

## 11. Processo de Atualização Documental

`PLAN.md`/`CHANGELOG.md` atualizados **somente após validação técnica completa** (item 10), e somente quando houver alteração real — nunca registro artificial. `CHANGELOG.md` é estritamente factual (regra já vigente nesta sessão): relata o que foi feito, nunca opina ou planeja. `PROJECT_GOVERNANCE.md` só é tocado quando a sprint envolve decisão de governança formal (ADR) — não é o caso da maioria das sprints de funcionalidade.

## 12. Critérios de encerramento

Uma Ordem de Missão está encerrada quando: validações (item 10) passaram, documentação (item 11) está atualizada, e o Relatório Executivo foi produzido — seguindo `protocols/completion/PROTOCOL.md`. Se a missão envolveu múltiplos Sub-agents, `ai-release-manager` confirma o checklist de DoD antes do encerramento formal.

---

Precedência: em caso de conflito entre este documento e `AI_PROMPT_ORCHESTRATOR.md`, `PROJECT_GOVERNANCE.md` ou qualquer Skill/Contract/Protocol/Playbook específico, os documentos/fonte originais sempre prevalecem — este documento apenas os orquestra num único fluxo, não os substitui.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint T.1 (Transição Oficial para Desenvolvimento do ERP). v1.1 em 15/07/2026 — Sprint G.6 (Product Review System): fluxo (item 1) e item 4 atualizados com a etapa Product Review; item 5.5 adicionado; itens 7 e 10 atualizados. v1.2 em 15/07/2026 — Sprint G.6.1 (Platform & Product Architecture Consolidation): fluxo (item 1) e item 4 atualizados com a etapa Platform Review; item 5.4 adicionado; item 10 atualizado. `product-review`/`product-reviewer` preservados sem alteração. v1.3 em 16/07/2026 — Sprint T.3 (Demo Environment & Product Validation Platform): fluxo (item 1) atualizado com a etapa Demo Validation; item 5.6 adicionado; item 10 atualizado. `product-review`/`product-reviewer`/Platform Review preservados sem alteração. -->
