# MODULE_2I_CLOSURE.md — Encerramento do Módulo 2.I (Receitas)

Documento de encerramento produzido na Sprint 2.I.3 (QA Funcional, Homologação e Encerramento). Registra o estado final do módulo e os padrões que os próximos módulos com fluxo Mestre/Detalhe devem seguir — em especial Produção (2.K) e Produtos Fase 2 (2.J), que consomem `Recipe` diretamente.

---

## 1. Escopo implementado

**Completo e homologado:** CRUD de `Recipe` (nome, descrição opcional, rendimento + unidade de rendimento, tempo de preparo, ativação/desativação) + gestão completa de `RecipeIngredient` (adicionar, editar quantidade/unidade, remover) + cálculo automático de custo total e custo unitário, sempre recalculado em tempo real a partir do `currentPrice` atual dos ingredientes. Camadas: Repository + Validator + Service (2.I.1) → API + Frontend (2.I.2) → QA e encerramento (2.I.3, este documento).

## 2. Arquitetura

Fluxo de camadas seguido em 100% dos casos, confirmado por leitura de todos os arquivos e por busca (`grep`) que confirmou zero import de Repository/Prisma fora da própria camada, e que todas as 9 rotas de API chamam `requireAdmin()`:

```
Route Handler (src/app/api/admin/recipes/**)
        ↓ chama
Service (src/lib/recipeService.ts)
        ↓ chama
Repository (src/lib/repositories/recipeRepository.ts, recipeIngredientRepository.ts)
        ↓ chama
Prisma (singleton src/lib/prisma.ts)
```

- **Route Handlers:** `requireAdmin()` → parse do body → Service → mapeamento de erro via `responses.ts`. Zero acesso a Repository/Prisma.
- **Service:** validação (`ValidationError[]`, mesmo padrão de Units/Ingredientes) → checagem de existência e compatibilidade de referências cruzadas (`findIngredientById`, `findUnitById`, `findConversion`) → duplicidade → Repository → cálculo de custo (nunca armazenado, sempre recalculado no mapeamento DTO) → mapeamento DTO (`Decimal.toNumber()`, `Date.toISOString()`).
- **Repository:** só queries, zero lógica de negócio. `Recipe` e `RecipeIngredient` **em arquivos separados**, com operações próprias — decisão explícita desta série de sprints, diferente da co-localização usada para `IngredientPriceHistory` (2.G.1), pois `RecipeIngredient` é uma entidade filha com ciclo de vida e regras próprias (compatibilidade de unidade, bloqueio de remoção do último item), não um sub-recurso de auditoria.
- **Front-end:** consome exclusivamente `recipeApi.ts`. Validação client-side é só UX — a API é sempre a autoridade final, confirmado pelo tratamento de `VALIDATION_ERROR`/`DUPLICATE_NAME`/`INACTIVE_INGREDIENT`/`INCOMPATIBLE_UNIT`/`DUPLICATE_INGREDIENT`/`LAST_ITEM`.

## 3. Entidades

| Entidade | Campos principais | Relacionamentos |
|---|---|---|
| `Recipe` | name, description?, yieldQuantity, yieldUnit, prepTimeMinutes, active | `RecipeIngredient` (1:N), `ProductRecipe` (1:N, fora de escopo deste módulo) |
| `RecipeIngredient` | quantity, unitId | `Recipe` (N:1, cascade delete), `Ingredient` (N:1, somente leitura), `UnitOfMeasure` (N:1, somente leitura) |

## 4. APIs

| Método | Rota | Autenticação |
|---|---|---|
| `GET`/`POST` | `/api/admin/recipes` | Admin |
| `GET`/`PATCH` | `/api/admin/recipes/[id]` | Admin |
| `PATCH` | `/api/admin/recipes/[id]/activate` | Admin |
| `PATCH` | `/api/admin/recipes/[id]/deactivate` | Admin |
| `POST` | `/api/admin/recipes/[id]/items` | Admin |
| `PATCH`/`DELETE` | `/api/admin/recipes/[id]/items/[itemId]` | Admin |

## 5. Funcionalidades validadas

Criação de receita com itens (mínimo 1), edição de campos escalares (sem afetar itens), adição/edição/remoção de ingrediente com recálculo automático de custo, bloqueio de remoção do último item, ativação/desativação, listagem, busca por nome, filtro por status, ordenação alfabética (pt-BR), validação de ingrediente duplicado na receita, validação de ingrediente inativo, validação de compatibilidade de unidade (com fallback de fator inverso), mensagens de erro específicas por código, estados vazio/loading/erro, confirmação antes de remover item — todos confirmados por leitura de código de ponta a ponta e pelas 3 validações técnicas. Testes de API via `curl` contra o servidor de desenvolvimento do usuário confirmaram respostas HTTP esperadas (307 na página, 401 na API, sem sessão) sem erro de execução; não foi possível validação visual em navegador neste ambiente.

## 6. Integrações

**Com Ingredientes (2.G):** somente leitura, via `findIngredientById` (Service) e `ingredientApi.listIngredients()` (Frontend, filtrado a `active: true` no cliente como conveniência de UX — a autoridade final é `InactiveIngredientError` no Service). **Com Units/UnitConversion (2.D):** somente leitura, via `findUnitById` e `findConversion` (Service) e `unitApi.listUnits()` (Frontend, filtrado a `isActive: true`). Nenhum arquivo de Ingredientes ou Units alterado nas 3 sprints do módulo.

## 7. Fluxo Mestre/Detalhe (referência oficial do ERP)

Este é o **primeiro módulo do projeto** com relação mestre/detalhe completa (`Recipe` mestre, `RecipeIngredient` detalhe) e estabelece o padrão de referência:

- **Separação de Repository:** um arquivo por entidade (`recipeRepository.ts` / `recipeIngredientRepository.ts`), nunca co-localizados quando a entidade filha tem ciclo de vida e regras de validação próprias.
- **Separação de Service:** operações do mestre (`createRecipe`, `updateRecipe`, `activateRecipe`, `deactivateRecipe`) nunca tocam a lista de itens; operações do detalhe (`addRecipeItem`, `updateRecipeItem`, `removeRecipeItem`) sempre revalidam a existência do mestre antes de agir e retornam o mestre atualizado (DTO com custo recalculado).
- **Separação de navegação no Frontend:** página de listagem (`/admin/receitas`) cria o mestre com o conjunto inicial de itens (via formulário com linhas dinâmicas); página de detalhe (`/admin/receitas/[id]`) é o único lugar que gerencia o ciclo de vida dos itens (adicionar/editar/remover), com edição do mestre restrita aos campos escalares.
- **Regra estrutural do mestre:** o mestre nunca pode existir sem pelo menos 1 detalhe (bloqueado tanto na criação quanto na tentativa de remover o último item) — um invariante que qualquer futuro módulo Mestre/Detalhe do ERP deve replicar quando a mesma regra de negócio se aplicar.
- **Custo/derivados sempre recalculados no mapeamento DTO**, nunca armazenados — o mesmo padrão já usado para `isLowStock` em Ingredientes (2.G.1), agora aplicado a um cálculo que depende de múltiplas entidades relacionadas (item × ingrediente × conversão de unidade).

## 8. Pendências conhecidas

**Nenhuma pendência bloqueante** para os módulos que dependem de Receitas (Produtos Fase 2 / 2.J, Dashboard Operacional / 2.K). `Recipe` e `RecipeIngredient` estão completos e homologados.

## 9. Limitações conhecidas

- Regra "receita inativa não pode ser usada em novos produtos" (`REGRAS_NEGOCIO.md` 3.2) **não está implementada** — pertence à validação de `ProductRecipe`, que só existirá no Módulo 2.J (Produtos Fase 2).
- Campos planejados mas ausentes no schema (`REGRAS_NEGOCIO.md` 6.3: tempo de descanso, tempo de decoração, dificuldade, temperatura de armazenamento, shelf life) permanecem "A definir" — não implementados, por decisão explícita de não inventar regra não documentada.
- Cálculo de custo usa `Decimal.toNumber()` antes da aritmética (mesmo padrão de 2.D.7/2.G.1), não `Decimal` nativo — consistente com o projeto, mas é um ponto de atenção para precisão monetária em receitas com muitos itens (registrado também na Sprint 2.I.1).
- Criação de receita usa modal com linhas dinâmicas na página de listagem, em vez de uma rota dedicada `/admin/receitas/nova` — divergência do que `MENU_STRUCTURE.md`/`SCREENS.md` (A-18) descreviam antecipadamente; nenhum dos dois documentos está na lista de documentos autorizados a alterar nesta sprint (ver Observações Técnicas do relatório final).

## 10. Lições aprendidas

- **Divergência de contrato de erro entre sprints do mesmo módulo é um risco real**, não só teórico: a Sprint 2.I.1 introduziu um formato de erro de validação (`Record<string,string>`) divergente do padrão consolidado (`ValidationError[]`), só detectado na FASE 0 da Sprint 2.I.2 ao comparar com `unitConversionValidator.ts`/`ingredientValidator.ts`. Checar o contrato de erro contra um módulo homologado antes de iniciar a camada de API deveria ser um passo explícito de FASE 0 em qualquer sprint futura que construa API sobre um Service de sprint anterior.
- **Separar Repository de mestre e detalhe em arquivos distintos desde o início** evitou qualquer necessidade de refatoração ao chegar na API/Frontend — decisão tomada na Sprint 2.I.1 por exigência explícita da ordem de missão, validada como correta nesta auditoria.
- **Fator de conversão em qualquer direção** (`resolveConversionFactor` com fallback `1/fator`) resolveu um caso real do domínio (nem toda unidade tem as duas direções de `UnitConversion` cadastradas) sem exigir alteração no módulo UnitConversion já homologado.

## 11. Padrões reutilizáveis para futuros módulos Mestre/Detalhe

- Repository do mestre e do detalhe sempre em arquivos separados quando o detalhe tem regras de validação/ciclo de vida próprias (ao contrário de sub-recursos de auditoria simples, como `IngredientPriceHistory`, que podem ser co-localizados).
- Toda operação de Service sobre o detalhe deve primeiro confirmar a existência do mestre (`findXById`), nunca assumir que o `id` do mestre recebido na rota é válido.
- Todo endpoint que muta um item do detalhe deve retornar o **mestre completo atualizado** (não só o item), para que o Frontend possa atualizar de uma vez custo/derivados que dependem de todos os itens.
- Regra estrutural "o mestre não pode existir sem nenhum detalhe" deve ser validada em dois pontos: na criação (Validator) e na tentativa de exclusão do último item (Service) — nunca assumir que só um dos dois pontos é suficiente.
- Navegação Mestre/Detalhe no Frontend: página de listagem cuida da criação (com o conjunto inicial de detalhes) e ações de ciclo de vida do mestre (ativar/desativar); página de detalhe dedicada cuida de toda a gestão dos itens filhos e da edição dos campos escalares do mestre — nunca misturar os dois na mesma superfície.

## 12. Revalidação funcional (Sprint I.3, 17/07/2026)

A homologação final foi reexecutada após a recuperação da infraestrutura (Sprint I.2), em ambiente sincronizado e utilizando dados reais — incluindo, pela primeira vez neste ambiente, confirmação visual em navegador (limitação registrada no item 5 como não disponível anteriormente). Validado via Playwright contra servidor de desenvolvimento limpo, banco Supabase real: cadastro de receita com item inicial; adição, edição e remoção de item com recálculo automático de custo; bloqueio de remoção do último item; bloqueio de ingrediente duplicado (código `DUPLICATE_INGREDIENT`); ativação/desativação; pesquisa; filtro de status; persistência confirmada por reload. Custo calculado conferido matematicamente em dois casos reais (R$ 18,53 e R$ 0,52) e a atualização automática de valores confirmada ponta a ponta ao alterar o preço de um ingrediente real. Nenhuma regressão encontrada — ver `CHANGELOG.md`, Sprint I.3.

---

Precedência: em caso de conflito entre este documento e `PLAN.md`, `CHANGELOG.md` ou `REGRAS_NEGOCIO.md`, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint 2.I.3 (QA Funcional, Homologação e Encerramento do Módulo 2.I). v1.1 em 17/07/2026 — Sprint I.3: revalidação funcional em ambiente sincronizado registrada (item 12). -->
