# MODULES.md — Evolução de Módulos

Mapa de implementação de todos os módulos do ERP Doce Menina.
Produzido na Sprint A1 — Revisão Arquitetural (29/06/2026).

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Implementado e funcional |
| 🔲 | Planejado, não iniciado |
| ⚠️ | Parcialmente implementado (UI pronta, backend ausente) |
| ❌ | Ausente (sem plano imediato) |

---

## Fase 1 — Fundação (Sprints 0–0.6)

| Módulo | Objetivo | Status | Sprint | Dependências | Prioridade |
|--------|----------|--------|--------|-------------|-----------|
| API de Produtos | GET /api/products com dados reais | ✅ | 0.5 | Banco | — |
| API de Pedidos | POST/GET /api/orders | ✅ | 0.5–0.6 | Banco | — |
| API de Status | PATCH /api/orders/[id]/status | ✅ | 0.5 | Banco | — |
| Auth Admin | Login email/senha, proxy.ts | ✅ | 0.5 | NextAuth | — |
| Persistência de Pedidos | Checkout salva no banco com endereço real | ✅ | 0.6 | API Pedidos | — |
| /pedidos com dados reais | useUserOrders + API | ✅ | 0.6 | API Pedidos | — |
| Auth OTP Cliente | WhatsApp → OtpCode → Customer | ⚠️ Parcial (login funciona; OTP WhatsApp pendente) | Fase 8 | WhatsApp API | Alta |
| Dashboard Produção real | /admin/producao com dados do banco | ⚠️ UI pronta | Sprint 1 | API Pedidos | Alta |
| CRUD Admin Produtos | Criar, editar, ativar/desativar produtos | 🔲 | Fase 2 | — | Alta |
| Validação Checkout | Campos obrigatórios de endereço | ✅ | Sprint A2 | — | — |
| GET /api/config | Lê StoreConfig do banco | ✅ | Sprint A2 | — | — |
| Autorização por Papel | proxy.ts verifica UserRole por rota | ⚠️ Parcial (userType OK; ROLE_REQUIRED vazio) | Sprint 1 | — | Média |
| Upload de Imagem | Produto com imageUrl real | 🔲 | Fase 8 | Storage | Baixa |

---

## Fase 2 — Cadastros Base

| Módulo | Objetivo | Status | Dependências | Complexidade | Prioridade |
|--------|----------|--------|-------------|-------------|-----------|
| Módulo Clientes | Listagem, histórico, endereços salvos | 🔲 | Auth OTP | Média | Alta |
| CRUD Categorias | Admin de ProductCategory | 🔲 | CRUD Produtos | Baixa | Baixa |
| CRUD Ocasiões | Admin de OccasionTag | 🔲 | CRUD Produtos | Baixa | Baixa |
| Módulo Usuários | CRUD de User com papéis | 🔲 | Auth Admin | Média | Média |
| Configurações da Loja | UI para editar StoreConfig | 🔲 | GET /api/config | Média | Média |
| Tema Visual | UI para editar ThemeConfig | 🔲 | — | Baixa | Baixa |
| Vitrine: Ocasiões da API | Buscar OccasionTag da API | ✅ Sprint A2 | — | Baixa | — |

---

## Fase 3 — Receitas e Insumos

| Módulo | Objetivo | Status | Dependências | Complexidade | Prioridade |
|--------|----------|--------|-------------|-------------|-----------|
| CRUD Unidades | Gerenciar UnitOfMeasure e UnitConversion | 🔲 | — | Baixa | Alta |
| CRUD Ingredientes | Com preço, estoque, histórico | 🔲 | Unidades | Alta | Alta |
| CRUD Receitas | Com ingredientes, quantidades, rendimento | 🔲 | Ingredientes | Alta | Alta |
| Vínculo Produto-Receita | ProductRecipe com quantidade | 🔲 | Receitas, Produtos | Média | Alta |
| Cálculo de costPrice | Automático via receitas vinculadas | 🔲 | Receitas | Alta | Alta |
| Histórico de Preços | IngredientPriceHistory com fonte | 🔲 | Ingredientes | Média | Média |

---

## Fase 4 — Precificação

| Módulo | Objetivo | Status | Dependências | Complexidade | Prioridade |
|--------|----------|--------|-------------|-------------|-----------|
| Calculadora de Preço | Sugestão baseada em custo + margem | 🔲 | costPrice, StoreConfig | Média | Alta |
| Alerta de Margem Negativa | basePrice < costPrice → aviso visual | 🔲 | costPrice | Baixa | Alta |
| Histórico de Custo | Variação de costPrice por produto | 🔲 | costPrice | Média | Média |
| Impacto de Preço de Insumo | Recalcular todos os produtos ao mudar ingrediente | 🔲 | Receitas | Alta | Média |

---

## Fase 5 — Estoque e Compras

| Módulo | Objetivo | Status | Dependências | Complexidade | Prioridade |
|--------|----------|--------|-------------|-------------|-----------|
| CRUD Fornecedores | Entidade própria com CNPJ, contato | 🔲 | — | Média | Alta |
| Registro de Compras | Entrada de insumos com NF | 🔲 | Fornecedores | Alta | Alta |
| Baixa de Estoque | Automática ao confirmar produção | 🔲 | Compras, Receitas | Alta | Alta |
| Alertas de Mínimo | Notificação quando stockQuantity ≤ minStock | 🔲 | Estoque | Média | Média |
| Módulo Embalagens | CRUD de embalagem com estoque e custo | 🔲 | A definir | Alta | Média |

---

## Fase 6 — Produção

| Módulo | Objetivo | Status | Dependências | Complexidade | Prioridade |
|--------|----------|--------|-------------|-------------|-----------|
| Dashboard Produção real | Pedidos reais por data, Kanban funcional | ⚠️ | API Pedidos | Alta | Alta |
| Consolidação de Ingredientes | Agregar insumos necessários por data | 🔲 | Receitas, Estoque | Alta | Alta |
| Registro de Rendimento | Real vs. esperado por receita | 🔲 | Receitas | Média | Média |
| Notificação WhatsApp | order_confirmed, order_ready | 🔲 | WhatsApp API | Alta | Alta |
| Kanban funcional | Mover cards atualiza status via API | 🔲 | API Status | Média | Alta |

---

## Fase 7 — Financeiro

| Módulo | Objetivo | Status | Dependências | Complexidade | Prioridade |
|--------|----------|--------|-------------|-------------|-----------|
| Movimentação Financeira | Entidade de entrada/saída | 🔲 | — | Alta | Alta |
| Contas a Pagar | Compras a prazo, despesas fixas | 🔲 | Compras | Alta | Alta |
| Contas a Receber | Pedidos com pagamento pendente | 🔲 | Pedidos | Média | Alta |
| CMV | Calculado dos pedidos entregues | 🔲 | costPrice, Pedidos | Alta | Alta |
| Fluxo de Caixa | Entradas e saídas por período | 🔲 | Movimentações | Alta | Alta |
| DRE | Demonstrativo mensal | 🔲 | CMV, Despesas | Alta | Média |

---

## Fase 8 — Integrações

| Módulo | Objetivo | Status | Dependências | Complexidade | Prioridade |
|--------|----------|--------|-------------|-------------|-----------|
| PIX Integrado | Asaas/Mercado Pago + webhook | 🔲 | — | Alta | Alta |
| WhatsApp OTP | Envio de código de verificação | 🔲 | Z-API/Evolution | Alta | Alta |
| WhatsApp Notificações | Templates automáticos por status | 🔲 | WhatsApp OTP | Alta | Alta |
| Google Maps | Distância para cálculo de entrega | 🔲 | — | Média | Média |
| Upload de Imagens | Supabase Storage para produtos | 🔲 | — | Média | Média |
| CONAB/CEPEA | Importação de preços de ingredientes | 🔲 | Ingredientes | Alta | Baixa |

---

## Fase 9 — Dashboards e Relatórios

| Módulo | Objetivo | Status | Dependências | Complexidade | Prioridade |
|--------|----------|--------|-------------|-------------|-----------|
| Dashboard Executivo | KPIs em tempo real | 🔲 | Pedidos, Financeiro | Alta | Alta |
| Relatório de Vendas | Por período, produto, cliente | 🔲 | Pedidos | Média | Alta |
| Relatório de Custo | CMV, margem, variação de insumos | 🔲 | Financeiro | Alta | Média |
| Relatório de Estoque | Giro, cobertura, desperdício | 🔲 | Estoque | Média | Média |
| Indicadores de Clientes | LTV, frequência, novos vs. recorrentes | 🔲 | Clientes | Média | Baixa |

---

## Fase 10 — Escalabilidade e IA

| Módulo | Objetivo | Status | Dependências | Complexidade | Prioridade |
|--------|----------|--------|-------------|-------------|-----------|
| PWA Offline | Leitura do cardápio sem conexão | 🔲 | — | Alta | Baixa |
| Cache Estratégico | Listas e dashboards com TTL | 🔲 | — | Média | Baixa |
| Sugestão de Preço IA | Baseado em custo e mercado | 🔲 | Precificação | Alta | Baixa |
| Resumo Financeiro IA | Linguagem natural | 🔲 | Financeiro | Alta | Baixa |
| Alerta de Impacto de Insumo | Quando preço de ingrediente sobe | 🔲 | Precificação | Média | Média |
| Sugestão de Compra | Baseado em pedidos futuros | 🔲 | Estoque, Pedidos | Alta | Baixa |

---

## Módulos Descartados

Os seguintes módulos foram avaliados e explicitamente excluídos do escopo:

| Módulo | Justificativa |
|--------|--------------|
| Marketplace de produtos | Requer infraestrutura de e-commerce separada |
| App nativo (iOS/Android) | PWA cobre o caso inicial; app nativo só se validada necessidade real |
| Programa de fidelidade | Complexidade desproporcional ao valor no MVP |
| Multiempresa | Schema atual não tem isolamento por storeId |
| NF-e/SPED | Depende do regime tributário; requer parceiro fiscal |
| Open Finance | Alta regulamentação; fora do escopo financeiro inicial |
| Gestão de frota de entrega | Sistema integra com apps terceiros (Uber/99) |
| B2B/Atacado | Arquitetura diferente do modelo B2C atual |

---

## Dívida Técnica — Inventário

| ID | Problema | Arquivo(s) | Prioridade | Status | Bloqueia |
|----|----------|-----------|-----------|--------|---------|
| TD-01 | useCurrentUser retorna mock | src/hooks/useCurrentUser.ts | Alta | ✅ Sprint A2 | — |
| TD-02 | imageEmoji em types.ts vs imageUrl no Prisma | src/lib/types.ts, src/services/productService.ts | Média | ✅ Sprint A2 | — |
| TD-03 | OCCASIONS importadas de mock-data | src/app/page.tsx | Baixa | ✅ Sprint A2 | — |
| TD-04 | CATEGORY_NAMES hardcoded | src/app/page.tsx | Baixa | ✅ Sprint A2 | — |
| TD-05 | StoreConfig nunca lida | todos | Média | ✅ Sprint A2 | — |
| TD-06 | Autorização por papel ausente | src/proxy.ts | Média | ⚠️ Sprint A2 (parcial — userType verificado, roles não) | Segurança em produção |
| TD-07 | Address acumula sem deduplicação | src/app/api/orders/route.ts | Baixa | 🔲 Fase 2 | Módulo de Clientes |
| TD-08 | `any` em serviços | src/services/*.ts | Baixa | ✅ Sprint A2 | — |
| TD-09 | costPrice sempre 0 | prisma/seed.ts, src/app/api/* | Média | 🔲 Fase 3 | Módulo de Precificação |
| TD-10 | paymentStatus ausente no tipo Order | src/lib/types.ts | Baixa | ⚠️ Sprint A2 (tipo adicionado com valores errados — ver KI-17) | Módulo Financeiro |
| TD-11 | /admin/producao 100% mock | src/app/admin/producao/page.tsx | Média | 🔲 Sprint 1 | Operação real da produção |
| TD-12 | Sem validação de formulário no checkout | src/app/checkout/page.tsx | Média | ✅ Sprint A2 | — |
| TD-13 | getMinDeliveryDate ignora fins de semana | src/lib/utils.ts | Baixa | ⚠️ Sprint C1 (implementado; regra não formalizada) | — |
| TD-14 | WhatsApp/PIX ausentes | — | Alta | 🔲 Fase 8 | Operação real do negócio |
| TD-15 | MOCK_CUSTOMER no checkout | src/app/checkout/page.tsx | Alta | ✅ Sprint A2 | — |
| TD-16 | PaymentStatus diverge entre TypeScript e schema | src/lib/types.ts, prisma/schema.prisma | Alta | 🔲 Aberto (ver KI-17) | Integração PIX, módulo Financeiro |
| TD-17 | formatCurrency importado de mock-data | checkout, pedidos, CartDrawer, ProductCard | Baixa | 🔲 Aberto | Remoção progressiva de mock-data |
| TD-18 | `Supplier.leadTimeDays` sem limite superior no Validator — valor absurdo passa na validação e só falha no banco (overflow de `integer` do Postgres, retorna 500 em vez de 400) | src/lib/validators/supplierValidator.ts | Média | 🔲 Aberto (Hardening, não bloqueante — achado na Sprint 2.E.4) | — |
