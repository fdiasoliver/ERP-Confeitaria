# MODULE_2E_UX_REVIEW.md — UX/UI Foundation: Cadastro de Fornecedores

Documento produzido na Sprint 2.E.6 (UX/UI Foundation), por Ordem de Missão renumerada nesta mesma sessão (a Ordem original chegou identificada como "Sprint 2.E.5" — já ocupada pelo Frontend Inicial entregue e aprovado; renumeração para 2.E.6 registrada em `PLAN.md`/`CHANGELOG.md`, sem alterar o histórico já aprovado das Sprints 2.E.1–2.E.5).

**Esta Sprint não implementa Frontend definitivo.** Nenhum arquivo de código foi alterado na produção deste documento — apenas leitura de código existente e navegação via Playwright contra o Frontend Inicial já entregue (Sprint 2.E.5), para diagnóstico com evidência real.

---

## 1. Diagnóstico da interface atual

Analisadas as 5 páginas reais do ERP com o mesmo padrão de Cadastro Mestre: `/admin/unidades`, `/admin/ingredientes`, `/admin/receitas`, `/admin/produtos` e `/admin/fornecedores` (Frontend Inicial, Sprint 2.E.5) — todas lidas em código-fonte (`src/app/admin/{modulo}/page.tsx`) e navegadas via Playwright em três larguras (390px smartphone, 820px tablet, 1440px desktop), sessão admin autenticada, banco Supabase real.

### 1.1 Achado principal — uso de largura em desktop (evidência quantificada)

| Página | Container | Largura de conteúdo a 1440px | % da tela usado |
|---|---|---|---|
| `/admin/unidades` | `max-w-app` | 480px | **33%** |
| `/admin/ingredientes` | `max-w-app` | 480px | **33%** |
| `/admin/receitas` | `max-w-app` | 480px | **33%** |
| `/admin/produtos` | `max-w-app` | 480px | **33%** |
| `/admin/fornecedores` (Frontend Inicial) | `max-w-app` | 480px | **33%** |
| `/admin/config` (referência já homologada) | `max-w-5xl` | 1024px | **71%** |

Medido via `getBoundingClientRect()` em sessão real (não estimativa). Screenshot em 1440px de `/admin/produtos` com 9 produtos reais: coluna central de ~480px, ~480px de fundo vazio (`bg-cream`) de cada lado, lista em pilha única exigindo scroll vertical para ver os 9 itens — nenhum aproveitado do espaço horizontal.

**Isto explica, com evidência concreta, a insatisfação com a qualidade visual registrada na Sprint 2.J.2.1**: `DESIGN_SYSTEM.md` já documenta a regra desde a Sprint P2 ("Área admin: `max-w-5xl` (desktop-first)") e `CLAUDE.md` item 10 confirma a intenção ("dashboard de produção usa `max-w-5xl` por ser orientado a desktop"). Das 6 páginas administrativas de Cadastro Mestre, **5 ignoram a própria regra documentada do projeto**; só `/admin/config` e `/admin/producao` a seguem corretamente. `/admin/fornecedores` (Sprint 2.E.5) copiou fielmente o padrão de `/admin/unidades`, herdando o mesmo desvio.

### 1.2 Achado — duplicação de componentes locais

`grep` em `src/app/admin/{unidades,ingredientes,receitas,produtos}/page.tsx` confirma que os seguintes componentes são **redeclarados de forma quase idêntica em cada um dos 4 arquivos** (e uma 5ª vez em `fornecedores/page.tsx`, Sprint 2.E.5):

- `Field` — idêntico em unidades/produtos/fornecedores; ingredientes/receitas têm a mesma estrutura
- `StatusBadge` — 100% idêntico nos 5 arquivos
- `LoadingState` — 100% idêntico nos 5 arquivos (3 divs com `animate-pulse`)
- `EmptyState` — mesma estrutura, só o texto muda
- `ErrorState` — 100% idêntico nos 5 arquivos
- `FilterChips<T>` — 100% idêntico nos 5 arquivos (já genérico via `<T extends string>`, zero adaptação necessária)

Achado adicional: **já existe** um `Field` e um `Section` compartilhados em `src/components/admin/config/FormPrimitives.tsx` (usados por Config e parcialmente por Produtos, via `Section`) — mas nenhuma das 5 páginas de Cadastro Mestre reaproveita o `Field` compartilhado; todas redeclaram a própria versão local. `MODULE_2D_CLOSURE.md` (item 8, Sprint 2.D.6) já havia identificado isso para `FilterChips` especificamente ("candidato real a refatoração... promover para `src/components/` só quando houver um segundo uso real") — hoje há **5 usos reais**, não mais "um segundo".

### 1.3 Achado — inconsistência na confirmação de desativação

| Módulo | Desativar pede confirmação? |
|---|---|
| Unidades | ✅ Sim (`ConfirmModal`) |
| Produtos | ✅ Sim (`ConfirmModal`) |
| Fornecedores (2.E.5) | ✅ Sim (`ConfirmModal`) |
| Ingredientes | ❌ Não — desativa direto ao clique |
| Receitas | ❌ Não — desativa direto ao clique (confirmado via Playwright na Sprint I.3) |

`UX_GUIDELINES.md` Seção 6 não resolve isto explicitamente para insumos/receitas (só cita "Desativar usuário" na lista de confirmação obrigatória) — na prática, o projeto está dividido 60/40 entre os dois comportamentos, sem que nenhuma ADR ou documento tenha decidido a regra geral. Fornecedores (2.E.5) seguiu o padrão de Unidades/Produtos.

### 1.4 Achado — nenhuma página segue o layout admin documentado

`UX_GUIDELINES.md` Seção 15 descreve um layout de desktop com "Menu lateral fixo (240px)" e breadcrumb (Seção 9: "Painel › Ingredientes › Farinha de trigo"). Nenhuma das 5 páginas analisadas implementa menu lateral ou breadcrumb — todas usam apenas `HeaderMinimal` (título + seta "voltar" para `/admin`). Este é um gap sistêmico do projeto inteiro, não específico de Fornecedores — registrado aqui, não corrigido nesta Sprint (fora do escopo: mudaria a navegação de todos os módulos, não só Fornecedores).

### 1.5 O que já funciona bem (não mudar)

- Padrão de formulário em modal bottom-sheet (mobile) / centralizado (desktop implícito) — `UX_GUIDELINES.md` já documenta este padrão e ele é seguido consistentemente
- Toast/`ValidationSummary` já compartilhado entre todos os módulos — **não duplicado**, único ponto de feedback
- Pesquisa com debounce 300ms server-side (Produtos, Fornecedores) — já segue `UX_GUIDELINES.md` Seção 10 à risca
- Paginação server-side com contrato idêntico (`PagedResult<T>`) — já consistente entre Produtos e Fornecedores
- Mensagens de erro/sucesso em pt-BR, tom direto, sem jargão técnico — já aderente à Seção 4
- Máscaras de CNPJ/telefone reaproveitadas de `src/lib/formatters/` — sem duplicação

---

## 2. Problemas encontrados (resumo)

| # | Problema | Severidade | Módulos afetados |
|---|---|---|---|
| 1 | Container `max-w-app` (480px) em vez de `max-w-5xl` — 67% da tela desktop desperdiçada | **Alta** | Unidades, Ingredientes, Receitas, Produtos, Fornecedores |
| 2 | Listagem em pilha única (1 coluna) mesmo em desktop largo | **Alta** | Mesmos 5 |
| 3 | 6 componentes redeclarados de forma idêntica em 5 arquivos (~250 linhas duplicadas) | **Média** | Mesmos 5 |
| 4 | `Field`/`Section` compartilhados já existem mas não são reaproveitados | **Média** | Mesmos 5 |
| 5 | Inconsistência: confirmação de desativação em 3 de 5 módulos, ausente em 2 | **Média** | Ingredientes, Receitas |
| 6 | Sem breadcrumb, sem menu lateral fixo (diverge do documentado, mas sistêmico) | Baixa (fora de escopo) | Todos os admin |
| 7 | Formulário de Fornecedores (2.E.5) sem agrupamento visual de campos | **Média** | Fornecedores |

---

## 3. Proposta de redesign

### Objetivo de UX (conforme Ordem de Missão)
Rapidez, clareza, poucos cliques, baixo esforço cognitivo, legibilidade, consistência, responsividade.

### Decisão arquitetural central: adotar `max-w-5xl`, grid responsivo, sem introduzir Tabela

`DESIGN_SYSTEM.md` (componente 5) já documenta Tabela como padrão para listas administrativas (status 🔲, nunca implementada em nenhum módulo). Duas opções foram avaliadas:

- **Opção A — migrar para `<table>` real.** Aproveitaria melhor a densidade em desktop e seguiria `UX_GUIDELINES.md` Seção 13 à risca. **Rejeitada nesta sprint**: seria o primeiro uso de Tabela em todo o admin, uma decisão de maior porte que afeta o Design System inteiro, não apenas Fornecedores — a Ordem de Missão veda exatamente isso ("Não criar componentes exclusivos do módulo Supplier"; introduzir Tabela pela primeira vez via Fornecedores seria o oposto: um componente novo de alto impacto decidido para um módulo pequeno). Registrada como Melhoria Futura (Seção 9).
- **Opção B — manter Cards, corrigir o container e o grid.** Reaproveita 100% do componente Card já existente e testado (Sprint 2.E.5), resolve o problema real medido (uso de largura) com risco mínimo. **Adotada.**

Trade-off aceito: Cards em grid não atingem a densidade de uma tabela para volumes muito grandes (50+ fornecedores). Como o módulo é novo (0 registros em produção) e o volume esperado é baixo (dezenas, não milhares), este trade-off é proporcional — reavaliar para Tabela **apenas** se o volume real justificar (mesmo princípio já usado no projeto: "não criar estrutura sem necessidade técnica real comprovada").

### 3.1 Dashboard do módulo (mini, não uma tela separada)

Faixa de estatísticas no topo da listagem, reaproveitando o componente "Estatística" já documentado em `DESIGN_SYSTEM.md` #6:

```
┌─────────────┬─────────────┬─────────────┐
│  12         │  10         │  2          │
│  Total      │  Ativos     │  Inativos   │
└─────────────┴─────────────┴─────────────┘
```

Não é uma tela/rota nova — é uma seção fixa acima da toolbar, calculada a partir do mesmo `listSuppliersPaged` já existente (basta pedir `total` com e sem filtro de `active`, ou o Service devolver os 3 números numa única chamada — decisão de implementação, não de UX).

### 3.2 Toolbar e listagem

```
┌──────────────────────────────────────────────────────────────────────┐
│  🏭 Fornecedores                                                      │
│  ┌─────────┬─────────┬─────────┐                                     │
│  │ 12      │ 10      │ 2       │                                     │
│  │ Total   │ Ativos  │ Inativos│                                     │
│  └─────────┴─────────┴─────────┘                                     │
│                                                                        │
│  [🔍 Pesquisar por nome...]      [Ordenar por ▾]      [+ Novo]        │
│  [Todos] [Ativos] [Inativos]                                          │
│                                                                        │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐             │
│  │ Fornecedor A  │  │ Fornecedor B  │  │ Fornecedor C  │             │
│  │ CNPJ/telefone │  │ CNPJ/telefone │  │ CNPJ/telefone │             │
│  │ Prazo: 5 dias │  │ Prazo: 3 dias │  │ —             │             │
│  │ [Editar] [Des]│  │ [Editar] [Des]│  │ [Editar] [Des]│             │
│  └───────────────┘  └───────────────┘  └───────────────┘             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐             │
│  │ ...           │  │ ...           │  │ ...           │             │
│  └───────────────┘  └───────────────┘  └───────────────┘             │
│                                                                        │
│                    ‹ Anterior   Página 1 de 2   Próxima ›             │
└──────────────────────────────────────────────────────────────────────┘
```

- **Colunas do grid:** 1 (mobile) → 2 (tablet) → 3 (desktop ≥1280px)
- **Ações rápidas por card:** Editar, Ativar/Desativar (mesmas de hoje — não adicionar "Excluir": `Supplier` não tem exclusão física, mesma decisão já tomada em 2.E.1–2.E.4, preservada)
- **Ordenação:** mesma de hoje (Nome A-Z/Z-A, Mais recentes/antigos) — sem mudança
- **Busca:** mesma de hoje (debounce 300ms, server-side) — sem mudança
- **Filtros:** mesmos chips de status — sem mudança

### 3.3 Formulário (modal) — agrupado por seção

Reaproveitando o componente `Section` já existente em `FormPrimitives.tsx` (hoje usado por Produtos e Config), conforme pedido explícito da Ordem de Missão:

```
┌─────────────────────────────────────┐
│  Novo fornecedor                 ✕  │
├─────────────────────────────────────┤
│  Identificação                      │
│  ┌─────────────────────────────┐   │
│  │ Nome *                       │   │
│  │ CNPJ (opcional)               │   │
│  │ Status: ● Ativo  (só em edição)│  │
│  └─────────────────────────────┘   │
│                                     │
│  Contato                            │
│  ┌─────────────────────────────┐   │
│  │ Telefone (opcional)          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Operação                           │
│  ┌─────────────────────────────┐   │
│  │ Prazo de entrega (opcional)  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Observações                        │
│  ┌─────────────────────────────┐   │
│  │ Notas (opcional, textarea)   │   │
│  └─────────────────────────────┘   │
│                                     │
│           [Cancelar]    [Criar]    │
└─────────────────────────────────────┘
```

Nota: "Ativo" não é um campo do formulário de criação/edição (é alterado só pelos botões Ativar/Desativar da listagem, mesma regra já em vigor desde 2.E.5) — aparece como informação de status dentro do grupo "Identificação" apenas no modo edição, igual ao padrão já usado em Unidades/Produtos.

### 3.4 Estados vazio / loading / skeleton / mensagens / confirmações

| Estado | Comportamento (mantido de 2.E.5, sem mudança de conteúdo) |
|---|---|
| Vazio (sem fornecedores) | "Nenhum fornecedor cadastrado." + botão "+ Criar fornecedor" |
| Vazio (filtro sem resultado) | "Nenhum fornecedor encontrado." + sugestão de ajustar filtro |
| Loading inicial | Substituir os 3 blocos genéricos `animate-pulse` por Skeleton fiel ao card real (nome + CNPJ + botões), seguindo `DESIGN_SYSTEM.md` #15 — hoje usa placeholder genérico, não fiel ao layout final |
| Confirmação de desativação | Mantida (já correta desde 2.E.5) — "Desativar fornecedor?" + consequência + botões "Manter ativo"/"Desativar" |
| Mensagens de sucesso/erro | Mantidas (toast já correto) |

---

## 4. Wireframe textual — responsivo (as 3 larguras)

### Smartphone (< 768px) — sem mudança de 2.E.5 (já correto)
```
[← Fornecedores]
[12 total · 10 ativos · 2 inativos]  ← nova faixa, empilhada
[+ Novo]
[🔍 Pesquisar...]
[Ordenar por ▾]
[Todos][Ativos][Inativos]
[Card 1 — full width]
[Card 2 — full width]
...
[‹ Anterior   1 de 2   Próxima ›]
```

### Tablet (768–1279px)
```
[← Fornecedores]                    max-w-5xl centralizado
[Total][Ativos][Inativos]           3 colunas de estatística
[🔍 Pesquisar...] [Ordenar ▾] [+Novo]
[Todos][Ativos][Inativos]
[Card 1] [Card 2]                   grid-cols-2
[Card 3] [Card 4]
```

### Desktop (≥ 1280px)
```
[← Fornecedores]                                    max-w-5xl centralizado
[Total][Ativos][Inativos]
[🔍 Pesquisar...]              [Ordenar ▾]  [+ Novo]
[Todos][Ativos][Inativos]
[Card 1] [Card 2] [Card 3]                          grid-cols-3
[Card 4] [Card 5] [Card 6]
```

---

## 5. Organização dos componentes

```
src/components/admin/
  shared/                          ← NOVO diretório — Design System oficial dos módulos de Cadastro Mestre
    Field.tsx                      ← promovido (unifica FormPrimitives.Field + as 5 versões locais)
    StatusBadge.tsx                ← promovido
    LoadingState.tsx               ← promovido (genérico) + variante Skeleton fiel por módulo
    EmptyState.tsx                 ← promovido
    ErrorState.tsx                 ← promovido
    FilterChips.tsx                ← promovido (já genérico, zero adaptação)
    ConfirmModal.tsx                ← promovido (parametrizado por título/corpo/label dos botões)
    StatRow.tsx                    ← NOVO (faixa de estatísticas do topo)
  config/                          ← já existe, sem mudança
    FormPrimitives.tsx             ← Field local removido daqui, reexporta de shared/ (compat)
    ...
src/app/admin/fornecedores/
  page.tsx                         ← passa a importar de components/admin/shared/*
```

---

## 6. Estratégia de responsividade

| Breakpoint | Largura | Container | Grid de cards | Estatísticas |
|---|---|---|---|---|
| Smartphone | < 768px | `max-w-app` (480px) | 1 coluna | empilhadas |
| Tablet | 768–1279px | `max-w-5xl` | 2 colunas | 3 colunas |
| Desktop | ≥ 1280px | `max-w-5xl` | 3 colunas | 3 colunas |

Área de toque mínima 44×44px mantida (já em conformidade). `inputMode="numeric"` no campo de prazo de entrega (ajuste pequeno, ainda não aplicado em 2.E.5 — registrado como melhoria).

---

## 7. Componentes reutilizados (sem criar nada nesta lista)

- `Card` (padrão visual `.shadow-card`) — já em uso, mantido
- `Section` (`FormPrimitives.tsx`) — já existe, hoje subutilizado, passa a ser usado no formulário de Fornecedores
- `Toast`/`ValidationSummary` — já compartilhado, sem mudança
- Máscaras `maskCNPJ`/`maskPhone` — já compartilhadas, sem mudança
- Paginação (padrão `PagedResult` + botões Anterior/Próxima) — já consistente, sem mudança
- Componente "Estatística" (já documentado em `DESIGN_SYSTEM.md` #6, nunca implementado como componente — a faixa do item 3.1 é a primeira implementação real dele)

## 8. Componentes novos (justificativa de ganho comprovado)

| Componente | Ganho comprovado |
|---|---|
| `shared/Field.tsx` | Elimina 5 redeclarações idênticas (~15 linhas × 5 = 75 linhas) |
| `shared/StatusBadge.tsx` | Elimina 5 redeclarações 100% idênticas |
| `shared/LoadingState.tsx` | Elimina 5 redeclarações; abre caminho para Skeleton fiel (item 3.4) |
| `shared/EmptyState.tsx` | Elimina 5 redeclarações |
| `shared/ErrorState.tsx` | Elimina 5 redeclarações 100% idênticas |
| `shared/FilterChips.tsx` | Elimina 5 redeclarações 100% idênticas (zero adaptação — já genérico) |
| `shared/ConfirmModal.tsx` | Resolve o achado 1.3 (padroniza confirmação de desativação nos 5 módulos) |
| `shared/StatRow.tsx` | Implementa o componente "Estatística" já documentado, nunca antes codificado |

**Todos passam a integrar oficialmente o Design System** (`src/components/admin/shared/`), conforme exigido pela Ordem de Missão — nenhum é exclusivo de Fornecedores, todos nascem já pensados para os outros 4 módulos existentes adotarem na primeira oportunidade de manutenção (fora do escopo desta Sprint tocar Unidades/Ingredientes/Receitas/Produtos).

---

## 9. Melhorias de UX (Sprint 2.E.7 e Backlog Técnico)

**Na Sprint 2.E.7 (implementação deste redesign):**
- Container `max-w-5xl`, grid responsivo de cards, faixa de estatísticas, formulário agrupado em `Section`
- Promoção dos 7 componentes da Seção 8 para `src/components/admin/shared/`
- `inputMode="numeric"` no campo de prazo de entrega

**Backlog Técnico (fora do escopo de 2.E.7 — não é sobre Fornecedores especificamente):**
- TD-19 (novo, propor no encerramento): aplicar o mesmo container `max-w-5xl` + grid às páginas Unidades/Ingredientes/Receitas/Produtos (hoje com o mesmo desvio) — decisão de produto sobre quando/se vale a pena, não desta sprint
- TD-20 (novo, propor): decidir e padronizar confirmação de desativação em Ingredientes/Receitas (achado 1.3)
- Melhoria Futura: avaliar migração para Tabela real se o volume de fornecedores crescer além do que Cards suportam confortavelmente
- Melhoria Futura: breadcrumb e/ou menu lateral fixo (achado 1.4) — decisão de arquitetura de navegação de todo o admin, não deste módulo

---

## 10. Experience Review

Critério avaliado conforme Ordem de Missão: tempo para executar tarefas, número de cliques, clareza, aprendizado, consistência.

### 10.1 Cliques — sem mudança (já eficiente desde 2.E.5)

| Tarefa | Cliques hoje (2.E.5) | Cliques na proposta (2.E.7) |
|---|---|---|
| Ver lista | 0 (após navegar à página) | 0 |
| Criar fornecedor | 2 (+ Novo, Criar) | 2 — sem mudança |
| Editar fornecedor | 2 (Editar, Salvar) | 2 — sem mudança |
| Pesquisar | 0 (digitação) | 0 — sem mudança |
| Filtrar por status | 1 | 1 — sem mudança |
| Desativar | 2 (Desativar, confirmar) | 2 — sem mudança (mantém a confirmação, correta) |

A proposta **não reduz cliques** porque o fluxo de 2.E.5 já é objetivamente enxuto (confirmado contra `UX_GUIDELINES.md` Seções 2–6) — o problema diagnosticado nunca foi número de cliques, foi aproveitamento de tela e duplicação de código. Registrar isso é mais honesto do que inventar uma redução de cliques que não existe.

### 10.2 Clareza e densidade de informação (ganho real, mensurável)

- Hoje: para ver 9 itens (ex.: Produtos) o usuário rola a página inteira, vendo 1 item por vez na área visível de uma tela de 900px de altura
- Proposta: grid de 3 colunas em desktop exibe até 6 cards simultaneamente na mesma altura de viewport (2 linhas × 3 colunas) sem rolar — **redução de ~3x no scroll necessário** para o mesmo volume de itens

### 10.3 Aprendizado e consistência

- Ganho real: os 7 componentes promovidos (Seção 8) passam a ter **uma única implementação e um único lugar para corrigir bugs/inconsistências** (hoje um bug em `StatusBadge` precisaria ser corrigido em 5 arquivos separados)
- Resolve diretamente o achado 1.3 (confirmação de desativação inconsistente) ao padronizar `ConfirmModal` como componente único parametrizado

### 10.4 Comparação via Playwright (atual vs. proposta) — o que pôde e o que não pôde ser medido ao vivo

Conforme a própria Ordem de Missão, esta Sprint não implementa código — não existe UI da "proposta" para navegar de fato. A comparação real feita via Playwright (Seção 1.1) mediu o **estado atual** com precisão (`getBoundingClientRect`, 33% vs 71% de uso de largura, screenshots em 3 larguras). Os números da proposta (Seção 10.2, "~3x menos scroll") são **projeções calculadas a partir do layout wireframed** (grid 3 colunas × card de altura conhecida ÷ altura de viewport), não medições de uma UI real — diferença registrada aqui explicitamente para não confundir medição com estimativa.

---

## 11. Plano de implementação (Sprint 2.E.7 — UX/UI Implementation)

**Pré-requisito:** aprovação desta especificação pelo Product Owner.

**Escopo autorizado a implementar (quando aprovada):**
1. Criar `src/components/admin/shared/{Field,StatusBadge,LoadingState,EmptyState,ErrorState,FilterChips,ConfirmModal,StatRow}.tsx`
2. Migrar `src/app/admin/fornecedores/page.tsx` para consumir os componentes de `shared/` em vez das versões locais
3. Trocar o container de `max-w-app` para `max-w-5xl`; listagem em grid responsivo (1/2/3 colunas)
4. Adicionar a faixa de estatísticas (Total/Ativos/Inativos) — requer decidir se o Service devolve os 3 números numa chamada ou 3 chamadas de `listSuppliers` com filtros diferentes (decisão técnica da Sprint 2.E.7, não desta)
5. Reagrupar o formulário em `Section`s (Identificação/Contato/Operação/Observações)
6. Skeleton fiel ao card real (substituindo os 3 blocos genéricos atuais)
7. `inputMode="numeric"` no campo de prazo de entrega

**Fora do escopo de 2.E.7** (não mexer): Repository, Service, Validator, API, Schema, banco — nenhuma camada de backend é tocada; é puramente Frontend consumindo os mesmos endpoints já existentes e homologados (Sprint 2.E.4).

**Critério de sucesso de 2.E.7:** todos os itens acima implementados, `tsc`/`lint`/`build` limpos, validação manual real via Playwright (mesmo padrão de evidência já usado nas Sprints 2.E.1–2.E.5), 0 regressão nas camadas de backend.

---

Precedência: em caso de conflito entre este documento e `PLAN.md`, `CHANGELOG.md`, `DESIGN_SYSTEM.md` ou `UX_GUIDELINES.md`, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 18/07/2026 — Sprint 2.E.6 (UX/UI Foundation), aguardando aprovação do Product Owner para autorizar a Sprint 2.E.7 (UX/UI Implementation). -->
