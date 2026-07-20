# VISION.md — Doce Menina

Referência estratégica de longo prazo do produto.
Toda decisão de desenvolvimento deve ser avaliada contra esta visão.

---

# 1. Visão do Produto

**Missão:** Ser o sistema de gestão mais completo e acessível para confeitarias artesanais brasileiras — do insumo ao faturamento, da receita ao cliente.

**Problema que resolve:**
Confeitarias artesanais operam majoritariamente no improviso. Preços são calculados no papel ou na intuição, receitas vivem em cadernos, o estoque é controlado visualmente, pedidos são gerenciados via WhatsApp sem rastreamento, e a lucratividade real nunca é conhecida. O resultado é uma operação financeiramente frágil, dependente da memória do proprietário e incapaz de crescer sem perder qualidade ou controle.

**Transformação que proporciona:**
O Doce Menina substitui planilhas, cadernos e grupos de WhatsApp por um único sistema integrado que conecta cada insumo comprado a cada receita produzida, a cada pedido entregue e a cada real gerado. O proprietário passa a tomar decisões baseadas em dados reais — custo real por produto, margem real por pedido, ingredientes que mais impactam o caixa — e a equipe opera com processos claros e rastreáveis.

---

# 2. Objetivo Principal

O sistema deverá evoluir para um **ERP completo especializado em confeitaria artesanal**, cobrindo sem exceção todas as áreas do negócio:

- **Operacional:** pedidos, produção, estoque, compras
- **Financeiro:** fluxo de caixa, CMV, DRE, contas a pagar e receber
- **Comercial:** catálogo, clientes, precificação, canais de venda
- **Estratégico:** indicadores, relatórios, inteligência artificial

O objetivo de longo prazo é que qualquer confeitaria artesanal possa instalar o sistema, configurar sua operação em horas, e ter visibilidade completa do negócio a partir do primeiro pedido registrado — sem necessidade de consultores, sem planilhas paralelas, sem retrabalho.

---

# 3. Público-Alvo

## 3.1 Proprietário

Dono ou sócio do negócio. Responsável pelas decisões estratégicas: formação de preço, contratação, investimentos, expansão.

**Precisa de:** visão financeira completa, indicadores de lucratividade, alertas de margem negativa, acesso a todos os módulos.

**Papel no sistema:** equivalente ao `ADMIN`.

## 3.2 Gerente

Responsável pela operação diária quando o proprietário não está presente. Coordena atendimento, produção e estoque.

**Precisa de:** visão consolidada de pedidos, produção do dia, estoque crítico e relatórios operacionais.

**Papel no sistema:** `ADMIN` com restrição a configurações financeiras sensíveis — **A definir**.

## 3.3 Confeiteiro (a)

Profissional responsável pela produção. Executa receitas, controla rendimento e qualidade.

**Precisa de:** lista de produção do dia, receitas detalhadas com quantidades, registro de rendimento real e perdas.

**Papel no sistema:** `PRODUCAO`.

## 3.4 Auxiliar de Produção

Executa tarefas de suporte: pesagem, separação de insumos, higienização, embalagem.

**Precisa de:** tarefas atribuídas, checklist de produção, acesso a receitas simplificadas.

**Papel no sistema:** sub-perfil de `PRODUCAO` — **A definir**.

## 3.5 Atendente

Responsável pelo relacionamento com o cliente: recebe pedidos, responde dúvidas, acompanha status de encomendas.

**Precisa de:** criação e edição de pedidos, histórico do cliente, status de produção, envio de mensagens via WhatsApp.

**Papel no sistema:** `ATENDIMENTO`.

## 3.6 Financeiro

Responsável pelas movimentações financeiras: contas a pagar, contas a receber, conciliação bancária, DRE.

**Precisa de:** módulo financeiro completo, relatórios de faturamento, CMV, fluxo de caixa.

**Papel no sistema:** `FINANCEIRO`.

## 3.7 Estoquista

Responsável pelo controle de entrada e saída de ingredientes e embalagens.

**Precisa de:** registro de compras, entrada de estoque por lote, alertas de mínimo, inventário periódico.

**Papel no sistema:** sub-perfil de estoque — **A definir**. Hoje não existe papel dedicado.

## 3.8 Administrador do Sistema

Configura o sistema: cadastros base, permissões de usuários, integrações, parâmetros globais.

**Precisa de:** módulo de configurações completo, gestão de usuários e papéis, logs de auditoria.

**Papel no sistema:** `ADMIN` com acesso irrestrito.

---

# 4. Problemas que o sistema resolve

| # | Problema | Como o sistema resolve |
|---|----------|----------------------|
| 1 | **Precificação incorreta** | Calcula custo real (ingredientes + mão de obra + fixos + embalagem + margem) automaticamente |
| 2 | **Falta de controle de estoque** | Rastreia entrada por compra e saída por produção; alerta de mínimo |
| 3 | **Perdas de ingredientes** | Registra desperdício por receita; compara rendimento real vs. esperado |
| 4 | **Produção desorganizada** | Dashboard Kanban com consolidação de ingredientes por data de entrega |
| 5 | **Compras sem planejamento** | Sugere compras baseado em pedidos futuros e estoque atual |
| 6 | **Fluxo de caixa desatualizado** | Registra entradas e saídas em tempo real; projeta saldo futuro com base em pedidos confirmados |
| 7 | **Baixa rentabilidade** | Expõe margem por produto, por categoria e por período; identifica produtos no prejuízo |
| 8 | **Falta de indicadores** | Dashboard com CMV, margem, ticket médio, produtos mais lucrativos e giro de estoque |
| 9 | **Retrabalho** | Pedido registrado uma vez flui automaticamente para produção, financeiro e WhatsApp |
| 10 | **Receitas não padronizadas** | Receitas digitais com ingredientes, quantidades, rendimento e custo calculado |
| 11 | **Pedidos perdidos no WhatsApp** | Canal de encomendas digital com histórico, status e notificações automáticas |
| 12 | **Dependência da memória do proprietário** | Toda informação centralizada, rastreável e acessível por qualquer dispositivo |

---

# 5. Objetivos do Negócio

1. **Reduzir desperdícios** — rastrear perdas de ingredientes e identificar onde a produção perde rendimento
2. **Automatizar processos** — notificações WhatsApp, cálculo de custo, consolidação de produção, alertas de estoque
3. **Melhorar a lucratividade** — expor margem real por produto e eliminar produtos com precificação abaixo do custo
4. **Facilitar decisões** — transformar dados operacionais em indicadores acionáveis para o proprietário
5. **Padronizar receitas** — garantir que qualquer profissional produza com a mesma qualidade e rendimento esperado
6. **Controlar custos** — conectar preço de insumos → custo de receita → custo de produto → preço de venda em cadeia automática
7. **Organizar a produção** — visibilidade do que produzir, quando, em que quantidade e com quais ingredientes
8. **Integrar informações** — eliminar ilhas de dados; um pedido gera reflexos em produção, estoque e financeiro automaticamente
9. **Escalar com segurança** — crescer em volume de pedidos sem perder rastreabilidade nem aumentar retrabalho

---

# 6. Princípios do Produto

1. **Simples primeiro.** Uma funcionalidade complexa que poucos usam vale menos que uma funcionalidade simples que todos usam.
2. **Cada dado tem uma única fonte de verdade.** Preço de ingrediente em um lugar; custo de receita calculado; custo de produto derivado. Nenhuma duplicidade.
3. **O sistema trabalha para o usuário, não o contrário.** Lançamentos automáticos sempre que possível; manual apenas quando inevitável.
4. **Rápido para quem está na cozinha.** Registrar produção deve levar segundos, não minutos.
5. **Dados reais, não estimativas.** O sistema deve sempre mostrar o custo real calculado, não um valor fixo digitado.
6. **Rastreabilidade total.** Todo pedido, toda movimentação de estoque, toda mudança de status deve ter data, hora e responsável.
7. **Progressivo.** Funciona com poucos dados e melhora conforme o usuário alimenta o sistema. Não bloqueia o uso por falta de configuração completa.
8. **Móvel primeiro.** O atendente usa no celular, o confeiteiro usa no tablet. A tela pequena é o caso principal, não a exceção.

---

# 7. Arquitetura Funcional

## 7.1 Cadastros Base

**Propósito:** Manter as tabelas de referência que alimentam todos os outros módulos.

Inclui: unidades de medida, categorias de produto, categorias de ingrediente, ocasiões, configurações da loja (`StoreConfig`), configuração de tema (`ThemeConfig`).

**Status atual:** Schema Prisma completo. UI de administração ausente (exceto configuração visual).

---

## 7.2 Produtos

**Propósito:** Gerenciar o catálogo de itens vendáveis — preço, prazo, categoria, ocasião, imagem e receitas vinculadas.

Inclui: CRUD de produtos, vinculação de receitas via `ProductRecipe`, cálculo automático de `costPrice`, controle de `active` e `featured`.

**Status atual:** Produtos existem apenas como dados mock em `src/lib/mock-data.ts`. Sem UI de administração.

---

## 7.3 Receitas

**Propósito:** Documentar o processo produtivo de cada item — ingredientes, quantidades, rendimento, tempo de preparo e custo calculado.

Inclui: CRUD de receitas, lista de ingredientes com unidades e quantidades, cálculo automático de custo, vínculo com produtos via `ProductRecipe`.

**Status atual:** Schema Prisma completo (`Recipe`, `RecipeIngredient`). Sem UI implementada.

---

## 7.4 Ingredientes

**Propósito:** Controlar as matérias-primas — preço atual, histórico de preços, estoque, fornecedor e categoria.

Inclui: CRUD de ingredientes, atualização de preço com registro em `IngredientPriceHistory`, alerta de estoque mínimo, importação de preços externos (CONAB, CEPEA, Nota Fiscal).

**Status atual:** Schema Prisma completo. Sem UI implementada.

---

## 7.5 Embalagens

**Propósito:** Controlar itens de embalagem (caixas, saquinhos, fitas, tags) como insumos com custo e estoque próprios.

Inclui: CRUD de embalagens, estoque, custo unitário, vínculo com produtos para composição do custo total.

**Status atual:** Entidade não existe no schema atual. Planejada como módulo futuro.

---

## 7.6 Fornecedores

**Propósito:** Cadastrar e gerenciar fornecedores de ingredientes e embalagens.

Inclui: CNPJ, razão social, contato, prazo de entrega, histórico de compras, avaliação.

**Status atual:** Existe apenas como campo texto em `Ingredient.supplier`. Entidade própria não implementada.

---

## 7.7 Compras

**Propósito:** Registrar entradas de insumos — o que foi comprado, de quem, quando, a que preço e em que quantidade.

Inclui: ordem de compra, recebimento, entrada automática no estoque, atualização de preço do ingrediente, vinculação com nota fiscal.

**Status atual:** Não existe no schema. Módulo futuro prioritário para controle real de estoque.

---

## 7.8 Estoque

**Propósito:** Controlar o saldo atual de cada ingrediente e embalagem — entradas por compra, saídas por produção e ajustes manuais.

Inclui: saldo atual, histórico de movimentações, alertas de mínimo, inventário periódico, registro de perdas.

**Status atual:** Campos `stockQuantity` e `minStock` existem em `Ingredient`. Movimentações não são registradas; UI não existe.

---

## 7.9 Produção

**Propósito:** Organizar o que será produzido, quando e com quais ingredientes. Registrar o que foi efetivamente produzido.

Inclui: dashboard Kanban por data de entrega, consolidação de ingredientes por lote, ordem de produção, registro de rendimento real, consumo automático de estoque.

**Status atual:** Dashboard de produção (`/admin/producao`) implementado com dados mock. Sem persistência nem consumo de estoque.

---

## 7.10 Pedidos

**Propósito:** Registrar encomendas dos clientes — itens, personalização, data de entrega, tipo de entrega, pagamento e status.

Inclui: criação de pedido, acompanhamento de status com histórico, fotos de referência, notificações WhatsApp automáticas, repetição de pedido.

**Status atual:** Fluxo de checkout completo na UI. Sem persistência no banco. Sem integração com WhatsApp.

---

## 7.11 Clientes

**Propósito:** Cadastrar e gerenciar clientes — histórico de pedidos, endereços, preferências e anotações internas.

Inclui: cadastro via OTP WhatsApp, histórico de compras, LTV, endereços salvos, anotações da equipe.

**Status atual:** Schema completo (`Customer`, `Address`, `OtpCode`). UI de autenticação existe sem backend. Módulo admin de clientes ausente.

---

## 7.12 Financeiro

**Propósito:** Controlar a saúde financeira do negócio — o que entrou, o que saiu, o que está previsto.

Inclui: contas a pagar, contas a receber, fluxo de caixa, CMV, DRE, conciliação.

**Status atual:** Não existe no schema. Apenas `paymentStatus` nos pedidos. Módulo financeiro completo ausente.

---

## 7.13 Fiscal

**Propósito:** Atender às obrigações tributárias — emissão de nota fiscal, cálculo de impostos, SPED.

**Status atual:** Não existe no projeto. Totalmente **A definir**. Depende do regime tributário de cada confeitaria.

---

## 7.14 Relatórios

**Propósito:** Gerar visões analíticas do negócio para tomada de decisão — por período, por produto, por cliente, por canal.

Inclui: relatório de vendas, CMV, margem por produto, variação de custo de ingredientes, ranking de produtos, fluxo de caixa projetado.

**Status atual:** Não existe. Depende da implementação dos módulos de pedidos, financeiro e estoque.

---

## 7.15 Dashboard

**Propósito:** Tela inicial com os principais indicadores do negócio em tempo real.

Inclui: pedidos do dia, produção pendente, faturamento do mês, estoque crítico, alertas ativos.

**Status atual:** Dashboard de produção existe com dados mock (`/admin/producao`). Dashboard financeiro e geral ausentes.

---

## 7.16 Configurações

**Propósito:** Centralizar todos os parâmetros configuráveis do sistema sem alterar código.

Inclui: dados da loja, parâmetros de precificação (`StoreConfig`), tema visual (`ThemeConfig`), integrações, horários de funcionamento, raio de entrega.

**Status atual:** Schema de `StoreConfig` e `ThemeConfig` existe. UI de configurações ausente.

---

## 7.17 Permissões

**Propósito:** Controlar o que cada usuário pode ver e fazer no sistema.

Inclui: papéis (`ADMIN`, `ATENDIMENTO`, `PRODUCAO`, `FINANCEIRO`), permissões por módulo, log de auditoria de ações sensíveis.

**Status atual:** `UserRole` existe no schema. Middleware de autenticação e autorização não implementado.

---

## 7.18 Integrações

**Propósito:** Conectar o sistema a plataformas externas.

Inclui:
- **WhatsApp** (Z-API / Evolution API) — notificações e OTP
- **PIX** (Asaas / Mercado Pago) — pagamento online
- **Google Maps** — cálculo de distância para entrega
- **Supabase Storage / S3** — upload de fotos de referência
- **CONAB / CEPEA** — importação automática de preços de ingredientes

**Status atual:** Schema de `WhatsAppLog` existe. Variáveis de ambiente configuradas em `.env.example`. Nenhuma integração ativa.

---

# 8. Jornada do Negócio

```
FORNECEDOR
  │  Cadastro de fornecedor com dados de contato e prazo de entrega
  ↓
COMPRA
  │  Ordem de compra: fornecedor, itens, quantidades, preços negociados
  │  Registro de nota fiscal
  ↓
ENTRADA NO ESTOQUE
  │  Cada item comprado aumenta o saldo do ingrediente/embalagem
  │  Preço atualizado automaticamente em IngredientPriceHistory
  │  Alertas de estoque máximo atingido (A definir)
  ↓
RECEITAS
  │  Ingredientes combinados em quantidades precisas
  │  Custo calculado automaticamente por porção/unidade
  │  Rendimento registrado (esperado vs. real)
  ↓
PRODUÇÃO
  │  Pedido confirmado gera demanda de produção
  │  Dashboard consolida ingredientes necessários por data
  │  Produção executada; estoque baixado automaticamente
  │  Perdas registradas quando ocorrem
  ↓
PRODUTO ACABADO
  │  Status PRONTO dispara notificação WhatsApp ao cliente
  │  Produto aguarda entrega ou retirada
  ↓
VENDA (ENTREGA / RETIRADA)
  │  Status ENTREGUE registrado com data/hora
  │  Pagamento confirmado (PIX webhook ou registro manual)
  │  Taxa de entrega lançada quando aplicável
  ↓
FINANCEIRO
  │  Receita lançada automaticamente ao confirmar pagamento
  │  CMV calculado a partir do costPrice dos itens entregues
  │  Fluxo de caixa atualizado
  │  Contas a receber quitadas
  ↓
INDICADORES
  │  Faturamento, margem, CMV, ticket médio atualizados em tempo real
  │  Produtos mais vendidos e mais lucrativos ranqueados
  │  Giro de estoque calculado
  │  Desperdício acumulado por período
  ↓
GESTÃO
     Proprietário visualiza rentabilidade real
     Decisões de precificação baseadas em custo real
     Planejamento de compras baseado em demanda futura
     Ajuste de mix de produtos por margem
```

---

# 9. Princípios Técnicos

## 9.1 Código

- **Código limpo:** nomes expressivos, funções pequenas com responsabilidade única, sem comentários que explicam o óbvio
- **Baixo acoplamento:** módulos independentes que comunicam via interfaces; mudança em um não quebra outro
- **Alta coesão:** código relacionado fica junto; código não relacionado fica separado
- **Componentização:** UI construída com componentes reutilizáveis, não com blocos duplicados em cada página
- **Sem `any` em TypeScript:** todos os tipos são explícitos; `unknown` quando o tipo realmente não é conhecido

## 9.2 Dados

- **Uma fonte de verdade por dado:** preço de ingrediente em `Ingredient.currentPrice`, derivado onde necessário
- **Snapshots imutáveis em pedidos:** `OrderItem` armazena `productName`, `unitPrice`, `totalPrice` no momento da confirmação
- **Histórico preservado:** preços de ingredientes, status de pedidos e ações críticas têm log permanente
- **Validação nas bordas:** dados externos (input do usuário, webhooks, APIs) são validados na entrada; código interno confia nos tipos

## 9.3 Arquitetura

- **Next.js App Router:** páginas de servidor para SEO e dados iniciais; `"use client"` apenas onde há interatividade
- **API Routes para o backend:** toda lógica de negócio fica nas rotas de API, não nos componentes
- **Prisma singleton:** `src/lib/prisma.ts` é a única instância do cliente; nunca instanciar `new PrismaClient()` em rotas
- **Sem estado global desnecessário:** Context API apenas para estado realmente global (carrinho); dados de página ficam na página
- **Sem bibliotecas de componentes externas** (Material UI, Shadcn etc.) sem decisão explícita — o design system proprietário é a base

## 9.4 Qualidade

- **Tratamento de erros em toda rota de API:** respostas estruturadas com código HTTP correto
- **Sem dados hardcoded no código de produção:** toda configuração vai para `StoreConfig` ou `.env`
- **Performance:** imagens otimizadas, listas paginadas, queries Prisma sem `SELECT *` desnecessário
- **Escalabilidade:** schema Prisma preparado para volume; índices nas colunas de busca e filtro frequentes

## 9.5 Documentação

- **CLAUDE.md** atualizado a cada mudança arquitetural relevante
- **REGRAS_NEGOCIO.md** atualizado antes de implementar qualquer regra nova
- **VISION.md** revisado a cada fase concluída
- Comentários no código apenas quando o **porquê** não é óbvio; nunca o **o quê**

---

# 10. Experiência do Usuário

## 10.1 Interface

- **Simples e focada:** cada tela tem um propósito; sem funcionalidades que o usuário nunca vai precisar visíveis na tela principal
- **Mobile-first:** telas de atendimento e produção otimizadas para celular (max-width 480px via `.max-w-app`)
- **Design system consistente:** paleta Doce Menina (cream, chocolate, rose, sage) em todos os módulos; nunca improvisar cores
- **Fonte display (Fraunces) para títulos; DM Sans para texto de UI** — contraste entre elegância e legibilidade

## 10.2 Interação

- **Poucos cliques:** a ação principal de cada tela está sempre visível, nunca enterrada em menus
- **Feedback imediato:** toda ação retorna resposta visual (toast, loading, confirmação) em até 200ms
- **Estados de vazio úteis:** quando não há dados, a tela orienta o próximo passo em vez de mostrar apenas "Nenhum registro"
- **Estados de erro informativos:** mensagens em português, sem códigos técnicos, com sugestão de ação

## 10.3 Fluxo

- **Sem interrupções desnecessárias:** confirmações de ação apenas para operações destrutivas ou irreversíveis
- **Progresso salvo automaticamente:** formulários longos preservam estado em caso de interrupção — **A definir**
- **Atalhos para usuários avançados:** ações comuns acessíveis via teclado ou gesto nos módulos de produção e atendimento — **A definir**

## 10.4 Performance percebida

- **Operação rápida:** listas carregam com skeleton enquanto dados chegam; nunca tela em branco
- **Offline parcial (PWA):** leitura do cardápio e dashboard de produção disponível sem conexão — **A definir** (mencionado como próxima fase no README)

---

# 11. Inteligência Artificial

A IA deverá ser utilizada como **assistente de decisão**, não como substituta do julgamento humano. Cada sugestão gerada pela IA deve ser explicável e rejeitável pelo usuário.

## 11.1 Precificação inteligente

**Sugestão de preço:** com base no custo calculado, margem alvo e preços de produtos similares no mercado — **A definir**.

**Alerta de margem:** notificação automática quando o preço de um ingrediente sobe e o `costPrice` do produto ultrapassa o `basePrice`.

## 11.2 Compras e estoque

**Sugestão de compra:** baseado em pedidos futuros confirmados e saldo atual de estoque, o sistema calcula o que precisará ser comprado e em que quantidade — **A definir**.

**Previsão de ruptura:** alerta antecipado quando o estoque de um ingrediente será insuficiente para os pedidos já registrados — **A definir**.

## 11.3 Produção

**Planejamento de lote:** agrupamento automático de pedidos para produção em lote, otimizando uso de forno, tempo e ingredientes — **A definir**.

**Detecção de anomalias:** alerta quando o rendimento real de uma receita cai abaixo do esperado (possível indicativo de erro ou desperdício) — **A definir**.

## 11.4 Financeiro

**Resumo financeiro em linguagem natural:** "Este mês seu CMV foi 42%, 3 pontos acima da meta. Os principais responsáveis foram chocolate belga (+12% no mês) e embalagens de natal." — **A definir**.

**Análise de lucratividade:** identifica automaticamente os 3 produtos que mais destroem margem e os 3 que mais geram lucro — **A definir**.

## 11.5 Atendimento

**Assistente interno de atendimento:** responde perguntas da atendente via linguagem natural — "Qual o prazo mínimo para um bolo de 3 andares?" — consultando as regras cadastradas — **A definir**.

**Geração de resposta para o cliente:** rascunha a resposta no WhatsApp com base no pedido recebido — **A definir**.

## 11.6 Relatórios

**Geração de relatório por linguagem natural:** "Mostre o faturamento dos últimos 3 meses comparado ao mesmo período do ano anterior" sem necessidade de configurar filtros — **A definir**.

**Insights automáticos:** ao abrir o dashboard, o sistema destaca 2 ou 3 dados que merecem atenção — **A definir**.

---

# 12. Indicadores Estratégicos

## 12.1 Financeiros

| Indicador | Descrição |
|-----------|-----------|
| **Faturamento bruto** | Total de vendas no período |
| **Faturamento líquido** | Faturamento descontado devoluções e cancelamentos |
| **CMV** | Custo da Mercadoria Vendida — soma dos `costPrice` × quantidade dos pedidos entregues |
| **Margem bruta** | `(Faturamento − CMV) ÷ Faturamento` |
| **Lucro operacional** | Receita líquida − CMV − despesas operacionais |
| **Lucro líquido** | Lucro operacional − impostos |
| **Fluxo de caixa** | Entradas e saídas reais por período |
| **Capital de giro** | Disponível para cobrir operação corrente |
| **Ticket médio** | Faturamento ÷ número de pedidos |

## 12.2 Operacionais

| Indicador | Descrição |
|-----------|-----------|
| **Pedidos por período** | Volume de encomendas por dia, semana, mês |
| **Taxa de cancelamento** | Cancelados ÷ total de pedidos |
| **Prazo médio de produção** | Dias entre `CONFIRMADO` e `PRONTO` |
| **Pedidos em atraso** | Pedidos com `deliveryDate` passada e status ≠ `ENTREGUE` |
| **Produção por período** | Unidades produzidas por dia/semana/mês |

## 12.3 Catálogo

| Indicador | Descrição |
|-----------|-----------|
| **Produtos mais vendidos** | Ranking por quantidade vendida |
| **Produtos mais lucrativos** | Ranking por `(basePrice − costPrice) × quantidade` |
| **Produtos com margem negativa** | `basePrice < costPrice` — prejuízo por unidade vendida |
| **Mix de vendas por categoria** | Participação de Bolos, Doces, Kits no total |

## 12.4 Estoque

| Indicador | Descrição |
|-----------|-----------|
| **Giro de estoque** | Consumo médio mensal ÷ estoque atual por ingrediente |
| **Desperdício por período** | Perdas registradas em quantidade e valor |
| **Cobertura de estoque** | Quantos dias o estoque atual cobre, dado o consumo médio |
| **Itens abaixo do mínimo** | Ingredientes com `stockQuantity ≤ minStock` |

## 12.5 Clientes

| Indicador | Descrição |
|-----------|-----------|
| **LTV** | Lifetime Value — soma total de pedidos por cliente |
| **Frequência de compra** | Média de pedidos por cliente por mês |
| **Clientes novos vs. recorrentes** | Participação de cada perfil no faturamento |
| **Conversão** | Carrinhos iniciados vs. pedidos confirmados |

---

# 13. Funcionalidades Fora do Escopo Inicial

As funcionalidades abaixo **não serão implementadas na primeira versão** do produto. Poderão ser consideradas em fases futuras conforme demanda validada.

| Funcionalidade | Justificativa de exclusão |
|----------------|--------------------------|
| **Marketplace de produtos** | Requer infraestrutura de e-commerce, pagamentos e logística independente do escopo atual |
| **Marketplace de fornecedores** | Alta complexidade; fornecedor hoje é campo texto; entidade fornecedor ainda será implementada |
| **Aplicativo móvel nativo** | PWA cobre o caso de uso inicial; app nativo só se validar necessidade real |
| **Programa de fidelidade** | Complexidade de pontuação, regras e expiração; prioridade baixa no início |
| **Multiempresa** | Sistema concebido para uma única confeitaria; expansão arquitetural necessária |
| **Integrações fiscais avançadas** (NF-e, SPED) | Depende do regime tributário; requer parceiro fiscal; escopo separado |
| **Integração bancária** (Open Finance) | Alta regulamentação; fora do escopo do MVP financeiro |
| **Delivery próprio** (motoboy gerenciado) | Sistema integra com apps de entrega (Uber/99); gestão própria de frota é escopo diferente |
| **B2B / Atacado** | Requer regras de preço especiais, CNPJ, crédito — arquitetura diferente do modelo B2C atual |
| **Loja virtual independente** | O checkout atual é para encomendas; loja virtual com carrinho público é produto diferente |

---

# 14. Critérios para Aprovação de Novas Funcionalidades

Antes de qualquer nova funcionalidade ser implementada, as perguntas abaixo devem ser respondidas positivamente:

| Critério | Pergunta |
|----------|----------|
| **Problema** | Qual problema concreto ela resolve? Existe evidência de que esse problema ocorre? |
| **Usuário** | Quem vai usar? Com que frequência? É o mesmo usuário que já usa o sistema? |
| **Impacto** | Qual é o impacto mensurável no negócio? Reduz custo, aumenta receita, elimina retrabalho? |
| **Reaproveitamento** | Existe código, componente ou fluxo similar já implementado que pode ser reutilizado? |
| **Duplicidade** | A funcionalidade cria um segundo lugar para a mesma informação? Se sim, está justificado? |
| **Necessidade real** | É uma necessidade real ou uma hipótese de necessidade? Há validação com usuários reais? |
| **Arquitetura** | Segue os padrões definidos em CLAUDE.md? Usa as convenções de nomenclatura e estrutura existentes? |
| **Regras de negócio** | As regras de negócio relevantes estão documentadas em REGRAS_NEGOCIO.md antes da implementação? |
| **Custo de complexidade** | O aumento de complexidade gerado é proporcional ao valor entregue? |
| **Reversibilidade** | Se não funcionar como esperado, a funcionalidade pode ser removida ou revertida sem impacto estrutural? |

---

# 15. Diretrizes para o Agente de IA (Claude Code)

Sempre que implementar qualquer funcionalidade neste projeto, o agente deve:

## Antes de implementar

1. **Ler os arquivos de referência** na ordem: `CLAUDE.md` → `VISION.md` → `REGRAS_NEGOCIO.md` → `PLAN.md`
2. **Verificar se a funcionalidade já existe** antes de criar qualquer novo arquivo ou componente
3. **Identificar impactos em outros módulos** — mudança em `CartContext`, por exemplo, afeta todas as páginas que usam `useCart`
4. **Consultar o schema Prisma** antes de propor qualquer nova entidade ou campo
5. **Solicitar esclarecimento** quando uma regra de negócio relevante estiver marcada como "A definir"

## Durante a implementação

6. **Priorizar reutilização** — usar componentes, hooks, utilitários e tipos existentes antes de criar novos
7. **Não criar código duplicado** — se um padrão já existe em outro arquivo, extrair ou referenciar; nunca copiar
8. **Não alterar comportamento existente sem autorização** — refatorações e mudanças de contrato devem ser propostas antes de executadas
9. **Seguir as convenções de nomenclatura** definidas em `CLAUDE.md` para arquivos, componentes, tipos e CSS
10. **Manter o design system** — usar apenas as cores e classes utilitárias definidas em `globals.css`

## Após implementar

11. **Atualizar a documentação** — se uma regra de negócio foi definida durante a implementação, registrar em `REGRAS_NEGOCIO.md`; se um padrão arquitetural mudou, atualizar `CLAUDE.md`
12. **Justificar decisões que impactam a arquitetura** — quando uma decisão de design não segue o padrão existente, documentar o motivo
13. **Nunca marcar uma tarefa como concluída** sem verificar que o comportamento está correto e consistente com os módulos existentes

## Restrições absolutas

- Nunca usar `any` em TypeScript
- Nunca instanciar `new PrismaClient()` fora de `src/lib/prisma.ts`
- Nunca adicionar bibliotecas de componentes externas sem decisão explícita
- Nunca expor senha, hash ou token via API ou log
- Nunca alterar o schema Prisma sem documentar o impacto nas entidades existentes

---

# 16. Roadmap Estratégico

## Fase 1 — Fundação (estrutura básica funcional)

**Objetivo:** fazer o sistema funcionar de ponta a ponta com dados reais.

- API Routes Next.js para produtos, pedidos, clientes
- Conexão Prisma + PostgreSQL em produção
- Auth OTP via WhatsApp para clientes
- Auth e-mail/senha com NextAuth para equipe interna
- Proteção de rotas `/admin/*` por papel
- Persistência real do checkout no banco

**Saída esperada:** um pedido pode ser realizado, persistido, consultado e acompanhado pela equipe.

---

## Fase 2 — Receitas

**Objetivo:** digitalizar o conhecimento produtivo da confeitaria.

- CRUD de receitas com ingredientes e quantidades
- Conversão automática de unidades via `UnitConversion`
- Cálculo automático de custo da receita
- Vínculo de receitas a produtos (`ProductRecipe`)
- Atualização automática de `costPrice` quando preço de ingrediente muda

**Saída esperada:** toda receita da confeitaria está no sistema com custo calculado.

---

## Fase 3 — Precificação

**Objetivo:** tornar o preço de venda uma decisão informada, não uma intuição.

- Componentes de `StoreConfig` editáveis pela UI (`laborCostPerHour`, `fixedCostMonthly`, `targetMarginPercent`)
- Calculadora de preço sugerido por produto
- Alerta visual quando `basePrice < costPrice`
- Histórico de variação de custo por produto

**Saída esperada:** o proprietário sabe o custo real de cada produto e a margem praticada.

---

## Fase 4 — Estoque

**Objetivo:** saber o que há em estoque, o que está acabando e o que foi desperdiçado.

- Cadastro de ingredientes com unidades e preços
- Registro de entradas (compras) com atualização de `stockQuantity` e `currentPrice`
- Baixa automática de estoque ao confirmar produção
- Alertas de estoque mínimo
- Registro de perdas com justificativa

**Saída esperada:** estoque de ingredientes rastreado; alerta antes de faltar.

---

## Fase 5 — Produção

**Objetivo:** organizar o que será produzido para não atrasar nenhum pedido.

- Dashboard de produção com dados reais (substituir mock)
- Consolidação real de ingredientes por data
- Mudança de status de pedido pela equipe com log
- Notificações WhatsApp automáticas por status (`order_confirmed`, `order_ready`)
- Registro de rendimento real vs. esperado

**Saída esperada:** a confeiteira abre o sistema e sabe exatamente o que produzir no dia.

---

## Fase 6 — Financeiro

**Objetivo:** visibilidade completa da saúde financeira do negócio.

- Entidade de movimentação financeira (entrada e saída)
- Contas a pagar (compras a prazo, despesas fixas)
- Contas a receber (pedidos com pagamento pendente)
- Fluxo de caixa por período
- CMV calculado a partir dos pedidos entregues
- DRE mensal

**Saída esperada:** o proprietário sabe se o negócio deu lucro no mês, e quanto.

---

## Fase 7 — Dashboards e Relatórios

**Objetivo:** transformar dados em decisões.

- Dashboard executivo com KPIs em tempo real
- Relatório de produtos mais vendidos e mais lucrativos
- Relatório de variação de custo de ingredientes
- Relatório de desperdício
- Comparativo de períodos

**Saída esperada:** relatório mensal gerado pelo sistema em segundos, sem planilha.

---

## Fase 8 — Inteligência Artificial

**Objetivo:** sugestões proativas que o sistema faz sem que o usuário precise perguntar.

- Sugestão de preço com base em custo e margem alvo
- Alerta de impacto no custo quando preço de ingrediente sobe
- Sugestão de compra baseada em pedidos futuros
- Resumo financeiro em linguagem natural
- Identificação automática de produtos no prejuízo

**Saída esperada:** o sistema funciona como um consultor financeiro silencioso.

---

## Fase 9 — Integrações

**Objetivo:** eliminar lançamentos manuais conectando o sistema às plataformas que já usa.

- PIX integrado (Asaas / Mercado Pago) com webhook de confirmação
- WhatsApp bidirecional (receber pedidos, enviar notificações)
- Google Maps (cálculo de distância para entrega gratuita)
- Importação de preços CONAB/CEPEA para ingredientes agrícolas
- Upload de fotos de referência (Supabase Storage)

**Saída esperada:** pagamento confirmado automaticamente; estoque de ingredientes com preço atualizado semanalmente.

---

## Fase 10 — Escalabilidade

**Objetivo:** preparar o sistema para crescer sem limitações técnicas.

- Multitenancy (múltiplas unidades de uma rede de confeitarias) — **A definir**
- PWA com funcionamento offline parcial
- Cache estratégico para listas e dashboards
- Observabilidade (logs estruturados, alertas de erro, métricas de performance)
- Estratégia de backup e recuperação de dados

**Saída esperada:** o sistema suporta crescimento de 10x no volume sem degradação.

---

# Análise Crítica

## Riscos de escopo

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|--------------|---------|-----------|
| 1 | **Escopo financeiro subestimado** | Alta | Alto | O módulo financeiro é o mais complexo do ERP; planejar Fase 6 com antecedência e validar requisitos com contador |
| 2 | **Embalagem como entidade separada vs. campo de produto** | Média | Médio | Decidir antes da Fase 4; mudar depois impacta precificação e estoque |
| 3 | **Multitenancy retroativo** | Baixa | Alto | Se mais de uma unidade for necessária na Fase 1, o schema precisará de isolamento por `storeId` desde o início |
| 4 | **Fiscal fora do escopo** | Alta | Médio | Sem NF-e, o sistema não serve como único ERP para quem emite nota; documentar claramente essa limitação |
| 5 | **WhatsApp bidirecional como canal de pedidos** | Alta | Alto | Receber pedido pelo WhatsApp e criar automaticamente no sistema é altamente desejado mas tecnicamente complexo (parsing de texto livre) |
| 6 | **Integração de preços CONAB/CEPEA** | Média | Baixo | APIs públicas mudam sem aviso; planejar fallback manual |

## Módulos ausentes comuns em ERPs para confeitaria

Os módulos abaixo existem em sistemas concorrentes mas não estão no escopo atual:

- **Controle de produção por turno:** qual colaborador produziu o quê (rastreabilidade de mão de obra)
- **Fichas técnicas com foto de cada etapa:** documentação visual da receita para padronização
- **Gestão de encomendas por evento:** calendário de eventos (casamentos, aniversários) com visão de capacidade
- **Programa de fidelidade:** pontos, cashback, desconto por recorrência
- **Catálogo público (site/vitrine sem login):** visibilidade de produtos para quem ainda não é cliente
- **Integração com iFood/Rappi:** para confeitarias que vendem em apps de delivery
- **Controle de temperatura de câmaras frias:** IoT para monitoramento de conservação
- **Gestão de treinamentos:** manter histórico de capacitações da equipe

## Sugestões para aumentar competitividade sem aumentar complexidade

1. **Calculadora de preço pública (sem login):** uma URL compartilhável onde o cliente calcula o custo estimado de uma torta personalizada — gera leads e reduz tempo de atendimento para cotações simples

2. **Checklist de produção imprimível:** ao confirmar a produção do dia, o sistema gera um PDF/HTML com a lista de ingredientes e passos para a confeiteira usar sem o celular na mão — baixo esforço de implementação, alto valor prático

3. **Alerta proativo de agenda:** às 7h toda manhã, o WhatsApp da responsável recebe o resumo dos pedidos para entrega nos próximos 3 dias — um cron job simples com impacto grande no controle operacional

4. **Modo "repetir pedido" já implementado na UI:** aproveitar o `loadFromOrder` existente no `CartContext` como diferencial na jornada do cliente recorrente — basta conectar ao backend

5. **Relatório de custo por receita em uma tela:** quando o preço de qualquer ingrediente mudar, mostrar o impacto no custo de todas as receitas que o usam — regra simples de calcular, alta percepção de valor para o proprietário
