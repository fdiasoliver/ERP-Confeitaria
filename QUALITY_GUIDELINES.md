# QUALITY_GUIDELINES.md — Diretrizes de Qualidade do ERP Doce Menina

Produzido na Sprint 2.I.0 (20/07/2026) — Consolidação da Metodologia de Desenvolvimento, a partir da retrospectiva do Módulo 2.H (Embalagens, Sprints 2.H.0–2.H.7, o primeiro módulo a percorrer o ciclo completo Blueprint→Schema→Repository+Validator→Service→API→UX Foundation→Frontend→Validação Funcional→Homologação→Encerramento).

**O que este documento é:** o companion operacional do **Fluxo Oficial de Desenvolvimento de Módulo** (`PROJECT_GOVERNANCE.md` Seção 27) — checklists práticos, critérios de evidência e uma classificação oficial de achados, por etapa.

**O que este documento não é:** não substitui nem duplica `PROJECT_GOVERNANCE.md` (regras/políticas), as Skills de camada (`schema-pattern`, `repository-pattern`, `api-pattern`, `frontend-pattern` — regras detalhadas de cada camada de código), ou `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md` (padrões de interface). Onde outro documento já é a fonte de verdade, este documento aponta para ele em vez de repetir o conteúdo.

---

## 1. Classificação oficial de achados

Toda pendência, sugestão ou problema identificado durante qualquer etapa do ciclo de um módulo deve ser classificado em **exatamente uma** das 5 categorias abaixo — nunca deixado sem classificação.

| Categoria | Definição | Bloqueia a etapa atual? | Exemplo real (Módulo 2.H) |
|---|---|---|---|
| **Bug** | Comportamento que viola uma regra já documentada (`REGRAS_NEGOCIO.md`, o Blueprint do módulo, ou o comportamento esperado óbvio da interface) | **Sim, sempre** — corrigido antes do encerramento da etapa em que foi encontrado | Pluralização "embalagemns" (Sprint 2.H.6) |
| **Backlog** | Funcionalidade real, já cogitada no Blueprint, deliberadamente adiada para uma sprint futura, sem compromisso de prazo | Não | "Escolha de embalagem pelo cliente no checkout" (`MODULE_2H_PLANNING.md` Seção 11) |
| **Evolução** | Proposta de generalizar um padrão já repetido em 2+ lugares reais, ainda não promovido a Skill/componente compartilhado | Não — precisa de 2+ casos de uso reais antes de virar Backlog formal | Extrair `PagedResult<T>`/`buildWhere` (Sprint 2.H.2); hook `useAdminToast` (Sprint 2.H.6) |
| **Dívida Técnica** | Divergência consciente e já registrada de um padrão ideal, aceita por razão de escopo/tempo, sem compromisso de correção — mas rastreável | Não | `Ingredient.supplier` como texto livre em vez de FK (`Packaging.supplierId` corrigiu isso ao nascer como FK real — ver `CHANGELOG.md` Sprint 2.H.1) |
| **Decisão Arquitetural** | Duas abordagens com impactos distintos, nenhuma obviamente correta — exige ADR formal (`PROJECT_GOVERNANCE.md` Seção 13) antes de qualquer implementação | Sim, até a ADR ser aprovada | ADR-014 — `Packaging` vinculado a `Product`, não a `Recipe` |

### Mapeamento para a classificação de auditoria já existente (`PROJECT_GOVERNANCE.md` Seção 24)

Esta classificação de 5 categorias **não substitui** a de 3 categorias já usada em auditorias formais (Inconsistência / Observação Técnica / Melhoria Futura) — é uma classificação mais granular, usada durante o desenvolvimento; a de 3 categorias é usada especificamente ao **auditar** uma sprint ou módulo já pronto. Mapeamento:

| Categoria (esta seção) | Vira, em auditoria formal (Seção 24) |
|---|---|
| Bug | Inconsistência (bloqueante) |
| Dívida Técnica | Observação Técnica (decisão já tomada, não bloqueia) |
| Backlog / Evolução | Melhoria Futura (não bloqueia) |
| Decisão Arquitetural | Sempre exige ADR, independente de bloquear a sprint atual — ortogonal às outras 4 |

---

## 2. Padrões de qualidade obrigatórios (a cada sprint com código)

| Verificação | Comando | Obrigatório quando |
|---|---|---|
| Prisma válido | `npx prisma generate` (+ `db push` se o schema mudou) | Sempre que `schema.prisma` for tocado |
| TypeScript | `npx tsc --noEmit` → 0 erros | Toda sprint com código |
| Lint | `npm run lint` → 0 erros/avisos | Toda sprint com código |
| Build de produção | `npm run build` → 0 erros | Toda sprint com Frontend ou API nova |
| Validação Funcional (Playwright MCP, quando disponível) | Roteiro de cenários reais contra o sistema rodando | Toda sprint com Frontend — ver Seção 4 |

**Evidências obrigatórias:** o resultado de cada verificação acima deve ser registrado em `CHANGELOG.md` na sprint correspondente (tabela `Comando | Resultado`, já é o padrão usado desde a Sprint 2.H.1) — nunca apenas afirmado sem o output real.

**Critério mínimo de aprovação:** uma sprint só é considerada concluída quando **todas** as verificações aplicáveis retornam 0 erros. Nenhuma sprint é aprovada com base em "o código parece certo" — corroborado por evidência de execução real (ADR-013, `CLAUDE.md`).

---

## 3. Padrão de Homologação (Fase 7 da Sprint 2.I.0)

```
Homologação Técnica  →  Validação Funcional  →  Homologação do Product Owner  →  Encerramento
```

| Etapa | Responsabilidade | O que confirma | O que NÃO confirma |
|---|---|---|---|
| **Homologação Técnica** | IA — Revisão Técnica (`PROJECT_GOVERNANCE.md` Seção 16) + Processo de QA (Seção 17) | Tipagem, arquitetura em camadas, nomenclatura, segurança, código compila e builda | Se a interface é usável ou clara para quem não é desenvolvedor |
| **Validação Funcional** | IA, via Playwright MCP (ou testes manuais equivalentes quando indisponível) | Comportamento observável real: CRUD, navegação, estados, mensagens, responsividade, console/rede limpos | Se as mensagens fazem sentido de negócio (só confirma que existem e aparecem no momento certo) |
| **Homologação do Product Owner** | Product Owner, com apoio de execução da IA | Adequação ao negócio: clareza, usabilidade, nomes, se o blueprint foi cumprido | Detalhes técnicos de implementação — já cobertos pelas duas etapas anteriores |
| **Encerramento** | IA, mediante aceite do Product Owner | DoD de Módulo (`PROJECT_GOVERNANCE.md` Seção 23) + Checklist de Encerramento (Seção 25) totalmente satisfeitos | — |

Nenhuma etapa substitui outra. Um módulo com Homologação Técnica e Validação Funcional aprovadas, mas sem Homologação do Product Owner, **não pode ser encerrado** — precedente real: o Módulo 2.H só foi encerrado após a Sprint 2.H.7 dedicada exclusivamente a isso, distinta da Sprint 2.H.6 (Frontend + Validação Funcional).

---

## 4. Checklists oficiais por etapa

Cada checklist abaixo é o mínimo verificável ao final da etapa correspondente (`PROJECT_GOVERNANCE.md` Seção 27). Onde já existe uma Skill dedicada com regras detalhadas da camada, o checklist aqui é propositalmente curto — a Skill é a fonte de verdade do "como", este checklist é o "está pronto?".

### Checklist Blueprint

```
[ ] Objetivo do módulo em uma frase
[ ] Todas as entidades do domínio com atributos, relacionamentos, cardinalidades
[ ] Toda regra de negócio com origem explícita (necessidade operacional / consistência técnica / requisito funcional)
[ ] Casos de uso mínimos documentados
[ ] Todas as integrações com outros módulos mapeadas (com prioridade)
[ ] Estratégia de reutilização do Design System esboçada (mesmo que detalhada só na UX Foundation)
[ ] Modelo de dados proposto (schema Prisma em rascunho)
[ ] Roadmap das sprints seguintes com objetivo/entradas/saídas/critérios de aceite
[ ] Riscos identificados com mitigação
[ ] Backlog futuro explícito (o que fica fora deliberadamente)
[ ] Nenhuma decisão arquitetural relevante permanece em aberto — toda ambiguidade real vira uma pergunta ao Product Owner, não uma suposição
```

### Checklist Schema

```
[ ] Segue schema-pattern (Skill) — nomenclatura, índices, relacionamentos, soft delete
[ ] npx prisma validate sem erros
[ ] npx prisma generate executado
[ ] db push executado e confirmado por introspecção direta do banco (não só o output do comando)
[ ] Toques em models de módulos já encerrados são estritamente aditivos (só relação inversa) e declarados explicitamente
[ ] npx tsc --noEmit sem erros
```

### Checklist Repository + Validator

```
[ ] Repository segue repository-pattern (Skill) — só Prisma Client tipado, nenhuma regra de negócio
[ ] Validator é função pura, só validação estrutural (obrigatoriedade, formato, tamanho, limite) — nenhuma consulta ao banco
[ ] Nenhuma inconsistência de precedente copiada sem justificativa — toda divergência de um módulo irmão registrada com "alternativa considerada e descartada"
[ ] npx tsc --noEmit e npm run lint sem erros
```

### Checklist Service

```
[ ] Toda regra de negócio do Blueprint está implementada aqui — nunca no Repository, Validator ou API
[ ] Erros de domínio como classes próprias ({Entidade}NotFoundError, {Entidade}ValidationFailedError etc.)
[ ] Toda transação Prisma justificada (por que é atômica, o que aconteceria sem a transação)
[ ] Regra do Blueprint que não pôde ser implementada nesta etapa está registrada como pendência explícita, não esquecida silenciosamente
[ ] npx tsc --noEmit e npm run lint sem erros
```

### Checklist API

```
[ ] Segue api-pattern (Skill) — requireAdmin() primeiro, mapeamento de erro por instanceof, responses.ts
[ ] Matriz de contratos públicos documentada (rota, método, payload, resposta, códigos HTTP)
[ ] Nenhuma regra de negócio na rota — só validar entrada, chamar Service, mapear resposta
[ ] Testado manualmente (Playwright ou HTTP direto) — sucesso e pelo menos um caso de erro por endpoint
[ ] npx tsc --noEmit, npm run lint e npm run build sem erros
```

### Checklist UX Foundation

```
[ ] Todas as telas mínimas do módulo mapeadas (objetivo, atores, entradas, saídas, ações)
[ ] Wireframe de baixa fidelidade por tela, indicando componentes compartilhados
[ ] Fluxos de navegação ponta a ponta documentados
[ ] Matriz Tela × Componentes Compartilhados
[ ] Matriz Estado da Interface × Feedback ao Usuário
[ ] Toda tela nasce em PageContainer/ResponsiveGrid (evita o débito técnico corrigido na Sprint G.8)
[ ] Nenhum componente novo sem justificativa técnica registrada
[ ] Acessibilidade básica revisada (foco, teclado, contraste, mensagens de erro, mobile)
```

### Checklist Frontend

```
[ ] Segue frontend-pattern (Skill)
[ ] Implementa exatamente o que a UX Foundation especificou — qualquer divergência é decisão registrada, não silenciosa
[ ] 100% componentes homologados no Design System — nenhum novo sem justificativa
[ ] npx prisma generate, npx tsc --noEmit, npm run lint, npm run build sem erros
```

### Checklist Validação Funcional

```
[ ] Executada contra o sistema real rodando (servidor de dev), login real, navegação real — nunca suposição
[ ] Roteiro cobre: CRUD completo, paginação, filtros, ordenação, navegação entre telas, todos os estados de UI (loading/vazio/erro/sucesso), mensagens de validação e de sucesso, responsividade, navegação por teclado
[ ] Console do navegador sem erros reais (avisos esperados de testes de erro intencionais não contam)
[ ] Nenhuma requisição HTTP com status inesperado
[ ] Toda regra de negócio pendente/fora de escopo (ex.: Regra 11 do Módulo 2.H) reconfirmada como realmente inalterada, não assumida
[ ] Evidências registradas cenário a cenário em CHANGELOG.md
[ ] Qualquer cenário reprovado interrompe a etapa até correção e reexecução completa (não parcial)
```

### Checklist Homologação (Product Owner)

```
[ ] Principais fluxos executados sob ótica de negócio (não técnica) — facilidade de uso, clareza das mensagens, coerência dos nomes
[ ] Todas as regras do Blueprint confirmadas entregues, regra a regra — pendências de escopo já aprovadas reconfirmadas, não escondidas
[ ] Consistência visual com os módulos já homologados confirmada
[ ] Nenhuma funcionalidade nova implementada nesta etapa — só correções pontuais de linguagem/UX decorrentes da própria homologação, sem ampliar escopo
[ ] Nenhum defeito bloqueante — se houver, a homologação não é aprovada até a correção
[ ] Melhorias não-bloqueantes identificadas registradas como Backlog/Evolução (Seção 1), não implementadas às pressas
```

### Checklist Encerramento do Módulo

```
[ ] DoD de Módulo (PROJECT_GOVERNANCE.md Seção 23) totalmente satisfeito
[ ] Checklist de Encerramento (PROJECT_GOVERNANCE.md Seção 25) totalmente satisfeito
[ ] PLAN.md atualizado para "Concluído" com data
[ ] CHANGELOG.md com entrada de encerramento e decisão final explícita
[ ] MODULE_{N}{LETRA}_CLOSURE.md criado — obrigatório para todo módulo, confirmado como padrão real e recorrente
    (2.D, 2.E, 2.G, 2.I, 2.J o produziram; 2.H não produziu até a Sprint 2.I.0, que fecha
    essa lacuna retroativamente com MODULE_2H_CLOSURE.md)
[ ] Toda pendência de escopo (Backlog/Dívida Técnica/Decisão Arquitetural ainda não implementada) registrada e rastreável, não perdida
[ ] Aceite explícito do Product Owner para o módulo como um todo
```

---

## 5. Recomendações metodológicas registradas nesta sprint (não implementadas)

- **Lacuna real identificada:** não existe Skill dedicada para a camada Service (existe `schema-pattern`, `repository-pattern`, `api-pattern`, `frontend-pattern`, mas nenhuma `service-pattern`) nem para Validator isoladamente. O Checklist Service/Repository+Validator acima cobre o mínimo operacional, mas uma Skill formal traria o mesmo nível de detalhe que as demais camadas já têm — candidata a uma sprint futura de `project-skill-governance`.
- **Oportunidade de automação (não implementada nesta sprint):** os comandos de validação técnica (Seção 2) e boa parte do Checklist Validação Funcional já seguem um roteiro determinístico o suficiente para um script único (`npm run validate-module` ou similar) rodar `prisma generate`/`tsc`/`lint`/`build` em sequência e falhar rápido no primeiro erro — reduziria a chance de esquecer um passo, mas não substitui a Validação Funcional via Playwright (que exige julgamento, não é puramente mecânica).
- **`MENU_STRUCTURE.md`/`SCREENS.md`** desatualizados desde a Sprint P1 (29/06/2026) para praticamente todos os módulos já implementados — achado já registrado na Sprint 2.H.7, reafirmado aqui como candidato a uma sprint de documentação dedicada, fora do escopo desta sprint de metodologia.

---

## 6. Mapa de Governança (Fase 9 da Sprint 2.I.1)

Para cada documento de governança/arquitetura do projeto: responsabilidade, proprietário, quando atualizar, dependências e documentos relacionados. Não repete o conteúdo de cada documento — só a relação entre eles.

| Documento | Responsabilidade | Proprietário | Quando atualizar | Dependências | Documentos relacionados |
|---|---|---|---|---|---|
| `CLAUDE.md` (raiz) | Fonte de verdade permanente do ERP: stack, estrutura, convenções, fluxo de sprint, ADRs já decididas | Product Owner (edição pela IA mediante aprovação) | A cada ADR nova aprovada; mudança de stack/estrutura | Nenhuma — é o topo da hierarquia | Todos os demais |
| `PROJECT_GOVERNANCE.md` | Regras e políticas do processo de desenvolvimento (fluxo, ADR, dívida técnica, QA, DoD) | Product Owner | Nova Sprint Oficial de governança aprovada | `CLAUDE.md` | `QUALITY_GUIDELINES.md`, `GOVERNANCE_DECISIONS.md` |
| `QUALITY_GUIDELINES.md` | Companion operacional de `PROJECT_GOVERNANCE.md` Seção 27 — checklists, critérios de evidência, classificação de achados | Product Owner | Nova etapa/checklist formalizada em sprint de metodologia | `PROJECT_GOVERNANCE.md` Seção 27 | `MODULE_{X}_CLOSURE.md` |
| `GOVERNANCE_DECISIONS.md` | Rastreador de decisões metodológicas pendentes (recomendação → aprovação/rejeição do PO) | Product Owner | Nova recomendação registrada; decisão do PO recebida | `PROJECT_GOVERNANCE.md`, `QUALITY_GUIDELINES.md` | `CLAUDE.md` (destino de uma decisão aprovada, como ADR) |
| `REGRAS_NEGOCIO.md` | Regras de negócio e invariantes do domínio | Product Owner | Nova regra de negócio decidida | `DOMAIN_MODEL.md` | `ARCHITECTURE.md` |
| `ARCHITECTURE.md` | Arquitetura técnica: camadas, decisões, riscos, convenções | Product Owner | Mudança estrutural aprovada | `CLAUDE.md` | `DOMAIN_MODEL.md`, `MODULES.md` |
| `DOMAIN_MODEL.md` | Entidades, relacionamentos, fluxos de domínio | Product Owner | Nova entidade/relacionamento no schema | `prisma/schema.prisma` | `ARCHITECTURE.md`, `REGRAS_NEGOCIO.md` |
| `MODULES.md` | Evolução de módulos por fase, dívida técnica (TD-01...) | Product Owner | Módulo novo iniciado/encerrado | `PLAN.md` | `KNOWN_ISSUES.md` |
| `PLAN.md` | Roadmap vivo — status de cada módulo/sprint | Product Owner (edição pela IA a cada sprint) | Toda sprint (início e encerramento) | `CHANGELOG.md` | Todos os `MODULE_{X}_CLOSURE.md` |
| `CHANGELOG.md` | Narrativa histórica factual de cada sprint executada | Product Owner (edição pela IA a cada sprint) | Toda sprint encerrada | Nenhuma — é o registro primário de execução | `PLAN.md` |
| `KNOWN_ISSUES.md` | Problemas conhecidos (KI-01...) com prioridade | Product Owner | KI novo identificado ou resolvido | `PLAN.md` | `MODULES.md` |
| `DESIGN_SYSTEM.md` | Componentes de UI, cartografia de compatibilidade | Product Owner | Componente novo/alterado | `UX_GUIDELINES.md` | `QUALITY_GUIDELINES.md` (Checklist Frontend) |
| `UX_GUIDELINES.md` | Diretrizes de UX (formulários, erros, navegação, responsivo) | Product Owner | Diretriz nova decidida | Nenhuma | `DESIGN_SYSTEM.md` |
| `PLATFORM_OVERVIEW.md` | Visão de plataforma multi-tenant, distinção Platform Review × Product Review | Product Owner | Evolução real de arquitetura multi-tenant | `ERP_PRODUCT_VISION.md` | `PROJECT_GOVERNANCE.md` Seção 16.4 |
| `ERP_PRODUCT_VISION.md` | Visão de produto SaaS white-label (não implementada) | Product Owner | Nova decisão de visão de produto | Nenhuma | `PLATFORM_OVERVIEW.md` |
| `DEMO_ENVIRONMENT.md` / `DEMO_DATASET.md` / `DEMO_GUIDE.md` | Arquitetura, conteúdo e guia do ambiente de demonstração | Product Owner | Dado real de demo populado; novo fluxo de demo | `PROJECT_GOVERNANCE.md` Seção 16.6 | `prisma/demo-seeds/README.md` |
| `MODULE_{X}_CLOSURE.md` (ex.: `MODULE_2H_CLOSURE.md`) | Encerramento formal de um módulo — escopo, arquitetura, entidades, pendências | Product Owner | Módulo encerrado (Seção 25 do `PROJECT_GOVERNANCE.md`) | `QUALITY_GUIDELINES.md` Seção 3 | `PLAN.md`, `CHANGELOG.md` |
| `.claude/` (Skills, Contracts, Protocols, Agents, Playbooks) | Infraestrutura de execução por IA sob demanda | Product Owner | Nova Skill validada por `project-skill-governance` | `.claude/CLAUDE.md` | `CLAUDE.md` (raiz) |
| `PROJECT_STATE.md` | Snapshot executivo do estado atual — sincronização de contexto entre IAs (não é fonte de verdade) | Product Owner (edição pela IA a cada sprint) | Ao final de toda Sprint Oficial, só depois de `CHANGELOG.md`/`PLAN.md`/ADRs atualizados | `CHANGELOG.md`, `PLAN.md`, `CLAUDE.md` (ADRs) | Todos — é o único documento que resume todos os outros, sem duplicar nenhum |

**Regra de precedência em caso de conflito:** `CLAUDE.md` (raiz) > `PROJECT_GOVERNANCE.md` > `QUALITY_GUIDELINES.md`/documentos de domínio > `.claude/` (Skills/Contracts/Protocols) — conforme já estabelecido em `.claude/CLAUDE.md` e reafirmado aqui para o mapa completo.

---

*Documento criado em 20/07/2026 — Sprint 2.I.0 — Consolidação da Metodologia de Desenvolvimento do ERP, a partir da retrospectiva do Módulo 2.H (Embalagens). Seção 6 (Mapa de Governança) acrescentada na Sprint 2.I.1 (20/07/2026) — ver nota sobre colisão de numeração em `GOVERNANCE_DECISIONS.md` GD-004.*
*Companion operacional de `PROJECT_GOVERNANCE.md` Seção 27 — em caso de conflito, prevalece `PROJECT_GOVERNANCE.md`.*
