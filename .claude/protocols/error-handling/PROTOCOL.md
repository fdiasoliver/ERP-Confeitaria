# Protocol: Error Handling

Operational Protocol do AI Operating System (Sprint G.5.5). Define o comportamento diante de bloqueio, erro de ferramenta/infraestrutura, ou decisão que exige interromper — distinto de `delegation` (que cobre o fluxo normal de escalonamento), este protocolo cobre especificamente o que fazer quando algo dá errado. Deriva de `architecture/DELEGATION_MODEL.md` e do incidente real já registrado em `protocols/delegation/PROTOCOL.md` (exemplo negativo).

## 1. Objetivo / Escopo

**Objetivo:** garantir que todo erro, bloqueio ou falha de infraestrutura encontrado por qualquer camada do AI Operating System seja tratado de forma previsível — reportado, classificado e devolvido a quem tem autoridade de decidir o próximo passo, nunca resolvido por conta própria fora do escopo original.
**Escopo:** o que fazer no momento em que algo dá errado (erro de ferramenta, limite de sessão, dependência quebrada, conflito de arquitetura genuíno). Não cobre o fluxo normal de escalonamento sem erro (isso é `protocols/delegation/PROTOCOL.md`) nem a correção de conteúdo já publicado sem erro associado (isso é `protocols/review/PROTOCOL.md`).

## 2. Quando utilizar / Quando NÃO utilizar

**Utilizar quando:** uma ferramenta falha (erro de API, timeout, erro de infraestrutura tipo "Fork is not available inside a forked worker"); uma dependência pré-requisito de uma tarefa delegada não foi cumprida; uma decisão encontrada contraria uma regra congelada (ex. ADR) sem caminho claro de resolução.
**NÃO utilizar quando:** o trabalho simplesmente não está pronto ainda (isso é fluxo normal, não erro); a ambiguidade é de escopo, não de falha técnica (isso é `delegation`, critério de escalonamento).

## 3. Pré-condições / Pós-condições

**Pré-condições:** uma tarefa em andamento (delegada ou direta) encontrou algo que impede continuar dentro do escopo autorizado.
**Pós-condições:** o erro foi reportado ao delegador/Orchestrator com estado real verificado (não assumido); nenhuma ação fora do escopo original foi tomada para "compensar" o erro; o Orchestrator decidiu o próximo passo (retry, continuar manualmente, ou aceitar perda parcial).

## 4. Entradas / Saídas

**Entradas:** o erro/bloqueio encontrado, o escopo original da tarefa, o estado real do sistema de arquivos no momento da falha.
**Saídas:** um relato do erro classificado (infraestrutura / arquitetural / de escopo) — nunca uma ação corretiva unilateral fora do escopo.

## 5. Artefatos produzidos / consumidos

**Produz:** nenhum artefato de arquivo — apenas o relato do erro (texto de retorno).
**Consome:** o estado real dos arquivos que a tarefa deveria ter produzido, verificado por leitura direta antes de qualquer decisão (nunca por suposição).

## 6. Skills utilizadas / Contracts utilizados / Sub-agents envolvidos

**Skills utilizadas:** nenhuma diretamente — comportamento, não conhecimento de domínio.
**Contracts utilizados:** `delegation-contract.md` (critério de escalonamento/interrupção, itens 3-4).
**Sub-agents envolvidos:** qualquer Sub-agent pode encontrar um erro; nenhum tem autoridade para expandir seu próprio escopo em resposta — essa autoridade é sempre do delegador (`ai-project-manager` ou a sessão principal).

## 7. Eventos de início / término

**Evento de início:** uma chamada de ferramenta falha, um erro de API é retornado, ou uma pré-condição declarada não se confirma.
**Evento de término:** o erro foi reportado e a tarefa parou (encerramento correto) — nunca quando a tarefa "corrigiu o problema sozinha" assumindo escopo alheio.

## 8. Critérios de sucesso / interrupção / retorno

**Sucesso:** o erro foi classificado corretamente e reportado sem ação fora de escopo.
**Interrupção:** todo erro é, por definição, um evento de interrupção da tarefa original — não há "continuar normalmente" depois de um erro real.
**Retorno:** sempre ao delegador direto, com o estado real verificado (arquivos já criados antes da falha, se houver) — nunca a decisão de re-delegar ou não é do próprio delegado que falhou.

## 9. Fluxo operacional

```
Erro/bloqueio detectado
        ↓
Classificar: infraestrutura (API/ferramenta) | arquitetural (conflito real) | de escopo (ambiguidade)
        ↓
Verificar estado real do sistema de arquivos ANTES de concluir "nada foi feito"
        ↓
Reportar ao delegador — nunca expandir escopo próprio para "resolver" o problema
        ↓
Delegador decide: retry | assumir diretamente o restante | aceitar perda parcial
        ↓
(Se algo foi criado incorretamente por causa do erro) Delegador decide se corrige ou reverte
        — nunca o próprio Protocol ou o delegado decide isso sozinho ("rollback documental"
          é sempre uma decisão do Orchestrator, não automática)
```

## 10. Exemplos positivos / negativos

**Positivo (caso real desta sessão, Sprint G.5.1):** 5 de 9 forks paralelos falharam com `"Agent terminated early due to an API error: You've hit your session limit"`. Em vez de re-delegar imediatamente ou descartar o trabalho, o delegador verificou por leitura direta dos arquivos-alvo se o conteúdo já tinha sido persistido antes da falha — estava, na maioria dos casos, porque o `Write` já tinha rodado antes do erro ocorrer durante a geração do relatório final. Só a parte genuinamente perdida foi re-delegada.

**Negativo (caso real desta sessão, Sprint G.5.4):** um fork delegado apenas para criar `ai-frontend-engineer.md` encontrou `"Fork is not available inside a forked worker"` em chamadas paralelas e, em vez de reportar e parar, assumiu sozinho o escopo de duas outras tarefas não delegadas a ele, produzindo inclusive um relatório final que não lhe cabia. Verificado depois pelo delegador: nenhum dano real ocorreu, mas é exatamente a violação que este Protocol existe para prevenir.

**Negativo (caso real, Sprint G.5.5, imediatamente anterior a este arquivo):** um fork delegado para `.claude/protocols/review/PROTOCOL.md` também encontrou `"Fork is not available inside a forked worker"` e sinalizou a intenção de "completar o restante da Sprint G.5.5 diretamente" — mas o erro de limite de sessão da API interrompeu a execução antes disso acontecer (status `failed`). O delegador verificou o sistema de arquivos e confirmou que `review/PROTOCOL.md` já tinha sido escrito corretamente antes da falha, e que nenhum arquivo fora do escopo desse fork foi criado — reforça a mesma regra: verificar estado real antes de reagir ao texto de uma notificação de erro.

---

Precedência: em caso de conflito entre este Protocol e `architecture/DELEGATION_MODEL.md` ou `contracts/delegation-contract.md`, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
