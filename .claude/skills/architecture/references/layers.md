# layers.md — Contrato completo de cada camada

Parte da Skill `architecture`. Detalhe por camada, DTO/tipos, mapper, acoplamento permitido (com exceções documentadas) e fluxo de chamadas ponta a ponta. Carregar ao escrever ou revisar uma camada específica — para uma dúvida rápida de responsabilidade geral, a tabela e o diagrama já em `SKILL.md` costumam bastar.

## Route Handler (`src/app/api/{recurso}/route.ts`)

**Responsabilidades:** parse do body (`try/catch` → `invalidBody()` em JSON inválido); verificar auth via `requireAdmin()` como primeira instrução em rotas administrativas; chamar o Service; mapear resultado/erro para status HTTP.

**Proibições:** sem lógica de negócio; sem acesso direto ao Prisma; sem validação de campos de domínio.

**Padrão real de resposta** — `src/lib/http/responses.ts`: `ok`, `created`, `badRequest`, `invalidBody`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `internalError` — todos retornam `NextResponse`. **Nunca usar `NextResponse.json()` diretamente** em rota nova (rotas legadas pré-2.B como `products/route.ts`/`orders/route.ts` ainda fazem isso — não é o padrão a seguir).

Padrão real de auth: `const denied = await requireAdmin(); if (denied) return denied;` (`src/lib/auth/requireAdmin.ts`), sempre antes de qualquer outra lógica na rota.

Fonte: `PROJECT_GOVERNANCE.md` Seção 8.1.

## Service (`src/lib/{recurso}Service.ts`)

**Responsabilidades:** chamar o Validator e relançar `ValidationFailedError` se inválido; orquestrar uma ou mais chamadas ao Repository; mapear tipos Prisma → TypeScript (`Decimal → number`, datas → string ISO).

**Proibições:** sem acesso direto ao Prisma (usar Repository); sem lógica HTTP (sem `Response`, sem `status`).

**Padrão real de erros de domínio:** cada Service declara suas próprias classes de erro localmente (não compartilhadas entre domínios) — `NotFoundError`, `ValidationFailedError` sempre presentes, mais erros específicos do domínio. Exemplo real, `unitService.ts`: `NotFoundError`, `ValidationFailedError`, `DuplicateNameError`, `DuplicateAbbreviationError`.

Fonte: `PROJECT_GOVERNANCE.md` Seção 8.2.

## Repository (`src/lib/repositories/{recurso}Repository.ts`)

Único arquivo (além de `src/lib/prisma.ts`) que importa `prisma`. Queries Prisma puras, tipadas com tipos do Prisma Client.

**Proibições:** sem lógica de negócio; sem autenticação; sem mapeamento de tipos de domínio (isso é papel do Service).

Fonte: `PROJECT_GOVERNANCE.md` Seção 8.4.

## Validator (`src/lib/validators/{recurso}Validator.ts`)

Função pura: `entrada tipada → ValidationError[]`. Zero dependências externas — sem Prisma, sem `fetch`, sem Next.js. Reutilizável tanto pelo Service (servidor) quanto por páginas client-side antes do `fetch` (exemplo real: `src/app/admin/config/page.tsx` importa `validateStoreConfig`).

Fonte: `PROJECT_GOVERNANCE.md` Seção 8.3.

## Prisma

- Nunca instanciar `new PrismaClient()` fora de `src/lib/prisma.ts`.
- Nunca importar `prisma` em Route Handlers ou Services (usar Repository).
- Campos monetários: `Decimal` — nunca `Float`.
- Datas: `DateTime` no schema → `string ISO` no tipo TypeScript de resposta.

Fonte: `PROJECT_GOVERNANCE.md` Seção 8.6.

## Banco (resumo de convenções de schema Prisma)

Resumo apenas — detalhe completo é da Skill `schema-pattern`, não repetido aqui:

- `id String @id @default(cuid())` — obrigatório, imutável ([ADR-005](../../../../ADR-005.md)).
- `createdAt`/`updatedAt` — obrigatórios em toda entidade.
- `active`/`isActive Boolean @default(true)` — toda entidade que pode ser desativada.
- `@@map("snake_case")` — nome da tabela em snake_case.
- Enums: `SCREAMING_SNAKE_CASE`.
- Soft delete via `active: false` — nunca `DELETE` em entidade de negócio.

Fonte: `PROJECT_GOVERNANCE.md` Seção 10.

## DTO e tipos

Regra completa de onde tipos públicos/locais devem residir: ver skill `governance` (seção "tipos compartilhados") — não repetida aqui.

Exemplo real de exceção documentada e válida: `UnitOfMeasureInput` (declarado localmente em `unitValidator.ts`, não em `types.ts`) e `UnitOfMeasureDTO` (declarado localmente e não exportado em `unitService.ts`) — porque `types.ts` estava explicitamente fora do escopo das sprints que implementaram o domínio `UnitOfMeasure`.

## Mapper

Cada Service tem **exatamente um** mapper Prisma → domínio, usado por **todas** as suas funções — nunca mais de um mapper por Service, nunca mapeamento inline duplicado. Exemplos reais: `mapToUnit` (`unitService.ts`), `mapToOccasionTag` (`occasionTagService.ts`), `mapToProductCategory` (`productCategoryService.ts`).

**Aliasing de imports:** quando Repository e Service compartilham nomes de função (comum, pois ambos costumam usar `createX`/`updateX`/`activateX`/`deactivateX`), o Service importa do Repository com prefixo `db` para evitar colisão — ex. `createUnit as dbCreateUnit` (`unitService.ts`), `createOccasion as dbCreateOccasion` (`occasionTagService.ts`).

## Acoplamento permitido

- **Route → Service.** Nunca Repository/Validator (chamada de função)/Prisma diretamente. **Exceção documentada:** `import type` de um tipo declarado em um Validator é permitido quando esse tipo não existir em `types.ts` (precedente real: rotas `admin/units/*` importam `type { UnitOfMeasureInput }` de `unitValidator.ts` — importação apenas de tipo, sem chamar nenhuma função do Validator).
- **Service → Validator + Repository.** Nunca Prisma diretamente.
- **Repository → `prisma`.** Único ponto de acesso ao cliente, além do próprio singleton.
- **Front-end → Cliente HTTP** (`src/lib/api/{recurso}Api.ts`). Nunca Service/Repository/Prisma diretamente. **Exceção documentada:** Validators podem ser importados por páginas client-side para validação antes do `fetch` (`PROJECT_GOVERNANCE.md` Seção 8.3, "Reutilização"; exemplo real: `src/app/admin/config/page.tsx` importa `validateStoreConfig`).

## Fluxo de chamadas (ponta a ponta)

```
Front-end (page.tsx)
  → Cliente HTTP (src/lib/api/{recurso}Api.ts) — fetch()
    → Route Handler — requireAdmin() → parse body
      → Service — valida (Validator) + orquestra (Repository)
        → Validator — retorna ValidationError[] (lança ValidationFailedError se houver)
        → Repository — prisma.{model}.* → PostgreSQL
      ← Service mapeia Prisma → domínio (mapper único) ou lança erro de domínio
    ← Route mapeia erro de domínio → helper de responses.ts → NextResponse
  ← Cliente HTTP lança ApiRequestError se `{ success: false }`
← Front-end exibe toast / erro de campo
```
