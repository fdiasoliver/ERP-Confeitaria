# ERP DOCE ATELIER

> **O que este documento é:** uma fotografia executiva do estado atual do projeto, para sincronizar rapidamente qualquer IA (ChatGPT, Gemini, Copilot, outra sessão do Claude etc.) que não tenha acesso contínuo ao histórico completo.
> **O que este documento não é:** não substitui nem duplica a Fonte Oficial de Verdade (`CLAUDE.md`, `PROJECT_GOVERNANCE.md`, `PLAN.md`, `CHANGELOG.md`, `QUALITY_GUIDELINES.md`, ADRs, documentação técnica). Não contém código, histórico completo, regras de negócio completas, arquitetura detalhada ou roadmap completo. Em caso de qualquer conflito, **prevalece a documentação oficial** — ver Seção "Instruções para outra IA".

---

## Estado Geral

| Campo | Valor |
|---|---|
| Versão | 0.1.0 (`package.json`) — em produção real (Vercel + Supabase, `app.confeitariadocemenina.com.br`), sem release formal versionada |
| Sprint atual | Nenhuma sprint oficial em andamento |
| Módulo atual | Nenhum módulo funcional em desenvolvimento |
| Data desta fotografia | 23/09/2026 |
| Status geral | 🟢 Estável — em produção com clientes reais; Épicos 1 e 2 encerrados; Épicos 3, 4 e 5 com a maior parte dos itens entregues |
| Última atualização | 23/09/2026 |
| Origem da atualização | Retomada do projeto: releitura da documentação e do histórico git (`main` sincronizado com `origin/main`, último commit `b272cb7`, 20/09/2026) |
| Responsável pela atualização | IA (Claude Code) |

---

## Situação Atual

**Produção real desde a Sprint `I.4` (04–06/09/2026).** App na Vercel (push em `main` dispara redeploy), banco e Storage no Supabase, domínio próprio (Hostgator só como DNS), WhatsApp real via Evolution API. Em 08/09/2026 a produção caiu por esgotamento do pool de conexões (`EMAXCONNSESSION`); corrigido separando `DATABASE_URL` (Transaction Pooler, 6543, runtime) de `DIRECT_URL` (5432, migrate/`db push`) — commit `ca639d5`.

**Épico 2 (cadastros mestres + cadeia produtiva): encerrado em 02/08/2026** — 12 módulos (2.A–2.L). Depois dele: granularidade de acesso por papel (`PRIV.1–3`, ADR-020/021/022) e cinco rodadas de design (`DS.1`–`DS.5`; `DS.5` adotou o shadcn/ui, ADR-025).

**Entregas de agosto/setembro/2026 (Épicos 3, 4 e 5):**
- **Épico 3 — Inteligência Operacional:** Precificação automática (P3.1, `costPrice` agora inclui embalagem — resolve a "Regra 11" do Módulo 2.H); Relatórios financeiros (P3.2 — dashboard, centro de custo, fluxo de caixa, contas a pagar, DRE, em `/admin/relatorios`); Despesas; Canais de Venda.
- **Épico 4 — Expansão Operacional:** Usuários, Calendário de produção + reagendamento negociado com o cliente (P3.3), PWA, Tema (cores livres com checagem WCAG).
- **Épico 5 — Integrações:** `5.A` Google Maps (Routes API, recálculo server-side), `5.B` WhatsApp OTP + notificações, `5.E` importador de NFC-e (substituiu CONAB/CEASA, que não têm API pública). Falta `5.D` (PIX).
- **Fora de épico, 15–20/09/2026:** cadastro de cliente (autocadastro em `/cadastro` + pessoa física/corporativa no admin) com endereços salvos e gestão direta de endereços; **Orçamentos** (`/admin/orcamentos`, `Order.status = RASCUNHO` + `quoteStatus`, link público de aprovação `/orcamento/[token]`, editor completo); importação de ingredientes por Excel; preço por embalagem; duplicar receita; correção de LTV (`RASCUNHO`/`CANCELADO` fora do "Total Gasto"); página pública de orçamento redesenhada.
- **Vitrine (`/`) redesenhada em 20/09/2026** (wine/gold + Fraunces, seções institucionais, dados de contato vindos de `StoreConfig`). `StoreConfig.phone` ainda é `null`, então CTA/botão flutuante de WhatsApp ficam ocultos.

**Lacuna de documentação (achado real desta atualização):** vários módulos entregues em setembro foram commitados **sem entrada própria no `CHANGELOG.md`** — Usuários, Tema, PWA, Canais de Venda, Despesas, `DS.6` (ajustes de layout admin + toggle Cards/Lista), Sprints 1–2 do P3.2 e o cadastro de cliente/orçamentos criados (commits `7d862b8`, `7c63626`, `f7ab1b2`). O próprio `CHANGELOG.md` já registra esse gap para o P3.3. Orçamentos e o guard `requireCustomer` também não têm ADR. Nada disso foi reescrito retroativamente.

---

## Roadmap

**Épico 1 e Épico 2:** encerrados.
**Épico 3:** P3.1 e P3.2 concluídos.
**Épico 4:** itens originais entregues (Usuários, Calendário P3.3, PWA, Tema e Cálculo de distância via `5.A`); sem documento de encerramento do épico.
**Épico 5:** `5.A`, `5.B`, `5.E` concluídos; `5.D` (PIX) planejado — depende de confirmar domínio/HTTPS público para o webhook (em produção o domínio já existe, então o bloqueio original provavelmente caiu, mas não foi reavaliado).
**Épico 6 (Experiência do Cliente):** planejado — detalhe de pedido (`/pedidos/[id]`), fotos de referência.
**Sprint `I.4`:** 🟡 ainda marcada "em andamento" em `PLAN.md` (PIX e Google Maps sem configuração confirmada em produção; `MODULE_I4_CLOSURE.md` não criado).

**Módulo/Épico em desenvolvimento:** nenhum.

**Próximo passo:** decisão do Product Owner (ver "Próxima decisão").

---

## Últimas mudanças

Ordem cronológica inversa (fonte: `git log`; itens com `CHANGELOG.md` marcados ✔):

- **20/09** — Redesenho editorial da Vitrine ✔ · Editor completo de orçamento ✔ · Design público do orçamento + orçamentos recusados visíveis + correção de LTV ✔ · Exclusão de endereço de cliente ✔ · Cadastro direto de endereços pela equipe ✔ · Duplicar receita ✔ · Preço por embalagem ✔
- **19/09** — Importação/exportação de ingredientes por Excel ✔
- **17/09** — Link público de aprovação de orçamento + front admin ✔
- **16/09** — Cadastro de cliente (autocadastro, corporativo, ativar/desativar/excluir), orçamentos criados pelo admin, correção de erro de endereço no formulário de orçamento (sem entrada no `CHANGELOG.md`)
- **15/09** — Reagendamento negociado (P3.3) ✔ · correção: área cliente presa em largura mobile no desktop · correção: envio de WhatsApp para telefones sem código de país
- **13/09** — Fluxo de caixa/Contas a pagar/DRE ✔ · Canais de Venda + centro de custo em Despesas · migração de `categorias`/`ocasioes` para o padrão Cards/Lista
- **08–12/09** — `DS.6` (layout admin + toggle Cards/Lista), imagens reais na Vitrine, Relatórios financeiros (Sprint 1), correção do pool de conexões (produção)
- **09–10/09** — Usuários, Calendário de produção, PWA, Tema (correção de revalidação de cache)
- **05–07/09** — Importador de NFC-e (`5.E`) ✔ · Google Maps (`5.A`) ✔ · Precificação (`P3.1`) ✔ · ADR-026
- **04–06/09** — Deploy em produção (`I.4`) ✔
- **27–28/08** — `DS.5` shadcn/ui (ADR-025) ✔

---

## Últimas decisões

- **ADR-025** (27/08/2026): shadcn/ui como camada de componentes oficial.
- **ADR-026** (06/09/2026): registro (não resolução) de que produção real é Vercel, contradizendo a ADR-010 (VPS Linux).
- **Decisão de infraestrutura (08/09/2026):** `DATABASE_URL` (Transaction Pooler) + `DIRECT_URL` (Session Pooler) — sem ADR própria; registrada em comentário no `schema.prisma`, `.env.example` e no `CLAUDE.md`.
- **Decisão do Product Owner (13/09/2026):** DRE não deduz "devoluções e cancelamentos" (não existe valor confiável hoje); Fluxo de Caixa é realizado, não projetado.
- **Decisão do Product Owner (17/09/2026):** ciclo completo de ações por estado do orçamento (não só enviar/copiar link); confirmação pública por últimos 4 dígitos do telefone/CNPJ.
- **Decisões pendentes do Product Owner** (`GOVERNANCE_DECISIONS.md`): GD-001/GD-002/GD-003 (Platform Review, Product Review, Demo Validation) — sem relação com o trabalho recente.

---

## Pendências

**Técnicas:**
- **Nenhum teste automatizado existe no projeto** — toda validação é manual/Playwright. Risco crescente com ~100 rotas de API e regras de negócio em cascata (orçamento, reagendamento, custos).
- **Reagendamento (P3.3):** a validação funcional real dependia de `prisma db push` aplicar `suggestedDeliveryDate`/`rescheduleStatus`. Os `db push` posteriores (17–20/09) sincronizam o schema inteiro, então as colunas provavelmente já estão no banco — **não verificado diretamente**.
- `KI-20` — `POST /api/auth/otp/request` sem limite de envio (só há limite de 3 tentativas na validação) — custo/abuso de WhatsApp.
- `KI-19` — `storeConfigService.ts` autoriza dentro do Service (violação de camada, baixo risco).
- `KI-10` — `POST /api/orders` cria `Address` novo a cada pedido; a deduplicação do Módulo 2.L é só de exibição. O autocadastro/endereços salvos (setembro) reduzem, mas não eliminam, a causa raiz — não reavaliado.
- Lista de papéis em `Sidebar.tsx` mantida à mão em paralelo a `src/proxy.ts` `ROLE_REQUIRED`.
- `KI-03` — parcial: WhatsApp resolvido no `5.B`; falta só o PIX (`5.D`).
- Dado ruim em produção: produto "Bolo Chocolate 25cm" com `imageUrl` apontando para um clip-art (precisa de novo upload em `/admin/produtos`).
- `StoreConfig.phone` vazio — botão de WhatsApp da Vitrine oculto até o cadastro do telefone em `/admin/config`.

**Documentais:**
- `CHANGELOG.md` sem entradas para vários módulos de setembro (lista acima); Sprint `I.4` ainda "em andamento" em `PLAN.md`. `PLAN.md` e `KNOWN_ISSUES.md` atualizados em 23/09/2026.
- `CLAUDE.md` atualizado nesta mesma sessão (estrutura, stack, infraestrutura, autenticação, status); a credencial de admin antiga foi removida do arquivo por segurança.
- `MENU_STRUCTURE.md`/`SCREENS.md` desatualizados desde a Sprint P1 para praticamente todos os módulos.
- Backlog de Product Review de 13/09 (8 itens de UX/UI/acessibilidade em `/admin/relatorios`) e "Vitrine com layout errado" (13/09, possivelmente superado pelo redesenho de 20/09) em `PLAN.md`.

**Arquiteturais:**
- **ADR-026 vs ADR-010** (Vercel × VPS Linux) — reconciliação pendente do Product Owner.
- Orçamentos, `requireCustomer` e a estratégia de pool de conexões sem ADR.
- GD-001/GD-002/GD-003.

**De regra de negócio (não bloqueiam nada já implementado):**
- ~30 itens em `REGRAS_NEGOCIO.md` Seção 16 (venda a granel, valor mínimo de pedido, estoque FIFO/FEFO, estrutura financeira, papel para as rotas de Catálogo etc.).

---

## Próxima decisão do Product Owner

Escolher o rumo: (a) `5.D` PIX, o último item que fecha o `KI-03`; (b) Épico 6 (detalhe de pedido/fotos de referência); (c) saldar a dívida documental de setembro (CHANGELOG/PLAN/ADRs) e decidir sobre testes automatizados; (d) reconciliar ADR-010/ADR-026. Em paralelo, seguem pendentes GD-001/GD-002/GD-003.

---

## Riscos

- **Produção real sem testes automatizados**, com dados de cliente e WhatsApp reais — e validações funcionais que rodam contra o mesmo banco Supabase (dados de teste precisam ser removidos à mão; já houve quase-incidente com arquivos versionados de `.playwright-mcp/`).
- **Dependência de instância externa** (Evolution API) e de chaves (Google Maps, Supabase) configuradas manualmente na Vercel — falhas de configuração só aparecem em runtime.
- **Documentação de governança defasada em relação à prática:** o fluxo formal (sprints, ADRs, Sub-agents, Platform/Product Review) não foi seguido no ciclo de 15–20/09; o risco é a documentação perder o valor de fonte de verdade.
- **Visão multi-tenant (ADR-007) vs. implementação single-tenant real.**
- **Ambiente de demonstração sem dado real:** `prisma/demo-seeds/` só tem arquitetura (ADR-008).
- **Escopo do prefixo `PRIV.x` esticado** além do original (ADR-022).
- **Estado deste documento pode ficar obsoleto entre sprints** — ficou 7 semanas parado (05/08 → 23/09) enquanto o produto mudou muito. Confira o código real antes de confiar nele.

---

## Documentos Oficiais

Fonte Oficial de Verdade (nesta ordem de precedência em caso de conflito):

1. `CLAUDE.md` — permanente, stack, estrutura, convenções, ADRs
2. `PROJECT_GOVERNANCE.md` — regras e políticas do processo
3. `QUALITY_GUIDELINES.md` — companion operacional (checklists, classificação de achados, Mapa de Governança)
4. `PLAN.md` — roadmap vivo, status de módulo/sprint/épico, Backlog Suggestions
5. `CHANGELOG.md` — narrativa histórica de execução (com lacunas em setembro/2026 — ver acima)
6. `GOVERNANCE_DECISIONS.md` — decisões metodológicas pendentes/resolvidas
7. `REGRAS_NEGOCIO.md`, `ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `MODULES.md`, `KNOWN_ISSUES.md` — documentação técnica de domínio
8. `DESIGN_SYSTEM.md`, `UX_GUIDELINES.md` — padrões de interface
9. Documentos `MODULE_{X}_CLOSURE.md` — encerramento formal de cada módulo (12 documentos para o Épico 2)
10. `.claude/agents/` — Sub-agents da orquestração ativada pelo ADR-017

Lista completa de documentos e suas dependências: `QUALITY_GUIDELINES.md` Seção 6 ("Mapa de Governança").

---

## Limitações do documento

- **Fotografia, não fluxo contínuo:** reflete o estado no momento da última atualização — pode estar desatualizado durante a execução de uma sprint em andamento.
- **Não substitui leitura da documentação oficial** antes de qualquer implementação.
- **Não contém detalhe técnico suficiente para implementar** — não lista schema, endpoints, componentes ou regras de negócio; apenas aponta onde encontrá-los.
- **Não é validado automaticamente** — depende de atualização manual disciplinada (`PROJECT_GOVERNANCE.md` Seção 12).
- **Escopo de "Riscos"/"Pendências" é o conhecido no momento da fotografia** — não é uma varredura exaustiva do projeto.
- **Esta atualização foi feita a partir de `PLAN.md`, `KNOWN_ISSUES.md`, das entradas do `CHANGELOG.md` de 13–20/09, do `git log` e de inspeção do código (rotas, `proxy.ts`, `package.json`, `.env.example`).** Não foram relidos `REGRAS_NEGOCIO.md`, `PROJECT_GOVERNANCE.md`, `DESIGN_SYSTEM.md` nem as entradas do `CHANGELOG.md` anteriores a 13/09; os itens sem entrada no `CHANGELOG.md` foram descritos pelo título e pela lista de arquivos dos commits, não por leitura do código.

---

## Instruções para outra IA

Este documento **não substitui** a documentação oficial listada acima — é apenas sincronização rápida de contexto. Ele é intencionalmente pequeno e superficial; nenhuma decisão deve ser tomada com base só nele.

**Sempre que houver qualquer conflito entre este documento e a documentação oficial, prevalece a documentação oficial** — este arquivo pode estar desatualizado entre uma sprint e outra.

Antes de implementar qualquer coisa neste projeto, leia pelo menos `CLAUDE.md` e `PROJECT_GOVERNANCE.md` na íntegra. E, como o projeto reforçou repetidamente: **confira o código real antes de assumir que algo falta** — o roadmap documentado nem sempre reflete o que já foi implementado (`KI-16` ficou "adiada" meses depois de resolvida; este documento e a linha "Status atual" do `CLAUDE.md` ficaram semanas defasados).

---

*Atualizado ao final de toda Sprint Oficial, depois de `CHANGELOG.md`/`PLAN.md`/ADRs já atualizados — nunca antes. Criado na Sprint G.9 (22/07/2026). Atualizado ao final da Sprint 2.F (23/07/2026), da Sprint G.10 (31/07/2026), do encerramento dos Módulos 2.K/2.L (02/08/2026), das Sprints DS.1 (03/08/2026), PRIV.1–3 e DS.2 (03–05/08/2026), e em 23/09/2026 numa atualização de retomada (fora de sprint oficial) que cobre 05/08 → 20/09/2026.*
