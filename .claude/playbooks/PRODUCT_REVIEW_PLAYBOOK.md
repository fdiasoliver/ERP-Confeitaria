# Playbook: Product Review

Playbook do AI Operating System (Sprint G.6), conforme `playbooks/PLAYBOOK_ARCHITECTURE.md`. Especialização do `MISSION_PLAYBOOK.md` para revisão de qualidade de produto — somente leitura, nenhuma correção automática, distinto de `AUDIT_PLAYBOOK.md` (conformidade de processo/documentação, papel de `ai-governance-officer`) e da checagem técnica isolada de `protocols/validation/PROTOCOL.md` (papel de `ai-qa-engineer`). 11º Playbook do sistema.

## 1. Objetivo / Escopo

Certificar a qualidade de produto (UX, UI, navegação, usabilidade, responsividade) de uma página/fluxo de Frontend já implementado, classificando achados e emitindo um veredito de bloqueio — sem alterar nenhum arquivo.

**Quando utilizar:** toda missão que implementou ou alterou Frontend (`src/app/admin/**`, `src/app/(cliente)/**`, `src/components/**`), sempre entre a conclusão de `ai-frontend-engineer` e o início de `ai-qa-engineer` — etapa obrigatória a partir da Sprint G.6 (`PROJECT_GOVERNANCE.md` Seção 16.5).
**Quando NÃO utilizar:** missão que não tocou Frontend (ex. sprint só de Backend, como a 2.G.1 — pular direto para `ai-qa-engineer`); quando correção também é esperada no mesmo ciclo de revisão (a correção de um achado categoria A volta para `ai-frontend-engineer`, nunca acontece dentro deste próprio Playbook — separação de papéis idêntica a `AUDIT_PLAYBOOK.md`).

## 2. Pré-condições / Pós-condições

**Pré-condições:** Frontend da missão já implementado e considerado completo por `ai-frontend-engineer`; nenhuma alteração de arquivo autorizada durante a execução deste Playbook.
**Pós-condições:** relatório de achados classificados (A–F) entregue; veredito de bloqueio explícito; zero arquivo alterado por este Playbook.

## 3. Entradas / Saídas

**Entradas:** código de página/componente implementado + `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md` (raiz do projeto) + os 4 checklists de `skills/product-review/checklists/`.
**Saídas:** relatório estruturado com achados classificados, recomendação por achado, e veredito objetivo (aprovado sem ressalva / aprovado com backlog B–F / bloqueado por categoria A).

## 4. Artefatos produzidos

Relatório de Product Review (achados + veredito) — nunca um arquivo de código alterado. Achados de categoria B–F podem originar entradas em `KNOWN_ISSUES.md` como backlog priorizado, a critério de quem recebe o relatório (`ai-project-manager`/Product Owner) — este Playbook não obriga a persistência, só a existência do relatório.

## 5. Skills necessárias / Contracts utilizados / Sub-agents participantes

**Skills:** `product-review` (checklists + regra de classificação), `frontend-pattern` (referência do padrão de página, consultada sob demanda).
**Contracts:** `product-review-contract.md` (entradas/saídas/limites deste papel), `artifact-contract.md` (formato do relatório), `communication-contract.md` (formato de retorno).
**Sub-agents:** `product-reviewer` lidera e é o único que classifica achados e emite o veredito de bloqueio — nenhum outro Sub-agent participa deste Playbook em modo de escrita.

## 6. Sequência completa de execução

1. `ai-project-manager` (ou `ai-frontend-engineer` diretamente) aciona `product-reviewer` assim que o Frontend da missão está implementado.
2. `product-reviewer` lê o código entregue e as seções aplicáveis de `DESIGN_SYSTEM.md`/`UX_GUIDELINES.md`.
3. `product-reviewer` percorre os 4 checklists (`ux-checklist.md`, `ui-checklist.md`, `functional-checklist.md`, `navigation-checklist.md`).
4. Cada achado é classificado em exatamente uma categoria (A–F), usando `functional-checklist.md` como critério objetivo de "isto é categoria A?".
5. `product-reviewer` emite o relatório: achados + recomendação + veredito de bloqueio (só categoria A bloqueia).
6. Se houver achado A: retorna a `ai-frontend-engineer` para correção — o Playbook é reexecutado depois da correção, a partir do passo 2, sobre o trecho corrigido.
7. Se não houver achado A (mesmo com B–F presentes): retorna o controle para `ai-project-manager`, que aciona `ai-qa-engineer` em seguida — achados B–F seguem como backlog, nunca impedem essa passagem.

## 7. Critérios de sucesso / interrupção / retorno ao Orchestrator

**Sucesso:** relatório completo, todo achado classificado corretamente pelo critério de `functional-checklist.md`, zero arquivo alterado.
**Interrupção:** um achado de categoria A é ambíguo demais para classificar com confiança — reportar como bloqueante por padrão (conservador) e escalar ao Orchestrator/Product Owner, nunca decidir liberar na dúvida (mesmo princípio de `AUDIT_PLAYBOOK.md`).
**Retorno ao Orchestrator:** ao final, sempre — com o relatório completo e o veredito, independentemente de haver ou não achado bloqueante.

## 8. Exemplos completos

**Exemplo real:** as Sprints 2.D.5–2.I.2 (Units, Ingredientes, Receitas — todas com Frontend) foram concluídas **antes** deste Playbook existir, sem uma etapa formal de Product Review — a validação de produto ocorreu apenas como parte da leitura de código do próprio Executor, misturada com a validação técnica, sem classificação A–F nem veredito de bloqueio separado. Este Playbook formaliza, a partir da Sprint G.6, o que essas sprints já faziam de forma implícita e não classificada — nenhuma delas precisa ser retroativamente revisada por este Playbook (fora do escopo desta Sprint G.6, que é de evolução de metodologia, não de reabertura de sprints já encerradas e aceitas).

---

Precedência: em caso de conflito entre este Playbook e `playbooks/PLAYBOOK_ARCHITECTURE.md` ou qualquer Contract/Sub-agent/Skill referenciado, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.6 (Product Review System + Design System + Homologação Funcional). -->
