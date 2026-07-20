---
name: schema-pattern
description: Use this skill when creating or reviewing a Prisma model in prisma/schema.prisma in the Doce Menina confeitaria-app project — required fields, naming conventions, relationship patterns (explicit vs. implicit many-to-many), indexes, and known deviations already accepted in the current schema. This is a deep-dive on the Schema layer specifically, complementing the layer contract already in architecture's references/layers.md.
---

# Padrão de Schema (Prisma) — Doce Menina (confeitaria-app)

Esta Skill aprofunda especificamente a camada **Schema** (`prisma/schema.prisma`) — lacuna identificada na validação das Skills existentes (Sprint G.5.1): havia aprofundamento dedicado para Repository, API e Front-end, mas nenhum para Schema, apesar de o projeto já ter uma sprint real inteira dedicada a essa camada (Sprint 2.D.1). Não repete o resumo geral já em `architecture` item 4 (fluxo de camadas) e `references/layers.md` (seções "Prisma"/"Banco") — consulte-os primeiro. Fonte de verdade: `PROJECT_GOVERNANCE.md` Seção 10 (Convenções para Prisma) e [ADR-005](../../../ADR-005.md).

## 1. Objetivo

Garantir que todo model novo ou alterado em `prisma/schema.prisma` siga as convenções já estabelecidas do projeto — campos obrigatórios, nomenclatura, relacionamentos e índices — sem repetir decisões já erradas historicamente (ver Anti-patterns).

## 2. Quando utilizar

- Ao criar um model Prisma novo.
- Ao adicionar ou alterar um relacionamento entre models existentes.
- Ao revisar um `schema.prisma` alterado por outra sessão, antes de `db push`.

## 3. Quando NÃO utilizar

- Para lógica de negócio ou validação de domínio sobre os dados — isso é `Validator` e `Service`, ver skill `architecture`.
- Para a camada de acesso a dados em código (queries) — isso é skill `repository-pattern`.
- Para o resumo geral de Prisma/Banco já coberto em `architecture` item 4 e `references/layers.md` — esta Skill só aprofunda o que aquele resumo não cobre.

## 4. Responsabilidades

Todo model Prisma descreve exclusivamente a forma dos dados persistidos e suas relações — nunca lógica de negócio, nunca validação de domínio (isso é `Validator`), nunca decisão condicional além de `@default`/`@relation`/`@@unique`/`@@index`.

**Campos obrigatórios** (fonte: `PROJECT_GOVERNANCE.md` Seção 10):
- `id String @id @default(cuid())` — obrigatório e imutável em todo model persistente ([ADR-005](../../../ADR-005.md), decisão congelada, não questionável sem nova ADR aprovada). `slug` é proibido como chave técnica de relacionamento — serve só para URL/SEO/navegação.
- `createdAt DateTime @default(now())` e `updatedAt DateTime @updatedAt` — obrigatórios em toda entidade nova.
- `active Boolean @default(true)` (ou `isActive`, conforme o domínio) — obrigatório em toda entidade que pode ser desativada. Soft delete sempre via este campo — nunca `DELETE` em entidade de negócio.

**Convenções de nomenclatura:**
- `@@map("snake_case")` — nome da tabela em snake_case no banco.
- Enums: valores em `SCREAMING_SNAKE_CASE`.
- Campos monetários: `Decimal @db.Decimal(10, 2)` — nunca `Float`.
- Nome do model: PascalCase, singular (ex.: `UnitOfMeasure`, não `UnitsOfMeasure`).

**Relacionamentos:** relacionamentos N:N com potencial de evolução usam **entidade de relacionamento explícita**, nunca relacionamento implícito do Prisma (`occasions OccasionTag[]` direto em `Product`, sem tabela intermediária, é proibido sem ADR aprovada). Exemplos oficiais reais já no schema: `ProductOccasion` (`Product ↔ OccasionTag`), `ProductRecipe` (`Product ↔ Recipe`, já com metadados `quantity`/`unitId`). Relacionamento implícito só é permitido quando aprovado via ADR, para casos sem qualquer perspectiva de evolução de metadados (fonte: `PROJECT_GOVERNANCE.md` Seção 10, "Relacionamentos many-to-many"; decisão registrada na Sprint 2.C.1). Toda FK precisa de `@relation` nomeado explícito — nunca deixar o Prisma inferir a relação implicitamente (ver Anti-patterns, item histórico IC-02/IC-07).

**Índices:** `@@index` em todo campo usado com frequência em `WHERE` ou `ORDER BY` — não adicionar índice especulativo sem uso real esperado. Campo com `@unique` já cria índice implícito — nunca duplicar com um `@@index` redundante sobre o mesmo campo isolado.

## 5. Fluxo resumido

Este projeto usa `prisma db push` (não `prisma migrate`) — não existe pasta `prisma/migrations/`. Ordem obrigatória após alterar `schema.prisma`:

```
npx prisma db push       # sincroniza o schema com o banco real (Supabase Postgres)
npm run db:generate      # regenera o Prisma Client tipado
```

No Windows, parar o servidor `npm run dev` antes de `db:generate` (o processo do Next.js prende o DLL do Prisma Client e o generate falha). Sprint de Schema nunca roda `db push` contra o banco sem antes comunicar o impacto — alterar schema é uma das ações que exige transparência explícita (`PROJECT_GOVERNANCE.md` Seção 18, "O que a IA NUNCA faz sem aprovação explícita").

## 6. Arquivos auxiliares disponíveis

Nenhum. O conteúdo desta Skill é curto o suficiente (dentro do limite oficial de 500 linhas, muito abaixo dele) para não justificar `references/`, `examples/` ou `checklists/` separados — dividir agora fragmentaria um documento já enxuto sem ganho real.

## 7. Como carregar os arquivos auxiliares

Não aplicável — ver item 6.

## 8. Critérios de sucesso

Um model está pronto quando:
- [ ] `id String @id @default(cuid())`.
- [ ] `createdAt`/`updatedAt` presentes (modelo novo).
- [ ] `active`/`isActive` presente, se a entidade pode ser desativada.
- [ ] Enums em `SCREAMING_SNAKE_CASE`.
- [ ] Campos monetários em `Decimal`, nunca `Float`.
- [ ] Relacionamento N:N com potencial de evolução usa entidade explícita.
- [ ] Toda FK tem `@relation` nomeado.
- [ ] `@@index` só em campos realmente filtrados/ordenados com frequência, sem duplicar `@unique`.
- [ ] `npx prisma db push` + `npm run db:generate` executados nesta ordem, servidor `dev` parado antes do generate (Windows).

## 9. Limitações

Esta Skill não corrige, e não deve corrigir sem sprint dedicada, duas divergências já conhecidas e aceitas no schema atual:

- `ProductCategory` não tem `createdAt`/`updatedAt` — model anterior à formalização dessa regra na Seção 10; retrofit não é obrigatório sem sprint dedicada.
- **Nenhum model do schema usa `@@map("snake_case")` ainda** — item identificado desde a Sprint 2.A.1, deliberadamente adiado ("retrofit requer migração dedicada"). Não é lacuna desta Skill — é dívida técnica já registrada e conscientemente não resolvida.

Não trate os dois itens acima como Inconsistência ao auditar uma sprint que não os toca — são Observação Técnica (consequência de decisão/histórico já registrado), conforme o teste de duas perguntas de `sprint-audit`.

## 10. Anti-patterns

- Relacionamento sem `@relation` nomeado e sem `@@unique` quando a semântica exige unicidade do par (lição histórica real: `UnitConversion` tinha exatamente esse problema — corrigido na Sprint 2.A.1 como IC-02/IC-07).
- `@@index` redundante sobre um campo que já é `@unique` (o `@unique` já cria índice).
- Campo monetário como `Float`.
- Entidade nova sem `createdAt`/`updatedAt`.
- Relacionamento N:N implícito sem ADR aprovada.
- `DELETE` físico em entidade de negócio em vez de soft delete via `active`/`isActive`.
- Usar `slug` como chave estrangeira de relacionamento em vez de `id`.

## 11. Referências cruzadas

- `architecture` item 4 (fluxo de camadas) e `references/layers.md` (seções "Prisma"/"Banco") — resumo geral, não repetido aqui.
- `PROJECT_GOVERNANCE.md` Seção 10 — Convenções para Prisma, fonte de verdade dos campos obrigatórios e nomenclatura.
- [ADR-005](../../../ADR-005.md) — decisão congelada do padrão de `id`.
- `sprint-audit` — teste de duas perguntas usado no item 9 (Limitações) para não tratar divergência histórica como Inconsistência.

**Compatibilidade com Sub-agents:** um subagent futuro dedicado à implementação ou revisão de schema (ex.: um eventual `schema-implementer` ou `database-migrator`) pré-carregaria esta Skill via seu campo `skills:`, recebendo o conteúdo integral já na inicialização. Um subagent de front-end ou de pesquisa somente-leitura (`Explore`/`Plan`) não deveria pré-carregá-la — esses últimos já pulam `CLAUDE.md` por design e não ganham nada de uma Skill de convenção de código que não vão aplicar. Conhecimento fornecido: convenções de campo, nomenclatura, relacionamento e índice para `prisma/schema.prisma`. Artefatos produzidos: nenhum arquivo próprio — o artefato é o `schema.prisma` conforme. Entrada esperada: uma necessidade de criar/alterar um model. Saída: model conforme às seções 4 e 8 acima.

---

Precedência: em caso de conflito entre esta Skill e `PROJECT_GOVERNANCE.md` ou [ADR-005](../../../ADR-005.md), os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 13/07/2026 — Sprint G.5.1 (aprofundamento Schema). v2.0 em 13/07/2026 — Sprint G.5.2: renomeada skill.md→SKILL.md, reestruturada nas 11 seções oficiais, adicionada subseção Compatibilidade com Sub-agents. -->
