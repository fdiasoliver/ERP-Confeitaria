# MODULE_G8_CLOSURE.md — Sprint G.8 (Design System Consolidation & Legacy Migration)

**Status do documento:** criado na Microtarefa 3 (20/07/2026), por exigência explícita da Ordem de Missão da própria Microtarefa 3; revisado na Microtarefa 4 — Consolidação e Homologação (20/07/2026). A Sprint G.8 foi **concluída, aprovada, homologada e encerrada** com aceite do Product Owner em 20/07/2026 (ver `CHANGELOG.md`) — este documento não é um encerramento formal de módulo de negócio (não há módulo novo nesta sprint; é consolidação de Frontend sobre módulos já encerrados), mas permanece como referência viva da Cartografia de Compatibilidade para migrações futuras.

---

## Cartografia de Compatibilidade do Design System

Referência oficial para migrações futuras de páginas de Cadastro Mestre para `src/components/admin/shared/` — consultar esta tabela antes de auditar um componente já classificado aqui, para não repetir uma auditoria já feita.

### Taxonomia de classificação

| Categoria | Significado |
|---|---|
| Reutilização Universal | Nenhum pré-requisito — migra em qualquer página, qualquer entidade. |
| Reutilização Condicional | Migra sem depender de layout/container, mas exige uma precondição de dados/entidade (ex.: campo booleano de status). |
| Dependente de Evolução de Layout | Bloqueado pelo **container/grid da página** (largura, breakpoints) — não pelo item individual. |
| Dependente do Modelo de Interface | Bloqueado pelo **paradigma de apresentação do item** da listagem (card empilhado vs. linha horizontal) — independente da largura do container; distinção introduzida na Microtarefa 4 a partir do caso `EntityCard`, que nas Microtarefas 1–3 estava agrupado sob "Dependente de Evolução de Layout" junto com `LoadingState`, embora o bloqueio real seja de natureza diferente (ver observação da própria linha). |
| Dependente de Evolução do Design System | Exigiria um componente novo/genérico ainda não construído. Nenhum dos 8 componentes abaixo se enquadra aqui até o momento. |

| Componente Compartilhado | Situação | Pré-requisitos | Observações |
|---|---|---|---|
| `EmptyState` | Reutilização Universal | Nenhum | Card autocontido (`shadow-card rounded-2xl bg-white p-8`), sem dependência de container, grid ou paradigma visual. Migrado sem adaptação em `unidades/conversoes/page.tsx` e `ingredientes/categorias/page.tsx`. |
| `ErrorState` | Reutilização Universal | Nenhum | Mesmo padrão do `EmptyState`. Migrado sem adaptação em `unidades/conversoes/page.tsx`, `ingredientes/categorias/page.tsx` e `receitas/[id]/page.tsx`. |
| `ConfirmDialog` | Reutilização Universal | Nenhum | Overlay `fixed inset-0` — escapa do container pai via posicionamento fixo, portanto independente de a página usar `max-w-app` ou `max-w-5xl`. Migrado em `ingredientes/categorias/page.tsx` sem exigir mudança de layout da página. |
| `SearchBar` | Reutilização Universal | Nenhum | `<input type="search">` simples, sem dependência de layout. Migrado em `ingredientes/categorias/page.tsx`. |
| `EntityForm` | Reutilização Universal | Nenhum | Overlay `fixed inset-0` (bottom-sheet em mobile, centralizado em desktop via `md:`) — mesma independência de container do `ConfirmDialog`. Migrado em `ingredientes/categorias/page.tsx` sem exigir que a página adotasse `PageContainer`. |
| `StatusBadge` | Reutilização Condicional | Entidade ter um campo booleano de status (ativo/inativo) | Suporta customização de rótulo via `activeLabel`/`inactiveLabel` sem exigir alteração do componente. Migrado em `receitas/[id]/page.tsx`, que permanece em `max-w-app` — confirma que o pré-requisito é da entidade, não do layout. **Fora do escopo:** status multivalorado (ex.: status de pedido, que usa o mapa de cores do componente 11 — Badges de `DESIGN_SYSTEM.md`). |
| `LoadingState` | Dependente de Evolução de Layout | Página adotar `PageContainer` (`max-w-5xl`) + `ResponsiveGrid` | Hardcoda grid `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` no próprio componente. Adiado em `unidades/conversoes/page.tsx`, `ingredientes/categorias/page.tsx` e `receitas/[id]/page.tsx` — as 3 páginas permanecem em `max-w-app` (layout legado). |
| `EntityCard` | Dependente do Modelo de Interface | Página adotar item de listagem em card empilhado (título acima, ações abaixo) | Empilha título acima das ações (bloco com `mb-3` entre título/badges e conteúdo/ações) — incompatível com listagens em linha horizontal (`CategoryRow`, `ConversionCard`, `ItemCard`: nome à esquerda, ações à direita, uma única linha). Nas 5 páginas onde já está em uso (Unidades/Ingredientes/Receitas/Produtos/Fornecedores), a página também adota `PageContainer`+`ResponsiveGrid` — os dois sempre migraram juntos até o momento, mas são pré-requisitos tecnicamente independentes (ver Taxonomia acima). |

### Padrões observados (MT-1 a MT-4)

- Todo componente que renderiza como overlay (`fixed inset-0`) é seguro para migrar independentemente do layout da página hospedeira (`ConfirmDialog`, `EntityForm`).
- Todo componente sem estado próprio de apresentação em lista (`EmptyState`, `ErrorState`, `SearchBar`) é seguro por não ter contato com o container/grid/modelo de item.
- `StatusBadge` mostrou que uma "condição" pode ser da **entidade** (tem campo booleano?), não da página — por isso a categoria "Reutilização Condicional" é distinta de "Dependente de Evolução de Layout"/"Dependente do Modelo de Interface".
- `LoadingState` e `EntityCard` mostraram que "depende do layout legado" pode ter duas causas raízes diferentes — container/grid da página (`LoadingState`) vs. paradigma de apresentação do item (`EntityCard`) — que nas 5 páginas já migradas sempre andaram juntas, mas não são a mesma coisa: uma página poderia, em teoria, adotar `PageContainer` sem mudar seus itens para card empilhado, ou vice-versa.
