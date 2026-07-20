# Protocol: Review

Operational Protocol do AI Operating System (Sprint G.5.5). Define o comportamento de revisão crítica (técnica, arquitetural, documental) — distinto de `validation` (checagem técnica funcional), não redefine papéis, conhecimento nem formato de artefato. Deriva de `skills/engineering-reviewer/SKILL.md` e `skills/sprint-audit/SKILL.md` — não repete, opera sobre eles.

## 1. Objetivo / Escopo

Padronizar a revisão crítica de conformidade/qualidade/governança antes de uma missão ser considerada pronta para encerramento — arquitetural (camadas tocadas, anti-patterns), documental (referências, PLAN/CHANGELOG) e de escopo. Fora de escopo: checagem técnica funcional (tsc/lint/build — isso é `protocols/validation/PROTOCOL.md`); correção do que for encontrado (o revisor classifica e reporta, nunca corrige).

## 2. Quando utilizar / Quando NÃO utilizar

**Utilizar quando:** uma missão já implementada e validada tecnicamente (`validation` já passou) precisa de revisão de conformidade antes do encerramento.
**NÃO utilizar quando:** a implementação ainda está em andamento; a checagem necessária é só técnica funcional (usar `validation`); a revisão é sobre o próprio Sub-agent que a executou ter feito seu trabalho corretamente sem produzir o relatório (nesse caso o problema é `completion`, não `review`).

## 3. Pré-condições / Pós-condições

**Pré-condições:** missão implementada; `protocols/validation/PROTOCOL.md` já concluído sem pendência bloqueante.
**Pós-condições:** veredito emitido (APROVADO / NECESSITA CORREÇÃO / BLOQUEADO); achados classificados (Inconsistência/Observação Técnica/Melhoria Futura).

## 4. Entradas / Saídas

**Entradas:** o conjunto de arquivos tocados pela missão, o `SPRINT_X.md`/plano original (para checar escopo vs. fora-de-escopo).
**Saídas:** veredito + lista de achados classificados, nunca uma correção aplicada diretamente.

## 5. Artefatos produzidos / consumidos

**Produz:** relatório de revisão (os 6 blocos de `engineering-reviewer/references/checklist.md` quando a revisão é de sprint completa); entradas em `KNOWN_ISSUES.md` quando dívida técnica é encontrada.
**Consome:** `SPRINT_X.md`, `PLAN.md`, `CHANGELOG.md`, o resultado de `protocols/validation/PROTOCOL.md`.

## 6. Skills utilizadas / Contracts utilizados / Sub-agents envolvidos

**Skills:** `engineering-reviewer`, `sprint-audit`, `governance`.
**Contracts:** `artifact-contract.md` (formato do relatório), `communication-contract.md` (formato do retorno).
**Sub-agents:** `ai-governance-officer` (único ponto de execução — `agents/ai-governance-officer.md`, somente-leitura, nunca corrige, só classifica/reporta).

## 7. Eventos de início / término

**Início:** `protocols/validation/PROTOCOL.md` concluído sem pendência bloqueante.
**Término:** veredito emitido e comunicado ao chamador (`ai-project-manager` ou `ai-release-manager`, conforme `protocols/handoff/PROTOCOL.md`).

## 8. Critérios de sucesso / interrupção / retorno

**Sucesso:** veredito emitido com achados classificados corretamente pelo teste de duas perguntas de `sprint-audit`.
**Interrupção:** achado que exige decisão do Product Owner (ex. contraria `PROJECT_GOVERNANCE.md` sem ADR) — não decidir sozinho.
**Retorno ao Orchestrator:** sempre que o veredito for NECESSITA CORREÇÃO ou BLOQUEADO — a correção nunca é feita pelo próprio Review Protocol.

## 9. Fluxo operacional

```
Missão implementada e validada tecnicamente
        ↓
Revisão arquitetural (camadas tocadas, sem pular nenhuma)
        ↓
Revisão de código, documental, de governança, PLAN/CHANGELOG, escopo
        ↓
Classificar achados (teste de duas perguntas: viola regra obrigatória? → Inconsistência; consequência de decisão já registrada? → Observação Técnica; senão → Melhoria Futura)
        ↓
Emitir veredito (APROVADO / NECESSITA CORREÇÃO / BLOQUEADO)
        ↓
Retornar ao chamador
```

## 10. Exemplos positivos / negativos

**Exemplo positivo:** ao final da Sprint G.5.2.1 (já ocorrida nesta sessão), a auditoria encontrou 3 Inconsistências reais (citações numéricas quebradas) e as classificou corretamente como bloqueantes, sem corrigi-las — a correção só aconteceu na sprint seguinte (G.5.3), com autorização explícita.

**Exemplo negativo:** um revisor que encontra uma referência quebrada e a corrige silenciosamente no meio da revisão, sem reportar — quebra o princípio "revisor audita, não corrige" e esconde do Product Owner um achado que poderia ser sistêmico.

---

Precedência: em caso de conflito entre este Protocol e `skills/engineering-reviewer/SKILL.md`, `skills/sprint-audit/SKILL.md` ou `agents/ai-governance-officer.md`, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
