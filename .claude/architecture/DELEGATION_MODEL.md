# DELEGATION_MODEL.md — Modelo de Delegação do AI Operating System

Parte da arquitetura do AI Operating System (Sprint G.5.3). Define quem pode delegar, quando delegar, quando retornar, quando escalar e quando interromper — para o sistema como um todo, não para uma Skill ou papel específico. Não repete `orchestrator/SKILL.md` (limites do papel Orchestrator) nem `SKILL_DEPENDENCIES.md` seção 4 (papéis que nunca executam juntos) — referencia ambos. Fonte de verdade operacionalizada por este modelo: `contracts/delegation-contract.md` (checklist derivada, a ser criada).

## 1. Quem pode delegar

| Delegador | Delega para | Hoje (sessão única) | A partir da G.5.4 |
|---|---|---|---|
| Sessão principal (papel Orchestrator/Executor) | Forks / Sub-agents | Sim — mecanismo já em uso extensivo nesta sessão (G.5.0–G.5.3) | Sim, sem mudança |
| Sub-agent de coordenação (ex. futuro `AI Project Manager`, ver `architecture/agents/`) | Outros Sub-agents | Não existe ainda | Sim — é o único tipo de Sub-agent com essa permissão por padrão |
| Sub-agent de execução (ex. futuro `backend-implementer`) | Outros Sub-agents | Não existe ainda | Não, por padrão (ver item 2) |

A sessão principal continua sendo o único delegador real até a G.5.4. Este modelo já antecipa a regra para quando Sub-agents existirem, para a G.5.4 não precisar redefini-la.

## 2. Quem não pode delegar

Regra padrão: **um Sub-agent de execução pura não pode gerar novos Sub-agents**, salvo autorização explícita no seu `agent-contract.md` via lista de permissão (`Agent(tipo)`, mecanismo já oficial do Claude Code — ver `contracts/agent-contract.md`). Motivo: cadeias de delegação sem limite claro dificultam auditoria e podem multiplicar custo/erro sem supervisão. Esta regra é a extensão natural do que `orchestrator/SKILL.md` item 4.3 já estabelece para o papel Orchestrator ("não participa da execução") — aqui generalizada para qualquer Sub-agent com papel de execução.

## 3. Quando delegar

Delegar quando pelo menos um destes critérios objetivos se aplica:
- A tarefa produziria volume de ruído de ferramentas (logs, resultados de busca, saída de comando) que não será referenciado de novo — mantê-lo fora do contexto principal é o ganho.
- A tarefa é claramente isolável: tem entrada e saída bem definidas, sem necessidade de ida-e-volta constante com o restante da missão.
- A tarefa se beneficia de paralelização real — múltiplas tarefas independentes que não competem por escrita no mesmo arquivo (ver `contracts/delegation-contract.md` para o critério de "mesmo arquivo" mais adiante).

Não delegar quando a tarefa é pequena o suficiente para ser mais cara delegada (overhead de spawn) do que feita direto, ou quando exige decisão contínua que só quem tem o contexto completo da missão pode tomar.

## 4. Quando retornar

Uma delegação termina devolvendo um **resumo estruturado** ao chamador — nunca o histórico bruto de chamadas de ferramenta (ver `CONTEXT_MODEL.md` para o porquê). O formato mínimo de retorno: o que foi feito, arquivos tocados, achados relevantes, e qualquer decisão tomada que precise ser sinalizada ao chamador (nunca decidida silenciosamente — mesmo princípio de `AI_OPERATING_SYSTEM.md` item 2).

## 5. Quando escalar

Escalar (devolver a decisão para quem tem autoridade, em vez de decidir por conta própria) quando a tarefa delegada encontra:
- Um conflito de arquitetura genuíno (duas fontes de verdade parecem contradizer, sem hierarquia clara resolvendo).
- Uma ambiguidade real no escopo recebido (a diretiva não cobre o caso encontrado).
- Um bloqueio que exigiria alterar um arquivo fora do escopo autorizado.

Este é o mesmo princípio de "sinalizar, não resolver sozinho" aplicado nesta sessão inteira (ex.: a divergência de 8 vs. 9 vs. 10 estados de sprint foi documentada, não unificada por conta própria em nenhuma das três sprints que a tocaram). Um Sub-agent que escala não falhou — cumpriu a regra corretamente.

## 6. Quando interromper

Interromper uma delegação em andamento quando:
- O escopo da missão mudou de forma que a tarefa delegada não faz mais sentido.
- Uma dependência da qual a tarefa depende quebrou (ex. outro fork paralelo que deveria produzir um arquivo pré-requisito falhou).
- Ocorre um erro de infraestrutura que não é do domínio da tarefa (ex. limite de sessão da API).

**Caso real já observado nesta sessão:** durante a Sprint G.5.1, 5 de 9 forks paralelos falharam com `"Agent terminated early due to an API error: You've hit your session limit"`. A decisão tomada não foi re-delegar imediatamente (o que arriscaria repetir a mesma falha) nem descartar o trabalho — foi verificar, via leitura direta dos arquivos-alvo, se o trabalho já tinha sido persistido antes da falha (estava, na maioria dos casos, pois o `Write` já havia sido executado antes do erro ocorrer durante a geração do relatório final). Só o entregável que dependia exclusivamente de texto de retorno (sem escrita em disco) foi de fato perdido. Regra derivada: **antes de re-delegar após uma falha de infraestrutura, verificar o estado real do sistema de arquivos — não assumir que "falhou" significa "nada foi feito".**

## 7. O que este modelo não decide

Não decide qual persona de Sub-agent existe (isso é `architecture/agents/`), nem o formato do contrato de um Sub-agent (isso é `contracts/agent-contract.md`, que deriva deste modelo), nem como o contexto é transferido entre delegador e delegado (isso é `CONTEXT_MODEL.md`).

---

Precedência: em caso de conflito entre este documento e `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, qualquer ADR ou `CLAUDE.md` (raiz), o documento original sempre prevalece.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
