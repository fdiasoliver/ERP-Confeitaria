# UX_GUIDELINES.md — Diretrizes de Experiência do Usuário: Doce Menina

Documento de referência para decisões de UX em todas as telas do sistema.
Produzido na Sprint P3 — UX Guidelines (30/06/2026).

Todo texto de interface deve estar em **português do Brasil (pt-BR)**.
Referências: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | [SCREENS.md](SCREENS.md) | [USER_FLOW.md](USER_FLOW.md)

**Fonte de verdade consultada pelo Product Review** (`.claude/skills/product-review/`, Sprint G.6) — a etapa obrigatória de revisão de produto entre Frontend e QA usa este documento diretamente, sem duplicá-lo. Ver `PROJECT_GOVERNANCE.md` Seção 16.5.

---

## 1. Princípios de UX

Os princípios abaixo orientam cada decisão de interface no Doce Menina. Quando houver dúvida entre duas abordagens, o princípio aplicável deve desempatar.

---

### P1 — Clareza acima de estética

A interface deve comunicar o estado atual e a próxima ação possível de forma inequívoca. Elementos decorativos nunca competem com informação funcional. O usuário nunca deve precisar adivinhar o que aconteceu ou o que fazer a seguir.

**Na prática:**
- Rótulos explícitos em vez de ícones isolados
- Status de pedido sempre com texto e cor (nunca apenas cor)
- Botão principal visualmente destacado do secundário
- Feedback imediato após qualquer ação

---

### P2 — Economia de esforço

Cada campo a mais é uma barreira. Cada clique desnecessário é fricção. O sistema deve fazer o máximo possível pelo usuário: pré-preencher, lembrar preferências, sugerir valores, calcular automaticamente.

**Na prática:**
- Nome e telefone do cliente pré-preenchidos no checkout
- Data mínima de entrega calculada automaticamente
- Custo de receita atualizado em tempo real ao adicionar ingredientes
- Último filtro usado lembrado na próxima visita

---

### P3 — Confiança pelo controle

O usuário deve sempre sentir que está no controle. Ações destrutivas ou irreversíveis pedem confirmação. O sistema nunca faz algo inesperado sem aviso. O usuário pode desfazer ou revisar antes de confirmar.

**Na prática:**
- Modal de confirmação antes de cancelar pedido, excluir produto ou desativar usuário
- Revisão do resumo antes de submeter qualquer formulário principal
- Botão "Voltar" sempre disponível em fluxos de múltiplos passos
- Nunca excluir dados sem aviso explícito do que será perdido

---

### P4 — Mobile primeiro, desktop depois

O público principal do lado cliente usa smartphone. A equipe interna usa computador ou tablet. A interface cliente é projetada para telas de 375–480px com dedos como ponteiros. A interface admin é projetada para 1024px+ com mouse.

**Na prática:**
- Área de toque mínima de 44×44px para qualquer elemento interativo
- Botões de ação em área de fácil alcance (parte inferior da tela)
- Formulários com campos grandes, espaçados
- Admin usa densidade de informação maior, com tabelas e sidebars

---

### P5 — Consistência gera confiança

O usuário aprende o sistema uma vez. Padrões repetidos criam familiaridade e reduzem carga cognitiva. Desvios do padrão devem ser justificados por necessidade real, nunca por preferência estética.

**Na prática:**
- O mesmo componente para a mesma função em todas as telas
- Terminologia consistente: "Confirmar pedido" em todos os lugares (nunca "Finalizar", "Enviar", "Concluir")
- Posição de botões idêntica em telas equivalentes
- Mesma paleta de cores para os mesmos significados

---

### P6 — Erros são oportunidades de aprendizado

Quando algo dá errado, o sistema deve explicar o que aconteceu, por que, e como resolver. Mensagens de erro nunca culpam o usuário. Sempre oferecem um caminho de saída.

**Na prática:**
- Mensagem de erro em linguagem humana: "O CEP informado não foi encontrado. Verifique os 8 dígitos." (não "Erro 400 — Bad Request")
- Campo de erro mostra o que precisa ser corrigido, não apenas que há erro
- Após erro de servidor, oferecer botão "Tentar novamente"

---

### P7 — Velocidade percebida importa tanto quanto velocidade real

O sistema deve parecer rápido mesmo quando não é. Feedback imediato (loading, skeleton) faz o usuário sentir que o sistema está respondendo, mesmo que o dado ainda não chegou.

**Na prática:**
- Skeleton carrega antes dos dados reais
- Botão de submit desabilitado imediatamente após clique (evita duplo clique)
- Transições de tela suaves (não instantâneas, não lentas)
- Otimismo: assume sucesso e corrige se necessário (ex: adicionar ao carrinho não espera API)

---

## 2. Fluxo dos formulários

### Estrutura padrão de um formulário

```
1. Título da tela / ação (ex: "Novo ingrediente")
2. Campos agrupados por contexto (seções com subtítulos se necessário)
3. Campos opcionais claramente marcados como "(opcional)"
4. Resumo / prévia do que será criado (quando aplicável)
5. Rodapé com ações: [Cancelar]  [Salvar]
```

### Agrupamento de campos

Campos relacionados ficam agrupados visualmente com espaço entre grupos:

```
── Dados básicos ──────────────────
  Nome *
  Categoria *
  Unidade *

── Preço e estoque ────────────────
  Preço atual (R$/unidade) *
  Estoque atual
  Estoque mínimo

── Fornecedor (opcional) ──────────
  Nome do fornecedor
  Código externo
```

### Ordem dos campos

1. Campos mais importantes primeiro (nome, tipo, categoria)
2. Campos numéricos depois (preço, quantidade, prazo)
3. Campos opcionais por último (observações, código externo)
4. Nunca intercalar obrigatório / opcional de forma aleatória

### Campos obrigatórios

- Marcados com asterisco `*` no label: `Nome *`
- Nota de rodapé discreta abaixo do formulário: `* Campos obrigatórios`
- Nunca usar `(obrigatório)` por extenso — asterisco é suficiente e mais limpo

### Campos opcionais

- Marcados explicitamente: `Complemento (opcional)`
- Nunca assumir que o usuário sabe quais campos pode pular

### Comprimento de campos

| Campo | Largura sugerida |
|-------|-----------------|
| Nome (curto) | `w-full` |
| CEP | `w-32` (grid com outro campo) |
| Número de endereço | `w-24` (grid com CEP) |
| Preço | `w-40` |
| Quantidade | `w-32` |
| Textarea | `w-full min-h-[80px]` |
| Data | `w-full` ou `w-48` |

### Autopreenchimento

- `autocomplete="name"` em campos de nome
- `autocomplete="tel"` em campos de telefone
- `autocomplete="email"` em e-mail
- `autocomplete="street-address"`, `"postal-code"` nos campos de endereço
- `autocomplete="off"` em campos de senha em formulários de edição (evitar sobrescrita acidental)

### Submissão

- Apenas 1 botão de submit por formulário
- Desabilitar o botão imediatamente após clique: `disabled={isSubmitting}`
- Trocar o label durante submissão: "Salvar" → "Salvando…"
- Nunca submeter com `Enter` acidental — sempre `type="button"` exceto no botão de submit

---

## 3. Posição dos botões

### Regra geral: ação principal à direita, secundária à esquerda

```
[Cancelar]                    [Salvar]
[Voltar]           [Continuar / Avançar]
[Excluir]                     [Editar]
```

### Área cliente (mobile-first)

- Botão principal sempre `w-full` na parte inferior da tela
- Botão secundário (quando necessário) acima do principal, também `w-full`
- Nunca botões lado a lado em mobile (exceto em grids de 2 ações curtas como "+/-")

```
┌──────────────────────────────┐
│  Resumo do pedido...         │
│                              │
│  [Voltar para a vitrine]     │  ← botão ghost/secundário
│  [Confirmar pedido]          │  ← botão primário
└──────────────────────────────┘
```

### Área admin (desktop)

- Rodapé do formulário: `flex justify-end gap-3`
- Cancelar à esquerda (ghost ou secundário)
- Ação principal à direita (primário)

```
┌────────────────────────────────────────┐
│  Formulário...                         │
│                                        │
│                  [Cancelar] [Salvar]   │
└────────────────────────────────────────┘
```

### Ações destrutivas

- Sempre separadas das ações construtivas por espaço ou posição oposta
- Em modais de confirmação: destrutivo à direita, cancelar à esquerda

```
┌─────────────────────────────┐
│  Cancelar pedido #42?       │
│  Esta ação não pode ser     │
│  desfeita.                  │
│                             │
│  [Não cancelar]  [Cancelar pedido]  │  ← destrutivo à direita
└─────────────────────────────┘
```

### Barra de ferramentas de lista (admin)

```
[+ Novo produto]              [Exportar CSV]
       ↑ ação principal à esquerda da toolbar
```

### Botões em linhas de tabela

- Ações inline: ícones sem texto (com `aria-label`) para economia de espaço
- Máximo 3 ações por linha: Ver | Editar | Desativar
- Ação destrutiva sempre a última e em vermelho ou separada por `|`

---

## 4. Mensagens

### Princípios de redação

- **Pessoa:** falar com o usuário diretamente ("Seu pedido foi confirmado", não "O pedido foi confirmado")
- **Voz ativa:** "Não foi possível salvar o produto" (não "O produto não pôde ser salvo")
- **Sem jargão técnico:** nunca expor códigos de erro, stack traces ou termos de banco de dados
- **Tom:** profissional e acolhedor — a Doce Menina é uma confeitaria artesanal, não um banco
- **Brevidade:** mensagens curtas são lidas; mensagens longas são ignoradas

### Tipos de mensagem

| Tipo | Quando usar | Tom |
|------|-------------|-----|
| Sucesso | Operação concluída | Positivo, direto |
| Erro | Falha na operação | Claro, sem culpar o usuário, com solução |
| Aviso | Ação com consequência | Informativo, sem alarmismo |
| Informativo | Contexto útil | Neutro, complementar |
| Vazio | Lista sem resultados | Encorajador, com ação sugerida |

### Exemplos por contexto

**Sucesso:**
- "Produto salvo com sucesso."
- "Pedido #42 confirmado!"
- "Ingrediente atualizado."

**Erro de validação:**
- "O CEP deve ter 8 dígitos. Ex.: 01310-100"
- "Informe a rua para continuar com a entrega."
- "O preço de venda deve ser maior que zero."

**Erro de servidor:**
- "Não foi possível salvar as alterações. Verifique sua conexão e tente novamente."
- "Algo deu errado ao buscar os pedidos. [Tentar novamente]"

**Aviso:**
- "O preço de venda está abaixo do custo de produção. Revise antes de ativar o produto."
- "Este ingrediente está abaixo do estoque mínimo."
- "Cancelar o pedido não pode ser desfeito."

**Estado vazio:**
- "Nenhum pedido encontrado para este período. [Limpar filtros]"
- "Você ainda não tem pedidos. [Explorar produtos]"
- "Nenhum ingrediente cadastrado. [Adicionar ingrediente]"

### Mensagens de confirmação de ação destrutiva

Padrão: **"[Verbo] [objeto específico]?"** seguido de consequência

```
Cancelar pedido #42?
Ao cancelar, o cliente será notificado e o pedido não poderá ser reaberto.

[Não cancelar]    [Sim, cancelar pedido]
```

```
Desativar produto "Bolo Mesversário"?
Ele não aparecerá mais na vitrine até ser reativado.

[Manter ativo]    [Desativar]
```

---

## 5. Feedback

### Feedback imediato (< 100ms)

Toda ação do usuário deve ter resposta visual imediata, sem percepção de latência:

| Ação | Feedback imediato |
|------|-------------------|
| Clique em botão | Estado de pressed (escurecimento visual) |
| Toque em chip de filtro | Estado ativo visível |
| Adicionar item ao carrinho | Botão "+" animado + counter do CartFab atualiza |
| Toggle (ativo/inativo) | Toggle muda de posição instantaneamente (otimista) |
| Hover em elemento clicável | Cursor pointer + leve mudança visual |

### Feedback de processo (100ms – 3s)

Para operações com latência perceptível:

| Operação | Feedback |
|----------|----------|
| Submit de formulário | Botão → "Salvando…" + spinner; outros campos desabilitados |
| Busca em autocomplete | Spinner ao lado do campo + texto "Buscando…" |
| Upload de arquivo | Barra de progresso dentro da zona de upload |
| Carregamento de lista | Skeleton dos cards/linhas |
| Mudança de status de pedido | Toast de sucesso após confirmação da API |

### Feedback de conclusão

| Resultado | Feedback |
|-----------|----------|
| Sucesso | Toast verde "Salvo" ou redirecionamento para a tela criada |
| Erro recuperável | Toast vermelho + campo com borda vermelha + mensagem explicativa |
| Erro fatal | Alerta persistente no topo da tela com botão de retry |
| Ação destrutiva concluída | Toast neutro "Pedido cancelado" + item removido da lista |

### Feedback de estado vazio

Estado vazio é uma tela, não um bug. Deve comunicar:
1. O que não existe ainda
2. Por quê pode estar vazio (filtro aplicado? Nenhum dado cadastrado?)
3. O que fazer agora (ação primária sugerida)

```
Exemplo: lista de produtos sem resultados para o filtro "Kits"

   [ícone neutro — caixa vazia]
   Nenhum produto encontrado em "Kits"
   Tente remover os filtros ou crie um novo produto.

   [Limpar filtros]    [+ Novo produto]
```

---

## 6. Confirmações

### Quando pedir confirmação

**Sempre confirmar:**
- Cancelar pedido (irreversível)
- Excluir produto, receita, ingrediente (com pedidos vinculados, bloquear exclusão)
- Desativar usuário
- Limpar carrinho
- Sair de formulário com dados não salvos

**Nunca confirmar:**
- Adicionar item ao carrinho (ação reversível via "-" ou remoção)
- Ativar produto (reversível)
- Mudar filtro ou aba
- Reordenar lista

**Confirmar com contexto:**
- Salvar produto com margem negativa → aviso, mas não bloqueio
- Desativar ingrediente em receitas ativas → aviso com lista das receitas afetadas

### Estrutura do modal de confirmação

```
Título:     Ação específica com objeto nomeado
            Ex: "Cancelar pedido #42?" (não "Confirmar ação")

Corpo:      Consequência direta, em 1–2 frases.
            Ex: "O cliente Ana Figueiredo será notificado.
                 Esta ação não pode ser desfeita."

Botões:     [Ação segura]    [Ação destrutiva]
```

### Regra de nomenclatura dos botões de confirmação

| Situação | Botão cancelar | Botão confirmar |
|----------|----------------|-----------------|
| Excluir produto | "Manter produto" | "Excluir produto" |
| Cancelar pedido | "Não cancelar" | "Cancelar pedido" |
| Desativar usuário | "Manter ativo" | "Desativar" |
| Limpar carrinho | "Manter itens" | "Limpar carrinho" |

> Regra: o botão de confirmação repete a ação do título. Nunca usar apenas "Sim" ou "OK".

### Formulário com dados não salvos

Se o usuário tentar sair de um formulário com alterações não salvas:

```
Descartar alterações?
As informações preenchidas serão perdidas.

[Continuar editando]    [Descartar e sair]
```

Implementar com evento `beforeunload` (web) e interceptação do `router.push` (Next.js).

---

## 7. Erros

### Hierarquia de erros

| Nível | O que é | Onde exibir | Dismissível? |
|-------|---------|-------------|-------------|
| Erro de campo | Dado inválido em um campo específico | Abaixo do campo | Ao corrigir |
| Erro de formulário | Múltiplos campos inválidos ou regra de negócio | Topo do formulário | Ao corrigir |
| Erro de servidor | API retornou erro (400, 422, 500) | Toast ou alerta no topo | Manual |
| Erro fatal | Sistema inacessível (500, offline) | Tela de erro dedicada | Retry |

### Erros de campo

```
┌─────────────────────────────────┐
│ CEP *                           │
│ [01310-1__]  ← campo vermelho   │
│ ⚠ O CEP deve ter 8 dígitos.    │  ← mensagem em vermelho abaixo
└─────────────────────────────────┘
```

- Aparecem após `onBlur` (sair do campo) ou ao tentar submeter
- Não aparecem enquanto o usuário ainda está digitando
- Desaparecem quando o campo é corrigido

### Erros de formulário (múltiplos campos)

```
┌──────────────────────────────────────────────┐
│ ⚠ Corrija os erros abaixo antes de salvar:  │
│   • Informe o nome do ingrediente            │
│   • Selecione uma unidade de medida          │
│   • O preço deve ser maior que zero          │
└──────────────────────────────────────────────┘
```

- Aparece no topo do formulário, acima dos campos
- Lista todos os erros de uma vez (não um por vez)
- Cada item tem link âncora para o campo correspondente quando possível

### Erros de servidor (respostas da API)

| Código HTTP | Mensagem ao usuário |
|-------------|---------------------|
| 400 | Mensagem específica do erro (ex.: "CEP inválido") |
| 401 | "Sua sessão expirou. [Entrar novamente]" |
| 403 | "Você não tem permissão para realizar esta ação." |
| 404 | "O item solicitado não foi encontrado." |
| 409 | Mensagem específica (ex.: "Já existe um produto com este nome.") |
| 422 | Mensagem da validação do servidor |
| 429 | "Muitas tentativas. Aguarde alguns minutos e tente novamente." |
| 500 | "Ocorreu um erro no servidor. Nossa equipe foi notificada. [Tentar novamente]" |

### Erros de conexão

```
Sem conexão com a internet
Verifique sua conexão e tente novamente.

[Tentar novamente]
```

Detectar via `navigator.onLine` + event listener `offline/online`.

### Página de erro

Para erros que impedem o carregamento da tela:

```
[ícone neutro]
Algo deu errado

Não foi possível carregar esta página.
Isso pode ser temporário.

[Tentar novamente]    [Voltar ao início]
```

---

## 8. Validações

### Quando validar

| Momento | O que validar |
|---------|--------------|
| `onChange` (tempo real) | Formato simples: comprimento máximo, apenas números |
| `onBlur` (ao sair do campo) | Formato completo, obrigatoriedade, regras de negócio simples |
| `onSubmit` (ao tentar enviar) | Todos os campos + regras cruzadas entre campos |
| Servidor (após POST) | Unicidade (e-mail único), regras que dependem de dados externos |

### Validações por tipo de campo

| Campo | Regra | Mensagem de erro |
|-------|-------|-----------------|
| Nome | Mínimo 2 caracteres, máximo 120 | "O nome deve ter pelo menos 2 caracteres." |
| Telefone | 10 ou 11 dígitos numéricos | "Informe um número válido com DDD. Ex.: (11) 99999-9999" |
| E-mail | Formato válido (regex RFC 5322 simplificado) | "Informe um e-mail válido. Ex.: maria@email.com" |
| CEP | 8 dígitos numéricos | "O CEP deve ter 8 dígitos. Ex.: 01310-100" |
| Preço | Número positivo, máximo 2 casas decimais | "Informe um valor válido. Ex.: 45,90" |
| Quantidade | Inteiro positivo > 0 | "A quantidade deve ser pelo menos 1." |
| Data | Data válida, dentro do intervalo permitido | "Selecione uma data a partir de {data mínima}." |
| Senha | Mínimo 8 caracteres | "A senha deve ter pelo menos 8 caracteres." |

### Validação de campos interdependentes

- Data de entrega deve ser ≥ data mínima calculada (leadTimeDays)
- CEP só é validado no servidor (geocodificação) — exibir "Verificando CEP…" durante
- Preço de venda pode ser menor que custo → aviso, não bloqueio
- Rendimento de receita deve ser > 0 para calcular custo unitário

### Validações em tempo real permitidas

- Contador de caracteres em campos com limite: `45 / 120`
- Formatação automática de telefone: `11987654321` → `(11) 98765-4321`
- Formatação automática de CEP: `01310100` → `01310-100`
- Formatação automática de moeda: `4590` → `R$ 45,90` (ao sair do campo)

### Feedback visual de campo válido

Não exibir ícone ✓ verde em campos válidos durante a digitação — gera ruído visual desnecessário. O estado padrão (sem erro) já indica que o campo está correto.

---

## 9. Navegação

### Hierarquia de navegação

**Área cliente:**
```
/ (vitrine)
  └── /checkout
       └── [confirmação — estado, sem rota própria]
            └── /pedidos
                 └── /pedidos/[id]
/login
```

**Área admin:**
```
/admin/login
/admin (painel)
  ├── /admin/pedidos → /admin/pedidos/[id]
  ├── /admin/producao
  ├── /admin/produtos → /admin/produtos/[id]
  ├── /admin/insumos → /admin/insumos/[id]
  ├── /admin/receitas → /admin/receitas/[id]
  ├── /admin/clientes → /admin/clientes/[id]
  ├── /admin/financeiro → /admin/financeiro/*
  └── /admin/config, /admin/tema, /admin/usuarios
```

### Breadcrumb (admin)

Exibir breadcrumb em páginas de detalhe e formulário:

```
Painel › Ingredientes › Farinha de trigo
Painel › Pedidos › Pedido #42
Painel › Produtos › Novo produto
```

- Itens anteriores são links clicáveis
- Item atual é texto simples (não clicável)
- Nunca exibir breadcrumb na vitrine cliente

### Navegação entre listas e detalhes

- Sempre manter o contexto de volta: botão "Voltar" ou breadcrumb
- Após criar item: redirecionar para a tela de edição do item criado (não para a lista)
- Após editar item: redirecionar para a lista com o item visível
- Após excluir item: redirecionar para a lista (sem exibir o item excluído)

### Links vs. botões

- `<Link>` (Next.js) para navegação entre páginas: clicável, abrível em nova aba
- `<button>` para ações que não navegam: submit, toggle, abrir modal
- Nunca usar `<a href>` para navegação interna (usar `<Link>` do Next.js)
- Links de texto: cor rose, sem sublinhado padrão, sublinhado no hover

### Navegação por teclado (admin)

- `Tab` percorre todos os elementos interativos na ordem do DOM
- `Shift+Tab` navega na ordem inversa
- `Enter` ativa links e botões; `Espaço` ativa checkboxes e radio buttons
- `Esc` fecha modais, drawers e dropdowns
- Foco visível sempre (`focus:ring-2`) — nunca `outline: none` sem substituto

---

## 10. Pesquisa

### Pesquisa local (filtro imediato)

Usada quando todos os dados já estão carregados na tela:

- Filtragem em tempo real enquanto o usuário digita (sem debounce)
- Destaque do trecho encontrado no resultado com `<mark>` ou texto bold
- Placeholder: "Buscar ingredientes..." (não genérico "Pesquisar")
- Ícone de lupa à esquerda do campo
- Botão ✕ para limpar quando há texto

```
[🔍 Buscar ingredientes...]  [✕]
```

### Pesquisa remota (API)

Usada quando os dados não estão carregados:

- Debounce de 300ms antes de chamar a API
- Mínimo de 2 caracteres para iniciar a busca
- Estado "Buscando…" com spinner enquanto aguarda
- Resultado exibido em dropdown ou substitui a lista atual
- Estado vazio com sugestão: "Nenhum resultado para 'chocolat'. Tente 'chocolate'."

### Pesquisa global (admin — futuro)

Campo de busca no header do admin que pesquisa em múltiplos módulos simultaneamente (pedidos, clientes, produtos). Identificado pelo resultado pelo ícone do tipo:

```
🎂 Bolo Mesversário       → Produto
📋 Pedido #42 — Ana       → Pedido
👤 Ana Figueiredo         → Cliente
```

### Sem resultados

```
Nenhum resultado para "chocolatt"

Sugestões:
• Verifique a ortografia
• Tente termos mais gerais (ex.: "choco")
• [Limpar busca]
```

---

## 11. Ordenação

### Ordenação em tabelas

- Clique no cabeçalho da coluna ativa a ordenação
- Primeiro clique: ASC (menor para maior, A→Z, mais antigo primeiro)
- Segundo clique: DESC (maior para menor, Z→A, mais recente primeiro)
- Terceiro clique: retorna à ordenação padrão
- Indicador visual: `↑` (ASC), `↓` (DESC), `↕` (padrão)
- Apenas uma coluna ordenada por vez (exceto quando ordenação composta é funcional)

### Ordenação padrão por tela

| Tela | Ordenação padrão |
|------|-----------------|
| Lista de pedidos | Data de entrega ASC (mais próximos primeiro) |
| Lista de clientes | Nome ASC (alfabético) |
| Lista de produtos | `sortOrder` ASC + nome ASC |
| Lista de ingredientes | Nome ASC |
| Lista de receitas | Nome ASC |
| Histórico de preços | Data DESC (mais recente primeiro) |
| Dashboard produção | Horário de entrega ASC (urgentes primeiro) |

### Ordenação em listas de cards (vitrine)

A vitrine não oferece ordenação explícita ao cliente — a ordem é definida pelo `sortOrder` da categoria e `featured` do produto. Produtos em destaque sempre aparecem primeiro dentro da categoria.

---

## 12. Filtros

### Filtros rápidos (chips)

Para um único critério com opções limitadas (≤ 8):

```
[Todos]  [Confirmado]  [Em produção]  [Pronto]  [Entregue]
```

- Um clique ativa; outro clique desativa ou ativa "Todos"
- "Todos" sempre disponível como primeira opção
- Scroll horizontal em mobile sem quebra de linha

### Filtros combinados (painel admin)

Para múltiplos critérios simultâneos:

```
[Filtros ▾]   Status: Confirmado ✕   Período: Junho ✕   [Limpar tudo]
```

- Filtros ativos exibidos como chips removíveis
- Número de filtros ativos: badge no botão "Filtros": `[Filtros ▾ 2]`
- Botão "Limpar tudo" visível apenas quando há filtros ativos
- Persistência na URL: `?status=CONFIRMADO&period=2026-06`

### Painel de filtros (sidebar / drawer)

Para filtragem avançada com muitos critérios:

```
┌──────────────────────┐
│ Filtros              │
│ ─────────────────── │
│ Status               │
│ ☑ Confirmado         │
│ ☑ Em produção        │
│ ☐ Pronto             │
│                      │
│ Período              │
│ De: [__/__/____]     │
│ Até: [__/__/____]    │
│                      │
│ Tipo de entrega      │
│ ○ Todos              │
│ ○ Retirada           │
│ ○ Entrega            │
│                      │
│ [Limpar]  [Aplicar]  │
└──────────────────────┘
```

### Filtros e estado vazio

Quando filtros resultam em 0 itens, a mensagem de estado vazio deve mencionar os filtros:

```
Nenhum pedido com status "Confirmado" em junho de 2026.
[Limpar filtros]
```

---

## 13. Tabelas

### Layout de colunas (prioridade)

Quando a tela não comporta todas as colunas, ocultar na ordem inversa de prioridade:

**Lista de pedidos:**
1. Número do pedido *(sempre visível)*
2. Cliente *(sempre visível)*
3. Status *(sempre visível)*
4. Data de entrega — ocultar em mobile
5. Total — ocultar em mobile
6. Forma de pagamento — ocultar em tablet e mobile
7. Ações *(sempre visível)*

**Lista de produtos:**
1. Nome *(sempre visível)*
2. Categoria — ocultar em mobile
3. Preço de venda *(sempre visível)*
4. Custo — ocultar em mobile
5. Margem — ocultar em tablet e mobile
6. Status (Ativo) *(sempre visível)*
7. Ações *(sempre visível)*

### Interação com linhas

- Linha clicável inteira → navega para detalhe (sem botão "Ver" separado)
- Cursor `cursor-pointer` em linhas clicáveis
- Hover: `hover:bg-sand/50`
- Ações inline (editar, desativar) aparecem no hover da linha em desktop; sempre visíveis em mobile

### Linha de total / subtotal

Em tabelas financeiras (DRE, compras, carrinho):

```
                          Subtotal     R$ 280,00
                          Entrega      Grátis
                          ─────────────────────
                          Total        R$ 280,00
```

- Linha de total sempre com `font-bold` e separador `border-t`
- Valores alinhados à direita com largura fixa de coluna

### Estado de tabela vazia

```
┌──────────────────────────────────────────────┐
│  Nome          Categoria    Preço    Ações   │
│  ─────────────────────────────────────────── │
│                                              │
│         Nenhum produto cadastrado.           │
│         [+ Criar primeiro produto]           │
│                                              │
└──────────────────────────────────────────────┘
```

Manter o cabeçalho visível mesmo com tabela vazia.

### Seleção múltipla

Quando disponível (ações em lote):

- Checkbox na primeira coluna de cada linha
- Checkbox no cabeçalho seleciona / deseleciona todas as linhas visíveis
- Toolbar de ações em lote aparece quando ≥ 1 linha selecionada:

```
3 itens selecionados  [Exportar]  [Desativar]  [✕ Cancelar seleção]
```

---

## 14. Experiência Mobile

### Contexto

- Área cliente: 100% do uso esperado em smartphone (375–480px)
- Área admin: acesso ocasional ao dashboard de produção via tablet (768–1024px)
- Nunca assumir mouse — todo elemento interativo deve funcionar com dedo

### Regras de toque

- Área de toque mínima: **44×44px** para qualquer elemento interativo (botão, link, chip, toggle)
- Espaçamento entre elementos tocáveis: mínimo 8px para evitar toques acidentais
- Swipe horizontal: apenas onde explicitamente esperado (chips de filtro, tabs)
- Swipe vertical: comportamento padrão de scroll — nunca interferir

### Layout mobile

- Container principal: `mx-auto max-w-app px-5` (480px centralizado) — válido abaixo do breakpoint `md` (768px); a partir de `md` a área cliente usa o layout largo descrito em "Layout área cliente em desktop" (Seção 15) e "Adaptações para tablet" (Seção 16)
- Header fixo no topo: `sticky top-0 z-40`
- Botão de ação principal: sempre na parte inferior da tela, acima do safe area do iOS
- Bottom sheet / drawer: âncora no rodapé para conteúdo contextual
- Nunca usar grids de 3+ colunas em mobile

### Formulários em mobile

- Campos com altura mínima de 48px (fácil toque)
- Teclado numérico para campos de número, telefone, CEP: `inputMode="numeric"`
- Teclado de e-mail para campos de e-mail: `type="email"`
- Evitar scrollar para ver o botão de submit — posicionar acima do fold ou fixo no bottom

### Imagens em mobile

- Imagens de produto: `object-cover` com aspect ratio fixo (1:1 para emojis, 4:3 para fotos)
- Nunca carregar imagens grandes em mobile — usar `srcset` ou `sizes` quando implementar fotos reais
- Lazy loading: `loading="lazy"` para imagens abaixo do fold

### Gestos

| Gesto | Ação |
|-------|------|
| Tap | Selecionar / ativar |
| Double tap | Não usado (reservar para zoom do browser) |
| Long press | Não usado |
| Swipe horizontal | Scroll de chips e tabs |
| Swipe vertical | Scroll padrão da página |
| Pull down (bottom sheet) | Fechar drawer |
| Pinch | Não interferir (zoom do browser) |

### Performance mobile

- Skeleton loading em todas as listas para evitar layout shift
- Imagens com dimensões especificadas (`width` e `height`) para evitar reflow
- Evitar animações pesadas em CPU (box-shadow animado, blur em movimento)
- Usar `transform` e `opacity` para animações (GPU-acelerado)

---

## 15. Experiência Desktop

### Contexto

- Área admin: uso primário em desktop (1280px+)
- Área cliente: acesso secundário via computador (1024px+)

### Layout admin em desktop

```
┌────────┬───────────────────────────────────────┐
│        │  Header com usuário logado + busca    │
│ Menu   ├───────────────────────────────────────┤
│ Late-  │                                       │
│ ral    │  Conteúdo principal                   │
│ (240px)│  max-w-5xl                            │
│        │                                       │
│        │                                       │
└────────┴───────────────────────────────────────┘
```

- Menu lateral fixo (`position: sticky` ou sidebar fixa)
- Conteúdo com `max-w-5xl mx-auto px-6 py-6`
- Header com nome do usuário, papel e botão de logout

### Densidade de informação em desktop

- Tabelas com todas as colunas visíveis
- Cards de estatísticas em grid de 4 colunas
- Formulários em 2 colunas para campos relacionados (Nome | Categoria)
- Sidebar de filtros visível por padrão (não colapsada)

### Layout área cliente em desktop (Sprint DS.4)

```
┌────────┬───────────────────────────────────────┐
│        │  Header (logo + pedidos/perfil/carr.) │
│ Cate-  ├───────────────────────────────────────┤
│ gorias │                                       │
│ (60px  │  Conteúdo principal                   │
│  a     │  max-w-6xl                            │
│ 240px) │                                       │
└────────┴───────────────────────────────────────┘
```

- Breakpoint `md` (768px) — igual ao admin (Seção 14), decisão explícita do Product Owner em vez de um breakpoint próprio da área cliente
- `VitrineSidebar` (componente próprio, não compartilhado com o admin): lista as ocasiões (`OccasionTag`, ícone Lucide real por ocasião), recolhível para modo só-ícone via botão do próprio usuário — largura `w-60` expandida / `w-16` recolhida
- Conteúdo com `md:mx-auto md:max-w-6xl md:px-6 md:py-6`; grid de produtos `md:grid-cols-3 xl:grid-cols-4`
- `CartFab`/`CartDrawer`/`Toast` centralizados no `ClientShell` (`src/components/layout/ClientShell.tsx`) — disponíveis em Vitrine, Pedidos e Login; ocultos apenas no Checkout, que já exibe o carrinho inline
- Checkout: 2 colunas em `lg:`+ (formulário à esquerda, resumo do pedido `sticky` à direita); Pedidos: grid `lg:grid-cols-2`; Login permanece `max-w-app` mas centralizado verticalmente

### Atalhos de teclado (admin — futuro)

| Atalho | Ação |
|--------|------|
| `N` | Novo item (na tela atual) |
| `Esc` | Fechar modal / drawer |
| `/` | Focar campo de busca |
| `←` `→` | Navegar entre abas |
| `?` | Exibir lista de atalhos disponíveis |

### Hover states em desktop

- Todos os elementos clicáveis têm hover state
- Botões: `hover:opacity-90`
- Links: `hover:underline`
- Linhas de tabela: `hover:bg-sand/50`
- Cards: `hover:shadow-md`
- Ícones de ação em tabela: visíveis apenas no hover da linha (`group-hover:opacity-100`)

### Tooltips em desktop

Para ícones sem label de texto em contextos admin:

```html
<button aria-label="Editar produto" title="Editar produto">
  <PencilIcon />
</button>
```

- `title` nativo para tooltips simples (ícones de ação em tabela)
- Tooltip customizado apenas quando o `title` nativo não for suficiente
- Delay de 300ms antes de exibir tooltip (evitar flicker ao passar o mouse)

---

## 16. Experiência Tablet

### Contexto

- Uso misto: cliente em tablet acessa a vitrine; equipe acessa o dashboard de produção
- Breakpoint: 768px–1023px
- Entrada: toque (sem mouse garantido)

### Adaptações para tablet

**Área cliente (768px — confirmado na Sprint DS.4):**
- `VitrineSidebar` aparece a partir de 768px (breakpoint `md`, igual ao admin); grid de produtos: 3 colunas (`md:grid-cols-3`, 4 em `xl:`+)
- CartDrawer: `w-96` ancorado à direita e com altura cheia em vez de bottom sheet
- Checkout ganha o layout de 2 colunas apenas em `lg:`+ (1024px) — em tablet (768–1023px) permanece 1 coluna, formulário completo antes do resumo do pedido

**Dashboard de produção (768px–1024px):**
- Kanban: colunas visíveis sem scroll horizontal (se couberem em 4 colunas)
- Cards de estatísticas: grid de 2 colunas
- Tabs de período: todas as abas visíveis sem scroll

### Menu lateral em tablet

- `VitrineSidebar` (área cliente, Sprint DS.4): sempre expandida por padrão a partir de 768px — não colapsa automaticamente por faixa de largura; recolher para modo só-ícone é uma ação manual do usuário (botão com seta), sem distinção entre "tablet estreito" e "tablet largo"
- Sidebar do admin (`src/components/admin/shared/Sidebar.tsx`): comportamento não alterado nesta sprint — continua fora do escopo desta seção até ganhar o mesmo modo recolhível

### Toque em tablet

- Mesmas regras de área mínima de toque (44×44px)
- Evitar hover-only interactions (ex.: ícones que aparecem apenas no hover de linha — exibir sempre em tablet)

---

## 17. Dark Mode

### Status atual

Não implementado. Design System atual usa paleta clara (cream, chocolate, rose, sage, sand).

### Estratégia planejada (Fase 2 — ThemeConfig)

O dark mode será implementado via CSS custom properties, alternando os valores das variáveis de token:

```css
/* Modo claro (padrão) */
:root {
  --cream: #fdf8f0;
  --chocolate: #3d2314;
  --rose: #c4687a;
  --sage: #6b8f71;
  --sand: #e8ddd0;
  --muted: #9c8c7c;
  --bg-primary: var(--cream);
  --text-primary: var(--chocolate);
}

/* Modo escuro */
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #f5f0eb;
  --sand: #2a2a2a;
  --muted: #7a7a7a;
  /* rose e sage ajustados para maior contraste */
}
```

### Princípios para dark mode

- Nunca inverter cores diretamente (não usar `filter: invert`) — definir tokens específicos para cada modo
- Sombras no dark mode: usar `box-shadow` com cor clara em vez de escura
- Imagens: adicionar `background-color` no container para quando a imagem não carrega
- Preferência do sistema: respeitar `prefers-color-scheme` como padrão; permitir override manual
- Salvar preferência do usuário em `localStorage` ou no perfil (admin)

### Não escopo do dark mode atual

Dark mode não altera logotipos, fotos de produtos ou imagens de referência de pedidos.

---

## 18. Light Mode

### Status atual

Light mode é o **modo padrão e único implementado** do sistema.

### Paleta light mode

| Elemento | Valor | Uso |
|----------|-------|-----|
| Fundo de página | `#fdf8f0` (cream) | Todas as páginas cliente e admin |
| Fundo de card | `#ffffff` (white) | Cards, modais, formulários |
| Fundo de campo | `#e8ddd0` (sand) | Inputs, selects, textareas |
| Cor principal de texto | `#3d2314` (chocolate) | Títulos, labels, body |
| Cor de destaque | `#c4687a` (rose) | Links, badges de confirmação |
| Cor de sucesso | `#6b8f71` (sage) | Status positivo, sucesso |
| Cor de texto secundário | `#9c8c7c` (muted) | Labels de apoio, timestamps |

### Contraste no light mode

Verificar contraste mínimo WCAG AA (4.5:1 para texto normal, 3:1 para texto grande):

| Combinação | Contraste | Status |
|-----------|-----------|--------|
| Chocolate sobre cream | ~9.5:1 | ✅ AAA |
| White sobre chocolate | ~9.5:1 | ✅ AAA |
| Rose sobre white | ~4.8:1 | ✅ AA |
| Muted sobre white | ~3.4:1 | ✅ AA (texto grande) |
| Muted sobre cream | ~3.2:1 | ⚠️ Verificar |
| White sobre rose | ~4.8:1 | ✅ AA |

> Atenção: texto `muted` em fundo `cream` pode falhar contraste AA para texto pequeno (< 18px). Usar `chocolate` para labels obrigatórios em tamanho pequeno.

### Consistência do light mode

- Todas as telas usam o mesmo fundo `bg-cream`
- Cards sempre com fundo branco (`bg-white`)
- Campos sempre com fundo `bg-sand`
- Nunca usar `bg-gray-*` — substituir por tokens do design system

---

## Sumário das diretrizes

| Seção | Princípio-chave |
|-------|----------------|
| 1. Princípios | Clareza, economia de esforço, controle, mobile-first, consistência, erros humanizados, velocidade percebida |
| 2. Formulários | Agrupamento semântico, campos obrigatórios com `*`, submit único, autopreenchimento |
| 3. Botões | Primário à direita, destrutivo isolado, full-width em mobile, `type="button"` explícito |
| 4. Mensagens | Pessoa direta, voz ativa, sem jargão, tom acolhedor, brevidade |
| 5. Feedback | Imediato (< 100ms), processo (skeleton/spinner), conclusão (toast/alerta) |
| 6. Confirmações | Apenas para ações irreversíveis, título específico, botão repete a ação |
| 7. Erros | Hierarquia de 4 níveis, mensagem humana, sem culpar, com solução |
| 8. Validações | onBlur para erros, onChange para formatação, servidor para unicidade |
| 9. Navegação | Link para navegação, button para ação, breadcrumb em admin |
| 10. Pesquisa | Local sem debounce, remota com 300ms, mínimo 2 caracteres |
| 11. Ordenação | Clique em cabeçalho ASC → DESC → padrão, indicador visual |
| 12. Filtros | Chips para ≤ 8 opções, sidebar para múltiplos critérios, persistência na URL |
| 13. Tabelas | Colunas por prioridade, linha clicável para detalhe, vazio com ação |
| 14. Mobile | 44px área de toque, bottom actions, skeleton loading, `inputMode` correto |
| 15. Desktop | Menu lateral fixo, densidade maior, hover states, atalhos de teclado |
| 16. Tablet | Grid 2 colunas, kanban sem scroll, menu colapsável, sem hover-only |
| 17. Dark Mode | Planejado (Fase 2), via CSS custom properties, respeitar `prefers-color-scheme` |
| 18. Light Mode | Modo atual, paleta cream/chocolate/rose/sage/sand, contraste WCAG AA |
