# ERP_PRODUCT_VISION.md — Visão de Produto: Plataforma Doce Menina

Documento de visão de produto, criado na Sprint G.6.1 (Platform & Product Architecture Consolidation). Consolida a estratégia SaaS/White Label/Multi-tenant do ERP, complementando — nunca substituindo — `CLAUDE.md` (raiz, documentação técnica permanente do ERP) e `PROJECT_GOVERNANCE.md` (governança de desenvolvimento). Em caso de conflito sobre convenção técnica de código, `CLAUDE.md` e `PROJECT_GOVERNANCE.md` prevalecem — este documento é sobre visão e estratégia de produto, não sobre padrão de implementação.

---

## Nota de transparência obrigatória — estado atual vs. visão de plataforma

**Este documento descreve para onde o produto está indo, não o que já está implementado hoje.** Até a Sprint G.6.1 (inclusive), o schema Prisma, o código (`src/`) e `CLAUDE.md` são **inteiramente single-tenant**: existe uma única empresa (`StoreConfig`, singleton), sem modelo `Tenant`, sem `tenantId` em nenhuma tabela, sem isolamento de dados por cliente. A paleta de cores (`cream`/`chocolate`/`rose`/`sage`/`sand`/`muted`) é hoje hardcoded no design system como identidade fixa do negócio Doce Menina (`CLAUDE.md`, "Estilo e design": *"Não alterar as variáveis de cor do design system sem alinhamento — são a identidade visual do negócio"*).

Este documento formaliza a **direção estratégica** (SaaS multi-tenant white-label) autorizada pelo Product Owner na Sprint G.6.1. Não é uma reescrita retroativa da realidade do código — nenhuma migração de schema, nenhum modelo `Tenant`, nenhuma refatoração de cor foi feita nesta sprint (proibido pela própria Ordem de Missão: "Nenhuma implementação funcional deverá ser feita"). A implementação de multi-tenência real é trabalho futuro, que exigirá sua própria Ordem de Missão dedicada, com ADR formal (`PROJECT_GOVERNANCE.md` Seção 13) antes de qualquer alteração de schema.

---

## 1. Visão do produto

A plataforma Doce Menina nasceu como um ERP vertical para uma única confeitaria artesanal (o tenant de referência, "Doce Atelier") e evolui, a partir da Sprint G.6.1, para uma **plataforma SaaS white-label multi-tenant** de gestão de encomendas para confeitarias e negócios de alimentos por encomenda — mantendo o mesmo domínio de negócio (vitrine, carrinho, checkout, produção, receitas, ingredientes, financeiro), agora parametrizável por cliente.

## 2. Público-alvo

- **Primário:** confeitarias artesanais e ateliês de doces por encomenda, do porte da Doce Atelier (o tenant de referência) — operação familiar/pequena equipe, produção sob encomenda, entrega local.
- **Expansão natural (mesma vertical):** outros negócios de alimentos por encomenda com fluxo semelhante (produção → encomenda → entrega): docerias, ateliês de salgados, confeitarias de eventos.
- **Fora do público-alvo nesta visão:** varejo de prateleira/estoque de giro rápido, restaurantes com atendimento presencial contínuo — o domínio de negócio (`REGRAS_NEGOCIO.md`) é desenhado para encomenda com prazo (`leadTimeDays`), não para consumo imediato.

## 3. Posicionamento

Um ERP vertical, não um ERP genérico. A vantagem competitiva é a profundidade do domínio de confeitaria por encomenda (receitas com custo calculado, conversão de unidades, prazo mínimo de entrega, kanban de produção) — não a amplitude de módulos genéricos de qualquer ERP. A estratégia SaaS/White Label existe para permitir que outras confeitarias usem essa mesma profundidade de domínio sob sua própria identidade, não para transformar o produto em uma plataforma de propósito geral.

## 4. Estratégia SaaS

- Cada cliente da plataforma (tenant) opera com seus próprios dados isolados — produtos, pedidos, clientes, ingredientes, receitas, configuração de loja — sem visibilidade cruzada entre tenants.
- O tenant de referência atual, **Doce Atelier**, é tratado como **um cliente entre outros possíveis**, não como parte fixa da arquitetura. Nenhum módulo futuro deve assumir que existe apenas um tenant.
- A estratégia SaaS não implica, nesta sprint, um modelo de cobrança/faturamento de assinatura — isso é **fora do escopo** deste documento e ficará "A definir" até uma sprint dedicada de billing.

## 5. Estratégia White Label

Ver `PLATFORM_OVERVIEW.md` Seção "White Label" para o detalhamento completo do que pode/não pode ser customizado por tenant. Resumo: identidade visual (logo, nome, cores dentro do Theme Engine), textos de comunicação (e-mail, WhatsApp, PDFs) e domínio são parametrizáveis; a estrutura de dados, as regras de negócio (`REGRAS_NEGOCIO.md`) e a arquitetura de camadas (`PROJECT_GOVERNANCE.md` Seção 8) nunca são customizáveis por tenant — são o produto em si, não a casca visual dele.

## 6. Estratégia Multi-tenant

Isolamento de dados por tenant é um requisito de plataforma, não uma feature opcional por módulo — todo módulo novo, a partir do momento em que a multi-tenência for implementada no schema (trabalho futuro, fora desta sprint), deve nascer já escopado por tenant, nunca como uma migração retroativa "quando der tempo". Até lá, `Platform Review` (`.claude/skills/platform-review/`) sinaliza qualquer código novo que hardcode identidade de negócio, para que a migração futura tenha o menor atrito possível.

## 7. Limites do produto

- Este produto não pretende ser um ERP financeiro/contábil completo (não substitui um sistema contábil formal) — o módulo Financeiro (Fase 7 do roadmap) cobre fluxo de caixa e DRE gerencial, não contabilidade fiscal.
- Não pretende suportar múltiplos idiomas nesta visão — pt-BR é a língua de interface em toda a plataforma, para todos os tenants (`CLAUDE.md`, "A definir": internacionalização segue não definida, e esta visão não a antecipa).
- Não pretende suportar tenants com modelos de negócio fora de "produção por encomenda com prazo mínimo" sem uma nova análise de domínio.

## 8. Customizações permitidas

Ver `PLATFORM_OVERVIEW.md` Seção "White Label" (lista completa e autoritativa). Resumo: nome fantasia, razão social, logo, favicon, cor primária/secundária (dentro da paleta do Theme Engine), rodapé, textos de e-mail/WhatsApp/PDF, domínio.

## 9. Customizações proibidas

Ver `PLATFORM_OVERVIEW.md` Seção "White Label". Resumo: estrutura de dados (schema), regras de negócio (`REGRAS_NEGOCIO.md`), arquitetura de camadas (`PROJECT_GOVERNANCE.md` Seção 8), fluxo de sprint/governança, paleta de cores fora do conjunto suportado pelo Theme Engine (sem decisão explícita e ADR, mesma regra já vigente em `CLAUDE.md`).

## 10. Princípios de evolução

- **Vertical antes de horizontal:** aprofundar o domínio de confeitaria por encomenda antes de generalizar para outros verticais de negócio.
- **Parametrizar antes de hardcodar, a partir de agora:** todo módulo novo que envolva identidade de negócio deve nascer usando `StoreConfig`/Theme Engine, nunca um valor fixo novo — verificado por `Platform Review` a partir da Sprint G.6.1.
- **Documentar a visão não implementa a visão:** este documento e `PLATFORM_OVERVIEW.md` não substituem a necessidade de uma Ordem de Missão dedicada, com ADR formal, antes de qualquer implementação real de multi-tenência no schema.
- **Nenhuma nova estrutura arquitetural sem necessidade técnica real comprovada** — mesmo princípio já registrado em `PROJECT_GOVERNANCE.md` Seção 13.7 e reafirmado na Ordem de Missão desta própria sprint (Restrição Final).

---

Precedência: em caso de conflito entre este documento e `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, `CLAUDE.md` (raiz) ou qualquer ADR, os documentos originais sempre prevalecem — este documento é visão de produto, não governança técnica.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.6.1 (Platform & Product Architecture Consolidation). -->
