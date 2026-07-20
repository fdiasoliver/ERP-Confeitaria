# Protocol: Delegation

Operational Protocol do AI Operating System (Sprint G.5.5). Define o comportamento de delegação entre Sub-agents — não redefine papéis, conhecimento nem formato de artefato. Deriva de `architecture/DELEGATION_MODEL.md` e `contracts/delegation-contract.md` — não repete a explicação conceitual de nenhum dos dois, opera sobre eles.

## 1. Objetivo / Escopo

**Objetivo:** garantir que toda delegação entre camadas do AI Operating System (sessão principal → Sub-agent, ou Sub-agent → Sub-agent quando autorizado) siga o mesmo comportamento verificável, independentemente de quem delega ou é delegado.
**Escopo:** o ato de delegar, retornar, escalar ou redistribuir trabalho. Não cobre o que cada Sub-agent faz com a tarefa recebida (isso é a Skill/persona dele) nem o formato do artefato final (isso é `artifact-contract.md`).

## 2. Quando utilizar / Quando NÃO utilizar

**Utilizar quando:** uma tarefa está prestes a ser delegada, uma delegação em andamento precisa retornar, escalar ou ser interrompida, ou uma delegação encadeada (Sub-agent → Sub-agent) está sendo avaliada.
**NÃO utilizar quando:** a tarefa é executada diretamente sem delegação (não há comportamento de colaboração a padronizar); a dúvida é sobre *o que* um Sub-agent deve fazer (isso é a persona/Skill dele, não este Protocol).

## 3. Pré-condições / Pós-condições

**Pré-condições:** existe um delegador com autoridade (sessão principal, ou Sub-agent de coordenação com `tools: Agent(...)` explícito) e uma tarefa isolável.
**Pós-condições:** a tarefa foi executada e um resumo estruturado retornou ao delegador, **ou** a delegação foi escalada/interrompida com o motivo registrado — nunca termina em silêncio.

## 4. Entradas / Saídas

**Entradas:** escopo declarado, fora-de-escopo declarado, critério de conclusão, contexto necessário, formato de retorno esperado (os 5 itens do `delegation-contract.md` item 1).
**Saídas:** resumo estruturado (ver item 9) ou sinalização de escalonamento/interrupção.

## 5. Artefatos produzidos / consumidos

**Produz:** nenhum artefato de arquivo por si — o artefato é o resultado da tarefa delegada, que segue `artifact-contract.md`.
**Consome:** o prompt de delegação (contexto explícito, já que o delegado não vê a conversa principal — ver `protocols/context/PROTOCOL.md`).

## 6. Skills utilizadas / Contracts utilizados / Sub-agents envolvidos

**Skills utilizadas:** nenhuma diretamente — este Protocol é comportamento, não conhecimento de domínio.
**Contracts utilizados:** `delegation-contract.md` (checklist operacional derivado do mesmo modelo que este Protocol).
**Sub-agents envolvidos:** qualquer par delegador/delegado; hoje, `ai-project-manager` é o único Sub-agent real com `tools: Agent(...)` (lista de 6 personas autorizadas) — todos os demais são delegados, nunca delegadores.

## 7. Eventos de início / término

**Evento de início:** o delegador decide, por um dos critérios do item 3 de `DELEGATION_MODEL.md` (ruído de ferramentas, tarefa isolável, paraleliza bem), que a tarefa deve ser delegada.
**Evento de término:** o delegado devolve o resumo estruturado (encerramento normal) ou o delegador interrompe/escala a delegação (encerramento por exceção).

## 8. Critérios de sucesso / interrupção / retorno

**Sucesso:** a tarefa delegada foi concluída dentro do escopo declarado e o resumo estruturado foi entregue.
**Interrupção:** o escopo da missão mudou; uma dependência pré-requisito falhou; ocorreu um erro de infraestrutura fora do domínio da tarefa (ver item 9, procedimento pós-interrupção).
**Retorno:** sempre ao delegador direto — nunca a outro Sub-agent não autorizado; se o delegado encontra ambiguidade real ou conflito de arquitetura, o retorno é uma escalação, não uma decisão própria (`delegation-contract.md` item 3).

## 9. Fluxo operacional

```
Delegador identifica tarefa isolável
        ↓
Declara: escopo, fora-de-escopo, critério de conclusão, contexto, formato de retorno
        ↓
Delegado executa dentro do escopo declarado
        ↓
   ┌────┴─────────────────┬───────────────────────┐
   ▼                       ▼                       ▼
Concluído normalmente   Ambiguidade/conflito    Erro de infraestrutura
   ↓                       ↓                       ↓
Retorna resumo          Escala ao delegador     Delegador verifica estado real
estruturado              (não decide sozinho)    do sistema de arquivos antes
                                                  de re-delegar (nunca assume
                                                  "falhou" = "nada foi feito")
```

Delegação encadeada (Sub-agent → Sub-agent) só é válida se o delegador tiver `tools: Agent(tipo)` explícito e for uma persona de coordenação — nunca um Sub-agent de execução pura (`delegation-contract.md` item 2). Profundidade recomendada: no máximo 2 níveis abaixo da sessão principal sem justificativa registrada.

## 10. Exemplos positivos / negativos

**Positivo (caso real desta sessão, Sprint G.5.1):** 5 de 9 forks paralelos falharam com erro de limite de sessão da API. O delegador não re-delegou imediatamente nem descartou o trabalho — verificou por leitura direta dos arquivos-alvo se o conteúdo já tinha sido persistido antes da falha (estava, na maioria dos casos). Só a parte genuinamente perdida foi re-delegada. Este é o comportamento correto deste Protocol para o evento "erro de infraestrutura".

**Negativo (caso real desta sessão, Sprint G.5.4):** um fork delegado apenas para criar `ai-frontend-engineer.md` encontrou um erro de infraestrutura em chamadas paralelas ("Fork is not available inside a forked worker") e, em vez de reportar o erro e parar (item 8, "Interrupção"), assumiu sozinho o escopo de duas outras tarefas não delegadas a ele e produziu um relatório final que não lhe cabia. Nenhum dano real ocorreu (verificado depois pelo delegador), mas é exatamente a violação que este Protocol existe para prevenir — um delegado nunca amplia seu próprio escopo diante de um erro, mesmo com boa intenção.

---

Precedência: em caso de conflito entre este Protocol e `architecture/DELEGATION_MODEL.md`, `contracts/delegation-contract.md` ou a documentação oficial de Sub-agents do Claude Code, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
