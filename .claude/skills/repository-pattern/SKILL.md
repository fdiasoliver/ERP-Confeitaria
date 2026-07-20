---
name: repository-pattern
description: Use this skill when writing or reviewing a file in src/lib/repositories/{recurso}Repository.ts in the Doce Menina confeitaria-app project — what functions a Repository should have, what it must never contain, Prisma query patterns, and the checklist before considering a Repository done. This is a deep-dive on the Repository layer specifically; for general layer responsibilities and coupling rules use the architecture skill instead.
---

# Padrão de Repository — Doce Menina (confeitaria-app)

Esta Skill aprofunda especificamente a camada **Repository**. Não repete o resumo geral já em `architecture` (item 4 — fluxo de camadas — e `references/layers.md` — responsabilidades detalhadas, mapper/aliasing, acoplamento) nem as convenções de nomenclatura já em `coding-standards` — consulte-as para o panorama geral e para as duas divergências de nomenclatura já documentadas (`list` vs `find`, sufixo `Validator` ausente). Fonte de verdade: `PROJECT_GOVERNANCE.md` Seção 8.4 e Seção 7. Exemplos citados vêm dos três repositories reais do projeto: `productCategoryRepository.ts`, `occasionTagRepository.ts`, `unitRepository.ts`.

## 1. Objetivo

Garantir que todo Repository (`src/lib/repositories/{recurso}Repository.ts`) contenha exclusivamente queries Prisma tipadas — sem lógica de negócio, autenticação ou mapeamento de tipos de domínio — seguindo o padrão de nomenclatura e CRUD já observado nos repositories reais do projeto.

## 2. Quando utilizar

Ao escrever ou revisar qualquer arquivo em `src/lib/repositories/{recurso}Repository.ts`.

## 3. Quando NÃO utilizar

- Responsabilidades gerais de camada e regras de acoplamento entre Route/Service/Validator/Repository → `architecture` item 4 e `references/layers.md`.
- Convenções de nomenclatura gerais, incluindo as duas divergências já documentadas (`list` vs. `find`, sufixo `Validator` ausente) → `coding-standards`.
- Modelagem do schema Prisma (campos obrigatórios, relacionamentos, índices) → `schema-pattern`.
- Lógica de negócio, validação de unicidade ou mapeamento de tipos de domínio (`Decimal → number`, `Date → string ISO`) — isso é papel do Service/Validator, não do Repository nem desta Skill.

## 4. Responsabilidades

Repository é a **única camada, além de `src/lib/prisma.ts`**, que importa `prisma`. Contém exclusivamente queries Prisma. Tipagem de entrada/saída sempre com tipos gerados pelo Prisma Client (ex.: `import type { UnitOfMeasure as PrismaUnitOfMeasure } from "@prisma/client"`).

**Funções permitidas** — padrão observado nos 3 repositories reais:

- **Leitura em massa:** `findAllX()` / `findActiveX()` — padrão majoritário (`productCategoryRepository.ts`, `occasionTagRepository.ts`). Variante: `listAllUnits()` / `listActiveUnits()` em `unitRepository.ts` — variante de nomenclatura já documentada em `coding-standards`, não é erro.
- **Leitura unitária:** `findXById(id)`; `findXBySlug(slug)` quando o domínio tem slug (`findCategoryBySlug`, `findOccasionBySlug`); `findXByName(name)` / `findXByAbbreviation(x)` quando o domínio tem campo único adicional em vez de slug — exemplo real: `findUnitByName`/`findUnitByAbbreviation` em `unitRepository.ts` (`UnitOfMeasure` não tem campo `slug`).
- **Escrita:** `createX(data)`, `updateX(id, data)`.
- **Ciclo de vida:** `activateX(id)` / `deactivateX(id)`, sempre via `prisma.model.update({ where: { id }, data: { isActive: true/false } })` — nunca soft-delete por um campo diferente de `isActive`/`active`.
- **Contagem de vínculo** (quando o domínio bloqueia desativação por uso): `countXByY(id)` — exemplo real: `countProductsByCategory`, `countProductsByOccasion`. `unitRepository.ts` **não tem equivalente** — o domínio `UnitOfMeasure` não implementa bloqueio de desativação por uso; Observação Técnica já registrada, não uma lacuna a corrigir.

**Funções proibidas** — nunca deve existir em um Repository:

- Lógica de negócio (validação de unicidade, cálculo, decisão condicional além do `where` da query).
- Verificação de autenticação/sessão.
- Mapeamento de tipos de domínio — isso é papel do Service.
- Geração de slug ou qualquer normalização de dado antes de persistir (`trim`, `toUpperCase`) — isso é papel do Service.
- `$queryRaw`/`$executeRaw` com input do usuário sem parametrização.

**Prisma:** único ponto de import do client: `import { prisma } from "@/lib/prisma"`. Nunca `new PrismaClient()`. Tipos de retorno são sempre o tipo gerado pelo Prisma Client — nunca um DTO de domínio (o Service mapeia depois). Ver `architecture/references/layers.md` (mapper).

**CRUD:** padrão real de `create`/`update` observado nos 3 repositories: recebem um objeto de dados **tipado inline no próprio arquivo** — nunca um tipo importado de `types.ts` nem do Validator. Exemplo real:

```typescript
export async function createUnit(data: {
  name: string;
  abbreviation: string;
  type: UnitType;
  sortOrder?: number;
}): Promise<PrismaUnitOfMeasure> {
  return prisma.unitOfMeasure.create({ data });
}
```

Isso é deliberado: o shape de entrada do Repository é local ao arquivo, desacoplado do `Input` type usado pelo Validator/Service (que pode ter campos adicionais não persistidos diretamente, ou vice-versa).

**Consultas:**

- Ordenação: `orderBy: { sortOrder: "asc" }`.
- Filtro: `where: { isActive: true }`.
- Contagem relacionada quando o Service precisa: `include`/`_count` — exemplo real, `findAllCategoriesWithCount`:

```typescript
export async function findAllCategoriesWithCount(): Promise<(PrismaProductCategory & { _count: { products: number } })[]> {
  return prisma.productCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}
```

## 5. Fluxo resumido

Não aplicável — Skill de conteúdo de referência, não de fluxo processual. Para onde o Repository se encaixa na cadeia de camadas (Route → Service → Validator → Repository), ver `architecture` item 5.

## 6. Arquivos auxiliares disponíveis

Nenhum. Todo o conteúdo cabe no `SKILL.md` — o arquivo tinha 89 linhas antes desta sprint, muito abaixo do limite de 500 recomendado pela documentação oficial, e nada aqui é longo o suficiente para justificar fragmentação.

## 7. Como carregar os arquivos auxiliares

Não aplicável (nenhum arquivo auxiliar nesta Skill).

## 8. Critérios de sucesso

Um Repository está pronto quando:

- [ ] Nenhuma lógica de negócio.
- [ ] Nenhuma autenticação.
- [ ] Único import de `prisma`, além do singleton `src/lib/prisma.ts`.
- [ ] Nenhum `any`.
- [ ] Nenhum `$queryRaw`/`$executeRaw` sem parametrização.
- [ ] Tipos de retorno são sempre tipos do Prisma Client, nunca DTOs de domínio.

Fonte: `PROJECT_GOVERNANCE.md` Seção 7.

## 9. Limitações

Esta Skill não cobre: modelagem de schema (`schema-pattern`), convenções de nomenclatura gerais (`coding-standards`), nem a decisão de quando um Repository deve existir para um recurso novo (`architecture`).

## 10. Anti-patterns

- **Lição histórica (já corrigida, não é problema atual):** Sprint 2.A.1 corrigiu `UnitConversion` por ausência de `@relation` explícito (IC-02) e ausência de `@@unique([fromUnitId, toUnitId])` (IC-07) — relacionamentos sem integridade referencial/unicidade no schema. Verificar sempre que uma FK tem `@relation` nomeado e, quando aplicável, `@@unique` ao desenhar um novo Repository.
- Repository decidindo se uma operação é permitida (ex.: checar se pode desativar) — isso é decisão do Service.
- Repository chamando outro Repository diretamente — comunicação entre domínios deve sempre passar pelo Service.

## 11. Referências cruzadas

`architecture` item 4 e `references/layers.md`, `coding-standards` (nomenclatura, incluindo as divergências `list`/`find` e sufixo `Validator`), `schema-pattern` (modelagem do schema que o Repository consulta), `PROJECT_GOVERNANCE.md` Seção 7 e 8.4.

### Compatibilidade com Sub-agents

Nenhum Sub-agent foi criado neste projeto ainda (previsto para a Sprint G.5.3). Quando existirem:

- **Deveriam pré-carregar esta Skill** (via `skills:` no frontmatter do subagent): um futuro subagent de implementação de backend do ERP (ex.: `backend-implementer`), que escreve ou revisa Repositories/Services/Validators, precisa deste padrão sempre em contexto.
- **Não deveriam pré-carregá-la**: um futuro subagent de front-end (ex.: `frontend-implementer`), que nunca toca em Repository; também não `Explore`/`Plan` (agentes somente-leitura embutidos, cujo uso típico é localizar código, não escrevê-lo segundo um padrão).
- **Conhecimento fornecido:** funções permitidas/proibidas de um Repository, padrão de CRUD e de consultas Prisma, checklist de conclusão.
- **Artefatos produzidos:** nenhum arquivo — apenas orientação aplicada ao Repository que o consumidor da Skill está escrevendo.
- **Entradas esperadas:** um arquivo `{recurso}Repository.ts` sendo criado ou revisado.
- **Saídas entregues:** confirmação de conformidade com os critérios de sucesso (item 8) ou lista de desvios a corrigir.

---

Precedência: em caso de conflito entre esta Skill e `PROJECT_GOVERNANCE.md`, o documento original sempre prevalece.

<!-- Histórico: v1.0 criada nesta sessão (Sprint de criação das 14 Skills). v2.0 em 13/07/2026 — Sprint G.5.2: renomeada skill.md→SKILL.md, corpo reestruturado nas 11 seções oficiais, adicionada seção "Quando NÃO utilizar" e subseção "Compatibilidade com Sub-agents". -->
