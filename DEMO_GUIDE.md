# DEMO_GUIDE.md — Guia de Uso do Ambiente de Demonstração

Guia operacional da Plataforma de Demonstração, criado na Sprint T.3. Arquitetura em `DEMO_ENVIRONMENT.md`, conteúdo em `DEMO_DATASET.md`. Este documento responde apenas "como usar" — não redefine o que existe no ambiente nem por quê.

---

## Aviso de estado atual

Este guia documenta o **fluxo de uso pretendido** do ambiente de demonstração. A Sprint T.3 formaliza a arquitetura e o conteúdo (`DEMO_ENVIRONMENT.md`, `DEMO_DATASET.md`, `prisma/demo-seeds/README.md`) — a implementação real do script de seed de demonstração é trabalho de uma sprint futura (ver `prisma/demo-seeds/README.md`, "Como será utilizada"). Onde este guia descreve um comando ainda não implementado, isso está marcado explicitamente como **pendente de implementação**.

## 1. Objetivo

Permitir que qualquer pessoa — comercial, Product Owner, novo membro de equipe, ou uma sessão de Product/Platform Review — veja o ERP funcionando ponta a ponta, com dados realistas, sem depender de um banco de desenvolvimento em uso ativo nem de dado de cliente real.

## 2. Público-alvo

- **Product Owner** — homologação funcional e demonstração comercial.
- **Executor (sessão de implementação)** — Demo Validation (`PROJECT_GOVERNANCE.md` Seção 16.6) ao final de sprints com Frontend.
- **`product-reviewer` / `platform-reviewer`** — revisão de produto e de plataforma sobre um estado de dados conhecido e estável.
- **Novos membros da equipe interna do tenant** — treinamento, antes de operar o ambiente real.

## 3. Como iniciar *(pendente de implementação)*

```bash
npm install
npm run db:generate
npm run db:seed:demo     # pendente — script ainda não existe, ver prisma/demo-seeds/README.md
npm run dev
```

`db:seed:demo` é o nome pretendido do script (análogo a `db:seed` já existente para `prisma/seed.ts`) — populariza o banco apontado por `DATABASE_URL` com o conteúdo de `DEMO_DATASET.md`. Não roda contra o banco de produção nem sobrescreve dado de desenvolvimento em uso — recomendação: banco dedicado ao ambiente de demonstração, nunca o mesmo `DATABASE_URL` usado para `npm run dev` diário.

## 4. Como restaurar *(pendente de implementação)*

```bash
npm run db:reset:demo    # pendente — reseta e repopula o banco de demonstração do zero
```

Restaurar sempre que o ambiente for usado para demonstração comercial após um período de manipulação manual (ex. pedidos criados durante um treinamento) — o ambiente de demonstração deve voltar a um estado conhecido antes de cada nova sessão de uso, nunca acumular estado entre uma demonstração e outra.

## 5. Usuários disponíveis

Ver `DEMO_DATASET.md`, Seção 6 (Demo Users), para a lista completa com papel e escopo de acesso. Resumo de acesso:

| Persona | Login | Onde entrar |
|---|---|---|
| Administrador Demo | `admin@demo.doceatelier.com.br` | `/admin/login` |
| Operador Demo | `producao@demo.doceatelier.com.br` | `/admin/login` |
| Financeiro Demo | `financeiro@demo.doceatelier.com.br` | `/admin/login` (módulo Financeiro ainda 🔲 Planejado — login funciona, telas do módulo não existem ainda) |

Senha de demonstração: definida no momento da implementação do seed (`prisma/demo-seeds/README.md`) — nunca a mesma senha do usuário real de desenvolvimento (`admin123`, `prisma/seed.ts`), para não criar hábito de reutilizar credencial de demonstração em ambiente real.

## 6. Fluxo sugerido

Sequência recomendada para demonstrar o negócio ponta a ponta, na ordem em que um cliente e a equipe interna realmente vivenciam o fluxo (`CLAUDE.md` raiz, "Fluxo da aplicação"):

1. **Vitrine (`/`)** — navegar pelas categorias e ocasiões do Demo Dataset, adicionar um produto ao carrinho.
2. **Checkout (`/checkout`)** — completar um pedido de demonstração (data de entrega, tipo de entrega, pagamento).
3. **Login administrativo (`/admin/login`)** — entrar como Administrador Demo.
4. **Produção (`/admin/producao`)** — como Operador Demo, mover o pedido recém-criado pelas colunas do Kanban (Confirmado → Em produção → Pronto → Entregue).
5. **Pedidos do cliente (`/pedidos`)** — voltar como cliente e conferir o status atualizado.
6. **Configuração da empresa (`/admin/config`)** — como Administrador Demo, mostrar o módulo já 100% implementado (Sprint 1.3).

Este fluxo é a referência usada pelo novo critério de Product Review (`PROJECT_GOVERNANCE.md` Seção 16.5; `.claude/skills/product-review/checklists/ux-checklist.md`): "o fluxo completo do negócio é claro para um usuário que nunca viu o sistema?".

## 7. Limitações

- **Sem automação de navegador.** A Sprint T.2C confirmou, por evidência real, que o Playwright MCP está indisponível nesta instalação — o fluxo acima é executado manualmente. Ver `DEMO_ENVIRONMENT.md`, "Contexto".
- **Sem integrações externas reais.** WhatsApp, PIX e Google Maps não são chamados — pedidos de demonstração não disparam mensagem real, QR Code PIX real, nem cálculo real de distância. `DEMO_DATASET.md`, Seção 8.
- **Módulos ainda não implementados continuam ausentes no ambiente de demonstração** — o Demo Guide não antecipa tela que não existe (ex. `/admin/financeiro`, `/admin/pedidos` real) — ver `MENU_STRUCTURE.md` para o status real de cada módulo.
- **Não é ambiente de carga/performance.** O Demo Dataset (`DEMO_DATASET.md`) é dimensionado para demonstrar o fluxo, não para testar volume — não usar este ambiente para avaliar performance sob carga real.

---

Precedência: em caso de conflito entre este documento e `DEMO_ENVIRONMENT.md`, `DEMO_DATASET.md` ou `PROJECT_GOVERNANCE.md`, os documentos originais sempre prevalecem — este documento é o guia de uso, não a fonte de arquitetura ou conteúdo.

<!-- Histórico: v1.0 criada em 16/07/2026 — Sprint T.3 (Demo Environment & Product Validation Platform). -->
