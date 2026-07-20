# MODULE_2D_CLOSURE.md — Encerramento do Módulo 2.D (Unidades de Medida)

Documento de encerramento produzido na Sprint 2.D.6 (QA Funcional, Homologação e Encerramento), **atualizado na Sprint 2.D.7** para refletir a conclusão definitiva do domínio completo (`UnitOfMeasure` + `UnitConversion`). Registra o estado final do módulo, o que foi entregue e os padrões que os próximos Cadastros Mestres (2.E–2.L) devem seguir.

---

## 1. Escopo implementado

**Completo e homologado — `UnitOfMeasure`:** nome, abreviação (símbolo), tipo (Massa/Volume/Unidade), ordem de exibição, ativação/desativação. Camadas: Schema (2.D.1) → Repository + Validator (2.D.2) → Service (2.D.3) → API (2.D.4) → Front-end (2.D.5) → filtros de status/tipo + ordenação secundária (Complemento à 2.D.5) → QA (2.D.6).

**Completo — `UnitConversion` (Sprint 2.D.7):** fator de conversão entre duas unidades (ex. 1 kg = 1000 g), com descrição opcional. Camadas: Repository + Validator + Service + API + Front-end, todas implementadas nesta sprint sobre o model já existente no schema desde 2.D.1. Exclusão física (não soft-delete — ver item 6).

**Domínio Unidades (2.D) está, portanto, integralmente concluído — sem pendências conhecidas que bloqueiem 2.G (Ingredientes) ou 2.I (Receitas).**

## 2. Arquitetura

Fluxo de camadas seguido em 100% dos casos, sem exceção, confirmado por leitura de todos os arquivos:

```
Route Handler (src/app/api/admin/units/*)
        ↓ chama
Service (src/lib/unitService.ts)
        ↓ chama
Repository (src/lib/repositories/unitRepository.ts)
        ↓ chama
Prisma (singleton src/lib/prisma.ts)
```

- **Route Handlers:** `requireAdmin()` → parse do body → chamada ao Service → mapeamento de erro para HTTP via `responses.ts` (`ok`/`created`/`badRequest`/`notFound`/`conflict`/`internalError`). Nenhum acesso a Prisma/Repository direto.
- **Service (`unitService.ts`):** trim de `name`/`abbreviation` → `validateUnitCreate`/`validateUnitUpdate` → checagem de unicidade (`findUnitByName`/`findUnitByAbbreviation`) → Repository → mapeamento Prisma→DTO (`mapToUnit`, converte `Date`→ISO string). 4 classes de erro de domínio exportadas (`NotFoundError`, `ValidationFailedError`, `DuplicateNameError`, `DuplicateAbbreviationError`).
- **Repository (`unitRepository.ts`):** único ponto de import de `prisma` para este domínio. Só queries — nenhuma lógica de negócio.
- **Validator (`unitValidator.ts`):** validação pura de formato/obrigatoriedade — não acessa banco, não decide unicidade (isso é o Service, via Repository).
- **Front-end (`unidades/page.tsx`):** consome exclusivamente `unitApi.ts` (cliente HTTP via `fetch`) — nenhum acesso a Service/Repository/Prisma. Validação client-side é só UX (mesmas regras do Validator, duplicadas propositalmente para feedback imediato — nunca a fonte de verdade); a fonte de verdade é sempre a resposta da API.

**Nenhuma regra de negócio duplicada indevidamente** — a validação client-side existe apenas para UX (feedback antes do round-trip); toda decisão real (unicidade de nome/abreviação, formato) é re-validada no Service/Validator e a API é a autoridade final, confirmada pelo tratamento de `VALIDATION_ERROR`/`DUPLICATE_NAME`/`DUPLICATE_ABBREVIATION` no front-end.

**`UnitConversion` (Sprint 2.D.7) segue o mesmo fluxo**, com uma etapa extra no Service: validação de formato → existência de ambas as unidades referenciadas (`findUnitById` do Repository de `UnitOfMeasure`, cross-domain read-only) → unicidade do par origem/destino → Repository → mapeamento (inclui `Decimal.toNumber()` para o fator, primeira vez que um campo `Decimal` é exposto ao front-end neste projeto).

## 3. Componentes

Padrão replicado do Módulo 2.C (Ocasiões), consistente com 2.B (Categorias): `Field`, `StatusBadge`, `LoadingState`, `EmptyState`, `ErrorState`, `UnitCard`, `UnitModal`, `ConfirmModal`, mais `FilterChips` (novo, genérico — reutiliza o padrão visual de `CategoryChips` já existente em `src/components/vitrine/ProductCard.tsx`, primeira vez que esse padrão de pill/chip é replicado para fora da vitrine). Nenhum componente duplicado; nenhum import morto (confirmado por `lint` limpo).

## 4. APIs

| Método | Rota | Autenticação |
|---|---|---|
| `GET` | `/api/admin/units` | Admin |
| `POST` | `/api/admin/units` | Admin |
| `PATCH` | `/api/admin/units/[id]` | Admin |
| `PATCH` | `/api/admin/units/[id]/activate` | Admin |
| `PATCH` | `/api/admin/units/[id]/deactivate` | Admin |
| `GET` | `/api/units` | Pública (retorna só unidades ativas — consumo futuro por Ingredientes/Receitas) |
| `GET` | `/api/admin/units/conversions` | Admin |
| `POST` | `/api/admin/units/conversions` | Admin |
| `PATCH` | `/api/admin/units/conversions/[id]` | Admin |
| `DELETE` | `/api/admin/units/conversions/[id]` | Admin |

## 5. Funcionalidades validadas

Criação, edição, ativação, desativação, listagem, filtros (nome, status, tipo), ordenação (`sortOrder` asc, `name` asc como desempate), mensagens de erro (consumidas exatamente da API, nunca reescritas), estados vazio/carregando/erro, tratamento de erro por código HTTP (400/401/403/404/409/500) — todos confirmados por leitura de código e por `tsc`/`lint`/`build` limpos. **Sem confirmação visual em navegador** (ferramenta indisponível neste ambiente) — ver Observações Técnicas do relatório da sprint.

## 6. Pendências conhecidas

**Nenhuma pendência bloqueante.** `UnitConversion` foi implementado integralmente na Sprint 2.D.7 (Repository/Validator/Service/API/Frontend em `/admin/unidades/conversoes`), fechando a lacuna registrada na Sprint 2.D.6. Decisão registrada: exclusão física (não soft-delete), já que o model não tem campo `isActive` no schema e é dado de referência estático sem entidade que o referencie via FK — ver `CHANGELOG.md` Sprint 2.D.7 para a justificativa completa. `REGRAS_NEGOCIO.md` item 12 ("Lacunas conhecidas") deve ser atualizado por quem gerencia esse documento para remover a menção a `UnitConversion` sem UI — fora do escopo de alteração desta sprint (não listado entre os documentos que a ordem de missão autorizava tocar).

## 7. Lições aprendidas

- **Registrar sprints no CHANGELOG.md no mesmo dia em que `PLAN.md` deveria refletir o novo status** — a divergência encontrada nesta série (PLAN.md dizia "Planejado" enquanto CHANGELOG.md já tinha 5 sprints do módulo concluídas) sugere que os dois documentos podem dessincronizar quando atualizados em momentos diferentes. Nenhuma correção de processo implementada aqui (fora de escopo desta sprint), só o registro do risco.
- **Reutilização de padrão entre módulos de Cadastro Mestre (2.B→2.C→2.D) funcionou bem** — a única adaptação real por módulo foi o formulário (campos específicos do domínio); toda a mecânica de estado (loading/toast/modal/confirmação) foi copiada sem alteração.

## 8. Padrões reutilizáveis para futuros módulos (2.E–2.L)

- Estrutura de página: `Field`, `StatusBadge`, `LoadingState`, `EmptyState`, `ErrorState`, `{Entidade}Card`, `{Entidade}Modal`, `ConfirmModal` — todos como componentes locais no próprio arquivo da página (convenção já registrada em `CLAUDE.md` raiz, item "Helper components locais").
- `FilterChips` (novo nesta sprint) é candidato a componente compartilhado se um 3º módulo precisar do mesmo padrão de filtro por pílulas — hoje ainda vive local a `unidades/page.tsx`; promovê-lo para `src/components/` só quando houver um segundo uso real (evita abstração prematura).
- Todo módulo com campo obrigatório único (`name`, `abbreviation`, etc.) deve implementar checagem de unicidade no Service via Repository (`findXByY`), nunca depender só de `@unique` do Prisma sem tratar o erro com uma mensagem específica.
- Antes de declarar um módulo com dependência conhecida (`Ingredient`→`UnitOfMeasure`+`UnitConversion`) como "sem pendência", confirmar que **todas** as entidades do domínio documentado em `REGRAS_NEGOCIO.md` para aquele módulo têm implementação — não só a entidade principal.

## 12. Revalidação funcional (Sprint I.3, 17/07/2026)

A homologação final foi reexecutada após a recuperação da infraestrutura (Sprint I.2), em ambiente sincronizado e utilizando dados reais. Validado via Playwright contra servidor de desenvolvimento limpo, banco Supabase real: cadastro, edição, ativação/desativação de `UnitOfMeasure`; cadastro e exclusão física de `UnitConversion`; pesquisa; filtros de status e tipo; validação de duplicidade de nome (mensagem "Já existe uma unidade com o nome..."); persistência confirmada por reload. Nenhuma regressão encontrada — ver `CHANGELOG.md`, Sprint I.3, para o relatório completo (inclui um achado de ambiente, não de código: EPERM/500 causado por um processo de dev server órfão de sessão anterior, resolvido reiniciando o servidor, não pelo código do módulo).

---

Precedência: em caso de conflito entre este documento e `PLAN.md`, `CHANGELOG.md` ou `REGRAS_NEGOCIO.md`, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint 2.D.6 (QA Funcional, Homologação e Encerramento do Módulo 2.D). v1.1 em 15/07/2026 — Sprint 2.D.7: UnitConversion implementado em todas as camadas; domínio Unidades declarado integralmente concluído; pendência do item 6 removida. v1.2 em 17/07/2026 — Sprint I.3: revalidação funcional em ambiente sincronizado registrada (item 12). -->
