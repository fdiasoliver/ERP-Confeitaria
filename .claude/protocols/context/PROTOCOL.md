# Protocol: Context

Operational Protocol do AI Operating System (Sprint G.5.5). Define o comportamento de gestão de contexto entre camadas — não redefine papéis, conhecimento nem formato de artefato. Deriva de `architecture/CONTEXT_MODEL.md` — não repete a explicação conceitual, opera sobre ela.

## 1. Objetivo / Escopo

**Objetivo:** padronizar como cada camada compartilha, isola, economiza e persiste contexto durante uma missão, para que nenhum Sub-agent pague o custo de contexto de outro desnecessariamente.

**Escopo:** aplica-se a toda transição de contexto entre camadas — carregamento de `CLAUDE.md`/Skills, inicialização de um Sub-agent, retorno de um Sub-agent ao chamador. Não cobre o conteúdo de uma Skill em si (isso é a própria Skill) nem o formato de um artefato (isso é `artifact-contract.md`).

## 2. Quando utilizar / Quando NÃO utilizar

**Utilizar quando:** uma camada precisa decidir o que carregar em contexto antes de iniciar uma tarefa; um Sub-agent está sendo inicializado (decidir `skills:` a pré-carregar); uma missão longa se aproxima do limite de contexto e precisa decidir o que descartar.

**NÃO utilizar quando:** a decisão é sobre o que uma Skill deve conter (isso é `skill-contract.md`); a decisão é sobre o formato de retorno de um Sub-agent (isso é `protocols/communication/PROTOCOL.md`).

## 3. Pré-condições / Pós-condições

**Pré-condições:** a camada que está prestes a carregar contexto sabe qual tarefa vai executar (sem isso, não há como decidir o que é necessário).

**Pós-condições:** apenas o contexto necessário para a tarefa está carregado — nenhuma Skill/Sub-agent carrega conhecimento de um domínio que não vai usar.

## 4. Entradas / Saídas

**Entradas:** a tarefa a ser executada e a camada que a executará (sessão principal, Skill, ou Sub-agent).

**Saídas:** a lista do que deve entrar em contexto (quais Skills, se algum Sub-agent deve ser usado e com quais `skills:` pré-carregadas).

## 5. Artefatos produzidos / consumidos

**Produz:** nenhum artefato de arquivo — este Protocol produz apenas uma decisão de carregamento.

**Consome:** a `description`/`when_to_use` de cada Skill candidata (sempre em contexto, conforme mecanismo oficial), o frontmatter `skills:` de cada persona de Sub-agent já decidido na Sprint G.5.3/G.5.4.

## 6. Skills utilizadas / Contracts utilizados / Sub-agents envolvidos

**Skills utilizadas:** nenhuma Skill específica — este Protocol opera sobre o mecanismo de carregamento de Skills em si, não sobre o conteúdo de uma.

**Contracts utilizados:** `contracts/agent-contract.md` (item 2, campo `skills:`).

**Sub-agents envolvidos:** todos os 9 — cada um gerencia seu próprio orçamento de contexto ao ser inicializado com `skills:` pré-carregadas.

## 7. Eventos de início / término

**Início:** o momento em que uma camada é inicializada (sessão principal ao carregar `CLAUDE.md`; um Sub-agent ao ser delegado).

**Término:** o momento em que a tarefa termina e o contexto acumulado deixa de ser necessário (fim da sessão do Sub-agent — seu contexto é descartado ao retornar o resumo, conforme `COMMUNICATION_MODEL.md`).

## 8. Critérios de sucesso / interrupção / retorno

**Sucesso:** a tarefa foi concluída sem carregar Skills/conhecimento irrelevantes ao seu escopo declarado.

**Interrupção:** o orçamento de auto-compactação (25.000 tokens combinados para Skills reanexadas, mecanismo oficial) foi excedido antes da tarefa terminar — a camada deve reduzir escopo ou reinvocar a Skill mais relevante após a compactação.

**Retorno:** ao término da tarefa, o contexto acumulado pelo Sub-agent nunca retorna ao chamador — apenas o resumo estruturado (ver `protocols/communication/PROTOCOL.md`).

## 9. Fluxo operacional

1. A camada identifica a tarefa.
2. Verifica se a tarefa corresponde à `description`/`when_to_use` de uma ou mais Skills (sempre em contexto, truncadas em 1.536 caracteres combinados — mecanismo oficial).
3. Se a tarefa for delegável a um Sub-agent, o `skills:` desse Sub-agent já pré-carrega o conjunto correto (decidido em tempo de criação do Sub-agent, não em tempo de execução).
4. A Skill/Sub-agent executa a tarefa; se a conversa se aproximar do limite de contexto, a auto-compactação reanexa as invocações mais recentes de Skill dentro do orçamento de 25.000 tokens.
5. Ao concluir, apenas o resumo (não o contexto acumulado) é devolvido ao chamador.

## 10. Exemplos positivos / negativos

**Positivo:** `ai-backend-engineer` é inicializado com `skills: architecture, schema-pattern, repository-pattern, api-pattern, coding-standards` — exatamente as Skills da sua persona, nenhuma de front-end.

**Negativo:** delegar uma tarefa de front-end para `ai-backend-engineer` forçaria esse Sub-agent a carregar `frontend-pattern` sob demanda, fora do seu `skills:` pré-carregado — sintoma de que a tarefa foi delegada à persona errada (ver `protocols/delegation/PROTOCOL.md`).

---

Precedência: em caso de conflito entre este Protocol e `architecture/CONTEXT_MODEL.md` ou a documentação oficial de Skills/Sub-agents do Claude Code, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.5 (Operational Protocol Framework). -->
