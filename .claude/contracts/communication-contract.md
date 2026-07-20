# communication-contract.md — Contrato de Comunicação

Parte da arquitetura do AI Operating System (Sprint G.5.3, Camada 4 — Contracts). Deriva de `.claude/architecture/COMMUNICATION_MODEL.md` — não repete a explicação conceitual, apenas o checklist verificável. Precedência: em caso de conflito, `COMMUNICATION_MODEL.md` e os documentos acima dele na hierarquia (`AI_OPERATING_SYSTEM.md` item 4) sempre prevalecem.

## 1. Formato obrigatório de retorno (Sub-agent/fork → chamador)

- [ ] Resumo estruturado — nunca histórico bruto de chamadas de ferramenta.
- [ ] Segue (ou justifica desvio de) o padrão já em uso nesta sessão: **Diagnóstico → Problemas encontrados → Melhorias aplicadas/Achados → Estrutura final → Arquivos criados/removidos/alterados**.
- [ ] Achados classificados quando a tarefa for de auditoria/revisão (Inconsistência / Observação Técnica / Melhoria Futura — `PROJECT_GOVERNANCE.md`).
- [ ] Confirmação explícita de que nenhum arquivo fora do escopo delegado foi tocado.

## 2. Formato obrigatório de delegação (chamador → Sub-agent/fork)

- [ ] Escopo explícito: o que está dentro e o que está fora (arquivos/pastas nomeados, não implícitos).
- [ ] Contexto necessário incluído no prompt — nunca assumir que o subagent vai adivinhar ou "lembrar" de algo não escrito.
- [ ] Critério de conclusão objetivo (o que torna a tarefa "pronta").
- [ ] Formato de entregável esperado especificado (ver item 1).
- [ ] Referência aos documentos-fonte que o subagent deve ler antes de agir, quando a tarefa depende de convenção já estabelecida.

## 3. Regra de isolamento verificável

- [ ] Após a execução, os arquivos efetivamente tocados (`git status`/listagem) correspondem exatamente ao escopo declarado na delegação — nenhum a mais.
- [ ] Um Sub-agent nunca devolve segredo/credencial/`.env` em seu retorno (ver `COMMUNICATION_MODEL.md` item 4).
- [ ] Um Sub-agent nunca altera um Contract para "passar" em sua própria validação.

## 4. Regra de não duplicação de trabalho entre execuções paralelas

- [ ] Cada delegação paralela declara explicitamente que não tocará nos arquivos de responsabilidade das delegações irmãs (padrão já em uso: "Não toque em nenhuma outra pasta de skill").
- [ ] Nenhuma delegação paralela lê o mesmo arquivo com intenção de escrita simultânea que outra delegação paralela também escreverá.
- [ ] Consolidação dos resultados paralelos é sempre feita pelo chamador comum, nunca por uma das execuções paralelas em nome das demais.

---

Precedência: em caso de conflito entre este contrato e `COMMUNICATION_MODEL.md`, `LAYER_MODEL.md`, `AI_OPERATING_SYSTEM.md`, `PROJECT_GOVERNANCE.md` ou `CLAUDE.md` (raiz), o documento de maior hierarquia sempre prevalece.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
