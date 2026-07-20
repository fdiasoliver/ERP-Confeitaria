---
name: product-review
description: Use this skill after AI Frontend Engineer finishes an admin or client page, before AI QA Engineer runs technical validation — reviews UX, UI, navigation, usability and responsiveness against the project's existing DESIGN_SYSTEM.md and UX_GUIDELINES.md, and classifies findings (Functional/UX/UI/Navigation/Accessibility/Improvement). Do not confuse with `engineering-reviewer` (architecture/governance conformance) or `sprint-execution` (tsc/lint/build) — this skill covers product quality only.
---

# Product Review — Doce Menina (confeitaria-app)

Esta Skill cobre a revisão de **qualidade de produto** de uma página/fluxo de Frontend já implementado — UX, UI, navegação, usabilidade, responsividade, consistência visual, clareza da informação, hierarquia visual, quantidade de cliques, feedback ao usuário, estados de carregamento/vazio/erro, mensagens e legibilidade. Não repete `frontend-pattern` (padrão de código da página) nem `engineering-reviewer` (revisão de conformidade arquitetural/documental/governança — distinto, feito por `AI Governance Officer`) nem `sprint-execution` (validação técnica tsc/lint/build, feito por `AI QA Engineer`). Fonte de verdade do conteúdo de produto: `DESIGN_SYSTEM.md` e `UX_GUIDELINES.md` (raiz do projeto) — esta Skill referencia os dois, nunca os duplica.

## 1. Objetivo

Garantir que toda página de Frontend entregue seja revisada quanto à experiência real do usuário — não apenas quanto à correção técnica do código — antes de seguir para validação técnica (`AI QA Engineer`) e encerramento de sprint.

## 2. Quando utilizar

- Sempre que uma sprint implementou ou alterou uma página/componente de Frontend (`src/app/admin/**`, `src/app/(cliente)/**`, `src/components/**`), imediatamente após `AI Frontend Engineer` concluir.
- Antes de `AI QA Engineer` iniciar a validação técnica — nova etapa obrigatória do fluxo a partir da Sprint G.6 (`PROJECT_GOVERNANCE.md` Seção 16.5, `ERP_DEVELOPMENT_WORKFLOW.md`).
- Ao revisar se uma página nova reutiliza componentes/padrões já estabelecidos (`Field`, `LoadingState`, `EmptyState`, `ErrorState`, `ValidationSummary`, `FilterChips`) em vez de reinventar.

## 3. Quando NÃO utilizar

- Durante a implementação — a revisão sempre acontece depois de o Frontend estar pronto, nunca durante.
- Para validar `tsc`/`lint`/`build`/regressão técnica — isso é `sprint-execution`/`AI QA Engineer`.
- Para auditar se `PLAN.md`/`CHANGELOG.md` foram atualizados corretamente, ou se a arquitetura de camadas foi respeitada — isso é `engineering-reviewer`/`AI Governance Officer`.
- Quando a sprint não tocou nenhuma página/componente de Frontend (ex. sprint só de Backend, como a 2.G.1) — não há produto de interface para revisar; pular direto para `AI QA Engineer`.
- Para criar ou alterar `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md` — são documentos de produto já existentes e maduros (20 componentes documentados, 18 diretrizes de UX), fora do escopo desta Skill.

## 4. Responsabilidades

- Ler o código da(s) página(s)/componente(s) entregues e confrontar contra `DESIGN_SYSTEM.md` (a seção do componente específico usado — botões, inputs, modais, badges, cards, filtros, loading, skeleton, estados vazio/erro) e `UX_GUIDELINES.md` (princípios P1-P7, formulários, mensagens, feedback, confirmações, erros, navegação, responsividade mobile/desktop/tablet).
- Percorrer os 4 checklists desta Skill (`checklists/ux-checklist.md`, `checklists/ui-checklist.md`, `checklists/functional-checklist.md`, `checklists/navigation-checklist.md`).
- Classificar cada achado em exatamente uma categoria: **A. Problema Funcional** (algo não funciona como deveria — bloqueante), **B. Problema de UX**, **C. Problema de UI**, **D. Problema de Navegação**, **E. Problema de Acessibilidade**, **F. Melhoria** (B–F nunca bloqueiam — viram backlog priorizado).
- Registrar explicitamente quando a revisão não pôde ser feita com navegador real (limitação de ambiente já registrada em todo QA funcional deste projeto desde a Sprint 2.D.5) — a revisão então é por leitura de código (classes Tailwind, estrutura JSX, texto exibido, presença dos estados exigidos).

## 5. Fluxo resumido

```
Frontend implementado (AI Frontend Engineer)
        ↓
Ler DESIGN_SYSTEM.md (componente usado) + UX_GUIDELINES.md (seções aplicáveis)
        ↓
Percorrer os 4 checklists (UX, UI, Funcional, Navegação)
        ↓
Classificar cada achado (A–F)
        ↓
Relatório: achados classificados + recomendação + veredito de bloqueio (só A bloqueia)
        ↓
Se A: devolve para AI Frontend Engineer corrigir, antes de AI QA Engineer
Se só B–F: segue para AI QA Engineer, achados viram backlog priorizado
```

Ver `PRODUCT_REVIEW_PLAYBOOK.md` (`.claude/playbooks/`) para a sequência completa de delegação entre Sub-agents.

## 6. Arquivos auxiliares disponíveis

| Pasta/arquivo | Conteúdo |
|---|---|
| `checklists/ux-checklist.md` | Checklist de UX: clareza, economia de esforço, feedback, confirmações, mensagens, produtividade do usuário |
| `checklists/ui-checklist.md` | Checklist de UI: consistência visual, componentes do `DESIGN_SYSTEM.md`, hierarquia visual, legibilidade |
| `checklists/functional-checklist.md` | Checklist Funcional: o que classifica como categoria A (bloqueante) |
| `checklists/navigation-checklist.md` | Checklist de Navegação: fluxo, quantidade de cliques, breadcrumb, links vs. botões |

## 7. Como carregar os arquivos auxiliares

Carregar os 4 checklists sempre que esta Skill for usada — nenhum é opcional, já que a ordem de missão que criou esta Skill (Sprint G.6) exige as 4 dimensões em toda revisão. Carregar `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md` (raiz do projeto) sob demanda, apenas as seções relevantes ao componente/página em revisão — nenhum dos dois é pré-carregado por inteiro (ambos têm mais de 900 linhas).

## 8. Critérios de sucesso

- Os 4 checklists foram percorridos para cada página/componente revisado.
- Todo achado tem exatamente uma categoria (A–F) — nunca duas, nunca nenhuma.
- O relatório declara explicitamente se há achado de categoria A (bloqueante) ou não.
- Achados B–F foram registrados como backlog priorizado, nunca bloquearam a passagem para `AI QA Engineer`.

## 9. Limitações

- Não substitui teste real em navegador — quando não disponível, a revisão é por leitura de código contra os documentos de produto, com essa limitação declarada no relatório (mesmo princípio já usado em todo QA funcional deste projeto).
- Não decide prioridade do backlog gerado pelas categorias B–F — isso é decisão do Product Owner, esta Skill só classifica e recomenda.
- Não cobre acessibilidade além do que já está em `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md` (nenhuma auditoria WCAG formal automatizada existe neste projeto — mesma lacuna real já registrada em `CLAUDE.md` raiz, seção "A definir", para "Acessibilidade").

## 10. Anti-patterns

- Corrigir o código durante a revisão em vez de apenas classificar e reportar — quebra a separação de papéis já estabelecida (`AI QA Engineer`/`AI Governance Officer` também nunca corrigem o que encontram).
- Classificar um Problema de UX (B) ou UI (C) como Funcional (A) só para forçar prioridade — infla o bloqueio além do que a regra permite (`PROJECT_GOVERNANCE.md` Seção 16.5: só A bloqueia).
- Reinventar um componente já documentado em `DESIGN_SYSTEM.md` em vez de sinalizar a divergência como achado — exemplo real evitado: `FilterChips` já foi copiado (não promovido a componente compartilhado) em Units (2.D.5) e Ingredientes (2.G.2) por decisão explícita das sprints correspondentes; um Product Review não deveria reabrir essa decisão já registrada, apenas confirmar que o padrão visual é o mesmo.

## 11. Referências cruzadas

Skills irmãs: `frontend-pattern` (padrão de código da página, consultado por quem implementa, não por quem revisa produto), `engineering-reviewer` (revisão de conformidade arquitetural/documental, papel de `AI Governance Officer`), `sprint-execution` (validação técnica, papel de `AI QA Engineer`). Documentos-fonte: `DESIGN_SYSTEM.md`, `UX_GUIDELINES.md` (raiz do projeto), `PROJECT_GOVERNANCE.md` Seção 16.5 (regra de bloqueio), `product-review-contract.md` (`.claude/contracts/`), `PRODUCT_REVIEW_PLAYBOOK.md` (`.claude/playbooks/`).

**Compatibilidade com Sub-agents:** pré-carregada por `product-reviewer` (`.claude/agents/product-reviewer.md`, Sprint G.6) — único Sub-agent que a usa. `AI Frontend Engineer`/`AI QA Engineer`/`AI Governance Officer` não deveriam pré-carregá-la (papéis distintos, ver Seção 3 acima). Conhecimento fornecido: os 4 checklists de produto + a regra de classificação A–F. Artefatos produzidos: nenhum arquivo — apenas o relatório de achados devolvido ao chamador (`contracts/artifact-contract.md`). Entradas: código de página/componente já implementado. Saídas: achados classificados + veredito de bloqueio.

---

Precedência: em caso de conflito entre esta Skill e `DESIGN_SYSTEM.md`, `UX_GUIDELINES.md`, `PROJECT_GOVERNANCE.md` ou `contracts/product-review-contract.md`, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.6 (Product Review System + Design System + Homologação Funcional). -->
