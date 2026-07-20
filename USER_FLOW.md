# USER_FLOW.md — Fluxos de Usuário do Doce Menina

Documento de referência para todas as jornadas funcionais do sistema.
Produzido na Sprint P1 — Planejamento Funcional (29/06/2026).

Referências: telas documentadas em [SCREENS.md](SCREENS.md); menu em [MENU_STRUCTURE.md](MENU_STRUCTURE.md).

---

## Convenções

- `→` indica navegação ou transição de tela
- `[C-XX]` e `[A-XX]` referenciam telas do SCREENS.md
- `✅ Implementado` / `⚠️ Parcial` / `🔲 Planejado` indica o estado atual de cada passo
- Decisões do usuário aparecem como `? Condição → Caminho`

---

# Fluxos da Área Cliente

---

## F-C-01 — Descoberta e primeiro pedido

**Persona:** Ana, nova cliente
**Pré-condição:** Sem cadastro no sistema; chegou pelo Instagram

```
1. Ana acessa o site pelo celular                          [C-01] ✅
2. Vitrine carrega com produtos e chips de ocasião
3. Ana toca no chip "Aniversário" para filtrar             [C-01] ✅
4. Percorre os produtos filtrados
5. Toca no botão "+" do Bolo Mesversário                   [C-01] ✅
   → Toast de confirmação aparece ("Adicionado ao carrinho")
   → CartFab aparece com o total (R$ 195,00 × 1)
6. Toca em "+" novamente → CartFab atualiza (× 2)
7. Toca no CartFab → CartDrawer abre como bottom sheet     [C-01] ✅
8. Ajusta quantidade para 1 no CartDrawer
9. Toca em "Finalizar pedido"
   → Sistema verifica autenticação
   ? Não autenticada → redireciona para /login?callbackUrl=/checkout
10. [F-C-02] Fluxo de Login
11. Após login → redireciona para /checkout               [C-03] ✅
12. [F-C-03] Fluxo de Checkout
13. Pedido confirmado → exibe tela de confirmação          [C-04] ✅
14. Link "Ver meus pedidos" → /pedidos                     [C-05] ✅
```

---

## F-C-02 — Login do cliente

**Pré-condição:** Cliente não autenticado; tentando acessar área restrita

```
1. Acessa /login (ou é redirecionado com ?callbackUrl=)    [C-02] ⚠️
2. Passo 1: digita número de celular
3. Toca em "Continuar"
   → [Fase 8] Sistema envia OTP via WhatsApp
   → [Atual] Avança para campo de nome

4a. [Atual — sem OTP]
    Passo 2: digita nome completo
    Toca em "Entrar"
    → signIn("customer", { phone, name })
    → NextAuth cria/atualiza Customer no banco
    → Sessão JWT com phone + userType: "customer"
    → Redireciona para callbackUrl ou /pedidos

4b. [Fase 8 — com OTP WhatsApp]
    Passo 2: digita código de 6 dígitos recebido no WhatsApp
    ? Código correto e não expirado → login + redireciona
    ? Código expirado → "Código expirado. Reenviar?"
    ? Código incorreto → "Código incorreto. Tente novamente."
    ? Reenviar código → nova chamada à WhatsApp API; novo OtpCode criado
```

---

## F-C-03 — Checkout e criação do pedido

**Pré-condição:** Cliente autenticado; carrinho com pelo menos 1 item

```
1. Cliente abre /checkout                                  [C-03] ✅
   → Sistema carrega dados da sessão (nome e telefone) no formulário

2. Vê prazo mínimo do pedido (maior leadTimeDays dos itens)
3. Seleciona data de entrega (≥ data mínima calculada)

4. Seleciona tipo de entrega:
   ? RETIRADA       → campos de endereço ocultados
   ? ENTREGA_GRATIS → campos de endereço exibidos; taxa R$ 0
   ? ENTREGA_APP    → campos de endereço exibidos; taxa estimada

5. [Apenas para entregas] Preenche endereço:
   - Rua, Número, CEP (obrigatórios *)
   - Bairro (obrigatório *)
   - Complemento (opcional)
   - Nome e telefone de quem vai receber

6. Adiciona observação geral do pedido (opcional)
7. [Fase 8] Envia fotos de referência (upload — placeholder atual)
8. Adiciona observação por item (opcional, por produto)
9. Seleciona forma de pagamento:
   ? PIX_ONLINE     → [Fase 8] QR Code gerado após confirmação
   ? PIX_ENTREGA    → pago na entrega
   ? DINHEIRO       → pago na entrega/retirada
   ? CARTAO_CREDITO → pago na entrega/retirada

10. Revisa resumo (subtotal + entrega + total)

11. Toca em "Confirmar pedido" (ou "Confirmar e pagar com PIX")
    → Validação de campos de endereço (se entrega)
    ? Campos inválidos → exibe erro inline; não submete
    ? Campos válidos → POST /api/orders
      → Transação Prisma: Customer.upsert + Address.create + Order.create + OrderStatusHistory.create
      → Retorna { id, orderNumber }
    ? Erro de rede → exibe erro; botão reabilitado
    ? Sucesso → exibe tela de confirmação [C-04]

12. clearCart() chamado após sucesso
```

---

## F-C-04 — Acompanhamento de pedido

**Pré-condição:** Cliente autenticado; pedido já criado

```
1. Cliente acessa /pedidos                                 [C-05] ✅
   → GET /api/orders?phone={phone} via useUserOrders
   → Lista de pedidos em ordem cronológica inversa

2. Cliente vê pedido com badge de status colorido:
   CONFIRMADO  → rose
   EM_PRODUCAO → amber
   PRONTO      → sage
   SAIU_ENTREGA → blue (planejado)
   ENTREGUE    → sand
   CANCELADO   → cinza

3a. Pedido em andamento → botão "Pedir novamente"
    → CartContext.loadFromOrder(items sem observações)
    → Redireciona para / (vitrine)

3b. Pedido entregue → botão "Pedir e personalizar"
    → CartContext.loadFromOrder(items com observações)
    → Redireciona para /checkout

4. [Fase 3] Toca em "Ver detalhes" → /pedidos/[id]       [C-06] 🔲
   → Timeline de status com datas
   → Itens com observações individuais
   → Fotos de referência
   → Endereço e dados do destinatário
   ? Status = CONFIRMADO → exibe botão "Cancelar pedido"
     → Modal de confirmação
     → PATCH /api/orders/[id]/status { status: "CANCELADO" }

5. [Fase 8] Cliente recebe notificação WhatsApp ao mudar de status
```

---

# Fluxos da Área Admin

---

## F-A-01 — Login da equipe interna

**Pré-condição:** Usuário com registro ativo no banco (tabela `User`)

```
1. Acessa /admin (sem autenticação)                        → proxy redireciona
   → /admin/login?callbackUrl=/admin                       [A-01] ✅

2. Digita e-mail e senha
3. Toca em "Entrar"
   → POST /api/auth/... (NextAuth CredentialsProvider "credentials")
   → Verifica User.active = true
   → Compara senha com hash bcrypt
   ? Inválido → "E-mail ou senha incorretos"
   ? Ativo = false → "Usuário inativo. Contate o administrador."
   ? Válido → sessão JWT com { id, email, role, userType: "admin" }
   → Redireciona para callbackUrl (/admin)

4. Proxy verifica token.userType === "admin" em toda rota /admin/*
   Proxy verifica ROLE_REQUIRED[rota] para módulos restritos por papel
   ? Role insuficiente → /admin/em-construcao (placeholder)
```

---

## F-A-02 — Gestão de pedidos (atendente)

**Pré-condição:** Autenticado como ATENDIMENTO ou ADMIN

```
1. Acessa /admin/pedidos                                   [A-04] 🔲
   → GET /api/admin/orders com filtros padrão (hoje, todos os status)

2. Lista pedidos com badge de status e dados do cliente

3. Aplica filtros conforme necessário:
   - Por status: seleciona "CONFIRMADO" para ver novos pedidos
   - Por período: define range de datas
   - Por tipo de entrega
   - Busca por nome ou telefone do cliente

4. Toca em pedido para ver detalhe                         [A-05] 🔲
   → Exibe timeline de status, itens, endereço, pagamento

5a. Atualiza status do pedido:
    - Dropdown de status (transições válidas via VALID_TRANSITIONS)
    - Opcional: adiciona nota ao mudar status
    - Confirma → PATCH /api/orders/[id]/status
    → OrderStatusHistory.create automaticamente
    → [Fase 8] Notificação WhatsApp enviada ao cliente

5b. Cancela pedido:
    - Toca em "Cancelar pedido"
    - Modal: "Confirmar cancelamento?"
    - Adiciona motivo (texto)
    - Confirma → PATCH /api/orders/[id]/status { status: "CANCELADO", notes: motivo }

6. Marca pagamento como recebido:
   - Botão "Marcar como pago"
   - PATCH /api/orders/[id]/payment { paymentStatus: "PAGO" }
```

---

## F-A-03 — Dashboard de produção (confeiteira)

**Pré-condição:** Autenticada como PRODUCAO ou ADMIN

```
1. Acessa /admin/producao                                  [A-03] ⚠️
   → Aba padrão: "Hoje"
   → [Planejado] GET /api/admin/orders?date=hoje&status=CONFIRMADO,EM_PRODUCAO,PRONTO

2. Vê cards de estatísticas:
   - Total de pedidos do dia
   - Total de itens a produzir
   - Urgentes (entrega hoje, não entregue)

3. Seção "Urgente" (borda vermelha):
   - Pedidos com entrega hoje e status ≠ ENTREGUE
   - Ordenados por horário de entrega

4. Kanban com 4 colunas:
   CONFIRMADO → EM_PRODUCAO → PRONTO → ENTREGUE
   Cada card: número do pedido, cliente, itens e observações

5. Move card entre colunas:
   - [Planejado] Arrasta o card (drag-and-drop)
   - [Alternativa] Toca em botão de avançar status no card
   → PATCH /api/orders/[id]/status
   → Card move para próxima coluna
   → [Fase 8] Notificação WhatsApp ao cliente (se PRONTO ou SAIU_ENTREGA)

6. Seção "Consolidação de batch":
   - Ingredientes necessários para todos os pedidos do dia
   - [Planejado] Calculado: Σ (OrderItem.quantity × RecipeIngredient.quantity)
   - Agrupado por ingrediente com total e unidade

7. Muda de aba para ver pedidos de amanhã ou semana
   → [Planejado] Reconsulta API com ?date= correspondente

8. Aba Calendário:
   - [Fase 3.3] Visualização por semana com carga de pedidos por dia
   - Indica dias com sobrecarga
```

---

## F-A-04 — Cadastro de produto

**Pré-condição:** Autenticado como ADMIN; categorias e ocasiões já existem

```
1. Acessa /admin/produtos                                  [A-06] 🔲
   → Lista de produtos com status, custo e margem

2. Toca em "Novo produto"                                  [A-07] 🔲

3. Preenche dados básicos:
   - Nome, descrição, categoria, preço de venda, prazo mínimo
   - Ativo: sim/não; Destaque: sim/não

4. Faz upload de imagem (Fase 8) ou usa emoji fallback

5. Associa ocasiões (checkboxes múltiplos)

6. Adiciona receitas vinculadas:
   - Seleciona receita + quantidade
   - Sistema exibe custo calculado em tempo real
   - Adiciona mais receitas se necessário (ex: massa + recheio + cobertura)
   - Custo total = Σ (custo da receita × quantidade)

7. Revisa preço sugerido (custo ÷ (1 - margem%)) vs. preço praticado
   → Alerta visual se basePrice < costPrice (margem negativa)

8. Salva produto
   → POST /api/admin/products
   → Produto aparece na vitrine se active = true

9. [Alternativa] Editar produto existente:
   - Na lista, toca no produto → [A-07]
   - Edita campos desejados
   - PATCH /api/admin/products/[id]
   - Preço não é alterado automaticamente mesmo com mudança de custo
```

---

## F-A-05 — Cadastro de receita

**Pré-condição:** ADMIN; ingredientes e unidades já cadastrados

```
1. Acessa /admin/receitas                                  [A-17] 🔲

2. Toca em "Nova receita"                                  [A-18] 🔲

3. Preenche dados básicos:
   - Nome da receita
   - Rendimento: quantidade + unidade (ex: "1 bolo 25 cm" ou "30 brigadeiros")
   - Tempo de preparo em minutos (opcional)

4. Adiciona ingredientes (editor dinâmico):
   - Seleciona ingrediente (busca por nome)
   - Informa quantidade e unidade
     → Sistema verifica se existe UnitConversion para a unidade informada
     → Custo parcial = quantidade × (preço do ingrediente convertido para unidade base)
   - Repete para cada ingrediente

5. Sistema exibe em tempo real:
   - Custo total da receita
   - Custo por unidade de rendimento

6. Salva receita
   → POST /api/admin/recipes
   → costPrice dos produtos vinculados será recalculado

7. [Após salvar] Vincula receita a produto:
   - No formulário do produto [A-07], adiciona esta receita com quantidade
   - productService recalcula costPrice do produto
```

---

## F-A-06 — Gestão de ingredientes e estoque

**Pré-condição:** ADMIN; unidades de medida devem existir

```
1. Acessa /admin/insumos                                   [A-10] 🔲
   → Lista com indicadores de estoque baixo (⚠️)

2. Visualiza ingredientes abaixo do mínimo (destaque visual)

3a. Cadastra novo ingrediente:
    - Toca em "Novo ingrediente"                           [A-11] 🔲
    - Preenche: nome, categoria, unidade, preço atual, estoque mínimo
    - Salva → POST /api/admin/ingredients
    - IngredientPriceHistory criado com source: MANUAL

3b. Atualiza preço de ingrediente existente:
    - Abre ingrediente → edita campo preço
    - Salva → PATCH /api/admin/ingredients/[id]
    - IngredientPriceHistory criado com source: MANUAL
    - costPrice de todos os produtos vinculados via receitas é recalculado

3c. Visualiza histórico de preços:
    - Aba "Histórico" no formulário do ingrediente
    - Tabela com data, preço e fonte
    - Gráfico de variação

4. Consulta ingrediente para ver impacto:
   - Quais receitas usam este ingrediente?
   - Qual o impacto da mudança de preço nos produtos?
```

---

## F-A-07 — Registro de compra / entrada de estoque

**Pré-condição:** ADMIN; fornecedores e ingredientes cadastrados

```
1. Acessa /admin/compras                                   [A-14] 🔲

2. Toca em "Registrar compra"                              [A-15] 🔲

3. Preenche:
   - Fornecedor (select)
   - Data da compra
   - Número da nota fiscal (opcional)

4. Adiciona itens da compra (editor dinâmico):
   - Seleciona ingrediente
   - Informa quantidade comprada e unidade
   - Informa preço unitário pago
     → Sistema converte para unidade base se necessário
     → Custo total do item calculado

5. Revisa total da compra

6. Salva compra:
   → POST /api/admin/purchases
   → Para cada item:
     - Ingredient.stockQuantity += quantidade
     - IngredientPriceHistory.create { source: NOTA_FISCAL, price: preçoUnitário }
   → costPrice dos produtos afetados é recalculado

7. Alerta de estoque desaparece se stockQuantity > minStock
```

---

## F-A-08 — Análise financeira

**Pré-condição:** ADMIN ou FINANCEIRO; pedidos reais com `paymentStatus`; `costPrice` calculado

```
1. Acessa /admin/financeiro                                [A-21] 🔲
   → Cards com KPIs do mês atual

2. Navega pelo período (mês atual / anterior / personalizado)

3. Vê métricas:
   - Receita bruta = Σ total de pedidos ENTREGUES no período
   - CMV = Σ (costPrice × quantity) de todos os OrderItems dos pedidos entregues
   - Margem bruta = (Receita − CMV) / Receita × 100
   - Contas a pagar vencidas (alerta)
   - Contas a receber vencidas (alerta)

4. Acessa /admin/financeiro/receber                       [A-23] 🔲
   → Lista pedidos com paymentStatus = PENDENTE
   → Marca como recebido ao receber pagamento
   → PATCH /api/orders/[id]/payment

5. Acessa /admin/financeiro/pagar                         [A-22] 🔲
   → Lista despesas lançadas manualmente
   → Marca como pago + data de pagamento

6. Acessa /admin/financeiro/caixa                         [A-24] 🔲
   → Timeline de entradas e saídas
   → Saldo projetado com base em recebíveis confirmados

7. Acessa /admin/financeiro/dre                           [A-25] 🔲
   → Seleciona mês
   → Vê demonstrativo: Receita → CMV → Lucro Bruto → Despesas → EBITDA → Lucro Líquido
   → Exporta PDF
```

---

## F-A-09 — Gestão de clientes (atendente)

**Pré-condição:** Autenticado como ATENDIMENTO ou ADMIN

```
1. Acessa /admin/clientes                                  [A-19] 🔲
   → Lista de clientes com métricas básicas

2. Busca cliente por nome ou telefone

3. Toca no cliente → perfil                               [A-20] 🔲
   → Dados de contato
   → Endereços salvos
   → Histórico de pedidos (lista com links)
   → Métricas: LTV, pedidos, ticket médio
   → Notas internas (visíveis apenas para a equipe)

4. Adiciona ou edita nota interna:
   - Edita campo "Notas internas"
   - Salva → PATCH /api/admin/customers/[id] { notes }
   - Nota NÃO é exibida para o cliente em nenhuma circunstância

5. Navega para pedido do histórico → [A-05] Detalhe do pedido

6. Toca em "Abrir no WhatsApp" → link externo wa.me/55{phone}
```

---

## F-A-10 — Configurações do sistema

**Pré-condição:** Autenticado como ADMIN

### F-A-10a — Configurações da loja

```
1. Acessa /admin/config                                    [A-30] 🔲
2. Edita parâmetros:
   - Raio de entrega gratuita (km)
   - Custo de mão de obra (R$/h)
   - Custos fixos mensais (R$)
   - Unidades produzidas por mês
   - Margem alvo (%)
   - Endereço da loja
3. Salva → PATCH /api/admin/config
   → StoreConfig atualizado
   → Calculadora de preços e distância usarão novos valores
```

### F-A-10b — Tema visual

```
1. Acessa /admin/tema                                      [A-31] 🔲
2. Edita cores e logo
3. Preview em tempo real
4. Salva → PUT /api/admin/theme
   → ThemeConfig atualizado
   → CSS variables do front-end aplicados dinamicamente
```

### F-A-10c — Gestão de usuários

```
1. Acessa /admin/usuarios                                  [A-32] 🔲
2. Cria usuário:                                           [A-33] 🔲
   - Nome, e-mail, papel, senha
   - Salva → POST /api/admin/users
   → Senha armazenada como hash bcrypt
3. Edita papel (role) de usuário existente
4. Desativa usuário (toggle active = false)
   → Usuário não consegue mais fazer login
5. Reativa usuário (toggle active = true)
```

---

## F-A-11 — Gestão de unidades de medida

**Pré-condição:** ADMIN; deve ser feito ANTES de cadastrar ingredientes

```
1. Acessa /admin/unidades                                  [A-16] 🔲
2. Vê unidades existentes (g, kg, ml, L, un — seeded)
3. Cria nova unidade (se necessário):
   - Nome: "Colher de sopa"
   - Abreviação: "cs"
   - Tipo: volume
4. Adiciona conversão:
   - De: cs → Para: ml → Fator: 15
   → Sistema agora sabe que 1 cs = 15 ml para cálculos de receita
5. Edita ou exclui conversão (somente se sem uso em RecipeIngredient)
```

---

## F-A-12 — Gestão de fornecedores

**Pré-condição:** ADMIN (Fase 5)

```
1. Acessa /admin/fornecedores                              [A-12] 🔲
2. Cria fornecedor:                                        [A-13] 🔲
   - Nome, CNPJ, telefone, e-mail, prazo de entrega
3. Ao cadastrar compra [F-A-07], seleciona fornecedor pelo nome
4. Relatório de compras por fornecedor disponível em /admin/relatorios/estoque
```

---

## F-A-13 — Catálogo: categorias e ocasiões

**Pré-condição:** ADMIN; deve ser feito ANTES de cadastrar produtos

### Categorias

```
1. Acessa /admin/categorias                                [A-08] 🔲
2. Vê categorias existentes (seeded: Bolos, Doces, Kits)
3. Cria categoria: nome + slug + ordem de exibição
4. Edita ordem → afeta ordem na vitrine
5. Exclui (somente se sem produtos vinculados)
```

### Ocasiões

```
1. Acessa /admin/ocasioes                                  [A-09] 🔲
2. Vê ocasiões existentes (seeded: Aniversário, Casamento, etc.)
3. Cria ocasião: nome
4. Exclui (somente se sem produtos vinculados)
```

---

## F-A-14 — Relatórios

**Pré-condição:** ADMIN ou FINANCEIRO (Fase 9)

```
1. Relatório de vendas [A-26]:
   - Define período
   - Vê ranking de produtos, faturamento por categoria e ticket médio
   - Exporta CSV

2. Relatório de custos [A-27]:
   - Vê CMV e margem por produto
   - Identifica produtos com margem negativa (alerta)
   - Vê variação de custo de ingredientes chave

3. Relatório de estoque [A-28]:
   - Vê ingredientes abaixo do mínimo
   - Giro de estoque e cobertura em dias
   - Perdas registradas no período

4. Relatório de clientes [A-29]:
   - Novos vs. recorrentes por período
   - Top clientes por LTV
   - Frequência média de compra
```

---

## Mapa de transições de status do pedido

```
RASCUNHO
   ↓ (cliente confirma checkout)
CONFIRMADO
   ↓ (equipe inicia produção)
EM_PRODUCAO
   ↓ (produto finalizado)
PRONTO
   ↓ (saiu para entrega) ──────────→ ENTREGUE (retirada)
SAIU_ENTREGA
   ↓
ENTREGUE

De qualquer status anterior a ENTREGUE:
   ↓
CANCELADO
```

**VALID_TRANSITIONS (implementadas em `/api/orders/[id]/status`):**
```
RASCUNHO     → [CONFIRMADO, CANCELADO]
CONFIRMADO   → [EM_PRODUCAO, CANCELADO]
EM_PRODUCAO  → [PRONTO, CANCELADO]
PRONTO       → [SAIU_ENTREGA, ENTREGUE, CANCELADO]
SAIU_ENTREGA → [ENTREGUE, CANCELADO]
ENTREGUE     → []
CANCELADO    → []
```

---

## Mapa de notificações WhatsApp por evento (Fase 8)

| Evento | Template | Destinatário |
|--------|----------|-------------|
| Pedido criado (status: CONFIRMADO) | `order_confirmed` | Cliente |
| Status → EM_PRODUCAO | `order_in_production` | Cliente (opcional) |
| Status → PRONTO | `order_ready` | Cliente |
| Status → SAIU_ENTREGA | `order_out_for_delivery` | Cliente |
| Status → ENTREGUE | `order_delivered` | Cliente |
| Status → CANCELADO | `order_cancelled` | Cliente |
| Pagamento PIX confirmado | `payment_confirmed` | Cliente |
| OTP de login | `otp_code` | Cliente |
