# SCREENS.md — Catálogo de Telas do Doce Menina

Documento de referência para todas as telas do sistema.
Produzido na Sprint P1 — Planejamento Funcional (29/06/2026).

---

## Convenções

- **Status:** ✅ Implementado | ⚠️ Parcial | 🔲 Planejado | ❌ Fora do escopo atual
- **Permissões:** indicam o papel mínimo para acesso (área admin); área cliente é pública ou requer auth de cliente
- **Integrações:** APIs externas acionadas diretamente nesta tela

---

# Área Cliente (público / auth cliente)

---

## C-01 — Vitrine

**Rota:** `/`
**Status:** ✅ Implementado

**Objetivo:** Exibir o catálogo de produtos disponíveis e permitir que o cliente adicione itens ao carrinho.

**Campos exibidos:**
- Nome do produto
- Imagem (emoji temporário; `imageUrl` quando upload implementado)
- Preço base (`basePrice`) formatado em BRL
- Prazo mínimo (`leadTimeDays`) em dias
- Categoria do produto
- Tags de ocasião

**Filtros:**
- Por ocasião (chips horizontais rolável: Todos, Aniversário, Casamento, Corporativo, etc.)
- Por categoria (seções agrupadas na página)

**Ações:**
- Adicionar produto ao carrinho (botão +/− por produto)
- Abrir CartDrawer (via CartFab flutuante)
- Navegar para checkout (via CartDrawer)
- Abrir carrinho via URL `/?cart=open`

**Permissões:** Pública (sem autenticação)

**Integrações:** Nenhuma externa (dados via `/api/products` e `/api/occasions`)

**Dependências:** Produtos seeded no banco; OccasionTags seeded

---

## C-02 — Login do Cliente

**Rota:** `/login`
**Status:** ⚠️ Parcial (funciona sem OTP real; OTP WhatsApp aguarda Fase 8)

**Objetivo:** Autenticar o cliente via número de celular para acessar checkout e histórico de pedidos.

**Campos:**
- Passo 1: Número de celular (input tel, máscara (11) 99999-9999)
- Passo 2 (Fase 8): Código OTP de 6 dígitos enviado via WhatsApp
- Passo 2 atual: Nome completo (temporário até OTP)

**Ações:**
- Enviar OTP / continuar para próximo passo
- Reenviar código (Fase 8)
- Confirmar código e fazer login
- Retornar ao passo anterior

**Permissões:** Pública

**Integrações:**
- WhatsApp API (Fase 8) — envio de OTP
- NextAuth provider `"customer"` (já implementado)

**Dependências:** Nenhuma (cria Customer via upsert se não existir)

**Comportamento pós-login:** Redireciona para `callbackUrl` (ex.: `/checkout`) ou `/pedidos`

---

## C-03 — Checkout

**Rota:** `/checkout`
**Status:** ✅ Implementado

**Objetivo:** Coletar todos os dados necessários para confirmar o pedido: data, endereço, pagamento e personalização.

**Campos:**
- Data de entrega / retirada (date picker; mínimo = `getMinDeliveryDate(leadTime)`)
- Tipo de entrega (cards: Retirada, Entrega gratuita, Uber/99)
- **Condicionais (apenas quando entrega):**
  - Rua / Avenida *
  - Número * + CEP * (grid 2 colunas)
  - Bairro *
  - Complemento (opcional)
  - Nome de quem vai receber
  - Telefone de quem recebe
- Observação geral do pedido (textarea)
- Upload de fotos de referência (placeholder — Fase 8)
- Observação por item (textarea abaixo de cada produto do carrinho)
- Forma de pagamento (cards: PIX online, PIX na entrega, Dinheiro, Cartão)
- Resumo: subtotal + entrega + total

**Filtros:** N/A

**Ações:**
- Selecionar tipo de entrega
- Preencher endereço
- Adicionar observação por item
- Selecionar forma de pagamento
- Confirmar pedido (POST /api/orders)
- Navegar para login se não autenticado

**Permissões:** Requer auth cliente (`useCurrentUser() !== null`)

**Integrações:**
- Google Maps Distance Matrix (Fase 3.8) — validação de distância para ENTREGA_GRATIS
- PIX Gateway (Fase 8) — geração de QR Code para PIX_ONLINE

**Dependências:** Carrinho com itens; cliente autenticado

**Guards:**
1. Carrinho vazio → exibe mensagem + link para vitrine
2. Sessão carregando → spinner
3. Não autenticado → prompt de login com link para `/login?callbackUrl=/checkout`

---

## C-04 — Confirmação de Pedido

**Rota:** `/checkout` (estado pós-confirmação, sem rota própria)
**Status:** ✅ Implementado

**Objetivo:** Confirmar ao cliente que o pedido foi registrado com sucesso.

**Campos exibidos:**
- Número do pedido (`#${orderNumber}`)
- Mensagem de confirmação
- Telefone do cliente (indica onde chegará a confirmação WhatsApp)

**Ações:**
- Ver meus pedidos (link para `/pedidos`)

**Permissões:** Requer auth cliente

**Integrações:** WhatsApp (Fase 8) — mensagem de confirmação enviada automaticamente

---

## C-05 — Lista de Pedidos

**Rota:** `/pedidos`
**Status:** ✅ Implementado

**Objetivo:** Listar todos os pedidos do cliente autenticado com status e ações rápidas.

**Campos exibidos por pedido:**
- Número do pedido
- Status (badge colorido)
- Data de entrega
- Total do pedido
- Itens resumidos (nomes e quantidades)

**Filtros:** Nenhum (todos os pedidos em ordem cronológica inversa)

**Ações:**
- Ver detalhes (→ C-06, quando implementado)
- Pedir novamente (carrega itens sem observações no CartContext → redireciona para `/`)
- Pedir e personalizar (carrega itens com observações no CartContext → redireciona para `/checkout`)

**Permissões:** Requer auth cliente (exibe prompt de login se não autenticado)

**Integrações:** Nenhuma

**Dependências:** `GET /api/orders?phone=`

---

## C-06 — Detalhe do Pedido (Cliente)

**Rota:** `/pedidos/[id]`
**Status:** 🔲 Planejado (Fase P3.4)

**Objetivo:** Exibir o pedido completo com timeline de status, itens e informações de entrega.

**Campos exibidos:**
- Número, data de criação, status atual
- Timeline de status com data/hora de cada mudança (OrderStatusHistory)
- Lista de itens: nome, quantidade, preço unitário, observação individual
- Fotos de referência (se existirem)
- Tipo e endereço de entrega
- Nome e telefone do destinatário
- Forma de pagamento e status de pagamento
- Total

**Ações:**
- Cancelar pedido (botão visível apenas quando status = CONFIRMADO)
- Voltar para lista

**Permissões:** Requer auth cliente (dono do pedido)

**Integrações:** Nenhuma

**Dependências:** GET /api/orders/[id] (não implementado)

---

# Área Admin (requer auth admin)

---

## A-01 — Login Admin

**Rota:** `/admin/login`
**Status:** ✅ Implementado

**Objetivo:** Autenticar membros da equipe interna com e-mail e senha.

**Campos:**
- E-mail
- Senha

**Ações:**
- Fazer login (POST NextAuth credentials)
- Exibir erro de credenciais inválidas

**Permissões:** Pública (rota de login)

**Integrações:** NextAuth provider `"credentials"`

**Comportamento pós-login:** Redireciona para `/admin` ou `callbackUrl`

---

## A-02 — Painel Administrativo (Hub)

**Rota:** `/admin`
**Status:** ⚠️ Parcial (sem métricas reais; só links estáticos)

**Objetivo:** Dashboard de entrada com métricas rápidas e atalhos para módulos por papel.

**Campos exibidos (planejados):**
- Pedidos do dia (contagem e valor total)
- Pedidos urgentes (entrega hoje, não entregues)
- Alertas de estoque abaixo do mínimo
- Receita do mês (vs. mês anterior)
- Atalhos rápidos para módulos mais usados pelo papel do usuário

**Filtros:** N/A

**Ações:**
- Navegar para qualquer módulo via cards ou menu lateral

**Permissões:** Todos os papéis (ADMIN, ATENDIMENTO, PRODUCAO, FINANCEIRO)

**Integrações:** Nenhuma

**Dependências:** GET /api/orders, GET /api/insumos (alertas de estoque)

---

## A-03 — Dashboard de Produção

**Rota:** `/admin/producao`
**Status:** ⚠️ Parcial (layout completo; dados 100% hardcoded — KI-04)

**Objetivo:** Dar à equipe de produção visibilidade sobre o que produzir e quando; atualizar status dos pedidos.

**Campos exibidos:**
- Data atual
- Abas de período: Hoje / Amanhã / Semana / Calendário
- Cards de estatísticas: Pedidos, Itens, Urgentes
- Seção Urgente: pedidos com entrega hoje e status ≠ ENTREGUE (borda vermelha)
- Kanban: 4 colunas (Confirmado → Em prod. → Pronto → Entregue)
  - Cada card: número do pedido, cliente, itens, horário de entrega, observações
- Consolidação de batch: ingredientes necessários agregados por data

**Filtros:**
- Período (aba): Hoje / Amanhã / Semana
- Data específica (aba Calendário)

**Ações:**
- Mover pedido entre colunas do Kanban (PATCH /api/orders/[id]/status)
- Visualizar detalhes do pedido (modal ou link)
- Ver fotos de referência (Fase 8)

**Permissões:** ADMIN, PRODUCAO

**Integrações:** WhatsApp (Fase 8) — notificação automática ao mover para PRONTO ou SAIU_ENTREGA

**Dependências:** GET /api/orders?date=&status= (não implementado), receitas vinculadas (para batch)

---

## A-04 — Lista de Pedidos (Admin)

**Rota:** `/admin/pedidos`
**Status:** 🔲 Planejado (Fase 2)

**Objetivo:** Listar todos os pedidos com filtros avançados para atendimento e acompanhamento.

**Campos exibidos por pedido:**
- Número, cliente (nome + telefone), data de entrega, status, total, forma de pagamento

**Filtros:**
- Por status (CONFIRMADO, EM_PRODUCAO, PRONTO, SAIU_ENTREGA, ENTREGUE, CANCELADO)
- Por período (data de entrega ou data de criação)
- Por tipo de entrega (RETIRADA, ENTREGA_GRATIS, ENTREGA_APP)
- Por forma de pagamento
- Por cliente (busca por nome ou telefone)

**Ações:**
- Ver detalhe (→ A-05)
- Alterar status (dropdown inline ou modal)
- Exportar lista (CSV) — Fase 9
- Filtrar por período (date range picker)

**Permissões:** ADMIN, ATENDIMENTO

**Integrações:** Nenhuma

**Dependências:** GET /api/orders com parâmetros de filtro

---

## A-05 — Detalhe do Pedido (Admin)

**Rota:** `/admin/pedidos/[id]`
**Status:** 🔲 Planejado (Fase 2)

**Objetivo:** Exibir e editar todos os dados de um pedido; registrar alterações de status com nota.

**Campos exibidos:**
- Número, cliente (nome + telefone + link para perfil), criado em, criado por
- Status atual + histórico completo (timeline OrderStatusHistory)
- Itens: nome, quantidade, preço unitário, observação individual
- Fotos de referência (Fase 8)
- Endereço de entrega (se aplicável)
- Nome e telefone do destinatário
- Forma de pagamento, status de pagamento, pixTxId (se PIX)
- Observações gerais
- Subtotal, taxa de entrega, total

**Ações:**
- Alterar status (dropdown com VALID_TRANSITIONS aplicados)
- Adicionar nota ao mudar status
- Cancelar pedido (modal de confirmação)
- Ver perfil do cliente (link)
- Marcar pagamento como recebido (status PAGO)

**Permissões:** ADMIN, ATENDIMENTO

**Integrações:** WhatsApp (Fase 8) — envio de notificação ao mudar status

**Dependências:** GET /api/orders/[id]; PATCH /api/orders/[id]/status

---

## A-06 — Lista de Produtos

**Rota:** `/admin/produtos`
**Status:** 🔲 Planejado (Fase 2)

**Objetivo:** Listar, filtrar e gerenciar o catálogo de produtos do ERP.

**Campos exibidos por produto:**
- Imagem (emoji ou foto)
- Nome
- Categoria
- Preço de venda (`basePrice`)
- Custo calculado (`costPrice`) — com alerta se basePrice < costPrice
- Margem (calculada: `(basePrice - costPrice) / basePrice × 100`)
- Prazo mínimo (`leadTimeDays`)
- Status (Ativo / Inativo)
- Destaque (`featured`)

**Filtros:**
- Por categoria
- Por ocasião
- Por status (ativo/inativo)
- Por destaque
- Busca por nome

**Ações:**
- Criar produto (→ A-07)
- Editar produto (→ A-07)
- Ativar / Desativar (toggle inline)
- Marcar / desmarcar destaque (toggle inline)
- Excluir (somente se sem pedidos vinculados)

**Permissões:** ADMIN

**Integrações:** Nenhuma

**Dependências:** GET /api/admin/products; categorias e ocasiões devem existir

---

## A-07 — Formulário de Produto (Criar / Editar)

**Rota:** `/admin/produtos/novo` | `/admin/produtos/[id]`
**Status:** 🔲 Planejado (Fase 2)

**Objetivo:** Criar ou editar um produto do catálogo com todos os seus atributos e associações.

**Campos:**
- Nome *
- Descrição (textarea)
- Categoria * (select)
- Imagem (upload de foto OU emoji fallback)
- Preço de venda (`basePrice`) *
- Prazo mínimo (`leadTimeDays`) * (dias)
- Ativo (toggle)
- Destaque (toggle)
- Ocasiões (seleção múltipla via chips/checkboxes)
- Receitas vinculadas (lista: receita + quantidade — editor dinâmico)
- Custo calculado (somente leitura — calculado a partir das receitas)
- Preço sugerido (somente leitura — calculado via fórmula de precificação)

**Ações:**
- Salvar
- Cancelar
- Adicionar receita à lista
- Remover receita da lista
- Ver detalhes da receita (link)

**Permissões:** ADMIN

**Integrações:** Supabase Storage (upload de imagem — Fase 8)

**Dependências:** Categorias, Ocasiões e Receitas devem existir para associação

---

## A-08 — Lista de Categorias

**Rota:** `/admin/categorias`
**Status:** 🔲 Planejado (Fase 2)

**Objetivo:** Gerenciar as categorias de produtos exibidas na vitrine.

**Campos exibidos:**
- Nome, slug, ordem de exibição (`sortOrder`), quantidade de produtos

**Ações:**
- Criar categoria (modal inline)
- Editar nome e ordem
- Excluir (somente se sem produtos vinculados)
- Reordenar (drag-and-drop ou campos de ordem)

**Permissões:** ADMIN

**Dependências:** Nenhuma

---

## A-09 — Lista de Ocasiões

**Rota:** `/admin/ocasioes`
**Status:** 🔲 Planejado (Fase 2)

**Objetivo:** Gerenciar as tags de ocasião usadas para filtrar produtos na vitrine.

**Campos exibidos:**
- Nome, slug, quantidade de produtos vinculados

**Ações:**
- Criar ocasião
- Editar nome
- Excluir (se sem produtos vinculados)

**Permissões:** ADMIN

**Dependências:** Nenhuma

---

## A-10 — Lista de Ingredientes

**Rota:** `/admin/insumos`
**Status:** 🔲 Planejado (Fase 3)

**Objetivo:** Gerenciar o estoque de matérias-primas com preço atual e alertas de estoque mínimo.

**Campos exibidos por ingrediente:**
- Nome
- Categoria de ingrediente
- Unidade base
- Preço atual (`currentPrice`)
- Estoque atual (`stockQuantity`)
- Estoque mínimo (`minStock`)
- Indicador: ⚠️ Abaixo do mínimo
- Fornecedor (texto até Fase 5; link para A-12 depois)
- Status (ativo/inativo)

**Filtros:**
- Por categoria de ingrediente
- Por status (ativo/inativo)
- Abaixo do mínimo (toggle)
- Busca por nome

**Ações:**
- Criar ingrediente (→ A-11)
- Editar ingrediente (→ A-11)
- Ver histórico de preços (→ A-11 aba histórico)
- Registrar compra rápida (modal de entrada de estoque)

**Permissões:** ADMIN

**Dependências:** Unidades devem existir (A-16)

---

## A-11 — Formulário de Ingrediente

**Rota:** `/admin/insumos/novo` | `/admin/insumos/[id]`
**Status:** 🔲 Planejado (Fase 3)

**Objetivo:** Criar ou editar um ingrediente com todos os seus atributos e visualizar o histórico de preços.

**Campos:**
- Nome *
- Categoria (select de IngredientCategory)
- Unidade base * (select de UnitOfMeasure)
- Preço atual (`currentPrice`) * — ao alterar, gera IngredientPriceHistory com `source: MANUAL`
- Estoque atual (`stockQuantity`)
- Estoque mínimo (`minStock`)
- Fornecedor (texto até Fase 5)
- Código externo (`externalCode`) — para integração CONAB/CEPEA (Fase 9)
- Ativo (toggle)

**Aba: Histórico de Preços**
- Tabela: data, preço, fonte (MANUAL / CONAB_CEASA / CEPEA / NOTA_FISCAL)
- Gráfico de variação de preço ao longo do tempo

**Ações:**
- Salvar
- Cancelar
- Atualizar preço (salva e gera histórico)

**Permissões:** ADMIN

**Dependências:** Unidades de medida

---

## A-12 — Lista de Fornecedores

**Rota:** `/admin/fornecedores`
**Status:** 🔲 Planejado (Fase 5)

**Objetivo:** Gerenciar fornecedores de ingredientes e embalagens.

**Campos exibidos:**
- Nome / razão social
- CNPJ
- Telefone / e-mail de contato
- Ingredientes fornecidos (contagem)
- Prazo médio de entrega

**Ações:**
- Criar fornecedor (→ A-13)
- Editar (→ A-13)
- Desativar

**Permissões:** ADMIN

**Dependências:** Nenhuma

---

## A-13 — Formulário de Fornecedor

**Rota:** `/admin/fornecedores/novo` | `/admin/fornecedores/[id]`
**Status:** 🔲 Planejado (Fase 5)

**Campos:**
- Nome / Razão Social *
- CNPJ
- Telefone
- E-mail
- Endereço
- Prazo de entrega padrão (dias)
- Observações

**Permissões:** ADMIN

---

## A-14 — Lista de Compras / Entradas de Estoque

**Rota:** `/admin/compras`
**Status:** 🔲 Planejado (Fase 5)

**Objetivo:** Registrar entradas de insumos e visualizar histórico de compras.

**Campos exibidos por compra:**
- Data, fornecedor, itens (resumo), valor total, nota fiscal

**Filtros:**
- Por fornecedor
- Por ingrediente
- Por período
- Por status (pendente / recebido)

**Ações:**
- Registrar nova compra (→ A-15)
- Ver detalhes
- Confirmar recebimento (atualiza `stockQuantity` dos ingredientes)

**Permissões:** ADMIN

**Dependências:** Fornecedores e Ingredientes

---

## A-15 — Formulário de Compra

**Rota:** `/admin/compras/nova`
**Status:** 🔲 Planejado (Fase 5)

**Campos:**
- Fornecedor * (select)
- Data da compra *
- Nota fiscal (número + upload de arquivo)
- Itens da compra (editor dinâmico):
  - Ingrediente * (select)
  - Quantidade *
  - Unidade * (select)
  - Preço unitário * (gera IngredientPriceHistory com source: NOTA_FISCAL)
- Total (calculado)

**Ações:**
- Salvar (atualiza stockQuantity e IngredientPriceHistory de cada item)
- Cancelar

**Permissões:** ADMIN

**Dependências:** Fornecedores, Ingredientes, Unidades

---

## A-16 — Unidades de Medida

**Rota:** `/admin/unidades`
**Status:** 🔲 Planejado (Fase 3)

**Objetivo:** Gerenciar unidades de medida (g, kg, ml, L, un) e conversões entre elas.

**Seção 1: Unidades**

| Campo | Tipo |
|-------|------|
| Nome * | texto (ex: Quilograma) |
| Abreviação * | texto único (ex: kg) |
| Tipo * | select (massa / volume / unidade) |

**Ações:** Criar, editar, excluir (se sem uso em ingredientes ou receitas)

**Seção 2: Conversões**

| Campo | Tipo |
|-------|------|
| De (unidade origem) * | select |
| Para (unidade destino) * | select |
| Fator * | decimal (ex: 1000 para kg→g) |

**Exemplo:** 1 kg → 1000 g (fator = 1000)

**Ações:** Adicionar conversão, excluir conversão

**Permissões:** ADMIN

**Dependências:** Nenhuma (deve ser populado antes de Ingredientes e Receitas)

---

## A-17 — Lista de Receitas

**Rota:** `/admin/receitas`
**Status:** 🔲 Planejado (Fase 3)

**Objetivo:** Gerenciar as receitas de produção com custo calculado.

**Campos exibidos por receita:**
- Nome
- Rendimento (`yieldQuantity` + `yieldUnit`)
- Tempo de preparo (`prepTimeMinutes`)
- Número de ingredientes
- Custo calculado (Σ ingredientes × preço atual ÷ rendimento)
- Produtos vinculados (contagem)
- Ativo

**Filtros:**
- Busca por nome
- Por ativo/inativo

**Ações:**
- Criar receita (→ A-18)
- Editar (→ A-18)
- Duplicar
- Desativar

**Permissões:** ADMIN

**Dependências:** Ingredientes e Unidades devem existir

---

## A-18 — Formulário de Receita

**Rota:** `/admin/receitas/nova` | `/admin/receitas/[id]`
**Status:** 🔲 Planejado (Fase 3)

**Objetivo:** Criar ou editar uma receita com ingredientes, quantidades e custo calculado em tempo real.

**Campos:**
- Nome *
- Descrição
- Rendimento: quantidade * + unidade * (ex: 1 bolo 25 cm, 30 unidades)
- Tempo de preparo (minutos)
- Ativo (toggle)
- **Editor de ingredientes (dinâmico):**
  - Ingrediente * (select com busca)
  - Quantidade *
  - Unidade * (select — compatível com a unidade do ingrediente via UnitConversion)
  - Custo parcial (calculado automaticamente)
  - Remover linha (botão ×)
  - Botão "Adicionar ingrediente"
- **Resumo de custo (somente leitura, atualizado em tempo real):**
  - Custo total da receita
  - Custo por unidade de rendimento

**Ações:**
- Salvar
- Cancelar
- Ver ingrediente (link para A-11)

**Permissões:** ADMIN

**Integrações:** Nenhuma

**Dependências:** Ingredientes com `currentPrice`, Unidades com `UnitConversion`

---

## A-19 — Lista de Clientes

**Rota:** `/admin/clientes`
**Status:** 🔲 Planejado (Fase 2)

**Objetivo:** Listar e pesquisar clientes cadastrados com dados de contato e métricas básicas.

**Campos exibidos por cliente:**
- Nome
- Telefone (chave de identificação)
- E-mail (se informado)
- Número de pedidos
- Valor total (LTV)
- Data do último pedido
- Tem nota interna (ícone)

**Filtros:**
- Busca por nome ou telefone
- Por período do último pedido

**Ações:**
- Ver perfil (→ A-20)
- Iniciar conversa no WhatsApp (link externo)

**Permissões:** ADMIN, ATENDIMENTO

**Dependências:** GET /api/admin/customers

---

## A-20 — Perfil do Cliente (Admin)

**Rota:** `/admin/clientes/[id]`
**Status:** 🔲 Planejado (Fase 2)

**Objetivo:** Ver histórico completo de um cliente e adicionar notas internas da equipe.

**Seções:**
1. **Dados do cliente:** nome, telefone, e-mail, data de cadastro
2. **Notas internas** (textarea editável — visível apenas para a equipe)
3. **Endereços salvos:** lista de Address com rótulo e endereço completo
4. **Histórico de pedidos:** tabela com data, número, itens, total, status
5. **Métricas:** total de pedidos, LTV, ticket médio, frequência

**Ações:**
- Editar notas internas
- Ver detalhe de pedido (link → A-05)
- Iniciar conversa no WhatsApp (link externo)

**Permissões:** ADMIN, ATENDIMENTO

**Dependências:** GET /api/admin/customers/[id]; GET /api/orders?customerId=

---

## A-21 — Visão Geral Financeira

**Rota:** `/admin/financeiro`
**Status:** 🔲 Planejado (Fase 7)

**Objetivo:** Painel financeiro com KPIs do período: receita, custos, margem e pendências.

**Campos exibidos:**
- Receita bruta do período (Σ pedidos entregues)
- CMV do período
- Margem bruta (%)
- Contas a pagar (total e vencidas)
- Contas a receber (total e vencidas)
- Saldo projetado do caixa
- Top 5 produtos mais vendidos

**Filtros:**
- Período (mês atual, mês anterior, personalizado)

**Ações:**
- Navegar para submódulos (links)
- Exportar relatório (Fase 9)

**Permissões:** ADMIN, FINANCEIRO

**Dependências:** Pedidos reais com `paymentStatus`, `costPrice` calculado

---

## A-22 — Contas a Pagar

**Rota:** `/admin/financeiro/pagar`
**Status:** 🔲 Planejado (Fase 7)

**Objetivo:** Listar e gerenciar obrigações financeiras da confeitaria.

**Campos exibidos:**
- Descrição, fornecedor, valor, vencimento, status (Pendente / Pago / Vencido)

**Filtros:**
- Por status, por vencimento, por fornecedor

**Ações:**
- Adicionar conta a pagar
- Marcar como pago
- Editar / excluir

**Permissões:** ADMIN, FINANCEIRO

---

## A-23 — Contas a Receber

**Rota:** `/admin/financeiro/receber`
**Status:** 🔲 Planejado (Fase 7)

**Objetivo:** Listar pedidos com pagamento pendente e valores esperados.

**Campos exibidos:**
- Pedido (número + cliente), valor, forma de pagamento, vencimento, status

**Filtros:**
- Por status de pagamento, por forma de pagamento, por vencimento

**Ações:**
- Marcar como recebido (atualiza `paymentStatus` do pedido)
- Ver detalhe do pedido (link → A-05)

**Permissões:** ADMIN, FINANCEIRO

---

## A-24 — Fluxo de Caixa

**Rota:** `/admin/financeiro/caixa`
**Status:** 🔲 Planejado (Fase 7)

**Objetivo:** Visualizar entradas, saídas e saldo por período com projeção.

**Campos exibidos:**
- Timeline de movimentações (entrada/saída)
- Saldo atual e saldo projetado
- Gráfico de barras por semana/mês

**Filtros:**
- Por período (semana, mês, trimestre)

**Ações:**
- Adicionar movimentação avulsa
- Exportar CSV

**Permissões:** ADMIN, FINANCEIRO

---

## A-25 — DRE (Demonstrativo de Resultado)

**Rota:** `/admin/financeiro/dre`
**Status:** 🔲 Planejado (Fase 7)

**Objetivo:** Demonstrativo mensal de resultado: receita → CMV → lucro bruto → despesas → lucro líquido.

**Campos exibidos:**
- Receita bruta
- Devoluções / cancelamentos
- Receita líquida
- CMV
- Lucro bruto
- Despesas operacionais (fixas + variáveis)
- EBITDA
- Lucro líquido

**Filtros:**
- Mês/ano

**Ações:**
- Exportar PDF/CSV

**Permissões:** ADMIN

---

## A-26 — Relatório de Vendas

**Rota:** `/admin/relatorios/vendas`
**Status:** 🔲 Planejado (Fase 9)

**Objetivo:** Análise de vendas por período, produto, categoria e canal.

**Campos exibidos:**
- Gráfico de vendas por dia
- Ranking de produtos por quantidade vendida
- Ranking por faturamento
- Breakdown por categoria
- Métodos de pagamento (pizza)
- Ticket médio por período

**Filtros:**
- Por período, por categoria, por produto, por tipo de entrega

**Ações:**
- Exportar CSV

**Permissões:** ADMIN, FINANCEIRO

---

## A-27 — Relatório de Custos

**Rota:** `/admin/relatorios/custos`
**Status:** 🔲 Planejado (Fase 9)

**Objetivo:** Análise de CMV, variação de custo de ingredientes e margem por produto.

**Campos exibidos:**
- CMV por período e por produto
- Ingredientes com maior impacto no custo
- Produtos com margem negativa (basePrice < costPrice)
- Variação de preço de ingredientes chave

**Filtros:**
- Por período, por ingrediente, por produto

**Permissões:** ADMIN, FINANCEIRO

---

## A-28 — Relatório de Estoque

**Rota:** `/admin/relatorios/estoque`
**Status:** 🔲 Planejado (Fase 9)

**Campos exibidos:**
- Ingredientes abaixo do mínimo
- Giro de estoque por ingrediente
- Perdas registradas no período
- Cobertura de estoque (dias restantes com base no consumo)

**Permissões:** ADMIN

---

## A-29 — Relatório de Clientes

**Rota:** `/admin/relatorios/clientes`
**Status:** 🔲 Planejado (Fase 9)

**Campos exibidos:**
- Novos vs. recorrentes por período
- LTV médio e distribuição
- Frequência de compra
- Top clientes por valor

**Permissões:** ADMIN

---

## A-30 — Configurações da Loja

**Rota:** `/admin/config`
**Status:** 🔲 Planejado (Fase 2)

**Objetivo:** Editar os parâmetros globais do negócio (StoreConfig).

**Campos:**
- Nome da loja *
- Raio de entrega gratuita (`freeDeliveryRadiusKm`) em km
- Custo de mão de obra por hora (`laborCostPerHour`) em R$
- Custos fixos mensais (`fixedCostMonthly`) em R$
- Unidades produzidas por mês (`monthlyProductionUnits`)
- Margem alvo (`targetMarginPercent`) em %
- Endereço da loja (para cálculo de distância de entrega)
- Coordenadas geográficas (latitude / longitude — preenchidas via geocodificação)

**Ações:**
- Salvar configurações (PATCH /api/admin/config)

**Permissões:** ADMIN

**Integrações:** Google Maps Geocoding (para converter endereço em coordenadas)

---

## A-31 — Tema Visual

**Rota:** `/admin/tema`
**Status:** 🔲 Planejado (Fase 2)

**Objetivo:** Personalizar a identidade visual da vitrine sem alterar código.

**Campos:**
- Cor primária (`primaryColor`)
- Cor secundária (`secondaryColor`)
- Cor de fundo (`backgroundColor`)
- Cor de destaque (`accentColor`)
- Logo (upload de imagem)
- Preview em tempo real (iframe ou simulação)

**Ações:**
- Salvar tema (PUT /api/admin/theme)
- Restaurar padrão

**Permissões:** ADMIN

**Integrações:** Supabase Storage (upload de logo)

---

## A-32 — Lista de Usuários da Equipe

**Rota:** `/admin/usuarios`
**Status:** 🔲 Planejado (Fase 2)

**Objetivo:** Gerenciar os membros da equipe com acesso ao sistema.

**Campos exibidos:**
- Nome, e-mail, papel (role), status (ativo/inativo), último login

**Ações:**
- Criar usuário (→ A-33)
- Editar (→ A-33)
- Ativar / Desativar
- Redefinir senha (envio de link por e-mail)

**Permissões:** ADMIN

**Dependências:** Nenhuma

---

## A-33 — Formulário de Usuário

**Rota:** `/admin/usuarios/novo` | `/admin/usuarios/[id]`
**Status:** 🔲 Planejado (Fase 2)

**Campos:**
- Nome *
- E-mail * (único no sistema)
- Papel * (ADMIN / ATENDIMENTO / PRODUCAO / FINANCEIRO)
- Senha * (somente criação; edição usa "redefinir senha")
- Ativo (toggle)

**Regras:**
- E-mail deve ser único
- Senha hash armazenada via bcrypt
- Não é possível excluir usuários — apenas desativar

**Permissões:** ADMIN

---

## Sumário de status das telas

| Tela | Rota | Status | Fase |
|------|------|--------|------|
| C-01 Vitrine | `/` | ✅ | 1 |
| C-02 Login Cliente | `/login` | ⚠️ | 1/8 |
| C-03 Checkout | `/checkout` | ✅ | 1 |
| C-04 Confirmação | (estado) | ✅ | 1 |
| C-05 Lista Pedidos | `/pedidos` | ✅ | 1 |
| C-06 Detalhe Pedido (Cliente) | `/pedidos/[id]` | 🔲 | 3 |
| A-01 Login Admin | `/admin/login` | ✅ | 1 |
| A-02 Painel | `/admin` | ⚠️ | 2 |
| A-03 Produção Kanban | `/admin/producao` | ⚠️ | 2 |
| A-04 Lista Pedidos Admin | `/admin/pedidos` | 🔲 | 2 |
| A-05 Detalhe Pedido Admin | `/admin/pedidos/[id]` | 🔲 | 2 |
| A-06 Lista Produtos | `/admin/produtos` | 🔲 | 2 |
| A-07 Form Produto | `/admin/produtos/[id]` | 🔲 | 2 |
| A-08 Categorias | `/admin/categorias` | 🔲 | 2 |
| A-09 Ocasiões | `/admin/ocasioes` | 🔲 | 2 |
| A-10 Lista Ingredientes | `/admin/insumos` | 🔲 | 3 |
| A-11 Form Ingrediente | `/admin/insumos/[id]` | 🔲 | 3 |
| A-12 Lista Fornecedores | `/admin/fornecedores` | 🔲 | 5 |
| A-13 Form Fornecedor | `/admin/fornecedores/[id]` | 🔲 | 5 |
| A-14 Lista Compras | `/admin/compras` | 🔲 | 5 |
| A-15 Form Compra | `/admin/compras/nova` | 🔲 | 5 |
| A-16 Unidades | `/admin/unidades` | 🔲 | 3 |
| A-17 Lista Receitas | `/admin/receitas` | 🔲 | 3 |
| A-18 Form Receita | `/admin/receitas/[id]` | 🔲 | 3 |
| A-19 Lista Clientes | `/admin/clientes` | 🔲 | 2 |
| A-20 Perfil Cliente | `/admin/clientes/[id]` | 🔲 | 2 |
| A-21 Financeiro Visão Geral | `/admin/financeiro` | 🔲 | 7 |
| A-22 Contas a Pagar | `/admin/financeiro/pagar` | 🔲 | 7 |
| A-23 Contas a Receber | `/admin/financeiro/receber` | 🔲 | 7 |
| A-24 Fluxo de Caixa | `/admin/financeiro/caixa` | 🔲 | 7 |
| A-25 DRE | `/admin/financeiro/dre` | 🔲 | 7 |
| A-26 Relatório Vendas | `/admin/relatorios/vendas` | 🔲 | 9 |
| A-27 Relatório Custos | `/admin/relatorios/custos` | 🔲 | 9 |
| A-28 Relatório Estoque | `/admin/relatorios/estoque` | 🔲 | 9 |
| A-29 Relatório Clientes | `/admin/relatorios/clientes` | 🔲 | 9 |
| A-30 Config Loja | `/admin/config` | 🔲 | 2 |
| A-31 Tema Visual | `/admin/tema` | 🔲 | 2 |
| A-32 Lista Usuários | `/admin/usuarios` | 🔲 | 2 |
| A-33 Form Usuário | `/admin/usuarios/[id]` | 🔲 | 2 |

**Total:** 33 telas — 5 implementadas ✅ | 3 parciais ⚠️ | 25 planejadas 🔲
