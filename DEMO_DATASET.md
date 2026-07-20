# DEMO_DATASET.md — Conteúdo Oficial do Ambiente de Demonstração

Documento de conteúdo da Plataforma de Demonstração, criado na Sprint T.3. Define **o que existe** no ambiente de demonstração — arquitetura em `DEMO_ENVIRONMENT.md`, uso em `DEMO_GUIDE.md`, implementação em `prisma/demo-seeds/README.md` (ainda não implementada — apenas arquitetura, ver Restrição Final da Sprint T.3).

---

## 1. Empresa padrão

O ambiente de demonstração usa o mesmo tenant de referência já estabelecido em todo o projeto — **Doce Atelier** (`ERP_PRODUCT_VISION.md`) — nunca uma empresa fictícia adicional. Motivo: o schema é hoje single-tenant (`ERP_PRODUCT_VISION.md`, nota de transparência); introduzir uma segunda identidade de empresa no ambiente de demonstração anteciparia multi-tenência sem que ela exista no schema, contradizendo `PLATFORM_OVERVIEW.md` ("nenhum campo novo, model novo ou migração" sem ADR).

`StoreConfig` de demonstração (mesmos campos já existentes desde a Sprint 0.5/2.D — nenhum campo novo):

| Campo | Valor de demonstração |
|---|---|
| `name` | Doce Atelier |
| `addressCity` / `addressState` | São Paulo / SP |
| `freeDeliveryRadiusKm` | 3 |
| `laborCostPerHour` | 35 |
| `monthlyProductionUnits` | 200 |
| `targetMarginPercent` | 50 |

Idênticos aos valores já usados em `prisma/seed.ts` (seed de desenvolvimento) — não há razão de negócio para o ambiente de demonstração usar números fictícios diferentes dos já validados.

## 2. Categorias

Reaproveita as três categorias reais já cadastradas em `prisma/seed.ts` (`ProductCategory`) — mesma razão da Seção 1, coerência com o domínio já validado:

| Nome | Slug | `sortOrder` |
|---|---|---|
| Bolos de Aniversário | `bolos` | 1 |
| Doces & Docinhos | `doces` | 2 |
| Kits & Coffee Break | `kits` | 3 |

## 3. Unidades e conversões

O módulo de Unidades (2.D) e o de Ingredientes/Receitas (2.G/2.I) existem no schema, mas `prisma/seed.ts` (dev) ainda não os popula — lacuna real, não específica desta sprint. O Demo Dataset precisa cobrir isso para demonstrar o fluxo de custo de receita ponta a ponta:

| `UnitOfMeasure.name` | `abbreviation` | `type` |
|---|---|---|
| grama | g | MASS |
| quilograma | kg | MASS |
| mililitro | ml | VOLUME |
| litro | l | VOLUME |
| unidade | un | UNIT |

`UnitConversion` mínima: kg → g (`factor = 1000`), l → ml (`factor = 1000`) — mesmo padrão de exemplo já documentado no comentário do schema (`prisma/schema.prisma`, model `UnitConversion`).

## 4. Ingredientes

Grounded nos produtos que já existem em `prisma/seed.ts`, para que o custo calculado da receita corresponda ao produto exibido na vitrine de demonstração:

| Nome | Unidade | Categoria (`IngredientCategory`) |
|---|---|---|
| Farinha de trigo | kg | Secos |
| Açúcar refinado | kg | Secos |
| Manteiga sem sal | kg | Laticínios |
| Ovos | un | Laticínios |
| Cream cheese | kg | Laticínios |
| Chocolate belga 50% | kg | Chocolates |
| Corante vermelho (red velvet) | ml | Aditivos |

## 5. Receitas

Cada receita liga-se a um produto real do dataset via `ProductRecipe`, para que o dashboard de produção e o custo de receita demonstrem dado real, não populado à mão na tela:

| `Recipe.name` | `yieldUnit` | Produto associado (`prisma/seed.ts`) |
|---|---|---|
| Massa Red Velvet | bolo 25cm | Bolo Red Velvet |
| Ganache Meio Amargo | bolo 25cm | Bolo Chocolate 25cm |
| Brigadeiro Gourmet (receita-base) | unidade | Brigadeiro Gourmet |

## 6. Demo Users

Três perfis oficiais, um por papel de negócio relevante hoje implementado (`prisma/schema.prisma`, `enum UserRole`; `MENU_STRUCTURE.md`, `ROLE_REQUIRED`):

| Persona | `UserRole` | Acesso | Objetivo de demonstração |
|---|---|---|---|
| **Administrador Demo** | `ADMIN` | Todo o `/admin/*` (`src/proxy.ts`) | Mostrar o backoffice completo — configuração da loja, futuros módulos administrativos |
| **Operador Demo** | `PRODUCAO` | `/admin/producao` (Kanban) | Mostrar o fluxo de produção: Confirmado → Em produção → Pronto → Entregue |
| **Financeiro Demo** | `FINANCEIRO` | `/admin/financeiro`, `/admin/relatorios` (ainda 🔲 Planejado em `MENU_STRUCTURE.md`) | Reservado — só é ativado como demonstração real quando o módulo Financeiro (Fase 7) existir; hoje não há tela para este papel demonstrar |

Existe um quarto papel real no schema, `ATENDIMENTO` (`/admin/pedidos`, `/admin/clientes`) — não incluído nos três Demo Users oficiais desta sprint porque a Ordem de Missão define exatamente três personas; fica registrado aqui como candidato natural a um quarto Demo User quando `/admin/pedidos` deixar de ser mock (`KNOWN_ISSUES.md`).

**Convenção de nomenclatura:** e-mails de Demo User usam o domínio `@demo.doceatelier.com.br` (fictício, não roteável) — nunca `@doceatelier.com.br`, reservado ao usuário real de desenvolvimento (`admin@doceatelier.com.br`, `prisma/seed.ts`). Evita que uma captura de tela ou log do ambiente de demonstração seja confundido com dado real.

## 7. Dados obrigatórios para o ambiente ser considerado válido

Um Demo Seed só está completo quando o ambiente resultante contém, no mínimo:

- 1 `StoreConfig` (Seção 1).
- As 3 `ProductCategory` (Seção 2) com ao menos 1 produto ativo cada.
- Ao menos 1 `Order` em cada status do Kanban (`OrderStatus`) — para que `/admin/producao` demonstre as quatro colunas povoadas, não vazias.
- Ao menos 1 `Recipe` com `RecipeIngredient` suficiente para exibir custo calculado (Seção 5).
- Os 3 Demo Users (Seção 6) com senha conhecida e documentada em `DEMO_GUIDE.md`.

## 8. Convenções de nomenclatura gerais

- Nomes de produto/categoria/ingrediente: português, mesmo padrão de `prisma/seed.ts` — nunca "Lorem Ipsum" ou dado de placeholder genérico.
- Nenhum dado de demonstração usa nome, telefone, e-mail ou endereço de pessoa real — clientes de demonstração usam nomes comuns genéricos (ex. "Cliente Demonstração 1") e telefone na faixa reservada `+55 11 90000-00XX`.
- Nenhuma integração externa real é chamada (WhatsApp, PIX, Google Maps) — `DEMO_GUIDE.md`, Seção "Limitações", documenta como cada uma é representada sem chamada real.

## 9. Demo Dataset Version

O Demo Dataset evolui junto com o schema (`prisma/schema.prisma`) — uma versão do dataset é compatível com uma faixa de versões do schema, nunca com "o schema atual" implicitamente. A partir desta sprint:

- O Demo Dataset é versionado por **data da sprint que o alterou por último** (mesmo padrão já usado em todo o projeto, nunca SemVer isolado sem contexto de sprint) — registrado no cabeçalho de `prisma/demo-seeds/README.md` quando a implementação existir.
- Toda sprint que adiciona um model Prisma **relevante ao fluxo demonstrado** (Seção 7) deve avaliar se o Demo Dataset precisa de dado equivalente — registrado como pendência em `KNOWN_ISSUES.md` quando não resolvido na própria sprint, nunca implementado como efeito colateral de uma sprint de funcionalidade não relacionada.
- Uma mudança de schema que quebre compatibilidade com o Demo Dataset existente (ex. campo obrigatório novo sem default) é tratada como dívida técnica (`PROJECT_GOVERNANCE.md` Seção 14), prioridade Alta — impede a próxima Demo Validation (`PROJECT_GOVERNANCE.md` Seção 16.6) até resolvida.

## 10. Estratégia de evolução do dataset

Esta versão (Sprint T.3) define o dataset **conceitualmente** — nenhum dado foi inserido em banco, nenhum script de seed foi escrito (`prisma/demo-seeds/README.md` documenta só a arquitetura da pasta). A implementação real dos dados aqui descritos é trabalho de uma sprint futura de implementação, seguindo `ERP_DEVELOPMENT_WORKFLOW.md`, e deve ser fiel a este documento — qualquer divergência entre o dataset implementado e este documento deve atualizar este documento, nunca o contrário.

---

Precedência: em caso de conflito entre este documento e `DOMAIN_MODEL.md`, `REGRAS_NEGOCIO.md`, `prisma/schema.prisma` ou `DEMO_ENVIRONMENT.md`, os documentos originais sempre prevalecem — este documento descreve conteúdo de demonstração, nunca redefine domínio de negócio real.

<!-- Histórico: v1.0 criada em 16/07/2026 — Sprint T.3 (Demo Environment & Product Validation Platform). -->
