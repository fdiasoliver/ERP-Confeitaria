# Protocol: Communication

Operational Protocol do AI Operating System (Sprint G.5.5). Define o comportamento de troca de informação entre camadas — não redefine papéis, conhecimento nem formato de artefato (isso é `contracts/artifact-contract.md`). Deriva de `architecture/COMMUNICATION_MODEL.md` e `contracts/communication-contract.md` — não repete a explicação conceitual, opera sobre eles.

## 1. Objetivo / Escopo

Padronizar o comportamento de troca de informações, respostas, mensagens e artefatos entre camadas adjacentes do `LAYER_MODEL.md`, para que qualquer Sub-agent ou sessão saiba, sem precisar redescobrir, como formatar uma delegação e como formatar um retorno. Escopo: comunicação **entre** camadas (chamador ↔ Sub-agent); não cobre comunicação **dentro** de uma camada (isso é `protocols/delegation/PROTOCOL.md` para decidir quem delega para quem).

## 2. Quando utilizar / Quando NÃO utilizar

**Utilizar quando:** uma camada precisa enviar uma delegação a outra, ou devolver um resultado ao chamador, ou transferir um artefato entre camadas.
**NÃO utilizar quando:** a decisão é sobre *se* delegar (isso é `protocols/delegation/PROTOCOL.md`); quando o artefato em si precisa de formato/nome definido (isso é `contracts/artifact-contract.md`); quando é uma leitura de documento sempre-em-contexto (`CLAUDE.md`/`PROJECT_GOVERNANCE.md`) — não é comunicação entre camadas, é carregamento padrão (ver `CONTEXT_MODEL.md`).

## 3. Pré-condições / Pós-condições

**Pré-condições:** existe uma camada chamadora e uma camada chamada, com uma tarefa ou resultado a transmitir.
**Pós-condições:** a mensagem chegou no formato exigido pelo item 4 abaixo; nenhuma informação bruta desnecessária cruzou a fronteira de camada (`COMMUNICATION_MODEL.md` item 5).

## 4. Entradas / Saídas

**Entradas:** uma delegação (chamador→Sub-agent) ou um resultado de tarefa (Sub-agent→chamador).
**Saídas:** para delegação — escopo explícito (dentro/fora), contexto necessário, critério de conclusão, formato de entregável esperado, documentos-fonte a ler antes de agir. Para retorno — resumo estruturado no formato **Diagnóstico → Problemas encontrados → Melhorias aplicadas/Achados → Estrutura final → Arquivos criados/removidos/alterados** (`communication-contract.md` item 1), nunca o histórico bruto de chamadas de ferramenta.

## 5. Artefatos produzidos / consumidos

**Produz:** nenhum artefato de arquivo próprio — a mensagem de delegação/retorno em si não é um artefato persistido (a menos que a tarefa delegada explicitamente peça um arquivo, caso em que esse arquivo segue `contracts/artifact-contract.md`).
**Consome:** o escopo/contexto fornecido na delegação; o retorno estruturado de uma delegação anterior, quando consolidando múltiplos resultados paralelos.

## 6. Skills utilizadas / Contracts utilizados / Sub-agents envolvidos

**Skills utilizadas:** nenhuma — este é um Protocol de comportamento, não de conhecimento de domínio.
**Contracts utilizados:** `contracts/communication-contract.md` (checklist operacional que este Protocol segue).
**Sub-agents envolvidos:** qualquer par chamador/chamado da Camada 6 (`.claude/agents/*`); tipicamente `ai-project-manager` como chamador e qualquer uma das demais 8 personas como chamado.

## 7. Eventos de início / término

**Início:** uma camada decide enviar uma delegação, ou um Sub-agent termina sua tarefa e precisa devolver resultado.
**Término:** a mensagem foi entregue no formato exigido e o destinatário confirmou recebimento (para retorno: o chamador consolidou o resultado; para delegação: o Sub-agent iniciou a execução).

## 8. Critérios de sucesso / interrupção / retorno

**Sucesso:** retorno segue o formato estruturado do item 4, sem histórico bruto, com confirmação explícita de que nenhum arquivo fora do escopo delegado foi tocado (`communication-contract.md` item 1).
**Interrupção:** a mensagem violaria a regra de isolamento do item 4 de `COMMUNICATION_MODEL.md` (ex. incluiria segredo/credencial) — nunca deve ser enviada nesse estado.
**Retorno:** todo retorno de Sub-agent volta exclusivamente ao seu chamador direto — nunca a outro Sub-agent irmão (`COMMUNICATION_MODEL.md` item 1), a menos que seja um subagent aninhado explicitamente autorizado por `tools: Agent(...)`.

## 9. Fluxo operacional

```
Camada chamadora
  → formata delegação (escopo + contexto + critério de conclusão + formato esperado)
  → camada chamada executa
  → camada chamada formata retorno (Diagnóstico → Problemas → Melhorias → Estrutura final → Arquivos)
  → camada chamadora consolida (nunca uma execução paralela consolida em nome de outra — communication-contract.md item 4)
```

## 10. Exemplos positivos / negativos

**Positivo:** o padrão já em uso por dezenas de forks nesta sessão (Sprints G.5.0-G.5.4) — cada fork devolveu exatamente "Diagnóstico → Problemas encontrados → Melhorias aplicadas → Estrutura final → Arquivos criados/removidos", nunca o transcript completo de suas chamadas de ferramenta; o Orchestrator consolidou os resumos sem carregar nenhum histórico bruto (`COMMUNICATION_MODEL.md` item 6, caso real já documentado).
**Negativo:** um Sub-agent devolver o log completo de 30 chamadas de `Read`/`Grep`/`Edit` como resultado, obrigando o chamador a garimpar o que importa — exatamente o que este Protocol existe para prevenir.

---

Precedência: em caso de conflito entre este Protocol e `architecture/COMMUNICATION_MODEL.md`, `contracts/communication-contract.md` ou a documentação oficial de Sub-agents do Claude Code, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
