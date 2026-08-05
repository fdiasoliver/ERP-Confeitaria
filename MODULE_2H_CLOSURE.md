# MODULE_2H_CLOSURE.md — Encerramento do Módulo 2.H (Embalagens)

Documento produzido retroativamente na Sprint 2.I.0 (20/07/2026) — o Módulo 2.H foi o único, entre 2.D/2.E/2.G/2.I/2.J/2.H, a não gerar um `MODULE_X_CLOSURE.md` dedicado no momento do próprio encerramento (Sprint 2.H.7, também 20/07/2026); a lacuna foi identificada na auditoria documental da Sprint 2.I.0 e fechada aqui, sem alterar nenhuma decisão já tomada nas Sprints 2.H.0–2.H.7 — este documento apenas consolida o que já está registrado em `CHANGELOG.md`.

Cobre todo o ciclo do módulo: Blueprint (2.H.0) → Schema (2.H.1) → Repository + Validator (2.H.2) → Service (2.H.3) → API (2.H.4) → UX Foundation (2.H.5) → Frontend + Validação Funcional (2.H.6) → Homologação do Product Owner (2.H.7).

---

## 1. Escopo implementado

**Completo e homologado:** CRUD de `Packaging` (nome, categoria opcional, custo unitário, estoque atual/mínimo, fornecedor opcional — FK real desde o nascimento) e `PackagingCategory` (agrupamento livre), com histórico de custo (`PackagingPriceHistory`, imutável) e vínculo N:N com `Product` (`ProductPackaging`, quantidade sempre inteira, gerenciado item a item). Frontend: 5 telas (`/admin/embalagens`, `/admin/embalagens/categorias`, `/admin/embalagens/[id]`, `/admin/produtos/[id]` — as duas últimas novas, criadas neste módulo — e integração aditiva em `/admin/produtos`), 100% Design System reutilizado, nenhum componente novo.

**Decisão arquitetural central do módulo — ADR-014 (`CLAUDE.md`):** `Packaging` vincula-se a `Product` via `ProductPackaging`, **não** a `Recipe` — supera a decisão original de 30/06/2026 (nunca implementada). Encontrada e resolvida na Fase 1 (Auditoria) da Sprint 2.H.0, com aprovação explícita do Product Owner via pergunta estruturada antes de qualquer schema ser escrito.

## 2. Arquitetura

```
Route Handler (src/app/api/admin/packagings/**, packaging-categories/**, products/[id]/packagings/**)
        ↓ chama
Service (src/lib/packagingService.ts, packagingCategoryService.ts, packagingPriceHistoryService.ts, productPackagingService.ts)
        ↓ chama
Repository (src/lib/repositories/packagingRepository.ts, packagingCategoryRepository.ts, packagingPriceHistoryRepository.ts, productPackagingRepository.ts)
        ↓ chama
Prisma (singleton src/lib/prisma.ts)

Frontend (src/app/admin/embalagens/**, src/app/admin/produtos/[id]/page.tsx)
        ↓ consome
src/lib/api/packagingApi.ts, packagingCategoryApi.ts, productPackagingApi.ts (clientes HTTP)
        ↓ compõe
src/components/admin/shared/* (100% reutilizado, nenhum componente novo)
```

- **Route Handlers:** `requireAdmin()` primeiro, mapeamento de erro por `instanceof`, `responses.ts` — 10 rotas, 16 handlers.
- **Service:** `packagingService.ts` (mirror de `ingredientService.ts`), `packagingCategoryService.ts` (mirror de `ingredientCategoryService.ts`), `packagingPriceHistoryService.ts` (arquivo dedicado, divergência documentada), `productPackagingService.ts` (padrão item a item, mirror de `recipeService.ts` — divergência deliberada do padrão de lista embutida de `ProductRecipe`, documentada na Sprint 2.H.3).
- **Repository:** só Prisma Client tipado, sem `$queryRaw`/`$executeRaw`. `productPackagingRepository.ts` é dedicado (mirror de `recipeIngredientRepository.ts`), diferente de `ProductRecipe`, que não tem repository próprio.
- **Validator:** só formato/sintaxe. `productPackagingValidator.ts` tem as duas formas de validação (lista e item a item) coexistindo — decisão documentada na Sprint 2.H.3.
- **Front-end:** consome exclusivamente os 3 clientes de API. Nenhuma chamada direta a Service/Repository/Prisma.

## 3. Entidades

| Entidade | Campos principais | Relacionamentos |
|---|---|---|
| `Packaging` | name, categoryId?, unitCost, stockQuantity (Int), minStock (Int), supplierId? (FK real), active | N:1 `PackagingCategory`, N:1 `Supplier`, 1:N `PackagingPriceHistory`, N:N `Product` via `ProductPackaging` |
| `PackagingCategory` | name (único) | 1:N `Packaging` — delete físico bloqueado se em uso |
| `PackagingPriceHistory` | price, notes?, recordedAt | N:1 `Packaging` — nunca deletado |
| `ProductPackaging` | productId, packagingId, quantity (Int) | join `Product`↔`Packaging`, `@@unique([productId, packagingId])` |

**Sem relação com `Recipe`/`RecipeIngredient`** — confirmado por ADR-014 e reconfirmado em cada sprint subsequente (nenhum import de `recipeService`/`recipeRepository` em nenhum dos 4 Services do módulo).

## 4. APIs

| Método | Rota | Autenticação |
|---|---|---|
| `GET`/`POST` | `/api/admin/packaging-categories` | Admin |
| `PATCH`/`DELETE` | `/api/admin/packaging-categories/[id]` | Admin |
| `GET`/`POST` | `/api/admin/packagings` | Admin |
| `GET`/`PATCH` | `/api/admin/packagings/[id]` | Admin |
| `PATCH` | `/api/admin/packagings/[id]/activate`, `/deactivate` | Admin |
| `GET` | `/api/admin/packagings/[id]/price-history` | Admin |
| `GET` | `/api/admin/packagings/[id]/usage` | Admin |
| `GET`/`POST` | `/api/admin/products/[id]/packagings` | Admin |
| `PATCH`/`DELETE` | `/api/admin/products/[id]/packagings/[linkId]` | Admin |

Sem rota `DELETE` para `Packaging` — mesmo padrão de `Ingredient`/`Recipe`/`Supplier`/`Product` (só ativar/desativar).

## 5. Funcionalidades validadas (evidência real, ambiente sincronizado)

**Backend (Sprints 2.H.1–2.H.4):** schema confirmado por introspecção direta do banco real (4 tabelas + 2 relações inversas). 27/27 testes de API via `fetch()` autenticado (Sprint 2.H.4) — CRUD, paginação, filtros, duplicidade, embalagem inativa, categoria em uso, 401 sem autenticação.

**Frontend (Sprint 2.H.6), Playwright, servidor de desenvolvimento local, login admin real:**
- 27/27 cenários funcionais aprovados — CRUD completo, paginação, filtros, histórico de preço, vínculo `Product`↔`Packaging`, navegação entre as 5 telas (incluindo "Editar produto" reabrindo o modal existente via `?edit=id`), estados de UI (loading/vazio/erro/sucesso), mensagens de validação, responsividade (390px sem overflow), navegação por teclado (foco automático + `Escape`), console e rede limpos
- 1 bug real encontrado e corrigido durante a própria validação (pluralização "embalagemns"→"embalagens"), recompilado e reconfirmado

**Homologação do Product Owner (Sprint 2.H.7), Playwright, ótica de negócio:**
- 10/10 fluxos aprovados sob critério de facilidade de uso, clareza de mensagens, coerência de nomes — nenhum defeito bloqueante
- 1 ajuste de linguagem realizado (mensagem técnica reescrita em `produtos/[id]/page.tsx`)

## 6. Integrações

| Módulo | Tipo de integração |
|---|---|
| `Product` (2.J) | `ProductPackaging` — vínculo direto, custo somado (Regra 11, pendente — ver Seção 7) |
| `Supplier` (2.E) | `Packaging.supplierId` — FK real, opcional |
| `Recipe`/`Ingredient` (2.I/2.G) | **Nenhuma** — decisão arquitetural central do módulo (ADR-014) |
| Produção/Compras/Estoque | Nenhuma — mesma lacuna já existente para `Ingredient` (sem módulo de Produção/Compras formal no ERP ainda) |

## 7. Pendências conhecidas

- **Regra 11 (decisão de escopo, não defeito):** `Product.costPrice` ainda não soma o custo de `ProductPackaging` — exigiria alterar `productService.calculateCostPrice` (módulo 2.J, encerrado), deliberadamente fora do escopo de todas as sprints 2.H.3–2.H.7. Confirmado por teste real em 3 momentos distintos (2.H.4, 2.H.6, 2.H.7) que o comportamento permanece inalterado. Candidata a módulo/sprint futura dedicada.
- **`MENU_STRUCTURE.md`/`SCREENS.md`** desatualizados desde a Sprint P1 (29/06/2026) para praticamente todos os módulos já implementados, não específico de Embalagens — registrado na Sprint 2.H.7, reafirmado na Sprint 2.I.0.

## 8. Limitações conhecidas / Backlog Técnico

- Escolha de embalagem alternativa pelo cliente no momento do pedido (ex: embalagem de presente com custo adicional) — fora do MVP, registrada em `MODULE_2H_PLANNING.md` Seção 11
- Quantidade fracionária de embalagem (ex: fita por metro) — decisão deliberada de manter sempre inteira, reversível via nova ADR se necessidade real surgir
- Múltiplos fornecedores por embalagem — mesma lacuna já existente para `Ingredient`
- Extrair `PagedResult<T>`/`buildWhere` (duplicados em `supplierRepository.ts`/`productRepository.ts`/`packagingRepository.ts`) e hook `useAdminToast` compartilhado — registrados como Evolução (Sprints 2.H.2/2.H.6), não implementados
- Tooltip explicando por que o `StatCard` "Estoque baixo" só conta embalagens ativas — melhoria de UX não-bloqueante identificada na Sprint 2.H.7
