# Schema do Banco de Dados — Confeitaria App

Documentação complementar ao `prisma/schema.prisma`.

## Diagrama de relacionamentos

```
StoreConfig / ThemeConfig (configuração global)

User (equipe) ──► Order (createdBy)

Customer (phone UNIQUE) ──► Address[] ──► Order
                        ──► Order[]
                        ──► OtpCode[]

UnitOfMeasure ◄── Ingredient ──► IngredientPriceHistory[]
              ◄── RecipeIngredient

Recipe ──► RecipeIngredient[] ──► Ingredient
       ──► ProductRecipe[] ──► Product

ProductCategory ◄── Product ──► ProductOccasion[] ──► OccasionTag
                              ──► OrderItem[]

Order ──► OrderItem[]
      ──► OrderAttachment[] (fotos de personalização)
      ──► OrderStatusHistory[]
      ──► WhatsAppLog[]
```

## Decisões de produto refletidas no schema

### Entrega (`DeliveryType`)

| Valor | Comportamento |
|-------|---------------|
| `RETIRADA` | Sem taxa (`deliveryFee = 0`) |
| `ENTREGA_APP` | Taxa estimada Uber/99; paga pelo cliente |
| `ENTREGA_GRATIS` | Se `deliveryDistanceKm <= StoreConfig.freeDeliveryRadiusKm` (padrão 3 km) |

Campos auxiliares: `deliveryDistanceKm`, coordenadas em `Address` e `StoreConfig`.

### Pagamento (`PaymentMethod` + `PaymentStatus`)

- `PIX_ONLINE` — checkout com integração (campo `pixTxId`)
- `PIX_ENTREGA`, `DINHEIRO`, `CARTAO_CREDITO` — pagamento na entrega/retirada

### Prazo por produto

- `Product.leadTimeDays` — dias mínimos de antecedência por produto
- No checkout: `deliveryDate` deve respeitar o **maior** `leadTimeDays` entre os itens

### Personalização (MVP)

- `OrderItem.observation` — texto livre por produto
- `Order.orderNotes` — considerações gerais do pedido
- `OrderAttachment` — fotos de referência (URLs no storage)

### Precificação

Cadeia: `Ingredient` → `Recipe` → `Product`

- `Ingredient.currentPrice` + histórico em `IngredientPriceHistory`
- `Product.costPrice` — calculado a partir das receitas vinculadas
- `Product.basePrice` — preço de venda
- `StoreConfig` — parâmetros globais (mão de obra/hora, margem alvo, rateio fixo)

### WhatsApp

- `WhatsAppLog` registra cada mensagem enviada (confirmação, produção, pronto, entregue)

## Índices principais

| Tabela | Índice | Uso |
|--------|--------|-----|
| `Customer` | `phone` | Login OTP e busca |
| `Order` | `deliveryDate, status` | Dashboard produção |
| `Order` | `customerId` | Meus pedidos |
| `IngredientPriceHistory` | `ingredientId, recordedAt` | Gráfico de preços |

## Variáveis de ambiente

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/confeitaria"
NEXTAUTH_SECRET="..."
ZAPI_TOKEN="..."          # WhatsApp (Z-API, Evolution, etc.)
PIX_API_KEY="..."         # Mercado Pago, Asaas, etc.
GOOGLE_MAPS_API_KEY="..." # Cálculo de distância para raio 3 km
```

## Comandos

```bash
npx prisma generate
npx prisma db push      # dev
npx prisma migrate dev  # produção
npx prisma studio       # visualizar dados
```
