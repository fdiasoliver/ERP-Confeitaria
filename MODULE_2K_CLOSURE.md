# MODULE_2K_CLOSURE.md — Encerramento do Módulo 2.K (Dashboard Operacional)

Documento produzido na Sprint 2.K.4 (02/08/2026). Primeiro módulo conduzido integralmente pela orquestração de Sub-agents ativada na Sprint G.10 (ADR-017) — Planejamento por `ai-project-manager`, Backend por `ai-backend-engineer`, Frontend por `ai-frontend-engineer`, QA/Homologação por fork Playwright, encerramento pela sessão principal.

---

## 1. Escopo implementado

**Completo e homologado:** Kanban real de pedidos (4 colunas: Confirmado, Em produção, Pronto, Entregue — `SAIU_ENTREGA` agrupado em "Entregue"), com mudança de status validada contra `VALID_TRANSITIONS` e histórico registrado (`OrderStatusHistory`); abas Hoje/Amanhã com data real (Semana/Calendário como placeholder "em construção", sem suporte a intervalo de datas); seção "Urgente — entrega hoje" dinâmica; stat cards reais; consolidação de ingredientes por período (reaproveitando conversão de unidade já testada em Receitas); CMV Hoje/Últimos 7 dias (reaproveitando `costPrice` já calculado em Produtos). Resolve KI-04/TD-11/BT-08 (`KNOWN_ISSUES.md`, `MODULES.md`, `EPICO_2_PLANEJAMENTO.md`).

**Achado de segurança corrigido durante o módulo (não pré-existente a esta sprint, mas nunca resolvido antes):** a rota antiga `PATCH /api/orders/[id]/status` só verificava sessão, não `requireAdmin()` — qualquer cliente autenticado podia alterar status de pedido. Removida na Sprint 2.K.2, substituída por `/api/admin/orders/[id]/status`.

**Achado de regra de negócio corrigido durante o módulo:** contador de "pedidos urgentes" incluía `RASCUNHO`/`CANCELADO` (leitura literal de `REGRAS_NEGOCIO.md` 14.1, que só excluía `ENTREGUE`) — decisão do Product Owner de excluir os dois também; `REGRAS_NEGOCIO.md` 14.1 atualizada.

## 2. Arquitetura

```
Route Handler (src/app/api/admin/orders/**, orders/[id]/status/**, orders/consolidation/**, cmv/**)
        ↓ chama
Service (src/lib/orderService.ts, src/lib/cmvService.ts)
        ↓ chama
Repository (src/lib/repositories/orderRepository.ts)
        ↓ chama
Prisma (singleton src/lib/prisma.ts)

Frontend (src/app/admin/producao/page.tsx)
        ↓ consome
src/lib/api/orderAdminApi.ts (cliente HTTP)
        ↓ compõe
src/components/admin/shared/* (100% reutilizado, nenhum componente novo de Design System)
```

- **Route Handlers:** `requireAdmin()` primeiro, mapeamento de erro por `instanceof` (`OrderNotFoundError`→404, `InvalidStatusTransitionError`→409 `conflict`), `responses.ts`.
- **Service:** `orderService.ts` (transições, Kanban, consolidação — reaproveita `recipeService.resolveConversionFactor`), `cmvService.ts` (reaproveita `productService.getProductById`).
- **Repository:** só Prisma Client tipado; `countByDateExcludingStatus` generalizada para lista de status (não duplicada por caso de uso).
- **Front-end:** consome exclusivamente `orderAdminApi.ts`. Design System atual reutilizado como está — pedido de redesign do Product Owner registrado como Backlog Suggestion separada (`PLAN.md`), não implementado neste módulo.

## 3. Entidades e APIs

Nenhuma mudança de schema — módulo inteiro construído sobre `Order`/`OrderItem`/`OrderStatusHistory` já existentes.

| Método | Rota | Autenticação |
|---|---|---|
| `GET` | `/api/admin/orders` | Admin |
| `PATCH` | `/api/admin/orders/[id]/status` | Admin |
| `GET` | `/api/admin/orders/consolidation` | Admin |
| `GET` | `/api/admin/cmv` | Admin |

Rota removida: `PATCH /api/orders/[id]/status` (insegura, sem chamador real confirmado antes da remoção).

## 4. Funcionalidades validadas (evidência real, ambiente sincronizado)

**Validação Técnica (02/08/2026):** `npx tsc --noEmit` (0 erros), `npm run lint` (0 erros/avisos), `npm run build` (build de produção completo, 0 erros, todas as rotas novas presentes, rota antiga confirmadamente ausente).

**Validação Funcional (02/08/2026), Playwright, servidor de desenvolvimento local, banco Supabase real, login admin real:** 13/13 cenários aprovados — Kanban com dado real, troca de aba, placeholder de Semana/Calendário, contador de urgentes consistente com a lista exibida (divergência corrigida nesta sessão, reconfirmada), mudança de status persistida após reload, consolidação de ingredientes (estado vazio confirmado; caso "com dado" não testável por limitação do dado de teste disponível, não do sistema), CMV Hoje/Semana em R$, console e rede limpos, responsividade 390px sem overflow. Transição inválida (409) confirmada por revisão de código (não reproduzível organicamente via UI, já que o seletor só oferece transições válidas por design). **Nenhum Bug encontrado.**

**Homologação do Product Owner (02/08/2026), ótica de negócio:** nenhum defeito bloqueante. 2 achados classificados Backlog/Evolução: (1) ausência do badge de data no topo do header padrão — não gera confusão real na prática; (2) StatCard "Urgentes" mantém a contagem de hoje mesmo na aba "Amanhã" (comportamento correto por design, mas identificado como ponto de clareza visual a considerar no futuro).

## 5. Integrações

| Módulo | Tipo de integração |
|---|---|
| `Recipe`/`Ingredient` (2.I/2.G) | Leitura via `recipeService.resolveConversionFactor`, reaproveitada — não duplicada |
| `Product` (2.J) | Leitura via `productService.getProductById`, para `costPrice` atual no cálculo de CMV |
| Orders (pré-existente) | Camada de acesso migrada de acesso direto ao Prisma na rota para Repository/Service (padrão do projeto), corrigindo também a falha de autorização já registrada |

## 6. Pendências conhecidas

- **Abas Semana/Calendário sem suporte real:** a API não aceita intervalo de datas (`getKanbanData` só aceita um único dia ou nenhum filtro) — placeholder "em construção" mantido. Candidata a sprint futura, se houver necessidade real confirmada.
- **Sem caminho de retrocesso de status autorizado por ADMIN:** `REGRAS_NEGOCIO.md` 15.1.4 menciona a possibilidade, nenhuma camada implementa essa exceção hoje (herdado da rota antiga, nunca implementado em nenhum momento do projeto). Registrado como Backlog, não resolvido neste módulo.
- **Divergência de nome entre camadas:** `src/services/orderService.ts` (cliente HTTP antigo, pré-Épico 2, código morto — sem chamador real) e `src/lib/orderService.ts` (Service novo deste módulo) — mesmo nome, camadas diferentes. Candidato a padronização futura (Dívida Técnica), não bloqueante.
- **`CMVLineDTO.items` não exibido linha a linha no Frontend** — só o total (`totalCMV`) é mostrado; decisão de escopo desta sprint, dado disponível na API se uma tela futura precisar detalhar.

## 7. Limitações conhecidas

- CMV usa o `costPrice` **atual** dos insumos, não o custo no momento da venda (sem snapshot histórico de custo em `OrderItem`) — limitação já aceita em `REGRAS_NEGOCIO.md` 13.7, não uma dívida deste módulo.
- `calculateCMV` pode teoricamente lançar `ProductNotFoundError` se um produto referenciado em pedido `ENTREGUE` não existir mais — cenário bloqueado na prática por `ProductInUseError` (produto em uso não pode ser excluído), tratado com `internalError()` genérico. Registrado como Observação Técnica, não corrigido (achado da Sprint 2.K.4).

## 8. Lições aprendidas — primeira execução da orquestração por Sub-agents (ADR-017)

- **Funcionou sem fricção real:** ao contrário do risco registrado em `PROJECT_STATE.md` após a ativação do ADR-017 ("nunca exercitada... risco operacional real de fricção"), as 5 delegações reais deste módulo (`ai-project-manager` uma vez, `ai-backend-engineer` quatro vezes, `ai-frontend-engineer` duas vezes) devolveram resultado estruturado, reportaram divergências reais sem decidir sozinhas, e nenhuma precisou ser relançada por resultado inválido.
- **Auditoria de código real evitou reconstrução e encontrou um achado de segurança real:** o Planejamento (`ai-project-manager`) confirmou por leitura direta que KI-04 nunca fora resolvido (ao contrário do padrão da Sprint 2.F, onde o trabalho já existia) — e, no processo, encontrou uma falha de autorização real (rota sem `requireAdmin()`), não hipotética.
- **Divergências reportadas, não resolvidas silenciosamente, em 5 pontos diferentes ao longo do módulo** (coluna de `SAIU_ENTREGA`, contador de urgentes, parâmetro `status` não utilizado, erro teórico de `calculateCMV`, nomenclatura duplicada de Service) — cada uma submetida ao Product Owner ou registrada como achado não-bloqueante, nunca decidida unilateralmente por um Sub-agent.
- **Redesign visual solicitado no meio do módulo não desviou o escopo:** registrado como Backlog Suggestion (`PLAN.md`), sem interferir na Sprint em andamento — aplicação direta da regra de bloqueio da Seção 4.3 (`PROJECT_GOVERNANCE.md`).

---

Precedência: em caso de conflito entre este documento e `PLAN.md`, `CHANGELOG.md` ou `REGRAS_NEGOCIO.md`, os documentos originais sempre prevalecem.
