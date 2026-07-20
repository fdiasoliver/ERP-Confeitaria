# MODULE_2H_PLANNING.md — Blueprint Funcional e Arquitetural: Cadastro de Embalagens

Produzido na Sprint 2.H.0 (20/07/2026) — Sprint Oficial de Planejamento Arquitetural, sem implementação de código. Primeiro módulo projetado integralmente sob o padrão consolidado na Sprint G.8 (componentes compartilhados, Cartografia de Compatibilidade, processo de homologação).

**Como usar este documento:** é a especificação de referência para as Sprints 2.H.1 a 2.H.7. Nenhuma decisão arquitetural relevante deve ser tomada durante a implementação sem primeiro verificar se já está respondida aqui.

---

## 0. Achado crítico desta sprint — conflito de documentação resolvido

Antes de qualquer planejamento nas Fases 2–11, a Fase 1 (auditoria) identificou uma **contradição real e não resolvida** entre documentos "fonte de verdade" do projeto sobre onde `Packaging` se conecta ao resto do domínio. Resolvida nesta sprint via decisão explícita do Product Owner. Ver **Seção 1** para o inventário completo e **ADR-014** (`CLAUDE.md`) para o registro formal.

**Resumo da decisão:** `Packaging` vincula-se ao **`Product`** (via novo join `ProductPackaging`), não ao `Recipe`. A decisão de 30/06/2026 registrada em `CLAUDE.md`/`ARCHITECTURE.md`/`DOMAIN_MODEL.md`/`EPICO_2_PLANEJAMENTO.md` ("Recipe referenciará RecipeIngredient e PackagingItem") está **superada** por esta ADR-014 — nunca chegou a ser implementada, e o Módulo 2.I (Receitas) já foi concluído e encerrado sem ela, confirmando na prática que o vínculo correto é com o Produto (`PLAN.md` linha 70, `CHANGELOG.md` linha 1766, `REGRAS_NEGOCIO.md` Seção 3.16/8).

---

## 1. Inventário do código e documentação existentes (Fase 1 — Auditoria)

### 1.1 Schema Prisma

Nenhum model `Packaging`/`PackagingItem`/`PackagingCategory`/`PackagingType` existe hoje em `prisma/schema.prisma` (confirmado: 30 models/enums, nenhum "Packaging"). Nenhum campo em `Recipe`, `RecipeIngredient`, `Product`, `Supplier`, `Ingredient` referencia embalagem. Não existe pasta `prisma/migrations/` — o projeto usa exclusivamente `prisma db push`.

### 1.2 Módulos irmãos (precedentes arquiteturais diretos)

| Model | Campos-chave | Papel como precedente |
|---|---|---|
| `Supplier` (232-244) | `id, name, phone?, cnpj? @unique, leadTimeDays?, notes?, active` | Entidade isolada, sem relações hoje — `Packaging.supplierId` será a primeira FK real apontando para `Supplier` |
| `IngredientCategory` (248-252) | `id, name @unique, ingredients Ingredient[]` — **sem** `active`/`isActive` | Precedente exato para `PackagingCategory`: delete físico bloqueado por contagem de uso (`IngredientCategoryHasIngredientsError`) |
| `Ingredient` (254-275) | `id, name, categoryId?, unitId, currentPrice Decimal(12,4), stockQuantity/minStock Decimal, supplier String?, active` | Precedente para `Packaging` — soft delete via `active`, estoque com mínimo |
| `Recipe`/`RecipeIngredient` (291-316) | Sem nenhum campo/relação de embalagem hoje | Confirma que a Versão A (Packaging↔Recipe) nunca foi implementada |
| `Product`/`ProductRecipe` (344-374) | `Product.costPrice` calculado; `ProductRecipe` é join `productId+recipeId+quantity` | `ProductPackaging` replica exatamente este padrão de join |

### 1.3 Camadas de código já implementadas (padrão a seguir)

**Precedente mais simples — `Supplier`** (`src/lib/repositories/supplierRepository.ts`, `src/lib/supplierService.ts`, `src/lib/validators/supplierValidator.ts`, `src/app/api/admin/suppliers/**`, `src/lib/api/supplierApi.ts`):
- Repository: `findSupplierById`, `findSupplierByCnpj`, `listSuppliersPaged`, `createSupplier`, `updateSupplier`, `activateSupplier`, `deactivateSupplier`
- Service: erros como classes (`SupplierNotFoundError`, `SupplierValidationFailedError`, `DuplicateCnpjError`); `mapToSupplier`; `normalizeDigits`; `validateBusinessRules` só para o que exige consulta ao banco
- Validator: função pura `validateSupplierCreate/Update(input): ValidationError[]`, sem acesso a banco
- Rotas: `requireAdmin()` primeiro; `GET/POST /route.ts`, `GET/PATCH /[id]/route.ts`, `PATCH /[id]/activate`, `PATCH /[id]/deactivate`; erro→HTTP via `src/lib/http/responses.ts` (`badRequest` 400, `conflict` 409, `notFound` 404, `internalError` 500)
- API client: interfaces espelhando o DTO, `ApiRequestError`, função `request<T>` genérica com `{success, data}`/`{success:false, error}`

**Precedente com relacionamento e delete protegido — `Ingredient`/`IngredientCategory`:**
- `ingredientRepository.ts`: `listAllIngredients`, `listActiveIngredients`, `findIngredientById`, `countIngredientsByCategory`, `createIngredient`, `updateIngredient`, `activateIngredient`, `deactivateIngredient`, `addPriceHistoryEntry`, `listPriceHistory`
- `ingredientService.ts`: `IngredientNotFoundError`, `IngredientValidationFailedError`, `DuplicateIngredientNameError`, `InvalidUnitReferenceError`, `InvalidCategoryReferenceError`
- `ingredientCategoryService.ts`: `IngredientCategoryHasIngredientsError` — **precedente exato para `PackagingCategoryHasPackagingsError`**

**Precedente de item aninhado — `Recipe`↔`RecipeIngredient`** (`recipeIngredientRepository.ts`, `recipeService.ts`):
- `addRecipeItem`/`updateRecipeItem`/`removeRecipeItem` sempre retornam o **DTO do pai recalculado**, nunca o item isolado
- `calculateCost` (recipeService.ts:161-184): soma `quantidade_convertida × currentPrice` por item
- Erros: `RecipeItemNotFoundError`, `InvalidIngredientReferenceError`, `InactiveIngredientError`, `IncompatibleUnitError`, `DuplicateIngredientInRecipeError`, `LastItemRemovalError`
- **Este é o precedente direto para `addPackaging`/`updatePackagingQuantity`/`removePackaging` em `productService.ts`**

**Ponto de integração exato do custo** — `productService.ts:109-127`, função `calculateCostPrice(recipes)`: soma `recipe.unitCost × link.quantity` para cada `ProductRecipe`. **Nenhum termo de embalagem existe nessa fórmula hoje** — é o ponto onde a Sprint 2.H.3 somará o custo de `ProductPackaging`.

### 1.4 Seeds

`prisma/seed.ts`/`prisma/seeds/production-chain.ts`: zero menções a Packaging. Padrão idempotente: `upsert` por chave única onde existe, `findFirst`+`create` onde não há chave única direta.

### 1.5 Documentação — inventário completo do conflito (Versão A vs. Versão B)

**Versão A — Packaging↔Recipe (mais antiga, nunca implementada, agora superada por ADR-014):**
- `CLAUDE.md`, tabela "Decisões arquiteturais tomadas" (30/06/2026): "A Recipe referenciará tanto RecipeIngredient quanto PackagingItem"
- `ARCHITECTURE.md` linha 172 — mesmo texto
- `DOMAIN_MODEL.md` linhas 173-180 — `Packaging N:N Recipe via PackagingItem`
- `EPICO_2_PLANEJAMENTO.md` (múltiplas seções, 553-636 e 1477-1521) — plano de sprint detalhado com `PackagingItem(recipeId, packagingId, quantity, unitId)`, rotas `/api/admin/recipes/[id]/packagings/[packagingId]`

**Versão B — Packaging↔Product (mais recente, tecnicamente confirmada, adotada por esta ADR-014):**
- `PLAN.md` linha 70 (entrada de 2.I): "2.H não é dependência real — RecipeIngredient não tem nenhum campo/relação com Packaging, confirmado no schema... embalagem afeta custo do Produto, não da Receita"
- `CHANGELOG.md` linha 1766 — mesma análise
- `REGRAS_NEGOCIO.md` Seções 3.16 e 8 — sempre fala em "produto", nunca em "receita"

**Fato que resolve o conflito:** o Módulo 2.I foi implementado e encerrado (`MODULE_2I_CLOSURE.md`) **sem** `PackagingItem`, sem nenhum bloqueio — confirmando que a Versão B é a que vigorou na prática.

**Outras menções encontradas, fora do escopo de edição desta ADR (Regra 3, `PROJECT_GOVERNANCE.md` Seção 13.1) — registradas como achado, não corrigidas:**
- `VISION.md` linha 779 — ainda trata "Embalagem como entidade separada vs. campo de produto" como decisão pendente (já decidido: entidade própria)
- `ERP_BLUEPRINT.md` linhas 625-942 — mistura as duas versões (fala em "embalagem com receitas vinculadas" e em "custo de embalagem compõe o costPrice do produto" no mesmo documento)
- `MODULES.md` linha 85 — dependência ainda marcada "A definir" (já definida por esta sprint)

### 1.6 MENU_STRUCTURE.md / SCREENS.md / USER_FLOW.md

Nenhuma menção a "Embalagem" — nenhuma rota `/admin/embalagens` especificada ainda. Especificada do zero na Seção 6 (UX Foundation) deste documento.

---

## 2. Modelo de domínio (Fase 2)

### 2.1 Objetivo do módulo

Controlar itens de embalagem (caixas, saquinhos, fitas, etiquetas, lacres) como insumos com cadastro, estoque e custo **próprios**, distintos de `Ingredient`, e compor o custo total do `Product` que os utiliza.

### 2.2 Responsabilidades

CRUD de embalagem (incluindo Duplicar), CRUD de categoria de embalagem, controle de estoque próprio (`stockQuantity`/`minStock`), histórico de alteração de custo, vínculo N:N com `Product` para composição de `costPrice`.

### 2.3 Entidades

#### `PackagingCategory`
Agrupa embalagens por tipo (ex: "Caixas", "Saquinhos", "Fitas e Acabamento", "Etiquetas"). Mirror exato de `IngredientCategory` — sem `active`/`isActive`, delete físico bloqueado se houver embalagens vinculadas.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `id` | `String @id @default(cuid())` | — | Padrão ADR-005 |
| `name` | `String @unique` | Sim | 2–100 caracteres |
| `packagings` | `Packaging[]` | — | Relação inversa |

#### `Packaging`
Entidade principal.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `id` | `String @id @default(cuid())` | — | ADR-005 |
| `name` | `String` | Sim | 2–150 caracteres; unicidade verificada no Service (não `@unique` no schema — mesmo padrão de `Ingredient.name`) |
| `categoryId` | `String?` | Não | FK opcional para `PackagingCategory` |
| `unitCost` | `Decimal @db.Decimal(12,4)` | Sim | ≥ 0; custo por unidade individual |
| `stockQuantity` | `Int @default(0)` | Não | Sempre inteiro — ver 2.6 |
| `minStock` | `Int @default(0)` | Não | Alerta quando `stockQuantity <= minStock` |
| `supplierId` | `String?` | Não | FK opcional para `Supplier` — fornecedor principal único (ver 2.7) |
| `active` | `Boolean @default(true)` | — | Soft delete — mesmo padrão de `Ingredient`/`Recipe`/`Supplier` |
| `priceHistory` | `PackagingPriceHistory[]` | — | Relação inversa |
| `products` | `ProductPackaging[]` | — | Relação inversa |
| `createdAt`/`updatedAt` | `DateTime` | — | Padrão |

Índices: `@@index([name])`, `@@index([categoryId])` — mirror de `Ingredient`.

#### `PackagingPriceHistory`
Registro imutável de alteração de custo — versão simplificada de `IngredientPriceHistory` (sem `source`, pois não há integração externa de índice de preço para embalagens).

| Campo | Tipo | Observação |
|---|---|---|
| `id` | `String @id @default(cuid())` | ADR-005 |
| `packagingId` | `String` | FK, `onDelete: Cascade` |
| `price` | `Decimal @db.Decimal(12,4)` | Snapshot do `unitCost` no momento do registro |
| `notes` | `String?` | Opcional |
| `recordedAt` | `DateTime @default(now())` | |

Índice: `@@index([packagingId, recordedAt])`.

#### `ProductPackaging` (join — o novo relacionamento desta ADR)

| Campo | Tipo | Observação |
|---|---|---|
| `id` | `String @id @default(cuid())` | ADR-005 |
| `productId` | `String` | FK, `onDelete: Cascade` |
| `packagingId` | `String` | FK |
| `quantity` | `Int @default(1)` | Sempre inteiro — ver 2.6 |

`@@unique([productId, packagingId])` — mesma restrição de `ProductRecipe`.

### 2.4 Relacionamentos

```
Packaging N:1 PackagingCategory (opcional)
Packaging N:1 Supplier (opcional)
Packaging 1:N PackagingPriceHistory
Packaging N:N Product via ProductPackaging (com quantity)

Recipe / RecipeIngredient: NENHUMA relação com Packaging (ADR-014)
```

### 2.5 Cardinalidades e obrigatoriedades

- Uma embalagem pertence a **zero ou uma** categoria (`categoryId?`)
- Uma embalagem tem **zero ou um** fornecedor principal (`supplierId?`) — ver 2.7 sobre múltiplos fornecedores
- Um produto pode ter **zero ou mais** embalagens vinculadas (`ProductPackaging`)
- Uma embalagem pode estar vinculada a **zero ou mais** produtos

### 2.6 Decisão de design — quantidade sempre inteira, sem `UnitOfMeasure`

**Alternativa considerada:** mirror exato de `RecipeIngredient` — `quantity Decimal(12,4)` + `unitId → UnitOfMeasure` (é o que `EPICO_2_PLANEJAMENTO.md` linha 569 propunha, mas para a Versão A/Recipe, hoje superada).

**Descartada porque:**
1. Foi desenhada para um relacionamento (`Recipe`) que deixou de ser o alvo (ADR-014).
2. Não existe caso de uso real no MVP para quantidade fracionária de embalagem — caixa, saquinho, fita, etiqueta e lacre são sempre consumidos em unidades inteiras e indivisíveis neste negócio.
3. Exigiria adicionar um novo valor a `UnitType` (`MASS`/`VOLUME`/`UNIT`) para cobrir comprimento (ex: fita por metro), aumentando escopo sem necessidade comprovada.
4. Remove uma dependência inteira do módulo (`UnitOfMeasure`/2.D deixa de ser bloqueante para 2.H).

**Decisão adotada:** `Packaging.stockQuantity`/`minStock` e `ProductPackaging.quantity` são `Int`, sem `unitId`. Reversível no futuro via nova ADR se surgir necessidade real (ex: fita vendida a granel por metro) — custo de mudança é local a `ProductPackaging`/`Packaging`, não se propaga a outras entidades.

### 2.7 Fornecedor — único, opcional

Uma embalagem tem **zero ou um** fornecedor principal (`supplierId?`, FK direta para `Supplier`) — não múltiplos fornecedores. Mesma limitação que `Ingredient.supplier` (hoje texto livre, sem múltiplos fornecedores) — controle de múltiplos fornecedores por insumo é lacuna conhecida do ERP inteiro (`REGRAS_NEGOCIO.md`, Inconsistência #9), não resolvida por este módulo. Diferente de `Ingredient`, porém, `Packaging.supplierId` já nasce como **FK real** (não texto livre) — ver Seção 9, Recomendação Arquitetural.

### 2.8 Soft delete / Ativação-Inativação

- `Packaging.active` — mesmo padrão de `Ingredient`/`Recipe`/`Supplier`. Nunca hard-deletado. Embalagem inativa não pode ser adicionada a **novos** vínculos `ProductPackaging` (mirror de "ingrediente inativo não pode ser adicionado a novas receitas"). Desativar uma embalagem já vinculada a produtos **não** desfaz os vínculos existentes nem bloqueia a operação (mesmo comportamento de `Ingredient`).
- `PackagingCategory` — **sem** `active`. Delete físico, bloqueado por `PackagingCategoryHasPackagingsError` se `countPackagingsByCategory > 0` — mirror exato de `IngredientCategory`.

### 2.9 Versionamento / Auditoria / Rastreabilidade

- `PackagingPriceHistory` nunca é deletado (mesma regra crítica de `IngredientPriceHistory`, `REGRAS_NEGOCIO.md` 15.4.12 — extensão do princípio para "histórico de custo de insumo", não só ingrediente).
- Não há snapshot de custo por pedido para embalagens (mesma lacuna já registrada para ingredientes — `REGRAS_NEGOCIO.md` 13.7, "A definir" — não resolvida nesta sprint, fora do escopo).
- `createdAt`/`updatedAt` padrão em todas as entidades novas.

---

## 3. Regras de negócio (Fase 3)

Cada regra abaixo indica a origem: **[Necessidade operacional]**, **[Consistência técnica]** ou **[Requisito funcional]**.

| # | Regra | Origem |
|---|---|---|
| 1 | Uma embalagem é um item físico usado para acondicionar/apresentar o produto final ao cliente (caixa, saquinho, fita, etiqueta, lacre) — não é matéria-prima consumida na produção do alimento em si. | Requisito funcional |
| 2 | Uma embalagem tem **zero ou um** fornecedor principal (FK direta a `Supplier`). Múltiplos fornecedores por embalagem: fora de escopo — mesma lacuna do ERP inteiro para `Ingredient` (Backlog Futuro). | Consistência técnica |
| 3 | **Não existe "embalagem composta" nem "kit de embalagens" como entidade própria.** Composição é resolvida estruturalmente: um `Product` pode ter múltiplos `ProductPackaging` (ex: caixa + fita + etiqueta no mesmo produto), cada um com sua própria quantidade. Nenhuma entidade de agrupamento é necessária. | Consistência técnica |
| 4 | O custo de uma embalagem é `unitCost` — preço direto por unidade, sem cálculo de conversão (diferente de `Ingredient`, que converte entre unidade de compra e de consumo). | Requisito funcional |
| 5 | Toda alteração de `unitCost` gera um registro em `PackagingPriceHistory` (nunca deletado). | Consistência técnica (mirror de `IngredientPriceHistory`) |
| 6 | Estoque (`stockQuantity`) é sempre inteiro. Alerta quando `stockQuantity <= minStock` (mesmo mecanismo de `Ingredient`, mesma limitação: sem UI de alerta implementada ainda em nenhum módulo do ERP). | Necessidade operacional |
| 7 | Embalagem inativa (`active=false`) não pode ser adicionada a **novos** vínculos `ProductPackaging`. Vínculos existentes não são desfeitos. | Consistência técnica (mirror de `Ingredient`) |
| 8 | Uma embalagem pode ser utilizada em **vários produtos** simultaneamente (`ProductPackaging` é N:N). | Requisito funcional |
| 9 | Uma embalagem **não** pode ser usada "parcialmente" — quantidade é sempre inteira (ver Seção 2.6). | Requisito funcional |
| 10 | `PackagingCategory` não pode ser excluída fisicamente se houver embalagens vinculadas (`PackagingCategoryHasPackagingsError`) — mirror exato de `IngredientCategory`. `Packaging` em si nunca é excluída fisicamente (só desativada) — não há endpoint `DELETE` para `Packaging`, mesmo padrão de `Ingredient`/`Recipe`/`Supplier`/`Product`. | Consistência técnica |
| 11 | **O custo da embalagem compõe o `costPrice` do produto automaticamente:** `Product.costPrice = Σ(ProductRecipe cost) + Σ(ProductPackaging cost)`. Resolve a Inconsistência #8 de `REGRAS_NEGOCIO.md` ("gap entre modelo e regras") e a pergunta pendente da Seção 16 ("Embalagem compõe o custo do produto ou é lançada separadamente?" → **compõe, automaticamente**). | Requisito funcional (decisão desta sprint) |
| 12 | Um produto pode ter **zero ou mais** opções de embalagem vinculadas (não apenas "padrão + presente" fixos) — cada `ProductPackaging` é uma linha independente com sua quantidade. Escolha de embalagem alternativa pelo **cliente** no momento do pedido (ex: embalagem de presente com custo adicional) está **fora do escopo do MVP** — ver Backlog Futuro (Seção 11). | Requisito funcional |
| 13 | Não há relação entre `Packaging`/`ProductPackaging` e `Recipe`/`RecipeIngredient` (ADR-014). | Consistência técnica |

---

## 4. Casos de uso (Fase 4)

| Caso de uso | Camada | Observação |
|---|---|---|
| Cadastrar embalagem | Frontend (`EntityForm`) → `POST /api/admin/packagings` | Nome, categoria (opcional), custo unitário, estoque, estoque mínimo, fornecedor (opcional) |
| Editar embalagem | Frontend (`EntityForm`) → `PATCH /api/admin/packagings/[id]` | Alteração de `unitCost` gera `PackagingPriceHistory` |
| **Duplicar embalagem** | Frontend — abre `EntityForm` de criação pré-preenchido com os dados da embalagem de origem (nome sufixado " (cópia)"), sem novo componente | Novo caso de uso, não existe em nenhum módulo irmão hoje — ver Seção 6.4 |
| Ativar/Inativar | `PATCH /api/admin/packagings/[id]/activate`\|`/deactivate` | Mirror de `Ingredient`/`Supplier` |
| Pesquisar | `SearchBar` (client-side, debounce 300ms) por nome | Mirror de `ingredientes/page.tsx` |
| Filtrar por categoria | `FilterChips` (se ≤ 8 categorias) | `UX_GUIDELINES.md` Seção 12 |
| Excluir | **Não existe para `Packaging`** (só desativar). Existe para `PackagingCategory`, bloqueada se em uso. | Ver regra 10 |
| Consultar utilização (onde é usado) | `GET /api/admin/packagings/[id]` inclui lista de produtos vinculados | Painel "Usado em N produtos" no detalhe, mirror do painel de ingredientes usados em `receitas/[id]` |
| Consultar custo | Exibido no card/detalhe — `unitCost` atual + link para `priceHistory` | |
| Consultar fornecedores | Nome do fornecedor exibido no card (se houver `supplierId`) | |
| Consultar produtos vinculados | Mesmo que "consultar utilização" acima | |
| Consultar receitas vinculadas | **Não aplicável** (ADR-014 — sem relação com Recipe) | |

---

## 5. Integrações (Fase 5)

| Integração | Objetivo | Dependência | Momento | Prioridade |
|---|---|---|---|---|
| Produtos | `ProductPackaging` compõe `costPrice` | `Product` (2.J, ✅ concluído) | Sprint 2.H.1 (schema) + 2.H.3 (service) | Alta — é o core do módulo |
| Fornecedores | `Packaging.supplierId` opcional | `Supplier` (2.E, ✅ concluído) | Sprint 2.H.1 | Média — campo opcional, não bloqueia |
| Receitas | **Nenhuma** (ADR-014) | — | — | — |
| Ingredientes | Nenhuma — domínio paralelo, sem relação de dados | — | — | — |
| Produção | Consumo de estoque de embalagem durante produção — **não implementado** (mesma lacuna que `Ingredient` já tem hoje, `REGRAS_NEGOCIO.md` Seção 10.3) | Módulo de Produção formal (não existe ainda) | Backlog Futuro | Baixa |
| Compras | Entrada de estoque de embalagem via compra — **não implementado** (mesma lacuna de `Ingredient`) | Módulo de Compras (não existe ainda) | Backlog Futuro | Baixa |
| Estoque | `stockQuantity`/`minStock` próprios do `Packaging` — sem módulo de Estoque dedicado (mesmo estado de `Ingredient` hoje) | — | Já incluído no schema (2.H.1) | Média |
| Custos/Precificação | `Product.costPrice` passa a somar embalagem — fórmula de `REGRAS_NEGOCIO.md` Seção 9.1 fica completa nesse termo | `productService.calculateCostPrice` | Sprint 2.H.3 | Alta |
| Financeiro | Nenhuma — módulo financeiro não existe no ERP ainda | — | — | — |

---

## 6. UX Foundation (Fase 6)

Nova rota `/admin/embalagens` (+ `/admin/embalagens/categorias`, mirror exato de `/admin/ingredientes/categorias`). Adicionar ao hub `/admin` e a `MENU_STRUCTURE.md` na Sprint 2.H.6 (nenhuma tela ainda especificada — confirmado na auditoria).

### 6.1 Página principal — `/admin/embalagens/page.tsx`

Segue **integralmente** o padrão já consolidado nas 4 páginas migradas na Sprint G.8 (`ingredientes/page.tsx` como referência mais próxima — mesmo domínio "insumo com estoque e custo"): `PageContainer` (`max-w-5xl`) + `ResponsiveGrid` de `EntityCard` — **não** o padrão legado `max-w-app` usado por `unidades/conversoes`/`ingredientes/categorias`/`receitas/[id]`. Isto evita, desde o nascimento do módulo, o mesmo débito que a Sprint G.8 precisou gerenciar (`LoadingState`/`EntityCard` adiados por dependência de layout — ver `MODULE_G8_CLOSURE.md`).

| Elemento | Componente compartilhado | Config |
|---|---|---|
| Container raiz | `PageContainer` | — |
| Faixa de estatísticas | `StatCard` × 3 | Total / Ativas / Estoque abaixo do mínimo |
| Busca | `SearchBar` | Placeholder "Pesquisar por nome…", debounce 300ms |
| Filtro por categoria | `FilterChips<string>` | Só se ≤ 8 categorias cadastradas (`UX_GUIDELINES.md` Seção 12) |
| Grid de listagem | `ResponsiveGrid` (cols=3) | 1 col mobile → 2 tablet → 3 desktop |
| Card de item | `EntityCard` | title=nome, badges=`StatusBadge`, children=custo/estoque/categoria/fornecedor, actions=Editar/Duplicar/Ativar-Desativar |
| Loading inicial | `LoadingState` | Seguro — página já nasce em `PageContainer`+grid |
| Erro de carregamento | `ErrorState` | |
| Lista vazia | `EmptyState` | |
| Modal de criação/edição/duplicação | `EntityForm` | Campos: Nome, Categoria (select), Custo unitário, Estoque atual, Estoque mínimo, Fornecedor (select) |
| Confirmação de desativação | `ConfirmDialog` | "Desativar embalagem?" — mirror de `Ingredient` |

### 6.2 Página de categorias — `/admin/embalagens/categorias/page.tsx`

Mirror **exato** de `ingredientes/categorias/page.tsx` (já migrado na Sprint G.8/MT2) — `EmptyState`, `ErrorState`, `SearchBar`, `ConfirmDialog`, `EntityForm`, `Field` (de `FormPrimitives`) reaproveitados sem adaptação. `LoadingState` e o card de linha (`CategoryRow`) ficam locais, pela mesma razão já documentada em `MODULE_G8_CLOSURE.md` — **a menos que** esta página também nasça em `PageContainer` (recomendado, ver 6.1), caso em que `LoadingState`/`EntityCard` compartilhados já se aplicam desde o início, sem débito a herdar.

### 6.3 Painel "Usado em N produtos" (detalhe de embalagem)

Não há padrão equivalente ainda em nenhum módulo irmão (o mais próximo é `receitas/[id]` mostrando ingredientes, direção oposta). Design proposto: seção dentro do próprio `EntityForm` de edição ou um link "Ver produtos vinculados (N)" que leva a uma lista simples (nome do produto + quantidade). Não é um caso de uso crítico do MVP — pode ser adiado para 2.H.6 sem bloquear 2.H.1–2.H.5.

### 6.4 Duplicar embalagem

Sem novo componente: reutiliza `EntityForm` no modo criação, com o estado inicial do formulário pré-preenchido a partir da embalagem de origem (`name` sufixado " (cópia)", demais campos idênticos). Puramente uma decisão de fluxo no `page.tsx` (`openDuplicate(source)` chama `setForm({...source, name: source.name + " (cópia)"})` e `setModal("create")`), não uma mudança de Design System.

### 6.5 Estados de erro/vazio/carregamento

Mensagens seguem o padrão de `UX_GUIDELINES.md` Seção 4 (Mensagens) e Seção 7 (Erros) — mesma voz já usada em Ingredientes/Receitas ("Nenhuma embalagem cadastrada", "Erro ao carregar embalagens").

### 6.6 Responsividade e acessibilidade

Nenhuma exceção às diretrizes já estabelecidas (`UX_GUIDELINES.md` Seções 14–16). `aria-label` em botões sem texto visível, `type="button"` explícito em todos os botões de formulário — já cobertos pelos componentes compartilhados reutilizados.

---

## 7. Estratégia de reutilização do Design System (Fase 7)

| Tela | Componentes compartilhados usados | Parcialmente compatível? | Limitação | Evolução genérica necessária? |
|---|---|---|---|---|
| `/admin/embalagens` (lista) | `PageContainer`, `ResponsiveGrid`, `StatCard`, `SearchBar`, `FilterChips`, `EntityCard`, `LoadingState`, `ErrorState`, `EmptyState`, `EntityForm`, `ConfirmDialog`, `StatusBadge` | Todos totalmente compatíveis — página nasce já em `PageContainer` | Nenhuma | Não |
| `/admin/embalagens/categorias` | `EmptyState`, `ErrorState`, `SearchBar`, `ConfirmDialog`, `EntityForm`, `Field` | Totalmente compatível se nascer em `PageContainer` (recomendado) | Nenhuma, se a recomendação de 6.1/6.2 for seguida | Não |
| Duplicar embalagem | `EntityForm` (reuso via pré-preenchimento) | Total | Nenhuma | Não |
| Painel "usado em N produtos" | Nenhum componente pronto — lista simples ad-hoc | — | Não existe um componente de "lista de referências cruzadas" no Design System | **Backlog** — se um segundo módulo precisar do mesmo padrão (ex: Ingrediente "usado em N receitas"), avaliar promover para `shared/` |

**Confirmação explícita (Recomendação Arquitetural Obrigatória #2 da Ordem de Missão):** nenhum componente compartilhado precisa ser alterado ou adaptado exclusivamente para Embalagens. Nenhum componente novo é criado nesta sprint.

---

## 8. Modelo de dados proposto (Fase 8)

Ver Seção 2.3 para os campos completos. Resumo de constraints/índices:

```prisma
enum PackagingUnitBasis {
  // Não criado — decisão da Seção 2.6: quantidade sempre Int, sem unidade
}

model PackagingCategory {
  id         String      @id @default(cuid())
  name       String      @unique
  packagings Packaging[]
}

model Packaging {
  id            String                  @id @default(cuid())
  name          String
  categoryId    String?
  category      PackagingCategory?      @relation(fields: [categoryId], references: [id])
  unitCost      Decimal                 @db.Decimal(12, 4)
  stockQuantity Int                     @default(0)
  minStock      Int                     @default(0)
  supplierId    String?
  supplier      Supplier?               @relation(fields: [supplierId], references: [id])
  active        Boolean                 @default(true)
  priceHistory  PackagingPriceHistory[]
  products      ProductPackaging[]
  createdAt     DateTime                @default(now())
  updatedAt     DateTime                @updatedAt

  @@index([name])
  @@index([categoryId])
}

model PackagingPriceHistory {
  id          String    @id @default(cuid())
  packagingId String
  packaging   Packaging @relation(fields: [packagingId], references: [id], onDelete: Cascade)
  price       Decimal   @db.Decimal(12, 4)
  notes       String?
  recordedAt  DateTime  @default(now())

  @@index([packagingId, recordedAt])
}

model ProductPackaging {
  id          String    @id @default(cuid())
  productId   String
  product     Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  packagingId String
  packaging   Packaging @relation(fields: [packagingId], references: [id])
  quantity    Int       @default(1)

  @@unique([productId, packagingId])
}
```

**Touch-points em módulos já encerrados (estritamente aditivos):**

| Model existente | Alteração | Módulo | Natureza |
|---|---|---|---|
| `Supplier` | + `packagings Packaging[]` (relação inversa) | 2.E (encerrado) | Aditiva — nenhum campo existente alterado, nenhuma regra de negócio de Fornecedores tocada |
| `Product` | + `packagings ProductPackaging[]` (relação inversa) | 2.J (encerrado) | Aditiva — nenhum campo existente alterado; `costPrice` só ganha um termo novo na Sprint 2.H.3 (Service), não na 2.H.1 (Schema) |

Mesmo sendo aditivas, a Sprint 2.H.1 deve declarar esse toque explicitamente em seu Objetivo/Arquivos a editar (`prisma/schema.prisma`), e a Sprint 2.H.7 (QA/Homologação) deve incluir regressão explícita dos módulos 2.E e 2.J após o `db:push`.

---

## 9. Roadmap completo (Fase 9)

| Sprint | Objetivo | Entradas | Saídas | Critérios de aceite |
|---|---|---|---|---|
| **2.H.1 — Schema** | Criar `PackagingCategory`, `Packaging`, `PackagingPriceHistory`, `ProductPackaging`; adicionar relações inversas em `Supplier`/`Product` | Este documento (Seção 2, 8) | `prisma/schema.prisma` atualizado, `db:push` executado, `prisma generate` | `tsc --noEmit` 0 erros; introspecção do banco confirma os 4 models novos + 2 relações inversas; regressão de `/admin/fornecedores` e `/admin/produtos` sem quebra |
| **2.H.2 — Repository + Validator** | `packagingCategoryRepository.ts`, `packagingRepository.ts`, `packagingCategoryValidator.ts`, `packagingValidator.ts` | 2.H.1 concluída | 4 arquivos novos em `src/lib/repositories/` e `src/lib/validators/` | Funções espelham exatamente as assinaturas de `ingredientRepository`/`ingredientValidator` (Seção 1.3); `tsc`/`lint` 0 erros |
| **2.H.3 — Service** | `packagingCategoryService.ts`, `packagingService.ts`; adicionar `ProductPackaging` ao `productService.ts` (`addPackaging`/`updatePackagingQuantity`/`removePackaging`, atualizar `calculateCostPrice`) | 2.H.2 concluída | Serviços com erros de domínio (Seção 3), `costPrice` somando embalagem | `tsc`/`lint` 0 erros; teste manual/script confirma `costPrice` correto com e sem embalagem vinculada |
| **2.H.4 — API** | Rotas `/api/admin/packaging-categories/**`, `/api/admin/packagings/**`; estender `/api/admin/products/[id]/**` com sub-rotas de `ProductPackaging` | 2.H.3 concluída | Route Handlers com `requireAdmin()` + mapeamento de erro padrão | `tsc`/`lint` 0 erros; todas as rotas testadas via curl/Playwright autenticado |
| **2.H.5 — UX Foundation (validação)** | Revisar/validar o wireframe da Seção 6 contra o resultado real das Sprints 2.H.1–2.H.4 antes do Frontend; ajustar se alguma suposição de dados não se confirmar | 2.H.4 concluída + Seção 6 deste documento | UX Foundation confirmada ou ajustada | Nenhuma divergência entre Seção 6 e a API real; se houver, este documento é atualizado antes de 2.H.6 |
| **2.H.6 — Frontend** | `src/lib/api/packagingApi.ts`, `src/lib/api/packagingCategoryApi.ts`, `/admin/embalagens/page.tsx`, `/admin/embalagens/categorias/page.tsx`; adicionar seção de embalagens em `/admin/produtos/[id]` (ou onde o formulário de Produto viver); atualizar `MENU_STRUCTURE.md`, hub `/admin` | 2.H.5 concluída | Páginas funcionais, navegáveis | `tsc`/`lint`/`build` 0 erros; navegação manual completa (CRUD, duplicar, ativar/desativar, vincular a produto) |
| **2.H.7 — Product Owner Review, Experience Review, QA, Homologação** | Fluxo completo de `PROJECT_GOVERNANCE.md` Seção 4 (Platform Review se aplicável, Product Review, QA); `MODULE_2H_CLOSURE.md` | 2.H.6 concluída | Módulo encerrado, documentado | Critério de evidência de `PROJECT_GOVERNANCE.md` Seção 23 (ADR-013 em `CLAUDE.md`) — banco sincronizado + dados reais, não só `tsc`/`lint`/`build` |

---

## 10. Riscos (Fase 10)

| Risco | Categoria | Mitigação |
|---|---|---|
| Nova sessão futura reintroduzir a Versão A (Packaging↔Recipe) por desconhecer esta ADR | Arquitetural | ADR-014 registrada em `CLAUDE.md` + correções em `ARCHITECTURE.md`/`DOMAIN_MODEL.md`/`REGRAS_NEGOCIO.md` nesta própria sprint (Seção 12/Documentação) |
| Alteração aditiva em `Supplier`/`Product` (módulos encerrados) introduzir regressão não prevista | Técnico | Mudança estritamente aditiva (só relação inversa); regressão explícita de 2.E/2.J exigida como critério de aceite de 2.H.1 (Seção 9) |
| "Duplicar" é operação nova, nunca validada em nenhum módulo irmão | UX | Validar no Product Review da Sprint 2.H.7 antes de considerar generalizar o padrão para outros módulos |
| Ausência de módulo de Compras/Estoque formal — `stockQuantity` só editável manualmente | Integração | Limitação aceita, idêntica à de `Ingredient` hoje (`REGRAS_NEGOCIO.md` 11.4) — não é regressão introduzida por este módulo |
| Necessidade futura de quantidade fracionária de embalagem (ex: fita por metro) exigir migração do schema | Manutenção | Decisão documentada como reversível (Seção 2.6); custo de mudança fica local a `Packaging`/`ProductPackaging` |
| Volume de embalagens/produtos | Escalabilidade | Nenhum risco relevante para o porte esperado (confeitaria pequena/média, dezenas de itens) — `ResponsiveGrid` já tem ressalva documentada em `DESIGN_SYSTEM.md` Seção 21 para volumes muito grandes (avaliar Tabela) |

---

## 11. Backlog futuro (Fase 11)

Deliberadamente fora do escopo desta versão do módulo:

- Embalagem selecionável pelo **cliente** no checkout (ex: embalagem de presente com custo adicional) — exigiria mover parte da decisão de custo para o momento do pedido, hoje pré-calculado no catálogo
- Quantidade fracionária de embalagem (ex: fita por metro) — ver Seção 2.6
- Controle de embalagem por lote/validade
- Embalagens retornáveis/reutilizáveis
- Impressão de etiquetas / código de barras / QR Code
- Integração fiscal
- Integração com módulo de Compras (quando existir) para entrada de estoque de embalagem
- `imageUrl` para embalagens (nenhum insumo do ERP tem upload de imagem implementado ainda)
- Painel "usado em N produtos" promovido a componente compartilhado, se um segundo caso de uso real surgir (Seção 7)
- Múltiplos fornecedores por embalagem

---

## 12. Revisão de consistência (Fase 12)

- ✅ Nenhuma decisão arquitetural relevante ficou pendente — o único conflito real encontrado (Seção 0/1.5) foi resolvido via ADR-014, aprovada explicitamente pelo Product Owner nesta sessão.
- ✅ Conflitos entre documentação e código existente: identificados e listados na Seção 1.5; os afetados pela ADR-014 (`CLAUDE.md`, `ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `REGRAS_NEGOCIO.md`, `PLAN.md`, `CHANGELOG.md`) são corrigidos nesta própria sprint (Seção "Documentação" abaixo); os fora do escopo da ADR (`VISION.md`, `ERP_BLUEPRINT.md`, `MODULES.md`, `EPICO_2_PLANEJAMENTO.md`) ficam registrados como achado, não corrigidos (Regra 3 de `PROJECT_GOVERNANCE.md` Seção 13.1 — só documentos explicitamente listados na ADR são alterados).
- ✅ O módulo segue os padrões definidos na Sprint G.8: nasce diretamente em `PageContainer`/`ResponsiveGrid` (Seção 6.1), evitando o débito técnico que as 3 páginas legadas da Sprint G.8 tiveram que gerenciar.
- ✅ Todas as integrações da Seção 5 foram analisadas.
- ✅ Nenhuma duplicação de responsabilidade — `Packaging` permanece separado de `Ingredient` (decisão de 30/06/2026, não questionada), e a Seção 6 reaproveita 100% dos componentes já existentes.

---

## Confirmações explícitas (Ordem de Missão)

✓ O módulo está completamente especificado — domínio, regras, casos de uso, integrações, UX, Design System, dados, roadmap, riscos e backlog documentados nas Seções 2–11.
✓ Nenhuma decisão arquitetural relevante ficou pendente — a única encontrada (Recipe vs. Product) foi resolvida via ADR-014 nesta sessão.
✓ O módulo está pronto para iniciar a Sprint 2.H.1, mediante aceite formal deste blueprint pelo Product Owner.
