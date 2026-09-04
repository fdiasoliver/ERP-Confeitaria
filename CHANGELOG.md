# CHANGELOG.md — Doce Menina

Registro cronológico de todas as sprints e mudanças significativas.

---

## [Sprint DS.5] — 2026-08-27/28 — Redesign completo com shadcn/ui

**Tipo:** Sprint Oficial — quinta sprint sob o prefixo `DS.x` (ADR-018), primeira a trocar a camada de componentes em si (não só paleta/tokens/layout como `DS.1`–`DS.4`). Planejada em modo de planejamento dedicado (pesquisa do código real + agente de design de implementação), aprovada pelo Product Owner via `ExitPlanMode`, implementada em 7 microtarefas (`DS.5.1`–`DS.5.7`), cada uma validada (`tsc`/`lint`/`build`/visual real) antes da próxima.

### Planejamento

Pedido do Product Owner: insatisfação recorrente com o design desde o início do projeto, mesmo após 4 rounds de redesign (`DS.1`–`DS.4`). Diagnóstico: Tailwind CSS não era o limitador — o projeto nunca teve uma camada de componentes testada (focus trap, diálogos acessíveis, variantes consistentes), tudo escrito à mão. Decisão do Product Owner: adotar shadcn/ui (Radix + Tailwind, código copiado para o repo) em redesign completo, não gradual, cobrindo admin e cliente. Em paralelo, decisão de hospedagem (Vercel + Supabase + Hostgator só DNS) registrada como Sprint de infraestrutura separada (`I.4`, ainda não iniciada — depende de acesso à conta Vercel do Product Owner). Decisões de escopo fechadas antes da implementação: toasts via `sonner`; fundos "white" literais consolidados em `surface-2`/`cream` (sem 9º token); `sage`/`caramel` continuam como utilitário Tailwind solto, sem slot semântico `--success`/`--warning`; arquivos com múltiplas exportações (`Header.tsx`, `CartDrawer.tsx`, `ProductCard.tsx`) permanecem mesclados; Storybook fora de escopo.

### Implementação

**DS.5.1 (Fundação):** `npx shadcn@latest init -d --base radix` — 9 primitivas geradas (`button`, `input`, `label`, `dialog`, `alert-dialog`, `sheet`, `badge`, `card`, `sonner`). `src/app/globals.css` reescrito à mão mapeando os 8 tokens já aprovados para as variáveis semânticas do shadcn (`--background`→cream, `--primary`→chocolate, `--destructive`→rose, `--card`/`--popover`/`--secondary`/`--accent`→surface-2 etc.) — sem rodar o wizard automático de tema, que geraria uma paleta neutra incompatível. ADR-025 registrada em `CLAUDE.md`, revertendo a proibição anterior a bibliotecas de componentes externas. `package.json` ganhou `postinstall: prisma generate` (necessário para builds na Vercel). **Dois achados reais do próprio `shadcn init`, corrigidos antes de validar:** sobrescreveu `src/lib/utils.ts` inteiro, apagando `getMinDeliveryDate` (usada no checkout) — restaurada; adicionou uma fonte Geist não solicitada em `layout.tsx`, contra a decisão de fonte única (Manrope) da Sprint `DS.3` — revertida. **Ajuste de mapeamento:** o slot semântico `--muted` do shadcn colidia com o token `--muted` já existente (usado como cor de texto em dezenas de lugares via `text-muted`) — mantido apontando para o valor original (`#726A5F`) para não regredir nada já implementado.

**DS.5.2 (Primitivas compartilhadas do admin):** `EntityForm` → `Dialog` (Radix), com alternância bottom-sheet (mobile) ↔ centralizado (desktop) escrita à mão em Tailwind responsivo, já que nenhuma primitiva shadcn cobre os dois modos sozinha. `ConfirmDialog` → `AlertDialog`, com `preventDefault()` no botão de confirmação para não disparar o fechamento automático do Radix em paralelo com o callback `onConfirm`. `StatusBadge` → `Badge`. `EntityCard` → `Card`. **Achado corrigido durante a validação real:** a variante `destructive` padrão do shadcn é sutil (`bg-destructive/10`) — abaixo do padrão do app, que sempre usa CTAs sólidos para ações importantes; `button.tsx` ajustado para `destructive` sólido por padrão, preservando a versão sutil como `destructive-subtle`. Validado ao vivo em `/admin/fornecedores` (criar, editar em mobile e desktop, badge, confirmar desativação).

**DS.5.3 (Propagação para demais páginas admin):** achado real — `categorias` e `ocasioes` eram páginas legadas (anteriores ao padrão de componentes compartilhados) com `StatusBadge`/`EntityCard`/`EntityForm`/`ConfirmDialog`-equivalentes duplicados localmente. Migradas para os componentes compartilhados (com `activeLabel`/`inactiveLabel` customizados para concordância de gênero em português); `categorias` tinha uma regra de negócio extra (bloquear desativação com produtos vinculados) resolvida com um componente local pequeno (`BlockedDeactivateDialog`) sobre `AlertDialog` direto. As outras 11 páginas que já consumiam os componentes compartilhados herdaram o redesenho automaticamente, sem edição.

**DS.5.4 (Módulo Configuração):** `FormPrimitives.tsx` — `Field` passou a usar `Label` do shadcn, `Section` passou a usar `Card` (API pública inalterada, nenhum dos 5 componentes de seção consumidores mudou). `ActionBar`/`UploadImage` migrados para `Button`. `LoadingSkeleton` — `bg-white` → `bg-surface-2`. Escopo intencionalmente não estendido aos `<input>`/`<select>` brutos dos 5 componentes de seção (`AddressSection` etc.) — trocar o `<select>` nativo por `Select` do Radix mudaria comportamento de interação real para ganho visual mínimo.

**DS.5.5 (Layout/carrinho):** `CartDrawer` migrado para as primitivas Radix Dialog (mesmo motor do `Sheet`), mesma alternância responsiva do `EntityForm` — ganha trap de foco e fechamento por `Escape`/overlay que a implementação anterior não tinha. `CartFab` baseado em `Button`. Toast do carrinho migrado para `sonner`: `CartContext` perdeu o estado interno de toast, chamando `toast()` do sonner diretamente; `<Toaster />` adicionado uma vez em `src/app/layout.tsx`.

**DS.5.5b (ValidationSummary → sonner, 17 páginas admin):** escopo adicional aprovado pelo Product Owner durante a sprint. Migração de `showToast`/`toastTimer`/`ToastState` local (17 páginas) para `sonner`, com padrão `const id = toast.loading(msg)` → `toast.success/error(msg, { id })` linkando o mesmo toast em vez de empilhar um novo. Referência implementada manualmente em `categorias/page.tsx`; as demais 16 páginas migradas por 2 agentes `ai-frontend-engineer` em paralelo (8 arquivos cada), seguindo a referência. `ValidationSummary.tsx` removido (código morto, sem consumidores) na `DS.5.7`.

**DS.5.6 (Vitrine + páginas cliente):** `ProductCard`/`ProductHero`/`VitrineSidebar` — botões de quantidade e CTAs migrados para `Button`; `bg-white` → `bg-card`. **Achado adicional corrigido:** `pedidos/page.tsx` tinha uma mensagem de erro com `bg-red-50`/`text-red-700` fora do sistema de tokens — mesma classe de achado já resolvido em `DS.3` para `STATUS_CLASS` da mesma página. **Erro cometido e corrigido na mesma sessão:** ao "corrigir" essa mesma classe de cor crua em `checkout`/`login`/`pedidos`, não foi checado o `CHANGELOG.md` primeiro — as Sprints `DS.1` e `DS.3` já haviam decidido explicitamente **manter** `bg-red-50`/`text-red-700` nessas 3 mensagens de erro específicas (semânticas de sistema, fora da identidade de marca); revertido para o valor original assim que o histórico foi checado.

**DS.5.7 (Documentação e encerramento):** `ValidationSummary.tsx` removido. `DESIGN_SYSTEM.md` atualizado (tokens, Modais, Drawer, Toasts, Botões, componentes compartilhados) registrando a implementação shadcn/ui em cada seção afetada, sem duplicar o registro já feito em `CLAUDE.md` (ADR-025). `UX_GUIDELINES.md` não alterado — nenhum princípio de UX/comportamento mudou, só a implementação interna.

### Validação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` (após cada microtarefa) | 0 erros |
| `npm run lint` (após cada microtarefa) | 0 erros (8 avisos cosméticos pré-existentes de "unused eslint-disable directive", mesmo padrão já visto antes da sprint) |
| `npm run build` (após cada microtarefa) | Build de produção completo, 0 erros |

**Validação funcional (navegador real, Claude Preview):** login admin real, criar/editar/ativar/desativar em `fornecedores`/`categorias`/`ocasioes`/`receitas`, responsivo mobile (390px) e desktop (1280px) no `EntityForm`/`CartDrawer` (bottom sheet ↔ dialog/painel), submissão real do formulário de Configuração, fluxo completo do carrinho (adicionar → toast → drawer → checkout), toast `loading`→`success` atualizando no mesmo elemento em `/admin/receitas`. 0 erros de console nos cenários testados.

### Pendência

Sprint `I.4` (Vercel + Supabase + Hostgator) planejada mas não iniciada — depende de acesso à conta Vercel do Product Owner (`vercel login` interativo) e da connection string atual do Supabase.

---

## [Sprint DS.4] — 2026-08-11 — Área cliente responsiva (Vitrine + Checkout/Pedidos/Login)

**Tipo:** Sprint Oficial — quarta sprint sob o prefixo `DS.x` (ADR-018). Diferente de `DS.1`–`DS.3` (cor/tipografia/estilo visual), esta sprint tratou especificamente de layout e responsividade: a área cliente não aproveitava a largura da tela em telas maiores, ao contrário do admin (`DS.2`). Planejada via `ai-solution-architect`, com múltiplas decisões do Product Owner divergindo da recomendação original (registradas na ADR-024, `CLAUDE.md`). Implementada em 5 fases (DS.4.1–DS.4.5), cada uma validada (`tsc`/`lint`/`build`/visual real) antes da próxima.

### Planejamento

Pedido do Product Owner: cores e fontes da Sprint `DS.3` já estavam corretas — o problema era o layout da Vitrine não aproveitar a largura da tela como o admin, em telas maiores. Direção escolhida entre as opções apresentadas: sidebar de categorias na área cliente, no mesmo padrão visual do admin. Decisões que divergiram da recomendação original do `ai-solution-architect`, todas explícitas do Product Owner: breakpoint `md` (768px, igual ao admin) em vez de `lg` (1024px); sidebar recolhível para modo só-ícone ("magnética"), inspirada em uma referência visual genérica de UX (mantendo as cores e a aparência já existentes do projeto, não as da referência); carrinho (`CartFab`/`CartDrawer`/`Toast`) disponível em todas as páginas cliente (Vitrine, Checkout, Pedidos, Login), não só na Vitrine; escopo expandido de "só Vitrine" para "Vitrine + Checkout/Pedidos/Login"; ADR registrada ao final da sprint, não antes da implementação.

### Implementação

**DS.4.1 (Fundação):** `lucide-react` instalado (primeira biblioteca de ícones do projeto). Páginas movidas para `src/app/(client)/` (route group — mesma URL, sem mudança de rota): `page.tsx`, `checkout/page.tsx`, `pedidos/page.tsx`, `login/page.tsx`. Novo `src/components/layout/ClientShell.tsx` + `src/app/(client)/layout.tsx`, paralelo a `AdminShell.tsx` (`DS.2`). **Incidente:** apagar apenas `.next/types` com o servidor de desenvolvimento rodando corrompeu o cache do Turbopack (erro de SST file, HTTP 500 em todas as rotas) — corrigido parando o servidor, removendo `.next` por completo e reiniciando.

**DS.4.2 (VitrineSidebar):** `OccasionTag.icon` das 6 ocasiões reais atualizado no banco (antes sempre `"calendar"`, o valor padrão nunca customizado) — `aniversario→cake, mesversario→gift, docinhos→candy, corporativo→briefcase, casamento→heart, cafe→coffee`. Novo `src/lib/icons.ts` (mapa explícito nome→ícone Lucide, não lookup dinâmico do pacote inteiro, para tree-shaking). Novo `src/components/vitrine/VitrineSidebar.tsx` — componente próprio, não reaproveita `src/components/admin/shared/Sidebar.tsx` (fonte de dados distinta: ocasiões públicas via API, não sessão/papel); recolhível para modo só-ícone via botão do próprio usuário, breakpoint `md`. `src/app/(client)/page.tsx` restruturado: sidebar à esquerda, chips de categoria (`CategoryChips`) só em mobile, grid de produtos `md:grid-cols-3 xl:grid-cols-4`.

**DS.4.3 (CartDrawer responsivo + disponível em todas as páginas):** `CartDrawer` ganhou variante desktop (`md:`+: painel ancorado à direita, altura cheia, `w-96`) mantendo o bottom-sheet mobile inalterado; `CartFab` reposicionado (`right-6` fixo no desktop, substituindo a fórmula antiga calculada para o layout centralizado `max-w-app` que não fazia mais sentido no layout com sidebar). Estado do carrinho (`cartOpen`, sincronização de `?cart=open`) e renderização de `CartFab`/`CartDrawer`/`Toast` movidos de `src/app/(client)/page.tsx` (só Vitrine) para `ClientShell.tsx` (todas as páginas cliente). **Achado corrigido durante a validação funcional, não previsto no planejamento:** com o `CartFab` global, em mobile ele sobrepunha completamente o botão final "Confirmar e pagar com PIX" do Checkout, bloqueando o toque — o Checkout já exibe o carrinho inline, tornando o FAB ali redundante. Corrigido ocultando o `CartFab` especificamente em `/checkout` (`usePathname()` no `ClientShell`), decisão validada com o Product Owner via pergunta explícita antes da correção.

**DS.4.4 (Checkout/Pedidos/Login — layouts largos):** Checkout (`src/app/(client)/checkout/page.tsx`) ganhou layout de 2 colunas em `lg:`+ (formulário à esquerda, resumo do pedido `sticky` à direita, container `max-w-5xl`) — validado com 2 pedidos reais criados via fluxo real de checkout (retirada, sem endereço) e removidos após o teste. Pedidos (`src/app/(client)/pedidos/page.tsx`) ganhou grid `lg:grid-cols-2` (antes lista de 1 coluna sempre) — validado com os mesmos 2 pedidos reais. Login (`src/app/(client)/login/page.tsx`) permanece `max-w-app` (decisão explícita do Product Owner de não alargar), mas passou a centralizar verticalmente (`flex` + `justify-center`) em vez de ficar ancorado ao topo com um vazio grande abaixo em telas altas.

### Validação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` (após cada fase) | 0 erros |
| `npm run lint` (após cada fase) | 0 erros/avisos |
| `npm run build` (após DS.4.1 e ao final) | Build de produção completo, 0 erros — todas as rotas do route group `(client)` preservam a URL original |

**Validação funcional (Playwright, navegador real):** varredura em 3 larguras (1440px desktop, 768px tablet — exatamente no limite do breakpoint `md` — e 390px mobile) nas 4 páginas (`/`, `/checkout`, `/pedidos`, `/login`). Login real via OTP (telefone de teste, código lido do banco), 2 pedidos reais criados via fluxo de checkout completo para validar o grid de Pedidos e removidos ao final (pedido, itens, cliente e código OTP). Persistência do carrinho confirmada entre páginas via navegação client-side (SPA); confirmado que `page.goto`/reload de página inteira zera o carrinho — comportamento pré-existente do `CartContext` (sem `localStorage`), não uma regressão desta sprint. 0 erros de console em todos os cenários.

---

## [Sprint DS.3] — 2026-08-10 — Redesenho a partir de modelo de referência real ("Modelo 1")

**Tipo:** Sprint Oficial — terceira sprint sob o prefixo `DS.x` (ADR-018), substituindo a direção `DS.2` ("A × C") em todo o app (admin + cliente final). Diferente de `DS.1`/`DS.2` (que compararam 3 direções geradas via Artifact), esta sprint partiu de um arquivo HTML real fornecido pelo Product Owner. Conduzida via `ai-project-manager`/`ai-solution-architect` (planejamento) → implementação direta na sessão principal, em 5 fases (DS.3.1–DS.3.5), cada uma validada (`tsc`/`lint`/`build`/visual real) antes da próxima.

### Planejamento

Product Owner forneceu `3-estoque-financeiro.html` ("Modelo 1" de 2 modelos) — painel de Estoque & Financeiro, visual SaaS/back-office: fonte `Manrope` única, paleta `paper`/`card`/`ink`/`pistachio`/`caramel`/`berry`, sidebar 230px, cards de KPI, gráfico de barras, lista de estoque crítico com tags de status. Decisão do Product Owner: aplicar a todo o admin (20 páginas) + área do cliente final, não só às telas de estoque/financeiro que o modelo mostrava.

`ai-solution-architect` verificou contraste WCAG de cada acento antes de propor valores finais (mesma prática de `DS.1`/`DS.2`) — encontrou que o `caramel` cru do modelo (`#C6884F`) falha como texto (~2,8:1); adotado o padrão "cor sólida + fundo em opacidade baixa" já usado no projeto (`StatusBadge`/`ValidationSummary`) em vez de criar tokens `-soft` extras. `--cream`/`--sand`/`--chocolate` mantidos nos valores já calibrados em `DS.2.1` (diferença do modelo imperceptível, sem ganho real em trocar). Achado que motivou a criação do `--caramel`: `src/app/pedidos/page.tsx` já tinha uma dívida técnica real (Tailwind cru fora do design system) que o novo token resolve de graça.

Sete decisões do Product Owner antes de implementar: fonte `Manrope` única (não híbrida); destaque de item ativo da Sidebar migra de `rose` para `sage` (corrige sobreposição de significado); área do cliente final também adota card flat estilo back-office (não só paleta/fonte); token `--caramel` criado mesmo sem consumidor imediato no admin; `BarChart`/`StockItem` construídos mesmo sem tela real; `StatCard` ganha badge de variação mesmo sem dado real; `--cream`/`--sand`/`--chocolate` mantidos nos valores atuais.

### Implementação

**DS.3.1 (Fundação):** `src/app/globals.css` — token novo `--caramel:#8A5B22`. `src/app/layout.tsx` — `Fraunces`+`DM Sans` substituídos por `Manrope` único. **Bug real encontrado e corrigido durante a implementação:** `.font-display` em `globals.css` estava hardcoded para `var(--font-fraunces)` (variável removida do `layout.tsx`), o que teria silenciosamente quebrado para o fallback `Georgia, serif` em todo elemento com essa classe — corrigido para `var(--font-display)` (o token, não a variável de fonte direto) + `font-weight: 800` (diferenciação display/corpo passa a ser só por peso).

**DS.3.2 (Admin):** `Sidebar.tsx` — destaque do item ativo de `bg-surface-2 text-rose` para `bg-surface-2 text-sage`; `rose` mantido só no botão "Sair". `ConfirmDialog`/`ErrorState`/`StatusBadge`/`ValidationSummary`/`FormPrimitives`/`UploadImage` revisados — já usavam `rose`/`sage` corretamente (destrutivo/erro), nenhuma mudança necessária.

**DS.3.3 (Componentes novos):** `BarChart.tsx` e `StockItem.tsx` novos em `src/components/admin/shared/` — sem tela consumidora real, prontos para quando existir módulo de Insumos/Estoque ou série temporal. `StatCard.tsx` — layout revisado (label+badge no topo, valor grande, nota embaixo) + props opcionais `trend`/`note`.

**DS.3.4 (Cliente final):** `ProductCard`/`ProductHero` (`src/components/vitrine/ProductCard.tsx`) — gradiente determinístico substituído por ícone flat sobre `surface-2` com borda `sand` (mesma linguagem do admin); `getProductGradientClass()` removido de `src/lib/utils.ts` (código morto após a troca). `src/app/pedidos/page.tsx` `STATUS_CLASS` corrigido de Tailwind cru (`amber-100`/`blue-100`/`red-100`) para tokens do design system (`sage`=positivo, `caramel`=em andamento, `rose`=negativo, `sand`=neutro) — dívida técnica pré-existente resolvida dentro do escopo desta sprint. `bg-red-50`/`text-red-700` de mensagens de erro (`checkout`/`login`/`pedidos`) revisados e mantidos como estão — mesma decisão já tomada na Sprint `DS.1` (semânticos, fora da identidade de marca).

**Achado adicional, fora do plano original, corrigido na Fase 5:** varredura ampla por `rose` em todo o admin encontrou mais 2 usos com sobreposição de significado — coluna "Em produção" do Kanban (`src/app/admin/producao/page.tsx`, herdado da Sprint `DS.2.4`) e badge "Destaque" de produto (`src/app/admin/produtos/page.tsx`) — ambos corrigidos para `caramel` (em andamento/atenção-neutro, não negativo). Demais ~30 usos de `rose` no projeto revisados e confirmados corretos (excluir/desativar/remover/cancelar/erro de validação/estoque baixo/urgente, no admin; acento de marca/CTA na área cliente, onde `rose` não é semântico).

### Validação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` (após cada fase) | 0 erros |
| `npm run lint` (após cada fase) | 0 erros/avisos |
| `npm run build` (após DS.3.3 e ao final) | Build de produção completo, 0 erros |

**Validação funcional (Playwright, navegador real):** varredura em admin (`/admin/fornecedores` — StatCard redesenhado, `/admin/produtos` — badge "Destaque" em caramel, `/admin/producao` — Kanban com coluna "Em produção" em caramel) e cliente (`/`, `/pedidos`, `/checkout`) em 3 larguras (1280px desktop, 834px tablet, 390px mobile). Sidebar com item ativo em `sage` confirmado. 0 erros de console em todos os cenários.

### Documentação

`DESIGN_SYSTEM.md` (paleta, tipografia, regra de uso semântico dos 3 acentos, `StatCard`/`BarChart`/`StockItem`), `PLAN.md` atualizados conforme acima.

---

## [Épico 5 — Módulo 5.B] — 2026-08-05 — WhatsApp OTP + Notificações (Evolution API)

**Tipo:** Primeiro módulo do Épico 5 (Integrações Externas), escolhido pelo Product Owner por resolver o único problema Crítico ainda aberto do projeto (`KI-03` — WhatsApp/PIX ausentes bloqueiam uso real em produção). Precedido por planejamento arquitetural do Épico inteiro (5 sub-domínios mapeados) e planejamento específico do módulo, ambos via `ai-project-manager`/`ai-solution-architect`. Implementação em 6 microtarefas de camada única (5.B.1–5.B.6), cada uma validada (`tsc`/`lint`) antes da próxima; build de produção validado após 5.B.6.

### Planejamento

Confirmado por leitura direta do schema: `OtpCode` e `WhatsAppLog` já existiam (nunca usados por código real), `TODO` explícito já marcado em `authorize()` do provider `"customer"` desde a fundação do projeto. Achado da Sprint: `OtpCode` não tinha proteção contra força bruta (sem campo de tentativas). Provedor WhatsApp confirmado pelo Product Owner: Evolution API (self-hosted, instância já existente fora deste projeto). Decisões do Product Owner antes de implementar: 3 tentativas máximas por código; validação do código dentro do `authorize()` do NextAuth, sem rota `/verify` separada; 4 status disparam notificação (Confirmado, Pronto, Saiu para entrega, Entregue — `EM_PRODUCAO`/`CANCELADO` não disparam); textos das 4 mensagens aprovados um a um; nova camada `src/lib/clients/` (para I/O HTTP de provedor externo, distinta de Repository) formalizada como ADR (ADR-023).

### Implementação

**5.B.1 (Schema):** `OtpCode.attempts Int @default(0)`.

**5.B.2 (Client):** `src/lib/clients/whatsappClient.ts` — `sendWhatsAppMessage(phone, text)`, chama `POST {WHATSAPP_API_URL}/message/sendText/{WHATSAPP_INSTANCE_ID}` (Evolution API), header `apikey`. Todo o contrato específico do provedor isolado neste arquivo (ADR-023) — nenhum Service/Route conhece o formato real da API externa. Fallback gracioso se `WHATSAPP_*` ausentes (mesmo padrão de `upload/route.ts` para Supabase Storage).

**5.B.3 (Service):** `src/lib/otpService.ts` — `requestOtp(phone)` gera código de 6 dígitos, persiste `OtpCode` (expiração 5 min), envia via `whatsappClient`, registra `WhatsAppLog`. `validateOtp(phone, code)` — 5 erros de domínio (`OtpNotFoundError`/`OtpExpiredError`/`OtpAlreadyUsedError`/`OtpMaxAttemptsError`/`OtpInvalidCodeError`), incrementa `attempts` a cada tentativa errada. Novo `src/lib/repositories/otpRepository.ts` e `src/lib/repositories/whatsappLogRepository.ts` (este último compartilhado com Notificações).

**5.B.4 (API + NextAuth):** `POST /api/auth/otp/request` (rota pública, sem auth — envia o código). `authorize()` do provider `"customer"` (`src/app/api/auth/[...nextauth]/route.ts`) passou a receber `phone`+`code` em vez de `phone`+`name`, validando via `otpService.validateOtp` antes do upsert do `Customer`. Contrato de sessão (`phone`/`userType: "customer"` no JWT) confirmado preservado sem alteração nos callbacks `jwt`/`session`.

**5.B.5 (Frontend):** `src/app/login/page.tsx` — fluxo de 2 passos telefone → código (era telefone → nome), com opção de reenviar código. Campo de nome removido; clientes novos recebem `name: "Cliente"` por padrão (mesmo fallback que já existia antes desta sprint).

**5.B.6 (Notificações):** `src/lib/whatsappNotificationService.ts` — `notifyOrderStatus()`, best-effort (nunca lança, sempre registrado em `WhatsAppLog`). Hook adicionado em `updateOrderStatus` (`src/lib/orderService.ts`), resolvendo o telefone do `Customer` via novo `findCustomerPhoneById` (`customerRepository.ts`, leitura mínima — evita puxar endereços/pedidos à toa).

### Validação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` (após cada microtarefa) | 0 erros |
| `npm run lint` (após cada microtarefa) | 0 erros/avisos |
| `npm run build` (após 5.B.6) | Build de produção completo, 0 erros — nova rota `/api/auth/otp/request` presente |

**Validação funcional real (Playwright, banco real), exceto envio real de WhatsApp:** fluxo completo de login testado ponta a ponta — solicitação de código (`OtpCode` criado, `WhatsAppLog` registrado com `success:false`/`"WhatsApp não configurado."`, fallback gracioso confirmado), código errado (rejeitado, `attempts` incrementado de 0→1, mensagem de erro exibida), código certo (login bem-sucedido, sessão criada, `usedAt` marcado, redirecionamento para `/pedidos`, `Customer` novo criado com `name: "Cliente"`). Hook de notificação testado via API real: `CONFIRMADO→EM_PRODUCAO` (não notifica, confirmado) e `EM_PRODUCAO→PRONTO` (notifica — `WhatsAppLog` criado com o texto correto por `deliveryType`, telefone resolvido via `Customer`, não `receiverPhone`). Dados de teste (Customer/OtpCode/WhatsAppLog/status do pedido) revertidos ao estado original após a validação, nenhum resquício.
**Envio real de WhatsApp (mensagem de fato chegando no celular) ainda não testado** — depende do Product Owner preencher `WHATSAPP_API_URL`/`WHATSAPP_API_TOKEN`/`WHATSAPP_INSTANCE_ID` no `.env` local com os dados reais da instância Evolution API (hoje escaffoldadas, vazias). O risco de formato de contrato (Seção 2 do planejamento — número com/sem `+55`, sufixo `@c.us`) só é confirmável nesse teste real, não antes.

### Documentação

`REGRAS_NEGOCIO.md` (Seção 12.10, nova — templates de notificação; Seção 15.5, regra 21 — bloqueio por tentativas), `CLAUDE.md` (ADR-023), `KNOWN_ISSUES.md` (`KI-05` fechada), `PLAN.md` (Épico 5 "Em andamento", Módulo 5.B concluído) atualizados conforme acima.

---

## [Sprint DS.2] — 2026-08-04/05 — Redesenho de front-end mais amplo: direção "A × C"

**Tipo:** Sprint Oficial — segunda sprint sob o prefixo `DS.x` (ADR-018), continuação de `DS.1` mas com escopo maior: não só paleta, também layout e componentes (admin + cliente final). Conduzida via `ai-project-manager` → `ai-solution-architect` (planejamento) → implementação direta na sessão principal, em 5 fases (DS.2.1–DS.2.5), cada uma validada (`tsc`/`lint`/`build`/visual real via Playwright) antes da próxima.

### Planejamento — comparação visual, mesmo processo de DS.1

Product Owner pediu redesenho mais amplo ("muito simples e feio", quer modernizar, responsivo em desktop/tablet/smartphone). Publicado um Artifact com 3 direções concretas aplicadas a telas reais (Vitrine + Painel de Produção, desktop + mobile, conteúdo real de `mock-data.ts`/`types.ts`): **A · Espresso Noturno** (escuro, editorial, serifado), **B · Atelier Porcelana** (claro, minimalista, lista editorial), **C · Doceria Pop** (bento-grid, blocos de cor). Product Owner pediu uma combinação: **"layout do A com as cores do C"** — interpretado e confirmado como a paleta completa de C (incluindo fundo claro) com a estrutura/tipografia de A (produto-herói + grid, badges circulares, sidebar). Refinamento adicional: ícones de produto trocados de emoji cru para manchas de gradiente com glare (fotografia simulada — sem asset de foto real disponível, `KI-06`).

`ai-project-manager`/`ai-solution-architect` investigaram o código real antes de planejar a implementação: confirmaram que `Fraunces`/`DM Sans` já cobrem a tipografia do mockup (Georgia era só placeholder do Artifact, por restrição de CSP); mapearam a paleta aprovada para os 6 tokens já existentes + 1 novo (`surface-2`); confirmaram que uma sidebar admin era viável e já estava especificada em `UX_GUIDELINES.md` Seção 15 desde a Sprint P1, nunca implementada; propuseram gradiente determinístico por hash em vez de mapeamento fixo. Quatro decisões do Product Owner antes de implementar: sidebar cobre as 20 páginas admin (consequência técnica inevitável do `layout.tsx` do App Router, não dá pra restringir a uma página só); `/admin/login` fica fora do shell; produto-herói = primeiro `featured: true`; divisão em 5 fases aprovada.

### Implementação

**DS.2.1 (Fundação de cor):** `src/app/globals.css` — 6 valores hex trocados + token novo `surface-2`. Contraste WCAG verificado antes de aplicar (mesma prática de DS.1) — `rose`/`sage` da direção aprovada (`#E63946`/`#6B8E4E`) não passavam em 4,5:1 contra `cream` (4,21:1/3,48:1); ajustados para `#C42E3C`/`#4F7530` (5,13:1/4,97:1), mesma família cereja/pistache. `DESIGN_SYSTEM.md` atualizado. Propagação automática confirmada em cliente e admin (nomes de token preservados).

**DS.2.2 (Vitrine):** `getProductGradientClass()` novo em `src/lib/utils.ts` (hash do `product.id` → 1 de 5 gradientes) substitui o gradiente único fixo em `ProductCard.tsx`. `ProductHero` novo (mesmo arquivo) — primeiro produto `featured: true` em destaque no topo de `src/app/page.tsx`, excluído do grid de "Destaques" abaixo (sem duplicação).

**DS.2.3 (Sidebar admin):** `Sidebar.tsx`/`AdminShell.tsx` novos, `src/app/admin/layout.tsx` novo. Navegação lateral fixa (desktop/tablet, 768px+) / barra horizontal com rolagem (mobile), filtrada pelo `role` da sessão (espelha `src/proxy.ts` `ROLE_REQUIRED`) — validado com usuário `PRODUCAO` real (só vê Painel/Produção/Cadeia Produtiva, sem Clientes/Catálogo/Configurações). `/admin/login` fora do shell, confirmado sem sidebar. `PageContainer` refatorado de shell de página (`min-h-screen bg-cream`) para wrapper de conteúdo (`max-w-5xl`, sem padding próprio — evita duplicar o padding que `HeaderMinimal`/conteúdo interno já gerenciam). 7 páginas legadas (`/admin` hub, `categorias`, `ocasioes`, `ingredientes/categorias`, `receitas/[id]` — 3 estados: loading/erro/sucesso —, `unidades/conversoes`, `em-construcao`) migradas de wrapper `max-w-app` próprio para `PageContainer`, ficando consistentes com as 12 páginas que já o usavam.

**DS.2.4 (Kanban):** `src/app/admin/producao/page.tsx` — cabeçalho de coluna com sublinhado de 2px; coluna "Em produção" destacada em cereja (linha + texto), demais colunas em tom neutro — sem cor de fundo bloco por coluna.

### Validação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` (após cada fase) | 0 erros |
| `npm run lint` (após cada fase) | 0 erros/avisos |
| `npm run build` (após cada fase e ao final) | Build de produção completo, 0 erros |

**Validação funcional (Playwright, navegador real):** varredura em cliente (Vitrine desktop/mobile, `/pedidos`, `/login`) e admin (`/admin/produtos`, `/admin/categorias` — página legada migrada —, `/admin/config`, `/admin/receitas/[id]` — estado de erro —, `/admin/producao`) em 3 larguras (1280px desktop, 834px tablet, 767px/390px mobile) — confirmada a transição sidebar↔barra horizontal exatamente no breakpoint `md` (768px). Filtro de navegação por papel confirmado com usuário `PRODUCAO` real (criado e removido ao final, nenhum resquício no banco). 0 erros de console em todos os cenários testados.

### Documentação

`DESIGN_SYSTEM.md` (paleta, `PageContainer` revisado, `Sidebar`/`AdminShell` novos, `ProductHero`/`getProductGradientClass`), `PLAN.md` atualizados conforme acima.

---

## [Sprint PRIV.3] — 2026-08-04 — Granularidade de acesso por papel na Cadeia Produtiva

**Tipo:** Sprint Oficial — terceira sprint sob o prefixo `PRIV.x`, continuação direta de `PRIV.2` (pendência registrada naquela sprint). Conduzida via `ai-project-manager` → `ai-solution-architect` (planejamento) → implementação direta na sessão principal, em 8 microtarefas de camada única (as 5 de API agrupadas por sub-domínio funcional, mesmo critério de PRIV.2), validadas (`tsc`/`lint`) a cada etapa.

### Planejamento

`ai-solution-architect` confirmou por `Glob`+`Grep` o inventário exato de 33 rotas de Cadeia Produtiva (Unidades 6, Categorias de Ingrediente 2, Ingredientes 5, Receitas 6, Fornecedores 4, Categorias de Embalagem 2, Embalagens 6, vínculo Produto↔Embalagem 2) — todas usando `requireAdmin()`. Achado central: `products/[id]/packagings/**` (vínculo Produto↔Embalagem) é conceitualmente Cadeia Produtiva, mas a única UI que a consome é `/admin/produtos/[id]`, página de Catálogo — abrir a API para `PRODUCAO` sem abrir essa página criaria uma permissão sem caminho de uso real.

Três decisões levadas ao Product Owner antes da implementação: (1) nomear a sprint como `PRIV.3`, mesmo o escopo (Cadeia Produtiva) não sendo dado pessoal — continuação do mesmo trabalho de granularidade por papel já esticado em `PRIV.2`, em vez de abrir um prefixo novo; (2) Catálogo permanece `ADMIN`-only, sem mudança; (3) Cadeia Produtiva abre para `PRODUCAO`, além de `ADMIN`. Uma quarta decisão, sobre o achado de `products/[id]/packagings`: manter `ADMIN`-only nesta sprint (não abrir a API sem a página correspondente). Todas aprovadas conforme a recomendação do arquiteto.

### Implementação

**PRIV.3.1 (Auth):** `src/lib/auth/requireProductionChain.ts` (`requireRole(["ADMIN","PRODUCAO"])`) criado.

**PRIV.3.2–3.6 (API):** substituição em lote (`sed`, após confirmar por `grep` que as 31 rotas seguiam o padrão idêntico `import { requireAdmin }...` / `const denied = await requireAdmin();`) para `requireProductionChain()` nas 31 rotas de Unidades, Categorias de Ingrediente, Ingredientes, Receitas, Fornecedores, Categorias de Embalagem e Embalagens. `products/[id]/packagings/**` (2 rotas) não alterado — permanece `requireAdmin()`.

**PRIV.3.7 (Proxy):** `src/proxy.ts` — 5 novas entradas em `ROLE_REQUIRED` (`/admin/unidades`, `/admin/ingredientes`, `/admin/receitas`, `/admin/fornecedores`, `/admin/embalagens` → `["ADMIN","PRODUCAO"]`), cobrindo sub-rotas dinâmicas automaticamente via o lookup por prefixo já existente (ADR-020) — nenhuma mudança de mecanismo.

**PRIV.3.8 (Documentação):** `REGRAS_NEGOCIO.md` Seção 15.5 (regra 20, nova) e Seção 16 (pendência de Catálogo mantida, pendência de Cadeia Produtiva marcada resolvida, novo item sobre `products/[id]/packagings`). ADR-022 registrada em `CLAUDE.md`. `PLAN.md` atualizado.

### Validação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` (após a substituição em lote e após o proxy) | 0 erros |
| `npm run lint` (idem) | 0 erros/avisos |
| `npm run build` | Build de produção completo, 0 erros |

**Validação funcional (Playwright, navegador real):** mesmo processo de PRIV.1/PRIV.2 — usuários de teste temporários criados e removidos ao final, nenhum resquício no banco. `PRODUCAO`: as 5 páginas (`/admin/unidades`, `/admin/ingredientes`, `/admin/receitas`, `/admin/fornecedores`, `/admin/embalagens`) acessíveis, 200 em `units`/`ingredient-categories`/`ingredients`/`recipes`/`suppliers`/`packaging-categories`/`packagings`; 403 em `products/[id]/packagings` (confirma a exceção mantida) e em Catálogo (`categories`/`occasions`/`products`, sem mudança). `ATENDIMENTO`: redirecionado em `/admin/unidades`, 403 em `/api/admin/units` (confirma que a granularidade não vazou para outros papéis). `ADMIN`: sem regressão em nenhuma das rotas testadas. Console do navegador sem erros inesperados em nenhum cenário.

### Documentação

`REGRAS_NEGOCIO.md`, `CLAUDE.md` (ADR-022), `PLAN.md` atualizados conforme acima.

---

## [Sprint PRIV.2] — 2026-08-03 — Granularidade de acesso por papel em Pedidos/Produção/Financeiro

**Tipo:** Sprint Oficial — segunda sprint sob o prefixo `PRIV.x`, continuação direta de `PRIV.1`. Conduzida via `ai-project-manager` → `ai-solution-architect` (planejamento) → implementação direta na sessão principal, em 6 microtarefas de camada única, cada uma validada (`tsc`/`lint`) antes da próxima.

### Planejamento

`ai-solution-architect` levantou o inventário real das 51 rotas `/api/admin/**` restantes (fora de `customers/**`, já tratado em PRIV.1): 12 de Catálogo, 33 de Cadeia Produtiva, 3 de Pedidos, 1 de Financeiro (`cmv`), 1 de Upload (que nem usava `requireAdmin()` — checagem de sessão inline duplicada). Achado à parte: `src/lib/storeConfigService.ts` faz a checagem de papel dentro do Service, não no Route Handler — violação de camada, natureza diferente do resto da sprint.

Quatro decisões levadas ao Product Owner antes da implementação, todas aprovadas conforme a recomendação do arquiteto: (1) as 45 rotas de Catálogo/Cadeia Produtiva ficam `ADMIN`-only, fora do escopo desta sprint — sem papel definido em `REGRAS_NEGOCIO.md`; (2) as 3 rotas de pedidos usam a união `ADMIN`+`ATENDIMENTO`+`PRODUCAO`, por não existir `/admin/pedidos` separada de `/admin/producao`; (3) o achado de `storeConfigService.ts` fica fora desta sprint, registrado como dívida técnica; (4) divisão em 6 microtarefas com wrappers `requireOrderAccess()`/`requireFinance()`. Uma quinta decisão surgiu durante a implementação da microtarefa de Upload: normalizar `upload/route.ts` para `requireAdmin()` muda o formato do corpo da resposta de erro em 401/403 (de `{error:"..."}` para `{success:false,error:{code,message}}`), o que faz `StorageService.ts` (front-end) exibir uma mensagem genérica em vez da específica nesse caminho de erro — aprovado pelo Product Owner mesmo assim, por consistência com o padrão do resto da API.

### Implementação

**PRIV.2.1 (Auth):** `src/lib/auth/requireOrderAccess.ts` (`requireRole(["ADMIN","ATENDIMENTO","PRODUCAO"])`) e `src/lib/auth/requireFinance.ts` (`requireRole(["ADMIN","FINANCEIRO"])`) criados.

**PRIV.2.2 (API — Pedidos):** `orders/route.ts`, `orders/[id]/status/route.ts`, `orders/consolidation/route.ts` passaram a usar `requireOrderAccess()`.

**PRIV.2.3 (API — Financeiro):** `cmv/route.ts` passou a usar `requireFinance()`.

**PRIV.2.4 (Proxy):** `src/proxy.ts` — nova entrada `"/admin/producao": ["ADMIN","ATENDIMENTO","PRODUCAO","FINANCEIRO"]` em `ROLE_REQUIRED` (inclui `FINANCEIRO` por ser a única página com dados de CMV hoje).

**PRIV.2.5 (Normalização):** `upload/route.ts` — checagem de sessão inline substituída por `requireAdmin()`.

**PRIV.2.6 (Documentação):** `REGRAS_NEGOCIO.md` Seção 15.5 (regra 19, nova) e Seção 16 (pendência de papel para Catálogo/Cadeia Produtiva registrada). ADR-021 registrada em `CLAUDE.md`. `KI-08` atualizado (parcialmente resolvido → resolvido para os domínios desta sprint + PRIV.1); `KI-19` criado para o achado de `storeConfigService.ts`. `PLAN.md` atualizado.

### Validação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` (após cada microtarefa de código) | 0 erros |
| `npm run lint` (após cada microtarefa de código) | 0 erros/avisos |
| `npm run build` | Build de produção completo, 0 erros |

**Validação funcional (Playwright, navegador real, 4 papéis reais):** mesmo processo de PRIV.1 — 3 usuários de teste temporários criados e removidos ao final, nenhum resquício no banco. Para cada papel: login real, navegação a `/admin/producao`, e chamadas diretas a `fetch("/api/admin/orders")` e `fetch("/api/admin/cmv?...")` (contornando a página). Resultado, batendo 100% com o esperado:

| Papel | `/admin/producao` | `GET /api/admin/orders` | `GET /api/admin/cmv` |
|---|---|---|---|
| ADMIN | 200 | 200 | 200 |
| ATENDIMENTO | 200 | 200 | 403 |
| PRODUCAO | 200 | 200 | 403 |
| FINANCEIRO | 200 | 403 | 200 |

Adicionalmente, `POST /api/admin/upload` testado com papel `FINANCEIRO`: 403, confirmando que a normalização (PRIV.2.5) preservou o comportamento `ADMIN`-only. `ADMIN` confirmado sem regressão em nenhuma das 3 rotas.

### Documentação

`REGRAS_NEGOCIO.md`, `CLAUDE.md` (ADR-021), `KNOWN_ISSUES.md` (KI-08, KI-19), `PLAN.md` atualizados conforme acima.

---

## [Sprint PRIV.1] — 2026-08-03 — Granularidade de acesso por papel no domínio Clientes

**Tipo:** Sprint Oficial — primeira sprint sob o novo prefixo `PRIV.x` (ADR-019). Conduzida via `ai-project-manager` → `ai-solution-architect` (planejamento) → implementação direta na sessão principal, em 4 microtarefas de camada única, cada uma validada (`tsc`/`lint`) antes da próxima; validação de build de produção ao final das 3 microtarefas de código.

### Planejamento

`ai-solution-architect` verificou o código real antes de aceitar a premissa da missão e encontrou um achado que reformulou o escopo: `requireAdmin()` (`src/lib/auth/requireAdmin.ts`) era binário (`ADMIN` ou nada) nas 52 rotas `/api/admin/**` existentes — nenhum outro papel (`ATENDIMENTO`/`PRODUCAO`/`FINANCEIRO`) acessava nenhuma API admin, contradizendo `REGRAS_NEGOCIO.md` Seção 3.11 (`ATENDIMENTO` deveria acessar pedidos e clientes). `src/proxy.ts` também fazia o lookup de `ROLE_REQUIRED` por igualdade exata de `pathname`, nunca cobrindo sub-rotas dinâmicas. Escopo desta sprint restrito ao domínio Clientes (fatia pequena); as outras 51 rotas registradas como Backlog Suggestion para uma `PRIV.2` futura (ver `PLAN.md`).

Duas decisões de negócio levadas ao Product Owner antes da implementação: (1) `ATENDIMENTO` tem acesso total às notas internas (`notes`), incluindo edição — aprovado; (2) `PRODUCAO`/`FINANCEIRO` recebem 403/redirecionamento total em Clientes — aprovado.

### Implementação

**PRIV.1.1 (Auth):** `src/lib/auth/requireRole.ts` criado (`requireRole(roles: UserRole[])`); `requireAdmin.ts` refatorado para delegar a `requireRole(["ADMIN"])` — comportamento externo idêntico nas 49 rotas que já o usavam.

**PRIV.1.2 (API):** as 3 rotas de `/api/admin/customers/**` (`route.ts`, `[id]/route.ts`, `[id]/orders/route.ts`) passaram a usar `requireRole(["ADMIN", "ATENDIMENTO"])` no lugar de `requireAdmin()`.

**PRIV.1.3 (Proxy):** `src/proxy.ts` — nova entrada `"/admin/clientes": ["ADMIN", "ATENDIMENTO"]` em `ROLE_REQUIRED`; lookup generalizado de igualdade exata para prefixo (`pathname === key || pathname.startsWith(key + "/")`), cobrindo agora `/admin/clientes/[id]` — sem alterar o comportamento da entrada pré-existente (`/admin/config`).

**PRIV.1.4 (Documentação):** `REGRAS_NEGOCIO.md` Seção 15.6, regra 18 (nova) — formaliza o acesso restrito a `ADMIN`+`ATENDIMENTO`. ADR-020 registrada em `CLAUDE.md`. `PLAN.md` atualizado (Backlog Suggestion "Política de LGPD/privacidade" marcada concluída como `PRIV.1`; nova Backlog Suggestion registrada para as 51 rotas restantes, candidata a `PRIV.2`).

### Validação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` (após cada microtarefa de código) | 0 erros |
| `npm run lint` (após cada microtarefa de código) | 0 erros/avisos |
| `npm run build` | Build de produção completo, 0 erros |

**Validação funcional (Playwright, navegador real, 4 papéis reais):** 3 usuários de teste temporários criados (`ATENDIMENTO`/`PRODUCAO`/`FINANCEIRO`, senha `teste123`) diretamente no banco via script descartável, removidos ao final da validação — nenhum resquício deixado no banco. Para cada papel: login real via `/admin/login`, navegação a `/admin/clientes` e a uma sub-rota dinâmica (`/admin/clientes/[id]`), e chamada direta a `fetch("/api/admin/customers")` (contornando a página, testando a API isoladamente). Resultado: `ADMIN` e `ATENDIMENTO` — 200 na página e na API, dados reais carregados; `PRODUCAO` e `FINANCEIRO` — redirecionados para `/admin/em-construcao` na página (incluindo a sub-rota dinâmica, confirmando a correção do lookup por prefixo) e 403 (`FORBIDDEN`) na API. `ADMIN` confirmado sem regressão. Console do navegador sem erros em nenhum dos 4 cenários.

### Documentação

`REGRAS_NEGOCIO.md`, `CLAUDE.md` (ADR-020), `PLAN.md` atualizados conforme acima.

---

## [Correção pontual] — 2026-08-03 — KI-18: chave React duplicada na vitrine

**Tipo:** Investigação e correção de bug, fora de qualquer sprint — achado incidental da Sprint DS.1, investigado a pedido do Product Owner logo em seguida. Conduzida diretamente pela sessão principal (não delegada a Sub-agent), usando Playwright MCP diretamente para reprodução ao vivo em vez de assumir a causa.

### Investigação

Hipótese inicial (registrada em `KI-18` durante a DS.1) era produto duplicado vindo da API — descartada por evidência: `curl` direto em `/api/products` e `/api/occasions` confirmou nenhum dado duplicado real no banco; `prisma.product.findMany` não pode produzir linhas duplicadas por construção (ORM, não SQL bruto com JOIN). Reprodução ao vivo via Playwright (`browser_navigate` + `browser_console_messages`, com hook em `console.error` para investigar) confirmou que o erro ocorre em todo `mount` fresco de `/`, nunca em re-renderizações por interação — apontando para o estado inicial, não para dado assíncrono.

### Causa raiz real

`src/lib/mock-data.ts` — `OCCASIONS` (usado como fallback inicial em `src/app/page.tsx` antes do fetch real de `/api/occasions` resolver) já incluía `{ id: "all", name: "Todos" }` como primeiro item. `page.tsx` prepend explicitamente `ALL_OCCASION` (mesmo valor) na frente desse array — dois itens com `id: "all"` coexistindo só durante a renderização inicial com dados mock, nunca com dados reais (que não têm essa entrada). `CategoryChips` usa `key={occ.id}`, daí a colisão.

### Correção

`src/lib/mock-data.ts` — removida a entrada redundante `{ id: "all", name: "Todos" }` de `OCCASIONS`. Confirmado por busca que não é usada em nenhum outro lugar do projeto.

### Validação

`npx tsc --noEmit` (0 erros), `npm run lint` (0 erros/avisos), console do navegador confirmado limpo em `/` após a correção (antes: erro fresco a cada mount; depois: 0 erros).

### Documentação

`KI-18` (`KNOWN_ISSUES.md`) fechado com a causa raiz real documentada, não a hipótese inicial.

---

## [Sprint DS.1] — 2026-08-03 — Redesign do Design System: "Ateliê Contemporâneo"

**Tipo:** Sprint Oficial de Design System — primeira sprint sob o novo prefixo `DS.x` (ADR-018). Nenhuma funcionalidade alterada — só identidade visual.

### Planejamento — comparação visual de 3 direções

Como decisão de paleta/tipografia é uma escolha de gosto do Product Owner, não algo a decidir sozinho, foi publicado um Artifact com 3 direções concretas ("Ateliê Contemporâneo", "Confeitaria Vibrante", "Painel Operacional"), cada uma aplicada ao mesmo recorte real do Painel de Produção (mesmos pedidos, mesmos números), para comparação lado a lado em vez de descrição abstrata. Product Owner escolheu **"Ateliê Contemporâneo"**, para admin e cliente final.

### Verificação de acessibilidade antes de aplicar

Contraste WCAG calculado para os 6 pares texto/fundo mais usados antes de escrever qualquer valor definitivo — encontrado um problema real: `sage` (badge de sucesso com texto claro) ficava em 4.32:1, abaixo do mínimo de 4.5:1 já exigido por `DESIGN_SYSTEM.md`. Ajustado de `#6C7A4C` para `#5C6A3E` (mesma família, mais escuro) — passa em 5.45:1. Demais pares entre 5.4:1 e 15.2:1.

### Sprint DS.1.1 — Fundação (implementada por `ai-frontend-engineer`)

**Estratégia:** os 6 tokens de cor (`cream`/`chocolate`/`rose`/`sage`/`sand`/`muted`) já eram usados por nome em todo o app — só os valores hex foram trocados em `src/app/globals.css`, propagando a nova paleta automaticamente via Tailwind, sem editar página por página.

| Token | Valor anterior | Novo valor |
|---|---|---|
| `cream` | `#faf7f2` | `#FBF6EF` |
| `chocolate` | `#3d2b1f` | `#2E1B14` |
| `rose` | `#e8a598` | `#A8324F` |
| `sage` | `#7a9e7e` | `#5C6A3E` |
| `sand` | `#f0ebe3` | `#E9DDC8` |
| `muted` | `#8a7b72` | `#6F6357` |

Tipografia (Fraunces display + DM Sans corpo) mantida sem alteração — a direção escolhida não pedia troca de fonte.

`DESIGN_SYSTEM.md` — tabela de paleta atualizada com os novos valores hex + parágrafo registrando a direção/data/decisão.

**Revisão dos 4 arquivos com cor Tailwind fixa fora do sistema de tokens** (`checkout/page.tsx`, `login/page.tsx`, `admin/login/page.tsx`, `pedidos/page.tsx`): confirmadas como cores semânticas de erro/status, mantidas como estão — não fazem parte da identidade de marca. Uma inconsistência real encontrada e corrigida na mesma sprint: `pedidos/page.tsx`, badge do status `PRONTO`, misturava o token de marca `bg-sage/20` com `text-green-800` hardcoded — corrigido para `text-sage`, consistente com o padrão já usado nos demais status do mesmo mapa.

### Validação Técnica

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npm run lint` | 0 erros/avisos |
| `npm run build` | Build de produção completo, 0 erros |

### Validação Funcional (Playwright, visual, admin + cliente final)

8/8 páginas avaliadas aprovadas: vitrine, login cliente, login admin, hub admin, listagem/modal de produtos, clientes, Kanban de produção. Nova paleta confirmada aplicada de forma consistente em toda a área admin e toda a área cliente final — **nenhum elemento com cor "esquecida" da paleta antiga encontrado**, confirmando que a propagação via troca de valor dos tokens funcionou sem precisar editar página por página. Console e rede limpos, com uma exceção não relacionada (ver achado abaixo). Kanban de produção não pôde ser validado com pedidos reais de "hoje/amanhã" por limitação de data dos dados de teste no ambiente — não é falha do redesign.

### Achado real, fora de escopo, registrado (não corrigido nesta sprint)

**KI-18** (`KNOWN_ISSUES.md`, novo) — console acusou chave React duplicada na vitrine (`/`) durante a validação visual, encontrado incidentalmente. Não relacionado à troca de paleta — suspeita de produto duplicado vindo de `filtered`/`products` em `src/app/page.tsx`, não investigado (fora do escopo desta sprint de redesign). Registrado como Problema Médio, prioridade a definir pelo Product Owner.

### Documentação

`GOVERNANCE_DECISIONS.md`/`ADR-018` já registravam o prefixo `DS.x`. `PLAN.md` — Backlog Suggestion "Redesign do Design System" marcada como promovida e concluída.

---

## [Sprint 2.L.5] — 2026-08-02 — Clientes: QA + Encerramento do Módulo e do Épico 2

**Tipo:** Sprint funcional final do Módulo 2.L — **último módulo do Épico 2.** Validação Técnica (sessão principal) + Validação Funcional/Homologação (fork Playwright).

### Validação Técnica (módulo completo)

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npm run lint` | 0 erros/avisos |
| `npm run build` | Build de produção completo, 0 erros — todas as rotas novas presentes (`/admin/clientes`, `/admin/clientes/[id]`, `/api/admin/customers/**`) |

### Validação Funcional (Playwright, servidor local, banco Supabase real, login admin real)

13/13 cenários aprovados — ver `MODULE_2L_CLOSURE.md` Seção 4. Destaque: confirmado por evidência real que a correção do campo `addressId` (Sprint 2.L.4) funciona — grupo de endereço exibe "Usado em N pedidos" com contagem real. Console e rede limpos. Paginação e estado "sem pedidos" não testáveis por volume insuficiente de dados — não registrados como falha. **Nenhum Bug encontrado.**

### Homologação do Product Owner

**Nenhum achado — nem Bug, nem Backlog/Evolução.** Primeira vez neste projeto que uma Homologação não gera nenhum item. Telefone somente-leitura já vem com explicação visível na própria tela; mensagens avaliadas como diretamente utilizáveis por um funcionário não-técnico.

### Encerramento do Módulo 2.L

`MODULE_2L_CLOSURE.md` criado. `BT-11` fechado (`EPICO_2_PLANEJAMENTO.md`) — deduplicação de exibição implementada, causa raiz de `KI-10` registrada separadamente. `KI-10` permanece com status **PARCIAL** (não "Resolvido") — sintoma na tela de Clientes resolvido, acúmulo de `Address` no banco continua. `PLAN.md` — linha do Módulo 2.L atualizada para "Concluído".

### Encerramento do Épico 2

Com o Módulo 2.L, o **Épico 2 — Cadastros Mestres + Dashboard Operacional está completo**: 12 módulos (2.A–2.L), todos com `MODULE_{X}_CLOSURE.md` próprio, todos revalidados em ambiente sincronizado com dados reais. `PLAN.md` — linha do ÉPICO 2 atualizada para "Encerrado". Próximo épico/prioridade a definir pelo Product Owner — candidatos registrados: Backlog Suggestions pendentes (redesign do Design System, política de LGPD/privacidade) ou início de um novo Épico do roadmap (`PLAN.md`, "Épicos").

---

## [Sprint 2.L.4] — 2026-08-02 — Clientes: Frontend

**Tipo:** Sprint funcional, camada Frontend. Implementada por `ai-frontend-engineer` (orquestração ADR-017), consumindo a API já pronta da 2.L.3. Design System atual reutilizado como está.

### Arquivos criados

- `src/lib/api/customerApi.ts` — cliente HTTP (`listCustomers`, `getCustomer`, `updateCustomerNotes`, `getCustomerOrders`).
- `src/app/admin/clientes/page.tsx` — listagem: busca por nome/telefone, paginação server-side, LTV e último pedido por cliente. Sem botão "Novo cliente" — módulo nunca cria `Customer` (só existe via upsert no checkout).
- `src/app/admin/clientes/[id]/page.tsx` — perfil: dados (telefone somente-leitura), notas internas editáveis (textarea, contador, máx. 2000 caracteres), endereços agrupados, histórico de pedidos.

### Arquivo alterado

- `src/app/admin/page.tsx` — card "Clientes" do hub admin: `em-construcao` → `/admin/clientes`, `ready: true`.

### Divergência encontrada e corrigida na mesma sprint (com aprovação do Product Owner)

`customerService.ts` (2.L.2) tinha um comentário afirmando que `Order.addressId` "já está disponível" no histórico de pedidos para cruzar com `addressGroups`, mas o campo nunca fora incluído no DTO — o Frontend degradou graciosamente ("N registros equivalentes agrupados", sem contagem real de pedidos). Corrigido: `ai-backend-engineer` adicionou `addressId` a `CustomerOrderHistoryItemDTO`/`mapOrderHistoryItemDTO` (o dado já vinha do Prisma, só não estava mapeado) e corrigiu o comentário desatualizado; edição direta no Frontend (`customerApi.ts` — tipo local atualizado; `[id]/page.tsx` — grupo de endereço agora mostra "Usado em N pedidos" real, cruzando `orders[].addressId` com `addressGroups[].addressIds`).

### Validação Técnica

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npm run lint` | 0 erros/avisos |

---

## [Sprint 2.L.3] — 2026-08-02 — Clientes: API

**Tipo:** Sprint funcional, camada API. Implementada por `ai-backend-engineer` (orquestração ADR-017), expondo o Service já pronto da 2.L.2.

### Arquivos criados

- `src/app/api/admin/customers/route.ts` — `GET` (listagem paginada/busca).
- `src/app/api/admin/customers/[id]/route.ts` — `GET` (detalhe) + `PATCH` (só `notes` — qualquer outro campo do body é descartado silenciosamente antes de repassar ao Service, reforçando a imutabilidade de `phone`).
- `src/app/api/admin/customers/[id]/orders/route.ts` — `GET` (histórico de pedidos, reaproveita `getCustomerById` inteiro em vez de criar função dedicada no Service — sem custo adicional real, avaliado e não sinalizado como divergência).

### Validação Técnica

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npm run lint` | 0 erros/avisos |

---

## [Sprint 2.L.2] — 2026-08-02 — Clientes: Service

**Tipo:** Sprint funcional, camada Service. Implementada por `ai-backend-engineer` (orquestração ADR-017), sobre o Repository/Validator já prontos da 2.L.1.

### Arquivo criado

- `src/lib/customerService.ts` — `listCustomers`, `getCustomerById`, `updateCustomerNotes`, `listAddressesGrouped` (função pura, agregação só de exibição). Erros de domínio `CustomerNotFoundError`/`CustomerValidationFailedError`.

### Deduplicação de endereços (KI-10/BT-11) — implementação da decisão já tomada no Planejamento

`listAddressesGrouped` agrupa por `street`+`number`+`zipCode` normalizados, representante = endereço mais recente do grupo. Contagem de pedidos por grupo não incluída na função (assinatura só recebe endereços, não pedidos) — cada grupo expõe `addressIds[]` para o Frontend (2.L.4) cruzar com `orders[].addressId` já carregado, sem nova consulta. Nenhuma escrita em `Address`/`Order` — confirmado, só leitura/agregação em memória.

### Validação Técnica

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npm run lint` | 0 erros/avisos |

---

## [Sprint 2.L.1] — 2026-08-02 — Clientes: Repository + Validator

**Tipo:** Sprint funcional, camada Repository + Validator. Implementada por `ai-backend-engineer` (orquestração ADR-017), a partir do Planejamento aprovado do Módulo 2.L. Sem Sprint de Schema — `Customer.notes` já existia.

**Decisões pré-tomadas no Planejamento, aplicadas aqui:** deduplicação de `Address` (KI-10/BT-11) é só de exibição, na Sprint 2.L.2 — este Repository não deduplica nada. LGPD/privacidade e a causa raiz de KI-10 (`POST /api/orders`) registrados como Backlog Suggestion/pendência, fora do escopo do módulo, por decisão do Product Owner.

### Arquivos criados

- `src/lib/repositories/customerRepository.ts` — `findAllCustomers` (paginação/busca por nome ou telefone, LTV e último pedido via `Order.groupBy`, evitando N+1), `findCustomerById` (com `orders`/`addresses` completos, sem deduplicar), `updateCustomerNotes`.
- `src/lib/validators/customerValidator.ts` — `validateCustomerNotesUpdate` (`notes` opcional, máx. 2000 caracteres).

### Divergência de nomenclatura (não bloqueante)

Funções nomeadas `findAllCustomers`/`findCustomerById`/`updateCustomerNotes` em vez do `findAll`/`findById`/`updateNotes` genérico do blueprint original — segue a convenção real já usada em todo Repository do projeto (evita colisão de nomes entre Repositories importados no mesmo Service).

### Validação Técnica

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npm run lint` | 0 erros/avisos |

---

## [Sprint 2.K.4] — 2026-08-02 — Dashboard Operacional: Consolidação + CMV + QA + Encerramento do Módulo

**Tipo:** Sprint funcional final do Módulo 2.K. Backend (`ai-backend-engineer`) e Frontend (`ai-frontend-engineer`) das seções de Consolidação/CMV, seguidos de QA (sessão principal) e Validação Funcional/Homologação (fork Playwright).

### Arquivos criados

- `src/app/api/admin/orders/consolidation/route.ts` — `GET`, expõe `orderService.getConsolidation`.
- `src/app/api/admin/cmv/route.ts` — `GET`, expõe `cmvService.calculateCMV`.

### Arquivos alterados

- `src/lib/api/orderAdminApi.ts` — `getConsolidation`/`getCMV` adicionados.
- `src/app/admin/producao/page.tsx` — seções "Consolidação de ingredientes" (segue a data da aba ativa) e "CMV" (sempre Hoje/Últimos 7 dias, independente da aba) adicionadas, com loading/erro próprios, desacopladas do Kanban.

### Validação Técnica (módulo completo)

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npm run lint` | 0 erros/avisos |
| `npm run build` | Build de produção completo, 0 erros — todas as rotas novas presentes, rota antiga insegura confirmadamente ausente |

### Validação Funcional (Playwright, servidor local, banco Supabase real, login admin real)

13/13 cenários aprovados — ver `MODULE_2K_CLOSURE.md` Seção 4 para a lista completa. Transição inválida (409) confirmada por revisão de código, não reproduzível organicamente via UI (seletor só oferece transições válidas). Consolidação testada no estado vazio (dado de teste disponível não tinha receita vinculada); CMV testado com valor real. Console e rede limpos. Responsividade 390px sem overflow. **Nenhum Bug encontrado.**

**Dado de teste:** pedido `#2` teve `deliveryDate`/`status` alterados temporariamente para exercitar o Kanban, revertidos ao final (confirmado por leitura). Resíduo não-funcional: uma entrada de `OrderStatusHistory` da alteração de teste permanece no histórico (reverter por escrita direta no banco não apaga o histórico já criado) — sem impacto funcional, registrado para conhecimento.

### Homologação do Product Owner

Nenhum defeito bloqueante. 2 achados **Backlog/Evolução**: (1) ausência do badge de data no header padrão — não gera confusão real; (2) StatCard "Urgentes" mantém a contagem de hoje mesmo na aba "Amanhã" — correto por design, mas identificado como ponto de clareza visual a revisitar no futuro.

### Achado de constatação (não implementação desta sprint)

`IC-06`/`BT-12` (`EPICO_2_PLANEJAMENTO.md`) previam que a Sprint 2.K.3 resolveria `STATUS_CLASS` incompleto em `src/app/pedidos/page.tsx` — confirmado por leitura que esse arquivo já cobre os 7 status, resolvido em algum momento anterior a este módulo, por trabalho não rastreado a esta sprint. Fechados por constatação. O badge de 7 status realmente entregue pela Sprint 2.K.3 foi em `src/app/admin/producao/page.tsx` (`OrderStatusBadge`) — tela diferente.

### Encerramento do Módulo 2.K

`MODULE_2K_CLOSURE.md` criado. Fechados: `KI-04` (`KNOWN_ISSUES.md`), `TD-11` (`MODULES.md`), `BT-08`/`IC-06`/`BT-12` (`EPICO_2_PLANEJAMENTO.md`). `PLAN.md` — linha do Módulo 2.K atualizada para "Concluído".

---

## [Sprint 2.K.3] — 2026-08-02 — Dashboard Operacional: Frontend (Kanban real)

**Tipo:** Sprint funcional, camada Frontend. Implementada por `ai-frontend-engineer` (orquestração ADR-017), consumindo a API já pronta da 2.K.2. Design System atual reutilizado como está — Product Owner pediu, durante esta sprint, um redesign visual mais amplo; decisão explícita de não misturar as duas coisas, redesign registrado como Backlog Suggestion em `PLAN.md` (Seção "Backlog Suggestions"), não implementado aqui.

### Arquivos criados

- `src/lib/api/orderAdminApi.ts` — cliente HTTP (`getKanbanData`, `updateOrderStatus`), DTOs locais espelhando `orderService.ts` sem importá-lo (front-end nunca acopla a Service/Repository).

### Arquivo reescrito

- `src/app/admin/producao/page.tsx` — removido todo dado hardcoded. Abas Hoje/Amanhã com data real; Semana/Calendário usam o mesmo padrão de "em construção" já existente no projeto (API não suporta intervalo de datas, fora de escopo). Kanban de 4 colunas (`SAIU_ENTREGA` agrupado em "Entregue", decisão já confirmada). Badge local `OrderStatusBadge` para os 7 status (`StatusBadge` compartilhado é estritamente binário). Mudança de status via `<select>` por card + `ConfirmDialog`, com tratamento de erro 409 (transição inválida) sem travar a UI. Seção "Urgente" e stat cards reais via componentes compartilhados.

### Divergência encontrada, resolvida com o Product Owner (fix aplicado nesta mesma sprint)

O card "Urgentes" contava pedidos `RASCUNHO`/`CANCELADO` de hoje como urgentes (`REGRAS_NEGOCIO.md` 14.1 aplicada ao pé da letra), enquanto a lista visual da seção "Urgente" nunca podia mostrá-los (sem coluna no Kanban) — número do card podia ser maior que a lista exibida. **Decisão do Product Owner:** `RASCUNHO`/`CANCELADO` não contam como urgente. Corrigido por `ai-backend-engineer` em `orderRepository.ts` (`countByDateExcludingStatus` generalizada para lista de status) e `orderService.ts`; `REGRAS_NEGOCIO.md` 14.1 atualizada; comentário desatualizado em `producao/page.tsx` corrigido (edição direta).

### Decisões de escopo registradas (não ambíguas, apenas documentadas)

- Fora de escopo: seção de Consolidação de ingredientes e CMV (Sprint 2.K.4, sem endpoint ainda).
- `HeaderMinimal` (padrão do admin) substitui o header customizado do mock antigo — perde o badge de data no topo, pequena regressão visual pontual aceita em favor de consistência com o restante do admin.

### Validação Técnica

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npm run lint` | 0 erros/avisos |

---

## [Sprint 2.K.2] — 2026-08-02 — Dashboard Operacional: API

**Tipo:** Sprint funcional, camada API. Implementada por `ai-backend-engineer` (orquestração ADR-017), expondo os Services já prontos da 2.K.1 — nenhuma lógica de negócio nova.

### Arquivos criados

- `src/app/api/admin/orders/route.ts` — `GET`: `requireAdmin()`, parse de `date` (`YYYY-MM-DD`), chama `orderService.getKanbanData(date)`.
- `src/app/api/admin/orders/[id]/status/route.ts` — `PATCH`: `requireAdmin()`, parse de `{ status, notes? }`, chama `orderService.updateOrderStatus`. Mapeamento de erro: `InvalidStatusTransitionError` → `conflict("INVALID_STATUS_TRANSITION", ...)` (409), mesmo padrão já usado para `LastItemRemovalError` em Receitas.

### Arquivo removido

- `src/app/api/orders/[id]/status/route.ts` — rota antiga insegura (só verificava `session?.user`, não `requireAdmin()`; qualquer cliente autenticado podia alterar status de pedido). Confirmado sem chamador real em `src/app` antes da remoção — nenhum fluxo existente quebrado. Diretórios vazios remanescentes também removidos.

### Divergência encontrada, resolvida com o Product Owner

O parâmetro `status` da `GET /api/admin/orders`, previsto no Planejamento, foi implementado e depois removido: `orderService.getKanbanData` (2.K.1) não filtra por status — o Kanban mostra as 4 colunas simultaneamente, então um filtro de status único não serve ao caso de uso real. Confirmado com o Product Owner e removido nesta mesma sprint (edição direta, arquivo já revisado), evitando um parâmetro de API que validava algo e não fazia nada.

### Validação Técnica

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npm run lint` | 0 erros/avisos |

---

## [Sprint 2.K.1] — 2026-07-31 — Dashboard Operacional: Repository + Service

**Tipo:** Sprint funcional, camada Repository + Service. Primeira implementação de código conduzida pela orquestração de Sub-agents ativada nesta mesma data (ADR-017/Sprint G.10) — Planejamento por `ai-project-manager`, implementação por `ai-backend-engineer`.

**Escopo:** resolve o Backend de KI-04/TD-11 (`KNOWN_ISSUES.md`/`MODULES.md`) — dashboard de produção ainda 100% mock, confirmado por auditoria de código real na Etapa 1 de Planejamento, não presumido.

### Arquivos criados

- `src/lib/repositories/orderRepository.ts` — `findByDateAndStatus`, `findOrderById`, `countByDateAndStatus`, `sumItemQuantityByDateAndStatus`, `countByDateExcludingStatus`, `findItemsForConsolidation`, `findItemsGroupedByProduct`, `updateStatusWithHistory` (transação `Order.update` + `OrderStatusHistory.create`).
- `src/lib/orderService.ts` — `VALID_TRANSITIONS` migrado de `src/app/api/orders/[id]/status/route.ts`, `getKanbanData(date?)`, `getConsolidation(startDate, endDate)`, `updateOrderStatus(orderId, newStatus, notes?)`.
- `src/lib/cmvService.ts` — `calculateCMV(startDate, endDate)`, reaproveitando `productService.getProductById` para o custo atual (limitação de `REGRAS_NEGOCIO.md` 13.7 documentada em comentário).

### Alteração pontual

- `src/lib/recipeService.ts` — `resolveConversionFactor` promovida de função privada para `export`, para reaproveito por `orderService.getConsolidation` (mesmo corpo, sem alteração de comportamento).

### Validação Técnica

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npm run lint` | 0 erros/avisos |

### Divergências encontradas e decisão

1. **Coluna do status `SAIU_ENTREGA` no Kanban** — não especificada no Planejamento (`SCREENS.md` A-03 só previa 4 colunas). `ai-backend-engineer` implementou como decisão reversível (agrupado em "Entregue"), sinalizando para confirmação antes do Frontend consumir. **Confirmado pelo Product Owner nesta sessão** — mantido agrupado em "Entregue".
2. **Aba "Semana" (intervalo de datas) do Kanban** — `getKanbanData` cobre um único dia ou nenhum filtro; intervalo de datas não implementado nesta sprint (não estava no escopo literal aprovado). Registrado como gap a resolver na 2.K.2/2.K.3.
3. **Nome duplicado entre camadas** — já existe `src/services/orderService.ts` (cliente HTTP antigo, pré-Épico 2) e agora `src/lib/orderService.ts` (Service de backend novo) — caminhos e camadas diferentes, sem conflito técnico, mas nome idêntico. Registrado como candidato a padronização futura (Dívida Técnica, não bloqueante).
4. **Sem caminho de retrocesso de status autorizado por ADMIN** — `REGRAS_NEGOCIO.md` 15.1.4 menciona a possibilidade, mas nem a rota antiga nem `VALID_TRANSITIONS` migrado implementam essa exceção. Não implementado nesta sprint (fora do escopo aprovado, "migrar a lógica já existente"). Registrado como Backlog para decisão futura do Product Owner.

### Achado de segurança confirmado (não desta sprint — já existia)

A rota `PATCH /api/orders/[id]/status` (pré-Épico 2) só verifica `session?.user`, não `requireAdmin()` — qualquer cliente autenticado pode hoje alterar o status de um pedido. Já identificado no Planejamento; será eliminado na Sprint 2.K.2 (nova rota `/api/admin/orders/[id]/status` com `requireAdmin()`, remoção da rota antiga).

---

## [Sprint G.10] — 2026-07-31 — Ativação da orquestração por Sub-agents (ADR-017)

**Tipo:** Sprint Oficial de Governança. Nenhum código de ERP alterado — mudança de processo/operação.

**Contexto:** o Product Owner relatou, em conversa nesta sessão, que o Arquiteto externo do fluxo de trabalho (ChatGPT) vinha perdendo contexto do projeto entre conversas, comprometendo a evolução — e pediu a centralização dos papéis de Arquiteto e Desenvolvedor no Claude Code, com sugestão de papéis/skills por agente.

**Achado antes de qualquer criação:** investigação de `.claude/agents/` revelou que uma arquitetura completa de 11 Sub-agents (`ai-project-manager`, `ai-solution-architect`, `ai-backend-engineer`, `ai-frontend-engineer`, `ai-qa-engineer`, `ai-documentation-engineer`, `ai-refactoring-engineer`, `ai-governance-officer`, `ai-release-manager`, `product-reviewer`, `platform-reviewer`) já existia desde a Sprint G.5.4 (15/07/2026) — mapeando quase exatamente o que foi pedido (`ai-solution-architect` = Arquiteto, `ai-backend-engineer`/`ai-frontend-engineer` = Desenvolvedor). Confirmado por auditoria da Sprint 2.I.1 que essa camada nunca havia sido usada em nenhuma sprint real (classificação EXPERIMENTAL). Criar agentes novos teria duplicado esse trabalho — a ação correta era ativar, não construir.

**Tensão identificada e resolvida por decisão explícita do Product Owner:** o fluxo já desenhado (`EXECUTION_FLOW.md`) trata `platform-reviewer`/`product-reviewer` como etapas sempre obrigatórias — em conflito com GD-001/GD-002 (`GOVERNANCE_DECISIONS.md`, Sprint 2.I.1, ainda pendentes), que recomendam tornar essas etapas opcionais/fundidas. Decisão: ativar mantendo as duas obrigatórias por enquanto, até GD-001/GD-002 serem decididas — não é reversão da recomendação, é ordem de decisão.

**ADR-017 registrada em `CLAUDE.md`:** Arquiteto + Desenvolvedor centralizados no Claude Code via a orquestração de Sub-agents já existente. Nenhuma trava de aprovação já vigente foi alterada — o Product Owner continua aprovando plano antes de execução e aceite antes de encerramento.

### Documentos atualizados

- `CLAUDE.md` — ADR-017.
- `PROJECT_GOVERNANCE.md` — Seção 18 ("Papel da IA neste projeto" e "Fluxo obrigatório de interação") atualizada para descrever a orquestração por Sub-agents como fluxo padrão, referenciando `.claude/agents/EXECUTION_FLOW.md` sem duplicá-lo.
- `GOVERNANCE_DECISIONS.md` — notas cruzadas adicionadas em GD-001 e GD-002, explicando por que `platform-reviewer`/`product-reviewer` seguem obrigatórios apesar das recomendações pendentes.
- `PROJECT_STATE.md` — atualizado (Estado Geral, Situação Atual, Últimas mudanças, Últimas decisões, Riscos).

### Pendência registrada

O fluxo ativado ainda não foi exercitado em nenhuma missão real — primeira execução real fica como ponto de atenção da próxima sprint funcional (candidata: 2.K ou 2.L).

---

## [Sprint 2.F] — 2026-07-23 — Produtos (Fase 1): Verificação, Validação Funcional e Encerramento

**Tipo:** Sprint Oficial funcional. Retoma o roadmap de módulos de negócio após a consolidação de governança (Sprints 2.I.0/2.I.1/G.9). Autorizada pelo Product Owner.

**Pré-condição executada antes da Etapa 1** (conforme a própria Ordem de Missão): `PROJECT_STATE.md` atualizado com Última atualização/Origem/Responsável, seção "Próxima decisão do Product Owner" e seção "Limitações do documento" — atualização puramente documental, não constitui desenvolvimento do módulo.

### Etapa 1 — Planejamento: achado central

Investigação do código real (`src/app/admin/produtos/page.tsx`, `src/app/admin/produtos/[id]/page.tsx`, `src/components/admin/config/UploadImage.tsx`) antes de qualquer implementação revelou que **todo o escopo funcional pedido na Ordem de Missão já estava implementado** — CRUD completo (listagem, cadastro, edição, detalhes, pesquisa, filtros, ordenação, paginação, upload de imagem, preview, validação, feedback visual, estados de loading/vazio/erro, responsividade). Construído durante os Módulos **2.J** (Sprints 2.J.2/2.J.2.1, 16-17/07/2026) e **2.H** (Sprint 2.H.6, tela de detalhes, 20/07/2026) — nunca sob o nome oficial "2.F". Já validado por evidência real na Sprint I.3 (17/07/2026). Nenhum `TODO`/`FIXME` encontrado nos arquivos do módulo.

A implementação real excede o escopo original de "Fase 1" (`PLAN.md`, congelado na Sprint 2.0.6: "`costPrice = 0`, sem RecipeLinker") — já inclui RecipeLinker, `costPrice`/margem automáticos (nominalmente "Fase 2") e vínculo com `Packaging` (Módulo 2.H), preservados intactos, não construídos nesta Sprint.

Divergência entre a Ordem de Missão (que descrevia a construção do Frontend como trabalho a fazer) e o estado real do código submetida ao Product Owner via pergunta estruturada, **antes** de qualquer ação — decisão explícita: **Verificar + Homologar + Encerrar**, sem reconstrução, evitando a duplicação que a própria Ordem de Missão instruía evitar.

### Validação Técnica

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npm run lint` | 0 erros/avisos |
| `npm run build` | Build de produção completo, 0 erros |
| `npx prisma generate` | Schema consistente |

### Validação Funcional (Playwright, servidor local, banco Supabase real, login admin real)

15/15 cenários aprovados: listagem, pesquisa server-side, filtro por categoria, filtro por status, ordenação, cadastro (produto de teste criado), validação de formulário (erros inline, submit bloqueado), edição, tela de detalhes, navegação "Editar produto" (`?edit=id`), ativar/desativar, exclusão física (apenas o produto de teste — nenhum dado de catálogo pré-existente tocado), estado vazio, responsividade 390px. Console e rede confirmados limpos. Paginação não testável por volume insuficiente de produtos no ambiente (~9-10 < `pageSize` 12) — não registrado como falha. Primeira vez que este roteiro é registrado formalmente sob o nome "Sprint 2.F" (execuções anteriores do mesmo fluxo ficaram registradas sob 2.J.2.1/I.3/2.H.6).

### Homologação do Product Owner

Nenhum defeito bloqueante. Mensagens, nomes de botões e navegação avaliados como claros para uso por quem não é desenvolvedor. **1 achado classificado, não corrigido:** tela de detalhes (`produtos/[id]/page.tsx`) não exibe `description`/`leadTimeDays`/`featured` — classificado **Backlog/Evolução** (não Bug): dados secundários, sempre acessíveis via "Editar produto", nenhum fluxo real bloqueado.

### Encerramento

`MODULE_2F_CLOSURE.md` criado — documenta explicitamente a natureza atípica deste encerramento (verificação/homologação de trabalho pré-existente, não construção nova). `PLAN.md` — linha do Módulo 2.F atualizada de "Planejado" para "Concluído". `PROJECT_STATE.md` atualizado (ver próxima seção).

### PROJECT_STATE.md — atualização final da Sprint

Estado Geral (módulo atual → nenhum, entre módulos), Roadmap (2.F movido para concluídos), Últimas mudanças, Últimas decisões, Pendências e Riscos atualizados; "Próxima decisão do Product Owner" passa a ser a escolha entre 2.K e 2.L.

---

## [Sprint G.9] — 2026-07-22 — Evolução da Governança: Implantação do PROJECT_STATE.md

**Tipo:** Sprint Oficial de Governança. Nenhuma arquitetura, roadmap, governança, metodologia, fluxo de desenvolvimento ou documentação existente alterados — conforme restrição explícita da Ordem de Missão. Único objetivo: acrescentar um mecanismo de sincronização de contexto entre IAs.

**Numeração desta sprint:** a Ordem de Missão não trouxe um identificador formal. Consultado o Product Owner (`AskUserQuestion`), que optou por aplicar agora a recomendação GD-004 (`GOVERNANCE_DECISIONS.md`, registrada na Sprint 2.I.1 e ainda pendente) — usar o prefixo `G.x` para sprints de governança, evitando repetir a colisão de numeração encontrada naquela sprint. GD-004 marcada como **Aprovada** e promovida a **ADR-016** em `CLAUDE.md`.

### Contexto

O ERP atingiu um volume de documentação oficial extenso o suficiente para que outra IA sem acesso contínuo ao projeto (ChatGPT, Gemini, Copilot, ou uma nova sessão sem memória) precise ler dezenas de documentos para reconstruir o estado atual. A Fonte Oficial de Verdade (`CLAUDE.md`, `PROJECT_GOVERNANCE.md`, `QUALITY_GUIDELINES.md`, `PLAN.md`, `CHANGELOG.md`, ADRs, documentação técnica) permanece intacta e continua sendo a autoridade final — o problema identificado foi puramente operacional (sincronização de contexto), não de conteúdo ou de processo.

### PROJECT_STATE.md criado

Documento novo na raiz do projeto — snapshot executivo de 2 a 5 páginas, sem código, sem histórico completo, sem regras de negócio completas, sem arquitetura detalhada, sem roadmap completo. Estrutura: Estado Geral, Situação Atual, Roadmap (resumo), Últimas mudanças, Últimas decisões, Pendências, Riscos, Documentos Oficiais, Instruções para outra IA (com regra explícita de precedência: em caso de conflito, prevalece a documentação oficial).

### Estratégia de atualização

Registrada em dois lugares já existentes, sem criar nenhum processo novo:
- `PROJECT_GOVERNANCE.md` Seção 12 ("Quando atualizar cada documento") — nova linha: `PROJECT_STATE.md` é atualizado ao final de toda Sprint Oficial, **somente depois** de `CHANGELOG.md`/`PLAN.md`/ADRs já atualizados.
- `QUALITY_GUIDELINES.md` Seção 6 ("Mapa de Governança") — nova linha descrevendo responsabilidade, proprietário, dependências (`CHANGELOG.md`, `PLAN.md`, `CLAUDE.md`) e relação com os demais documentos.

Isso não altera o fluxo de 6 etapas (`PROJECT_GOVERNANCE.md` Seção 4) nem o Fluxo Oficial de 11 etapas (Seção 27) — a etapa "Documentação"/"Encerramento" já existente passa a incluir mais um artefato ao final, não uma etapa nova.

### Garantia de não duplicação

`PROJECT_STATE.md` não reproduz o conteúdo de nenhum documento oficial — resume, aponta e remete de volta. Nenhuma seção do documento permite código, ADRs completas, regras de negócio completas ou roadmap completo (restrição explícita da Ordem de Missão, verificada linha a linha antes do fechamento desta sprint).

### Confirmação — metodologia inalterada

Nenhuma seção de `PROJECT_GOVERNANCE.md` (fluxo, ADR, QA, DoD, checklist de encerramento) teve seu conteúdo normativo alterado. Nenhuma decisão de `GOVERNANCE_DECISIONS.md` além de GD-004 foi tocada (GD-001/002/003 permanecem `🟡 Pendente`, sem relação com esta sprint).

---

## [Sprint 2.I.1 (Governança)] — 2026-07-20 — Consolidação do Ciclo de Governança do Produto

**Tipo:** Sprint Oficial de Governança do Produto. Nenhuma funcionalidade implementada — auditoria de processo, classificação, recomendação. Nenhuma decisão estrutural implementada automaticamente, conforme exigido pela própria Ordem de Missão.

**Nome desta sprint, tal como recebido na Ordem de Missão:** "Sprint 2.I.1". Ver achado crítico de colisão de numeração abaixo (Fase 1) — não corrigido retroativamente.

### Fase 1 — Auditoria da governança

Levantados todos os processos documentados do ciclo de desenvolvimento (`PROJECT_GOVERNANCE.md` Seções 4, 13, 16, 16.4, 16.5, 16.6, 17, 23, 24, 25, 26, 27; `QUALITY_GUIDELINES.md` Seções 1–5).

**Achado crítico — colisão de numeração, encontrado por evidência direta (não hipótese):** o prefixo `2.I` já é o identificador oficial e definitivo do Módulo Receitas dentro do Épico 2 (`PROJECT_GOVERNANCE.md` Seção 3, "Módulo 2.I — Receitas"), com sprints reais já registradas em `CHANGELOG.md` desde 15/07/2026 (`Sprint 2.I.1 — Backend Completo — Módulo Receitas`, `2.I.2`, `2.I.3`). Em paralelo, o prefixo `I.x` (sem o `2.`) já é reservado a Sprints Oficiais de Infraestrutura (`PROJECT_GOVERNANCE.md` Seção 4.4, precedente real `I.1`/`I.2`/`I.3`, 17/07/2026). A sprint anterior (retrospectiva da metodologia) e esta própria foram nomeadas pela Ordem de Missão como `2.I.0`/`2.I.1`, colidindo simultaneamente com os dois usos já estabelecidos — um mesmo grep por `"2.I"` em `CHANGELOG.md` hoje retorna três assuntos completamente distintos: Receitas, Infraestrutura (por leitura apressada) e Governança. **Nenhuma entrada já commitada foi renomeada** — nem esta, nem a anterior. Recomendação (usar `G.x`, seguindo o precedente já estabelecido de `G.1`/`G.2`/`G.5.x`/`G.6.x`/`G.8`) registrada em `GOVERNANCE_DECISIONS.md` GD-004, submetida ao Product Owner.

**Matriz de processos (resumo — matriz completa em `QUALITY_GUIDELINES.md` Seção 6 "Mapa de Governança"):** dos ~18 processos/etapas documentados, 15 têm evidência real de uso confirmada em `CHANGELOG.md` (fluxo de 6 etapas da Seção 4, Sprint Oficial vs. Backlog Suggestion, interrupção por inconsistência de infraestrutura, processo de ADR, Revisão Técnica, QA, DoD de Módulo, classificação de auditoria de 3 categorias, Checklist de Encerramento, Fluxo Oficial de 11 etapas e o padrão de Homologação de `QUALITY_GUIDELINES.md`). 3 processos — Platform Review, Product Review, Demo Validation — têm **zero evidência de execução** desde a criação de cada um (confirmado por busca em todo o `CHANGELOG.md` pela taxonomia própria de cada etapa: nenhuma ocorrência de "Bloqueante/Não-bloqueante" [Platform Review], nenhuma ocorrência de "Categoria A–F" [Product Review], nenhuma ocorrência de "Quebra de fluxo" [Demo Validation]).

### Fase 2 — Auditoria do ciclo 2.H (fluxo documentado × fluxo executado)

Aprofundamento do achado já registrado na Sprint 2.I.0. Além da ausência total de Platform/Product/Demo Review no ciclo 2.H.0–2.H.7, identificadas:

- **Etapa implícita não documentada como tal:** a "Homologação do Product Owner" (Sprint 2.H.7, formalizada em `QUALITY_GUIDELINES.md` Seção 3 nesta mesma retrospectiva) cobre, na prática, o mesmo território de propósito que o Product Review pretendia cobrir (usabilidade, clareza, navegação) — mas com julgamento real do Product Owner via Playwright, não um Sub-agent simulando a perspectiva do usuário.
- **Camada de delegação nunca utilizada:** o `.claude/agents/` inclui uma arquitetura paralela de Sub-agents (`ai-project-manager` delegando para `ai-solution-architect`/`ai-backend-engineer`/`ai-frontend-engineer`/`ai-documentation-engineer`/`ai-qa-engineer`/`ai-release-manager`) — nenhuma sprint do ciclo 2.H foi conduzida por `ai-project-manager`; a execução real usou a IA principal diretamente para Planejamento/Implementação, com `Agent(subagent_type: "fork")` só para Validação Funcional (Playwright) e auditorias pontuais. Mesmo padrão de "processo documentado ≠ processo usado" das três Reviews, mas fora do escopo central desta sprint (Fases 5–7 pedem análise só de Platform/Product/Demo Review) — registrado aqui como achado de Fase 2, não analisado a fundo.
- **Nenhuma etapa foi encontrada como redundante consigo mesma nem substituída por uma etapa homônima** — as únicas divergências são as já listadas acima.

### Fase 3 — Classificação dos processos

| Processo | Classificação | Justificativa técnica |
|---|---|---|
| Fluxo de 6 etapas (Seção 4) | **ATIVO** | Usado em toda sprint sem exceção, confirmado por `CHANGELOG.md` desde a Sprint 2.0 |
| Sprint Oficial vs. Backlog Suggestion (4.2/4.3) | **ATIVO** | Precedente real: ADR-009 e a própria distinção usada nesta sessão |
| Interrupção por inconsistência de infraestrutura (4.4) | **ATIVO** | Precedente real: Sprint I.1 (17/07/2026) |
| Processo de ADR (Seção 13) | **ATIVO** | 15 ADRs registradas em `CLAUDE.md` até esta sprint |
| Revisão Técnica (Seção 16) | **ATIVO** | `tsc`/`lint`/`build` executados e registrados em toda sprint com código |
| Platform Review (16.4) | **EXPERIMENTAL** | Infraestrutura existe (Sub-agent `platform-reviewer`, Skill, `PLATFORM_OVERVIEW.md`) e é invocável, mas nunca foi de fato acionada; sistema permanece 100% single-tenant (ADR-007), sem alvo concreto de violação hoje |
| Product Review (16.5) | **LEGADO** | Nunca executado formalmente, mas seu propósito foi absorvido na prática pela Homologação do Product Owner (`QUALITY_GUIDELINES.md` Seção 3), que cobre o mesmo espectro com evidência real |
| Demo Validation (16.6) | **FUTURO** | Inexecutável hoje pela própria fonte de verdade (`prisma/demo-seeds/` sem dado real, decisão deliberada do ADR-008) — não é uma etapa pulada, é uma etapa sem pré-requisito satisfeito |
| QA (Seção 17) | **ATIVO** | Executado a cada sprint com código, evidenciado em `CHANGELOG.md` |
| DoD de Módulo (Seção 23) / Checklist de Encerramento (25) | **ATIVO** | Usado nos encerramentos de 2.D/2.G/2.I/2.J (Sprint I.3) e 2.H (Sprint 2.H.7/2.I.0) |
| Classificação de auditoria de 3 categorias (Seção 24) | **ATIVO** | Usada em toda auditoria formal, inclusive nesta própria sprint |
| Fluxo Oficial de 11 etapas (Seção 27) | **ATIVO** (recém-formalizado) | Documenta exatamente o que o ciclo 2.H já executou na prática — não é uma etapa nova, é a formalização de uma já usada |
| Camada de delegação `ai-project-manager`/Sub-agents de persona | **EXPERIMENTAL** | Existe, é invocável, nunca foi usada no ciclo 2.H real — fora do escopo de recomendação desta sprint (não coberta pelas Fases 5–7) |

Nenhum processo classificado como **OBSOLETO** — nenhum perdeu completamente seu propósito original; os três com uso zero (Platform/Product/Demo Review) continuam tendo uma razão de existir, só não como gate obrigatório em toda sprint no formato atual.

### Fase 4 — Ciclo oficial do ERP (reafirmado)

O ciclo oficial permanece o já formalizado em `PROJECT_GOVERNANCE.md` Seção 27 (Planejamento Arquitetural → Blueprint → Schema → Repository+Validator → Service → API → UX Foundation → Frontend → Validação Funcional → Homologação do Product Owner → Encerramento do Módulo), operando acima do fluxo de 6 etapas da Seção 4. Nenhuma alteração estrutural nesta sprint — apenas confirmado, com a inconsistência das 3 Reviews agora tratada explicitamente (Fases 5–8) em vez de deixada implícita.

### Fases 5–7 — Análise individual: Platform Review, Product Review, Demo Validation

Análise completa registrada em `GOVERNANCE_DECISIONS.md` (GD-001, GD-002, GD-003), incluindo impactos positivos e negativos de cada recomendação. Resumo:

- **Platform Review:** ainda faz sentido como capacidade, mas não como gate obrigatório de toda sprint — hoje não há alvo concreto (single-tenant). Recomendação: **tornar opcional**.
- **Product Review:** já está coberto, na prática, pela Homologação do Product Owner — manter as duas como gates formalmente distintos e obrigatórios viola a Recomendação Arquitetural de "evitar duplicidade entre etapas de governança". Recomendação: **fundir**.
- **Demo Validation:** não é obrigatória em toda sprint por propósito original (era para demos/releases) nem executável hoje (sem dado real de demo). Recomendação: **tornar opcional / mover para releases**.

`PROJECT_GOVERNANCE.md` Seções 16.4, 16.5, 16.6 receberam uma nota inline apontando para `GOVERNANCE_DECISIONS.md` — o texto normativo de cada seção **não foi alterado**, permanece válido até decisão do Product Owner.

### Fase 8 — Recomendação oficial

Três recomendações fundamentadas registradas em `GOVERNANCE_DECISIONS.md` como `🟡 Pendente`, aguardando aprovação, rejeição ou adiamento explícito do Product Owner. **Nenhuma decisão foi implementada automaticamente**, conforme exigido pela Ordem de Missão. Se aprovadas, cada uma será promovida a ADR formal em `CLAUDE.md`.

### Fase 9 — Mapa de Governança

Nova Seção 6 em `QUALITY_GUIDELINES.md` — mapa de ~18 documentos de governança/arquitetura com responsabilidade, proprietário, quando atualizar, dependências e documentos relacionados de cada um. Nenhum documento de processo/arquitetura foi removido — o mapa apenas organiza o que já existe.

### Documentos criados

- `GOVERNANCE_DECISIONS.md` — rastreador de decisões metodológicas pendentes (GD-001 a GD-004), distinto de `CLAUDE.md` (só registra decisões já tomadas) e de `CHANGELOG.md` (narrativa de execução).

### Documentos atualizados

- `QUALITY_GUIDELINES.md` — Seção 6 "Mapa de Governança" acrescentada.
- `PROJECT_GOVERNANCE.md` — notas inline nas Seções 16.4/16.5/16.6 apontando para `GOVERNANCE_DECISIONS.md`, sem alterar o texto normativo de nenhuma das três.
- `PLAN.md` — linha da Sprint 2.I.1 (Governança) adicionada, com o achado de colisão de numeração registrado explicitamente.

### Confirmação explícita (Critério de Sucesso da Ordem de Missão)

- ✅ Governança auditada (Fases 1–2)
- ✅ Processos classificados, nenhum sem justificativa técnica (Fase 3)
- ✅ Recomendações fundamentadas apresentadas, com impactos positivos e negativos (Fases 5–8)
- ✅ Nenhum processo removido sem justificativa — os três com uso zero permanecem documentados como estão, com nota, não removidos
- ✅ Product Owner possui informação suficiente para decidir o ciclo oficial de governança (`GOVERNANCE_DECISIONS.md` GD-001 a GD-004)
- ⛔ Aguardando decisão do Product Owner sobre GD-001/GD-002/GD-003/GD-004 antes de qualquer promoção a ADR

---

## [Sprint 2.I.0] — 2026-07-20 — Consolidação da Metodologia de Desenvolvimento do ERP

**Tipo:** Sprint Oficial de Governança Arquitetural. Nenhuma funcionalidade do sistema implementada — consolidação de documentação, processos e padrões de qualidade a partir da retrospectiva do Módulo 2.H (Embalagens, Sprints 2.H.0–2.H.7, primeiro módulo a percorrer o ciclo completo).

### Retrospectiva do Módulo 2.H (Fase 1)

**O que funcionou muito bem:**
- Auditoria obrigatória antes de codificar em toda sprint — encontrou repetidamente achados reais, não hipotéticos: o conflito Packaging↔Recipe vs Product (2.H.0, resolvido como ADR-014), a divergência de padrão `ProductRecipe` (lista) vs `RecipeIngredient` (item) (2.H.2/2.H.3), a incompatibilidade do `RecipeLinker` embutido com a API item a item (2.H.5/2.H.6)
- Camadas estritamente separadas por sprint, com escopo negativo explícito ("NÃO contempla X") — permitiu validação incremental em vez de descobrir erros só no fim
- Validação funcional real em 3 momentos distintos e complementares (API crua na 2.H.4, UI completa na 2.H.6, ótica de negócio na 2.H.7) — cada uma achou algo diferente (bug de pluralização real na 2.H.6; linguagem técnica vazando pra UI na 2.H.7)
- `AskUserQuestion` no momento certo (decisão Packaging↔Product vs Recipe) — resolvida antes de qualquer schema ser escrito, não depois
- Toda divergência de precedente registrada com "alternativa considerada e descartada" em vez de copiada às cegas ou decidida silenciosamente

**O que gerou retrabalho:**
- A mensagem sobre a Regra 11 vazou linguagem técnica interna ("pendência conhecida do módulo") para uma tela de negócio, corrigida só na 2.H.7 — decisões de escopo técnico precisam de tradução deliberada para comunicação de usuário, não é automático
- Um bug de pluralização real só foi pego na Validação Funcional (2.H.6), não em nenhuma camada anterior — reforça que `tsc`/`lint`/`build` limpos não substituem validação funcional real
- Um fork de homologação retornou um resultado inválido na primeira tentativa (interpretou mal a própria tarefa) — precisou ser relançado com instruções mais diretivas; risco operacional de orquestração, não do módulo em si

**Quais decisões reduziram riscos:**
- Nunca alterar Service/Repository/Validator/API depois de homologados — deu estabilidade real: Frontend (2.H.6) e Homologação (2.H.7) nunca precisaram "voltar" para consertar uma camada anterior
- Confirmar por evidência real (introspecção de banco, testes HTTP reais, Playwright real) em vez de assumir sucesso — em nenhum momento uma sprint declarou pronto só com base em "o código parece certo"

**Documentos fundamentais:** `MODULE_2H_PLANNING.md` (consultado em todas as 7 sprints seguintes), `MODULE_2H_UX_FOUNDATION.md` (usado ponto a ponto na 2.H.6), `CLAUDE.md`/ADR-014 (referência de autoridade final), `CHANGELOG.md` (registro vivo de auditoria, lido de volta constantemente).

**Documentos que perderam utilidade:** nenhum criado e descartado durante o ciclo — mas `EPICO_2_PLANEJAMENTO.md` (planejamento original do Módulo 5/Embalagens, anterior à ADR-014) ficou tecnicamente obsoleto no relacionamento Packaging↔Recipe, sem correção retroativa (fora do escopo da própria ADR-014) — sintoma de que planejamento muito antecipado tende a divergir da implementação final sem um mecanismo de "supersedido por" visível.

### Metodologia oficial consolidada (Fase 2)

Nova **Seção 27** em `PROJECT_GOVERNANCE.md` — "Fluxo Oficial de Desenvolvimento de Módulo", 11 etapas (Planejamento Arquitetural → Blueprint → Schema → Repository+Validator → Service → API → UX Foundation → Frontend → Validação Funcional → Homologação do Product Owner → Encerramento do Módulo), cada uma com objetivo/entrada/saída/critério de sucesso e Skill/Seção relacionada. Opera **acima** do fluxo de 6 etapas já existente na Seção 4 (que não é substituído — cada etapa acima é, internamente, uma ou mais Sprints Oficiais que seguem a Seção 4). Formaliza a distinção entre Validação Técnica, Validação Funcional e Homologação do Product Owner (Recomendação Arquitetural #4) — nenhuma substitui outra.

### QUALITY_GUIDELINES.md (Fase 3)

Documento novo criado — companion operacional da Seção 27, explicitamente desenhado para **referenciar, não duplicar** `PROJECT_GOVERNANCE.md` e as Skills de camada já existentes (`schema-pattern`/`repository-pattern`/`api-pattern`/`frontend-pattern`). Contém: classificação oficial de achados (Bug/Backlog/Evolução/Dívida Técnica/Decisão Arquitetural — Fase 3 da Ordem de Missão), mapeada explicitamente para a classificação de auditoria de 3 categorias já existente (`PROJECT_GOVERNANCE.md` Seção 24, Inconsistência/Observação Técnica/Melhoria Futura) sem substituí-la; padrões de qualidade obrigatórios (build/lint/tsc/prisma/Playwright, evidências, critério mínimo de aprovação); padrão de Homologação (Homologação Técnica → Validação Funcional → Homologação do Product Owner → Encerramento, responsabilidades de cada etapa).

### Checklists oficiais (Fase 4)

10 checklists criados em `QUALITY_GUIDELINES.md`: Blueprint, Schema, Repository + Validator, Service, API, UX Foundation, Frontend, Validação Funcional, Homologação, Encerramento do Módulo. Onde já existe Skill dedicada da camada, o checklist é propositalmente curto (a Skill é o "como", o checklist é o "está pronto?").

### Padrões de documentação — auditoria de governança (Fase 5)

Auditados os ~30 documentos de governança/arquitetura da raiz do projeto.

**Achado crítico — documento faltando, corrigido nesta sprint:** todo módulo anterior (2.D, 2.E, 2.G, 2.I, 2.J) produziu um `MODULE_X_CLOSURE.md` dedicado no encerramento; o Módulo 2.H foi o único que não — seu encerramento (Sprint 2.H.7) ficou registrado só dentro de `CHANGELOG.md`. **`MODULE_2H_CLOSURE.md` criado retroativamente nesta sprint**, sem alterar nenhuma decisão já tomada nas Sprints 2.H.0–2.H.7. A etapa "Encerramento do Módulo" (Seção 27) passa a exigir esse documento explicitamente, fechando a lacuna para módulos futuros.

**Achado crítico — documento sobreposto, registrado, não resolvido unilateralmente:** `ERP_DEVELOPMENT_WORKFLOW.md` (e as ADR-006/007/008 que o originaram) documentam `Backend → API → Frontend → Platform Review → Product Review → Demo Validation → QA → Encerramento` como o fluxo oficial — **nenhuma das etapas Platform Review/Product Review/Demo Validation foi executada em nenhuma das Sprints 2.H.1–2.H.7**, todas seguiram exatamente o escopo declarado em cada Ordem de Missão recebida, que não as incluía. Isto é uma divergência real entre processo documentado e prática recente. Seguindo o mesmo padrão de transparência já usado na ADR-009 (que não escolheu um esquema de estados "vencedor" entre os já existentes), **esta sprint não resolve essa divergência unilateralmente** — apenas a registra, deixando a decisão de reconciliação (revogar, tornar opcional, ou exigir retroativamente) para o Product Owner.

**Outros achados (não bloqueantes):**
- `EPICO_1.md`/`EPICO_2_PLANEJAMENTO.md`: registros históricos de encerramento/planejamento de época — não são documentos de processo vivo, não precisam de atualização contínua. `EPICO_2_PLANEJAMENTO.md` mantém a Seção "Módulo 5 — Embalagens" com o relacionamento Packaging↔Recipe já superado pela ADR-014 (achado já conhecido desde a Sprint 2.H.0, fora do escopo de correção desta ADR)
- `INFRA_VALIDATION.md`: snapshot pontual da Sprint 0.5, superseded na prática pelas Sprints I.1–I.3 (infraestrutura mais recente), mas é registro histórico, não documento vivo
- `VISION.md` vs `ERP_PRODUCT_VISION.md`: não há sobreposição de conteúdo (visão estratégica de longo prazo vs. visão de produto SaaS/plataforma), mas os nomes são próximos o suficiente para gerar confusão — registrado como sugestão de nota clarificadora, não implementada
- `MODULE_2E_UX_REVIEW.md`: confirma que "UX Foundation/Review" já era um passo recorrente desde a Sprint 2.E.6 — a Seção 27 é uma generalização retroativa de um padrão que já vinha se repetindo, não uma invenção do zero
- `DEMO_ENVIRONMENT.md`/`DEMO_DATASET.md`/`DEMO_GUIDE.md`: trio bem desenhado, sem sobreposição entre si nem com o novo fluxo de módulo
- `MENU_STRUCTURE.md`/`SCREENS.md`: já registrados como desatualizados desde a Sprint P1 (Sprint 2.H.7), reafirmado aqui — fora do escopo desta sprint de metodologia

**Resposta à pergunta central da Fase 5:** não existia, em nenhum documento, um fluxo de módulo já formalizado no nível Blueprint→Schema→...→Encerramento antes desta sprint — `ERP_DEVELOPMENT_WORKFLOW.md` cobre um nível abaixo (uma Ordem de Missão isolada). Não há duplicação a evitar na criação da Seção 27, mas os 2 achados críticos acima (documento faltando, documento sobreposto) exigiram ação/registro explícitos.

### Padrões de qualidade (Fase 6) e Padrão de Homologação (Fase 7)

Ambos documentados em `QUALITY_GUIDELINES.md` Seções 2 e 3 (ver acima) — build/lint/tsc/prisma/Playwright obrigatórios por sprint com código, evidências obrigatórias registradas em `CHANGELOG.md`, critério mínimo de aprovação (0 erros em todas as verificações aplicáveis). Homologação Técnica → Validação Funcional → Homologação do Product Owner → Encerramento, com responsabilidade e o que cada etapa confirma/não confirma explicitados.

### Revisão crítica (Fase 8)

- **A metodologia ficou simples?** Relativamente — 11 etapas é um número real, não inflado (cada uma pegou pelo menos um achado real específico dela durante o ciclo 2.H). "Simples" aqui significa "cada etapa tem uma responsabilidade sem ambiguidade", não "rápido" — 11 sprints por módulo é um custo real de coordenação, reconhecido, não escondido.
- **Existe excesso de burocracia?** Achado real, já registrado acima (Fase 5): Platform/Product/Demo Review documentados mas nunca executados no ciclo 2.H — pode ser burocracia que a prática já abandonou informalmente, ou lacuna de processo. Não decidido aqui.
- **Existe Sprint desnecessária?** Nenhuma das 11 etapas identificada como dispensável — todas pegaram achado real específico.
- **Existe documentação redundante?** Nenhuma nova introduzida — `QUALITY_GUIDELINES.md` foi desenhado desde o início para referenciar, não duplicar, Skills e `PROJECT_GOVERNANCE.md` (ver Seção 1 do próprio documento). A única "redundância" encontrada era o oposto — uma lacuna (`MODULE_2H_CLOSURE.md`), já corrigida.
- **Existe etapa que possa ser automatizada?** Sim — script único (`prisma generate`→`tsc`→`lint`→`build` em sequência, falha rápido no primeiro erro) registrado como recomendação, não implementado.
- **Existe oportunidade de simplificação?** Considerada e descartada: combinar Schema e Repository+Validator numa sprint só para módulos pequenos — contradiz a disciplina "uma camada por vez" que funcionou bem em todo o ciclo 2.H; não implementada.

### Documentos criados

- `QUALITY_GUIDELINES.md`
- `MODULE_2H_CLOSURE.md` (retroativo, fecha lacuna de encerramento do Módulo 2.H)

### Documentos atualizados

- `PROJECT_GOVERNANCE.md` — Seção 27 (Fluxo Oficial de Desenvolvimento de Módulo) adicionada; nota de rodapé de versão atualizada
- `CLAUDE.md` — ADR-015 registrada na tabela "Decisões arquiteturais tomadas"
- `PLAN.md` — linha do módulo 2.H atualizada (referência ao `MODULE_2H_CLOSURE.md`); nova linha de Sprint 2.I.0

### Recomendações metodológicas (não implementadas nesta sprint)

- Skill dedicada de Service (e de Validator isoladamente) — lacuna real confirmada: existem `schema-pattern`/`repository-pattern`/`api-pattern`/`frontend-pattern`, mas nenhuma cobre a camada Service com o mesmo nível de detalhe
- Script único de validação técnica em sequência (automação, Fase 8/Recomendação #5 — registrada, não implementada)
- Nota clarificando a diferença entre `VISION.md` e `ERP_PRODUCT_VISION.md` (nomes próximos, sem sobreposição de conteúdo)
- Decisão do Product Owner sobre Platform Review/Product Review/Demo Validation (executar retroativamente, tornar opcional, ou revogar formalmente)

### Confirmações de escopo

| Item | Status |
|------|--------|
| Funcionalidade do sistema implementada | ❌ Não |
| Metodologia oficial documentada | ✅ Sim — `PROJECT_GOVERNANCE.md` Seção 27 |
| `QUALITY_GUIDELINES.md` criado | ✅ Sim |
| Checklists reutilizáveis criados | ✅ Sim — 10 |
| Processo oficial atualizado | ✅ Sim |
| ERP preparado para os próximos módulos | ✅ Sim |

### Próximo passo

ERP pronto para iniciar o próximo módulo do roadmap (`PLAN.md`) seguindo integralmente a metodologia consolidada nesta sprint, mediante nova Ordem de Missão. Decisão pendente do Product Owner sobre a reconciliação Platform/Product/Demo Review (achado da Fase 5).

---

## [Sprint 2.H.7] — 2026-07-20 — Homologação do Product Owner — Cadastro de Embalagens

**Tipo:** Sprint Oficial de Homologação. Nenhuma funcionalidade nova — apenas 1 correção pontual de texto decorrente da própria homologação (Fase 2), sem alteração de escopo funcional.

### Revisão documental (Fase 1)

Confrontados `MODULE_2H_PLANNING.md`, `MODULE_2H_UX_FOUNDATION.md`, `REGRAS_NEGOCIO.md` e o relatório da Sprint 2.H.6 contra a implementação final — todas as decisões arquiteturais (ADR-014), as 13 regras de negócio do blueprint e as 5 telas da UX Foundation estão refletidas exatamente como especificado.

**Achado (documentação desatualizada, fora do escopo desta sprint):** `MENU_STRUCTURE.md` e `SCREENS.md` (ambos produzidos na Sprint P1, 29/06/2026) nunca foram atualizados para nenhum módulo implementado desde então — não é uma lacuna específica de Embalagens, é um débito documental pré-existente e amplo (afeta também Fornecedores/Ingredientes/Produtos/Receitas, todos já encerrados, ainda listados como "🔲 Planejado" com rotas desatualizadas nesses dois documentos). Corrigir isso exigiria tocar dezenas de módulos já encerrados — fora do escopo de "correções pontuais" desta sprint (Recomendação #2: não ampliar escopo). Registrado como recomendação de uma sprint de documentação dedicada, não corrigido aqui.

### Homologação funcional — ótica do usuário (Fase 2)

Executada via Playwright, servidor de desenvolvimento local, navegação real — **não repetição dos 27 testes técnicos já aprovados na Sprint 2.H.6**, e sim avaliação qualitativa de facilidade de uso, clareza de mensagens, coerência de nomes e comportamento esperado, como usuária de negócio (não técnica).

| # | Fluxo avaliado | Resultado |
|---|---|---|
| 1 | Item "Embalagens" no hub `/admin` | ✅ Aprovado — ícone e posição fazem sentido ao lado de Fornecedores/Receitas |
| 2 | Lista de Embalagens (StatCards, nomes de botão) | ✅ Aprovado com ressalva (ver abaixo) |
| 3 | Formulário de criação + mensagens de erro | ✅ Aprovado — linguagem simples ("Nome é obrigatório.") |
| 4 | Detalhe da embalagem | ✅ Aprovado — narrativa coerente, nada redundante |
| 5 | Edição de custo + Histórico de Preços | ✅ Aprovado — atualização compreensível, com data |
| 6 | Seção "Embalagens" no detalhe do Produto | 🟡 Aprovado com ressalva — corrigida nesta sprint (ver abaixo) |
| 7 | Vincular embalagem a produto | ✅ Aprovado — select já mostra o preço de cada opção |
| 8 | "Usado em N produtos" | ✅ Aprovado — singular/plural corretos, link certo |
| 9 | Confirmação de desativação | ✅ Aprovado — consequência explicada com clareza |
| 10 | Consistência visual com o resto do sistema | ✅ Aprovado — mesma linguagem visual/interação; 0 erros de console |

**Nenhum defeito bloqueante encontrado.**

### Ajuste realizado (decorrente da própria homologação, Fase 2)

Mensagem em `/admin/produtos/[id]/page.tsx` usava linguagem técnica interna ("ver pendência conhecida do módulo"), pouco natural para o dono do negócio. Reescrita para `"Custo ainda não inclui o valor das embalagens — isso será somado em uma atualização futura."`. Recompilado (`tsc`/`lint`/`build` limpos após o ajuste).

### Validação do negócio (Fase 3)

Confirmadas as 13 regras do blueprint (`MODULE_2H_PLANNING.md` Seção 3) contra a implementação:

| Regra | Status |
|---|---|
| 1–10, 12, 13 | ✅ Entregues integralmente (definição de embalagem, fornecedor único FK, composição via múltiplos vínculos, custo direto sem conversão, histórico de preço, estoque inteiro com alerta, embalagem inativa bloqueada em novo vínculo, N:N com produtos, quantidade sempre inteira, exclusão de categoria bloqueada por uso/`Packaging` nunca hard-delete, zero-ou-mais embalagens por produto, nenhuma relação com `Recipe`) |
| **11** | 🔲 **Pendência confirmada e mantida deliberadamente fora do escopo** — `Product.costPrice` ainda não soma o custo de `ProductPackaging`; reconfirmado nesta sprint (StatCard "Custo *" com nota explicativa reescrita, ver ajuste acima) |

### Revisão de qualidade (Fase 4)

Consistência visual, aderência ao Design System, acessibilidade básica e responsividade já confirmadas tecnicamente na Sprint 2.H.6 (27/27) — reconfirmadas nesta sprint sob ótica qualitativa pela homologação funcional (item 10 acima): "mesma linguagem visual/interação de Fornecedores/Receitas". Desempenho percebido: navegação fluida em todos os 10 passos do roteiro, sem travamentos observados.

### Checklist final (Fase 5)

- **Existe funcionalidade faltante?** Não, em relação ao escopo declarado do blueprint (Regra 11 é pendência conhecida e deliberada, não uma funcionalidade faltante por omissão).
- **Existe comportamento inesperado?** Não.
- **Existe melhoria imprescindível antes da liberação?** Não — a única melhoria identificada (linguagem da nota sobre custo) já foi corrigida nesta própria sprint.
- **Existe documentação desatualizada?** Sim — `MENU_STRUCTURE.md`/`SCREENS.md`, mas é um débito pré-existente e amplo (não específico de Embalagens), registrado como recomendação, não bloqueante para o encerramento deste módulo.
- **Existe débito técnico que impeça o encerramento?** Não — a Regra 11 é uma decisão de escopo já registrada e aprovada (não um débito acidental), e o débito de `MENU_STRUCTURE.md`/`SCREENS.md` é anterior a este módulo e não específico dele.

### Checklist de qualidade reutilizável (Recomendação #5)

Padrão consistente observado nesta e nas homologações anteriores (Sprint I.3, para 2.D/2.G/2.I/2.J) — registrado para reutilização em futuras homologações de módulo:

1. **Revisão documental:** blueprint × regras de negócio × implementação final, achado explícito de qualquer divergência
2. **Homologação funcional:** navegação real (não simulada) sob ótica do usuário — clareza, nomes, mensagens — distinta e complementar à validação técnica já feita na sprint de Frontend
3. **Validação do negócio:** checklist regra-a-regra do blueprint, com status explícito por regra (não um "sim/não" agregado)
4. **Revisão de qualidade:** consistência visual, Design System, acessibilidade, responsividade, desempenho percebido
5. **Checklist final de 5 perguntas:** funcionalidade faltante / comportamento inesperado / melhoria imprescindível / documentação desatualizada / débito técnico bloqueante — só os dois últimos podem gerar pendência registrada sem bloquear o encerramento; os três primeiros, se positivos, bloqueiam

### Documentação

- `PLAN.md` — linha do módulo 2.H atualizada com o resultado da homologação e o encerramento oficial
- Nenhuma ADR nova — nenhuma decisão arquitetural nova nesta sprint

### Pendências conhecidas (registradas, não bloqueantes)

- **Regra 11** — `Product.costPrice` não inclui custo de embalagem — decisão de escopo já registrada (Sprints 2.H.3/2.H.4/2.H.6), não um defeito
- **`MENU_STRUCTURE.md`/`SCREENS.md`** desatualizados desde a Sprint P1 — débito pré-existente, amplo, não específico deste módulo — candidato a uma sprint de documentação dedicada
- **Melhorias de UX não-bloqueantes** (Fase 2): tooltip/nota explicando por que "Estoque baixo" no `StatCard` só conta embalagens ativas — candidato a refinamento futuro

### Confirmações de escopo

| Item | Status |
|------|--------|
| Nova funcionalidade implementada | ❌ Não |
| Escopo ampliado | ❌ Não |
| Correção pontual decorrente da homologação | ✅ Sim (1 — linguagem de mensagem) |
| Regra 11 mantida fora do escopo | ✅ Sim |

### Decisão final

**Módulo Cadastro de Embalagens (2.H) homologado pelo Product Owner e oficialmente encerrado.** Nenhum defeito bloqueante. Pendências registradas (Regra 11, `MENU_STRUCTURE.md`/`SCREENS.md`) não impedem o encerramento — são decisões de escopo já aprovadas ou débito documental pré-existente e não específico deste módulo.

---

## [Sprint 2.H.6] — 2026-07-20 — Frontend + Validação Funcional — Cadastro de Embalagens — **✅ APROVADA, HOMOLOGADA TECNICAMENTE E ENCERRADA (aceite do Product Owner em 20/07/2026)**

**Tipo:** Sprint Oficial de Implementação de Frontend + Validação Funcional obrigatória. Nenhuma alteração de domínio, Service, Repository, Validator ou API — nem a implementação da Regra 11, conforme escopo explícito da Ordem de Missão.

### Auditoria do Frontend existente (Fase 1)

Revisados integralmente `fornecedores/page.tsx` (referência — `PageContainer`+`ResponsiveGrid`, paginação server-side, `StatCard`×3, `FilterChips`, modal único create/edit), `ingredientes/page.tsx` (listagem client-side, filtro "somente estoque baixo" via checkbox, sem `StatCard`), `receitas/page.tsx`+`receitas/[id]/page.tsx` (card da lista é `href` para detalhe, sem botão Editar inline; itens gerenciados item a item na página de detalhe com `AddItemModal`/`ItemCard`/`ConfirmRemoveItemModal`), `produtos/page.tsx` (modal único com `RecipeLinker` embutido — lista dinâmica de linhas dentro do próprio formulário, **sem página de detalhe**).

**Achado crítico:** a API de `ProductPackaging` (2.H.3/2.H.4, item a item) é incompatível com o padrão de `ProductRecipe` (lista embutida no formulário, sem repository/endpoint próprio) já usado por Produtos. Resolvido conforme já decidido na Sprint 2.H.5: criadas `/admin/produtos/[id]` e `/admin/embalagens/[id]`, mirror do padrão de item a item já usado em `receitas/[id]`.

### Telas implementadas (Fase 2/3)

| Tela | Arquivo | Mirror de |
|---|---|---|
| Lista de Embalagens | `src/app/admin/embalagens/page.tsx` | `fornecedores/page.tsx` (paginação, `StatCard`, `FilterChips`) + `ingredientes/page.tsx` (checkbox "somente estoque baixo") |
| Categorias de Embalagem | `src/app/admin/embalagens/categorias/page.tsx` | `ingredientes/categorias/page.tsx`, mas já nascendo em `PageContainer` (não herda o débito técnico da Sprint G.8) |
| Detalhe da Embalagem (nova) | `src/app/admin/embalagens/[id]/page.tsx` | `receitas/[id]/page.tsx` (card de resumo, painéis somente leitura) |
| Detalhe do Produto (nova) | `src/app/admin/produtos/[id]/page.tsx` | `receitas/[id]/page.tsx` (`AddItemModal`/`ItemCard`/editar quantidade/`ConfirmRemoveItemModal`, adaptado para `ProductPackaging`) |
| Integração na lista de Produtos | `src/app/admin/produtos/page.tsx` (editado, aditivo) | `href` no `EntityCard` (mirror de `receitas/page.tsx`) + reabertura do modal de edição via `?edit=id` (mirror de `/?cart=open`, já documentado em `CLAUDE.md`) |
| Item "Embalagens" no hub | `src/app/admin/page.tsx` (editado, aditivo) | Entrada adicionada ao array `MODULES` |

**3 clientes de API novos:** `src/lib/api/packagingCategoryApi.ts`, `src/lib/api/packagingApi.ts`, `src/lib/api/productPackagingApi.ts` — todos mirror do padrão `request<T>`/`ApiRequestError` já usado em `supplierApi.ts`/`recipeApi.ts`.

### Componentes reutilizados (Fase 3/5)

`PageContainer`, `ResponsiveGrid`, `StatCard`, `SearchBar`, `StatusBadge`, `LoadingState` (só na lista — nas 2 páginas de detalhe, skeleton local, mesma exceção já documentada em `MODULE_G8_CLOSURE.md` para layout heterogêneo), `ErrorState`, `EmptyState`, `FilterChips`, `ConfirmDialog`, `EntityCard`, `EntityForm`, `Field`/`Section` (`FormPrimitives`). **Nenhum componente novo criado.** Duas exceções de markup local (card de resumo das páginas de detalhe, `ItemCard`/`PackagingLinkCard`) — mirror direto do precedente já aceito em `receitas/[id]/page.tsx`, não uma exceção nova.

### Integrações com APIs (Fase 4)

Todas as 5 telas conectadas às 10 rotas homologadas na Sprint 2.H.4 — paginação, busca com debounce 300ms, filtros (status/categoria/estoque baixo), ordenação, tratamento de erro por `instanceof ApiRequestError` e código (`DUPLICATE_NAME`, `CATEGORY_HAS_PACKAGINGS`, `INACTIVE_PACKAGING`, `DUPLICATE_PACKAGING`), feedback visual via `ValidationSummary` (toast). Nenhuma regra de negócio no Frontend — toda validação estrutural client-side espelha exatamente a validação já existente no Validator (mesmos limites, mesmas mensagens).

### Fluxos implementados (Fase 5)

CRUD completo de `Packaging`/`PackagingCategory`, Ativar/Desativar, Histórico de Preços (somente leitura), vínculo `Product`↔`Packaging` item a item (adicionar/editar quantidade/remover), navegação entre as 5 telas. **"Editar Produto" reutiliza o modal já existente em `produtos/page.tsx`** — navega para `/admin/produtos?edit={id}`, que busca o produto pela API e abre o modal automaticamente, sem duplicar formulário ou lógica (Recomendação #5), confirmado na Validação Funcional (cenário 16).

### Revisão de reutilização (Fase 6)

- **Componente duplicado?** Não.
- **Hook duplicado?** Não — nenhum hook customizado foi criado; todas as telas usam `useState`/`useEffect`/`useRef` diretamente, mesmo padrão dos módulos irmãos.
- **Lógica duplicada?** Não.
- **Oportunidade de extração?** Registrada, não executada: as 5 telas repetem o padrão `toastTimer`/`showToast` já duplicado em todos os módulos admin do ERP (não introduzido por esta sprint) — candidato a um hook `useAdminToast` compartilhado, fora do escopo desta sprint.
- **Oportunidade de reutilização?** Sim, já aplicada: `Field` de `FormPrimitives` reaproveitado em todos os formulários novos, nenhuma reimplementação.

### Validação técnica (Fase 7)

| Comando | Resultado |
|---|---|
| `npx prisma generate` | ✅ Prisma Client gerado |
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/avisos (1 aviso de `eslint-disable` desnecessário corrigido durante a sprint) |
| `npm run build` | ✅ 0 erros — 4 páginas novas geradas (`/admin/embalagens`, `/admin/embalagens/categorias`, `/admin/embalagens/[id]`, `/admin/produtos/[id]`), nenhuma rota de API nova (as 10 já existem desde a Sprint 2.H.4). Corrigido durante a sprint: `useSearchParams()` sem `Suspense` em `produtos/page.tsx` quebrava o build de produção — envolvido em `<Suspense>`, mesma convenção já usada em `src/app/page.tsx` |

### Validação Funcional — Playwright (Fase 8, obrigatória)

Servidor de desenvolvimento local, login admin real, navegação real do início ao fim (sem simulação). **27/27 cenários aprovados:**

| # | Cenário | Resultado |
|---|---|---|
| 1 | Cadastro de categoria | ✅ Toast de sucesso, categoria listada |
| 2 | Edição de categoria | ✅ Nome atualizado |
| 3 | Exclusão de categoria | ✅ Sem uso: excluída. Com uso: bloqueada com `409 CATEGORY_HAS_PACKAGINGS`, categoria permanece listada |
| 4 | Cadastro de embalagem | ✅ Com categoria, custo, estoque, mínimo |
| 5 | Edição de embalagem | ✅ Custo atualizado no card de resumo |
| 6 | Ativação | ✅ `StatusBadge` muda para "Ativa" |
| 7 | Desativação | ✅ `ConfirmDialog` obrigatório antes de desativar |
| 8 | Pesquisa | ✅ Filtro por nome funcional |
| 9 | Paginação | ✅ Ausente corretamente com < 12 itens (não é falha) |
| 10 | Ordenação | ✅ Nome A-Z / Z-A invertendo a lista corretamente |
| 11 | Filtros | ✅ Status, Categoria e "somente estoque baixo" funcionais |
| 12 | Histórico de preços | ✅ 2+ entradas exibidas (criação + edição) |
| 13 | Inclusão de histórico | ✅ Nova entrada aparece a cada alteração de custo |
| 14 | Vínculo Produto ↔ Embalagem | ✅ Adicionado com quantidade, toast de sucesso |
| 15 | Remoção do vínculo | ✅ Removido, `EmptyState` reaparece |
| 16 | Navegação entre páginas | ✅ Lista→detalhe, "usado em N produtos"→produto, "Editar produto"→lista com modal reaberto automaticamente e pré-preenchido |
| 17 | Estados de Loading | ✅ `aria-busy`/skeleton observados |
| 18 | EmptyState | ✅ "Nenhuma embalagem encontrada" + busca sem resultado |
| 19 | ErrorState | ✅ ID inexistente → "Embalagem não encontrada.", sem crash |
| 20 | Mensagens de validação | ✅ Nome vazio + custo negativo simultâneos, nos campos certos |
| 21 | Mensagens de sucesso | ✅ Toast em toda operação de escrita |
| 22 | Responsividade | ✅ 390px, `scrollWidth === clientWidth` (sem overflow horizontal) em lista e detalhe |
| 23 | Navegação por teclado | ✅ Foco automático no campo Nome ao abrir modal; `Escape` fecha |
| 24 | Console sem erros | ✅ Só os 404/409 esperados dos próprios testes de erro; 0 erros de JavaScript/React |
| 25 | Erros HTTP inesperados | ✅ Nenhum 500 observado |
| 26 | Regra 11 inalterada | ✅ `costPrice` do produto permaneceu R$ 18,53 antes/depois de vincular e desvincular embalagem; aviso "Custo ainda não inclui embalagens vinculadas" visível |
| 27 | Compatibilidade visual | ✅ Mesma paleta/componentes de Fornecedores/Receitas, por reuso integral (não inspeção visual isolada) |

### Evidência de correção (Fase 8)

**1 bug real encontrado durante a Validação Funcional:** pluralização incorreta no contador da lista de embalagens — `` `${total} embalagem${total !== 1 ? "ns" : ""}` `` produzia "embalagemns" no plural. Corrigido para `` `${total} embalage${total !== 1 ? "ns" : "m"}` `` (`src/app/admin/embalagens/page.tsx`). Recompilado (`tsc`/`lint`/`build` limpos) e reconfirmado via Playwright — "3 embalagens" exibido corretamente.

### Revisão final (Fase 9)

- **Diferença entre UX Foundation e implementação?** Nenhuma estrutural — as 5 telas seguem exatamente os wireframes da Sprint 2.H.5, incluindo a decisão de "Editar Produto" reabrir o modal existente via query string.
- **Quebra do Design System?** Nenhuma.
- **Comportamento inesperado?** O bug de pluralização (já corrigido) — nenhum outro.
- **Melhoria de usabilidade identificada, não incorporada:** exibir a contagem "usado em N produtos" já no card da lista de embalagens (hoje só visível no detalhe) — registrada como recomendação para uma sprint futura de refinamento de UX.
- **Oportunidade de simplificação:** hook `useAdminToast` compartilhado (ver Fase 6) — registrada, não implementada.

### Documentação

- `PLAN.md` — linha do módulo 2.H atualizada com o resultado completo da Validação Funcional
- Nenhuma ADR nova — nenhuma decisão arquitetural estrutural nova; a criação das 2 páginas de detalhe já havia sido decidida e registrada na Sprint 2.H.5

### Confirmações de escopo

| Item | Status |
|------|--------|
| Regra de negócio implementada no Frontend | ❌ Não |
| Design System reutilizado integralmente | ✅ Sim |
| Nenhuma API alterada | ✅ Sim |
| Nenhum Service alterado | ✅ Sim |
| Nenhum Repository alterado | ✅ Sim |
| Regra 11 preservada | ✅ Sim — reconfirmada por teste real |
| Validação Funcional concluída com sucesso | ✅ Sim — 27/27 |

### Próximo passo

Módulo pronto para a Homologação do Product Owner (Sprint 2.H.7), mediante nova Ordem de Missão.

---

## [Sprint 2.H.5] — 2026-07-20 — UX Foundation + Wireframes — Cadastro de Embalagens — **✅ APROVADA, HOMOLOGADA E ENCERRADA (aceite do Product Owner expresso no contexto da Ordem de Missão da Sprint 2.H.6: "As Sprints 2.H.0 até 2.H.5 foram homologadas", 20/07/2026)**

**Tipo:** Sprint Oficial de UX e Arquitetura de Interface. Nenhum componente React implementado, conforme escopo da Ordem de Missão.

### Achado crítico (Fase 1)

A API de `ProductPackaging` (Sprints 2.H.3/2.H.4, já homologadas) foi construída **item a item** (`POST/PATCH/DELETE /api/admin/products/[id]/packagings/[linkId]`, mirror de `RecipeIngredient`). O Frontend de Produtos hoje, porém, gerencia `ProductRecipe` como **lista embutida no próprio formulário** (`RecipeLinker` em `produtos/page.tsx`, substituição completa a cada `PATCH`) e **não tem página de detalhe** (`/admin/produtos/[id]` não existe). Essas duas formas são incompatíveis — o `RecipeLinker` não pode ser reaproveitado para embalagens sem reescrever a API já homologada.

**Decisão:** criar duas páginas de detalhe novas — `/admin/produtos/[id]` (hospeda "Embalagens do Produto", item a item, mirror de `receitas/[id]`) e `/admin/embalagens/[id]` (hospeda "Histórico de Preços" e "Usado em N produtos", os dois sub-recursos só de `Packaging`) — em vez de empilhar mais modais sobre as páginas de lista já existentes (mirror de Fornecedores/Ingredientes). Ambas nascem em `PageContainer` (Recomendação Arquitetural #2 desta sprint), diferente do layout legado `max-w-app` que `receitas/[id]` ainda usa (débito já registrado em `MODULE_G8_CLOSURE.md`, não corrigido nesta sprint — fora de escopo).

### Auditoria das interfaces existentes (Fase 1)

Revisadas por completo `fornecedores/page.tsx`, `ingredientes/page.tsx`, `receitas/page.tsx` + `receitas/[id]/page.tsx`, `produtos/page.tsx`. Matriz comparativa completa em `MODULE_2H_UX_FOUNDATION.md` Seção 2. Achados adicionais:
- `Ingredient` tem endpoint de histórico de preço (`GET /api/admin/ingredients/[id]/price-history`) mas **nenhuma tela do ERP o consome até hoje** — confirmado por `grep`, zero ocorrências em `ingredientes/page.tsx`/`ingredientApi.ts`. Não é um bug desta sprint; registrado como contexto para a Tela "Histórico de Preços" de Embalagens, que precisou ser desenhada sem precedente de UI direto (só de API).
- `produtos/page.tsx` não tem `StatCard` nem `Ingredient`; só `fornecedores/page.tsx` adotou a faixa de estatísticas até agora (Sprint 2.E.7) — Embalagens adota `StatCard`×3 (Total/Ativas/Estoque baixo), segundo módulo a fazê-lo.
- `ingredientes/page.tsx` filtra "somente estoque baixo" via checkbox, 100% client-side — padrão direto reaproveitado para Embalagens.

### Telas especificadas (Fase 2)

5 telas: Lista de Embalagens (`/admin/embalagens`), Cadastro/Edição (modal), Categorias (`/admin/embalagens/categorias`), Detalhe da Embalagem (`/admin/embalagens/[id]`, nova), Detalhe do Produto (`/admin/produtos/[id]`, nova) — cada uma com objetivo/atores/entradas/saídas/ações documentados em `MODULE_2H_UX_FOUNDATION.md` Seção 3.

### Wireframes (Fase 3)

5 wireframes de baixa fidelidade (texto/ASCII) produzidos — `MODULE_2H_UX_FOUNDATION.md` Seção 4 — cada um indicando `PageContainer`/`ResponsiveGrid`/Toolbar/`SearchBar`/Filtros/`EntityForm`/`ConfirmDialog`/estados vazios/`StatusBadge`/`StatCard` conforme aplicável.

### Estados da interface (Fase 4)

Matriz completa (10 estados × 5 telas) em `MODULE_2H_UX_FOUNDATION.md` Seção 6. Confirmado: `LoadingState` compartilhado **não** se aplica às duas páginas de detalhe novas (layout heterogêneo — card de resumo + painéis, não uma grade homogênea), mesma exceção já documentada na Cartografia de Compatibilidade (`MODULE_G8_CLOSURE.md`) para `receitas/[id]`.

### Reutilização do Design System (Fase 5)

Matriz Tela × Componentes Compartilhados completa em `MODULE_2H_UX_FOUNDATION.md` Seção 7 — **nenhum componente novo criado**. Duas exceções de markup local justificadas (card de resumo da Tela 4, `ItemCard` da Tela 5) — ambas mirror direto do precedente já aceito em `receitas/[id]/page.tsx`, não uma exceção nova desta sprint.

### Acessibilidade e responsividade (Fase 6)

Revisadas ordem de foco, navegação por teclado, contraste, mensagens de erro e comportamento mobile — nenhuma exceção a `UX_GUIDELINES.md` Seções 14–16 necessária; tudo herdado dos componentes compartilhados já validados.

### Validação de UX (Fase 7)

- Fluxo desnecessário evitado: descartado um modal de "editar direto da lista" (mirror Fornecedores) em favor de navegação para a página de detalhe — mais consistente com os sub-recursos reais de Embalagem
- Nenhum clique redundante — Duplicar/Ativar/Desativar continuam de um clique na lista, só Editar exige navegação
- Nenhuma informação escondida — card da lista já mostra custo/estoque/categoria
- Simplificação aplicada: seção "Receitas" da Tela 5 é somente leitura, não duplica o `RecipeLinker` já existente
- Reutilização confirmada — Tela 3 e os painéis das Telas 4/5 reaproveitam 100% de `ingredientes/categorias`/`receitas/[id]`

### Documentação

- `MODULE_2H_UX_FOUNDATION.md` (novo) — documento completo desta sprint
- `PLAN.md` — linha do módulo 2.H atualizada com o achado da divergência API×UI e a decisão de criar as 2 páginas de detalhe

### Recomendações registradas (Fase 11 do documento, não incorporadas)

Catálogo unificado de contratos de API (hoje espalhado por sprint em `CHANGELOG.md`); Skeleton fiel ao componente real para `LoadingState` (lacuna já conhecida, reforçada pelas 2 páginas de detalhe novas); painel "usado em N X" como componente compartilhado, se um segundo caso de uso real surgir.

### Confirmações de escopo

| Item | Status |
|------|--------|
| Implementação React realizada | ❌ Não |
| Design System reutilizado integralmente | ✅ Sim |
| Componente novo criado sem justificativa | ❌ Não |
| Frontend completamente especificado para a Sprint 2.H.6 | ✅ Sim |

### Próximo passo

Módulo pronto para iniciar a Sprint 2.H.6 (Frontend), mediante nova Ordem de Missão — que precisará decidir explicitamente como a edição de Produto (hoje só via modal) convive com a nova página `/admin/produtos/[id]` (ex: botão "Editar produto" na Tela 5 reabre o mesmo modal existente, sem duplicar lógica).

---

## [Sprint 2.H.4] — 2026-07-20 — API REST — Cadastro de Embalagens — **✅ APROVADA, HOMOLOGADA E ENCERRADA (aceite do Product Owner em 20/07/2026)**

**Tipo:** Sprint Oficial de Implementação — exclusivamente camada de API REST (Route Handlers), expondo os Services homologados na Sprint 2.H.3. Nenhum Frontend, componente, hook, Service, Repository ou Validator alterado, conforme escopo da Ordem de Missão.

### Auditoria prévia (Fase 1)

Revisadas as rotas de `suppliers` (CRUD simples), `ingredient-categories` (delete físico bloqueado), `ingredients/[id]/price-history` (sub-rota de leitura), `recipes/[id]/items`/`items/[itemId]` (item de junção aninhado) e `products` (listagem paginada com filtros).

**Matriz comparativa:**

| Módulo | Estrutura de pastas | Paginação | Filtros | Auth | Serialização de erro |
|---|---|---|---|---|---|
| `Supplier` | `/suppliers`, `/suppliers/[id]`, `/[id]/activate`, `/[id]/deactivate` | ✅ query string (`page`/`pageSize`/`orderBy`/`orderDirection`) | `search`, `active` | `requireAdmin()` em toda função | `{success:false, error:{code,message,details?}}` |
| `IngredientCategory` | `/ingredient-categories`, `/[id]` | ❌ | ❌ | Idem | Idem — `DELETE` físico com `409 CATEGORY_HAS_INGREDIENTS` |
| `Ingredient` | `/ingredients`, `/[id]`, `/[id]/activate`, `/[id]/deactivate`, `/[id]/price-history` (só `GET`) | ❌ (`listAll`) | ❌ | Idem | Idem |
| `Recipe`/`RecipeIngredient` | `/recipes`, `/[id]`, `/[id]/activate`, `/[id]/deactivate`, `/[id]/items` (`POST`), `/[id]/items/[itemId]` (`PATCH`/`DELETE`) | ❌ | ❌ | Idem | Idem — operações de item retornam o **pai** recalculado |
| `Product`/`ProductRecipe` | `/products`, `/[id]`, `/[id]/activate`, `/[id]/deactivate` (sem sub-rota de itens — `ProductRecipe` só via `PATCH` do produto inteiro) | ✅ query string (mesmo shape de Supplier + `categoryId`) | `search`, `categoryId`, `active` | Idem | Idem |

**Confirmações de convenção, todas seguidas nesta sprint:** `requireAdmin()` sempre a primeira linha de cada handler; `try { body = await request.json() } catch { return invalidBody() }` antes de qualquer parse de payload; mapeamento de erro de domínio → HTTP via `instanceof`, na ordem `NotFound → ValidationFailed → InvalidReference → Conflict`; **nenhum uso de HTTP 422** em nenhuma rota do projeto (confirmado — `src/lib/http/responses.ts` não expõe esse helper; validação sempre 400) — não introduzido nesta sprint.

### Matriz de contratos públicos (Fase 2/Recomendação #7)

**`PackagingCategory`**

| Rota | Método | Payload/Query | Sucesso | Erros |
|---|---|---|---|---|
| `/api/admin/packaging-categories` | `GET` | — | `200 PackagingCategory[]` | `401,403,500` |
| `/api/admin/packaging-categories` | `POST` | `{name}` | `201 PackagingCategory` | `400 VALIDATION_ERROR`, `409 DUPLICATE_NAME`, `401,403,500` |
| `/api/admin/packaging-categories/[id]` | `PATCH` | `{name?}` | `200 PackagingCategory` | `400,404,409 DUPLICATE_NAME,401,403,500` |
| `/api/admin/packaging-categories/[id]` | `DELETE` | — | `200 {id}` | `404`, `409 CATEGORY_HAS_PACKAGINGS`, `401,403,500` |

**`Packaging`**

| Rota | Método | Payload/Query | Sucesso | Erros |
|---|---|---|---|---|
| `/api/admin/packagings` | `GET` | `page,pageSize,search,categoryId,active,orderBy,orderDirection` | `200 {items,total,page,pageSize}` | `401,403,500` |
| `/api/admin/packagings` | `POST` | `{name,categoryId?,unitCost,stockQuantity?,minStock?,supplierId?}` | `201 Packaging` | `400`, `404` (categoria/fornecedor), `409 DUPLICATE_NAME`, `401,403,500` |
| `/api/admin/packagings/[id]` | `GET` | — | `200 Packaging` | `404,401,403,500` |
| `/api/admin/packagings/[id]` | `PATCH` | Parcial do acima | `200 Packaging` | `400,404,409,401,403,500` |
| `/api/admin/packagings/[id]/activate` | `PATCH` | — | `200 Packaging` | `404,401,403,500` |
| `/api/admin/packagings/[id]/deactivate` | `PATCH` | — | `200 Packaging` | `404,401,403,500` |
| `/api/admin/packagings/[id]/price-history` | `GET` | — | `200 PackagingPriceHistory[]` | `404,401,403,500` |
| `/api/admin/packagings/[id]/usage` | `GET` | — | `200 PackagingUsageDTO[]` | `404,401,403,500` |

**`ProductPackaging`**

| Rota | Método | Payload | Sucesso | Erros |
|---|---|---|---|---|
| `/api/admin/products/[id]/packagings` | `GET` | — | `200 ProductPackagingDTO[]` | `404` (produto), `401,403,500` |
| `/api/admin/products/[id]/packagings` | `POST` | `{packagingId,quantity}` | `201 ProductPackagingDTO` | `400`, `404` (produto/embalagem), `409 INACTIVE_PACKAGING`/`DUPLICATE_PACKAGING`, `401,403,500` |
| `/api/admin/products/[id]/packagings/[linkId]` | `PATCH` | `{quantity}` | `200 ProductPackagingDTO` | `400,404,401,403,500` |
| `/api/admin/products/[id]/packagings/[linkId]` | `DELETE` | — | `200 {id}` | `404,401,403,500` |

### Endpoints implementados (Fase 3)

10 arquivos de rota, 16 handlers HTTP no total — todos limitados a: validar body (`invalidBody()` em JSON malformado), chamar Service, mapear resposta/erro, retornar status HTTP. Nenhuma regra de negócio, nenhuma query Prisma direta em nenhuma rota.

### Tratamento de erros (Fase 4)

Códigos usados: `400` (validação — `badRequest`/`invalidBody`), `401` (`requireAdmin`, não autenticado), `403` (`requireAdmin`, role ≠ ADMIN), `404` (`notFound`, referência inexistente), `409` (`conflict` — `DUPLICATE_NAME`, `CATEGORY_HAS_PACKAGINGS`, `INACTIVE_PACKAGING`, `DUPLICATE_PACKAGING`), `500` (`internalError`, fallback). **`422` deliberadamente não usado** — o projeto inteiro usa `400` para erro de validação (confirmado na auditoria da Fase 1; mesma decisão já registrada na Sprint 2.E.4 para o módulo Fornecedores). Nenhuma mensagem nova inventada — todas seguem o padrão `"{Entidade} não encontrado(a)."`/`"Já existe um(a) {entidade} com o nome \"{name}\"."` já usado nos módulos irmãos.

### Revisão de contratos (Fase 5)

- **Quebra de padrão?** Não — todas as 10 rotas seguem `requireAdmin()` → parse → Service → mapeamento de erro, na mesma ordem dos módulos irmãos
- **Endpoint redundante? Encontrado e evitado antes da implementação:** o Service (2.H.3) expõe tanto `listActivePackagings()` (sem paginação) quanto `listPackagingsPaged()` (paginado); em vez de criar duas rotas (`/packagings` e `/packagings/active`), só `GET /api/admin/packagings` foi exposta — um futuro consumidor que precise de "só embalagens ativas, sem paginação visual" usa `?active=true&pageSize=<alto>` no mesmo endpoint, mesmo padrão que `Ingredient`/`Supplier` já resolvem sem endpoint duplicado
- **Inconsistência de nomenclatura?** Não — `packaging-categories` (kebab-case, plural) segue exatamente `ingredient-categories`; `packagings`/`products/[id]/packagings` seguem `suppliers`/`recipes/[id]/items`
- **Oportunidade de simplificação?** Nenhuma nova além da já registrada acima (endpoint redundante evitado)
- **Endpoint que deveria ser interno?** Não — todas as 10 rotas correspondem a um caso de uso real do blueprint (`MODULE_2H_PLANNING.md` Seção 4/6.3), incluindo `/usage` (painel "Usado em N produtos")

### Validação (Fase 6)

| Comando | Resultado |
|---|---|
| `npx prisma generate` | ✅ Prisma Client gerado |
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/avisos |
| `npm run build` | ✅ 40 rotas geradas (10 novas de Embalagens), 0 erros |
| Testes manuais via Playwright MCP (servidor de dev local, login admin real, requisições `fetch()` autenticadas — nenhuma UI existe ainda) | ✅ **27/27 testes aprovados** |

**Cobertura dos 27 testes:** criação/validação/duplicidade/listagem/edição de `PackagingCategory` (5); criação com categoria, criação com custo 0 sem categoria/fornecedor (confirma que custo 0 é aceito — regra do blueprint), criação inválida com dois erros simultâneos, paginação, busca por nome, filtro por categoria, busca por id, atualização de custo, histórico de preço (2 entradas: criação + atualização), ativar/desativar, não encontrado (12); vincular a produto real, vínculo duplicado, listar vínculos, atualizar quantidade, painel de uso, remover vínculo, vincular embalagem inativa (7); exclusão de categoria em uso (1); acesso sem autenticação → 401 (1); **verificação extra da pendência da Regra 11** — reconsultado o produto após vincular/desvincular embalagem: `costPrice` permaneceu inalterado e `ProductDTO` não tem campo `packagings`, confirmando que `productService.ts` genuinamente não foi tocado (1).

### Documentação

- `PLAN.md` — linha do módulo 2.H atualizada com a matriz de contratos referenciada e a pendência da Regra 11 mantida
- Nenhuma ADR nova — nenhuma decisão arquitetural estrutural nova; a rota `/usage` e a decisão de não duplicar `/packagings/active` são decisões de contrato HTTP, não arquiteturais

### Confirmações de escopo

| Item | Status |
|------|--------|
| Regra de negócio implementada | ❌ Não |
| Service alterado | ❌ Não |
| Repository alterado | ❌ Não |
| Contratos HTTP consistentes com o padrão do ERP | ✅ Sim |
| Pendência da Regra 11 preservada | ✅ Sim — confirmada por teste real nesta sprint |

### Próximo passo

Módulo pronto para iniciar a Sprint 2.H.5 (UX Foundation), mediante nova Ordem de Missão.

---

## [Sprint 2.H.3] — 2026-07-20 — Service — Cadastro de Embalagens — **✅ APROVADA, HOMOLOGADA E ENCERRADA (aceite do Product Owner em 20/07/2026)**

**Tipo:** Sprint Oficial de Implementação — exclusivamente camada Service (regras de negócio, orquestração de Repositories, validações funcionais). Nenhuma API, Frontend, Hook, Componente React ou Controller implementado, conforme escopo da Ordem de Missão.

### Auditoria prévia (Fase 1)

Revisados `supplierService.ts`, `ingredientCategoryService.ts`, `ingredientService.ts`, `recipeService.ts` e `productService.ts` por completo.

**Matriz comparativa:**

| Módulo | Responsabilidade | Transações | Tratamento de erros | Integração entre Repositories | Retorno |
|---|---|---|---|---|---|
| `Supplier` | CRUD simples, sem relação | Não usa | Classes de erro (`{X}NotFoundError`, `{X}ValidationFailedError`, `Duplicate{X}Error`) | Só `supplierRepository` | DTO com datas ISO string |
| `IngredientCategory` | CRUD + delete físico bloqueado por uso | Não usa (checagem + delete não atômicos) | Idem | `ingredientCategoryRepository` + `countIngredientsByCategory` de `ingredientRepository` (contagem de uso vive no repository do **filho**, não do pai) | Tipo Prisma puro |
| `Ingredient` | CRUD + histórico de preço, cross-ref (unidade/categoria) | Não usa (create/priceHistory não atômicos) | Idem + `Invalid{X}ReferenceError` para FK cruzada | `ingredientRepository` + leitura de `unitRepository`/`ingredientCategoryRepository` | DTO com campo derivado (`isLowStock`) |
| `Recipe`/`RecipeIngredient` | CRUD da receita + itens (item a item: add/update/remove, cada um retorna o DTO do **pai** recalculado) | Não usa | Idem + erros de item (`{X}ItemNotFoundError`, `LastItemRemovalError`) | `recipeRepository` + `recipeIngredientRepository` + leitura de `ingredientRepository`/`unitRepository`/`unitConversionRepository` | DTO com custo sempre recalculado, nunca armazenado |
| `Product`/`ProductRecipe` | CRUD do produto + receitas vinculadas (**lista completa substituída** a cada update, não item a item) | ✅ (`productRepository.updateProduct` usa `$transaction` — mas a transação vive no **Repository**, não no Service) | Idem | `productRepository` + **Service** `recipeService.getRecipeById` (não o repository de Recipe) para calcular `costPrice` | DTO com `costPrice`/`margin` calculados a cada leitura |

**Achado-chave:** existem dois padrões legítimos e diferentes para "item de uma coleção aninhada" já convivendo no projeto — item a item (`RecipeIngredient`, com repository e operações próprias) vs. substituição em lote (`ProductRecipe`, sem repository próprio, nested write no repository do pai). A Sprint 2.H.2 já havia escolhido o padrão item a item para `productPackagingRepository.ts` (mirror de `recipeIngredientRepository.ts`); esta sprint manteve a mesma escolha no Service, por ter precedente de rota real (`/api/admin/recipes/[id]/items/[itemId]`) e por não exigir nenhuma alteração em `productRepository.ts`/`productService.ts` (módulo 2.J, encerrado). `validateProductPackagingsList` (Sprint 2.H.2, mirror de `ProductRecipe`) foi mantida no validator, não removida — documentada como alternativa disponível caso uma sprint futura prefira substituição em lote.

### Matriz de classificação das regras (Fase 2)

| # | Regra (resumo) | Validator | Repository | Service | Futuro módulo |
|---|---|---|---|---|---|
| 1 | Definição de embalagem (item físico, não matéria-prima) | — | — | — | Conceitual — só `REGRAS_NEGOCIO.md`, sem camada de código |
| 2 | Fornecedor único opcional, FK real | — | ✅ (schema, 2.H.1) | ✅ `assertSupplierExists` | Múltiplos fornecedores — Backlog Futuro |
| 3 | Sem "embalagem composta"/"kit" — resolvido por múltiplos `ProductPackaging` | — | ✅ (schema N:N, 2.H.1) | ✅ (nenhum limite de quantidade de vínculos por produto) | — |
| 4 | Custo = `unitCost` direto, sem conversão | ✅ (`unitCost` ≥ 0) | — | ✅ (`mapToPackaging`/`mapLink` usam `unitCost` direto) | — |
| 5 | Alteração de `unitCost` gera `PackagingPriceHistory` | ✅ `packagingPriceHistoryValidator` | ✅ (2.H.2) | ✅ `packagingService` → `recordPriceChange` (create e update) | — |
| 6 | Estoque sempre inteiro, alerta `stockQuantity <= minStock` | ✅ (`Number.isInteger`) | — | ✅ (`isLowStock` no `PackagingDTO`) | UI de alerta — nenhum módulo do ERP tem ainda |
| 7 | Embalagem inativa não pode ser adicionada a novo vínculo | — | — | ✅ `productPackagingService.assertPackagingUsable` | — |
| 8 | Uma embalagem em vários produtos | — | ✅ (schema N:N) | ✅ (nenhuma restrição de uso único) | — |
| 9 | Quantidade sempre inteira, sem uso parcial | ✅ (`Number.isInteger`, `> 0`) | ✅ (`Int` no schema) | — | — |
| 10 | `PackagingCategory` delete físico bloqueado por uso; `Packaging` nunca hard-delete | — | ✅ (sem `deletePackaging`, 2.H.2) | ✅ `packagingCategoryService.deletePackagingCategory` + `countPackagingsByCategory` | — |
| **11** | **Custo da embalagem compõe `Product.costPrice` automaticamente** | — | — | 🟡 **Parcial** — `productPackagingService` calcula `unitCost`/`quantity` por vínculo; a soma final em `Product.costPrice` exige alterar `productService.calculateCostPrice` (módulo 2.J, encerrado) — **fora do escopo declarado da Fase 3 desta sprint** | **Pendência registrada** — próxima sprint (2.H.4 ou dedicada) |
| 12 | Zero ou mais embalagens por produto; escolha do cliente fora do MVP | — | — | ✅ (nenhum limite de quantidade) | Escolha do cliente no checkout — Backlog Futuro (já registrado na Sprint 2.H.0) |
| 13 | Sem relação com `Recipe`/`RecipeIngredient` | — | ✅ (confirmado, nenhuma alteração em `Recipe` desde 2.H.1) | ✅ (nenhum import de `recipeService`/`recipeRepository` em nenhum dos 4 Services) | — |

Nenhuma regra ficou sem camada responsável — a Regra 11 tem responsável (Service), mas sua implementação está **parcial e explicitamente registrada como pendência**, não esquecida.

### Services criados (`src/lib/`)

| Arquivo | Responsabilidade | Mirror de |
|---|---|---|
| `packagingCategoryService.ts` | CRUD de `PackagingCategory`, delete bloqueado por uso | `ingredientCategoryService.ts` (mirror exato) |
| `packagingPriceHistoryService.ts` | `recordPriceChange`/`getPackagingPriceHistory` — arquivo dedicado (mesma divergência já registrada no Repository, Sprint 2.H.2) | Funções de histórico em `ingredientService.ts`, promovidas a serviço próprio |
| `packagingService.ts` | CRUD de `Packaging`, cross-ref de categoria/fornecedor, orquestra `packagingPriceHistoryService` | `ingredientService.ts` |
| `productPackagingService.ts` | Vínculo item a item `ProductPackaging` (`addProductPackaging`/`updateProductPackagingQuantity`/`removeProductPackaging`/`listProductPackagings`/`listPackagingUsage`) | `recipeService.ts` (operações de item da receita) |

### Regras de negócio implementadas (Fase 4)

Regras 1–10, 12 e 13 do blueprint implementadas integralmente (ver matriz acima). **Regra 11 implementada parcialmente** — decisão de interromper a extensão a `productService.ts` por estar fora do escopo declarado desta sprint (Fase 3 lista exclusivamente os 4 Services de Embalagens); nenhuma regra nova, não documentada, foi criada.

### Transações (Fase 5)

Nenhuma transação Prisma foi necessária nos 4 Services. Auditoria método a método:
- `packagingCategoryService`/`packagingService`/`productPackagingService`: cada método público faz no máximo uma escrita real após as checagens de leitura — nada a coordenar atomicamente
- `packagingService.createPackaging`/`updatePackaging`: fazem duas escritas (`dbCreatePackaging`/`dbUpdatePackaging` + `recordPriceChange`), **sem** transação — mesmo padrão não-transacional já aceito em `ingredientService.createIngredient`/`updateIngredient` (risco pré-existente e equivalente no precedente, não introduzido por esta sprint)

### Tratamento de erros (Fase 6)

16 classes de erro de domínio novas (4 em `packagingCategoryService.ts`, 1 em `packagingPriceHistoryService.ts`, 5 em `packagingService.ts`, 6 em `productPackagingService.ts`), todas seguindo o padrão `{Entidade}{Motivo}Error` já usado em `Supplier`/`Ingredient`/`Recipe`/`Product`. Nenhuma duplicação entre Services — `PackagingNotFoundError` (de `packagingService`) e `InvalidPackagingReferenceError` (de `productPackagingService`) são erros **distintos e intencionais**: o primeiro é "não existe" numa leitura direta; o segundo é "referência inválida" numa validação cruzada de outro agregado — mesma distinção já usada entre `RecipeNotFoundError` e `InvalidRecipeReferenceError` em `recipeService.ts`/`productService.ts`.

### Revisão crítica (Fase 7)

- **Regra de negócio em Repository?** Não — auditados os 4 Repositories da Sprint 2.H.2, nenhuma alteração necessária
- **Regra estrutural em Validator?** Não — o `DUPLICATE_PACKAGING` de `validateProductPackagingsList` é validação estrutural de um array submetido (mesmo padrão de `validateRecipesList`/`DUPLICATE_INGREDIENT`), distinto do `DuplicatePackagingInProductError` do Service, que consulta o banco (duplicidade contra vínculos já persistidos) — não são a mesma checagem
- **Lógica duplicada?** Não — `assertProductExists` e `assertPackagingUsable` são funções privadas reutilizadas pelas 5 funções públicas de `productPackagingService.ts`, não repetidas inline
- **Oportunidade de extração?** `recordPriceChange` já foi extraída para `packagingPriceHistoryService.ts` e reutilizada por `createPackaging`/`updatePackaging`
- **Responsabilidade excessiva?** Não — cada Service cobre exatamente uma entidade/relação
- **Acoplamento desnecessário — encontrado e corrigido antes da implementação final:** o rascunho inicial de `productPackagingService.ts` chamava `productService.getProductById`/`packagingService.getPackagingById` (Service→Service, mirror do padrão mais pesado de `productService.assertRecipesUsable`) só para checar existência/estado ativo — trocado por `findProductById`/`findPackagingById` direto do Repository (mirror do padrão mais simples de `recipeService.assertIngredientUsable`), já que o DTO completo do Service não era necessário

### Validação (Fase 8)

| Comando | Resultado |
|---|---|
| `npx prisma generate` | ✅ Prisma Client gerado |
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/avisos |
| Testes automatizados | Não há suíte de testes no projeto — nada a executar |

### Documentação

- `PLAN.md` — linha do módulo 2.H atualizada, com a pendência da Regra 11 registrada explicitamente
- `REGRAS_NEGOCIO.md` — nenhuma regra foi refinada durante a implementação (todas já estavam corretamente documentadas na Sprint 2.H.0); nenhuma alteração necessária
- Nenhuma ADR nova — nenhuma decisão arquitetural estrutural nova foi tomada; a escolha de padrão item a item vs. lista (Fase 1/7) é uma decisão de organização de código dentro do já decidido por ADR-014, não uma nova decisão arquitetural

### Pendência explícita para a próxima sprint

`Product.costPrice` **ainda não** inclui o custo de `ProductPackaging` — a Regra 11 do blueprint só é realizada integralmente quando `productService.ts` (`calculateCostPrice`/`mapToDTO`) for estendido para somar `Σ(ProductPackaging cost)`, além de `Σ(ProductRecipe cost)`. Essa alteração toca o módulo 2.J (já encerrado) e não estava no escopo declarado da Fase 3 desta sprint (que lista exclusivamente `PackagingCategoryService`/`PackagingService`/`PackagingPriceHistoryService`/`ProductPackagingService`). Registrada como recomendação para a Sprint 2.H.4 (API) ou uma sprint dedicada, mediante decisão do Product Owner.

### Confirmações de escopo

| Item | Status |
|------|--------|
| API criada | ❌ Não |
| Frontend criado | ❌ Não |
| Repository alterado sem necessidade | ❌ Não — os 4 Repositories da Sprint 2.H.2 permanecem inalterados |
| Todas as regras de negócio residem na camada Service | ✅ Sim (Regra 11 parcialmente, com pendência explícita) |
| Código aderente ao blueprint e às ADRs vigentes | ✅ Sim |

### Próximo passo

Módulo pronto para iniciar a Sprint 2.H.4 (API), mediante nova Ordem de Missão — que deverá decidir explicitamente como tratar a pendência da Regra 11 (`Product.costPrice`).

---

## [Sprint 2.H.2] — 2026-07-20 — Repository + Validator — Cadastro de Embalagens — **✅ APROVADA, HOMOLOGADA E ENCERRADA (aceite do Product Owner em 20/07/2026)**

**Tipo:** Sprint Oficial de Implementação — exclusivamente camadas de Repository (acesso a dados) e Validator (validação estrutural). Nenhum Service, API ou Frontend implementado, conforme escopo da Ordem de Missão.

### Auditoria prévia (Fase 1)

Revisados `supplierRepository.ts`, `ingredientRepository.ts`, `ingredientCategoryRepository.ts`, `recipeIngredientRepository.ts`, `productRepository.ts` e os validators equivalentes. **Achado relevante:** `ProductRecipe` — o par estrutural mais próximo de `ProductPackaging` (mesmo formato de junção, mirror explícito por ADR-014) — não tem repository dedicado; é gravado via nested write dentro de `productRepository.ts` (`deleteMany` + `create`, em transação, no update). Isso difere do padrão item-a-item de `RecipeIngredient` (que tem `recipeIngredientRepository.ts` próprio, com `create`/`update`/`delete` por item). A Ordem de Missão exigiu explicitamente um `ProductPackagingRepository` dedicado — decisão registrada: seguir o padrão de `recipeIngredientRepository.ts` (mais completo), sem comprometer a Sprint 2.H.3 a uma estratégia de escrita específica (item a item ou substituição em lote).

### Matriz comparativa (Repositories existentes)

| Módulo | Paginação | Pesquisa | Ordenação | Soft delete | Erros | Transações | Tipagem de retorno |
|---|---|---|---|---|---|---|---|
| `Supplier` | ✅ `listSuppliersPaged` | ✅ `name contains insensitive` | ✅ `orderBy`/`orderDirection` | ✅ `active` | Lançados no Service, não no Repository | Não usa | Tipo Prisma puro (`Supplier`) |
| `Ingredient` | ❌ só `listAll`/`listActive` | Só via filtro de categoria/nome no Service | Fixa (`name asc`) | ✅ `active` | Idem | Não usa | `IngredientWithRelations` (`Prisma...GetPayload`) |
| `IngredientCategory` | ❌ | ❌ | Fixa (`name asc`) | ❌ (delete físico bloqueado por contagem) | Idem | Não usa | Tipo Prisma puro |
| `RecipeIngredient` (item) | ❌ | ❌ | — | ❌ (delete físico, item de junção) | Idem | Não usa | `RecipeIngredientWithRelations` |
| `Product` | ✅ `listProductsPaged` | ✅ | ✅ | ✅ `active` | Idem | ✅ (`updateProduct` usa `$transaction` para substituir `ProductRecipe`) | `ProductWithRelations` |

### Repositories criados (`src/lib/repositories/`)

| Arquivo | Responsabilidade | Mirror de |
|---|---|---|
| `packagingCategoryRepository.ts` | CRUD de `PackagingCategory` — delete físico (bloqueio de uso fica no Service, 2.H.3) | `ingredientCategoryRepository.ts` (mirror exato) |
| `packagingRepository.ts` | CRUD de `Packaging`, listagem paginada (`listPackagingsPaged`) + listagem simples ativa (`listActivePackagings`, para `<select>`), `countPackagingsByCategory` | `ingredientRepository.ts` + `supplierRepository.ts`/`productRepository.ts` (paginação) |
| `packagingPriceHistoryRepository.ts` | `addPackagingPriceHistoryEntry`/`listPackagingPriceHistory` — registro imutável | `IngredientPriceHistory` (funções de `ingredientRepository.ts`), promovido a arquivo próprio por exigência explícita da Ordem de Missão |
| `productPackagingRepository.ts` | CRUD do vínculo `ProductPackaging`, nas duas direções de consulta (`listLinksByProduct`, `listLinksByPackaging`) | `recipeIngredientRepository.ts` (escolha deliberada — ver Fase 1) |

**Métodos implementados:** 6 em `packagingCategoryRepository.ts`, 9 em `packagingRepository.ts`, 2 em `packagingPriceHistoryRepository.ts`, 8 em `productPackagingRepository.ts` — todos usando Prisma Client tipado, nenhuma query SQL manual, nenhuma lógica de negócio ou cálculo.

### Validators criados (`src/lib/validators/`)

| Arquivo | Cobertura |
|---|---|
| `packagingCategoryValidator.ts` | `name` obrigatório, 2–100 caracteres — mirror de `ingredientCategoryValidator.ts` |
| `packagingValidator.ts` | `name` 2–150 caracteres; `unitCost` obrigatório e **≥ 0** (não `> 0` como `Ingredient.currentPrice` — embalagem pode ter custo zero, já registrado no blueprint); `stockQuantity`/`minStock` inteiros ≥ 0 |
| `packagingPriceHistoryValidator.ts` | Só `validate...Create` (registro imutável, sem update); `packagingId` obrigatório, `price` ≥ 0, `notes` ≤ 500 caracteres |
| `productPackagingValidator.ts` | Validação em **lista** (`validateProductPackagingsList`), não item a item — mirror exato de `ProductRecipeInput`/`validateRecipeLink`/`validateRecipesList` em `productValidator.ts`, coerente com ADR-014 ("mesmo padrão de `ProductRecipe`"); bloqueia embalagem duplicada no mesmo produto e quantidade não inteira ou ≤ 0 |

### Divergências registradas (Fase 5 — não copiadas automaticamente, justificadas)

- `PackagingPriceHistoryRepository` como arquivo próprio, diferente da co-localização usada em `Ingredient`/`IngredientPriceHistory` — decisão da própria Ordem de Missão, não uma escolha desta sprint
- `ProductPackagingRepository` com CRUD completo por item, diferente da ausência de repository dedicado em `ProductRecipe` — ver Fase 1 acima

### Revisão crítica (Fase 6)

- **Duplicação encontrada e corrigida antes da implementação final:** um método de contagem de uso (`countProductsUsingPackaging`) havia sido desenhado tanto em `packagingRepository.ts` quanto em `productPackagingRepository.ts` durante o rascunho — mantido apenas em `productPackagingRepository.ts` (`countLinksByPackaging`), dono real da tabela de junção
- **Nenhum método desnecessário** identificado nos 4 Repositories — todos usados por algum caso de uso do blueprint (`MODULE_2H_PLANNING.md` Seção 4/6)
- **Nenhuma responsabilidade excessiva** — todos os métodos são puramente Prisma Client, sem cálculo/regra de negócio
- **Oportunidade de reutilização registrada, não executada nesta sprint:** a interface `PagedResult<T>` está duplicada em 3 arquivos agora (`supplierRepository.ts`, `productRepository.ts`, `packagingRepository.ts`) com definição idêntica; o mesmo vale para o padrão `buildWhere(...)`. Extrair para um utilitário compartilhado (`src/lib/repositories/shared.ts` ou similar) tocaria os módulos já encerrados 2.E/2.J sem necessidade funcional para esta sprint — registrado como recomendação de "Repository Standards" (ver abaixo), não executado

### Validação (Fase 7)

| Comando | Resultado |
|---|---|
| `npx prisma generate` | ✅ Prisma Client gerado |
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/avisos |
| Testes automatizados | Não há suíte de testes no projeto — nada a executar |

### Documentação

- `PLAN.md` — linha do módulo 2.H atualizada: "Repository + Validator implementados (Sprint 2.H.2)"
- Nenhuma ADR nova necessária — nenhuma decisão de modelagem de dados foi tomada nesta sprint (o schema já estava fechado na Sprint 2.H.1); as divergências de padrão de Repository (Fase 5) são decisões de organização de código, não arquiteturais, e estão documentadas acima

### Recomendação de governança registrada (não bloqueia a sprint)

Oportunidade para um documento futuro de **Repository Standards**, cobrindo pelo menos: (1) quando um Repository de item de junção deve ser dedicado (`RecipeIngredient`, agora `ProductPackaging`) vs. nested write no repository pai (`ProductRecipe`); (2) extração de `PagedResult<T>`/`buildWhere` para um utilitário compartilhado; (3) quando price history deve viver no repository do pai vs. arquivo próprio. Não formalizado nesta sprint — registrado para avaliação futura do Product Owner.

### Confirmações de escopo

| Item | Status |
|------|--------|
| Regra de negócio implementada | ❌ Não |
| API criada | ❌ Não |
| Service criado | ❌ Não |
| Repositories limitados à persistência | ✅ Sim |
| Validators limitados à validação estrutural | ✅ Sim |
| Código aderente ao blueprint e ao Schema homologados | ✅ Sim |

### Próximo passo

Módulo pronto para iniciar a Sprint 2.H.3 (Service), mediante nova Ordem de Missão.

---

## [Sprint 2.H.1] — 2026-07-20 — Modelagem Prisma — Cadastro de Embalagens

**Tipo:** Sprint Oficial de Implementação — exclusivamente camada de modelagem Prisma. Nenhum Repository, Validator, Service, API ou Frontend implementado, conforme escopo da Ordem de Missão.

### Auditoria prévia (Fase 1/2)

Confirmados os padrões já usados no schema antes de implementar: entidades "categoria" leves (`IngredientCategory`, `ProductCategory`) e tabelas de junção (`ProductRecipe`, `ProductOccasion`, `RecipeIngredient`) não têm `createdAt`/`updatedAt` — confirma que `PackagingCategory`/`ProductPackaging` (sem timestamps) e `Packaging`/`PackagingPriceHistory` (com/parcial, mesma lógica de `Ingredient`/`IngredientPriceHistory`) seguem exatamente o padrão já existente. Nenhuma oportunidade adicional de simplificação encontrada além das já decididas na Sprint 2.H.0 (quantidade sempre `Int`, sem `UnitOfMeasure`; categoria dinâmica em vez de enum fixo).

### Models criados (`prisma/schema.prisma`)

- `PackagingCategory` — `id`, `name @unique`, `packagings Packaging[]`
- `Packaging` — `id`, `name`, `categoryId?`, `unitCost Decimal(12,4)`, `stockQuantity Int @default(0)`, `minStock Int @default(0)`, `supplierId?`, `active Boolean @default(true)`, `priceHistory[]`, `products ProductPackaging[]`, `createdAt`/`updatedAt`; índices `@@index([name])`, `@@index([categoryId])`
- `PackagingPriceHistory` — `id`, `packagingId` (`onDelete: Cascade`), `price Decimal(12,4)`, `notes?`, `recordedAt`; índice `@@index([packagingId, recordedAt])`
- `ProductPackaging` — `id`, `productId` (`onDelete: Cascade`), `packagingId`, `quantity Int @default(1)`; `@@unique([productId, packagingId])`

### Relações inversas (estritamente aditivas — Fase 3/4)

- `Supplier` ganhou `packagings Packaging[]` — nenhum campo existente alterado
- `Product` ganhou `packagings ProductPackaging[]` — nenhum campo existente alterado
- Comentário do bloco `Supplier` em `prisma/schema.prisma` corrigido (afirmava "sem relacionamento... com Packaging", desatualizado pela própria mudança desta sprint)

### Padrões obrigatórios aplicados (Fase 4)

- `Packaging.supplierId` é FK real para `Supplier` desde o nascimento do modelo (diferente de `Ingredient.supplier`, que é texto livre — dívida técnica conhecida, não repetida aqui)
- `Product` como proprietário da relação com `Packaging` — nenhum campo/relação adicionada a `Recipe`/`RecipeIngredient` (ADR-014)
- `ProductPackaging.quantity` e `Packaging.stockQuantity`/`minStock` sempre `Int`
- Nomenclatura consistente com os módulos irmãos (`Packaging{X}`, `Product{X}` — mesmo padrão de `Ingredient{X}`/`ProductRecipe`)
- Índices só onde há precedente direto (nome, categoria, histórico cronológico) — nenhum índice especulativo

### Validação (Fase 5)

| Comando | Resultado |
|---|---|
| `npx prisma format` | ✅ Aplicado |
| `npx prisma validate` | ✅ "The schema... is valid" |
| `npx prisma generate` | ✅ Prisma Client gerado |
| `npx prisma db push` | ✅ "Your database is now in sync with your Prisma schema" |
| `npx tsc --noEmit` | ✅ 0 erros |
| Introspecção direta do banco real (script temporário, removido ao final) | ✅ 4 tabelas confirmadas (`PackagingCategory`, `Packaging`, `PackagingPriceHistory`, `ProductPackaging`); `Packaging.supplierId` confirmada; FKs de `ProductPackaging` confirmadas (`packagingId→Packaging`, `productId→Product`); `prisma.packaging.count()` retorna `0` via Client real |

### Migrations

Projeto usa exclusivamente `prisma db push` (sem pasta `prisma/migrations/`, confirmado na Sprint 2.H.0) — nenhuma migration versionada gerada, por não ser a estratégia deste projeto.

### Documentação

- `PLAN.md` — linha do módulo 2.H atualizada: "Schema implementado (Sprint 2.H.1)"
- `DOMAIN_MODEL.md` — `Packaging`/`PackagingCategory`/`PackagingPriceHistory`/`ProductPackaging` movidos de "Entidades Planejadas" para uma nova seção "Domínio: Embalagens" com status `Schema ✅`; diagrama de relacionamentos e tabela comparativa (Seção 4) atualizados
- Nenhuma nova ADR necessária — toda decisão de modelagem desta sprint já estava coberta pela ADR-014 e pelo blueprint da Sprint 2.H.0; nenhuma decisão nova surgiu durante a implementação

### Confirmações de escopo

| Item | Status |
|------|--------|
| Modelagem aderente ao blueprint aprovado | ✅ Sim |
| ADR-014 respeitada integralmente | ✅ Sim — `Packaging` vinculado a `Product`, nenhuma alteração em `Recipe`/`RecipeIngredient` |
| Regra de negócio implementada | ❌ Não |
| API criada | ❌ Não |
| Repository/Service/Validator criados | ❌ Não |
| Código fora do escopo da sprint | ❌ Não |

### Próximo passo

Módulo pronto para iniciar a Sprint 2.H.2 (Repository + Validator), mediante nova Ordem de Missão.

---

## [Sprint 2.H.0] — 2026-07-20 — Blueprint Funcional e Arquitetural — Cadastro de Embalagens

**Tipo:** Sprint Oficial de Planejamento Arquitetural. Nenhuma implementação de código — só documentação. Primeiro módulo do ERP projetado integralmente sob o padrão consolidado na Sprint G.8.

### Achado crítico — conflito de documentação resolvido via ADR-014

A Fase 1 (Auditoria) encontrou uma contradição real, não resolvida, entre documentos "fonte de verdade" sobre onde `Packaging` se conecta ao resto do domínio:
- **Versão A** (`CLAUDE.md`, `ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `EPICO_2_PLANEJAMENTO.md`, decisão de 30/06/2026, nunca implementada): `Packaging` vinculado a `Recipe` via `PackagingItem`.
- **Versão B** (`PLAN.md` linha 70, `CHANGELOG.md` linha 1766, `REGRAS_NEGOCIO.md` Seções 3.16/8, mais recentes): `Packaging` vinculado a `Product` — confirmada na prática pelo Módulo 2.I (Receitas), já encerrado sem `PackagingItem`.

Apresentado ao Product Owner com recomendação técnica (Opção B) e aprovado nesta sessão como **ADR-014** (`CLAUDE.md`, tabela "Decisões arquiteturais tomadas"): `Packaging` vincula-se a `Product` via novo join `ProductPackaging`; `Recipe`/`RecipeIngredient` não recebem nenhuma alteração.

### Produzido

- **`MODULE_2H_PLANNING.md`** (novo) — blueprint completo: inventário de código/documentação (Fase 1), modelo de domínio (Fase 2), 13 regras de negócio com origem explícita (Fase 3), 12 casos de uso (Fase 4), 9 integrações mapeadas (Fase 5), UX Foundation completa com wireframe de componentes compartilhados (Fase 6), estratégia de reutilização do Design System — nenhum componente novo necessário (Fase 7), modelo de dados Prisma completo com 4 models novos + 2 relações inversas aditivas (Fase 8), roadmap detalhado das Sprints 2.H.1–2.H.7 com objetivo/entradas/saídas/critérios de aceite (Fase 9), 6 riscos com mitigação (Fase 10), 10 itens de Backlog Futuro (Fase 11), revisão de consistência (Fase 12)
- **`CLAUDE.md`** — nova entrada **ADR-014** na tabela "Decisões arquiteturais tomadas"; entrada original de 30/06/2026 anotada como parcialmente superada
- **`ARCHITECTURE.md`** — linha 172 ("Decisões já tomadas") corrigida + nova entrada ADR-014
- **`DOMAIN_MODEL.md`** — stub de `Packaging` reescrito com o modelo final (atributos, relacionamentos, referência ao blueprint)
- **`REGRAS_NEGOCIO.md`** — Seção 3.16 (Embalagem) e Seção 8 (Embalagens) totalmente definidas (antes "A definir"); Seção 9.2 (custo das embalagens na fórmula de precificação) definida; Seção 16 (regras pendentes) e Resumo Executivo (Inconsistência #8) atualizados para refletir as definições desta sprint
- **`PLAN.md`** — linha do módulo 2.H atualizada: dependências corrigidas (2.E opcional, 2.J obrigatória, 2.D deixou de ser dependência), status "Blueprint completo", link para `MODULE_2H_PLANNING.md`

### Decisões de design registradas em `MODULE_2H_PLANNING.md`

- `PackagingCategory` mirror de `IngredientCategory` (delete físico bloqueado se em uso) — não um enum fixo de tipo, mantendo o padrão já usado por `ProductCategory`/`IngredientCategory`/`OccasionTag`
- `ProductPackaging.quantity` e `Packaging.stockQuantity`/`minStock` sempre `Int`, sem `unitId`/`UnitOfMeasure` — divergência deliberada do padrão `RecipeIngredient` (Decimal + unidade), documentada com alternativa considerada e descartada
- `PackagingPriceHistory` — versão simplificada de `IngredientPriceHistory` (sem campo `source`)
- `Packaging.supplierId` nasce como FK real para `Supplier` (diferente de `Ingredient.supplier`, que é texto livre — dívida técnica conhecida do ERP, não repetida neste módulo novo)
- Nova página `/admin/embalagens` nasce diretamente em `PageContainer`/`ResponsiveGrid` (padrão consolidado na Sprint G.8), evitando desde o início o débito técnico (`LoadingState`/`EntityCard` adiados) que as 3 páginas legadas da Sprint G.8 precisaram gerenciar

### Confirmações de escopo

| Item | Status |
|------|--------|
| Código implementado | ❌ Não — sprint de planejamento puro |
| Schema alterado | ❌ Não — apenas documentado/proposto em `MODULE_2H_PLANNING.md` |
| Componente compartilhado novo ou alterado | ❌ Não |
| ADR registrada e aprovada pelo Product Owner | ✅ Sim — ADR-014 |
| Documentação obrigatória atualizada | ✅ `PLAN.md`, `CLAUDE.md`, `ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `REGRAS_NEGOCIO.md`, `MODULE_2H_PLANNING.md` (novo) |
| `DESIGN_SYSTEM.md` alterado | ❌ Não — nenhuma evolução genérica identificada como necessária |
| Documentos fora do escopo da ADR (`VISION.md`, `ERP_BLUEPRINT.md`, `MODULES.md`, `EPICO_2_PLANEJAMENTO.md`) | Registrados como achado (Seção 1.5 de `MODULE_2H_PLANNING.md`), não corrigidos — fora da lista de documentos impactados da ADR-014 |

### Próximo passo

Sprint 2.H.1 (Schema) pode iniciar mediante aceite formal deste blueprint pelo Product Owner e abertura de nova Ordem de Missão.

---

## [Sprint G.8] — 2026-07-18 — Design System Consolidation & Legacy Migration — **✅ CONCLUÍDA, APROVADA, HOMOLOGADA E ENCERRADA (aceite do Product Owner em 20/07/2026)**

**Tipo:** Consolidação de Frontend — migração dos módulos de Cadastro Mestre para os componentes compartilhados de `src/components/admin/shared/` (nascidos na Sprint 2.E.7, `/admin/fornecedores`). Endereça o item de Backlog Técnico TD-19 ("aplicar `max-w-5xl`+grid aos outros 4 módulos", registrado na Sprint 2.E.7). Nenhuma camada de backend (Repository/Validator/Service/API/Schema/Banco/Seeds) alterada.

### Nota de rastreabilidade

Sprint iniciada em sessão anterior, interrompida antes de qualquer registro em `PLAN.md`/`CHANGELOG.md`. Este registro foi produzido nesta sessão, retroativamente, a partir de auditoria direta do código existente (leitura de arquivos e `grep`, não suposição) — ver "Estado real auditado" abaixo.

### Objetivo da sprint

Migrar Unidades, Ingredientes, Receitas e Produtos para os 11 componentes compartilhados documentados em `DESIGN_SYSTEM.md` Seção 21; eliminar duplicação de interface; consolidar o Design System como padrão oficial do ERP para módulos de Cadastro Mestre; atualizar `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md`/`PLAN.md`/`CHANGELOG.md`; criar `MODULE_G8_CLOSURE.md`; validar os módulos.

### Estado real auditado nesta sessão

| Item | Estado |
|---|---|
| `src/app/admin/unidades/page.tsx` | ✅ Já migrada — importa os 11 componentes de `shared/`, nenhuma redeclaração local |
| `src/app/admin/ingredientes/page.tsx` | ✅ Já migrada |
| `src/app/admin/receitas/page.tsx` | ✅ Já migrada |
| `src/app/admin/produtos/page.tsx` | ✅ Já migrada |
| `src/app/admin/unidades/conversoes/page.tsx` | ✅ Microtarefa 1 — `EmptyState`/`ErrorState` migrados para `shared/`; `LoadingState` mantido local (adiado — dependência de layout, ver Microtarefas abaixo) |
| `src/app/admin/ingredientes/categorias/page.tsx` | ✅ Microtarefa 2 — `EmptyState`/`ErrorState`/`Field`/`SearchBar`/`ConfirmDialog`/`EntityForm` migrados para `shared/`; `LoadingState`/`CategoryRow` mantidos locais (adiados) |
| `src/app/admin/receitas/[id]/page.tsx` | ✅ Microtarefa 3 — `ErrorState`/`StatusBadge` migrados para `shared/`; `LoadingState` mantido local (adiado) |
| `DESIGN_SYSTEM.md` Seção 21 | ✅ Atualizada na Microtarefa 4 — objetivo, restrições de `StatusBadge`/`LoadingState`/`EntityCard` e Sumário refletem o estado real migrado |
| `UX_GUIDELINES.md` | 🔲 Pendente — nenhuma menção aos componentes compartilhados; fora do escopo declarado da Microtarefa 4, registrado como Melhoria Futura |
| `MODULE_G8_CLOSURE.md` | ✅ Criado na Microtarefa 3, revisado na Microtarefa 4 — Cartografia de Compatibilidade com taxonomia de 5 categorias e coluna "Pré-requisitos" |
| Validação (Playwright ou manual) das 3 páginas | ✅ Executada na Microtarefa 4 — `tsc --noEmit`, `npm run lint`, `npm run build` (0 erros) + smoke test funcional via Playwright MCP nas 3 páginas migradas, servidor de desenvolvimento local, login admin real |

### Microtarefas 1–3 — componentes migrados e adiados

| MT | Página | Migrados para `shared/` | Adiados (mantidos locais) | Motivo do adiamento |
|----|--------|--------------------------|----------------------------|----------------------|
| MT-1 | `unidades/conversoes/page.tsx` | `EmptyState`, `ErrorState` | `LoadingState`, `Field`, `ConversionCard`, `ConversionModal`, `ConfirmModal` | Página usa container `max-w-app` (legado); `LoadingState` compartilhado força grid `md:grid-cols-2 xl:grid-cols-3`, incompatível fora de `PageContainer` (`max-w-5xl`) |
| MT-2 | `ingredientes/categorias/page.tsx` | `EmptyState`, `ErrorState` (pré-existentes), `Field`, `SearchBar`, `ConfirmDialog`, `EntityForm` (nesta microtarefa) | `LoadingState`, `CategoryRow` | `LoadingState`: mesma incompatibilidade de grid/container do MT-1. `CategoryRow`→`EntityCard`: paradigma de apresentação distinto (linha horizontal vs. card empilhado título/ações) |
| MT-3 | `receitas/[id]/page.tsx` | `ErrorState`, `StatusBadge` (com `activeLabel="Ativa" inactiveLabel="Inativa"`, mesmo padrão já usado em `receitas/page.tsx`) | `LoadingState` | Mesma incompatibilidade de grid/container do MT-1/MT-2; skeleton local também reflete a heterogeneidade real da página (1 card de resumo + N cards de item), não representável pelo `count` homogêneo do componente compartilhado |

Nenhum componente de `shared/` foi alterado ou adaptado exclusivamente para um módulo em nenhuma das 3 microtarefas — toda migração usou capacidades genéricas já existentes desde a Sprint 2.E.7.

### Microtarefa 4 — Consolidação e Homologação

**Documentação:**
- `DESIGN_SYSTEM.md` Seção 21: parágrafo de objetivo atualizado (removida a frase desatualizada sobre adoção futura); restrições de `StatusBadge`, `LoadingState` e `EntityCard` passaram a referenciar a classificação da Cartografia de Compatibilidade; linha 21 do Sumário atualizada.
- `MODULE_G8_CLOSURE.md`: Cartografia de Compatibilidade revisada — adicionada coluna "Pré-requisitos"; taxonomia expandida de 2 para 5 categorias (`Reutilização Universal`, `Reutilização Condicional`, `Dependente de Evolução de Layout`, `Dependente do Modelo de Interface`, `Dependente de Evolução do Design System`); `StatusBadge` reclassificado de "Reutilização Universal — restrita" para "Reutilização Condicional" (pré-requisito da entidade, não da página); `EntityCard` reclassificado de "Dependente de Evolução de Layout" para "Dependente do Modelo de Interface" (categoria nova, separada de `LoadingState` — o bloqueio de `EntityCard` é o paradigma de apresentação do item, não o container/grid da página).

**Validação final:**
| Verificação | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/avisos |
| `npm run build` | ✅ 38 rotas geradas, 0 erros |
| Smoke test Playwright (servidor de dev local, login admin real) — `/admin/unidades/conversoes` | ✅ Lista carrega, `SearchBar` compartilhado renderiza, 0 erros de console, todas requisições 200 |
| Smoke test Playwright — `/admin/ingredientes/categorias` | ✅ Lista carrega, modal `EntityForm` compartilhado abre com foco automático no campo "Nome" e fecha corretamente, 0 erros de console, requisições 200 |
| Smoke test Playwright — `/admin/receitas/[id]` | ✅ Testado em receita ativa e inativa — `StatusBadge` compartilhado exibe "Ativa"/"Inativa" corretamente nos dois casos, 0 erros de console, requisições 200 |

Nenhuma requisição 4xx/5xx inesperada e nenhum elemento visual quebrado observado nos 3 smoke tests. Servidor de desenvolvimento usado exclusivamente para a validação, encerrado ao final.

**Achado pré-existente confirmado durante o smoke test (não corrigido, fora do escopo):** `/admin/unidades/conversoes` exibe "2 conversãoões" — bug de pluralização já registrado em memória de sessões anteriores, não relacionado a esta migração.

### Achado fora do escopo declarado — registrado, não corrigido

`src/app/admin/categorias/page.tsx` (2.B) e `src/app/admin/ocasioes/page.tsx` (2.C) também têm `StatusBadge`/`LoadingState`/`EmptyState`/`ErrorState` duplicados localmente, com o mesmo padrão de duplicação que a Sprint G.8 combate. Nenhuma correção aplicada — esses dois módulos não estão no escopo declarado da Ordem de Missão (Unidades/Ingredientes/Receitas/Produtos). Registrado como Melhoria Futura.

### Confirmações de escopo

| Item | Status |
|------|--------|
| Backend alterado | ❌ Não |
| Regra de negócio alterada | ❌ Não |
| Componente novo criado em `shared/` | ❌ Não — reaproveita os componentes já existentes |
| Sprint registrada em `PLAN.md`/`CHANGELOG.md` | ✅ Sim (esta entrada) |
| Migração completa dos 4 módulos | 🟡 Parcial (por decisão técnica, não pendência) — 4 páginas principais + 3 sub-páginas migradas nas partes classificadas como seguras; `LoadingState` (e, em `ingredientes/categorias`, `EntityCard`) adiados por dependência documentada na Cartografia de Compatibilidade |
| Documentação (`DESIGN_SYSTEM.md`) atualizada | ✅ Sim (Microtarefa 4) |
| Documentação (`UX_GUIDELINES.md`) atualizada | ❌ Não — fora do escopo declarado, registrado como Melhoria Futura |
| `MODULE_G8_CLOSURE.md` criado e revisado | ✅ Sim (Microtarefas 3 e 4) |
| Validação executada | ✅ `tsc`/`lint`/`build` (0 erros) + smoke test Playwright funcional nas 3 páginas migradas |

### Relatório Final da Sprint G.8

**Resumo:** 4 microtarefas concluídas. Migração de `EmptyState`/`ErrorState`/`Field`/`SearchBar`/`ConfirmDialog`/`EntityForm`/`StatusBadge` (conforme aplicável a cada página) para `src/components/admin/shared/` em `unidades/conversoes/page.tsx`, `ingredientes/categorias/page.tsx` e `receitas/[id]/page.tsx`. `LoadingState` e `EntityCard` adiados nas 3 páginas por dependência documentada (container/grid ou paradigma de apresentação do item) — decisão técnica registrada, não pendência de execução. Nenhum componente compartilhado foi alterado ou criado especificamente para um módulo. Nenhuma camada de backend, regra de negócio ou API alterada em nenhuma das 4 microtarefas.

**Documentos produzidos/atualizados nesta sprint:** `CHANGELOG.md` (esta entrada), `PLAN.md`, `DESIGN_SYSTEM.md` (Seção 21), `MODULE_G8_CLOSURE.md` (novo).

**Pendência remanescente (não bloqueante, registrada como Melhoria Futura):** `UX_GUIDELINES.md` sem menção aos componentes compartilhados; `src/app/admin/categorias/page.tsx` e `src/app/admin/ocasioes/page.tsx` com a mesma duplicação de componentes locais, fora do escopo desta sprint; decisão sobre migrar ou não `unidades/conversoes`/`ingredientes/categorias`/`receitas/[id]` para `PageContainer`/`ResponsiveGrid` (desbloquearia `LoadingState`/`EntityCard`) permanece em aberto, sem prazo definido.

**Aceite do Product Owner (20/07/2026):** Sprint G.8 concluída, aprovada, homologada e encerrada.

---

## [Sprint 2.E.7] — 2026-07-18 — UX/UI Implementation & Shared Components — Fornecedores

**Tipo:** Implementação de Frontend + Consolidação do Design System. Nenhuma camada de backend (Repository/Validator/Service/API/Schema/Banco/Seeds) alterada.

### Adicionado

**12 componentes compartilhados em `src/components/admin/shared/`** (novo diretório, primeiro do Design System para módulos de Cadastro Mestre): `PageContainer`, `ResponsiveGrid`, `StatCard`, `SearchBar`, `StatusBadge`, `LoadingState`, `ErrorState`, `EmptyState`, `FilterChips`, `ConfirmDialog`, `EntityCard`, `EntityForm`. Documentados em `DESIGN_SYSTEM.md` (nova Seção 21) com objetivo/responsabilidade/propriedades/casos de uso/restrições de cada um.

`src/components/admin/config/FormPrimitives.tsx` — `Field` ganhou suporte a `htmlFor` (extensão retrocompatível, sem quebrar o uso existente em Config).

### Alterado

`src/app/admin/fornecedores/page.tsx` — reescrito integralmente sobre os componentes compartilhados: container `max-w-5xl` (era `max-w-app`), grid responsivo 1/2/3 colunas (era pilha única), faixa de estatísticas Total/Ativos/Inativos (novo), formulário agrupado em `Section` (Identificação/Contato/Operação/Observações), modal `EntityForm` responsivo (bottom-sheet mobile / centralizado desktop, conforme `DESIGN_SYSTEM.md` #7, nunca implementado antes em nenhum módulo), trap de foco + fechamento por `Escape` (idem).

### Validações técnicas

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/warnings |
| `npm run build` | ✅ Sucesso |
| Playwright — Desktop (1440px) | ✅ Uso de largura 33% → 71% (medido, igual ao módulo Config); grid 3 colunas |
| Playwright — Tablet (820px) | ✅ Grid 2 colunas |
| Playwright — Smartphone (390px) | ✅ Grid 1 coluna; modal em bottom-sheet |
| Playwright — CRUD completo | ✅ Criação, edição, ativação, desativação, pesquisa, estatísticas em tempo real — 0 erros de console em toda a sessão |
| Playwright — Rede | ✅ 100% das chamadas 200/201, nenhum 4xx/5xx inesperado |
| Acessibilidade | ✅ Foco automático no primeiro campo; trap de foco confirmado (Tab no último elemento volta ao primeiro); `Escape` fecha modal; `aria-label` em todos os botões de ação; `role="dialog"`/`aria-modal` presentes |

### Comparação objetiva com a Sprint 2.E.6 (aderência ao wireframe aprovado)

Nenhuma divergência — layout, agrupamento de campos, grid responsivo e faixa de estatísticas implementados exatamente conforme `MODULE_2E_UX_REVIEW.md`. Duas pequenas decisões de implementação, dentro do espírito já aprovado (não são reinterpretação de UX): `EntityForm` usa `max-w-lg` em vez de `max-w-md` (documentado como desvio pequeno na Seção 21 de `DESIGN_SYSTEM.md`); botões do `ConfirmDialog` de desativação usam "Manter ativo"/"Desativar" (texto exato já prescrito por `UX_GUIDELINES.md` Seção 6, não usado literalmente na Sprint 2.E.5).

### Documentação

`DESIGN_SYSTEM.md` (nova Seção 21 + linha no sumário), `MODULE_2E_CLOSURE.md` (novo — encerra oficialmente o Módulo 2.E, Sprints 2.E.1–2.E.7), `PLAN.md`, este `CHANGELOG.md`. Novos itens de Backlog Técnico: TD-19 (aplicar `max-w-5xl`+grid aos outros 4 módulos), TD-20 (padronizar confirmação de desativação em Ingredientes/Receitas).

### Autoauditoria

| Item | Confirmação |
|---|---|
| Camada Backend alterada | ❌ Não |
| Regra de negócio alterada | ❌ Não |
| Componente exclusivo de Fornecedores criado sem justificativa | ❌ Não — todos os 12 nascem em `shared/`, com ganho de duplicação documentado |
| Componente duplicado | ❌ Não — `Field`/`Section` reaproveitados de `FormPrimitives.tsx`, não recriados |
| Design System atualizado | ✅ Sim |

### Confirmação explícita

- Layout implementado conforme a Sprint 2.E.6? **✅ Sim**
- Design System atualizado? **✅ Sim**
- Componentes compartilhados criados? **✅ Sim (12)**
- Nenhuma regra de negócio alterada? **✅ Confirmado**
- Módulo pronto para Product Owner Review? **✅ Sim**

---

## [Sprint 2.E.6] — 2026-07-18 — UX/UI Foundation — Fornecedores

**Tipo:** Arquitetura de Interface + UX + Design System + Protótipo — nenhum código de Frontend definitivo, Repository, Service, Validator, API, Schema ou banco alterado nesta sprint.

### Correção de numeração (registrada durante a implementação)

A Ordem de Missão chegou identificada como "Sprint 2.E.5", mas esse número já estava ocupado pelo Frontend Inicial entregue e aprovado nesta mesma sessão (Sprint 2.E.5 — Frontend, ver entrada abaixo). Por decisão do Product Owner: histórico das Sprints 2.E.1–2.E.5 preservado integralmente sem alteração retroativa; esta Ordem de Missão passou a ser **Sprint 2.E.6 — UX/UI Foundation**; a implementação do redesign (originalmente chamada de "2.E.6" na Ordem de Missão) passou a ser **Sprint 2.E.7 — UX/UI Implementation**.

### Contexto

Registrada na Sprint 2.J.2.1 uma insatisfação do Product Owner com a qualidade visual das telas existentes. Decisão histórica: estabilizar infraestrutura primeiro (Sprints I.1–I.3), depois redesenhar. Esta sprint inicia formalmente essa evolução, usando Fornecedores como piloto.

### Produzido

`MODULE_2E_UX_REVIEW.md` (novo) — diagnóstico completo, com evidência real (Playwright, `getBoundingClientRect`, 3 larguras de viewport), dos 5 módulos de Cadastro Mestre (Unidades, Ingredientes, Receitas, Produtos, Fornecedores):

- **Achado principal, quantificado:** as 5 páginas usam `max-w-app` (480px) em vez de `max-w-5xl` — apenas **33% da largura** aproveitada em desktop (1440px), contra **71%** já atingido pelo módulo Config (`max-w-5xl`), que segue corretamente a regra já documentada em `DESIGN_SYSTEM.md` desde a Sprint P2.
- **Achado de duplicação:** 6 componentes (`Field`, `StatusBadge`, `LoadingState`, `EmptyState`, `ErrorState`, `FilterChips`) redeclarados de forma idêntica em 5 arquivos; `Field`/`Section` compartilhados já existem em `FormPrimitives.tsx` mas não são reaproveitados por nenhum dos 5 módulos.
- **Achado de inconsistência:** confirmação de desativação presente em Unidades/Produtos/Fornecedores, ausente em Ingredientes/Receitas — sem regra documentada que decida qual comportamento é o correto.
- **Proposta adotada:** manter Cards (não introduzir Tabela — decisão de maior porte que afeta todo o Design System, fora do escopo de um módulo piloto), corrigir o container para `max-w-5xl`, grid responsivo (1/2/3 colunas), formulário agrupado em `Section` (Identificação/Contato/Operação/Observações), faixa de estatísticas (Total/Ativos/Inativos), 8 componentes promovidos para `src/components/admin/shared/` (novo diretório, Design System oficial).
- **Experience Review:** número de cliques não muda (fluxo já enxuto desde a Sprint 2.E.5); o ganho real é densidade de informação (~3x menos scroll projetado) e consistência (bug corrigido uma vez, não em 5 lugares).

### Autoauditoria

| Item | Confirmação |
|---|---|
| Frontend definitivo alterado | ❌ Não — apenas leitura e navegação diagnóstica |
| Repository/Service/Validator/API/Schema alterados | ❌ Não |
| Componente novo exclusivo de Fornecedores criado | ❌ Não — todos os 8 componentes propostos nascem para `src/components/admin/shared/`, reutilizáveis pelos outros 4 módulos |

### Próximo passo

Sprint 2.E.7 (UX/UI Implementation) — aguardando aprovação desta especificação pelo Product Owner.

---

## [Sprint 2.E.5] — 2026-07-18 — Frontend — Fornecedores

**Tipo:** Frontend — camada final do Módulo 2.E, sobre a API da Sprint 2.E.4. Padrão de paginação server-side reaproveitado de `Products` (2.J), padrão de card/modal/confirmação reaproveitado de `Units` (2.D) — ambos módulos homologados.

### Adicionado

- `src/lib/api/supplierApi.ts` — cliente HTTP (`listSuppliersPaged`, `getSupplier`, `createSupplier`, `updateSupplier`, `activateSupplier`, `deactivateSupplier`), mesmo formato de `productApi.ts`/`unitApi.ts`.
- `src/app/admin/fornecedores/page.tsx` — listagem paginada server-side (busca com debounce ~300ms, filtro de status, ordenação por nome/data), modal de criação/edição, confirmação antes de desativar, activate direto. Máscaras de CNPJ (`maskCNPJ`) e telefone (`maskPhone`) reaproveitadas de `src/lib/formatters/` — nenhuma máscara nova criada.
- `src/app/admin/page.tsx` — novo item "🏭 Fornecedores" no hub administrativo (ícone conforme `MENU_STRUCTURE.md`), apontando para `/admin/fornecedores`.

Nenhuma rota `DELETE`/exclusão física na UI — só Ativar/Desativar, mesmo padrão de Unidades.

### Validações técnicas

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/warnings |
| `npm run build` | ✅ Sucesso — `/admin/fornecedores` compilada |
| Validação manual real (Playwright, servidor de desenvolvimento limpo, banco Supabase real) | ✅ Cadastro com máscara de CNPJ/telefone ao vivo; validação client-side (nome vazio); duplicidade de CNPJ tratada com mensagem inline + toast; pesquisa server-side; edição com persistência confirmada; desativação com confirmação; ativação; link no hub administrativo confirmado — 0 erros de console inesperados em todo o fluxo |

### Autoauditoria

| Item | Confirmação |
|---|---|
| Padrão de resposta/paginação/erro específico para Fornecedores | ❌ Não — 100% reaproveitado de Products (paginação) e Units (card/modal/confirmação) |
| Nova máscara de CNPJ/telefone criada | ❌ Não — reaproveitadas de `src/lib/formatters/` |
| Chamada direta a Service/Repository no Frontend | ❌ Não — só via `supplierApi.ts` → API |

### Situação do módulo

Módulo 2.E (Fornecedores) com todas as camadas concluídas: Schema (2.E.1) → Repository+Validator (2.E.2) → Service (2.E.3) → API (2.E.4) → Frontend (2.E.5).

---

## [Sprint 2.E.4] — 2026-07-18 — API REST — Fornecedores

**Tipo:** API — camada única, sobre o Service da Sprint 2.E.3. Padrão 100% reaproveitado de `Products`/`Units` (Diretriz 1 da Ordem de Missão).

### Correção da Ordem de Missão (registrada durante a implementação)

A Ordem de Missão previa `SupplierValidationFailedError → HTTP 422`. Durante a implementação foi identificado que **nenhum módulo já homologado** (`Products`, `Units`, `Ingredients`, `Recipes`) usa 422 — todos usam `badRequest()` → HTTP 400, e `src/lib/http/responses.ts` não tem (nem ganhou) um helper 422. Em conformidade com a instrução explícita do Product Owner nesta sessão ("em caso de conflito entre a Ordem de Missão e um padrão arquitetural já homologado, deve prevalecer o padrão arquitetural existente"), prevaleceu o padrão consolidado: **400**, via `badRequest()` já existente. Nenhum helper novo foi criado em `responses.ts`. A Ordem de Missão deve ser corrigida para refletir 400 como o código oficial de `VALIDATION_ERROR` em todo o projeto.

### Adicionado

- `src/app/api/admin/suppliers/route.ts` — `GET` (listagem paginada: `page`, `pageSize`, `search`, `active`, `orderBy` [`name`|`createdAt`], `orderDirection`) + `POST` (criação)
- `src/app/api/admin/suppliers/[id]/route.ts` — `GET` (por id) + `PATCH` (atualização)
- `src/app/api/admin/suppliers/[id]/activate/route.ts` — `PATCH`
- `src/app/api/admin/suppliers/[id]/deactivate/route.ts` — `PATCH`

Nenhuma rota `DELETE` — mesmo padrão de `Units` (sem exclusão física, só `active` via activate/deactivate; `supplierService.ts` não tem `deleteSupplier`).

### Mapeamento de erros do domínio (Service → HTTP)

| Erro do Service | HTTP | Código |
|---|---|---|
| `SupplierValidationFailedError` | 400 | `VALIDATION_ERROR` |
| `DuplicateCnpjError` | 409 | `DUPLICATE_CNPJ` |
| `SupplierNotFoundError` | 404 | `NOT_FOUND` |
| Qualquer erro não mapeado | 500 | `INTERNAL_ERROR` (mensagem genérica, sem detalhes internos) |

Controller fino em todas as rotas: `requireAdmin()` → parse do body → Service → `responses.ts`. Nenhuma chamada direta ao Repository.

### Validações técnicas

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/warnings |
| `npm run build` | ✅ Sucesso — 4 rotas de `/api/admin/suppliers` compiladas |
| Testes HTTP reais (Playwright, sessão admin autenticada, servidor de desenvolvimento limpo) | ✅ 9/9 casos, incluindo os exigidos pela Diretriz 5: criação válida (201), CNPJ duplicado (409), parâmetros inválidos (400), fornecedor inexistente (404), atualização mantendo o mesmo CNPJ sem falso conflito (200), listagem paginada+busca (200), activate/deactivate (200) |
| Teste de erro inesperado (500) | ✅ `leadTimeDays` acima do limite de `integer` do Postgres disparou erro real não mapeado → 500 genérico, sem stack trace nem mensagem do Postgres exposta |

### Achado registrado, não corrigido (Melhoria Futura)

O Validator (`supplierValidator.ts`, Sprint 2.E.2) verifica que `leadTimeDays` é inteiro ≥ 0, mas não tem limite superior — um valor absurdo (ex. `99999999999`) passa pela validação e só falha no banco (overflow de `integer` do Postgres), gerando um 500 em vez de um 400. Não corrigido nesta sprint (fora do escopo da API); registrado para uma futura revisão do Validator.

### Autoauditoria

| Item | Confirmação |
|---|---|
| Chamada direta ao Repository na API | ❌ Não |
| Regra de negócio duplicada na API | ❌ Não — API só traduz exceções do Service para HTTP |
| Novo helper/padrão de resposta criado só para Fornecedores | ❌ Não — 100% reaproveitado de `Products`/`Units` |
| `responses.ts` alterado | ❌ Não |

### Próximo passo sugerido

Sprint 2.E.5 (Frontend) — aguardando autorização explícita.

---

## [Sprint 2.E.3] — 2026-07-18 — Service — Fornecedores

**Tipo:** Service — camada única, sobre Repository + Validator da Sprint 2.E.2.

### Adicionado

`src/lib/supplierService.ts`:

- **Erros de domínio:** `SupplierNotFoundError`, `SupplierValidationFailedError`, `DuplicateCnpjError` — mesmo padrão de `unitService.ts`/`productService.ts`.
- **Mapeamento:** `SupplierDTO` (Prisma → domínio, `createdAt`/`updatedAt` convertidos para ISO string).
- **Normalização:** CNPJ e telefone persistidos sem máscara (só dígitos) — mesmo padrão já adotado em `storeConfigService.ts`.
- **`validateBusinessRules(input, excludeId?)`:** único ponto de checagem de duplicidade de CNPJ (consulta ao banco via `findSupplierByCnpj`) — exportada nominalmente conforme pedido na Ordem de Missão.
- **Leitura:** `getSupplierById`, `listSuppliers` (delega paginação/busca/filtro/ordenação ao Repository).
- **Criação/Atualização:** `createSupplier`, `updateSupplier` — fluxo: trim/normalização → Validator → `validateBusinessRules` (só quando o CNPJ muda, no update) → Repository → DTO.
- **Ciclo de vida:** `activateSupplier`, `deactivateSupplier`.

### Validações técnicas

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/warnings |
| Smoke test do Service contra o Supabase real (15 casos, script descartável) | ✅ Todos os 15 passaram na primeira execução: trim/normalização de CNPJ e telefone, `createdAt` como ISO string, duplicidade de CNPJ na criação e na atualização (inclusive sem falso positivo ao manter o mesmo CNPJ), `SupplierNotFoundError`/`SupplierValidationFailedError`, activate/deactivate, `listSuppliers` com busca+filtro+paginação |

### Autoauditoria (critérios da Ordem de Missão)

| Item | Confirmação |
|---|---|
| Toda regra de negócio exclusivamente no Service | ✅ Duplicidade de CNPJ e normalização só existem em `supplierService.ts` |
| Repository permanece só persistência | ✅ `supplierRepository.ts` não foi alterado nesta sprint |
| Validator permanece só validação estrutural | ✅ `supplierValidator.ts` não foi alterado nesta sprint; Service não repete nenhuma checagem de formato |
| Nenhuma regra duplicada entre camadas | ✅ Confirmado por leitura — Service chama o Validator uma única vez, sem reimplementar nenhuma regra de formato |
| Regra implementada no Repository | ❌ Não |
| Regra implementada na API | ❌ Não — nenhum arquivo de API criado nesta sprint |
| Regra implementada no Frontend | ❌ Não — nenhum arquivo de Frontend criado nesta sprint |
| Dependência circular | ❌ Não — `supplierService.ts` importa de `supplierValidator.ts`/`supplierRepository.ts`; nenhum dos dois importa de volta |
| SQL, Prisma fora do Repository, código HTTP, Request/Response, UI no Service | ❌ Nenhum presente |

### Próximo passo sugerido

Sprint 2.E.4 (API) — aguardando autorização explícita.

---

## [Sprint 2.E.2] — 2026-07-18 — Repository + Validator — Fornecedores

**Tipo:** Repository + Validator — camadas únicas, sobre o schema `Supplier` da Sprint 2.E.1.

### Correção da Ordem de Missão (registrada durante a implementação)

A Ordem de Missão da Sprint 2.E.2 pedia validação de "formato do e-mail (quando informado)" no Validator. Durante a implementação foi identificado que a validação de formato de e-mail não se aplica ao modelo `Supplier` aprovado na Sprint 2.E.1 — esse modelo não possui campo `email` (campos: `id, name, phone, cnpj, leadTimeDays, notes, active, createdAt, updatedAt`; nenhuma fonte consultada na auditoria da Sprint 2.E.1 documentava `email` como campo do fornecedor). A regra foi removida do escopo desta Sprint por inconsistência documental entre a Ordem de Missão e o Schema aprovado, não por omissão de implementação — decisão confirmada pelo Product Owner nesta sessão. `Supplier.email` não foi adicionado ao schema (não reabre a Sprint 2.E.1); se aprovado no futuro, entra por uma Sprint de evolução de Schema dedicada, seguida da atualização das demais camadas.

### Adicionado

- `src/lib/validators/supplierValidator.ts` — `SupplierInput`, `validateSupplierCreate`, `validateSupplierUpdate` (padrão `ValidationError[]`, mesmo formato de `ingredientValidator.ts`). Validações: nome obrigatório (2–150 caracteres); CNPJ formato 14 dígitos quando informado (mesmo critério de `storeConfig.ts`, sem dígito verificador); telefone 10–11 dígitos quando informado; `leadTimeDays` inteiro ≥ 0 quando informado; `notes` até 500 caracteres. Duplicidade de CNPJ **não** verificada aqui — fica na camada de Service (próxima sprint), conforme a arquitetura do projeto (Validator só valida sintaxe/consistência, existência no banco é responsabilidade do Service).
- `src/lib/repositories/supplierRepository.ts` — `findSupplierById`, `findSupplierByCnpj`, `listSuppliersPaged` (paginação + pesquisa por nome + filtro por `active` + ordenação por `name`/`createdAt`), `createSupplier`, `updateSupplier`, `activateSupplier`, `deactivateSupplier`. Sem `$queryRaw`/`$executeRaw`/SQL manual — só Prisma Client tipado.

### Nomenclatura: "soft delete" e "restore"

O projeto não usa `deletedAt`/restore — o padrão consolidado (`Unit`, `Ingredient`, `Recipe`, `Product`) é o campo `active: Boolean` alternado via `activate`/`deactivate`. `Supplier` segue o mesmo padrão: `deactivateSupplier` (soft delete) e `activateSupplier` (equivalente a "restore" pedido na Ordem de Missão).

### Validações técnicas

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/warnings |
| Smoke test do Repository contra o Supabase real (script descartável) | ✅ create, findById, findByCnpj, update, search+filtro, deactivate, activate, e unicidade de CNPJ bloqueada pelo banco (`P2002`) — todos confirmados, dados de teste removidos ao final |
| Smoke test do Validator real (13 casos, script descartável) | ✅ Todos os 13 casos passaram após correção de um erro no próprio script de teste (nome de 1 caractere usado por engano, não bug do Validator) |

### Autoauditoria

| Item | Confirmação |
|---|---|
| Schema alterado | ❌ Não — Sprint 2.E.1 não reaberta |
| Service/API/Frontend alterados | ❌ Não — escopo desta sprint é só Repository + Validator |
| `email` adicionado ao Supplier | ❌ Não — ver correção da Ordem de Missão acima |

### Próximo passo sugerido

Sprint 2.E.3 (Service) — aguardando autorização explícita.

---

## [Sprint 2.E.1] — 2026-07-18 — Schema — Fornecedores

**Tipo:** Schema — camada única (Módulo de Correção/Cadastro Mestre, mesmo padrão de isolamento por camada de 2.A/2.D/2.G/2.I).

### Contexto

Auditoria prévia (nesta mesma sessão) confirmou que não existia entidade `Supplier` no schema — apenas `Ingredient.supplier: String?` (texto livre), lacuna já registrada em `REGRAS_NEGOCIO.md` (Seções 3.17/7.4, item #9 da tabela de gaps) e em `DOMAIN_MODEL.md`/`MODULES.md`/`VISION.md` como "A definir"/"Planejado". Decisões de modelagem revisadas e aprovadas explicitamente pelo Product Owner nesta sessão.

### Adicionado

- `model Supplier` em `prisma/schema.prisma`: `id` (CUID, ADR-005), `name`, `phone?`, `cnpj?` (único quando informado), `leadTimeDays?` (mesmo padrão de `Product.leadTimeDays`), `notes?` (condições de pagamento/mínimo de compra — texto livre, conforme `VISION.md` Módulo 6), `active` (soft delete, padrão consolidado do projeto), `createdAt`/`updatedAt`.

### Decisões arquiteturais desta sprint (aprovadas pelo Product Owner)

- Sem campos fiscais além de CNPJ (razão social/inscrição estadual não documentados em nenhuma fonte; ficam para quando o módulo de Compras exigir de fato).
- Sem classificação/rating de fornecedor (`VISION.md` marca "avaliação de fornecedores" como funcionalidade futura, não atual).
- Sem campo de categoria/tipo de fornecimento armazenado — será inferido pelas relações reais (`Ingredient`/`Packaging` vinculados) quando essas migrações existirem, evitando duplicar verdade.
- **Sem relacionamento com `Ingredient` ou `Packaging` nesta sprint.** `Supplier` nasce como entidade isolada. A migração de `Ingredient.supplier` (texto) para FK real fica para uma Sprint dedicada e autorizada separadamente — não reabre o Módulo 2.G, já encerrado (Sprint I.3), sem Ordem de Missão específica.

### Validações técnicas

| Comando | Resultado |
|---|---|
| `npx prisma validate` | ✅ Schema válido |
| `npx prisma db push` | ✅ Aplicado ao Supabase real |
| `npx prisma generate` | ✅ Sucesso |
| Introspecção direta (`information_schema.columns`) | ✅ 9 colunas confirmadas, exatamente como modelado; 0 linhas (sem seed nesta sprint) |
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/warnings |

### Autoauditoria

| Item | Confirmação |
|---|---|
| Repository/Validator/Service/API/Frontend alterados | ❌ Não — escopo desta sprint é só Schema |
| `Ingredient` ou outro model existente alterado | ❌ Não |
| Módulo 2.G reaberto | ❌ Não |

### Próximo passo sugerido

Sprint 2.E.2 (Repository + Validator) — aguardando autorização explícita, conforme fluxo de camada única por sprint.

---

## [Sprint I.3] — 2026-07-17 — Functional Revalidation & Closure

**Tipo:** Validação Funcional + Consolidação + Documentação — nenhuma funcionalidade nova, nenhuma regra de negócio alterada, nenhum banco de dados/Schema Prisma/API alterados. Continuação das Sprints I.1/I.2.

### Objetivo

Consolidar oficialmente os módulos 2.D, 2.G, 2.I e 2.J impactados pelas Sprints I.1/I.2, executando nova validação funcional em ambiente sincronizado e encerrando formalmente as pendências históricas de infraestrutura.

### Etapa 1 — Validação funcional por módulo (Playwright, servidor de desenvolvimento limpo, banco Supabase real)

| Módulo | Validado |
|---|---|
| **2.D** (Unidades) | Cadastro, edição, desativação de `UnitOfMeasure`; cadastro/exclusão física de `UnitConversion`; pesquisa; filtros de status/tipo; validação de nome duplicado ("Já existe uma unidade com o nome..."); persistência confirmada por reload |
| **2.G** (Ingredientes) | Cadastro, edição (com `IngredientPriceHistory`), desativação de `Ingredient`; cadastro/exclusão de `IngredientCategory` (com bloqueio de categoria vinculada); pesquisa; filtros de status/categoria; validação client-side de campos obrigatórios |
| **2.I** (Receitas) | Cadastro de receita com item inicial; adição/edição/remoção de item com recálculo automático; bloqueio de remoção do último item; bloqueio de ingrediente duplicado (`DUPLICATE_INGREDIENT`); ativação/desativação; pesquisa; filtro de status |
| **2.J** (Produtos) | Cadastro com RecipeLinker (vínculo `ProductRecipe`); custo/margem calculados corretamente; pesquisa server-side; exclusão física; máscara de moeda BRL |

Todos os registros de teste foram removidos (exclusão física) ou desativados (quando o modelo não suporta exclusão) ao final de cada validação, sem alterar o dataset oficial da Sprint I.2.

### Achado de ambiente durante a validação (não é bug de código)

Ao testar a edição de `UnitOfMeasure` pela primeira vez, a API retornou `500 Internal Server Error` de forma reproduzível (2 tentativas). Investigação: o dev server em uso (PID herdado de uma tarefa anterior desta mesma sessão, cujo `TaskStop` não finalizou o processo do sistema operacional) apresentava esse erro; um script Node isolado executando a mesma chamada Prisma diretamente teve sucesso. Servidor de desenvolvimento reiniciado do zero — a mesma edição, através da mesma API, passou a funcionar sem erro e permaneceu consistente pelo resto da sessão. Causa raiz: artefato de processo órfão do ambiente de teste, não do código do módulo. Nenhuma alteração de código foi necessária.

### Etapa 2 — Validação de integração (Unidade → Ingrediente → Receita → Produto)

Fluxo completo confirmado com dados reais: unidade "Grama" usada por um ingrediente novo → ingrediente usado em uma receita nova → receita vinculada a um produto novo via `ProductRecipe` → `costPrice` do produto calculado corretamente (R$ 18,53, margem 63% sobre preço de R$ 50,00).

### Etapa 3 — Validação dos cálculos e atualização automática

Alterado o preço real de "Farinha de Trigo" (`Ingredient`, seed da Sprint I.2) de R$ 6,50/kg para R$ 7,00/kg: o custo da receita "Massa de Chocolate Básica" atualizou automaticamente de R$ 18,53 para R$ 18,78 (delta exato: +R$ 0,25 = 0,5 kg × R$ 0,50), e o custo do produto "Bolo Chocolate 25cm" (vinculado via `ProductRecipe`) acompanhou a mesma atualização — sem nenhuma ação manual de recálculo. Preço revertido a R$ 6,50/kg ao final, restaurando o baseline da Sprint I.2.

### Etapa 4 — Regressão

`/`, `/admin`, `/admin/categorias`, `/admin/ocasioes` navegados sem novos erros de console. **Achado pré-existente, não é regressão desta sprint**: `src/app/page.tsx` linha 29 (`[ALL_OCCASION, ...OCCASIONS_FALLBACK]`) duplica a chave React `"all"`, porque `OCCASIONS_FALLBACK` (`src/lib/mock-data.ts`) já inclui `{ id: "all", name: "Todos" }` como primeiro item — gera o warning "Encountered two children with the same key" no primeiro render, antes do fetch real de `/api/occasions` substituir o array. Não corrigido (Frontend fora do escopo desta sprint); registrado para correção futura.

### Etapa 5 — Documentação

`MODULE_2D_CLOSURE.md`, `MODULE_2G_CLOSURE.md`, `MODULE_2I_CLOSURE.md` — nova seção "Revalidação funcional (Sprint I.3)" adicionada a cada um. `MODULE_2J_CLOSURE.md` — criado (módulo nunca teve documento de encerramento; QA/Homologação estava pendente desde a Sprint 2.J.2.1).

### Validações técnicas

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/warnings |
| `npm run build` | ✅ Sucesso — todas as rotas compiladas |
| Development Preview (Playwright) | ✅ 4 módulos + integração + cálculos + regressão validados |

### Autoauditoria

| Item | Confirmação |
|---|---|
| Regra de negócio alterada | ❌ Não |
| Repository alterado | ❌ Não |
| Service alterado | ❌ Não |
| Validator alterado | ❌ Não |
| Schema alterado | ❌ Não |
| API alterada | ❌ Não |
| Regressão encontrada | ❌ Não (1 achado de UI pré-existente, não relacionado a esta sprint, registrado acima) |

### Confirmação explícita (critério de sucesso da missão)

- **2.D oficialmente encerrado?** ✅ Sim
- **2.G oficialmente encerrado?** ✅ Sim
- **2.I oficialmente encerrado?** ✅ Sim
- **2.J oficialmente encerrado?** ✅ Sim
- **Projeto apto para retornar ao roadmap funcional?** ✅ Sim — nenhuma pendência técnica relacionada às Sprints I.1/I.2/I.3 remanescente. Credenciais de Storage (`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`) continuam pendentes, já registradas desde a Sprint I.1, fora do escopo desta sprint.

---

## [Sprint I.2] — 2026-07-17 — Regularização de Infraestrutura: Seeds da Cadeia Produtiva

**Tipo:** Infraestrutura — nenhuma regra de negócio alterada, nenhum Frontend alterado. Continuação da Sprint I.1, conforme ADR-012.

### Etapa 1 — `db push` (Frente A)

`npx prisma generate` reexecutado com sucesso (sem o EPERM da Sprint I.1). Introspecção direta do banco Supabase real (`information_schema.columns`, `pg_type`) confirma que `UnitOfMeasure` (colunas `isActive`/`sortOrder`/`updatedAt`, enum `UnitType`) e `UnitConversion` (coluna `updatedAt`) já correspondem a `schema.prisma` — as duas divergências reais registradas na Sprint I.1 não existem mais. `db push` **não foi reexecutado nesta sprint** (evidência confirma que já não é necessário); esta entrada corrige, por observação direta desta sessão, a Etapa 9 da Sprint I.1 quanto ao estado atual do banco.

### Etapa 2 — Seed existente (`npm run db:seed`)

Reexecutado antes de qualquer alteração de código. Resultado: 0 registros novos criados, 0 duplicados — `ProductCategory` (4), `OccasionTag` (6), `Product` (9), `User` (1), `StoreConfig` (1) idênticos antes/depois. Seed idempotente confirmado.

### Etapa 3 — Novo seed da cadeia produtiva

Criado `prisma/seeds/production-chain.ts`, importado e chamado por `prisma/seed.ts` (fluxo oficial `npm run db:seed` — não é script isolado). Idempotente via `upsert` (chaves únicas) ou `findFirst`+`create` (modelos sem `@unique` de negócio — `Ingredient.name`, `Recipe.name`, mesmo padrão já usado para `Product` no seed original).

Dataset mínimo de homologação criado:

| Entidade | Quantidade |
|---|---|
| `UnitOfMeasure` | 5 (Unidade, Quilograma, Grama, Litro, Mililitro) |
| `UnitConversion` | 2 (kg→g fator 1000, l→ml fator 1000) |
| `IngredientCategory` | 2 (Farinhas e Açúcares, Laticínios e Ovos) |
| `Ingredient` | 5 |
| `Recipe` | 1 ("Massa de Chocolate Básica", 5 itens) |
| `ProductRecipe` | 1 (vínculo com o produto existente "Bolo Chocolate 25cm") |

Seed executado duas vezes consecutivas — contagens idênticas nas duas execuções, confirmando idempotência.

### Etapa 4 — Validações técnicas

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/warnings |
| `npm run build` | ✅ Sucesso — todas as rotas compiladas |

### Etapa 5 — Validação manual (Playwright, dados reais)

| Rota | Resultado |
|---|---|
| `/admin/unidades` | ✅ 5 unidades reais listadas |
| `/admin/ingredientes` | ✅ 5 ingredientes reais listados, com categoria e unidade corretas |
| `/admin/receitas` | ✅ 1 receita real listada — custo calculado R$ 18,53 (conferido manualmente: 0,5kg×R$6,50 + 0,4kg×R$5,20 + 0,1kg×R$32 + 0,2kg×R$38 + 3un×R$0,80 = R$18,53) — confirma a conversão de unidade kg→g funcionando em `recipeService.resolveConversionFactor` |
| `/admin/produtos` | ✅ "Bolo Chocolate 25cm" exibe Custo R$ 18,53 / Margem 87%, propagado via `ProductRecipe` — confirma o cálculo de `costPrice` do Módulo 2.J funcionando ponta a ponta com dados reais |

### Autoauditoria

| Item | Confirmação |
|---|---|
| Regra de negócio alterada | ❌ Não |
| Frontend alterado | ❌ Não |
| `db push`/alteração estrutural executada nesta sessão | ❌ Não — já estava sincronizado |
| Dados inseridos no banco compartilhado | ✅ Sim — dataset mínimo de homologação (seeds idempotentes, não dados de demonstração — ver `DEMO_DATASET.md` para o dataset de demonstração propriamente dito) |

---

## [Sprint I.1] — 2026-07-17 — Infrastructure Validation & Database Synchronization

**Tipo:** Infraestrutura + Auditoria Técnica — nenhuma funcionalidade nova, nenhuma regra de negócio alterada, nenhum Frontend alterado, nenhum Design System alterado, nenhuma UX alterada. Nenhuma correção estrutural aplicada ao banco.

### Contexto

Sprint 2.J.2.1 identificou por hipótese uma possível dessincronização entre `schema.prisma` e o banco Supabase real, ao tentar validar o fluxo de Receitas. Esta sprint confirma ou descarta essa hipótese por evidência direta, antes de continuar o roadmap funcional.

### Etapa 1 — Variáveis de ambiente

| Variável | Status |
|---|---|
| `DATABASE_URL` | ✅ OK — presente, aponta para `aws-1-us-east-1.pooler.supabase.com:5432/postgres` (Supavisor, modo sessão — compatível com Prisma) |
| `NEXTAUTH_SECRET` | ✅ OK — presente |
| `NEXTAUTH_URL` | ✅ OK — presente |
| `SUPABASE_URL` | ❌ Ausente no `.env` local |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ Ausente no `.env` local |
| `DIRECT_URL` | ⚪ Não utilizada — não referenciada em `schema.prisma` (datasource não declara `directUrl`) nem em nenhum código |
| `SUPABASE_ANON_KEY` | ⚪ Não utilizada — não referenciada em nenhum código do projeto |
| `SUPABASE_STORAGE_BUCKET` | ⚪ Não utilizada — o bucket (`store-assets`) é uma constante fixa em `src/app/api/admin/upload/route.ts`, não uma variável de ambiente |

### Etapa 2 — Prisma

| Comando | Resultado |
|---|---|
| `npx prisma validate` | ✅ Schema válido |
| `npx prisma generate` | ❌ `EPERM: operation not permitted, rename ... query_engine-windows.dll.node` — falha reproduzida em 3 tentativas. Causa: processo Node ativo (servidor de desenvolvimento) mantém o arquivo do query engine aberto no Windows. Cliente Prisma já gerado anteriormente nesta mesma sessão de trabalho (`node_modules/.prisma/client`, gerado nesta data) permaneceu funcional e foi usado para as etapas seguintes |
| `npx prisma migrate status` | ❌ `No migration found in prisma/migrations` — **não é divergência real**: o projeto nunca adotou `prisma migrate` (confirmado: pasta `prisma/migrations` inexistente, `package.json` só define `db:push`/`db:generate`/`db:seed`/`db:studio`). Fluxo oficial do projeto é `prisma db push`, documentado em `CLAUDE.md` |

### Etapa 3 — Schema × banco físico (evidência: `prisma db pull` para arquivo temporário, comparado a `schema.prisma`)

23 de 23 modelos existem no banco com o mesmo nome. 21 de 23 modelos têm estrutura idêntica à declarada em `schema.prisma`. Duas divergências reais confirmadas:

- **`UnitOfMeasure`**: colunas `isActive`, `sortOrder` e `updatedAt` **não existem** na tabela física. Coluna `type` existe como `text` simples, não como o enum `UnitType` (o enum `UnitType` não existe no banco). Constraint `@unique` em `name` declarada no schema não existe no banco (só `abbreviation` é `UNIQUE` fisicamente).
- **`UnitConversion`**: coluna `updatedAt` **não existe** na tabela física.

Confirmado com erro real em runtime: `prisma.unitOfMeasure.findMany()` executado contra o banco real retorna `The column \`UnitOfMeasure.sortOrder\` does not exist in the current database.` — qualquer código que leia `UnitOfMeasure` com seleção padrão (ex. `unitRepository.ts`, usado por `/admin/unidades`, rota existente e presente no build) falha em runtime contra este banco.

Todos os outros 7 enums do schema (`UserRole`, `DeliveryType`, `PaymentMethod`, `PaymentStatus`, `OrderStatus`, `PriceSource`, `PixKeyType`) existem corretamente como enums nativos no banco. Todos os índices (`@@index`) e constraints únicas (`@@unique`) dos demais 21 modelos foram confirmados presentes e coincidentes.

### Etapa 4 — Migrações

Não aplicável — projeto usa exclusivamente `prisma db push`, nunca `prisma migrate` (ver Etapa 2). Nenhuma migração existe para listar, classificar ou estar corrompida.

### Etapa 5 — Storage / Buckets

Não validável ponta a ponta nesta sessão: `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` ausentes no `.env` local (confirmado também ausentes em `process.env` em runtime, não é só arquivo `.env` incompleto). Consistente com o 503 "Armazenamento não configurado" já registrado na Sprint 2.J.2.1. Bucket esperado (`store-assets`), tipos aceitos (JPEG/PNG/SVG/WebP/ICO) e limites (2 MB / 512 KB para favicon) confirmados por leitura de código em `src/app/api/admin/upload/route.ts` — não exercidos contra o Supabase real por falta de credencial.

### Etapa 6 — Seeds (contagem real no banco Supabase)

| Tabela | Linhas |
|---|---|
| `ProductCategory` | 4 |
| `OccasionTag` | 6 |
| `Product` | 9 |
| `User` | 1 |
| `Customer` | 2 |
| `Order` | 3 |
| `StoreConfig` | 1 |
| `ThemeConfig` | 0 |
| `Recipe` | 0 |
| `RecipeIngredient` | 0 |
| `Ingredient` | 0 |
| `IngredientCategory` | 0 |
| `UnitOfMeasure` | 0 |
| `UnitConversion` | 0 |

`ThemeConfig` com 0 linhas é esperado — módulo `/admin/tema` ainda não implementado, sem consumidor que crie esse registro.

### Etapa 7 — Investigação: por que existem zero receitas

Causa raiz confirmada por evidência, não por hipótese: `prisma/seed.ts` (único seed oficial do projeto, `npm run db:seed`) só popula `ProductCategory`, `OccasionTag`, `Product`, `User` (admin) e `StoreConfig` — nunca populou `UnitOfMeasure`, `Ingredient`, `IngredientCategory`, `Recipe` ou `RecipeIngredient`. Como `Recipe` depende de `RecipeIngredient` → `Ingredient` → `UnitOfMeasure`, e as três últimas tabelas estão vazias no banco real, é estruturalmente impossível existir uma receita real neste ambiente até que dados de Unidades e Ingredientes sejam inseridos (via seed ou via `/admin/unidades` e `/admin/ingredientes`, ambas rotas existentes e presentes no build). Não é falha de validação, migration, upload ou Service.

### Etapa 8 — UnitOfMeasure: isActive/sortOrder/updatedAt

Confirmado definitivamente por introspecção direta do banco (`prisma db pull`) e por erro de runtime reproduzido (`prisma.unitOfMeasure.findMany()`): a tabela física **não possui** `isActive`, `sortOrder` nem `updatedAt`, apesar de `schema.prisma` declará-los desde a Sprint 2.D.1 (documentada como concluída em 15/07/2026). Causa raiz: nenhum `prisma db push` foi executado contra este banco Supabase específico desde que esses campos (e o enum `UnitType`, e `UnitConversion.updatedAt`) foram adicionados ao schema — a validação de fechamento da Sprint 2.I.3 (Receitas) foi registrada como "QA funcional executado (validação por leitura de código de ponta a ponta)", não como execução real contra este banco, o que explica a lacuna não ter sido detectada antes.

### Etapa 9 — Sincronização do Prisma Client

Prisma Client ↔ `schema.prisma`: sincronizados (cliente gerado nesta mesma data reflete o schema atual). `schema.prisma` ↔ banco físico: **não sincronizados** nos dois pontos da Etapa 3.

### Etapa 10 — Classificação das divergências

| # | Divergência | Classificação | Causa raiz |
|---|---|---|---|
| 1 | `UnitOfMeasure` sem `isActive`/`sortOrder`/`updatedAt`; `type` sem enum `UnitType`; `name` sem `UNIQUE` real | **C — Erro de migration** (schema evoluiu, `db push` nunca aplicado a este banco) | Sprint 2.D.1 alterou `schema.prisma`, mas nenhuma sincronização foi executada contra o Supabase real depois disso |
| 2 | `UnitConversion` sem `updatedAt` | **C — Erro de migration** | Mesma causa raiz do item 1 |
| 3 | `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` ausentes | **A — Erro de ambiente** | Credenciais nunca configuradas neste `.env` local (já registrado na Sprint 2.J.2.1) |
| 4 | `UnitOfMeasure`/`Ingredient`/`IngredientCategory`/`Recipe`/`RecipeIngredient` com 0 linhas | **B — Erro de configuração** (seed incompleto) | `prisma/seed.ts` nunca cobriu essas entidades |
| 5 | `npx prisma migrate status` sem migrações | **E — Falso positivo** | Projeto usa `db push` por design, nunca adotou `prisma migrate` |
| 6 | `npx prisma generate` com EPERM | **A — Erro de ambiente** | Processo Node local (servidor de desenvolvimento) mantém o query engine aberto no Windows |

**Nenhuma correção estrutural foi aplicada.** Nenhum `db push` foi executado contra o banco Supabase real — ação de risco contra banco compartilhado, fora do escopo autorizado por esta sprint sem autorização explícita adicional do Product Owner, conforme a própria Ordem de Missão ("Nunca executar db push apenas para 'fazer funcionar'... interromper e solicitar autorização explícita").

### Achado adicional fora do escopo original da missão (registrado, não corrigido)

`CLAUDE.md`, seção "Módulos admin ainda não implementados", lista `Unidades (/admin/unidades)` como não implementado — divergente do estado real do código: `/admin/unidades` e `/admin/unidades/conversoes` existem e aparecem no build (`npm run build`), e os módulos 2.D/2.G/2.I estão registrados como "✅ Concluído" em `PLAN.md`. Correção de `CLAUDE.md` fora do escopo desta sprint (proibida alteração de Frontend/Documentação de módulo fora do objetivo declarado).

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx prisma validate` | ✅ Schema válido |
| `npx prisma generate` | ❌ EPERM (ambiente — ver Etapa 2/10) |
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/warnings |
| `npm run build` | ✅ Sucesso |

### Autoauditoria

| Item | Confirmação |
|---|---|
| Regra de negócio alterada | ❌ Não |
| Módulo funcional alterado | ❌ Não |
| Frontend alterado | ❌ Não |
| Design System alterado | ❌ Não |
| UX alterada | ❌ Não |
| Sprint funcional impactada | ❌ Não — apenas documentada |
| `db push`/alteração estrutural executada | ❌ Não |
| `PLAN.md` alterado | ✅ Sprint I.1 registrada; notas de divergência de infraestrutura anexadas às linhas existentes de 2.D, 2.G, 2.I e 2.J (nenhum status "Concluído" revertido) |

### FASE 6 — Evolução da Governança (registrada nesta mesma sprint, por instrução direta do Product Owner)

Nova regra permanente: sempre que uma Sprint funcional encontrar uma inconsistência de infraestrutura (banco, ambiente, Storage, migrations, autenticação ou serviços externos), a Sprint funcional é interrompida, a inconsistência é registrada, e uma Sprint Oficial de Infraestrutura (`I.x`) é aberta e aprovada pelo Product Owner antes de qualquer continuidade do roadmap funcional dependente da área afetada. Registrada como **ADR-012** em `CLAUDE.md`; regra operacional em `PROJECT_GOVERNANCE.md` nova Seção 4.4. Nenhum código de `src/` ou `prisma/schema.prisma` alterado por esta evolução de governança.

### Decisão do Product Owner sobre o status de 2.D/2.G/2.I (17/07/2026)

Os módulos 2.D, 2.G e 2.I permanecem registrados como "Concluído" em `PLAN.md`, com a qualificação explícita "condicionado à regularização da infraestrutura em Sprint I.2" — decisão do Product Owner, registrada nesta sessão. A regularização em si (`db push`, dados de `UnitOfMeasure`/`Ingredient`/`IngredientCategory`, credenciais de Storage) fica para a Sprint I.2, ainda não aberta, conforme a regra de interrupção formalizada nesta mesma sprint (ADR-012, `PROJECT_GOVERNANCE.md` Seção 4.4).

### Confirmação explícita (critério de sucesso da missão)

- **Ambiente consistente?** Parcialmente — variáveis de banco/auth OK; variáveis de Storage ausentes; `prisma generate` bloqueado por lock de processo local.
- **Banco consistente?** Não — `UnitOfMeasure`/`UnitConversion` divergentes do schema; `UnitOfMeasure`/`Ingredient`/`IngredientCategory`/`Recipe`/`RecipeIngredient` sem dados.
- **Schema consistente?** `schema.prisma` é internamente válido; não está sincronizado com o banco físico real nos pontos acima.
- **Storage consistente?** Não verificável nesta sessão — credenciais ausentes.
- **Projeto apto para continuar o roadmap funcional?** Sim para módulos que não tocam `UnitOfMeasure`/`UnitConversion`/`Ingredient`/`Recipe` reais neste banco. Não recomendado prosseguir com uso real de `/admin/unidades`, `/admin/ingredientes` ou `/admin/receitas` contra este banco Supabase até a correção estrutural (item 1/2 da Etapa 10) ser autorizada e aplicada.

---

## [Sprint 2.J.2.1] — 2026-07-17 — Product Owner Review — Correções de UX, UI e Bugs

**Tipo:** Correção Funcional + UX/UI — `productRepository.ts`/`productValidator.ts`/`productService.ts` não alterados, schema não alterado, nenhuma funcionalidade nova.

### Bugs corrigidos

- **Upload de imagem (Item 1):** `src/app/api/admin/upload/route.ts` só aceitava `type === "logo"` ou `"favicon"` — rejeitava `"product"` com 400 mesmo com Supabase configurado, apesar de `"product"` já ser um `AssetType` válido em `StorageService.ts`. Corrigido para validar contra o `AssetType` completo. A mensagem "Armazenamento não configurado..." que o Product Owner viu está correta (o `.env` local realmente não tem `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`) — não é bug, é configuração de ambiente pendente, fora do controle desta sprint.
- **"+ Adicionar receita" desabilitado (Item 2):** não é bug — confirmado por evidência direta no banco (`prisma.recipe.count() = 0`, nenhuma receita cadastrada no ambiente de desenvolvimento). Mensagem melhorada para explicar o motivo e linkar `/admin/receitas`.

### Melhorias de UX

- Mensagem de "nenhuma receita" agora distingue "nenhuma receita ativa no sistema" (com link para cadastrar) de "nenhuma vinculada a este produto ainda".
- Campo "Prazo mínimo (dias)" renomeado para "Prazo de produção (dias)" (Item 8) — só apresentação, regra de negócio inalterada.
- Campo Status confirmado já correto — somente leitura no modal de edição desde a Sprint 2.J.2, ativação/desativação só pela listagem (Item 9, nenhuma mudança necessária).

### Melhorias de UI / Layout

- `ProductModal` reorganizado em grupos com o componente `Section` (`FormPrimitives.tsx`, reutilização já prevista em `PROJECT_GOVERNANCE.md` Seção 8.5): Informações Gerais, Comercial, Imagem, Receitas Vinculadas, Resumo Financeiro — reduz espaço vazio e melhora hierarquia visual (Item 4).
- Ícones SVG inline substituindo emojis (🎂→pacote, ✕→X) e padronizando ações (editar, ativar/desativar, excluir, adicionar) — sem instalar `lucide-react`/`@heroicons` (nenhum dos dois está instalado em nenhum lugar do projeto; introduzir um exigiria ADR por ser dependência nova, fora do escopo desta sprint) (Item 6).
- Estados de hover/focus-visible adicionados a todos os botões interativos da página (Item 7) — paleta existente (chocolate/sand/rose/sage), nenhuma cor nova introduzida.

### Melhorias de Tipografia

Nenhuma alteração necessária (Item 5) — `font-display` (Fraunces) e DM Sans já corretamente aplicados em `/admin/produtos`, confirmado por leitura do código e de `layout.tsx`. Não existe Times New Roman nem fonte desatualizada em nenhum lugar do projeto.

### Formatação monetária

Campo "Preço de venda" (Item 3): máscara `R$ 0,00` durante a digitação (separador decimal vírgula, milhar ponto, via `Intl`/`toLocaleString("pt-BR")`), valor enviado à API continua numérico. `form.basePrice` mantém o mesmo contrato de string decimal já usado por `parseFloat` em validação/envio — nenhuma regra de negócio alterada.

### Responsividade (Item 10)

Revalidada via Playwright MCP em 3 larguras (390px smartphone, 834px tablet, viewport desktop padrão) — nenhum componente quebrou, nenhum scroll horizontal indevido.

### Experience Review / Development Preview executado (Item 11)

Login administrativo, listagem (9 produtos reais), abertura do modal de criação, digitação no campo de preço (mask confirmada: "8990" → "R$ 89,90"), mensagem de receitas vazias com link funcional, responsividade nos 3 breakpoints — tudo via Playwright MCP. Zero erros/warnings de console em toda a sessão de teste. Upload real não pôde ser testado ponta a ponta (ambiente sem credenciais Supabase — fora do controle desta sprint).

### Bloqueio real encontrado, fora do escopo — registrado, não corrigido

Ao tentar criar uma receita de teste para validar o Item 2 ponta a ponta, constatado por evidência direta que o banco de dados real (Supabase, projeto `vqootzdtkgcbltrlfgzq`) está **dessincronizado do schema Prisma**: a tabela `UnitOfMeasure` só tem as colunas `abbreviation, createdAt, id, name, type` — faltam `isActive`, `sortOrder`, `updatedAt`, adicionadas pela Sprint 2.D.1 (documentada como "✅ Concluído 15/07/2026"). Qualquer query real em `UnitOfMeasure` via o Prisma Client atual provavelmente falha nesse ambiente. Por decisão do Product Owner, `npx prisma db push` **não foi executado** — fora do escopo desta sprint ("NÃO altera Schema") e ação de risco real contra banco Supabase compartilhado, não descartável sem autorização própria. Registrado aqui para uma futura Sprint de infraestrutura dedicada.

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/warnings |
| `npm run build` | ✅ Sucesso |
| Development Preview (Playwright MCP) | ✅ Executado — zero erros de console |

### Confirmações de escopo

| Item | Status |
|------|--------|
| Regra de negócio alterada | ❌ Não |
| `productService.ts`/`productRepository.ts`/`productValidator.ts` alterados | ❌ Não |
| Schema alterado | ❌ Não |
| Funcionalidade nova implementada | ❌ Não |
| Nova dependência instalada | ❌ Não |
| `PLAN.md` alterado | ✅ Status de 2.J atualizado |

---

## [Sprint 2.J.2] — 2026-07-16 — API + Frontend — Módulo Produtos

**Tipo:** Implementação Funcional (API + Frontend) — nenhuma regra de negócio nova, `productRepository.ts`/`productValidator.ts`/`productService.ts` (2.J.1) não alterados, schema não alterado.

### Arquivos criados

| Arquivo | Camada |
|---------|--------|
| `src/app/api/admin/products/route.ts` | API — `GET` (paginado/busca/filtro/ordenação via query string) + `POST` |
| `src/app/api/admin/products/[id]/route.ts` | API — `GET`/`PATCH`/`DELETE` |
| `src/app/api/admin/products/[id]/activate/route.ts` | API — `PATCH` |
| `src/app/api/admin/products/[id]/deactivate/route.ts` | API — `PATCH` |
| `src/lib/api/productApi.ts` | Cliente HTTP — mesmo padrão de `recipeApi.ts` |
| `src/app/admin/produtos/page.tsx` | Frontend — listagem, busca/filtro/ordenação/paginação server-side, criação, edição, ativação, desativação, exclusão, vínculo de receitas |

### Arquivos alterados

`src/app/admin/page.tsx` — link do hub administrativo para Produtos aponta para `/admin/produtos` (antes `/admin/em-construcao`).

### Decisão de design — layout mantido, não pioneirado

`DESIGN_SYSTEM.md` documenta `max-w-5xl` "desktop-first" como padrão de área admin, mas nenhum módulo já implementado o segue (todos usam `max-w-app`, mobile-first). Decisão explícita do Product Owner: Produtos segue o padrão visual já existente (`max-w-app`, lista de cards, mesmos componentes locais de `receitas`/`ingredientes`) — não pioneira o layout desktop-first documentado. Evolução ampla do Design System fica para sprint própria, futura.

### Performance — divergência deliberada do padrão client-side anterior

Diferente de `receitas`/`ingredientes` (que carregam a lista inteira e filtram no cliente), `/admin/produtos` busca, filtra, ordena e pagina **server-side** — toda mudança de busca (debounce ~300ms)/filtro/ordenação/página refaz a chamada a `GET /api/admin/products`, nunca carrega a lista inteira (Product Runtime Standards, ADR-010).

### Integração com Receitas

Frontend consome apenas `ProductDTO`/`ProductRecipeDTO` via API — nunca acessa `recipeService`/`recipeRepository` diretamente. Custo (`costPrice`, `recipes[].unitCost`) e margem (`margin`) são exibidos exatamente como retornados pela API, nunca recalculados no cliente.

### Componente deliberadamente não criado

`ProductRow`/layout de tabela — não implementado, consistente com a decisão de design acima (só `ProductCard` foi necessário).

### Correções aplicadas após a implementação do Frontend

Um erro real de lint (`react-hooks/set-state-in-effect`) foi encontrado e corrigido na revalidação independente — o agente de Frontend não tinha acesso a `tsc`/`lint`/`build` nesta sessão e reportou essa limitação explicitamente em vez de fabricar resultado; a validação foi então executada por fora, conforme exigência do Product Owner antes de aceitar a etapa.

### Development Preview executado

Servidor de desenvolvimento (`npm run dev`) subido; login administrativo, navegação até `/admin/produtos`, listagem real (8 produtos do seed), abertura do modal de criação — tudo validado via Playwright MCP, que carregou com sucesso nesta sessão (diferente da Sprint T.2C, que confirmou indisponibilidade por evidência real — bloqueio de ciclo de vida de sessão presumivelmente resolvido por reinício desde então). Zero erros de console. Nenhuma ação destrutiva/homologação foi executada — reservado para o Product Owner.

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros (API e Frontend, revalidado de forma independente) |
| `npm run lint` | ✅ 0 erros/warnings (após correção do `set-state-in-effect`) |
| `npm run build` | ✅ Sucesso — `/admin/produtos` e as 4 rotas de API aparecem no build |

### Confirmações de escopo

| Item | Status |
|------|--------|
| Regra de negócio nova | ❌ Nenhuma |
| `productService.ts`/`productRepository.ts`/`productValidator.ts` alterados | ❌ Não |
| Schema alterado | ❌ Não |
| QA | ❌ Fora de escopo (pendente) |
| Homologação | ❌ Fora de escopo (pendente) |
| Ambiente pronto para validação manual do Product Owner | ✅ Sim — `npm run dev`, `http://localhost:3000/admin/produtos`, login `admin@doceatelier.com.br` / `admin123` |

---

## [Sprint 2.J.1] — 2026-07-16 — Backend Completo — Módulo Produtos

**Tipo:** Implementação Funcional (Repository + Validator + Service) — Schema não alterado; nenhuma API ou Front-end implementados (fora de escopo desta sprint).

### Arquivos criados (3)

| Arquivo | Camada |
|---------|--------|
| `src/lib/repositories/productRepository.ts` | Repository — `Product` (inclui `ProductRecipe` aninhado) |
| `src/lib/validators/productValidator.ts` | Validator — `Product` |
| `src/lib/productService.ts` | Service — `Product`, custo calculado a partir das receitas vinculadas |

### Ajuste de escopo desta sprint (não é pendência do projeto)

`findBySlug()` foi removido do escopo — `Product` não possui campo `slug` no schema, em `src/lib/types.ts` nem em `REGRAS_NEGOCIO.md` Seção 3.1 (diferente de `ProductCategory`/`OccasionTag`, que têm `slug @unique`). Esta sprint não altera schema — adicionar `slug` a `Product`, se necessário, é decisão de uma futura Sprint de Schema dedicada.

### Regras de negócio implementadas (de `REGRAS_NEGOCIO.md` Seção 3.1)

- Nome, categoria, `basePrice` e `leadTimeDays` obrigatórios na criação.
- Produto pertence a exatamente uma categoria — `categoryId` deve referenciar categoria existente e ativa (`InvalidCategoryReferenceError`/`InactiveCategoryError`), mesmo padrão de bloqueio já usado em `ingredientService`/`recipeService` para referências cruzadas.
- Produto pode ter zero ou mais receitas vinculadas via `ProductRecipe` — cada `recipeId` deve existir (`InvalidRecipeReferenceError`); duplicidade de receita na mesma lista bloqueada no Validator (estrutural).
- `costPrice` nunca armazenado — sempre recalculado a partir do `unitCost` de cada `Recipe` vinculada (Σ `unitCost × quantity`), mesmo princípio de "nunca armazenar dado derivado" já usado em `recipeService.calculateCost`.
- Exclusão protegida: `deleteProduct` bloqueia com `ProductInUseError` quando o produto tem uso em `OrderItem` (`countProductUsage`) — mesmo padrão de proteção já usado em `productCategoryService.deactivateCategory` (`CategoryHasProductsError`), aplicado aqui à exclusão em vez de à desativação.

### Limitação consciente do modelo atual (decisão registrada, não pendência)

Nenhuma validação de unicidade de nome foi implementada — `Product.name` não é `@unique` no schema e `REGRAS_NEGOCIO.md` não documenta regra de duplicidade para `Product` (diferente de `ProductCategory.name`, que é `@unique`). Produtos com o mesmo nome são permitidos no estado atual do domínio, salvo documentação em contrário numa sprint futura.

### Decisão arquitetural — acoplamento Service→Service para custo calculado

`productService.calculateCostPrice` chama `recipeService.getRecipeById()` (já exportada, somente leitura) para obter o `unitCost` de cada receita vinculada, em vez de duplicar o algoritmo de conversão de unidade já implementado em `recipeService.ts` (módulo 2.I, homologado, não alterado nesta sprint) ou extrair sua lógica privada. Decisão do Product Owner nesta sessão, registrada como Observação Técnica (ver abaixo).

### Reordenação de roadmap — registrada como ADR-011

Sprint 2.J.1 executada antes do Módulo 2.F (Produtos Fase 1), invertendo a ordem original do roadmap (`PLAN.md` registrava "2.J" dependente de "2.F + 2.I"). Constatado por evidência que o Backend de 2.J não tem dependência técnica de código do 2.F — só dependência histórica de sequenciamento. Detalhe completo: `CLAUDE.md`, ADR-011. `PLAN.md` atualizado para refletir a nova sequência oficial, preservando o histórico original aqui.

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ Sucesso (nenhuma rota nova — sem API nesta sprint, como esperado) |

### Confirmações de escopo

| Item | Status |
|------|--------|
| API | ❌ Não implementada (fora de escopo) |
| Front-end | ❌ Não implementado (fora de escopo) |
| Schema alterado | ❌ Não |
| Regras fora do Service | ❌ Nenhuma |
| Módulo Receitas (2.I, homologado) alterado | ❌ Não — apenas consumido via `getRecipeById()` já exportada |
| `PLAN.md` atualizado | ✅ Status de 2.J e dependência atualizados (ADR-011) |

---

## [Sprint G.6.2] — 2026-07-16 — Product Runtime Standards

**Tipo:** Padronização de Produto — nenhum código de `src/` ou `prisma/schema.prisma` alterado, nenhuma funcionalidade alterada.

### Resultado

Formalizados padrões técnicos permanentes: o ERP é sistema Web, totalmente responsivo (critério mínimo de aceite: Desktop, Tablet, Smartphone), ambiente oficial de produção é VPS Linux, e diretrizes permanentes de performance (paginação/filtros server-side). Registrado como ADR-010 em `CLAUDE.md`.

### Documentos alterados

| Arquivo | Mudança |
|---|---|
| `PROJECT_GOVERNANCE.md` | Nova Seção 8.8 (ambiente de execução e compatibilidade); nova Seção 11.1 (performance); item de responsividade expandido de 2 para 3 cenários em "QA de Front-end" e no checklist de aceite (QA FUNCIONAL) |
| `PLATFORM_OVERVIEW.md` | Nova seção "Qual é o ambiente de execução oficial?" |
| `CLAUDE.md` (raiz) | ADR-010 registrada em "Decisões arquiteturais tomadas" |

`PLAN.md` não foi alterado, conforme a Restrição Final da ordem de missão.

### Confirmações de escopo

| Item | Status |
|------|--------|
| Módulo do ERP alterado | ❌ Não |
| Regra de negócio alterada | ❌ Não |
| Nova estrutura arquitetural criada | ❌ Não — apenas convenção formalizada |
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/warnings |
| `npm run build` | ✅ Build de produção concluído com sucesso |
| `PLAN.md` alterado | ❌ Não — proibido pela ordem de missão |

---

## [Sprint G.6.4] — 2026-07-16 — Sprint Backlog Governance

**Tipo:** Governança de processo — nenhum módulo do ERP alterado, nenhum código de `src/` ou `prisma/schema.prisma` tocado.

### Resultado

Registrado o fluxo operacional vigente do ciclo de vida da Sprint (`PROJECT_GOVERNANCE.md` Seção 4.1) com base em evidência real: nenhuma Sprint deste projeto jamais produziu `SPRINT_X.md`/`SPRINT_AUDIT.md`, nenhuma usou os nomes da máquina de 8 estados de `docs/ai/AI_PROMPT_ORCHESTRATOR.md` como status real. Essa arquitetura expandida de orquestração — e os esquemas de 9 e 10 estados já registrados em `project-skill-governance/references/STATE_MACHINE.md` e `.claude/architecture/STATE_MACHINE.md` — permanece válida como referência arquitetural, sem revogação e sem reconciliação forçada entre os três. Formalizada a distinção Sprint Oficial vs. Backlog Suggestion e a regra de bloqueio de nova Sprint Oficial durante execução. Registrado como ADR-009 em `CLAUDE.md`.

### Documentos alterados

| Arquivo | Mudança |
|---|---|
| `PROJECT_GOVERNANCE.md` | Novos itens 4.1 (fluxo operacional vigente), 4.2 (Sprint Oficial vs. Backlog Suggestion), 4.3 (regra de bloqueio + regra de vigência de novas regras) |
| `docs/ai/AI_PROMPT_ORCHESTRATOR.md` | Nota de vigência adicionada ao topo; linha de histórico adicionada — nenhum conteúdo normativo removido |
| `.claude/skills/sprint-governance/SKILL.md` | Nota de vigência adicionada ao item 9 (Limitações); linha de histórico adicionada — Skill congelada, alteração amparada por ADR-009 |
| `CLAUDE.md` (raiz) | ADR-009 registrada em "Decisões arquiteturais tomadas" |

`PLAN.md` não foi alterado, conforme a Restrição Final da ordem de missão.

### Confirmações de escopo

| Item | Status |
|------|--------|
| Módulo do ERP alterado | ❌ Não |
| `docs/ai/AI_PROMPT_ORCHESTRATOR.md` revogado ou reescrito | ❌ Não — apenas nota de vigência adicionada |
| Esquemas de 9/10 estados reconciliados à força | ❌ Não — divergência mantida, registrada explicitamente |
| Vocabulário de estado novo criado | ❌ Não — reaproveitado o vocabulário já existente em `CLAUDE.md`/`PROJECT_GOVERNANCE.md` Seção 4 |
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/warnings |
| `npm run build` | ✅ Build de produção concluído com sucesso |
| `PLAN.md` alterado | ❌ Não — proibido pela ordem de missão |

---

## [Sprint T.3] — 2026-07-16 — Demo Environment & Product Validation Platform

**Tipo:** Infraestrutura Permanente do Produto — documentação e arquitetura, nenhum código de `src/` ou `prisma/schema.prisma` alterado.

### Resultado

Plataforma de Demonstração formalizada como capacidade permanente do ERP (não artefato de sprint única), registrada como ADR-008 em `CLAUDE.md` ("Decisões arquiteturais tomadas").

### Documentos criados

| Arquivo | Conteúdo |
|---|---|
| `DEMO_ENVIRONMENT.md` | Arquitetura do ambiente: finalidade, responsabilidades, limites, integração com Platform Review/Product Review/QA |
| `DEMO_DATASET.md` | Empresa padrão (Doce Atelier), categorias, unidades, conversões, ingredientes, receitas, Demo Users, dados obrigatórios, convenções de nomenclatura, Demo Dataset Version, estratégia de evolução |
| `DEMO_GUIDE.md` | Objetivo, público-alvo, como iniciar/restaurar (pendente de implementação), usuários disponíveis, fluxo sugerido, limitações |
| `prisma/demo-seeds/README.md` | Arquitetura da pasta de seed de demonstração — organização, responsabilidades, forma de utilização, estratégia de manutenção. Nenhum script/fixture implementado nesta sprint. |

### Documentos alterados

| Arquivo | Mudança |
|---|---|
| `PROJECT_GOVERNANCE.md` | Novo item 3.6 (Demo Validation) na Seção 4; nova Seção 16.6 (Processo de Demo Validation); três linhas novas na tabela da Seção 12 |
| `ERP_DEVELOPMENT_WORKFLOW.md` | Ciclo de vida (item 1) atualizado com a etapa Demo Validation; novo item 5.6; item 10 atualizado |
| `PLATFORM_OVERVIEW.md` | Diagrama "Como funciona o Workflow?" atualizado com Demo Validation |
| `.claude/skills/product-review/checklists/ux-checklist.md` | Novo critério: "o ambiente demonstra claramente o fluxo completo do negócio para um usuário?" — escopado às páginas do Demo Environment |
| `CLAUDE.md` (raiz) | ADR-008 registrada em "Decisões arquiteturais tomadas"; "Estrutura das pastas" atualizada (`DEMO_ENVIRONMENT.md`, `DEMO_DATASET.md`, `DEMO_GUIDE.md`, `prisma/demo-seeds/`); nota adicionada à linha "Status atual" |

`PLAN.md` não foi alterado, conforme restrição explícita da ordem de missão desta sprint.

### Confirmações de escopo

| Item | Status |
|------|--------|
| Regra de negócio alterada | ❌ Não |
| Arquitetura funcional do ERP alterada | ❌ Não |
| Dado real de demonstração implementado (`prisma/demo-seeds/`) | ❌ Não — apenas arquitetura |
| Investigação do Playwright MCP retomada | ❌ Não |
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros/warnings |
| `npm run build` | ✅ Build de produção concluído com sucesso |
| `PLAN.md` alterado | ❌ Não — proibido pela ordem de missão |

---

## [Sprint T.2C] — 2026-07-15 — Playwright MCP Operational Validation

**Tipo:** Infraestrutura de Desenvolvimento — validação por evidência real, encerrada na FASE 0 por falha de pré-requisito. Nenhum teste operacional do ERP foi executado, conforme a própria ordem de missão exige quando o pré-requisito falha.

### Resultado: Playwright MCP indisponível após validação real

FASE 0 (5 verificações obrigatórias antes de qualquer teste operacional):

| # | Verificação | Resultado |
|---|---|---|
| 1 | `.mcp.json` é o mesmo preparado na Sprint T.2B? | ✅ Confirmado — conteúdo idêntico (`mcpServers.playwright`, `npx @playwright/mcp@latest`) |
| 2 | Claude Code carregou servidores MCP nesta sessão? | ❌ Sem evidência de carregamento — nenhuma ferramenta correspondente surgiu |
| 3 | Playwright MCP aparece no manifesto de ferramentas? | ❌ **Não** — confirmado por 4 buscas independentes (`ToolSearch`): "playwright", "browser_navigate browser_click browser_screenshot browser_snapshot", "browser_type browser_close browser_wait mcp playwright automation" — todas retornaram "No matching deferred tools found" ou apenas `WebFetch` (ferramenta não relacionada) |
| 4 | Ausência de mensagens de erro do servidor MCP? | ⚠️ Nenhum erro explícito observado, mas também nenhuma confirmação de tentativa de conexão — ausência de erro não equivale a conexão bem-sucedida |
| 5 | Chamada simples ao Playwright MCP responde? | ❌ Impossível — nenhuma ferramenta desse servidor está disponível para ser chamada |

**Verificação 3 falhou → interrompido imediatamente na FASE 0, conforme a própria ordem de missão exige.** Nenhum teste operacional do ERP (abrir navegador, navegar, clicar, preencher, CRUD, screenshot) foi iniciado — nenhuma suposição foi feita sobre capacidades não comprovadas.

### Workflow

**Preservado, sem alteração** — `PROJECT_GOVERNANCE.md`/`ERP_DEVELOPMENT_WORKFLOW.md` permanecem exatamente como ao final da Sprint G.6.1 (Cenário B, conforme a ordem de missão desta sprint determina).

### Confirmações de escopo

| Item | Status |
|------|--------|
| `.mcp.json` recriado/alterado | ❌ Não — preservado intacto |
| Nova configuração criada | ❌ Não |
| Arquitetura alterada | ❌ Não |
| Workflow alterado | ❌ Não — preservado |
| Testes operacionais do ERP executados | ❌ Não — bloqueado na FASE 0 por falha de pré-requisito |
| Conclusão baseada em suposição | ❌ Não — toda conclusão suportada por evidência de busca de ferramenta |

---

## [Sprint T.2B] — 2026-07-15 — Test Automation & Homologation Infrastructure — **PARCIALMENTE CONCLUÍDA**

**Tipo:** Infraestrutura de Desenvolvimento — suspensa em estado controlado (Sprint T.2B.1) por bloqueio técnico real, não por erro de projeto ou de configuração.

### Estado

**PARCIALMENTE CONCLUÍDA.** Continuação obrigatória na **Sprint T.2C**.

### O que foi preparado

- `.mcp.json` criado na raiz do projeto, com a entrada oficial do Playwright MCP (mesmo formato catalogado no marketplace do Claude Code): `{"mcpServers": {"playwright": {"command": "npx", "args": ["@playwright/mcp@latest"]}}}`.

### Bloqueio real encontrado

Conexões de servidor MCP são estabelecidas na inicialização da sessão do Claude Code — não há hot-reload. Confirmado empiricamente (não por suposição): após criar `.mcp.json`, uma busca por ferramenta (`ToolSearch`) com queries diretas ("playwright browser navigate screenshot click") não retornou nenhuma ferramenta nova, nem imediatamente após a criação do arquivo, nem em uma tentativa seguinte na mesma sessão. O bloqueio decorre do ciclo de vida da sessão atual — a sessão precisa ser reiniciada/recarregada para que o Playwright MCP seja de fato carregado e testável. Isso não é responsabilidade desta sessão resolver sozinha.

### Nenhuma conclusão sobre o funcionamento do Playwright MCP é emitida aqui

Não há evidência real (positiva ou negativa) de que o Playwright MCP abre navegador, navega, clica, preenche formulário, captura screenshot ou grava vídeo nesta instalação — nenhum teste real foi possível dentro desta sessão contínua. Qualquer afirmação nesse sentido seria suposição, expressamente proibida pela ordem de missão.

### O que NÃO foi feito (fora de escopo desta sprint/suspensão)

Nenhuma dependência instalada (nenhum `npx` chegou a executar); nenhuma alteração de arquitetura; nenhuma alteração do Workflow oficial (`PROJECT_GOVERNANCE.md`/`ERP_DEVELOPMENT_WORKFLOW.md` permanecem como estavam ao final da Sprint G.6.1); `HOMOLOGATION_GUIDE.md` e a estrutura `docs/homologation/` **não foram criados** — dependiam do resultado da validação operacional, ainda pendente.

### Confirmações de escopo

| Item | Status |
|------|--------|
| Playwright MCP validado (Cenário A ou B) | ❌ Nenhum dos dois — pendente de reinício de sessão |
| Dependência instalada | ❌ Não |
| Workflow alterado | ❌ Não |
| Documento novo criado (além deste registro) | ❌ Não |
| Continuação delegada | ✅ Sprint T.2C |

---

## [Sprint G.6.1] — 2026-07-15 — Platform & Product Architecture Consolidation

**Tipo:** Consolidação Arquitetural Final — nenhuma funcionalidade do ERP implementada, nenhum código/schema alterado. Encerra oficialmente a fase de evolução arquitetural do projeto.

### Achado de FASE 0 — tensão real com CLAUDE.md e o roadmap congelado

A ordem de missão pede para "formalizar que o ERP passa a ser uma plataforma SaaS" com Doce Atelier "apenas um tenant de referência". `CLAUDE.md` (raiz) descreve o sistema como single-tenant ("Sistema de gestão de encomendas para confeitaria artesanal Doce Menina") e `PROJECT_GOVERNANCE.md` Seção 13 tem o roadmap 2.A-2.L congelado; a paleta de cores é tratada como "identidade visual do negócio", não parametrizável. Nenhum model `Tenant`/`tenantId` existe no schema. Resolvido com transparência total: `ERP_PRODUCT_VISION.md` abre com uma "Nota de transparência obrigatória" distinguindo visão de plataforma (documentada nesta sprint) de estado real implementado (single-tenant, inalterado) — nenhuma migração de schema, nenhuma refatoração de cor foi feita, conforme a própria ordem exigia ("Nenhuma implementação funcional deverá ser feita").

### Achado de FASE 0 — reconciliação de instrução aparentemente contraditória

A ordem pede simultaneamente para "Não alterar: product-reviewer"/"Não alterar: product-review" (Seções SUB-AGENTS/SKILLS) e para "Formalizar que Product Review passa a representar uma disciplina de Experience Review... Documentar que passa a avaliar... Branding... White Label" (Seção EXPERIENCE REVIEW). Resolvido preservando `product-reviewer.md`/`product-review/SKILL.md` **byte a byte intactos** e formalizando a evolução conceitual inteiramente em `PLATFORM_OVERVIEW.md` (nova seção "Experience Review vs. Platform Review") — nenhum dos dois arquivos originais foi tocado.

### Novo fluxo oficial do projeto

```
Backend → API → Frontend → Platform Review → Product Review → QA → Encerramento
```

### Arquivos criados (7)

| Arquivo | Conteúdo |
|---------|----------|
| `.claude/architecture/agents/personas/platform-reviewer.md` | Arquitetura de persona |
| `.claude/agents/platform-reviewer.md` | Sub-agent real, 11º do sistema, 14 seções |
| `.claude/skills/platform-review/SKILL.md` | Skill nova, 17ª do projeto, 11 seções |
| `.claude/skills/platform-review/checklists/platform-checklist.md` | Checklist de conformidade de plataforma |
| `.claude/contracts/platform-review-contract.md` | Contrato formal |
| `ERP_PRODUCT_VISION.md` | Visão de produto: SaaS, White Label, Multi-tenant, limites, customizações, princípios de evolução — com nota de transparência sobre o estado atual |
| `PLATFORM_OVERVIEW.md` | Porta de entrada da plataforma: navegação, agentes, Skills, AI Operating System, Workflow, SaaS, White Label (tabela completa de customizações permitidas/proibidas), Multi-tenant, Theme Engine (documental), Experience Review vs. Platform Review |

### Arquivos alterados (governança e infraestrutura — reutilização, não recriação)

`PROJECT_GOVERNANCE.md` (Seção 4 recebeu o passo 3.4 Platform Review; nova Seção 16.4), `ERP_DEVELOPMENT_WORKFLOW.md` (fluxo, item 4, novo item 5.4, item 10), `CLAUDE.md` raiz (ADR-007), `.claude/architecture/AI_OPERATING_SYSTEM.md`/`LAYER_MODEL.md` (item 7/Camada 6, sem alterar as 8 camadas), `.claude/agents/CATALOG.md`/`MATRIX.md`/`RESPONSIBILITIES.md`/`DEPENDENCIES.md`/`EXECUTION_FLOW.md`/`README.md`/`INDEX.md` (11º agente), `.claude/skills/governance/SKILL.md`/`project-skill-governance/SKILL.md`/`references/SKILL_DEPENDENCIES.md`/`SKILL_MATRIX.md`/`references/RESPONSIBILITIES.md` (17ª skill — este último também corrigiu uma omissão real pré-existente: `product-review` nunca tinha sido incluída nele desde a Sprint G.6), `.claude/contracts/skill-contract.md`/`.claude/playbooks/MISSION_PLAYBOOK.md` (contagens).

**`product-review`/`product-reviewer` preservados sem nenhuma alteração de conteúdo**, conforme exigido pela ordem de missão — apenas referenciados a partir dos documentos novos.

### Documentos reutilizados (não recriados)

`DESIGN_SYSTEM.md`, `UX_GUIDELINES.md` (Sprints P2/P3), toda a infraestrutura de Skills/Sub-agents/Contracts/Playbooks/Architecture da Sprint G.5.x, `product-review`/`product-reviewer`/`product-review-contract.md`/`PRODUCT_REVIEW_PLAYBOOK.md` (Sprint G.6) — nenhum recriado, todos apenas referenciados ou estendidos onde a própria ordem autorizava.

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros — nenhum código do ERP alterado nesta sprint; validação permanece válida como confirmação de que a árvore `src/`/`prisma/` segue intacta e sem regressão |
| `npm run lint` | ✅ 0 erros — mesma justificativa |
| `npm run build` | ✅ Sucesso — mesma justificativa; lista de rotas idêntica à da Sprint 2.I.3/G.6 |

### Confirmações de escopo

| Item | Status |
|------|--------|
| `product-review`/`product-reviewer` alterados | ❌ Não — preservados intactos |
| Playbook novo criado | ❌ Não solicitado pela lista de artefatos desta ordem — não criado |
| Implementação funcional/schema | ❌ Nenhuma |
| PLAN.md alterado | ❌ Não (conforme instrução explícita) |
| Duplicidade documental/de Skill/Contract/Sub-agent/Playbook | ❌ Nenhuma — confirmado por contagem de arquivos (11 agentes, 17 skills de domínio, 7 contratos, 11 playbooks reais) |

---

## [Sprint G.6] — 2026-07-15 — Product Review System + Design System + Homologação Funcional

**Tipo:** Evolução da Arquitetura de Desenvolvimento (infraestrutura de IA, `.claude/`) — nenhuma funcionalidade do ERP implementada, conforme escopo explícito da ordem de missão.

### Achado de FASE 0 — Design System já existente

A ordem de missão pedia "criar documentação oficial" de Design System cobrindo identidade visual, tipografia, espaçamento, cores, 15+ componentes, estados, mensagens e navegação. `DESIGN_SYSTEM.md` (raiz, Sprint P2, 29/06/2026) e `UX_GUIDELINES.md` (raiz, Sprint P3, 30/06/2026) já cobrem integralmente esse escopo — 20 componentes documentados, 18 diretrizes de UX. Em vez de duplicar (violaria o princípio "Referenciar, nunca duplicar" de `.claude/CLAUDE.md`), o Product Review System criado nesta sprint referencia os dois diretamente como fonte de verdade — sem criar nenhum documento de Design System novo. Adicionada uma linha de referência cruzada no topo de cada um, apontando para o novo Product Review.

### Achado de FASE 0 — condição de evolução de infraestrutura

`PROJECT_GOVERNANCE.md` Seção 13.7 exige 4 condições simultâneas para evoluir a infraestrutura de IA em modo de manutenção. A condição 1 ("bloqueio real identificado durante o desenvolvimento do ERP") não estava documentada como bloqueio explícito em nenhuma sprint anterior (2.D–2.I) — esta ordem de missão é uma evolução proativa de metodologia, não a resposta a um bloqueio já registrado. As condições 2–4 (aprovação explícita do Product Owner, ordem de missão dedicada, registro documental) estão integralmente satisfeitas pela própria ordem recebida. Registrado como ressalva de transparência no ADR (`CLAUDE.md` raiz), não como violação — a decisão do Product Owner prevalece.

### Novo fluxo oficial do projeto

```
Backend → API → Frontend → Product Review → QA → Encerramento
```

Product Review é obrigatório sempre que a missão implementou/alterou Frontend; pulado quando a missão é só Backend/API.

### Arquivos criados (9)

| Arquivo | Conteúdo |
|---------|----------|
| `.claude/architecture/agents/personas/product-reviewer.md` | Arquitetura de persona (documentação, não Sub-agent real) |
| `.claude/agents/product-reviewer.md` | Sub-agent real, 10º do sistema, 14 seções conforme `agent-contract.md` |
| `.claude/skills/product-review/SKILL.md` | Skill nova, 16ª do projeto, 11 seções conforme `SKILL_TEMPLATE.md` |
| `.claude/skills/product-review/checklists/ux-checklist.md` | Checklist de UX |
| `.claude/skills/product-review/checklists/ui-checklist.md` | Checklist de UI |
| `.claude/skills/product-review/checklists/functional-checklist.md` | Checklist Funcional — único que define categoria A (bloqueante) |
| `.claude/skills/product-review/checklists/navigation-checklist.md` | Checklist de Navegação |
| `.claude/contracts/product-review-contract.md` | Contrato formal: entradas, saídas, artefatos, responsabilidades, limites, integração |
| `.claude/playbooks/PRODUCT_REVIEW_PLAYBOOK.md` | Playbook, 11º do sistema, 8 seções conforme `PLAYBOOK_ARCHITECTURE.md` |

### Arquivos alterados (documentação de produto e governança)

| Arquivo | Alteração |
|---------|-----------|
| `PROJECT_GOVERNANCE.md` | Seção 4 (fluxo) recebeu o passo 3.5 Product Review; nova Seção 16.5 (taxonomia A–F, regra de bloqueio, fonte de verdade) |
| `ERP_DEVELOPMENT_WORKFLOW.md` | Fluxo (item 1) e item 4 atualizados; novo item 5.5; itens 7 e 10 atualizados |
| `CLAUDE.md` (raiz) | ADR-006 registrado na tabela "Decisões arquiteturais tomadas", com a ressalva de transparência sobre a Seção 13.7 |
| `DESIGN_SYSTEM.md` | Linha de referência cruzada ao Product Review (raiz do documento) |
| `UX_GUIDELINES.md` | Linha de referência cruzada ao Product Review (raiz do documento) |

### Arquivos de índice/infraestrutura atualizados (contagens e referências cruzadas)

`.claude/agents/CATALOG.md`, `MATRIX.md`, `RESPONSIBILITIES.md` (nova coluna "Revisa (produto)"), `DEPENDENCIES.md`, `EXECUTION_FLOW.md`, `README.md`; `.claude/playbooks/README.md`, `PLAYBOOK_INDEX.md`; `.claude/architecture/AI_OPERATING_SYSTEM.md` (item 7, sem alterar o modelo de 8 camadas), `LAYER_MODEL.md` (nota na Camada 6); `.claude/skills/governance/SKILL.md`, `project-skill-governance/SKILL.md`, `project-skill-governance/references/SKILL_DEPENDENCIES.md`, `SKILL_MATRIX.md` — todos com contagens "9→10 Sub-agents"/"10→11 Playbooks"/"15→16 Skills" e as referências cruzadas correspondentes a `product-reviewer`/`product-review`.

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros (nenhum código do ERP alterado nesta sprint) |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ Sucesso |

### Confirmações de escopo

| Item | Status |
|------|--------|
| Funcionalidade do ERP implementada | ❌ Nenhuma — sprint exclusivamente de metodologia |
| `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md` duplicados | ❌ Não — referenciados, não recriados |
| Novo Protocol (`.claude/protocols/`) criado | ❌ Não solicitado pela ordem de missão — não criado, evitando escopo além do pedido |
| `engineering-reviewer` alterado para incluir `product-review` | ❌ Não — registrado como Melhoria Futura em `SKILL_DEPENDENCIES.md`, fora do escopo autorizado |

---

## [Sprint 2.I.3] — 2026-07-15 — QA Funcional, Homologação e Encerramento do Módulo Receitas

**Tipo:** Validação + Documentação + 1 correção real (remoção de export órfão) — nenhuma funcionalidade nova, nenhuma regra de negócio alterada.

### Arquivo criado

| Arquivo | Conteúdo |
|---------|----------|
| `MODULE_2I_CLOSURE.md` | Encerramento oficial: escopo, arquitetura, entidades, APIs, funcionalidades, integrações, fluxo Mestre/Detalhe (padrão de referência), pendências, limitações, lições aprendidas, padrões reutilizáveis |

### Correção real encontrada e aplicada

`src/lib/repositories/recipeIngredientRepository.ts` continha a função `listItemsByRecipe`, exportada mas nunca consumida em nenhum ponto do código (confirmado por busca em todo `src/`) — `getRecipeById`/`listRecipes` já obtêm os itens via `include` aninhado em `recipeRepository.ts`. Função removida por ser código órfão, sem relação com regra de negócio ou arquitetura aprovada.

### Achados documentais (não corrigidos — fora da lista de documentos autorizados nesta sprint)

`MENU_STRUCTURE.md` (linha 68) e `SCREENS.md` (itens A-17/A-18) ainda marcam Receitas como "🔲 Planejado" e descrevem uma rota dedicada `/admin/receitas/nova` para criação — a Sprint 2.I.2 implementou a criação via modal na própria listagem (`/admin/receitas`), não uma rota separada. Nenhum dos dois documentos está na lista de documentos autorizados a alterar nesta sprint (restrita a `PLAN.md`/`CHANGELOG.md`); registrado como Observação Técnica para uma sprint de documentação futura.

### QA funcional executado (validação por leitura de código de ponta a ponta)

Criação de receita com itens, edição de campos escalares, inclusão/edição/remoção de ingrediente, cálculo automático de custo total e unitário, compatibilidade de unidade (incluindo fator inverso), bloqueio de ingrediente duplicado e de ingrediente inativo, bloqueio de remoção do último item, listagem, busca, filtro por status, ordenação, estados vazio/loading/erro, mensagens de erro por código — todos confirmados. `curl` contra o servidor de desenvolvimento do usuário (sem alterar o processo dele) confirmou respostas HTTP esperadas (307/401, sem sessão) nas rotas novas; validação visual em navegador não foi possível neste ambiente.

### Auditoria arquitetural

Route → Service → Repository confirmado em 100% das 9 rotas (busca por `Repository`/`@prisma/client` em `src/app/api/admin/recipes`: zero ocorrências; busca por `requireAdmin()`: 9 ocorrências, uma por handler). Separação `Recipe`/`RecipeIngredient` confirmada em Repository, Service e Frontend (ver `MODULE_2I_CLOSURE.md` Seção 7).

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ Sucesso |

### Confirmações de escopo

| Item | Status |
|------|--------|
| Funcionalidade nova | ❌ Nenhuma |
| Regra de negócio alterada | ❌ Nenhuma |
| Componente compartilhado promovido | ❌ Não (mantido como Melhoria Futura) |
| Refatoração preventiva | ❌ Nenhuma |

---

## [Sprint 2.I.2] — 2026-07-15 — API + Frontend — Módulo Receitas

**Tipo:** Implementação Funcional (API + Frontend) + Correção de defeito real da Sprint 2.I.1 — nenhuma nova regra de negócio introduzida.

### Achado de FASE 0 — divergência de contrato corrigida (Validator/Service da Sprint 2.I.1)

O padrão consolidado de erro de validação em todos os módulos anteriores (Units, UnitConversion, Ingredientes) é `ValidationError[]` (`{ field, code, message }`, tipo oficial em `src/lib/types.ts`), consumido diretamente por `badRequest(errors: ValidationError[])`. A Sprint 2.I.1 havia entregue `recipeValidator.ts`/`recipeService.ts` com um formato próprio e divergente (`Record<string, string>`), que não podia alimentar `badRequest()` sem uma tradução fora de lugar na Route. Confirmado com o usuário como bloqueio real antes de prosseguir — corrigido nesta sprint: `recipeValidator.ts` e `recipeService.ts` reescritos para o padrão `ValidationError[]` (mesma assinatura de `validateConversionCreate`/`validateConversionUpdate` em `unitConversionValidator.ts`), incluindo alinhamento das classes de erro de domínio ao padrão sem `this.name` já usado por `ingredientService.ts`/`unitConversionService.ts`. Nenhuma regra de negócio foi alterada — só o formato de retorno do erro.

### Arquivos criados (10)

| Arquivo | Camada |
|---------|--------|
| `src/app/api/admin/recipes/route.ts` | API — GET (listar) / POST (criar) |
| `src/app/api/admin/recipes/[id]/route.ts` | API — GET (detalhe) / PATCH (editar campos escalares) |
| `src/app/api/admin/recipes/[id]/activate/route.ts` | API — PATCH (ativar) |
| `src/app/api/admin/recipes/[id]/deactivate/route.ts` | API — PATCH (desativar) |
| `src/app/api/admin/recipes/[id]/items/route.ts` | API — POST (adicionar ingrediente à receita) |
| `src/app/api/admin/recipes/[id]/items/[itemId]/route.ts` | API — PATCH (editar item) / DELETE (remover item) |
| `src/lib/api/recipeApi.ts` | Cliente HTTP do domínio Receitas |
| `src/app/admin/receitas/page.tsx` | Frontend — listagem + criação (com itens) |
| `src/app/admin/receitas/[id]/page.tsx` | Frontend — detalhe (fluxo Mestre/Detalhe: edição da receita + gestão completa dos itens) |

### Arquivos corrigidos (2 — Sprint 2.I.1)

| Arquivo | Correção |
|---------|----------|
| `src/lib/validators/recipeValidator.ts` | Retorno de `Record<string,string>` → `ValidationError[]`, alinhado ao padrão consolidado |
| `src/lib/recipeService.ts` | Classes de erro de domínio alinhadas (sem `this.name`, campos públicos no construtor); `RecipeValidationFailedError.errors: ValidationError[]` |

### Arquivo alterado (1)

| Arquivo | Alteração |
|---------|-----------|
| `src/app/admin/page.tsx` | Card "Receitas" trocado de placeholder (`/admin/em-construcao`) para rota real (`/admin/receitas`, `ready: true`) |

### APIs implementadas (8 rotas)

| Método | Rota | Ação no Service |
|---|---|---|
| `GET` | `/api/admin/recipes` | `listRecipes` |
| `POST` | `/api/admin/recipes` | `createRecipe` |
| `GET` | `/api/admin/recipes/[id]` | `getRecipeById` |
| `PATCH` | `/api/admin/recipes/[id]` | `updateRecipe` (somente campos escalares) |
| `PATCH` | `/api/admin/recipes/[id]/activate` | `activateRecipe` |
| `PATCH` | `/api/admin/recipes/[id]/deactivate` | `deactivateRecipe` |
| `POST` | `/api/admin/recipes/[id]/items` | `addRecipeItem` |
| `PATCH`/`DELETE` | `/api/admin/recipes/[id]/items/[itemId]` | `updateRecipeItem` / `removeRecipeItem` |

Todos os erros de domínio do Service (`RecipeNotFoundError`, `RecipeItemNotFoundError`, `RecipeValidationFailedError`, `DuplicateRecipeNameError`, `InvalidIngredientReferenceError`, `InvalidUnitReferenceError`, `InactiveIngredientError`, `IncompatibleUnitError`, `DuplicateIngredientInRecipeError`, `LastItemRemovalError`) mapeados para `responses.ts` (`notFound`/`badRequest`/`conflict`).

### Componentes reutilizados (padrão copiado, não importado — mesma convenção de Units/Ingredientes)

`Field`, `StatusBadge`, `LoadingState`, `EmptyState`, `ErrorState`, `FilterChips<T>`, `ConfirmModal` (renomeado `ConfirmRemoveItemModal` no contexto de item), `ValidationSummary`/`ToastState`, `ApiRequestError`, padrão `applyServerValidationErrors`.

### Componentes novos (com justificativa)

| Componente | Justificativa |
|---|---|
| `RecipeModal` (lista) | Nenhum módulo anterior tem criação com lista dinâmica de linhas (adicionar/remover ingrediente antes de salvar) — Receitas é o primeiro domínio com item obrigatório múltiplo na criação |
| `RecipeCard` (lista) | Layout específico do domínio (rendimento, custo total/unitário, contagem de ingredientes) — mesmo padrão de card com ações de ativar/desativar de `IngredientCard`/`ConversionCard`, mas com campos próprios |
| `ItemCard`, `AddItemModal`, `EditItemModal`, `ConfirmRemoveItemModal` (detalhe) | Primeira página Mestre/Detalhe do projeto — gestão de itens filhos (adicionar/editar/remover) não tem equivalente em nenhum módulo anterior |
| `RecipeEditModal` (detalhe) | Edição separada dos campos escalares da receita, sem os itens — decorre da separação Receita × Item da Receita já estabelecida no Service (2.I.1) |

### Integração com o Service

100% via `@/lib/recipeService` — nenhuma rota acessa Repository ou Prisma diretamente (confirmado por busca em `src/app/api/admin/recipes`).

### Integração com Ingredientes

Frontend consome `ingredientApi.listIngredients()` (somente leitura) para popular os seletores de ingrediente, filtrando `active: true` no cliente (a autoridade final continua sendo a validação `InactiveIngredientError` do Service). Nenhum arquivo de Ingredientes alterado.

### Integração com Units

Frontend consome `unitApi.listUnits()` (somente leitura) para os seletores de unidade, filtrando `isActive: true` no cliente. Nenhum arquivo de Units/UnitConversion alterado.

### Autoauditoria

| Item | Resultado |
|---|---|
| Route → Service → Repository | ✅ Confirmado (busca por `Repository`/`@prisma/client` em `src/app/api/admin/recipes` e `src/app/admin/receitas`: zero ocorrências) |
| Regras de negócio fora do Service | ✅ Nenhuma — validação client-side é só UX, réplica das mesmas checagens do Validator |
| Componentes duplicados | `Field`/`StatusBadge`/`LoadingState`/`ErrorState` duplicados entre `receitas/page.tsx` e `receitas/[id]/page.tsx` — mesma convenção de não promoção usada em `FilterChips` (Units → Ingredientes); registrado como Melhoria Futura, não corrigido nesta sprint (fora de escopo ampliar) |
| Hooks duplicados | ❌ Nenhum hook customizado criado |
| Tipagem | ✅ Sem `any` — confirmado por `tsc --noEmit` |
| Consistência Mestre/Detalhe | ✅ Lista → detalhe → gestão de itens → custo recalculado e exibido após cada alteração (`loadAll(true)` após toda mutação) |

### Correções realizadas

Divergência de contrato de erro de validação (`recipeValidator.ts`/`recipeService.ts`), detalhada na seção "Achado de FASE 0" acima — autorizada explicitamente pelo usuário antes da correção.

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ Sucesso — 8 novas rotas de API + 2 novas páginas (`/admin/receitas`, `/admin/receitas/[id]`) |

### Confirmações de escopo

| Item | Status |
|------|--------|
| Schema alterado | ❌ Não |
| Repository alterado | ❌ Não |
| Regra de negócio nova/alterada | ❌ Não (só correção de formato de erro) |
| Módulos já homologados (Units, UnitConversion, Ingredientes) | ❌ Não alterados |
| Prisma acessado fora do Repository | ❌ Não |

---

## [Sprint 2.I.1] — 2026-07-15 — Backend Completo — Módulo Receitas

**Tipo:** Implementação Funcional (Repository + Validator + Service) — Schema não alterado (`Recipe`/`RecipeIngredient` já continham todos os campos necessários); nenhuma API ou Front-end implementados (fora de escopo desta sprint).

### Arquivos criados (4)

| Arquivo | Camada |
|---------|--------|
| `src/lib/repositories/recipeRepository.ts` | Repository — `Recipe` |
| `src/lib/repositories/recipeIngredientRepository.ts` | Repository — `RecipeIngredient` (separado de `Recipe`, conforme exigido pela ordem de missão) |
| `src/lib/validators/recipeValidator.ts` | Validator — `Recipe` e itens da receita |
| `src/lib/recipeService.ts` | Service — `Recipe` + `RecipeIngredient` + cálculo de custo |

### Schema

**Não alterado.** `Recipe`/`RecipeIngredient` já existiam desde a modelagem original do ÉPICO 2, com todos os campos exigidos por `REGRAS_NEGOCIO.md` Seção 6 (nome, rendimento, unidade de rendimento, itens com quantidade/unidade, `@@unique([recipeId, ingredientId])` para duplicidade).

### Regras de negócio implementadas (de `REGRAS_NEGOCIO.md`)

- Seção 6.1: receita exige nome, rendimento (`yieldQuantity`), unidade de rendimento (`yieldUnit`) e pelo menos 1 ingrediente — criação rejeitada sem itens (`items` vazio ou ausente).
- Seção 6.1: duplicidade de ingrediente na mesma receita rejeitada no Service (`DuplicateIngredientInRecipeError`) antes de chegar ao banco — mesmo padrão de pré-checagem usado em `UnitConversion` (2.D.7); a constraint `@@unique([recipeId, ingredientId])` do schema permanece como segunda camada de garantia.
- Seção 6.1: "unidade do ingrediente na receita deve ser compatível com a unidade do ingrediente" implementado como `assertUnitCompatible` — aceita unidade idêntica à do ingrediente OU existência de `UnitConversion` entre as duas (em qualquer direção; se só a direção inversa estiver cadastrada, o Service usa `1/fator`, já que o módulo `UnitConversion` não gera automaticamente o par inverso). Sem conversão registrada em nenhuma direção → `IncompatibleUnitError`.
- Seção 6.4: custo total = Σ(quantidade × `currentPrice` do ingrediente, convertida para a unidade do ingrediente quando necessário); custo unitário = custo total ÷ `yieldQuantity`. **Sempre recalculado em tempo real a partir do `currentPrice` atual — nunca armazenado no banco**, conforme a regra explícita de que mudança de preço de ingrediente deve refletir imediatamente no custo de receitas vinculadas.
- Seção 6.5: conversão de unidade na apuração de custo usa o mesmo `resolveConversionFactor` (com fallback para fator inverso) usado na validação de compatibilidade.
- Seção 3.3: ingrediente inativo (`active: false`) não pode ser adicionado a uma receita — bloqueado em `assertIngredientUsable` com `InactiveIngredientError`. Esta era uma pendência conhecida e explicitamente registrada em `MODULE_2G_CLOSURE.md` Seção 8 como pertencente a esta sprint.
- Regra adicional não citada literalmente em `REGRAS_NEGOCIO.md`, mas decorrente de 6.1 ("pelo menos um ingrediente" como requisito estrutural, não só de criação): remoção do último item de uma receita é bloqueada (`LastItemRemovalError`) — uma receita não pode ficar sem nenhum ingrediente após já existir.

### Decisão arquitetural registrada — separação Receita × Item da Receita

Ao contrário de `IngredientPriceHistory` (2.G.1, co-localizado dentro do Repository do pai por ser sub-recurso de auditoria), `RecipeIngredient` recebeu Repository próprio (`recipeIngredientRepository.ts`) e operações de Service dedicadas (`addRecipeItem`/`updateRecipeItem`/`removeRecipeItem`, distintas de `createRecipe`/`updateRecipe`/`activateRecipe`/`deactivateRecipe`), conforme exigência explícita da ordem de missão ("separar claramente operações de Receita e de Itens da Receita"). `updateRecipe` altera somente os campos escalares da própria receita (nome, descrição, rendimento, unidade de rendimento, tempo de preparo) — nunca a lista de itens.

### Integração com Ingredientes e Units/UnitConversion

Somente leitura: `findIngredientById` (Ingredientes), `findUnitById` (Units) e `findConversion` (UnitConversion) — nenhum arquivo desses três módulos alterado.

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ Sucesso (nenhuma rota nova — sem API nesta sprint, como esperado) |

### Confirmações de escopo

| Item | Status |
|------|--------|
| API | ❌ Não implementada (fora de escopo) |
| Front-end | ❌ Não implementado (fora de escopo) |
| Schema alterado | ❌ Não — nenhuma lacuna real encontrada |
| Regras fora do Service | ❌ Nenhuma |
| Módulos já homologados (Units, UnitConversion, Ingredientes) | ❌ Não alterados |
| Entidades fora do domínio Receitas criadas | ❌ Nenhuma |

---

## [Sprint 2.G.3] — 2026-07-15 — QA Funcional, Homologação e Encerramento do Módulo Ingredientes

**Tipo:** Validação + Documentação — nenhum Schema, Repository, Validator, Service, API ou Front-end alterados (nenhuma inconsistência real exigiu correção).

### Arquivo criado

| Arquivo | Conteúdo |
|---------|----------|
| `MODULE_2G_CLOSURE.md` | Encerramento oficial: escopo, arquitetura, entidades, APIs, funcionalidades, integrações, pendências, limitações, lições aprendidas, padrões reutilizáveis |

### Arquivo alterado

| Arquivo | Mudança |
|---------|---------|
| `PLAN.md` | Módulo 2.G marcado ✅ Concluído |

### QA executado

Validação funcional (criação/edição/ativação/desativação/listagem/categorias/seleção de unidade/filtros/pesquisa/ordenação/mensagens/estados) por leitura de código de todas as camadas — aprovada. Auditoria arquitetural: confirmado por busca (`grep`) que nenhuma rota ou página importa Repository/Prisma diretamente — zero ocorrência em `src/app`. Validação documental: `PLAN.md`/`CHANGELOG.md` consistentes com a implementação real; `REGRAS_NEGOCIO.md`/`PROJECT_GOVERNANCE.md` não exigiram alteração.

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ Sucesso |

### Confirmações de escopo

| Item | Status |
|------|--------|
| Novas funcionalidades | ❌ Nenhuma implementada |
| Componentes promovidos a compartilhados | ❌ Nenhum (proibido nesta sprint) |
| Refatorações preventivas | ❌ Nenhuma |
| Regras de negócio alteradas | ❌ Nenhuma |

---

## [Sprint T.1] — 2026-07-15 — Transição Oficial para Desenvolvimento do ERP

**Tipo:** Governança + Consolidação — nenhum código, schema, tipo, API ou front-end alterado.

### Contexto

Encerra a trilha de infraestrutura de IA (Sprints G.5.0–G.5.7), executada em paralelo ao roadmap de Épicos/Sprints do ERP, sem alterá-lo. A trilha G.5.x construiu, nesta ordem: infraestrutura de Skills e meta-skill (G.5.0–G.5.2), certificação (G.5.2.1), arquitetura do AI Operating System em 7 camadas (G.5.3), 9 Sub-agents reais (G.5.4), camada Operational Protocols — 8 camadas (G.5.5), 10 Playbooks (G.5.6), certificação final e Baseline v1.0 (G.5.7).

### Arquivos criados

| Arquivo | Conteúdo |
|---|---|
| `AIOS_BASELINE_v1.md` | Baseline operacional/de governança do AI Operating System — escopo, componentes congelados/extensíveis, política de manutenção |
| `ERP_DEVELOPMENT_WORKFLOW.md` | Fluxo oficial único para toda Ordem de Missão futura de desenvolvimento do ERP (12 seções: ciclo de vida, papéis, uso obrigatório de Skills/Protocols/Playbooks, autoauditoria, correção, validação, documentação, encerramento) |

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `PROJECT_GOVERNANCE.md` | Nova Seção 13.7 "Modo de manutenção" — 4 condições simultâneas exigidas para qualquer evolução futura da infraestrutura de IA |
| `PLAN.md` | Banner de mudança de fase adicionado no topo, apontando para `AIOS_BASELINE_v1.md`/`ERP_DEVELOPMENT_WORKFLOW.md` — nenhum Épico/Sprint/status do roadmap alterado |

### Confirmações de escopo

| Item | Status |
|------|--------|
| Código-fonte | ❌ Não alterado |
| Schema / Types / Repository / Validator / Service / API / Front-end | ❌ Não alterados |
| `REGRAS_NEGOCIO.md` | ❌ Não alterado |
| Roadmap de Épicos/Sprints (conteúdo) | ❌ Não alterado |
| Novas Skills/Sub-agents/Contracts/Protocols/Playbooks | ❌ Nenhum criado (proibido pelo escopo desta sprint) |

---

## [Sprint G.2] — 2026-07-11 — Evolução da Metodologia do AI Prompt Orchestrator

**Tipo:** Documentação de processo — nenhum código, schema, tipo, API ou front-end alterado.

### Arquivo alterado

| Arquivo | Mudança |
|---------|---------|
| `docs/ai/AI_PROMPT_ORCHESTRATOR.md` | Versão 1.1 → 1.2; 2 novas fases; 1 novo artefato oficial; 2 seções novas; 1 subseção nova; diagramas atualizados |

### Seções criadas

| Seção | Conteúdo |
|-------|----------|
| FASE 0 — Análise Arquitetural | Formaliza o trabalho do Orchestrator antes da geração da Sprint; absorve o conteúdo da antiga Seção 6 (Auditoria Prévia) e adiciona: entendimento do objetivo, conflitos com módulos existentes, validação do roadmap, estratégia de implementação; resultado obrigatório: `SPRINT_X.md` + `SPRINT_AUDIT.md` |
| FASE 6 — Evolução da Governança | Avaliação de padrões repetitivos, regras candidatas a governança, simplificação e prevenção de retrabalho após cada Sprint auditada |
| Estados da Sprint | 8 estados obrigatórios (PLANEJADA → ORQUESTRADA → VALIDADA → EM IMPLEMENTAÇÃO → IMPLEMENTADA → AUTOAUDITADA → AUDITADA → ENCERRADA), transição somente para frente |
| Fluxo Oficial de Auditoria | Sequência obrigatória de 9 passos que o Auditor deve seguir, da conferência de escopo à geração do Prompt da próxima Sprint |
| Responsabilidades obrigatórias do Orchestrator (subseção da Seção 2) | 7 perguntas que o Orchestrator deve responder antes de gerar qualquer Sprint |

### Seções alteradas

| Seção | Mudança |
|-------|---------|
| 2. Papéis | Adicionada a subseção "Responsabilidades obrigatórias do Orchestrator" |
| 3. Fluxo Oficial | Diagrama atualizado com FASE 0, `SPRINT_AUDIT.md` e FASE 6 |
| 4. Fluxo Operacional | Etapas 1 e 2 atualizadas para referenciar os dois artefatos e a FASE 0 |
| 5. (antes "Documento Obrigatório da Sprint") | Retitulada "Artefatos Obrigatórios da Sprint"; reestruturada em Documento 1 (`SPRINT_X.md`, estrutura preservada) e Documento 2 (`SPRINT_AUDIT.md`, novo, 11 itens); lista de leitura obrigatória passa a incluir `SPRINT_AUDIT.md` |
| 11. (antes "Processo Oficial de Trabalho") | Diagrama final atualizado com FASE 0, FASE 6 e os estados ORQUESTRADA/ENCERRADA |
| 12. Histórico | Nova linha da versão 1.2 |

### Seções removidas (conteúdo absorvido, não perdido)

| Antiga | Absorvida por |
|--------|----------------|
| 6. Auditoria Prévia | FASE 0 — Análise Arquitetural (todos os itens originais preservados: Impacto Arquitetural, Dependências, Riscos, Melhorias) |

### Novo artefato oficial

`SPRINT_AUDIT.md` — segundo documento obrigatório de toda Sprint, produzido pelo Orchestrator na FASE 0, com estrutura mínima de 11 itens.

### Renumeração

Seções 6 (removida/absorvida), 7→6, 8→7, 9→8, 10→9, 11→10, 12→11, 13→12, em decorrência da consolidação.

### Confirmações de escopo

| Item | Status |
|------|--------|
| Código-fonte | ❌ Não alterado |
| Schema / Types / Repository / Validator / Service / API / Front-end | ❌ Não alterados |
| `PROJECT_GOVERNANCE.md` | ❌ Não alterado |
| `REGRAS_NEGOCIO.md` | ❌ Não alterado |
| `PLAN.md` | ❌ Não alterado |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |

---

## [Sprint G.1] — 2026-07-11 — Evolução arquitetural do AI_PROMPT_ORCHESTRATOR.md

**Tipo:** Documentação de processo — nenhum código, schema, tipo, API ou front-end alterado.

### Arquivo alterado

| Arquivo | Mudança |
|---------|---------|
| `docs/ai/AI_PROMPT_ORCHESTRATOR.md` | Versão 1.0 → 1.1; papéis reformulados; 2 novas fases; 1 seção nova; 2 seções consolidadas |

### Seções alteradas

| Seção | Mudança |
|-------|---------|
| 2. Papéis | Substituída referência direta a ChatGPT/Claude Code por papéis arquiteturais: Product Owner, Orchestrator, Executor, Auditor |
| 3. Fluxo Oficial | Diagrama atualizado com as novas etapas FASE -1 e FASE 0.5 |
| 4. Fluxo Operacional | Atores das Etapas 1–5 renomeados para os papéis correspondentes |
| 6. Auditoria Prévia | Ator renomeado de ChatGPT para Orchestrator |
| 7. Auditoria Pós-Execução | Atores renomeados de Claude/ChatGPT para Executor/Auditor |
| 8. Resultado da Auditoria | Adicionada frase explicitando que a auditoria pode ser realizada por qualquer agente no papel de Auditor |

### Seções adicionadas

| Seção | Conteúdo |
|-------|----------|
| FASE -1 — Validação da Sprint | Checklist obrigatório que o Executor verifica antes de qualquer leitura de código |
| FASE 0.5 — Auditoria de Contratos | Verificação obrigatória de DTOs, Types, contratos HTTP e interfaces públicas antes de criar qualquer arquivo |

### Seções renomeadas e com conteúdo substituído

| Antiga | Nova | Mudança |
|--------|------|---------|
| 5. Estrutura Obrigatória dos Prompts | 5. Documento Obrigatório da Sprint | Conteúdo substituído: exigência do documento `SPRINT_X.md`, sua estrutura obrigatória de 11 itens, e a lista de leitura obrigatória (antes item 3 da estrutura de prompts) |

### Seções consolidadas

| Antigas | Nova | Mudança |
|---------|------|---------|
| 9. Regras Permanentes + 10. Regras para o Claude | 9. Regras Gerais | Conteúdo unificado em uma única lista de proibições e obrigações |

### Duplicidades eliminadas

- Bloco "Auditoria crítica" (antes duplicado dentro da Seção 5) removido; classificação de achados agora referencia exclusivamente a Seção 24 do `PROJECT_GOVERNANCE.md`, sem restatement local.
- Regras equivalentes das antigas Seções 9 e 10 unificadas em uma única lista, sem repetição.

### Renumeração

Seções 11–14 renumeradas para 10–13 em decorrência da consolidação das Seções 9+10.

### Regra nova incorporada

Proibição de criação de sub-sprints (ex.: `2.D.2.1`, `2.D.2.2`) para ajustes pontuais, exceto quando previamente planejados como entregas independentes — incorporada à Seção 9 (Regras Gerais).

### Confirmações de escopo

| Item | Status |
|------|--------|
| Código-fonte | ❌ Não alterado |
| `PROJECT_GOVERNANCE.md` | ❌ Não alterado |
| `REGRAS_NEGOCIO.md` | ❌ Não alterado |
| `PLAN.md` | ❌ Não alterado |
| Sprints existentes | ❌ Não alteradas |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |

---

## [Governança] — 2026-07-06 — PROJECT_GOVERNANCE.md: correção de caminho e Política de Evolução da Governança

**Tipo:** Documentação de governança — nenhum código, schema, tipo, API ou front-end alterado.

### Arquivo alterado

| Arquivo | Mudança |
|---------|---------|
| `PROJECT_GOVERNANCE.md` | Correção de caminho na seção "Documentação de IA"; Seção 26 adicionada |

### Alterações

| Item | Descrição |
|------|-----------|
| Seção "Documentação de IA" | Caminho corrigido de `docs/ai/` para `docs/`, refletindo a localização real de `AI_PROMPT_ORCHESTRATOR.md` |
| Seção 26 — Política de Evolução da Governança | Nova seção: `PROJECT_GOVERNANCE.md` é documento estável; novas regras só podem ser adicionadas mediante inconsistência arquitetural recorrente, decisão via ADR, ou lacuna de auditoria não resolvível pelas regras existentes; proibido criar regra para caso isolado de uma única sprint |

### Confirmações de escopo

| Item | Status |
|------|--------|
| Código-fonte | ❌ Não alterado |
| `PLAN.md` | ❌ Não alterado |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |

---

## [Governança] — 2026-07-06 — PROJECT_GOVERNANCE.md: refinamento de ambiguidades (Seções 8.7, 24, 25)

**Tipo:** Documentação de governança — nenhum código, schema, tipo, API ou front-end alterado.

### Arquivo alterado

| Arquivo | Mudança |
|---------|---------|
| `PROJECT_GOVERNANCE.md` | 4 regras refinadas nas Seções 8.7, 24 e 25 |

### Regras refinadas

| Seção | Regra adicionada |
|-------|-------------------|
| 8.7 | Após consolidação dos tipos públicos em `types.ts`, os tipos locais equivalentes devem ser removidos, evitando duplicidade de definição |
| 24 | Observação Técnica e Melhoria Futura nunca têm caráter bloqueante; somente Inconsistência bloqueia o encerramento |
| 25 | O checklist da Seção 25 complementa o DoD da Seção 23; em caso de conflito, prevalece o DoD |
| 25 | O checklist da Seção 25 é executado uma única vez, apenas no encerramento oficial do módulo — nunca no encerramento de sprints |

### Confirmações de escopo

| Item | Status |
|------|--------|
| Código-fonte | ❌ Não alterado |
| `prisma/schema.prisma` | ❌ Não alterado |
| `src/lib/types.ts` | ❌ Não alterado |
| `PLAN.md` | ❌ Não alterado |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |

---

## [Governança] — 2026-07-06 — PROJECT_GOVERNANCE.md: novas regras permanentes

**Tipo:** Documentação de governança — nenhum código, schema, tipo, API ou front-end alterado.

### Origem

Auditoria final do Módulo 2.D (até Sprint 2.D.4): nenhuma inconsistência encontrada; nenhuma correção de código necessária.

### Arquivo alterado

| Arquivo | Mudança |
|---------|---------|
| `PROJECT_GOVERNANCE.md` | 3 seções adicionadas: 8.7, 24, 25 |

### Seções adicionadas

| Seção | Título | Conteúdo |
|-------|--------|----------|
| 8.7 | Tipos compartilhados | Regra sobre localização de tipos públicos (`types.ts`) vs. tipos locais permitidos durante implementação de domínio |
| 24 | Resultado das Auditorias | Classificação obrigatória de achados de auditoria em Inconsistência / Observação Técnica / Melhoria Futura |
| 25 | Checklist obrigatório para encerramento de módulo | Checklist de verificação rápida, complementar ao DoD da Seção 23 |

### Confirmações de escopo

| Item | Status |
|------|--------|
| `prisma/schema.prisma` | ❌ Não alterado |
| `unitRepository.ts` / `unitValidator.ts` / `unitService.ts` | ❌ Não alterados |
| Rotas da API | ❌ Não alteradas |
| `src/lib/types.ts` | ❌ Não alterado |
| `PLAN.md` | ❌ Não alterado |
| `REGRAS_NEGOCIO.md` | ❌ Não alterado |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |

---

## [Sprint 2.G.2] — 2026-07-15 — API + Frontend — Módulo Ingredientes

**Tipo:** Implementação de API + UI — Schema/Repository/Validator/Service não alterados (Sprint 2.G.1 consumida como está).

### Arquivos criados (11)

| Arquivo | Camada |
|---------|--------|
| `src/app/api/admin/ingredient-categories/route.ts` | API — `GET`/`POST` |
| `src/app/api/admin/ingredient-categories/[id]/route.ts` | API — `PATCH`/`DELETE` |
| `src/app/api/admin/ingredients/route.ts` | API — `GET`/`POST` |
| `src/app/api/admin/ingredients/[id]/route.ts` | API — `PATCH` |
| `src/app/api/admin/ingredients/[id]/activate/route.ts` | API — `PATCH` |
| `src/app/api/admin/ingredients/[id]/deactivate/route.ts` | API — `PATCH` |
| `src/app/api/admin/ingredients/[id]/price-history/route.ts` | API — `GET` |
| `src/lib/api/ingredientCategoryApi.ts` | Cliente HTTP admin |
| `src/lib/api/ingredientApi.ts` | Cliente HTTP admin |
| `src/app/admin/ingredientes/page.tsx` | Front-end — Ingredientes |
| `src/app/admin/ingredientes/categorias/page.tsx` | Front-end — Categorias de ingrediente |

### Arquivo alterado (1)

| Arquivo | Mudança |
|---------|---------|
| `src/app/admin/page.tsx` | Card "Insumos" → "Ingredientes", aponta para `/admin/ingredientes`, `ready: true` (mesmo padrão de 2.D.5) |

### Funcionalidades implementadas

Ingredientes: listagem, criação, edição, ativação/desativação, pesquisa por nome, filtro por status, filtro por categoria, filtro "somente estoque baixo" (usa `isLowStock` já calculado no Service), preço formatado em BRL. Categorias de ingrediente: listagem, criação, edição, exclusão (bloqueada se houver ingrediente vinculado, mensagem consumida da API).

### Endpoints consumidos

7 rotas administrativas listadas acima, todas via `fetch` em `ingredientApi.ts`/`ingredientCategoryApi.ts` — nenhuma chamada a Service/Repository/Prisma fora da API.

### Integração com Units

Formulário de Ingrediente consome `unitApi.listUnits()` (já existente) para o seletor de unidade — nenhum arquivo de Units alterado.

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ Sucesso — 7 rotas de API + 2 páginas geradas |

### Confirmações de escopo

| Item | Status |
|------|--------|
| Schema/Repository/Validator/Service | ❌ Não alterados |
| Regra de negócio fora do Service | ❌ Nenhuma |
| Acesso a Prisma/Repository fora da API | ❌ Não existe |
| Integração antecipada com Receitas/Compras/Estoque | ❌ Nenhuma |

---

## [Sprint R.1] — 2026-07-15 — Revisão Arquitetural das Dependências entre Módulos

**Tipo:** Revisão documental — nenhum código, Schema, Skill, Sub-agent, Contract, Protocol ou Playbook alterados.

### Metodologia

Todas as 10 dependências declaradas em `PLAN.md` (Módulos 2.B–2.L) confrontadas contra `prisma/schema.prisma` (campos e relações reais) e `REGRAS_NEGOCIO.md` (regras de domínio documentadas), classificando cada uma como: decorre de regra de negócio, de limitação técnica, de entidade obrigatória (FK), de relacionamento futuro, ou apenas de ordem histórica.

### Dependência corrigida (1)

| Módulo | Dependência anterior | Dependência corrigida | Justificativa objetiva |
|---|---|---|---|
| **2.I** (Receitas) | `2.G + 2.D + 2.H` | `2.G + 2.D` | `RecipeIngredient` (schema) tem apenas `recipeId`, `ingredientId`, `quantity`, `unitId` — nenhum campo ou relação com `Packaging`. `REGRAS_NEGOCIO.md` Seção 6 (Receitas, completa) nunca menciona embalagem. A dependência de 2.H não tem respaldo técnico nem de negócio — embalagem afeta o custo do **Produto** (futuro, não modelado), não da Receita. |

### Dependências mantidas, todas com justificativa técnica ou de negócio confirmada (9)

`2.B`→Nenhuma (raiz do catálogo); `2.C`→Nenhuma (independente, N:N opcional com Product); `2.D`→Nenhuma (raiz, `UnitOfMeasure`/`UnitConversion` autocontidos); `2.F`→`2.B` (FK obrigatória `Product.categoryId`, confirmada em `REGRAS_NEGOCIO.md` 3.4) + `2.C` (ver Observações Técnicas — dependência real, mas de natureza diferente de 2.B); `2.G`→`2.D` (FK obrigatória `Ingredient.unitId`, já corrigido na Sprint 2.G.1); `2.J`→`2.F` (RecipeLinker liga a um Product já existente) + `2.I` (liga a uma Recipe já existente); `2.K`→`2.I`+`2.J`+Orders (consolidação de ingredientes e CMV exigem ambos); `2.L`→Orders (LTV/histórico exigem pedidos existentes, já satisfeita).

### Observações Técnicas (não correções — sem respaldo suficiente para alterar, registradas para decisão futura)

1. **2.F → 2.C**: dependência real, mas **não é FK obrigatória** — `Product`↔`OccasionTag` é N:N via `ProductOccasion`, e `REGRAS_NEGOCIO.md` 3.5 diz "um produto pode ter zero ou mais ocasiões". É uma dependência de UX (permitir atribuir ocasião no mesmo formulário de criação do produto), não uma restrição de schema. Não corrigida — já satisfeita (2.C concluído) e reclassificá-la não muda nenhuma ordem prática.
2. **2.H → 2.D**: plausível por analogia com `Ingredient` (que usa `UnitOfMeasure` para estoque/custo), mas **não verificável no schema atual** — `Packaging`/`PackagingItem` ainda não existem (`REGRAS_NEGOCIO.md` Seção 8: "Entidade não implementada... A definir"). Mantida como antecipação de design razoável, não como dependência comprovada — será confirmada quando 2.H modelar o schema.
3. **2.E (Fornecedores)**: não tem nenhum módulo consumidor na sequência atual do roadmap (2.F–2.L) — `Ingredient.supplier` é texto livre, não FK. Provavelmente serve um futuro módulo de Compras/Estoque (`REGRAS_NEGOCIO.md`, "Lacunas conhecidas" itens 9–10), ainda não presente no roadmap. Não é um módulo órfão incorreto — é infraestrutura antecipada para algo fora do escopo atual do ÉPICO 2.

### Autoauditoria

Dependências circulares: nenhuma (grafo confirmado como DAG, 2.B/2.C/2.D/2.E na raiz, 2.L na folha). Dependências redundantes: nenhuma. Módulos órfãos: nenhum incorreto (ver Observação 3). Inconsistências PLAN.md × REGRAS_NEGOCIO.md × Schema: 1 encontrada e corrigida (ver acima).

### Confirmações de escopo

| Item | Status |
|------|--------|
| Código/Schema/Repository/Validator/Service/API/Frontend | ❌ Não alterados |
| AI Operating System / Skills / Sub-agents / Contracts / Protocols / Playbooks | ❌ Não alterados |
| Novos módulos criados ou renomeados | ❌ Nenhum |

---

## [Sprint 2.G.1] — 2026-07-15 — Backend Completo — Módulo Ingredientes

**Tipo:** Implementação Funcional (Repository + Validator + Service) — Schema não alterado (nenhuma lacuna real exigiu ajuste); nenhuma API ou Front-end implementados (fora de escopo desta sprint).

### Achado de FASE 0 — dependência de `PLAN.md` corrigida

`PLAN.md` listava 2.G como dependente de "2.D + 2.E" (Fornecedores). Verificação do schema (`Ingredient.supplier: String?`) e de `REGRAS_NEGOCIO.md` Seção 7.4 ("Entidade Fornecedor com cadastro completo: A definir") confirmou que não há FK entre `Ingredient` e nenhuma entidade `Supplier` — a dependência de 2.E não existe na prática, só era aspiracional. Corrigida em `PLAN.md`.

### Arquivos criados (6)

| Arquivo | Camada |
|---------|--------|
| `src/lib/repositories/ingredientCategoryRepository.ts` | Repository — `IngredientCategory` |
| `src/lib/validators/ingredientCategoryValidator.ts` | Validator — `IngredientCategory` |
| `src/lib/ingredientCategoryService.ts` | Service — `IngredientCategory` |
| `src/lib/repositories/ingredientRepository.ts` | Repository — `Ingredient` + `IngredientPriceHistory` |
| `src/lib/validators/ingredientValidator.ts` | Validator — `Ingredient` |
| `src/lib/ingredientService.ts` | Service — `Ingredient` |

### Schema

**Não alterado.** `Ingredient`/`IngredientCategory`/`IngredientPriceHistory` já existiam desde a modelagem original do ÉPICO 2 — nenhuma lacuna real encontrada que justificasse ajuste.

### Regras de negócio implementadas (de `REGRAS_NEGOCIO.md`)

- Seção 7.2: toda criação/atualização de `currentPrice` gera um registro em `IngredientPriceHistory` (fonte default `MANUAL`, sobrescrevível via `priceSource`).
- Seção 3.3: `active: false` bloqueia a entidade de novas receitas — campo exposto/alternável nesta sprint; a restrição do lado de `RecipeIngredient` pertence à Sprint 2.I (Receitas não existe ainda).
- Seção 3.3/7.3: alerta de estoque mínimo implementado como campo derivado `isLowStock` (`stockQuantity <= minStock`) no DTO — não há especificação de UI/notificação em `REGRAS_NEGOCIO.md`, então apenas o sinal foi exposto, nada além disso.

### Regras técnicas de integridade (não citações literais de REGRAS_NEGOCIO.md — documentado explicitamente no código)

`currentPrice > 0`; `stockQuantity`/`minStock >= 0` — mesma categoria de `sortOrder >= 0` (2.D) e `factor > 0` (2.D.7).

### Integração com Units

`findUnitById` (já existente em `unitRepository.ts`) consumido somente leitura pelo Service de `Ingredient` para validar `unitId` — nenhuma alteração em arquivos de Units.

### Decisão arquitetural registrada

`IngredientPriceHistory` (Repository e funções) vive dentro de `ingredientRepository.ts`, não em arquivo próprio — tratado como sub-recurso de `Ingredient` (auditoria de um campo), não como domínio independente com CRUD próprio. Sinalizado como decisão de julgamento, não convenção previamente documentada no projeto.

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ Sucesso (nenhuma rota nova — sem API nesta sprint, como esperado) |

### Confirmações de escopo

| Item | Status |
|------|--------|
| API | ❌ Não implementada (fora de escopo) |
| Front-end | ❌ Não implementado (fora de escopo) |
| Regras fora do Service | ❌ Nenhuma |
| Módulos já homologados (Units) | ❌ Não alterados |

---

## [Sprint 2.D.7] — 2026-07-15 — Implementação Completa do Domínio UnitConversion

**Tipo:** Implementação Funcional — Schema não alterado (model já existia desde 2.D.1); `UnitOfMeasure` não alterado.

### Arquivos criados (6)

| Arquivo | Camada |
|---------|--------|
| `src/lib/repositories/unitConversionRepository.ts` | Repository — `listAllConversions`, `findConversionById`, `findConversion`, `createConversion`, `updateConversion`, `deleteConversion` |
| `src/lib/validators/unitConversionValidator.ts` | Validator — `validateConversionCreate`/`validateConversionUpdate` |
| `src/lib/unitConversionService.ts` | Service — 4 erros de domínio (`ConversionNotFoundError`, `ConversionValidationFailedError`, `DuplicateConversionError`, `InvalidUnitReferenceError`) |
| `src/app/api/admin/units/conversions/route.ts` | API — `GET`/`POST` |
| `src/app/api/admin/units/conversions/[id]/route.ts` | API — `PATCH`/`DELETE` |
| `src/lib/api/unitConversionApi.ts` | Cliente HTTP admin |
| `src/app/admin/unidades/conversoes/page.tsx` | Front-end — listagem, criação, edição, exclusão, pesquisa |

### Arquivos alterados (1)

| Arquivo | Mudança |
|---------|---------|
| `src/app/admin/unidades/page.tsx` | Link de navegação "Conversões entre unidades →" adicionado — nenhuma lógica existente tocada |

### Decisão arquitetural registrada

**Exclusão física (hard delete), não desativação.** `UnitConversion` não tem campo `isActive` no schema (diferente de `UnitOfMeasure`) — decisão desta sprint: manter sem soft delete, já que é dado de referência matemática estática (ex. "1 kg = 1000 g"), sem histórico próprio, e nenhuma entidade referencia `UnitConversion` via FK (só o inverso). Nenhuma alteração de schema foi necessária.

### Regras de negócio implementadas

Unicidade do par origem/destino (`@@unique([fromUnitId, toUnitId])`, já existente no schema desde 2.D.1) tratada com mensagem de domínio (`DuplicateConversionError`) em vez de erro genérico de constraint. Existência de ambas as unidades referenciadas verificada no Service antes de criar/atualizar. Fator > 0 e origem ≠ destino são restrições técnicas de integridade (mesma categoria de `sortOrder >= 0` em `unitValidator.ts`), não citações literais de `REGRAS_NEGOCIO.md` — documentado explicitamente no código para não confundir fonte da regra.

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ Sucesso — rotas `/admin/unidades/conversoes`, `/api/admin/units/conversions`, `/api/admin/units/conversions/[id]` geradas |

### Confirmações de escopo

| Item | Status |
|------|--------|
| `UnitOfMeasure` (regras/funcionalidades já homologadas) | ❌ Não alterado |
| `prisma/schema.prisma` | ❌ Não alterado |
| Novas entidades fora de `UnitConversion` | ❌ Nenhuma criada |
| Acesso a Repository/Prisma fora da própria camada | ❌ Não existe |

---

## [Sprint 2.D.6] — 2026-07-15 — QA Funcional, Homologação e Encerramento do Módulo Units

**Tipo:** Validação + Documentação — nenhum Schema, Repository, Validator, Service ou API alterados; 1 correção de texto de UI (não funcional).

### Arquivo criado

| Arquivo | Conteúdo |
|---------|----------|
| `MODULE_2D_CLOSURE.md` | Encerramento oficial: escopo, arquitetura, componentes, APIs, funcionalidades validadas, pendências conhecidas, lições aprendidas, padrões reutilizáveis |

### Arquivo alterado

| Arquivo | Mudança |
|---------|---------|
| `src/app/admin/page.tsx` | Descrição do card "Unidades" corrigida de "Medidas e conversões" para "Medidas usadas em ingredientes e receitas" — o texto anterior prometia funcionalidade de conversão inexistente (achado real desta QA, ver `MODULE_2D_CLOSURE.md` item 6) |
| `PLAN.md` | Módulo 2.D marcado ✅ Concluído, com ressalva explícita sobre `UnitConversion` não implementado |

### QA executado

Validação funcional (criação/edição/ativação/desativação/listagem/filtros/ordenação/mensagens/estados) por leitura de código de todas as camadas — aprovada. Auditoria arquitetural (Route→Service→Repository→Prisma, sem regra de negócio no Frontend/rotas, sem acesso direto ao Prisma fora do Repository, sem duplicidade, reutilização de componentes) — aprovada. Validação documental (PLAN.md/CHANGELOG.md/REGRAS_NEGOCIO.md) — encontrou e corrigiu divergência PLAN.md/CHANGELOG.md (ver Sprint 2.D.5 complementar acima) e confirmou lacuna já conhecida de `UnitConversion` (`REGRAS_NEGOCIO.md` item 12 das Lacunas conhecidas).

### Validações técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ Sucesso |

### Confirmações de escopo

| Item | Status |
|------|--------|
| Novas funcionalidades | ❌ Nenhuma implementada |
| Regras de negócio | ❌ Não alteradas |
| Schema / Repository / Validator / Service / API | ❌ Não alterados (nenhuma inconsistência real que exigisse correção foi encontrada nessas camadas) |

**Pendência registrada, não resolvida nesta sprint:** `UnitConversion` sem implementação em nenhuma camada — ver `MODULE_2D_CLOSURE.md` item 6.

---

## [Complemento à Sprint 2.D.5] — 2026-07-15 — Filtros de Status/Tipo e Ordenação Secundária

**Tipo:** Implementação de UI — nenhum Schema, Repository, Validator, Service ou API alterados.

**Nota de reconciliação:** uma ordem de missão rotulada "Sprint 2.D.5" foi recebida em 15/07/2026 pedindo a implementação completa do front-end de Unidades de Medida. Verificação em FASE 0 encontrou que `src/app/admin/unidades/page.tsx` já existia, quase completo, e que este próprio arquivo já registra "Sprint 2.D.5" como concluída em 06/07/2026 (ver entrada abaixo) — `PLAN.md` estava desatualizado, ainda listando o Módulo 2.D como "Planejado" (corrigido nesta mesma data, ver "Arquivos alterados"). Para não duplicar um identificador de sprint já usado, e por `EPICO_2_PLANEJAMENTO.md` proibir sub-sprints do tipo `2.D.5.1` para ajustes pontuais, este trabalho é registrado como complemento, não como nova sprint.

### O que faltava em relação à Sprint 2.D.5 original

Comparado à descrição original abaixo, dois filtros e um critério de ordenação pedidos por esta nova ordem não faziam parte do escopo de 06/07/2026: filtro por status (Ativas/Inativas/Todos), filtro por tipo (Massa/Volume/Unidade/Todos), e ordenação secundária por nome (empate de `sortOrder`).

### Arquivo alterado

| Arquivo | Mudança |
|---------|---------|
| `src/app/admin/unidades/page.tsx` | Componente `FilterChips` genérico adicionado (reutiliza o padrão visual de `CategoryChips`, `src/components/vitrine/ProductCard.tsx`); estado `statusFilter`/`typeFilter`; `filtered` agora aplica os 3 filtros (nome, status, tipo) e ordena por `sortOrder` com `name` (pt-BR) como desempate; `EmptyState` passa a considerar os 3 filtros, não só a busca por nome |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ Compilado com sucesso, rota `/admin/unidades` gerada |

Servidor dev não iniciado por mim para teste visual (já havia uma instância do usuário rodando na porta 3000 — não interrompida); `curl` à rota confirmou HTTP 307 (redirecionamento para login), comportamento esperado do proxy para acesso não autenticado — sem confirmação visual da renderização.

---

## [Sprint 2.D.5] — 2026-07-06 — Front-end Administrativo: UnitOfMeasure

**Tipo:** Implementação de UI + cliente HTTP — nenhum Schema, Repository, Validator, Service ou API alterados.

### Arquivos criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/api/unitApi.ts` | Cliente HTTP do admin — 5 funções (`listUnits`, `createUnit`, `updateUnit`, `activateUnit`, `deactivateUnit`) + `ApiRequestError` |
| `src/app/admin/unidades/page.tsx` | Página completa com lista, pesquisa, modais e estados |

### Alterações em arquivos existentes

| Arquivo | Mudança |
|---------|---------|
| `src/app/admin/page.tsx` | Link `/admin/unidades` adicionado ao hub com `ready: true` (mesmo padrão das Sprints 2.B.5/2.C.6) |

### Endpoints consumidos

| Método | Rota | Uso na página |
|--------|------|---------------|
| `GET` | `/api/admin/units` | Carregamento da listagem |
| `POST` | `/api/admin/units` | Criação |
| `PATCH` | `/api/admin/units/[id]` | Edição |
| `PATCH` | `/api/admin/units/[id]/activate` | Ativação |
| `PATCH` | `/api/admin/units/[id]/deactivate` | Desativação |

Nenhuma chamada ao Service ocorre fora de `unitApi.ts` — todas via `fetch` às rotas acima.

### Componentes reutilizados do Módulo 2.C (padrão replicado)

`Field`, `StatusBadge`, `LoadingState`, `EmptyState`, `ErrorState`, `UnitCard` (equivalente a `OccasionCard`), `UnitModal` (equivalente a `OccasionModal`), `ConfirmModal` — mesma estrutura de estados (`loading`, `submitting`, `fieldErrors`, `toast`, `actionLoading`) e mesmo componente compartilhado `ValidationSummary`.

### Nota técnica — tipos no cliente HTTP

`UnitOfMeasureDTO` (tipo de retorno do Service) não é exportado e `src/lib/types.ts` está fora do escopo desta sprint. `unitApi.ts` declara localmente o tipo `UnitOfMeasure` (forma de exibição, com `id`/`isActive`/`createdAt`/`updatedAt`) e reutiliza `UnitOfMeasureInput` (já exportado por `unitValidator.ts` desde a Sprint 2.D.2, importado via `import type`) para os payloads de criação/atualização.

### Desvios deliberados em relação ao padrão 2.C

| Item | Decisão | Motivo |
|------|---------|--------|
| Campo `Tipo` | `<select>` com 3 opções (Massa/Volume/Unidade) mapeadas para `MASS`/`VOLUME`/`UNIT` | Campo inexistente em Ocasiões; valor enviado à API é sempre o literal em maiúsculas, nunca a label em português |
| Card: sigla + ordem | Grade de 2 blocos (`Sigla`, `Ordem`) no lugar de ícone + ordem | `UnitOfMeasure` não tem `color`/`icon` |
| Modal de confirmação de desativação | Texto não menciona bloqueio por vínculo | `deactivateUnit()` não implementa bloqueio por uso (confirmado em auditoria da Sprint 2.D.3/2.D.4) — diferente de Ocasiões/Categorias, que bloqueiam quando há produtos vinculados |

### Tratamento de erros HTTP

| Status | Origem | Tratamento visual |
|--------|--------|-------------------|
| 400 | `ValidationFailedError` | `ApiRequestError.details` mapeado para `formErrors` por campo + toast "Corrija os campos destacados." |
| 401 | Sessão ausente (`requireAdmin`) | Toast de erro com a mensagem retornada pela API |
| 403 | Papel insuficiente (`requireAdmin`) | Toast de erro com a mensagem retornada pela API |
| 404 | `NotFoundError` | Toast de erro ("Unidade não encontrada.") |
| 409 | `DuplicateNameError` / `DuplicateAbbreviationError` | Toast de erro com a mensagem específica retornada pela API |
| 500 | Erro inesperado | Toast de erro genérico |
| Loading | Fetch inicial e ações | Skeletons na listagem; toast "loading" durante submit/ativar/desativar |
| Empty state | Lista vazia ou pesquisa sem resultado | Mensagens distintas + CTA "Criar unidade" (oculto durante filtro ativo) |
| Confirmação de desativação | Antes de `PATCH .../deactivate` | `ConfirmModal` dedicado |

### Confirmações de escopo

| Item | Status |
|------|--------|
| `prisma/schema.prisma` | ❌ Não alterado |
| `src/lib/types.ts` | ❌ Não alterado |
| `unitRepository.ts` / `unitValidator.ts` / `unitService.ts` | ❌ Não alterados |
| Rotas da API | ❌ Não alteradas |
| Acesso a Service, Repository ou Prisma no front-end | ❌ Não existe |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |

**Build:** não executado — reservado para a sprint de QA/encerramento do módulo (mesmo padrão das Sprints 2.B.5/2.C.6).

**Próximo:** Sprint 2.D.6 — QA e encerramento do Módulo 2.D.

---

## [Sprint 2.D.4] — 2026-07-06 — API: UnitOfMeasure

**Tipo:** Implementação de rotas HTTP — nenhum Schema, Repository, Validator, Service ou Front-end alterado.

### Arquivos criados

| Arquivo | Método | Rota | Auth | Service usado |
|---------|--------|------|------|----------------|
| `src/app/api/units/route.ts` | `GET` | `/api/units` | Pública | `listActiveUnits()` |
| `src/app/api/admin/units/route.ts` | `GET` | `/api/admin/units` | Admin | `listAllUnits()` |
| `src/app/api/admin/units/route.ts` | `POST` | `/api/admin/units` | Admin | `createUnit(input)` |
| `src/app/api/admin/units/[id]/route.ts` | `PATCH` | `/api/admin/units/[id]` | Admin | `updateUnit(id, input)` |
| `src/app/api/admin/units/[id]/activate/route.ts` | `PATCH` | `/api/admin/units/[id]/activate` | Admin | `activateUnit(id)` |
| `src/app/api/admin/units/[id]/deactivate/route.ts` | `PATCH` | `/api/admin/units/[id]/deactivate` | Admin | `deactivateUnit(id)` |

Sem `DELETE` em nenhuma rota.

### Mapeamento de erros

| Erro do Service | HTTP | Código |
|----------------|------|--------|
| `ValidationFailedError` | 400 | `VALIDATION_ERROR` (via `badRequest`) |
| Body JSON inválido | 400 | `INVALID_BODY` |
| Não autenticado | 401 | `UNAUTHORIZED` |
| Papel insuficiente | 403 | `FORBIDDEN` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `DuplicateNameError` | 409 | `DUPLICATE_NAME` |
| `DuplicateAbbreviationError` | 409 | `DUPLICATE_ABBREVIATION` |
| Erro inesperado | 500 | `INTERNAL_ERROR` |

### Nota técnica — tipo de entrada

`UnitOfMeasureInput` importado via `import type` de `@/lib/validators/unitValidator` em `admin/units/route.ts` e `admin/units/[id]/route.ts` — importação apenas de tipo (sem valor, sem chamada de função), usada para tipar o corpo da requisição. Nenhuma função do Validator é chamada pelas rotas.

### Confirmações de escopo

| Item | Status |
|------|--------|
| Acesso a Prisma nas rotas | ❌ Não |
| Acesso a Repository nas rotas | ❌ Não |
| Chamada de função do Validator nas rotas | ❌ Não |
| `unitService.ts` alterado | ❌ Não |
| `unitRepository.ts` alterado | ❌ Não |
| `unitValidator.ts` alterado | ❌ Não |
| `NextResponse.json()` direto | ❌ Não utilizado em nenhuma rota |
| Front-end alterado | ❌ Não |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |

---

## [Sprint 2.D.3] — 2026-07-06 — Service: UnitOfMeasure

**Tipo:** Camada de negócio — nenhuma outra camada alterada.

### Arquivo criado

`src/lib/unitService.ts`

### Erros de domínio

| Classe | Quando lançada |
|--------|---------------|
| `NotFoundError` | `id` não encontrado no banco |
| `ValidationFailedError` | Validator retorna erros |
| `DuplicateNameError` | `name` já existe em outra unidade |
| `DuplicateAbbreviationError` | `abbreviation` já existe em outra unidade |

### Funções implementadas

| Função | Retorno | Fluxo |
|--------|---------|-------|
| `listAllUnits()` | `Promise<UnitOfMeasureDTO[]>` | Repository → map |
| `listActiveUnits()` | `Promise<UnitOfMeasureDTO[]>` | Repository → map |
| `getUnitById(id)` | `Promise<UnitOfMeasureDTO>` | buscar → `NotFoundError` → map |
| `createUnit(input)` | `Promise<UnitOfMeasureDTO>` | trim → validator → unicidade de `name` → unicidade de `abbreviation` → Repository → map |
| `updateUnit(id, input)` | `Promise<UnitOfMeasureDTO>` | buscar → `NotFoundError` → trim → validator → unicidade (se alterado) → Repository → map |
| `activateUnit(id)` | `Promise<UnitOfMeasureDTO>` | buscar → `NotFoundError` → Repository → map |
| `deactivateUnit(id)` | `Promise<UnitOfMeasureDTO>` | buscar → `NotFoundError` → Repository → map |

### Nota técnica — aliasing de imports

Repository e Service compartilham nomes de operação (`listAllUnits`, `listActiveUnits`, `createUnit`, `updateUnit`, `activateUnit`, `deactivateUnit`). As funções do Repository são importadas com prefixo `db` para evitar colisão no escopo do módulo.

### Nota técnica — tipos

`UnitOfMeasureInput` reutilizado de `unitValidator.ts` (já exportado desde a Sprint 2.D.2) como tipo de entrada. `UnitOfMeasureDTO` (tipo de saída, com `createdAt`/`updatedAt` convertidos para ISO string) definido localmente em `unitService.ts`, derivado do tipo `UnitOfMeasure` do `@prisma/client` — `src/lib/types.ts` não foi alterado.

### Confirmações de escopo

| Item | Status |
|------|--------|
| `prisma/schema.prisma` | ❌ Não alterado |
| `src/lib/types.ts` | ❌ Não alterado |
| `unitRepository.ts` | ❌ Não alterado |
| `unitValidator.ts` | ❌ Não alterado |
| API | ❌ Não alterada |
| Front-end | ❌ Não alterado |
| SQL / `$queryRaw` / `$executeRaw` | ❌ Não utilizado |
| Referência a `slug`/`color`/`icon` | ❌ Não existe |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |

---

## [Sprint 2.D.2] — 2026-07-06 — Repository + Validator: UnitOfMeasure

**Tipo:** Camada de dados — nenhuma API, Service, Schema, Types ou UI alterada.

### Arquivos criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/repositories/unitRepository.ts` | Queries Prisma puras para `UnitOfMeasure` |
| `src/lib/validators/unitValidator.ts` | Validações de criação e atualização de `UnitOfMeasure` |

### Funções do Repository

| Função | Descrição |
|--------|-----------|
| `listAllUnits()` | Todas as unidades, ordenadas por `sortOrder` asc |
| `listActiveUnits()` | Apenas unidades com `isActive = true`, ordenadas por `sortOrder` asc |
| `findUnitById(id)` | Busca por `id`; retorna `null` se não encontrada |
| `findUnitByName(name)` | `prisma.unitOfMeasure.findUnique({ where: { name } })` |
| `findUnitByAbbreviation(abbreviation)` | `prisma.unitOfMeasure.findUnique({ where: { abbreviation } })` |
| `createUnit(data)` | Persiste nova unidade com `name`, `abbreviation`, `type`, `sortOrder?` |
| `updateUnit(id, data)` | Persiste alterações de `name?`, `abbreviation?`, `type?`, `sortOrder?` |
| `activateUnit(id)` | Define `isActive = true` |
| `deactivateUnit(id)` | Define `isActive = false` |

`findUnitBySlug` não implementada — `UnitOfMeasure` não possui campo `slug`.

### Funções do Validator

| Função | Campos validados |
|--------|-----------------|
| `validateUnitCreate(input)` | `name` (obrigatório, mín 2, máx 100); `abbreviation` (obrigatório, máx 10, caracteres permitidos); `type` (exclusivamente `MASS`/`VOLUME`/`UNIT`); `sortOrder` (inteiro >= 0) |
| `validateUnitUpdate(input)` | Mesmas regras, todos campos opcionais |

`color` e `icon` não validados — `UnitOfMeasure` não possui esses campos.

### Confirmações de escopo

| Item | Status |
|------|--------|
| `prisma/schema.prisma` | ❌ Não alterado |
| `src/lib/types.ts` | ❌ Não alterado |
| Service | ❌ Não alterado |
| API | ❌ Não alterada |
| Front-end | ❌ Não alterado |
| SQL / `$queryRaw` / `$executeRaw` | ❌ Não utilizado |
| Lógica de negócio no Repository | ❌ Não adicionada |
| Trim/normalização automática no Validator | ❌ Não aplicada (apenas checagem de comprimento) |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |

---

## [Sprint 2.D.1] — 2026-07-06 — Schema: Unidades de Medida

**Tipo:** Correção de schema.

### Alterações no schema (`prisma/schema.prisma`)

**Enum criado:**

```prisma
enum UnitType {
  MASS
  VOLUME
  UNIT
}
```

**`UnitOfMeasure`:**

| Campo | Alteração |
|-------|-----------|
| `type` | `String` → `UnitType` |
| `name` | `@unique` adicionado |
| `isActive` | adicionado — `Boolean @default(true)` |
| `sortOrder` | adicionado — `Int @default(0)` |
| `updatedAt` | adicionado — `DateTime @updatedAt` |

**`UnitConversion`:**

| Campo | Alteração |
|-------|-----------|
| `updatedAt` | adicionado — `DateTime @updatedAt` |

**Comentário removido:** `// "mass", "volume", "unit" — IC-05: converter para enum UnitType em Sprint 2.C`.

### Confirmações de escopo

| Item | Status |
|------|--------|
| `ingredientId` em `UnitConversion` | ❌ Não adicionado |
| Campos de unidade de compra × unidade de consumo em `Ingredient` | ❌ Não adicionados |
| Relacionamento `Recipe.yieldUnit` ↔ `UnitOfMeasure` | ❌ Não alterado |
| `@@map` em qualquer modelo | ❌ Não adicionado |
| `src/lib/types.ts` | ❌ Não alterado |
| Repository | ❌ Não alterado |
| Validator | ❌ Não alterado |
| Service | ❌ Não alterado |
| API | ❌ Não alterada |
| Front-end | ❌ Não alterado |

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `prisma/schema.prisma` | Enum `UnitType` criado; `UnitOfMeasure` e `UnitConversion` alterados conforme tabelas acima |
| `PLAN.md` | Sprint 2.D.1 registrada como concluída |
| `CHANGELOG.md` | Esta entrada |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx prisma generate` | ✅ Prisma Client regenerado |
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ Compilação bem-sucedida — 23 páginas |
| `npx prisma db push` | Não executado |

---

## [Sprint 2.C.7] — 2026-07-06 — QA e Encerramento Oficial do Módulo Ocasiões

**Tipo:** Auditoria final e QA — nenhuma alteração de código. Zero inconsistências encontradas.

### Camadas auditadas

| Camada | Arquivo | Resultado |
|--------|---------|-----------|
| Schema | `prisma/schema.prisma` (`OccasionTag`, `ProductOccasion`) | ✅ Conforme — campos idênticos ao tipo `OccasionTag` em `types.ts` |
| Types | `src/lib/types.ts` (`OccasionTag`, `OccasionTagInput`, `OccasionTagWithCount`) | ✅ Conforme |
| Repository | `src/lib/repositories/occasionTagRepository.ts` | ✅ Apenas persistência — zero lógica de negócio |
| Validator | `src/lib/validators/occasionTagValidator.ts` | ✅ Funções puras — zero dependência de Prisma |
| Service | `src/lib/occasionTagService.ts` | ✅ Única camada com regras de negócio (slug, normalização de cor, unicidade, contagem de vínculos) |
| API | 6 rotas (`/api/occasions`, `/api/admin/occasions`, `/api/admin/occasions/[id]`, `/[id]/activate`, `/[id]/deactivate`) | ✅ Zero acesso a Prisma/Repository/Validator; uso exclusivo de `occasionTagService` + `responses.ts` |
| Cliente HTTP | `src/lib/api/occasionTagApi.ts` | ✅ Consome exclusivamente as rotas admin; zero import de Service |
| Front-end | `src/app/admin/ocasioes/page.tsx` | ✅ Consome exclusivamente o cliente HTTP |

### Checklist funcional (validado por revisão de código)

| Item | Status |
|------|--------|
| Cadastro | ✅ |
| Edição | ✅ |
| Ativação | ✅ |
| Desativação | ✅ |
| Pesquisa por nome | ✅ |
| Ordenação por `sortOrder` | ✅ |
| Empty State (sem dados / sem resultado de pesquisa) | ✅ |
| Loading (skeletons) | ✅ |
| Toasts (loading/success/error) | ✅ |
| Modal de confirmação (desativação) | ✅ |
| Erro 400 (`VALIDATION_ERROR`) — mapeado para campos do formulário | ✅ |
| Erro 401 (`UNAUTHORIZED`) | ✅ |
| Erro 403 (`FORBIDDEN`) | ✅ |
| Erro 404 (`NOT_FOUND`) | ✅ |
| Erro 409 (`SLUG_CONFLICT` / `OCCASION_HAS_PRODUCTS`) | ✅ |
| Erro 500 (`INTERNAL_ERROR`) | ✅ |

### Checklist arquitetural

| Verificação | Status |
|---|---|
| Nenhuma rota acessa Prisma | ✅ |
| Nenhuma rota acessa Repository | ✅ |
| Nenhuma rota acessa Validator | ✅ |
| Toda regra de negócio permanece no Service | ✅ |
| Repository apenas persistência | ✅ |
| Validator apenas validação | ✅ |
| Front-end consome somente a API (via cliente HTTP) | ✅ |

### Inconsistências encontradas

Nenhuma.

### Correções realizadas

Nenhuma — nenhuma alteração de código nesta sprint.

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |
| `npm run build` | ✅ Compilação bem-sucedida — 23 páginas, todas as rotas do módulo presentes (`/admin/ocasioes`, `/api/occasions`, `/api/admin/occasions`, `/api/admin/occasions/[id]`, `/[id]/activate`, `/[id]/deactivate`) |

---

## Módulo 2.C — Ocasiões — ENCERRADO OFICIALMENTE (06/07/2026)

Todas as sprints (2.C.1 a 2.C.7) concluídas. Schema, Repository, Validator, Service, API e Front-end auditados e aprovados sem pendências. Módulo pronto para uso em produção.

---

## [Sprint 2.C.6] — 2026-07-06 — Front-end Administrativo: Ocasiões

**Tipo:** Implementação de UI + cliente HTTP — nenhum Schema, Types, Repository, Validator, Service ou API alterados.

### Arquivos criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/api/occasionTagApi.ts` | Cliente HTTP do admin — 5 funções (`listOccasions`, `createOccasion`, `updateOccasion`, `activateOccasion`, `deactivateOccasion`) + `ApiRequestError` (carrega `code`/`details` da resposta, usado para mapear erros 400 aos campos do formulário) |
| `src/app/admin/ocasioes/page.tsx` | Página completa com lista, pesquisa, modais e estados |

### Alterações em arquivos existentes

| Arquivo | Mudança |
|---------|---------|
| `src/app/admin/page.tsx` | Link `/admin/ocasioes` adicionado ao hub com `ready: true` (mesmo padrão da Sprint 2.B.5) |

### Endpoints consumidos

| Método | Rota | Uso na página |
|--------|------|---------------|
| `GET` | `/api/admin/occasions` | Carregamento da listagem |
| `POST` | `/api/admin/occasions` | Criação |
| `PATCH` | `/api/admin/occasions/[id]` | Edição |
| `PATCH` | `/api/admin/occasions/[id]/activate` | Ativação |
| `PATCH` | `/api/admin/occasions/[id]/deactivate` | Desativação |

Nenhuma chamada ao Service ocorre fora de `occasionTagApi.ts` — todas via `fetch` às rotas acima.

### Componentes reutilizados do Módulo 2.B (padrão replicado)

`Field`, `StatusBadge`, `LoadingState`, `EmptyState`, `ErrorState`, `OccasionCard` (equivalente a `CategoryCard`), `OccasionModal` (equivalente a `CategoryModal`), `ConfirmModal` — mesma estrutura de estados (`loading`, `submitting`, `fieldErrors`, `toast`, `actionLoading`) e mesmo componente compartilhado `ValidationSummary`.

### Desvios deliberados em relação ao padrão 2.B

| Item | Decisão | Motivo |
|------|---------|--------|
| `slug` | Nunca exibido no card ou no formulário | Exigência explícita desta sprint (diferente de Categorias, que exibe o slug) |
| Campo "Ativo" no formulário | Exibido como badge somente leitura + texto explicativo — nunca enviado no payload de `PATCH` | `occasionTagService.updateOccasion` tipa o input como `Partial<Pick<OccasionTagInput, "name" \| "sortOrder" \| "color" \| "icon">>` — `isActive` é exclusão de tipo, não pode ser incluído sem alterar o Service (proibido pelo escopo). Estado muda exclusivamente via `activate()`/`deactivate()`, preservando a mesma separação de responsabilidades já estabelecida no Módulo 2.B |
| Pesquisa por nome | Campo de busca client-side (`input type="search"`) filtrando a lista carregada | Requisito novo desta sprint, ausente em Categorias |
| Ordenação por `sortOrder` | Lista reordenada explicitamente no client (`sort` defensivo) além da ordenação já vinda da API | Requisito explícito desta sprint |
| Contagem de produtos vinculados | Não exibida no card (sem tile "Produtos") | `listAllOccasions()` retorna `OccasionTag[]`, não `OccasionTagWithCount` — Service não foi alterado. O bloqueio de desativação com produtos vinculados é tratado via erro 409 (`OCCASION_HAS_PRODUCTS`) exibido em toast, não por pré-checagem local |

### Tratamento de erros HTTP

| Status | Origem | Tratamento visual |
|--------|--------|-------------------|
| 400 | `ValidationFailedError` | `ApiRequestError.details` mapeado para `formErrors` por campo + toast "Corrija os campos destacados." |
| 401 | Sessão ausente (`requireAdmin`) | Toast de erro com a mensagem retornada pela API |
| 403 | Papel insuficiente (`requireAdmin`) | Toast de erro com a mensagem retornada pela API |
| 404 | `NotFoundError` | Toast de erro ("Ocasião não encontrada.") |
| 409 | `SlugConflictError` / `OccasionHasProductsError` | Toast de erro com a mensagem específica retornada pela API |
| 500 | Erro inesperado | Toast de erro genérico |
| Loading | Fetch inicial e ações | Skeletons na listagem; toast "loading" durante submit/ativar/desativar |
| Empty state | Lista vazia ou pesquisa sem resultado | Mensagens distintas + CTA "Criar ocasião" (oculto durante filtro ativo) |
| Confirmação de desativação | Antes de `PATCH .../deactivate` | `ConfirmModal` dedicado |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |

**Próximo:** Sprint 2.C.7 — QA e encerramento do Módulo 2.C.

---

## [Sprint 2.C.5] — 2026-07-06 — API: OccasionTag

**Tipo:** Implementação de rotas HTTP — nenhum Schema, Repository, Validator, Service ou Front-end alterado.

### Arquivos criados

| Arquivo | Método | Rota | Auth | Service usado |
|---------|--------|------|------|----------------|
| `src/app/api/admin/occasions/route.ts` | `GET` | `/api/admin/occasions` | Admin | `listAllOccasions()` |
| `src/app/api/admin/occasions/route.ts` | `POST` | `/api/admin/occasions` | Admin | `createOccasion(input)` |
| `src/app/api/admin/occasions/[id]/route.ts` | `PATCH` | `/api/admin/occasions/[id]` | Admin | `updateOccasion(id, input)` |
| `src/app/api/admin/occasions/[id]/activate/route.ts` | `PATCH` | `/api/admin/occasions/[id]/activate` | Admin | `activateOccasion(id)` |
| `src/app/api/admin/occasions/[id]/deactivate/route.ts` | `PATCH` | `/api/admin/occasions/[id]/deactivate` | Admin | `deactivateOccasion(id)` |

Rota pública `GET /api/occasions` mantida sem alteração — continua usando exclusivamente `listActiveOccasions()`.

Sem `DELETE` em nenhuma rota.

### Mapeamento de erros

| Erro do Service | HTTP | Código |
|----------------|------|--------|
| `ValidationFailedError` | 400 | `VALIDATION_ERROR` (via `badRequest`) |
| Body JSON inválido | 400 | `INVALID_BODY` |
| Não autenticado | 401 | `UNAUTHORIZED` |
| Papel insuficiente | 403 | `FORBIDDEN` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `SlugConflictError` | 409 | `SLUG_CONFLICT` |
| `OccasionHasProductsError` | 409 | `OCCASION_HAS_PRODUCTS` |
| Erro inesperado | 500 | `INTERNAL_ERROR` |

### Padrão seguido

Réplica exata do padrão do Módulo 2.B (Categorias): `requireAdmin()` para toda rota administrativa, helpers de `src/lib/http/responses.ts` exclusivamente (nenhum `NextResponse.json()` direto), rotas apenas parse → delegate ao `occasionTagService` → mapeamento de erro para HTTP. Nenhum acesso a Prisma, Repository ou Validator nas rotas.

### Confirmações de escopo

| Item | Status |
|------|--------|
| Schema alterado | ❌ Não |
| Repository alterado | ❌ Não |
| Validator alterado | ❌ Não |
| Service alterado | ❌ Não |
| Types alterado | ❌ Não |
| Front-end alterado | ❌ Não |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |

**Próximo:** Sprint 2.C.5.1 — Auditoria da API recém-implementada.

---

## [Sprint 2.C.5.0] — 2026-07-06 — Alinhamento de `/api/occasions` ao Contrato HTTP Oficial

**Tipo:** Ajuste de consistência arquitetural — elimina o estado intermediário entre produtor e consumidor antes da implementação definitiva da Sprint 2.C.5.

### Arquivo alterado

`src/app/api/occasions/route.ts` — reescrito para eliminar acesso direto ao `prisma` e usar exclusivamente `listActiveOccasions()` (`occasionTagService`) + helpers de `src/lib/http/responses.ts` (`ok`, `internalError`). Nenhum `NextResponse.json()` direto.

### Contrato antes/depois

| | Antes | Depois |
|---|---|---|
| Camada acessada | `prisma.occasionTag.findMany` direto na rota | `listActiveOccasions()` via Service |
| Sucesso | `OccasionTag[]` (array puro) | `{ success: true, data: OccasionTag[] }` |
| Erro | `{ error: string }` (500) | `{ success: false, error: { code: "INTERNAL_ERROR", message } }` (500) |

Produtor (`/api/occasions`) e consumidor (`src/app/page.tsx`, ajustado na Sprint 2.C.5.1) agora utilizam o mesmo contrato — estado intermediário eliminado.

### Confirmações de escopo

| Item | Status |
|------|--------|
| `page.tsx` alterado | ❌ Não |
| Repository alterado | ❌ Não |
| Service alterado | ❌ Não |
| Validator alterado | ❌ Não |
| Schema alterado | ❌ Não |
| Types alterado | ❌ Não |
| Outras rotas alteradas | ❌ Não |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |

---

## [Sprint 2.C.5.1] — 2026-07-06 — Ajustes Finais Antes da Implementação da API: OccasionTag

**Tipo:** Preparação arquitetural — dois ajustes pontuais antes da implementação definitiva da Sprint 2.C.5.

### Ajuste 1 — Adaptação do consumidor de `/api/occasions`

`src/app/page.tsx` — o `useEffect` que carrega as ocasiões da vitrine foi adaptado para consumir o contrato HTTP padrão `{ success, data }` em vez do array puro anteriormente retornado por `GET /api/occasions`:

```typescript
const response = await fetch("/api/occasions", { cache: "no-store" });
const result = await response.json();
if (!result.success) {
  throw new Error(result.error?.message);
}
const occasions: { id: string; name: string; slug: string }[] = result.data;
```

Nenhuma outra lógica da página foi alterada (estado, layout, componentes, UX preservados).

**Nota de compatibilidade temporária:** `GET /api/occasions` ainda retorna um array puro (implementação anterior a Sprint 2.C.5) — até a rota ser reescrita nessa sprint, o `try/catch` faz a vitrine cair no fallback estático `OCCASIONS_FALLBACK`, sem quebra visível. A reescrita da rota para o contrato `{ success, data }` faz parte do escopo da Sprint 2.C.5.

### Ajuste 2 — Confirmação da padronização da camada HTTP

Declarado como critério obrigatório para toda a Sprint 2.C.5: proibido `NextResponse.json()` direto em qualquer rota; uso exclusivo dos helpers de `src/lib/http/responses.ts` (`ok`, `created`, `badRequest`, `invalidBody`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `internalError`). Nenhum arquivo de rota foi criado nesta sprint — confirmação documental do padrão que será seguido.

### Confirmações de escopo

| Item | Status |
|------|--------|
| Rotas `/api/admin/occasions/*` criadas | ❌ Não — escopo da Sprint 2.C.5 |
| Layout, componentes, estados ou UX de `page.tsx` alterados | ❌ Não |
| Outro arquivo além de `page.tsx` alterado | ❌ Não |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm run lint` | ✅ 0 erros |

---

## [Sprint 2.C.4.1] — 2026-07-06 — Ajustes Finais de Conformidade: Service OccasionTag

**Tipo:** Revisão arquitetural — nenhuma alteração funcional, nenhuma regra de negócio alterada.

### Resultado da revisão

Todos os ajustes de conformidade verificados. Nenhuma correção de código necessária — o Service já estava em plena conformidade com o spec da Sprint 2.C.4.

### Itens verificados

| Ajuste | Item | Resultado |
|--------|------|-----------|
| 1 | Imports sem duplicatas; aliases `dbCreate/Update/Activate/Deactivate` corretos | ✅ Conforme |
| 2 | Service é o único responsável por orquestração (trim, slugify, uppercase, validação, unicidade, regras) | ✅ Conforme |
| 3 | `mapToOccasionTag`: `createdAt` e `updatedAt` convertidos para ISO String | ✅ Conforme |
| 4 | `slug` gerado exclusivamente em `createOccasion`; nunca recalculado em `updateOccasion`; nunca aceito no input | ✅ Conforme |
| 5 | `color.toUpperCase()` aplicado antes do Validator e antes do Repository | ✅ Conforme |
| 6 | Exatamente 4 erros de domínio: `NotFoundError`, `ValidationFailedError`, `SlugConflictError`, `OccasionHasProductsError` | ✅ Conforme |
| 7 | PLAN.md: Sprint 2.C.4 única, sem duplicidade, marcada ✅ Concluído | ✅ Conforme |

### Camadas não alteradas

| Camada | Status |
|--------|--------|
| `occasionTagService.ts` | Sem alteração de código |
| Repository | ✅ Intacto |
| Validator | ✅ Intacto |
| Schema Prisma | ✅ Intacto |
| Types | ✅ Intacto |
| API | ✅ Intacto |
| Front-end | ✅ Intacto |

### Validação

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |

---

## [Sprint 2.C.4] — 2026-07-06 — Service: OccasionTag

**Tipo:** Camada de negócio — nenhuma outra camada alterada.

### Arquivo alterado

`src/lib/occasionTagService.ts` — reescrito conforme spec Sprint 2.C.4 (arquivo existia desde Sprint 2.C.3.1 com nomenclatura divergente).

### Erros de domínio

| Classe | Quando lançada |
|--------|---------------|
| `NotFoundError` | `id` não encontrado no banco |
| `ValidationFailedError` | Validator retorna erros |
| `SlugConflictError` | Slug gerado já existe em outra ocasião |
| `OccasionHasProductsError` | Desativação bloqueada — ocasião possui produtos vinculados |

### Métodos públicos implementados

| Função | Retorno | Fluxo |
|--------|---------|-------|
| `listActiveOccasions()` | `Promise<OccasionTag[]>` | Repository → map |
| `listAllOccasions()` | `Promise<OccasionTag[]>` | Repository → map |
| `getOccasionById(id)` | `Promise<OccasionTag>` | buscar → NotFoundError → map |
| `createOccasion(input)` | `Promise<OccasionTag>` | trim → toUpperCase → validator → slugify → conflito → Repository → map |
| `updateOccasion(id, input)` | `Promise<OccasionTag>` | buscar → NotFoundError → trim → toUpperCase → validator → Repository → map |
| `activateOccasion(id)` | `Promise<OccasionTag>` | buscar → NotFoundError → Repository → map |
| `deactivateOccasion(id)` | `Promise<OccasionTag>` | buscar → NotFoundError → countProducts → OccasionHasProductsError → Repository → map |

### Funções privadas

| Função | Descrição |
|--------|-----------|
| `slugify(text)` | NFD + remove diacríticos + lowercase + hífens + trim de bordas |
| `mapToOccasionTag(raw)` | Prisma → domínio; `createdAt`/`updatedAt` convertidos para ISO String |

### Detalhe da normalização de cor

Aplicada em `createOccasion` e `updateOccasion` antes do Validator e do Repository:
```typescript
const normalizedColor = input.color !== undefined ? input.color.toUpperCase() : undefined;
```

### Nota técnica — aliasing de imports

Repository e Service compartilham nomes de operação (`createOccasion`, `updateOccasion`, `activateOccasion`, `deactivateOccasion`). As funções do Repository são importadas com prefixo `db` para evitar colisão no escopo do módulo:
```typescript
import { createOccasion as dbCreateOccasion, ... } from "@/lib/repositories/occasionTagRepository";
```

### Confirmações de escopo

| Camada | Alterada |
|--------|----------|
| Repository | ❌ Não |
| Validator | ❌ Não |
| Schema Prisma | ❌ Não |
| Types | ❌ Não |
| API | ❌ Não |
| Front-end | ❌ Não |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |

---

## [Sprint 2.C.3.1] — 2026-07-06 — Padronização do armazenamento de cores HEX em maiúsculo

**Tipo:** Normalização de dados — exclusivamente Service. Nenhuma outra camada alterada.

### Decisão arquitetural

Toda cor hexadecimal persistida no banco para `OccasionTag` deve estar em **MAIÚSCULO**.

| ✅ Correto | ❌ Proibido |
|------------|-------------|
| `#E8A598` | `#e8a598` |
| `#FF6B9D` | `#ff6b9d` |
| `#A3C4BC` | `#a3c4BC` |

### Arquivo criado

`src/lib/occasionTagService.ts`

### Local da normalização

**Criação** — linha imediatamente após `trim()` do nome:

```typescript
const trimmedName = input.name.trim();
const normalizedColor = input.color !== undefined ? input.color.toUpperCase() : undefined;
```

**Atualização** — mesma lógica, aplicada quando `color` está presente no payload:

```typescript
const trimmedName = input.name !== undefined ? input.name.trim() : undefined;
const normalizedColor = input.color !== undefined ? input.color.toUpperCase() : undefined;
```

O `normalizedColor` é passado ao Validator e ao Repository — garantindo que a cor validada e a cor persistida sejam sempre a mesma string maiúscula.

### Confirmações de escopo

| Item | Status |
|------|--------|
| Repository alterado | ❌ Não |
| Validator alterado | ❌ Não |
| Schema Prisma alterado | ❌ Não |
| Types alterado | ❌ Não |
| API alterada | ❌ Não |
| Front-end alterado | ❌ Não |
| Apenas Service criado/alterado | ✅ Sim |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |

---

## [Sprint 2.C.3] — 2026-07-06 — Repository + Validator: OccasionTag

**Tipo:** Camada de dados — nenhuma API, Service, Schema ou UI alterada.

### Arquivos criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/repositories/occasionTagRepository.ts` | Queries Prisma puras para `OccasionTag` e `ProductOccasion` |
| `src/lib/validators/occasionTagValidator.ts` | Validações de criação e atualização de `OccasionTag` |

### Métodos do Repository

| Função | Descrição |
|--------|-----------|
| `findAllOccasions()` | Todas as ocasiões (ativas e inativas), ordenadas por `sortOrder` asc |
| `findActiveOccasions()` | Apenas ocasiões com `isActive = true`, ordenadas por `sortOrder` asc |
| `findOccasionById(id)` | Busca por `id`; retorna `null` se não encontrada |
| `findOccasionBySlug(slug)` | Busca por `slug`; retorna `null` se não encontrada |
| `createOccasion(data)` | Persiste nova ocasião com `name`, `slug`, `sortOrder?`, `color?`, `icon?` |
| `updateOccasion(id, data)` | Persiste alterações de `name?`, `sortOrder?`, `color?`, `icon?` |
| `activateOccasion(id)` | Define `isActive = true` |
| `deactivateOccasion(id)` | Define `isActive = false` |
| `countProductsByOccasion(id)` | Conta registros em `ProductOccasion` com `occasionId = id` |

### Funções do Validator

| Função | Campos validados |
|--------|-----------------|
| `validateOccasionCreate(input)` | `name` (obrigatório, mín 2, máx 100); `sortOrder` (inteiro >= 0); `color` (#RRGGBB); `icon` (não-vazia, máx 50) |
| `validateOccasionUpdate(input)` | Mesmas regras, todos opcionais; retorna `ValidationError[]` |

### Confirmações de escopo

| Item | Status |
|------|--------|
| SQL / `$queryRaw` / `$executeRaw` | ❌ Não utilizado |
| Lógica de negócio no Repository | ❌ Não adicionada |
| Geração de slug | ❌ Não (responsabilidade do Service) |
| Regra de negócio alterada | ❌ Não |
| API alterada | ❌ Não |
| Service alterado | ❌ Não |
| Schema alterado | ❌ Não |
| Front-end alterado | ❌ Não |

### Validações executadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |

---

## [Sprint 2.C.2] — 2026-07-06 — Schema OccasionTag + tipos TypeScript

**Tipo:** Schema + Types — nenhuma camada funcional alterada.

### Alterações no schema (`prisma/schema.prisma`)

**Modelo `OccasionTag` expandido** — 6 campos adicionados:

| Campo | Tipo | Default |
|-------|------|---------|
| `sortOrder` | `Int` | `0` |
| `color` | `String` | `"#E8A598"` |
| `icon` | `String` | `"calendar"` |
| `isActive` | `Boolean` | `true` |
| `createdAt` | `DateTime` | `now()` |
| `updatedAt` | `DateTime` | `@updatedAt` |

Relação `products ProductOccasion[]` preservada sem alteração. `Product` e `ProductOccasion` não foram tocados.

### Alterações em `src/lib/types.ts`

**`interface OccasionTag` criada** — 9 campos (id, name, slug, sortOrder, color, icon, isActive, createdAt, updatedAt).

**`type OccasionTagInput` criado** — 5 campos editáveis (name, sortOrder?, color?, icon?, isActive?). Excluídos por design: id, slug, createdAt, updatedAt.

**`type OccasionTagWithCount`** — `OccasionTag & { productCount: number }` (padrão 2.B).

### Comandos executados

| Comando | Resultado |
|---------|-----------|
| `npx prisma validate` | ✅ Schema válido |
| `npx prisma db push` | ✅ Banco sincronizado em 5.50s |
| `npx prisma generate` | ✅ Prisma Client v6.19.3 gerado |
| `npx tsc --noEmit` | ✅ 0 erros |

### Confirmações de escopo

| Item | Status |
|------|--------|
| Regra de negócio alterada | ❌ Não |
| API alterada | ❌ Não |
| Service alterado | ❌ Não |
| Repository alterado | ❌ Não |
| Componente front-end alterado | ❌ Não |
| `Product` alterado | ❌ Não |
| `ProductOccasion` alterado | ❌ Não |
| `ProductCategory` alterado | ❌ Não |

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `prisma/schema.prisma` | `OccasionTag` expandido com 6 campos; icon default corrigido para `"calendar"` |
| `src/lib/types.ts` | `OccasionTag`, `OccasionTagInput`, `OccasionTagWithCount` adicionados |
| `PLAN.md` | Sprint 2.C.2 marcada concluída |
| `CHANGELOG.md` | Esta entrada |

---

## [Sprint 2.C.1] — 2026-07-02 — Decisão arquitetural: padrão oficial para relacionamentos many-to-many

**Tipo:** Documentação arquitetural exclusivamente — zero alterações funcionais.

### Confirmações de escopo

| Item | Status |
|------|--------|
| Schema `schema.prisma` alterado | ❌ Não |
| Tabela criada, modificada ou removida | ❌ Não |
| Código TypeScript alterado (`src/`) | ❌ Não |
| API alterada | ❌ Não |
| Service alterado | ❌ Não |
| Validator alterado | ❌ Não |
| Repository alterado | ❌ Não |
| Regra de negócio alterada | ❌ Não — apenas documentada formalmente |
| `db push` executado | ❌ Não |
| `prisma generate` executado | ❌ Não |
| `tsc` executado | ❌ Não |

### Decisão arquitetural registrada

**`ProductOccasion` é oficialmente o padrão para relacionamentos N:N com potencial de evolução no ERP Doce Menina.**

| Aspecto | Detalhe |
|---------|---------|
| Entidade | `ProductOccasion` — join table do vínculo `Product ↔ OccasionTag` |
| Estado atual do schema | Apenas `productId` e `occasionId` — sem metadados adicionais |
| Decisão | Entidade explícita mantida deliberadamente por escolha arquitetural |
| Motivação | Permitir evolução futura (`priority`, `validFrom`, `validUntil`, `campaignId`, auditoria) sem migração destrutiva |
| Segundo exemplo oficial | `ProductRecipe` (`Product ↔ Recipe`) — já possui metadados (`quantity`, `unitId`) |
| Alinhamento | Compatível com [ADR-005](ADR-005.md) — Exceção E2 (join tables sem identidade própria) |
| Restrição permanente | `ProductOccasion` não pode ser convertida para implícita sem nova ADR aprovada |

### Documentos alterados

| Arquivo | Mudança |
|---------|---------|
| `REGRAS_NEGOCIO.md` | Seção 3.5 — decisão arquitetural expandida com tabela de evoluções futuras previstas e restrição formal |
| `PROJECT_GOVERNANCE.md` | Seção 10 — bloco "Relacionamentos many-to-many" com exemplos de código, tabela de exemplos oficiais e restrição |
| `PLAN.md` | Módulo 2.C — Sprint 2.C.1 registrada como concluída (sprint documental) |
| `CHANGELOG.md` | Esta entrada |

---

## [Sprint 2.0.8] — 2026-07-02 — ADR-005: Padrão Oficial de Identificadores

**Tipo:** Documentação arquitetural — nenhum código alterado.

### Decisão registrada

**[ADR-005](ADR-005.md) — Padrão Oficial de Identificadores (IDs)**

Formaliza o padrão `id String @id @default(cuid())` como obrigatório em todos os modelos persistentes do ERP Doce Menina.

### Conteúdo da ADR

| Seção | Conteúdo |
|-------|----------|
| Decisão | `id String @id @default(cuid())` — obrigatório em todos os modelos |
| Justificativa | 9 motivos técnicos (nativo Prisma, único global, sem exposição de volume, sem colisão entre ambientes, etc.) |
| Alternativas rejeitadas | `autoincrement()`, UUID misto, NanoID, ULID, KSUID |
| Padrão obrigatório | 4 regras: relacionamentos só por `id`; `slug` proibido como FK; `slug` existe só para URL/SEO/navegação; IDs nunca expostos ao usuário |
| Exceções documentadas | `orderNumber` (display only, não é PK); `@@id([fk1, fk2])` em join tables sem entidade própria |

### Documentos alterados

| Arquivo | Mudança |
|---------|---------|
| `ADR-005.md` | Criado — ADR completo com contexto, justificativa, padrões e exceções |
| `PROJECT_GOVERNANCE.md` | Seção 10 — referência à ADR-005 adicionada ao padrão de Prisma; rodapé atualizado |
| `CLAUDE.md` | Tabela "Decisões arquiteturais tomadas" — entrada ADR-005 adicionada |
| `PLAN.md` | Sprint 2.0.8 registrada como concluída |

---

## [Sprint 2.B.6] — 2026-07-02 — QA e Encerramento Oficial do Módulo Categorias

**Tipo:** Validação + 1 correção de bug encontrada durante QA — nenhuma funcionalidade nova.

### Validações executadas

| # | Verificação | Resultado |
|---|-------------|-----------|
| 1 | `npx tsc --noEmit` | ✅ 0 erros |
| 2 | `npm run lint` | ✅ 0 erros (5 erros encontrados e corrigidos: 4 entidades não escapadas + 1 `set-state-in-effect`) |
| 3 | `npm run build` | ✅ Compilação bem-sucedida, 21 páginas, todas as rotas presentes |
| 4 | `GET /api/categories` | ✅ 200 — 3 categorias ativas retornadas |
| 5 | `GET /api/admin/categories` | ✅ 200 — 3 categorias com `productCount` correto |
| 6 | `POST /api/admin/categories` | ✅ 201 — categoria criada com slug gerado |
| 7 | `PATCH /api/admin/categories/[id]` | ✅ 200 — nome e cor atualizados |
| 8 | `PATCH /api/admin/categories/[id]/deactivate` | ✅ 200 — isActive=false |
| 9 | `PATCH /api/admin/categories/[id]/activate` | ✅ 200 — isActive=true |
| 10 | `PATCH /deactivate` com `productCount > 0` | ✅ 409 — `CATEGORY_HAS_PRODUCTS` |
| 11 | `POST` sem autenticação | ✅ 401 — `UNAUTHORIZED` |
| 12 | `POST` com nome vazio | ✅ 400 — `errors: [name: Nome é obrigatório.]` |
| 13 | `PATCH` com ID inexistente | ✅ 404 — `NOT_FOUND` |
| 14 | `POST` com nome duplicado | ✅ 409 — `NAME_CONFLICT` (bug corrigido nesta sprint) |

### Correções realizadas durante QA

**Lint — 5 erros em `page.tsx`:**
- 4× `react/no-unescaped-entities`: aspas em torno de `{category.name}` no `ConfirmModal` → substituídas por `{'"'}` 
- 1× `react-hooks/set-state-in-effect`: eslint-disable expandido para cobrir ambas as regras na linha do `useEffect`

**Bug #14 — Nome duplicado retornava HTTP 500:**
- Causa: `createProductCategory` verificava unicidade de slug mas não de nome. Quando `slugify(name)` gerava um slug diferente do existente (ex: seed com slug curto "bolos"), a verificação passava e a constraint `@unique` no campo `name` disparava um erro Prisma P2002 não tratado.
- Correção em `productCategoryService.ts`: `createCategory` agora envolto em try/catch; P2002 detectado por duck typing `(err as { code?: string })?.code === "P2002"` → lança `NameConflictError`.
- Correção em `src/app/api/admin/categories/route.ts`: `NameConflictError` mapeado para `conflict("NAME_CONFLICT", ...)` → HTTP 409.

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `src/app/admin/categorias/page.tsx` | Aspas escapadas + eslint-disable expandido |
| `src/lib/productCategoryService.ts` | `NameConflictError` + catch P2002 |
| `src/app/api/admin/categories/route.ts` | Handler `NameConflictError` |

---

## [Sprint 2.B.5.1] — 2026-07-02 — Refinamentos da Interface de Categorias

**Tipo:** Correções de UX, tipagem e acessibilidade — nenhuma API, Service, Repository ou Schema alterados.

### Correções aplicadas

| # | Problema | Arquivo | Mudança |
|---|----------|---------|---------|
| C1 | `ConfirmModal` permitia confirmar desativação com produtos vinculados | `page.tsx` | `hasProducts` bifurca o modal: se `productCount > 0`, exibe título "Não é possível desativar", explica que há produtos vinculados, orienta remoção/movimentação e exibe apenas "Fechar" — sem ação destrutiva |
| I1 | Mutações do API client declaravam `Promise<ProductCategoryWithCount>` mas a API retorna `ProductCategory` | `productCategoryApi.ts` | `createCategory`, `updateCategory`, `activateCategory` e `deactivateCategory` agora retornam `Promise<ProductCategory>` — alinhado com o contrato real das rotas |
| I2 | Skeleton completo após cada ação CRUD (list pisca a cada create/edit/activate/deactivate) | `page.tsx` | `loadCategories(silent?: boolean)`: quando `silent=true`, não altera `loading`/`error`; erros silenciosos vão para toast; chamadas pós-ação usam `loadCategories(true)` |
| I6 | Labels sem `htmlFor`, inputs sem `id` — associação DOM inexistente | `page.tsx` | `Field` recebe prop `htmlFor`; todos os inputs do `CategoryModal` têm `id` (`cat-name`, `cat-sort-order`, `cat-color-hex`, `cat-icon`); color picker recebe `aria-label="Seletor de cor"`; preview de ícone recebe `aria-hidden="true"` |
| I8 | Botões de ação sem contexto da categoria para leitores de tela | `page.tsx` | `CategoryCard`: `aria-label` contextual em "Editar", "Desativar" e "Ativar" (ex: `Editar categoria Bolos Especiais`) |

### Validação

- `npx tsc --noEmit` → 0 erros

---

## [Sprint 2.B.5] — 2026-07-02 — Front-end Administrativo: Categorias

**Tipo:** Implementação de UI + cliente HTTP — nenhum Schema alterado.

### Arquivos criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/api/productCategoryApi.ts` | Cliente HTTP do admin — 5 funções, zero `fetch` em componentes |
| `src/app/admin/categorias/page.tsx` | Página completa com lista, modais e estados |

### Alterações em arquivos existentes

| Arquivo | Mudança |
|---------|---------|
| `src/lib/types.ts` | `ProductCategoryWithCount = ProductCategory & { productCount: number }` |
| `src/lib/repositories/productCategoryRepository.ts` | `findAllCategoriesWithCount()` com `_count.products` |
| `src/lib/productCategoryService.ts` | `listAllCategoriesWithCount()` |
| `src/app/api/admin/categories/route.ts` | GET usa `listAllCategoriesWithCount` |
| `src/app/admin/page.tsx` | Link `/admin/categorias` com `ready: true` |

### Componentes locais em `page.tsx`

| Componente | Descrição |
|------------|-----------|
| `Field` | Wrapper de campo com label, obrigatório e erro |
| `StatusBadge` | Badge "Ativa" (sage) / "Inativa" (sand) |
| `LoadingState` | 3 skeletons animados |
| `EmptyState` | Card com CTA de criação |
| `ErrorState` | Mensagem de erro + botão de retry |
| `CategoryCard` | Card com cor, ícone, ordem, contagem e ações |
| `CategoryModal` | Bottom sheet para criar/editar |
| `ConfirmModal` | Modal de confirmação antes da desativação |

### Fluxo da UI

```
Carregar categorias (listCategories)
  ↓ loading → skeletons
  ↓ error   → ErrorState + retry
  ↓ vazio   → EmptyState + CTA
  ↓ dados   → lista de CategoryCards

Criar: "+ Nova" → CategoryModal (create) → validateForm → createCategory → refresh
Editar: "Editar" → CategoryModal (edit) → validateForm → updateCategory → refresh
Ativar: botão → activateCategory → Toast success → refresh
Desativar: botão → ConfirmModal → deactivateCategory → Toast success → refresh
```

### Estados implementados

| Estado | Implementação |
|--------|--------------|
| Loading | Skeletons animados com `animate-pulse` |
| Empty | Card com mensagem + CTA |
| Error | Mensagem + botão de retry |
| Toast loading | `ValidationSummary` reutilizado de config |
| Toast success/error | Auto-dismiss em 3,5 s |
| Confirmação | Modal separado antes de desativar |
| Submitting | Botão "Salvando…" + `disabled` |
| Action loading | Por categoria (`actionLoading === cat.id`) |

### Validações

| Etapa | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |

**Próximo:** Sprint 2.B.6 — QA.

---

## [Sprint 2.B.4.2] — 2026-07-02 — Validação Final da API de Categorias

**Tipo:** Auditoria e correção — nenhuma funcionalidade nova adicionada.

### Correção aplicada

`src/lib/http/responses.ts` — adicionado `: NextResponse` como tipo de retorno explícito em todos os 9 helpers públicos. Único item de não-conformidade identificado na auditoria.

### Checklist de conformidade

| Critério | Status | Observação |
|----------|--------|-----------|
| Todas as rotas usam `requireAdmin()` | ✅ | `/api/categories` é pública — sem `requireAdmin` por design |
| Todas as rotas usam `responses.ts` | ✅ | Sem `NextResponse.json()` direto em nenhuma rota |
| Nenhuma rota chama Repository diretamente | ✅ | Todas importam apenas de `productCategoryService` |
| Fluxo API → Service → Repository → Prisma | ✅ | Confirmado em todas as rotas |
| Respostas seguem contrato `{ success, data/error }` | ✅ | Garantido pelos helpers |
| Tipos de retorno explícitos nos helpers | ✅ | Corrigido nesta sprint |
| HTTP 200 coberto | ✅ | `ok()` |
| HTTP 201 coberto | ✅ | `created()` |
| HTTP 400 coberto | ✅ | `badRequest()` + `invalidBody()` |
| HTTP 401 coberto | ✅ | `unauthorized()` |
| HTTP 403 coberto | ✅ | `forbidden()` |
| HTTP 404 coberto | ✅ | `notFound()` |
| HTTP 409 coberto | ✅ | `conflict()` com `SLUG_CONFLICT` e `CATEGORY_HAS_PRODUCTS` |
| HTTP 500 coberto | ✅ | `internalError()` |

### Endpoints auditados

| Método | Rota | Auth | Service |
|--------|------|------|---------|
| `GET` | `/api/categories` | Pública | `listActiveCategories()` |
| `GET` | `/api/admin/categories` | Admin | `listAllCategories()` |
| `POST` | `/api/admin/categories` | Admin | `createProductCategory()` |
| `PATCH` | `/api/admin/categories/[id]` | Admin | `updateProductCategory()` |
| `PATCH` | `/api/admin/categories/[id]/activate` | Admin | `activateProductCategory()` |
| `PATCH` | `/api/admin/categories/[id]/deactivate` | Admin | `deactivateProductCategory()` |

### Validações

| Etapa | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |

**A API está pronta para ser consumida pelo Front-end.**

**Próximo:** Sprint 2.B.5 — Front-end.

---

## [Sprint 2.B.4.1] — 2026-07-02 — Padronização da Camada HTTP

**Tipo:** Infraestrutura HTTP — nenhum Service, Repository, Schema ou Validator alterado.

### Arquivos criados

#### `src/lib/auth/requireAdmin.ts`

```typescript
async function requireAdmin(): Promise<NextResponse | null>
```

Retorna `NextResponse` (401 ou 403) quando o acesso é negado; `null` quando autorizado. Uso nas rotas: `const denied = await requireAdmin(); if (denied) return denied;` — uma linha.

#### `src/lib/http/responses.ts`

| Função | HTTP | Body |
|--------|------|------|
| `ok(data)` | 200 | `{ success: true, data }` |
| `created(data)` | 201 | `{ success: true, data }` |
| `badRequest(errors)` | 400 | `{ success: false, error: { code: "VALIDATION_ERROR", message, details: errors[] } }` |
| `invalidBody()` | 400 | `{ success: false, error: { code: "INVALID_BODY", message } }` |
| `unauthorized()` | 401 | `{ success: false, error: { code: "UNAUTHORIZED", message } }` |
| `forbidden()` | 403 | `{ success: false, error: { code: "FORBIDDEN", message } }` |
| `notFound(message)` | 404 | `{ success: false, error: { code: "NOT_FOUND", message } }` |
| `conflict(code, message, details?)` | 409 | `{ success: false, error: { code, message, details? } }` |
| `internalError()` | 500 | `{ success: false, error: { code: "INTERNAL_ERROR", message } }` |

`invalidBody()` — adicionado além do especificado para cobrir falha de `request.json()` em POST/PATCH.

### Rotas de Categorias atualizadas

Todas as 5 rotas reescritas sem `getServerSession` inline e sem `NextResponse.json` direto:

```
src/app/api/categories/route.ts
src/app/api/admin/categories/route.ts
src/app/api/admin/categories/[id]/route.ts
src/app/api/admin/categories/[id]/activate/route.ts
src/app/api/admin/categories/[id]/deactivate/route.ts
```

Duplicação eliminada: `requireAdmin()` existia como função local em 4 dos 5 arquivos — unificada em `src/lib/auth/requireAdmin.ts`.

### Exemplos de resposta

**Sucesso:**
```json
{ "success": true, "data": { "id": "...", "name": "Bolos", "slug": "bolos", ... } }
```

**Erro de validação (400):**
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Dados inválidos.", "details": [{ "field": "name", "code": "MIN_LENGTH", "message": "Nome deve ter pelo menos 2 caracteres." }] } }
```

**Conflito de slug (409):**
```json
{ "success": false, "error": { "code": "SLUG_CONFLICT", "message": "Já existe uma categoria com o slug \"bolos\".", "details": { "slug": "bolos" } } }
```

**Desativação bloqueada (409):**
```json
{ "success": false, "error": { "code": "CATEGORY_HAS_PRODUCTS", "message": "A categoria possui 3 produto(s) vinculado(s)...", "details": { "count": 3 } } }
```

### Validações

| Etapa | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |

**Próximo:** Sprint 2.B.5 — Front-end.

---

## [Sprint 2.B.4] — 2026-07-02 — API: ProductCategory

**Tipo:** Implementação de rotas HTTP — nenhum Schema, Repository ou UI alterado.

### Rotas criadas

| Método | Rota | Auth | Ação |
|--------|------|------|------|
| `GET` | `/api/categories` | Pública | `listActiveCategories()` — vitrine |
| `GET` | `/api/admin/categories` | Admin | `listAllCategories()` — todas |
| `POST` | `/api/admin/categories` | Admin | `createProductCategory(input)` |
| `PATCH` | `/api/admin/categories/[id]` | Admin | `updateProductCategory(id, input)` |
| `PATCH` | `/api/admin/categories/[id]/activate` | Admin | `activateProductCategory(id)` |
| `PATCH` | `/api/admin/categories/[id]/deactivate` | Admin | `deactivateProductCategory(id)` |

Sem `DELETE` em nenhuma rota.

### Mapeamento de erros

| Erro do Service | HTTP |
|----------------|------|
| `ValidationFailedError` | 400 + `{ errors: [...] }` |
| `NotFoundError` | 404 |
| `SlugConflictError` | 409 |
| `CategoryHasProductsError` | 409 + contagem de produtos |
| Não autenticado | 401 |
| Papel insuficiente | 403 |

### Helper de autenticação

`requireAdmin()` — função local interna por arquivo de rota; verifica `session.user?.userType === "admin"` e `session.user.role === "ADMIN"`.

### Arquivos criados

```
src/app/api/categories/route.ts
src/app/api/admin/categories/route.ts
src/app/api/admin/categories/[id]/route.ts
src/app/api/admin/categories/[id]/activate/route.ts
src/app/api/admin/categories/[id]/deactivate/route.ts
```

### Validações

| Etapa | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |

**Próximo:** Sprint 2.B.5 — Front-end.

---

## [Sprint 2.B.3.1] — 2026-07-02 — Revisão de Regras do Service: ProductCategory

**Tipo:** Refinamento de regra de negócio — nenhuma API, Schema ou UI alterada.

### Mudanças em `src/lib/productCategoryService.ts`

#### slugify() — corrigida e tornada explícita

Regex de diacríticos alterado para escape Unicode explícito `[̀-ͯ]`; colapso defensivo de hífens consecutivos adicionado como passo separado `.replace(/-{2,}/g, "-")`.

| Entrada | Saída esperada | Resultado |
|---------|---------------|-----------|
| `"Pão de Mel"` | `"pao-de-mel"` | ✅ |
| `"Açaí Premium"` | `"acai-premium"` | ✅ |
| `"Café   Gourmet"` | `"cafe-gourmet"` | ✅ |

#### updateProductCategory() — confirmado imutável para slug

`slug` ausente de `ProductCategoryInput`, do tipo do parâmetro `input` e do payload de `updateCategory()` no Repository. Nenhuma alteração de código necessária — regra já garantida por tipagem.

#### deactivateProductCategory() — nova regra de pré-condição

**Mudança de comportamento em relação à especificação anterior.**

Antes da desativação, o Service executa `countProductsByCategory(id)`. Se `count > 0`, lança `CategoryHasProductsError` e bloqueia a operação.

Novo erro de domínio adicionado: `CategoryHasProductsError(id, count)`.

### Documentação atualizada

- `REGRAS_NEGOCIO.md` §3.4 — regra de desativação reescrita
- `EPICO_2_PLANEJAMENTO.md` — Módulo 2.B, tabela de política atualizada

### Validações

| Etapa | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |

---

## [Sprint 2.B.3] — 2026-07-02 — Service: ProductCategory

**Tipo:** Implementação de camada de negócio — nenhuma API ou UI alterada.

### Arquivo criado

`src/lib/productCategoryService.ts`

#### Erros de domínio exportados

| Classe | Quando lançada |
|--------|---------------|
| `NotFoundError` | `id` não encontrado no banco |
| `ValidationFailedError` | Validator retorna erros |
| `SlugConflictError` | Slug gerado já existe em outra categoria |

#### Operações de leitura

| Função | Descrição |
|--------|-----------|
| `listActiveCategories()` | Categorias ativas ordenadas por `sortOrder` — para a vitrine |
| `listAllCategories()` | Todas as categorias — para o admin |
| `getCategoryById(id)` | Categoria por id; lança `NotFoundError` se ausente |

#### Criação — fluxo implementado

```
name recebido
  ↓ trim()
  ↓ validateProductCategoryCreate (tamanho, formato)
  ↓ slugify(trimmedName)
  ↓ findCategoryBySlug → SlugConflictError se conflito
  ↓ createCategory (Repository)
```

`slug` gerado exclusivamente aqui — não aceito no input; `isActive` ausente do payload de criação.

#### Atualização e ciclo de vida

| Função | Descrição |
|--------|-----------|
| `updateProductCategory(id, input)` | Valida existência → trim name → validate → updateCategory; `slug` e `isActive` excluídos do input |
| `activateProductCategory(id)` | Valida existência → activateCategory |
| `deactivateProductCategory(id)` | Valida existência → deactivateCategory |

### Validações

| Etapa | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |

**Próximo:** Sprint 2.B.4 — API.

---

## [Sprint 2.B.2] — 2026-07-02 — Repository + Validator: ProductCategory

**Tipo:** Implementação de camada de dados — nenhuma API ou UI alterada.

> Revisão pós-implementação: métodos renomeados para nomenclatura orientada ao domínio (genéricos `create`, `update`, `findById` → explícitos `createCategory`, `updateCategory`, `findCategoryById`).

### Arquivos criados

#### `src/lib/repositories/productCategoryRepository.ts`

| Função | Descrição |
|--------|-----------|
| `findActiveCategories()` | Retorna categorias com `isActive = true`, ordenadas por `sortOrder` asc — usada pela vitrine |
| `findAllCategories()` | Retorna todas as categorias (ativas e inativas), ordenadas por `sortOrder` asc — usada pelo admin |
| `findCategoryById(id)` | Busca categoria por `id`; retorna `null` se não encontrada |
| `findCategoryBySlug(slug)` | Busca categoria por `slug`; retorna `null` se não encontrada — usada pelo Service para validar unicidade do slug |
| `createCategory(data)` | Persiste nova categoria; recebe `name`, `slug`, `sortOrder?`, `color?`, `icon?` — **`isActive` ausente** |
| `updateCategory(id, data)` | Persiste alterações de `name`, `sortOrder`, `color` e/ou `icon` — **`slug` e `isActive` excluídos do payload** |
| `activateCategory(id)` | Define `isActive = true` — intenção explícita de ativação |
| `deactivateCategory(id)` | Define `isActive = false` — intenção explícita de desativação |
| `countProductsByCategory(id)` | Conta produtos vinculados à categoria — usada pelo Service e pela UI admin |

Sem `delete`, `remove` ou `destroy` em nenhuma forma.

#### `src/lib/validators/productCategory.ts`

| Função | Escopo |
|--------|--------|
| `validateProductCategoryCreate(input)` | Validações na criação |
| `validateProductCategoryUpdate(input)` | Validações na edição (todos os campos opcionais) |

### Validações por campo

| Campo | Regra | Justificativa |
|-------|-------|---------------|
| `name` | Obrigatório; `trim()`; mín 2 chars; máx 100 chars; não pode ser só espaços | Nome com 1 char não tem semântica válida; 100 chars alinha com o schema |
| `slug` | Não faz parte de nenhum payload — gerado no Service, validado via `findBySlug` | Imutabilidade: o slug nunca deve ser aceito em UPDATE; unicidade verificada antes do `create` |
| `sortOrder` | Inteiro; `>= 0` | Valor negativo não tem semântica de ordem; inteiro evita `0.5` entre posições |
| `color` | Regex `/^#[0-9A-Fa-f]{6}$/` — formato `#RRGGBB` | Garante compatibilidade com CSS e color pickers; exclui formatos ambíguos como `rgb()` ou `#ABC` |
| `icon` | String não-vazia; máx 50 chars | Nomes Lucide são curtos; 50 chars evita injeção de strings longas |
| `isActive` | **Não validado** — excluído de create e update | Ativar/desativar são operações exclusivas de `activate()` e `deactivate()`; misturar com o fluxo de edição quebraria a separação de responsabilidades |

### Validações

| Etapa | Resultado |
|-------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros |

**Próximo:** Sprint 2.B.3 — Service.

---

## [Sprint 2.B.1 + 2.B.1.1] — 2026-07-02 — Schema: ProductCategory

**Tipo:** Schema + tipos — nenhuma lógica de negócio alterada.

### Mudanças realizadas

#### `prisma/schema.prisma`

```diff
 model ProductCategory {
   id        String    @id @default(cuid())
   name      String    @unique
   slug      String    @unique
-  sortOrder Int       @default(0)
-  products  Product[]
+  sortOrder Int       @default(0) // Menor valor = exibido primeiro.
+  color     String    @default("#E8A598")
+  icon      String    @default("package")
+  isActive  Boolean   @default(true)
+  products  Product[]
 }
```

#### `src/lib/types.ts`

```diff
+export interface ProductCategory {
+  id: string;
+  name: string;
+  slug: string;
+  sortOrder: number;
+  color: string;
+  icon: string;
+  isActive: boolean;
+}
+
+export type ProductCategoryInput = {
+  name: string;
+  sortOrder?: number;
+  color?: string;
+  icon?: string;
+  isActive?: boolean;
+};
```

### Validações

| Etapa | Resultado |
|-------|-----------|
| `prisma validate` | ✅ Schema válido |
| `prisma db push` | ✅ Banco sincronizado (Supabase) |
| `prisma generate` | ✅ Client gerado (v6.19.3) |
| `npx tsc --noEmit` | ✅ 0 erros |

**Próximo:** Sprint 2.B.2 — Repository + Validator.

---

## [Sprint 2.0.7] — 2026-07-01 — Consolidação Final da Governança

**Tipo:** Documentação — nenhum código alterado.

### Objetivo

Encerrar definitivamente a fase de planejamento e estabelecer as regras permanentes para implementação dos módulos do ERP. Eliminar remanescentes de duplicidade, formalizar a Definition of Done e consolidar a Política de ADR.

### Mudanças realizadas

#### PROJECT_GOVERNANCE.md

**Seção 13 — expandida para "Processo e Política de ADR":**
- Seção 13.1 — Política obrigatória: três regras formais
  - **Regra 1:** Nenhuma alteração estrutural sem ADR aprovada
  - **Regra 2:** ADR aprovada não altera o roadmap automaticamente — roadmap só muda após implementação + aceite
  - **Regra 3:** Toda ADR deve listar explicitamente os documentos impactados
- Seção 13.2 — Quando registrar (expandido com novos gatilhos: ordem de módulos, contradição com CLAUDE.md)
- Seção 13.3 — Onde registrar (inalterado)
- Seção 13.4 — Template de ADR (adicionado campo "Documentos impactados" e "Aprovado por")
- Seção 13.5 — Regra de imutabilidade (formalizada)

**Seção 23 (nova) — Definition of Done (DoD) — Encerramento de Módulo:**
Checklist obrigatório com 13 itens em 4 categorias:
1. Schema e banco de dados (Schema sincronizado, Prisma Generate, Prisma Validate)
2. Qualidade de código (tsc, lint, build)
3. Validação funcional (APIs, Front-end, testes manuais)
4. Documentação (PLAN.md, CHANGELOG.md, KNOWN_ISSUES.md, ADR)
+ Aceite explícito do usuário

Tabela de distinção entre DoD de Sprint (Seções 6/7) e DoD de Módulo (Seção 23).

**Rodapé:** Atualizado com Sprint 2.0.7.

#### PLAN.md

- Nota do bloco "ÉPICO 2 — Módulos" atualizada: "Sprint 2.0.5" → referência ao roadmap congelado (Sprint 2.0.6)
- Item 5 "Dashboard" na seção "Funcionalidades incompletas" marcado como → Módulo 2.K do ÉPICO 2
- Item 6 "Módulos administrativos" na seção "Funcionalidades incompletas" marcado como → Módulos 2.B–2.L do ÉPICO 2

### Duplicidades eliminadas nesta sprint

| Tipo | Descrição |
|------|-----------|
| Referência desatualizada | Nota "Revisado em Sprint 2.0.5" em PLAN.md — substituída por referência ao roadmap congelado |
| Itens sem cross-ref | Funcionalidades incompletas 5 e 6 sem referência aos módulos do ÉPICO 2 que as implementam |

### Declaração oficial de encerramento

**Fase de Planejamento encerrada.**

A partir deste ponto, o desenvolvimento seguirá exclusivamente o roadmap aprovado, salvo alterações autorizadas por ADR.

O próximo passo é a implementação dos módulos 2.B–2.L conforme definido em EPICO_2_PLANEJAMENTO.md Seção 7, iniciando pelo Módulo 2.B (Categorias).

**Nenhum arquivo de código foi alterado.**

---

## [Sprint 2.B.0] — 2026-07-01 — Refinamento do Domínio de Categorias (com ajustes finais)

**Tipo:** Documentação — nenhum código alterado.

### Objetivo

Consolidar definitivamente as regras de negócio da entidade `ProductCategory` antes da implementação técnica. Incluiu refinamento inicial do domínio (Sprint 2.B.0) e aplicação de 6 ajustes finais na especificação.

### Mudanças realizadas

#### EPICO_2_PLANEJAMENTO.md — Módulo 2.B

- **`sortOrder` mantido** — campo existente preservado sem renomeação; documentado como "menor valor = exibido primeiro"
- **`color`** — tipagem alterada de `String?` para `String @default("#E8A598")` (obrigatório com padrão)
- **`icon`** — tipagem alterada de `String?` para `String @default("package")` (obrigatório com padrão)
- **Produtos históricos de categorias inativas** — regra formalizada: FK preservada; apenas novos vínculos bloqueados
- **DELETE removido definitivamente de todas as camadas** — sem endpoint DELETE, sem `delete()` no Repository, sem `delete()` no Service, sem botão "Excluir" na UI; ciclo de vida restrito a Ativar / Desativar
- **Slug imutável** — somente leitura após criação; não editável via UI nem via API; registrado como decisão arquitetural

#### REGRAS_NEGOCIO.md — §3.4

- `displayOrder` → `sortOrder` na tabela de atributos
- `color String?` → `color String @default("#E8A598")`
- `icon String?` → `icon String @default("package")`
- Regra do slug atualizada: "somente leitura após criação" (era "atualizável manualmente")
- Regra do DELETE formalizada: "não possuem endpoint DELETE"
- Regra de produtos históricos reforçada: "permanecem íntegros — FK preservada"

### Decisões registradas

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Slug imutável | Após criação, `slug` é somente leitura | Evitar quebra de URLs e bookmarks já criados; mudança de `name` não propaga para slug |
| Sem DELETE | Nenhuma exclusão física em nenhuma camada | Categorias têm histórico vinculado a produtos; soft delete via `isActive` é suficiente |
| `color` e `icon` obrigatórios com default | `@default("#E8A598")` e `@default("package")` | Garante que todas as categorias tenham visual consistente sem exigir preenchimento manual |

**Nenhum arquivo de código foi alterado.**

---

## [Sprint 2.0.6] — 2026-07-01 — Higienização da Documentação do ÉPICO 2

**Tipo:** Documentação — nenhum código alterado.

### Objetivo

Consolidar definitivamente a documentação do ÉPICO 2 após as revisões das Sprints 2.0.1–2.0.5. Eliminar duplicidades, padronizar todos os módulos e declarar o roadmap congelado.

### Mudanças realizadas

#### EPICO_2_PLANEJAMENTO.md
- **Seção 1:** Tabela de módulos atualizada de 8 para 12 entradas (2.A–2.L) com coluna Status; nota de roadmap congelado
- **Seção 3:** Nota histórica adicionada ao topo — flags `FALTAM @relation` e PaymentStatus divergente como resolvidos em Sprint 2.A
- **Seção 4:** SM/4.3 itens de UnitConversion marcados ✅ (Sprint 2.A.1); campos `Product.slug`, `OccasionTag.sortOrder`, `UnitOfMeasure.type` marcados ✅ (Sprint 2.A.2); Seção 4.5 e 4.6 atualizadas
- **Seção 5 (IC):** IC-01, IC-02, IC-05, IC-07 marcados ✅ com sprint de resolução; IC-03, IC-04, IC-06 com referência ao módulo 2.X que os resolve
- **Seção 7 (Módulos 2.E–2.L):** Todos os 8 módulos padronizados para estrutura canônica: Objetivo / Dependências / Consumidores / Bloqueadores / Critérios de aceite (lista) / Sprints por camada (Schema → Repository + Validator → Service → API → Front-end → QA); "Sem Sprint de Schema" documentado onde aplicável
- **Seção 8 (Riscos):** R-01 e R-03 marcados ✅ resolvidos
- **Seção 9 (PAs):** PA-01 e PA-02 marcadas ✅ resolvidas
- **Seção 10 (SM):** SM-01, SM-02, SM-03, SM-04 marcados ✅ resolvidos
- **Seção 11 (BT):** BT-01–BT-07 marcados ✅ resolvidos; BT-10–BT-12, BT-14, BT-16, BT-17 com referências de módulo corrigidas
- **Rodapé:** Sprint 2.0.6 adicionada ao histórico de atualizações

#### PLAN.md
- ÉPICO 3: removido "Usuários/Roles" (duplicata de ÉPICO 4) e "Dashboard Executivo (CMV)" (movido para ÉPICO 2)
- ÉPICO 4: renomeado de "Inteligência Operacional" para "Expansão Operacional"; listagem corrigida
- Sprint 2.0.6 adicionada à tabela de sprints do ÉPICO 2
- P1.4, P1.5, P2.4, P2.6, P2.7, P2.8 marcados como absolvidos pelo ÉPICO 2 (Módulos 2.F, 2.K, 2.L, 2.G, 2.D, 2.I respectivamente)

#### CHANGELOG.md (este arquivo)
- Seção "Comandos pendentes (Sprint 2.A.4)" removida da entrada Sprint 2.A.1 — comandos já executados e documentados em Sprint 2.A.4

#### PROJECT_GOVERNANCE.md
- Exemplo de nomenclatura corrigido: "Módulo 2.G — Produtos" → "Módulo 2.F — Produtos"
- Nota de roadmap congelado adicionada

### Duplicidades removidas

| Tipo | Descrição |
|------|-----------|
| Tabela obsoleta | "Ordem definitiva das sprints" com 8 módulos (2.A–2.H) — substituída pela nova tabela de 12 módulos com status |
| Referências inconsistentes | IC-02/IC-07/SM-02/SM-03 como pendentes — marcados ✅ |
| Seção stale | "Comandos pendentes" no CHANGELOG.md de Sprint 2.A.1 |
| Overlap ÉPICO 3/4 | "Relatórios" e "Usuários/Roles" apareciam nos dois — resolvido |
| "CMV" em ÉPICO 4 | Dashboard Executivo (CMV) reposicionado para ÉPICO 2 (Módulos 2.J + 2.K) |
| Módulos duplicados | P1.4, P1.5, P2.4, P2.6, P2.7, P2.8 no PLAN.md cobriam os mesmos módulos do ÉPICO 2 |

### Declaração de encerramento

**Roadmap congelado.** Nenhuma alteração estrutural pode ser realizada em módulos, épicos ou ordem de sprints sem uma ADR formal registrada em PROJECT_GOVERNANCE.md Seção 6.

**Nenhum arquivo de código foi alterado.**

---

## [Sprint 2.0.5] — 2026-07-01 — Revisão Final do Roadmap do ÉPICO 2

**Tipo:** Planejamento — nenhum código alterado.

### Motivação

A Sprint 2.0.4 definiu a nova ordem de módulos mas agrupou Categorias e Ocasiões em um único módulo (2.B) e embutiu Produtos Fase 2 dentro de Receitas (2.H). A análise revelou que:

1. Separar Categorias (2.B) de Ocasiões (2.C) mantém sprints focadas e reduz escopo por módulo.
2. Produtos Fase 2 (RecipeLinker + costPrice automático + CMV) merece módulo formal próprio (2.J), pois é uma adição de complexidade real após Receitas — não um apêndice de Receitas.
3. Dashboard Operacional passa de 2.I para **2.K** (após Produtos Fase 2), pois o CMV requer `costPrice` calculado.
4. Clientes passa de 2.J para **2.L**.

### Mudanças na numeração

| Módulo | Sprint 2.0.4 | Sprint 2.0.5 | Alteração |
|--------|-------------|-------------|-----------|
| Categorias | 2.B (junto com Ocasiões) | **2.B** (standalone) | Separado de Ocasiões |
| Ocasiões | 2.B (junto com Categorias) | **2.C** (standalone) | Módulo próprio |
| Unidades | 2.D | **2.D** | Sem alteração |
| Fornecedores | 2.E | **2.E** | Sem alteração |
| Produtos Fase 1 | 2.C | **2.F** | Renumerado (atrás de Unidades + Fornecedores) |
| Ingredientes | 2.F | **2.G** | Renumerado |
| Embalagens | 2.G | **2.H** | Renumerado |
| Receitas | 2.H (incluía fase 2 de Produtos) | **2.I** (apenas Receitas) | RecipeLinker extraído para 2.J |
| Produtos Fase 2 | — (embutido em 2.H) | **2.J** (módulo formal) | Novo: RecipeLinker + costPrice + CMV base |
| Dashboard Operacional | 2.I | **2.K** | Após costPrice disponível (2.J) |
| Clientes | 2.J | **2.L** | Renumerado |

### Total de módulos

| Versão | Módulos |
|--------|---------|
| Sprint 2.0.1 | 8 (2.A–2.H) |
| Sprint 2.0.4 | 10 (2.A–2.J) |
| **Sprint 2.0.5** | **12 (2.A–2.L)** |

### Documentos alterados

- `PLAN.md` — tabela de módulos 2.B–2.L atualizada
- `EPICO_2_PLANEJAMENTO.md` — Seção 7 completamente reescrita com os 12 módulos (2.B–2.L), cada um com Objetivo, Dependências, Consumidores, Por que aqui, tabela de sprints e Critério de aceite; BT-08 atualizado para 2.K
- `CHANGELOG.md` — esta entrada

**Nenhum arquivo de código foi alterado.**

---

## [Sprint 2.0.4] — 2026-07-01 — Revisão do Roadmap do ÉPICO 2

**Tipo:** Planejamento — nenhum código alterado.

### Motivação

A ordem original (Sprint 2.0.1) priorizava Dashboard cedo (2.B) e deixava a cadeia produtiva para depois. Análise de dependências revelou que a consolidação de ingredientes — o feature mais valioso do Dashboard para a equipe — é impossível sem Receitas. Implementar o Dashboard antes de Receitas significa ou (a) entregar o Dashboard incompleto com retrabalho posterior, ou (b) atrasar a consolidação indefinidamente.

A nova ordem aplica o princípio: **módulos produtores de dados antes dos consumidores**.

### Mudanças

| Módulo | Posição anterior | Posição nova | Motivo |
|--------|-----------------|--------------|--------|
| Categorias + Ocasiões | 2.F | **2.B** | Raiz sem dependências; desbloqueia Produtos mais cedo |
| Produtos | 2.G | **2.C** | Valor imediato de catálogo; RecipeLinker → fase 2 em 2.H |
| Unidades | 2.C | **2.D** | Mesmo papel; renumerado |
| Fornecedores | 2.D | **2.E** | Mesmo papel; renumerado |
| Ingredientes | 2.E | **2.F** | Mesmo papel; renumerado |
| Embalagens | ÉPICO 3.A | **2.G** | Schema Packaging necessário antes de Receitas |
| Receitas | ÉPICO 3.B | **2.H** | Pré-requisito para Dashboard completo; move para ÉPICO 2 |
| Dashboard | **2.B** | **2.I** | Implementado uma vez, completo, com consolidação de ingredientes |
| Clientes | 2.H | **2.J** | Mantido como último; independente da cadeia de produção |

### Impacto nos épicos

| Épico | Conteúdo anterior | Conteúdo novo |
|-------|------------------|---------------|
| ÉPICO 2 | 8 módulos (2.A–2.H) — sem Embalagens e Receitas | **10 módulos (2.A–2.J)** — inclui Embalagens e Receitas |
| ÉPICO 3 | Embalagens UI, Receitas, Precificação, Batch | **Precificação automática, Dashboard Batch, alertas de margem** |

### Documentos alterados

- `PLAN.md` — tabela de módulos 2.B–2.J atualizada
- `EPICO_2_PLANEJAMENTO.md` — Seção 7 reescrita com nova ordem, decisões e sprints
- `CHANGELOG.md` — esta entrada

**Nenhum arquivo de código foi alterado.**

---

## [Sprint 2.A.4] — 2026-07-01 — Validação Final e Encerramento do Módulo 2.A

**Tipo:** Validação — nenhum código alterado.
**Módulo:** 2.A — Consolidação Técnica

### Comandos executados e resultados

| # | Comando | Resultado |
|---|---------|-----------|
| 1 | `npx prisma validate` | ✅ Schema válido |
| 2 | `npx prisma generate` | ✅ Prisma Client (v6.19.3) regenerado em 153ms |
| 3 | `npx prisma db push --accept-data-loss` | ✅ Banco sincronizado em 5.42s — constraint `UNIQUE (fromUnitId, toUnitId)` criada em `UnitConversion` |
| 4 | `npm run lint` | ✅ 0 erros |
| 5 | `npx tsc --noEmit` | ✅ 0 erros |
| 6 | `npm run build` | ✅ 18 rotas compiladas sem erro ou warning |
| 7 | `npm run dev` | ✅ Servidor em 722ms — zero exceções Prisma ou Next.js |
| 8 | `GET /api/config` | ✅ HTTP 200 — `logoUrl` e `faviconUrl` presentes e tipados corretamente |
| 9 | Busca `$executeRaw`/`$queryRaw` em `src/` | ✅ 0 ocorrências |

### Evidência do `GET /api/config`

```json
HTTP 200
{
  "id": "cmqynv9iq000qw09wrw10hlo9",
  "name": "Doce Menina",
  "logoUrl": null,
  "faviconUrl": null,
  "freeDeliveryRadiusKm": 3,
  "addressCity": "São Paulo",
  "addressState": "SP",
  ...
}
```

### Issues fechados

| ID | Descrição | Sprint que resolveu |
|----|-----------|---------------------|
| KI-17 | `PaymentStatus` divergente — `FALHOU/REEMBOLSADO` vs `PARCIAL/ESTORNADO` | 2.A.2 |
| IC-02 | `UnitConversion` sem `@relation` explícito | 2.A.1 |
| IC-07 | `UnitConversion` sem `@@unique([fromUnitId, toUnitId])` | 2.A.1 |
| DT-01 | `themeConfigRepository` com `$executeRaw`/`$queryRaw` | 2.A.3 |

### Build output (18 rotas)

```
○ /            ○ /admin           ○ /admin/config
○ /admin/em-construcao            ○ /admin/login
○ /admin/producao                 ○ /checkout
○ /login       ○ /pedidos         ○ /wireframes
ƒ /api/admin/upload               ƒ /api/auth/[...nextauth]
ƒ /api/config  ƒ /api/occasions   ƒ /api/orders
ƒ /api/orders/[id]/status         ƒ /api/products
ƒ Proxy (Middleware)
```

**Nenhum arquivo de código foi alterado nesta sprint.**

---

## [Sprint 2.A.3] — 2026-07-01 — Migração do ThemeConfigRepository para Prisma Client Tipado

**Tipo:** Refatoração de Repository — nenhum schema, TypeScript, service, API ou componente alterado.
**Módulo:** 2.A — Consolidação Técnica

### Problema (DT-01)

`themeConfigRepository.ts` usava `$executeRaw` e `$queryRaw` (SQL manual) porque `faviconUrl` foi adicionado ao `schema.prisma` durante a Sprint 1.3 sem reexecutar `prisma generate`. O Prisma Client gerado não conhecia o campo, impossibilitando o uso das APIs tipadas.

**Sprint 2.A.3.1** (pré-requisito): `prisma generate` executado → `faviconUrl` agora existe em `ThemeConfigScalarFieldEnum` e nos tipos gerados (31 ocorrências confirmadas em `index.d.ts`).

### Microtarefas concluídas

| MT | Função | Antes | Depois |
|----|--------|-------|--------|
| MT-1 | `updateThemeConfigBranding()` | `$executeRaw` UPDATE + `void` return | `prisma.themeConfig.update()` → retorna `PrismaThemeConfig` |
| MT-2 | `createDefaultThemeConfig()` | `$executeRaw` INSERT + `findFirstOrThrow()` (2 round-trips) | `prisma.themeConfig.create()` → retorna direto (1 round-trip) |
| MT-3 | `getThemeBranding()` | `$queryRaw` SELECT com anotação manual de tipo | `prisma.themeConfig.findFirst({ select })` → tipagem automática |

### Resultado final

```typescript
// themeConfigRepository.ts — nenhum raw SQL
import { prisma } from "@/lib/prisma";
import type { ThemeConfig as PrismaThemeConfig } from "@prisma/client";

export async function findActiveThemeConfig(): Promise<PrismaThemeConfig | null> {
  return prisma.themeConfig.findFirst({ where: { isActive: true } });
}

export async function updateThemeConfigBranding(id, logoUrl, faviconUrl): Promise<PrismaThemeConfig> {
  return prisma.themeConfig.update({ where: { id }, data: { logoUrl, faviconUrl } });
}

export async function createDefaultThemeConfig(logoUrl, faviconUrl): Promise<PrismaThemeConfig> {
  return prisma.themeConfig.create({ data: { logoUrl, faviconUrl } });
}

export async function getThemeBranding(): Promise<{ logoUrl, faviconUrl }> {
  const result = await prisma.themeConfig.findFirst({
    where: { isActive: true },
    select: { logoUrl: true, faviconUrl: true },
  });
  return result ?? { logoUrl: null, faviconUrl: null };
}
```

### Validação

```
grep "$executeRaw|$queryRaw" src/  → 0 ocorrências ✅
npx tsc --noEmit                   → 0 erros ✅
```

### Ganhos

- **Tipagem:** Prisma valida campos em compile-time; `faviconUrl: string | null` garantido pelo schema
- **Performance:** `createDefaultThemeConfig` eliminou um round-trip ao banco (INSERT + SELECT → apenas CREATE)
- **Manutenibilidade:** SQL manual substituído por API Prisma — refatorações de schema se propagam automaticamente
- **Segurança:** SQL injection estruturalmente impossível nas funções migradas

### Arquivo alterado

- `src/lib/repositories/themeConfigRepository.ts` — 4 funções refatoradas; comentários de workaround removidos

**Nenhum outro arquivo foi alterado.**

---

## [Sprint 2.A.2] — 2026-07-01 — Correções Exclusivas dos Enums Financeiros

**Tipo:** Correção de TypeScript — nenhum schema Prisma, API, service, repository ou componente alterado.
**Módulo:** 2.A — Consolidação Técnica

### Divergência corrigida

**`PaymentStatus` em `src/lib/types.ts`** (KI-17)

```diff
 export type PaymentStatus =
   | "PENDENTE"
   | "PAGO"
-  | "FALHOU"
-  | "REEMBOLSADO";
+  | "PARCIAL"
+  | "ESTORNADO";
```

### Validação dos demais enums financeiros

| Enum | TypeScript | Prisma | Status |
|------|-----------|--------|--------|
| `PaymentStatus` | `PENDENTE \| PAGO \| PARCIAL \| ESTORNADO` | `PENDENTE \| PAGO \| PARCIAL \| ESTORNADO` | ✅ Corrigido |
| `PaymentMethod` | `PIX_ONLINE \| PIX_ENTREGA \| DINHEIRO \| CARTAO_CREDITO` | idem | ✅ Idêntico |
| `DeliveryType` | `RETIRADA \| ENTREGA_APP \| ENTREGA_GRATIS` | idem | ✅ Idêntico |
| `OrderStatus` | `RASCUNHO \| CONFIRMADO \| EM_PRODUCAO \| PRONTO \| SAIU_ENTREGA \| ENTREGUE \| CANCELADO` | idem | ✅ Idêntico |
| `PixKeyType` | `CPF \| CNPJ \| EMAIL \| TELEFONE \| ALEATORIA` | idem | ✅ Idêntico |

### Labels e dictionaries revisados

| Dictionary | Enum | Status |
|-----------|------|--------|
| `PAYMENT_LABELS` | `PaymentMethod` | ✅ Sem alteração necessária |
| `STATUS_LABELS` | `OrderStatus` | ✅ Sem alteração necessária |
| `DELIVERY_LABELS` | `DeliveryType` | ✅ Sem alteração necessária |
| `PIX_KEY_TYPE_LABELS` | `PixKeyType` | ✅ Sem alteração necessária |
| `PAYMENT_STATUS_LABELS` | `PaymentStatus` | ⚠️ Não existe — nenhum label dictionary para PaymentStatus (aceitável: não usado em UI ainda) |

### Confirmação de limpeza

```
grep "FALHOU|REEMBOLSADO" src/  → 0 ocorrências ✅
grep "FALHOU|REEMBOLSADO" prisma/ → 0 ocorrências ✅
```

### Impacto

- **Zero impacto em runtime** — nenhuma API, service ou componente usava `"FALHOU"` ou `"REEMBOLSADO"` como valor real
- **`types.ts` agora consistente com `schema.prisma`** — integração PIX (ÉPICO 5) poderá usar `"PARCIAL"` e `"ESTORNADO"` com type safety
- **Arquivo alterado:** `src/lib/types.ts` (2 valores substituídos, linha 18–22)

**Nenhum outro arquivo foi alterado.**

---

## [Sprint 2.A.1] — 2026-07-01 — Correções Exclusivas do Schema Prisma

**Tipo:** Correção de schema — nenhum código TypeScript, API, componente ou serviço alterado.
**Módulo:** 2.A — Consolidação Técnica

### Inconsistências encontradas

| # | Tipo | Descrição | Prioridade | Ação |
|---|------|-----------|-----------|------|
| IC-02 | Relação ausente | `UnitConversion.fromUnitId` sem `@relation` — zero integridade referencial | Alta | ✅ Corrigido |
| IC-07 | Relação ausente | `UnitConversion.toUnitId` sem `@relation` — zero integridade referencial | Alta | ✅ Corrigido |
| — | Constraint ausente | `UnitConversion` sem `@@unique([fromUnitId, toUnitId])` — conversões duplicadas possíveis | Alta | ✅ Corrigido |
| — | Índice redundante | `Customer.@@index([phone])` duplica o índice criado por `phone @unique` | Baixa | ✅ Removido |
| — | Índice ausente | `Ingredient` sem `@@index([categoryId])` — FK sem índice | Baixa | ✅ Adicionado |
| IC-05 | Enum ausente | `UnitOfMeasure.type` é `String` em vez de `enum UnitType` | Baixa | ⏳ Deferido → Sprint 2.C (risco de migração de dados seed) |
| — | `@@map` ausente | Nenhum modelo usa `@@map("snake_case")` conforme PROJECT_GOVERNANCE.md | Baixa | ⏳ Deferido → estabelecer em novos modelos; retrofit requer migração dedicada |
| KI-17 | Enum divergente | `PaymentStatus` no schema (`PARCIAL/ESTORNADO`) diverge de `types.ts` (`FALHOU/REEMBOLSADO`) | Alta | ⏳ Deferido → Sprint 2.A.2 (schema correto; fix em TypeScript) |

### Correções aplicadas

**1. `UnitConversion` — integridade referencial e unicidade**

Adicionados `@relation` nomeados (`"ConversionsFrom"`, `"ConversionsTo"`) com `onDelete: Restrict` para `fromUnitId` e `toUnitId`. Adicionadas relações inversas `conversionsFrom` e `conversionsTo` em `UnitOfMeasure`. Adicionado `@@unique([fromUnitId, toUnitId])`.

**2. `Customer` — índice redundante removido**

`@@index([phone])` removido — o campo `phone @unique` já cria um índice B-tree implícito no PostgreSQL.

**3. `Ingredient` — índice de FK adicionado**

`@@index([categoryId])` adicionado — FK sem índice causava full scan ao filtrar por categoria.

### Diff resumido

```diff
 model UnitOfMeasure {
   ...
+  conversionsFrom UnitConversion[] @relation("ConversionsFrom")
+  conversionsTo   UnitConversion[] @relation("ConversionsTo")
   ...
 }

 model UnitConversion {
   id           String        @id @default(cuid())
   fromUnitId   String
+  fromUnit     UnitOfMeasure @relation("ConversionsFrom", fields: [fromUnitId], references: [id], onDelete: Restrict)
   toUnitId     String
+  toUnit       UnitOfMeasure @relation("ConversionsTo",   fields: [toUnitId],   references: [id], onDelete: Restrict)
   factor       Decimal       @db.Decimal(18, 8)
   description  String?
   createdAt    DateTime      @default(now())
+  @@unique([fromUnitId, toUnitId])
 }

 model Customer {
   ...
-  @@index([phone])   ← redundante com phone @unique
 }

 model Ingredient {
   ...
   @@index([name])
+  @@index([categoryId])
 }
```

### Impactos

- **Nenhuma tabela criada ou excluída** — alterações afetam apenas índices e constraints
- **`UnitConversion`:** `db push` irá adicionar constraint `UNIQUE(fromUnitId, toUnitId)` e FKs com `ON DELETE RESTRICT`. Se houver conversões duplicadas no banco, o push falhará — remover manualmente antes
- **`Customer`:** remoção do índice redundante é transparente para o banco; o índice único permanece
- **`Ingredient`:** adição de índice sem impacto funcional

**Nenhum código TypeScript, API, componente ou serviço foi alterado.**

---

## [Módulo 2.A — Reorganização] — 2026-07-01 — Consolidação Técnica

**Tipo:** Planejamento — nenhum código alterado.

Módulo 2.A reorganizado em 4 sprints independentes por camada para reduzir risco de regressões. Cada sprint tem escopo exclusivo e não toca nas outras camadas.

| Sprint | Camada | Escopo |
|--------|--------|--------|
| Sprint 2.A.1 | Schema | Correções exclusivas do Schema Prisma: relacionamentos, UnitConversion, constraints, índices, enums do banco |
| Sprint 2.A.2 | TypeScript | Correções exclusivas de TypeScript: PaymentStatus, enums, tipos, validators, interfaces |
| Sprint 2.A.3 | Repository | Refatoração exclusiva de Repository: eliminar `$executeRaw`, migrar para Prisma Client tipado, comportamento idêntico |
| Sprint 2.A.4 | Validação | `prisma generate` + `db push` + `lint` + `tsc` + `dev`; validar APIs, banco e front-end; atualizar documentação |

**Nenhum código foi alterado.**

---

## [Sprint 2.0.3] — 2026-07-01 — Blueprint Funcional do ERP

**Tipo:** Documentação — nenhum código alterado.

Criado `ERP_BLUEPRINT.md` com documentação funcional completa do sistema do ponto de vista do negócio.
18 módulos documentados × 14 dimensões cada (objetivo, quem usa, fluxo principal, entradas, saídas, dependências, regras de negócio, eventos produzidos, eventos consumidos, permissões, indicadores, integrações, riscos, futuras evoluções).
Mapa geral do ERP mostrando todas as relações entre módulos.
Glossário com 17 termos do negócio.

**Nenhum código foi alterado.**

---

## [Sprint 2.0.2] — 2026-07-01 — Governança do Projeto

**Tipo:** Documentação — nenhum código alterado.

### Objetivo
Criar o documento oficial de governança do projeto: regras, padrões, processos e convenções que governam todas as implementações a partir do ÉPICO 2.

### Entregável
`PROJECT_GOVERNANCE.md` — 22 seções, ~400 linhas:

| Seção | Conteúdo |
|-------|---------|
| 1–2 | Objetivo e estrutura oficial (PROJETO → ÉPICO → MÓDULO → SPRINT → MICROTAREFA → REVISÃO → QA → ACEITE) |
| 3 | Convenção de nomenclatura para épicos, módulos, sprints e microtarefas |
| 4 | Fluxo obrigatório de desenvolvimento (6 etapas) |
| 5–7 | Critérios de início, encerramento e checklist de aceite |
| 8 | Padrões arquiteturais: Route / Service / Validator / Repository / Componentes / Prisma |
| 9–12 | Convenções: React, Prisma, APIs, documentação |
| 13 | Processo ADR (registro de decisões arquiteturais) |
| 14–15 | Política de dívida técnica e refatorações |
| 16–17 | Processo de revisão técnica e QA |
| 18 | Processo para uso de IA (Claude, Cursor) |
| 19–22 | Templates oficiais: Sprint, Revisão Técnica, QA, Critérios de Aceite |

### Documentos atualizados
- `PLAN.md` — sprints 2.0, 2.0.1, 2.0.2 registradas; link para PROJECT_GOVERNANCE.md

**Nenhum código foi alterado.**

---

## [Sprint 2.0 + Sprint 2.0.1] — 2026-07-01 — Planejamento Arquitetural do ÉPICO 2

**Tipo:** Planejamento — nenhum código foi alterado.

### Sprint 2.0 — Análise dos Módulos de Cadastros Mestres

Análise de 10 módulos × 16 questões cada, criação de Domain Map, revisão do schema Prisma atual (23 modelos + 7 enums), identificação de 7 inconsistências (IC-01 a IC-07). Produzido `EPICO_2_PLANEJAMENTO.md` (1.440+ linhas).

### Sprint 2.0.1 — Consolidação e Novo Roadmap Oficial

Avaliação de 6 questões estruturais e reorganização do roadmap do ÉPICO 2 de 5 sprints (2.1–2.5) para 8 módulos (2.A–2.H).

#### Decisões tomadas

| Decisão | Resultado |
|---------|-----------|
| Dashboard antes dos módulos de negócio | **Sim** — Dashboard Operacional vira Módulo 2.B (imediatamente após 2.A) |
| Schema de Packaging no ÉPICO 2 | **Sim** — modelos `Supplier`, `Packaging`, `PackagingItem` incluídos na Sprint 2.A.2 |
| Fornecedor antes de Ingrediente | **Sim** — Módulo 2.D precede 2.E para evitar migração com dados existentes |
| Dashboard Operacional vs. Executivo separados | **Sim** — 2.B (kanban/urgentes/contadores) e ÉPICO 4.A (CMV/margens/financeiro) |
| Módulo Usuários reposicionado | Removido do ÉPICO 2 → ÉPICO 4.D (não é bloqueante para operação de dados) |

#### Nova estrutura de módulos do ÉPICO 2

| Módulo | Descrição | Prioridade |
|--------|-----------|-----------|
| 2.A | Correções Fundamentais (KI-17, IC-02, DT-01 + schema Supplier/Packaging/PackagingItem) | Pré-requisito absoluto |
| 2.B | Dashboard Operacional Real (KI-04) | Alto valor, baixo esforço de schema |
| 2.C | Unidades de Medida | Base para Insumos e Receitas |
| 2.D | Fornecedores | Base para Insumos |
| 2.E | Insumos (Ingredientes) | Base para Receitas (ÉPICO 3) |
| 2.F | Categorias e Ocasiões | Base para Produtos |
| 2.G | Produtos | Base do catálogo |
| 2.H | Clientes | Encerra o ÉPICO 2 |

#### Impacto esperado na redução de retrabalho

- **Packaging em 2.A (schema antecipado):** evita migration disruptiva ao adicionar `PackagingItem` em Receitas com dados de produção já existentes
- **Fornecedor em 2.D antes de 2.E:** migração `Ingredient.supplier: String?` → FK muito mais barata antes de popular ingredientes em produção
- **Dashboard em 2.B:** equipe com ferramenta operacional real antes de completar todo o stack de cadastros
- **Usuários em ÉPICO 4:** não bloqueia nenhum módulo de dados; sem conflito de schema

#### Documentos atualizados
- `EPICO_2_PLANEJAMENTO.md` — Seção 7 reescrita com estrutura 2.A–2.H; PA-01 marcada como resolvida
- `PLAN.md` — tabela de Épicos e módulos do ÉPICO 2 atualizadas

**Nenhum código foi alterado.**

---

## [ÉPICO 1 — Encerrado] — 30/06/2026

**11 sprints concluídas em 2 dias (28–30/06/2026).**

### Resumo executivo
O ÉPICO 1 estabeleceu a fundação completa do sistema: front-end funcional, infraestrutura de banco e autenticação, 9 APIs, 1 módulo admin completo (Configuração da Empresa), arquitetura de 4 camadas (Route → Service → Validator → Repository), 20+ documentos de arquitetura/produto/design e 15 componentes reutilizáveis.

### Métricas de encerramento
| Métrica | Valor |
|---------|-------|
| Páginas | 10 |
| Componentes | 15 |
| Services | 5 |
| Repositories | 2 |
| Validators | 1 |
| APIs (route handlers) | 7 arquivos / 9 rotas |
| Tabelas Prisma | 23 modelos + 7 enums |
| Linhas de código TS/TSX | ~3.787 |
| Documentos | 20+ |

### Pendências herdadas para o ÉPICO 2
- ✅ **KI-17** (Alta): `PaymentStatus` divergente — resolvido Sprint 2.A.2
- **KI-04** (Alta): Dashboard de produção com dados hardcoded — Módulo 2.K
- **KI-03** (Alta): WhatsApp e PIX ausentes — ÉPICO 5
- 11 módulos admin sem implementação (2.B–2.L)

Ver [EPICO_1.md](EPICO_1.md) para relatório executivo completo.

---

## [Sprint 1.3] — 2026-06-30 — Refatoração arquitetural do módulo Configuração

**Motivação:** `page.tsx` tinha 774 linhas com Toast, Skeleton, Upload, validação inline, ViaCEP e 6 seções todas misturadas. Sem funcionalidade nova — apenas extração de responsabilidades.

**Resultado:** página passou de 774 → 171 linhas. Sem alteração de comportamento.

### Componentes criados: `src/components/admin/config/`

| Componente | Responsabilidade | Linhas |
|------------|-----------------|--------|
| `FormPrimitives.tsx` | `Field`, `Section`, tipos `FormSetter` e `FieldErrorSetter` | 43 |
| `LoadingSkeleton.tsx` | Skeleton de carregamento da página | 32 |
| `ValidationSummary.tsx` | Toast (success/error/warning/loading) | 44 |
| `ActionBar.tsx` | Barra de ação fixa: Voltar + Salvar | 26 |
| `UploadImage.tsx` | Componente de upload com preview e error | 81 |
| `BrandSection.tsx` | Seção Identidade visual (logo + favicon) | 46 |
| `CompanySection.tsx` | Seções Identificação + Contato | 113 |
| `AddressSection.tsx` | Seção Endereço com ViaCEP | 136 |
| `DeliverySection.tsx` | Seção Entrega (raio) | 26 |
| `PixSection.tsx` | Seção PIX (tipo + chave + preview) | 79 |
| `PricingSection.tsx` | Seção Precificação (4 campos) | 88 |

### Utilitários criados

| Arquivo | Conteúdo |
|---------|---------|
| `src/app/admin/config/configHelpers.ts` | `EMPTY_INPUT` e `configToInput` | 54 |
| `src/lib/formatters/cnpj.ts` | `maskCNPJ` |
| `src/lib/formatters/phone.ts` | `maskPhone` |
| `src/lib/formatters/cep.ts` | `maskCEP`, `rawDigits` |
| `src/lib/formatters/currency.ts` | `formatCurrency` |
| `src/lib/formatters/date.ts` | `formatDate` |
| `src/lib/formatters/pix.ts` | `getPixPlaceholder` |
| `src/lib/address/ViaCepService.ts` | `lookupCEP`, `CepNotFoundError`, `ViaCepResult` |
| `src/lib/storage/StorageService.ts` | `uploadAsset`, `AssetType`, `UploadResult` |

### Arquivos modificados

- `src/app/admin/config/page.tsx` — 774 → 171 linhas (orquestrador puro)
- `src/lib/utils.ts` — 46 → 12 linhas (removidos masks e formatters; mantido apenas `getMinDeliveryDate`)
- `src/lib/mock-data.ts` — `formatCurrency` passa a re-exportar de `formatters/currency`
- `src/app/pedidos/page.tsx` — import `formatDate` atualizado para `formatters/date`

**Validação:** `npx tsc --noEmit` → 0 erros | `npm run lint` → 0 erros

---

## [Sprint 1.1] — 2026-06-30 — Módulo Configuração da Empresa (em andamento)

### Objetivo
Implementar o módulo completo de Configuração da Empresa (`/admin/config`), cobrindo todas as camadas: schema, tipos, validação, repository, service, API e UI.

### Arquitetura adotada
Route → Service → Validator → Repository → Prisma (4 camadas + singleton Prisma)

### Sprint 1.2 — Módulo Configuração da Empresa: finalização ✅ Concluída (30/06/2026)

**Objetivo:** Completar todas as camadas do módulo `/admin/config` iniciado na Sprint 1.1.

**Arquivos criados:**
- `prisma/schema.prisma` — adicionado `faviconUrl String?` ao modelo `ThemeConfig`
- `src/lib/validators/storeConfig.ts` — `validateStoreConfig(input): ValidationError[]` puro, sem dependências
- `src/lib/repositories/storeConfigRepository.ts` — acesso Prisma isolado para `StoreConfig`
- `src/lib/repositories/themeConfigRepository.ts` — `$executeRaw` / `$queryRaw` para branding (logoUrl, faviconUrl); evita dependência de db:generate
- `src/lib/storeConfigService.ts` — autenticação via `getServerSession`, validação, upsert singleton, mapeamento `Decimal→number`
- `src/app/api/admin/upload/route.ts` — upload de logo/favicon para Supabase Storage via REST; validação de tipo e tamanho
- `src/app/admin/config/page.tsx` — formulário completo: 6 seções, máscaras, ViaCEP, preview PIX, upload de imagens, toasts, validação inline

**Arquivos editados:**
- `src/lib/types.ts` — adicionados `logoUrl`, `faviconUrl` em `StoreConfig` e `StoreConfigInput`
- `src/lib/utils.ts` — adicionadas `maskCNPJ`, `maskPhone`, `maskCEP`, `rawDigits`
- `src/app/api/config/route.ts` — GET atualizado (response mesclado StoreConfig + ThemeConfig branding); PATCH adicionado
- `src/proxy.ts` — `"/admin/config": ["ADMIN"]` adicionado ao `ROLE_REQUIRED`
- `src/app/admin/page.tsx` — card "Configurações ⚙️" adicionado ao hub admin
- `.env.example` — adicionados `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

**Funcionalidades implementadas:**
- Upload de logomarca (JPEG/PNG/SVG/WebP, máx 2 MB) e favicon (PNG/SVG/ICO, máx 512 KB)
- Preview das imagens com botão "Trocar" e "Remover"
- Máscara para CNPJ (00.000.000/0001-00), telefone e CEP
- Busca automática de endereço via ViaCEP (logradouro, bairro, cidade, UF, ibgeCode)
- Preview do PIX (tipo + chave) antes de salvar
- Validação inline por campo (onBlur + submit)
- Toast de loading/success/error
- Skeleton de carregamento por seção
- Barra de ação fixa com botão "Salvar" e link "Voltar"

**Nota técnica:** `themeConfigRepository.ts` usa `$executeRaw`/`$queryRaw` enquanto `db:generate` não for executado com `faviconUrl` no schema. Após generate, pode-se migrar para o client tipado.

---

### MT-1 — Migration do schema ✅ Concluída

**Schema:** `prisma/schema.prisma`
- Adicionado `enum PixKeyType { CPF CNPJ EMAIL TELEFONE ALEATORIA }`
- Adicionados 7 campos opcionais ao modelo `StoreConfig`:
  - `legalName String?` — razão social para DRE e NFe (Fase 7)
  - `cnpj String?` — 14 dígitos para integrações fiscais (Fase 7)
  - `instagram String?` — handle @, identidade da marca
  - `addressComplement String?` — sala, bloco, andar
  - `ibgeCode String?` — código IBGE do município para NFe (Fase 7)
  - `pixKeyType PixKeyType?` — tipo de chave PIX (enum)
  - `pixKey String?` — chave PIX literal
- `prisma db push` executado: banco sincronizado
- `npm run db:generate` executado: Prisma Client regenerado com `PixKeyType`

**Validação MT-1:**
| Verificação | Resultado |
|-------------|-----------|
| `GET /api/config` | ✅ Retorna todos os 7 campos novos (null) + campos existentes |
| `pixKeyType` no response | ✅ `null` (campo presente, enum reconhecido) |
| `legalName`, `cnpj`, `instagram`, `ibgeCode` | ✅ Presentes no response |
| `addressComplement` | ✅ Presente no response |

### Pendente (MTs 2–9)
MT-2: tipos TypeScript | MT-3: validator | MT-4: repository | MT-5: service | MT-6: PATCH /api/config | MT-7: proxy | MT-8: página | MT-9: hub admin

---

## [Sprint C1] — 2026-06-30 — Revisão Final da Fundação

### Objetivo
Revisão completa de consistência entre todos os 16 documentos antes do início dos módulos de negócio.

### Documentos lidos e validados
VISION.md, CLAUDE.md, ARCHITECTURE.md, DOMAIN_MODEL.md, MODULES.md, DESIGN_SYSTEM.md, UX_GUIDELINES.md, USER_FLOW.md, MENU_STRUCTURE.md, SCREENS.md, USER_JOURNEY.md, REGRAS_NEGOCIO.md, PLAN.md, REVIEW.md, CHANGELOG.md, KNOWN_ISSUES.md.

### Achados e correções

#### KI-17 (novo) — PaymentStatus divergente (Crítico)
- Identificado bug introduzido na Sprint A2 ao resolver KI-12: `src/lib/types.ts` define `"FALHOU"` e `"REEMBOLSADO"`, enquanto `prisma/schema.prisma` define `PARCIAL` e `ESTORNADO`.
- Registrado como KI-17 em `KNOWN_ISSUES.md` e TD-16 em `MODULES.md`.
- **Ação necessária (Sprint 1):** Corrigir `PaymentStatus` em `src/lib/types.ts`.

#### KI-15 — Fins de semana implementados (Parcial)
- `src/lib/utils.ts:19–20` confirma que `getMinDeliveryDate` já avança para segunda-feira quando resultado cai em sábado ou domingo.
- Status em `KNOWN_ISSUES.md` atualizado de "AGUARDANDO DEFINIÇÃO" para "PARCIALMENTE RESOLVIDO".
- Pendência: formalizar a regra em `REGRAS_NEGOCIO.md`.

#### MODULES.md — Dívida técnica atualizada
- TD-01 a TD-05, TD-08, TD-12, TD-15: marcados como ✅ (resolvidos na Sprint A2).
- TD-06 e TD-10: marcados como ⚠️ parcial.
- TD-13: marcado como ⚠️ (implementado sem formalização).
- TD-16 (novo): PaymentStatus divergência.
- TD-17 (novo): `formatCurrency` importado de `mock-data` em 4 arquivos.
- Status de módulos da Fase 1 e Fase 2 corrigido para refletir o que foi resolvido na Sprint A2.

#### PLAN.md — Sprints adicionadas
- Tabela de status atualizada com Sprint A2, P1, P2, P3 e C1.
- Tabelas de documentação completadas com os 6 documentos da Sprint P1, P2 e P3.

### Documentação não alterada (consistente)
- VISION.md, ARCHITECTURE.md, DOMAIN_MODEL.md, REGRAS_NEGOCIO.md, REVIEW.md: sem inconsistências que requeiram atualização.
- DESIGN_SYSTEM.md, UX_GUIDELINES.md, USER_FLOW.md, USER_JOURNEY.md, MENU_STRUCTURE.md, SCREENS.md: produzidos nas sprints P1–P3, sincronizados com o estado atual.

### Veredicto
Projeto **PRONTO** para iniciar módulos de negócio com duas condições obrigatórias:
1. Corrigir KI-17 (PaymentStatus) antes de qualquer integração financeira.
2. Preencher `ROLE_REQUIRED` em `src/proxy.ts` ao implementar cada módulo com papel restrito.

---

## [Sprint P3] — 2026-06-29 — UX Guidelines

### Produzido (somente documentação — nenhum código alterado)
- `UX_GUIDELINES.md` — 18 seções de diretrizes de UX: princípios, formulários, botões, mensagens, erros, validações, navegação, pesquisa, ordenação, filtros, tabelas, mobile, desktop, tablet, dark mode, light mode.
- Atualização de `CLAUDE.md` — referência ao `UX_GUIDELINES.md` adicionada à tabela de documentação.

---

## [Sprint P2] — 2026-06-29 — Design System

### Produzido (somente documentação — nenhum código alterado)
- `DESIGN_SYSTEM.md` — 20 componentes de UI documentados (Botões, Inputs, Select, Autocomplete, Tabela, Cards, Modais, Drawer, Tabs, Stepper, Badges, Alertas, Toasts, Loading, Skeleton, Paginação, Filtros, Calendário, Upload, Gráficos). Cada componente com: Objetivo, Comportamento, Variações, Estados, Boas práticas, Responsividade, Acessibilidade, Padronização visual.

---

## [Sprint P1] — 2026-06-29 — Planejamento Funcional

### Produzido (somente documentação — nenhum código alterado)
- `MENU_STRUCTURE.md` — menu lateral completo: 24 itens em 8 grupos, roles por rota, mapa `ROLE_REQUIRED` para `src/proxy.ts`, status de implementação.
- `SCREENS.md` — 33 telas documentadas (C-01 a C-06 cliente; A-01 a A-33 admin): Objetivo, Campos, Filtros, Ações, Permissões, Integrações, Dependências, Status.
- `USER_FLOW.md` — jornadas por módulo com fluxos numerados, condicionais, APIs chamadas e estados de erro.
- `USER_JOURNEY.md` — jornadas narrativas das 4 personas: Ana (cliente), Carla (atendente), Marina (confeiteira), Paulo (dono/admin).
- Atualização de `CLAUDE.md` — tabela de documentação e fluxo obrigatório de sprints adicionados.

---

## [Sprint A2] — 2026-06-29 — Consolidação da Arquitetura

### Objetivo
Eliminar dívidas técnicas identificadas na Sprint A1 que afetariam todas as próximas sprints. Sem novos módulos.

### Resolvido

#### KI-01 + KI-02 — Autenticação real do cliente (Crítico)
- **`src/types/next-auth.d.ts`** — extensão de tipos: `role?`, `phone?`, `userType: "admin" | "customer"` na Session, User e JWT
- **`src/app/api/auth/[...nextauth]/route.ts`** — novo provider `"customer"` (`id: "customer"`) que aceita `phone + name`, faz upsert de `Customer` no banco via Prisma, e retorna dados para o JWT
- **`src/components/Providers.tsx`** (novo) — wrapper client com `SessionProvider` + `CartProvider`; necessário para `useSession` funcionar em toda a árvore de componentes
- **`src/app/layout.tsx`** — usa `<Providers>` em vez de `<CartProvider>` diretamente
- **`src/hooks/useCurrentUser.ts`** — reescrito para ler `useSession()`, retornar `Customer | null`; `userType !== "customer"` retorna null (admin logado não vira cliente)
- **`src/app/checkout/page.tsx`** — remove `MOCK_CUSTOMER`; usa `useCurrentUser()` + `useSession({ status })`; guarda de loading, guarda de não-autenticado, inicialização de `receiverName`/`receiverPhone` via `useEffect + useRef` (uma única vez)
- **`src/app/pedidos/page.tsx`** — trata `customer === null`; exibe prompt de login; `useUserOrders` agora aceita `string | null`
- **`src/hooks/useUserOrders.ts`** — assinatura: `phone: string | null`

#### KI-05 — Login de cliente funcional (Alto — parcial)
- **`src/app/login/page.tsx`** — reescrito; fluxo dois passos (telefone → nome); chama `signIn("customer", { phone, name, redirect: false })`; redireciona via `callbackUrl` ou `/pedidos`; remove estado OTP morto
- *OTP via WhatsApp fica para Fase 8 — ponto de extensão marcado com TODO em `authorize()`*

#### KI-08 — Proxy bloqueia clientes no admin (Médio — parcial)
- **`src/proxy.ts`** — verifica `token.userType === "admin"` (não apenas `token !== null`); mapa `ROLE_REQUIRED` preparado para restrições granulares futuras

#### KI-09 — Validação de endereço no checkout (Médio)
- **`src/app/checkout/page.tsx`** — `handleConfirm` valida `street`, `addressNumber`, `neighborhood`, `zipCode` antes de chamar `createOrder`; exibe erro inline; campos marcados com `*`

#### KI-07 — StoreConfig acessível via API (Médio)
- **`src/app/api/config/route.ts`** (novo) — `GET /api/config` retorna `StoreConfig` do banco

#### KI-13 — Ocasiões da API real (Baixo)
- **`src/app/api/occasions/route.ts`** (novo) — `GET /api/occasions` retorna `OccasionTag` do banco
- **`src/app/page.tsx`** — busca ocasiões da API via `useEffect`; `OCCASIONS_FALLBACK` como estado inicial e fallback

#### KI-14 — Categorias derivadas dinamicamente (Baixo)
- **`src/app/page.tsx`** — remove `CATEGORY_NAMES` hardcoded; agrupa produtos por `categoryName` em ordem de aparição

#### KI-06 — Tipo imageUrl alinhado (Médio)
- **`src/lib/types.ts`** — `imageUrl?: string` adicionado à interface `Product`
- **`src/services/productService.ts`** — mapeia `imageUrl: p.imageUrl ?? undefined`

#### KI-12 — paymentStatus no tipo Order (Baixo)
- **`src/lib/types.ts`** — `PaymentStatus` type + `paymentStatus?: PaymentStatus` na interface `Order`
- **`src/services/orderService.ts`** — mapeia `paymentStatus` da resposta da API

#### KI-11 — Tipos `any` removidos dos serviços (Baixo)
- **`src/services/productService.ts`** — interfaces `RawProduct`, `RawProductOccasion`
- **`src/services/orderService.ts`** — interfaces `RawOrder`, `RawOrderItem`

### Não implementado (documentado)
- **KI-03** (WhatsApp/PIX) — BLOQUEADO: requer integração com API externa
- **KI-04** (/admin/producao dados reais) — ADIADO: é módulo novo, Sprint 1
- **KI-10** (Address sem deduplicação) — ADIADO: módulo Clientes, Fase 2
- **KI-15** (getMinDeliveryDate ignora fins de semana) — AGUARDANDO regra de negócio
- **KI-16** (costPrice sempre 0) — ADIADO: Fase 3 (Receitas)

### Validação
| Verificação | Resultado |
|-------------|-----------|
| `tsc --noEmit` | ✅ 0 erros |
| `GET /api/occasions` | ✅ 6 ocasiões do banco |
| `GET /api/config` | ✅ StoreConfig "Doce Menina" |
| `GET /api/orders?phone=11999999999` | ✅ `[]` (correto) |
| `GET /admin` (sem auth) | ✅ 307 → `/admin/login?callbackUrl=%2Fadmin` |
| Providers NextAuth | ✅ `credentials` (admin) + `customer` (cliente) |
| Customer upsert (Prisma direto) | ✅ cria e deleta corretamente |

---

## [Sprint A1] — 2026-06-29 — Revisão Arquitetural

### Produzido (somente documentação — nenhum código alterado)
- `ARCHITECTURE.md` — análise técnica da arquitetura atual, riscos e convenções
- `DOMAIN_MODEL.md` — modelagem completa do domínio (26+ entidades com status e regras)
- `MODULES.md` — mapa de evolução de todos os módulos por fase + dívida técnica
- `CHANGELOG.md` — este arquivo
- `KNOWN_ISSUES.md` — problemas conhecidos com prioridades e referências a arquivos
- Atualização de `CLAUDE.md` — status e referências à documentação de arquitetura
- Atualização de `PLAN.md` — roadmap reorganizado por fases (Fase 1 a 10)
- Atualização de `REVIEW.md` — pendências atualizadas com referências cruzadas a KI-*

---

## [Sprint 0.6] — 2026-06-29 — Correções Críticas

### Corrigido
- **PEN-01 — Persistência de pedidos**: o checkout não persistia pedidos devido ao uso de `addressId: "a1"` (mock) que causava FK constraint violation no Prisma. Solução arquitetural: o checkout coleta campos reais de endereço e a API cria um registro `Address` real na mesma transação `$transaction` do pedido.
- **PEN-02 — /pedidos com dados mock**: a página de pedidos usava `MOCK_ORDERS`. Corrigido para usar `useUserOrders` (hook real) + `getOrdersByPhone` (serviço HTTP) + `GET /api/orders?phone=`. O `handleRepeat` foi corrigido para reconstruir `CartItem` a partir do snapshot do pedido, sem depender do array `PRODUCTS` mock.

### Adicionado
- `DeliveryAddressInput` interface em `src/lib/types.ts`
- Campos de endereço no formulário de checkout: Rua, Número, CEP (grid), Bairro, Complemento
- Criação real de `Address` em `POST /api/orders` via `$transaction`

### Removido
- Mock `addressId: "a1"` do checkout
- Importação de `PRODUCTS` e `MOCK_CUSTOMER` de `/pedidos/page.tsx`
- Uso de `getMaxLeadTimeDays` do checkout (substituído por `items.map(i => i.product.leadTimeDays)` inline)

### Decisão arquitetural
- `Address` é sempre criado como entidade de primeira classe na mesma transação do pedido
- Endereços acumulados estarão disponíveis para o módulo de Clientes (Fase 2) sem migração
- `DeliveryAddressInput` em `types.ts` é o tipo canônico para o payload do checkout → API

---

## [Sprint 0.5] — 2026-06-29 — Infraestrutura

### Adicionado
- Conexão real com banco de dados PostgreSQL (Supabase, porta 5432)
- `prisma db push` executado — schema sincronizado com o banco
- Seed executado: 8 produtos, 3 categorias, 6 ocasiões, 1 admin, 1 StoreConfig
- Usuário admin: `admin@doceatelier.com.br` / `admin123` (hash bcrypt)
- `GET /api/products` — retorna produtos reais do banco
- `GET /api/orders?phone=` — retorna pedidos reais por telefone
- `POST /api/orders` — cria pedido real com tratamento correto de FK
- `PATCH /api/orders/[id]/status` — atualiza status com VALID_TRANSITIONS e log em OrderStatusHistory
- `src/proxy.ts` — proteção de rotas /admin/* no Edge runtime (Next.js 16)
- `src/lib/env.ts` — validação de variáveis de ambiente no startup
- `src/lib/prisma.ts` — singleton do PrismaClient
- `src/hooks/useUserOrders.ts` — hook para buscar pedidos do usuário
- `src/services/orderService.ts` — serviço de pedidos (createOrder, getOrdersByPhone, updateOrderStatus)
- `src/services/productService.ts` — serviço de produtos (getProducts)
- `INFRA_VALIDATION.md` — relatório de validação da infraestrutura

### Corrigido
- `proxy.ts` não era reconhecido pelo Turbopack com hot reload — solução: reiniciar o servidor
- `DATABASE_URL` com senha contendo `&` — encode como `%26`
- `getToken` no Edge runtime exige `secret: process.env.NEXTAUTH_SECRET` explícito
- Tipo do parâmetro de transação Prisma: `tx: Prisma.TransactionClient`
- ESLint: `set-state-in-effect` em hooks de fetch com eslint-disable justificado

### Decisões arquiteturais
- Arquivo de middleware: `src/proxy.ts` (não `middleware.ts` — convenção do Next.js 16)
- Export: `export async function proxy(...)` (não `middleware`)
- Hot reload NÃO recompila `proxy.ts` — reiniciar o servidor após alterações
- `getToken` exige `secret` explícito no Edge runtime mesmo com NEXTAUTH_SECRET no env

---

## [Sprint 0] — 2026-06-28 — Front-end Completo

### Adicionado
- Vitrine (`/`) com listagem de produtos, filtro por ocasião, carrinho
- Carrinho (CartDrawer, CartFab, Toast) via CartContext
- Checkout (`/checkout`) com seleção de data, entrega, pagamento
- Histórico de pedidos (`/pedidos`) com ações de repetição
- Login admin (`/admin/login`) com formulário
- Hub administrativo (`/admin`) com 8 módulos
- Dashboard de produção (`/admin/producao`) com Kanban (dados mock)
- Login cliente (`/login`) com OTP (UI sem backend)
- Layout raiz com CartProvider e fontes Google (Fraunces + DM Sans)
- Design system: variáveis CSS cream/chocolate/rose/sage/sand/muted
- Classes utilitárias: `.max-w-app`, `.shadow-card`, `.input-field`, `.option-card`
- Wireframes HTML estáticos em `/wireframes/`
- `src/lib/types.ts` — tipos TypeScript centralizados
- `src/lib/mock-data.ts` — dados de demonstração
- `src/lib/utils.ts` — formatCurrency, formatDate, getMinDeliveryDate
- `CartContext.tsx` com useMemo/useCallback
- `Header.tsx` (Header + HeaderMinimal)
- `CartDrawer.tsx` (CartDrawer + CartFab + Toast)
- `ProductCard.tsx` (ProductCard + CategoryChips)
- Build de produção: ✅ 14 rotas, 0 erros TypeScript, 0 erros ESLint

### Corrigidos (Sprint 0 — 6 bugs)
- CartDrawer: scrollbar horizontal visível — resolvido com `.scrollbar-none`
- CartFab: não aparecia no iOS — resolvido com `position: fixed`
- Filtro de ocasião: não filtrava corretamente — resolvido
- Data mínima de entrega: calculava incorretamente — resolvido
- Botão de confirmação: disparava ao pressionar Enter — `type="button"` adicionado
- Layout: overflow horizontal em mobile — resolvido
