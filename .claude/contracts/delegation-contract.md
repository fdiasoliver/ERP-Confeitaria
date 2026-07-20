# delegation-contract.md — Contrato de Delegação

Parte da arquitetura do AI Operating System (Sprint G.5.3, camada `contracts/`). Deriva de `.claude/architecture/DELEGATION_MODEL.md` — este documento é o checklist objetivo/verificável; a explicação conceitual (por que cada regra existe) vive só lá, não repetida aqui.

## 1. Checklist antes de delegar

- [ ] Escopo declarado explicitamente — o que a tarefa delegada deve fazer.
- [ ] Fora de escopo declarado explicitamente — quais arquivos/pastas o delegado nunca deve tocar.
- [ ] Critério de conclusão declarado — o que "pronto" significa para esta delegação, verificável sem ambiguidade.
- [ ] Contexto necessário incluído no prompt de delegação — o delegado (fork ou Sub-agent) não vê a conversa principal por padrão; qualquer decisão/achado anterior relevante precisa estar explícito no prompt.
- [ ] Formato de retorno esperado declarado — o que o resumo estruturado deve conter (ver `DELEGATION_MODEL.md` item 4).

Uma delegação sem os 5 itens acima não está pronta para ser disparada.

## 2. Checklist para autorizar delegação encadeada (Sub-agent → Sub-agent)

- [ ] O Sub-agent delegador é explicitamente um papel de coordenação (não de execução pura) — ver `architecture/agents/` para quais personas se qualificam.
- [ ] O campo `tools` do Sub-agent inclui `Agent(tipo)` com lista de permissão explícita — nunca `Agent` livre por padrão.
- [ ] Os tipos de Sub-agent permitidos na lista de permissão estão documentados no `agent-contract.md` desse Sub-agent delegador.
- [ ] Nenhum Sub-agent de execução pura (sem essa autorização explícita) tenta delegar — se isso for necessário, é sinal de que a tarefa deveria ter sido desenhada como delegação direta da camada de coordenação, não como delegação em cadeia improvisada.

Sem os 4 itens acima, delegação encadeada é uma violação deste contrato, mesmo que tecnicamente possível.

## 3. Critério objetivo de escalonamento — sempre escalar quando

- [ ] Duas fontes de verdade parecem contradizer, sem hierarquia clara resolvendo o conflito (ver `project-skill-governance/references/CONFLICT_RESOLUTION.md`).
- [ ] A diretiva recebida não cobre o caso real encontrado durante a execução.
- [ ] Resolver o problema exigiria alterar um arquivo fora do escopo autorizado da delegação.
- [ ] A instrução recebida, seguida ao pé da letra, contrariaria uma regra de `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md`.

Escalar = devolver a decisão para quem tem autoridade, com o achado documentado, sem decidir por conta própria. Não é falha do delegado — é o comportamento correto previsto por este contrato.

## 4. Critério objetivo de interrupção

Interromper uma delegação em andamento sempre que:
- [ ] O escopo da missão mudou de forma que a tarefa delegada não faz mais sentido.
- [ ] Uma dependência da qual a tarefa depende (ex. arquivo pré-requisito de outro fork paralelo) falhou antes de ser produzida.
- [ ] Ocorre um erro de infraestrutura fora do domínio da tarefa (ex. limite de sessão da API).

**Procedimento obrigatório após interrupção por erro de infraestrutura** (regra derivada do caso real da Sprint G.5.1, documentado em `DELEGATION_MODEL.md` item 6): antes de re-delegar, verificar o estado real do sistema de arquivos-alvo (via leitura direta) — nunca assumir que uma falha de sessão significa que nada foi produzido. Só re-delegar a parte do trabalho confirmadamente não persistida.

## 5. Limite de profundidade de delegação

- [ ] Delegação em cadeia (Sub-agent → Sub-agent → Sub-agent) não deveria passar de 2 níveis abaixo da sessão principal sem justificativa explícita registrada no prompt de delegação do nível mais profundo.
- [ ] Toda cadeia de delegação deve permanecer rastreável: cada nível sabe quem o delegou e por quê (não apenas "o que fazer").

Justificativa: perder rastreabilidade de "quem decidiu o quê" é o principal risco de cadeias de delegação profundas — este limite existe para preservar auditabilidade, não por limitação técnica do mecanismo `Agent(tipo)`.

---

Precedência: em caso de conflito entre este contrato e `DELEGATION_MODEL.md`, o modelo prevalece (este documento deriva dele). Em caso de conflito com `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, qualquer ADR ou `CLAUDE.md` (raiz), o documento original sempre prevalece.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
