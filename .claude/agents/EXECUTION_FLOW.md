# EXECUTION_FLOW.md — Fluxo Oficial de Execução dos Sub-agents

Parte da documentação de `.claude/agents/` (Sprint G.5.4; fluxo atualizado na Sprint G.6 com a inserção de `product-reviewer`, e na Sprint G.6.1 com a inserção de `platform-reviewer`). Instancia, com os 11 Sub-agents reais, o fluxo genérico já definido em `.claude/architecture/EXECUTION_FLOW.md` (10 etapas, Sprint G.5.3) — não repete aquele documento, apenas o aplica concretamente aos agentes desta pasta.

## Fluxo de uma missão completa

```
Usuário
   ↓
ai-project-manager          (Planejamento — lê o pedido, define escopo)
   ↓
ai-solution-architect        (Arquitetura — decide camada/schema, se necessário)
   ↓
ai-backend-engineer           (Implementação — Schema/Repository/Service/Route)
   ↓
ai-frontend-engineer           (Implementação — página admin/cliente HTTP, se aplicável)
   ↓
platform-reviewer                (Platform Review — Multi-tenant/Branding/White Label/Theme Engine, se houve Backend e/ou Frontend — Sprint G.6.1)
   ↓
product-reviewer                (Product Review — UX/UI/navegação/usabilidade/responsividade, só se houve Frontend — Sprint G.6)
   ↓
ai-qa-engineer                  (Validação técnica — tsc/lint/build/regressão)
   ↓
ai-documentation-engineer        (Documentação — PLAN.md/CHANGELOG.md/README)
   ↓
ai-release-manager                (Encerramento — DoD + Relatório Executivo)
   ↓
Resposta final ao Usuário (via ai-project-manager)
```

`ai-governance-officer` não tem posição fixa nesta cadeia — é acionado sob demanda por `ai-project-manager` (ou por qualquer persona que encontre uma dúvida de ADR/conformidade) em qualquer ponto do fluxo, sempre retornando o controle para quem o acionou. `ai-refactoring-engineer` também não tem posição fixa — só entra quando a missão é especificamente de redução de dívida técnica, substituindo `ai-backend-engineer`/`ai-frontend-engineer` nesse caso. `product-reviewer` também não tem posição fixa quando a missão não implementa Frontend (ex. uma sprint só de Backend) — nesse caso é pulado. `platform-reviewer` (Sprint G.6.1) executa sempre que há Backend e/ou Frontend novo — é pulado apenas em missões puramente documentais/de infraestrutura de IA, sem nenhum código de ERP tocado.

## Correspondência com `architecture/EXECUTION_FLOW.md` (10 etapas genéricas)

| Etapa genérica (G.5.3) | Agente(s) responsável(is) |
|---|---|
| Nova Missão | Usuário → `ai-project-manager` |
| Planejamento | `ai-project-manager` |
| Arquitetura | `ai-solution-architect` (quando necessário) |
| Implementação | `ai-backend-engineer` / `ai-frontend-engineer` / `ai-refactoring-engineer` |
| Autoauditoria | Parte do encerramento de tarefa de cada agente de execução (resumo estruturado, `communication-contract.md`) |
| Correções | De volta ao agente de execução correspondente, se `platform-reviewer`/`product-reviewer`/`ai-qa-engineer` reportar problema |
| Validações | `platform-reviewer` (conformidade de plataforma, quando houve Backend/Frontend — Sprint G.6.1) e `product-reviewer` (qualidade de produto, quando houve Frontend — Sprint G.6) seguidos de `ai-qa-engineer` (técnica) |
| Documentação | `ai-documentation-engineer` |
| Relatório Executivo | `ai-release-manager` |
| Encerramento | `ai-release-manager`, retorna a `ai-project-manager` → Usuário |

## Regra de retorno

Todo agente folha (todos exceto `ai-project-manager`) sempre devolve o controle para quem o delegou — nunca aciona outro agente diretamente, nunca responde diretamente ao usuário final (isso é sempre consolidado por `ai-project-manager`).

---

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.4 (Implementação dos Sub-agents). -->
