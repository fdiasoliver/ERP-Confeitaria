# MODULE_2F_CLOSURE.md — Encerramento do Módulo 2.F (Produtos — Fase 1)

Documento produzido na Sprint 2.F (23/07/2026). **Natureza atípica deste encerramento, registrada explicitamente:** o Módulo 2.F nunca teve uma sprint própria de construção — seu escopo funcional completo (CRUD visual de `Product`: listagem, cadastro, edição, detalhes, pesquisa, filtros, ordenação, paginação, upload de imagem, preview, validação) foi implementado integralmente durante o **Módulo 2.J** (Sprints 2.J.2/2.J.2.1, 16–17/07/2026) e estendido pelo **Módulo 2.H** (Sprint 2.H.6, tela de detalhes, 20/07/2026), sem que ninguém tenha construído uma versão "Fase 1" isolada antes. Esta Sprint não construiu nada novo — verificou, validou formalmente sob o nome oficial "2.F" pela primeira vez, homologou e encerra o módulo.

**Origem do achado:** Etapa 1 (Planejamento) desta própria Sprint, por leitura direta do código (`src/app/admin/produtos/page.tsx`, `src/app/admin/produtos/[id]/page.tsx`), confirmado com o Product Owner via pergunta estruturada antes de qualquer ação — decisão explícita de **Verificar + Homologar + Encerrar**, sem reconstrução.

---

## 1. Escopo implementado

**Completo e homologado:** CRUD visual completo de `Product` — listagem (grid responsivo, paginação server-side, 12 itens/página), pesquisa (server-side, debounce), filtros (categoria, status), ordenação (6 opções), cadastro e edição (modal único, `EntityForm`), tela de detalhes dedicada, upload de imagem com preview (Storage real), validação client-side + server-side, ativação/desativação, exclusão física (bloqueada se o produto já foi usado em pedido).

**Superset do que "Fase 1" originalmente previa** (`PLAN.md`, versão congelada na Sprint 2.0.6: "CRUD admin + upload de imagem — `costPrice = 0`, sem RecipeLinker"): a implementação real já nasceu com RecipeLinker (vínculo N:N com `Recipe`) e `costPrice`/margem calculados automaticamente — funcionalidades nominalmente de "Fase 2" (Módulo 2.J) — e com vínculo a `Packaging` (Módulo 2.H). Nenhuma dessas três funcionalidades foi construída, alterada ou removida nesta Sprint — já existiam, confirmadas e preservadas como estão.

## 2. Arquitetura

Idêntica à já documentada em `MODULE_2J_CLOSURE.md` (Backend) — não duplicada aqui. Nenhuma camada de Backend foi tocada nesta Sprint, conforme restrição explícita da Ordem de Missão ("o Backend desenvolvido no módulo 2.J NÃO deverá ser refeito").

```
Frontend (src/app/admin/produtos/page.tsx, produtos/[id]/page.tsx)
        ↓ consome
src/lib/api/productApi.ts (cliente HTTP)
        ↓ compõe
src/components/admin/shared/* + src/components/admin/config/{UploadImage,FormPrimitives,ValidationSummary}
        (100% reutilizado — nenhum componente novo criado nesta Sprint)
```

## 3. Entidades e APIs

Sem alteração — ver `MODULE_2J_CLOSURE.md` Seções 3–4 (`Product`, `ProductRecipe`, rotas `/api/admin/products/**`) e `MODULE_2H_CLOSURE.md` Seções 3–4 (`ProductPackaging`, rotas `/api/admin/products/[id]/packagings/**`). Nenhum schema, endpoint ou contrato de API foi modificado nesta Sprint.

## 4. Funcionalidades validadas nesta Sprint (evidência real, ambiente sincronizado)

**Validação Técnica (23/07/2026):** `npx tsc --noEmit` (0 erros), `npm run lint` (0 erros/avisos), `npm run build` (build de produção completo, 0 erros), `npx prisma generate` (schema consistente).

**Validação Funcional (23/07/2026), Playwright, servidor de desenvolvimento local, banco Supabase real, login admin real — primeira vez formalmente registrada sob o nome "Sprint 2.F":**
15/15 cenários aprovados — listagem com contagem/grid, pesquisa server-side, filtro por categoria, filtro por status, ordenação (reordenação confirmada por chamada real à API), cadastro (produto novo criado, máscara BRL funcionando), validação (nome/categoria/preço vazios bloqueiam o submit com erros inline), edição (persistida), tela de detalhes (nome/status/preço/custo/margem/receitas/embalagens exibidos), navegação "Editar produto" (reabre modal via `?edit=id`), ativar/desativar, exclusão física (apenas o produto de teste criado nesta própria validação — nenhum dado de catálogo pré-existente foi tocado ou removido), estado vazio (pesquisa sem resultado), responsividade 390px (listagem e modal, sem overflow horizontal). Console e rede confirmados limpos durante o fluxo de uso real. Paginação não testável por volume insuficiente de produtos no ambiente (~9-10, menor que o `pageSize` de 12) — não registrado como falha.

**Homologação do Product Owner (23/07/2026), ótica de negócio:** mensagens, nomes de botões e navegação avaliados como claros para uso por quem não é desenvolvedor. **Nenhum defeito bloqueante encontrado.** Um achado não-bloqueante analisado explicitamente (ver Seção 5).

## 5. Achado desta Sprint (classificado, não corrigido)

**Backlog/Evolução (não Bug):** a tela de detalhes (`/admin/produtos/[id]`) não exibe `description`, `leadTimeDays` nem `featured` — mostra apenas dados comerciais (preço, custo, margem). Avaliado sob ótica de negócio: quem consulta os detalhes de um produto ainda enxerga o essencial para decisão (preço/custo/margem/receitas/embalagens); os três campos ausentes são secundários e continuam acessíveis com um clique em "Editar produto" — nenhum fluxo real fica bloqueado ou ambíguo. Não corrigido nesta Sprint (não é Bug, não bloqueia o encerramento). Candidato a uma melhoria futura pontual, sem sprint dedicada necessária.

## 6. Integrações

Sem alteração — mesmas de `MODULE_2J_CLOSURE.md` Seção 6 (`Recipe` via `recipeService`, `ProductCategory`) e `MODULE_2H_CLOSURE.md` Seção 6 (`Packaging` via `ProductPackaging`).

## 7. Pendências conhecidas

Nenhuma pendência nova introduzida por esta Sprint. Pendências pré-existentes (não deste módulo, já registradas): `Product.costPrice` ainda não soma o custo de `ProductPackaging` (Regra 11 do Módulo 2.H); `MENU_STRUCTURE.md`/`SCREENS.md` desatualizados desde a Sprint P1.

## 8. Lições aprendidas

- **Auditar antes de codificar evitou uma reconstrução completa e desnecessária:** a Ordem de Missão descrevia "Frontend completo" como algo a construir; a investigação da Etapa 1 confirmou, por leitura direta de código (não por suposição), que já existia — reconstruir teria sido retrabalho puro e um risco real de regressão em uma tela já validada (Sprint I.3, 17/07/2026).
- **Roadmap "Fase 1 → Fase 2" nem sempre reflete a ordem real de implementação:** já era um achado técnico confirmado para o Backend (ADR-011); esta Sprint confirma que o mesmo vale para o Frontend — construir a versão "completa" de uma vez, quando tecnicamente mais simples, é uma escolha de implementação legítima, mas deixa uma lacuna de nomenclatura/roadmap que só aparece quando alguém tenta fechar formalmente o módulo "anterior".
- **Sinalizar antes de agir evitou uma decisão unilateral de escopo:** em vez de decidir sozinho entre "reconstruir" e "só formalizar", a divergência entre a Ordem de Missão e o estado real do código foi levada ao Product Owner antes de qualquer ação — confirmado o caminho de menor risco.

---

Precedência: em caso de conflito entre este documento e `PLAN.md`, `CHANGELOG.md` ou `MODULE_2J_CLOSURE.md`/`MODULE_2H_CLOSURE.md`, os documentos originais sempre prevalecem.
