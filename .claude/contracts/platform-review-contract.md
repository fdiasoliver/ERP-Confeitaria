# platform-review-contract.md — Contrato de Platform Review

Parte da camada Contracts do AI Operating System (`.claude/architecture/LAYER_MODEL.md`, Camada 4). Criado na Sprint G.6.1 (Platform & Product Architecture Consolidation), evolução de infraestrutura autorizada explicitamente pelo Product Owner via Ordem de Missão dedicada (`PROJECT_GOVERNANCE.md` Seção 13.7). Deriva de `agent-contract.md` (estrutura de Sub-agent) e `product-review-contract.md` (padrão irmão, Sprint G.6, do qual este contrato reutiliza a estrutura sem duplicar o conteúdo específico de UX/UI) — formaliza especificamente entradas/saídas/responsabilidades/artefatos/limites/integração do papel de Platform Review. Aplica-se ao Sub-agent `platform-reviewer` (`.claude/agents/platform-reviewer.md`) e à Skill `platform-review` (`.claude/skills/platform-review/SKILL.md`).

## 1. Entradas

- Código de Backend e/ou Frontend já implementado (schema, Repository, Service, Route, página admin).
- `PLATFORM_OVERVIEW.md` e `ERP_PRODUCT_VISION.md` (raiz do projeto) — fonte de verdade de plataforma, consultados sob demanda, nunca duplicados.
- `skills/platform-review/checklists/platform-checklist.md`.

## 2. Saídas

- Relatório de achados de conformidade de plataforma, cada um classificado como **bloqueante** (quebra de parametrização já existente) ou **não-bloqueante** (lacuna de escopo futuro, ex. multi-tenência estrutural ainda não implementada).
- Veredito explícito de bloqueio.
- Recomendação objetiva por achado — nunca correção aplicada.

## 3. Artefatos

- Nenhum arquivo de documento é produzido por este contrato — o relatório é devolvido ao chamador (`ai-project-manager`/`ai-backend-engineer`/`ai-frontend-engineer`), conforme `artifact-contract.md`.
- Achados não-bloqueantes podem alimentar `ERP_PRODUCT_VISION.md`/`PLATFORM_OVERVIEW.md` como lacunas já mapeadas (documento, não código) — este contrato não obriga a atualização desses documentos a cada achado, só que o achado seja reportado.

## 4. Responsabilidades

- Confrontar o código entregue contra `PLATFORM_OVERVIEW.md`/`ERP_PRODUCT_VISION.md` e o checklist da Skill `platform-review`.
- Classificar cada achado como bloqueante ou não-bloqueante, usando o critério objetivo de `checklists/platform-checklist.md` ("isto já deveria estar parametrizado?").
- Declarar explicitamente a distinção entre regressão real e lacuna de escopo futuro — nunca tratar as duas da mesma forma.

## 5. Limites

- Nunca implementa ou corrige código.
- Nunca avalia UX/UI/navegação/usabilidade — isso é `product-review`/`product-reviewer`, papel complementar, nunca sobreposto (ver `PLATFORM_OVERVIEW.md`, "Experience Review vs. Platform Review").
- Nunca audita conformidade de processo/documentação do ERP — isso é `engineering-reviewer`/`AI Governance Officer`.
- Nunca exige que uma sprint implemente multi-tenência/Theme Engine funcional fora do que foi encomendado pela Ordem de Missão corrente — reporta a lacuna, não a converte em bloqueio de escopo não solicitado.
- Nunca altera `PLATFORM_OVERVIEW.md`/`ERP_PRODUCT_VISION.md`.

## 6. Integração com demais agentes

- **`AI Backend Engineer`/`AI Frontend Engineer`** → produzem a entrada deste contrato; recebem de volta achados bloqueantes para corrigir.
- **`product-reviewer`** → papel paralelo e complementar, nunca sobreposto: Platform Review avalia arquitetura de plataforma, `product-reviewer` avalia experiência do usuário. Ambos podem ser executados na mesma janela do fluxo (`Backend → API → Frontend → Platform Review → Product Review → QA → Encerramento`), mas nenhum substitui o outro.
- **`AI QA Engineer`** → só inicia validação técnica depois que este contrato (quando aplicável) e `product-review-contract.md` (quando há Frontend) entregam veredito sem achado bloqueante pendente.
- **`AI Governance Officer`** → papel complementar, nunca sobreposto: audita conformidade de processo/documentação, não arquitetura de plataforma.
- **`AI Project Manager`** → único agente que pode delegar para `platform-reviewer` além do próprio `AI Backend Engineer`/`AI Frontend Engineer`.

## Checklist de conformidade

- [ ] Todo achado classificado como bloqueante ou não-bloqueante, nunca ambíguo sem justificativa.
- [ ] Veredito de bloqueio declarado explicitamente.
- [ ] Nenhuma correção aplicada pelo próprio Platform Review.
- [ ] Distinção entre regressão real e lacuna de escopo futuro presente no relatório.
- [ ] `AI QA Engineer` não iniciado antes deste contrato entregar veredito, quando aplicável.

---

Precedência: em caso de conflito entre este contrato e `agent-contract.md`, `product-review-contract.md`, `PROJECT_GOVERNANCE.md`, `PLATFORM_OVERVIEW.md` ou `ERP_PRODUCT_VISION.md`, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.6.1 (Platform & Product Architecture Consolidation). -->
