---
name: sprint-audit
description: Use this skill when acting as Auditor, conducting a sprint or module audit, or classifying an audit finding in the Doce Menina confeitaria-app project — the practical verification techniques (what to reread, what to grep, the two-question test for Inconsistência, the approval decision tree). This is operational audit technique; for the formal categories and audit flow definitions use sprint-governance/governance instead, and for what to check in each code layer use architecture/api-pattern/repository-pattern/frontend-pattern/schema-pattern instead.
---

# Técnica de Auditoria — Doce Menina (confeitaria-app)

Esta Skill cobre a **técnica prática** de auditar — como de fato verificar cada coisa, não as definições formais (já em `sprint-governance` e `governance`, não repetidas aqui). Onde uma camada de código precisa ser auditada, ver a skill específica dela (seção 4.5 abaixo).

## 1. Objetivo

Dar a técnica objetiva de verificação usada ao auditar uma sprint ou módulo: o que reler, o que buscar por texto (nunca só ler e conferir a olho), como classificar um achado, e a árvore de decisão do veredito final.

## 2. Quando utilizar

Ao atuar como Auditor, conduzir a auditoria formal de uma sprint/módulo, ou classificar um achado específico (Inconsistência / Observação Técnica / Melhoria Futura).

## 3. Quando NÃO utilizar

- Para as definições formais de categoria, fluxo e estados de auditoria — usar `sprint-governance` ou `governance`.
- Para o checklist/anti-patterns de uma camada específica de código — usar `architecture`, `api-pattern`, `repository-pattern`, `frontend-pattern` ou `schema-pattern`.
- Para nomenclatura/organização geral de código — usar `coding-standards`.
- Para a revisão-mestre que orquestra todas as Skills ao fim de uma sprint — usar `engineering-reviewer`.

## 4. Responsabilidades

### 4.1 Antes de auditar, reler

O Auditor confronta o resultado com o `SPRINT_AUDIT.md`, nunca interpreta livremente. Prática real desta sessão: **releitura fresca** dos documentos-fonte relevantes imediatamente antes de auditar — mesmo que já lidos antes na mesma sessão — porque eles podem ter mudado desde a última leitura (ex.: `PLAN.md`/`CHANGELOG.md` foram reabertos e relidos antes de cada nova auditoria de duplicidade nesta sessão, mesmo já tendo sido lidos poucos turnos antes). Nunca confiar em memória de uma leitura antiga quando o arquivo pode ter sido alterado no intervalo.

### 4.2 Inconsistências — o teste de duas perguntas

Antes de classificar qualquer achado como Inconsistência, aplicar exatamente este teste (usado literalmente na auditoria final do Módulo 2.D):

1. **Viola alguma regra obrigatória do `PROJECT_GOVERNANCE.md` ou `REGRAS_NEGOCIO.md`?**
2. **Ou é apenas consequência natural do domínio, do escopo da sprint, ou de uma decisão arquitetural já registrada?**

Só a resposta (1) afirmativa classifica como Inconsistência. A resposta (2) classifica sempre como Observação Técnica — **mesmo que a diferença pareça notável**.

Exemplo real: a ausência de bloqueio de desativação por uso em `UnitOfMeasure` parecia uma inconsistência, por contraste direto com `Categorias`/`Ocasiões` (que bloqueiam). Mas não viola nenhuma regra obrigatória — é decisão de escopo já registrada nas Sprints 2.D.3/2.D.4. Classificada corretamente como Observação Técnica, não Inconsistência.

### 4.3 Observações técnicas — como redigir

Toda Observação Técnica segue o formato: **fato objetivo + causa raiz + por que não é violação**. Dois exemplos reais desta sessão como modelo:

- *"`unitRepository.ts` usa o verbo `list` para leituras em massa, enquanto `productCategoryRepository.ts`/`occasionTagRepository.ts` usam `find`."* (fato) — *"decorre de nomenclatura definida explicitamente no prompt da Sprint 2.D.2."* (causa raiz) — *"não viola a convenção de nomenclatura do `PROJECT_GOVERNANCE.md`, que não prescreve um verbo único."* (por que não é violação).
- *"`productCategory.ts` não segue o sufixo `Validator` que `occasionTagValidator.ts`/`unitValidator.ts` seguem corretamente."* (fato) — *"é o arquivo mais antigo dos três, anterior à consolidação do padrão."* (causa raiz) — *"nenhuma regra obrigatória exige retrofit de arquivos já existentes."* (por que não é violação).

### 4.4 Melhorias futuras — o ciclo real até virar regra

Exemplo real completo do ciclo: a proibição de sub-sprints (`2.D.2.1`, `2.D.2.2`) foi identificada como **Melhoria Futura** em uma auditoria (não implementada na hora, pois estava fora do escopo daquela sprint) → posteriormente formalizada como regra oficial via FASE 6, nas Sprints G.1/G.2, em `PROJECT_GOVERNANCE.md` e `AI_PROMPT_ORCHESTRATOR.md`. Uma Melhoria Futura bem registrada é exatamente o insumo que a FASE 6 consome depois — vale a pena redigi-la pensando nisso, não como nota descartável.

### 4.5 Arquitetura — qual skill consultar por camada

| Camada | Skill com o checklist/anti-patterns |
|---|---|
| Route Handler / API | `api-pattern` |
| Service | `architecture` |
| Repository | `repository-pattern` |
| Validator | `architecture` |
| Schema (Prisma) | `schema-pattern` |
| Front-end admin | `frontend-pattern` |
| Nomenclatura/organização | `coding-standards` |

Não repetido aqui — cada skill acima já tem seu próprio checklist de camada.

### 4.6 Documentação — PLAN e CHANGELOG

Regras completas de conteúdo: `governance`. Técnica de verificação, sempre por busca de texto:

- **Duplicidade em PLAN.md:** contar ocorrências de `Sprint {N}.{LETRA}.{número}` — deve ser exatamente 1.
- **Duplicidade em CHANGELOG.md:** contar ocorrências de `## [Sprint {N}.{LETRA}.{número}]` — deve ser exatamente 1.
- **Acoplamento indevido em rotas de API:** buscar `prisma\.`, `Repository`, `NextResponse` dentro de `src/app/api/{módulo}/**` — deve retornar zero ocorrências (exceto os `import type` de Validator já documentados como exceção em `architecture`/`api-pattern`).

Critério extra reforçado nesta sessão (corrigido pelo usuário mais de uma vez): CHANGELOG deve ser **estritamente factual**, nunca opinativo ou prescritivo. Exemplos reais de frases removidas por violar isso: *"permanecem registrados como pendências arquiteturais, não como dívida desta sprint"* e *"fica pendente de autorização explícita antes de qualquer sprint que dependa disso"* — ambas soavam factuais mas eram, na prática, julgamento/recomendação. Ao revisar uma entrada de CHANGELOG, testar cada frase: ela relata o que aconteceu, ou está opinando/recomendando algo sobre o futuro? Só a primeira é aceitável.

### 4.7 Critérios de aprovação — árvore de decisão

Os 3 vereditos possíveis já estão definidos em `sprint-governance`/`AI_PROMPT_ORCHESTRATOR.md` (não repetido). Árvore prática de decisão entre eles:

- **APROVADO** — zero Inconsistência (categoria A) em aberto, **independentemente** de quantas Observações Técnicas ou Melhorias Futuras existirem.
- **NECESSITA CORREÇÃO** — existe Inconsistência, mas a correção cabe dentro do escopo já autorizado da sprint (não exige decisão nova do Product Owner).
- **BLOQUEADO** — a correção exigiria decisão fora do escopo autorizado, ou autorização adicional do Product Owner. Caso real desta sessão: o campo `slug` ausente em `UnitOfMeasure` — implementar `findUnitBySlug` como pedido originalmente era impossível sem alterar o schema (fora de escopo), o que gerou uma pausa real com pergunta direta ao usuário antes de prosseguir, em vez de decidir sozinho.

## 5. Fluxo resumido

Reler documentos-fonte frescos → aplicar o teste de duas perguntas (4.2) a cada achado candidato → redigir Observações Técnicas no formato fato+causa+justificativa (4.3) → registrar Melhorias Futuras de forma reaproveitável (4.4) → rodar a técnica objetiva de verificação de PLAN/CHANGELOG (4.6) → consultar a skill de camada certa para achados de código (4.5) → decidir o veredito pela árvore (4.7).

## 6. Arquivos auxiliares disponíveis

Nenhum. O conteúdo desta Skill (técnica de auditoria) é coeso e não atingiu tamanho que justifique extração para `references/`/`checklists/` — reavaliar se crescer significativamente.

## 7. Como carregar os arquivos auxiliares

Não aplicável (sem arquivos auxiliares nesta Skill).

## 8. Critérios de sucesso

Uma auditoria conduzida com esta Skill está completa quando: todo achado passou pelo teste de duas perguntas antes de virar Inconsistência; toda verificação de PLAN/CHANGELOG foi feita por contagem/grep, nunca só leitura visual; todo achado de camada foi checado contra a skill certa (4.5); o veredito final foi atribuído pela árvore de decisão (4.7), não por impressão geral.

## 9. Limitações

- Não define as categorias formais nem o fluxo oficial de auditoria ponta a ponta — isso é `sprint-governance`/`governance`.
- Não cobre o que verificar dentro de cada camada de código — isso é responsabilidade das Skills de camada (4.5).
- Não decide o mérito de uma sprint específica do ERP — só dá a técnica para verificar.

## 10. Anti-patterns

- Classificar um achado como Inconsistência só por parecer notável, sem aplicar o teste de duas perguntas.
- Verificar duplicidade em PLAN.md/CHANGELOG.md só por leitura visual, sem contar ocorrências.
- Redigir uma Observação Técnica sem os três elementos (fato + causa raiz + por que não é violação).
- Deixar passar linguagem opinativa/prescritiva em uma entrada de CHANGELOG por "soar factual".
- Atribuir veredito BLOQUEADO ou NECESSITA CORREÇÃO sem checar se a correção cabe no escopo já autorizado.

## 11. Referências cruzadas

Definições formais e fluxo oficial: `sprint-governance`, `governance`. Checklists de camada: `architecture`, `api-pattern`, `repository-pattern`, `frontend-pattern`, `schema-pattern`, `coding-standards`. Revisão-mestre que consome esta técnica: `engineering-reviewer`.

### Compatibilidade com Sub-agents

Nenhum Sub-agent foi criado neste projeto ainda (previsto para a Sprint G.5.3). Quando existirem:

- **Deveriam pré-carregar esta Skill**: um futuro subagent `sprint-auditor` dedicado — precisa da técnica de verificação sempre em contexto para não decidir por impressão.
- **Não deveriam pré-carregá-la**: subagents de implementação pura de código (ex.: um futuro `code-implementer`) — eles precisam das Skills de camada, não da técnica de auditoria. Também não `Explore`/`Plan`.
- **Conhecimento fornecido:** teste de duas perguntas, formato de Observação Técnica, técnica de verificação objetiva, árvore de decisão de veredito.
- **Artefatos produzidos:** nenhum arquivo — apenas classificação de achados e veredito, registrados no `SPRINT_AUDIT.md` da sprint (fora do escopo desta Skill).
- **Entradas esperadas:** um achado candidato a Inconsistência/Observação/Melhoria, ou uma sprint completa a auditar.
- **Saídas entregues:** classificação do achado; veredito final (Aprovado/Necessita Correção/Bloqueado).

---

Precedência: em caso de conflito entre esta Skill e `PROJECT_GOVERNANCE.md`, o documento original sempre prevalece.

<!-- Histórico: v1.0 criada em 20/07/2026 — Sprint G.5.1. v2.0 em 13/07/2026 — Sprint G.5.2: renomeada skill.md→SKILL.md, corpo reestruturado nas 11 seções oficiais. -->
