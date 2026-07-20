# MODULE_2E_CLOSURE.md — Encerramento do Módulo 2.E (Fornecedores)

Documento de encerramento produzido na Sprint 2.E.7 (UX/UI Implementation & Shared Components), cobrindo todo o ciclo do módulo: Schema (2.E.1) → Repository + Validator (2.E.2) → Service (2.E.3) → API (2.E.4) → Frontend Inicial (2.E.5) → UX/UI Foundation (2.E.6) → UX/UI Implementation (2.E.7, este documento).

---

## 1. Escopo implementado

**Completo e homologado:** CRUD de `Supplier` (nome, CNPJ opcional/único, telefone, prazo de entrega, observações, ativação/desativação — sem exclusão física) com Frontend redesenhado: container `max-w-5xl`, grid responsivo (1/2/3 colunas), faixa de estatísticas (Total/Ativos/Inativos), formulário agrupado em seções (Identificação/Contato/Operação/Observações), 12 componentes promovidos para `src/components/admin/shared/` — primeiro conjunto de componentes compartilhados de Cadastro Mestre do ERP.

## 2. Arquitetura

```
Route Handler (src/app/api/admin/suppliers/**)
        ↓ chama
Service (src/lib/supplierService.ts)
        ↓ chama
Repository (src/lib/repositories/supplierRepository.ts)
        ↓ chama
Prisma (singleton src/lib/prisma.ts)

Frontend (src/app/admin/fornecedores/page.tsx)
        ↓ consome
src/lib/api/supplierApi.ts (cliente HTTP)
        ↓ compõe
src/components/admin/shared/* (12 componentes) + FormPrimitives.{Field,Section}
```

- **Route Handlers:** `requireAdmin()` → parse do body → Service → mapeamento de erro via `responses.ts` (`badRequest` 400, `conflict` 409, `notFound` 404, `internalError` 500 — **não** 422, correção de escopo registrada na Sprint 2.E.4).
- **Service (`supplierService.ts`):** normalização (CNPJ/telefone sem máscara) → Validator → `validateBusinessRules` (duplicidade de CNPJ, único ponto de checagem no banco) → Repository → mapeamento DTO.
- **Repository (`supplierRepository.ts`):** só Prisma Client tipado, sem `$queryRaw`/`$executeRaw`.
- **Validator (`supplierValidator.ts`):** só formato/sintaxe — nome, CNPJ (14 dígitos), telefone (10-11 dígitos), `leadTimeDays` (inteiro ≥ 0), `notes` (≤ 500 caracteres). Duplicidade de CNPJ **não** verificada aqui (é do Service).
- **Front-end:** consome exclusivamente `supplierApi.ts`. Nenhuma chamada direta a Service/Repository/Prisma.

## 3. Entidades

| Entidade | Campos principais | Relacionamentos |
|---|---|---|
| `Supplier` | name, phone?, cnpj? (único), leadTimeDays?, notes?, active | Nenhum — entidade isolada nesta fase (decisão da Sprint 2.E.1); `Ingredient`/`Packaging` não referenciam `Supplier` ainda |

## 4. APIs

| Método | Rota | Autenticação |
|---|---|---|
| `GET`/`POST` | `/api/admin/suppliers` | Admin |
| `GET`/`PATCH` | `/api/admin/suppliers/[id]` | Admin |
| `PATCH` | `/api/admin/suppliers/[id]/activate` | Admin |
| `PATCH` | `/api/admin/suppliers/[id]/deactivate` | Admin |

Sem rota `DELETE` — mesmo padrão de `Units` (sem exclusão física).

## 5. Funcionalidades validadas (evidência real, ambiente sincronizado)

**Backend (Sprints 2.E.1–2.E.4):** 15 casos reais contra o Supabase real via script (Service) + 9 casos via HTTP autenticado (Playwright) — criação, duplicidade de CNPJ (409), validação (400), não encontrado (404), atualização mantendo o mesmo CNPJ sem falso conflito, ativação/desativação, listagem paginada, e um erro inesperado real (overflow de `integer` do Postgres) confirmado retornando 500 genérico sem vazar detalhe interno.

**Frontend redesenhado (Sprint 2.E.7), validado via Playwright, servidor de desenvolvimento limpo, banco real:**
- Uso de largura em desktop (1440px): **33% → 71%** (mesmo nível do módulo Config), medido via `getBoundingClientRect()`
- Grid responsivo confirmado nas 3 larguras: 1 coluna (390px), 2 colunas (820px), 3 colunas (1440px)
- Modal `EntityForm`: bottom-sheet em mobile, centralizado em desktop — confirmado visualmente nas 2 larguras
- Foco automático no primeiro campo ao abrir modal — confirmado (`document.activeElement.id === "supplier-name"`)
- Trap de foco: `Tab` no último elemento (“Criar”) volta ao primeiro (“✕”) — confirmado
- `Escape` fecha o modal — confirmado
- CRUD completo: criação, edição (com persistência confirmada), ativação, desativação (com `ConfirmDialog` "Manter ativo"/"Desativar", conforme `UX_GUIDELINES.md` Seção 6), pesquisa server-side, faixa de estatísticas atualizando em tempo real após cada ação
- Console: 0 erros JavaScript em toda a sessão de teste
- Rede: 100% das chamadas com status 200/201 (nenhum 4xx/5xx inesperado)

## 6. Integrações

Nenhuma — `Supplier` permanece isolado (decisão da Sprint 2.E.1, preservada nas Sprints 2.E.6/2.E.7). `Ingredient.supplier` (texto livre) não foi migrado para FK.

## 7. Pendências conhecidas

**Nenhuma pendência bloqueante.** O módulo está funcionalmente completo para o escopo aprovado.

## 8. Limitações conhecidas / Backlog Técnico

- **TD-18** (Sprint 2.E.4): `leadTimeDays` sem limite superior no Validator — valor absurdo gera 500 (overflow de `integer`) em vez de 400.
- **TD-19** (proposto na Sprint 2.E.6): aplicar `max-w-5xl` + grid responsivo aos outros 4 módulos de Cadastro Mestre (Unidades, Ingredientes, Receitas, Produtos) — mesmo desvio diagnosticado, não corrigido fora de Fornecedores.
- **TD-20** (proposto na Sprint 2.E.6): decidir e padronizar a confirmação de desativação em Ingredientes/Receitas (hoje ausente, diferente de Unidades/Produtos/Fornecedores).
- Sem relacionamento com `Ingredient`/`Packaging` — migração fica para uma Sprint dedicada e autorizada separadamente (decisão da Sprint 2.E.1, preservada).
- Skeleton de carregamento ainda genérico (`animate-pulse` simples), não fiel ao layout do `EntityCard` real — Melhoria Futura.
- Componentes `shared/` criados mas ainda adotados por um único módulo (Fornecedores) — ganho pleno de manutenção única só se concretiza quando os outros 4 módulos migrarem (fora do escopo desta sprint).

## 9. Lições aprendidas

- **Auditoria de componentes antes de desenhar UI revelou duplicação real e mensurável** (6 componentes idênticos em 5 arquivos, ~250 linhas) — validando a exigência da Ordem de Missão de auditar antes de criar.
- **Medir com Playwright antes de propor solução** (33% vs 71% de uso de largura, `getBoundingClientRect` real) transformou uma queixa subjetiva ("qualidade visual insatisfatória", Sprint 2.J.2.1) em um diagnóstico objetivo e acionável.
- **Não seguir moda arquitetural sem necessidade comprovada**: rejeitar Tabela (documentada mas nunca implementada) em favor de Cards em grid foi a decisão certa para o volume atual — reavaliar apenas se o volume real justificar.
- **Focus trap e fechamento por Escape não existiam em nenhum modal do projeto antes desta sprint**, apesar de já documentados em `DESIGN_SYSTEM.md` desde a Sprint P2 — implementá-los no `EntityForm`/`ConfirmDialog` compartilhados resolve a lacuna de uma vez para quem adotar os componentes, em vez de corrigir módulo por módulo.

## 10. Padrões reutilizáveis para os próximos módulos (Compras/2.H Embalagens e demais)

- `PageContainer` + `ResponsiveGrid` + `EntityCard` + `EntityForm` + `ConfirmDialog` já cobrem o fluxo completo de CRUD com listagem em grid — qualquer módulo novo de Cadastro Mestre pode nascer direto sobre `src/components/admin/shared/`, sem duplicar `Field`/`StatusBadge`/`LoadingState`/`EmptyState`/`ErrorState`/`FilterChips`.
- Padrão de estatísticas (`StatCard` + 2 chamadas leves de contagem) é reaproveitável sem exigir mudança de API, desde que o Repository já suporte paginação com filtro `active`.
- Migração de um módulo já existente (Unidades/Ingredientes/Receitas/Produtos) para os componentes compartilhados é candidata a uma sprint de manutenção futura (TD-19), não deste módulo.

---

Precedência: em caso de conflito entre este documento e `PLAN.md`, `CHANGELOG.md`, `DESIGN_SYSTEM.md`, `UX_GUIDELINES.md` ou `MODULE_2E_UX_REVIEW.md`, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 18/07/2026 — Sprint 2.E.7 (UX/UI Implementation & Shared Components), encerramento do Módulo 2.E após Schema/Repository/Validator/Service/API/Frontend/UX Foundation/UX Implementation concluídos (Sprints 2.E.1–2.E.7). -->
