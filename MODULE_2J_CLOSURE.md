# MODULE_2J_CLOSURE.md — Encerramento do Módulo 2.J (Produtos — Fase 2)

Documento de encerramento produzido na Sprint I.3 (Functional Revalidation & Closure). O Backend (2.J.1), API + Frontend (2.J.2) e correções de UX/UI/bugs (2.J.2.1) já estavam implementados desde 16–17/07/2026; a etapa de QA Funcional e Homologação estava pendente (`PLAN.md` registrava "QA e Homologação pendentes", bloqueada pela dessincronização de infraestrutura confirmada na Sprint I.1). Esta Sprint executa essa homologação e formaliza o encerramento do módulo.

---

## 1. Escopo implementado

**Completo e homologado:** CRUD de `Product` (nome, descrição opcional, categoria, imagem, preço de venda, prazo de produção, destaque, ativação/desativação, exclusão física) + RecipeLinker (vínculo N:N com `Recipe` via `ProductRecipe`, quantidade por vínculo) + cálculo automático de `costPrice` e margem, sempre recalculado a partir do `unitCost` de cada receita vinculada (nunca armazenado). Camadas: Repository + Validator + Service (2.J.1) → API + Frontend (2.J.2) → correções de UX/UI/bugs (2.J.2.1) → QA e encerramento (Sprint I.3, este documento).

## 2. Arquitetura

```
Route Handler (src/app/api/admin/products/**)
        ↓ chama
Service (src/lib/productService.ts)
        ↓ chama
Repository (src/lib/repositories/productRepository.ts)
        ↓ chama
Prisma (singleton src/lib/prisma.ts)
```

- **Route Handlers:** `requireAdmin()` → parse do body → Service → mapeamento de erro via `responses.ts`.
- **Service (`productService.ts`):** validação → checagem de categoria (existência + `InactiveCategoryError` se inativa) → checagem de cada receita vinculada (`getRecipeById`, reaproveita `recipeService` — acoplamento Service→Service já registrado como Observação Técnica na Sprint 2.J.1) → Repository → `calculateCostPrice` (soma `unitCost × quantity` de cada `ProductRecipe`, sempre em tempo real) → mapeamento DTO.
- **Repository (`productRepository.ts`):** só queries, zero lógica de negócio; paginação server-side (`listProductsPaged`).
- **Front-end (`admin/produtos/page.tsx`):** consome exclusivamente `productApi.ts`. Formulário com linhas dinâmicas para vínculo de receitas (mesmo padrão de `RecipeIngredient` em 2.I). Máscara de moeda BRL (Sprint 2.J.2.1) na exibição do preço, mantendo o valor decimal simples internamente.

## 3. Entidades

| Entidade | Campos principais | Relacionamentos |
|---|---|---|
| `Product` | name, description?, categoryId, imageUrl?, basePrice, costPrice (derivado, nunca armazenado no DTO), leadTimeDays, active, featured | `ProductCategory` (N:1), `ProductRecipe` (1:N), `ProductOccasion` (1:N, fora de escopo deste módulo), `OrderItem` (1:N) |
| `ProductRecipe` | quantity | `Product` (N:1, cascade delete), `Recipe` (N:1, somente leitura) |

## 4. APIs

| Método | Rota | Autenticação |
|---|---|---|
| `GET`/`POST` | `/api/admin/products` | Admin |
| `GET`/`PATCH`/`DELETE` | `/api/admin/products/[id]` | Admin |
| `PATCH` | `/api/admin/products/[id]/activate` | Admin |
| `PATCH` | `/api/admin/products/[id]/deactivate` | Admin |

## 5. Funcionalidades validadas (Sprint I.3 — ambiente sincronizado, dados reais)

Validado via Playwright contra servidor de desenvolvimento limpo, banco Supabase real: criação de produto com vínculo de receita (RecipeLinker); custo e margem calculados corretamente (dois casos reais conferidos matematicamente: R$ 18,53/87% e R$ 18,53/63%); pesquisa server-side; exclusão física (produto sem uso em pedidos); persistência confirmada por reload; máscara de moeda BRL funcionando na entrada do formulário. Confirmado o efeito em cascata: alterar o preço de um ingrediente real atualizou automaticamente o custo do produto vinculado, sem nenhuma ação manual — validação ponta a ponta de Unidade → Ingrediente → Receita → Produto.

## 6. Integrações

**Com Receitas (2.I):** leitura via `recipeService.getRecipeById` (Service→Service, não Service→Repository — acoplamento já registrado como Observação Técnica na Sprint 2.J.1, aceito por reaproveitar o cálculo de custo com conversão de unidade já testado em 2.I, evitando duplicá-lo). **Com Categorias (2.B):** leitura via `findCategoryById`, bloqueio de categoria inativa.

## 7. Pendências conhecidas

**Nenhuma pendência bloqueante.** Módulo 2.K (Dashboard Operacional) pode prosseguir.

## 8. Limitações conhecidas

- `costPrice` e `margin` nunca são armazenados — sempre recalculados no mapeamento DTO a cada leitura, mesmo padrão de 2.I (consistente, não é dívida técnica).
- Ícones SVG inline introduzidos na Sprint 2.J.2.1 (sem biblioteca externa) — decisão já registrada, não revisitada nesta sprint.

## 9. Lições aprendidas

- **Bloqueio de infraestrutura não detectado por QA "de código"**: a validação original da Sprint 2.J.2.1 foi feita por leitura de código (Playwright indisponível na época), o que não detectou a dessincronização real do banco — só a introspecção direta feita na Sprint I.1 revelou o problema. Reforça a regra do ADR-013: validação funcional exige ambiente sincronizado e dados reais, não apenas revisão de código.
- **RecipeLinker validado com dado recém-criado, não só com o seed**: criar um produto novo e vinculá-lo a uma receita real durante esta própria sprint (não reaproveitar apenas o vínculo pré-existente do seed) deu confiança adicional de que o fluxo funciona para qualquer produto, não só para o caso já seedado.

## 10. Padrões reutilizáveis para o Módulo 2.K (Dashboard Operacional)

- Consolidação de custo/CMV pode reaproveitar o mesmo princípio de `calculateCostPrice` (nunca armazenar, sempre recalcular a partir das entidades relacionadas em tempo real).
- Acoplamento Service→Service (Produtos→Receitas) é aceitável quando evita duplicar um cálculo já testado — mas deve ser registrado explicitamente como Observação Técnica, nunca silenciado.

---

Precedência: em caso de conflito entre este documento e `PLAN.md`, `CHANGELOG.md` ou `REGRAS_NEGOCIO.md`, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 17/07/2026 — Sprint I.3 (QA Funcional, Homologação e Encerramento do Módulo 2.J, após Backend/API/Frontend concluídos nas Sprints 2.J.1/2.J.2/2.J.2.1). -->
