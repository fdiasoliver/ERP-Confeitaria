# ERP DOCE ATELIER

> **O que este documento é:** uma fotografia executiva do estado atual do projeto, para sincronizar rapidamente qualquer IA (ChatGPT, Gemini, Copilot, outra sessão do Claude etc.) que não tenha acesso contínuo ao histórico completo.
> **O que este documento não é:** não substitui nem duplica a Fonte Oficial de Verdade (`CLAUDE.md`, `PROJECT_GOVERNANCE.md`, `PLAN.md`, `CHANGELOG.md`, `QUALITY_GUIDELINES.md`, ADRs, documentação técnica). Não contém código, histórico completo, regras de negócio completas, arquitetura detalhada ou roadmap completo. Em caso de qualquer conflito, **prevalece a documentação oficial** — ver Seção "Instruções para outra IA".

---

## Estado Geral

| Campo | Valor |
|---|---|
| Versão | 0.1.0 (`package.json`) — projeto em desenvolvimento ativo, sem release formal ainda |
| Sprint atual | Nenhuma sprint em andamento — Sprint `DS.2` encerrada, documentação obsoleta corrigida |
| Módulo atual | Nenhum módulo funcional em desenvolvimento — Épico 2 encerrado; granularidade de acesso (`PRIV.x`) e redesenho de front-end (`DS.x`) concluídos |
| Data desta fotografia | 05/08/2026 |
| Status geral | 🟢 Estável — controle de acesso por papel implementado (Clientes/Pedidos/Produção/Financeiro/Cadeia Produtiva), redesenho de front-end completo (paleta + sidebar admin + produto-herói), todo o trabalho acumulado desde o Initial commit finalmente versionado e no remoto |
| Última atualização | 05/08/2026 |
| Origem da atualização | Encerramento da Sprint `DS.2` + commit/push de todo o histórico acumulado + correção de documentação obsoleta (`KI-16`) |
| Responsável pela atualização | IA (Claude Code), sessão contínua cobrindo PRIV.1–3, DS.2, commit/push e auditoria de pendências |

---

## Situação Atual

**Três sprints de granularidade de acesso por papel concluídas em sequência: `PRIV.1`, `PRIV.2`, `PRIV.3`.** Nova primitiva `requireRole()` (ADR-020) e wrappers derivados (`requireOrderAccess`, `requireFinance`, `requireProductionChain`) substituíram o antigo `requireAdmin()` binário (`ADMIN`-ou-nada) em todas as rotas admin que fazem sentido ter papel diferenciado: Clientes (`ADMIN`+`ATENDIMENTO`), Pedidos/Produção (`ADMIN`+`ATENDIMENTO`+`PRODUCAO`), Financeiro (`ADMIN`+`FINANCEIRO`), Cadeia Produtiva — unidades/ingredientes/receitas/fornecedores/embalagens (`ADMIN`+`PRODUCAO`). Catálogo (categorias/ocasiões/produtos) permanece `ADMIN`-only por decisão explícita do Product Owner, sem regra de negócio que peça outro papel. Validação funcional real (Playwright, usuários de teste criados e removidos) em todas as três sprints, 0 divergências.

**Redesenho de front-end mais amplo concluído: Sprint `DS.2`.** Direção "A × C" (paleta clara de Doceria Pop + layout/tipografia editorial de Espresso Noturno), escolhida pelo Product Owner por comparação visual (Artifact, 3 direções + 1 combinação pedida explicitamente). Entregou: paleta nova com ajuste de contraste WCAG (`rose`/`sage` mais escuros que a direção original aprovada, para passar 4,5:1), produto-herói + gradiente determinístico na Vitrine (substitui emoji cru), sidebar de navegação no admin — filtrada por papel, 20 páginas, especificada em `UX_GUIDELINES.md` desde a Sprint P1 (29/06/2026) e nunca implementada até agora —, acento visual na coluna ativa do Kanban. Validação funcional real em 3 breakpoints (desktop/tablet/mobile).

**Todo o histórico acumulado desde o "Initial commit" finalmente versionado.** O repositório vinha operando com **445 arquivos não commitados** desde a fundação do projeto — Épico 2 inteiro (12 módulos), `DS.1`, `KI-18`, e agora `PRIV.1–3`/`DS.2` — tudo vivia só no working tree. Nesta sessão, tudo foi commitado em um único commit (`396bfa9`, 118 arquivos após excluir artefatos de QA do `.gitignore`) e enviado para `origin/main` (GitHub). Identidade git configurada localmente (não global), igual ao autor do commit inicial.

**Auditoria de pendências realizada a pedido do Product Owner (05/08/2026).** Encontrada e corrigida uma inconsistência documental real: `KI-16` (`Product.costPrice sempre 0`) permanecia marcada "ADIADO — Fase 3" em `KNOWN_ISSUES.md` mesmo depois dos Módulos 2.I (Receitas) e 2.J (Produtos Fase 2, RecipeLinker) terem resolvido isso de fato em 17/07/2026 — corrigida para ✅ Resolvido, com a implementação real citada (`calculateCostPrice()`, `src/lib/productService.ts`). Este próprio documento (`PROJECT_STATE.md`) também estava desatualizado (parado em DS.1, sem refletir PRIV.1–3/DS.2) — corrigido agora.

---

## Roadmap

**Épico 2 — encerrado (02/08/2026):** 2.A–2.L, 12/12 módulos concluídos.

**Sprint `DS.1` — encerrada (03/08/2026):** redesenho de paleta, direção "Ateliê Contemporâneo".

**Sprints `PRIV.1`–`PRIV.3` — encerradas (03–04/08/2026):** granularidade de acesso por papel — Clientes, Pedidos/Produção/Financeiro, Cadeia Produtiva.

**Sprint `DS.2` — encerrada (04–05/08/2026):** redesenho de front-end mais amplo — paleta + sidebar admin + produto-herói + acento de Kanban, direção "A × C".

**Módulo/Épico em desenvolvimento:** nenhum.

**Próximo passo:** decisão do Product Owner ainda pendente entre (a) abrir um novo Épico do roadmap (`PLAN.md`, "Épicos" — ÉPICO 3 Inteligência Operacional, ÉPICO 4 Expansão Operacional, ÉPICO 5 Integrações Externas, ÉPICO 6 Experiência do Cliente, todos "Planejado"), ou (b) priorizar uma das pendências técnicas abertas (ver seção "Pendências" abaixo).

---

## Últimas mudanças

**Sprints `PRIV.1`–`PRIV.3` (03–04/08/2026):** granularidade de acesso por papel implementada em 4 domínios admin (Clientes, Pedidos/Produção, Financeiro, Cadeia Produtiva), `requireRole()` (ADR-020) + 3 wrappers derivados (ADR-021, ADR-022). Catálogo mantido `ADMIN`-only por decisão explícita. Validação funcional real (Playwright, 4 papéis reais) em todas as três.

**Sprint `DS.2` (04–05/08/2026):** direção "A × C" — paleta nova (WCAG ajustado), produto-herói + gradiente determinístico na Vitrine, sidebar de admin filtrada por papel (20 páginas, 7 legadas migradas de wrapper próprio para `PageContainer`), acento de coluna ativa no Kanban.

**Commit e push de todo o histórico acumulado (05/08/2026):** 445 arquivos não commitados desde a fundação do projeto consolidados em 1 commit (`396bfa9`) e enviados para `origin/main`. `.gitignore` atualizado (artefatos de QA do Playwright MCP e screenshots agora excluídos).

**Correção de documentação obsoleta (05/08/2026):** `KI-16` corrigida (estava "ADIADO", na verdade resolvida desde 17/07/2026 pelos Módulos 2.I/2.J); este documento (`PROJECT_STATE.md`) atualizado.

---

## Últimas decisões

- **ADR-020/021/022** (03–04/08/2026): `requireRole()` e wrappers derivados — granularidade de acesso por papel em Clientes, Pedidos/Produção/Financeiro, Cadeia Produtiva.
- **Decisão do Product Owner (04/08/2026):** direção "A × C" para o redesenho de front-end — paleta de "Doceria Pop" com layout/tipografia de "Espresso Noturno", escolhida por comparação visual.
- **Decisão do Product Owner (04/08/2026):** sidebar de admin cobre as 20 páginas admin de uma vez (consequência técnica inevitável do `layout.tsx` do App Router) — não uma página isolada como "amostra".
- **Decisão do Product Owner (05/08/2026):** commitar e enviar ao remoto todo o histórico acumulado como um único commit, em vez de tentar reconstruir fronteiras granulares por sprint retroativamente.
- **Decisões pendentes do Product Owner** (`GOVERNANCE_DECISIONS.md`): futuro do Platform Review (GD-001), Product Review (GD-002), Demo Validation (GD-003) — sem relação com PRIV.x/DS.2.

---

## Pendências

**Técnicas:**
- `KI-19` — `storeConfigService.ts` verifica autorização dentro do Service em vez do Route Handler (achado da Sprint `PRIV.2`, violação de camada, baixo risco) — candidata a sprint técnica dedicada.
- `KI-10` — causa raiz não resolvida: `POST /api/orders` cria um `Address` novo a cada pedido, mesmo para cliente recorrente com endereço já cadastrado. A deduplicação do Módulo 2.L foi só de exibição.
- Achado da Sprint `DS.2`, não registrado como KI formal ainda: a lista de papéis em `src/components/admin/shared/Sidebar.tsx` é mantida manualmente em paralelo a `src/proxy.ts` `ROLE_REQUIRED` — sem fonte única compartilhada entre os dois.
- `Product.costPrice` ainda não soma o custo de `ProductPackaging` (Regra 11 do Módulo 2.H) — pendência antiga, não afetada pela correção de `KI-16`.
- `KI-03` — WhatsApp/PIX ausentes, bloqueado até a Fase 8 (integrações externas).

**Arquiteturais:**
- GD-001/GD-002/GD-003 (`GOVERNANCE_DECISIONS.md`) — futuro de Platform Review, Product Review, Demo Validation.

**De regra de negócio (não bloqueiam nada já implementado):**
- ~30 itens em `REGRAS_NEGOCIO.md` Seção 16 — decisões de produto ainda não tomadas (venda a granel, valor mínimo de pedido, política de estoque FIFO/FEFO, estrutura financeira, etc.). Nenhuma bloqueia funcionalidade já entregue.
- Papel para as 12 rotas de Catálogo (`REGRAS_NEGOCIO.md` Seção 16, "Usuários e acesso") — decisão explícita do Product Owner de manter `ADMIN`-only por ora, revisitável.

**Do Product Owner:**
- Escolher o próximo passo: novo Épico ou uma das pendências técnicas acima.
- Decidir GD-001/GD-002/GD-003 (não bloqueia o roadmap).

---

## Próxima decisão do Product Owner

Com `PRIV.1–3` e `DS.2` encerradas e todo o histórico versionado no remoto, escolher o próximo passo: abrir um novo Épico (`PLAN.md`, "Épicos") ou priorizar uma das pendências técnicas registradas acima (`KI-19`, `KI-10`, sincronização Sidebar/proxy.ts). Em paralelo, seguem pendentes GD-001/GD-002/GD-003.

---

## Riscos

- **Ambiente de demonstração sem dado real:** `prisma/demo-seeds/` só tem arquitetura (ADR-008).
- **Visão multi-tenant (ADR-007) vs. implementação single-tenant real:** direção ainda não iniciada.
- **Precedente de colisão de numeração:** já ocorreu uma vez (`2.I`); ADR-016/ADR-018 mitigam com prefixos dedicados (`G.x`/`I.x`/`DS.x`).
- **Escopo do prefixo `PRIV.x` esticado além do original:** ADR-019 definiu `PRIV.x` como sprints de dado pessoal/LGPD; `PRIV.2`/`PRIV.3` cobriram Pedidos/Produção/Financeiro/Cadeia Produtiva, que não são dado pessoal — achado de governança registrado (ADR-022), não resolvido unilateralmente.
- **Sincronização manual entre `Sidebar.tsx` e `src/proxy.ts`:** risco de divergência silenciosa se um for atualizado sem o outro em sprints futuras.
- **Projeto sem próximo épico definido:** não há trabalho funcional em andamento nem escolhido.
- **Documentação de estado pode ficar obsoleta entre sprints** (como ocorreu com `KI-16` e com este próprio documento até esta correção) — reforça a importância de checar o código real antes de confiar cegamente em qualquer documento de estado, inclusive este.

---

## Documentos Oficiais

Fonte Oficial de Verdade (nesta ordem de precedência em caso de conflito):

1. `CLAUDE.md` — permanente, stack, estrutura, convenções, ADRs
2. `PROJECT_GOVERNANCE.md` — regras e políticas do processo
3. `QUALITY_GUIDELINES.md` — companion operacional (checklists, classificação de achados, Mapa de Governança)
4. `PLAN.md` — roadmap vivo, status de módulo/sprint/épico, Backlog Suggestions
5. `CHANGELOG.md` — narrativa histórica de execução
6. `GOVERNANCE_DECISIONS.md` — decisões metodológicas pendentes/resolvidas
7. `REGRAS_NEGOCIO.md`, `ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `MODULES.md`, `KNOWN_ISSUES.md` — documentação técnica de domínio
8. `DESIGN_SYSTEM.md`, `UX_GUIDELINES.md` — padrões de interface (paleta e layout atualizados nas Sprints DS.1/DS.2)
9. Documentos `MODULE_{X}_CLOSURE.md` — encerramento formal de cada módulo (12 documentos para o Épico 2)
10. `.claude/agents/` — Sub-agents da orquestração ativada pelo ADR-017

Lista completa de documentos e suas dependências: `QUALITY_GUIDELINES.md` Seção 6 ("Mapa de Governança").

---

## Limitações do documento

- **Fotografia, não fluxo contínuo:** reflete o estado no momento da última atualização — pode estar desatualizado durante a execução de uma sprint em andamento.
- **Não substitui leitura da documentação oficial** antes de qualquer implementação.
- **Não contém detalhe técnico suficiente para implementar** — não lista schema, endpoints, componentes ou regras de negócio; apenas aponta onde encontrá-los.
- **Não é validado automaticamente** — depende de atualização manual disciplinada ao final de cada Sprint Oficial (`PROJECT_GOVERNANCE.md` Seção 12). Este próprio documento ficou 2 dias defasado (DS.1 → DS.2) antes desta correção, evidência real do risco.
- **Escopo de "Riscos"/"Pendências" é o conhecido no momento da fotografia** — não é uma varredura exaustiva do projeto.

---

## Instruções para outra IA

Este documento **não substitui** a documentação oficial listada acima — é apenas sincronização rápida de contexto. Ele é intencionalmente pequeno e superficial; nenhuma decisão deve ser tomada com base só nele.

**Sempre que houver qualquer conflito entre este documento e a documentação oficial, prevalece a documentação oficial** — este arquivo pode estar desatualizado entre uma sprint e outra.

Antes de implementar qualquer coisa neste projeto, leia pelo menos `CLAUDE.md` e `PROJECT_GOVERNANCE.md` na íntegra. E, como o projeto reforçou repetidamente: **confira o código real antes de assumir que algo falta** — o roadmap documentado nem sempre reflete o que já foi implementado ou corrigido como efeito colateral de outro módulo. Esta sessão encontrou dois exemplos reais disso: `KI-16` marcada "adiada" meses depois de já resolvida, e o próprio `PROJECT_STATE.md` desatualizado por 2 dias.

---

*Atualizado ao final de toda Sprint Oficial, depois de `CHANGELOG.md`/`PLAN.md`/ADRs já atualizados — nunca antes. Criado na Sprint G.9 (22/07/2026). Atualizado ao final da Sprint 2.F (23/07/2026), da Sprint G.10 (31/07/2026), do encerramento do Módulo 2.K (02/08/2026), do encerramento do Módulo 2.L / Épico 2 (02/08/2026), da Sprint DS.1 (03/08/2026), da correção do KI-18 (03/08/2026), das Sprints PRIV.1–3 e DS.2 (03–05/08/2026), e da auditoria de pendências + correção de KI-16 (05/08/2026).*
