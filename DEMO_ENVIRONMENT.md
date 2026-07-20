# DEMO_ENVIRONMENT.md — Arquitetura do Ambiente de Demonstração

Documento de arquitetura da Plataforma de Demonstração, criado na Sprint T.3 (Demo Environment & Product Validation Platform). Formaliza uma capacidade permanente do ERP — não um artefato de uma única sprint. Complementa, sem duplicar: `DEMO_DATASET.md` (o que existe no ambiente), `DEMO_GUIDE.md` (como usar o ambiente), `prisma/demo-seeds/README.md` (como o ambiente é populado).

---

## Contexto

A Sprint T.2C confirmou, por evidência real (não suposição), que o Playwright MCP está indisponível nesta instalação — ver `CHANGELOG.md`, entrada "Sprint T.2C". Isso é um bloqueio real e documentado para qualquer estratégia de homologação/QA que dependesse de automação de navegador. A Plataforma de Demonstração não é uma tentativa alternativa de resolver esse bloqueio — é uma capacidade de produto independente da ferramenta de automação, que passa a existir de qualquer forma porque o ERP, como produto, precisa de um ambiente estável para demonstração comercial, homologação manual, Product Review, Platform Review, treinamento e testes futuros (automatizados ou não).

## 1. Finalidade

Fornecer um ambiente único, estável e reprodutível do ERP — com dados realistas e não sensíveis — que sirva simultaneamente a:

| Uso | Consumidor |
|---|---|
| Demonstração comercial | Product Owner, prospects |
| Homologação funcional | Product Owner, Executor |
| Product Review | `product-reviewer` (`PROJECT_GOVERNANCE.md` Seção 16.5) |
| Platform Review | `platform-reviewer` (`PROJECT_GOVERNANCE.md` Seção 16.4) |
| Testes manuais | Executor, QA |
| Futuros testes automatizados | Quando uma ferramenta de automação de navegador estiver disponível — sem acoplar a arquitetura do ambiente a nenhuma ferramenta específica |
| Treinamento | Novos usuários da equipe interna do tenant |
| Validação de novas funcionalidades | Toda sprint que envolve Frontend, antes do Demo Validation (Seção 16.6) |
| Futuras implantações | Onboarding de um novo tenant, quando a multi-tenência for implementada (`ERP_PRODUCT_VISION.md`) |

## 2. Responsabilidades

- Manter um conjunto de dados de demonstração coerente com o domínio real do negócio (`DOMAIN_MODEL.md`, `REGRAS_NEGOCIO.md`) — nunca dados aleatórios ou genéricos sem relação com confeitaria por encomenda.
- Oferecer usuários de demonstração para cada papel relevante do produto (`DEMO_DATASET.md`, Seção "Demo Users").
- Ser restaurável de forma determinística, sem depender de estado acumulado por uso manual anterior (`prisma/demo-seeds/README.md`).
- Evoluir junto com o schema — todo novo modelo Prisma que afete o fluxo demonstrado precisa, eventualmente, de dado equivalente no dataset de demo (`DEMO_DATASET.md`, "Estratégia de evolução").

## 3. Limites — o que este ambiente não é

- **Não é o banco de desenvolvimento.** `prisma/seed.ts` (seed de desenvolvimento, já existente desde a Sprint 0.5) e o futuro dataset de demonstração são propositalmente separados (`prisma/demo-seeds/README.md`, Seção "Separação de responsabilidades") — um serve ao dia a dia de implementação, o outro à validação de produto.
- **Não é ambiente de produção.** Nenhum dado de cliente real, nenhuma credencial real, nenhuma integração real (WhatsApp, PIX, Google Maps) — `DEMO_DATASET.md` define explicitamente como essas integrações são representadas sem chamada externa real.
- **Não substitui QA técnico.** `tsc`/`lint`/`build`/regressão (`PROJECT_GOVERNANCE.md` Seção 17) continuam obrigatórios independentemente do ambiente de demonstração existir — Demo Validation (Seção 16.6) é uma camada adicional, não uma substituição.
- **Não implementa automação de teste.** Esta sprint não retoma a investigação do Playwright MCP (restrição explícita da Ordem de Missão da Sprint T.3) — quando uma ferramenta de automação estiver disponível, ela consome este ambiente, não o redesenha.
- **Não altera regra de negócio nem arquitetura funcional do ERP** — mesma restrição desta sprint, sem exceção.

## 4. Integração com Product Review

Toda página de Frontend que compõe um fluxo do Demo Guide (`DEMO_GUIDE.md`, "Fluxo sugerido") é candidata natural a Product Review (`PROJECT_GOVERNANCE.md` Seção 16.5). A partir da Sprint T.3, o checklist de UX do Product Review (`.claude/skills/product-review/checklists/ux-checklist.md`) inclui um critério adicional, escopado a essas páginas: **"o fluxo completo do negócio é claro para um usuário que nunca viu o sistema?"** — não substitui nenhum critério existente, apenas acrescenta essa dimensão quando a revisão envolve o ambiente de demonstração.

## 5. Integração com Platform Review

O Platform Review (`PROJECT_GOVERNANCE.md` Seção 16.4) verifica que nenhum módulo hardcoda identidade de tenant. O Demo Dataset reforça essa verificação na prática: como o tenant de demonstração é sempre "Doce Atelier" (o mesmo tenant de referência já usado em todo o projeto, `ERP_PRODUCT_VISION.md`), o ambiente de demonstração não introduz um segundo tenant nem antecipa multi-tenência — ele é, hoje, um cenário de validação single-tenant, coerente com o estado real do schema.

## 6. Integração com QA

Demo Validation (`PROJECT_GOVERNANCE.md` Seção 16.6) é inserido no fluxo oficial entre Product Review e QA (`ERP_DEVELOPMENT_WORKFLOW.md`, item 1). Ele confirma que o fluxo de negócio ponta a ponta funciona no ambiente de demonstração antes do QA técnico validar a sprint isoladamente — QA continua sendo a fonte de verdade sobre correção técnica; Demo Validation é sobre completude e consistência do fluxo demonstrado, nunca sobre `tsc`/`lint`/`build`.

## 7. Estrutura de suporte

```
DEMO_ENVIRONMENT.md         → este documento — arquitetura do ambiente
DEMO_DATASET.md              → o que existe no ambiente (empresa, categorias, usuários, dados)
DEMO_GUIDE.md                 → como usar o ambiente (início, restauração, fluxo sugerido)
prisma/demo-seeds/README.md   → como o ambiente é populado (arquitetura da pasta, sem dado real ainda)
```

Nenhum dos quatro documentos duplica os outros — cada um responde a uma pergunta distinta (arquitetura / conteúdo / uso / implementação).

---

Precedência: em caso de conflito entre este documento e `PROJECT_GOVERNANCE.md`, `ERP_DEVELOPMENT_WORKFLOW.md`, `PLATFORM_OVERVIEW.md` ou `CLAUDE.md` (raiz), os documentos originais sempre prevalecem — este documento formaliza a Plataforma de Demonstração, não redefine governança geral do projeto.

<!-- Histórico: v1.0 criada em 16/07/2026 — Sprint T.3 (Demo Environment & Product Validation Platform). -->
