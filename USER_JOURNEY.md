# USER_JOURNEY.md — Jornadas do Usuário: Doce Menina

Documento de referência para as jornadas completas por persona.
Produzido na Sprint P1 — Planejamento Funcional (29/06/2026).

Formato: narrativa contextual + fluxo textual. Sem imagens ou diagramas.
Referências: [USER_FLOW.md](USER_FLOW.md) | [SCREENS.md](SCREENS.md) | [MENU_STRUCTURE.md](MENU_STRUCTURE.md)

---

## Personas

| Persona | Perfil | Papel no sistema |
|---------|--------|-----------------|
| Ana | Cliente, 32 anos, mãe, usa smartphone | Cliente (area pública + /pedidos) |
| Carla | Atendente, 28 anos, gerencia pedidos e clientes | ATENDIMENTO |
| Marina | Confeiteira, 35 anos, executa a produção diária | PRODUCAO |
| Paulo | Dono da confeitaria, 45 anos, cuida do financeiro e estratégia | ADMIN |

---

# Jornada 1 — Ana: do Instagram ao primeiro pedido

## Contexto

Ana viu uma foto do bolo mesversário de uma amiga no Instagram. A amiga marcou a confeitaria. O bebê de Ana completa 6 meses em duas semanas e ela quer fazer algo especial.

---

### Passo 1: Descoberta

Ana toca no link da bio do Instagram e abre o site no celular.

```
→ Acessa /
→ Vitrine carrega com produtos em destaque
→ Vê categorias: Bolos, Doces & Docinhos, Kits & Coffee Break
→ Vê chips de ocasião: Todos | Aniversário | Casamento | Corporativo | Mesversário | Café | Degustação
```

Ana toca em "Mesversário" para filtrar. Dois bolos aparecem — exatamente o que ela viu na foto.

```
→ Produtos filtrados por OccasionTag "Mesversário"
→ Bolo Mesversário: R$ 195,00 · Prazo: 5 dias
→ Bolo Smash: R$ 220,00 · Prazo: 5 dias
```

---

### Passo 2: Adicionando ao carrinho

Ana toca no "+" do Bolo Mesversário. Um toast aparece: "Adicionado ao carrinho ✓". O CartFab aparece no canto inferior direito mostrando "R$ 195,00".

```
→ CartContext.addItem({ product: boloCaipira, quantity: 1 })
→ Toast: "Bolo Mesversário adicionado" (auto-dismiss 2s)
→ CartFab visível com total R$ 195,00
```

Ana resolve adicionar um kit de docinhos para o bolo ficar mais completo.

```
→ Toca em chip "Aniversário"
→ Explora kits
→ Adiciona "Kit Degustação 20 unidades": R$ 85,00
→ CartFab atualiza: R$ 280,00
```

---

### Passo 3: Revisando o carrinho

Ana toca no CartFab. O CartDrawer abre como bottom sheet, listando os dois itens.

```
→ CartDrawer exibe:
  - Bolo Mesversário × 1  → R$ 195,00
  - Kit Degustação 20 un  × 1  → R$ 85,00
  - Subtotal: R$ 280,00
→ Botão "Finalizar pedido"
```

---

### Passo 4: Login (primeiro acesso)

Ana toca em "Finalizar pedido". O sistema detecta que ela não está autenticada.

```
→ Redireciona para /login?callbackUrl=/checkout
→ Passo 1: campo de telefone
```

Ana digita o número de celular e toca em "Continuar".

```
[Atual — sem OTP]
→ Passo 2: campo de nome
→ Ana digita "Ana Figueiredo"
→ Toca em "Entrar"
→ signIn("customer", { phone: "11987654321", name: "Ana Figueiredo" })
→ NextAuth: Customer.upsert no banco
→ Sessão criada: { phone: "11987654321", userType: "customer" }
→ Redireciona para /checkout
```

```
[Fase 8 — com OTP WhatsApp]
→ Passo 2: campo de código OTP
→ Ana recebe mensagem no WhatsApp: "Seu código Doce Menina: 847392. Válido por 10 minutos."
→ Digita o código
→ Sistema valida OtpCode (não expirado, não usado)
→ Sessão criada
→ Redireciona para /checkout
```

---

### Passo 5: Checkout

Ana está no checkout. O formulário já exibe seu nome e telefone no campo "Quem vai receber".

```
→ /checkout carregado
→ receiverName: "Ana Figueiredo" (preenchido da sessão)
→ receiverPhone: "11987654321" (preenchido da sessão)
```

Ana configura o pedido:

```
1. Data de entrega:
   → Calendário exibe data mínima: daqui 5 dias (leadTimeDays = 5)
   → Ana seleciona o sábado da semana seguinte

2. Tipo de entrega: "Entrega gratuita (até 3 km)"
   → Campos de endereço aparecem

3. Preenche endereço:
   → Rua: Rua das Acácias
   → Número: 142
   → CEP: 04567-000
   → Bairro: Vila Madalena
   → Complemento: Apto 32

4. Observação geral: "Bolo para mesversário de 6 meses. Tema azul bebê."

5. Observação no item Bolo Mesversário: "Escrever: Bem-vindo ao mundo, Theo! 6 meses 💙"

6. Forma de pagamento: PIX na entrega

7. Revisa resumo:
   → Subtotal: R$ 280,00
   → Entrega: Grátis
   → Total: R$ 280,00

8. Toca em "Confirmar pedido"
   → Validação: endereço completo ✓
   → POST /api/orders
   → Transação: Customer.upsert + Address.create + Order.create + OrderItems + OrderStatusHistory
   → Retorna: { id: "uuid", orderNumber: 42 }
```

---

### Passo 6: Confirmação

```
→ Tela de confirmação exibida:
  "Pedido confirmado! ✅"
  "Pedido #42"
  "Você receberá uma confirmação no WhatsApp 11987654321"
→ [Fase 8] Ana recebe WhatsApp: "Olá Ana! Seu pedido #42 foi confirmado..."
```

---

### Passo 7: Acompanhamento

No sábado seguinte, Ana quer saber se o pedido está pronto. Abre o site.

```
→ Acessa /pedidos (sessão ainda ativa ou faz login novamente)
→ GET /api/orders?phone=11987654321
→ Vê pedido #42:
  Status: PRONTO (badge verde sage)
  Data de entrega: hoje

[Fase 8] Na verdade, Ana já tinha recebido WhatsApp às 14h:
  "Ana, seu pedido #42 está pronto! Entregamos hoje até as 18h. 🎂"
```

---

### Passo 8: Repetindo pedido (mesversário de 7 meses)

Um mês depois, Ana volta ao site para o mesversário de 7 meses.

```
→ Acessa /pedidos
→ Vê pedido #42 com status ENTREGUE
→ Toca em "Pedir e personalizar"
→ CartContext.loadFromOrder(items com observações)
→ Redireciona para /checkout com carrinho pré-carregado:
  - Bolo Mesversário × 1
  - Kit Degustação 20 un × 1
  - Observação mantida: "Escrever: Bem-vindo ao mundo, Theo! 6 meses 💙"
→ Ana edita a observação: "7 meses 💙"
→ Atualiza data de entrega
→ Confirma novo pedido
```

---

# Jornada 2 — Carla: gestão de pedidos no dia a dia

## Contexto

Carla é a atendente da Doce Menina. Segunda-feira de manhã, ela abre o sistema para verificar os novos pedidos e organizar a semana.

---

### Passo 1: Login e visão geral

```
→ Acessa /admin/login
→ Digita: carla@doceatelier.com.br / senha
→ Login via NextAuth CredentialsProvider
→ Sessão: { role: "ATENDIMENTO", userType: "admin" }
→ Proxy permite acesso (userType === "admin")
→ Redireciona para /admin
```

O painel exibe:
```
→ [Planejado] Cards de KPIs:
  - 3 pedidos novos (CONFIRMADO)
  - 2 pedidos para entrega hoje
  - 1 alerta: pagamento pendente há 3 dias
```

---

### Passo 2: Revisão de novos pedidos

```
→ Navega para /admin/pedidos
→ Filtra por status: CONFIRMADO
→ 3 pedidos aparecem

→ Abre pedido #47 (Ana Silva, entrega quinta-feira)
→ Vê detalhes:
  - Itens: Bolo Casamento × 1, Bem-casados 50 un × 2
  - Endereço: Av. Paulista, 1200, Bela Vista
  - Pagamento: PIX na entrega — PENDENTE
  - Observação: "Decoração branca e dourada. Escrita em cursiva."

→ Nenhum problema identificado
→ Não altera status (Marina move o pedido para EM_PRODUCAO quando iniciar)
```

---

### Passo 3: Confirmando pedido problemático

O pedido #48 tem a data de entrega para amanhã, mas o produto tem 5 dias de prazo.

```
→ Abre pedido #48
→ Vê: data de entrega = amanhã; leadTimeDays do produto = 5 dias
→ Entra em contato com a cliente por WhatsApp (link externo wa.me/55...)
→ Combina novo prazo
→ [Planejado] Edita data de entrega do pedido: PATCH /api/orders/[id] { deliveryDate: novaData }
→ Adiciona nota: "Data alterada após contato com cliente. Aprovado por whatsapp."
```

---

### Passo 4: Atualizar status manualmente

Carla liga para uma cliente que foi buscar o pedido.

```
→ Localiza pedido no painel de produção ou lista de pedidos
→ Status atual: PRONTO
→ Seleciona: ENTREGUE
→ Adiciona nota: "Retirado pessoalmente às 15h30"
→ Confirma → PATCH /api/orders/[id]/status { status: "ENTREGUE", notes: "..." }
→ OrderStatusHistory.create
→ [Fase 8] WhatsApp automático enviado à cliente
```

---

### Passo 5: Consulta ao perfil de cliente recorrente

Uma cliente liga reclamando que a última encomenda chegou atrasada. Carla acessa o perfil para verificar.

```
→ Acessa /admin/clientes
→ Busca por nome: "Maria Santos"
→ Abre perfil da cliente
→ Vê histórico: 4 pedidos; todos entregues; último com nota "entrega com 30min de atraso — trânsito"
→ Adiciona nota interna: "Cliente sensível a atrasos. Ligar 30 min antes da entrega."
→ Salva nota → PATCH /api/admin/customers/[id] { notes: "..." }
```

---

# Jornada 3 — Marina: produção do dia

## Contexto

Marina chega à cozinha às 7h. Antes de começar, abre o sistema no tablet para ver o que precisa produzir hoje.

---

### Passo 1: Dashboard de produção

```
→ Acessa /admin/producao via tablet
→ Aba "Hoje" ativa por padrão
→ [Planejado] Dados reais carregados via GET /api/admin/orders?date=hoje

→ Cards de estatísticas:
  - 4 pedidos para hoje
  - 12 itens no total
  - 1 urgente (entrega às 14h)
```

---

### Passo 2: Urgentes primeiro

```
→ Seção "Urgente" (borda vermelha):
  Pedido #45 — 14h — Retirada
  Itens: Bolo 4 anos chocolate × 1
  Obs: "Decoração safari. Topo com girafinha."
  [Fase 8] Fotos de referência (2 fotos)
```

Marina vê que precisa iniciar este bolo imediatamente.

```
→ Move o card #45 para coluna "Em produção"
→ PATCH /api/orders/45/status { status: "EM_PRODUCAO" }
→ [Fase 8] Cliente recebe WhatsApp: "Sua encomenda entrou em produção!"
```

---

### Passo 3: Consolidação de ingredientes

```
→ Seção "Consolidação (batch)" — para todos os pedidos do dia:

  Farinha de trigo          → 2,5 kg
  Manteiga                  → 800 g
  Chocolate meio amargo     → 1,2 kg
  Ovos                      → 24 unidades
  Leite condensado          → 6 latas
  Creme de leite            → 4 latas
  ...

→ [Planejado] Calculado via: Σ (OrderItem.quantity × RecipeIngredient.quantity) por ingrediente
```

Marina verifica o estoque e separa os ingredientes.

---

### Passo 4: Atualizando o Kanban ao longo do dia

```
11h30 → Bolo #45 finalizado
  → Move para "Pronto"
  → PATCH /api/orders/45/status { status: "PRONTO" }
  → [Fase 8] Cliente recebe WhatsApp: "Sua encomenda está pronta! Venha buscar."

13h → Bolo #47 iniciado
  → Move para "Em produção"

15h → Bolo #47 finalizado
  → Move para "Pronto"

16h → Entregador busca #47
  → Move para "Saiu para entrega" (via Carla no sistema)

18h → Confirmação de entrega #47
  → Move para "Entregue"
```

---

### Passo 5: Verificando amanhã

```
→ Marina toca na aba "Amanhã"
→ [Planejado] Recarrega dados: GET /api/admin/orders?date=amanhã
→ Vê 2 pedidos para amanhã
→ Verifica consolidação de ingredientes de amanhã
→ [Futuro] Sistema alerta: "Estoque de chocolate abaixo do mínimo para amanhã"
```

---

# Jornada 4 — Paulo: administração e análise do negócio

## Contexto

Paulo, dono da Doce Menina, quer entender a rentabilidade do negócio antes de lançar um novo produto. Tem 3 objetivos neste dia: cadastrar um novo bolo, ajustar o preço de um produto existente e analisar o mês financeiro.

---

### Passo 1: Cadastrando um novo produto

Paulo quer lançar um "Bolo Coroa de Flores".

```
→ Acessa /admin/produtos
→ Toca em "Novo produto"

→ Preenche dados básicos:
  Nome: Bolo Coroa de Flores
  Descrição: Bolo de baunilha com cobertura de chantilly e flores naturais comestíveis
  Categoria: Bolos
  Prazo mínimo: 7 dias (flores naturais precisam ser encomendadas)
  Destaque: Sim

→ Associa ocasiões: Casamento, Aniversário

→ Adiciona receitas:
  + Massa de baunilha × 1 → custo: R$ 18,50
  + Recheio chantilly × 1 → custo: R$ 12,00
  + Decoração flores naturais × 1 → custo: R$ 35,00
  Total custo calculado: R$ 65,50

→ Sistema exibe:
  Custo de produção: R$ 65,50
  Custo de mão de obra (2h × R$ 35,00): R$ 70,00
  Rateio custo fixo (R$ 2.000/200 un): R$ 10,00
  Custo total estimado: R$ 145,50
  Preço sugerido (margem 50%): R$ 291,00

→ Paulo define basePrice: R$ 280,00
→ Sistema alerta: ⚠️ Margem ligeiramente abaixo de 50% (margem real: 48%)
→ Paulo aceita o preço e salva

→ Torna produto ativo
→ Produto aparece na vitrine imediatamente
```

---

### Passo 2: Ajustando preço após mudança de insumo

Paulo recebe nota fiscal de nova compra de chocolate. O preço subiu 15%.

```
→ Acessa /admin/compras → "Registrar compra"
→ Fornecedor: Cacau Brasil
→ Item: Chocolate meio amargo
  → Quantidade: 5 kg
  → Preço unitário: R$ 28,00/kg (antes era R$ 24,00)
→ Salva compra

→ Sistema atualiza automaticamente:
  Ingredient.stockQuantity += 5 kg
  IngredientPriceHistory.create { price: 28.00, source: NOTA_FISCAL }
  Recalcula costPrice de todos os produtos com chocolate nas receitas

→ Paulo acessa /admin/produtos
→ Vê alertas: 3 produtos com margem negativa após recalculação
→ Abre cada produto e ajusta basePrice
```

---

### Passo 3: Análise financeira do mês

Final do mês. Paulo quer ver como foi junho.

```
→ Acessa /admin/financeiro
→ Seleciona período: junho/2026

→ Cards de KPIs:
  Receita bruta: R$ 8.400,00
  CMV: R$ 3.780,00
  Margem bruta: 55%
  Contas a receber vencidas: R$ 320,00 (2 pedidos)
  Contas a pagar vencidas: R$ 0,00

→ Toca em "A Receber" → /admin/financeiro/receber
→ Vê 2 pedidos com pagamento pendente
→ Liga para clientes
→ Marca como recebidos após confirmação
```

```
→ Acessa /admin/financeiro/dre
→ Seleciona: junho/2026
→ Vê DRE:

  (+) Receita bruta de vendas        R$ 8.400,00
  (-) Cancelamentos                  R$ 195,00
  (=) Receita líquida                R$ 8.205,00
  (-) CMV                            R$ 3.690,00
  (=) Lucro bruto                    R$ 4.515,00   (55,0%)
  (-) Despesas operacionais
      Aluguel + energia               R$ 1.500,00
      Embalagens                      R$ 320,00
      Plataforma digital              R$ 89,00
      Total despesas                  R$ 1.909,00
  (=) EBITDA                         R$ 2.606,00   (31,7%)
  (-) Impostos (A definir)           —
  (=) Lucro líquido estimado         R$ 2.606,00

→ Paulo exporta PDF para reunião com contador
```

---

### Passo 4: Configurando parâmetros para próximo mês

Paulo vai contratar mais uma confeiteira. O custo de mão de obra vai mudar.

```
→ Acessa /admin/config
→ Atualiza:
  laborCostPerHour: R$ 32,00 (antes R$ 35,00 — nova negociação)
  monthlyProductionUnits: 250 (antes 200 — nova capacidade)
  fixedCostMonthly: R$ 2.200,00 (antes R$ 2.000,00 — novo aluguel)

→ Salva
→ Sistema recalcula preços sugeridos de todos os produtos
→ Paulo revisa a lista de produtos para ver impactos
→ Ajusta prices onde necessário
```

---

## Resumo das jornadas

| Persona | Módulos principais | Frequência de uso |
|---------|-------------------|-------------------|
| Ana (cliente) | Vitrine, Login, Checkout, Pedidos | Mensal (encomendas) |
| Carla (atendente) | Pedidos Admin, Clientes, Produção (leitura) | Diária |
| Marina (confeiteira) | Produção Kanban | Diária |
| Paulo (admin/dono) | Todos — foco em Produtos, Financeiro, Configurações | Semanal/mensal |

## Pontos de contato críticos por persona

**Ana:**
1. Velocidade da vitrine no celular (3G)
2. Facilidade do login (OTP via WhatsApp)
3. Clareza dos campos de endereço no checkout
4. Confiança: número do pedido e confirmação por WhatsApp

**Carla:**
1. Filtros rápidos na lista de pedidos (status + data)
2. Acesso fácil ao histórico do cliente
3. Notificações ao cliente sem trabalho manual

**Marina:**
1. Visualização clara dos pedidos urgentes
2. Consolidação de ingredientes precisa
3. Facilidade de mover cards no Kanban (touch-friendly)
4. Acesso offline ou com sinal fraco (PWA — Fase 10)

**Paulo:**
1. Custo calculado automaticamente (sem planilha)
2. Alertas de margem negativa proativos
3. DRE confiável e exportável
4. Visão de impacto de mudança de preço de insumo em todos os produtos
