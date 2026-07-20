# Protocol: Validation

Operational Protocol do AI Operating System (Sprint G.5.5). Define o comportamento de validação técnica (autoauditoria, checagens) durante uma missão — distinto de `review` (revisão de conformidade/arquitetura/documentação), não redefine papéis, conhecimento nem formato de artefato. Deriva de `skills/sprint-execution/SKILL.md` (ordem de validação real já em uso) — não repete, opera sobre ela.

## 1. Objetivo / Escopo

Padronizar a checagem técnica funcional de uma missão (typecheck, lint, build, regressão das 5 funcionalidades-âncora) antes de ela avançar para revisão de governança e documentação. Fora de escopo: julgar se uma falha é bloqueante em termos de processo/governança (isso é `protocols/review/PROTOCOL.md`), corrigir qualquer falha encontrada (isso volta para o Sub-agent que implementou).

## 2. Quando utilizar / Quando NÃO utilizar

**Utilizar quando:** `AI Backend Engineer`/`AI Frontend Engineer` concluíram uma microtarefa ou sprint inteira e o código precisa ser confirmado antes de avançar.
**NÃO utilizar quando:** o código ainda está em implementação (validação sempre vem depois, nunca durante); para decidir se uma falha encontrada bloqueia o encerramento (isso é `protocols/review/PROTOCOL.md`/`ai-governance-officer`); para corrigir o que foi encontrado (retorna ao implementador, nunca é corrigido por este protocolo).

## 3. Pré-condições / Pós-condições

**Pré-condições:** código já implementado e as validações previstas já declaradas no plano da missão (`SPRINT_X.md` ou equivalente).
**Pós-condições:** resultado de cada validação registrado (passou/falhou, com detalhe do erro se falhou) e as 5 funcionalidades-âncora confirmadas ou reportadas como quebradas.

## 4. Entradas / Saídas

**Entradas:** o diff/arquivos alterados pela missão, e o plano da missão para saber quais validações estão previstas.
**Saídas:** resumo estruturado passou/falhou por validação, mais status das 5 funcionalidades-âncora — nunca o código corrigido.

## 5. Artefatos produzidos / consumidos

**Produz:** relatório de validação técnica (resultado devolvido ao chamador, conforme `contracts/artifact-contract.md` — não é um documento próprio persistido).
**Consome:** código-fonte da missão, `SPRINT_X.md`, `engineering-reviewer/references/checklist.md` (seção Regressão).

## 6. Skills utilizadas / Contracts utilizados / Sub-agents envolvidos

**Skills:** `sprint-execution` — única Skill que define a ordem obrigatória de validação e quando cada comando roda.
**Contracts:** `artifact-contract.md` (formato do relatório de validação), `communication-contract.md` (formato de retorno).
**Sub-agents envolvidos:** `ai-qa-engineer` — nunca corrige, só reporta (mesmo princípio de `sprint-audit`: "audita, não corrige").

## 7. Eventos de início / término

**Início:** `AI Backend Engineer`/`AI Frontend Engineer` sinaliza que uma parte da missão está pronta para validação.
**Término:** todas as validações previstas rodaram e o resumo estruturado foi entregue, mesmo que com falhas reportadas.

## 8. Critérios de sucesso / interrupção / retorno

**Sucesso:** `tsc`/`lint`/`build` (quando previsto) passaram e as 5 funcionalidades-âncora confirmadas.
**Interrupção:** uma validação falha de forma ambígua, não claramente atribuível a uma camada específica (ex. erro de build sem stack trace útil).
**Retorno ao Orchestrator:** uma funcionalidade-âncora quebrou e a causa não é óbvia a partir do diff da missão corrente — escala em vez de investigar além do escopo de validação (mesmo princípio de `DELEGATION_MODEL.md` item 5).

## 9. Fluxo operacional

```
Código implementado, pronto para validação
        ↓
npx tsc --noEmit (typecheck)
        ↓
npm run lint
        ↓
npm run build (somente se previsto em SPRINT_X.md)
        ↓
Checagem manual das 5 funcionalidades-âncora
        ↓
Resumo estruturado devolvido ao chamador (passou/falhou por item)
```

## 10. Exemplos positivos / negativos

**Exemplo positivo:** após `AI Backend Engineer` terminar uma Route Handler nova, `ai-qa-engineer` roda `tsc`+`lint`, confirma as 5 funcionalidades-âncora, e só então `AI Documentation Engineer` atualiza o CHANGELOG — ordem correta (validação sempre antes de documentação, regra já registrada em `governance`).

**Exemplo negativo:** atualizar `PLAN.md`/`CHANGELOG.md` antes de rodar as validações previstas — viola a regra explícita de `sprint-execution` e o `protocols/documentation/PROTOCOL.md`.

---

Precedência: em caso de conflito entre este Protocol e `skills/sprint-execution/SKILL.md`, `agents/ai-qa-engineer.md` ou a documentação oficial do Claude Code, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
