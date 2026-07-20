---
name: frontend-pattern
description: Use this skill when creating or reviewing an admin page (src/app/admin/{recurso}/page.tsx) or its HTTP client (src/lib/api/{recurso}Api.ts) in the Doce Menina confeitaria-app project — state shape, loading/skeleton/toast/modal/confirmation patterns, form validation, listing, search, and the checklist before considering a page done. This is a deep-dive on the admin front-end layer specifically; for general layer coupling rules use the architecture skill instead.
---

# Padrão de Front-end Administrativo — Doce Menina (confeitaria-app)

Esta Skill aprofunda especificamente o padrão de página administrativa CRUD (`src/app/admin/{recurso}/page.tsx` + `src/lib/api/{recurso}Api.ts`). Não repete o resumo geral já em `architecture` (acoplamento Front-end → Cliente HTTP, nunca Service/Repository/Prisma diretamente; exceção de Validator client-side; fluxo ponta a ponta) nem o contrato de `responses.ts` já em `coding-standards` — consulte-as para o panorama geral. Fonte de verdade: código real, já implementado de forma idêntica em três módulos — 2.B (Categorias, `admin/categorias/page.tsx`, confirmado em CHANGELOG.md), 2.C (Ocasiões, `admin/ocasioes/page.tsx`) e 2.D (Unidades, `admin/unidades/page.tsx`, Sprint 2.D.5). Exemplos citados vêm de Ocasiões e Unidades, os dois módulos cujo código-fonte completo está disponível nesta sessão.

## 1. Objetivo

Garantir que toda página administrativa CRUD nova siga exatamente os mesmos padrões de estado, loading, toast, modal, confirmação, formulário, listagem e pesquisa já usados nos três módulos existentes — sem reinventar um padrão já resolvido.

## 2. Quando utilizar

- Criando ou revisando um `page.tsx` administrativo CRUD ou seu cliente HTTP (`{recurso}Api.ts`).
- Dúvida sobre estado, loading, toast, modal, confirmação, validação de formulário, listagem ou pesquisa de uma página admin.

## 3. Quando NÃO utilizar

- Regra geral de acoplamento entre camadas (Front-end só chama o cliente HTTP do próprio domínio, nunca Service/Repository/Prisma) → skill `architecture`.
- Contrato de resposta HTTP (`responses.ts`) ou convenção de rota de API → skills `coding-standards`/`api-pattern`.
- Onde um tipo compartilhado deve residir (`types.ts` vs. tipo local) → skill `governance`.

## 4. Responsabilidades

### 4.1 Cliente HTTP (`src/lib/api/{recurso}Api.ts`)

Estrutura padrão, idêntica em `unitApi.ts` e `occasionTagApi.ts`:

```typescript
export class ApiRequestError extends Error {
  constructor(public code: string, message: string, public details?: unknown) { super(message); }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const json = await res.json();
  if (!json.success) throw new ApiRequestError(json.error.code, json.error.message, json.error.details);
  return json.data;
}

export async function list{Recurso}(): Promise<{Recurso}[]> { return request(`/api/admin/{recurso}`); }
export async function create{Recurso}(input): Promise<{Recurso}> { return request(`/api/admin/{recurso}`, { method: "POST", body: JSON.stringify(input) }); }
export async function update{Recurso}(id, input): Promise<{Recurso}> { return request(`/api/admin/{recurso}/${id}`, { method: "PATCH", body: JSON.stringify(input) }); }
export async function activate{Recurso}(id): Promise<{Recurso}> { return request(`/api/admin/{recurso}/${id}/activate`, { method: "PATCH" }); }
export async function deactivate{Recurso}(id): Promise<{Recurso}> { return request(`/api/admin/{recurso}/${id}/deactivate`, { method: "PATCH" }); }
```

Quando o tipo de domínio não existe em `types.ts` (skill `governance`, seção "Tipos compartilhados"), o cliente HTTP declara localmente o tipo de exibição — exemplo real: `unitApi.ts` declara `UnitOfMeasure`/`UnitType` localmente, reaproveitando `UnitOfMeasureInput` de `unitValidator.ts` via `import type`.

### 4.2 Estados

Todo `page.tsx` administrativo usa este conjunto fixo de `useState`:

| Estado | Propósito |
|---|---|
| `{recursos}` | array carregado da API |
| `loading` | fetch inicial em andamento |
| `error` | mensagem de erro do fetch inicial |
| `toast` | `ToastState \| null` |
| `search` | termo de pesquisa |
| `modal` | `ModalMode \| null` (`"create" \| "edit"`) |
| `editing` | item em edição, ou `null` |
| `form` | estado do formulário |
| `formErrors` | `Record<string, string>` |
| `submitting` | submit do formulário em andamento |
| `confirmDeactivate` | item aguardando confirmação, ou `null` |
| `actionLoading` | id da linha em ação (ativar/desativar), ou `null` |

### 4.3 Loading

Dois tipos distintos, nunca confundidos:

- **`loading`** — fetch inicial completo da lista. Renderiza `LoadingState` (skeleton).
- **`actionLoading` / `submitting`** — ação pontual (ativar, desativar, salvar). Renderiza texto `"…"` no botão afetado, ou toast tipo `"loading"`.

`loadX(silent = false)`: quando `silent = true` (recarregar após criar/editar/ativar/desativar), não mexe em `loading`/`error` — evita que a tela inteira "pisque" a cada ação. Erros em modo `silent` viram toast (`"Erro ao atualizar lista de {recursos}."`), nunca substituem a lista já exibida.

### 4.4 Skeleton

Componente `LoadingState` local a cada página: 3 blocos `<div className="shadow-card h-24 animate-pulse rounded-2xl bg-white" />`. Padrão idêntico, letra por letra, em Ocasiões e Unidades.

### 4.5 Toast

`showToast(type, message)`: limpa o timer anterior (`clearTimeout`), seta o `ToastState`, agenda auto-dismiss em 3500ms — **exceto** quando `type === "loading"`, que permanece até a próxima chamada de `showToast` (sucesso/erro subsequente) ou dismiss manual.

Renderizado sempre via `<ValidationSummary toast={toast} onDismiss={() => setToast(null)} />` — componente único e compartilhado (`src/components/admin/config/ValidationSummary.tsx`), **nunca reimplementado por página**. Tipos: `"success" | "error" | "warning" | "loading"`.

### 4.6 Modal

Duas modais distintas por página, sempre as mesmas duas:

- **`{Recurso}Modal`** (criar/editar) — bottom sheet: `fixed inset-0 z-40 flex items-end bg-black/40`, fecha ao clicar fora do conteúdo via `onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}` no overlay.
- **`ConfirmModal`** (confirmação de desativação) — modal centralizada: `fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-5`, sempre com botão "Cancelar" (`border border-sand`) + botão de ação destrutiva (`bg-rose`).

### 4.7 Confirmação

Desativação **sempre** passa por `ConfirmModal` antes de chamar a API — nunca desativa direto ao clicar. Ativação **nunca** precisa de confirmação — chama a API diretamente ao clicar.

**O texto do `ConfirmModal` deve refletir o comportamento real do Service — nunca ser copiado genericamente de outro módulo.** Exemplo real da diferença:

- Ocasiões: *"A ocasião \"{name}\" deixará de aparecer nos filtros da vitrine. Se houver produtos vinculados, a desativação será bloqueada."* — porque `occasionTagService.deactivateOccasion` lança `OccasionHasProductsError` quando há vínculo.
- Unidades: *"A unidade \"{name}\" deixará de aparecer nas opções de cadastro de ingredientes e receitas."* — sem menção a bloqueio, porque `unitService.deactivateUnit` **não** implementa essa checagem (decisão de domínio já registrada como Observação Técnica nas Sprints 2.D.3/2.D.4).

### 4.8 Validation Summary

`src/components/admin/config/ValidationSummary.tsx` é o único componente de toast/feedback de toda a aplicação — nunca reimplementado por página.

`applyServerValidationErrors(details)`: converte o array `ValidationError[]` retornado pela API em erro 400 (`{ field, code, message }`) em `Record<field, message>`, aplicado a `formErrors` para exibição inline no formulário. Retorna `false` se `details` não for um array não vazio, permitindo o caller cair no fallback de toast genérico.

### 4.9 Formulário

- `validateForm()` é uma função **local da página**, que espelha as mesmas regras do Validator do backend — duplicação deliberada e aceita (o Validator do domínio pode não estar em `types.ts`, ver skill `governance`, seção "Tipos compartilhados", então não há um único ponto de verdade importável pelo client).
- Em caso de erro 400 do servidor, `applyServerValidationErrors` **sobrescreve** os erros locais com os oficiais do backend — o backend é sempre a fonte de verdade final.
- Campos somente-leitura (ex.: `isActive`/Status) **nunca** são enviados no payload do PATCH — são alterados exclusivamente pelos endpoints dedicados `activate`/`deactivate`. Exibidos no modal de edição como badge + texto explicativo, nunca como input editável.

### 4.10 Listagem

Lista ordenada no client após o fetch — `[...rows].sort((a, b) => a.sortOrder - b.sortOrder)` — mesmo que a API já retorne ordenado (defensivo). Renderizada via componente de card específico do domínio (`{Recurso}Card`), nunca inline no JSX da página.

### 4.11 Pesquisa

`useMemo` filtrando por `name` (case-insensitive: `.trim().toLowerCase()` no termo, `.toLowerCase().includes(term)` no item), sempre client-side sobre a lista já carregada — **nunca** um novo fetch por caractere digitado.

`EmptyState` recebe `hasFilter: boolean` e muda a mensagem: pesquisa sem resultado ("Ajuste a pesquisa ou limpe o filtro...") vs. lista genuinamente vazia ("Crie o primeiro..."). O CTA de criação some quando há filtro ativo.

## 5. Fluxo resumido

Construindo uma página admin nova: (1) cliente HTTP (4.1); (2) estados (4.2); (3) loading + skeleton (4.3–4.4); (4) toast (4.5); (5) modal de criar/editar + `ConfirmModal` (4.6–4.7); (6) `ValidationSummary` + formulário (4.8–4.9); (7) listagem + pesquisa (4.10–4.11); (8) antes de considerar pronta, carregar `checklists/checklist.md`.

## 6. Arquivos auxiliares disponíveis

| Arquivo | Conteúdo |
|---|---|
| `checklists/checklist.md` | Checklist de 12 itens antes de considerar uma página admin pronta |

## 7. Como carregar os arquivos auxiliares

- **Finalizando uma página admin:** carregar `checklists/checklist.md` antes de declarar a tarefa concluída.
- **Construindo/revisando uma página do zero:** a Seção 4 deste `SKILL.md` já cobre os 11 padrões — não é necessário carregar o checklist até o final.

## 8. Critérios de sucesso

Uma página admin nova é indistinguível, a olho nu, das já existentes (Categorias, Ocasiões, Unidades) em estado, loading, toast, modal, confirmação, formulário, listagem e pesquisa — sem nenhum item do checklist (item 6) pendente.

## 9. Limitações

Não cobre acoplamento geral entre camadas (skill `architecture`), contrato de resposta HTTP ou convenção de rota de API (skills `coding-standards`/`api-pattern`), nem onde um tipo compartilhado deve residir (skill `governance`). Cobre apenas o padrão de página CRUD admin em si.

## 10. Anti-patterns

Extraídos da Seção 4 — reformulados aqui como lista de "nunca fazer":

- Reimplementar `ValidationSummary` por página em vez de usar o componente compartilhado (4.8).
- Enviar campos somente-leitura (ex.: `isActive`/Status) no payload do PATCH — devem ser alterados só pelos endpoints `activate`/`deactivate` (4.9).
- Copiar o texto do `ConfirmModal` genericamente de outro módulo em vez de refletir o comportamento real do Service daquele domínio (4.7).
- Disparar um novo fetch a cada caractere digitado na pesquisa, em vez de filtrar client-side sobre a lista já carregada (4.11).
- Confundir `loading` (fetch inicial) com `actionLoading`/`submitting` (ação pontual) — usar `loadX(silent=true)` para recarregar sem piscar a tela inteira (4.3).
- Chamar Service, Repository ou Prisma diretamente do `page.tsx` — sempre passar pelo cliente HTTP do próprio domínio (4.1).
- Permitir desativação sem `ConfirmModal`, ou exigir confirmação para ativação (4.7 — a assimetria é intencional).

## 11. Referências cruzadas

Skill `architecture` (acoplamento Front-end → Cliente HTTP, fluxo ponta a ponta); skill `coding-standards` (contrato de `responses.ts`); skill `api-pattern` (convenção de rota de API); skill `governance` (onde um tipo compartilhado deve residir).

### Compatibilidade com Sub-agents

Nenhum Sub-agent foi criado neste projeto ainda (previsto para a Sprint G.5.3). Quando existirem:

- **Deveriam pré-carregar esta Skill** (via `skills:` no frontmatter do subagent): um futuro subagent `frontend-implementer` dedicado a páginas admin CRUD — precisa dos 11 padrões (estado, loading, toast, modal, confirmação, formulário, listagem, pesquisa) sempre em contexto.
- **Não deveriam pré-carregá-la**: um futuro `backend-implementer`/`api-developer` (usa `api-pattern`/`repository-pattern`/`schema-pattern`, não front-end); `Explore`/`Plan` (agentes somente-leitura embutidos, já pulam CLAUDE.md por design).
- **Conhecimento fornecido:** estrutura de estado, ciclo de loading/toast/modal/confirmação, padrão de formulário e listagem/pesquisa de uma página admin CRUD.
- **Artefatos produzidos:** nenhum arquivo — conhecimento aplicado ao `page.tsx`/`{recurso}Api.ts` que o agente escreve ou revisa.
- **Entradas esperadas:** uma página admin CRUD ou cliente HTTP sendo criado ou revisado.
- **Saídas entregues:** confirmação de conformidade com os 11 padrões, ou lista de desvios encontrados (checklist auxiliar).

---

Precedência: em caso de conflito entre esta Skill e `PROJECT_GOVERNANCE.md`, o documento original sempre prevalece.

<!-- Histórico: v1.0 criada em 13/07/2026 — Sprint G.5.0. v1.1 em 13/07/2026 — Sprint G.5.1: adicionada seção "12. Anti-patterns", renumerado checklist. v2.0 em 13/07/2026 — Sprint G.5.2: renomeada skill.md→SKILL.md, corpo reestruturado nas 11 seções oficiais (conteúdo 4.1–4.11), checklist extraído para checklists/checklist.md, adicionada Compatibilidade com Sub-agents. -->
