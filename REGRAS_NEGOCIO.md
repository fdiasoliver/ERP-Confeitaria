# REGRAS_NEGOCIO.md — Doce Menina

Fonte de verdade das regras de negócio do sistema.
Toda implementação futura deve respeitar este documento.
Regras não definidas estão marcadas como **A definir**.

Última revisão: baseada nos arquivos `prisma/schema.prisma`, `src/lib/types.ts` e código-fonte do MVP.

---

# 1. Objetivo do sistema

O sistema **Doce Menina** é um ERP voltado à gestão completa de uma confeitaria artesanal.
Abrange os domínios de vendas, produção, estoque, financeiro e relacionamento com clientes.

**Propósito principal:**
- Permitir que clientes realizem encomendas online com personalização
- Dar à equipe de produção visibilidade sobre o que produzir e quando
- Controlar insumos, receitas e custos de produção
- Automatizar comunicação com clientes via WhatsApp
- Gerar indicadores financeiros e operacionais para tomada de decisão

**O sistema não é:** um PDV de balcão (ponto de venda físico). É orientado a **encomendas com prazo**, não a vendas imediatas por impulso. Vendas balcão (sem prazo de produção) são **A definir**.

---

# 2. Tipo de negócio

O sistema é destinado a confeitarias artesanais de pequeno e médio porte com as seguintes características:

- Produção sob demanda (encomenda), com prazo mínimo por produto (`leadTimeDays`)
- Cardápio com produtos doces (bolos, docinhos, kits)
- Possibilidade futura de produtos salgados — **A definir**
- Produção própria com receitas cadastradas
- Atendimento principalmente via WhatsApp e canal digital
- Entrega local (raio configurável) ou retirada na loja
- Equipe pequena com papéis distintos (atendente, confeiteira, administrativo)

---

# 3. Entidades do sistema

## 3.1 Produto (`Product`)

Representa um item vendável do catálogo.

**Atributos obrigatórios:** nome, categoria, preço de venda (`basePrice`), prazo mínimo (`leadTimeDays`).

**Atributos calculados:** custo de produção (`costPrice`) — derivado das receitas vinculadas.

**Comportamento:**
- Todo produto pertence a exatamente **uma categoria**
- Todo produto pode estar associado a **zero ou mais ocasiões** (aniversário, casamento, etc.)
- Todo produto pode ter **zero ou mais receitas** vinculadas via `ProductRecipe`
- Produto inativo (`active: false`) não aparece na vitrine
- Produto marcado como `featured` aparece na seção de destaques da vitrine
- O preço de venda (`basePrice`) é definido manualmente — o sistema calcula o custo (`costPrice`) para comparação
- O `leadTimeDays` define o prazo mínimo de antecedência para encomenda do produto

## 3.2 Receita (`Recipe`)

Descreve o processo de produção de um produto.

**Atributos obrigatórios:** nome, rendimento (`yieldQuantity` + `yieldUnit`), lista de ingredientes com quantidades.

**Atributos opcionais:** descrição, tempo de preparo em minutos (`prepTimeMinutes`).

**Atributos não presentes no schema atual (A definir):** tempo de descanso, tempo de decoração.

**Comportamento:**
- Uma receita pode estar associada a múltiplos produtos via `ProductRecipe`
- Um produto pode ter **múltiplas receitas** (ex: massa + recheio + cobertura), cada uma com uma quantidade (`ProductRecipe.quantity`)
- O custo da receita é calculado automaticamente a partir dos preços atuais dos ingredientes
- Receita inativa (`active: false`) não pode ser usada em novos produtos

## 3.3 Ingrediente (`Ingredient`)

Representa uma matéria-prima usada nas receitas.

**Atributos obrigatórios:** nome, unidade de medida (`unit`), preço atual (`currentPrice`).

**Atributos opcionais:** categoria, estoque atual, estoque mínimo, fornecedor, código externo.

**Comportamento:**
- Todo ingrediente tem uma unidade de compra (ex: kg) e uma unidade de consumo nas receitas (ex: g), com conversão via `UnitConversion`
- O preço do ingrediente tem histórico completo (`IngredientPriceHistory`) com fonte (`MANUAL`, `CONAB_CEASA`, `CEPEA`, `NOTA_FISCAL`)
- Ingrediente inativo (`active: false`) não pode ser adicionado a novas receitas
- Alerta quando estoque atinge `minStock`
- **Estoque máximo:** A definir
- **Percentual de perda no uso:** A definir
- **Validade:** A definir
- **Controle por lote:** A definir

## 3.4 Categoria de produto (`ProductCategory`)

Agrupa produtos por tipo no catálogo — representa **"o que é o produto"**.
Distinto de `OccasionTag`, que representa "para qual situação o produto é vendido".

**Atributos:**

| Atributo | Tipo | Descrição |
|----------|------|-----------|
| `name` | `String @unique` | Nome exibido, máx. 100 chars |
| `slug` | `String @unique` | Identificador URL-amigável; gerado via `slugify(name)` na criação; **somente leitura após criação** |
| `sortOrder` | `Int @default(0)` | Ordem de exibição — **menor valor = exibido primeiro** |
| `color` | `String @default("#E8A598")` | Cor visual da categoria em hex; usada em chips e badges; valor padrão rose claro |
| `icon` | `String @default("package")` | Identificador Lucide React do ícone; exibido junto ao nome; valor padrão `package` |
| `isActive` | `Boolean @default(true)` | Controla visibilidade no catálogo |

**Regras:**
- Cada produto pertence a exatamente **uma** categoria (`categoryId` obrigatório)
- Categorias **não são removidas fisicamente** e **não possuem endpoint DELETE** — ciclo de vida restrito a ativar (`isActive = true`) e desativar (`isActive = false`)
- **Desativação bloqueada se a categoria possuir produtos vinculados** — `countProductsByCategory()` é executado antes de qualquer desativação; se o resultado for > 0, a operação é rejeitada com `CategoryHasProductsError`
- Categoria inativa: não aparece no catálogo; validator rejeita criação de novo produto com `categoryId` de categoria inativa
- `slug` é **somente leitura após a criação**: gerado automaticamente via `slugify(name)`, não é editável via UI nem via API — alterações de `name` não atualizam o slug

## 3.5 Ocasião (`OccasionTag`)

Tag de evento para filtragem de produtos na vitrine (ex: Aniversário, Casamento, Corporativo).

- Um produto pode ter zero ou mais ocasiões
- A relação é N:N via `ProductOccasion`
- Ocasiões não alteram preço nem produção — são apenas filtros de catálogo

### Decisão arquitetural — Relacionamento Product ↔ OccasionTag

**Registrado em Sprint 2.C.1 — 02/07/2026.**

O relacionamento `Product ↔ OccasionTag` utiliza **entidade de relacionamento explícita** (`ProductOccasion`):

- Atualmente a entidade `ProductOccasion` possui apenas as duas chaves estrangeiras: `productId` e `occasionId`
- A escolha foi deliberadamente arquitetural — não uma limitação técnica
- A estrutura foi preservada para permitir futuras evoluções sem migração destrutiva

**Exemplos de evoluções futuras previstas para `ProductOccasion`:**

| Campo futuro | Finalidade |
|---|---|
| `priority` (Int) | Ordenação da ocasião dentro do produto (destaque em campanhas) |
| `validFrom` (DateTime) | Início da vigência do vínculo produto × ocasião |
| `validUntil` (DateTime) | Fim da vigência (campanhas sazonais: Páscoa, Natal, Dia das Mães) |
| `campaignId` (String) | FK para futura entidade `Campaign` — campanhas promocionais |
| `createdAt` (DateTime) | Auditoria — quando o vínculo foi criado |
| `createdById` (String) | Auditoria — quem criou o vínculo |

**Restrição arquitetural:** `ProductOccasion` não poderá ser convertida para relacionamento implícito do Prisma sem aprovação arquitetural formal e publicação de nova ADR. Qualquer proposta de conversão deve ser submetida via processo de ADR definido em `PROJECT_GOVERNANCE.md` Seção 13.

## 3.6 Unidade de medida (`UnitOfMeasure`)

Define as unidades usadas em ingredientes e receitas (g, kg, ml, L, un, etc.).

- Cada unidade tem tipo: `mass` (massa), `volume`, `unit` (unidade contável)
- Conversões entre unidades são registradas em `UnitConversion` com fator multiplicador
- Exemplo: 1 kg = 1000 g → `factor = 1000` de kg para g

## 3.7 Cliente (`Customer`)

Pessoa física que realiza pedidos.

**Chave de identificação:** número de celular (`phone`), único no sistema.

**Atributos:** nome, celular, e-mail (opcional), anotações internas da equipe (`notes`), endereços.

**Comportamento:**
- O cliente é identificado e autenticado pelo celular via OTP enviado por WhatsApp
- Um cliente pode ter múltiplos endereços; um deles é o padrão (`isDefault`)
- A equipe pode registrar notas internas sobre o cliente (`notes`) — não visíveis ao cliente
- O histórico de pedidos é vinculado ao cliente pelo `customerId`

## 3.8 Endereço (`Address`)

Endereço de entrega do cliente.

- Vinculado a um cliente
- Pode ter rótulo (`label`) como "Casa", "Trabalho"
- Pode armazenar coordenadas geográficas (`latitude`, `longitude`) para cálculo de distância
- Um endereço pode ser marcado como padrão (`isDefault`)

## 3.9 Pedido (`Order`)

Registro completo de uma encomenda.

Detalhado na seção 12.

## 3.10 Item de pedido (`OrderItem`)

Linha de um pedido com produto, quantidade, preço e observação de personalização.

**Comportamento:**
- Armazena **snapshot** do nome e preço do produto no momento do pedido
- Alterações posteriores no produto não afetam pedidos já criados
- Cada item pode ter observação individual de personalização (`observation`)

## 3.11 Usuário interno (`User`)

Membro da equipe com acesso ao sistema.

**Papéis disponíveis:**
- `ADMIN` — acesso total a todos os módulos
- `ATENDIMENTO` — acesso a pedidos e clientes
- `PRODUCAO` — acesso ao dashboard de produção
- `FINANCEIRO` — acesso a módulos financeiros

**Comportamento:**
- Autenticação por e-mail e senha (hash armazenado)
- Usuário inativo (`active: false`) não pode fazer login
- Pedidos podem registrar quem os criou (`createdById`)

## 3.12 OTP (`OtpCode`)

Código de verificação enviado ao celular do cliente para autenticação.

- Tem prazo de validade (`expiresAt`)
- Registra quando foi usado (`usedAt`)
- Após uso ou expiração, não pode ser reutilizado

## 3.13 Log do WhatsApp (`WhatsAppLog`)

Registro de toda mensagem enviada ao cliente via WhatsApp.

- Vinculado opcionalmente a um pedido
- Registra sucesso ou falha do envio
- Armazena o template utilizado (ex: `"order_confirmed"`, `"order_ready"`)

## 3.14 Configuração da loja (`StoreConfig`)

Parâmetros globais do negócio, editáveis pelo ADMIN.

| Campo | Valor padrão | Descrição |
|-------|-------------|-----------|
| `freeDeliveryRadiusKm` | 3 km | Raio máximo para entrega gratuita |
| `laborCostPerHour` | R$ 35,00 | Custo da mão de obra por hora |
| `fixedCostMonthly` | R$ 0,00 | Custos fixos mensais (aluguel, energia, etc.) |
| `monthlyProductionUnits` | 200 | Unidades produzidas por mês (para rateio) |
| `targetMarginPercent` | 50% | Margem alvo de lucro |

## 3.15 Configuração de tema (`ThemeConfig`)

Identidade visual da loja (cores, logo). Editável pelo ADMIN.

## 3.16 Embalagem (`Packaging`)

Item físico usado para acondicionar/apresentar o produto final ao cliente (caixa, saquinho, fita, etiqueta, lacre) — não é matéria-prima consumida na produção do alimento em si.

**Atributos obrigatórios:** nome, custo unitário (`unitCost`).

**Atributos opcionais:** categoria (`PackagingCategory`), estoque atual, estoque mínimo, fornecedor (`supplierId`, FK única para `Supplier`).

**Comportamento:**
- Vincula-se ao **produto** (`Product`) via `ProductPackaging`, com quantidade sempre inteira — **não** se vincula à receita (`Recipe`). Ver **[ADR-014]** em `CLAUDE.md` e `MODULE_2H_PLANNING.md` para o detalhamento completo.
- Uma embalagem pode ser usada em zero ou mais produtos; um produto pode ter zero ou mais embalagens
- O custo da embalagem entra automaticamente no `costPrice` do produto: `Product.costPrice = Σ(custo das receitas) + Σ(custo das embalagens)`
- Toda alteração de custo gera registro em `PackagingPriceHistory` (nunca deletado)
- Embalagem inativa (`active: false`) não pode ser adicionada a novos vínculos com produto
- Estoque, categoria e desativação seguem o mesmo padrão já usado em `Ingredient`
- **Não existe** "embalagem composta" ou "kit de embalagens" como entidade própria — um produto pode ter múltiplos vínculos `ProductPackaging` (ex: caixa + fita + etiqueta), o que já resolve a composição
- **Múltiplos fornecedores por embalagem:** A definir (mesma lacuna do ERP inteiro — ver item 9 do Resumo Executivo)
- **Quantidade fracionária de embalagem (ex: fita por metro):** A definir — MVP trata toda quantidade de embalagem como inteira

## 3.17 Fornecedor

**A definir.** Não existe como entidade no schema atual.

Atualmente, fornecedor é apenas um campo texto no Ingrediente (`supplier: String?`).
Deverá ser promovido a entidade própria com CNPJ, contato, prazo de entrega, etc.

## 3.18 Compra / Entrada de estoque

**A definir.** Não existe no schema atual.

Deverá registrar: fornecedor, data, itens, quantidades, valores, lote e validade.

## 3.19 Conta financeira

**A definir.** Não existe no schema atual.

Deverá registrar: banco, tipo de conta, saldo inicial, movimentações.

---

# 4. Fluxo operacional

```
Compra de insumos (entrada de estoque)
         ↓
Cadastro de ingredientes com preço atualizado
         ↓
Cadastro de receitas (ingredientes + quantidades + rendimento)
         ↓
Cadastro de produtos (receitas + preço de venda + prazo)
         ↓
Precificação (custo calculado vs. preço praticado vs. margem)
         ↓
Cliente realiza encomenda (pedido com data futura)
         ↓
Pedido confirmado → notificação WhatsApp ao cliente
         ↓
Produção (ordem de produção, consumo de insumos)
         ↓
Produto pronto → notificação WhatsApp ao cliente
         ↓
Entrega ou retirada
         ↓
Pedido entregue → baixa automática no estoque (A definir)
         ↓
Financeiro (recebimento, fluxo de caixa, DRE)
         ↓
Relatórios e indicadores
```

---

# 5. Cadastro de produtos

## 5.1 Regras obrigatórias

- Todo produto deve ter: nome, categoria, preço de venda (`basePrice`), prazo mínimo (`leadTimeDays`)
- O prazo mínimo (`leadTimeDays`) representa o número de dias de antecedência necessários para produção
- Todo produto pertence a exatamente **uma** categoria
- O campo `costPrice` é calculado automaticamente a partir das receitas vinculadas e não deve ser editado manualmente
- Produto só aparece na vitrine quando `active: true`

## 5.2 Associações

- Um produto pode ter zero ou mais **ocasiões** para filtragem na vitrine
- Um produto pode ter zero ou mais **receitas** vinculadas via `ProductRecipe` com quantidade
- A existência de múltiplas receitas por produto permite modelar: massa, recheio, cobertura como receitas separadas

## 5.3 Regras ainda não definidas (A definir)

- Produto pode ser vendido por peso (ex: brigadeiro a granel)? Hoje só existe venda por unidade
- Produto pode ser parte de um kit com composição variável?
- Produto pode ter variações (tamanhos, sabores) sem ser cadastros separados?
- Produto pode ter preço diferente por canal (balcão vs. encomenda)?
- Produto pode ter estoque mínimo para produção antecipada?
- Produto pode ter imagem além do emoji (`imageUrl` existe no schema mas não há upload implementado)

---

# 6. Receitas

## 6.1 Estrutura obrigatória

Toda receita deve conter:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Nome | texto | Nome da receita |
| Rendimento (`yieldQuantity`) | decimal | Quantidade produzida por execução |
| Unidade de rendimento (`yieldUnit`) | texto | Ex: "bolo 25cm", "30 unidades", "1 kg" |
| Ingredientes | lista | Pelo menos 1 ingrediente |
| Quantidade por ingrediente | decimal | Quantidade usada por execução |
| Unidade por ingrediente | unidade | Deve ser compatível com a unidade do ingrediente |

## 6.2 Campos opcionais existentes no schema

- Descrição (`description`)
- Tempo de preparo em minutos (`prepTimeMinutes`)

## 6.3 Campos planejados mas ausentes no schema (A definir)

- Tempo de descanso (ex: bolo precisa resfriar antes de rechear)
- Tempo de decoração
- Dificuldade de execução
- Temperatura de armazenamento do produto final
- Shelf life (validade do produto acabado)

## 6.4 Cálculo de custo da receita

```
Custo total da receita =
  Σ (quantidade_ingrediente × preço_atual_por_unidade)

Custo unitário do produto =
  Custo total da receita ÷ yieldQuantity
```

**Regras:**
- O custo é sempre recalculado com base no `currentPrice` dos ingredientes
- Alterações de preço de ingrediente afetam o custo calculado de todos os produtos vinculados
- O custo calculado (`costPrice` no `Product`) é o ponto de partida para precificação, não o preço final

## 6.5 Conversão de unidades

Quando a unidade usada na receita difere da unidade de compra do ingrediente:
```
Quantidade consumida (unidade receita) × fator de conversão = quantidade em unidade de compra
```

Exemplo: receita usa 250 g de chocolate; ingrediente comprado em kg → 250 g × (1/1000) = 0,25 kg.

---

# 7. Ingredientes

## 7.1 Unidades

- Todo ingrediente tem uma **unidade base** de medida (`unit`)
- Conversões para outras unidades são registradas em `UnitConversion`
- A unidade de compra e a unidade de consumo na receita podem ser diferentes — a conversão resolve a diferença

## 7.2 Preço e histórico

- O campo `currentPrice` representa o preço atual de compra por unidade base
- Toda atualização de preço deve gerar um registro em `IngredientPriceHistory` com fonte:
  - `MANUAL` — inserido manualmente
  - `CONAB_CEASA` — importado de tabela CONAB/CEASA
  - `CEPEA` — importado de tabela CEPEA
  - `NOTA_FISCAL` — registrado a partir de nota fiscal de compra
- O preço histórico é usado para auditoria e análise de variação de custo

## 7.3 Estoque

- `stockQuantity` — quantidade atual em estoque
- `minStock` — alerta quando estoque atinge este valor
- **Estoque máximo:** A definir
- **Controle por lote com validade:** A definir
- **Percentual de perda no uso (quebra, evaporação):** A definir

## 7.4 Fornecedor

- Atualmente armazenado como campo texto (`supplier: String?`)
- **Entidade Fornecedor com cadastro completo:** A definir

## 7.5 Categorias de ingrediente

- `IngredientCategory` permite agrupar insumos (ex: Farinhas, Chocolates, Laticínios)
- Categoria de ingrediente é independente de categoria de produto

---

# 8. Embalagens

**Entidade ainda não implementada no schema** — blueprint funcional e arquitetural completo produzido na Sprint 2.H.0 (`MODULE_2H_PLANNING.md`). As regras abaixo estão definidas e aguardam apenas implementação (Sprints 2.H.1–2.H.7).

## 8.1 Regras definidas (Sprint 2.H.0)

- Embalagem tem categoria opcional (`PackagingCategory`, agrupamento livre — ex: "Caixas", "Saquinhos", "Fitas e Acabamento"), custo unitário (`unitCost`) e estoque (`stockQuantity`/`minStock`, sempre inteiro)
- Um produto pode ter **zero ou mais** embalagens vinculadas (`ProductPackaging`, cada uma com sua própria quantidade) — não um par fixo "padrão + presente"
- **O custo da embalagem compõe automaticamente o `costPrice` do produto:** `Product.costPrice = Σ(custo das receitas via ProductRecipe) + Σ(custo das embalagens via ProductPackaging)` — resolvida a pergunta "incluída no costPrice ou separada?": **incluída**
- Embalagem tem estoque controlado com estoque mínimo de reposição (alerta quando `stockQuantity <= minStock`, mesmo mecanismo de `Ingredient` — sem UI de alerta implementada em nenhum módulo do ERP ainda)
- Embalagem vincula-se ao **produto**, não à receita — **[ADR-014]**, `CLAUDE.md`

## 8.2 Ainda a definir (fora do escopo da Sprint 2.H.0 — Backlog Futuro em `MODULE_2H_PLANNING.md`)

- Escolha de embalagem alternativa pelo **cliente** no momento do pedido (ex: embalagem de presente com custo adicional)
- Múltiplos fornecedores por embalagem
- Quantidade fracionária de embalagem (ex: fita por metro)
- Controle de embalagem por lote/validade, embalagens retornáveis/reutilizáveis

---

# 9. Precificação

## 9.1 Fórmula de precificação

```
Preço de venda =
  Custo dos ingredientes (das receitas vinculadas)
  + Custo das embalagens (A definir)
  + Custo de mão de obra
  + Rateio de custos fixos
  + Taxas (cartão, plataforma)   (A definir)
  ÷ (1 − margem desejada)
```

## 9.2 Componentes detalhados

### Custo dos ingredientes
```
Σ (quantidade_usada × preço_atual) para cada ingrediente de cada receita
```

### Custo de mão de obra
```
tempo_de_preparo_minutos ÷ 60 × laborCostPerHour (StoreConfig)
```
- `laborCostPerHour` padrão: R$ 35,00/hora
- Tempo de decoração e descanso não estão no schema atual — **A definir**

### Rateio de custos fixos
```
fixedCostMonthly ÷ monthlyProductionUnits
```
- `fixedCostMonthly` padrão: R$ 0,00 (deve ser configurado pelo ADMIN)
- `monthlyProductionUnits` padrão: 200 unidades/mês

### Custo das embalagens
```
Σ (quantidade × unitCost) para cada embalagem vinculada ao produto (ProductPackaging)
```
Definido na Sprint 2.H.0 (`MODULE_2H_PLANNING.md`, ADR-014) — entra somado diretamente no `costPrice` do produto, no mesmo nível do custo das receitas. Aguardando implementação (Sprints 2.H.1–2.H.7); entidade `Packaging` ainda não existe no schema.

### Taxas de plataforma / cartão
**A definir.** Não existe configuração de taxas no schema atual.

### Margem desejada
```
targetMarginPercent (StoreConfig), padrão: 50%
```

Exemplo:
```
Custo total = R$ 40,00
Margem = 50%
Preço sugerido = R$ 40,00 ÷ (1 − 0,50) = R$ 80,00
```

## 9.3 Preço praticado vs. preço calculado

- `basePrice` (campo no `Product`) = preço de venda praticado, definido pelo ADMIN
- `costPrice` (campo no `Product`) = custo calculado automaticamente pelo sistema
- O sistema deve exibir os dois para comparação, sinalizando quando `basePrice < costPrice`

## 9.4 Regras

- O preço de venda nunca é alterado automaticamente — somente pelo ADMIN
- A queda de preço de um ingrediente deve recalcular `costPrice` automaticamente
- **Preço promocional por período:** A definir
- **Preço diferenciado por canal (online vs. balcão):** A definir
- **Desconto para revendedores ou pedidos em volume:** A definir

---

# 10. Produção

## 10.1 Fluxo de produção

```
Pedido confirmado
  → Ordem de produção gerada (manual ou automática)
  → Confeiteira executa a receita
  → Status do pedido: EM_PRODUCAO
  → Produto finalizado
  → Status do pedido: PRONTO
  → Entrega ou retirada
  → Status do pedido: ENTREGUE
```

## 10.2 Regras existentes (derivadas do schema)

- Toda mudança de status do pedido deve ser registrada em `OrderStatusHistory` com data/hora e notas
- O dashboard de produção (`/admin/producao`) consolida ingredientes necessários por data ("batch consolidation")
- A consolidação agrupa itens de múltiplos pedidos para produção em lote

## 10.3 Regras não definidas (A definir)

- **Ordem de produção formal:** existe como conceito mas não há entidade no schema
- **Consumo automático de estoque:** quando o status muda para `EM_PRODUCAO` ou `ENTREGUE`?
- **Produção parcial:** é possível marcar parte dos itens como produzidos?
- **Registro de perdas:** onde registrar ingrediente descartado por erro?
- **Reaproveitamento:** sobras de uma produção podem entrar em outra receita?
- **Rendimento real vs. esperado:** o sistema deve registrar a diferença?
- **Produção antecipada para estoque:** produto pode ser produzido antes de ter pedido?
- **Bloqueio de produção por falta de insumo:** deve o sistema alertar?

---

# 11. Estoque

## 11.1 Entradas

- **Compra de insumo:** aumenta `stockQuantity` do ingrediente
- **Ajuste manual:** ADMIN pode corrigir estoque com justificativa

## 11.2 Saídas

- **Uso em produção:** diminui `stockQuantity` proporcionalmente à receita × quantidade produzida
- **Registro de perda:** diminui estoque com justificativa (A definir)

## 11.3 Alertas

- O sistema deve alertar quando `stockQuantity <= minStock`

## 11.4 Regras não definidas (A definir)

- **Estoque máximo (`maxStock`):** não existe no schema
- **Controle de lote:** rastreabilidade por lote de compra
- **Controle de validade:** vencimento por lote com alerta de proximidade
- **Inventário periódico:** reconciliação entre sistema e contagem física
- **Bloqueio de produção por estoque insuficiente:** automático ou apenas alerta?
- **Estoque de produto acabado:** o sistema controla estoque de produto pronto (não apenas insumos)?
- **FIFO/FEFO:** política de saída de estoque (primeiro que entra/primeiro que vence sai primeiro)

---

# 12. Pedidos

## 12.1 Status e fluxo

```
RASCUNHO → CONFIRMADO → EM_PRODUCAO → PRONTO → SAIU_ENTREGA → ENTREGUE
                                                              ↘
                                              CANCELADO (de qualquer status anterior)
```

| Status | Significado |
|--------|-------------|
| `RASCUNHO` | Pedido iniciado mas não confirmado pelo cliente |
| `CONFIRMADO` | Cliente confirmou; aguardando início da produção |
| `EM_PRODUCAO` | Produção iniciada |
| `PRONTO` | Produto finalizado; aguardando entrega ou retirada |
| `SAIU_ENTREGA` | Produto em trânsito para entrega |
| `ENTREGUE` | Pedido concluído |
| `CANCELADO` | Pedido cancelado |

Toda mudança de status é registrada em `OrderStatusHistory` com data/hora e notas opcionais.

## 12.2 Tipos de entrega

| Tipo | Quem paga | Regra |
|------|-----------|-------|
| `RETIRADA` | Ninguém | Cliente retira na loja; sem custo de entrega |
| `ENTREGA_GRATIS` | Confeitaria | Até `freeDeliveryRadiusKm` (padrão: 3 km); confeitaria custeia |
| `ENTREGA_APP` | Cliente | Via Uber Entregas ou 99; taxa calculada pelo app; pago pelo cliente |

- A distância é verificada via Google Maps Distance Matrix API (integração futura)
- O campo `deliveryDistanceKm` no pedido armazena a distância calculada
- **Horário de coleta/entrega (`deliveryTimeSlot`):** existe no schema mas regras de faixa horária são **A definir**

## 12.3 Formas de pagamento

| Método | Quando pago | Status inicial |
|--------|-------------|---------------|
| `PIX_ONLINE` | No ato da confirmação | `PENDENTE` → `PAGO` via webhook |
| `PIX_ENTREGA` | Na entrega | `PENDENTE` |
| `DINHEIRO` | Na entrega ou retirada | `PENDENTE` |
| `CARTAO_CREDITO` | Na entrega ou retirada | `PENDENTE` |

- `paymentStatus` pode ser: `PENDENTE`, `PAGO`, `PARCIAL`, `ESTORNADO`
- PIX online tem `pixTxId` para rastreamento da transação
- **Pagamento em múltiplas formas no mesmo pedido:** A definir
- **Parcelamento no cartão:** A definir

## 12.4 Prazo mínimo de entrega

- Cada produto tem `leadTimeDays` (prazo mínimo de produção em dias corridos)
- A data mínima do pedido é calculada pelo maior `leadTimeDays` entre todos os itens do carrinho
- **Finais de semana não são dias de entrega:** se o prazo calculado cair em sábado, avança para segunda (+2 dias); se cair em domingo, avança para segunda (+1 dia). Implementado em `src/lib/utils.ts:getMinDeliveryDate`.
- **Horário de corte (cutoff time):** A definir (ex: pedidos após 18h contam a partir do dia seguinte)

## 12.5 Personalização

- O pedido pode ter uma observação geral (`orderNotes`)
- Cada item pode ter uma observação individual de personalização (`observation`)
- O cliente pode anexar fotos de referência (`OrderAttachment`): JPG, PNG, máximo 5 MB por foto
- **Número máximo de fotos por pedido:** A definir
- **Formatos aceitos além de JPG e PNG:** A definir

## 12.6 Encomenda

- Pedido realizado com antecedência mínima definida por `leadTimeDays`
- Confirmação por WhatsApp após validação pela atendente
- **Sinal/depósito para confirmar encomenda de alto valor:** A definir
- **Valor mínimo de pedido:** A definir

## 12.7 Cancelamento

- Pedido pode ser cancelado de qualquer status anterior a `ENTREGUE`
- O cancelamento deve ser registrado em `OrderStatusHistory`
- **Quem pode cancelar:** A definir (cliente, atendente, ADMIN?)
- **Prazo limite para cancelamento sem cobrança:** A definir
- **Cancelamento após início da produção (`EM_PRODUCAO`):** A definir

## 12.8 Reembolso

**Totalmente a definir.** O schema tem `paymentStatus = ESTORNADO` mas não há regras de reembolso.

- Condições para reembolso total: A definir
- Condições para reembolso parcial: A definir
- Meio de reembolso (PIX, crédito na conta): A definir
- Prazo de processamento: A definir

## 12.9 Venda balcão

**A definir.** O sistema é orientado a encomendas. Venda de produto imediato sem prazo de produção não está modelada.

---

# 13. Financeiro

## 13.1 Receitas

Originadas de:
- Pedidos com `paymentStatus = PAGO`
- Taxa de entrega cobrada ao cliente (`deliveryFee` quando `deliveryType = ENTREGA_APP`)

## 13.2 Despesas

- Compra de insumos (ingredientes)
- Compra de embalagens (A definir)
- Custos fixos mensais (`fixedCostMonthly` em `StoreConfig`)
- **Conta financeira para registro de despesas avulsas:** A definir

## 13.3 Fluxo de caixa

**A definir.** Não existe entidade de movimentação financeira no schema atual.

Deverá contemplar:
- Entradas (recebimentos de pedidos)
- Saídas (pagamentos a fornecedores, despesas operacionais)
- Saldo por período
- Previsão de entradas a partir de pedidos confirmados

## 13.4 Contas a pagar

**A definir.** Não existe no schema atual.

## 13.5 Contas a receber

Derivadas de pedidos com `paymentStatus = PENDENTE` e data de entrega futura.

## 13.6 Centro de custo

**A definir.** Não existe no schema atual.

## 13.7 CMV (Custo da Mercadoria Vendida)

```
CMV = Σ (costPrice × quantidade) de todos os itens de pedidos entregues no período
```

O `costPrice` dos produtos deve refletir o custo real no momento da produção — não o preço atual dos ingredientes. **Snapshot de custo por pedido:** A definir.

## 13.8 DRE (Demonstrativo de Resultado do Exercício)

**A definir.** Estrutura mínima esperada:

```
(+) Receita bruta de vendas
(-) Devoluções e cancelamentos
(=) Receita líquida
(-) CMV
(=) Lucro bruto
(-) Despesas operacionais (fixas + variáveis)
(=) EBITDA
(-) Impostos (A definir)
(=) Lucro líquido
```

## 13.9 Impostos

**A definir.** O sistema não contempla tributação atualmente.

---

# 14. Indicadores

## 14.1 Indicadores operacionais

| Indicador | Cálculo | Disponível hoje? |
|-----------|---------|-----------------|
| Pedidos por período | Contagem de `Order` por `deliveryDate` ou `createdAt` | Parcial (dados mock) |
| Itens produzidos por período | Soma de `OrderItem.quantity` | Parcial |
| Pedidos urgentes | Pedidos com `deliveryDate = hoje` e status ≠ `ENTREGUE`, `RASCUNHO` ou `CANCELADO` (redação ajustada na Sprint 2.K.1 — pedido ainda não confirmado ou já cancelado não é "urgente"; decisão do Product Owner) | ✅ Implementado (Módulo 2.K) |
| Prazo médio de produção | Média de dias entre `CONFIRMADO` e `PRONTO` | A definir |
| Taxa de cancelamento | Cancelados ÷ total de pedidos | A definir |

## 14.2 Indicadores financeiros

| Indicador | Cálculo | Disponível hoje? |
|-----------|---------|-----------------|
| Faturamento bruto | Σ `Order.total` de pedidos entregues | A definir |
| Ticket médio | Faturamento ÷ número de pedidos | A definir |
| CMV | Σ (`costPrice` × `quantity`) por pedido entregue | A definir |
| Margem bruta | (Faturamento − CMV) ÷ Faturamento | A definir |
| Lucro líquido | Receita líquida − todas as despesas | A definir |

## 14.3 Indicadores de catálogo

| Indicador | Cálculo | Disponível hoje? |
|-----------|---------|-----------------|
| Produtos mais vendidos | Ranking por `OrderItem.quantity` somada | A definir |
| Produtos mais lucrativos | Ranking por `(basePrice − costPrice) × quantidade` | A definir |
| Produtos com margem negativa | `basePrice < costPrice` | A definir |
| Receitas com custo elevado | Ranking de `costPrice` calculado | A definir |

## 14.4 Indicadores de clientes

| Indicador | Cálculo | Disponível hoje? |
|-----------|---------|-----------------|
| LTV (Lifetime Value) | Σ `Order.total` por cliente | A definir |
| Frequência de compra | Pedidos por cliente por período | A definir |
| Clientes novos vs. recorrentes | A definir | A definir |

## 14.5 Indicadores de estoque

| Indicador | Descrição | Disponível hoje? |
|-----------|-----------|-----------------|
| Estoque abaixo do mínimo | Ingredientes com `stockQuantity <= minStock` | Schema existe, UI não |
| Giro de estoque | Consumo médio mensal ÷ estoque atual | A definir |
| Desperdício | Perdas registradas por período | A definir |

---

# 15. Regras críticas

As regras abaixo **nunca devem ser violadas** em nenhuma implementação:

## 15.1 Pedidos

1. **Nunca excluir um pedido.** Pedidos podem ser cancelados, mas o registro permanece.
2. **Nunca alterar `OrderItem` após o pedido ser confirmado.** Os snapshots (`productName`, `unitPrice`, `totalPrice`) são imutáveis.
3. **Toda mudança de status deve ser registrada em `OrderStatusHistory`** com data/hora e usuário responsável.
4. **Nunca retroceder status** sem autorização de ADMIN (ex: `ENTREGUE` não pode voltar a `PRONTO`).
5. **Pedido com `paymentStatus = PAGO` nunca pode ser excluído.**

## 15.2 Financeiro

6. **Nunca apagar movimentações financeiras.** Apenas estorno com registro.
7. **Nunca alterar valor de pedido faturado sem aprovação do ADMIN** e registro de motivo.

## 15.3 Estoque

8. **Nunca permitir estoque negativo sem autorização explícita de ADMIN** com justificativa registrada.
9. **Toda saída de estoque deve ter origem rastreável** (pedido, perda, ajuste).

## 15.4 Receitas e custos

10. **Nunca alterar uma receita que está vinculada a pedidos em produção** sem registro de versão.
11. **`costPrice` do produto nunca é editado manualmente** — sempre calculado pelo sistema.
12. **Nunca deletar histórico de preços de ingredientes.**

## 15.5 Usuários e acesso

13. **Nunca expor senha ou hash de senha via API.**
14. **`OtpCode` expirado ou já utilizado nunca pode ser aceito.**
15. **Rotas `/admin/*` nunca devem ser acessíveis sem autenticação ativa.**
19. **Acesso às rotas `/api/admin/orders/**` (Kanban, mudança de status, consolidação) e à página `/admin/producao` é restrito a `ADMIN`, `ATENDIMENTO` e `PRODUCAO`** — união dos dois papéis por não existir hoje página separada entre "pedidos" (ATENDIMENTO) e "produção" (PRODUCAO), ambos servidos pela mesma `/admin/producao` (Seção 3.11). **Acesso às rotas `/api/admin/cmv/**` é restrito a `ADMIN` e `FINANCEIRO`.** `/admin/producao` também aceita `FINANCEIRO` (única página com dados de CMV hoje). As rotas de Catálogo (categorias, ocasiões, produtos) permanecem `ADMIN`-only — sem papel definido nesta seção, ver Seção 16. Ver ADR-021 em `CLAUDE.md`.
20. **Acesso às rotas `/api/admin/{units,ingredient-categories,ingredients,recipes,suppliers,packaging-categories,packagings}/**` e às páginas `/admin/unidades`, `/admin/ingredientes`, `/admin/receitas`, `/admin/fornecedores`, `/admin/embalagens` é restrito a `ADMIN` e `PRODUCAO`** — receitas, ingredientes, embalagens, unidades e fornecedores são insumos diretos do trabalho de quem produz. **Exceção:** `/api/admin/products/[id]/packagings/**` (vínculo Produto↔Embalagem) permanece `ADMIN`-only, mesmo sendo conceitualmente Cadeia Produtiva — a única UI que a consome é `/admin/produtos/[id]`, página de Catálogo (`ADMIN`-only, regra 19), sem caminho de uso real para `PRODUCAO` hoje. Ver ADR-022 em `CLAUDE.md`.

## 15.6 Dados do cliente

16. **Telefone do cliente é imutável após criação** (é a chave de identificação). Alteração exige processo especial com ADMIN.
17. **Anotações internas do cliente (`notes`) nunca são exibidas ao cliente.**
18. **Acesso a `/admin/clientes` e às rotas `/api/admin/customers/**` é restrito a `ADMIN` e `ATENDIMENTO`** (consistente com a Seção 3.11 — `ATENDIMENTO` tem acesso a pedidos e clientes). `PRODUCAO`/`FINANCEIRO` não têm acesso, incluindo às anotações internas (`notes`) — `ATENDIMENTO` tem acesso total a `notes`, sem redação condicional por campo. Ver ADR-020 em `CLAUDE.md`.

---

# 16. Regras pendentes (A definir)

As seguintes regras ainda precisam ser decididas e documentadas antes da implementação dos módulos correspondentes:

## Usuários e acesso
- Papel (`UserRole`) exigido nas rotas `/api/admin/**` de Catálogo (categorias, ocasiões, produtos) — hoje `ADMIN`-only por padrão herdado, sem regra de negócio que decida se outro papel deveria ter acesso. Levantado no planejamento da Sprint `PRIV.2` (03/08/2026), decisão explícita do Product Owner na Sprint `PRIV.3` (04/08/2026): manter `ADMIN`-only por ora, sem mudança. Cadeia Produtiva já decidida (`ADMIN`+`PRODUCAO`) — ver Seção 15.5, regra 20.
- `/api/admin/products/[id]/packagings/**` (vínculo Produto↔Embalagem) mantido `ADMIN`-only na Sprint `PRIV.3` por falta de UI que `PRODUCAO` possa usar (a única página, `/admin/produtos/[id]`, é `ADMIN`-only). Revisitar se `/admin/produtos/[id]` for desmembrado no futuro (ex.: aba de embalagens isolada da edição de Produto).

## Produtos e catálogo
- Produto pode ser vendido por peso (a granel)?
- Produto pode ter variações (tamanho, sabor) sem ser cadastros separados?
- Kit tem composição fixa ou o cliente pode personalizar os itens?
- Produto pode ter preço diferente por canal (online vs. balcão)?
- Imagem do produto: somente upload ou emoji também em produção?

## Receitas e produção
- Receita deve ter tempo de descanso e tempo de decoração separados de preparo?
- Como registrar e calcular percentual de perda de ingrediente (evaporação, quebra)?
- Produção antecipada para estoque é permitida?
- Como tratar reaproveitamento de sobras de produção?
- Versão de receita: ao alterar receita, pedidos antigos são afetados?

## Pedidos
- ~~Finais de semana contam como dias úteis no cálculo de prazo?~~ **Definido (Sprint C1):** sábado e domingo não são dias de entrega — prazo avança para segunda-feira automaticamente.
- Qual o horário de corte (cutoff) para pedidos do dia seguinte?
- Valor mínimo de pedido?
- Sinal/depósito obrigatório para encomendas acima de qual valor?
- Quem pode cancelar: apenas cliente, atendente ou ADMIN?
- Prazo limite para cancelamento sem cobrança: quantas horas antes?
- O que acontece com pedido cancelado após início de produção (cobrança parcial)?
- Entrega tem faixa horária definida ou é livre?
- Número máximo de fotos por pedido?
- Pagamento parcelado no cartão é aceito?
- Múltiplas formas de pagamento no mesmo pedido?

## Estoque
- Estoque máximo por ingrediente?
- Controle por lote (número de lote, validade por lote)?
- Política de saída: FIFO (primeiro a entrar) ou FEFO (primeiro a vencer)?
- Quando o consumo é baixado: ao confirmar pedido, ao iniciar produção ou ao entregar?
- Estoque de produto acabado é controlado pelo sistema?

## Embalagem
- ~~Embalagem compõe o custo do produto (`costPrice`) ou é lançada separadamente?~~ **Definido (Sprint 2.H.0):** compõe automaticamente — ver Seção 8.1 e `MODULE_2H_PLANNING.md`.
- ~~Embalagem tem estoque controlado com alerta de mínimo?~~ **Definido (Sprint 2.H.0):** sim, mesmo mecanismo de `Ingredient` — ver Seção 8.1.
- ~~Um produto pode ter múltiplas opções de embalagem (padrão + presente)?~~ **Definido (Sprint 2.H.0):** sim, zero ou mais vínculos livres via `ProductPackaging` — ver Seção 8.1.
- Escolha de embalagem alternativa pelo cliente no momento do pedido (Backlog Futuro — `MODULE_2H_PLANNING.md` Seção 11)
- Múltiplos fornecedores por embalagem (Backlog Futuro)
- Quantidade fracionária de embalagem, ex: fita por metro (Backlog Futuro)

## Financeiro
- Estrutura de contas bancárias a pagar e receber?
- Quais impostos incidem sobre as vendas?
- Centro de custo: por produto, por categoria, por canal de venda?
- DRE mensal/anual: quais despesas são incluídas?
- Snapshot do custo do produto no momento da produção (vs. custo atual)?

## Operacional
- Capacidade máxima de produção por dia (para bloquear novos pedidos)?
- Horário de funcionamento e dias de atendimento?
- Sistema suporta múltiplas unidades da confeitaria?
- Delivery terceirizado: integração com Uber Entregas/99 para rastreio em tempo real?

---

# Resumo executivo

## Inconsistências entre o sistema atual e as regras propostas

| # | Inconsistência | Impacto |
|---|----------------|---------|
| 1 | ~~`getMinDeliveryDate` não considera fins de semana~~ | ✅ Resolvido Sprint C1 — avança para segunda-feira |
| 2 | `STATUS_CLASS` no front-end não cobre todos os 7 valores de `OrderStatus` | Badges visuais quebrados para `RASCUNHO`, `SAIU_ENTREGA`, `CANCELADO` |
| 3 | ~~Checkout não salva os dados do formulário (MVP)~~ | ✅ Resolvido Sprint 0.6 — persistência real via `POST /api/orders` |
| 4 | `PaymentStatus` em `types.ts` diverge do `schema.prisma` (ver KI-17) | Integração PIX causará FK constraint violation |
| 4 | `loadFromOrder` descarta produtos inexistentes sem aviso | Usuário perde itens silenciosamente ao repetir pedido |
| 5 | `costPrice` no schema existe mas não é calculado em nenhum ponto do código | Precificação automática não está implementada |
| 6 | `Recipe.prepTimeMinutes` existe mas não é usado no cálculo de custo de mão de obra | Custo de mão de obra não está implementado |
| 7 | `fixedCostMonthly` e `monthlyProductionUnits` existem em `StoreConfig` mas nunca são lidos | Rateio de custos fixos não está implementado |
| 8 | ~~Embalagem não tem entidade no schema, mas a regra de negócio prevê custo de embalagem na precificação~~ | ✅ Regra de negócio definida na Sprint 2.H.0 (`MODULE_2H_PLANNING.md`, ADR-014); schema ainda não implementado — gap reduzido a "pendência de implementação", não mais "gap entre modelo e regras" |
| 9 | Fornecedor é apenas texto em `Ingredient.supplier` | Impossível controlar compras, prazo de entrega ou múltiplos fornecedores por insumo |
| 10 | Não há entidade de Compra/Entrada de estoque | Impossível rastrear de onde veio o insumo e a que preço foi adquirido |
| 11 | Não há modelo financeiro (contas, movimentações) | Todo o módulo financeiro — CMV, DRE, fluxo de caixa — está ausente |
| 12 | `UnitConversion` existe no schema mas não há UI para cadastro | Conversões de unidade não são administráveis |

## Lacunas críticas para produção

1. **Autenticação** — sem auth, qualquer pessoa acessa pedidos e painel admin
2. **Persistência de pedidos** — o checkout não salva nada no banco
3. **Módulo de produtos** — produto novo exige alteração de código (sem UI admin)
4. **Estoque** — não há controle de entrada/saída de ingredientes
5. **Financeiro** — zero implementado; sem visibilidade de custos e receitas

## Prioridade de definição das regras pendentes

**Alta (bloqueia desenvolvimento):**
- Dias úteis vs. corridos no prazo de produção
- Horário de corte para pedidos
- Regras de cancelamento e reembolso
- Consumo de estoque: quando é baixado automaticamente?

**Média (necessária para MVP completo):**
- ~~Embalagem: entidade própria ou campo no produto?~~ **Definido (30/06/2026, refinado ADR-014 20/07/2026):** entidade própria, vinculada ao produto — ver `MODULE_2H_PLANNING.md`.
- Snapshot de custo por pedido
- Capacidade máxima de produção por dia

**Baixa (crescimento futuro):**
- Variações de produto
- Múltiplas unidades
- Integração com rastreio de delivery
- Impostos
