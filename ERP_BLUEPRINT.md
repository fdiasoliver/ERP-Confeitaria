# ERP_BLUEPRINT.md — Doce Menina: Blueprint Funcional do Sistema

Documento de referência funcional do ERP Doce Menina.
Descreve o funcionamento de cada módulo do ponto de vista do negócio — sem linguagem técnica, sem código.
Destinado à equipe de produto, negócio e parceiros externos.

Última atualização: 01/07/2026 — Sprint 2.0.3

---

## Apresentação

O Doce Menina é um sistema de gestão completo para confeitarias artesanais. Ele cobre todas as áreas do negócio: do controle de ingredientes e receitas à organização da produção, passando pelo atendimento ao cliente, gestão financeira e análise de resultados.

O sistema é composto por **18 módulos** integrados. Cada módulo tem uma responsabilidade clara e troca informações com os demais em pontos bem definidos. Um pedido confirmado, por exemplo, alimenta automaticamente a produção, o financeiro e as notificações por WhatsApp — sem que nenhuma informação precise ser digitada duas vezes.

Este documento descreve o funcionamento esperado de cada módulo. Funcionalidades ainda não implementadas estão identificadas como **(planejado)**.

---

## Mapa Geral do ERP

```
┌─────────────────────────────────────────────────────────────┐
│              CONFIGURAÇÃO DA EMPRESA                         │
│   Nome, endereço, PIX, raio de entrega, margens, custos     │
│        ↕ parâmetros globais usados por todos os módulos     │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────▼─────────────────┐
         │             CATÁLOGO               │
         │  Categorias → Produtos ← Ocasiões  │
         └──────┬──────────────────┬──────────┘
                │                  │
   ┌────────────▼───┐    ┌─────────▼────────────────┐
   │   FORNECEDORES  │    │         RECEITAS          │
   │  (quem vende)   │    │  ingredientes + embalagens│
   └────────┬────────┘    │  + tempo + rendimento     │
            │             └────────────┬──────────────┘
   ┌────────▼────────┐                 │
   │   INGREDIENTES  ├─────────────────┤
   │  (estoque +     │                 │
   │   histórico de  │    ┌────────────▼──────────────┐
   │   preços)       │    │         CUSTOS             │
   └─────────────────┘    │  cálculo automático do     │
                          │  custo de produção         │
   ┌─────────────────┐    └────────────┬──────────────┘
   │   EMBALAGENS    ├─────────────────┤
   │  (caixas,       │                 │
   │   saquinhos,    │    ┌────────────▼──────────────┐
   │   fitas)        │    │       PRECIFICAÇÃO         │
   └─────────────────┘    │  custo → preço sugerido   │
                          │  com margem configurável   │
                          └────────────┬──────────────┘
                                       │
         ┌─────────────────────────────▼─────────────────────┐
         │                    PEDIDOS                         │
         │  encomenda + itens + data + entrega + pagamento   │
         └──────────┬─────────────────────────┬──────────────┘
                    │                         │
         ┌──────────▼──────────┐   ┌──────────▼──────────────┐
         │      PRODUÇÃO        │   │        CLIENTES          │
         │  Kanban + batch +    │   │  cadastro, histórico,    │
         │  consolidação de     │   │  endereços, notas        │
         │  ingredientes        │   └─────────────────────────┘
         └──────┬──────┬───────┘
                │      │
   ┌────────────▼──┐  ┌▼──────────────┐
   │    ENTREGA    │  │   FINANCEIRO   │
   │  retirada /   │  │  fluxo de     │
   │  grátis /     │  │  caixa, DRE,  │
   │  app externo  │  │  CMV, contas  │
   └───────────────┘  └──────┬────────┘
                             │
                    ┌────────▼────────────┐
                    │     DASHBOARD       │
                    │  operacional (hoje) │
                    │  + executivo (KPIs) │
                    └────────┬────────────┘
                             │
                    ┌────────▼────────────┐
                    │         IA           │
                    │  sugestões, alertas  │
                    │  previsões           │
                    └─────────────────────┘

WHATSAPP ←→ conectado a: Pedidos, Clientes, Produção
(notificações automáticas ao cliente em cada mudança de status)
```

---

## Módulo 1 — Configuração da Empresa

### Objetivo
Centraliza todos os parâmetros globais do negócio que afetam o funcionamento dos demais módulos. É o ponto único de configuração de dados como nome da confeitaria, endereço, chave PIX, raio de entrega gratuita, custo de mão de obra, custos fixos e margem alvo de lucro. Quando Paulo (dono) altera qualquer parâmetro aqui, o impacto se propaga automaticamente para os cálculos de custo e precificação.

**Status atual:** implementado. Página `/admin/config` com 6 seções funcionais.

### Quem usa
Paulo (ADMIN). Configuração inicial feita uma vez; revisões pontuais conforme o negócio muda.

### Fluxo principal
1. Paulo acessa Configurações no menu administrativo.
2. A página exibe 6 seções: Dados da Empresa, Endereço, PIX, Entrega, Precificação, Tema Visual.
3. Paulo edita os campos desejados em qualquer seção.
4. Clica em "Salvar" na seção correspondente.
5. O sistema confirma com uma mensagem de sucesso.
6. Os novos valores entram em vigor imediatamente em todos os cálculos do sistema.

### Entradas
- Nome da empresa e razão social (opcional)
- Telefone, e-mail, Instagram
- Endereço completo com CEP
- Tipo de chave PIX e valor da chave
- Raio de entrega gratuita em quilômetros (padrão: 3 km)
- Custo da mão de obra por hora (padrão: R$ 35,00)
- Custos fixos mensais totais (aluguel, energia, etc.)
- Estimativa de unidades produzidas por mês (para rateio dos fixos)
- Margem de lucro alvo em percentual (padrão: 50%)
- Logo e favicon da confeitaria (upload de imagem)

### Saídas
- Parâmetros globais disponíveis para todos os módulos
- Logo e favicon exibidos na vitrine e área administrativa
- Dados PIX exibidos no checkout para pagamento manual

### Dependências
Nenhuma — é o módulo base de toda a configuração.

### Regras de negócio
- Existe somente um registro de configuração por sistema; não é possível criar um segundo.
- A alteração do custo de mão de obra ou dos custos fixos não recalcula automaticamente os preços dos produtos — mas recalcula o custo sugerido exibido ao admin.
- O raio de entrega gratuita define o limite para o tipo "Entrega Gratuita" nos pedidos.
- Logo e favicon são armazenados de forma segura e referenciados pela URL pública gerada no upload.

### Eventos produzidos
- Parâmetros de precificação atualizados → calculadora de custo usa novos valores na próxima consulta.
- Raio de entrega alterado → novos pedidos usam o novo raio para validar elegibilidade de entrega gratuita.

### Eventos consumidos
- Nenhum externo. É o módulo de origem, não de destino.

### Permissões
- **ADMIN:** visualizar e editar tudo.
- **ATENDIMENTO, PRODUCAO, FINANCEIRO:** sem acesso.

### Indicadores
- Não aplicável como módulo de indicadores — é módulo de configuração.

### Integrações
- **Supabase Storage:** upload de logo e favicon via API REST de armazenamento de imagens.
- **ViaCEP:** preenchimento automático de endereço pelo CEP digitado.

### Riscos
- Raio de entrega configurado muito amplo pode gerar custos logísticos não previstos para a confeitaria.
- Margem alvo incorreta pode induzir precificação inadequada em todos os produtos.
- Custos fixos desatualizados tornam o cálculo de custo por produto irreal.

### Futuras evoluções
- **(planejado)** Horários de funcionamento configuráveis por dia da semana.
- **(planejado)** Horário de corte para pedidos: após X horas, o prazo conta a partir do dia seguinte.
- **(planejado)** Configuração de feriados e dias de folga.
- **(planejado)** Taxa de entrega por app (Uber/99) configurável.
- **(planejado)** Configuração de impostos e regime tributário.

---

## Módulo 2 — Categorias

### Objetivo
Organiza os produtos do catálogo em grupos temáticos como "Bolos", "Doces & Docinhos" e "Kits & Coffee Break". As categorias estruturam a navegação da vitrine e facilitam a busca do cliente. São também usadas nos relatórios de vendas para análise de mix por tipo de produto.

### Quem usa
Paulo (ADMIN) para gerenciar. Ana (cliente) para navegar na vitrine.

### Fluxo principal
1. Paulo acessa o módulo de Categorias no menu administrativo.
2. Visualiza a lista de categorias existentes com ordem de exibição e número de produtos em cada uma.
3. Para criar: clica em "Nova categoria", define nome, slug e ordem de exibição.
4. Para editar: clica na categoria, altera os campos e salva.
5. Para reordenar: ajusta o campo de ordem numérica e salva.
6. A alteração reflete imediatamente na vitrine.

### Entradas
- Nome da categoria (obrigatório, ex: "Bolos")
- Slug único para URL (ex: "bolos", gerado automaticamente a partir do nome)
- Ordem de exibição numérica (ex: 1 = aparece primeiro na vitrine)

### Saídas
- Categorias disponíveis para vinculação a produtos.
- Chips de filtro na vitrine exibindo as categorias ativas com produtos.

### Dependências
Nenhuma — é um cadastro base.

### Regras de negócio
- O slug deve ser único no sistema — dois categorias não podem ter a mesma URL.
- Uma categoria com produtos vinculados não pode ser excluída; deve ser inativada.
- Categoria inativa não aparece na vitrine nem nos filtros.
- A ordem de exibição controla a sequência dos chips de categoria na vitrine.

### Eventos produzidos
- Nova categoria criada → disponível imediatamente para vinculação a produtos.
- Categoria inativada → produtos dessa categoria continuam existindo, mas a categoria não aparece como filtro.

### Eventos consumidos
- Produto vinculado a esta categoria → categoria não pode ser excluída.

### Permissões
- **ADMIN:** criar, editar, reordenar, inativar.
- **ATENDIMENTO, PRODUCAO, FINANCEIRO:** apenas visualizar.
- **Cliente:** visualiza na vitrine (implicitamente).

### Indicadores
- Número de categorias ativas.
- Número de produtos por categoria.
- Participação percentual de cada categoria no total de pedidos (planejado).

### Integrações
- Nenhuma integração externa.

### Riscos
- Categorias com nomes pouco intuitivos confundem o cliente na vitrine.
- Muitas categorias com poucos produtos cada podem dispersar a atenção do cliente.

### Futuras evoluções
- **(planejado)** Imagem ou ícone representativo por categoria para exibição na vitrine.
- **(planejado)** Subcategorias (ex: Bolos > Bolos de Aniversário, Bolos de Casamento).
- **(planejado)** Descrição da categoria exibida na vitrine.

---

## Módulo 3 — Produtos

### Objetivo
Gerencia o catálogo completo de itens vendáveis da confeitaria. Cada produto tem preço, prazo mínimo de produção, categoria, ocasiões associadas, receitas vinculadas e custo calculado automaticamente. O módulo de Produtos é o centro do catálogo — conecta o que a confeitaria oferece ao cliente com o que ela precisa produzir internamente.

**Status atual:** produto existe apenas como dado de exemplo. CRUD administrativo não implementado.

### Quem usa
Paulo (ADMIN) para gerenciar o catálogo. Ana (cliente) para visualizar e encomendar na vitrine.

### Fluxo principal
1. Paulo acessa o módulo de Produtos no menu administrativo.
2. Visualiza lista de todos os produtos com status (ativo/inativo), preço e custo calculado.
3. Para criar: clica em "Novo produto", preenche nome, descrição, categoria, prazo mínimo, preço de venda.
4. Associa ocasiões (ex: Aniversário, Casamento).
5. Vincula receitas que compõem o produto (ex: massa + recheio + cobertura).
6. O sistema exibe automaticamente: custo calculado, preço sugerido e margem atual.
7. Paulo define o preço de venda e salva.
8. Marca o produto como ativo — aparece imediatamente na vitrine.

### Entradas
- Nome do produto (obrigatório)
- Descrição para exibição na vitrine
- Categoria (obrigatório — uma por produto)
- Prazo mínimo em dias (obrigatório — ex: 5 dias para bolo de andares)
- Preço de venda (obrigatório — definido manualmente)
- Ocasiões associadas (opcional — zero ou mais)
- Receitas vinculadas com quantidade (opcional mas necessário para cálculo de custo)
- Imagem ou emoji para exibição na vitrine
- Indicador de destaque (aparece na seção principal da vitrine)
- Indicador ativo/inativo

### Saídas
- Produto disponível na vitrine para encomenda.
- Custo de produção calculado (soma das receitas vinculadas).
- Preço sugerido com a margem alvo configurada.
- Alerta visual quando o preço praticado está abaixo do custo.

### Dependências
- **Categorias** devem existir antes de criar um produto.
- **Ocasiões** devem existir para serem vinculadas.
- **Receitas** devem existir para o cálculo automático de custo.

### Regras de negócio
- Todo produto deve ter nome, categoria, preço e prazo mínimo.
- O custo de produção (`costPrice`) é sempre calculado pelo sistema — nunca editado manualmente.
- Produto inativo não aparece na vitrine; produtos existentes em pedidos mantêm seus dados inalterados.
- O prazo mínimo define quantos dias antes da data desejada o cliente precisa fazer o pedido.
- Produto em destaque aparece na seção principal da vitrine.
- Produto com `basePrice < costPrice` deve exibir alerta visual para o admin.

### Eventos produzidos
- Produto ativado → aparece na vitrine imediatamente.
- Preço de receita vinculada alterado → `costPrice` do produto é recalculado.
- Produto inativado → removido da vitrine; pedidos existentes não são afetados.

### Eventos consumidos
- Ingrediente de receita vinculada com preço atualizado → recalcula custo do produto.
- Receita vinculada alterada → recalcula custo do produto.

### Permissões
- **ADMIN:** criar, editar, ativar, inativar, definir destaque.
- **ATENDIMENTO:** visualizar lista e detalhes.
- **PRODUCAO:** visualizar receitas vinculadas ao produto.
- **FINANCEIRO:** visualizar custo e margem.
- **Cliente:** visualiza na vitrine (somente produtos ativos).

### Indicadores
- Número de produtos ativos.
- Produtos com margem negativa (preço abaixo do custo).
- Ranking de produtos mais vendidos.
- Ranking de produtos mais lucrativos.

### Integrações
- **Supabase Storage:** upload de foto do produto.
- Custo calculado integra-se com os módulos de Receitas e Precificação.

### Riscos
- Produto sem receita vinculada não tem custo calculado — a margem real é desconhecida.
- Preço desatualizado após aumento de ingrediente → produto vendido com prejuízo.
- Prazo mínimo incorreto → cliente solicita encomenda com antecedência insuficiente.

### Futuras evoluções
- **(planejado)** Variações de produto (tamanhos, sabores) sem duplicar cadastros.
- **(planejado)** Produto vendido por peso (brigadeiro a granel).
- **(planejado)** Preço diferenciado por canal (balcão vs. encomenda).
- **(planejado)** Kit com composição variável escolhida pelo cliente no checkout.

---

## Módulo 4 — Ocasiões

### Objetivo
Permite que os produtos sejam marcados com tags de evento para facilitar a busca do cliente na vitrine. Um cliente que procura algo para um casamento pode filtrar por "Casamento" e ver somente produtos adequados para essa ocasião. Ocasiões não afetam preço nem produção — são exclusivamente um filtro de catálogo.

### Quem usa
Paulo (ADMIN) para gerenciar. Ana (cliente) para filtrar produtos na vitrine.

### Fluxo principal
1. Paulo acessa o módulo de Ocasiões.
2. Visualiza as ocasiões existentes (ex: Aniversário, Casamento, Corporativo, Mesversário).
3. Para criar: define nome e ordem de exibição nos chips da vitrine.
4. Para editar: altera nome ou ordem.
5. Acessa um produto e vincula as ocasiões pertinentes.
6. Na vitrine, o cliente vê os chips de ocasião e filtra os produtos.

### Entradas
- Nome da ocasião (ex: "Mesversário", "Dia das Mães")
- Ordem de exibição nos chips da vitrine

### Saídas
- Chips de filtro na vitrine.
- Tags visíveis no card do produto.

### Dependências
Nenhuma — é um cadastro base.

### Regras de negócio
- Ocasião com produtos vinculados não pode ser excluída; apenas inativada.
- Ocasião inativa não aparece nos filtros da vitrine.
- Um produto pode ter zero ou mais ocasiões.
- Ocasiões são puramente informativas — não afetam cálculo de custo, prazo ou produção.

### Eventos produzidos
- Nova ocasião criada → disponível para vinculação a produtos.
- Ocasião inativada → chip some da vitrine; produtos vinculados continuam existindo.

### Eventos consumidos
- Produto vinculado a esta ocasião → ocasião não pode ser excluída.

### Permissões
- **ADMIN:** criar, editar, reordenar, inativar.
- **ATENDIMENTO, PRODUCAO, FINANCEIRO:** visualizar.
- **Cliente:** visualiza chips na vitrine.

### Indicadores
- Pedidos por ocasião (quais eventos geram mais vendas) — planejado.
- Produtos sem nenhuma ocasião associada.

### Integrações
- Nenhuma integração externa.

### Riscos
- Baixo risco. O maior risco é a falta de ocasiões relevantes para o público da confeitaria.

### Futuras evoluções
- **(planejado)** Campanha sazonal por ocasião (ex: promoção Dia das Mães com banner e destaque automático).
- **(planejado)** Sugestão de produtos complementares por ocasião no carrinho.

---

## Módulo 5 — Clientes

### Objetivo
Centraliza o cadastro e o histórico de todas as pessoas que fazem encomendas na confeitaria. O cliente é identificado pelo número de celular — único no sistema. A equipe pode consultar o histórico de pedidos, endereços salvos e adicionar anotações internas (não visíveis ao cliente). O módulo apoia a personalização do atendimento e o cálculo de valor total por cliente (LTV).

**Status atual:** cliente é criado automaticamente no primeiro pedido. Módulo administrativo de clientes não implementado.

### Quem usa
Carla (ATENDIMENTO) para consultar histórico e adicionar notas. Paulo (ADMIN) para visão gerencial. Sistema para criar/atualizar clientes automaticamente.

### Fluxo principal
1. **Cadastro automático:** ao fazer o primeiro pedido, o cliente informa nome e celular no login. O sistema cria o cadastro ou atualiza o nome se o celular já existir.
2. Carla acessa `/admin/clientes` e busca a cliente pelo nome ou telefone.
3. Abre o perfil: vê dados de contato, histórico de pedidos e endereços salvos.
4. Adiciona uma nota interna sobre preferências ou ocorrências.
5. Salva a nota — visível apenas para a equipe.

### Entradas
- Nome (fornecido pelo cliente no primeiro acesso)
- Número de celular (obrigatório — chave de identificação única)
- E-mail (opcional)
- Endereços de entrega (criados a cada pedido com endereço)
- Notas internas (adicionadas pela equipe)

### Saídas
- Perfil de cliente com histórico completo de pedidos.
- Endereços disponíveis para reutilização no próximo pedido.
- LTV (soma total de pedidos do cliente).

### Dependências
- **Pedidos** — clientes são criados no fluxo de pedido.

### Regras de negócio
- O celular é a chave de identidade do cliente; não pode ser duplicado no sistema.
- Alterar o celular de um cliente exige autorização do ADMIN — é uma operação especial.
- Anotações internas nunca são exibidas ao cliente, nem no histórico de pedidos da área do cliente.
- Um cliente pode ter múltiplos endereços; um deles é o endereço padrão.
- Clientes não são excluídos — apenas inativados se necessário.

### Eventos produzidos
- Novo cliente criado → disponível para vinculação a pedidos futuros.
- Nota adicionada → visível para toda a equipe com acesso ao módulo de Clientes.

### Eventos consumidos
- Pedido criado com celular → cliente é criado ou atualizado automaticamente.
- Pedido entregue → LTV do cliente é atualizado.

### Permissões
- **ADMIN:** visualizar tudo, editar dados, adicionar/remover notas, inativar.
- **ATENDIMENTO:** visualizar perfil e histórico, adicionar notas.
- **PRODUCAO:** sem acesso.
- **FINANCEIRO:** visualizar LTV e histórico de pagamentos.
- **Cliente:** visualiza apenas seu próprio histórico de pedidos em `/pedidos`.

### Indicadores
- Total de clientes ativos.
- Clientes novos no mês.
- Clientes recorrentes (mais de 1 pedido).
- Ranking por LTV (valor total gasto).
- Frequência média de compra.

### Integrações
- **WhatsApp:** login via OTP (código enviado pelo WhatsApp) — planejado para Fase 8.

### Riscos
- Celular incorreto registrado → cliente perde acesso ao histórico e não recebe notificações.
- Anotações internas com linguagem inapropriada podem gerar problemas se exibidas indevidamente.
- Deduplicação: cliente que troca de celular cria um cadastro duplicado.

### Futuras evoluções
- **(planejado)** Endereço padrão sugerido automaticamente no próximo checkout.
- **(planejado)** Alerta de aniversário do cliente (data de aniversário como campo opcional).
- **(planejado)** Histórico de preferências por produto ou sabor.
- **(planejado)** Segmentação de clientes por frequência ou LTV para campanhas.

---

## Módulo 6 — Fornecedores

### Objetivo
Centraliza o cadastro de todas as empresas e pessoas que fornecem ingredientes e embalagens para a confeitaria. Um fornecedor cadastrado pode ser vinculado a ingredientes e embalagens, permitindo rastrear de onde vem cada insumo, a que preço e em qual prazo. Isso facilita o controle de compras, a negociação de preços e a análise de dependência por fornecedor.

**Status atual:** não implementado como entidade própria. Schema planejado para o Módulo 2.A.

### Quem usa
Paulo (ADMIN) para cadastrar e gerenciar. Sistema para vincular a ingredientes e embalagens.

### Fluxo principal
1. Paulo acessa o módulo de Fornecedores.
2. Clica em "Novo fornecedor".
3. Preenche nome, telefone, CNPJ (opcional), tipo de insumo fornecido.
4. Salva.
5. Ao cadastrar um ingrediente, seleciona o fornecedor na lista.
6. O sistema registra a relação: ingrediente → fornecedor.

### Entradas
- Nome comercial ou razão social (obrigatório)
- CNPJ (opcional)
- Telefone e/ou WhatsApp de contato
- E-mail
- Tipo de insumo fornecido (Ingredientes, Embalagens, ou ambos)
- Prazo médio de entrega em dias
- Observações (condições de pagamento, mínimo de compra, etc.)

### Saídas
- Fornecedor disponível para vinculação com ingredientes e embalagens.
- Histórico de compras por fornecedor (planejado).

### Dependências
Nenhuma — é um cadastro base.

### Regras de negócio
- Fornecedor inativo não aparece nas listas de seleção de ingredientes e embalagens.
- Fornecedor com ingredientes vinculados não pode ser excluído — apenas inativado.
- CNPJ, quando informado, deve ser único no sistema.

### Eventos produzidos
- Novo fornecedor cadastrado → disponível para vinculação imediata.
- Fornecedor inativado → removido das listas de seleção em novos cadastros.

### Eventos consumidos
- Ingrediente vinculado a este fornecedor → não pode ser excluído.
- Compra registrada com este fornecedor → aparece no histórico do fornecedor.

### Permissões
- **ADMIN:** criar, editar, inativar.
- **ATENDIMENTO:** visualizar.
- **PRODUCAO:** visualizar.
- **FINANCEIRO:** visualizar e consultar histórico de compras.

### Indicadores
- Número de fornecedores ativos.
- Ingredientes por fornecedor.
- Valor total comprado por fornecedor no período (planejado).
- Variação de preço média por fornecedor no trimestre (planejado).

### Integrações
- Nenhuma integração externa no escopo atual.
- **(planejado)** Importação de tabela de preços via e-mail ou planilha.

### Riscos
- Dependência excessiva de um único fornecedor para ingredientes críticos (ex: chocolate) gera risco de desabastecimento.
- Fornecedor com preço desatualizado no sistema → custo de ingrediente incorreto → precificação errada.

### Futuras evoluções
- **(planejado)** Módulo de Compras: gerar pedido de compra diretamente para o fornecedor via WhatsApp.
- **(planejado)** Avaliação de fornecedores por qualidade e pontualidade.
- **(planejado)** Cotação múltipla: comparar preços de diferentes fornecedores para o mesmo ingrediente.

---

## Módulo 7 — Ingredientes

### Objetivo
Controla todas as matérias-primas usadas na produção da confeitaria. Cada ingrediente tem um preço atual, um histórico de variações de preço, uma quantidade em estoque e um fornecedor vinculado. Ingredientes são a base dos custos de produção — o preço de cada ingrediente alimenta diretamente o cálculo do custo de todas as receitas que o utilizam.

**Status atual:** schema completo. CRUD administrativo não implementado.

### Quem usa
Paulo (ADMIN) e Marina (PRODUCAO) para consulta. Sistema para cálculo automático de custos.

### Fluxo principal
1. Paulo acessa o módulo de Ingredientes.
2. Clica em "Novo ingrediente".
3. Preenche: nome, unidade de medida, preço atual de compra, fornecedor, estoque atual e estoque mínimo.
4. Salva.
5. Ao registrar uma compra, o preço é atualizado automaticamente com o novo valor pago.
6. O sistema recalcula o custo de todas as receitas que usam esse ingrediente.

### Entradas
- Nome do ingrediente (obrigatório, ex: "Chocolate meio amargo 70%")
- Unidade de medida (obrigatório, ex: kg, g, ml, unidade)
- Preço atual de compra por unidade (obrigatório)
- Fonte do preço (Manual, Nota Fiscal, CONAB, CEPEA)
- Fornecedor (opcional)
- Categoria do ingrediente (ex: Chocolates, Farinhas, Laticínios)
- Estoque atual (quantidade disponível)
- Estoque mínimo (quantidade que dispara alerta)

### Saídas
- Custo de ingrediente disponível para cálculo de receitas.
- Alerta de estoque mínimo quando `estoque atual ≤ estoque mínimo`.
- Histórico completo de variações de preço com data e fonte.

### Dependências
- **Unidades de medida** devem existir antes de cadastrar ingredientes.
- **Fornecedores** devem existir para vinculação (opcional).

### Regras de negócio
- Todo ingrediente deve ter nome, unidade e preço atual.
- Toda atualização de preço gera um registro histórico com data, valor anterior e novo valor.
- Ingrediente inativo não pode ser adicionado a novas receitas; receitas existentes mantêm o vínculo.
- Ingrediente com receitas vinculadas não pode ser excluído — apenas inativado.
- Estoque não pode ser negativo (exceto com autorização expressa do ADMIN).
- Quando o preço é atualizado, o custo de TODAS as receitas que usam esse ingrediente é recalculado automaticamente.

### Eventos produzidos
- Preço atualizado → recalcula custo de todas as receitas vinculadas → recalcula `costPrice` de todos os produtos vinculados.
- Estoque abaixo do mínimo → alerta exibido no dashboard.

### Eventos consumidos
- Compra registrada → estoque aumenta e preço é atualizado.
- Produção confirmada → estoque diminui proporcionalmente à receita × quantidade produzida (planejado).

### Permissões
- **ADMIN:** criar, editar preço, editar estoque, inativar.
- **ATENDIMENTO:** visualizar lista.
- **PRODUCAO:** visualizar estoque e receitas vinculadas.
- **FINANCEIRO:** visualizar preços e histórico.

### Indicadores
- Total de ingredientes ativos.
- Ingredientes com estoque abaixo do mínimo.
- Custo médio por categoria de ingrediente.
- Ingredientes com maior variação de preço no período.
- Ingredientes de maior impacto no CMV.

### Integrações
- **(planejado)** CONAB/CEASA: importação automática de preços de ingredientes agrícolas.
- **(planejado)** CEPEA: preços de commodities agropecuárias.

### Riscos
- Preço desatualizado → custo de receita irreal → margem calculada incorretamente.
- Estoque zerado sem alerta → produção bloqueada no dia do pedido.
- Ingrediente sem fornecedor cadastrado → dificuldade de reposição rápida.

### Futuras evoluções
- **(planejado)** Controle por lote com data de validade.
- **(planejado)** Política FEFO (primeiro a vencer, primeiro a sair) na baixa de estoque.
- **(planejado)** Percentual de perda no uso (evaporação, quebra) por ingrediente.
- **(planejado)** Sugestão automática de compra baseada em pedidos futuros e estoque atual.

---

## Módulo 8 — Embalagens

### Objetivo
Controla os materiais de acondicionamento usados nos produtos da confeitaria: caixas, saquinhos, fitas, etiquetas, lacres e itens similares. Embalagens têm custo unitário, estoque próprio e se vinculam às receitas como componentes do custo total do produto. Sem controle de embalagens, o custo de produção fica subestimado e a precificação fica incorreta.

**Status atual:** não implementado. Entidade planejada para o Módulo 2.A do ÉPICO 2.

### Quem usa
Paulo (ADMIN) para gerenciar cadastro e estoque. Sistema para incluir no cálculo de custo das receitas.

### Fluxo principal
1. Paulo acessa o módulo de Embalagens.
2. Clica em "Nova embalagem".
3. Preenche: nome, tipo (caixa, saquinho, fita, etiqueta, outro), custo unitário, estoque atual e estoque mínimo.
4. Salva.
5. Ao criar ou editar uma receita, Paulo vincula as embalagens necessárias e a quantidade por lote produzido.
6. O sistema inclui o custo das embalagens no custo total da receita.

### Entradas
- Nome da embalagem (obrigatório, ex: "Caixa 25cm kraft")
- Tipo: Caixa, Saquinho, Fita, Etiqueta, Lacre, Outro
- Custo unitário (obrigatório)
- Fornecedor (opcional)
- Estoque atual
- Estoque mínimo de reposição

### Saídas
- Custo de embalagem incluído no custo total de produção da receita.
- Alerta de estoque mínimo.
- Estoque de embalagens controlado com entradas e saídas registradas.

### Dependências
- **Fornecedores** devem existir para vinculação (opcional).

### Regras de negócio
- Embalagem inativa não pode ser adicionada a novas receitas; receitas existentes mantêm o vínculo.
- O custo da embalagem compõe o `costPrice` do produto.
- Embalagem com receitas vinculadas não pode ser excluída — apenas inativada.
- Toda atualização de custo unitário gera um registro de histórico de preço.
- Estoque não pode ser negativo sem autorização do ADMIN.

### Eventos produzidos
- Custo de embalagem atualizado → custo das receitas vinculadas é recalculado.
- Estoque abaixo do mínimo → alerta exibido no painel.

### Eventos consumidos
- Produção confirmada → estoque de embalagem diminui conforme vinculação na receita (planejado).

### Permissões
- **ADMIN:** criar, editar, inativar, ajustar estoque.
- **ATENDIMENTO:** visualizar.
- **PRODUCAO:** visualizar estoque e receitas vinculadas.
- **FINANCEIRO:** visualizar custo e histórico.

### Indicadores
- Embalagens com estoque abaixo do mínimo.
- Custo médio de embalagem por produto.
- Participação das embalagens no custo total de produção.

### Integrações
- Nenhuma integração externa planejada para embalagens.

### Riscos
- Embalagem não incluída no custo → produto vendido com margem menor do que a calculada.
- Estoque zerado próximo a data de entrega → produto produzido sem como embalar.

### Futuras evoluções
- **(planejado)** Embalagem "premium" como opção paga no checkout (ex: caixa para presente com laço).
- **(planejado)** Controle de lote com data de fabricação para materiais perecíveis.

---

## Módulo 9 — Receitas

### Objetivo
Digitaliza o conhecimento produtivo da confeitaria. Uma receita descreve o processo de fazer um item: quais ingredientes usar, em que quantidades, quantas unidades o processo rende e quanto tempo leva. As receitas são o coração do ERP — conectam os ingredientes comprados aos produtos vendidos e tornam o cálculo de custo automático e confiável.

**Status atual:** schema completo. CRUD não implementado.

### Quem usa
Paulo (ADMIN) e Marina (PRODUCAO) para criar e consultar. Sistema para calcular custos.

### Fluxo principal
1. Paulo acessa o módulo de Receitas.
2. Clica em "Nova receita" (ex: "Massa de chocolate 25cm").
3. Preenche: nome, rendimento (ex: 1 bolo de 25cm), tempo de preparo estimado.
4. Adiciona ingredientes: seleciona na lista, informa a quantidade usada e a unidade.
5. Adiciona embalagens: seleciona na lista, informa a quantidade por lote.
6. O sistema calcula automaticamente o custo da receita.
7. Salva e vincula ao produto correspondente.

### Entradas
- Nome da receita (obrigatório)
- Rendimento: quantidade produzida por execução (ex: "1 bolo", "30 unidades", "500g")
- Tempo de preparo em minutos (opcional)
- Lista de ingredientes com quantidade e unidade de medida por execução
- Lista de embalagens com quantidade por lote produzido

### Saídas
- Custo calculado da receita (soma de ingredientes + embalagens + mão de obra proporcional).
- Custo por unidade produzida.
- Base para o cálculo do `costPrice` do produto.
- Consolidação de ingredientes no dashboard de produção.

### Dependências
- **Ingredientes** devem estar cadastrados com preço atual.
- **Embalagens** devem estar cadastradas com custo unitário.
- **Unidades de medida** com conversões configuradas.

### Regras de negócio
- Toda receita deve ter pelo menos um ingrediente.
- O custo é recalculado automaticamente sempre que o preço de um ingrediente ou embalagem vinculado for atualizado.
- Receita inativa não pode ser vinculada a novos produtos.
- Receita vinculada a um produto em produção não pode ser alterada sem registro de nova versão (planejado).
- O rendimento define o divisor do custo total: custo_total ÷ rendimento = custo por unidade.

### Eventos produzidos
- Receita criada/atualizada → custo do produto vinculado é recalculado.
- Receita vinculada a um produto → produto passa a exibir custo calculado.

### Eventos consumidos
- Ingrediente com preço atualizado → custo de todas as receitas vinculadas é recalculado.
- Embalagem com custo atualizado → custo de todas as receitas vinculadas é recalculado.
- Pedido em produção → receita fornece lista de ingredientes para consolidação no dashboard.

### Permissões
- **ADMIN:** criar, editar, inativar, vincular a produtos.
- **PRODUCAO:** visualizar receitas completas com ingredientes e quantidades.
- **ATENDIMENTO:** visualizar nome e rendimento.
- **FINANCEIRO:** visualizar custo calculado.

### Indicadores
- Receitas com custo calculado mais alto.
- Receitas com maior impacto no CMV total.
- Ingrediente com maior peso no custo das receitas mais vendidas.

### Integrações
- Nenhuma integração externa direta.

### Riscos
- Receita sem embalagem cadastrada → custo subestimado.
- Rendimento incorreto registrado → custo por unidade errado → precificação errada.
- Receita vinculada a ingrediente sem preço definido → custo parcial (ingrediente conta como zero).

### Futuras evoluções
- **(planejado)** Versão de receita: ao alterar uma receita, manter versão anterior vinculada a pedidos já em produção.
- **(planejado)** Tempo de descanso e tempo de decoração separados do preparo.
- **(planejado)** Percentual de perda por ingrediente (ex: 5% de farinha perdida no processo).
- **(planejado)** Fichas técnicas com foto de cada etapa para padronização de produção.

---

## Módulo 10 — Custos

### Objetivo
O módulo de Custos não é uma tela de cadastro — é um motor de cálculo automático que opera em segundo plano. Toda vez que o preço de um ingrediente muda, toda vez que uma embalagem é vinculada a uma receita, ou toda vez que os parâmetros de mão de obra e custos fixos são ajustados na configuração, o custo de produção de cada produto é recalculado automaticamente. O resultado é sempre o custo real, não uma estimativa desatualizada.

**Status atual:** estrutura de custo existe no schema (campo `costPrice` em produto). Cálculo automático não implementado.

### Quem usa
Sistema (automático). Paulo (ADMIN) para consultar e tomar decisões de precificação.

### Fluxo de cálculo
```
Custo dos ingredientes
  = Σ (quantidade usada na receita × preço atual do ingrediente)
    para cada ingrediente de cada receita vinculada ao produto

Custo das embalagens
  = Σ (quantidade de embalagem por lote × custo unitário da embalagem)
    para cada embalagem de cada receita vinculada

Custo de mão de obra
  = (tempo de preparo em horas × custo da hora de mão de obra configurado na empresa)

Rateio de custos fixos
  = custos fixos mensais ÷ unidades produzidas por mês estimadas

CUSTO TOTAL DO PRODUTO
  = custo dos ingredientes + custo das embalagens + custo de mão de obra + rateio dos fixos
```

**Exemplo prático:**
- Ingredientes: R$ 45,00
- Embalagem: R$ 8,50
- Mão de obra: 2h × R$ 35,00 = R$ 70,00
- Rateio fixo: R$ 2.000 ÷ 200 un = R$ 10,00
- **Custo total: R$ 133,50**

### Entradas
- Preços atuais de todos os ingredientes.
- Custos de todas as embalagens vinculadas às receitas.
- Parâmetros da Configuração da Empresa: custo da mão de obra por hora, custos fixos mensais, produção estimada por mês.
- Tempo de preparo registrado em cada receita.

### Saídas
- `costPrice` atualizado em cada produto.
- Custo unitário de cada receita.
- Custo por ingrediente, por embalagem e por rateio (detalhamento planejado).

### Dependências
- **Receitas** com ingredientes e embalagens vinculados.
- **Ingredientes** com preços atualizados.
- **Embalagens** com custo unitário definido.
- **Configuração da Empresa** com parâmetros de custo.

### Regras de negócio
- O `costPrice` do produto nunca é editado manualmente — sempre calculado pelo sistema.
- A alteração de qualquer componente do custo dispara o recálculo automático.
- Produto sem receitas vinculadas tem `costPrice = 0` (desconhecido).
- Ingrediente sem preço definido conta como zero no custo (com alerta visual).

### Eventos produzidos
- `costPrice` atualizado → Módulo de Precificação recalcula margem e preço sugerido.
- Produto com `basePrice < costPrice` → alerta gerado para o ADMIN.

### Eventos consumidos
- Preço de ingrediente atualizado → recálculo imediato do custo dos produtos afetados.
- Embalagem com custo atualizado → recálculo dos produtos afetados.
- Parâmetros de empresa atualizados → recálculo de todos os produtos.

### Permissões
- **Sistema:** executa cálculos automaticamente.
- **ADMIN, FINANCEIRO:** visualizar detalhamento do custo por produto.
- **PRODUCAO:** visualizar custo resumido (sem detalhamento financeiro).

### Indicadores
- Produtos com custo acima do preço de venda.
- Ingrediente com maior impacto no custo total do produto mais vendido.
- Variação de custo médio dos produtos no mês.

### Integrações
- Integra internamente com Ingredientes, Embalagens, Receitas e Configuração da Empresa.

### Riscos
- Custo incompleto por falta de embalagem na receita → preço de venda subestimado.
- Custo de mão de obra incorreto → margem real diferente da calculada.
- Custos fixos zerados (padrão) → custo calculado subestimado até que Paulo configure o valor real.

### Futuras evoluções
- **(planejado)** Snapshot do custo no momento da produção (o custo pode mudar após o pedido ser feito).
- **(planejado)** Taxa de plataforma e cartão de crédito incluída no custo.
- **(planejado)** Centro de custo por categoria de produto.

---

## Módulo 11 — Precificação

### Objetivo
O módulo de Precificação é uma calculadora que transforma o custo de produção em um preço de venda recomendado. Dado o custo total calculado pelo Módulo de Custos e a margem de lucro alvo configurada pelo dono na Configuração da Empresa, o sistema sugere o preço mínimo para não ter prejuízo e o preço recomendado para atingir a margem desejada. A decisão final do preço sempre cabe ao Paulo — o sistema sugere, o dono decide.

**Status atual:** estrutura existe, mas cálculo automático e tela de precificação não implementados.

### Quem usa
Paulo (ADMIN) para revisar e definir preços finais. Sistema para calcular e sugerir.

### Fluxo de cálculo
```
Preço mínimo (ponto de equilíbrio)
  = Custo total do produto

Preço sugerido (com margem alvo)
  = Custo total ÷ (1 − margem alvo em decimal)

Exemplo com custo R$ 133,50 e margem 50%:
  Preço mínimo = R$ 133,50
  Preço sugerido = R$ 133,50 ÷ (1 − 0,50) = R$ 267,00
  Margem real ao praticar R$ 280,00 = (280 − 133,50) ÷ 280 = 52,3%
```

### Fluxo principal
1. Paulo acessa a tela de Produtos e abre um produto específico.
2. O sistema exibe: custo calculado, preço mínimo, preço sugerido e margem atual.
3. Se o preço praticado estiver abaixo do custo, um alerta vermelho é exibido.
4. Paulo ajusta o preço de venda conforme julgamento (mercado, concorrência, posicionamento).
5. Salva o novo preço.
6. O sistema recalcula e exibe a nova margem.

### Entradas
- Custo total do produto (calculado pelo Módulo de Custos).
- Margem alvo configurada na Configuração da Empresa.
- Preço de venda praticado (definido manualmente por Paulo).

### Saídas
- Preço mínimo para não ter prejuízo.
- Preço sugerido para atingir a margem alvo.
- Margem real com o preço praticado.
- Alerta quando `preço praticado < custo`.

### Dependências
- **Custos** — precisa do custo total calculado.
- **Configuração da Empresa** — precisa da margem alvo.

### Regras de negócio
- O sistema nunca altera o preço de venda automaticamente — apenas sugere.
- Quando o custo dos ingredientes muda, o preço sugerido é recalculado mas o preço praticado permanece o mesmo (com alerta se necessário).
- Produto com preço abaixo do custo gera alerta visível na lista de produtos e no dashboard.

### Eventos produzidos
- Custo recalculado → nova sugestão de preço exibida.
- Produto com margem negativa → alerta no dashboard administrativo.

### Eventos consumidos
- `costPrice` atualizado pelo Módulo de Custos → recálculo imediato do preço sugerido.
- Margem alvo alterada na Configuração → recálculo dos preços sugeridos de todos os produtos.

### Permissões
- **ADMIN:** visualizar e editar preços.
- **FINANCEIRO:** visualizar margem e custo.
- **ATENDIMENTO, PRODUCAO:** sem acesso ao custo nem ao preço sugerido.

### Indicadores
- Número de produtos com margem abaixo da meta.
- Número de produtos com margem negativa (venda com prejuízo).
- Margem média por categoria.
- Produto com maior e menor margem.

### Integrações
- Integra internamente com Custos, Produtos e Configuração da Empresa.

### Riscos
- Margem alvo não configurada (padrão 50%) pode não refletir a realidade do negócio.
- Praticar preço abaixo do custo por período prolongado compromete a saúde financeira.
- Custo incompleto (sem embalagem ou mão de obra) → preço sugerido incorreto.

### Futuras evoluções
- **(planejado)** Comparativo de preços com produtos similares do mercado.
- **(planejado)** Simulador: "se eu mudar a margem alvo, quais produtos precisariam ter o preço ajustado?"
- **(planejado)** Preço por canal (balcão vs. encomenda vs. atacado).

---

## Módulo 12 — Produção

### Objetivo
Organiza o trabalho diário da confeitaria. Marina (confeiteira) abre o sistema toda manhã e vê exatamente o que precisa produzir, em que quantidade e com quais ingredientes. O Kanban mostra os pedidos organizados por status: Confirmado → Em Produção → Pronto → Entregue. A consolidação de ingredientes soma automaticamente tudo que será necessário para os pedidos do dia, eliminando a necessidade de calcular manualmente.

**Status atual:** tela de produção implementada com dados de exemplo. Dados reais e consolidação automática não implementados.

### Quem usa
Marina (PRODUCAO) como usuária principal no dia a dia. Carla (ATENDIMENTO) para consultar status. Paulo (ADMIN) para visão gerencial.

### Fluxo principal
1. Marina abre o sistema no tablet às 7h.
2. Visualiza a aba "Hoje" com os pedidos do dia.
3. A seção "Urgente" destaca em vermelho pedidos com entrega naquele dia.
4. A consolidação de ingredientes exibe a lista total: "farinha: 2,5 kg · chocolate: 1,2 kg · ovos: 24 un..."
5. Marina separa os ingredientes e inicia a produção do pedido urgente.
6. Move o card do pedido urgente para "Em Produção" — o cliente recebe notificação WhatsApp (planejado).
7. Finaliza o bolo e move para "Pronto".
8. Confere os pedidos de amanhã para antecipar compras pendentes.

### Entradas
- Pedidos confirmados com data de entrega.
- Receitas vinculadas aos produtos dos pedidos.
- Quantidades de ingredientes por receita.

### Saídas
- Kanban visual dos pedidos por status.
- Lista consolidada de ingredientes necessários para o período.
- Mudança de status do pedido com registro em histórico.
- Notificações WhatsApp automáticas ao cliente por mudança de status (planejado).

### Dependências
- **Pedidos** confirmados — sem pedidos, não há produção.
- **Receitas** vinculadas aos produtos — necessário para a consolidação de ingredientes.
- **Ingredientes** com estoque registrado — para alertas de insuficiência.

### Regras de negócio
- O pedido pode avançar de status somente na ordem: Confirmado → Em Produção → Pronto → Saiu para Entrega → Entregue.
- Regressão de status (ex: Pronto → Em Produção) exige autorização do ADMIN.
- Toda mudança de status é registrada com data, hora e responsável.
- Pedido urgente = entrega no dia corrente; deve aparecer no topo com destaque visual.
- A consolidação de ingredientes é calculada somando todos os pedidos do período selecionado.

### Eventos produzidos
- Status → EM_PRODUCAO: cliente recebe WhatsApp "sua encomenda entrou em produção" (planejado).
- Status → PRONTO: cliente recebe WhatsApp "sua encomenda está pronta" (planejado).
- Status → SAIU_ENTREGA: cliente recebe WhatsApp "sua encomenda saiu para entrega" (planejado).
- Status → ENTREGUE: financeiro registra a receita (planejado).

### Eventos consumidos
- Novo pedido confirmado → aparece no Kanban no dia da entrega.
- Pedido cancelado → removido do Kanban.

### Permissões
- **PRODUCAO:** visualizar tudo, mover cards de status, registrar anotações.
- **ATENDIMENTO:** visualizar tudo, mover cards até PRONTO, adicionar notas.
- **ADMIN:** acesso completo, incluindo regressão de status.
- **FINANCEIRO:** visualizar, sem mover cards.

### Indicadores
- Pedidos produzidos por dia.
- Tempo médio de produção por produto (do pedido confirmado ao status pronto).
- Pedidos em atraso (data de entrega passada, status antes de Entregue).
- Taxa de cumprimento de prazo no mês.

### Integrações
- **WhatsApp:** notificações automáticas por mudança de status (planejado — Fase 5).

### Riscos
- Consolidação incorreta se receita não estiver cadastrada → ingrediente não aparece na lista.
- Pedido urgente sem visualização clara → atraso na entrega.
- Estoque insuficiente identificado tarde → produção bloqueada no dia da entrega.

### Futuras evoluções
- **(planejado)** Consumo automático de estoque ao confirmar produção.
- **(planejado)** Registro de rendimento real vs. esperado (para identificar perdas).
- **(planejado)** Alerta preventivo: "ingrediente X insuficiente para os pedidos de amanhã".
- **(planejado)** Calendário de produção: visão semanal/mensal de carga de trabalho.

---

## Módulo 13 — Pedidos

### Objetivo
Registra e gerencia o ciclo completo de uma encomenda: desde que o cliente finaliza o checkout até a entrega e o pagamento. O pedido é o documento central do negócio — conecta o cliente ao produto, o produto à produção, a produção à entrega e a entrega ao financeiro. Nenhum pedido é jamais excluído do sistema; apenas cancelado, com o motivo registrado.

**Status atual:** fluxo de checkout completo na vitrine. Persistência no banco implementada. Listagem de pedidos do cliente implementada.

### Quem usa
Ana (cliente) para encomendar e acompanhar. Carla (ATENDIMENTO) para gerenciar. Marina (PRODUCAO) para produzir. Paulo (ADMIN) para supervisionar. Sistema para orquestrar todo o fluxo.

### Fluxo principal
1. Ana seleciona produtos na vitrine e adiciona ao carrinho.
2. Acessa o checkout, define data de entrega, tipo de entrega, endereço e forma de pagamento.
3. Confirma o pedido.
4. O sistema cria o pedido, envia confirmação por WhatsApp (planejado) e exibe o número do pedido.
5. Carla revisa o pedido no painel administrativo.
6. A produção inicia quando Marina move o pedido para "Em Produção".
7. Ao finalizar, o status muda para "Pronto".
8. Após entrega, Carla confirma o status "Entregue" e o pagamento é registrado.

### Entradas
- Itens do carrinho com quantidade e observações individuais
- Data de entrega (respeitando prazo mínimo de cada produto)
- Tipo de entrega (Retirada, Entrega Gratuita, Entrega por App)
- Endereço de entrega (quando não for retirada)
- Forma de pagamento
- Observação geral do pedido
- Fotos de referência para personalização (planejado)

### Saídas
- Número único do pedido.
- Confirmação ao cliente via WhatsApp (planejado).
- Pedido visível no painel de produção.
- Registro financeiro ao confirmar pagamento (planejado).

### Dependências
- **Produtos** ativos no catálogo.
- **Clientes** cadastrados (criados automaticamente no checkout).
- **Configuração da Empresa** para validar raio de entrega gratuita e forma de pagamento PIX.

### Regras de negócio
- Pedido nunca é excluído — apenas cancelado, com motivo registrado.
- A data de entrega mínima é calculada pelo maior prazo de produção entre todos os itens do carrinho.
- Finais de semana não são dias de entrega: o prazo avança automaticamente para a segunda-feira.
- Os dados do produto (nome, preço) são registrados no momento do pedido e não mudam mesmo que o produto seja alterado depois.
- Toda mudança de status é registrada com data, hora e responsável.
- Pedido não pode regredir de status sem autorização do ADMIN.
- Valor total do pedido não pode ser alterado após confirmação sem aprovação do ADMIN.

### Eventos produzidos
- Pedido confirmado → aparece no Kanban de produção + notificação WhatsApp ao cliente (planejado).
- Status atualizado → notificação WhatsApp correspondente ao cliente (planejado).
- Pedido entregue com pagamento confirmado → receita registrada no financeiro (planejado).
- Pedido cancelado → registro de cancelamento; se pago, inicia processo de estorno (planejado).

### Eventos consumidos
- Produto inativado → pedidos existentes com esse produto não são afetados.
- Parâmetros de entrega atualizados → aplicados a novos pedidos, não a pedidos já criados.

### Permissões
- **ADMIN:** criar, editar, cancelar, alterar status para qualquer valor, editar valor.
- **ATENDIMENTO:** criar, editar antes de EM_PRODUCAO, avançar status até PRONTO, cancelar.
- **PRODUCAO:** visualizar, avançar status de EM_PRODUCAO para PRONTO.
- **FINANCEIRO:** visualizar, registrar pagamentos.
- **Cliente:** criar pedido próprio, visualizar seu histórico, cancelar pedido antes de EM_PRODUCAO.

### Indicadores
- Pedidos por dia/semana/mês.
- Pedidos por status (quantos estão em produção, prontos, aguardando).
- Taxa de cancelamento.
- Ticket médio.
- Prazo médio de produção.

### Integrações
- **WhatsApp:** notificações automáticas ao cliente por mudança de status (planejado).
- **PIX:** confirmação automática de pagamento via webhook (planejado).

### Riscos
- Pedido duplicado por clique duplo no checkout → validar idempotência no servidor.
- Data de entrega no passado aceita → validação precisa ser feita tanto na UI quanto no servidor.
- Cancelamento após início da produção → custo de ingredientes já consumidos não recuperado.

### Futuras evoluções
- **(planejado)** Aprovação manual de encomendas de alto valor antes de confirmar.
- **(planejado)** Sinal/depósito obrigatório acima de determinado valor.
- **(planejado)** Fotos de referência anexadas pelo cliente no checkout.
- **(planejado)** Edição de data de entrega pelo atendente com notificação ao cliente.

---

## Módulo 14 — Entrega

### Objetivo
Gerencia as opções de entrega disponíveis para cada pedido. A confeitaria oferece três modalidades: o cliente retira pessoalmente (sem custo), a confeitaria entrega gratuitamente dentro do raio configurado, ou o cliente paga a entrega via aplicativo externo (Uber Entregas ou 99). A validação de distância é feita via Google Maps para garantir elegibilidade à entrega gratuita.

**Status atual:** tipos de entrega implementados no checkout. Validação de distância via Google Maps não implementada.

### Quem usa
Ana (cliente) para escolher a modalidade. Sistema para validar elegibilidade. Carla (ATENDIMENTO) para confirmar logística.

### Fluxo principal
1. Ana chega à etapa de entrega no checkout.
2. O sistema exibe três opções.
3. Se Ana escolher "Entrega Gratuita", preenche o endereço e o sistema calcula a distância até a confeitaria via Google Maps (planejado).
4. Se a distância for menor que o raio configurado (ex: 3 km), a opção é habilitada.
5. Se a distância ultrapassar o raio, apenas "Retirada" e "Entrega por App" ficam disponíveis.
6. Ana confirma e o tipo de entrega fica registrado no pedido.

### Modalidades de entrega

| Modalidade | Descrição | Quem paga |
|-----------|-----------|-----------|
| **Retirada** | Cliente vai buscar no endereço da confeitaria | Ninguém |
| **Entrega Gratuita** | Confeitaria entrega até X km do seu endereço | Confeitaria |
| **Entrega por App** | Pedido de motoboy via Uber Entregas ou 99 | Cliente |

### Entradas
- Tipo de entrega escolhido pelo cliente.
- Endereço de entrega (quando não for retirada).
- Raio de entrega gratuita configurado na Configuração da Empresa.
- Coordenadas da confeitaria e do endereço de entrega (para cálculo de distância).

### Saídas
- Tipo de entrega registrado no pedido.
- Distância calculada registrada no pedido.
- Taxa de entrega (R$ 0,00 para retirada e entrega gratuita; calculada para entrega por app).

### Dependências
- **Configuração da Empresa** — raio de entrega gratuita.
- **Pedidos** — a entrega é uma dimensão do pedido.

### Regras de negócio
- Entrega Gratuita só está disponível se o endereço do cliente for menor ou igual ao raio configurado.
- Para Retirada, nenhum endereço é obrigatório.
- Taxa de entrega por app é de responsabilidade do cliente e não compõe o total do pedido (é paga diretamente ao entregador).
- O endereço informado no checkout é salvo no perfil do cliente para uso futuro (planejado).

### Eventos produzidos
- Tipo de entrega definido → registrado no pedido.
- Distância calculada → registrada para auditoria e relatórios.

### Eventos consumidos
- Raio de entrega atualizado na configuração → aplicado a novos pedidos, não aos existentes.

### Permissões
- **Cliente:** escolhe a modalidade no checkout.
- **ATENDIMENTO:** pode alterar tipo de entrega em pedidos pendentes.
- **ADMIN:** acesso completo.

### Indicadores
- Distribuição de pedidos por tipo de entrega (retirada vs. gratuita vs. app).
- Custo total de entrega gratuita absorvido pela confeitaria no período.
- Distância média de pedidos com entrega gratuita.

### Integrações
- **Google Maps Distance Matrix API:** cálculo de distância entre endereço da confeitaria e endereço de entrega (planejado — Fase 5).

### Riscos
- Sem validação de distância: cliente seleciona "Entrega Gratuita" para endereço fora do raio → custo inesperado para a confeitaria.
- Endereço com CEP inválido → cálculo de distância falha.

### Futuras evoluções
- **(planejado)** Rastreamento em tempo real da entrega via Uber/99.
- **(planejado)** Horário preferido de entrega (faixa de manhã/tarde/noite).
- **(planejado)** Motoboy próprio: gestão de entregas com frota interna.

---

## Módulo 15 — Financeiro

### Objetivo
Consolida a visão financeira completa da confeitaria: o que entrou, o que saiu, o que está previsto para entrar e o que está previsto para sair. O módulo de Financeiro transforma os pedidos, compras e despesas em indicadores reais de saúde do negócio — faturamento, CMV, margem bruta, lucro operacional e DRE. Paulo (dono) usa este módulo para saber se o negócio está dando lucro e onde o dinheiro está indo.

**Status atual:** não implementado. Apenas `paymentStatus` nos pedidos existe. Módulo completo é ÉPICO 4.

### Quem usa
Paulo (ADMIN) e equipe de FINANCEIRO para registrar e analisar. Sistema para lançar receitas automaticamente a partir de pedidos pagos.

### Fluxo principal
1. Paulo acessa o módulo Financeiro.
2. Visualiza o resumo do mês: receita bruta, CMV, despesas, lucro estimado.
3. Acessa "Contas a Receber": pedidos confirmados com pagamento pendente.
4. Liga para cliente com pagamento atrasado e registra o recebimento manualmente.
5. Acessa "Contas a Pagar": compras de ingredientes e despesas fixas lançadas.
6. Registra pagamento de fornecedor.
7. Acessa o DRE para visão completa do resultado do período.

### Entradas
- Pedidos entregues com pagamento confirmado (lançados automaticamente como receita).
- Compras de ingredientes (lançadas automaticamente ao registrar compra — planejado).
- Despesas avulsas lançadas manualmente (aluguel, energia, embalagens avulsas).
- Pagamentos confirmados de clientes com pagamento pendente.

### Saídas
- Faturamento bruto do período.
- CMV (soma dos custos de produção dos pedidos entregues).
- Margem bruta.
- Contas a receber (pedidos com pagamento pendente).
- Contas a pagar (compras e despesas não pagas).
- Fluxo de caixa: entradas − saídas por período.
- DRE mensal.

### Dependências
- **Pedidos** entregues e com pagamento confirmado.
- **Custos** calculados para cada produto (para compor o CMV).
- **Compras** registradas (planejado) para lançar contas a pagar.

### Regras de negócio
- Movimentações financeiras nunca são excluídas — apenas estornadas, com registro.
- CMV é calculado a partir do `costPrice` dos produtos × quantidade em cada pedido entregue.
- Receita é lançada automaticamente quando o pedido muda para status Entregue e pagamento = Pago.
- Contas a receber originam-se de pedidos com pagamento ainda pendente.
- Nenhuma alteração de valor financeiro sem aprovação do ADMIN e registro de justificativa.

### Eventos produzidos
- Receita lançada → fluxo de caixa e DRE atualizados.
- Despesa lançada → contas a pagar e fluxo de caixa atualizados.

### Eventos consumidos
- Pedido → ENTREGUE com pagamento PAGO → lançamento automático de receita.
- Compra registrada → lançamento automático de despesa (planejado).

### Permissões
- **ADMIN:** acesso total — lançar, editar, estornar, exportar DRE.
- **FINANCEIRO:** visualizar e lançar movimentações; sem acesso a dados de produção.
- **ATENDIMENTO:** visualizar pagamentos de pedidos.
- **PRODUCAO:** sem acesso.

### Indicadores
- Faturamento bruto e líquido.
- CMV e margem bruta percentual.
- Lucro operacional estimado.
- Contas a receber vencidas.
- Ticket médio.
- Comparativo mensal (mês atual vs. mesmo período do ano anterior).

### Integrações
- **PIX:** confirmação automática de pagamento via webhook — ao receber confirmação, pedido muda para Pago e receita é lançada (planejado — Fase 5).

### Riscos
- CMV incorreto se `costPrice` dos produtos estiver desatualizado ou incompleto.
- Receita lançada em duplicidade se o webhook PIX for recebido mais de uma vez.
- Despesas fixas não lançadas → lucro calculado maior do que o real.

### Futuras evoluções
- **(planejado)** Conciliação bancária: cruzar extratos bancários com lançamentos do sistema.
- **(planejado)** Integração com Open Finance para importação automática de extratos.
- **(planejado)** Exportação de DRE em PDF para contador.
- **(planejado)** Fluxo de caixa projetado: soma de pedidos confirmados futuros + despesas programadas.

---

## Módulo 16 — Dashboard

### Objetivo
Oferece uma visão consolidada e em tempo real do estado do negócio. O Dashboard é dividido em dois perfis: o **Operacional**, voltado para a equipe de produção e atendimento (o que produzir hoje, pedidos urgentes, pedidos prontos), e o **Executivo**, voltado para Paulo (dono) com indicadores financeiros e estratégicos (faturamento do mês, margem, produtos mais vendidos).

**Status atual:** Dashboard Operacional implementado com dados de exemplo. Dashboard com dados reais não implementado.

### Quem usa
Marina (PRODUCAO) — foco no operacional. Carla (ATENDIMENTO) — foco no operacional. Paulo (ADMIN) — foco no executivo.

### Dashboard Operacional (Hoje)
Exibido ao abrir `/admin/producao`.

- **Pedidos do dia** — quantos pedidos têm entrega hoje.
- **Itens a produzir** — quantidade total de unidades para hoje.
- **Urgentes** — pedidos com horário de entrega mais cedo no dia, destacados em vermelho.
- **Kanban** — colunas: Confirmado · Em Produção · Pronto · Entregue.
- **Consolidação de ingredientes** — lista somada de tudo que será necessário para os pedidos do período selecionado.
- **Abas** — Hoje · Amanhã · Semana.

### Dashboard Executivo (Análise)
Exibido em `/admin` ou `/admin/dashboard` — planejado.

- **Faturamento do mês** — total de pedidos entregues e pagos.
- **Margem bruta** — faturamento menos CMV.
- **Ticket médio** — faturamento ÷ número de pedidos.
- **Produtos mais vendidos** — ranking por quantidade no mês.
- **Produtos com margem negativa** — alertas de precificação.
- **Estoque crítico** — ingredientes abaixo do mínimo.
- **Pedidos por status** — quantos estão em cada etapa.

### Entradas
- Pedidos com datas de entrega e status (para o operacional).
- Receitas dos pedidos e receitas vinculadas (para consolidação de ingredientes).
- Dados financeiros do período (para o executivo — planejado).

### Saídas
- Visão consolidada e acionável do estado do negócio.
- Alertas proativos (urgentes, estoque crítico, margem negativa).

### Dependências
- **Pedidos** com dados reais.
- **Receitas** vinculadas (para consolidação de ingredientes no operacional).
- **Ingredientes** com estoque registrado (para alertas de estoque crítico).
- **Custos e Financeiro** (para o dashboard executivo).

### Regras de negócio
- O dashboard operacional é atualizado em tempo real (ou com refresh manual).
- Pedido urgente = entrega no dia corrente; destacado no topo com cor de alerta.
- A consolidação de ingredientes some automáticamente quando todos os pedidos do período são marcados como Entregue.

### Permissões
- **PRODUCAO:** acesso somente ao dashboard operacional.
- **ATENDIMENTO:** acesso ao dashboard operacional.
- **FINANCEIRO:** acesso somente ao dashboard executivo (planejado).
- **ADMIN:** acesso a ambos.

### Indicadores
O dashboard É o módulo de indicadores — ver listas acima.

### Integrações
- Integra com todos os demais módulos para consolidar dados.

### Riscos
- Dashboard lento com muitos pedidos → necessidade de paginação e cache.
- Dados desatualizados por falta de refresh → decisões baseadas em estado incorreto.

### Futuras evoluções
- **(planejado)** Atualização automática em tempo real (WebSocket ou polling curto).
- **(planejado)** Dashboard executivo com gráficos de tendência mensal.
- **(planejado)** Alerta matinal via WhatsApp: resumo dos pedidos do dia enviado às 7h.
- **(planejado)** Exportação do dashboard como PDF ou imagem para reuniões.

---

## Módulo 17 — IA (Inteligência Artificial)

### Objetivo
O módulo de IA atua como um consultor silencioso que analisa os dados do sistema e faz sugestões proativas. Ele não toma decisões — Paulo sempre tem a palavra final. A IA identifica padrões que um ser humano levaria muito tempo para perceber: qual produto está sendo vendido com prejuízo, qual ingrediente mais impacta o custo, quando o estoque vai acabar antes do próximo pedido de compra, e qual período do ano tem maior demanda por cada tipo de produto.

**Status atual:** não implementado. Módulo planejado para ÉPICO futuro.

### Quem usa
Paulo (ADMIN) recebe sugestões e alertas. Sistema executa análises automaticamente em segundo plano.

### Funcionalidades planejadas

**Precificação inteligente:**
- Alerta quando o preço de um ingrediente sobe e o produto passa a ser vendido com margem negativa.
- Sugere o novo preço de venda necessário para manter a margem alvo.

**Análise de custo:**
- Identifica os 3 ingredientes que mais encarecem cada produto.
- Sugere substituição de ingrediente com base em alternativas de menor custo e rendimento similar.

**Previsão de demanda:**
- Analisa histórico de pedidos para identificar sazonalidade (ex: Dia das Mães, Natal).
- Sugere volume de compra de ingredientes com base nos pedidos esperados.

**Estoque inteligente:**
- Projeta quando o estoque de cada ingrediente vai acabar com base no ritmo de consumo.
- Alerta com antecedência suficiente para reposição antes de falta.

**Análise de lucratividade:**
- Gera resumo mensal em linguagem natural: "Sua margem bruta foi 52% em junho, 3 pontos acima de maio. O principal responsável foi a redução no preço do chocolate."
- Identifica automaticamente os 3 produtos mais lucrativos e os 3 que mais destroem margem.

**Assistente de atendimento:**
- Responde perguntas da atendente em linguagem natural: "Qual o prazo mínimo para um bolo de 3 andares?" — consulta as regras do sistema e responde.
- Sugere resposta para mensagens de clientes no WhatsApp com base no histórico do pedido.

### Entradas
- Histórico de pedidos (produtos, datas, quantidades, valores).
- Histórico de preços de ingredientes.
- Estoque atual e consumo histórico.
- Indicadores financeiros do período.
- Perguntas em linguagem natural da equipe (assistente).

### Saídas
- Alertas proativos no dashboard.
- Sugestões de ação com justificativa.
- Resumos em linguagem natural.
- Respostas a perguntas da equipe.

### Dependências
- **Todos os módulos** — a IA depende de dados históricos de qualidade para gerar sugestões relevantes.

### Regras de negócio
- A IA sugere; o usuário decide. Nenhuma ação é tomada automaticamente.
- Toda sugestão deve ter uma justificativa explicável (não caixas-pretas).
- O usuário pode descartar uma sugestão e o sistema registra o feedback.

### Permissões
- **ADMIN:** todas as funcionalidades.
- **FINANCEIRO:** análises de custo e lucratividade.
- **ATENDIMENTO:** assistente de atendimento.
- **PRODUCAO:** alertas de estoque e produção.

### Indicadores
- Taxa de aceitação de sugestões da IA.
- Impacto financeiro estimado de sugestões aceitas.

### Integrações
- **API de LLM (Claude / similar):** para geração de texto em linguagem natural e raciocínio sobre dados.

### Riscos
- Sugestões baseadas em dados incompletos podem ser enganosas.
- Dependência de serviço externo de IA com custo por uso.
- Usuários que ignoram alertas e perdem oportunidade de melhoria.

### Futuras evoluções
- **(planejado)** Criação de receitas sugeridas com base em ingredientes disponíveis em estoque.
- **(planejado)** Previsão de demanda por produto para planejamento de compras de longo prazo.
- **(planejado)** Análise comparativa com benchmarks do setor de confeitaria.

---

## Módulo 18 — WhatsApp

### Objetivo
O WhatsApp é o canal de comunicação central entre a confeitaria e seus clientes. O sistema usa o WhatsApp para dois propósitos distintos: autenticação segura do cliente via código de uso único (OTP) e notificações automáticas sobre o andamento dos pedidos. Cada mudança de status relevante — pedido confirmado, em produção, pronto, saiu para entrega — dispara automaticamente uma mensagem personalizada para o cliente, eliminando o trabalho manual de avisar por mensagem.

**Status atual:** log de WhatsApp existe no schema. Nenhuma integração ativa. OTP não implementado. Notificações não implementadas.

### Quem usa
Ana (cliente) recebe mensagens. Sistema envia mensagens automaticamente. Paulo (ADMIN) e Carla (ATENDIMENTO) consultam logs de envio.

### Fluxo 1: Autenticação OTP (login do cliente)
1. Ana acessa a vitrine e toca em "Finalizar pedido".
2. O sistema solicita o número de celular.
3. Ana digita o celular e toca em "Continuar".
4. O sistema gera um código de 6 dígitos com validade de 10 minutos.
5. Envia para o WhatsApp: *"Seu código Doce Menina: 847392. Válido por 10 minutos."*
6. Ana digita o código na tela.
7. O sistema valida: código correto, dentro do prazo, não utilizado antes.
8. Sessão criada. Ana prossegue para o checkout.

### Fluxo 2: Notificações automáticas de pedido
| Evento | Mensagem enviada |
|--------|-----------------|
| Pedido confirmado | "Olá Ana! Seu pedido #42 foi confirmado para entrega em 15/07. Qualquer dúvida, fale com a gente!" |
| Pedido em produção | "Sua encomenda #42 entrou em produção. Estamos caprichando! 🎂" |
| Pedido pronto | "Sua encomenda #42 está pronta! Entregamos hoje até as 18h." |
| Saiu para entrega | "Seu pedido #42 saiu para entrega! Fique de olho." |
| Pedido cancelado | "Infelizmente o pedido #42 foi cancelado. Entre em contato se tiver dúvidas." |

### Entradas
- Número de celular do cliente.
- Evento que dispara a notificação (mudança de status do pedido).
- Dados do pedido (número, data, produtos) para personalização da mensagem.

### Saídas
- Mensagem entregue no WhatsApp do cliente.
- Registro de log: data/hora, destinatário, mensagem, status do envio (sucesso/falha).

### Dependências
- **Clientes** com número de celular válido.
- **Pedidos** com eventos de mudança de status.

### Regras de negócio
- Código OTP tem validade de 10 minutos.
- Código OTP só pode ser usado uma vez — após uso, é invalidado.
- Código OTP expirado é recusado — deve ser solicitado um novo.
- Toda tentativa de envio (com sucesso ou falha) é registrada em log.
- Mensagem com falha no envio deve ser registrada com o erro — nunca descartada silenciosamente.
- Não há envio manual de mensagens pela equipe via sistema (WhatsApp pessoal é usado para isso).

### Eventos produzidos
- Mensagem enviada com sucesso → log registrado com status "enviado".
- Falha no envio → log registrado com status "falhou" e mensagem de erro.

### Eventos consumidos
- Pedido confirmado → dispara notificação de confirmação.
- Pedido → EM_PRODUCAO → dispara notificação de produção.
- Pedido → PRONTO → dispara notificação de pronto.
- Pedido → SAIU_ENTREGA → dispara notificação de saída.
- Pedido → CANCELADO → dispara notificação de cancelamento.

### Permissões
- **Sistema:** envia mensagens automaticamente.
- **ADMIN, ATENDIMENTO:** consultam logs de envio e status.
- **Cliente:** recebe mensagens (não acessa o sistema).

### Indicadores
- Taxa de entrega de mensagens (sucesso vs. falha).
- Tempo médio entre mudança de status e envio da notificação.
- Clientes com número inválido (falha de entrega recorrente).

### Integrações
- **Z-API ou Evolution API:** serviço de envio de mensagens WhatsApp via API REST.

### Riscos
- Número de celular do cliente incorreto → notificações não chegam.
- Número de WhatsApp bloqueado ou sem WhatsApp instalado → falha de entrega.
- Instância do WhatsApp desconectada → nenhuma mensagem é enviada até reconexão.
- Limite de envio da API excedido → throttling de mensagens.

### Futuras evoluções
- **(planejado)** Recepção de pedidos via WhatsApp: cliente envia mensagem de texto e o sistema cria o pedido automaticamente com parsing da linguagem natural.
- **(planejado)** Chatbot de atendimento: responde perguntas frequentes automaticamente.
- **(planejado)** Integração com WhatsApp Business verificado para maior confiabilidade e crachá oficial.

---

## Glossário

| Termo | Definição |
|-------|-----------|
| **Encomenda / Pedido** | Sinônimos — solicitação de produto feito com antecedência mínima, conforme o prazo de produção de cada item. |
| **Rendimento** | Quantidade de produto que uma receita produz por execução. Ex: "1 bolo de 25cm" ou "30 unidades de brigadeiro". |
| **Lote / Batch** | Conjunto de pedidos agrupados para produção simultânea, normalmente do mesmo dia de entrega. |
| **Consolidação** | Soma de todos os ingredientes necessários para o conjunto de pedidos de um período. Elimina o cálculo manual ingrediente a ingrediente. |
| **CMV** | Custo de Mercadoria Vendida — soma dos custos de produção de todos os pedidos entregues em um período. |
| **DRE** | Demonstrativo de Resultado do Exercício — relatório que mostra receitas, custos e despesas de um período, resultando no lucro ou prejuízo. |
| **Margem** | Diferença entre o preço de venda e o custo de produção, expressa em percentual. Exemplo: custo R$ 50, preço R$ 100, margem = 50%. |
| **Prazo mínimo / leadTimeDays** | Número de dias de antecedência necessários para que a confeitaria consiga produzir o pedido. Se o prazo é 5 dias, o pedido só pode ter data de entrega a partir de 5 dias após a confirmação. |
| **OTP** | One-Time Password — código de uso único, válido por 10 minutos, enviado por WhatsApp para autenticar o cliente sem necessidade de senha. |
| **Soft delete / Inativação** | Prática de não excluir permanentemente um registro do sistema, mas apenas marcá-lo como inativo. Preserva o histórico e evita perda de dados. |
| **Snapshot** | Cópia dos dados de um produto (nome, preço) no momento exato em que o pedido foi feito. Mesmo que o produto seja alterado depois, o pedido original permanece com os dados originais. |
| **Kanban** | Quadro visual com colunas de status (Confirmado, Em Produção, Pronto, Entregue) onde cada pedido é um card que avança da esquerda para a direita conforme o progresso da produção. |
| **LTV** | Lifetime Value — soma total de todos os pedidos realizados por um cliente desde seu primeiro pedido. Indica o valor desse cliente para o negócio. |
| **FIFO / FEFO** | Política de saída de estoque. FIFO: o que entrou primeiro sai primeiro. FEFO: o que vence primeiro sai primeiro. |
| **Rateio de custos fixos** | Distribuição proporcional dos custos fixos mensais (aluguel, energia) sobre cada unidade produzida, para compor o custo unitário real. |
| **Webhook** | Notificação automática enviada por um serviço externo (ex: provedor PIX) ao sistema quando um evento ocorre (ex: pagamento confirmado). |
| **ADR** | Architectural Decision Record — registro formal de uma decisão de design ou arquitetura do sistema, com justificativa e data. |
