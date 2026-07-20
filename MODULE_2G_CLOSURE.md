# MODULE_2G_CLOSURE.md — Encerramento do Módulo 2.G (Ingredientes)

Documento de encerramento produzido na Sprint 2.G.3 (QA Funcional, Homologação e Encerramento). Registra o estado final do módulo, o que foi entregue e os padrões que os próximos módulos com relacionamento a Unidades de Medida devem seguir — em especial o Módulo Receitas (2.I), que consome `Ingredient` diretamente.

---

## 1. Escopo implementado

**Completo e homologado:** CRUD de `Ingredient` (nome, categoria opcional, unidade de medida, preço atual, estoque atual, estoque mínimo, fornecedor texto, código externo, fonte externa, ativação/desativação) + CRUD de `IngredientCategory` (nome) + histórico automático de preço (`IngredientPriceHistory`, gerado a cada criação/atualização de preço). Camadas: Repository + Validator + Service (2.G.1) → API + Frontend (2.G.2) → QA e encerramento (2.G.3, este documento).

## 2. Arquitetura

Fluxo de camadas seguido em 100% dos casos, confirmado por leitura de todos os arquivos e por busca (`grep`) que confirmou zero import de Repository/Prisma fora da própria camada:

```
Route Handler (src/app/api/admin/ingredient*/**)
        ↓ chama
Service (src/lib/ingredientService.ts, ingredientCategoryService.ts)
        ↓ chama
Repository (src/lib/repositories/ingredientRepository.ts, ingredientCategoryRepository.ts)
        ↓ chama
Prisma (singleton src/lib/prisma.ts)
```

- **Route Handlers:** `requireAdmin()` → parse do body → Service → mapeamento de erro via `responses.ts`. Zero acesso a Repository/Prisma (confirmado por busca em todo `src/app`).
- **Service:** validação → checagem de existência de referências (`unitId` via `findUnitById` de Units, `categoryId` via `findIngredientCategoryById`) → unicidade de nome → Repository → efeito colateral obrigatório (`IngredientPriceHistory` a cada mudança real de preço) → mapeamento DTO (`Decimal.toNumber()`, `isLowStock` derivado).
- **Repository:** só queries, zero lógica de negócio. `IngredientPriceHistory` vive dentro de `ingredientRepository.ts` (decisão registrada na Sprint 2.G.1 — sub-recurso de auditoria, não domínio independente).
- **Front-end:** consome exclusivamente `ingredientApi.ts`/`ingredientCategoryApi.ts` (cliente HTTP via `fetch`). Validação client-side é só UX — a API é sempre a autoridade final, confirmado pelo tratamento de `VALIDATION_ERROR`/`DUPLICATE_NAME`/`CATEGORY_HAS_INGREDIENTS` no front-end.

## 3. Entidades

| Entidade | Campos principais | Relacionamentos |
|---|---|---|
| `Ingredient` | name, categoryId?, unitId, currentPrice, stockQuantity, minStock, supplier?, externalCode?, externalSource?, active | `IngredientCategory` (N:1, opcional), `UnitOfMeasure` (N:1, obrigatório), `IngredientPriceHistory` (1:N) |
| `IngredientCategory` | name | `Ingredient` (1:N) |
| `IngredientPriceHistory` | price, source, notes?, recordedAt | `Ingredient` (N:1, cascade delete) |

## 4. APIs

| Método | Rota | Autenticação |
|---|---|---|
| `GET`/`POST` | `/api/admin/ingredient-categories` | Admin |
| `PATCH`/`DELETE` | `/api/admin/ingredient-categories/[id]` | Admin |
| `GET`/`POST` | `/api/admin/ingredients` | Admin |
| `PATCH` | `/api/admin/ingredients/[id]` | Admin |
| `PATCH` | `/api/admin/ingredients/[id]/activate` | Admin |
| `PATCH` | `/api/admin/ingredients/[id]/deactivate` | Admin |
| `GET` | `/api/admin/ingredients/[id]/price-history` | Admin |

Nenhuma rota pública (`/api/ingredients`) foi criada — deliberadamente fora de escopo da Sprint 2.G.2 ("não antecipar integrações com Receitas").

## 5. Funcionalidades validadas

Criação, edição, ativação, desativação, listagem, gestão de categorias, seleção de unidade, filtros (nome, status, categoria, estoque baixo), ordenação (alfabética por nome — `Ingredient` não tem `sortOrder` no schema), mensagens de erro consumidas da API, estados vazio/loading/erro, geração automática de histórico de preço — todos confirmados por leitura de código de ponta a ponta e pelas 3 validações técnicas.

## 6. Integrações

**Com Units (2.D):** somente leitura, via `findUnitById` (Service) e `unitApi.listUnits()` (Frontend) — nenhum arquivo de Units alterado nas 3 sprints do módulo. **Com UnitConversion:** nenhuma integração direta nesta sprint — `Ingredient` referencia sua unidade base diretamente; a conversão entre unidades (ex. compra em kg, consumo em g na receita) é responsabilidade do domínio Receitas (2.I), que já tem `RecipeIngredient.unitId` próprio no schema para isso.

## 7. Pendências conhecidas

**Nenhuma pendência bloqueante para o Módulo Receitas (2.I).** `Ingredient` está completo e homologado; `RecipeIngredient` (schema já existente) referencia `Ingredient` e `UnitOfMeasure` diretamente, ambos prontos.

## 8. Limitações conhecidas

- Regra "ingrediente inativo não pode ser adicionado a novas receitas" (`REGRAS_NEGOCIO.md` 3.3) **não está implementada** — pertence à validação de `RecipeIngredient`, que só existirá na Sprint 2.I.
- Alerta de estoque baixo é só um campo derivado (`isLowStock`) consultável via filtro — não há notificação ativa (push, e-mail, badge no hub admin). Não especificado em `REGRAS_NEGOCIO.md` além do sinal em si.
- Fornecedor continua campo texto livre (`REGRAS_NEGOCIO.md` 7.4, "A definir") — sem cadastro completo, sem histórico de fornecedor, sem múltiplos fornecedores por ingrediente.
- Histórico de preço (`getPriceHistory`) implementado na API mas não exibido no Frontend nesta sprint — não fazia parte das "funcionalidades mínimas" exigidas pela Sprint 2.G.2.

## 9. Lições aprendidas

- **Efeito colateral obrigatório em Service** (gerar `IngredientPriceHistory` a cada mudança de preço) funcionou bem como padrão: a regra vive inteiramente no Service (`createIngredient`/`updateIngredient`), nunca na Route nem no Frontend — nenhuma tentação de duplicá-la em outra camada.
- **Campo derivado no DTO** (`isLowStock`) é um padrão reutilizável simples para expor um "alerta" sem inventar mecanismo de notificação — resolve o requisito documentado sem ampliar escopo.
- **`FilterChips` copiado pela 2ª vez** (Units → Ingredientes) sem virar componente compartilhado, por decisão explícita desta série de sprints ("não promover componentes compartilhados" nesta Sprint 2.G.3) — candidato real a refatoração, registrado como Melhoria Futura, não implementado.

## 10. Padrões reutilizáveis para futuros módulos com relacionamento a Unidades de Medida

- Toda entidade que referencia `UnitOfMeasure` deve validar a existência da unidade no Service via `findUnitById` (nunca confiar apenas na FK do banco) — mesmo padrão usado por `UnitConversion` (2.D.7) e `Ingredient` (2.G.1), agora confirmado em 2 módulos consecutivos.
- Entidades com campo de preço monetário sujeito a alteração devem gerar histórico automático no Service (não na Route, não no Frontend) sempre que o valor mudar de fato — comparar valor novo vs. existente antes de decidir se registra.
- Campos derivados de UX (badges, alertas, indicadores) pertencem ao DTO do Service, calculados uma vez no mapeamento — nunca recalculados de formas diferentes em múltiplos pontos do Frontend.
- Entidades sem campo de status (`active`/`isActive`) usam exclusão física guardada por contagem de uso (`countXByY` seguido de erro de domínio se > 0) — mesmo padrão em `UnitConversion` (sem guarda, pois não é referenciada) e `IngredientCategory` (com guarda, pois é referenciada por `Ingredient`).

## 11. Revalidação funcional (Sprint I.3, 17/07/2026)

A homologação final foi reexecutada após a recuperação da infraestrutura (Sprint I.2), em ambiente sincronizado e utilizando dados reais. Validado via Playwright contra servidor de desenvolvimento limpo, banco Supabase real: cadastro, edição (com geração de `IngredientPriceHistory`), ativação/desativação de `Ingredient`; cadastro e exclusão de `IngredientCategory` (com bloqueio ao tentar excluir categoria vinculada); pesquisa; filtros de status e categoria; persistência confirmada por reload. Efeito em cascata confirmado: alterar `currentPrice` de um ingrediente real (Farinha de Trigo) recalculou automaticamente o custo de receitas e produtos que o utilizam, sem nenhuma ação manual adicional. Nenhuma regressão encontrada — ver `CHANGELOG.md`, Sprint I.3.

---

Precedência: em caso de conflito entre este documento e `PLAN.md`, `CHANGELOG.md` ou `REGRAS_NEGOCIO.md`, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint 2.G.3 (QA Funcional, Homologação e Encerramento do Módulo 2.G). v1.1 em 17/07/2026 — Sprint I.3: revalidação funcional em ambiente sincronizado registrada (item 11). -->
