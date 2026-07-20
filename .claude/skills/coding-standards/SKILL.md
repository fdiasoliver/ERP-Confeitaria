---
name: coding-standards
description: Use this skill when naming a new file, function, type, variable, or directory in the Doce Menina confeitaria-app project, or when unsure about a naming/organization convention (kebab-case vs PascalCase, import aliases, response/validation function shapes, directory placement). This is about naming and organization, not layer responsibilities (use architecture instead) or documentation governance (use governance instead).
---

# Convenções de Código — Doce Menina (confeitaria-app)

Esta Skill documenta as convenções de **nomenclatura e organização** já em uso real no projeto — não é responsabilidade de camada (`architecture`) nem governança documental (`governance`). Onde uma regra já está coberta por uma dessas duas, esta Skill referencia em vez de repetir. Fonte de verdade: `PROJECT_GOVERNANCE.md` e `CLAUDE.md` (raiz).

## 1. Objetivo

Garantir que todo arquivo, função, tipo, variável ou diretório novo siga a convenção de nomenclatura e organização já em uso no restante do projeto, evitando divergência silenciosa entre módulos.

## 2. Quando utilizar

- Ao nomear um arquivo, função, tipo, variável ou diretório novo.
- Ao escolher entre `kebab-case`/`PascalCase`/`camelCase`/`SCREAMING_SNAKE_CASE` para algo específico.
- Ao decidir onde um arquivo novo deve morar na árvore de `src/`.
- Ao escrever um import interno e ter dúvida sobre o alias correto.

## 3. Quando NÃO utilizar

- Para decidir responsabilidade de camada (o que uma Service vs. Repository vs. Validator deve fazer) — usar `architecture`.
- Para convenções específicas de Schema Prisma — usar `schema-pattern`.
- Para convenções específicas de rota de API — usar `api-pattern`.
- Para convenções específicas de componente/página admin — usar `frontend-pattern`.
- Para questões de governança documental (ADR, DoD, PLAN/CHANGELOG) — usar `governance`.

## 4. Responsabilidades

### 4.1 Nomenclatura de arquivos
- **kebab-case** em `src/lib/` (ex.: `mock-data.ts`, `utils.ts`).
- **PascalCase** em `src/components/` (ex.: `ProductCard.tsx`, `Header.tsx`).

Fonte: `PROJECT_GOVERNANCE.md` Seção 16 (bloco NOMENCLATURA); `CLAUDE.md` (raiz) "Convenções de nomenclatura".

### 4.2 Nomenclatura de camadas por recurso
Padrão: `{recurso}Repository.ts`, `{recurso}Validator.ts`, `{recurso}Service.ts` (ex.: `supplierRepository.ts`, `supplierValidator.ts`). Fonte: `PROJECT_GOVERNANCE.md` Seções 8.3/8.4.

**Duas divergências reais já identificadas e registradas como Observação Técnica (não são correções pendentes):**
- `src/lib/validators/productCategory.ts` não segue o sufixo `Validator` — diverge de `occasionTagValidator.ts`/`unitValidator.ts`.
- `unitRepository.ts` usa o verbo `list` (`listAllUnits`/`listActiveUnits`), enquanto `productCategoryRepository.ts`/`occasionTagRepository.ts` usam `find` (`findAllCategories`/`findActiveOccasions`) para o mesmo tipo de operação.

### 4.3 Organização de diretórios
```
src/app/              páginas (App Router) + src/app/api/ (rotas HTTP)
src/components/{domínio}/  componentes React por domínio (admin/, layout/, vitrine/)
src/lib/
  types.ts             tipos centrais compartilhados
  prisma.ts            singleton do Prisma Client
  repositories/        {recurso}Repository.ts
  validators/          {recurso}Validator.ts
  {recurso}Service.ts  direto em src/lib/, não em subpasta
  api/                 clientes HTTP do front-end ({recurso}Api.ts)
  http/responses.ts    helpers de resposta HTTP
  auth/requireAdmin.ts
src/context/           estado global (Context API)
src/hooks/
```
Fonte: `CLAUDE.md` (raiz) "Estrutura das pastas".

### 4.4 Imports e aliases
Imports internos sempre via alias `@/` (nunca caminho relativo longo tipo `../../../lib/...`). `@/` mapeia para `src/` (ex.: `@/lib/prisma`, `@/components/layout/Header`). Quando Repository e Service compartilham o mesmo nome de função (`createX`, `updateX`, `activateX`, `deactivateX`), o Service importa do Repository com **prefixo `db`**: `import { createUnit as dbCreateUnit } from "@/lib/repositories/unitRepository"` (mesmo padrão em `occasionTagService.ts`). Justificativa arquitetural desse aliasing: skill `architecture` — aqui é só a convenção de nome.

### 4.5 Tipagem
- `type` para union types e enums; `interface` para objetos com forma definida. Fonte: `CLAUDE.md` (raiz) "TypeScript".
- Nunca `any` explícito. Fonte: `PROJECT_GOVERNANCE.md` Seção 7.
- Tipo de **input** de formulário sempre distinto do tipo de **entidade**: `SupplierInput` vs `Supplier`; `UnitOfMeasureInput` vs o DTO retornado pelo Service (`UnitOfMeasureDTO`). Fonte: Seção 16. Onde tipos públicos/locais devem residir: skill `governance`.

### 4.6 Responses HTTP
Contrato fixo — sucesso `{ success: true, data }`, erro `{ success: false, error: { code, message, details? } }` — sempre via helpers de `src/lib/http/responses.ts` (`ok`, `created`, `badRequest`, `invalidBody`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `internalError`), nunca `NextResponse.json()` direto em rota nova. Fonte: `PROJECT_GOVERNANCE.md` Seção 11 e Seção 8.1. Responsabilidade de camada: skill `api-pattern`.

### 4.7 Validações
Assinatura obrigatória:
```typescript
validate{Recurso}Create(input: {Recurso}Input): ValidationError[]
validate{Recurso}Update(input: Partial<{Recurso}Input>): ValidationError[]
```
Retorno sempre `ValidationError[]`, shape `{ field: string; code: string; message: string }`. Função pura, sem efeitos colaterais. `.trim()` usado apenas para checagem de vazio/comprimento — nunca para normalizar ou retornar valor mutado. Fonte: `PROJECT_GOVERNANCE.md` Seção 8.3.

### 4.8 Casing geral
- **camelCase**: funções e variáveis.
- **PascalCase**: componentes React (`ProductCard.tsx`) e Tipos/Interfaces (`UnitOfMeasureInput`, `ValidationError`).
- **SCREAMING_SNAKE_CASE**: constantes de dados (`STATUS_LABELS`, `DELIVERY_LABELS`, `PRODUCTS`).

Fonte: `PROJECT_GOVERNANCE.md` Seção 16 (bloco NOMENCLATURA); `CLAUDE.md` (raiz).

### 4.9 CSS / Tailwind
Classes utilitárias customizadas em kebab-case (`.max-w-app`, `.shadow-card`, `.input-field`, `.option-card`). Cores do design system (`cream`, `chocolate`, `rose`, `sage`, `sand`, `muted`) expostas como classes Tailwind via `@theme inline` — nunca hex direto no JSX. Fonte: `CLAUDE.md` (raiz) "CSS / Tailwind".

## 5. Fluxo resumido

Não aplicável — esta é uma Skill de referência (consulta pontual), não um processo com etapas sequenciais.

## 6. Arquivos auxiliares disponíveis

Nenhum. As 9 subseções do item 4 já cobrem o assunto de forma enxuta (arquivo original tinha 95 linhas) — fragmentar em `references/` fragmentaria sem ganho real de economia de contexto.

## 7. Como carregar os arquivos auxiliares

Não aplicável (ver item 6).

## 8. Critérios de sucesso

Um arquivo/função/tipo/variável novo segue esta Skill quando sua nomenclatura e localização são indistinguíveis, a olho nu, de um exemplo já existente no mesmo tipo de recurso (mesma camada, mesmo domínio).

## 9. Limitações

Não decide responsabilidade de camada nem regra de negócio — apenas nomenclatura e organização física dos arquivos. Não resolve sozinha as duas divergências registradas no item 4.2 — ficam documentadas como Observação Técnica até uma sprint de padronização dedicada decidir corrigi-las.

## 10. Anti-patterns

- Criar `{recurso}Service.ts` dentro de uma subpasta `services/` (a convenção deste projeto é direto em `src/lib/`).
- Import relativo longo (`../../../lib/prisma`) em vez de `@/lib/prisma`.
- Validator retornando `boolean` ou lançando exceção em vez de `ValidationError[]`.
- Chamar `NextResponse.json()` diretamente numa rota nova em vez dos helpers de `src/lib/http/responses.ts`.
- Usar `any` explícito.

## 11. Referências cruzadas

`architecture` (responsabilidade de camada), `api-pattern` (convenções de rota), `repository-pattern` (convenções de Repository), `frontend-pattern` (convenções de componente admin), `schema-pattern` (convenções de Prisma), `governance` (onde tipos públicos residem, ADR, DoD). Hierarquia de precedência entre Skills e documentos: `project-skill-governance/references/CONFLICT_RESOLUTION.md`.

### Compatibilidade com Sub-agents

Nenhum Sub-agent foi criado neste projeto ainda (previsto para a Sprint G.5.3).

- **Deveriam pré-carregar esta Skill** (via `skills:` no frontmatter do subagent): qualquer subagent futuro de implementação de código do ERP (ex.: um `code-implementer` que crie rotas, Services, Repositories, componentes) — precisa da convenção de nomenclatura sempre em contexto para não divergir do restante do projeto.
- **Não deveriam pré-carregá-la**: subagents somente-leitura como `Explore`/`Plan` (não escrevem código, não ganham nada de uma Skill de convenção de nomenclatura), e subagents de governança documental/auditoria de Skills (usam `governance`/`project-skill-governance`, não esta).
- **Conhecimento fornecido:** convenções de casing, organização de diretórios, aliases de import, shape de resposta HTTP e de validação.
- **Artefatos produzidos:** nenhum arquivo — apenas orientação.
- **Entradas esperadas:** um nome de arquivo/função/tipo/variável a decidir, ou uma dúvida de onde um arquivo deve morar.
- **Saídas entregues:** confirmação de que o nome/local escolhido segue o padrão já em uso, ou correção apontando o padrão real.

---

Precedência: em caso de conflito entre esta Skill e `PROJECT_GOVERNANCE.md` ou `CLAUDE.md` (raiz), os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 13/07/2026 — Sprint G.5.0. v2.0 em 13/07/2026 — Sprint G.5.2: renomeada skill.md→SKILL.md, corpo reestruturado nas 11 seções oficiais, conteúdo original preservado como subseções 4.1–4.9, adicionada Compatibilidade com Sub-agents. -->
