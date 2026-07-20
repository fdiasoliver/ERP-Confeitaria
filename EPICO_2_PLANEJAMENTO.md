# ÉPICO 2 — Planejamento Arquitetural dos Cadastros Mestres

**Doce Menina — Sistema de Gestão de Confeitaria Artesanal**
**Produzido em:** 30/06/2026
**Atualizado em:** 01/07/2026 — Sprint 2.0.1 (Seção 7 reescrita com estrutura 2.A–2.H; PA-01 resolvida)
**Tipo:** Planejamento — nenhum código foi alterado

---

## 1. Resumo Executivo

O ÉPICO 2 implementa os **cadastros mestres** que alimentam toda a cadeia operacional do ERP: produtos, ingredientes, receitas, clientes e uploads. Antes de qualquer linha de código nova, este planejamento identificou **5 problemas no schema atual** que, se ignorados, gerarão retrabalho com migração de dados. A ordem das sprints foi redesenhada para eliminar esses problemas primeiro.

### Achados críticos

| # | Achado | Severidade | Bloqueia |
|---|--------|-----------|---------|
| 1 | `PaymentStatus` em `types.ts` diverge do schema Prisma (KI-17) | Alta | Módulo Financeiro, integração PIX |
| 2 | `UnitConversion` não tem `@relation` — zero integridade referencial | Alta | Módulo Ingredientes, conversão de unidades |
| 3 | `Packaging` (Embalagem) ausente do schema — ✅ **decisão tomada:** entidade própria (Opção B) | Média | Sprint de Receitas — criar schema antes |
| 4 | `Ingredient.supplier` é texto livre — migração futura para FK inevitável | Média | Módulo Compras (Fase 5) |
| 5 | `UnitOfMeasure.type` é `String` — sem validação de enum no banco | Baixa | Consistência de dados |

### Decisão arquitetural central — RESOLVIDA (30/06/2026)

**Embalagem — Opção B aprovada:** Entidade própria `Packaging`, separada de `Ingredient`.
Embalagens têm cadastro, estoque, fornecedores e custos independentes. `Recipe` referenciará `RecipeIngredient` (ingredientes) e `PackagingItem` (embalagens) em tabelas distintas. Novos modelos `Packaging` e `PackagingItem` devem ser criados no schema antes da Sprint de Receitas.

### Ordem definitiva dos módulos

| Módulo | Descrição | Prioridade | Status |
|--------|-----------|-----------|--------|
| **2.A** | Correções Fundamentais (KI-17, IC-02, DT-01; schema Supplier/Packaging) | Pré-requisito absoluto | ✅ Concluído (01/07/2026) |
| **2.B** | Categorias — CRUD `ProductCategory` | Base para Produtos | — |
| **2.C** | Ocasiões — CRUD `OccasionTag` + `sortOrder` | Base para Produtos | — |
| **2.D** | Unidades de Medida — CRUD `UnitOfMeasure` + `UnitConversion` | Base para Insumos e Receitas | — |
| **2.E** | Fornecedores — CRUD `Supplier` (UI; schema criado em 2.A) | Base para Insumos e Embalagens | — |
| **2.F** | Produtos Fase 1 — CRUD admin + upload de imagem | Base do catálogo | — |
| **2.G** | Ingredientes — CRUD + histórico de preços + alertas de estoque | Base para Receitas | — |
| **2.H** | Embalagens — Schema `Packaging` + `PackagingItem` + CRUD admin | Base para Receitas (Opção B) | — |
| **2.I** | Receitas — CRUD + custo calculado (ingredientes + embalagens) | Base para costPrice | — |
| **2.J** | Produtos Fase 2 — RecipeLinker + `costPrice` automático + CMV base | Completa o catálogo | — |
| **2.K** | Dashboard Operacional Real — Kanban + consolidação + CMV (KI-04) | Alto valor operacional | — |
| **2.L** | Clientes — visão admin + LTV + histórico + notas (KI-10) | Encerra ÉPICO 2 | — |

> **Sprint 2.0.6:** Roadmap congelado após higienização. Alterações estruturais requerem ADR formal registrada em PROJECT_GOVERNANCE.md seção 6.

---

## 2. Mapa do Domínio

### Cadeia de dependências completa

```
┌─────────────────────────────────────────────────────────────────────┐
│  CONFIGURAÇÃO (StoreConfig + ThemeConfig)  ← ✅ Implementado        │
│  Parâmetros globais: raio entrega, margem, custo MO, custos fixos   │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ alimenta precificação
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CADASTROS BASE                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Categorias   │  │  Ocasiões    │  │  Unidades de Medida      │  │
│  │ ProductCate- │  │ OccasionTag  │  │  UnitOfMeasure +         │  │
│  │ gory ✅schema│  │ ✅ schema+API│  │  UnitConversion ✅schema  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │ 1:N             │ N:N                    │ usado em       │
│         ▼                 ▼                        ▼                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    PRODUTOS                                   │   │
│  │         Product ✅schema+API_GET, UI admin ❌                 │   │
│  │  basePrice(manual) | costPrice(calculado) | imageUrl         │   │
│  └──────────────────────────────┬───────────────────────────────┘   │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │ N:N via ProductRecipe
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  RECEITAS + INSUMOS                                                  │
│  ┌──────────────────────────┐   ┌──────────────────────────────┐    │
│  │   Ingredientes           │   │        Receitas              │    │
│  │ Ingredient ✅schema❌UI  │   │   Recipe ✅schema❌UI        │    │
│  │ IngredientCategory       │   │   RecipeIngredient           │    │
│  │ IngredientPriceHistory   │◄──┤   (ingrediente × quantidade) │    │
│  │ currentPrice → histórico │   │   yieldQuantity + yieldUnit  │    │
│  └──────────────────────────┘   └──────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────┐   (AUSENTES DO SCHEMA — a criar)      │
│  │   Embalagens ❌schema    │   ┌──────────────────────────────┐    │
│  │   Packaging ✅ decidido  │   │   Fornecedores ❌schema      │    │
│  │   (Opção B — 30/06/2026) │   │   Supplier (texto livre hoje) │    │
│  └──────────────────────────┘   └──────────────────────────────┘    │
└─────────────────────────────────┴──────────────────────────────┬────┘
                                                                  │ custo calculado
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CUSTOS + PRECIFICAÇÃO                                               │
│  costPrice = Σ(qtd × preço_ingrediente ÷ yieldQuantity) por receita │
│  preço_sugerido = costPrice ÷ (1 − margem) + rateio_fixo + MO      │
│  basePrice (manual) vs costPrice (calculado) → alerta de margem     │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ produto precificado
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CLIENTES + PEDIDOS                                                  │
│  Customer + Address + OtpCode  ✅schema, UI admin ❌                │
│  Order + OrderItem (snapshot) + OrderAttachment ✅ implementado     │
│  CartContext → checkout → POST /api/orders                          │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ pedido confirmado
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PRODUÇÃO                                                            │
│  /admin/producao ⚠️ UI pronta, dados hardcoded                      │
│  Kanban por status | consolidação de ingredientes por data          │
│  Consome: OrderItem → ProductRecipe → RecipeIngredient × qty        │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ entregue + pago
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FINANCEIRO ❌ não existe no schema                                  │
│  CMV = Σ(costPrice × qty) dos pedidos entregues                     │
│  Movimentação, fluxo de caixa, DRE                                  │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ dados agregados
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DASHBOARD EXECUTIVO ❌ não existe                                   │
│  KPIs: faturamento, CMV, margem, ticket médio, urgentes             │
└─────────────────────────────────────────────────────────────────────┘
```

### Legenda de dependências

| Tipo | Descrição |
|------|-----------|
| **Bloqueante** | B não pode funcionar sem A. Exemplo: Receitas precisam de Ingredientes |
| **Opcional** | B funciona sem A, mas é melhor com A. Exemplo: Produtos funcionam sem Receitas (costPrice = 0) |

| Dependência | Tipo | Observação |
|-------------|------|-----------|
| Categorias → Produtos | **Bloqueante** | Produto exige categoryId |
| Unidades → Ingredientes | **Bloqueante** | Ingrediente exige unitId |
| Ingredientes → Receitas | **Bloqueante** | RecipeIngredient exige ingredientId |
| Receitas → Produtos (costPrice) | **Opcional** | Produto existe sem receita; costPrice fica 0 |
| StoreConfig → Precificação | **Opcional** | Fórmula funciona com defaults; ADMIN configura para precisão |
| Embalagem → Custo total | **Opcional** | Custo existe sem embalagem; fórmula incompleta |
| Fornecedor → Ingredientes | **Opcional** | Ingrediente tem campo texto; entidade fornecedor é upgrade |
| Produtos → Dashboard Produção | **Bloqueante** | Kanban precisa de pedidos com produtos reais |
| Pedidos → Financeiro | **Bloqueante** | CMV derivado de pedidos entregues |

---

## 3. Análise por Módulo

> **Nota histórica (Sprint 2.0.6):** Esta seção documenta a análise de domínio produzida em 30/06/2026, antes do início das implementações do ÉPICO 2. Referências a "FALTAM @relation" e "sem constraint unique" em `UnitConversion` estão **resolvidas desde Sprint 2.A.1 (01/07/2026)**. Referências a `PaymentStatus` divergente estão **resolvidas desde Sprint 2.A.2**. Consulte a Seção 7 para o roadmap atual de módulos e a Seção 5 para o status atualizado de inconsistências.

---

### Módulo 1 — Empresa (já implementado)

#### 1. Objetivo
Centralizar todos os parâmetros configuráveis do negócio em um único lugar acessível pelo ADMIN sem alterar código.

#### 2. Responsabilidades
Identificação da empresa, contato, endereço, configurações de entrega, chave PIX, parâmetros de precificação, identidade visual (logo, favicon).

#### 3. Entidades envolvidas
- `StoreConfig` (singleton)
- `ThemeConfig` (singleton)

#### 4. Relacionamentos
Nenhum — ambas são entidades isoladas (singletons).

#### 5. Dependências
Nenhuma. É o módulo base.

#### 6. Campos obrigatórios implementados
`StoreConfig.name`, `StoreConfig.addressCity`, `StoreConfig.addressState`, `StoreConfig.freeDeliveryRadiusKm`, `StoreConfig.laborCostPerHour`, `StoreConfig.fixedCostMonthly`, `StoreConfig.monthlyProductionUnits`, `StoreConfig.targetMarginPercent`.

#### 7. Campos opcionais implementados
`legalName`, `cnpj`, `phone`, `email`, `instagram`, `addressStreet`, `addressNumber`, `addressComplement`, `addressNeighborhood`, `addressZip`, `ibgeCode`, `latitude`, `longitude`, `pixKeyType`, `pixKey`, `logoUrl` (via ThemeConfig), `faviconUrl` (via ThemeConfig).

#### 8. Campos para fases futuras
- `workingDays` — dias de funcionamento para cálculo correto de `getMinDeliveryDate` (mencionado em REGRAS_NEGOCIO.md como A definir)
- `cutoffHour` — horário de corte para pedidos (A definir)
- `maxDailyOrders` — capacidade máxima de produção por dia (A definir)
- `website`, `facebook` — canais digitais (baixa prioridade)
- `taxRate`, `taxRegime` — regime tributário (Fase 7)

#### 9. Serviços existentes
`src/lib/storeConfigService.ts` — `getStoreConfig()`, `upsertStoreConfig(input)`.

#### 10. Validators existentes
`src/lib/validators/storeConfig.ts` — `validateStoreConfig(input): ValidationError[]`.

#### 11. Repositories existentes
`src/lib/repositories/storeConfigRepository.ts`, `src/lib/repositories/themeConfigRepository.ts`.

#### 12. APIs existentes
- `GET /api/config` — lê StoreConfig + ThemeConfig branding
- `PATCH /api/config` — atualiza (requer ADMIN)
- `POST /api/admin/upload` — upload logo/favicon para Supabase Storage

#### 13. Componentes existentes
11 componentes em `src/components/admin/config/`: `FormPrimitives`, `LoadingSkeleton`, `ValidationSummary`, `ActionBar`, `UploadImage`, `BrandSection`, `CompanySection`, `AddressSection`, `DeliverySection`, `PixSection`, `PricingSection`.

#### 14. Reutilizações disponíveis para outros módulos
- `FormPrimitives` (`Field`, `Section`, `inputClass`) — base para todos os formulários admin
- `UploadImage` — reutilizável em Produtos, Ingredientes, qualquer módulo com imagem
- `LoadingSkeleton` — padrão de loading por seção
- `ValidationSummary` + `ToastState` — padrão de toast
- `ActionBar` — barra de ação fixa com Salvar + Voltar
- `StorageService.uploadAsset()` — serviço de upload transversal
- `ViaCepService.lookupCEP()` — disponível para qualquer módulo com endereço

#### 15. Riscos arquiteturais
- `themeConfigRepository.ts` usa `$executeRaw/$queryRaw` para `faviconUrl` enquanto `db:generate` não é executado (DT-01)
- `ROLE_REQUIRED["/admin/config"] = ["ADMIN"]` existe no proxy mas outros módulos ainda precisam de entrada

#### 16. Impacto em outros módulos
`StoreConfig.laborCostPerHour`, `fixedCostMonthly`, `monthlyProductionUnits` e `targetMarginPercent` alimentam diretamente a fórmula de precificação. Toda alteração nesses campos impacta o `costPrice` calculado de todos os produtos.

---

### Módulo 2 — Categorias

#### 1. Objetivo
Agrupar produtos por tipo para exibição ordenada na vitrine e filtragem no módulo admin.

#### 2. Responsabilidades
CRUD de `ProductCategory`, controle de ordem de exibição (`sortOrder`), geração de `slug` único para URLs futuras.

#### 3. Entidades envolvidas
- `ProductCategory` (id, name unique, slug unique, sortOrder, products[])

#### 4. Relacionamentos
`ProductCategory` 1:N `Product` — cada produto pertence a exatamente uma categoria.

#### 5. Dependências
Nenhuma — é um cadastro base independente.

#### 6. Campos obrigatórios
`name` (único, máx 100 chars), `slug` (único, gerado automaticamente a partir do nome).

#### 7. Campos opcionais
`sortOrder` (padrão 0), descrição (ausente no schema — pode ser adicionada sem breaking change).

#### 8. Campos para fases futuras
- `description` — descrição da categoria para exibição na vitrine (não existe no schema atual)
- `imageUrl` — imagem de capa da categoria (ausente no schema)
- `active` — para desativar categorias sem excluir (ausente no schema)

#### 9. Serviços necessários
`src/lib/productCategoryService.ts` (servidor):
- `listCategories(): Promise<ProductCategory[]>`
- `createCategory(input): Promise<ProductCategory>`
- `updateCategory(id, input): Promise<ProductCategory>`
- `deleteCategory(id): Promise<void>` — apenas se sem produtos vinculados

#### 10. Validators necessários
`src/lib/validators/productCategory.ts`:
- `name` obrigatório, máx 100 chars
- `name` único (verificação no service/repository, não no validator puro)
- `slug` gerado automaticamente (nunca editável diretamente)
- Bloquear exclusão se existirem produtos vinculados

#### 11. Repositories necessários
`src/lib/repositories/productCategoryRepository.ts`:
- `findAllCategories(): Promise<ProductCategory[]>` (com count de produtos)
- `findCategoryById(id): Promise<ProductCategory | null>`
- `createCategory(data): Promise<ProductCategory>`
- `updateCategory(id, data): Promise<ProductCategory>`
- `countProductsByCategory(id): Promise<number>` — para validar exclusão

#### 12. APIs necessárias
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/admin/categories` | Admin | Lista todas as categorias com contagem de produtos |
| `POST` | `/api/admin/categories` | Admin | Cria nova categoria |
| `PATCH` | `/api/admin/categories/[id]` | Admin | Atualiza nome ou sortOrder |
| `DELETE` | `/api/admin/categories/[id]` | Admin | Exclui (apenas se sem produtos) |

**Atenção:** `GET /api/products` já retorna `categoryName` nos produtos — não criar endpoint público duplicado.

#### 13. Componentes React necessários
- `src/app/admin/categorias/page.tsx` — listagem com drag-and-drop de `sortOrder` (opcional) ou setas, botão "Nova categoria"
- `src/components/admin/categorias/CategoryForm.tsx` — modal/inline form: nome + slug (readonly, gerado)
- **Reutilizar:** `FormPrimitives` (Field, Section), `ValidationSummary`, `ActionBar`, `LoadingSkeleton`

#### 14. Possíveis reutilizações
- `FormPrimitives.Field` e `FormPrimitives.Section` de `src/components/admin/config/FormPrimitives.tsx`
- `ValidationSummary` de `src/components/admin/config/ValidationSummary.tsx`
- `LoadingSkeleton` de `src/components/admin/config/LoadingSkeleton.tsx`
- Padrão de página: estado `loading/submitting/error/success` idêntico ao `/admin/config/page.tsx`

#### 15. Riscos arquiteturais
- `ProductCategory` não tem campo `active` — excluir categoria com produtos é irreversível; considerar soft delete antes de implementar
- `slug` não é gerado automaticamente no schema; deve ser gerado no service (ex: `slugify(name)`)
- Categorias seedadas (Bolos, Doces & Docinhos, Kits & Coffee Break) podem ser editadas mas não devem ser excluídas enquanto houver produtos

#### 16. Impacto em outros módulos
- **Produtos:** formulário de produto depende de categorias disponíveis no select
- **Vitrine:** agrupamento dinâmico já usa `categoryName` da API — sem mudança no frontend
- **Dashboard:** filtro por categoria no módulo de relatórios (futura Fase 9)

---

### Módulo 3 — Produtos

#### 1. Objetivo
Gerenciar o catálogo de itens vendáveis: preço, prazo, categoria, ocasiões vinculadas, imagem e receitas associadas.

#### 2. Responsabilidades
CRUD de `Product`, ativação/desativação, upload de imagem (`imageUrl`), vínculo com ocasiões (`ProductOccasion`), vínculo com receitas (`ProductRecipe`), exibição de `costPrice` calculado.

#### 3. Entidades envolvidas
- `Product` (id, name, description, categoryId, imageUrl, basePrice, costPrice, leadTimeDays, active, featured)
- `ProductRecipe` (productId, recipeId, quantity)
- `ProductOccasion` (productId, occasionId)

#### 4. Relacionamentos
- `Product` N:1 `ProductCategory`
- `Product` N:N `OccasionTag` via `ProductOccasion`
- `Product` N:N `Recipe` via `ProductRecipe` (com quantidade)
- `Product` 1:N `OrderItem`

#### 5. Dependências
- **Bloqueante:** `ProductCategory` deve existir antes de criar produto
- **Opcional:** `OccasionTag` e `Recipe` podem não existir (produto sem ocasião/receita é válido)

#### 6. Campos obrigatórios
`name`, `categoryId`, `basePrice` (Decimal ≥ 0), `leadTimeDays` (Int ≥ 1).

#### 7. Campos opcionais
`description`, `imageUrl`, `active` (default true), `featured` (default false), `costPrice` (calculado, nunca editável manualmente).

#### 8. Campos para fases futuras
- `slug` — URL amigável para vitrine pública (recomendado em ARCHITECTURE.md, **ausente no schema**)
- `minOrderQuantity` — quantidade mínima de encomenda (A definir em REGRAS_NEGOCIO.md)
- `maxOrderQuantity` — quantidade máxima por pedido (A definir)
- `weight` — peso em gramas para cálculo de frete mais preciso (A definir)
- `shelfLifeDays` — validade do produto acabado (A definir)

#### 9. Serviços necessários
`src/lib/productService.ts` (servidor — diferente do `src/services/productService.ts` cliente):
- `listProducts(filters?): Promise<Product[]>` — com categoria e ocasiões
- `getProductById(id): Promise<Product | null>`
- `createProduct(input): Promise<Product>`
- `updateProduct(id, input): Promise<Product>`
- `toggleProductActive(id, active: boolean): Promise<Product>`
- `recalculateCostPrice(productId): Promise<void>` — dispara após alterar receita vinculada

#### 10. Validators necessários
`src/lib/validators/product.ts`:
- `name` obrigatório, máx 200 chars
- `categoryId` deve referenciar categoria existente
- `basePrice` ≥ 0, com até 2 casas decimais
- `leadTimeDays` ≥ 1, inteiro
- `costPrice` nunca editável manualmente (rejeitado se enviado no body)
- `imageUrl` formato de URL se fornecido

#### 11. Repositories necessários
`src/lib/repositories/productRepository.ts`:
- `findAllProducts(filters?): Promise<PrismaProduct[]>` — include category, occasions, recipes
- `findProductById(id): Promise<PrismaProduct | null>`
- `createProduct(data): Promise<PrismaProduct>`
- `updateProduct(id, data): Promise<PrismaProduct>`
- `updateProductCostPrice(id, costPrice: Decimal): Promise<void>` — chamado pelo sistema, não pelo usuário
- `linkOccasion(productId, occasionId): Promise<void>`
- `unlinkOccasion(productId, occasionId): Promise<void>`
- `linkRecipe(productId, recipeId, quantity): Promise<void>`
- `unlinkRecipe(productId, recipeId): Promise<void>`

#### 12. APIs necessárias
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/admin/products` | Admin | Lista com filtros (active, category, featured) |
| `POST` | `/api/admin/products` | Admin | Cria produto |
| `GET` | `/api/admin/products/[id]` | Admin | Detalhes com receitas e ocasiões |
| `PATCH` | `/api/admin/products/[id]` | Admin | Atualiza produto |
| `PATCH` | `/api/admin/products/[id]/toggle` | Admin | Ativa/desativa |
| `POST` | `/api/admin/products/[id]/occasions` | Admin | Vincula ocasião |
| `DELETE` | `/api/admin/products/[id]/occasions/[occasionId]` | Admin | Desvincula ocasião |
| `POST` | `/api/admin/products/[id]/recipes` | Admin | Vincula receita com quantidade |
| `DELETE` | `/api/admin/products/[id]/recipes/[recipeId]` | Admin | Desvincula receita |

**Atenção:** `GET /api/products` (público, já existente) permanece inalterado — é a API da vitrine.

#### 13. Componentes React necessários
- `src/app/admin/produtos/page.tsx` — listagem com filtros, toggle ativo/destaque
- `src/app/admin/produtos/novo/page.tsx` — formulário de criação
- `src/app/admin/produtos/[id]/page.tsx` — formulário de edição
- `src/components/admin/produtos/ProductForm.tsx` — formulário: nome, categoria, preço, prazo, descrição, imagem
- `src/components/admin/produtos/OccasionSelector.tsx` — chips multiseleção de ocasiões
- `src/components/admin/produtos/RecipeLinker.tsx` — lista de receitas vinculadas com quantidade
- `src/components/admin/produtos/CostPriceDisplay.tsx` — exibe costPrice calculado vs basePrice com alerta de margem

#### 14. Possíveis reutilizações
- `UploadImage` de `src/components/admin/config/UploadImage.tsx` — reusa para imagem do produto (type `"product"`)
- `StorageService.uploadAsset(file, "product")` — já definido no `AssetType`
- `FormPrimitives` (`Field`, `Section`, `inputClass`) — campos do formulário
- `ValidationSummary` — toast de sucesso/erro
- `ActionBar` — barra Salvar + Voltar
- `LoadingSkeleton` — estado de carregamento
- `formatCurrency` de `src/lib/formatters/currency.ts`

#### 15. Riscos arquiteturais
- **`imageEmoji` vs `imageUrl`:** `types.ts` ainda tem `imageEmoji: string` como campo obrigatório; ao implementar upload, a vitrine deve usar `imageUrl` quando disponível e emoji como fallback — esse fallback precisa ser removido progressivamente
- `costPrice` deve ser **nunca editável manualmente** — o validator deve rejeitar o campo se incluído no body do PATCH
- Ao desvincular uma receita, `costPrice` deve ser recalculado automaticamente
- `ProductRecipe.quantity` — representa quantas vezes a receita é executada para produzir 1 unidade do produto; o formulário precisa deixar isso claro

#### 16. Impacto em outros módulos
- **Vitrine:** `GET /api/products` continua funcionando — nenhuma mudança necessária no frontend público
- **Checkout:** usa `productId` para vincular `OrderItem` — snapshot de nome/preço preservado
- **Dashboard Produção:** consolidação de ingredientes depende de `ProductRecipe → RecipeIngredient`
- **Precificação:** `costPrice` atualizado automaticamente ao mudar preço de ingrediente ou receita

---

### Módulo 4 — Ingredientes

#### 1. Objetivo
Controlar as matérias-primas: preço atual, histórico de preços, estoque, categoria e vínculo com fornecedor.

#### 2. Responsabilidades
CRUD de `Ingredient`, atualização de `currentPrice` com registro automático em `IngredientPriceHistory`, alerta de estoque mínimo, CRUD de `IngredientCategory`, CRUD de `UnitOfMeasure` e `UnitConversion`.

#### 3. Entidades envolvidas
- `Ingredient` (id, name, categoryId?, unitId, currentPrice, stockQuantity, minStock, supplier, externalCode, externalSource, active)
- `IngredientCategory` (id, name unique)
- `IngredientPriceHistory` (id, ingredientId, price, source, notes, recordedAt)
- `UnitOfMeasure` (id, name, abbreviation unique, type)
- `UnitConversion` (id, fromUnitId, toUnitId, factor, description)

#### 4. Relacionamentos
- `Ingredient` N:1 `IngredientCategory` (opcional)
- `Ingredient` N:1 `UnitOfMeasure`
- `Ingredient` 1:N `IngredientPriceHistory`
- `Ingredient` N:N `Recipe` via `RecipeIngredient`
- `UnitConversion` N:1 `UnitOfMeasure` (fromUnit) — **FALTAM @relation no schema atual** (ver seção 4)
- `UnitConversion` N:1 `UnitOfMeasure` (toUnit) — **FALTAM @relation no schema atual**

#### 5. Dependências
- **Bloqueante:** `UnitOfMeasure` deve existir antes de criar ingrediente
- **Opcional:** `IngredientCategory` pode não existir (campo nullable)

#### 6. Campos obrigatórios
`name`, `unitId` (FK para UnitOfMeasure), `currentPrice` (Decimal ≥ 0).

#### 7. Campos opcionais
`categoryId`, `stockQuantity` (default 0), `minStock` (default 0), `supplier` (texto livre por ora), `externalCode`, `externalSource`, `active` (default true).

#### 8. Campos para fases futuras
- `maxStock` — estoque máximo (A definir em REGRAS_NEGOCIO.md, **ausente no schema**)
- `lossPercentage` — percentual de perda no uso (A definir, **ausente no schema**)
- `supplierId` — FK para entidade Fornecedor quando implementada (hoje apenas `supplier: String?`)
- Controle por lote (`batchNumber`, `expiryDate`) — A definir, **ausente no schema**
- `externalCode` + `externalSource` — já existem, prontos para integração CONAB/CEPEA

#### 9. Serviços necessários
`src/lib/ingredientService.ts` (servidor):
- `listIngredients(filters?): Promise<Ingredient[]>`
- `getIngredientById(id): Promise<Ingredient | null>`
- `createIngredient(input): Promise<Ingredient>`
- `updateIngredient(id, input): Promise<Ingredient>` — ao atualizar `currentPrice`, gera `IngredientPriceHistory` e dispara recálculo de `costPrice`
- `toggleIngredientActive(id, active): Promise<Ingredient>`
- `getPriceHistory(ingredientId): Promise<IngredientPriceHistory[]>`
- `listLowStock(): Promise<Ingredient[]>` — `stockQuantity <= minStock`

`src/lib/unitService.ts` (servidor):
- `listUnits(): Promise<UnitOfMeasure[]>`
- `createUnit(input): Promise<UnitOfMeasure>`
- `listConversions(): Promise<UnitConversion[]>`
- `createConversion(input): Promise<UnitConversion>`
- `convertQuantity(quantity, fromUnitId, toUnitId): Promise<Decimal>` — para uso nos cálculos de receita

#### 10. Validators necessários
`src/lib/validators/ingredient.ts`:
- `name` obrigatório, máx 200 chars
- `unitId` deve referenciar unidade existente
- `currentPrice` ≥ 0
- `stockQuantity` ≥ 0
- `minStock` ≥ 0
- `externalSource` deve ser um dos valores de `PriceSource` se fornecido

`src/lib/validators/unit.ts`:
- `name` obrigatório
- `abbreviation` obrigatório, único
- `type` deve ser um de `"mass" | "volume" | "unit"`

#### 11. Repositories necessários
`src/lib/repositories/ingredientRepository.ts`:
- `findAllIngredients(filters?): Promise<PrismaIngredient[]>`
- `findIngredientById(id): Promise<PrismaIngredient | null>`
- `createIngredient(data): Promise<PrismaIngredient>`
- `updateIngredient(id, data): Promise<PrismaIngredient>`
- `createPriceHistoryEntry(data): Promise<PrismaIngredientPriceHistory>`
- `findIngredientsBelowMinStock(): Promise<PrismaIngredient[]>`

`src/lib/repositories/unitRepository.ts`:
- `findAllUnits(): Promise<PrismaUnitOfMeasure[]>`
- `createUnit(data): Promise<PrismaUnitOfMeasure>`
- `findAllConversions(): Promise<PrismaUnitConversion[]>`
- `createConversion(data): Promise<PrismaUnitConversion>`
- `findConversion(fromUnitId, toUnitId): Promise<PrismaUnitConversion | null>`

#### 12. APIs necessárias
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/admin/ingredients` | Admin | Lista com filtros (active, category, low-stock) |
| `POST` | `/api/admin/ingredients` | Admin | Cria ingrediente |
| `PATCH` | `/api/admin/ingredients/[id]` | Admin | Atualiza; se currentPrice muda, gera histórico |
| `GET` | `/api/admin/ingredients/[id]/price-history` | Admin | Histórico de preços |
| `GET` | `/api/admin/units` | Admin | Lista unidades e conversões |
| `POST` | `/api/admin/units` | Admin | Cria unidade |
| `POST` | `/api/admin/units/conversions` | Admin | Cria conversão entre unidades |
| `GET` | `/api/admin/ingredient-categories` | Admin | Lista categorias de ingredientes |
| `POST` | `/api/admin/ingredient-categories` | Admin | Cria categoria de ingrediente |

#### 13. Componentes React necessários
- `src/app/admin/insumos/page.tsx` — listagem com badge de estoque crítico
- `src/app/admin/insumos/[id]/page.tsx` — formulário de edição + histórico de preços
- `src/app/admin/unidades/page.tsx` — listagem de unidades e conversões
- `src/components/admin/insumos/IngredientForm.tsx` — formulário completo
- `src/components/admin/insumos/PriceHistoryTable.tsx` — tabela de histórico de preços
- `src/components/admin/insumos/StockBadge.tsx` — badge vermelho quando abaixo do mínimo
- `src/components/admin/unidades/UnitForm.tsx` — criação de unidade
- `src/components/admin/unidades/ConversionForm.tsx` — criação de conversão

#### 14. Possíveis reutilizações
- `FormPrimitives` — todos os campos do formulário
- `ValidationSummary` — toasts de feedback
- `ActionBar` — barra Salvar + Voltar
- `LoadingSkeleton` — estado de carregamento
- `formatCurrency` de `src/lib/formatters/currency.ts` — exibição de preços
- `formatDate` de `src/lib/formatters/date.ts` — histórico de preços com data

#### 15. Riscos arquiteturais
- **`UnitConversion` sem `@relation`**: schema atual não define relação com `UnitOfMeasure`. Prisma não cria FK nem permite include relacional. **Deve ser corrigido no schema antes de implementar este módulo.** (ver seção 4)
- `Ingredient.supplier` é `String?` — ao implementar Fornecedor (Fase 5), será necessário adicionar `supplierId FK` ao model, o que é uma migration com dados existentes
- `UnitOfMeasure.type` é `String` sem validação de enum — dados inválidos (ex: `"peso"`) podem entrar sem erro

#### 16. Impacto em outros módulos
- **Receitas:** `RecipeIngredient` depende de `ingredientId` e `unitId` — sem ingredientes, receitas não podem ser cadastradas
- **Precificação:** alterar `currentPrice` deve disparar recálculo de `costPrice` em todos os produtos com receitas que usam esse ingrediente
- **Produção:** consolidação de ingredientes por data depende de `RecipeIngredient × OrderItem.quantity`
- **Estoque:** `stockQuantity` e `minStock` são os campos base para alertas e baixa automática

---

### Módulo 5 — Embalagens

> **Decisão arquitetural tomada em 30/06/2026: Opção B — Entidade própria `Packaging`.**
> Embalagens possuem regras de negócio distintas dos ingredientes: cadastro próprio, estoque próprio, fornecedores próprios e custos próprios. A `Recipe` referenciará `RecipeIngredient` (ingredientes) e `PackagingItem` (embalagens) em tabelas separadas. A análise abaixo já reflete esta decisão.

#### 1. Objetivo
Controlar itens de embalagem (caixas, saquinhos, fitas, tags, lacres) como insumos com custo unitário e estoque próprios, compondo o custo total do produto.

#### 2. Responsabilidades
CRUD de embalagem, controle de estoque, vínculo com produto para composição de custo.

#### 3. Entidades envolvidas
**NÃO EXISTEM NO SCHEMA ATUAL.** O DOMAIN_MODEL.md registra: "Entidade não existe no schema atual. Planejada como módulo futuro."

As entidades necessárias (a criar no schema):
- `Packaging` (id, name, type, description, unitCost, stockQuantity, minStock, supplierId, active) — **ausente no schema**
- `PackagingItem` (id, recipeId, packagingId, quantity, unitId) — **ausente no schema** (tabela de junção Receita → Embalagem)

#### 4. Relacionamentos
- `Recipe` 1:N `PackagingItem` — uma receita pode usar N embalagens
- `PackagingItem` N:1 `Packaging` — cada linha aponta para uma embalagem
- `PackagingItem` N:1 `UnitOfMeasure` — unidade de medida da embalagem na receita
- `Packaging` N:1 `Supplier` — embalagem tem fornecedor (entidade `Supplier` também a criar)
- `IngredientPriceHistory` não se aplica a embalagens — embalagens têm `unitCost` direto (preço unitário já é o custo)

#### 5. Dependências
**Decisão tomada (30/06/2026): Opção B — Entidade própria.**

| Dependência | Tipo | Observação |
|-------------|------|-----------|
| `UnitOfMeasure` | Bloqueante | `PackagingItem.unitId` exige unidades cadastradas |
| `Supplier` (Fornecedor) | Opcional | `Packaging.supplierId` — pode ser null inicialmente |
| Schema atualizado + `db:push` | Bloqueante | Criar antes da Sprint de Receitas |

#### 6. Campos obrigatórios (modelo `Packaging`)
`name`, `unitCost`, `active`

#### 7. Campos opcionais
`description`, `type` (CAIXA/SAQUINHO/FITA/ETIQUETA/OUTRO), `stockQuantity`, `minStock`, `supplierId`, `imageUrl`

#### 8. Campos para fases futuras
- `barcode` — para leitura de código de barras em entradas de estoque
- `defaultQuantityPerUnit` — quantidade padrão por produto (ex: 1 caixa por bolo)

#### 9. Serviços necessários
- `packagingService.ts` — `getPackagings()`, `upsertPackaging(input)`, `deletePackaging(id)`

#### 10. Validators necessários
- `validatePackaging(input)` — name obrigatório, unitCost ≥ 0, type enum válido

#### 11. Repositories necessários
- `packagingRepository.ts` — `findAll()`, `findById()`, `create()`, `update()`, `softDelete()`

#### 12. APIs necessárias
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/admin/packagings` | Admin | Lista embalagens ativas |
| `POST` | `/api/admin/packagings` | Admin | Cria embalagem |
| `PUT` | `/api/admin/packagings/[id]` | Admin | Atualiza embalagem |
| `DELETE` | `/api/admin/packagings/[id]` | Admin | Desativa embalagem (soft delete) |

#### 13. Componentes React necessários
- `PackagingList` — tabela com busca e filtro por tipo
- `PackagingForm` — formulário de criação/edição (nome, tipo, custo, estoque, fornecedor)
- `PackagingSelector` — seletor inline para uso no formulário de Receitas

#### 14. Reutilizações disponíveis
- `FormPrimitives` (`Field`, `Section`, `inputClass`) — base do formulário
- `ValidationSummary` + `ActionBar` — padrão de toast e barra de ação
- `LoadingSkeleton` — skeleton de carregamento

#### 15. Riscos arquiteturais
- `PackagingItem` referencia `UnitOfMeasure` — se `UnitConversion` não tiver `@relation` corrigido (IC-02), conversões entre unidades de embalagem falharão
- `supplierId` opcional permite cadastrar embalagem sem fornecedor — OK para o MVP
- Custo de embalagem entra diretamente no `costPrice` da receita — deve ser tratado da mesma forma que o custo de ingredientes na fórmula de precificação

#### 16. Impacto em outros módulos
| Módulo impactado | Tipo de impacto |
|-----------------|----------------|
| Receitas | `Recipe` ganha nova relação `PackagingItem[]` — fórmula de custo soma ingredientes + embalagens |
| Precificação | `costPrice` do produto passa a incluir custo de embalagem |
| Compras (Fase 5) | Módulo de Compras precisará suportar entrada de embalagens, não só ingredientes |
| Estoque | Estoque de embalagens gerenciado separadamente do estoque de ingredientes |
Pendentes até a decisão arquitetural. Ver seção 9 — Pontos de Atenção.

---

### Módulo 6 — Fornecedores

#### 1. Objetivo
Cadastrar e gerenciar fornecedores de ingredientes e embalagens com informações completas de contato e histórico de relacionamento.

#### 2. Responsabilidades
CRUD de fornecedor, vínculo com ingredientes, histórico de compras (Fase 5).

#### 3. Entidades envolvidas
**NÃO EXISTE NO SCHEMA ATUAL.** Apenas `Ingredient.supplier: String?` (campo texto livre).

A entidade planejada seria:
- `Supplier` (id, name, legalName?, cnpj?, phone?, email?, address?, leadTimeDays?, active) — **ausente**

#### 4. Relacionamentos
`Supplier` 1:N `Ingredient` — **ausente** (hoje é campo texto)

#### 5. Dependências
Nenhuma bloqueante para o módulo em si. Mas sua ausência como entidade bloqueia o módulo de Compras (Fase 5).

#### 6-16. Estado atual e impacto
O campo `Ingredient.supplier: String?` permite armazenar o nome do fornecedor como texto. Esta é uma simplificação intencional para MVP.

**Risco de migração:** ao criar a entidade `Supplier` e adicionar `supplierId: String?` ao `Ingredient`, será necessário migrar os dados existentes (strings) para registros na nova tabela. Quanto mais ingredientes forem cadastrados com `supplier` como texto, maior o esforço de migração.

**Recomendação:** criar a entidade `Supplier` no schema **antes** de popular ingredientes em produção. Custo zero agora; custo de migração cresce com dados.

---

### Módulo 7 — Clientes

#### 1. Objetivo
Visualizar e gerenciar a base de clientes: histórico de pedidos, endereços salvos, anotações internas.

#### 2. Responsabilidades
Listagem de clientes (admin), visualização de perfil, gerenciamento de endereços, anotações internas, deduplicação de `Address`.

#### 3. Entidades envolvidas
- `Customer` (id, name, phone unique, email?, notes?, addresses[], orders[])
- `Address` (id, customerId, label?, street, number, complement?, neighborhood, city, state, zipCode, latitude?, longitude?, isDefault)
- `OtpCode` (id, customerId?, phone, code, expiresAt, usedAt?)

#### 4. Relacionamentos
- `Customer` 1:N `Address` (com `isDefault`)
- `Customer` 1:N `Order`
- `Customer` 1:N `OtpCode`
- `Address` 1:N `Order` (via `Order.addressId`)

#### 5. Dependências
- **Opcional:** Auth OTP WhatsApp (KI-03/KI-05) — módulo admin de clientes funciona sem OTP; apenas visualização de clientes criados via checkout

#### 6. Campos obrigatórios
`Customer.name`, `Customer.phone` (único, imutável).

#### 7. Campos opcionais
`Customer.email`, `Customer.notes` (nunca visível ao cliente).

#### 8. Campos para fases futuras
- `Customer.birthDate` — para aniversário e marketing (ausente no schema)
- `Customer.preferredDeliveryTime` — preferência de horário (ausente)
- `Customer.blocklist` — flag para clientes problemáticos (ausente)
- `Address.latitude/longitude` — já existem, prontos para Google Maps

#### 9. Serviços necessários
`src/lib/customerService.ts` (servidor):
- `listCustomers(filters?): Promise<Customer[]>` — com contagem de pedidos e LTV
- `getCustomerById(id): Promise<Customer | null>` — com pedidos e endereços
- `updateCustomerNotes(id, notes): Promise<Customer>` — única edição permitida pelo ADMIN
- `listCustomerAddresses(customerId): Promise<Address[]>`
- `setDefaultAddress(customerId, addressId): Promise<void>`
- `mergeAddresses(customerId): Promise<void>` — deduplicação de KI-10

#### 10. Validators necessários
`src/lib/validators/customer.ts`:
- `notes` máx 2000 chars
- `phone` imutável — rejeitar alteração
- Apenas `notes` e `email` são editáveis pelo ADMIN (demais campos são criados pelo cliente)

#### 11. Repositories necessários
`src/lib/repositories/customerRepository.ts`:
- `findAllCustomers(filters?): Promise<PrismaCustomer[]>` — com aggregate de pedidos
- `findCustomerById(id): Promise<PrismaCustomer | null>` — with addresses, orders
- `updateCustomer(id, data): Promise<PrismaCustomer>` — apenas notes/email
- `findCustomerByPhone(phone): Promise<PrismaCustomer | null>`
- `findDuplicateAddresses(customerId): Promise<PrismaAddress[][]>` — para deduplicação

#### 12. APIs necessárias
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/admin/customers` | Admin | Lista com busca por nome/telefone |
| `GET` | `/api/admin/customers/[id]` | Admin | Perfil completo com pedidos e endereços |
| `PATCH` | `/api/admin/customers/[id]` | Admin | Atualiza apenas notes e email |
| `GET` | `/api/admin/customers/[id]/orders` | Admin | Pedidos do cliente com paginação |

#### 13. Componentes React necessários
- `src/app/admin/clientes/page.tsx` — listagem com busca, LTV, último pedido
- `src/app/admin/clientes/[id]/page.tsx` — perfil: dados, endereços, pedidos, notas
- `src/components/admin/clientes/CustomerCard.tsx` — card com nome, telefone, LTV
- `src/components/admin/clientes/AddressList.tsx` — lista de endereços com badge de padrão
- `src/components/admin/clientes/OrderHistory.tsx` — histórico de pedidos resumido

#### 14. Possíveis reutilizações
- `FormPrimitives.Field` — para o campo de notas internas
- `ValidationSummary` — toast de feedback
- `formatCurrency` — exibição de LTV
- `formatDate` — data do último pedido
- `maskPhone` de `src/lib/formatters/phone.ts` — exibição de telefone

#### 15. Riscos arquiteturais
- **KI-10 — Address acumula sem deduplicação:** cada pedido com entrega cria novo `Address` com `label="Entrega"`. Um cliente recorrente pode ter dezenas de registros idênticos. A deduplicação deve ser implementada nesta sprint ou no módulo de Clientes
- `Customer.phone` é imutável por regra de negócio (REGRAS_NEGOCIO.md 15.6) — UI deve deixar isso claro e não exibir campo de edição do telefone
- Edição de `Customer.notes` deve estar protegida por role ATENDIMENTO ou ADMIN (não qualquer usuário)

#### 16. Impacto em outros módulos
- **Checkout:** endereços salvos poderão ser pré-carregados no checkout (melhora UX)
- **Pedidos:** `Order.customerId` já vinculado — estatísticas de LTV derivam diretamente
- **WhatsApp:** notificações usam `Customer.phone` — consistência crítica

---

### Módulo 8 — Receitas

#### 1. Objetivo
Documentar o processo produtivo de cada item — ingredientes, quantidades, rendimento e custo calculado automaticamente.

#### 2. Responsabilidades
CRUD de receitas, editor dinâmico de ingredientes com conversão de unidades, cálculo automático de custo, vínculo com produtos via `ProductRecipe`, disparo de recálculo de `costPrice` em `Product`.

#### 3. Entidades envolvidas
- `Recipe` (id, name, description?, yieldQuantity, yieldUnit, prepTimeMinutes, items[], products[], active)
- `RecipeIngredient` (id, recipeId, ingredientId, quantity, unitId) — constraint unique(recipeId, ingredientId)
- `ProductRecipe` (id, productId, recipeId, quantity) — constraint unique(productId, recipeId)

#### 4. Relacionamentos
- `Recipe` 1:N `RecipeIngredient`
- `RecipeIngredient` N:1 `Ingredient`
- `RecipeIngredient` N:1 `UnitOfMeasure`
- `Recipe` N:N `Product` via `ProductRecipe`

#### 5. Dependências
- **Bloqueante:** `Ingredient` deve existir antes de criar `RecipeIngredient`
- **Bloqueante:** `UnitOfMeasure` deve existir antes de criar `RecipeIngredient`
- **Opcional:** `Product` pode não ter receita vinculada (costPrice = 0)

#### 6. Campos obrigatórios
`Recipe.name`, `Recipe.yieldQuantity` (> 0), `Recipe.yieldUnit` (texto descritivo, ex: "30 unidades").

#### 7. Campos opcionais
`Recipe.description`, `Recipe.prepTimeMinutes` (default 0), `Recipe.active` (default true).

#### 8. Campos para fases futuras
- `Recipe.restTimeMinutes` — tempo de descanso/resfriamento (A definir, **ausente no schema**)
- `Recipe.decorationTimeMinutes` — tempo de decoração (A definir, **ausente no schema**)
- `Recipe.difficulty` — nível de dificuldade (A definir, **ausente**)
- `Recipe.shelfLifeDays` — validade do produto acabado (A definir, **ausente**)
- `Recipe.version` — controle de versão para auditoria quando receita muda durante produção (A definir, **ausente**)

#### 9. Serviços necessários
`src/lib/recipeService.ts` (servidor):
- `listRecipes(filters?): Promise<Recipe[]>` — com custo calculado
- `getRecipeById(id): Promise<Recipe | null>` — com ingredientes detalhados
- `createRecipe(input): Promise<Recipe>`
- `updateRecipe(id, input): Promise<Recipe>` — após update, recalcula costPrice de produtos vinculados
- `addIngredient(recipeId, ingredientId, quantity, unitId): Promise<RecipeIngredient>`
- `removeIngredient(recipeId, ingredientId): Promise<void>`
- `updateIngredientQuantity(recipeId, ingredientId, quantity, unitId): Promise<RecipeIngredient>`
- `calculateRecipeCost(recipeId): Promise<Decimal>` — Σ(qty × currentPrice com conversão de unidade)

#### 10. Validators necessários
`src/lib/validators/recipe.ts`:
- `name` obrigatório, máx 200 chars
- `yieldQuantity` > 0
- `yieldUnit` obrigatório, máx 50 chars
- `prepTimeMinutes` ≥ 0, inteiro
- `RecipeIngredient.quantity` > 0
- `RecipeIngredient.unitId` compatível com unidade do ingrediente (mesma dimensão: massa/volume/unidade)

#### 11. Repositories necessários
`src/lib/repositories/recipeRepository.ts`:
- `findAllRecipes(): Promise<PrismaRecipe[]>` — include items.ingredient, items.unit
- `findRecipeById(id): Promise<PrismaRecipe | null>`
- `createRecipe(data): Promise<PrismaRecipe>`
- `updateRecipe(id, data): Promise<PrismaRecipe>`
- `addRecipeIngredient(data): Promise<PrismaRecipeIngredient>`
- `removeRecipeIngredient(recipeId, ingredientId): Promise<void>`
- `updateRecipeIngredient(recipeId, ingredientId, data): Promise<PrismaRecipeIngredient>`
- `findProductsByRecipe(recipeId): Promise<string[]>` — productIds para recalcular costPrice

#### 12. APIs necessárias
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/admin/recipes` | Admin | Lista com custo calculado |
| `POST` | `/api/admin/recipes` | Admin | Cria receita |
| `GET` | `/api/admin/recipes/[id]` | Admin | Detalhes com ingredientes e custo por ingrediente |
| `PATCH` | `/api/admin/recipes/[id]` | Admin | Atualiza metadados da receita |
| `POST` | `/api/admin/recipes/[id]/ingredients` | Admin | Adiciona ingrediente |
| `PATCH` | `/api/admin/recipes/[id]/ingredients/[ingredientId]` | Admin | Atualiza quantidade/unidade |
| `DELETE` | `/api/admin/recipes/[id]/ingredients/[ingredientId]` | Admin | Remove ingrediente |

#### 13. Componentes React necessários
- `src/app/admin/receitas/page.tsx` — listagem com custo calculado e produtos vinculados
- `src/app/admin/receitas/[id]/page.tsx` — editor com lista dinâmica de ingredientes
- `src/components/admin/receitas/RecipeForm.tsx` — campos básicos da receita
- `src/components/admin/receitas/IngredientEditor.tsx` — tabela editável de ingredientes com autocomplete, quantidade e unidade
- `src/components/admin/receitas/CostBreakdown.tsx` — breakdown de custo por ingrediente e custo total

#### 14. Possíveis reutilizações
- `FormPrimitives` — campos do formulário
- `ValidationSummary` — toasts
- `ActionBar` — Salvar + Voltar
- `formatCurrency` — exibição de custo por ingrediente e total
- `LoadingSkeleton` — carregamento

#### 15. Riscos arquiteturais
- **Conversão de unidades** é a parte mais complexa: `RecipeIngredient` pode usar `g` enquanto `Ingredient.unit` é `kg` — o cálculo de custo deve buscar o `UnitConversion` e aplicar o `factor`. Se `UnitConversion` não tiver `@relation`, essa query é impossível com Prisma tipado
- **Recálculo em cascata:** quando preço de ingrediente muda → recalcula custo de todas as receitas que o usam → recalcula `costPrice` de todos os produtos vinculados a essas receitas. Este processo deve ser **assíncrono** para não bloquear a requisição do usuário
- **REGRAS_NEGOCIO.md 15.4.10:** "Nunca alterar uma receita que está vinculada a pedidos em produção" — deve ser validado no service antes de qualquer update. Bloqueio ou criação de nova versão (A definir)

#### 16. Impacto em outros módulos
- **Produtos:** `costPrice` atualizado automaticamente; alerta de margem negativa ativado
- **Produção:** consolidação de ingredientes necessários por data usa `RecipeIngredient × OrderItem.quantity × ProductRecipe.quantity`
- **Financeiro:** CMV calculado a partir de `costPrice × quantity` dos pedidos entregues
- **Estoque:** baixa automática de `stockQuantity` ao confirmar produção

---

### Módulo 9 — Ocasiões

#### 1. Objetivo
Manter as tags de evento (Aniversário, Casamento, Corporativo...) que permitem ao cliente filtrar produtos na vitrine por ocasião.

#### 2. Responsabilidades
CRUD de `OccasionTag`, gerenciamento de produtos vinculados a cada ocasião.

#### 3. Entidades envolvidas
- `OccasionTag` (id, name unique, slug unique, products[])
- `ProductOccasion` (productId, occasionId) — chave composta

#### 4. Relacionamentos
`OccasionTag` N:N `Product` via `ProductOccasion`.

#### 5. Dependências
Nenhuma. É um cadastro base independente. Produtos podem vincular ocasiões, mas Produtos não dependem de Ocasiões para existir.

#### 6. Campos obrigatórios
`name` (único, máx 100 chars), `slug` (único, gerado a partir do nome).

#### 7. Campos opcionais
Nenhum atualmente no schema.

#### 8. Campos para fases futuras
- `description` — descrição da ocasião (ausente)
- `iconUrl` — ícone ou emoji da ocasião (ausente; hoje usar emoji no nome seria a alternativa)
- `sortOrder` — ordem de exibição na vitrine (ausente — atualmente não há controle de ordem)
- `active` — para desativar sem excluir (ausente)

#### 9. Serviços necessários
`src/lib/occasionService.ts` (servidor):
- `listOccasions(): Promise<OccasionTag[]>` — com contagem de produtos
- `createOccasion(input): Promise<OccasionTag>`
- `updateOccasion(id, input): Promise<OccasionTag>`
- `deleteOccasion(id): Promise<void>` — apenas se sem produtos vinculados

#### 10. Validators necessários
`src/lib/validators/occasion.ts`:
- `name` obrigatório, máx 100 chars
- Bloquear exclusão se existirem produtos vinculados

#### 11. Repositories necessários
`src/lib/repositories/occasionRepository.ts`:
- `findAllOccasions(): Promise<PrismaOccasionTag[]>` — com count de produtos
- `createOccasion(data): Promise<PrismaOccasionTag>`
- `updateOccasion(id, data): Promise<PrismaOccasionTag>`
- `countProductsByOccasion(id): Promise<number>`

#### 12. APIs necessárias
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/admin/occasions` | Admin | Lista com contagem de produtos |
| `POST` | `/api/admin/occasions` | Admin | Cria ocasião |
| `PATCH` | `/api/admin/occasions/[id]` | Admin | Atualiza nome |
| `DELETE` | `/api/admin/occasions/[id]` | Admin | Exclui (apenas se sem produtos) |

**Atenção:** `GET /api/occasions` (público, já existente) permanece inalterado.

#### 13. Componentes React necessários
- `src/app/admin/ocasioes/page.tsx` — listagem simples (provavelmente inline edit sem página separada)
- `src/components/admin/ocasioes/OccasionForm.tsx` — formulário simples: nome + slug

#### 14. Possíveis reutilizações
- `FormPrimitives` — campos
- `ValidationSummary` — toasts
- Padrão de página do módulo Categorias — estrutura idêntica, CRUD simples

#### 15. Riscos arquiteturais
- Ocasiões seedadas (7 tags) podem ser editadas mas a exclusão deve ser controlada — sem soft delete no schema, excluir cascadeia para `ProductOccasion`
- A vitrine usa `GET /api/occasions` com fallback em `OCCASIONS_FALLBACK` — mudanças nas ocasiões devem respeitar a nomenclatura esperada pelo front

#### 16. Impacto em outros módulos
- **Vitrine:** filtros de ocasião derivados da API — CRUD de ocasiões impacta diretamente a UX do cliente
- **Módulo Produtos:** formulário de produto usa `OccasionSelector` que carrega de `/api/admin/occasions`

---

### Módulo 10 — Uploads (transversal)

#### 1. Objetivo
Fornecer infraestrutura de upload de arquivos para todos os módulos que precisam de imagens: logo, favicon, produtos, categorias, clientes, ingredientes, fotos de referência de pedidos.

#### 2. Responsabilidades
Upload de arquivos para Supabase Storage, validação de tipo e tamanho, geração de URL pública, reutilização por múltiplos módulos.

#### 3. Entidades envolvidas
- `OrderAttachment` (id, orderId, fileUrl, fileName, mimeType, createdAt) — fotos de pedido
- `Product.imageUrl` (campo em Product)
- `ThemeConfig.logoUrl` e `ThemeConfig.faviconUrl` (via storeConfigService)

#### 4. Relacionamentos
- `OrderAttachment` N:1 `Order`
- Demais: campos simples de URL em seus respectivos modelos

#### 5. Dependências
- **Variáveis de ambiente:** `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já em `.env.example`
- **Route existente:** `POST /api/admin/upload` já implementada para logo/favicon
- **Serviço existente:** `src/lib/storage/StorageService.ts` com `uploadAsset(file, AssetType)`

#### 6. AssetType atual (definido em StorageService.ts)
```typescript
export type AssetType = "logo" | "favicon" | "product" | "category" | "banner" | "client" | "supplier";
```
Todos os tipos já estão definidos — apenas a API e os componentes que os utilizam precisam ser criados.

#### 7. Limites existentes (em `/api/admin/upload`)
- `logo`: JPEG/PNG/SVG/WebP, máx 2 MB
- `favicon`: PNG/SVG/ICO, máx 512 KB

**Faltam limites para:** `product`, `category`, `client`, `supplier`, `order` (fotos de referência).

#### 8. Para fases futuras
- Redimensionamento automático de imagens de produto (thumbnails)
- `OrderAttachment` via rota pública (cliente faz upload durante checkout)
- Limite de número de fotos por pedido (A definir em REGRAS_NEGOCIO.md)
- Geração de URL com assinatura (signed URL) para arquivos privados

#### 9. Extensões necessárias na route existente
`src/app/api/admin/upload/route.ts` deve ser estendido para suportar os novos tipos:
- `product` — JPEG/PNG/WebP, máx 5 MB
- `category` — JPEG/PNG/SVG, máx 2 MB
- `client` — JPEG/PNG, máx 2 MB (foto do cliente, futuramente)
- `order` — JPEG/PNG, máx 5 MB por arquivo (fotos de referência)

A rota para upload de fotos de pedido pelo **cliente** deve ser diferente (sem exigir role ADMIN):
`POST /api/orders/[id]/attachments` — protegida por sessão do cliente

#### 10. Componentes reutilizáveis existentes
- `src/components/admin/config/UploadImage.tsx` — upload com preview e botões Trocar/Remover
  - Props: `label, value, type: AssetType, accept, hint, onUpload, disabled`
  - **Já reutilizável para qualquer AssetType** — basta passar o type correto

#### 11. APIs necessárias
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/admin/upload` | Admin | Já existe — estender para novos tipos |
| `POST` | `/api/orders/[id]/attachments` | Cliente | Nova — upload de fotos de referência |
| `DELETE` | `/api/orders/[id]/attachments/[attachmentId]` | Cliente | Remove foto |

#### 12. Para o módulo Produtos
Nenhum componente novo necessário. `UploadImage` de `src/components/admin/config/UploadImage.tsx` é usado diretamente com `type="product"`.

#### 13. Para fotos de pedido (OrderAttachment)
- `src/components/checkout/ReferencePhotoUpload.tsx` — múltiplos arquivos, preview por foto, remoção individual
- `src/components/admin/producao/AttachmentViewer.tsx` — exibe fotos de referência no card do pedido (Kanban)

#### 14. Riscos arquiteturais
- `Ingredient.supplier` hoje é texto — quando Fornecedor for entidade, um campo `Supplier.logoUrl` pode ser adicionado usando o mesmo padrão
- Supabase free tier tem limite de storage — considerar limpeza de imagens antigas ao substituir

#### 15. Impacto em outros módulos
Transversal — todos os módulos com imagem usam `UploadImage` e `StorageService`.

---

## 4. Revisão do Schema Prisma

### 4.1 Entidades faltando

| Entidade | Status no schema | Impacto | Quando adicionar |
|----------|-----------------|---------|-----------------|
| `Supplier` (Fornecedor) | Ausente — apenas `Ingredient.supplier: String?` | Bloqueia módulo Compras; risco de migração cresce com dados | Antes de popular ingredientes em produção |
| `Packaging` (Embalagem) | Ausente | Bloqueia precificação completa; decisão pendente | Ver seção 5 — antes de Sprint de Receitas |
| Entidades Financeiras (`Transaction`, `Account`, `Category`) | Ausentes | Bloqueia Fase 6 (Financeiro) | Fase 6 — schema próprio |
| `Purchase` (Compra/Entrada de estoque) | Ausente | Bloqueia controle real de estoque | Fase 5 |

### 4.2 Campos faltando em modelos existentes

| Modelo | Campo faltante | Tipo sugerido | Justificativa |
|--------|---------------|---------------|---------------|
| ✅ `Product` | `slug` | `String? @unique` | **Adicionado Sprint 2.A.2** — URLs amigáveis futuras |
| `Product` | `minOrderQuantity` | `Int @default(1)` | A definir em REGRAS_NEGOCIO.md |
| `Ingredient` | `maxStock` | `Decimal?` | A definir em REGRAS_NEGOCIO.md seção 7.3 |
| `Ingredient` | `lossPercentage` | `Decimal? @default(0)` | A definir em REGRAS_NEGOCIO.md seção 7.3 |
| `Recipe` | `restTimeMinutes` | `Int @default(0)` | A definir em REGRAS_NEGOCIO.md seção 6.3 |
| `Recipe` | `decorationTimeMinutes` | `Int @default(0)` | A definir em REGRAS_NEGOCIO.md seção 6.3 |
| `Recipe` | `version` | `Int @default(1)` | Controle de versão para auditoria em produção |
| ✅ `OccasionTag` | `sortOrder` | `Int @default(0)` | **Adicionado Sprint 2.A.2** — controle de ordem na vitrine |
| `ProductCategory` | `description` | `String?` | Descrição para vitrine |
| `ProductCategory` | `active` | `Boolean @default(true)` | Soft delete — avaliar Sprint 2.B.1 |
| ✅ `UnitOfMeasure` | `type` deveria ser enum | `enum UnitType { MASS VOLUME UNIT }` | **Adicionado Sprint 2.A.2** — sem enum não havia validação no banco |
| `StoreConfig` | `workingDays` | `String? (JSON)` ou entidade | Dias de funcionamento para prazo de entrega |

### 4.3 Relacionamentos ausentes

| Modelo | Problema | Impacto | Correção |
|--------|---------|---------|---------|
| ✅ `UnitConversion` | **Sem `@relation` para `UnitOfMeasure`** em `fromUnitId` e `toUnitId` | **Crítico:** sem FK, sem integridade referencial, sem include relacional no Prisma | **Resolvido Sprint 2.A.1:** `@relation("ConversionFrom")` e `@relation("ConversionTo")` adicionados |
| ✅ `UnitConversion` | `fromUnitId` e `toUnitId` sem constraint unique combinada | Conversão duplicada pode ser criada | **Resolvido Sprint 2.A.1:** `@@unique([fromUnitId, toUnitId])` adicionado |

### 4.4 Riscos de migração futura

| Risco | Gravidade | Quando ocorre |
|-------|-----------|--------------|
| `Ingredient.supplier: String?` → `supplierId FK` | Alta | Ao implementar entidade Fornecedor com dados existentes |
| `UnitOfMeasure.type: String` → enum | Média | Alterar tipo de dado em coluna com dados requer migration de dado |
| Falta de `Product.slug` | Média | Ao implementar URLs amigáveis, coluna não-nullable requer default temporário |
| Schema sem `Packaging` | Alta | Se custo de embalagem for incluído em `costPrice`, e não houver entidade, cálculo será incompleto |
| `Recipe` sem versão | Média | Ao alterar receita com pedidos em produção — sem versão, histórico é perdido |

### 4.5 Tabelas que deveriam ser criadas antecipadamente

| Tabela | Justificativa | Status |
|--------|--------------|--------|
| `Supplier` | Cada ingrediente cadastrado com `supplier` como texto aumenta custo de migração futura | ✅ Schema criado Sprint 2.A.2 · UI em Módulo 2.E |
| `Packaging` + `PackagingItem` | Necessário antes de Receitas para incluir custo de embalagem | ✅ Schema criado Sprint 2.A.2 · UI em Módulo 2.H |
| `UnitConversion` — `@relation` corrigido | Módulo Ingredientes depende de conversão funcional | ✅ Resolvido Sprint 2.A.1 |

### 4.6 ✅ Confirmação do KI-17 — PaymentStatus divergente (RESOLVIDO Sprint 2.A.2)

| Fonte | Antes | Depois (correto) |
|-------|-------|-----------------|
| `prisma/schema.prisma` | `PENDENTE, PAGO, PARCIAL, ESTORNADO` | Inalterado (estava correto) |
| `src/lib/types.ts` | `"PENDENTE", "PAGO", "FALHOU", "REEMBOLSADO"` | `"PENDENTE", "PAGO", "PARCIAL", "ESTORNADO"` |

**Resolução:** `FALHOU→PARCIAL` e `REEMBOLSADO→ESTORNADO` corrigidos em `src/lib/types.ts` na Sprint 2.A.2. Confirmado via grep: 0 ocorrências de `FALHOU`/`REEMBOLSADO` em todo o projeto.

**Correção obrigatória antes de qualquer sprint:**
```typescript
// src/lib/types.ts — substituir:
export type PaymentStatus = "PENDENTE" | "PAGO" | "FALHOU" | "REEMBOLSADO";
// por:
export type PaymentStatus = "PENDENTE" | "PAGO" | "PARCIAL" | "ESTORNADO";
```

---

## 5. Inconsistências Encontradas

### ✅ IC-01 — KI-17: PaymentStatus divergente (Alta)
**Localização:** `src/lib/types.ts` linha 18–22 vs `prisma/schema.prisma` linha 35–40
**Impacto:** Integração PIX (ÉPICO 5), módulo Financeiro
**Resolução (Sprint 2.A.2):** Valores corrigidos em `types.ts`: `FALHOU→PARCIAL`, `REEMBOLSADO→ESTORNADO`. TypeScript, Prisma e banco agora idênticos: `PENDENTE | PAGO | PARCIAL | ESTORNADO`.

### ✅ IC-02 — UnitConversion sem @relation (Alta)
**Localização:** `prisma/schema.prisma` model `UnitConversion` (linha 203–210)
**Problema:** `fromUnitId` e `toUnitId` eram strings simples sem `@relation`. O Prisma não gerava FK no banco nem permitia queries relacionais.
**Resolução (Sprint 2.A.1):** `@relation("ConversionFrom")` e `@relation("ConversionTo")` adicionados + campos inversos em `UnitOfMeasure`. `db push` + `db generate` executados.

### IC-03 — imageEmoji vs imageUrl (Média)
**Localização:** `src/lib/types.ts` linha 38 (`imageEmoji: string`) vs `prisma/schema.prisma` (`Product.imageUrl: String?`)
**Problema:** `types.ts` tem `imageEmoji` como campo **obrigatório** no TypeScript, mas o schema Prisma tem `imageUrl` opcional. O `productService.ts` mapeia `imageEmoji: "🎂"` hardcoded.
**Impacto:** Módulo Produtos (upload de imagem)
**Ação:** Sprint 2.F.5 — tornar `imageEmoji` opcional em `types.ts` e priorizar `imageUrl` quando disponível (BT-10)

### IC-04 — Supplier como texto livre vs entidade (Média)
**Localização:** `prisma/schema.prisma` `Ingredient.supplier: String?`
**Problema:** Campo texto sem integridade referencial; impossível buscar todos os ingredientes de um fornecedor específico
**Impacto:** Módulo Compras (ÉPICO futura)
**Ação:** Módulo 2.E — schema de `Supplier` criado em Sprint 2.A.2 (BT-14); UI de CRUD em 2.E.5

### ✅ IC-05 — UnitOfMeasure.type sem validação de enum (Baixa)
**Localização:** `prisma/schema.prisma` `UnitOfMeasure.type: String`
**Problema:** Qualquer string era aceita; "kg" poderia ser cadastrado como tipo `"peso"` sem erro
**Resolução (Sprint 2.A.2):** `enum UnitType { MASS VOLUME UNIT }` criado e campo `type` migrado de `String` para `UnitType`.

### IC-06 — STATUS_CLASS no front-end incompleto (Baixa)
**Localização:** `src/app/pedidos/page.tsx`
**Problema:** REGRAS_NEGOCIO.md documenta 7 status de pedido, mas os badges de cor cobrem apenas 4 (EM_PRODUCAO, PRONTO, ENTREGUE, CONFIRMADO). `RASCUNHO`, `SAIU_ENTREGA` e `CANCELADO` não têm classe visual.
**Impacto:** Experiência visual do cliente
**Ação:** Sprint 2.K.3 — completar `STATUS_CLASS` com os 7 valores ao refatorar o Dashboard (BT-12)

### ✅ IC-07 — UnitConversion sem constraint unique (Baixa)
**Localização:** `prisma/schema.prisma` model `UnitConversion`
**Problema:** Não havia `@@unique([fromUnitId, toUnitId])` — a mesma conversão podia ser cadastrada duas vezes com fatores diferentes
**Resolução (Sprint 2.A.1):** `@@unique([fromUnitId, toUnitId])` adicionado junto com correção do `@relation` (IC-02).

---

## 6. Arquitetura Sugerida

### Estrutura de pastas para o ÉPICO 2

```
src/
├── app/
│   ├── admin/
│   │   ├── produtos/
│   │   │   ├── page.tsx            ← listagem
│   │   │   ├── novo/page.tsx       ← criação
│   │   │   └── [id]/page.tsx       ← edição
│   │   ├── categorias/
│   │   │   └── page.tsx            ← listagem + CRUD inline
│   │   ├── ocasioes/
│   │   │   └── page.tsx            ← listagem + CRUD inline
│   │   ├── clientes/
│   │   │   ├── page.tsx            ← listagem
│   │   │   └── [id]/page.tsx       ← perfil
│   │   └── usuarios/
│   │       ├── page.tsx            ← listagem
│   │       └── [id]/page.tsx       ← edição
│   └── api/
│       └── admin/
│           ├── products/route.ts
│           ├── products/[id]/route.ts
│           ├── products/[id]/occasions/route.ts
│           ├── products/[id]/recipes/route.ts
│           ├── categories/route.ts
│           ├── categories/[id]/route.ts
│           ├── occasions/route.ts
│           ├── occasions/[id]/route.ts
│           ├── customers/route.ts
│           ├── customers/[id]/route.ts
│           ├── users/route.ts
│           └── users/[id]/route.ts
├── components/
│   └── admin/
│       ├── config/          ← já existe (11 componentes)
│       ├── produtos/        ← novo
│       ├── categorias/      ← novo
│       ├── ocasioes/        ← novo
│       ├── clientes/        ← novo
│       └── usuarios/        ← novo
└── lib/
    ├── validators/
    │   ├── storeConfig.ts   ← já existe
    │   ├── product.ts       ← novo
    │   ├── productCategory.ts ← novo
    │   ├── occasion.ts      ← novo
    │   └── customer.ts      ← novo (apenas notes/email editáveis)
    ├── repositories/
    │   ├── storeConfigRepository.ts  ← já existe
    │   ├── themeConfigRepository.ts  ← já existe
    │   ├── productRepository.ts      ← novo
    │   ├── productCategoryRepository.ts ← novo
    │   ├── occasionRepository.ts     ← novo
    │   └── customerRepository.ts     ← novo
    └── services/  (servidor)
        ├── storeConfigService.ts     ← já existe
        ├── productService.ts         ← novo (servidor — diferente do src/services/productService.ts cliente)
        ├── productCategoryService.ts ← novo
        ├── occasionService.ts        ← novo
        └── customerService.ts        ← novo
```

### Padrão de rota admin

Todas as rotas admin seguem o prefixo `/api/admin/` para distinguir claramente das rotas públicas (`/api/products`, `/api/orders`, `/api/occasions`) e facilitar a aplicação de middleware de auth granular.

### Nomenclatura de serviços

| Caminho | Escopo | Responsabilidade |
|---------|--------|-----------------|
| `src/lib/*Service.ts` | Servidor (next.js server) | Auth + validator + repository + mapeamento de tipos |
| `src/services/*Service.ts` | Cliente (browser fetch) | Chamadas HTTP às API Routes |

Não misturar: `src/lib/productService.ts` (servidor, usa Prisma) é diferente de `src/services/productService.ts` (cliente, usa fetch).

---

## 7. Roadmap Oficial Pós-Sprint 2.0.5

> **Atualizado em 01/07/2026 — Sprint 2.0.5.** Ordem definitiva aprovada: 12 módulos (2.A–2.L). Produtos dividido em duas fases formais independentes. CMV incluído na Fase 2 de Produtos como base para o Dashboard.
>
> **Versão anterior (Sprint 2.0.4):** Categorias e Ocasiões bundled em 2.B; Produtos Fase 1 em 2.C. Substituída pela revisão abaixo.

### Decisões da Sprint 2.0.5 (revisão final)

| # | Questão | Decisão anterior (2.0.4) | Decisão nova (2.0.5) | Justificativa |
|---|---------|--------------------------|----------------------|---------------|
| Q1 | Categorias e Ocasiões juntos ou separados? | Bundled em 2.B | **Separados: 2.B e 2.C** | Módulos com ciclos de vida distintos; separação permite tracking granular e aprovação independente |
| Q2 | Produtos Fase 1 em qual posição? | 2.C — logo após 2.B | **2.F — após Unidades e Fornecedores** | Admin cria produtos após toda a base operacional estar configurada; experiência coerente |
| Q3 | Produtos Fase 2 é módulo formal? | Parte de Receitas (2.H) | **Sim — módulo formal 2.J** | RecipeLinker + CostPrice + CMV formam um bloco de valor suficiente para módulo próprio; não deve ser apêndice de Receitas |
| Q4 | CMV onde fica? | Implícito no Dashboard | **Módulo 2.J (Produtos Fase 2)** | CMV = Σ(costPrice × qty) depende de `costPrice` calculado; a fundação deve ser estabelecida antes do Dashboard |
| Q5 | Clientes incluído ou deferido? | 2.J — último | **2.L — último** (mantido, renumerado) | Independente de toda a cadeia; encerra o ÉPICO 2 |

### Matriz de dependências do ÉPICO 2

```
Raiz (sem dependências):
├── 2.B Categorias ─────────────────────────────────────────────→ 2.F Produtos.categoryId (bloqueante)
├── 2.C Ocasiões ───────────────────────────────────────────────→ 2.F Produtos.occasions (opcional)
└── 2.D Unidades ──────────────────────┬────────────────────────→ 2.G Ingredientes.unitId (bloqueante)
                                       ├────────────────────────→ 2.H Embalagens.unitId   (bloqueante)
                                       └────────────────────────→ 2.I Receitas.unitId     (bloqueante)

2.E Fornecedores (schema Supplier) ────┬────────────────────────→ 2.G Ingredientes.supplierId (opcional)
                                       └────────────────────────→ 2.H Embalagens.supplierId  (opcional)

2.F Produtos Fase 1 ────────────────────────────────────────────→ 2.J Produtos Fase 2 (extensão)

2.G Ingredientes ───────────────────────────────────────────────→ 2.I Receitas.ingredientId (bloqueante)
2.H Embalagens (schema Packaging) ─────────────────────────────→ 2.I Receitas.packagingId  (opcional)

2.I Receitas ──────────────────────────┬────────────────────────→ 2.J Produtos Fase 2.RecipeLinker
                                       └────────────────────────→ 2.K Dashboard.consolidação

2.J Produtos Fase 2 (costPrice+CMV) ───────────────────────────→ 2.K Dashboard.CMV

Orders (existem no banco) ─────────────────────────────────────→ 2.K Dashboard.kanban
                                                               → 2.L Clientes.historico

[FLUXO COMPLETO]
2.B Categorias ─┐
2.C Ocasiões ───┼──→ 2.F Produtos Fase 1
2.D Unidades ───┤
2.E Fornecedores┤
                │
2.D Unidades ───┼──→ 2.G Ingredientes ──→ 2.I Receitas ──→ 2.J Produtos Fase 2 ──→ 2.K Dashboard
2.E Fornecedores┤
2.D Unidades ───┼──→ 2.H Embalagens ────→ 2.I Receitas
                │
           Orders ──→ 2.K Dashboard (Kanban)
           Orders ──→ 2.L Clientes
```

---

### Módulo 2.A — Correções Fundamentais ✅ Concluído 01/07/2026

**Objetivo:** Eliminar todas as inconsistências técnicas acumuladas que bloqueariam os módulos seguintes.
**Pré-requisito:** Nenhum. É o ponto de entrada obrigatório do ÉPICO 2.

| Sprint | Descrição | Status |
|--------|-----------|--------|
| **2.A.1** | Correções de schema: `UnitConversion @relation`, `@@unique`, índices | ✅ |
| **2.A.2** | TypeScript: `PaymentStatus` (FALHOU→PARCIAL, REEMBOLSADO→ESTORNADO) | ✅ |
| **2.A.3** | Repository: migrar `themeConfigRepository` de `$executeRaw` para Prisma tipado | ✅ |
| **2.A.4** | Validação: `db push` + `lint` + `tsc` + `build` + `dev` + fechar KI-17, IC-02, IC-07, DT-01 | ✅ |

---

### Módulo 2.B — Categorias

**Objetivo:** Schema completo de `ProductCategory` (novos campos + `isActive`) + CRUD admin — base classificatória do catálogo.
**Dependências:** Nenhuma — cadastro raiz.
**Consumidores:** 2.F (Produtos Fase 1) usa `categoryId` como FK obrigatória; vitrine pública exibe apenas categorias com `isActive = true`.
**Bloqueadores:** Nenhum.

> **Sprint de Schema obrigatória** — `ProductCategory` existe mas requer 3 campos novos: `isActive`, `color`, `icon`. Campo `sortOrder` mantido com o nome atual. Especificação refinada em Sprints 2.B.0 e ajustes de 01/07/2026.

#### Entidade canônica — `ProductCategory`

| Campo | Tipo Prisma | Descrição |
|-------|------------|-----------|
| `id` | `String @id @default(cuid())` | CUID gerado automaticamente |
| `name` | `String @unique` | Nome exibido no catálogo — máx. 100 chars |
| `slug` | `String @unique` | Identificador URL-amigável — gerado via `slugify(name)` na criação; **somente leitura após criação** |
| `sortOrder` | `Int @default(0)` | Ordem de exibição — **menor valor = exibido primeiro**; já existe no schema |
| `color` | `String @default("#E8A598")` | Cor visual da categoria — hex; usada em chips e badges na interface |
| `icon` | `String @default("package")` | Identificador do ícone — nome Lucide React; exibido junto ao nome |
| `isActive` | `Boolean @default(true)` | Soft delete — categorias inativas não aparecem no catálogo |
| `products` | `Product[]` | Relação inversa 1:N |

#### Política de ativação/desativação — definitiva

Categorias **não são removidas fisicamente** e **não possuem endpoint DELETE**. A única operação de ciclo de vida é ativar ou desativar via `isActive`.

Não existem, em nenhuma camada do módulo:
- Endpoint `DELETE /api/admin/categories/[id]`
- Função `delete()` no Repository
- Método `delete()` no Service
- Botão "Excluir" na interface

**Pré-condição para desativação:** antes de desativar, o Service executa `countProductsByCategory(id)`. Se houver qualquer produto vinculado, a operação é rejeitada com `CategoryHasProductsError`. Para desativar uma categoria, todos os produtos devem primeiro ser movidos para outra categoria ou inativados.

| Estado | Visível na vitrine | Aceita novos vínculos | Pré-condição |
|--------|-------------------|----------------------|--------------|
| `isActive = true` | ✅ Sim | ✅ Sim | — |
| `isActive = false` | ❌ Não | ❌ Validator rejeita `categoryId` inativo | Nenhum produto vinculado (`count = 0`) |

#### Regra de imutabilidade do slug

O `slug` é gerado uma única vez, na criação da categoria, via `slugify(name)`. Após a criação, o campo é **somente leitura**: não é exibido como campo editável no formulário de edição e não é aceito em payloads de `PATCH`. Alterações de `name` não atualizam o slug.

#### Distinção semântica

- **`ProductCategory`** = "o que é o produto" — tipo do item (Bolos, Doces, Kits)
- **`OccasionTag`** = "para qual situação o produto é vendido" — intenção de compra (Aniversário, Casamento, Corporativo)

| Sprint | Camada | Escopo |
|--------|--------|--------|
| **2.B.1** | Schema | Adicionar ao modelo `ProductCategory`: `isActive Boolean @default(true)`, `color String @default("#E8A598")`, `icon String @default("package")` · `sortOrder` mantido sem alteração · `db push` + `db generate` (parar servidor dev no Windows antes) · Atualizar `types.ts`: interface `ProductCategory` com os 3 campos novos e `ProductCategoryInput` |
| **2.B.2** | Repository + Validator | `productCategoryRepository.ts`: `findAllActive` (vitrine — `isActive = true`, ordenadas por `sortOrder` asc), `findAll` (admin — todas), `findById`, `create`, `update`, `activate`, `deactivate`, `countProducts` — **sem função `delete`** · `productCategoryValidator.ts`: `name` obrigatório máx 100 chars; `slug` ignorado em payloads de update (somente leitura); `color` deve ser string não-vazia se fornecida; `categoryId` de categoria inativa rejeitado em criação de produto |
| **2.B.3** | Service | `productCategoryService.ts`: `listActive` (vitrine), `list` (admin), `getById`, `create` (gera slug), `update`, `activate`, `deactivate` — **sem método `delete`**; slug gerado via `slugify(name)` apenas na criação |
| **2.B.4** | API | `GET /api/categories` (apenas ativas, ordenadas por `sortOrder` — rota pública para vitrine) · `GET /api/admin/categories` (todas) · `POST /api/admin/categories` · `PATCH /api/admin/categories/[id]` (name, color, icon, sortOrder — slug ignorado) · `PATCH /api/admin/categories/[id]/activate` · `PATCH /api/admin/categories/[id]/deactivate` · **sem `DELETE /api/admin/categories/[id]`** · rotas `/api/admin/*` requerem sessão admin |
| **2.B.5** | Front-end | `/admin/categorias` — listagem com badge Ativa/Inativa, preview de `color` (círculo colorido) e `icon`, `sortOrder` editável inline · formulário criar/editar: name, color (color picker + hex input), icon (input texto com preview), sortOrder · `slug` exibido como texto somente leitura (não editável) · botões "Ativar" / "Desativar" com confirmação — **sem botão "Excluir"** |
| **2.B.6** | QA | `tsc --noEmit` → 0 erros · `npm run lint` → 0 erros · criar categoria → `slug` gerado automaticamente e imutável · categoria aparece na vitrine com cor e ícone padrão · desativar → desaparece da vitrine · produtos da categoria desativada permanecem no banco íntegros · tentar vincular produto novo a categoria inativa → erro de validação · nenhuma rota DELETE existe para categorias |

**Critérios de aceite:**
- Schema sincronizado: `isActive`, `color`, `icon` presentes no banco; `sortOrder` mantido
- `slug` gerado na criação, imutável — não editável via UI nem via API
- Sem DELETE em nenhuma camada: Repository, Service, API, Front-end
- Categoria inativa: invisível na vitrine; bloqueada para novos produtos; produtos históricos preservados com FK intacta
- `color` padrão `#E8A598` e `icon` padrão `package` aplicados automaticamente quando não informados
- Vitrine exibe categorias ordenadas por `sortOrder` ascendente, apenas `isActive = true`
- Ativar/Desativar funcionais via UI com confirmação; sem botão "Excluir"

---

### Módulo 2.C — Ocasiões

**Objetivo:** CRUD admin de `OccasionTag` com `sortOrder` — filtros da vitrine gerenciáveis pelo admin.
**Dependências:** Nenhuma — cadastro raiz.
**Consumidores:** 2.F (Produtos Fase 1) usa `OccasionTag` via relação M:N em `ProductOccasion`; vitrine pública consome `/api/occasions`.
**Bloqueadores:** Nenhum.

| Sprint | Camada | Escopo |
|--------|--------|--------|
| **2.C.1** | Schema | Adicionar `sortOrder Int @default(0)` ao modelo `OccasionTag` · `db push` + `db generate` (parar servidor dev no Windows antes) |
| **2.C.2** | Repository + Validator | `occasionRepository.ts`: `findAll` (ordenado por `sortOrder`), `findById`, `create`, `update`, `countProducts` · `occasionValidator.ts`: `name` obrigatório máx 100 chars; slug gerado; bloquear exclusão com produtos vinculados |
| **2.C.3** | Service | `occasionService.ts`: `list`, `create`, `update`, `delete`, `reorder(ids[])` |
| **2.C.4** | API | `GET/POST /api/admin/occasions` · `PATCH/DELETE /api/admin/occasions/[id]` (separado de `/api/occasions` público que já existe) · todas requerem sessão admin |
| **2.C.5** | Front-end | `/admin/ocasioes` — listagem com `sortOrder` editável + criação inline + edição inline + exclusão com confirmação |
| **2.C.6** | QA | `tsc --noEmit` → 0 erros · criar ocasião → aparece nos filtros da vitrine · alterar `sortOrder` → vitrine reflete nova ordem |

**Critérios de aceite:**
- Ocasiões gerenciáveis via UI com controle de `sortOrder`
- Vitrine reflete mudanças em tempo real (ordem e conteúdo dos filtros)
- Campo `sortOrder` adicionado ao schema e banco sincronizado

---

### Módulo 2.D — Unidades de Medida

**Objetivo:** CRUD de `UnitOfMeasure` + `UnitConversion` — base para todas as quantidades do sistema, com conversão automática entre unidades.
**Dependências:** Nenhuma — cadastro raiz.
**Consumidores:** 2.G (Ingredientes) usa `unitId`; 2.H (Embalagens) usa `unitId`; 2.I (Receitas) usa `unitId` em `RecipeIngredient`.
**Bloqueadores:** Nenhum.

> Sem Sprint de Schema — `UnitOfMeasure` e `UnitConversion` já existem com `@relation` e `@@unique` corrigidos em Sprint 2.A.1. `enum UnitType` (IC-05) permanece deferido — campo `type: String` funcional para o MVP.

| Sprint | Camada | Escopo |
|--------|--------|--------|
| **2.D.1** | Repository + Validator | `unitRepository.ts`: `findAllUnits`, `createUnit`, `updateUnit`, `findAllConversions`, `createConversion`, `findConversion(fromId, toId)` · `unitValidator.ts`: `name` e `abbreviation` obrigatórios; `type` deve ser `"mass"\|"volume"\|"unit"`; bloquear conversão duplicada (enforce `@@unique`) |
| **2.D.2** | Service | `unitService.ts`: `listUnits`, `createUnit`, `updateUnit`, `listConversions`, `createConversion`, `convertQuantity(qty, fromUnitId, toUnitId): Decimal` |
| **2.D.3** | API | `GET/POST /api/admin/units` · `PATCH/DELETE /api/admin/units/[id]` · `POST/DELETE /api/admin/units/conversions` |
| **2.D.4** | Front-end | `/admin/unidades` — listagem de unidades com painel de conversões · inline create/edit de unidade · seletor from/to + fator para conversão · seed visual dos defaults: g, kg, ml, L, un |
| **2.D.5** | QA | `tsc --noEmit` → 0 erros · conversão `g → kg` (factor 0.001) criada e consultável · `@@unique` rejeita duplicata com mensagem de erro · `convertQuantity(1000, "g", "kg")` retorna `1.000` |

**Critérios de aceite:**
- Unidades e conversões cadastráveis via UI
- `convertQuantity` retorna valor correto com precisão Decimal
- `@@unique` impede par duplicado de conversão

---

### Módulo 2.E — Fornecedores

**Objetivo:** Schema `Supplier` + CRUD admin — entidade com FK disponível para Ingredientes e Embalagens.
**Dependências:** Nenhuma bloqueante externa (schema sprint é interna ao módulo).
**Consumidores:** 2.G (Ingredientes) usa `supplierId?`; 2.H (Embalagens) usa `supplierId?`.
**Bloqueadores:** `Supplier` não existe no schema atual — sprint de schema obrigatória antes de qualquer outra sprint deste módulo.

| Sprint | Camada | Escopo |
|--------|--------|--------|
| **2.E.1** | Schema | Adicionar modelo `Supplier` (id, name, legalName?, cnpj?, phone?, email?, address?, leadTimeDays?, active, createdAt, updatedAt) + `supplierId String?` FK opcional em `Ingredient` · `db push` + `db generate` · TypeScript: interfaces `Supplier` e `SupplierInput` em `types.ts` |
| **2.E.2** | Repository + Validator | `supplierRepository.ts`: `findAll`, `findById`, `create`, `update`, `softDelete`, `countLinkedIngredients` · `supplierValidator.ts`: name obrigatório máx 200 chars; CNPJ formato se fornecido |
| **2.E.3** | Service | `supplierService.ts`: `list`, `create`, `update`, `deactivate` (soft delete; bloquear se ingredientes ativos vinculados) |
| **2.E.4** | API | `GET/POST /api/admin/suppliers` · `PATCH/DELETE /api/admin/suppliers/[id]` |
| **2.E.5** | Front-end | `/admin/fornecedores` — listagem com busca + formulário completo (nome, CNPJ, telefone, email, prazo de entrega em dias) |
| **2.E.6** | QA | `tsc --noEmit` → 0 erros · `prisma studio` → modelo `Supplier` visível · criar fornecedor → disponível no seletor de Ingredientes · exclusão com ingrediente vinculado → bloqueada |

**Critérios de aceite:**
- CRUD de fornecedores funcional
- FK `supplierId` disponível nos formulários de Ingredientes e Embalagens
- Schema sincronizado; `db generate` executado; `tsc` → 0 erros

---

### Módulo 2.F — Produtos (Fase 1)

**Objetivo:** CRUD admin de `Product` — preço, imagem, categoria, ocasiões, ativar/desativar, destaque. `costPrice = 0` até Módulo 2.J.
**Dependências:** 2.B (Categorias) + 2.C (Ocasiões).
**Consumidores:** 2.J (Produtos Fase 2) adiciona RecipeLinker; 2.K (Dashboard) lê `costPrice`; vitrine pública consome `/api/products`.
**Bloqueadores:** 2.B e 2.C devem estar concluídos antes das Sprints de Front-end (o seletor de categoria e o `OccasionSelector` dependem das APIs correspondentes).

> Sem Sprint de Schema — `Product` já existe no schema Prisma.

| Sprint | Camada | Escopo |
|--------|--------|--------|
| **2.F.1** | Repository + Validator | `productRepository.ts` (servidor, dist. do cliente em `src/services/`): CRUD + `linkOccasion`, `unlinkOccasion` · `productValidator.ts`: name e categoryId obrigatórios; basePrice ≥ 0; leadTimeDays ≥ 1; `costPrice` nunca editável manualmente |
| **2.F.2** | Service | `productAdminService.ts`: `list`, `getById`, `create`, `update`, `toggleActive`, `setFeatured`; prefixo `admin` para distinguir de `src/services/productService.ts` (cliente) |
| **2.F.3** | API | `GET /api/admin/products` (filtros: active, category, featured) · `POST /api/admin/products` · `GET/PATCH /api/admin/products/[id]` · `PATCH /api/admin/products/[id]/toggle` · `POST/DELETE /api/admin/products/[id]/occasions/[occasionId]` |
| **2.F.4** | Front-end | `/admin/produtos` listagem + toggles · `/admin/produtos/novo` formulário · `/admin/produtos/[id]` edição · `OccasionSelector` chips multiseleção · exibir "Custo não calculado — disponível após módulo 2.J" quando `costPrice = 0` |
| **2.F.5** | Upload de imagem | Reutilizar `UploadImage` com `type="product"` · resolver IC-03: priorizar `imageUrl`, emoji como fallback · estender `/api/admin/upload` para tipo `product` (JPEG/PNG/WebP, 5 MB) |
| **2.F.6** | QA | `tsc --noEmit` → 0 erros · produto criado aparece na vitrine · produto desativado desaparece · `imageUrl` exibida em vez de emoji quando disponível |

**Critérios de aceite:**
- Produto criável/editável via UI com categoria, ocasiões e imagem
- Vitrine reflete mudanças em tempo real
- `costPrice` exibe "não calculado" quando zero
- RecipeLinker explicitamente ausente e documentado como pendência do Módulo 2.J

---

### Módulo 2.G — Ingredientes

**Objetivo:** CRUD de `Ingredient` + `IngredientCategory` + histórico de preços + alertas de estoque mínimo.
**Dependências:** 2.D (Unidades) + 2.E (Fornecedores).
**Consumidores:** 2.I (Receitas) usa `ingredientId` em `RecipeIngredient`; 2.K (Dashboard) usa quantidades para consolidação batch.
**Bloqueadores:** 2.D deve estar concluído (seletor de unidade no formulário); 2.E deve estar concluído (seletor de fornecedor no formulário).

> Sem Sprint de Schema — `Ingredient`, `IngredientCategory` e `IngredientPriceHistory` já existem no schema Prisma.

| Sprint | Camada | Escopo |
|--------|--------|--------|
| **2.G.1** | Repository + Validator | `ingredientRepository.ts`: CRUD + `createPriceHistoryEntry`, `findBelowMinStock` · `ingredientCategoryRepository.ts`: CRUD simples · `ingredientValidator.ts`: name e unitId obrigatórios; currentPrice ≥ 0; stockQuantity ≥ 0 |
| **2.G.2** | Service | `ingredientService.ts`: `list`, `getById`, `create`, `update` (dispara `IngredientPriceHistory` quando `currentPrice` muda), `toggleActive`, `getPriceHistory`, `listLowStock` · `ingredientCategoryService.ts`: `list`, `create`, `update` |
| **2.G.3** | API | `GET/POST /api/admin/ingredients` · `PATCH /api/admin/ingredients/[id]` · `GET /api/admin/ingredients/[id]/price-history` · `GET/POST /api/admin/ingredient-categories` |
| **2.G.4** | Front-end | `/admin/insumos` listagem com badge de estoque crítico + filtro por categoria · `/admin/insumos/[id]` formulário completo (unidade, fornecedor, `externalCode`) + tabela de histórico de preços |
| **2.G.5** | QA | `tsc --noEmit` → 0 erros · criar ingrediente → atualizar preço → `IngredientPriceHistory` gerado · `stockQuantity ≤ minStock` → badge vermelho aparece |

**Critérios de aceite:**
- Ingrediente com unidade, fornecedor, preço e histórico funcional
- `IngredientPriceHistory` gerado automaticamente ao alterar `currentPrice`
- Badge de alerta de estoque mínimo visível

---

### Módulo 2.H — Embalagens

**Objetivo:** Schema `Packaging` + `PackagingItem` + CRUD admin — embalagens como insumos com custo e estoque próprios.
**Dependências:** 2.D (Unidades) para `PackagingItem.unitId`; 2.E (Fornecedores) para `supplierId?`.
**Consumidores:** 2.I (Receitas) inclui `PackagingItem` no cálculo de custo de receita.
**Bloqueadores:** `Packaging` e `PackagingItem` não existem no schema — sprint de schema obrigatória antes de qualquer outra sprint deste módulo. 2.D deve estar concluído.

| Sprint | Camada | Escopo |
|--------|--------|--------|
| **2.H.1** | Schema | Adicionar `Packaging` (id, name, type, description?, unitCost Decimal, stockQuantity, minStock, supplierId?, active, createdAt, updatedAt) + `PackagingItem` (id, recipeId, packagingId, quantity, unitId) + enum `PackagingType` (CAIXA, SAQUINHO, FITA, ETIQUETA, OUTRO) ao `schema.prisma` · `db push` + `db generate` · TypeScript: interfaces `Packaging`, `PackagingItem` em `types.ts` (decisão arquitetural Opção B — 30/06/2026) |
| **2.H.2** | Repository + Validator | `packagingRepository.ts`: `findAll`, `findById`, `create`, `update`, `softDelete` · `packagingValidator.ts`: name obrigatório; unitCost ≥ 0; type deve ser `PackagingType` válido |
| **2.H.3** | Service | `packagingService.ts`: `list`, `create`, `update`, `deactivate` |
| **2.H.4** | API | `GET/POST /api/admin/packagings` · `PATCH/DELETE /api/admin/packagings/[id]` |
| **2.H.5** | Front-end | `/admin/embalagens` — listagem com filtro por tipo + formulário completo (nome, tipo, custo unitário, estoque, mínimo, fornecedor) |
| **2.H.6** | QA | `tsc --noEmit` → 0 erros · `prisma studio` → modelos `Packaging` e `PackagingItem` visíveis · criar embalagem → disponível no seletor de Receitas |

**Critérios de aceite:**
- CRUD de embalagens funcional
- Schema `PackagingItem` disponível para o Módulo 2.I
- Decisão arquitetural Opção B de 30/06/2026 implementada

---

### Módulo 2.I — Receitas

**Objetivo:** CRUD de `Recipe` + `RecipeIngredient` + custo calculado automaticamente a partir de ingredientes e embalagens.
**Dependências:** 2.G (Ingredientes) + 2.D (Unidades) + 2.H (Embalagens).
**Consumidores:** 2.J (Produtos Fase 2) vincula receita para calcular `costPrice`; 2.K (Dashboard) usa `RecipeIngredient × OrderItem.quantity` para consolidação batch.
**Bloqueadores:** 2.G deve estar concluído (editor precisa de ingredientes cadastrados); 2.H deve estar concluído (schema `PackagingItem` deve existir).

> Sem Sprint de Schema — `Recipe`, `RecipeIngredient` e `ProductRecipe` já existem no schema Prisma. `PackagingItem` criado em Sprint 2.H.1.

| Sprint | Camada | Escopo |
|--------|--------|--------|
| **2.I.1** | Repository + Validator | `recipeRepository.ts`: CRUD + `addRecipeIngredient`, `removeRecipeIngredient`, `updateRecipeIngredient`, `findProductsByRecipe` · `recipeValidator.ts`: name obrigatório; yieldQuantity > 0; quantidade de ingrediente > 0 |
| **2.I.2** | Service | `recipeService.ts`: `list`, `getById`, `create`, `update`, `addIngredient`, `removeIngredient`, `addPackaging`, `removePackaging`, `calculateCost(recipeId)` — Σ(qty × currentPrice com conversão de unidade via `unitService.convertQuantity`) |
| **2.I.3** | API | `GET/POST /api/admin/recipes` · `GET/PATCH /api/admin/recipes/[id]` · `POST/PATCH/DELETE /api/admin/recipes/[id]/ingredients/[ingredientId]` · `POST/PATCH/DELETE /api/admin/recipes/[id]/packagings/[packagingId]` |
| **2.I.4** | Front-end | `/admin/receitas` listagem com custo calculado · `/admin/receitas/[id]` editor com `IngredientEditor` (tabela editável, autocomplete, quantidade, unidade) + `PackagingEditor` + `CostBreakdown` |
| **2.I.5** | QA | `tsc --noEmit` → 0 erros · receita com 3 ingredientes + 1 embalagem → custo calculado corretamente · conversão de unidade aplicada no cálculo |

**Critérios de aceite:**
- Receita com custo calculado (ingredientes + embalagens)
- Editor de ingredientes com conversão de unidades funcional
- `recipeService.calculateCost` disponível para o Módulo 2.J

---

### Módulo 2.J — Produtos (Fase 2)

**Objetivo:** RecipeLinker no formulário de Produto + cálculo automático de `costPrice` + base de CMV (Custo de Mercadoria Vendida).
**Dependências:** 2.F (Produtos Fase 1) + 2.I (Receitas).
**Consumidores:** 2.K (Dashboard) lê `Product.costPrice` para calcular CMV dos pedidos entregues.
**Bloqueadores:** 2.I deve estar concluído (`recipeService.calculateCost` deve existir); 2.F deve estar concluído (formulário de produto deve existir).

> Sem Sprint de Schema — `ProductRecipe` (vínculo produto-receita) já existe no schema. `Order` e `OrderItem` já existem para o CMV.

| Sprint | Camada | Escopo |
|--------|--------|--------|
| **2.J.1** | Repository + Service | Adicionar a `productRepository.ts`: `linkRecipe`, `unlinkRecipe`, `updateCostPrice` · Adicionar a `productAdminService.ts`: `linkRecipe(productId, recipeId)`, `unlinkRecipe`, `recalculateCostPrice(productId)` — chama `recipeService.calculateCost` |
| **2.J.2** | API | `POST/DELETE /api/admin/products/[id]/recipes/[recipeId]` → aciona `recalculateCostPrice` automaticamente |
| **2.J.3** | Front-end | `RecipeLinker` no formulário de Produto (2.F): seletor de receita + botão vincular + botão desvincular · `CostPriceDisplay` real: custo calculado vs basePrice com indicador de margem · substituir "Custo não calculado" por valor real |
| **2.J.4** | CMV base + QA | `cmvService.ts`: `calculateCMV(startDate, endDate)` → Σ(`costPrice × quantity`) para pedidos com `status = ENTREGUE` · `tsc --noEmit` → 0 erros · vincular receita → `Product.costPrice` atualizado · `cmvService.calculateCMV` retorna valor correto por período |

**Critérios de aceite:**
- RecipeLinker funcional no formulário de Produto
- `Product.costPrice` calculado automaticamente ao vincular/desvincular receita
- `cmvService.calculateCMV` retorna valor correto e disponível para o Dashboard (2.K)

---

### Módulo 2.K — Dashboard Operacional

**Objetivo:** Kanban real + urgentes + contadores dinâmicos + consolidação de ingredientes por data + CMV do período (KI-04).
**Dependências:** 2.I (Receitas) para consolidação; 2.J (Produtos Fase 2) para CMV via `costPrice`; Orders (já existem).
**Consumidores:** Equipe de produção — uso diário. Encerra a cadeia produtiva completa do ÉPICO 2.
**Bloqueadores:** 2.I deve estar concluído para que `RecipeIngredient × OrderItem.quantity` seja calculável; 2.J deve estar concluído para que `Product.costPrice` esteja disponível.

> Sem Sprint de Schema — todos os modelos necessários já existem (`Order`, `OrderItem`, `OrderStatusHistory`, `Product`, `Recipe`, `RecipeIngredient`).

| Sprint | Camada | Escopo |
|--------|--------|--------|
| **2.K.1** | Repository + Service | `orderAdminRepository.ts`: `findByDateAndStatus`, contadores (urgentes, em produção, prontos) · `orderAdminService.ts`: `getKanbanData(date)`, `getConsolidation(date)` — Σ(`RecipeIngredient.quantity × OrderItem.quantity`) por ingrediente |
| **2.K.2** | API | `GET /api/admin/orders?date=&status=` (separado de `/api/orders` público) · confirmar que `PATCH /api/orders/[id]/status` registra `OrderStatusHistory` |
| **2.K.3** | Front-end | Substituir `MOCK_ORDERS` em `/admin/producao` por fetch da API · abas Hoje/Amanhã com data real · seção Urgente dinâmica · `STATUS_CLASS` completo para 7 status (resolve IC-06) · botões de ação por coluna do Kanban |
| **2.K.4** | Consolidação + CMV + QA | Seção de consolidação: ingredientes do dia com quantidades somadas · CMV do dia/semana via `cmvService.calculateCMV` (criado em 2.J.4) · `tsc --noEmit` → 0 erros · fechar KI-04 em KNOWN_ISSUES.md |

**Critérios de aceite:**
- Kanban com dados reais do banco
- Mover card registra `OrderStatusHistory`
- Consolidação de ingredientes calculada e exibida
- CMV do período visível
- Contadores dinâmicos (urgentes, em produção, prontos)
- IC-06 resolvido (`STATUS_CLASS` com 7 valores)
- KI-04 fechado em KNOWN_ISSUES.md

---

### Módulo 2.L — Clientes

**Objetivo:** Visão admin de `Customer` — listagem, perfil, histórico de pedidos, notas internas, LTV, deduplicação de endereços (KI-10).
**Dependências:** Orders e Customers já existem no banco (criados via checkout real).
**Consumidores:** Equipe administrativa — uso semanal. Módulo de encerramento do ÉPICO 2.
**Bloqueadores:** Nenhum bloqueante técnico. Pode ser iniciado a qualquer momento após 2.A.

> Sem Sprint de Schema — `Customer`, `Address` e `Order` já existem no schema Prisma.

| Sprint | Camada | Escopo |
|--------|--------|--------|
| **2.L.1** | Repository + Validator | `customerRepository.ts`: `findAll` (com LTV = Σ`Order.total`, último pedido), `findById` (com `orders`, `addresses`), `updateNotes`, `findDuplicateAddresses` · `customerValidator.ts`: notes máx 2000 chars; phone imutável (rejeitar alteração) |
| **2.L.2** | Service | `customerService.ts`: `list`, `getById`, `updateNotes`, `mergeAddresses` (deduplicação KI-10) |
| **2.L.3** | API | `GET /api/admin/customers` com busca por nome/telefone · `GET /api/admin/customers/[id]` · `PATCH /api/admin/customers/[id]` (apenas field `notes`) · `GET /api/admin/customers/[id]/orders` |
| **2.L.4** | Front-end | `/admin/clientes` listagem com LTV e último pedido · `/admin/clientes/[id]` perfil: dados, endereços, histórico de pedidos, campo de notas internas editável; telefone exibido como somente-leitura |
| **2.L.5** | QA | `tsc --noEmit` → 0 erros · LTV calculado corretamente · busca por telefone (`@unique`) funciona · deduplicação de `Address` executada · notas internas salvas |

**Critérios de aceite:**
- Clientes visíveis no admin com LTV e histórico de pedidos
- Notas internas editáveis (somente field `notes`)
- `Customer.phone` imutável — UI não exibe campo de edição
- KI-10 resolvido (deduplicação de Address)

---

## 8. Riscos Arquiteturais

| ID | Risco | Severidade | Probabilidade | Mitigação |
|----|-------|-----------|--------------|-----------|
| ✅ R-01 | Embalagem decidida como entidade separada após Receitas → retrabalho em `costPrice` | Alta | — | **Resolvido 30/06/2026:** Opção B aprovada; schema de `Packaging` incluído em Módulo 2.H antes de Receitas (2.I) |
| R-02 | `Ingredient.supplier` como texto populado antes de criar entidade `Supplier` | Média | Alta | Módulo 2.E cria `Supplier` antes de popular ingredientes em produção |
| ✅ R-03 | `UnitConversion` sem `@relation` bloqueia conversão de unidades nas Receitas | Alta | — | **Resolvido Sprint 2.A.1:** `@relation` nomeados e `@@unique` adicionados |
| R-04 | `productService` servidor vs. cliente com mesmo nome causa confusão de import | Média | Média | Módulo 2.F usa `productAdminService.ts` — convenção documentada em PROJECT_GOVERNANCE.md seção 8.2 |
| R-05 | Recálculo em cascata de `costPrice` pode ser lento com muitos produtos | Média | Baixa (MVP pequeno) | Implementar como operação síncrona agora; extrair para job assíncrono quando necessário |
| R-06 | `Product.slug` ausente dificulta URLs amigáveis quando vitrine pública for implementada | Baixa | Alta | Campo `slug String? @unique` pode ser adicionado no Módulo 2.F sem breaking change (nullable) |
| R-07 | Módulo Produtos admin (`/api/admin/products`) conflita em nomenclatura com rota pública (`/api/products`) | Baixa | Baixa | Prefixo `/api/admin/` está claro; registrar distinção em ARCHITECTURE.md no Módulo 2.F |

---

## 9. Pontos de Atenção

### PA-01 — ✅ RESOLVIDA (30/06/2026) — Embalagem como entidade separada (Opção B)

**Decisão tomada:** Entidade própria `Packaging` — **Opção B aprovada**. Registrada em ARCHITECTURE.md, DOMAIN_MODEL.md e CLAUDE.md.

Embalagens têm cadastro, estoque, fornecedores e custos independentes. `Recipe` referenciará `RecipeIngredient` (ingredientes) e `PackagingItem` (embalagens) em tabelas distintas. Schema implementado no Módulo 2.H.

### PA-02 — ✅ RESOLVIDA (01/07/2026 — Sprint 2.A) — Correções fundamentais do ÉPICO 2

As correções críticas de schema e TypeScript foram agrupadas no Módulo 2.A (Sprints 2.A.1–2.A.4). Módulo encerrado com `tsc`, `lint`, `build`, `dev` e `GET /api/config` todos sem erros.

### PA-03 — Serviço servidor vs. cliente — nomenclatura

Existe `src/services/productService.ts` (cliente, usa `fetch`). O serviço servidor criado no Módulo 2.F deve ser nomeado `productAdminService.ts` para evitar conflito de import. Convenção formalizada no template de Sprint da PROJECT_GOVERNANCE.md.

### PA-04 — `costPrice = 0` é comportamento esperado até Módulo 2.J

O campo `costPrice` em `Product` ficará como `0` (default do schema) até que o RecipeLinker seja implementado no Módulo 2.J. A UI deve exibir "Custo não calculado" quando `costPrice = 0` — não tratar como erro. Comportamento removido automaticamente ao concluir 2.J.

### PA-05 — `db:generate` obrigatório após qualquer `db:push`

Após toda sprint de schema (`2.C.1`, `2.E.1`, `2.H.1`), executar `npm run db:generate`. No Windows, parar o servidor dev antes (`DLL lock` em `query_engine-windows.dll.node` — descrito em KNOWN_ISSUES.md e PROJECT_GOVERNANCE.md seção 8.6).

---

## 10. Sugestões de Melhoria

### ✅ SM-01 — Criar `enum UnitType` no schema
**Resolvido Sprint 2.A.2 (01/07/2026).**
```prisma
enum UnitType {
  MASS    // massa: g, kg, t
  VOLUME  // volume: ml, L
  UNIT    // unidade contável: un, dz, cx
}
```
`UnitOfMeasure.type` migrado de `String` para `UnitType`. Impede dados inválidos no nível do banco.

### ✅ SM-02 — Adicionar `@@unique` em UnitConversion
**Resolvido Sprint 2.A.1 (01/07/2026).**
`@@unique([fromUnitId, toUnitId])` adicionado — garante que cada par de unidades tenha exatamente um fator de conversão. Resolução de IC-07.

### ✅ SM-03 — Adicionar `@relation` em UnitConversion
**Resolvido Sprint 2.A.1 (01/07/2026).**
`@relation("ConversionFrom")` e `@relation("ConversionTo")` adicionados em `UnitConversion` + campos inversos em `UnitOfMeasure`. Resolução de IC-02. Garante integridade referencial no nível do Prisma.

### ✅ SM-04 — Slug em Product
**Resolvido Sprint 2.A.2 (01/07/2026).**
`slug String? @unique` adicionado ao modelo `Product`. Campo nullable — não quebra dados existentes. Vitrine pública futura usará slug na URL.

### SM-05 — Renomear `src/services/productService.ts` para clareza
Pendente. O serviço admin criado no Módulo 2.F usa `productAdminService.ts` — convenção documentada em PROJECT_GOVERNANCE.md. A renomeação do existente fica para quando houver conflito real de import.

### SM-06 — Considerar `active` em ProductCategory e OccasionTag
Pendente. Ambas as entidades não têm campo `active`. Excluir uma categoria com produtos causa FK error. Adicionar `active Boolean @default(true)` permite soft delete sem cascata — avaliar na Sprint 2.B.1 (Schema de Categorias).

---

## 11. Backlog Técnico

| ID | Problema | Prioridade | Módulo | Status |
|----|---------|-----------|--------|--------|
| BT-01 | Corrigir `PaymentStatus` em `types.ts` (KI-17 / IC-01) | Crítica | 2.A.1 | ✅ Resolvido (Sprint 2.A.2) |
| BT-02 | Adicionar `@relation` em `UnitConversion` (IC-02) | Crítica | 2.A.1 | ✅ Resolvido (Sprint 2.A.1) |
| BT-03 | Adicionar `@@unique([fromUnitId, toUnitId])` em `UnitConversion` (IC-07) | Alta | 2.A.1 | ✅ Resolvido (Sprint 2.A.1) |
| BT-04 | Executar `db:generate` após schema fix para atualizar Prisma Client | Crítica | 2.A.2 | ✅ Resolvido (Sprint 2.A.4) |
| BT-05 | Migrar `themeConfigRepository.ts` de `$executeRaw` para client tipado (DT-01) | Alta | 2.A.3 | ✅ Resolvido (Sprint 2.A.3) |
| BT-06 | Adicionar `Product.slug String? @unique` | Média | 2.A.2 | ✅ Resolvido (Sprint 2.A.2) |
| BT-07 | Adicionar `OccasionTag.sortOrder Int @default(0)` | Baixa | 2.C.1 | ✅ Resolvido (Sprint 2.A.2) |
| BT-08 | Dashboard Produção: substituir dados hardcoded por API real (KI-04 / TD-11) | Alta | 2.K | 🔲 Aberto |
| BT-09 | Preencher `ROLE_REQUIRED` em `proxy.ts` para rotas de produtos e configuração (TD-06) | Alta | ÉPICO 4.D | 🔲 Aberto |
| BT-10 | Resolver `imageEmoji` vs `imageUrl` em `types.ts` e `productService.ts` (IC-03) | Média | 2.F.5 | 🔲 Aberto |
| BT-11 | Deduplicação de `Address` por cliente (KI-10 / TD-07) | Média | 2.L.2 | 🔲 Aberto |
| BT-12 | Completar `STATUS_CLASS` com os 7 valores de `OrderStatus` (IC-06) | Baixa | 2.K.3 | 🔲 Aberto |
| BT-13 | Decidir arquitetura de Embalagens | Crítica | 2.H | ✅ Resolvido (30/06/2026 — Opção B) |
| BT-14 | Criar entidade `Supplier` no schema antes de popular ingredientes em produção | Alta | 2.E (UI) | ✅ Schema resolvido (Sprint 2.A.2) · UI em 2.E |
| BT-15 | Criar `enum UnitType` para substituir `UnitOfMeasure.type: String` | Baixa | 2.A.2 | ✅ Resolvido (Sprint 2.A.2) |
| BT-16 | `loadFromOrder` no CartContext não avisa quando produto foi desativado | Baixa | 2.F.4 | 🔲 Aberto |
| BT-17 | `formatCurrency` ainda re-exportado de `mock-data.ts` em alguns pontos (TD-17) | Baixa | 2.F | 🔲 Aberto |

---

*Documento produzido em 30/06/2026 — Sprint 2.0 — Planejamento arquitetural.*
*Atualizado em 01/07/2026 — Sprint 2.0.1 — Roadmap reorganizado (2.A–2.H), PA-01 resolvida, Backlog corrigido.*
*Atualizado em 01/07/2026 — Sprint 2.0.5 — Roadmap expandido para 12 módulos (2.A–2.L): Categorias e Ocasiões como módulos autônomos; Produtos dividido em Fase 1 (2.F) e Fase 2 (2.J); Dashboard movido para 2.K.*
*Atualizado em 01/07/2026 — Sprint 2.0.6 — Higienização: todos os módulos padronizados (Objetivo/Dependências/Consumidores/Bloqueadores/Critérios de aceite/Sprints por camada); SM-01–04 e BT-01–07 marcados como resolvidos; Seções 8–11 atualizadas; Roadmap congelado.*
*Nenhum arquivo de código foi alterado.*
