# MODULE_2H_UX_FOUNDATION.md — UX Foundation: Cadastro de Embalagens

Produzido na Sprint 2.H.5 (20/07/2026) — Sprint Oficial de UX e Arquitetura de Interface. Nenhum componente React implementado. Especificação de referência para a Sprint 2.H.6 (Frontend).

---

## 1. Resumo Executivo

A API de Embalagens (Sprints 2.H.1–2.H.4, homologadas) já existe e foi testada, mas a camada Service/API expõe `ProductPackaging` como relação **item a item** (`POST/PATCH/DELETE /api/admin/products/[id]/packagings/[linkId]`, mirror de `RecipeIngredient`), enquanto o Frontend de Produtos hoje gerencia `ProductRecipe` como **lista embutida no próprio formulário** (`RecipeLinker`, mirror de nenhum outro módulo) — e `Product` **não tem página de detalhe**. Essa divergência entre a API já homologada e a UI existente de Produtos é o achado central desta sprint (Seção 2) e molda a decisão de criar duas páginas de detalhe novas (`/admin/embalagens/[id]` e `/admin/produtos/[id]`) em vez de reproduzir o padrão de modal único já usado por Fornecedores/Ingredientes/Produtos.

---

## 2. Auditoria das interfaces existentes (Fase 1)

| Módulo | Arquivo(s) | Layout | Listagem | Criar | Editar | Item vinculado |
|---|---|---|---|---|---|---|
| `Supplier` | `fornecedores/page.tsx` | `PageContainer` + `ResponsiveGrid` (referência, Sprint 2.E.7) | Paginação **server-side** (`listSuppliersPaged`), busca com debounce 300ms, `FilterChips` (status), `<select>` de ordenação, `StatCard`×3 (Total/Ativos/Inativos) | Modal `EntityForm` (Seções: Identificação/Contato/Operação/Observações) | **Mesmo modal** da criação, reaberto com dados preenchidos — sem página de detalhe | — (sem sub-recurso) |
| `Ingredient` | `ingredientes/page.tsx` | `PageContainer` + `ResponsiveGrid` | Listagem **completa client-side** (`listAllIngredients`), filtro por nome/status/categoria e checkbox "Somente estoque baixo" filtrados em memória — **sem `StatCard`** | Modal `EntityForm` | Mesmo modal, sem página de detalhe | `IngredientPriceHistory` — **API existe (`getPriceHistory`), mas nenhuma tela a consome; achado de auditoria, não implementado em nenhum módulo até hoje** |
| `Recipe` | `receitas/page.tsx` + `receitas/[id]/page.tsx` | Lista: `PageContainer`. Detalhe: **legado `max-w-app`** (débito técnico já registrado na Sprint G.8, `MODULE_G8_CLOSURE.md`) | Lista: sem paginação, sem `StatCard` | Modal `EntityForm` **só para criar** (nome/rendimento/ingrediente inicial) | **Card da lista é um link (`href`) para `/admin/receitas/[id]`** — edição de campos escalares acontece só na página de detalhe, via `RecipeEditModal` próprio | `RecipeIngredient` — gerenciado **item a item** na página de detalhe: `AddItemModal`/`ItemCard`/`EditItemModal`(embutido)/`ConfirmRemoveItemModal`, cada operação chama uma sub-rota própria (`/items`, `/items/[itemId]`) |
| `Product` | `produtos/page.tsx` (único arquivo — **sem página de detalhe**) | `PageContainer` + `ResponsiveGrid` | Paginação server-side, `FilterChips` (status + categoria), sem `StatCard` | Modal `EntityForm` | Mesmo modal (create e edit), sem página de detalhe | `ProductRecipe` — gerenciado como **lista embutida no formulário** (`RecipeLinkForm[]`, `addRecipeRow`/`removeRecipeRow`, `<select>` de receita + quantidade por linha), substituída inteira a cada `PATCH` — **não item a item** |

### Achado crítico

A API de `ProductPackaging` (2.H.3/2.H.4) foi construída **item a item** (mirror de `RecipeIngredient`), não em lista embutida (mirror de `ProductRecipe`) — decisão já tomada e justificada no relatório da Sprint 2.H.3 (precedente de rota real: `/api/admin/recipes/[id]/items/[itemId]`). Isso significa que a tela "Embalagens do Produto" **não pode** ser um conjunto de linhas dinâmicas dentro do mesmo `EntityForm` de criar/editar Produto (que faria uma reescrita completa a cada salvamento, incompatível com endpoints que operam um vínculo por vez) — ela precisa de um lugar próprio para chamar `POST`/`PATCH`/`DELETE` em `linkId` individuais, exatamente como `RecipeIngredient` tem em `receitas/[id]`.

**Decisão desta sprint:** criar `/admin/produtos/[id]` (página de detalhe nova, hoje inexistente) para hospedar "Embalagens do Produto", usando o mesmo padrão de `receitas/[id]` (`AddItemModal`/`ItemCard`/editar quantidade/`ConfirmRemoveItemModal`), mas nascendo em `PageContainer` (Recomendação Arquitetural #2 desta sprint — não repetir o layout legado que a própria Sprint G.8 corrigiu). A lista de Produtos (`produtos/page.tsx`) ganha `href` no `EntityCard` apontando para a nova página de detalhe (mirror exato de como `receitas/page.tsx` já faz) — o modal de criação/edição de Produto **permanece como está hoje** (RecipeLinker embutido preservado, nenhuma alteração nele nesta sprint).

**Pelo mesmo raciocínio**, `Packaging` também ganha `/admin/embalagens/[id]` (página de detalhe nova) para hospedar os dois sub-recursos que só ela tem — Histórico de Preços e "Usado em N produtos" — evitando empilhar três modais diferentes sobre a página de lista. **Alternativa considerada e descartada:** manter tudo em modais sobre `/admin/embalagens` (mirror de Fornecedores/Ingredientes) — descartada porque nenhum desses dois módulos tem sub-recurso de leitura (histórico, uso cruzado) para hospedar; a única tela com sub-recursos reais hoje (`Recipe`) já resolve isso com página de detalhe, não com modais empilhados.

---

## 3. Telas previstas (Fase 2)

| # | Tela | Rota | Objetivo | Atores | Entradas | Saídas | Ações |
|---|---|---|---|---|---|---|---|
| 1 | Lista de Embalagens | `/admin/embalagens` | Consultar, criar, ativar/inativar/duplicar embalagens | ADMIN | Filtros (busca, categoria, status, estoque baixo) | Grade de cards | Criar, Duplicar, Ativar, Desativar, abrir Detalhe |
| 2 | Cadastro de Embalagem | Modal (`EntityForm`) sobre a Tela 1 | Criar nova embalagem (ou duplicar uma existente, pré-preenchido) | ADMIN | Nome, categoria, custo, estoque, estoque mínimo, fornecedor | Embalagem criada | Criar, Cancelar |
| 3 | Categorias de Embalagem | `/admin/embalagens/categorias` | CRUD de `PackagingCategory` | ADMIN | Busca por nome | Lista de categorias | Criar, Editar, Excluir (bloqueado se em uso) |
| 4 | Detalhe da Embalagem | `/admin/embalagens/[id]` (nova) | Ver/editar dados, consultar histórico de custo e uso | ADMIN | — | Dados completos + 2 painéis | Editar, Ativar/Desativar, ver Histórico de Preços, ver Uso |
| 5 | Detalhe do Produto | `/admin/produtos/[id]` (nova) | Gerenciar embalagens vinculadas ao produto | ADMIN | — | Lista de embalagens do produto | Vincular, Editar quantidade, Remover vínculo |

Sub-telas (painéis dentro da Tela 4, não rotas próprias): **Histórico de Preços** (lista somente leitura) e **Usado em N produtos** (lista somente leitura, link para cada produto).

---

## 4. Wireframes de baixa fidelidade (Fase 3)

### Tela 1 — `/admin/embalagens`

```
┌─────────────────────────────────────────────────────────────┐
│ ← Embalagens                                    PageContainer│
├─────────────────────────────────────────────────────────────┤
│ [ Total: 24 ]   [ Ativas: 21 ]   [ Estoque baixo: 3 ]  StatCards
├─────────────────────────────────────────────────────────────┤
│ 24 embalagens                              [ + Nova ]  Toolbar
├─────────────────────────────────────────────────────────────┤
│ [ 🔍 Pesquisar por nome…                              ] SearchBar
│ Status  ( Todas ) ( Ativas ) ( Inativas )            FilterChips
│ Categoria ( Todas ) ( Caixas ) ( Saquinhos ) ( Fitas )FilterChips
│ ☐ Somente estoque baixo                          (checkbox, mirror Ingredient)
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  ResponsiveGrid
│ │ Caixa 25cm   │ │ Saquinho P   │ │ Fita Cetim   │  cols=3
│ │ [Ativa]      │ │ [Ativa]      │ │ [Inativa]    │  EntityCard
│ │ Caixas       │ │ Saquinhos    │ │ Fitas        │
│ │ R$ 3,20      │ │ R$ 0,40      │ │ R$ 0,15      │
│ │ Estoque: 40  │ │ Estoque: 5 ⚠ │ │ Estoque: 0 ⚠ │
│ │[Duplicar][Desativar]│ ...     │ │[Duplicar][Ativar]│
│ └──────────────┘ └──────────────┘ └──────────────┘
├─────────────────────────────────────────────────────────────┤
│           ‹ Anterior    Página 1 de 3    Próxima ›            Paginação
└─────────────────────────────────────────────────────────────┘
```
Card clicável (exceto os botões de ação) → navega para `/admin/embalagens/[id]`.

### Tela 2 — Cadastro/Edição (modal `EntityForm`, aberto sobre a Tela 1 ou a Tela 4)

```
┌───────────────────────────────────┐
│ Nova embalagem              ✕     │  EntityForm (bottom sheet mobile / centralizado desktop)
├───────────────────────────────────┤
│ Nome *                            │
│ [_____________________________]   │  Field
│                                    │
│ Categoria (opcional)               │
│ [ Selecione… ▾ ]                  │  Field (select)
│                                    │
│ Custo unitário *                  │
│ [R$ ___________]                  │  Field
│                                    │
│ Estoque atual      Estoque mínimo │
│ [______]           [______]       │  grid-cols-2, mirror RecipeEditModal
│                                    │
│ Fornecedor (opcional)             │
│ [ Selecione… ▾ ]                  │  Field (select)
├───────────────────────────────────┤
│ [ Cancelar ]      [ Criar ]       │
└───────────────────────────────────┘
```

### Tela 3 — `/admin/embalagens/categorias`

```
┌─────────────────────────────────────────────────────────────┐
│ ← Categorias de Embalagem                     PageContainer  │
├─────────────────────────────────────────────────────────────┤
│ ← Voltar para Embalagens                                     │
│ 6 categorias                                    [ + Nova ]   │
│ [ 🔍 Pesquisar por nome…                              ]      │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────┐ ResponsiveGrid │
│ │ Caixas                    [Editar][Excluir]│ EntityCard     │
│ └───────────────────────────────────────────┘                │
│ ┌───────────────────────────────────────────┐                │
│ │ Saquinhos                 [Editar][Excluir]│                │
│ └───────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```
Mirror direto de `ingredientes/categorias/page.tsx` (já migrada na Sprint G.8), com uma diferença deliberada: nasce em `PageContainer`+`ResponsiveGrid` (não `max-w-app`), o que já desbloqueia `LoadingState`/`EntityCard` compartilhados desde o início — sem herdar o débito técnico que `ingredientes/categorias` ainda tem (`MODULE_G8_CLOSURE.md`).

### Tela 4 — `/admin/embalagens/[id]` (nova)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Embalagem                                   PageContainer  │
├─────────────────────────────────────────────────────────────┤
│ ← Voltar para Embalagens                                     │
│                                                                │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Caixa 25cm                              [Ativa]        │   │  Card de resumo
│ │ Categoria: Caixas · Fornecedor: Distribuidora ABC       │   │  (mirror do card
│ │                                                          │   │  de resumo em
│ │  [ R$ 3,20 ]        [ 40 ]         [ 5 ]                │   │  receitas/[id])
│ │  Custo atual         Estoque        Mínimo              │   │
│ │                                                          │   │
│ │ [ Editar embalagem ]        [ Desativar ]               │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                                │
│ Histórico de Preços                                           │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ R$ 3,20   20/07/2026                                    │   │  Lista somente
│ │ R$ 2,90   05/07/2026                                    │   │  leitura, mesmo
│ │ R$ 2,90   01/07/2026 · criação                          │   │  visual de EntityCard
│ └───────────────────────────────────────────────────────┘   │  (sem ações)
│                                                                │
│ Usado em 3 produtos                                           │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Bolo Chocolate 25cm            2 un.       [Ver →]     │   │  Lista somente
│ │ Bolo Red Velvet                1 un.       [Ver →]     │   │  leitura, link
│ │ Kit Festa Pequeno               3 un.       [Ver →]     │   │  para /admin/
│ └───────────────────────────────────────────────────────┘   │  produtos/[id]
└─────────────────────────────────────────────────────────────┘
```

### Tela 5 — `/admin/produtos/[id]` (nova)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Produto                                     PageContainer  │
├─────────────────────────────────────────────────────────────┤
│ ← Voltar para Produtos                                       │
│                                                                │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Bolo Chocolate 25cm                     [Ativo]         │   │  Resumo do produto
│ │  Preço: R$ 80,00   Custo: R$ 42,10 *   Margem: 47%      │   │  (*custo não inclui
│ │ [ Editar produto ]                                       │   │  embalagem ainda —
│ └───────────────────────────────────────────────────────┘   │  ver nota Regra 11)
│                                                                │
│ Receitas (2)                          [somente leitura aqui] │  (RecipeLinker já
│ ┌───────────────────────────────────────────────────────┐   │  vive no modal de
│ │ Massa de Chocolate — 1×                                  │   │  edição do produto,
│ │ Recheio de Brigadeiro — 1×                               │   │  não duplicado aqui)
│ └───────────────────────────────────────────────────────┘   │
│                                                                │
│ Embalagens (2)                              [ + Adicionar ]  │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Caixa 25cm            2×          [Editar][Remover]     │   │  ItemCard, mirror
│ │ Fita Cetim            1×          [Editar][Remover]     │   │  de receitas/[id]
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```
**Nota de escopo:** a seção "Receitas" nesta página é **somente leitura** (mostra o que já foi salvo no modal de edição do produto) — editar receitas continua exclusivamente no `EntityForm` de Produto (`RecipeLinker` já existente, não alterado nesta sprint). Só "Embalagens" ganha CRUD próprio nesta página nova.

---

## 5. Fluxos de navegação (Fase 3)

```
/admin/embalagens
  → "+ Nova" → EntityForm (create) → sucesso → fecha modal, recarrega lista
  → clique no card → /admin/embalagens/[id]
  → "Duplicar" no card → EntityForm (create, pré-preenchido) → sucesso → fecha modal, recarrega lista
  → "Ativar"/"Desativar" no card → (Desativar pede ConfirmDialog) → toast de sucesso, recarrega lista
  → link "Categorias" (no cabeçalho ou breadcrumb) → /admin/embalagens/categorias

/admin/embalagens/[id]
  → "Editar embalagem" → EntityForm (edit) → sucesso → fecha modal, recarrega dados da página
  → "Ativar"/"Desativar" → mesmo padrão da lista
  → painel "Usado em N produtos" → "Ver →" em cada linha → /admin/produtos/[id]

/admin/produtos/[id]
  → "+ Adicionar" (seção Embalagens) → AddPackagingModal (select embalagem ativa + quantidade) → POST → sucesso → fecha modal, recarrega lista de embalagens do produto
  → "Editar" em um item → EditQuantityModal (só quantidade) → PATCH → sucesso → recarrega
  → "Remover" em um item → ConfirmDialog → DELETE → sucesso → recarrega
  → "Editar produto" → abre o EntityForm existente de produtos/page.tsx (via navegação de volta ou modal sobre a própria página de detalhe — decisão de implementação da Sprint 2.H.6)

/admin/produtos (lista)
  → clique no card → /admin/produtos/[id] (rota nova — hoje o clique no card não navega para lugar nenhum, card não é link)
```

---

## 6. Estados da interface (Fase 4)

| Estado | Telas 1/3 (listas) | Tela 4 (detalhe embalagem) | Tela 5 (detalhe produto — seção Embalagens) |
|---|---|---|---|
| Carregando | `LoadingState` (grid — seguro, já nasce em `PageContainer`) | Skeleton local (mirror de `receitas/[id]`: card grande + N cards pequenos — heterogêneo, mesma razão documentada em `MODULE_G8_CLOSURE.md` para não usar `LoadingState` compartilhado quando o layout da página não é uma grade homogênea) | Skeleton local, mesmo padrão |
| Vazio (sem filtro) | `EmptyState` + ação "+ Criar" | Painel "Usado em 0 produtos": `EmptyState` sem ação (não faz sentido "criar" um produto a partir daqui) | `EmptyState` + ação "+ Adicionar" |
| Vazio (com filtro) | `EmptyState` "Nenhuma… encontrada" + "Limpar filtros", sem ação de criar | — | — |
| Erro | `ErrorState` + "Tentar novamente" | `ErrorState` de página inteira (mirror de `receitas/[id]`) | `ErrorState` de página inteira |
| Sucesso | Toast (`ValidationSummary`, "success", 3.5s) | Idem | Idem |
| Sem permissão | `src/proxy.ts` redireciona para `/admin/login` antes de qualquer render — nenhuma tela própria | Idem | Idem |
| Sem resultados | Mesmo que "vazio com filtro" | — | — |
| Confirmar exclusão | `ConfirmDialog` — só Tela 3 (`PackagingCategory`), bloqueado com `CATEGORY_HAS_PACKAGINGS` se em uso | — | — |
| Confirmar ativação | **Nenhuma confirmação** — ação direta de um clique (mirror de `Supplier`/`Ingredient`) | Idem | — |
| Confirmar desativação | `ConfirmDialog` "Desativar embalagem?" | Idem | — (remover vínculo tem seu próprio `ConfirmDialog`, não é desativação) |

---

## 7. Matriz Tela × Componentes Compartilhados (Fase 5 / Recomendação #4)

| Componente | Tela 1 | Tela 2 (modal) | Tela 3 | Tela 4 | Tela 5 (seção Embalagens) |
|---|---|---|---|---|---|
| `PageContainer` | ✅ | — | ✅ | ✅ | ✅ |
| `ResponsiveGrid` | ✅ (cols=3) | — | ✅ (cols=2, poucos itens) | — (layout de seções, não grade) | — |
| `StatCard` | ✅ ×3 (Total/Ativas/Estoque baixo) | — | — | — | — |
| `SearchBar` | ✅ | — | ✅ | — | — |
| `FilterChips` | ✅ (Status + Categoria) | — | — | — | — |
| `EntityCard` | ✅ | — | ✅ | — (card de resumo é markup próprio, mirror do card de resumo de `receitas/[id]`, não `EntityCard` — motivo: `EntityCard` empilha título/badges acima do conteúdo; o card de resumo da Tela 4 tem um layout de 3 estatísticas lado a lado que `EntityCard` não cobre, mesma classe de exceção já documentada para `LoadingState`/`EntityCard` na Cartografia do `MODULE_G8_CLOSURE.md`) | ItemCard local (mirror de `receitas/[id]`, mesma justificativa: linha horizontal, não card empilhado) |
| `StatusBadge` | ✅ (`activeLabel="Ativa"`) | ✅ (dentro do form, mirror Fornecedores) | — | ✅ | — |
| `LoadingState` | ✅ | — | ✅ | ❌ (heterogêneo — ver Seção 6) | ❌ (heterogêneo) |
| `ErrorState` | ✅ | — | ✅ | ✅ | ✅ |
| `EmptyState` | ✅ | — | ✅ | ✅ (painel de uso) | ✅ |
| `EntityForm` | ✅ (create) | ✅ | ✅ | ✅ (edit) | ✅ (Adicionar/Editar quantidade) |
| `ConfirmDialog` | ✅ (desativar) | — | ✅ (excluir categoria) | ✅ (desativar) | ✅ (remover vínculo) |
| `Field`/`Section` (`FormPrimitives`) | — | ✅ | ✅ | — | ✅ |

**Confirmação (Recomendação #3):** nenhum componente novo é criado. Os dois markups locais sinalizados acima (card de resumo da Tela 4, `ItemCard` da Tela 5) seguem exatamente o mesmo precedente já aceito em `receitas/[id]/page.tsx` — não uma exceção nova desta sprint.

---

## 8. Matriz Estado × Feedback ao Usuário (Recomendação #5)

| Estado | Feedback visual | Feedback textual | Ação disponível |
|---|---|---|---|
| Carregando lista | Skeletons `animate-pulse` | "Carregando…" no contador | — |
| Ação em andamento (ativar/desativar/salvar) | Toast tipo `loading` | "Salvando…"/"Ativando…"/"Desativando…" | — |
| Sucesso | Toast tipo `success`, 3.5s | `"{nome}" criada com sucesso.` / `atualizada.` / `ativada.` / `desativada.` | — |
| Erro de validação (cliente) | Borda `border-rose` no campo | Mensagem específica abaixo do campo | Corrigir e reenviar |
| Erro de validação (servidor) | Idem, aplicado via `applyServerValidationErrors` | Idem | Idem |
| Erro de negócio (nome duplicado, categoria em uso, embalagem inativa) | Toast tipo `error` | Mensagem literal da API (`err.message`) | Ajustar e tentar de novo |
| Erro de rede/servidor (500) | Toast tipo `error` ou `ErrorState` de página | "Erro ao carregar/salvar {entidade}." | "Tentar novamente" |
| Lista vazia sem filtro | `EmptyState` | "Nenhuma embalagem cadastrada." | "+ Criar embalagem" |
| Lista vazia com filtro | `EmptyState` | "Nenhuma embalagem encontrada." | "Limpar filtros" |

---

## 9. Acessibilidade e responsividade (Fase 6)

- **Ordem de foco:** modais (`EntityForm`/`ConfirmDialog`) já implementam foco automático no primeiro campo/botão de confirmação e *trap* de foco (Tab não escapa do modal) — comportamento herdado sem alteração, nenhuma tela nova desta sprint introduz um padrão de foco diferente.
- **Navegação por teclado:** `Escape` fecha modais (já implementado nos componentes compartilhados); cards clicáveis das Telas 1/3 precisam de `tabIndex`/`Enter` equivalente ao `href` do `EntityCard` de Receitas — mesmo padrão, nenhuma novidade.
- **Contraste:** paleta já validada (`cream`/`chocolate`/`rose`/`sage`/`sand`/`muted`) — nenhuma cor nova introduzida; alerta de "estoque baixo" usa `⚠` + texto, não só cor (evita depender só de cor para transmitir informação).
- **Mensagens de erro:** sempre associadas ao campo via `aria-*` (padrão de `Field`, não alterado).
- **Telas pequenas:** Telas 1/3 usam `ResponsiveGrid` (1 coluna em mobile); Telas 4/5 são de seções empilhadas (já mobile-first por natureza, mirror de `receitas/[id]`); `EntityForm` já é bottom-sheet em mobile.

Nenhuma exceção às diretrizes de `UX_GUIDELINES.md` Seções 14–16 foi necessária.

---

## 10. Validação de UX (Fase 7)

- **Existe fluxo desnecessário?** Considerado e evitado: um fluxo "editar embalagem direto da lista" (modal sobre a Tela 1, mirror de Fornecedores) foi descartado em favor de navegar para a Tela 4 primeiro — mais consistente com o fato de a embalagem ter sub-recursos reais (histórico, uso) que só existem na página de detalhe; evita dois lugares diferentes editarem o mesmo registro.
- **Existe clique redundante?** Não — "Duplicar"/"Ativar"/"Desativar" continuam na lista (ação de um clique, sem precisar abrir o detalhe), só "Editar" exige navegação, porque abre outras informações relevantes ao mesmo tempo.
- **Existe informação escondida?** O card da lista (Tela 1) mostra custo + estoque + categoria — suficiente para decisão rápida sem abrir o detalhe; o alerta de estoque baixo é visível tanto no card quanto no `StatCard` agregado.
- **Existe oportunidade de simplificação?** Sim, identificada e aplicada: a seção "Receitas" da Tela 5 é somente leitura (não duplica o `RecipeLinker` já existente no modal de Produto) — evitar dois lugares editáveis para o mesmo dado.
- **Existe oportunidade de reutilização?** Sim — Tela 3 e o card de resumo/`ItemCard` da Tela 4/5 reaproveitam 100% os padrões já provados em `ingredientes/categorias` e `receitas/[id]`, nenhum desenho novo do zero.

---

## 11. Recomendações registradas (não incorporadas nesta sprint)

- **Catálogo de contratos de API:** consolidar as matrizes de contrato já produzidas nas Sprints 2.E.4 (Fornecedores), 2.I (Receitas), 2.J (Produtos) e 2.H.4 (Embalagens) em um único documento de referência (`API_CONTRACTS.md` ou similar) — hoje espalhadas em `CHANGELOG.md` por sprint.
- **Skeleton fiel ao componente real:** `DESIGN_SYSTEM.md` Seção 21 já registra essa lacuna para `LoadingState` (`animate-pulse` genérico, não fiel ao `EntityCard`) — as duas novas páginas de detalhe (Telas 4/5) reforçam a mesma necessidade para layouts heterogêneos, não resolvida aqui.
- **Painel "usado em N X" como componente compartilhado:** se um terceiro módulo precisar do mesmo padrão de referência cruzada (ex: "Ingrediente usado em N receitas"), avaliar promover para `shared/` — só 1 caso de uso real até agora (Embalagens→Produtos), não o suficiente para generalizar.

---

## Confirmações explícitas

✓ Nenhuma implementação React foi realizada nesta sprint.
✓ Design System reutilizado integralmente — nenhum componente novo criado.
✓ As duas exceções de markup local (card de resumo, `ItemCard`) seguem precedente já aceito em `receitas/[id]/page.tsx`, não uma exceção nova.
✓ Frontend completamente especificado para a Sprint 2.H.6 — 5 telas, wireframes, fluxos, matrizes de componentes e de estado, avaliação de acessibilidade.
