# ERP DOCE ATELIER

> **O que este documento é:** uma fotografia executiva do estado atual do projeto, para sincronizar rapidamente qualquer IA (ChatGPT, Gemini, Copilot, outra sessão do Claude etc.) que não tenha acesso contínuo ao histórico completo.
> **O que este documento não é:** não substitui nem duplica a Fonte Oficial de Verdade (`CLAUDE.md`, `PROJECT_GOVERNANCE.md`, `PLAN.md`, `CHANGELOG.md`, `QUALITY_GUIDELINES.md`, ADRs, documentação técnica). Não contém código, histórico completo, regras de negócio completas, arquitetura detalhada ou roadmap completo. Em caso de qualquer conflito, **prevalece a documentação oficial** — ver Seção "Instruções para outra IA".

---

## Estado Geral

| Campo | Valor |
|---|---|
| Versão | 0.1.0 (`package.json`) — projeto em desenvolvimento ativo, sem release formal ainda |
| Sprint atual | Nenhuma sprint em andamento — Sprint DS.1 encerrada, KI-18 corrigido |
| Módulo atual | Nenhum módulo funcional em desenvolvimento — Épico 2 encerrado, identidade visual atualizada |
| Data desta fotografia | 03/08/2026 |
| Status geral | 🟢 Estável — Épico 2 (12/12 módulos) encerrado; identidade visual redesenhada ("Ateliê Contemporâneo") e validada em admin + cliente final; KI-18 (achado incidental) investigado e corrigido; nenhum bloqueio técnico aberto |
| Última atualização | 03/08/2026 |
| Origem da atualização | Correção do KI-18 (chave React duplicada na vitrine) |
| Responsável pela atualização | IA (Claude Code), investigação direta com Playwright MCP, mediante pedido do Product Owner |

---

## Situação Atual

**O redesign do Design System (Sprint DS.1) foi concluído.** O Product Owner escolheu a direção "Ateliê Contemporâneo" entre 3 opções apresentadas visualmente (Artifact com comparação lado a lado, aplicadas ao mesmo Painel de Produção real) — decisão de gosto visual não foi inventada unilateralmente. A implementação trocou apenas os 6 valores hex dos tokens de cor já usados por nome em todo o app (`globals.css`), propagando a nova paleta automaticamente para admin e cliente final sem editar página por página — validado visualmente em 8/8 páginas, nenhuma cor da paleta antiga esquecida.

Antes de aplicar, contraste WCAG foi calculado (não estimado visualmente) para os pares texto/fundo mais usados — um problema real de contraste insuficiente foi encontrado no token `sage` e corrigido antes da implementação.

**`KI-18` investigado e corrigido logo em seguida (03/08/2026).** A hipótese inicial (produto duplicado vindo da API) estava errada — descartada por evidência real (`curl` direto em `/api/products`/`/api/occasions`, sem duplicata; `prisma.findMany` não pode duplicar linha por construção). Causa raiz real, confirmada por reprodução ao vivo com Playwright MCP: `OCCASIONS` (mock, `src/lib/mock-data.ts`) já incluía `{id: "all"}`, e `page.tsx` prependia `ALL_OCCASION` (mesmo id) por cima — colisão só no primeiro render com dado mock, nunca com dado real. Corrigido removendo a entrada redundante do mock.

Com o Épico 2 encerrado, o redesign concluído e o KI-18 corrigido, **resta apenas a política de LGPD/privacidade como Backlog Suggestion** — nenhuma outra pendência aberta desta sessão.

---

## Roadmap

**Épico 2 — encerrado (02/08/2026):** 2.A–2.L, 12/12 módulos concluídos.

**Sprint DS.1 — encerrada (03/08/2026):** redesign do Design System, direção "Ateliê Contemporâneo", aplicado a todo o app.

**Módulo/Épico em desenvolvimento:** nenhum.

**Próximo passo:** decisão do Product Owner entre (a) abrir um novo Épico do roadmap (`PLAN.md`, "Épicos" — ÉPICO 3 Inteligência Operacional, ÉPICO 4 Expansão Operacional, ÉPICO 5 Integrações Externas, ÉPICO 6 Experiência do Cliente, todos "Planejado"), ou (b) priorizar a Backlog Suggestion pendente (política de LGPD/privacidade).

---

## Últimas mudanças

**Módulo 2.L (Clientes, 02/08/2026):** último módulo do Épico 2 — encerra o épico inteiro (12/12).

**Sprint DS.1 (Redesign do Design System, 03/08/2026):** nova paleta "Ateliê Contemporâneo" (espresso/merengue/framboesa/pistache/areia) aplicada a todo o app via troca de valor dos 6 tokens já existentes — sem editar página por página. Contraste WCAG verificado antes de aplicar (ajuste em `sage`). Validação visual 8/8 páginas, admin e cliente final. Tipografia (Fraunces + DM Sans) mantida sem alteração. Primeira sprint sob o novo prefixo `DS.x` (ADR-018).

**Correção do KI-18 (03/08/2026):** investigação direta (Playwright MCP, reprodução ao vivo) refutou a hipótese inicial (produto duplicado na API) e achou a causa raiz real — entrada `{id: "all"}` duplicada entre `OCCASIONS` (mock) e `ALL_OCCASION` (`page.tsx`), só no primeiro render com dado mock. Corrigido em `mock-data.ts`, console confirmado limpo após.

---

## Últimas decisões

- **ADR-017** (31/07/2026): Arquiteto + Desenvolvedor centralizados no Claude Code, via orquestração por Sub-agents — 3 execuções reais concluídas com sucesso (Módulos 2.K, 2.L, Sprint DS.1).
- **ADR-018** (02/08/2026): prefixo `DS.x` reservado para sprints de Design System — consolidado junto de `G.x`/`I.x` em `PROJECT_GOVERNANCE.md` Seção 3.
- **Decisão de design do Product Owner (03/08/2026):** direção "Ateliê Contemporâneo", para admin e cliente final — escolhida por comparação visual de 3 opções, não descrita abstratamente.
- **Decisões pendentes do Product Owner** (`GOVERNANCE_DECISIONS.md`): futuro do Platform Review (GD-001), Product Review (GD-002), Demo Validation (GD-003) — sem relação com o Épico 2 ou a Sprint DS.1.

---

## Pendências

**Arquiteturais:**
- GD-001/GD-002/GD-003 (`GOVERNANCE_DECISIONS.md`) — futuro de Platform Review, Product Review, Demo Validation.

**Técnicas:**
- `Product.costPrice` ainda não soma o custo de `ProductPackaging` (Regra 11 do Módulo 2.H).
- Tela de detalhes de Produto sem `description`/`leadTimeDays`/`featured` — Backlog/Evolução da Sprint 2.F.
- Abas Semana/Calendário do Dashboard sem suporte real — Backlog do Módulo 2.K.
- Sem caminho de retrocesso de status autorizado por ADMIN (`REGRAS_NEGOCIO.md` 15.1.4) — Backlog do Módulo 2.K.
- Causa raiz de KI-10 (`POST /api/orders` sempre cria `Address` novo) — Backlog do Módulo 2.L.
- Nome duplicado `orderService.ts` entre `src/services/` (código morto) e `src/lib/` — Dívida Técnica.
- `MENU_STRUCTURE.md`/`SCREENS.md` desatualizados desde a Sprint P1.

**Do Product Owner:**
- Escolher o próximo passo: novo Épico ou política de LGPD/privacidade.
- Decidir GD-001/GD-002/GD-003 (não bloqueia o roadmap).

---

## Próxima decisão do Product Owner

Com o Épico 2 encerrado, o redesign concluído e o KI-18 corrigido, escolher o próximo passo: abrir um novo Épico (`PLAN.md`, "Épicos") ou priorizar a política de LGPD/privacidade (Backlog Suggestion). Em paralelo, seguem pendentes GD-001/GD-002/GD-003.

---

## Riscos

- **Ambiente de demonstração sem dado real:** `prisma/demo-seeds/` só tem arquitetura (ADR-008).
- **Visão multi-tenant (ADR-007) vs. implementação single-tenant real:** direção ainda não iniciada.
- **Precedente de colisão de numeração:** já ocorreu uma vez (`2.I`); ADR-016/ADR-018 mitigam com prefixos dedicados (`G.x`/`I.x`/`DS.x`).
- **Divergência roadmap × implementação real:** confirmada em 3 dos últimos 5 módulos/sprints — continuar checando código real antes de presumir o que falta.
- **LGPD/privacidade pendente sem prazo:** risco de ficar indefinidamente adiada se não retomada explicitamente.
- **Projeto sem próximo épico definido:** não há trabalho funcional em andamento nem escolhido — risco de perda de ritmo se a decisão do Product Owner demorar.

---

## Documentos Oficiais

Fonte Oficial de Verdade (nesta ordem de precedência em caso de conflito):

1. `CLAUDE.md` — permanente, stack, estrutura, convenções, ADRs
2. `PROJECT_GOVERNANCE.md` — regras e políticas do processo
3. `QUALITY_GUIDELINES.md` — companion operacional (checklists, classificação de achados, Mapa de Governança)
4. `PLAN.md` — roadmap vivo, status de módulo/sprint/épico, Backlog Suggestions
5. `CHANGELOG.md` — narrativa histórica de execução
6. `GOVERNANCE_DECISIONS.md` — decisões metodológicas pendentes/resolvidas
7. `REGRAS_NEGOCIO.md`, `ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `MODULES.md`, `KNOWN_ISSUES.md` — documentação técnica de domínio
8. `DESIGN_SYSTEM.md`, `UX_GUIDELINES.md` — padrões de interface (paleta atualizada na Sprint DS.1)
9. Documentos `MODULE_{X}_CLOSURE.md` — encerramento formal de cada módulo (12 documentos para o Épico 2)
10. `.claude/agents/` — Sub-agents da orquestração ativada pelo ADR-017

Lista completa de documentos e suas dependências: `QUALITY_GUIDELINES.md` Seção 6 ("Mapa de Governança").

---

## Limitações do documento

- **Fotografia, não fluxo contínuo:** reflete o estado no momento da última atualização — pode estar desatualizado durante a execução de uma sprint em andamento.
- **Não substitui leitura da documentação oficial** antes de qualquer implementação.
- **Não contém detalhe técnico suficiente para implementar** — não lista schema, endpoints, componentes ou regras de negócio; apenas aponta onde encontrá-los.
- **Não é validado automaticamente** — depende de atualização manual disciplinada ao final de cada Sprint Oficial (`PROJECT_GOVERNANCE.md` Seção 12).
- **Escopo de "Riscos"/"Pendências" é o conhecido no momento da fotografia** — não é uma varredura exaustiva do projeto.

---

## Instruções para outra IA

Este documento **não substitui** a documentação oficial listada acima — é apenas sincronização rápida de contexto. Ele é intencionalmente pequeno e superficial; nenhuma decisão deve ser tomada com base só nele.

**Sempre que houver qualquer conflito entre este documento e a documentação oficial, prevalece a documentação oficial** — este arquivo pode estar desatualizado entre uma sprint e outra.

Antes de implementar qualquer coisa neste projeto, leia pelo menos `CLAUDE.md` e `PROJECT_GOVERNANCE.md` na íntegra. E, como o projeto reforçou repetidamente: **confira o código real antes de assumir que algo falta** — o roadmap documentado nem sempre reflete o que já foi implementado ou corrigido como efeito colateral de outro módulo.

---

*Atualizado ao final de toda Sprint Oficial, depois de `CHANGELOG.md`/`PLAN.md`/ADRs já atualizados — nunca antes. Criado na Sprint G.9 (22/07/2026). Atualizado ao final da Sprint 2.F (23/07/2026), da Sprint G.10 (31/07/2026), do encerramento do Módulo 2.K (02/08/2026), do encerramento do Módulo 2.L / Épico 2 (02/08/2026), da Sprint DS.1 (03/08/2026) e da correção do KI-18 (03/08/2026).*
