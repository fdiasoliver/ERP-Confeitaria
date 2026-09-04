# DESIGN_SYSTEM.md — Sistema de Design: Doce Menina

Documento de referência para todos os componentes de interface do ERP.
Produzido na Sprint P2 — Design System (29/06/2026).

Todo texto de interface deve estar em **português do Brasil (pt-BR)**.

**Fonte de verdade consultada pelo Product Review** (`.claude/skills/product-review/`, Sprint G.6) — a etapa obrigatória de revisão de produto entre Frontend e QA usa este documento diretamente, sem duplicá-lo. Ver `PROJECT_GOVERNANCE.md` Seção 16.5.

---

## Fundação visual

### Paleta de cores (tokens CSS)

| Token | Variável CSS | Valor hex | Uso principal |
|-------|-------------|-----------|--------------|
| Creme | `--cream` | `#FAF6EF` | Fundo de todas as páginas |
| Chocolate | `--chocolate` | `#191715` | CTAs primários, textos de destaque |
| Rosa (cereja) | `--rose` | `#C42E3C` | **Admin:** negativo/erro/destrutivo/urgente (excluir, cancelar, estoque baixo, validação). **Cliente final:** acento de marca/CTA (não é semântico lá) |
| Sálvia (pistache) | `--sage` | `#4F7530` | Positivo/sucesso/confirmado/item ativo de navegação |
| Caramelo (novo, Sprint `DS.3`) | `--caramel` | `#8A5B22` | Atenção/em andamento/neutro-destacado (ex.: coluna "Em produção" do Kanban, badge "Destaque") — nunca o valor cru do modelo de referência (`#C6884F`, falha WCAG como texto); esta é a variante escura calibrada |
| Areia | `--sand` | `#E3DCCB` | Bordas, divisores, linhas |
| Muted | `--muted` | `#726A5F` | Textos secundários, placeholders, labels |
| Superfície secundária | `--surface-2` | `#F5EFE1` | Fundos de card/tint sutil (separado de `sand`, que é só borda/linha) |

> **Regra:** nunca introduzir novas cores sem decisão explícita. A paleta é a identidade visual do negócio.
> **Regra de uso semântico no admin (Sprint `DS.3`):** `rose`/`sage`/`caramel` têm papel fixo — negativo / positivo / atenção-neutro, respectivamente. Antes de usar qualquer um dos três num elemento novo, perguntar "esse elemento é negativo, positivo ou neutro-em-destaque?" — não escolher pela cor que "combina visualmente". Dois usos incorretos foram encontrados e corrigidos nesta sprint (destaque do item ativo da Sidebar e da coluna "Em produção" do Kanban, ambos usavam `rose` sem ser negativos).

**Redesign "Ateliê Contemporâneo" (03/08/2026):** os 6 valores hex acima foram atualizados nesta data, decisão do Product Owner após comparação visual de 3 direções de paleta (contraste WCAG verificado na mesma sessão). Os **nomes** dos tokens (`cream`, `chocolate`, `rose`, `sage`, `sand`, `muted`) não mudaram — apenas os valores hex em `src/app/globals.css`. Qualquer código ou documentação que referencie os tokens pelo nome continua válido sem alteração.

**Adoção do shadcn/ui (Sprint `DS.5`, ADR-025):** os 8 tokens acima continuam sendo a única fonte de cor do projeto — nenhum valor novo foi introduzido. O que mudou foi a camada de componentes: `src/app/globals.css` ganhou um mapeamento desses 8 tokens para as variáveis semânticas que o shadcn/ui espera (`--background`→`cream`, `--foreground`→`chocolate`, `--primary`→`chocolate`, `--destructive`→`rose`, `--card`/`--popover`/`--secondary`/`--accent`→`surface-2`, `--muted-foreground`→`muted`, `--border`/`--input`→`sand`). Fundos antes `bg-white` literal (fora dos 8 tokens nomeados) foram consolidados em `bg-card` (→ `surface-2`) em toda a base — decisão explícita do Product Owner, não introduz um 9º token. **Exceção deliberada, não tocada nesta sprint:** `bg-red-50`/`text-red-700` nas mensagens de erro de `checkout`/`login`/`pedidos` continuam como cores semânticas cruas, fora do sistema de tokens — decisão já tomada e reafirmada nas Sprints `DS.1` e `DS.3` (ver `CHANGELOG.md`).

**Redesign de front-end mais amplo — Sprint `DS.2` (04/08/2026):** nova direção "A × C", escolhida pelo Product Owner por comparação visual de 3 direções + 1 combinação (Artifact, mesmo processo de DS.1). Os 6 valores hex acima foram atualizados novamente, mais o token novo `surface-2`. Contraste WCAG verificado antes de aplicar — `rose` e `sage` originais da direção aprovada (`#E63946`/`#6B8E4E`) não passavam em 4,5:1 contra `cream` (4,21:1 e 3,48:1); ajustados para `#C42E3C`/`#4F7530` (5,13:1/4,97:1), mesma família de cor (cereja/pistache), mais escuros. Ao contrário de `DS.1`, esta sprint também muda layout/componentes (produto-herói na Vitrine, sidebar de navegação no admin, tratamento fotográfico de produto) — não é só troca de token. Novos: `ProductHero` (`src/components/vitrine/ProductCard.tsx`) — primeiro produto com `featured: true` em destaque, acima do grid de `ProductCard` (que não repete esse produto); `getProductGradientClass()` (`src/lib/utils.ts`) — gradiente determinístico por `product.id` (5 combinações), substitui o gradiente único fixo usado antes em todo `imageEmoji` (`KI-06` segue aberta — isto não é foto real, é um tratamento melhor que o emoji cru). Ver `CHANGELOG.md`, Sprint DS.2.

**Redesenho a partir de modelo de referência real — Sprint `DS.3` (10/08/2026):** Product Owner forneceu um arquivo HTML de referência ("Modelo 1" — painel de Estoque & Financeiro, visual SaaS/back-office) e pediu aplicação a todo o app (admin + cliente final), substituindo a direção `DS.2`. Fonte única `Manrope` (ver Tipografia acima); token novo `--caramel`; correção de sobreposição de significado do token `rose` (achado real, não previsto no plano original — encontrado em 4 lugares: item ativo da Sidebar, coluna "Em produção" do Kanban, badge "Destaque" de produto, e confirmado correto nos demais ~30 usos de `rose` do projeto, que já eram negativo/erro/destrutivo). `getProductGradientClass()` removido (código morto) — `ProductCard`/`ProductHero` passaram de foto com gradiente para ícone flat sobre `surface-2`, com borda `sand` no lugar de `shadow-card`, mesma linguagem visual do admin. `src/app/pedidos/page.tsx` `STATUS_CLASS` corrigido de Tailwind cru (`amber`/`blue`/`red`) para tokens do design system — dívida técnica pré-existente resolvida de graça dentro do escopo desta sprint. Componentes novos sem tela consumidora real ainda (decisão explícita do Product Owner de construir mesmo assim): `BarChart`, `StockItem`/`StockTag` (`src/components/admin/shared/`); `StatCard` ganhou props opcionais `trend`/`note` (badge de variação ↑/↓, sem fonte de dado real hoje). Ver `CHANGELOG.md`, Sprint DS.3.

### Tipografia

| Papel | Família | Classe Tailwind | Uso |
|-------|---------|-----------------|-----|
| Display / Títulos | Manrope, peso 800 (sans-serif) | `font-display` | Títulos de seção, nomes de produtos, H1–H2 |
| Interface / Corpo | Manrope, peso 400–600 (sans-serif) | padrão (sem classe) | Todos os demais textos, labels, botões |

**Fonte única desde a Sprint `DS.3` (10/08/2026):** `Manrope` substituiu `Fraunces` (display) + `DM Sans` (corpo) — decisão do Product Owner, fidelidade ao modelo de referência adotado (nenhum título do modelo usa serifa). Diferenciação display/corpo passou a ser só por peso, não por família. `src/app/layout.tsx` carrega uma única fonte via `next/font/google`.

### Espaçamento e layout

- **Área cliente:** `mx-auto max-w-app` (480px) com padding horizontal `px-5`
- **Área admin:** `max-w-5xl` (desktop-first)
- **Padding de página:** `py-4 px-5` no container principal
- **Gap entre seções:** `mb-6` ou `space-y-6`

### Classes utilitárias customizadas

| Classe | Uso |
|--------|-----|
| `.max-w-app` | Container de página cliente (480px) |
| `.shadow-card` | Sombra padrão de cards |
| `.input-field` | Estilo padrão de campos de formulário |
| `.option-card` | Card de seleção (entrega, pagamento) |
| `.option-card.selected` | Estado selecionado do option-card |
| `.scrollbar-none` | Oculta scrollbar horizontal (chips, carrosséis) |

**shadcn/ui (Sprint `DS.5`, ADR-025):** camada de componentes oficial do projeto desde esta sprint, coexistindo com essas classes utilitárias — não as substitui. Componentes gerados em `src/components/ui/` (`button`, `input`, `label`, `dialog`, `alert-dialog`, `sheet`, `badge`, `card`, `sonner`) são código copiado para o repositório (não pacote opaco), estilizados via os 8 tokens de cor já existentes — nenhuma cor nova. Ver `CLAUDE.md` ADR-025 para o registro completo da decisão.

---

## 1. Botões

### Objetivo
Permitir que o usuário execute ações primárias, secundárias e destrutivas de forma clara e consistente.

### Variações

| Variação | Classe base | Uso |
|----------|-------------|-----|
| Primário | `bg-chocolate text-white rounded-xl py-4 font-semibold` | CTA principal da tela (confirmar, salvar, avançar) |
| Secundário | `border border-chocolate text-chocolate rounded-xl py-4` | Ação alternativa (cancelar, voltar, editar) |
| Fantasma (ghost) | `text-chocolate underline` | Ação terciária (links de ação, "ver mais") |
| Destrutivo | `bg-red-600 text-white rounded-xl py-4 font-semibold` | Excluir, cancelar pedido, remover item |
| Ícone | `p-2 rounded-lg` + ícone SVG | Ação rápida sem texto (fechar, expandir, menu) |
| Bloco (full-width) | `w-full` adicionado a qualquer variação | CTA em páginas mobile-first |

### Estados

| Estado | Aparência |
|--------|-----------|
| Padrão | Cor sólida conforme variação |
| Hover | `hover:opacity-90` — leve escurecimento |
| Foco | `focus:ring-2 focus:ring-chocolate focus:ring-offset-2` |
| Desabilitado | `disabled:opacity-60 disabled:cursor-not-allowed` |
| Carregando | Substitui texto por spinner inline + texto "Aguarde…" |

### Comportamento
- Todo `<button>` deve ter `type="button"` explícito para evitar submit acidental em formulários
- Botão de submit de formulário usa `type="submit"` com controle explícito de `isSubmitting`
- Estado de carregando deve ser ativado imediatamente ao clique e desativado após resposta (sucesso ou erro)
- Botões destrutivos devem sempre ser precedidos de modal de confirmação

### Boas práticas
- Nunca usar apenas cor para distinguir ações — usar também texto e formato diferente
- Botão primário: máximo 1 por tela (o CTA mais importante)
- Label sempre em verbo no infinitivo: "Confirmar pedido", "Salvar alterações", "Cancelar"
- Não abreviar labels de botão — preferir texto completo

### Responsividade
- Área cliente: botão principal sempre `w-full` (bloco)
- Área admin: botão pode ser inline (tamanho do conteúdo) quando em contexto de tabela ou toolbar

### Acessibilidade
- `aria-disabled="true"` quando desabilitado (além de `disabled`)
- `aria-busy="true"` durante estado de carregando
- Botões de ícone obrigatoriamente com `aria-label="Descrição da ação"`
- Contraste mínimo 4.5:1 entre texto e fundo do botão

### Padronização visual
```
Primário:    bg-chocolate text-white rounded-xl py-4 px-6 font-semibold text-base
Secundário:  border-2 border-chocolate text-chocolate rounded-xl py-4 px-6 font-semibold
Ghost:       text-rose font-semibold underline-offset-2 hover:underline
Destrutivo:  bg-red-600 text-white rounded-xl py-4 px-6 font-semibold
```

### Implementação (Sprint `DS.5`, ADR-025)
As variações acima passaram a ser implementadas pelo componente `Button` do shadcn/ui (`src/components/ui/button.tsx`, variantes `default`/`outline`/`ghost`/`destructive`/`link`) nos pontos já migrados (carrinho, vitrine, `EntityForm`/`ConfirmDialog` e suas ações, módulo Configuração). A variante `destructive` foi ajustada de sutil (padrão shadcn, `bg-destructive/10`) para sólida (`bg-destructive`), para preservar a ênfase visual que este documento já pedia (`bg-red-600`/`bg-rose` sólido) — a versão sutil do shadcn continua disponível como `variant="destructive-subtle"` para casos que precisem dela. Botões de ação ainda não migrados (ex.: Editar/Ativar/Desativar em várias listagens) continuam com classes Tailwind manuais equivalentes — migração mecânica, sem mudança visual, fica para uma sprint futura.

---

## 2. Inputs

### Objetivo
Coletar dados de texto, número, telefone, data e e-mail do usuário em formulários.

### Variações

| Tipo | Input HTML | Uso |
|------|-----------|-----|
| Texto | `type="text"` | Nome, endereço, observações curtas |
| Número | `type="number"` | Quantidade, preço, prazo |
| Tel | `type="tel"` | Telefone do cliente |
| E-mail | `type="email"` | E-mail do usuário admin |
| Data | `type="date"` | Data de entrega, data de compra |
| Senha | `type="password"` | Login admin |
| Textarea | `<textarea>` | Observações longas, notas internas |

### Estados

| Estado | Aparência |
|--------|-----------|
| Padrão | Fundo areia (`bg-sand`), borda transparente |
| Foco | `focus:ring-2 focus:ring-chocolate` |
| Preenchido | Texto em chocolate escuro |
| Erro | `border-2 border-red-500` + mensagem de erro abaixo |
| Desabilitado | `opacity-60 cursor-not-allowed bg-sand` |
| Somente leitura | `bg-sand/60 cursor-default` sem borda de foco |

### Comportamento
- Campos obrigatórios marcados com asterisco `*` no label
- Validação acontece ao sair do campo (`onBlur`) ou ao tentar submeter
- Mensagem de erro aparece abaixo do campo, em vermelho, com ícone ⚠️
- Campos de número rejeitam valor negativo via `min="0"`
- Campo de data com `min` calculado dinamicamente (ex.: data mínima de entrega)

### Boas práticas
- Sempre associar `<label>` ao input via `htmlFor` + `id` correspondente
- Placeholder descreve o formato, não o campo: `placeholder="Ex: Rua Augusta"` (não "Digite o endereço")
- Nunca usar `placeholder` como substituto de `label`
- `autocomplete` configurado onde aplicável (`name`, `tel`, `email`, `street-address`)
- Agrupar campos relacionados em grids: Número + CEP em `grid grid-cols-2 gap-3`

### Responsividade
- Sempre `w-full` (bloco)
- Grid de 2 colunas permitido apenas em mobile para campos curtos (número, CEP)
- Textarea com `min-h-[80px]` e `resize-y`

### Acessibilidade
- `aria-required="true"` em campos obrigatórios
- `aria-invalid="true"` quando há erro de validação
- `aria-describedby="campo-erro"` apontando para o parágrafo de erro
- `aria-label` em inputs sem `<label>` visível (ex.: campo de busca inline)

### Padronização visual (classe `.input-field`)
```css
.input-field {
  width: 100%;
  border-radius: 0.75rem;      /* rounded-xl */
  background: var(--sand);
  padding: 0.75rem 1rem;       /* py-3 px-4 */
  font-size: 0.875rem;         /* text-sm */
  outline: none;
  transition: box-shadow 0.15s;
}
.input-field:focus {
  box-shadow: 0 0 0 2px var(--chocolate);
}
```

---

## 3. Select

### Objetivo
Permitir que o usuário escolha uma opção de uma lista fechada de valores pré-definidos.

### Variações

| Variação | Uso |
|----------|-----|
| Select nativo `<select>` | Listas curtas (até ~10 opções); compatível com mobile nativo |
| Select customizado | Listas com ícones, formatação extra ou busca integrada |

### Estados

| Estado | Aparência |
|--------|-----------|
| Padrão | Mesmo estilo do `.input-field` + ícone de seta ▼ |
| Foco | `focus:ring-2 focus:ring-chocolate` |
| Selecionado | Texto da opção escolhida visível |
| Erro | Borda vermelha + mensagem abaixo |
| Desabilitado | `opacity-60 cursor-not-allowed` |

### Comportamento
- A primeira opção do select deve ser um placeholder desabilitado: `<option value="" disabled>Selecione uma categoria</option>`
- Ao selecionar opção, campo adjacente pode ser atualizado (ex.: selecionar ingrediente preenche unidade padrão)
- Select de papel (UserRole) deve exibir descrição do papel ao selecionar

### Boas práticas
- Usar `<select>` nativo para simplicidade e compatibilidade mobile
- Não usar select para mais de 20 opções — neste caso, usar Autocomplete (componente 4)
- Agrupar opções relacionadas com `<optgroup>` quando há mais de 8 itens
- Label sempre visível acima do select

### Responsividade
- `w-full` sempre
- Em mobile, o select nativo usa a interface do sistema operacional (comportamento ideal)

### Acessibilidade
- `<label>` associado via `htmlFor`
- `aria-required="true"` quando obrigatório
- `aria-invalid` + `aria-describedby` para erros

### Padronização visual
```
<select className="input-field appearance-none pr-8 bg-[url('/chevron-down.svg')] bg-no-repeat bg-[right_1rem_center]">
```

---

## 4. Autocomplete

### Objetivo
Permitir seleção de um item a partir de uma lista grande ou dinâmica, com filtragem por texto digitado.

### Casos de uso no sistema
- Seleção de ingrediente ao adicionar linha em receita
- Seleção de fornecedor ao registrar compra
- Busca de cliente na lista de atendimento

### Comportamento
1. Usuário digita no campo de texto
2. Lista de sugestões aparece abaixo (dropdown)
3. Sugestões são filtradas em tempo real (debounce de 300ms para buscas na API)
4. Usuário seleciona item com toque/clique ou teclado (↑↓ Enter)
5. Campo exibe o nome do item selecionado; ID é armazenado no estado
6. Botão ✕ limpa a seleção e volta ao estado de busca

### Variações

| Variação | Descrição |
|----------|-----------|
| Busca local | Filtra array já carregado (sem API call) — para listas pequenas (<100 itens) |
| Busca remota | Chama API com debounce — para listas grandes ou dinâmicas |
| Com criação | Exibe opção "Criar novo: {texto}" quando nenhum resultado encontrado |

### Estados

| Estado | Aparência |
|--------|-----------|
| Vazio | Placeholder visível |
| Digitando | Spinner ou "Buscando…" enquanto debounce pendente |
| Resultados | Lista dropdown com itens destacando o trecho digitado |
| Sem resultados | "Nenhum resultado para '{busca}'" + opção de criar (quando permitido) |
| Selecionado | Texto do item + botão ✕ |
| Erro | Borda vermelha + mensagem |

### Boas práticas
- Debounce de 300ms em buscas remotas para evitar excesso de requisições
- Fechar dropdown ao clicar fora (listener no `document`)
- Fechar dropdown ao pressionar `Escape`
- Mostrar no mínimo 3 caracteres antes de iniciar busca remota
- Destacar o trecho pesquisado no resultado com `<mark>` ou estilo bold

### Responsividade
- Dropdown abre para baixo; em mobile, ocupa a largura total do campo
- Em telas pequenas, dropdown com `max-h-48 overflow-y-auto`

### Acessibilidade
- `role="combobox"` no input, `aria-expanded` para indicar estado do dropdown
- `role="listbox"` na lista de resultados
- `role="option"` em cada item; `aria-selected` no item ativo
- Navegação por teclado: ↑↓ movem o foco, Enter seleciona, Esc fecha

---

## 5. Tabela

### Objetivo
Exibir listas de dados estruturados com colunas definidas, suporte a ordenação e seleção de linhas.

### Casos de uso
- Lista de pedidos (admin)
- Lista de ingredientes (admin)
- Histórico de preços de um ingrediente
- DRE e fluxo de caixa

### Variações

| Variação | Uso |
|----------|-----|
| Simples | Listagem sem ações por linha |
| Com ações | Última coluna com botões Editar / Excluir / Ver |
| Selecionável | Checkbox na primeira coluna para seleção múltipla |
| Expansível | Linha clicável que expande detalhes abaixo (sem nova tela) |

### Estrutura HTML semântica
```html
<table>
  <thead>
    <tr>
      <th scope="col">Coluna</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Valor</td>
    </tr>
  </tbody>
</table>
```

### Estados por linha

| Estado | Aparência |
|--------|-----------|
| Padrão | Fundo branco / alternado com `bg-sand/30` |
| Hover | `hover:bg-sand/50` |
| Selecionada | `bg-rose/10 border-l-2 border-rose` |
| Expandida | Linha adicional abaixo com fundo `bg-sand/20` |
| Urgente / alerta | `border-l-2 border-red-500` |

### Comportamento
- Ordenação: clique no cabeçalho alterna entre ASC / DESC / padrão
- Cabeçalho de ordenação exibe ícone: `↑` (ASC), `↓` (DESC), `↕` (padrão)
- Tabelas largas usam `overflow-x-auto` no container
- Colunas de valor numérico alinhadas à direita
- Colunas de texto alinhadas à esquerda
- Coluna de ações sempre à direita, largura fixa

### Boas práticas
- Máximo de 7 colunas visíveis simultaneamente em desktop
- Em mobile, esconder colunas menos importantes via classe `hidden md:table-cell`
- Nunca usar tabela para layout — apenas para dados tabulares reais
- Linhas zeradas (0 resultados): exibir mensagem de estado vazio na célula com `colspan`

### Responsividade
- Desktop: tabela completa com todas as colunas
- Tablet: ocultar 1–2 colunas de menor importância
- Mobile: considerar lista de cards em vez de tabela (ver componente Cards)
- Exceção: tabelas financeiras (DRE, fluxo de caixa) mantêm formato tabela mesmo em mobile com scroll horizontal

### Acessibilidade
- `<caption>` descrevendo o conteúdo da tabela (pode ser `sr-only` se há título visível)
- `scope="col"` em cada `<th>` de cabeçalho
- `scope="row"` em `<th>` de linha quando aplicável
- Tabela com ordenação: `aria-sort="ascending"` ou `"descending"` no `<th>` ativo

---

## 6. Cards

### Objetivo
Exibir um item de conteúdo (produto, pedido, cliente, ingrediente) de forma visual e compacta.

### Variações

| Variação | Uso |
|----------|-----|
| Produto (vitrine) | Imagem + nome + preço + prazo + controle de quantidade |
| Pedido (kanban) | Número + cliente + itens + status + hora de entrega |
| Pedido (lista cliente) | Número + status badge + data + total + ações |
| Estatística | Ícone + label + valor numérico grande |
| Módulo (hub admin) | Ícone emoji + título + descrição + link |
| Urgente | Card com borda lateral vermelha, destaque visual |
| Seleção (option-card) | Card clicável para seleção exclusiva (entrega, pagamento) |

### Estados

| Estado | Aparência |
|--------|-----------|
| Padrão | Fundo branco, `shadow-card` |
| Hover | `hover:shadow-md` (cards clicáveis) |
| Selecionado (option-card) | `.selected`: borda chocolate + fundo levemente colorido |
| Urgente | `border-l-4 border-red-500` |
| Inativo / desabilitado | `opacity-50` |

### Comportamento
- Cards da vitrine com controles +/− integrados atualizam o CartContext imediatamente
- Cards do kanban são arrastáveis (Fase 2) ou têm botão de avançar status
- Cards clicáveis sem link usam `role="button"` e `tabIndex={0}`
- Option-cards de seleção exclusiva: selecionar um desmarca os demais

### Boas práticas
- Não sobrecarregar o card com mais de 4–5 informações visíveis
- Ação primária do card sempre clara — seja clique para detalhe ou botão interno
- Cards com status: sempre usar badge de status (ver componente 11)
- Evitar cards completamente sem borda — usar `shadow-card` para separar do fundo

### Responsividade
- Vitrine: cards em coluna única em mobile; grid 2 colunas opcionalmente em tablet
- Admin hub: grid de 2 colunas em mobile, 3–4 em desktop
- Kanban: colunas em scroll horizontal no mobile (`overflow-x-auto`)

### Acessibilidade
- `role="article"` em cards de produto ou pedido
- Cards clicáveis: `role="button" tabIndex={0}` com suporte a Enter e Espaço
- Imagem de produto: `alt="Nome do produto"`
- Cards com badge de status: badge tem texto visível (não apenas cor)

### Padronização visual (`.shadow-card`)
```css
.shadow-card {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.05);
  border-radius: 1rem;      /* rounded-2xl */
  background: white;
  padding: 1rem;
}
```

---

## 7. Modais

### Objetivo
Exibir conteúdo ou solicitar confirmação ao usuário sem sair da tela atual.

### Variações

| Variação | Uso |
|----------|-----|
| Confirmação | "Tem certeza que deseja cancelar o pedido?" + Cancelar / Confirmar |
| Formulário | Criar/editar item rápido sem abrir nova página (ex: criar categoria) |
| Informativo | Exibir detalhe de item sem ação de modificação |
| Alerta / Erro | Mensagem de erro crítico que exige leitura |

### Comportamento
- Abre com animação: `opacity-0 → opacity-100` + `scale-95 → scale-100` (150ms)
- Fecha com animação inversa
- Fundo: overlay escuro `bg-black/50` cobrindo toda a tela
- Fecha ao clicar no overlay (exceto modal de confirmação crítica)
- Fecha ao pressionar `Escape`
- Foco é movido para o primeiro elemento interativo do modal ao abrir
- Foco retorna ao elemento que abriu o modal ao fechar
- Scroll da página bloqueado enquanto modal está aberto (`overflow-hidden` no body)

### Estados do overlay e modal

| Estado | Aparência |
|--------|-----------|
| Fechado | Não renderizado no DOM ou `hidden` |
| Abrindo | Animação de entrada |
| Aberto | Visível e interativo |
| Fechando | Animação de saída |

### Estrutura
```
Overlay (fixed inset-0 bg-black/50 z-50)
  └── Container (flex items-center justify-center p-4)
       └── Modal (bg-card rounded-2xl shadow-xl max-w-md w-full p-6)
            ├── Título (font-display text-xl font-semibold)
            ├── Botão fechar ✕ (absolute top-4 right-4)
            ├── Conteúdo
            └── Rodapé com ações (flex gap-3 justify-end)
```

**Implementação (Sprint `DS.5`, ADR-025):** `EntityForm` (formulário) e `ConfirmDialog` (confirmação) — componente 21 — são construídos sobre as primitivas `Dialog`/`AlertDialog` do Radix (via shadcn/ui), não mais divs escritas à mão. Trap de foco, fechamento por `Escape` e clique no overlay agora vêm do Radix, não de um `useEffect` com `keydown` manual como antes da DS.5.

### Boas práticas
- Modal de confirmação: botão destrutivo à direita (posição de ação principal)
- Máximo de 2 ações no rodapé
- Título curto e descritivo: "Cancelar pedido #42?" (não "Confirmação")
- Formulários simples (1–3 campos) cabem em modal; formulários maiores merecem página própria
- Evitar modais dentro de modais

### Responsividade
- Em mobile: modal ocupa `w-full` com `max-w-none`, posicionado na parte inferior (bottom sheet) via `rounded-t-2xl`
- Em desktop: `max-w-md` centralizado

### Acessibilidade
- `role="dialog"` no container do modal
- `aria-modal="true"`
- `aria-labelledby` apontando para o título do modal
- Trap de foco: Tab não deve sair do modal enquanto aberto
- Botão fechar com `aria-label="Fechar"`

---

## 8. Drawer

### Objetivo
Exibir conteúdo deslizante a partir de uma borda da tela, sem bloquear completamente o contexto anterior.

### Variações

| Variação | Posição | Uso |
|----------|---------|-----|
| Bottom sheet | Desliza de baixo | CartDrawer (mobile-first) |
| Lateral (right) | Desliza da direita | Menu lateral admin em mobile |
| Lateral (left) | Desliza da esquerda | N/A no sistema atual |

### Comportamento
- Abre com animação: `translateY(100%)` → `translateY(0)` para bottom sheet (250ms ease-out)
- Fecha ao clicar no overlay, pressionar `Escape`, ou tocar no handle e arrastar para baixo
- Handle de arraste: barra horizontal cinza no topo do bottom sheet
- Altura máxima: `max-h-[80vh]` com `overflow-y-auto` internamente
- Fundo com overlay `bg-black/40`

### CartDrawer (implementado)
- Exibe lista de itens com controles de quantidade
- Total fixo no rodapé com botão "Finalizar pedido"
- Lista com `scrollbar-none` e `overflow-y-auto`
- CartFab: botão flutuante que abre o drawer, `position: fixed`; canto inferior central em mobile, `right-6` fixo em `md:`+
- **Variante desktop (Sprint DS.4):** em `md:`+ (768px), o drawer deixa de ser bottom sheet e passa a ser um painel ancorado à direita, altura cheia (`md:inset-y-0 md:right-0 md:h-full md:w-96`) — mesmo conteúdo/comportamento, só a posição/dimensão mudam
- Renderizado pelo `ClientShell` (não por cada página) — disponível em Vitrine, Pedidos e Login; `CartFab` oculto apenas em `/checkout` (carrinho já exibido inline nessa tela)
- **Implementação (Sprint `DS.5`, ADR-025):** migrado das primitivas Radix Dialog (mesmo motor do `Sheet` do shadcn/ui) — ganha trap de foco e fechamento por `Escape`/overlay que a implementação anterior não tinha. `CartFab` e os controles de quantidade agora usam o componente `Button` do shadcn.

### Boas práticas
- Drawer não deve exigir scroll na área fora do drawer
- Conteúdo principal do drawer deve ser `overflow-y-auto` para listas longas
- Não usar drawer para formulários complexos — prefira página própria
- Handle de arraste ajuda na descoberta do gesto de fechar em mobile (oculto na variante painel de desktop, `md:hidden`)

### Responsividade
- Bottom sheet: exclusivo para mobile (< 768px); painel lateral direito em `md:`+ (768px) — implementado na Sprint DS.4, CartDrawer acima
- Drawer lateral admin: aparece apenas em mobile; em desktop o menu fica fixo visível

### Acessibilidade
- `role="dialog"` no container
- `aria-label="Carrinho de compras"` ou descrição equivalente
- `aria-modal="true"`
- Trap de foco quando aberto
- Botão fechar explícito (além de clicar no overlay)

---

## 9. Tabs

### Objetivo
Organizar conteúdo relacionado em grupos acessíveis por abas sem mudar de página.

### Casos de uso
- Dashboard de produção: Hoje / Amanhã / Semana / Calendário
- Formulário de ingrediente: Dados / Histórico de preços
- Relatório financeiro: por período (mês, trimestre, ano)

### Variações

| Variação | Descrição |
|----------|-----------|
| Linha (underline) | Aba com borda inferior colorida quando ativa — usada no dashboard de produção |
| Pills | Aba com fundo colorido quando ativa — para contextos mais compactos |
| Scrollável | Linha de abas com scroll horizontal quando ultrapassam a largura disponível |

### Comportamento
- Clicar em aba muda o painel de conteúdo imediatamente (sem animação entre painéis)
- Aba ativa sempre visível (scroll automático se necessário)
- O painel de conteúdo inativo pode ser mantido no DOM (sem re-render) ou desmontado conforme custo de carregamento

### Estados

| Estado | Aparência |
|--------|-----------|
| Inativa | Texto muted, sem borda inferior |
| Ativa | Texto chocolate, `border-b-2 border-chocolate` |
| Hover | `text-chocolate` suave |
| Desabilitada | `opacity-40 cursor-not-allowed` |

### Boas práticas
- Máximo de 5–6 abas; mais do que isso indica necessidade de reorganização do conteúdo
- Labels curtos: "Hoje", "Amanhã", "Semana" (não "Pedidos de hoje")
- A aba padrão (primeira) deve ser a mais útil para o caso de uso principal
- Não usar abas para fluxo sequencial — use Stepper (componente 10)

### Responsividade
- Menos de 4 abas: espaçamento uniforme em linha
- 4 ou mais abas em mobile: linha scrollável com `overflow-x-auto scrollbar-none`
- Nunca quebrar abas em múltiplas linhas

### Acessibilidade
- `role="tablist"` no container das abas
- `role="tab"` em cada aba, com `aria-selected="true"` na ativa
- `role="tabpanel"` no painel de conteúdo, com `aria-labelledby` apontando para o id da aba
- Navegação por teclado: `←` e `→` movem entre abas; `Enter` ativa

---

## 10. Stepper

### Objetivo
Guiar o usuário por um fluxo sequencial de etapas, mostrando progresso e permitindo revisão de passos anteriores.

### Casos de uso
- Login do cliente: Telefone → OTP → Confirmação
- Registro de compra: Fornecedor → Itens → Revisão
- Checkout simplificado (possível reorganização futura)

### Variações

| Variação | Descrição |
|----------|-----------|
| Horizontal | Etapas exibidas em linha — para 3–4 passos em desktop |
| Vertical | Etapas empilhadas — para mobile ou muitos passos |
| Numerado | Círculo com número da etapa |
| Com ícone | Círculo com ícone de check quando concluído |

### Estados por etapa

| Estado | Aparência |
|--------|-----------|
| Futura | Círculo cinza / muted, texto muted |
| Atual | Círculo chocolate sólido, texto bold |
| Concluída | Círculo sage com ✓, texto muted |
| Com erro | Círculo vermelho com ✕ |

### Comportamento
- Avançar: botão "Continuar" valida o passo atual antes de ir para o próximo
- Voltar: botão "Voltar" retorna ao passo anterior sem perder dados
- Clique em etapa concluída permite revisão (exceto se a etapa atual tem dados dependentes)
- Progresso linear: não é possível pular etapas

### Boas práticas
- Máximo de 5 etapas — fluxos maiores devem ser divididos em múltiplos fluxos
- Label de cada etapa: 1–2 palavras ("Telefone", "Verificação", "Confirmação")
- Mostrar resumo das etapas anteriores na etapa final de revisão
- Não usar stepper para conteúdo navegacional — use Tabs

### Responsividade
- Mobile: stepper horizontal com labels curtos ou apenas números
- Desktop: stepper horizontal com labels completos abaixo dos círculos

### Acessibilidade
- `role="list"` no container, `role="listitem"` em cada etapa
- Etapa atual com `aria-current="step"`
- Progresso anunciado ao screen reader: "Passo 2 de 4: Verificação"

---

## 11. Badges

### Objetivo
Exibir um rótulo visual compacto para status, categorias ou contagens.

### Variações

| Variação | Cor | Uso |
|----------|-----|-----|
| Confirmado | Rose / rosa | Pedido aguardando produção |
| Em produção | Amber / amarelo | Pedido sendo produzido |
| Pronto | Sage / verde | Pedido finalizado, aguardando retirada/entrega |
| Saiu para entrega | Azul | Pedido em trânsito |
| Entregue | Sand / bege | Pedido concluído |
| Cancelado | Cinza | Pedido cancelado |
| Alerta | Vermelho | Erro, urgência, estoque abaixo do mínimo |
| Contagem | Chocolate | Número de itens no carrinho (CartFab) |
| Categoria | Sand | Tag de categoria ou ocasião do produto |

### Estrutura
```html
<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-sage/20 text-sage-dark">
  Pronto
</span>
```

### Estados
- Badges não têm estados interativos (não são clicáveis por padrão)
- Exceção: chips de filtro (ver componente 17 — Filtros) têm estado ativo/inativo

### Boas práticas
- Badge deve sempre ter texto (nunca apenas cor como informação)
- Texto curto: máximo 2–3 palavras
- Usar a mesma cor para o mesmo status em toda a aplicação
- Nunca usar badges para informações críticas que exigem ação — usar Alertas

### Responsividade
- Tamanho fixo `text-xs` — não escala com breakpoints
- Cabe em qualquer contexto (dentro de cards, tabelas, listas)

### Acessibilidade
- Se o badge indica status, incluir `aria-label` descritivo em contextos onde a cor pode não ser suficiente
- `role="status"` quando o badge atualiza dinamicamente (ex.: status que muda após ação)

### Mapa de cores de status

| Status | Bg | Texto |
|--------|-----|-------|
| CONFIRMADO | `bg-rose/20` | `text-rose-800` |
| EM_PRODUCAO | `bg-amber-100` | `text-amber-800` |
| PRONTO | `bg-sage/20` | `text-sage-dark` |
| SAIU_ENTREGA | `bg-blue-100` | `text-blue-800` |
| ENTREGUE | `bg-sand` | `text-chocolate` |
| CANCELADO | `bg-gray-100` | `text-gray-600` |
| RASCUNHO | `bg-gray-50` | `text-gray-500` |

---

## 12. Alertas

### Objetivo
Comunicar mensagens importantes ao usuário que exigem atenção — erros, avisos, sucesso ou informações contextuais persistentes.

### Variações

| Variação | Cor | Uso |
|----------|-----|-----|
| Erro | Vermelho | Falha na operação, campo inválido, erro de servidor |
| Aviso | Amarelo | Ação com consequências (margem negativa, estoque baixo) |
| Sucesso | Verde / sage | Operação concluída com sucesso |
| Informativo | Azul | Instruções contextuais, avisos neutros |

### Estrutura
```html
<div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-3">
  <span aria-hidden="true">⚠️</span>
  <div>
    <p className="text-sm font-semibold text-red-800">Título do erro</p>
    <p className="text-sm text-red-700">Descrição do problema e como resolver.</p>
  </div>
  <button aria-label="Fechar alerta">✕</button>
</div>
```

### Comportamento
- Alerta de erro: persiste até o usuário fechar ou corrigir o problema
- Alerta de sucesso: pode auto-fechar após 5s (com barra de progresso visual)
- Alerta de aviso em formulário: aparece abaixo do campo inválido
- Alerta contextual (ex.: "margem negativa"): persiste dentro do formulário até o campo ser corrigido

### Boas práticas
- Texto de erro descritivo e acionável: "CEP inválido — verifique os 8 dígitos" (não "Erro no campo")
- Nunca usar apenas cor para distinguir tipos de alerta — sempre incluir ícone e texto
- Alertas dentro de formulários aparecem abaixo do campo, não no topo da página
- Alertas de erro do servidor aparecem no topo do formulário
- Não empilhar mais de 2 alertas simultâneos na mesma tela

### Responsividade
- Alerta de página: `w-full` com `max-w-app` (área cliente) ou `max-w-3xl` (admin)
- Alerta de campo: alinhado com a largura do campo

### Acessibilidade
- `role="alert"` — anunciado automaticamente por screen readers ao aparecer
- `role="alertdialog"` para alertas que exigem confirmação antes de continuar
- `aria-live="polite"` para avisos não urgentes
- `aria-live="assertive"` para erros críticos

---

## 13. Toasts

### Objetivo
Notificar o usuário sobre o resultado de ações breves, sem interromper o fluxo da tarefa.

### Variações

| Variação | Cor | Uso |
|----------|-----|-----|
| Sucesso | Sage / verde | Item adicionado ao carrinho, pedido confirmado |
| Erro | Vermelho | Falha rápida, item não disponível |
| Aviso | Amarelo | Ação com ressalva |
| Informativo | Azul / neutro | Mensagem neutra de feedback |

### Comportamento
- Aparece no canto inferior central da tela (mobile) ou inferior direito (desktop)
- Auto-dismiss após **2 segundos** (carrinho) ou **4 segundos** (operações mais complexas)
- Animação de entrada: desliza de baixo para cima + fade-in
- Animação de saída: fade-out
- Máximo de 3 toasts simultâneos (empilhados)
- Toasts de erro não têm auto-dismiss — exigem fechamento manual

### Implementação atual (Sprint `DS.5`, ADR-025)
Toda notificação do sistema — carrinho (cliente) e `ValidationSummary`/`ToastState` (admin, usado em 17 páginas) — foi migrada para a biblioteca `sonner`. Um único `<Toaster />` global vive em `src/app/layout.tsx` (cobre admin e cliente); não há mais um componente `Toast` bespoke nem estado local de toast por página. Padrão para operações assíncronas (criar/editar/ativar/desativar): `const id = toast.loading("Salvando…")` no início, seguido de `toast.success(msg, { id })` ou `toast.error(msg, { id })` no fim — o mesmo toast é atualizado no lugar, em vez de empilhar um novo. `src/components/admin/config/ValidationSummary.tsx` foi removido (código morto, sem consumidores).

### Estrutura
Gerenciada inteiramente pelo `sonner` (`src/components/ui/sonner.tsx`) — não há mais um componente de toast escrito à mão para documentar a estrutura interna.

### Boas práticas
- Mensagem curta: máximo 1 linha (~60 caracteres)
- Não usar toast para erros que exigem ação do usuário — use Alertas
- Não usar toast para informações que o usuário precisará consultar depois — use Alertas persistentes
- Toast de sucesso com conteúdo relacionado: "Bolo Mesversário adicionado ✓"

### Responsividade
- Mobile: largura `max-w-[90vw]`, centralizado horizontalmente
- Desktop: largura fixa `max-w-sm`, ancorado ao canto inferior direito

### Acessibilidade
- `role="status"` para toasts informativos (não urgentes)
- `aria-live="polite"` no container de toasts
- `aria-atomic="true"` para garantir que a mensagem completa seja anunciada

---

## 14. Loading

### Objetivo
Indicar ao usuário que uma operação está em progresso e o sistema está respondendo.

### Variações

| Variação | Uso |
|----------|-----|
| Spinner inline | Dentro de botão durante submit, ao lado de campo durante busca |
| Spinner de página | Tela inteira aguardando carregamento inicial da sessão |
| Barra de progresso | Upload de arquivo, carregamento de relatório longo |
| Texto de estado | "Confirmando…", "Carregando pedidos…" abaixo de spinner |

### Implementação atual
- Estado de sessão carregando: spinner de página em `/checkout` enquanto `sessionStatus === "loading"`
- Botão de submit: `isSubmitting` substitui texto por "Confirmando…" e desabilita o botão

### Comportamento
- Spinner sempre animado (rotação contínua)
- Nunca bloquear a UI inteira com loading a menos que seja operação de inicialização
- Operações longas (>3s): mostrar feedback de progresso ou mensagem adicional

### Boas práticas
- Loading mínimo: não exibir spinner para operações menores que 300ms (evita flicker)
- Implementar com `isLoading` e delay de exibição de 200ms
- Nunca deixar o usuário sem feedback em operações que levam mais de 1s
- Texto de loading em primeira pessoa indireta: "Carregando…" (não "Por favor aguarde")

### Responsividade
- Spinner de página: centralizado vertical e horizontalmente
- Spinner inline: mesma linha do conteúdo que está sendo carregado

### Acessibilidade
- `aria-busy="true"` no container sendo carregado
- `aria-label="Carregando..."` no spinner (visualmente oculto com `sr-only`)
- Spinner: `role="status"` para anúncio automático ao screen reader

### Tamanhos

| Contexto | Tamanho | Classe |
|----------|---------|--------|
| Inline (botão) | 16px | `w-4 h-4` |
| Card / seção | 24px | `w-6 h-6` |
| Página | 40px | `w-10 h-10` |

---

## 15. Skeleton

### Objetivo
Exibir um placeholder do formato do conteúdo enquanto os dados ainda estão sendo carregados, evitando layout shift.

### Casos de uso
- Lista de produtos enquanto `/api/products` carrega
- Lista de pedidos enquanto `/api/orders` carrega
- Cards de estatísticas no painel admin

### Variações

| Variação | Uso |
|----------|-----|
| Linha de texto | Substitui parágrafos e títulos |
| Retângulo | Substitui imagens, cards e blocos |
| Círculo | Substitui avatares e ícones circulares |
| Card completo | Combinação de retângulo + linhas (produto, pedido) |

### Comportamento
- Animação shimmer: `animate-pulse` (Tailwind) ou gradiente deslizante da esquerda para direita
- Cor: `bg-sand animate-pulse` (tons neutros de areia)
- Deve ter exatamente o mesmo tamanho e forma do conteúdo real que substitui
- Exibido por no máximo 3s; após isso, exibir erro se os dados ainda não chegaram

### Exemplo de skeleton de card de produto
```html
<div className="rounded-2xl bg-sand animate-pulse p-4">
  <div className="h-24 w-24 rounded-xl bg-sand/70 mx-auto mb-3" />  <!-- imagem -->
  <div className="h-4 w-3/4 rounded bg-sand/70 mb-2" />             <!-- nome -->
  <div className="h-3 w-1/2 rounded bg-sand/70 mb-1" />             <!-- preço -->
  <div className="h-3 w-1/3 rounded bg-sand/70" />                  <!-- prazo -->
</div>
```

### Boas práticas
- Nunca usar spinner de página quando skeleton pode ocupar o espaço exato do conteúdo
- Número de skeletons deve refletir a quantidade esperada de itens (ex.: 8 cards se API retorna ~8 produtos)
- Não animar com velocidade excessiva — `animate-pulse` com 1.5s é suficiente

### Responsividade
- Skeleton tem exatamente o mesmo layout responsivo que o conteúdo real

### Acessibilidade
- Container com `aria-busy="true"` enquanto skeletons estão visíveis
- `aria-label="Carregando conteúdo"` no container
- Screen readers não anunciam os skeletons individualmente

---

## 16. Paginação

### Objetivo
Dividir listas longas em páginas navegáveis para manter o desempenho e a legibilidade.

### Casos de uso
- Lista de pedidos (admin)
- Lista de clientes
- Histórico de preços de ingrediente
- Relatórios com muitos registros

### Variações

| Variação | Uso |
|----------|-----|
| Paginação numerada | Listas de tamanho conhecido (ex.: 127 pedidos) |
| "Carregar mais" | Listas com scroll infinito ou tamanho desconhecido |
| Cursor-based | Listas em tempo real onde dados mudam frequentemente |

### Estrutura (paginação numerada)
```
← Anterior   1  2  [3]  4  5  …  12   Próximo →
```

Exibir no máximo 5 números de página + reticências para páginas distantes.

### Comportamento
- Página ativa com estilo diferenciado (fundo chocolate, texto branco)
- Botão "Anterior" desabilitado na primeira página
- Botão "Próximo" desabilitado na última página
- Ao mudar de página: scroll para o topo da lista
- Manter página atual na URL via query param: `?page=3`
- Informação de contexto: "Mostrando 21–30 de 127 pedidos"

### Boas práticas
- Tamanho de página padrão: 20 itens (listas de admin)
- Oferecer seletor de itens por página apenas se necessário (10 / 20 / 50)
- "Carregar mais" preferível para mobile (evita necessidade de navegar para outra página)
- Sempre exibir contagem total: "127 pedidos"

### Responsividade
- Desktop: paginação numerada completa
- Mobile: apenas "← Anterior" e "Próximo →" com indicador de página atual ("3 de 12")

### Acessibilidade
- `<nav aria-label="Paginação">` no container
- Página atual: `aria-current="page"` no botão correspondente
- Botões desabilitados: `disabled` + `aria-disabled="true"`
- Reticências: `aria-hidden="true"`

---

## 17. Filtros

### Objetivo
Permitir que o usuário refine uma lista de conteúdo por critérios específicos.

### Variações

| Variação | Uso |
|----------|-----|
| Chips horizontais | Filtro por ocasião na vitrine; abas de status no admin |
| Barra de busca | Campo de texto para filtrar por nome |
| Filtro lateral (sidebar) | Múltiplos critérios simultâneos em listas admin |
| Filtro inline (dropdown) | Seletor de período, status ou categoria dentro da barra de ferramentas |

### Chips de filtro (implementado na vitrine)
```html
<div className="overflow-x-auto scrollbar-none">
  <div className="flex gap-2 pb-2">
    <button className="chip">Todos</button>
    <button className="chip chip--active">Aniversário</button>
    <button className="chip">Casamento</button>
  </div>
</div>
```

### Estados dos chips

| Estado | Aparência |
|--------|-----------|
| Inativo | Fundo areia, texto chocolate |
| Ativo | Fundo chocolate, texto branco |
| Hover | `opacity-80` |

### Comportamento
- "Todos" sempre disponível e desmarca os outros filtros ao ser selecionado
- Múltipla seleção: deve ser explicitamente habilitado (padrão é seleção exclusiva)
- Filtros aplicados instantaneamente (sem botão "Aplicar") quando são simples
- Filtros complexos (múltiplos critérios): exibir botão "Aplicar filtros"
- Indicador de filtros ativos: badge com contagem "2 filtros ativos"
- Botão "Limpar filtros" quando houver filtros ativos

### Boas práticas
- Chips de filtro sempre em linha horizontal com scroll — nunca quebrar linha
- Filtros que afetam toda a listagem devem estar no topo da lista
- Quando filtros resultam em 0 itens: exibir estado vazio + botão "Limpar filtros"
- Persistir filtros na URL para compartilhamento: `?status=CONFIRMADO&date=hoje`

### Responsividade
- Chips: scroll horizontal em mobile (`overflow-x-auto scrollbar-none`)
- Sidebar de filtros: oculta em mobile, acessível via botão "Filtros" com drawer

### Acessibilidade
- Chips como `<button type="button">` com `aria-pressed="true"` quando ativo
- Região de resultados com `aria-live="polite"` para anunciar mudanças ao filtrar

---

## 18. Calendário

### Objetivo
Permitir seleção de datas ou visualização de eventos distribuídos por período.

### Variações

| Variação | Uso |
|----------|-----|
| Date picker (input nativo) | Seleção de data única no checkout (`type="date"`) |
| Date range picker | Seleção de período para relatórios e filtros |
| Calendário de produção | Visualização de pedidos por dia/semana (admin produção) |

### Date picker nativo (`type="date"`)

**Implementado no checkout.**

Comportamento:
- Atributo `min` define a data mínima possível (leadTimeDays calculado)
- Atributo `max` pode definir limite futuro se necessário
- Usa interface nativa do sistema operacional em mobile

Padronização visual:
```html
<input type="date" className="input-field" min={minDate} value={deliveryDate} onChange={...} />
```

### Calendário de produção (admin)

Estrutura por semana:
```
Dom  Seg  Ter  Qua  Qui  Sex  Sáb
 29   30    1    2    3    4    5
       ●    ●●       ●●●
```

Legenda:
- `●` = 1 pedido
- `●●` = 2–3 pedidos
- `●●●` = 4+ pedidos (possível sobrecarga)
- Dia em vermelho = sobrecarga identificada

### Comportamento
- Clicar em um dia do calendário de produção filtra o kanban para aquela data
- Mês atual como padrão; navegação por `← Mês anterior` / `Próximo mês →`
- Dias passados: texto muted; dias futuros: texto normal

### Boas práticas
- Usar input nativo `type="date"` para seleção simples (melhor UX mobile)
- Exibir o formato aceito: "DD/MM/AAAA" no label ou placeholder
- Calendário de produção deve ter link de volta para "hoje" sempre visível

### Responsividade
- Date picker: sempre input nativo em mobile (keyboard nativa)
- Calendário de produção: semana completa em desktop; dia a dia em mobile com swipe

### Acessibilidade
- Input nativo de data: `aria-label` descritivo
- Calendário custom: `role="grid"`, células com `role="gridcell"`, `aria-label` com data por extenso ("segunda-feira, 5 de julho de 2026")
- Dia com pedidos: `aria-label="5 de julho, 3 pedidos"`

---

## 19. Upload

### Objetivo
Permitir que o usuário envie arquivos (fotos, documentos) para o sistema.

### Casos de uso
- Fotos de referência no checkout (cliente)
- Upload de logo na configuração de tema
- Upload de nota fiscal em compras (admin)
- Upload de imagem de produto

### Variações

| Variação | Uso |
|----------|-----|
| Zona de arraste | Área grande clicável ou drop target — produtos, logo |
| Botão simples | Input de arquivo oculto + label como botão — nota fiscal |
| Multi-upload | Aceita múltiplos arquivos — fotos de referência (máx 5) |
| Com preview | Miniatura da imagem após seleção — produtos, fotos de referência |

### Estado atual
O upload está como placeholder no checkout: `"📷 Toque para enviar fotos · JPG, PNG até 5 MB (em breve)"`.

### Comportamento
1. Clique ou toque abre o seletor de arquivo nativo
2. Arquivo selecionado: preview aparece (imagem) ou nome do arquivo (PDF)
3. Validação imediata: tipo e tamanho antes do upload
4. Upload acontece: barra de progresso + "Enviando..."
5. Sucesso: preview final com botão de remover
6. Erro: mensagem de erro + opção de tentar novamente

### Estados

| Estado | Aparência |
|--------|-----------|
| Vazio | Zona tracejada com ícone e texto instrucional |
| Drag over | Borda sólida chocolate + fundo levemente colorido |
| Enviando | Barra de progresso dentro da zona |
| Concluído | Preview da imagem com botão ✕ no canto |
| Erro | Borda vermelha + mensagem de erro |

### Restrições (padrão do sistema)
- Tipos aceitos: JPG, PNG, PDF (conforme contexto)
- Tamanho máximo: 5 MB por arquivo
- Máximo de arquivos: 5 (fotos de referência), 1 (logo, nota fiscal)

### Boas práticas
- Nunca usar `<input type="file">` visível — sempre ocultar e usar label/botão como trigger
- Exibir preview imediato após seleção (antes do upload)
- Validar no frontend antes de enviar para a API
- Comprimir imagens no cliente quando > 2 MB (canvas API ou biblioteca)
- Exibir progresso real (não simulado) para uploads > 500 KB

### Responsividade
- Zona de arraste: menor em mobile (`min-h-[120px]`), maior em desktop (`min-h-[200px]`)
- Drag-and-drop funcional apenas em desktop; mobile usa apenas toque/clique

### Acessibilidade
- `<label htmlFor="file-input">` com texto descritivo como trigger visual
- `<input type="file" id="file-input" className="sr-only">` (visualmente oculto)
- Após seleção, anunciar o nome do arquivo: `aria-live="polite"`
- Botão de remover: `aria-label="Remover foto: nome-do-arquivo.jpg"`

---

## 20. Gráficos

### Objetivo
Visualizar dados quantitativos (vendas, custos, estoque, variação de preços) de forma clara e compacta.

### Casos de uso
- Variação de preço de ingrediente ao longo do tempo (histórico)
- Faturamento por período (financeiro)
- Distribuição de pedidos por status ou tipo de pagamento
- Giro de estoque por ingrediente

### Variações

| Tipo | Uso |
|------|-----|
| Linha | Variação de preço de ingrediente; faturamento mensal ao longo do ano |
| Barras verticais | Faturamento por semana/mês; pedidos por dia |
| Barras horizontais | Ranking de produtos mais vendidos |
| Pizza / donut | Distribuição por categoria de produto; métodos de pagamento |
| Sparkline | Mini gráfico inline (ex.: variação de custo no card de ingrediente) |

### Biblioteca
A definir. Opções compatíveis com Next.js 16 + React 19:
- **Recharts** — mais usado com React, boa integração
- **Chart.js + react-chartjs-2** — madura, muitos tipos
- **Tremor** — componentes prontos estilo admin (avaliar conflito com design system atual)

> Decisão deve ser tomada antes da Sprint de implementação do Financeiro (Fase 7).

### Comportamento
- Tooltip ao hover em cada ponto / barra
- Legenda abaixo do gráfico (nunca em cima)
- Eixos com labels formatados em pt-BR (datas, moedas)
- Responsivo: redimensiona com o container
- Período alterável via seletor acima do gráfico (integrado com filtros)

### Formatação de dados

| Tipo de dado | Formato |
|-------------|---------|
| Moeda | `R$ 1.234,56` (não `R$ 1234.56`) |
| Porcentagem | `55,0%` |
| Data (eixo X) | `Jan`, `Fev`, `Mar` (abreviado) ou `05/07` (dia/mês) |
| Número grande | `1.234` (ponto como separador de milhar) |

### Paleta de cores para gráficos

Usar as cores do design system:
- Série principal: chocolate (`#3d2314` ou variação)
- Série secundária: rose
- Série terciária: sage
- Alertas / negativos: vermelho
- Neutros / referência: sand / muted

### Boas práticas
- Máximo de 3–4 séries simultâneas em um único gráfico
- Título acima do gráfico, sempre em pt-BR
- Sempre mostrar o período de referência no título ou subtítulo: "Faturamento — Junho 2026"
- Dados zerados: exibir linha em zero (não omitir o eixo)
- Gráfico de pizza: máximo 6 fatias; agrupar o restante em "Outros"
- Não usar gráfico 3D — dificulta leitura e acessibilidade

### Responsividade
- Gráficos de linha e barra: altura fixa (`h-48` mobile, `h-64` desktop), largura fluida (`w-full`)
- Em mobile, reduzir labels do eixo X (mostrar menos pontos)
- Legenda abaixo do gráfico em mobile (não ao lado)

### Acessibilidade
- Todo gráfico deve ter `aria-label` descritivo: `"Gráfico de barras: faturamento por semana de junho de 2026"`
- Tabela de dados alternativa: link "Ver dados em tabela" abaixo do gráfico
- Não depender apenas de cor para distinguir séries — usar também padrão de linha (sólida, pontilhada)
- Tooltips acessíveis por teclado (foco nos pontos de dado com Tab)

---

## 21. Componentes Compartilhados de Cadastro Mestre (`src/components/admin/shared/`)

### Objetivo
Eliminar a duplicação identificada na Sprint 2.E.6 (`MODULE_2E_UX_REVIEW.md`) entre as páginas de Cadastro Mestre (Unidades, Ingredientes, Receitas, Produtos, Fornecedores) — 6 componentes redeclarados de forma quase idêntica em 5 arquivos. Implementados na Sprint 2.E.7, estreados em `/admin/fornecedores`. Adotados nas páginas principais de Unidades, Ingredientes, Receitas e Produtos, e — na Sprint G.8 — nas partes classificadas como seguras de `unidades/conversoes`, `ingredientes/categorias` e `receitas/[id]` (ver `MODULE_G8_CLOSURE.md`, seção "Cartografia de Compatibilidade do Design System", para o critério completo de quando um componente é seguro para migrar e quando depende de pré-requisito de layout/modelo de interface).

### `PageContainer`
- **Responsabilidade (revisada na Sprint DS.2):** wrapper de **conteúdo** de página admin — aplica `mx-auto max-w-5xl pb-8`. Não é mais o shell raiz da página (isso passou para `AdminShell`/`admin/layout.tsx` na Sprint DS.2) — `min-h-screen`/`bg-cream` agora vivem um nível acima, fora de cada página individual.
- **Propriedades:** `children`.
- **Caso de uso:** todas as 19 páginas admin autenticadas (exceto `/admin/login`) usam `PageContainer` logo após `HeaderMinimal` — inclusive as 7 que ainda usavam wrapper `max-w-app` próprio antes da Sprint DS.2 (`/admin` hub, `categorias`, `ocasioes`, `ingredientes/categorias`, `receitas/[id]`, `unidades/conversoes`, `em-construcao`).
- **Restrição:** não adicionar padding horizontal/vertical próprio a `PageContainer` — `HeaderMinimal` (sticky, full-bleed) e o conteúdo interno de cada página já gerenciam o próprio `px-5`/`p-5`; padding aqui causaria duplicação. Não usar na área cliente (usa `.max-w-app`, componente diferente).

### `Sidebar` / `AdminShell` (novos na Sprint DS.2)
- **Arquivos:** `src/components/admin/shared/Sidebar.tsx`, `src/components/admin/shared/AdminShell.tsx`, `src/app/admin/layout.tsx`.
- **Responsabilidade:** navegação persistente do admin — sidebar vertical fixa (240px, `UX_GUIDELINES.md` Seção 15) em desktop/tablet (`md:` — 768px+); barra horizontal com rolagem em mobile. `AdminShell` decide se renderiza o shell (`min-h-screen bg-cream` + `Sidebar` + `<main>`) ou passa `children` direto — `/admin/login` fica fora do shell (decisão do Product Owner, Sprint DS.2).
- **Filtragem por papel:** os itens de navegação são filtrados pelo `role` da sessão (`useSession()`), espelhando `src/proxy.ts` `ROLE_REQUIRED` — um usuário só vê no menu o que pode de fato acessar (princípio já registrado em `MENU_STRUCTURE.md`, nunca implementado antes de DS.2).
- **Caso de uso:** aplicado automaticamente a todas as páginas sob `/admin/*` via `admin/layout.tsx` — nenhuma página individual precisa importar `Sidebar`.
- **Restrição:** a lista de rotas/papéis em `Sidebar.tsx` deve ser mantida manualmente em sincronia com `src/proxy.ts` `ROLE_REQUIRED` — não há fonte única compartilhada entre os dois ainda (achado registrado, não uma dívida técnica formal nesta sprint).

### `VitrineSidebar` / `ClientShell` (novos na Sprint DS.4)
- **Arquivos:** `src/components/vitrine/VitrineSidebar.tsx`, `src/components/layout/ClientShell.tsx`, `src/app/(client)/layout.tsx`.
- **Responsabilidade:** navegação persistente da área cliente (Vitrine) e chrome de carrinho compartilhado — sidebar de ocasiões (`OccasionTag`, ícone `lucide-react` real por ocasião via `src/lib/icons.ts`) em `md:`+ (768px, mesmo breakpoint do admin); recolhível para modo só-ícone via botão do próprio usuário (`w-60` ↔ `w-16`), sem auto-colapso por faixa de largura. `ClientShell` hospeda `CartFab`/`CartDrawer`/`Toast` e a sincronização de `?cart=open` — disponíveis em todas as páginas cliente (Vitrine, Checkout, Pedidos, Login), exceto o `CartFab` especificamente em `/checkout` (já mostra o carrinho inline; ver `CartDrawer`/`CartFab` abaixo).
- **Diferença deliberada de `Sidebar`/`AdminShell`:** **não é o mesmo componente reaproveitado** — fonte de dados distinta (ocasiões públicas via `/api/occasions`, não sessão/papel do usuário) e por isso implementado como componente próprio, não uma variante do `Sidebar` do admin.
- **Caso de uso:** `VitrineSidebar` só é renderizada em `src/app/(client)/page.tsx` (Vitrine); `ClientShell` é aplicado automaticamente a todas as páginas sob `(client)` via `(client)/layout.tsx` — nenhuma página individual precisa importar `CartFab`/`CartDrawer`/`Toast`.
- **Restrição:** ao adicionar uma ocasião nova sem ícone mapeado em `src/lib/icons.ts`, o fallback é o ícone genérico `Tag` — cadastrar o nome do ícone Lucide correspondente em `OccasionTag.icon` e no mapa ao criar a ocasião.

### `ResponsiveGrid`
- **Responsabilidade:** grid de listagem responsivo — 1 coluna (mobile) → 2 (tablet, `md:`) → 3 (desktop, `xl:`, opcional via prop `cols`).
- **Propriedades:** `children`, `cols?: 2 | 3` (default 3).
- **Caso de uso:** grid de `EntityCard` em qualquer listagem administrativa.
- **Restrição:** não é virtualizado — para volumes muito grandes (centenas de itens visíveis simultaneamente), avaliar Tabela (ver componente 5) em vez de forçar mais colunas.

### `StatCard`
- **Responsabilidade:** célula individual de estatística — label+badge de variação no topo, valor grande, nota pequena embaixo (layout revisado na Sprint `DS.3`, padrão "kpi" do modelo de referência).
- **Propriedades:** `value: string | number`, `label: string`, `trend?: {direction: "up"|"down", text: string}` (novo, DS.3), `note?: string` (novo, DS.3).
- **Caso de uso:** faixas de estatística no topo de listagens (Total/Ativos/Inativos em Fornecedores, Pedidos/Itens/Urgentes em Produção).
- **Restrição:** não busca dados sozinho — o número é calculado pela página. `trend`/`note` são opcionais e hoje sem consumidor real (nenhuma API calcula "vs. período anterior") — construídos mesmo assim por decisão explícita do Product Owner na Sprint `DS.3`.

### `BarChart` (novo, Sprint `DS.3`)
- **Arquivo:** `src/components/admin/shared/BarChart.tsx`.
- **Responsabilidade:** gráfico de barras simples, CSS puro (sem lib) — padrão do modelo de referência.
- **Propriedades:** `data: {label: string, value: number, highlight?: boolean}[]`.
- **Restrição:** sem tela consumidora real hoje (nenhum módulo tem série temporal, ex. faturamento diário) — construído por decisão explícita do Product Owner, pronto para quando existir.

### `StockItem` (novo, Sprint `DS.3`)
- **Arquivo:** `src/components/admin/shared/StockItem.tsx`.
- **Responsabilidade:** item de estoque crítico com tag de status (`low`/`mid`/`ok`), borda tracejada — padrão "stock-item" do modelo de referência.
- **Propriedades:** `icon: string`, `name: string`, `sub: string`, `qty: string`, `status: "low"|"mid"|"ok"`.
- **Restrição:** sem tela consumidora real hoje (não existe módulo de Insumos/Estoque implementado) — construído por decisão explícita do Product Owner, pronto para quando existir.

### `SearchBar`
- **Responsabilidade:** input de busca padronizado (`type="search"`, estilo `.input-field`).
- **Propriedades:** `value`, `onChange(value)`, `placeholder`, `ariaLabel`.
- **Caso de uso:** pesquisa por nome em qualquer listagem — local ou remota (debounce fica na página, não no componente).
- **Restrição:** não inclui debounce interno — cada página decide o próprio tempo de debounce (300ms é o padrão do projeto, `UX_GUIDELINES.md` Seção 10).

### `StatusBadge`
- **Responsabilidade:** badge Ativo/Inativo (ou labels customizados).
- **Propriedades:** `isActive: boolean`, `activeLabel?`, `inactiveLabel?` (defaults "Ativo"/"Inativo").
- **Caso de uso:** qualquer entidade com campo `active`.
- **Restrição:** só para status binário ativo/inativo — status de pedido (múltiplos valores) continua usando o mapa de cores do componente 11 (Badges), não este. Classificação (Sprint G.8): **Reutilização Condicional** — pré-requisito é a entidade ter um campo booleano de status; não depende de layout/container da página (migrado com sucesso em `receitas/[id]/page.tsx`, que permanece em `max-w-app`).
- **Implementação (Sprint `DS.5`, ADR-025):** construído sobre `Badge` do shadcn/ui (`variant="outline"` + classes de cor `sage`/`sand` originais preservadas).

### `LoadingState`
- **Responsabilidade:** placeholder de carregamento em grid, com `aria-busy`.
- **Propriedades:** `count?: number` (default 3).
- **Caso de uso:** estado de loading inicial de qualquer listagem em grid.
- **Restrição:** ainda é o placeholder genérico `animate-pulse` (não fiel ao card real) — Skeleton fiel ao `EntityCard` fica como Melhoria Futura (ver `MODULE_2E_UX_REVIEW.md` Seção 9). Classificação (Sprint G.8): **Dependente de Evolução de Layout** — a grade `md:grid-cols-2 xl:grid-cols-3` pressupõe o container `PageContainer` (`max-w-5xl`) + `ResponsiveGrid`; páginas em `max-w-app` (layout legado) devem manter o `LoadingState` local até migrarem o container (ver `MODULE_G8_CLOSURE.md`).

### `ErrorState`
- **Responsabilidade:** mensagem de erro de carregamento + botão "Tentar novamente".
- **Propriedades:** `message: string`, `onRetry: () => void`.
- **Caso de uso:** falha ao carregar lista (erro de rede/servidor).

### `EmptyState`
- **Responsabilidade:** estado vazio genérico (sem itens ou sem resultado de filtro).
- **Propriedades:** `title`, `description`, `actionLabel?`, `onAction?`.
- **Caso de uso:** lista vazia (com ou sem ação de criar) e lista filtrada sem resultado (sem ação).

### `FilterChips<T>`
- **Responsabilidade:** grupo de chips de filtro exclusivo (genérico por tipo `T extends string`).
- **Propriedades:** `label`, `options: {value: T, label: string}[]`, `selected: T`, `onSelect(value: T)`.
- **Caso de uso:** filtro de status, tipo, categoria — qualquer filtro de seleção única com poucas opções (≤ 8, `UX_GUIDELINES.md` Seção 12).
- **Restrição:** seleção única apenas — múltipla seleção não suportada (não houve caso de uso real ainda).

### `ConfirmDialog`
- **Responsabilidade:** modal de confirmação genérico, com trap de foco, fechamento por `Escape`, foco inicial no botão de confirmação.
- **Propriedades:** `title`, `description` (`ReactNode`), `cancelLabel`, `confirmLabel`, `destructive?` (default `true`), `busy?`, `onCancel`, `onConfirm`.
- **Caso de uso:** qualquer confirmação de ação (desativar, excluir). Resolve o achado 1.3 da Sprint 2.E.6 (confirmação inconsistente entre módulos) para quem adotar o componente.
- **Restrição:** só 2 botões (cancelar/confirmar), conforme `UX_GUIDELINES.md` Seção 6 ("Máximo de 2 ações no rodapé").
- **Implementação (Sprint `DS.5`, ADR-025):** construído sobre `AlertDialog` do shadcn/ui — mesma API pública, internals trocados. A variante `destructive` do `Button` subjacente foi ajustada de sutil (`bg-destructive/10`, padrão shadcn) para sólida (`bg-destructive`), para manter a ênfase visual que o app já usava em ações destrutivas; a versão sutil original continua disponível como `variant="destructive-subtle"`.

### `EntityCard`
- **Responsabilidade:** shell visual de card de listagem — cabeçalho (título + badges), conteúdo livre, rodapé de ações.
- **Propriedades:** `title: string`, `badges?: ReactNode`, `children?: ReactNode` (linhas de informação), `actions: ReactNode` (botões).
- **Caso de uso:** qualquer item de listagem de Cadastro Mestre.
- **Restrição:** não inclui os botões de ação prontos (ex.: Editar/Desativar) — cada página monta os próprios botões e passa via `actions`, porque o conjunto de ações varia por módulo (Produtos tem Excluir, Unidades não). Classificação (Sprint G.8): **Dependente do Modelo de Interface** — distinta de "Dependente de Evolução de Layout" (caso do `LoadingState` acima): o bloqueio não é o container/grid da página, é o item da listagem ser um card empilhado (título acima, ações abaixo); listagens em linha horizontal (nome à esquerda, ações à direita — ex.: `CategoryRow`, `ConversionCard`, `ItemCard`) exigem mudar o modelo de apresentação do item antes de adotar `EntityCard`, independentemente da largura do container (ver `MODULE_G8_CLOSURE.md`).
- **Implementação (Sprint `DS.5`, ADR-025):** construído sobre `Card` do shadcn/ui.

### `EntityForm`
- **Responsabilidade:** shell de modal de criação/edição — bottom sheet em mobile (`< 768px`), centralizado em desktop (`≥ 768px`, `max-w-lg`), conforme `DESIGN_SYSTEM.md` #7. Trap de foco, fechamento por `Escape`/clique no overlay, foco automático no primeiro campo.
- **Propriedades:** `title`, `submitting`, `submitLabel`, `cancelLabel?` (default "Cancelar"), `onClose`, `onSubmit`, `children` (campos do formulário).
- **Caso de uso:** qualquer criação/edição em modal (não substitui formulários de página própria — `UX_GUIDELINES.md` Seção 2, formulários maiores que 1-3 campos "merecem página própria"; `EntityForm` é para o caso modal).
- **Restrição:** usa `max-w-lg` (levemente maior que o `max-w-md` documentado no componente 7), para acomodar formulários agrupados em `Section` sem ficar apertado — desvio pequeno e documentado, não uma nova convenção livre.
- **Implementação (Sprint `DS.5`, ADR-025):** construído diretamente sobre as primitivas Radix `Dialog` (via `radix-ui`, mesmo motor do `Sheet` do shadcn/ui) — a alternância bottom-sheet↔dialog é resolvida com Tailwind responsivo escrito à mão, já que nenhuma primitiva shadcn cobre os dois modos sozinha. Ganha trap de foco, `Escape` e clique-fora do Radix, que a implementação anterior (hand-rolled) não tinha de forma completa.

### Reaproveitados sem alteração de responsabilidade (não recriados)
- **`Field`/`Section`** (`src/components/admin/config/FormPrimitives.tsx`) — já existiam; `Field` ganhou suporte a `htmlFor` (extensão retrocompatível) para acessibilidade de label/input.
- **`PageHeader`** → já satisfeito por `HeaderMinimal` (`src/components/layout/Header.tsx`), não recriado.
- **`EntityFormSection`** → já satisfeito por `Section` (acima), não recriado.
- **`EntityActions`** → não criado como componente próprio; os botões de ação são passados como `children`/prop `actions` do `EntityCard`, pois o conjunto de ações varia por módulo.
- **`SectionHeader`** → redundante com o título já embutido em `Section`, não criado.
- **`ActionBar`** (footer fixo de formulário de página inteira) → já existe para Config; não aplicável ao padrão modal de Fornecedores, não reaproveitado nesta sprint.

---

## Sumário dos componentes

| # | Componente | Status | Implementado em |
|---|-----------|--------|-----------------|
| 1 | Botões | ✅ | Toda a aplicação |
| 2 | Inputs | ✅ | Checkout, Login |
| 3 | Select | ✅ (nativo) | Formulários admin (planejados) |
| 4 | Autocomplete | 🔲 | Formulários de Receita e Compra |
| 5 | Tabela | 🔲 | Listas admin |
| 6 | Cards | ✅ | Vitrine, Kanban, Hub admin |
| 7 | Modais | 🔲 | Confirmações, formulários rápidos |
| 8 | Drawer | ✅ | CartDrawer (bottom sheet) |
| 9 | Tabs | ✅ | Dashboard de produção |
| 10 | Stepper | ⚠️ | Login cliente (2 passos) |
| 11 | Badges | ✅ | Status de pedidos, chips de ocasião |
| 12 | Alertas | ⚠️ | Erro de submit no checkout |
| 13 | Toasts | ✅ | CartDrawer (adição ao carrinho) |
| 14 | Loading | ✅ | Checkout (sessão), botões de submit |
| 15 | Skeleton | 🔲 | Listas de produtos e pedidos |
| 16 | Paginação | 🔲 | Listas admin longas |
| 17 | Filtros | ✅ | Chips de ocasião na vitrine |
| 18 | Calendário | ⚠️ | Date picker nativo no checkout |
| 19 | Upload | ⚠️ | Placeholder no checkout (Fase 8) |
| 20 | Gráficos | 🔲 | Financeiro e relatórios (Fase 7+) |
| 21 | Componentes Compartilhados de Cadastro Mestre | ✅ | `/admin/fornecedores` (Sprint 2.E.7); adotados nas 4 páginas principais (Unidades/Ingredientes/Receitas/Produtos) e, nas partes seguras, em `unidades/conversoes`/`ingredientes/categorias`/`receitas/[id]` (Sprint G.8) — ver Cartografia de Compatibilidade em `MODULE_G8_CLOSURE.md` |

**Legenda:** ✅ Implementado | ⚠️ Parcial | 🔲 Planejado
