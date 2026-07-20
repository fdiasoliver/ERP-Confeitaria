# MENU_STRUCTURE.md — Estrutura de Menu do ERP Doce Menina

Documento de referência para a navegação lateral do sistema administrativo.
Produzido na Sprint P1 — Planejamento Funcional (29/06/2026).

---

## Princípios de design do menu

- **Acesso por papel:** cada item indica o papel mínimo necessário; usuário só vê o que pode acessar
- **Hierarquia flat:** máximo 2 níveis (grupo → item); nunca 3 níveis
- **Agrupamento semântico:** itens agrupados por domínio operacional, não por tipo de entidade
- **Estado atual visível:** item ativo destacado; submenus do grupo ativo sempre expandidos
- **Mobile-friendly:** menu colapsável em telas pequenas via ícone hamburger

---

## Mapa completo do menu lateral

### Área sem grupo

| Item | Rota | Ícone | Papel mínimo | Fase | Status |
|------|------|-------|-------------|------|--------|
| Painel | `/admin` | 🏠 | Todos | Fase 1 | ⚠️ Parcial (sem métricas reais) |
| Pedidos | `/admin/pedidos` | 📋 | ATENDIMENTO | Fase 2 | 🔲 Planejado |
| Produção | `/admin/producao` | 🍰 | PRODUCAO | Fase 1 | ⚠️ Parcial (dados mock) |

---

### Grupo: Catálogo

Gestão do cardápio público: produtos, agrupamentos e filtros da vitrine.

| Item | Rota | Ícone | Papel mínimo | Fase | Status |
|------|------|-------|-------------|------|--------|
| Produtos | `/admin/produtos` | 🎂 | ADMIN | Fase 2 | 🔲 Planejado |
| Categorias | `/admin/categorias` | 🗂️ | ADMIN | Fase 2 | 🔲 Planejado |
| Ocasiões | `/admin/ocasioes` | 🎉 | ADMIN | Fase 2 | 🔲 Planejado |

**Notas:**
- Categorias e Ocasiões podem ser consolidadas numa única tela de "Taxonomias" se o volume for baixo
- `Product.active = false` oculta da vitrine sem excluir

---

### Grupo: Insumos

Gestão de matérias-primas, fornecedores, compras e unidades de medida.

| Item | Rota | Ícone | Papel mínimo | Fase | Status |
|------|------|-------|-------------|------|--------|
| Ingredientes | `/admin/insumos` | 🧂 | ADMIN | Fase 3 | 🔲 Planejado |
| Fornecedores | `/admin/fornecedores` | 🏭 | ADMIN | Fase 5 | 🔲 Planejado |
| Compras | `/admin/compras` | 🛒 | ADMIN | Fase 5 | 🔲 Planejado |
| Unidades | `/admin/unidades` | 📐 | ADMIN | Fase 3 | 🔲 Planejado |

**Notas:**
- Unidades têm prioridade sobre Ingredientes (dependência)
- Fornecedores são campo texto em `Ingredient.supplier` até a Fase 5
- Compras atualizam `stockQuantity` e geram `IngredientPriceHistory` automaticamente

---

### Grupo: Receitas

| Item | Rota | Ícone | Papel mínimo | Fase | Status |
|------|------|-------|-------------|------|--------|
| Receitas | `/admin/receitas` | 📖 | ADMIN | Fase 3 | 🔲 Planejado |

**Notas:**
- Receitas dependem de Ingredientes e Unidades
- Vinculação a produtos (ProductRecipe) acontece no formulário de Produto
- Custo calculado é exibido na listagem de receitas e propagado para o produto

---

### Área sem grupo

| Item | Rota | Ícone | Papel mínimo | Fase | Status |
|------|------|-------|-------------|------|--------|
| Clientes | `/admin/clientes` | 👥 | ATENDIMENTO | Fase 2 | 🔲 Planejado |

---

### Grupo: Financeiro

Visibilidade financeira do negócio: recebimentos, pagamentos, caixa e demonstrativos.

| Item | Rota | Ícone | Papel mínimo | Fase | Status |
|------|------|-------|-------------|------|--------|
| Visão Geral | `/admin/financeiro` | 💰 | FINANCEIRO | Fase 7 | 🔲 Planejado |
| A Pagar | `/admin/financeiro/pagar` | 📤 | FINANCEIRO | Fase 7 | 🔲 Planejado |
| A Receber | `/admin/financeiro/receber` | 📥 | FINANCEIRO | Fase 7 | 🔲 Planejado |
| Fluxo de Caixa | `/admin/financeiro/caixa` | 📈 | FINANCEIRO | Fase 7 | 🔲 Planejado |
| DRE | `/admin/financeiro/dre` | 📊 | ADMIN | Fase 7 | 🔲 Planejado |

---

### Grupo: Relatórios

Consultas analíticas por período — somente leitura.

| Item | Rota | Ícone | Papel mínimo | Fase | Status |
|------|------|-------|-------------|------|--------|
| Vendas | `/admin/relatorios/vendas` | 📦 | FINANCEIRO | Fase 9 | 🔲 Planejado |
| Custos | `/admin/relatorios/custos` | 🧮 | FINANCEIRO | Fase 9 | 🔲 Planejado |
| Estoque | `/admin/relatorios/estoque` | 🏪 | ADMIN | Fase 9 | 🔲 Planejado |
| Clientes | `/admin/relatorios/clientes` | 📊 | ADMIN | Fase 9 | 🔲 Planejado |

---

### Grupo: Configurações

Parâmetros globais do negócio e da plataforma — exclusivo para ADMIN.

| Item | Rota | Ícone | Papel mínimo | Fase | Status |
|------|------|-------|-------------|------|--------|
| Loja | `/admin/config` | ⚙️ | ADMIN | Fase 2 | 🔲 Planejado |
| Tema | `/admin/tema` | 🎨 | ADMIN | Fase 2 | 🔲 Planejado |
| Usuários | `/admin/usuarios` | 🔐 | ADMIN | Fase 2 | 🔲 Planejado |

---

## Visão por papel

### ADMIN
Acessa todos os itens do menu.

### ATENDIMENTO
```
Painel
Pedidos
Produção (somente leitura — ver status)
Clientes
```

### PRODUCAO
```
Painel
Produção (acesso total — mover Kanban, marcar pronto)
```

### FINANCEIRO
```
Painel
Financeiro → Visão Geral, A Pagar, A Receber, Fluxo de Caixa
Relatórios → Vendas, Custos
```

---

## Estrutura de navegação completa (hierarquia)

```
/admin                          ← Painel (todos)
/admin/pedidos                  ← Lista de pedidos (ATENDIMENTO+)
  /admin/pedidos/[id]           ← Detalhe do pedido
/admin/producao                 ← Dashboard de produção (PRODUCAO+)
─────────────────────────────── Catálogo (ADMIN)
/admin/produtos                 ← Lista de produtos
  /admin/produtos/novo          ← Criar produto
  /admin/produtos/[id]          ← Editar produto
/admin/categorias               ← Lista de categorias
/admin/ocasioes                 ← Lista de ocasiões
─────────────────────────────── Insumos (ADMIN)
/admin/insumos                  ← Lista de ingredientes
  /admin/insumos/novo           ← Criar ingrediente
  /admin/insumos/[id]           ← Editar ingrediente + histórico de preços
/admin/fornecedores             ← Lista de fornecedores
  /admin/fornecedores/novo      ← Criar fornecedor
  /admin/fornecedores/[id]      ← Editar fornecedor
/admin/compras                  ← Lista de compras/entradas
  /admin/compras/nova           ← Registrar compra
/admin/unidades                 ← Lista de unidades + conversões
─────────────────────────────── Receitas (ADMIN)
/admin/receitas                 ← Lista de receitas
  /admin/receitas/nova          ← Criar receita
  /admin/receitas/[id]          ← Editar receita
─────────────────────────────── Clientes (ATENDIMENTO+)
/admin/clientes                 ← Lista de clientes
  /admin/clientes/[id]          ← Perfil do cliente
─────────────────────────────── Financeiro (FINANCEIRO+)
/admin/financeiro               ← Visão geral
/admin/financeiro/pagar         ← Contas a pagar
/admin/financeiro/receber       ← Contas a receber
/admin/financeiro/caixa         ← Fluxo de caixa
/admin/financeiro/dre           ← DRE mensal
─────────────────────────────── Relatórios (FINANCEIRO+)
/admin/relatorios/vendas        ← Relatório de vendas
/admin/relatorios/custos        ← Relatório de custos/CMV
/admin/relatorios/estoque       ← Relatório de estoque
/admin/relatorios/clientes      ← Relatório de clientes
─────────────────────────────── Configurações (ADMIN)
/admin/config                   ← StoreConfig
/admin/tema                     ← ThemeConfig
/admin/usuarios                 ← Gestão de usuários da equipe
  /admin/usuarios/novo          ← Criar usuário
  /admin/usuarios/[id]          ← Editar usuário
```

---

## Rotas protegidas: mapa de roles

Para uso em `src/proxy.ts` (`ROLE_REQUIRED`):

```typescript
const ROLE_REQUIRED: Record<string, string[]> = {
  // Catálogo
  "/admin/produtos":     ["ADMIN"],
  "/admin/categorias":   ["ADMIN"],
  "/admin/ocasioes":     ["ADMIN"],
  // Insumos
  "/admin/insumos":      ["ADMIN"],
  "/admin/fornecedores": ["ADMIN"],
  "/admin/compras":      ["ADMIN"],
  "/admin/unidades":     ["ADMIN"],
  // Receitas
  "/admin/receitas":     ["ADMIN"],
  // Clientes
  "/admin/clientes":     ["ADMIN", "ATENDIMENTO"],
  // Pedidos
  "/admin/pedidos":      ["ADMIN", "ATENDIMENTO"],
  // Produção
  "/admin/producao":     ["ADMIN", "PRODUCAO"],
  // Financeiro
  "/admin/financeiro":   ["ADMIN", "FINANCEIRO"],
  // Relatórios
  "/admin/relatorios":   ["ADMIN", "FINANCEIRO"],
  // Configurações
  "/admin/config":       ["ADMIN"],
  "/admin/tema":         ["ADMIN"],
  "/admin/usuarios":     ["ADMIN"],
};
```

**Nota:** O proxy verifica prefix-match para cobrir sub-rotas automaticamente.

---

## Legenda de status

| Símbolo | Significado |
|---------|-------------|
| ✅ | Implementado e funcional |
| ⚠️ | Parcialmente implementado |
| 🔲 | Planejado, não iniciado |

## Legenda de fases

| Fase | Escopo |
|------|--------|
| Fase 1 | Fundação (concluída) |
| Fase 2 | Cadastros base |
| Fase 3 | Receitas e insumos |
| Fase 5 | Estoque e compras |
| Fase 7 | Financeiro |
| Fase 9 | Dashboards e relatórios |
