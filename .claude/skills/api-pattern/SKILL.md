---
name: api-pattern
description: Use this skill when writing or reviewing a file in src/app/api/**/route.ts in the Doce Menina confeitaria-app project — requireAdmin() placement, which responses.ts helper to use for each situation, how to map Service domain errors to HTTP status/code, and the checklist before considering a route done. This is a deep-dive on the Route Handler / API layer specifically; for general layer responsibilities and coupling rules use the architecture skill, and for naming/response-format conventions use coding-standards.
---

# Padrão de API (Route Handler) — Doce Menina (confeitaria-app)

Esta Skill aprofunda especificamente a camada **Route Handler / API**. Não repete o resumo geral já em `architecture` (Route Handler, acoplamento entre camadas, fluxo ponta a ponta) nem o contrato de nomenclatura/formato já em `coding-standards` (seção Responses) — consulte-as para o panorama geral. Fonte de verdade: `PROJECT_GOVERNANCE.md` Seção 8.1 e Seção 11. Exemplos citados vêm das rotas reais dos três módulos implementados: Categorias (`admin/categories/*`), Ocasiões (`admin/occasions/*`), Unidades (`admin/units/*`).

## 1. Objetivo

Garantir que toda rota API siga a mesma estrutura Route Handler → Service, com `requireAdmin()` posicionado corretamente, erros de domínio mapeados para o helper HTTP certo, e nenhuma lógica de negócio vazando para a rota.

## 2. Quando utilizar

- Escrever ou revisar qualquer `route.ts` em `src/app/api/`.
- Decidir qual helper de `responses.ts` usar para uma situação específica.
- Mapear um erro de domínio lançado pelo Service para status/código HTTP.

## 3. Quando NÃO utilizar

- Regras gerais de responsabilidade de camada e acoplamento entre Route/Service/Repository → `architecture`.
- Contrato de nomenclatura e formato de resposta (`{ success, data }`) → `coding-standards` (seção Responses).
- Lógica de negócio, validação de domínio ou acesso a dados em si → são escopo do Service/Validator/Repository, não desta Skill.

## 4. Responsabilidades

### Route Handler — estrutura padrão

```typescript
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const result = await xService.createX(body as XInput);
    return created(result);
  } catch (err) {
    if (err instanceof ValidationFailedError) return badRequest(err.errors);
    // ...demais instanceof, do mais específico ao mais genérico
    return internalError();
  }
}
```

GET + POST podem coexistir no mesmo arquivo `route.ts` (exemplo real: `admin/units/route.ts`). Rotas com `[id]` recebem `{ params }: { params: Promise<{ id: string }> }` — no Next.js 16, `params` é uma `Promise`; sempre `const { id } = await params;` antes de usar (exemplo real: `admin/units/[id]/route.ts`, `admin/units/[id]/activate/route.ts`).

### `requireAdmin()`

Sempre a **primeira instrução** de toda rota administrativa, antes de qualquer parse ou lógica:

```typescript
const denied = await requireAdmin();
if (denied) return denied;
```

Fonte real: `src/lib/auth/requireAdmin.ts` — retorna `NextResponse | null`: `unauthorized()` (401) se não há sessão ou `userType !== "admin"`; `forbidden()` (403) se `role !== "ADMIN"`; `null` se autorizado.

Rotas **públicas** (`GET /api/units`, `/api/occasions`, `/api/categories` — sem `/admin/` no caminho) **nunca** chamam `requireAdmin()`.

### `responses.ts` — qual helper usar

| Situação | Helper | Status |
|---|---|---|
| Leitura ou update com sucesso | `ok(data)` | 200 |
| Criação com sucesso | `created(data)` | 201 |
| Erro de validação (`ValidationFailedError`) | `badRequest(err.errors)` | 400 |
| JSON malformado no body | `invalidBody()` | 400 |
| Sem sessão | `unauthorized()` | 401 |
| Papel insuficiente | `forbidden()` | 403 |
| Recurso não encontrado (`NotFoundError`) | `notFound("mensagem")` | 404 |
| Conflito de domínio (duplicidade, vínculo bloqueante) | `conflict("CODIGO", mensagem, details?)` | 409 |
| Qualquer outro erro | `internalError()` | 500 |

Contrato completo do formato de resposta: `coding-standards` (seção Responses). **Nunca `NextResponse.json()` direto** em rota nova — rotas legadas pré-2.B (`products/route.ts`, `orders/route.ts`) ainda fazem isso; não é o padrão a seguir.

### Service

A rota importa **apenas** funções do `{recurso}Service.ts` e suas classes de erro exportadas. Nunca importa Repository. Nunca chama função de Validator — a única exceção documentada é `import type` de um tipo declarado no Validator quando esse tipo não existir em `types.ts` (precedente real: `admin/units/route.ts` e `admin/units/[id]/route.ts` fazem `import type { UnitOfMeasureInput } from "@/lib/validators/unitValidator"` — apenas tipo, zero chamada de função). Uma rota chama no máximo um Service, a menos que a operação genuinamente precise orquestrar dois domínios (nenhum caso assim existe ainda no projeto).

### Mapeamento HTTP (erro de domínio → status → código)

| Erro do Service | Status | Helper / código |
|---|---|---|
| `ValidationFailedError` | 400 | `badRequest(err.errors)` → `VALIDATION_ERROR` |
| Body JSON inválido | 400 | `invalidBody()` → `INVALID_BODY` |
| Sem sessão | 401 | `unauthorized()` → `UNAUTHORIZED` (via `requireAdmin()`) |
| Papel insuficiente | 403 | `forbidden()` → `FORBIDDEN` (via `requireAdmin()`) |
| `NotFoundError` | 404 | `notFound(msg)` → `NOT_FOUND` |
| Conflito de domínio — exemplos reais: `DuplicateNameError`/`DuplicateAbbreviationError` (Unidades), `SlugConflictError`/`NameConflictError` (Categorias), `SlugConflictError`/`OccasionHasProductsError` (Ocasiões), `CategoryHasProductsError` (Categorias) | 409 | `conflict("CODIGO_ESPECIFICO", msg, details?)` |
| Qualquer outro erro | 500 | `internalError()` |

### Erros

Cada `catch` testa `instanceof` para cada classe de erro específica do Service, do mais específico ao mais genérico, terminando sempre em `internalError()` como fallback incondicional. Nunca deixar um erro não tratado propagar sem resposta — o último `catch` genérico nunca repassa a mensagem real do erro (nem stack trace) ao cliente.

### Auth

`requireAdmin()` é chamado **uma única vez** por handler, antes de qualquer parse de body ou lógica. Toda rota sob `/api/admin/*` é protegida; toda rota pública (`/api/{recurso}` sem `/admin/`) nunca chama `requireAdmin()`.

### Validação

A rota **nunca valida campos de domínio** — isso é exclusivo do Validator, chamado internamente pelo Service. A rota só faz parse estrutural do JSON:

```typescript
let body: unknown;
try {
  body = await request.json();
} catch {
  return invalidBody();
}
```

e repassa `body` (tipado via cast, ex. `body as UnitOfMeasureInput`) diretamente ao Service.

## 5. Fluxo resumido

`requireAdmin()` (se administrativa) → parse de body em `try/catch` próprio → chamada ao Service em `try/catch` separado, mapeando `instanceof` do mais específico ao mais genérico → helper de `responses.ts`. Fluxo ponta a ponta completo entre camadas: `architecture`.

## 6. Arquivos auxiliares disponíveis

Nenhum. O conteúdo desta Skill (tabelas de mapeamento HTTP e checklist) é conciso o bastante para viver inteiramente no `SKILL.md` — não há material extenso o suficiente para justificar mover para `references/`/`examples/`.

## 7. Como carregar os arquivos auxiliares

Não aplicável — nenhum arquivo auxiliar.

## 8. Critérios de sucesso

Uma rota está pronta quando:

- [ ] `requireAdmin()` é a primeira instrução (se rota administrativa).
- [ ] Parse de body em `try/catch` próprio, retornando `invalidBody()`.
- [ ] Chamada ao Service em `try/catch` separado.
- [ ] Todos os erros de domínio do Service mapeados via `instanceof`.
- [ ] `internalError()` como fallback final incondicional.
- [ ] Nenhum `NextResponse.json()` direto.
- [ ] Nenhuma lógica de negócio na rota.
- [ ] Nenhum acesso a Prisma, Repository, ou chamada de função de Validator na rota.

Fonte: `PROJECT_GOVERNANCE.md` Seção 7.

## 9. Limitações

Esta Skill não cobre: lógica de negócio ou orquestração de domínio (Service), validação de campos (Validator), acesso a dados (Repository — `repository-pattern`), nem convenção de nomenclatura/formato de resposta (`coding-standards`). Cobre exclusivamente a forma do Route Handler em si.

## 10. Anti-patterns

- Lógica de negócio na rota.
- Acesso direto ao Prisma.
- Chamar Repository diretamente.
- Chamar função de Validator diretamente (validação deve vir do Service).
- `NextResponse.json()` direto em vez de `responses.ts`.
- Esquecer `requireAdmin()` em rota administrativa.
- Deixar algum erro específico do Service cair no `catch` genérico em vez de mapeá-lo para o status/código correto.
- Retornar stack trace ou mensagem de erro interna do Prisma diretamente ao cliente.

## 11. Referências cruzadas

`architecture` (responsabilidades de camada, acoplamento, fluxo ponta a ponta) · `coding-standards` (nomenclatura e formato de `responses.ts`) · `repository-pattern` (camada abaixo do Service) · `PROJECT_GOVERNANCE.md` Seção 8.1 e Seção 11.

### Compatibilidade com Sub-agents

Nenhum Sub-agent foi criado neste projeto ainda (previsto para a Sprint G.5.3).

- **Deveria pré-carregar esta Skill:** um futuro subagent de implementação de backend (ex.: `api-implementer`) que escreve ou revisa `route.ts` — precisa da tabela de mapeamento HTTP e do checklist sempre em contexto.
- **Não deveria pré-carregá-la:** subagents de front-end (`frontend-pattern` é a Skill relevante para eles), subagents somente-leitura como `Explore`/`Plan`, e qualquer subagent focado em Schema/Repository sem tocar a camada de rota.
- **Conhecimento fornecido:** estrutura padrão de Route Handler, posicionamento de `requireAdmin()`, mapeamento erro de domínio → status/código HTTP.
- **Artefatos produzidos:** nenhum arquivo — orientação aplicada ao escrever/revisar `route.ts`.
- **Entradas esperadas:** um `route.ts` novo ou existente a validar contra o checklist.
- **Saídas entregues:** confirmação de conformidade ou lista de desvios (item 10, Anti-patterns).

---

Precedência: em caso de conflito entre esta Skill e `PROJECT_GOVERNANCE.md`, o documento original sempre prevalece.

<!-- Histórico: v1.0 criada em sprint original de criação das 14 Skills. v2.0 em 13/07/2026 — Sprint G.5.2: renomeada skill.md→SKILL.md, corpo reestruturado nas 11 seções oficiais, adicionada seção "Compatibilidade com Sub-agents". -->
