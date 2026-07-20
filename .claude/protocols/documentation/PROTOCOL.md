# Protocol: Documentation

Operational Protocol do AI Operating System (Sprint G.5.5). Define o comportamento de atualização documental ao final de uma missão — não redefine papéis, conhecimento nem formato de artefato (isso é `contracts/artifact-contract.md`). Deriva de `skills/documentation/SKILL.md` e `skills/governance/SKILL.md` — não repete, opera sobre eles.

## 1. Objetivo / Escopo

Padronizar como e quando `PLAN.md`, `CHANGELOG.md`, README/`docs/` e referências cruzadas são atualizados ao final de uma missão, e quando um registro de ADR precisa ser sinalizado. Fora de escopo: a mecânica interna de cada regra (isso é `documentation`/`governance`), a decisão de registrar ou não uma ADR (isso é `ai-governance-officer`, nunca esta camada de comportamento).

## 2. Quando utilizar / Quando NÃO utilizar

**Utilizar quando:** uma missão concluiu implementação e validação (`protocols/validation/PROTOCOL.md` já executado) e precisa que a documentação reflita a mudança real; ou uma referência de caminho desatualizada foi encontrada em qualquer `.md` do projeto.
**NÃO utilizar quando:** a mudança ainda não foi validada tecnicamente (usar `protocols/validation/PROTOCOL.md` primeiro — este protocolo nunca documenta algo não validado); é decisão de governança/ADR (`ai-governance-officer`, fora do escopo comportamental deste protocolo); é documentação da própria infraestrutura de Skills/Sub-agents (`.claude/`), não do ERP.

## 3. Pré-condições / Pós-condições

**Pré-condições:** a mudança já foi implementada e validada; existe um resumo estruturado do que foi feito (produzido por `ai-backend-engineer`/`ai-frontend-engineer`/`ai-qa-engineer`, conforme `protocols/communication/PROTOCOL.md`).
**Pós-condições:** `PLAN.md`/`CHANGELOG.md` atualizados factualmente (sem opinião/planejamento futuro em `CHANGELOG.md` — regra real de `governance` item 4.7); nenhuma referência de caminho quebrada introduzida; handoff registrado como ponteiro objetivo, nunca como decisão antecipada.

## 4. Entradas / Saídas

**Entradas:** um resumo estruturado de alteração real já concluída, ou uma referência quebrada encontrada durante qualquer missão.
**Saídas:** documentos atualizados no formato mínimo de `contracts/artifact-contract.md`.

## 5. Artefatos produzidos / consumidos

**Produz:** entradas em `PLAN.md`/`CHANGELOG.md` (nunca duplicadas — uma única entrada por módulo/sprint, regra de `governance` item 4.6), atualizações em README/`docs/`, linha de handoff em `CHANGELOG.md` quando aplicável.
**Consome:** o resumo estruturado devolvido pela etapa de implementação/validação anterior.

## 6. Skills utilizadas / Contracts utilizados / Sub-agents envolvidos

**Skills:** `documentation`, `governance`.
**Contracts:** `artifact-contract.md` (nomenclatura), `communication-contract.md` (formato de entrada/saída deste protocolo).
**Sub-agents:** `ai-documentation-engineer` (único executor deste protocolo).

## 7. Eventos de início / término

**Início:** validação técnica concluída (evento de término de `protocols/validation/PROTOCOL.md`) ou detecção de referência quebrada em qualquer momento de uma missão.
**Término:** documentos atualizados e resumo devolvido ao chamador — transição para `protocols/completion/PROTOCOL.md` (se for o fim da missão) ou `protocols/handoff/PROTOCOL.md` (se a missão continuar com outra persona).

## 8. Critérios de sucesso / interrupção / retorno

**Sucesso:** documento aponta para a fonte certa, sem duplicar conteúdo já coberto em outro documento; todo caminho referenciado foi conferido no momento da escrita, não assumido de memória (regra real de `documentation` item 4.2 — lição já registrada nesta sessão).
**Interrupção:** encontra uma contradição real entre dois documentos que não é apenas uma referência desatualizada — isso não é decisão desta camada.
**Retorno ao Orchestrator/chamador:** sempre que a contradição acima ocorrer, ou quando a atualização exigiria decidir se algo precisa de ADR (delega a decisão para `ai-governance-officer`, nunca decide sozinho).

## 9. Fluxo operacional

```
Validação técnica concluída (ou referência quebrada detectada)
        ↓
Identificar em qual documento a informação pertence (tabela de documentation/SKILL.md item 4)
        ↓
Verificar caminhos/referências citados antes de escrever (nunca assumir)
        ↓
Atualizar PLAN.md (status "Concluído", nunca nova linha) / CHANGELOG.md (estritamente factual)
        ↓
Registrar handoff, se a missão continuar
        ↓
Transição para Completion Protocol ou Handoff Protocol
```

## 10. Exemplos positivos / negativos

**Exemplo positivo:** após `ai-backend-engineer`/`ai-frontend-engineer` concluírem um módulo CRUD e `ai-qa-engineer` validar, `ai-documentation-engineer` atualiza `PLAN.md` (linha existente do módulo passa de "Planejado" para "Concluído") e adiciona uma entrada factual em `CHANGELOG.md` — sem incluir recomendações futuras.

**Exemplo negativo:** documentar uma mudança antes da validação técnica (viola a pré-condição); ou registrar em `CHANGELOG.md` uma frase como "seria bom revisar X depois" — isso é Melhoria Futura, não fato factual, e não pertence ao CHANGELOG (regra real de `governance`/`sprint-audit` já usada em toda esta sessão para classificar achados).

---

Precedência: em caso de conflito entre este Protocol e `skills/documentation/SKILL.md`, `skills/governance/SKILL.md` ou `agents/ai-documentation-engineer.md`, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
