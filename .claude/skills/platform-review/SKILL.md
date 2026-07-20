---
name: platform-review
description: Use this skill after Backend/Frontend implementation to check platform architecture conformance — multi-tenant isolation, branding/white-label parameterization, Theme Engine usage — against PLATFORM_OVERVIEW.md and ERP_PRODUCT_VISION.md. Do not confuse with `product-review` (UX/UI/navigation quality, not platform architecture) or `engineering-reviewer` (process/documentation conformance, not platform conformance). Never implements or fixes code.
---

# Platform Review — Doce Menina (confeitaria-app)

Esta Skill cobre a revisão de **conformidade de arquitetura de plataforma** — Multi-tenant, Branding, White Label, Theme Engine, isolamento de dados, parametrização — de um módulo já implementado. Não repete `product-review` (qualidade de experiência do usuário — distinto e complementar, nunca sobreposto), nem `engineering-reviewer`/`governance` (conformidade de processo/documentação do ERP). Fonte de verdade: `PLATFORM_OVERVIEW.md` e `ERP_PRODUCT_VISION.md` (raiz do projeto, Sprint G.6.1) — esta Skill referencia os dois, nunca os duplica.

## 1. Objetivo

Garantir que nenhum módulo do ERP introduza identidade de tenant hardcoded (nome, logo, cor, domínio) ou quebre isolamento de dados/parametrização já estabelecidos pela visão de plataforma — sem exigir, fora de escopo, que multi-tenência ainda não implementada seja antecipada.

## 2. Quando utilizar

- Depois que `AI Backend Engineer`/`AI Frontend Engineer` concluem uma sprint, antes de `product-reviewer` (quando há Frontend) ou antes do QA (quando é só Backend/API) — nova etapa a partir da Sprint G.6.1 (`PROJECT_GOVERNANCE.md`, atualizada nesta sprint).
- Ao revisar se um módulo novo usa `StoreConfig`/Theme Engine (quando implementado) em vez de valores fixos de negócio.

## 3. Quando NÃO utilizar

- Para avaliar UX/UI/navegação/usabilidade — isso é `product-review`.
- Para auditar conformidade de processo, `PLAN.md`/`CHANGELOG.md`, ou arquitetura de camadas (Route→Service→Repository) — isso é `engineering-reviewer`/`governance`.
- Para exigir que uma sprint implemente multi-tenência no schema quando essa não era a Ordem de Missão recebida — a lacuna atual (`ERP_PRODUCT_VISION.md`, "Estado atual vs. visão de plataforma") é registrada, nunca convertida em bloqueio de uma sprint sem esse escopo.

## 4. Responsabilidades

- Ler o código entregue e confrontar contra `PLATFORM_OVERVIEW.md`/`ERP_PRODUCT_VISION.md` (customizações permitidas/proibidas, arquitetura de Multi-tenant/Theme Engine).
- Percorrer `checklists/platform-checklist.md`.
- Classificar achados: identidade de tenant hardcoded, ausência de isolamento de dados, parametrização de negócio ausente onde já exigida.
- Declarar explicitamente quando um achado é lacuna de escopo futuro (não bloqueante) vs. quebra real de algo já parametrizado (bloqueante).

## 5. Fluxo resumido

```
Backend/Frontend implementado
        ↓
Ler PLATFORM_OVERVIEW.md + ERP_PRODUCT_VISION.md (seções de customização/multi-tenant)
        ↓
Percorrer checklists/platform-checklist.md
        ↓
Classificar achados (bloqueante = quebra parametrização já existente; não-bloqueante = lacuna de escopo futuro)
        ↓
Relatório + veredito
```

## 6. Arquivos auxiliares disponíveis

| Pasta/arquivo | Conteúdo |
|---|---|
| `checklists/platform-checklist.md` | Checklist de conformidade de plataforma (Multi-tenant, Branding, White Label, Theme Engine, isolamento de dados, parametrização) |

## 7. Como carregar os arquivos auxiliares

Carregar `checklists/platform-checklist.md` sempre que esta Skill for usada. Carregar `PLATFORM_OVERVIEW.md`/`ERP_PRODUCT_VISION.md` (raiz) sob demanda, seções relevantes ao módulo em revisão.

## 8. Critérios de sucesso

- O checklist foi percorrido para o módulo revisado.
- Todo achado tem classificação explícita: bloqueante (quebra parametrização já existente) ou não-bloqueante (lacuna de escopo futuro/melhoria).
- O relatório distingue claramente "isto já deveria estar parametrizado e não está" de "isto ainda não foi implementado porque não era o escopo desta sprint".

## 9. Limitações

- Não implementa nem corrige código.
- Não decide se uma sprint deve passar a implementar multi-tenência — isso é decisão do Product Owner via Ordem de Missão dedicada, não desta Skill.
- Não substitui `product-review` para nenhuma dimensão de UX/UI — os dois são complementares, nunca sobrepostos (ver `PLATFORM_OVERVIEW.md`, "Experience Review vs. Platform Review").

## 10. Anti-patterns

- Bloquear uma sprint de módulo de negócio por não ter implementado multi-tenência quando isso nunca foi pedido na Ordem de Missão daquela sprint — infla o escopo do achado além do que a regra permite.
- Confundir esta Skill com `product-review` — um achado de contraste de cor insuficiente é UI (`product-review`), não Platform Review; um nome de empresa hardcoded fora de `StoreConfig` é Platform Review, não UI.

## 11. Referências cruzadas

Skills irmãs: `product-review` (qualidade de experiência, papel de `product-reviewer`, nunca sobreposto), `engineering-reviewer`/`governance` (conformidade de processo, papel de `AI Governance Officer`). Documentos-fonte: `PLATFORM_OVERVIEW.md`, `ERP_PRODUCT_VISION.md` (raiz do projeto), `PROJECT_GOVERNANCE.md` (regra de bloqueio), `platform-review-contract.md` (`.claude/contracts/`).

**Compatibilidade com Sub-agents:** pré-carregada por `platform-reviewer` (`.claude/agents/platform-reviewer.md`, Sprint G.6.1) — único Sub-agent que a usa. `product-reviewer`/`AI Backend Engineer`/`AI Frontend Engineer`/`AI Governance Officer` não deveriam pré-carregá-la (papéis distintos). Conhecimento fornecido: checklist de conformidade de plataforma + regra de classificação bloqueante/não-bloqueante. Artefatos produzidos: nenhum arquivo — apenas o relatório devolvido ao chamador. Entradas: código já implementado. Saídas: achados classificados + veredito.

---

Precedência: em caso de conflito entre esta Skill e `PLATFORM_OVERVIEW.md`, `ERP_PRODUCT_VISION.md`, `PROJECT_GOVERNANCE.md` ou `contracts/platform-review-contract.md`, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.6.1 (Platform & Product Architecture Consolidation). -->
