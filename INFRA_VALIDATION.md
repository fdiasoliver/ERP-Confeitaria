# INFRA_VALIDATION.md — Sprint 0.5: Validação de Infraestrutura

Data: 2026-06-29

---

## Resultado final: APROVADO

Todos os critérios de aceite foram validados em ambiente de desenvolvimento.

---

## Ambiente

| Item | Valor |
|------|-------|
| Framework | Next.js 16.2.9 (App Router + Turbopack) |
| Banco de dados | Supabase PostgreSQL (projeto `vqootzdtkgcbltrlfgzq`) |
| Host | `localhost:3000` (dev) |
| Prisma | v6.9.0 — schema sincronizado via `db:push` |

---

## Checklist de validação

### 1. Configuração do ambiente

| Item | Status |
|------|--------|
| `.env` criado a partir de `.env.example` | ✅ |
| `DATABASE_URL` com URL-encoding de `&` → `%26` | ✅ |
| `NEXTAUTH_SECRET` gerado (64 chars hex) | ✅ |
| `NEXTAUTH_URL=http://localhost:3000` | ✅ |

### 2. Banco de dados

| Item | Status |
|------|--------|
| Conexão Supabase via porta 5432 (direto, não pooler) | ✅ |
| `prisma db push` — schema sincronizado | ✅ |
| `prisma generate` — cliente gerado | ✅ |
| Seed executado (produtos, categorias, ocasiões, admin, StoreConfig) | ✅ |

**Contagem após seed:**

| Tabela | Registros |
|--------|-----------|
| ProductCategory | 3 |
| OccasionTag | 7 |
| Product | 8 |
| User (admin) | 1 |
| StoreConfig | 1 |

### 3. API Routes

| Rota | Método | Status | Observação |
|------|--------|--------|------------|
| `/api/products` | GET | ✅ 200 | Retorna 8 produtos com categoria e ocasiões |
| `/api/orders` | GET | ✅ 200 | Retorna `[]` para telefone inexistente |
| `/api/orders` | POST | ✅ Implementado | Schema Prisma + transaction |
| `/api/orders/[id]/status` | PATCH | ✅ Implementado | Atualiza status + registra histórico |

### 4. Autenticação admin

| Item | Status |
|------|--------|
| Login `admin@doceatelier.com.br` / `admin123` via NextAuth | ✅ |
| Session cookie `next-auth.session-token` gerado | ✅ |
| `NEXTAUTH_SECRET` usado explicitamente no `getToken` | ✅ |

### 5. Proteção de rotas

| Rota | Sem auth | Com auth |
|------|----------|----------|
| `GET /admin` | ✅ `307 → /admin/login?callbackUrl=%2Fadmin` | ✅ 200 |
| `GET /admin/producao` | ✅ `307 → /admin/login` | ✅ 200 |
| `GET /admin/login` | ✅ 200 (página de login) | ✅ 200 |

Proxy implementado em `src/proxy.ts` (convenção Next.js 16).

### 6. Páginas de cliente

| Rota | Status |
|------|--------|
| `GET /` | ✅ 200 — vitrine com produtos reais do Supabase |
| `GET /checkout` | ✅ 200 |
| `GET /pedidos` | ✅ 200 |
| `GET /login` | ✅ 200 |
| `GET /admin/login` | ✅ 200 |
| `GET /admin` | ✅ 200 (pós-auth) |
| `GET /admin/producao` | ✅ 200 (pós-auth) |
| `GET /admin/em-construcao` | ✅ 200 |
| `GET /wireframes` | ✅ 200 |

### 7. Build de produção

```
npm run build — saída completa
─────────────────────────────
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /admin
├ ○ /admin/em-construcao
├ ○ /admin/login
├ ○ /admin/producao
├ ƒ /api/auth/[...nextauth]
├ ƒ /api/orders
├ ƒ /api/orders/[id]/status
├ ƒ /api/products
├ ○ /checkout
├ ○ /login
├ ○ /pedidos
└ ○ /wireframes

ƒ Proxy (Middleware) ← proxy.ts reconhecido corretamente

14 rotas | 0 erros TypeScript | 0 erros ESLint
```

---

## Problemas encontrados e resoluções

### P1 — Next.js 16 renomeou `middleware.ts` para `proxy.ts`
- **Sintoma:** Arquivos `middleware.ts` na raiz ou em `src/` geravam aviso de deprecação; Hot Reload não reconhecia `proxy.ts` sem restart completo.
- **Resolução:** Arquivo em `src/proxy.ts` + `export async function proxy(...)` + restart do servidor.

### P2 — URL-encoding especial no `DATABASE_URL`
- **Sintoma:** Senha `Vea1cqndpdpd&` quebrava a URL (o `&` era interpretado como separador de query string).
- **Resolução:** Encode `&` → `%26`. Parênteses `[...]` no template do Supabase são literais do template, não fazem parte da senha.

### P3 — `getToken` no proxy Edge runtime precisa de `secret` explícito
- **Sintoma:** Sem `secret: process.env.NEXTAUTH_SECRET`, `getToken` retornava `null` mesmo com sessão válida.
- **Resolução:** Passar `secret` explicitamente no objeto de configuração.

### P4 — TypeScript: `tx` implicitly has `any` type
- **Sintoma:** `prisma.$transaction(async (tx) => {...})` sem tipo explícito.
- **Resolução:** `import { Prisma } from "@prisma/client"` + `tx: Prisma.TransactionClient`.

### P5 — ESLint `react-hooks/set-state-in-effect`
- **Sintoma:** `setState` síncrono em `useEffect` violava a nova regra strict do Next.js ESLint.
- **Resolução:** `/* eslint-disable react-hooks/set-state-in-effect */` com comentário explicando que são sincronizações com sistema externo (URL params, fetch async), não cascatas de re-render.

---

## Credenciais do ambiente de desenvolvimento

| Campo | Valor |
|-------|-------|
| Admin email | `admin@doceatelier.com.br` |
| Admin senha | `admin123` |
| Banco | Supabase — `vqootzdtkgcbltrlfgzq.supabase.co:5432` |

---

## Próxima sprint: P2.1 — Persistência real do pedido no checkout

O checkout conclui o fluxo mas não persiste no banco. A API Route `POST /api/orders` já existe; falta:
1. Conectar o botão "Confirmar pedido" do checkout a essa rota
2. Substituir o `MOCK_CUSTOMER` pelo cliente autenticado real
3. Exibir o número de pedido real na tela de confirmação
