# PROJECT_GOVERNANCE.md — Doce Menina ERP

Documento oficial de governança do projeto.
Referência obrigatória para todas as implementações a partir do ÉPICO 2.
Criado em: 01/07/2026 — Sprint 2.0.2.

---

## 1. Objetivo da Governança

Este documento define as regras, padrões, processos e convenções que governam o desenvolvimento do ERP Doce Menina. Seu objetivo é garantir:

- **Previsibilidade:** cada sprint segue o mesmo fluxo, tornando o progresso rastreável
- **Qualidade:** critérios claros de início, encerramento e aceite eliminam ambiguidade
- **Rastreabilidade:** toda decisão arquitetural, dívida técnica e mudança de escopo é registrada
- **Consistência:** padrões de código, nomenclatura e documentação aplicados uniformemente
- **Redução de retrabalho:** dependências mapeadas antes da implementação; schema antecipado quando necessário

Este documento **não é negociável** durante a implementação. Mudanças nele exigem aprovação explícita e registro de ADR.

---

## 2. Estrutura oficial do projeto

```
PROJETO (Doce Menina ERP)
└── ÉPICO          → Conjunto temático de módulos com objetivo estratégico comum
    └── MÓDULO     → Unidade funcional completa e entregável (ex: Módulo Produtos)
        └── SPRINT → Entrega técnica atômica dentro de um módulo (ex: Sprint 2.G.3 — Service)
            └── MICROTAREFA → Passo concreto dentro de uma sprint (ex: criar validação de slug único)
                └── REVISÃO TÉCNICA → Checagem de qualidade do código produzido
                    └── QA → Validação funcional no browser/terminal
                        └── ACEITE → Confirmação formal de que a sprint está concluída
```

### Definições

| Nível | Definição | Quem aprova |
|-------|-----------|-------------|
| **ÉPICO** | Conjunto de módulos que juntos entregam uma capacidade estratégica (ex: "Cadastros Mestres") | Usuário (dono do produto) |
| **MÓDULO** | Unidade funcional completa: schema + API + UI + testes documentados | Usuário |
| **SPRINT** | Entrega técnica de uma camada específica de um módulo (schema, repository, service, API, front-end, documentação) | Usuário |
| **MICROTAREFA** | Ação atômica dentro de uma sprint. Exemplo: "criar função `validateSupplier`" | Executado pela IA |
| **REVISÃO TÉCNICA** | Checagem de conformidade com padrões: TypeScript sem `any`, sem duplicidade, convenções de nomenclatura | Executado pela IA, apresentado ao usuário |
| **QA** | Validação funcional: `tsc`, `lint`, `npm run dev`, teste de rota no browser ou terminal | Executado pela IA, resultado apresentado ao usuário |
| **ACEITE** | Confirmação explícita do usuário de que a sprint está concluída e pode avançar | Usuário |

---

## 3. Convenção de nomenclatura

### Épicos

```
ÉPICO {N} — {Título Descritivo}
Exemplos:
  ÉPICO 1 — Fundação
  ÉPICO 2 — Cadastros Mestres + Dashboard Operacional
  ÉPICO 3 — Receitas e Precificação
```

### Módulos

```
Módulo {N}.{LETRA} — {Nome do Módulo}
Exemplos:
  Módulo 2.A — Correções Fundamentais
  Módulo 2.F — Produtos (Fase 1)
  Módulo 2.I — Receitas
```

A letra é atribuída em ordem de implementação dentro do épico (A, B, C...).

### Sprints

```
Sprint {N}.{LETRA}.{número} — {Camada}
Exemplos:
  Sprint 2.F.1 — Repository + Validator
  Sprint 2.F.2 — Service
  Sprint 2.F.3 — API
  Sprint 2.F.4 — Front-end
  Sprint 2.F.5 — Upload de imagem
  Sprint 2.F.6 — QA
```

### Camadas padrão de sprint por módulo

| Sprint | Camada | Conteúdo típico |
|--------|--------|----------------|
| {M}.1 | Schema | Alterações no `schema.prisma`, `db:push`, `db:generate` |
| {M}.2 | Repository + Validator | `src/lib/repositories/`, `src/lib/validators/` |
| {M}.3 | Service | `src/lib/` ou `src/services/` |
| {M}.4 | API | `src/app/api/` route handlers |
| {M}.5 | Front-end | `src/app/admin/`, `src/components/admin/` |
| {M}.6 | Documentação | Atualizar CHANGELOG, DOMAIN_MODEL, MODULES, KNOWN_ISSUES se aplicável |

Módulos simples podem combinar camadas (ex: Sprint {M}.2 — Repository + Validator + Service).

### Módulos de Correção (tipo `Correção`)

Quando o objetivo de um módulo é resolver dívida técnica ou inconsistências — não implementar feature nova — as sprints seguem estrutura diferente:

| Sprint | Camada | Objetivo |
|--------|--------|---------|
| {M}.1 | Schema | Correções exclusivas do schema Prisma: relacionamentos, constraints, índices, enums |
| {M}.2 | TypeScript | Correções exclusivas de tipos, enums, validators, interfaces em `src/lib/types.ts` |
| {M}.3 | Repository | Refatorações de Repository sem alterar Schema ou Types |
| {M}.4 | Validação | `prisma generate` + `db push` + `lint` + `tsc` + `dev` + validação funcional completa |

**Regra de isolamento:** cada sprint de um módulo de correção **não toca nas camadas das outras sprints**. Sprint de Schema não altera TypeScript; sprint de TypeScript não altera Prisma.

**Motivo:** alterações estruturais misturadas em sprint única dificultam isolamento de regressões. Separar por camada permite identificar exatamente onde um erro surgiu.

### Microtarefas

Descrição em português, verbo no infinitivo, específica o suficiente para ser verificada:

```
✅ Correto: "Adicionar campo `slug` único ao modelo `Product` no schema"
❌ Errado:  "Atualizar o schema"

✅ Correto: "Criar função `validateSupplier(input): ValidationError[]` em `src/lib/validators/supplierValidator.ts`"
❌ Errado:  "Implementar validação"
```

---

## 4. Fluxo obrigatório de desenvolvimento

```
1. PLANEJAMENTO
   ├── Ler documentação relevante (CLAUDE.md, ARCHITECTURE.md, DOMAIN_MODEL.md, KNOWN_ISSUES.md)
   ├── Verificar dependências entre módulos
   ├── Identificar arquivos a criar/alterar
   ├── Declarar microtarefas da sprint
   └── ⛔ AGUARDAR APROVAÇÃO EXPLÍCITA antes de iniciar

2. IMPLEMENTAÇÃO (uma microtarefa por vez)
   ├── Implementar microtarefa
   ├── Não avançar sem concluir e validar a atual
   └── Seguir os padrões desta governança

3. REVISÃO TÉCNICA (ao final de cada sprint)
   ├── TypeScript: `npx tsc --noEmit` → 0 erros
   ├── Lint: `npm run lint` → 0 erros/warnings
   ├── Sem `any` explícito
   ├── Sem duplicidade de lógica
   ├── Nomenclatura conforme convenções
   └── Padrões arquiteturais respeitados

3.4. PLATFORM REVIEW (a partir da Sprint G.6.1 — sempre que a sprint implementou/alterou Backend e/ou Frontend)
   ├── Ver Seção 16.4 — obrigatório antes do Product Review/QA
   ├── Confrontar contra PLATFORM_OVERVIEW.md e ERP_PRODUCT_VISION.md
   ├── Classificar achado como bloqueante (quebra parametrização já existente) ou não-bloqueante (lacuna de escopo futuro)
   └── Só achado bloqueante impede a passagem para o Product Review/QA

3.5. PRODUCT REVIEW (a partir da Sprint G.6 — somente quando a sprint implementou/alterou Frontend)
   ├── Ver Seção 16.5 — obrigatório antes do QA sempre que houver Frontend
   ├── Confrontar contra DESIGN_SYSTEM.md e UX_GUIDELINES.md
   ├── Classificar achados: A. Funcional | B. UX | C. UI | D. Navegação | E. Acessibilidade | F. Melhoria
   └── Somente categoria A bloqueia a passagem para o QA — B–F viram backlog priorizado

3.6. DEMO VALIDATION (a partir da Sprint T.3 — somente quando a sprint implementou/alterou Frontend)
   ├── Ver Seção 16.6 — obrigatório antes do QA, depois do Product Review (item 3.5)
   ├── Confrontar contra DEMO_GUIDE.md ("Fluxo sugerido") e DEMO_DATASET.md
   ├── Validar fluxo completo do negócio, integração entre módulos, usabilidade, consistência dos dados
   └── Achado bloqueia a passagem para o QA apenas quando quebra o fluxo ponta a ponta do Demo Guide — nunca por lacuna de módulo ainda não implementado

4. QA (ao final de cada sprint)
   ├── `npm run dev` → servidor sobe sem erro
   ├── Testar rota/funcionalidade afetada
   ├── Verificar que nenhuma funcionalidade existente foi quebrada
   └── Registrar evidências (output de comandos, resposta de API)

5. DOCUMENTAÇÃO
   ├── Atualizar CHANGELOG.md
   ├── Atualizar documentos de arquitetura se necessário
   └── Atualizar KNOWN_ISSUES.md se KI for resolvido

6. ACEITE
   ├── Apresentar resumo da sprint ao usuário
   ├── Listar arquivos criados/alterados
   ├── Confirmar validações (tsc, lint, QA)
   └── ⛔ AGUARDAR APROVAÇÃO antes de avançar para próxima sprint
```

### 4.1 Fluxo operacional vigente (a partir da Sprint G.6.4)

O fluxo acima (itens 1–6 desta Seção 4), espelhado em `CLAUDE.md` (raiz, "Fluxo obrigatório para implementação de Sprints"), é o **fluxo operacional vigente** — o que conduz de fato toda Sprint deste projeto, confirmado pelo histórico real de execução em `CHANGELOG.md`.

Isso preserva, sem invalidar, a hierarquia documental já existente (`CLAUDE.md` → Skills → Contracts → Protocols → Sub-agents → Playbooks → AI Operating System, `PLATFORM_OVERVIEW.md`): `docs/ai/AI_PROMPT_ORCHESTRATOR.md` (papéis Orchestrator/Executor/Auditor, FASE 0/-1/0.5/6, artefatos `SPRINT_X.md`/`SPRINT_AUDIT.md`, máquina de 8 estados) representa uma **arquitetura expandida de orquestração**, que permanece válida como referência arquitetural para evolução futura do processo — não é revogada nem depreciada por esta seção. Da mesma forma, os esquemas de 9 estados (`project-skill-governance/references/STATE_MACHINE.md`) e 10 estados (`.claude/architecture/STATE_MACHINE.md`) permanecem documentação arquitetural válida, cada um já registrando sua própria divergência não resolvida frente aos demais.

Esta subseção não escolhe um esquema de estados "vencedor" entre os três — apenas identifica, com base em evidência (nenhuma Sprint real produziu `SPRINT_X.md`/`SPRINT_AUDIT.md`, nenhuma usou os nomes de estado como status real), qual fluxo é o vigente hoje na operação do projeto. Decisão de unificação futura, se houver, continua sendo do Product Owner.

### 4.2 Sprint Oficial vs. Backlog Suggestion (a partir da Sprint G.6.4)

| | Sprint Oficial | Backlog Suggestion |
|---|---|---|
| Numeração | Definitiva (ex: `Sprint G.6.4`) | Nenhuma — é só um tema/proposta |
| Pode ser executada | Sim — percorre o fluxo operacional vigente (item 4.1) | Não |
| Altera a ordem de execução | Sim, quando aprovada | Não |
| Interfere na Sprint em andamento | — | Nunca |
| Promoção | — | Só vira Sprint Oficial após o encerramento da Sprint corrente (checkpoint (b) do item 6 acima) |

### 4.3 Regra de bloqueio durante execução (a partir da Sprint G.6.4)

Enquanto existir uma Sprint Oficial entre o checkpoint (a) (aprovação para iniciar, fim do item 1) e o checkpoint (b) (aceite final, fim do item 6) — ou seja, aprovada mas ainda não encerrada — **fica proibido criar uma nova Sprint Oficial**. Toda melhoria identificada nesse intervalo é registrada apenas como Backlog Suggestion (item 4.2), sem numeração definitiva, sem interferir na ordem ou no conteúdo da Sprint em andamento.

Regras criadas por uma Sprint de governança (como esta) produzem efeito apenas após: (1) conclusão da Sprint, (2) aprovação formal do Product Owner, (3) atualização da documentação oficial — até esse momento, as regras anteriores permanecem válidas. Exemplo real desta própria sessão: a Backlog Suggestion "Governança de Vigência das Regras" propôs exatamente esta regra de vigência.

### 4.4 Interrupção de Sprint funcional por inconsistência de infraestrutura (a partir da Sprint I.1)

Sempre que uma Sprint funcional (que implementa ou altera regra de negócio, Backend ou Frontend) encontrar, durante sua execução, uma inconsistência de infraestrutura — banco de dados, ambiente, Storage, migrations, autenticação ou serviços externos —, a Sprint funcional é **interrompida**, a inconsistência é **registrada** (`CHANGELOG.md` e, quando aplicável, nota na linha correspondente do módulo em `PLAN.md`) e uma **Sprint Oficial de Infraestrutura** dedicada (nomenclatura `I.x`, análoga ao prefixo `G.x` já usado para sprints de governança de IA) é aberta e aprovada pelo Product Owner **antes** de qualquer continuidade do roadmap funcional que dependa da área afetada.

A Sprint de infraestrutura segue o mesmo fluxo operacional vigente (item 4.1). Nenhuma alteração estrutural (ex.: `prisma db push` contra um banco compartilhado) é executada dentro dela sem autorização explícita adicional do Product Owner, mesmo quando a causa raiz já foi identificada — investigar e confirmar por evidência não é o mesmo que autorização para corrigir.

Exemplo real: a Sprint 2.J.2.1 (funcional, Módulo Produtos) identificou por hipótese uma possível dessincronização de schema. Em vez de a sprint funcional seguinte prosseguir sobre essa hipótese, a Sprint I.1 (infraestrutura) foi aberta, confirmou a hipótese por evidência direta e revelou um escopo maior que o suspeitado (dados ausentes em três módulos já encerrados — 2.D, 2.G, 2.I). Esta seção formaliza esse padrão para todas as sprints futuras — lacuna identificada em auditoria que as regras anteriores desta Seção 4 não cobriam.

---

## 5. Critérios obrigatórios para início de uma Sprint

Antes de escrever qualquer linha de código, todos os itens abaixo devem ser satisfeitos:

- [ ] Módulo e sprint identificados com nomenclatura oficial (ex: "Sprint 2.G.4 — API")
- [ ] Documentação relevante lida (CLAUDE.md, schema atual, módulo antecessor)
- [ ] Dependências confirmadas como existentes (ex: se a sprint usa `Supplier`, o módulo 2.D deve estar concluído)
- [ ] Arquivos a criar/alterar listados explicitamente
- [ ] Microtarefas declaradas (verbo + objeto + arquivo)
- [ ] Critérios de aceite definidos (o que deve ser verdade quando a sprint terminar)
- [ ] **Aprovação explícita do usuário recebida**

---

## 6. Critérios obrigatórios para encerramento de uma Sprint

Antes de declarar uma sprint concluída:

- [ ] Todas as microtarefas executadas
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run lint` → 0 erros
- [ ] `npm run dev` → sobe sem erro
- [ ] Funcionalidade testada (API com curl/browser, UI navegada)
- [ ] Nenhuma funcionalidade existente quebrada (regressão)
- [ ] CHANGELOG.md atualizado com a sprint
- [ ] Documentos de arquitetura atualizados (se necessário)
- [ ] Resumo apresentado ao usuário com: arquivos alterados, validações, pendências identificadas
- [ ] **Aceite explícito do usuário recebido**

---

## 7. Checklist obrigatório antes do aceite

```
CHECKLIST DE ACEITE — Sprint {N}.{LETRA}.{número}

QUALIDADE DE CÓDIGO
[ ] Sem `any` em TypeScript
[ ] Sem função duplicada (lógica idêntica em dois arquivos)
[ ] Sem lógica de negócio em Route Handler (apenas parse + delegate + HTTP mapping)
[ ] Sem acesso direto ao Prisma fora de Repository
[ ] Sem `new PrismaClient()` fora de `src/lib/prisma.ts`

PADRÕES
[ ] Nomenclatura de arquivos: kebab-case para lib, PascalCase para componentes
[ ] Interfaces em `src/lib/types.ts` (não inline em componentes ou routes)
[ ] Validators em `src/lib/validators/`
[ ] Repositories em `src/lib/repositories/`
[ ] Componentes admin em `src/components/admin/{módulo}/`

VALIDAÇÃO TÉCNICA
[ ] `npx tsc --noEmit` → 0 erros
[ ] `npm run lint` → 0 erros
[ ] `npm run dev` → sem erro no terminal

QA FUNCIONAL
[ ] API testada (método + rota + corpo esperado)
[ ] UI navegada no browser (quando aplicável)
[ ] Casos de erro validados (campo vazio, tipo errado, auth ausente)
[ ] Responsividade validada nos 3 cenários mínimos — Smartphone, Tablet, Desktop (Seção 8.8, a partir da Sprint G.6.2) — obrigatório sempre que a sprint tem Frontend, sem exceção

DOCUMENTAÇÃO
[ ] CHANGELOG.md atualizado
[ ] KNOWN_ISSUES.md: KIs resolvidos marcados como ✅
[ ] Novos KIs identificados registrados
```

---

## 8. Padrões arquiteturais

### Visão geral das camadas

```
Route Handler  →  Service  →  Validator  →  Repository  →  Prisma
(src/app/api)     (src/lib)   (src/lib)     (src/lib)      (singleton)
```

### 8.1 Route Handler (`src/app/api/{recurso}/route.ts`)

**Responsabilidades:**
- Parse do body HTTP (try/catch → 400 em JSON inválido)
- Verificar auth quando necessário (via `getServerSession`)
- Chamar o Service
- Mapear resultado/erros para status HTTP

**Proibições:**
- Sem lógica de negócio
- Sem acesso direto ao Prisma
- Sem validação de campos de domínio

```typescript
// Padrão obrigatório
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await myService.create(body);
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationFailedError)
      return Response.json({ errors: error.errors }, { status: 400 });
    if (error instanceof AuthError)
      return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "Erro interno." }, { status: 500 });
  }
}
```

### 8.2 Service (`src/lib/{recurso}Service.ts`)

**Responsabilidades:**
- Verificar autenticação e papel via `getServerSession(authOptions)`
- Chamar Validator — relança `ValidationFailedError` se inválido
- Orquestrar chamadas ao Repository (uma ou mais)
- Mapear tipos Prisma para tipos TypeScript (ex: `Decimal → number`)

**Proibições:**
- Sem acesso direto ao Prisma (usar Repository)
- Sem lógica HTTP (sem `Response`, sem `status`)

```typescript
// Padrão obrigatório
export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthError(401, "Não autenticado.");
  if (session.user.role !== "ADMIN") throw new AuthError(403, "Sem permissão.");

  const errors = validateSupplier(input);
  if (errors.length > 0) throw new ValidationFailedError(errors);

  const raw = await supplierRepository.create(input);
  return mapSupplier(raw); // Decimal → number, datas → string, etc.
}
```

### 8.3 Validator (`src/lib/validators/{recurso}Validator.ts`)

**Responsabilidades:**
- Função pura: entrada tipada → `ValidationError[]`
- Retorna `[]` se válido; lista de erros se inválido
- Zero dependências externas (sem Prisma, sem fetch, sem Next.js)

**Contrato obrigatório:**
```typescript
export function validateSupplier(input: SupplierInput): ValidationError[] {
  const errors: ValidationError[] = [];
  // ... regras
  return errors;
}
// ValidationError = { field: string; code: string; message: string }
```

**Reutilização:** o mesmo validator é importado pelo Service (servidor) e pela página (cliente, antes do fetch).

### 8.4 Repository (`src/lib/repositories/{recurso}Repository.ts`)

**Responsabilidades:**
- Único arquivo que importa `prisma` além de `src/lib/prisma.ts`
- Queries Prisma puras, sem lógica de negócio
- Tipagem de entrada/saída com tipos do Prisma Client

**Proibições:**
- Sem lógica de negócio
- Sem autenticação
- Sem mapeamento de tipos de domínio (isso é papel do Service)

```typescript
import { prisma } from "@/lib/prisma";
import type { Prisma, Supplier as PrismaSupplier } from "@prisma/client";

export async function findAllSuppliers(): Promise<PrismaSupplier[]> {
  return prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" } });
}

export async function createSupplier(data: Prisma.SupplierCreateInput): Promise<PrismaSupplier> {
  return prisma.supplier.create({ data });
}
```

### 8.5 Componentes React (`src/components/admin/{módulo}/`)

**Padrões:**
- `"use client"` obrigatório em componentes com hooks
- Props tipadas com interface local `NomeComponenteProps`
- Sem chamadas de API diretas em componentes (apenas em pages)
- `type="button"` explícito em `<button>` para evitar submit acidental
- `aria-label` em botões sem texto visível

**Reutilizações obrigatórias (não reinventar):**
| Componente | Arquivo | Uso |
|-----------|---------|-----|
| `Field` + `Section` + `inputClass` | `src/components/admin/config/FormPrimitives.tsx` | Todos os formulários admin |
| `ValidationSummary` + `ToastState` | `src/components/admin/config/ValidationSummary.tsx` | Toast de success/error em qualquer página |
| `ActionBar` | `src/components/admin/config/ActionBar.tsx` | Barra fixa Voltar + Salvar |
| `LoadingSkeleton` | `src/components/admin/config/LoadingSkeleton.tsx` | Estado de loading |
| `UploadImage` | `src/components/admin/config/UploadImage.tsx` | Upload de imagem em qualquer módulo |

### 8.6 Prisma

- **Nunca** instanciar `new PrismaClient()` fora de `src/lib/prisma.ts`
- **Nunca** importar `prisma` em Route Handlers ou Services (usar Repository)
- Após alteração no `schema.prisma`: `npm run db:push` → `npm run db:generate`
- No Windows: parar o servidor dev antes de `db:generate` (DLL lock)
- Campos monetários: `Decimal` no schema → `number` no TypeScript (mapear no Service)
- Datas: `DateTime` no schema → `string ISO` no tipo TypeScript de resposta

### 8.7 Tipos compartilhados

**Regra:**
- Tipos públicos de um domínio — utilizados por API, Service e Front-end — devem residir em `src/lib/types.ts`.
- Tipos locais (declarados em um arquivo de `lib/validators/` ou `lib/*Service.ts`, não exportados de `types.ts`) são permitidos **somente** enquanto o domínio ainda estiver em implementação, ou quando `types.ts` estiver explicitamente fora do escopo da sprint em execução.
- Ao finalizar o domínio (todas as camadas implementadas e módulo pronto para encerramento), todos os tipos públicos desse domínio deverão ser consolidados em `types.ts`.
- Após a consolidação dos tipos públicos em `src/lib/types.ts`, os tipos locais equivalentes deverão ser removidos, evitando duplicidade de definição.

**Motivo:** evita que tipos de domínio fiquem espalhados indefinidamente por camadas diferentes, preservando `types.ts` como fonte única de verdade para tipos consumidos por múltiplas camadas.

### 8.8 Ambiente de execução e compatibilidade (a partir da Sprint G.6.2)

Padrão técnico permanente do produto — vale para toda funcionalidade nova, sem exceção:

- **Web.** O ERP é um sistema Web — nenhuma funcionalidade nova pressupõe cliente nativo (desktop/mobile app) ou capacidade fora do navegador.
- **Totalmente responsivo.** Critério mínimo de aceite: Desktop, Tablet e Smartphone (`UX_GUIDELINES.md` Seções 14–16 são a fonte de verdade de como cada breakpoint se comporta — não duplicado aqui). Ver Seção 17 ("QA de Front-end") para o gate de aceite correspondente.
- **Produção: VPS Linux.** Ambiente oficial de hospedagem e execução em produção. Scripts e comandos de automação (build, deploy, migração) devem priorizar compatibilidade com Linux.
- **Evitar dependência exclusiva do Windows.** Nenhum script novo (`package.json`, CI, migração) deve depender de comando ou caminho exclusivo do Windows sem alternativa equivalente. **Nota de estado atual:** o ambiente de desenvolvimento local deste projeto já roda em Windows hoje (`CLAUDE.md`, "Como executar o projeto" — caminho em Google Drive, trava de DLL do Windows em `db:generate`) — essa realidade de dev não muda com esta sprint; a regra vale para o que é **produzido** a partir de agora (scripts novos, comandos novos), não uma migração retroativa do ambiente de desenvolvimento atual.
- **Compatibilidade como critério de aceite.** Toda nova funcionalidade deve ser compatível com este ambiente (Web, responsivo, Linux/VPS) antes de ser considerada pronta — mesma lógica de not-blocking/blocking já usada em Platform Review (Seção 16.4): incompatibilidade nova introduzida pela sprint corrente bloqueia; lacuna pré-existente não bloqueia uma sprint que não foi encomendada para resolvê-la.

---

## 9. Convenções para React

```typescript
// ✅ Estrutura padrão de page.tsx admin
"use client";

import { useState, useEffect } from "react";
import { HeaderMinimal } from "@/components/layout/Header";
import { LoadingSkeleton } from "@/components/admin/config/LoadingSkeleton";
import { ValidationSummary, type ToastState } from "@/components/admin/config/ValidationSummary";
import { ActionBar } from "@/components/admin/config/ActionBar";

export default function MeuModuloPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // ...

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="mx-auto min-h-screen max-w-app bg-cream">
      <HeaderMinimal title="Título do módulo" />
      <ValidationSummary toast={toast} onDismiss={() => setToast(null)} />
      <form onSubmit={handleSubmit} className="px-4 pb-32 pt-6 space-y-6">
        {/* seções */}
      </form>
      <ActionBar submitting={submitting} backHref="/admin" />
    </main>
  );
}
```

**Regras:**
- Estado de página: `loading` (fetch inicial), `submitting` (operação em andamento), `fieldErrors` (por campo), `toast` (feedback global)
- Formulários: validar com validator puro antes do fetch; mapear `ValidationError[]` para `Record<field, message>`
- Máscaras: usar `src/lib/formatters/` — nunca inline
- Navegação: `<Link>` do Next.js para links; `useRouter().push()` para redirecionamento programático

---

## 10. Convenções para Prisma

```prisma
// ✅ Padrão para novos modelos
model Supplier {
  id          String    @id @default(cuid())
  name        String
  // ... campos de negócio ...
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // relações
  ingredients Ingredient[]

  @@map("suppliers") // sempre snake_case no banco
}
```

**Regras:**
- `id String @id @default(cuid())` — padrão para todas as entidades **([ADR-005](ADR-005.md) — imutável)**
- `active Boolean @default(true)` — toda entidade que pode ser desativada tem este campo
- `createdAt` + `updatedAt` — obrigatórios em toda entidade
- `@@map("snake_case")` — nome da tabela em snake_case no banco
- Enums: `SCREAMING_SNAKE_CASE` nos valores
- Campos monetários: `Decimal @db.Decimal(10, 2)` — nunca `Float`
- Soft delete via `active: false` — nunca `DELETE` em entidades de negócio
- Índices: adicionar `@@index` em campos usados em `WHERE` ou `ORDER BY` frequentes

### Relacionamentos many-to-many

Decisão arquitetural registrada em Sprint 2.C.1 — 02/07/2026. Alinhada com [ADR-005](ADR-005.md).

**Regra:** relacionamentos N:N com potencial de evolução devem utilizar **entidade de relacionamento explícita**.

```prisma
// ✅ PADRÃO OBRIGATÓRIO — entidade explícita com potencial de evolução
model ProductOccasion {
  productId  String
  product    Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  occasionId String
  occasion   OccasionTag @relation(fields: [occasionId], references: [id], onDelete: Cascade)

  @@id([productId, occasionId])
  // Poderá receber: priority, validFrom, validUntil, campaignId, createdAt, createdById
}

// ❌ PROIBIDO sem ADR aprovada — relacionamento implícito
model Product {
  occasions OccasionTag[]   // cria _OccasionTagToProduct automaticamente — não evolutivo
}
```

**Exemplos oficiais deste padrão no ERP Doce Menina:**

| Entidade | Relacionamento | Potencial de evolução |
|---|---|---|
| `ProductOccasion` | `Product ↔ OccasionTag` | `priority`, `validFrom`, `validUntil`, `campaignId`, auditoria |
| `ProductRecipe` | `Product ↔ Recipe` | `quantity`, `unitId` — já possui metadados |

**Quando relacionamento implícito é permitido:** somente quando aprovado arquiteturalmente via ADR, para relacionamentos sem qualquer perspectiva de evolução de metadados e sem necessidade de auditoria.

**Restrição:** `ProductOccasion` não deve ser convertida para relacionamento implícito sem nova ADR aprovada (ver `REGRAS_NEGOCIO.md` Seção 3.5 e `PROJECT_GOVERNANCE.md` Seção 13).

---

## 11. Convenções para APIs

```
// Padrão de rotas
GET    /api/admin/{recurso}            → listar (com filtros via query string)
GET    /api/admin/{recurso}/[id]       → buscar por ID
POST   /api/admin/{recurso}            → criar
PUT    /api/admin/{recurso}/[id]       → atualizar completamente
PATCH  /api/admin/{recurso}/[id]       → atualizar parcialmente
DELETE /api/admin/{recurso}/[id]       → desativar (soft delete)
```

**Respostas padrão:**
| Situação | Status | Body |
|---------|--------|------|
| Criado com sucesso | 201 | `{ data: RecursoCompleto }` |
| Leitura com sucesso | 200 | `{ data: [...] }` ou `{ data: RecursoCompleto }` |
| Atualização com sucesso | 200 | `{ data: RecursoAtualizado }` |
| Body JSON inválido | 400 | `{ error: "Body inválido." }` |
| Validação falhou | 400 | `{ errors: ValidationError[] }` |
| Não autenticado | 401 | `{ error: "Não autenticado." }` |
| Sem permissão | 403 | `{ error: "Sem permissão." }` |
| Não encontrado | 404 | `{ error: "Não encontrado." }` |
| Erro interno | 500 | `{ error: "Erro interno." }` |

**Regras:**
- Auth: rotas `/api/admin/*` exigem sessão com `userType === "admin"`; verificar no Service
- Rotas públicas (vitrine): `/api/products`, `/api/occasions`, `/api/config` (GET)
- Nunca retornar `passwordHash` ou dados sensíveis
- Nunca deletar pedidos — apenas cancelar (`OrderStatus.CANCELADO`)

### 11.1 Performance (a partir da Sprint G.6.2)

Diretrizes permanentes, aplicáveis sempre que o volume de dados de um recurso puder crescer além de uma lista pequena e estável (ex. produtos, pedidos, ingredientes — não se aplica a listas fixas como `UnitOfMeasure`):

- **Paginação server-side** — `GET /api/admin/{recurso}` deve aceitar parâmetros de paginação via query string (ex. `?page=1&pageSize=20`) quando o recurso puder crescer sem limite; o Repository aplica `skip`/`take`, nunca carrega a tabela inteira para paginar em memória.
- **Filtros server-side** — filtros já documentados como "via query string" (padrão de rotas desta seção) são resolvidos no Repository (`where` do Prisma), nunca filtrando um array já carregado por completo no Service ou no Front-end.
- **Evitar carregamento desnecessário** — Route Handler e Service só solicitam ao Repository os campos/relações (`select`/`include`) realmente usados pela resposta; nunca `include` de relação não exibida "por garantia".
- **Otimizar consultas e renderização** — preferir uma consulta com `include`/`select` bem definido a múltiplas consultas sequenciais evitáveis (N+1); no Front-end, listas grandes usam paginação/scroll incremental já refletindo a paginação server-side acima, nunca carregando tudo de uma vez para depois cortar visualmente.

Não se aplica retroativamente a rotas já implementadas sem paginação (ex. `GET /api/products`, lista hoje pequena e estável) — vale para rotas novas e para o momento em que uma rota existente crescer a ponto de justificar a mudança, registrado como dívida técnica (`PROJECT_GOVERNANCE.md` Seção 14) quando identificado.

---

## 12. Convenções para documentação

### Quando atualizar cada documento

| Documento | Atualizar quando |
|-----------|-----------------|
| `CHANGELOG.md` | Toda sprint concluída — entrada no topo |
| `KNOWN_ISSUES.md` | KI resolvido (✅) ou novo KI identificado |
| `DOMAIN_MODEL.md` | Nova entidade ou relacionamento criado |
| `ARCHITECTURE.md` | Nova decisão arquitetural ou mudança de padrão |
| `MODULES.md` | Módulo de fase muda de status |
| `PLAN.md` | Sprint concluída ou épico encerrado |
| `PROJECT_GOVERNANCE.md` | Nova convenção aprovada ou ADR registrado |
| `EPICO_N.md` | Encerramento de épico |
| `DEMO_ENVIRONMENT.md` | Mudança na arquitetura do ambiente de demonstração (Sprint T.3) |
| `DEMO_DATASET.md` | Novo model/produto/receita relevante ao fluxo demonstrado (Sprint T.3) |
| `DEMO_GUIDE.md` | Mudança no fluxo sugerido ou nos Demo Users (Sprint T.3) |

### Estilo

- Linguagem: **português brasileiro** em toda documentação
- Tom: técnico, direto, sem ambiguidade
- Tabelas Markdown para listas estruturadas
- Nomes exatos de arquivos e funções (conferir antes de escrever)
- Não criar documentos novos sem necessidade real

---

## Atualização do PLAN.md

O arquivo PLAN.md representa o estado atual do projeto e NÃO constitui histórico de alterações.

#### Regras obrigatórias

1. Deve existir exatamente uma única entrada para cada:
- módulo;
- sprint;
- épico (quando aplicável).

2. Ao concluir um módulo ou sprint, a linha existente com status Planejado deve ser substituída pela versão Concluído.

3. É proibido adicionar uma nova linha para representar um módulo ou sprint já existente.

4. Nunca manter simultaneamente registros como:

Sprint X.Y | Planejado

Sprint X.Y | Concluído

ou

Módulo X | Planejado

Módulo X | Concluído

A versão Planejado deve ser removida.

5. A atualização deve preservar:

- ordem dos módulos;
- ordem das sprints;
- descrição;
- escopo;
- dependências;
- datas registradas.

6. O PLAN.md representa apenas o estado atual do projeto.

Todo histórico pertence exclusivamente ao CHANGELOG.md.

#### Validação obrigatória

Antes de encerrar qualquer sprint deverá ser realizada uma revisão completa do PLAN.md confirmando:

- inexistência de módulos duplicados;
- inexistência de sprints duplicadas;
- existência de apenas uma entrada para cada item;
- status coerentes com o estado atual do projeto.

Caso qualquer duplicidade seja encontrada, ela deverá ser corrigida antes do encerramento oficial da sprint.

### Fluxo obrigatório de encerramento de Sprint

Toda sprint deverá ser encerrada obrigatoriamente seguindo esta sequência:

1. Concluir todas as alterações de código previstas na sprint.

2. Executar todas as validações obrigatórias aplicáveis
(tsc, lint, build, testes, quando previstos).

3. Atualizar o PLAN.md substituindo o status da sprint.

4. Atualizar o CHANGELOG.md registrando a conclusão.

5. Revisar integralmente o PLAN.md garantindo ausência de duplicidades.

6. Somente após todas essas etapas declarar oficialmente a sprint como concluída.

É proibido atualizar o PLAN.md antes da execução das validações obrigatórias.

---

## 13. Processo e Política de ADR (Architectural Decision Record)

> **Roadmap congelado (Sprint 2.0.6 — 01/07/2026).** A ordem dos módulos 2.A–2.L é definitiva. Alterações estruturais no roadmap (adicionar/remover/renumerar módulos, alterar dependências entre módulos) requerem uma ADR formal registrada aqui antes de qualquer implementação.

### 13.1 Política obrigatória

As três regras abaixo são **inegociáveis** e se aplicam a partir de Sprint 2.0.7:

**Regra 1 — Sem ADR, sem implementação**
Nenhuma alteração estrutural pode ser iniciada sem ADR aprovada explicitamente pelo usuário. "Alteração estrutural" inclui: mudança de ordem de módulos, adição/remoção de módulo no roadmap, mudança de biblioteca principal, mudança de arquitetura de camadas, introdução de padrão que contradiga este documento.

**Regra 2 — ADR não altera roadmap automaticamente**
A aprovação de uma ADR documenta a decisão, mas não executa a mudança. O roadmap em EPICO_2_PLANEJAMENTO.md e PLAN.md só é atualizado após implementação confirmada e aceite explícito do usuário na sprint correspondente.

**Regra 3 — Documentos impactados são obrigatórios**
Toda ADR deve listar explicitamente os documentos que serão afetados pela decisão (ex: `schema.prisma`, `types.ts`, `EPICO_2_PLANEJAMENTO.md`, `PLAN.md`, `CLAUDE.md`). Documentos não listados não devem ser alterados no escopo da ADR.

### 13.2 Quando registrar uma ADR

- Escolha entre duas abordagens com impactos distintos (ex: Embalagem como Ingredient vs. entidade própria)
- Mudança de convenção existente (ex: adotar React Query para estado de servidor)
- Introdução de nova biblioteca ou ferramenta
- Mudança de schema com impacto em dados existentes
- Alteração na ordem ou escopo de módulos do roadmap
- Qualquer decisão que contradiga este documento ou CLAUDE.md

### 13.3 Onde registrar

Registro principal: `CLAUDE.md`, seção **"Decisões arquiteturais tomadas"**.
Registro secundário: `ARCHITECTURE.md`, seção **"Decisões Pendentes / Já tomadas"**.

### 13.4 Template de ADR

```
| Decisão | Escolha adotada | Alternativa descartada | Justificativa | Data |
|---------|----------------|----------------------|---------------|------|
| {título} | {o que foi decidido} | {o que foi descartado} | {por quê} | {data} |

Documentos impactados: {lista explícita de arquivos}
Aprovado por: {usuário} em {data}
```

### 13.5 Regra de imutabilidade

Decisões registradas **não são questionadas** em sessões futuras. Para reverter uma ADR, é necessário nova ADR explicitamente aprovada pelo usuário com justificativa documentada.

### 13.6 Evolução do AI Operating System (a partir da Sprint G.5.7)

A infraestrutura de IA do projeto (`.claude/skills/`, `.claude/contracts/`, `.claude/protocols/`, `.claude/agents/`, `.claude/playbooks/`, `.claude/architecture/`) foi certificada e congelada como **Baseline AI Operating System v1.0** na Sprint G.5.7 (ver `.claude/architecture/BASELINE_V1.md`). A partir desta sprint:

- Qualquer alteração em uma **Skill** existente, **Contract**, **Sub-agent** ou **Playbook** exige ADR registrada nesta seção antes da alteração.
- Qualquer alteração **estrutural** do AI Operating System (novo modelo de camada, novo tipo de artefato de infraestrutura, mudança na hierarquia de precedência) só pode ocorrer em uma **Sprint arquitetural dedicada** — nunca como efeito colateral de uma sprint de implementação do ERP.
- Criar uma Skill/Contract/Protocol/Playbook **novo** que segue o padrão já estabelecido (via `SKILL_TEMPLATE.md` e o checklist de `project-skill-governance`) não exige ADR — só alteração de algo já congelado na Baseline exige.

### 13.7 Modo de manutenção (a partir da Sprint T.1)

A partir da Sprint T.1 (Transição Oficial para Desenvolvimento do ERP), a infraestrutura de IA entra oficialmente em **modo de manutenção** — ver `AIOS_BASELINE_v1.md` item 7/8. Uma evolução de infraestrutura só pode ser proposta quando as 4 condições abaixo se confirmarem simultaneamente:

1. Bloqueio real identificado durante o desenvolvimento do ERP (não melhoria hipotética).
2. Aprovação explícita do Product Owner para investigar essa evolução.
3. Ordem de Missão específica para a evolução — nunca efeito colateral de sprint de funcionalidade.
4. Registro documental da decisão (ADR, Seção 13.6).

Melhorias por conveniência identificadas durante o desenvolvimento do ERP são registradas como Melhoria Futura — nunca implementadas de imediato, nunca interrompem uma sprint de funcionalidade em andamento. Toda futura Ordem de Missão de desenvolvimento do ERP segue `ERP_DEVELOPMENT_WORKFLOW.md`.

---

## 14. Política de dívida técnica

### Registro

Toda dívida técnica identificada é registrada em `KNOWN_ISSUES.md` com:
- ID sequencial (`KI-N` para issues, `DT-N` para dívida técnica, `IC-N` para inconsistências)
- Arquivo afetado
- Impacto (Crítico / Alto / Médio / Baixo)
- O que bloqueia

### Priorização

| Prioridade | Critério | Ação |
|-----------|---------|------|
| **Crítica** | Bloqueia implementação ou causa bug em produção | Resolver antes da próxima sprint |
| **Alta** | Impede módulo futuro ou gera inconsistência de dados | Resolver no mesmo épico |
| **Média** | Gera retrabalho se não resolvida | Resolver antes do épico que depende dela |
| **Baixa** | Melhoria sem impacto imediato | Resolver em sprint de refatoração dedicada |

### Regra de não acumulação

- Dívida técnica crítica ou alta **não pode ser adiada** além do épico corrente
- Nenhum módulo novo começa com dívida crítica não resolvida no módulo anterior
- Refatorações corretivas (que resolvem dívida) têm prioridade sobre features

---

## 15. Política para refatorações

### Quando refatorar é permitido

- Componente acima de 200 linhas → extrair subcomponentes
- Lógica duplicada em 3+ arquivos → extrair para lib/utils ou componente
- `page.tsx` com lógica de negócio → extrair para service ou helper

### Quando refatoração é proibida

- Durante implementação de funcionalidade nova (risco de misturar contextos)
- Sem aprovação explícita do usuário
- Sem garantia de equivalência funcional (zero mudança de comportamento)

### Processo

1. Identificar o problema e o escopo da refatoração
2. Declarar como sprint dedicada (ex: "Sprint 2.G.7 — Refatoração da página de Produtos")
3. Executar com foco exclusivo (sem novas features no mesmo PR/sessão)
4. Validar: `tsc`, `lint`, comportamento idêntico no browser
5. Documentar no CHANGELOG

---

## 16. Processo para revisão técnica

Executada ao final de cada sprint, antes do QA. A IA executa e apresenta o resultado ao usuário.

### Checklist de revisão técnica

```
REVISÃO TÉCNICA — Sprint {identificador}

TIPAGEM
[ ] Nenhum `any` explícito (exceto com comentário justificando)
[ ] Interfaces de props definidas localmente no componente
[ ] Tipos de domínio em `src/lib/types.ts`
[ ] Tipos de input de formulário distintos dos tipos de entidade (ex: `SupplierInput` vs `Supplier`)

ARQUITETURA
[ ] Route não acessa Prisma diretamente
[ ] Service não retorna `Response` (sem HTTP)
[ ] Validator é função pura sem dependências externas
[ ] Repository não tem lógica de negócio

QUALIDADE
[ ] Sem função duplicada entre módulos
[ ] Sem import de `mock-data.ts` em código novo
[ ] Sem hardcode de IDs ou valores que deveriam vir do banco
[ ] `useCallback` e `useMemo` aplicados em Contexts com múltiplos filhos

NOMENCLATURA
[ ] Arquivos: kebab-case em `src/lib/`, PascalCase em `src/components/`
[ ] Funções: camelCase
[ ] Constantes: SCREAMING_SNAKE_CASE
[ ] Tipos/Interfaces: PascalCase

SEGURANÇA
[ ] Nenhuma rota admin sem verificação de sessão no Service
[ ] `passwordHash` nunca retornado em resposta de API
[ ] Nenhuma query SQL rawWith input do usuário sem parameterização
```

---

## 16.4. Processo de Platform Review (a partir da Sprint G.6.1)

Executado após a Revisão Técnica (Seção 16) e antes do Product Review (Seção 16.5)/QA (Seção 17), **sempre que a sprint implementou ou alterou Backend e/ou Frontend**. Distinto de Product Review: avalia arquitetura de plataforma (Multi-tenant, Branding, White Label, Theme Engine, isolamento de dados, parametrização), nunca UX/UI. Ver `PLATFORM_OVERVIEW.md`, "Experience Review vs. Platform Review", para a distinção completa.

### Fonte de verdade

`PLATFORM_OVERVIEW.md` e `ERP_PRODUCT_VISION.md` (raiz do projeto, Sprint G.6.1) — não redefinidos aqui.

### Classificação obrigatória dos achados

Diferente da taxonomia A–F de Product Review (Seção 16.5), Platform Review usa uma classificação binária:

| Classificação | Descrição | Bloqueia? |
|---|---|---|
| **Bloqueante** | Quebra de parametrização já existente (ex. nome de empresa hardcoded onde `StoreConfig` já deveria ser usado) | Sim |
| **Não-bloqueante** | Lacuna de escopo futuro (ex. multi-tenência estrutural ainda não implementada no schema, fora do escopo da sprint corrente) | Não |

**Nunca converter uma lacuna de escopo futuro em bloqueio de uma sprint que não foi encomendada para resolvê-la** — o estado atual do projeto é single-tenant (ver nota de transparência em `ERP_PRODUCT_VISION.md`); isso não é regressão de nenhuma sprint de módulo de negócio.

### Quem executa

Sub-agent `platform-reviewer` (`.claude/agents/platform-reviewer.md`, Sprint G.6.1) — nunca implementa ou corrige o que encontra. Ver `.claude/skills/platform-review/SKILL.md`.

---

## 16.5. Processo de Product Review (a partir da Sprint G.6)

Executado após a Revisão Técnica (Seção 16) e o Platform Review (Seção 16.4, quando aplicável), e antes do QA (Seção 17), **sempre que a sprint implementou ou alterou Frontend** (`src/app/admin/**`, `src/app/(cliente)/**`, `src/components/**`). Quando a sprint é exclusivamente de Backend/API, esta etapa é pulada — segue-se direto para o QA (depois do Platform Review, se aplicável).

### Objetivo

Validar não apenas a correção técnica do código (isso é QA, Seção 17), mas a qualidade real da experiência entregue ao usuário: UX, UI, fluxo, navegação, usabilidade, responsividade, consistência visual, clareza da informação, hierarquia visual, quantidade de cliques, feedback ao usuário, estados de carregamento/vazio, mensagens, legibilidade e produtividade do usuário.

### Fonte de verdade

`DESIGN_SYSTEM.md` (componentes, padronização visual) e `UX_GUIDELINES.md` (princípios, formulários, mensagens, feedback, navegação, responsividade) — ambos na raiz do projeto, já existentes desde as Sprints P2/P3 (29-30/06/2026). Esta seção não redefine nenhum dos dois, apenas torna obrigatória sua consulta antes do QA.

### Classificação obrigatória dos achados

Todo achado de Product Review deve ser classificado em **exatamente uma** das seis categorias abaixo:

| Categoria | Descrição | Bloqueia? |
|---|---|---|
| **A. Problema Funcional** | Algo não funciona como deveria (ação não produz efeito, dado derivado não atualiza, botão trava) | **Sim — sempre** |
| **B. Problema de UX** | Fluxo, feedback, mensagens ou confirmações abaixo do padrão de `UX_GUIDELINES.md` | Não |
| **C. Problema de UI** | Componente, cor, espaçamento ou estado visual fora de `DESIGN_SYSTEM.md` | Não |
| **D. Problema de Navegação** | Link/botão incorreto, contexto de volta ausente, fluxo Mestre/Detalhe inconsistente | Não |
| **E. Problema de Acessibilidade** | `aria-label`, contraste, foco ou navegação por teclado ausentes/incorretos | Não |
| **F. Melhoria** | Oportunidade de evolução, não decorrente de violação nem de decisão já tomada | Não |

**Somente a categoria A bloqueia a homologação técnica.** As categorias B–F geram backlog priorizado — nunca impedem a sprint de seguir para o QA (Seção 17) nem para o encerramento, mesma lógica de não-bloqueio já aplicada a Observação Técnica/Melhoria Futura na Seção 24, mas com taxonomia própria e distinta (a de Product Review avalia produto; a da Seção 24 avalia conformidade de processo/arquitetura — nunca misturar as duas classificações).

### Quem executa

Sub-agent `product-reviewer` (`.claude/agents/product-reviewer.md`, Sprint G.6) — nunca implementa ou corrige o que encontra, apenas classifica e reporta, mesmo princípio já aplicado a `ai-qa-engineer`/`ai-governance-officer`. Ver `.claude/skills/product-review/SKILL.md` e `.claude/playbooks/PRODUCT_REVIEW_PLAYBOOK.md` para o procedimento completo.

### Limitação de ambiente

Sem navegador disponível neste ambiente de desenvolvimento, a revisão é feita por leitura de código (classes Tailwind, estrutura JSX, texto exibido, presença dos estados exigidos) contra `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md` — mesma limitação já registrada em todo QA funcional deste projeto desde a Sprint 2.D.5. Isso não dispensa a etapa; apenas define o método disponível.

---

## 16.6. Processo de Demo Validation (a partir da Sprint T.3)

Executado após o Product Review (Seção 16.5, quando aplicável) e antes do QA (Seção 17), **sempre que a sprint implementou ou alterou Frontend**. Distinto de Product Review: Product Review avalia a qualidade da experiência de uma página isolada; Demo Validation avalia se o **fluxo de negócio ponta a ponta** — atravessando várias páginas/módulos, do ponto de vista de quem nunca viu o sistema — continua íntegro e demonstrável. Ver `PLATFORM_OVERVIEW.md`, "Experience Review vs. Platform Review", para a distinção equivalente já estabelecida entre as outras duas disciplinas de revisão — Demo Validation é uma terceira disciplina, paralela e nunca sobreposta às outras duas.

### Objetivo

Confirmar, contra o ambiente de demonstração (`DEMO_ENVIRONMENT.md`), que:

- o fluxo completo do negócio (`DEMO_GUIDE.md`, "Fluxo sugerido") continua funcionando de ponta a ponta;
- a integração entre módulos tocados pela sprint não introduziu inconsistência de dados frente ao `DEMO_DATASET.md`;
- a usabilidade do fluxo, para um usuário que nunca viu o sistema, permanece clara.

### Fonte de verdade

`DEMO_GUIDE.md` e `DEMO_DATASET.md` (raiz do projeto, Sprint T.3) — não redefinidos aqui.

### Classificação obrigatória dos achados

| Classificação | Descrição | Bloqueia? |
|---|---|---|
| **Quebra de fluxo** | Um passo do "Fluxo sugerido" (`DEMO_GUIDE.md`) deixou de funcionar por causa da sprint corrente | Sim |
| **Lacuna de escopo futuro** | Um passo do fluxo depende de um módulo ainda não implementado (`MENU_STRUCTURE.md`) — não é regressão da sprint corrente | Não |

Mesma lógica de não-bloqueio já aplicada a Platform Review (Seção 16.4): nunca converter uma lacuna de escopo futuro em bloqueio de uma sprint que não foi encomendada para resolvê-la.

### Quem executa

Dentro do fluxo de sessão única (`ERP_DEVELOPMENT_WORKFLOW.md`), a própria IA que implementou a sprint, seguindo `DEMO_GUIDE.md`. Quando Sub-agents reais são usados, não há Sub-agent dedicado a esta etapa nesta sprint — `ai-qa-engineer` a absorve como parte da validação funcional (`ERP_DEVELOPMENT_WORKFLOW.md`, item 10), já que Demo Validation usa o mesmo ambiente de dados que o QA de regressão (Seção 17, "QA de Regressão"). Criar um Sub-agent dedicado exigiria nova ADR (`PROJECT_GOVERNANCE.md` Seção 13.6) — fora do escopo desta sprint.

### Limitação de ambiente

Mesma limitação já registrada em Product Review (Seção 16.5): sem automação de navegador disponível (`DEMO_ENVIRONMENT.md`, "Contexto"), a validação é manual, seguindo o roteiro de `DEMO_GUIDE.md` — não dispensa a etapa, apenas define o método disponível até que uma ferramenta de automação esteja acessível.

---

## 17. Processo de QA

Executado após a revisão técnica, antes do aceite. A IA executa e apresenta evidências ao usuário.

### QA de Schema (Sprint {M}.1)

```bash
# Executar em sequência (parar servidor dev antes no Windows)
npx prisma db push                    # sincronizar schema com banco
npm run db:generate                   # regenerar Prisma Client
npx prisma studio                     # verificar modelos criados visualmente
```

**Evidência esperada:** captura do terminal com `✓ Your database is now in sync` e lista dos modelos no Studio.

### QA de API (Sprint {M}.4)

```powershell
# GET — listar
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/suppliers" -Method GET

# POST — criar
$body = '{"name":"Fornecedor Teste","active":true}'
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/suppliers" -Method POST -Body $body -ContentType "application/json"

# Sem auth — deve retornar 401
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/suppliers" -Method POST -Body $body -ContentType "application/json"
```

**Evidência esperada:** status 200/201 com dados, 401 sem auth, 400 com body inválido.

### QA de Front-end (Sprint {M}.5)

```
1. Navegar até a página no browser (http://localhost:3000/admin/{modulo})
2. Verificar carregamento (skeleton → dados)
3. Testar formulário: campos obrigatórios, máscara, validação inline
4. Testar submissão: toast de loading → success
5. Testar erro: submeter campo inválido → toast de error + borda vermelha
6. Testar navegação: botão Voltar → /admin
7. Testar responsividade nos 3 cenários mínimos (Seção 8.8, a partir da Sprint G.6.2): Smartphone (mobile, max-w-app), Tablet e Desktop — comportamento de cada breakpoint em UX_GUIDELINES.md Seções 14–16. Nenhuma Sprint com Frontend encerra sem os 3 validados.
```

### QA de Regressão

```
Após qualquer sprint, verificar que as funcionalidades existentes não foram quebradas:
[ ] GET /api/config → retorna JSON com campos esperados
[ ] GET /api/products → retorna produtos do banco
[ ] POST /api/orders → cria pedido (testar com body completo)
[ ] /admin/config → carrega, salva e exibe toast de sucesso
[ ] / (vitrine) → produtos aparecem, carrinho funciona
```

---

## 18. Processo para utilização de IA (Claude, Cursor e outras ferramentas)

### Papel da IA neste projeto

A IA (Claude Code) atua como **engenheiro de implementação sênior**, responsável por:
- Ler e respeitar toda a documentação antes de implementar
- Seguir este documento de governança sem exceções
- Apresentar plano de implementação e aguardar aprovação antes de executar
- Executar uma microtarefa por vez
- Apresentar relatório de encerramento a cada sprint

### O que a IA NUNCA faz sem aprovação explícita

- Iniciar uma sprint sem aprovação
- Alterar schema do banco sem comunicar impacto
- Avançar para próxima sprint sem aceite da atual
- Criar documentos novos não solicitados
- Refatorar código fora do escopo da sprint em execução
- Usar `--no-verify`, `--force`, ou contornar hooks de git
- Fazer push para o repositório remoto
- Alterar variáveis de ambiente

### Fluxo obrigatório de interação

```
Usuário solicita sprint
  → IA lê documentação relevante
  → IA declara plano (arquivos, microtarefas, critérios de aceite)
  → IA aguarda aprovação
  → Usuário aprova
  → IA implementa microtarefa por microtarefa
  → IA executa Revisão Técnica
  → IA executa QA e apresenta evidências
  → IA atualiza documentação
  → IA apresenta relatório de encerramento
  → IA aguarda aceite
  → Usuário aceita → próxima sprint
```

### Uso de agentes fork

A IA pode usar agentes fork para tarefas de leitura e análise intensiva (ex: planejamento arquitetural), mas:
- O agente fork **nunca altera código** sem supervisão do agente principal
- O resultado do fork é sempre apresentado ao usuário antes de qualquer ação
- Tarefas de implementação são sempre executadas pelo agente principal

### Cursor e outras IAs

Se o usuário utilizar Cursor ou outra IA em paralelo:
- As sessões devem operar em **arquivos distintos** para evitar conflito
- Mudanças feitas por outra IA devem ser comunicadas ao Claude antes da próxima sessão
- Este documento de governança se aplica a qualquer agente que toque no projeto

---

## 19. Template oficial para novas Sprints

```markdown
# Sprint {N}.{LETRA}.{número} — {Camada}

**Módulo:** {N}.{LETRA} — {Nome do Módulo}
**Épico:** {N} — {Nome do Épico}
**Data:** {data}
**Tipo:** Implementação | Refatoração | Documentação | Correção

## Objetivo
{Uma frase descrevendo o que esta sprint entrega.}

## Dependências
- [ ] {Módulo ou sprint que deve existir antes desta}
- [ ] {Arquivo ou entidade que deve existir}

## Bloqueadores conhecidos
{Lista de problemas que impedem o início, se houver. Vazio = nenhum bloqueador.}

## Arquivos a criar
| Arquivo | Descrição |
|---------|-----------|
| `src/lib/repositories/supplierRepository.ts` | Queries Prisma para Supplier |

## Arquivos a editar
| Arquivo | Mudança |
|---------|---------|
| `src/lib/types.ts` | Adicionar interface `Supplier` e `SupplierInput` |

## Microtarefas
- [ ] MT-1: {verbo + objeto + arquivo}
- [ ] MT-2: {verbo + objeto + arquivo}

## Critérios de aceite
- [ ] {O que deve ser verdade quando a sprint terminar — verificável objetivamente}
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run lint` → 0 erros
- [ ] {Funcionalidade testada e funcionando}
```

---

## 20. Template oficial para Revisão Técnica

```markdown
# Revisão Técnica — Sprint {identificador}

**Data:** {data}
**Executor:** Claude Code

## Tipagem
| Verificação | Status | Observação |
|------------|--------|-----------|
| Sem `any` explícito | ✅/❌ | |
| Interfaces de props definidas | ✅/❌ | |
| Tipos de domínio em `types.ts` | ✅/❌ | |

## Arquitetura
| Verificação | Status | Observação |
|------------|--------|-----------|
| Route não acessa Prisma | ✅/❌ | |
| Service não retorna Response | ✅/❌ | |
| Validator é função pura | ✅/❌ | |
| Repository sem lógica de negócio | ✅/❌ | |

## Qualidade
| Verificação | Status | Observação |
|------------|--------|-----------|
| Sem duplicidade de lógica | ✅/❌ | |
| Sem imports de mock-data | ✅/❌ | |
| Sem hardcode de IDs | ✅/❌ | |

## Problemas encontrados
{Lista de problemas e como foram resolvidos. Vazio = nenhum problema.}

## Resultado
✅ APROVADA | ❌ REPROVADA (detalhar bloqueadores)
```

---

## 21. Template oficial para QA

```markdown
# QA — Sprint {identificador}

**Data:** {data}
**Executor:** Claude Code

## Validação de compilação
| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ 0 erros / ❌ N erros |
| `npm run lint` | ✅ 0 erros / ❌ N erros |
| `npm run dev` | ✅ servidor sobe / ❌ erro |

## Testes funcionais
| Caso de teste | Entrada | Resultado esperado | Status |
|-------------|---------|-------------------|--------|
| {descrição} | {dados} | {saída esperada} | ✅/❌ |

## Regressão
| Funcionalidade existente | Status |
|------------------------|--------|
| GET /api/config | ✅/❌ |
| GET /api/products | ✅/❌ |
| /admin/config carrega e salva | ✅/❌ |
| Vitrine exibe produtos | ✅/❌ |

## Evidências
{Output de comandos, respostas de API, screenshots quando aplicável.}

## Resultado
✅ APROVADO | ❌ REPROVADO (detalhar falhas)
```

---

## 22. Template oficial para Critérios de Aceite

```markdown
# Critérios de Aceite — Sprint {identificador}

## Entregáveis
- [ ] {Arquivo criado: caminho completo}
- [ ] {Funcionalidade: descrição objetiva}

## Validação técnica
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run lint` → 0 erros
- [ ] `npm run dev` → sem erro no terminal

## Validação funcional
- [ ] {Rota de API testada: método + URL + status esperado}
- [ ] {Comportamento de UI testado: o que o usuário vê}
- [ ] {Caso de erro testado: o que acontece com entrada inválida}

## Regressão
- [ ] Nenhuma funcionalidade existente quebrada

## Documentação
- [ ] CHANGELOG.md atualizado
- [ ] {Documento específico atualizado, se aplicável}

## Pendências identificadas (não bloqueiam o aceite)
- {Lista de melhorias ou dívidas identificadas durante a sprint, com ID KI/DT}
```

---

## 23. Definition of Done (DoD) — Encerramento de Módulo

Um módulo só pode ser declarado **concluído** quando todos os itens abaixo estiverem satisfeitos. Este checklist é aplicado no nível do módulo, após a última sprint de QA.

```
DEFINITION OF DONE — Módulo {N}.{LETRA} — {Nome}

SCHEMA E BANCO DE DADOS
[ ] Schema sincronizado com o banco (db push executado) — quando aplicável
[ ] Prisma Generate executado após db push — quando aplicável
[ ] Prisma Validate executado sem erros — sempre

QUALIDADE DE CÓDIGO
[ ] TypeScript sem erros (npx tsc --noEmit → 0 erros)
[ ] Lint sem erros (npm run lint → 0 erros)
[ ] Build concluída sem warnings (npm run build)

VALIDAÇÃO FUNCIONAL
[ ] APIs validadas (todos os endpoints do módulo testados com método, rota, body e status)
[ ] Front-end validado (todas as páginas do módulo navegadas no browser)
[ ] Testes manuais concluídos (fluxo happy path + pelo menos um caso de erro por endpoint)
[ ] Validação executada em ambiente sincronizado: banco confirmado compatível com `schema.prisma`
    (schema × banco físico coincidentes por evidência direta — não apenas `prisma generate` OK)
[ ] Validação executada com dados reais ou seeds oficiais (não tabelas vazias, não dado hipotético)

DOCUMENTAÇÃO
[ ] PLAN.md atualizado (status do módulo atualizado para "Concluído" com data)
[ ] CHANGELOG.md atualizado (entrada de encerramento do módulo registrada)
[ ] KNOWN_ISSUES.md revisado (KIs resolvidos marcados ✅; novos KIs identificados registrados)
[ ] ADR registrada em CLAUDE.md — quando houver alteração arquitetural no módulo

ACEITE
[ ] Aceite explícito do usuário recebido para o módulo como um todo
```

### Diferença entre DoD de Sprint e DoD de Módulo

| Nível | Checklist | Aplica quando |
|-------|-----------|---------------|
| **Sprint** | Seções 6 e 7 deste documento | Ao encerrar cada sprint individual |
| **Módulo** | Seção 23 (este checklist) | Ao encerrar o módulo completo (após sprint de QA) |

Um módulo com todas as sprints concluídas mas com pendência em qualquer item do DoD de Módulo **não está concluído**.

### Critério de evidência da Validação Funcional (ADR-013, a partir da Sprint I.2)

Validação funcional só conta para o DoD de Módulo quando executada em **ambiente sincronizado** (banco confirmado compatível com `schema.prisma` por evidência direta, não apenas `prisma generate` bem-sucedido) e com **dados reais ou seeds oficiais** (nunca tabelas vazias ou dado hipotético). Compilação (`tsc --noEmit`), lint, build ou revisão de código, isoladamente, **não substituem** e **não satisfazem** este critério — são pré-requisitos técnicos, não validação funcional. Ver `CLAUDE.md`, ADR-013.

---

## 24. Resultado das Auditorias

Toda auditoria arquitetural ou documental — de sprint, de módulo, ou de padronização entre módulos — deverá classificar cada observação encontrada em **exatamente uma** das três categorias abaixo. As categorias nunca devem ser misturadas.

### A) Inconsistência

Viola uma regra obrigatória deste documento (`PROJECT_GOVERNANCE.md`) ou de `REGRAS_NEGOCIO.md`.

**Deve obrigatoriamente ser corrigida antes do encerramento da sprint ou módulo em auditoria.**

### B) Observação Técnica

Representa uma decisão arquitetural válida — consequência natural do domínio, do escopo já aprovado de uma sprint, ou de uma decisão já registrada em CHANGELOG/PLAN.

**Não bloqueia a sprint nem o módulo.** Deve ser registrada no relatório da auditoria, sem exigir ação.

### C) Melhoria Futura

Representa uma possível evolução, não decorrente de uma violação nem de uma decisão já tomada.

**Não exige alteração imediata.** Pode ser registrada como recomendação para uma sprint futura, nunca implementada no escopo da auditoria em curso.

Toda auditoria realizada a partir deste documento deverá utilizar exatamente esta classificação.

Uma Observação Técnica ou Melhoria Futura jamais poderá ser utilizada para impedir o encerramento de uma sprint ou módulo. Somente uma Inconsistência possui caráter bloqueante.

---

## 25. Checklist obrigatório para encerramento de módulo

Este checklist complementa o Definition of Done (Seção 23). Em caso de conflito, prevalece sempre o Definition of Done.

Checklist de verificação rápida a ser aplicado, em conjunto com o DoD completo da Seção 23, antes de qualquer módulo ser marcado como "Concluído" no `PLAN.md`:

```
CHECKLIST DE ENCERRAMENTO — Módulo {N}.{LETRA}

[ ] Todas as sprints do módulo concluídas
[ ] Auditoria arquitetural aprovada (Seção 24 — nenhuma Inconsistência aberta)
[ ] PLAN.md consistente (sem duplicidade de módulo ou sprint)
[ ] CHANGELOG.md consistente (uma seção por sprint, cronologia preservada)
[ ] npm run build executado sem erro
[ ] npm run lint executado sem erro
[ ] npx tsc --noEmit executado sem erro
[ ] Documentação revisada (PLAN.md, CHANGELOG.md e demais documentos impactados)
[ ] Nenhuma Inconsistência (categoria A da Seção 24) em aberto
```

Somente após todas as etapas acima o módulo poderá ser marcado como "Concluído".

Este checklist deverá ser executado exatamente uma única vez durante o encerramento oficial do módulo. Não deve ser aplicado ao encerramento de sprints.

---

## 26. Política de Evolução da Governança

O `PROJECT_GOVERNANCE.md` é considerado um documento estável.

Novas regras somente poderão ser adicionadas quando ocorrer pelo menos uma das situações abaixo:

- uma inconsistência arquitetural recorrente entre módulos;
- uma decisão de arquitetura aprovada por ADR;
- uma lacuna identificada durante auditoria que não possa ser resolvida pelas regras existentes.

Não devem ser adicionadas regras para resolver casos isolados ou específicos de uma única sprint.

Sempre que possível, novas regras devem generalizar um padrão reutilizável para todo o projeto.

O objetivo é manter o documento enxuto, estável e aplicável durante todo o ciclo de vida do projeto.

---

## Documentação de IA

O projeto possui documentação específica para colaboração entre Inteligências Artificiais.

Toda IA utilizada durante o desenvolvimento deverá respeitar obrigatoriamente os documentos localizados em:

docs/

Especialmente:

- AI_PROMPT_ORCHESTRATOR.md

Em caso de conflito entre estes documentos e o PROJECT_GOVERNANCE.md, prevalece o PROJECT_GOVERNANCE.md.
---

*Documento criado em 01/07/2026 — Sprint 2.0.2 — Módulo Governança do Projeto.*
*Atualizado em 01/07/2026 — Sprint 2.0.7 — Seção 13 expandida com Política de ADR; Seção 23 (DoD de Módulo) adicionada.*
*Atualizado em 02/07/2026 — Sprint 2.0.8 — Referência à [ADR-005](ADR-005.md) adicionada na Seção 10 (padrão de IDs oficialmente congelado).*
*Atualizado em 06/07/2026 — Revisão de governança pós Módulo 2.D (até Sprint 2.D.4): Seção 8.7 (Tipos compartilhados), Seção 24 (Resultado das Auditorias) e Seção 25 (Checklist de encerramento de módulo) adicionadas.*
*Atualizado em 06/07/2026 — Refinamento das Seções 8.7, 24 e 25: eliminação de ambiguidades (remoção de tipos locais após consolidação; caráter não bloqueante de Observação Técnica/Melhoria Futura; precedência do DoD sobre o checklist da Seção 25; checklist da Seção 25 aplicável apenas ao encerramento de módulo, não de sprint).*
*Atualizado em 06/07/2026 — Seção "Documentação de IA" corrigida (caminho `docs/ai/` → `docs/`, refletindo a localização real de AI_PROMPT_ORCHESTRATOR.md); Seção 26 (Política de Evolução da Governança) adicionada.*
*Atualizado em 15/07/2026 — Sprint G.6 (Product Review System): Seção 4 (fluxo obrigatório) recebeu o passo 3.5 Product Review; Seção 16.5 (Processo de Product Review) adicionada, com a taxonomia A–F e a regra de que somente Problema Funcional (A) bloqueia. ADR correspondente registrado em `CLAUDE.md` raiz.*
*Atualizado em 15/07/2026 — Sprint G.6.1 (Platform & Product Architecture Consolidation): Seção 4 recebeu o passo 3.4 Platform Review; Seção 16.4 (Processo de Platform Review) adicionada, com classificação bloqueante/não-bloqueante, distinta da taxonomia A–F de Product Review. `product-review`/`product-reviewer` preservados sem alteração, conforme exigido pela Ordem de Missão. ADR correspondente registrado em `CLAUDE.md` raiz.*
*Qualquer alteração neste documento exige aprovação explícita e registro de ADR.*
