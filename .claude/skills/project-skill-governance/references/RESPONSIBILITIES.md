# RESPONSIBILITIES.md — Responsabilidades por Skill

Parte da meta-skill `project-skill-governance` (Sprint G.5.1, item 15 adicionado na G.5.2; itens 16-17 adicionados nas Sprints G.6/G.6.1, corrigindo uma omissão real — `product-review` nunca tinha sido incluída neste mapa desde sua criação). Define, para cada uma das 17 Skills de domínio existentes em `.claude/skills/`, seus limites operacionais: o que ela cobre, que arquivos ela orienta tocar (ou nunca tocar), que decisões ela autoriza tomar sem escalar, e seus contratos de entrada/saída.

Esta tabela **não substitui** o conteúdo de cada `SKILL.md` — é um índice de limites, não um resumo de conteúdo.

---

## 1. sprint-governance

| Campo | Valor |
|---|---|
| Responsabilidades | Roteiro operacional resumido do ciclo completo de sprint: papéis, os 2 artefatos obrigatórios, fluxo de fases, estados da sprint, fluxo de auditoria, regras gerais. |
| Arquivos permitidos | Nenhum diretamente — skill de processo. Orienta a produção de `SPRINT_X.md`/`SPRINT_AUDIT.md`. |
| Arquivos proibidos | Qualquer código-fonte; `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md` sem autorização explícita. |
| Decisões permitidas | Identificar em qual fase/estado uma sprint está. |
| Decisões proibidas | Classificar achados de auditoria (isso é `sprint-audit`); aprovar/bloquear sprint (isso é `sprint-audit`/`orchestrator`). |
| Entradas | Nenhuma pré-condição — é o ponto de entrada do processo. |
| Saídas | Identificação de qual skill mais específica consultar a seguir. |
| Artefatos obrigatórios | `SPRINT_X.md` + `SPRINT_AUDIT.md` (antes de qualquer implementação). |

## 2. project-bootstrap

| Campo | Valor |
|---|---|
| Responsabilidades | Orientação de uma IA assumindo o projeto pela primeira vez: objetivo, stack, arquitetura, documentos, ordem de leitura, checklist inicial. |
| Arquivos permitidos | Nenhum — skill de leitura/orientação pura. |
| Arquivos proibidos | Qualquer arquivo do projeto (código ou documento). |
| Decisões permitidas | Nenhuma — apenas informa. |
| Decisões proibidas | Qualquer decisão de implementação, escopo ou aprovação. |
| Entradas | Nenhuma — é o primeiro contato com o projeto. |
| Saídas | Checklist de bootstrap cumprido; direcionamento para `sprint-governance`. |
| Artefatos obrigatórios | Nenhum próprio — referencia os documentos centrais (CLAUDE.md, PROJECT_GOVERNANCE.md etc.). |

## 3. orchestrator

| Campo | Valor |
|---|---|
| Responsabilidades | Aprofundamento do papel Orchestrator: FASE 0 (análise arquitetural), as 7 perguntas obrigatórias, produção dos 2 artefatos, FASE 6 (evolução da governança), limites explícitos (não implementa, não audita). |
| Arquivos permitidos | Nenhum arquivo de código. Produz `SPRINT_X.md`/`SPRINT_AUDIT.md` (como conteúdo de prompt/documento — **ver "Problema encontrado" no relatório**: nenhuma skill define um caminho físico de arquivo para eles). |
| Arquivos proibidos | Qualquer arquivo de código; Repository/Validator diretamente. |
| Decisões permitidas | Definir escopo, dependências, riscos e estratégia de uma sprint nova. |
| Decisões proibidas | Implementar (Executor); auditar/aprovar (Auditor); alterar `PROJECT_GOVERNANCE.md` fora da FASE 6 com ADR. |
| Entradas | Aprovação do Product Owner (estado PLANEJADA). |
| Saídas | `SPRINT_X.md` + `SPRINT_AUDIT.md` completos. |
| Artefatos obrigatórios | Os mesmos dois documentos — sem eles a sprint não avança para VALIDADA. |

## 4. governance

| Campo | Valor |
|---|---|
| Responsabilidades | Mecânica dos documentos de governança: ADR, DoD Sprint×Módulo, checklists, classificação de auditoria, regras de PLAN/CHANGELOG, tipos compartilhados, versionamento, Política de Evolução da Governança. |
| Arquivos permitidos | `PROJECT_GOVERNANCE.md` e `AI_PROMPT_ORCHESTRATOR.md` — **somente** mediante ADR aprovada (o próprio ato de editá-los é regido, não livre). |
| Arquivos proibidos | Qualquer código-fonte; `REGRAS_NEGOCIO.md` sem autorização explícita equivalente. |
| Decisões permitidas | Determinar se uma mudança de regra exige ADR; determinar se um item é DoD de sprint ou de módulo. |
| Decisões proibidas | Redigir a ADR sozinha sem aprovação do Product Owner; declarar módulo concluído sem checklist da Seção 23 completo. |
| Entradas | Uma proposta de nova regra, ou dúvida sobre encerramento de sprint/módulo. |
| Saídas | Regra formalizada (com ADR) ou negada; checklist de encerramento preenchido. |
| Artefatos obrigatórios | Registro de ADR em `CLAUDE.md` (raiz) + `ARCHITECTURE.md`, quando aplicável. |

## 5. architecture

| Campo | Valor |
|---|---|
| Responsabilidades | Arquitetura de código: fluxo de camadas, responsabilidades de Route/Service/Validator/Repository/Prisma, DTO/mapper, acoplamento permitido, padrões proibidos. |
| Arquivos permitidos | `src/app/api/**/route.ts`, `src/lib/**/*Service.ts`, `src/lib/validators/*.ts`, `src/lib/repositories/*.ts`, `prisma/schema.prisma` (convenções, não implementação). |
| Arquivos proibidos | Documentos de governança; `PLAN.md`/`CHANGELOG.md`. |
| Decisões permitidas | Determinar em qual camada uma lógica pertence. |
| Decisões proibidas | Criar tipo público duplicado sem seguir a regra de `governance` item 8; decidir sozinha sobre `PROJECT_GOVERNANCE.md`. |
| Entradas | Uma necessidade de implementar ou revisar Route/Service/Repository/Validator. |
| Saídas | Código conforme o fluxo de camadas, sem inversão de responsabilidade. |
| Artefatos obrigatórios | Nenhum documento — o "artefato" é o próprio código conforme. |

## 6. coding-standards

| Campo | Valor |
|---|---|
| Responsabilidades | Nomenclatura e organização: kebab-case/PascalCase, estrutura de diretórios, aliases `@/`, aliasing `db*`, tipagem, contrato de `responses.ts`, assinatura de validators. |
| Arquivos permitidos | Qualquer arquivo novo em `src/` — apenas orienta o **nome/local**, não a lógica interna (isso é `architecture`/skills de camada). |
| Arquivos proibidos | Documentos de governança. |
| Decisões permitidas | Nomear um arquivo/função/tipo novo. |
| Decisões proibidas | Corrigir retroativamente as duas divergências de nomenclatura já conhecidas (`list`/`find`, sufixo `Validator` ausente) sem sprint dedicada. |
| Entradas | Necessidade de criar um arquivo/símbolo novo. |
| Saídas | Nome e localização conformes à convenção. |
| Artefatos obrigatórios | Nenhum. |

## 7. repository-pattern

| Campo | Valor |
|---|---|
| Responsabilidades | Aprofundamento da camada Repository: funções permitidas/proibidas, uso de Prisma, CRUD, consultas, anti-patterns, checklist. |
| Arquivos permitidos | `src/lib/repositories/{recurso}Repository.ts` exclusivamente. |
| Arquivos proibidos | Route Handlers, Services, Validators, Front-end — qualquer coisa fora de `repositories/`. |
| Decisões permitidas | Adicionar função de leitura/escrita/ciclo de vida ao Repository. |
| Decisões proibidas | Incluir lógica de negócio, autenticação, ou mapeamento de domínio no Repository (isso pertence ao Service). |
| Entradas | Necessidade de uma nova query Prisma para um domínio. |
| Saídas | Função tipada com o tipo gerado pelo Prisma Client. |
| Artefatos obrigatórios | Nenhum documento — apenas o arquivo de código em si. |

## 8. api-pattern

| Campo | Valor |
|---|---|
| Responsabilidades | Aprofundamento de Route Handler: `requireAdmin()`, helpers de `responses.ts`, mapeamento erro→HTTP, checklist, anti-patterns. |
| Arquivos permitidos | `src/app/api/**/route.ts` exclusivamente. |
| Arquivos proibidos | Repository, Validator (como valor/função — só `import type` é exceção documentada), Prisma direto. |
| Decisões permitidas | Escolher qual helper de `responses.ts` usar para cada situação. |
| Decisões proibidas | Validar campos de domínio na rota (isso é do Validator, via Service); usar `NextResponse.json()` direto. |
| Entradas | Um Service já existente com suas classes de erro exportadas. |
| Saídas | Rota HTTP conforme (`requireAdmin` → parse → Service → mapeamento de erro). |
| Artefatos obrigatórios | Nenhum documento. |

## 9. frontend-pattern

| Campo | Valor |
|---|---|
| Responsabilidades | Aprofundamento de página admin + cliente HTTP: os 12 estados, loading/skeleton/toast, os 2 modais, formulário, listagem, pesquisa, checklist. |
| Arquivos permitidos | `src/app/admin/{recurso}/page.tsx`, `src/lib/api/{recurso}Api.ts`. |
| Arquivos proibidos | Service, Repository, Prisma — o front-end só acessa o cliente HTTP do próprio domínio. |
| Decisões permitidas | Redigir o texto do `ConfirmModal` **refletindo o comportamento real do Service** (nunca copiar genericamente de outro módulo). |
| Decisões proibidas | Enviar campo somente-leitura (`isActive`) no payload de `PATCH`; reimplementar `ValidationSummary`. |
| Entradas | API já implementada e testada (`api-pattern` concluído). |
| Saídas | Página funcional com os 12 estados e o par de modais. |
| Artefatos obrigatórios | Nenhum documento. |

## 10. sprint-planning

| Campo | Valor |
|---|---|
| Responsabilidades | Prática de planejar: divisão de módulo em sprints por camada, escopo/fora-de-escopo, DoR, dependências, sequência. |
| Arquivos permitidos | Nenhum diretamente — alimenta o conteúdo do `SPRINT_X.md` que o Orchestrator produz. |
| Arquivos proibidos | Qualquer código; `PLAN.md` (só leitura, para checar dependências). |
| Decisões permitidas | Definir se uma camada pode ser combinada com outra na mesma sprint (ex.: Repository + Validator). |
| Decisões proibidas | Criar sub-sprint para ajuste pontual não planejado; iniciar sprint com dependência não "Concluído" em `PLAN.md`. |
| Entradas | FASE 0 concluída pelo Orchestrator. |
| Saídas | Escopo, fora-de-escopo e dependências verificadas, prontos para o `SPRINT_X.md`. |
| Artefatos obrigatórios | Nenhum próprio — alimenta `SPRINT_X.md`. |

## 11. sprint-execution

| Campo | Valor |
|---|---|
| Responsabilidades | Execução operacional pós FASE -1/0.5: microtarefa por vez, ordem validação→documentação, quando rodar tsc/lint/build, os 2 checkpoints de aprovação, checklist de aceite. |
| Arquivos permitidos | Qualquer arquivo previsto no `SPRINT_X.md` (delegado às skills de camada); `PLAN.md`/`CHANGELOG.md` **somente após validações**. |
| Arquivos proibidos | `PLAN.md` **antes** de rodar as validações obrigatórias — regra explícita e crítica desta skill. |
| Decisões permitidas | Decidir que uma microtarefa está concluída e validada, avançando para a próxima. |
| Decisões proibidas | Pausar a cada microtarefa pedindo aprovação (só pausa nos 2 checkpoints); rodar `build` fora do previsto no `SPRINT_X.md`. |
| Entradas | `SPRINT_X.md`/`SPRINT_AUDIT.md` com FASE -1 e FASE 0.5 concluídas. |
| Saídas | Sprint implementada, validada e documentada, no estado IMPLEMENTADA. |
| Artefatos obrigatórios | `PLAN.md` e `CHANGELOG.md` atualizados, nesta ordem, após validação. |

## 12. sprint-audit

| Campo | Valor |
|---|---|
| Responsabilidades | Técnica prática de auditoria: releitura fresca, teste de duas perguntas para Inconsistência, técnica de verificação por busca de texto, árvore de decisão do veredito. |
| Arquivos permitidos | Nenhum — apenas leitura/verificação (grep, contagem de ocorrências). |
| Arquivos proibidos | Qualquer alteração de arquivo — o Auditor audita, não corrige. |
| Decisões permitidas | Classificar um achado como Inconsistência/Observação Técnica/Melhoria Futura; emitir o veredito final. |
| Decisões proibidas | Corrigir a Inconsistência encontrada (isso volta ao Executor); interpretar a sprint livremente sem confrontar com `SPRINT_AUDIT.md`. |
| Entradas | Sprint no estado AUTOAUDITADA (autoauditoria do Executor já feita). |
| Saídas | Um dos 3 vereditos (APROVADO / NECESSITA CORREÇÃO / BLOQUEADO). |
| Artefatos obrigatórios | `SPRINT_AUDIT.md` (confrontado, nunca ignorado). |

## 13. documentation

| Campo | Valor |
|---|---|
| Responsabilidades | Ecossistema de documentação do projeto: README, `docs/`, roadmap, documentos de arquitetura de produto, templates oficiais, handoff, referências cruzadas. |
| Arquivos permitidos | Qualquer `.md` do projeto (raiz e `docs/`) — **não** os `SKILL.md` de `.claude/skills/` (isso pertenceria a esta própria meta-skill). |
| Arquivos proibidos | Código-fonte; `.claude/skills/*/SKILL.md`. |
| Decisões permitidas | Escolher em qual documento uma informação nova deve ser registrada (tabela de "quando atualizar cada documento"). |
| Decisões proibidas | Assumir que uma referência de caminho antiga ainda é válida sem conferir (lição real do caso `docs/ai/`). |
| Entradas | Uma informação nova de produto/arquitetura/processo a documentar. |
| Saídas | Documento correto atualizado, com referência cruzada válida. |
| Artefatos obrigatórios | Nenhum próprio — orienta todos os `.md` do projeto. |

## 14. engineering-reviewer

| Campo | Valor |
|---|---|
| Responsabilidades | Checklist-mestre de revisão final de sprint — orquestra as 13 skills acima numa única passagem crítica; acrescenta regressão, riscos e dívida técnica. |
| Arquivos permitidos | Nenhum diretamente — orienta a checagem de todos os arquivos tocados pela sprint. `KNOWN_ISSUES.md` para registro de dívida técnica encontrada. |
| Arquivos proibidos | Qualquer alteração fora do registro de dívida técnica em `KNOWN_ISSUES.md`. |
| Decisões permitidas | Determinar se as 5 funcionalidades-âncora de regressão foram checadas; determinar a prioridade de um risco (Crítica/Alta/Média/Baixa). |
| Decisões proibidas | Pular qualquer uma das 12 revisões por "não parecer relevante" à sprint; aprovar sem os 6 blocos do relatório final. |
| Entradas | Sprint completa, antes de ser declarada pronta para auditoria/aceite. |
| Saídas | Os 6 blocos obrigatórios (Executivo, Técnico, Inconsistências, Observações, Melhorias, Prompt da próxima sprint). |
| Artefatos obrigatórios | `KNOWN_ISSUES.md` atualizado quando há dívida técnica nova. |

## 15. schema-pattern

| Campo | Valor |
|---|---|
| Responsabilidades | Aprofundamento da camada Schema (`prisma/schema.prisma`): campos obrigatórios, nomenclatura, relacionamentos explícitos vs. implícitos, índices, ordem de `db push`/`db:generate`. |
| Arquivos permitidos | `prisma/schema.prisma` exclusivamente (convenções, não dados). |
| Arquivos proibidos | Repository, Service, Validator, Front-end — qualquer código de acesso/consumo dos dados. |
| Decisões permitidas | Determinar se um relacionamento N:N precisa de entidade explícita; determinar se um campo precisa de `@@index`. |
| Decisões proibidas | Rodar `db push` contra o banco sem comunicar o impacto antes; corrigir retroativamente as duas divergências já aceitas (`ProductCategory` sem timestamps, ausência de `@@map`) sem sprint dedicada. |
| Entradas | Necessidade de criar ou alterar um model Prisma. |
| Saídas | Model conforme; `npx prisma db push` + `npm run db:generate` executados nesta ordem. |
| Artefatos obrigatórios | Nenhum documento — o artefato é o próprio `schema.prisma` conforme. |

Adicionada nesta entrada na Sprint G.5.2, corrigindo uma omissão real: `schema-pattern` já existia desde a Sprint G.5.1 mas nunca tinha sido incluída neste mapa (achado sinalizado por múltiplas sessões da refatoração G.5.2).

## 16. product-review

| Campo | Valor |
|---|---|
| Responsabilidades | Revisão de qualidade de produto (UX/UI/navegação/usabilidade/responsividade) de Frontend já implementado, contra `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md`; classificação de achados A-F. |
| Arquivos permitidos | Nenhum — skill de revisão, somente leitura. |
| Arquivos proibidos | Qualquer código-fonte; `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md` (consumidos, não alterados por este papel). |
| Decisões permitidas | Classificar um achado em exatamente uma categoria (A-F). |
| Decisões proibidas | Corrigir o código revisado; elevar/rebaixar categoria para forçar ou evitar bloqueio. |
| Entradas | Frontend já implementado por `AI Frontend Engineer`. |
| Saídas | Relatório de achados classificados + veredito de bloqueio (só categoria A bloqueia). |
| Artefatos obrigatórios | Nenhum documento próprio — relatório devolvido ao chamador. |

Adicionada nesta entrada na Sprint G.6.1, corrigindo uma omissão real: `product-review` foi criada na Sprint G.6 mas nunca tinha sido incluída neste mapa.

## 17. platform-review

| Campo | Valor |
|---|---|
| Responsabilidades | Revisão de conformidade de arquitetura de plataforma (Multi-tenant/Branding/White Label/Theme Engine/isolamento de dados/parametrização) de Backend e/ou Frontend já implementado, contra `PLATFORM_OVERVIEW.md`/`ERP_PRODUCT_VISION.md`. |
| Arquivos permitidos | Nenhum — skill de revisão, somente leitura. |
| Arquivos proibidos | Qualquer código-fonte; `PLATFORM_OVERVIEW.md`/`ERP_PRODUCT_VISION.md` (consumidos, não alterados por este papel). |
| Decisões permitidas | Classificar um achado como bloqueante (quebra de parametrização já existente) ou não-bloqueante (lacuna de escopo futuro). |
| Decisões proibidas | Corrigir o código revisado; exigir implementação de multi-tenência fora do escopo da Ordem de Missão corrente. |
| Entradas | Backend e/ou Frontend já implementados. |
| Saídas | Relatório de achados classificados + veredito de bloqueio. |
| Artefatos obrigatórios | Nenhum documento próprio — relatório devolvido ao chamador. |

Criada na Sprint G.6.1 — Skill nova, não omissão anterior.

---

*Este documento não define hierarquia entre skills (ver `SKILL_DEPENDENCIES.md`) nem quem planeja/executa/audita cada uma (ver `SKILL_MATRIX.md`).*
