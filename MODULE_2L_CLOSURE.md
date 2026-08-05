# MODULE_2L_CLOSURE.md — Encerramento do Módulo 2.L (Clientes)

Documento produzido na Sprint 2.L.5 (02/08/2026). **Último módulo do roadmap congelado do Épico 2** (`EPICO_2_PLANEJAMENTO.md`, Sprint 2.0.5) — seu encerramento fecha o Épico 2 (Cadastros Mestres + Dashboard Operacional) por completo, 12 módulos (2.A–2.L). Segundo módulo conduzido integralmente pela orquestração de Sub-agents (ADR-017), depois do Módulo 2.K.

---

## 1. Escopo implementado

**Completo e homologado:** listagem `/admin/clientes` (nome, telefone, LTV, último pedido, busca por nome/telefone, paginação server-side); perfil `/admin/clientes/[id]` (dados do cliente, telefone sempre somente-leitura, notas internas editáveis com limite de 2000 caracteres, endereços deduplicados **só na exibição** com contagem real de pedidos por grupo, histórico completo de pedidos). Resolve KI-10 (parcialmente, ver Seção 7) e BT-11 (`EPICO_2_PLANEJAMENTO.md`).

**Decisão arquitetural central do módulo:** deduplicação de `Address` (KI-10/BT-11) é agregação **de exibição apenas** — nunca escreve/mescla `Address` no banco. Decidido pelo `ai-solution-architect` no Planejamento: mesclar de verdade reescreveria histórico de pedidos e exigiria hard delete de entidade referenciada por `Order`, proibido sem ADR (`Address` não tem campo `active`, diferente do padrão soft-delete do projeto).

**Achado real corrigido durante o módulo:** `customerService.ts` (2.L.2) continha um comentário afirmando que `Order.addressId` já estava disponível no histórico de pedidos para permitir a contagem "usado em N pedidos" por grupo de endereço — não estava. Corrigido na Sprint 2.L.4 (Service + Frontend), confirmado por evidência real na Validação Funcional.

## 2. Arquitetura

```
Route Handler (src/app/api/admin/customers/**)
        ↓ chama
Service (src/lib/customerService.ts)
        ↓ chama
Repository (src/lib/repositories/customerRepository.ts)
        ↓ chama
Prisma (singleton src/lib/prisma.ts)

Frontend (src/app/admin/clientes/**)
        ↓ consome
src/lib/api/customerApi.ts (cliente HTTP)
        ↓ compõe
src/components/admin/shared/* (100% reutilizado, nenhum componente novo)
```

- **Route Handlers:** `requireAdmin()` primeiro, mapeamento de erro por `instanceof` (`CustomerNotFoundError`→404, `CustomerValidationFailedError`→400), `responses.ts`. `PATCH` descarta silenciosamente qualquer campo além de `notes` (reforça imutabilidade de `phone`).
- **Service (`customerService.ts`):** `listCustomers`, `getCustomerById`, `updateCustomerNotes`, `listAddressesGrouped` (função pura, síncrona, nunca toca `prisma`).
- **Repository:** só Prisma Client tipado; LTV/último pedido via `Order.groupBy` (uma única query de agregação por página, evita N+1).
- **Front-end:** consome exclusivamente `customerApi.ts`. Sem formulário de criação de `Customer` (não existe no escopo — cliente só é criado via upsert no checkout).

## 3. Entidades e APIs

Nenhuma mudança de schema — `Customer.notes` já existia antes deste módulo.

| Método | Rota | Autenticação |
|---|---|---|
| `GET` | `/api/admin/customers` | Admin |
| `GET`/`PATCH` | `/api/admin/customers/[id]` | Admin (`PATCH` só aceita `notes`) |
| `GET` | `/api/admin/customers/[id]/orders` | Admin |

## 4. Funcionalidades validadas (evidência real, ambiente sincronizado)

**Validação Técnica (02/08/2026):** `npx tsc --noEmit` (0 erros), `npm run lint` (0 erros/avisos), `npm run build` (build de produção completo, 0 erros, todas as rotas novas presentes).

**Validação Funcional (02/08/2026), Playwright, servidor de desenvolvimento local, banco Supabase real, login admin real:** 13/13 cenários aprovados — listagem com dado real, busca por nome/telefone, navegação para detalhe, telefone confirmadamente somente-leitura com explicação visível na própria tela, notas editadas/persistidas com contador de caracteres funcionando, **grupo de endereço mostrando "Usado em N pedidos" com contagem real** (confirma a correção da Sprint 2.L.4), histórico de pedidos real, responsividade 390px sem overflow. Console e rede confirmados limpos. Paginação e estado "sem pedidos" não testáveis por volume insuficiente de dados no ambiente — não registrados como falha. **Nenhum Bug encontrado.**

**Homologação do Product Owner (02/08/2026), ótica de negócio:** nenhum achado, nem Bug nem Backlog/Evolução — mensagens claras, telefone somente-leitura já auto-explicado na tela, tela avaliada como diretamente utilizável por um funcionário não-técnico.

## 5. Integrações

| Módulo | Tipo de integração |
|---|---|
| Orders (pré-existente) | Leitura via `Order.groupBy` (LTV/último pedido) e `include` (histórico completo) — nenhuma escrita |
| `Address` (pré-existente) | Leitura e agregação de exibição — nenhuma escrita |

## 6. Pendências conhecidas

- **Causa raiz de KI-10 não resolvida:** `POST /api/orders` continua criando um `Address` novo a cada pedido, mesmo para cliente recorrente com endereço já cadastrado — fora do escopo deste módulo (domínio Orders/Checkout), registrado como Backlog Suggestion separado (`PLAN.md`).
- **LGPD/privacidade:** módulo expõe telefone, endereço e notas internas de clientes reais, sem política registrada em `REGRAS_NEGOCIO.md` nem controle de granularidade por `UserRole`. Registrado como Backlog Suggestion (`PLAN.md`), por decisão explícita do Product Owner de tratar depois — não bloqueou este módulo.
- **Sem criação/edição manual de `Customer`** (nome/telefone/e-mail) pela equipe — decisão de escopo do Planejamento, não uma lacuna.

## 7. Limitações conhecidas

- `KI-10` fica com status **PARCIAL**, não "Resolvido" — a deduplicação de exibição resolve o sintoma visível na tela de Clientes, mas o acúmulo de `Address` no banco continua a cada pedido novo.

## 8. Lições aprendidas — segunda execução da orquestração por Sub-agents (ADR-017)

- **Roadmap e realidade alinhados desta vez** — ao contrário dos três achados anteriores (Backend de Produtos, Frontend de Produtos, badges de status do Dashboard), a auditoria de código do Planejamento confirmou que nada de `Customer` já existia no admin. Não é a regra, é a exceção — reforça que auditar antes de codificar continua necessário mesmo quando o resultado da auditoria é "está tudo como o roadmap diz".
- **Decisão arquitetural genuinamente ambígua resolvida via `ai-solution-architect` antes de qualquer código** (deduplicação de exibição vs. mesclagem real de dado) — mesmo padrão que evitou reescrever histórico de pedidos por engano.
- **Uma divergência real (comentário desatualizado sobre `addressId`) encontrada, corrigida com aprovação explícita, confirmada por evidência (Playwright) antes do encerramento** — nunca aceita "deveria funcionar" como critério.
- **Nenhuma etapa de homologação retornou achado algum** — primeira vez neste projeto que uma Homologação do Product Owner não gerou nenhum item, nem Bug nem Backlog/Evolução; registrado como dado real, não como ausência de rigor (mesmo roteiro de perguntas de negócio dos módulos anteriores foi aplicado).

## 9. Encerramento do Épico 2

Com o Módulo 2.L encerrado, o **Épico 2 — Cadastros Mestres + Dashboard Operacional está completo**: 12 módulos (2.A Consolidação Técnica, 2.B Categorias, 2.C Ocasiões, 2.D Unidades de Medida, 2.E Fornecedores, 2.F Produtos Fase 1, 2.G Ingredientes, 2.H Embalagens, 2.I Receitas, 2.J Produtos Fase 2, 2.K Dashboard Operacional, 2.L Clientes), todos com `MODULE_{X}_CLOSURE.md` próprio, todos revalidados em ambiente sincronizado com dados reais. Próximo passo de roadmap fica para o Product Owner decidir — não há mais módulo congelado pendente no Épico 2.

---

Precedência: em caso de conflito entre este documento e `PLAN.md`, `CHANGELOG.md` ou `REGRAS_NEGOCIO.md`, os documentos originais sempre prevalecem.
