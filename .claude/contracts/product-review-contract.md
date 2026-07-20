# product-review-contract.md — Contrato de Product Review

Parte da camada Contracts do AI Operating System (`.claude/architecture/LAYER_MODEL.md`, Camada 4). Criado na Sprint G.6 (Product Review System), evolução de infraestrutura autorizada explicitamente pelo Product Owner via Ordem de Missão dedicada (`PROJECT_GOVERNANCE.md` Seção 13.7; ADR registrado em `CLAUDE.md` raiz). Deriva de `agent-contract.md` (estrutura de Sub-agent) e `PROJECT_GOVERNANCE.md` Seção 16.5 (regra de classificação e bloqueio) — não repete nenhum dos dois, formaliza especificamente as entradas/saídas/artefatos/responsabilidades/limites do papel de Product Review. Aplica-se ao Sub-agent `product-reviewer` (`.claude/agents/product-reviewer.md`) e à Skill `product-review` (`.claude/skills/product-review/SKILL.md`).

## 1. Entradas

- Página(s)/componente(s) de Frontend já implementados por `AI Frontend Engineer` (ou, em sessão única, já concluídos antes de iniciar o Product Review).
- `DESIGN_SYSTEM.md` e `UX_GUIDELINES.md` (raiz do projeto) — fonte de verdade de produto, consultados sob demanda, nunca duplicados.
- Os 4 checklists de `skills/product-review/checklists/` (UX, UI, Funcional, Navegação).

## 2. Saídas

- Relatório de achados classificados em exatamente uma categoria por achado: **A. Problema Funcional, B. Problema de UX, C. Problema de UI, D. Problema de Navegação, E. Problema de Acessibilidade, F. Melhoria**.
- Veredito explícito de bloqueio: presença ou ausência de achado de categoria A.
- Recomendação objetiva por achado — nunca uma correção aplicada.

## 3. Artefatos

- Nenhum arquivo de documento é produzido por este contrato — o relatório é devolvido ao chamador (`ai-project-manager`/`ai-frontend-engineer`), conforme `artifact-contract.md`.
- Achados de categoria B–F alimentam um backlog priorizado (registrado pelo chamador — tipicamente em `KNOWN_ISSUES.md`, quando a sprint decidir registrá-los; este contrato não obriga onde o backlog é persistido, apenas que ele exista como resultado do Product Review).
- Achados de categoria A são devolvidos diretamente a `AI Frontend Engineer` para correção — nunca viram apenas um registro de backlog.

## 4. Responsabilidades

- Confrontar o código entregue contra `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md` e os 4 checklists da Skill `product-review`.
- Classificar cada achado em exatamente uma categoria (A–F) — nunca duas, nunca nenhuma, nunca ambígua sem justificativa.
- Aplicar a regra de bloqueio única deste contrato: **somente categoria A bloqueia a homologação técnica** (passagem para `AI QA Engineer`); B–F nunca bloqueiam.
- Declarar explicitamente quando a revisão não pôde incluir teste real em navegador (limitação de ambiente).

## 5. Limites

- Nunca implementa ou corrige código — apenas classifica e reporta (mesmo princípio de `AI QA Engineer`/`AI Governance Officer`, nenhum dos três corrige o que encontra).
- Nunca decide arquitetura, nunca audita conformidade documental/processo (isso é `AI Governance Officer`), nunca valida `tsc`/`lint`/`build` (isso é `AI QA Engineer`).
- Nunca altera `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md` — são consumidos, não produzidos por este papel.
- Nunca eleva um achado B–F a categoria A para forçar bloqueio, nem rebaixa um achado A para B–F para evitar bloqueio — a classificação segue exclusivamente `skills/product-review/checklists/functional-checklist.md` (o que é/não é categoria A).
- Nunca substitui teste real em navegador quando um está disponível — a leitura de código é o método de fallback documentado, não o preferido.

## 6. Integração com demais agentes

- **`AI Frontend Engineer`** → produz a entrada deste contrato (página/componente implementado); recebe de volta achados de categoria A para corrigir.
- **`AI QA Engineer`** → só inicia validação técnica depois que este contrato entrega veredito sem categoria A pendente (nova dependência da Sprint G.6, ver `agents/DEPENDENCIES.md`).
- **`AI Governance Officer`** → papel complementar, nunca sobreposto: audita conformidade de processo/documentação, não qualidade de produto.
- **`AI Project Manager`** → único agente que pode delegar para `product-reviewer` além do próprio `AI Frontend Engineer` (ver `agents/DEPENDENCIES.md`, `agents/MATRIX.md`).
- **`AI Release Manager`** → ao encerrar a missão, confirma que o backlog de achados B–F (se houver) foi registrado, sem exigir que tenha sido resolvido (não é critério de bloqueio de encerramento — só achados A o são, e esses já teriam impedido a passagem para QA antes de chegar ao encerramento).

## Checklist de conformidade

- [ ] Todo achado tem exatamente uma categoria (A–F).
- [ ] Veredito de bloqueio declarado explicitamente (sim/não, por quê).
- [ ] Nenhuma correção aplicada pelo próprio Product Review.
- [ ] Limitação de ambiente (sem navegador) declarada quando aplicável.
- [ ] `AI QA Engineer` não iniciado antes deste contrato entregar veredito, quando a missão implementou Frontend.

---

Precedência: em caso de conflito entre este contrato e `agent-contract.md`, `PROJECT_GOVERNANCE.md` Seção 16.5, `DESIGN_SYSTEM.md` ou `UX_GUIDELINES.md`, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.6 (Product Review System + Design System + Homologação Funcional). -->
