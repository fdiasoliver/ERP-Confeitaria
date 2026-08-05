# GOVERNANCE_DECISIONS.md — Decisões Metodológicas Pendentes e Resolvidas

Criado na Sprint 2.I.1 (20/07/2026) — Consolidação do Ciclo de Governança do Produto.

**O que este documento é:** rastreador do **ciclo de vida de uma decisão metodológica**, desde a recomendação fundamentada até a aprovação (ou rejeição) formal do Product Owner. Cobre o intervalo que nenhum outro documento cobre hoje: `CLAUDE.md` (seção "Decisões arquiteturais tomadas") só registra decisões **já tomadas**; `CHANGELOG.md` registra a **narrativa de execução** de cada sprint. Nenhum dos dois rastreia "recomendação apresentada, aguardando decisão" como estado de primeira classe — inclusive ao longo de várias sprints, se necessário.

**O que este documento não é:** não duplica o processo de ADR (`PROJECT_GOVERNANCE.md` Seção 13). Uma decisão registrada aqui como **Aprovada** é promovida a ADR formal em `CLAUDE.md` no mesmo padrão de sempre — este documento não substitui aquele passo, apenas o precede.

**Regra de imutabilidade:** uma entrada nunca é apagada, mesmo depois de decidida — seu status muda (`Pendente` → `Aprovada`/`Rejeitada`/`Adiada`), preservando o histórico da análise que a fundamentou.

---

## Como uma decisão chega aqui

1. Uma Sprint de governança (ou uma sprint funcional, quando encontra ambiguidade real) produz uma **recomendação fundamentada** — nunca uma decisão já tomada — com impactos positivos e negativos explícitos.
2. A recomendação é registrada aqui com status `Pendente`.
3. O Product Owner aprova, rejeita ou adia — em qualquer uma dessas respostas, o status é atualizado nesta mesma entrada.
4. Se aprovada e a decisão tiver natureza arquitetural, ela é promovida a ADR em `CLAUDE.md` (Seção "Decisões arquiteturais tomadas"), com referência cruzada de volta para a entrada correspondente aqui.

---

## Decisões pendentes

### GD-001 — Futuro do Platform Review

- **Origem:** Sprint 2.I.1 (20/07/2026), Fase 5 e Fase 8.
- **Situação encontrada:** `PROJECT_GOVERNANCE.md` Seção 16.4 (a partir da Sprint G.6.1) define Platform Review como etapa **obrigatória** do fluxo de sprint (Seção 4, item 3.4) sempre que Backend e/ou Frontend forem alterados. Nenhuma execução real foi encontrada em `CHANGELOG.md` desde a criação da etapa (nenhum achado classificado como Bloqueante/Não-bloqueante em nenhuma sprint, incluindo o ciclo completo do Módulo 2.H, 2.H.0–2.H.7). O Sub-agent `platform-reviewer` existe e está disponível — a etapa não é tecnicamente inexecutável, apenas nunca foi de fato invocada.
- **Análise:** o ERP permanece 100% single-tenant hoje (confirmado pela própria nota de transparência do ADR-007 em `CLAUDE.md`) — não existe um segundo tenant, Theme Engine ou branding dinâmico real contra o qual uma violação de parametrização possa ocorrer na prática. O único achado plausível hoje ("não fixar 'Doce Atelier'/cores/domínio no código em vez de usar `StoreConfig`") é um item de higiene de código, já coberto em espírito pela Revisão Técnica (`PROJECT_GOVERNANCE.md` Seção 16).
- **Recomendação:** **Tornar opcional.** Deixar de ser gate obrigatório em toda sprint com Backend/Frontend (retirar da lista obrigatória do item 3.4 da Seção 4) e passar a ser executado: (a) sempre que a sprint tocar explicitamente `StoreConfig`, temas, branding ou domínio, ou (b) antes de um release/milestone que aproxime o produto de um segundo tenant real. O Sub-agent, a Skill e `PLATFORM_OVERVIEW.md` permanecem intactos — nada é removido, apenas deixa de ser obrigatório por padrão.
- **Impacto positivo:** elimina uma obrigação documentada que nunca foi seguida (reduz a divergência entre processo escrito e processo real); preserva a capacidade para quando fizer sentido.
- **Impacto negativo:** se a evolução multi-tenant avançar mais rápido do que o esperado sem que alguém lembre de reativar a etapa, uma violação real de parametrização pode passar despercebida por mais tempo.
- **Status:** 🟡 Pendente — aguardando decisão do Product Owner. **Nota (ADR-017, 31/07/2026):** a ativação da orquestração por Sub-agents (`.claude/agents/EXECUTION_FLOW.md`) manteve `platform-reviewer` como etapa obrigatória por decisão explícita do Product Owner, precisamente até esta GD-001 ser decidida — não é uma reversão da recomendação acima, é a ordem de decisão escolhida.

### GD-002 — Futuro do Product Review

- **Origem:** Sprint 2.I.1 (20/07/2026), Fase 6 e Fase 8.
- **Situação encontrada:** `PROJECT_GOVERNANCE.md` Seção 16.5 (a partir da Sprint G.6) define Product Review como etapa obrigatória (Seção 4, item 3.5) sempre que Frontend for alterado, com taxonomia própria (A. Funcional a F. Melhoria). Nenhuma execução formal foi encontrada em `CHANGELOG.md` (zero ocorrências da taxonomia A–F). Em paralelo, o padrão que **de fato** se consolidou — usado real e integralmente no Módulo 2.H (Sprints 2.H.6 e 2.H.7) e descrito em `QUALITY_GUIDELINES.md` Seção 3 — é `Homologação Técnica → Validação Funcional → Homologação do Product Owner → Encerramento`, cobrindo, na prática, o mesmo território: usabilidade, clareza, navegação, nomes, consistência visual.
- **Análise:** existe sobreposição real de propósito entre Product Review (etapa nunca executada) e a Homologação do Product Owner (etapa sempre executada, com evidência real via Playwright em todas as sprints de Frontend do Módulo 2.H). A Recomendação Arquitetural obrigatória #4 desta e de sprints anteriores ("evitar duplicidade entre etapas de governança") pesa contra manter as duas como gates formalmente distintos e obrigatórios.
- **Recomendação:** **Fundir.** Incorporar a taxonomia A–F do Product Review como referência/apêndice dentro dos checklists já usados e já obrigatórios (`QUALITY_GUIDELINES.md` Seção 4 — Checklist Validação Funcional e Checklist Homologação), em vez de mantê-la como etapa 3.5 separada e obrigatória em toda sprint. O Sub-agent `product-reviewer` e a Skill `product-review` permanecem disponíveis como recurso opcional — por exemplo, para uma auditoria pontual mais profunda em um módulo específico, a critério do Product Owner — mas deixam de ser um gate obrigatório redundante com a Homologação.
- **Impacto positivo:** remove uma duplicidade real; simplifica o fluxo sem perder cobertura, já que a Homologação do Product Owner cobre o mesmo espectro com julgamento humano real, não simulado.
- **Impacto negativo:** perde-se a padronização estrita da taxonomia A–F como categoria própria em toda sprint — passa a depender de quão bem o Checklist de Homologação absorve esses critérios.
- **Status:** 🟡 Pendente — aguardando decisão do Product Owner. **Nota (ADR-017, 31/07/2026):** mesma nota da GD-001 — `product-reviewer` segue obrigatório na orquestração por Sub-agents recém-ativada, até esta GD-002 ser decidida.

### GD-003 — Futuro do Demo Validation

- **Origem:** Sprint 2.I.1 (20/07/2026), Fase 7 e Fase 8.
- **Situação encontrada:** `PROJECT_GOVERNANCE.md` Seção 16.6 (a partir da Sprint T.3) define Demo Validation como etapa obrigatória (Seção 4, item 3.6) sempre que Frontend for alterado, validando contra `DEMO_GUIDE.md`/`DEMO_DATASET.md`. Por decisão da própria Sprint T.3 (ADR-008), `prisma/demo-seeds/` não contém nenhum dado real — apenas arquitetura. Ou seja, a etapa não foi "pulada": ela é hoje **inexecutável pela sua própria fonte de verdade**, já que não existe dataset de demonstração real para validar.
- **Análise:** o propósito original do ADR-008 era validação para demonstrações a stakeholders/releases, não uma rotina de toda sprint com Frontend — a obrigatoriedade por sprint (item 3.6) é mais ampla do que o propósito declarado da própria etapa.
- **Recomendação:** **Tornar opcional / mover para releases.** Deixar de ser gate obrigatório por sprint; passar a ser executada apenas quando (a) `prisma/demo-seeds/` tiver dado real populado, e (b) houver uma demonstração a stakeholder ou release planejada. Até lá, permanece formalmente pausada — não obsoleta, não removida.
- **Impacto positivo:** alinha a obrigatoriedade documentada com o propósito real da etapa; remove uma exigência hoje impossível de cumprir por padrão.
- **Impacto negativo:** nenhum acréscimo real de risco — a etapa já não estava sendo executada; formalizar isso apenas reconhece o estado real.
- **Status:** 🟡 Pendente — aguardando decisão do Product Owner.

### GD-004 — Colisão de numeração: prefixo "2.I" usado para três significados diferentes

- **Origem:** Sprint 2.I.1 (20/07/2026), Fase 1 (Auditoria da Governança).
- **Situação encontrada:** o prefixo `2.I` está registrado em `PROJECT_GOVERNANCE.md` Seção 3 ("Módulo 2.I — Receitas") como identificador oficial e definitivo do módulo Receitas dentro do Épico 2 — usado em `CHANGELOG.md` desde 15/07/2026 (`Sprint 2.I.1 — Backend Completo — Módulo Receitas`, `2.I.2`, `2.I.3`). Em paralelo, `PROJECT_GOVERNANCE.md` Seção 4.4 já reserva o prefixo `I.x` (sem o `2.` — análogo ao `G.x` de governança de IA) para Sprints Oficiais de Infraestrutura, com precedente real (`I.1`, `I.2`, `I.3`). As duas sprints de governança mais recentes — a anterior (retrospectiva da metodologia) e esta própria — foram nomeadas pela Ordem de Missão como `Sprint 2.I.0` e `Sprint 2.I.1`, colidindo simultaneamente com os dois usos já estabelecidos.
- **Análise:** não houve má-fé nem erro de execução — o nome de cada sprint vem da própria Ordem de Missão do Product Owner, e este documento não tem autoridade para renomear retroativamente entradas já commitadas em `CHANGELOG.md`/`PLAN.md`. Mas o padrão já estabelecido para sprints de governança (`G.1`, `G.2`, `G.5.x`, `G.6.x`, `G.8`) é exatamente o que evitaria esta colisão — o prefixo `G.x` já existe e já é usado há várias sprints para este propósito.
- **Recomendação:** **Não renomear** as entradas já registradas para `2.I.0`/`2.I.1` (governança) em `CHANGELOG.md`/`PLAN.md` — ficam registradas como estão, com nota explicando a colisão. **A partir da próxima sprint de governança**, usar o prefixo `G.x` (ex.: a próxima seria `G.9`, seguindo a sequência real já usada), nunca mais um prefixo `{N}.{LETRA}` que já tem dono em outro Épico/Módulo.
- **Impacto positivo:** elimina ambiguidade referencial em buscas futuras no `CHANGELOG.md` (`grep "2.I"` hoje retorna três assuntos completamente diferentes: Receitas, Infraestrutura-por-extensão-de-leitura-apressada, e Governança).
- **Impacto negativo:** nenhum — é apenas uma convenção de nomeação daqui para frente.
- **Status:** 🟢 **Aprovada** (22/07/2026) — aplicada pela primeira vez na própria sprint que motivou a pergunta: "Evolução da Governança — Implantação do PROJECT_STATE.md" foi registrada como **Sprint G.9**, confirmando a sequência real já usada (G.1, G.2, G.5.x, G.6.x, G.8). Promovida a **ADR-016** em `CLAUDE.md`.

---

*Nenhuma decisão acima foi implementada automaticamente — todas aguardam aprovação, rejeição ou adiamento explícito do Product Owner, conforme a Sprint 2.I.1.*
