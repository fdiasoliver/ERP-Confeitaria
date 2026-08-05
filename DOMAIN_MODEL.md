# DOMAIN_MODEL.md — Modelo de Domínio

Documento de referência para o modelo de dados do Doce Menina ERP.
Produzido na Sprint A1 — Revisão Arquitetural (29/06/2026).

---

## 1. Entidades e responsabilidades

### Domínio: Configuração

#### `StoreConfig`
**Propósito:** Parâmetros globais do negócio, editáveis pelo ADMIN sem alterar código.
**Atributos-chave:** name, freeDeliveryRadiusKm, laborCostPerHour, fixedCostMonthly, monthlyProductionUnits, targetMarginPercent, coordenadas da loja.
**Status:** Schema ✅ | API ❌ | UI ❌
**Regras:** Registro único. Alterações propagam automaticamente para cálculos de custo e precificação.

#### `ThemeConfig`
**Propósito:** Identidade visual da loja (cores, logo) configurável pelo ADMIN.
**Atributos-chave:** primaryColor, secondaryColor, backgroundColor, accentColor, logoUrl.
**Status:** Schema ✅ | API ❌ | UI ❌
**Regras:** Registro único. Paleta atual (cream/chocolate/rose/sage) é o estado inicial.

---

### Domínio: Pessoas

#### `User`
**Propósito:** Membro da equipe interna com acesso ao sistema administrativo.
**Atributos-chave:** name, email (único), passwordHash, role (ADMIN/ATENDIMENTO/PRODUCAO/FINANCEIRO), active.
**Status:** Schema ✅ | API parcial (NextAuth) ✅ | UI de gestão ❌
**Regras:** Senha armazenada como hash bcrypt. Usuário inativo não faz login. Role controla acesso aos módulos (não implementado no proxy ainda).

#### `Customer`
**Propósito:** Pessoa física que realiza encomendas.
**Chave de identificação:** phone (único, imutável após criação).
**Atributos-chave:** name, phone, email (opcional), notes (internos, nunca visíveis ao cliente).
**Status:** Schema ✅ | API parcial (upsert no POST /api/orders) ✅ | Auth OTP ❌ | UI admin ❌
**Regras:** Identificado pelo celular. OTP enviado por WhatsApp para autenticar. Notas internas não são exibidas ao cliente.

#### `OtpCode`
**Propósito:** Código de verificação temporário enviado ao celular do cliente para autenticação.
**Atributos-chave:** phone, code, expiresAt, usedAt (nullable).
**Status:** Schema ✅ | Backend ❌
**Regras:** Expirado ou já utilizado nunca pode ser aceito. customerId pode ser nulo (cliente ainda não existe no banco).

---

### Domínio: Catálogo

#### `ProductCategory`
**Propósito:** Agrupa produtos por tipo (Bolos, Doces, Kits).
**Atributos-chave:** name (único), slug (único), sortOrder.
**Status:** Schema ✅ | Seeded ✅ | API (via /api/products) ✅ | UI admin ❌

#### `OccasionTag`
**Propósito:** Tag de evento para filtragem na vitrine (Aniversário, Casamento, Corporativo...).
**Status:** Schema ✅ | Seeded ✅ | Frontend usa mock ⚠️ | UI admin ❌
**Regras:** Não alteram preço nem produção. Apenas filtros de catálogo.

#### `Product`
**Propósito:** Item vendável do catálogo com preço, prazo e receitas vinculadas.
**Atributos-chave:** name, categoryId, imageUrl (null atualmente), basePrice (manual), costPrice (calculado), leadTimeDays, active, featured.
**Status:** Schema ✅ | Seeded ✅ | API GET ✅ | UI admin ❌
**Regras:**
- basePrice é definido manualmente pelo ADMIN
- costPrice é calculado a partir das receitas (RecipeIngredient × currentPrice) — não implementado
- Produto inativo não aparece na vitrine
- leadTimeDays define prazo mínimo de antecedência

#### `ProductRecipe` (tabela de junção)
**Propósito:** Vincula receitas a produtos com quantidade (ex: 1 bolo usa 1x massa + 1x recheio).
**Status:** Schema ✅ | Sem uso no código ❌

#### `ProductOccasion` (tabela de junção)
**Propósito:** Associa produtos a ocasiões para filtragem.
**Status:** Schema ✅ | Seeded ✅ | Usado na API ✅

---

### Domínio: Receitas e Insumos

#### `Recipe`
**Propósito:** Processo produtivo de um item — ingredientes, quantidades, rendimento e custo calculado.
**Atributos-chave:** name, yieldQuantity, yieldUnit, prepTimeMinutes, items (RecipeIngredient[]).
**Status:** Schema ✅ | API ❌ | UI ❌
**Regras:** Custo calculado automaticamente (Σ quantidade × currentPrice por ingrediente ÷ yieldQuantity). Não pode ser editada se houver pedidos EM_PRODUCAO vinculados (versionamento futuro).

#### `RecipeIngredient`
**Propósito:** Linha de ingrediente dentro de uma receita com quantidade e unidade.
**Atributos-chave:** recipeId, ingredientId, quantity, unitId.
**Status:** Schema ✅ | API ❌ | UI ❌
**Regras:** Combinação (recipeId, ingredientId) é única.

#### `Ingredient`
**Propósito:** Matéria-prima usada nas receitas.
**Atributos-chave:** name, unitId, currentPrice, stockQuantity, minStock, supplier, externalCode.
**Status:** Schema ✅ | API ❌ | UI ❌
**Regras:** currentPrice tem histórico completo em IngredientPriceHistory. Alerta quando stockQuantity ≤ minStock. Inativo não pode ser adicionado a novas receitas.

#### `IngredientCategory`
**Propósito:** Agrupa ingredientes por tipo (Farinhas, Chocolates, Laticínios).
**Status:** Schema ✅ | API ❌ | UI ❌

#### `IngredientPriceHistory`
**Propósito:** Registro imutável de toda atualização de preço de ingrediente.
**Atributos-chave:** ingredientId, price, source (MANUAL/CONAB_CEASA/CEPEA/NOTA_FISCAL), recordedAt.
**Status:** Schema ✅ | API ❌ | UI ❌
**Regras:** Nunca deletar. Usado para auditoria e análise de variação de custo.

#### `UnitOfMeasure`
**Propósito:** Unidades usadas em ingredientes e receitas (g, kg, ml, L, un).
**Atributos-chave:** name, abbreviation (único), type (mass/volume/unit).
**Status:** Schema ✅ | API ❌ | UI ❌

#### `UnitConversion`
**Propósito:** Fator de conversão entre unidades (1 kg = 1000 g → factor = 1000).
**Status:** Schema ✅ | API ❌ | UI ❌

---

### Domínio: Embalagens

#### `Packaging`
**Propósito:** Controlar embalagens (caixas, saquinhos, fitas, etiquetas) como entidade própria, com cadastro, estoque, fornecedor e custo independentes dos ingredientes.
**Atributos-chave:** name, categoryId (opcional), unitCost, stockQuantity (Int), minStock (Int), supplierId (opcional), active.
**Status:** Schema ✅ | API ❌ | UI ❌
**Regras:** Vincula-se a `Product` via `ProductPackaging` — **não** a `Recipe`/`RecipeIngredient` (**[ADR-014]**, `CLAUDE.md` — supera a decisão original de 30/06/2026, que previa vínculo com `Recipe` e nunca foi implementada; o Módulo 2.I foi encerrado sem essa relação). Embalagem inativa não pode ser adicionada a novos vínculos. Quantidade sempre inteira, sem unidade de medida — decisão documentada em `MODULE_2H_PLANNING.md` Seção 2.6. Blueprint completo: `MODULE_2H_PLANNING.md`.

#### `PackagingCategory`
**Propósito:** Agrupa embalagens por tipo (ex: Caixas, Saquinhos, Fitas). Mirror de `IngredientCategory`.
**Status:** Schema ✅ | API ❌ | UI ❌
**Regras:** Delete físico bloqueado se houver embalagens vinculadas — mesmo padrão de `IngredientCategory`.

#### `PackagingPriceHistory`
**Propósito:** Registro imutável de alteração de custo de embalagem — versão simplificada de `IngredientPriceHistory` (sem `source`).
**Status:** Schema ✅ | API ❌ | UI ❌
**Regras:** Nunca deletar.

#### `ProductPackaging` (tabela de junção)
**Propósito:** Vincula embalagens a produtos com quantidade (Int) — mesmo padrão de `ProductRecipe`. Compõe `Product.costPrice` junto com o custo das receitas.
**Status:** Schema ✅ | Sem uso no código ❌ (Service ainda não implementado — Sprint 2.H.3)

---

### Domínio: Pedidos

#### `Order`
**Propósito:** Registro completo de uma encomenda do cliente.
**Atributos-chave:** orderNumber (auto, único), customerId, status, deliveryType, deliveryDate, addressId, receiverName, deliveryFee, subtotal, total, paymentMethod, paymentStatus, orderNotes.
**Status:** Schema ✅ | API completa (GET, POST, PATCH status) ✅ | UI (checkout + pedidos) ✅
**Regras críticas:**
- Nunca excluir um pedido. Apenas cancelar.
- Toda mudança de status registra OrderStatusHistory.
- Status não pode retroceder sem autorização ADMIN.
- Pedido com paymentStatus=PAGO nunca pode ser excluído.

#### `OrderItem`
**Propósito:** Linha de pedido com snapshot imutável do produto no momento da compra.
**Atributos-chave:** orderId, productId, productName (snapshot), quantity, unitPrice (snapshot), totalPrice (snapshot), observation.
**Status:** Schema ✅ | API ✅ | UI ✅
**Regras:** productName, unitPrice, totalPrice são imutáveis após o pedido ser confirmado.

#### `OrderStatusHistory`
**Propósito:** Log de auditoria de todas as mudanças de status de um pedido.
**Atributos-chave:** orderId, status, notes, changedAt.
**Status:** Schema ✅ | Gerado automaticamente na API ✅ | UI de visualização ❌

#### `OrderAttachment`
**Propósito:** Fotos de referência enviadas pelo cliente junto ao pedido.
**Status:** Schema ✅ | API ❌ | UI ❌ (placeholder no checkout)

---

### Domínio: Endereço

#### `Address`
**Propósito:** Endereço de entrega vinculado a um cliente.
**Atributos-chave:** customerId, label, street, number, complement, neighborhood, city, state, zipCode, latitude, longitude, isDefault.
**Status:** Schema ✅ | Criado automaticamente no POST /api/orders ✅ | UI de gestão ❌
**Nota:** Acumula sem deduplicação. A cada pedido com entrega, um novo Address é criado com label="Entrega". Quando o módulo de Clientes for implementado, esses endereços precisarão de agrupamento/deduplicação.

---

### Domínio: Comunicação

#### `WhatsAppLog`
**Propósito:** Registro de toda mensagem enviada ao cliente via WhatsApp.
**Atributos-chave:** orderId (opcional), phone, message, template, sentAt, success, error.
**Status:** Schema ✅ | API ❌ | Integração ❌
**Regras:** Registrar incluindo erros. Template identifica o tipo de mensagem (ex: "order_confirmed", "order_ready").

---

### Entidades Planejadas (ausentes no schema atual)

#### `Fornecedor` (Planejada — Fase 5)
**Propósito:** Cadastro completo de fornecedores de ingredientes e embalagens.
**Estado atual:** Apenas campo texto `supplier` em Ingredient.

#### `Compra` (Planejada — Fase 5)
**Propósito:** Registrar entradas de insumos — o que, de quem, quando, a que preço.
**Impacto:** Atualiza stockQuantity e registra em IngredientPriceHistory.

#### Entidades Financeiras (Planejadas — Fase 7)
- Conta bancária, movimentação financeira (entrada/saída), categoria de despesa.
- DRE, fluxo de caixa, contas a pagar/receber.

---

## 2. Diagrama de Relacionamentos

```
StoreConfig ─ singleton
ThemeConfig ─ singleton

User ──────────────────────────────────> Order (createdBy)

Customer ──┬─────────────────────────> Order (1:n)
           ├─────────────────────────> Address (1:n)
           └─────────────────────────> OtpCode (1:n)

Address ──────────────────────────────> Order (1:n via addressId)

Order ──┬──────────────────────────────> OrderItem (1:n)
        ├──────────────────────────────> OrderAttachment (1:n)
        ├──────────────────────────────> OrderStatusHistory (1:n)
        └──────────────────────────────> WhatsAppLog (1:n opcional)

Product ──┬────────────────────────────> OrderItem (1:n)
          ├── ProductOccasion ──────────> OccasionTag (N:N)
          ├── ProductRecipe ────────────> Recipe (N:N com quantidade)
          ├── ProductPackaging ─────────> Packaging (N:N com quantidade — ADR-014)
          └───────────────────────────> ProductCategory (N:1)

Packaging ──────────────────────────────> PackagingCategory (N:1 opcional)
Packaging ──────────────────────────────> Supplier (N:1 opcional)
Packaging ──────────────────────────────> PackagingPriceHistory (1:n)

Recipe ──────── RecipeIngredient ──────> Ingredient (N:N com quantidade+unidade)
RecipeIngredient ──────────────────────> UnitOfMeasure (N:1)
Ingredient ────────────────────────────> UnitOfMeasure (N:1)
Ingredient ────────────────────────────> IngredientCategory (N:1)
Ingredient ────────────────────────────> IngredientPriceHistory (1:n)
UnitOfMeasure ─── UnitConversion ──────> UnitOfMeasure (auto-referência)
```

---

## 3. Fluxo de dados por jornada

### Jornada do cliente: Realizar pedido

```
Cliente acessa / (Vitrine)
  → GET /api/products → Product[] (do banco)
  → Filtra por ocasião (OccasionTag via occasions[])
  → Adiciona ao carrinho (CartContext.addItem)
  → Abre CartDrawer → "Finalizar pedido" → /checkout

Cliente preenche /checkout
  → Seleciona data, tipo de entrega, endereço
  → Preenche dados do destinatário e observações
  → Seleciona forma de pagamento
  → "Confirmar pedido" → createOrder() → POST /api/orders

POST /api/orders (transação Prisma)
  → Customer.upsert (pelo phone)
  → Address.create (se entrega com endereço)
  → Order.create (com items e statusHistory inicial)
  → Retorna { id, orderNumber }

Cliente é redirecionado para /pedidos
  → useUserOrders(phone) → GET /api/orders?phone=
  → Lista pedidos com status e itens
```

### Jornada da equipe: Atualizar status de produção

```
Admin faz login em /admin/login
  → POST /api/auth/... (NextAuth CredentialsProvider)
  → Cria sessão com JWT
  → Redireciona para /admin

Admin acessa /admin/producao
  → (Atualmente: dados hardcoded)
  → (Futuro: GET /api/orders?status=CONFIRMADO&date=hoje)

Admin muda status de CONFIRMADO para EM_PRODUCAO
  → PATCH /api/orders/[id]/status { status: "EM_PRODUCAO" }
  → Valida VALID_TRANSITIONS[currentStatus]
  → Order.update + OrderStatusHistory.create (em transação)
  → (Futuro: WhatsApp.send template "order_in_production")
```

---

## 4. Comparativo: estado atual vs. proposta por entidade

| Entidade | Estado atual | Avaliação | Ação recomendada | Impacto |
|----------|-------------|-----------|-----------------|---------|
| StoreConfig | Schema OK, nunca lida | Melhorar | Criar GET /api/config pública | Médio |
| ThemeConfig | Schema OK, nunca lida | Melhorar | Ler no layout raiz | Baixo |
| User | Funcional (admin auth) | Correto | Adicionar proteção por papel no proxy | Médio |
| Customer | Schema OK, identidade é mock | Melhorar | Implementar OTP auth | Alto |
| Address | Funcional mas acumula | Melhorar | Deduplicar ao implementar módulo Clientes | Médio |
| OtpCode | Schema OK, sem backend | Faltando | Implementar fluxo OTP completo | Alto |
| UnitOfMeasure | Schema OK, sem UI | Faltando | CRUD admin de unidades | Baixo |
| UnitConversion | Schema OK, sem UI | Faltando | CRUD admin de conversões | Baixo |
| IngredientCategory | Schema OK, sem UI | Faltando | CRUD no módulo Insumos | Baixo |
| Ingredient | Schema completo, sem UI | Faltando | CRUD completo — módulo Insumos | Alto |
| IngredientPriceHistory | Schema OK, sem UI | Faltando | Histórico no módulo Insumos | Médio |
| Recipe | Schema completo, sem UI | Faltando | CRUD completo — módulo Receitas | Alto |
| RecipeIngredient | Schema OK, sem UI | Faltando | Parte do CRUD de Receitas | Alto |
| ProductCategory | Funcional (seeded, usado) | Correto | CRUD admin | Baixo |
| OccasionTag | Seeded, frontend usa mock | Melhorar | Buscar da API | Baixo |
| Product | API OK, imageEmoji diverge | Melhorar | Resolver imageEmoji vs imageUrl | Médio |
| ProductRecipe | Schema OK, sem lógica | Faltando | Usar no cálculo de costPrice | Alto |
| ProductOccasion | Funcional (seeded, usado) | Correto | Gerenciado junto a Produto | Baixo |
| Order | API completa | Correto | Vincular ao cliente real | Alto |
| OrderItem | Snapshot correto | Correto | Nenhuma ação necessária | — |
| OrderAttachment | Schema OK, sem UI | Faltando | Upload de fotos (Fase 8) | Baixo |
| OrderStatusHistory | Funcional (gerado na API) | Correto | Exibir na UI de detalhes do pedido | Baixo |
| WhatsAppLog | Schema OK, sem uso | Faltando | Implementar na Fase 8 | Alto |
| Packaging | Schema implementado (Sprint 2.H.1), sem Repository/Service/API/UI | Faltando | Repository+Validator (2.H.2), Service (2.H.3), API (2.H.4), Frontend (2.H.6) | Médio |
| Fornecedor | Campo texto em Ingredient | Refatorar | Entidade própria na Fase 5 | Médio |
| Compra/Estoque | Ausente | Faltando | Fase 5 | Alto |
| Financeiro | Ausente | Faltando | Fase 7 | Alto |
