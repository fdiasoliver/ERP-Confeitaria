# Playbook: Audit

Playbook do AI Operating System (Sprint G.5.6), conforme `playbooks/PLAYBOOK_ARCHITECTURE.md`. Especialização do `MISSION_PLAYBOOK.md` para auditorias — somente leitura, nenhuma correção automática, distinto de `GOVERNANCE_PLAYBOOK` (que trata evolução de regra) e do `validation` Protocol isolado (checagem técnica, não conformidade).

## 1. Objetivo / Escopo

Certificar o estado de conformidade de um conjunto de artefatos (Skills, Sub-agents, Protocols, Contracts, ou código) sem alterar nada — só diagnosticar e classificar.

**Quando utilizar:** certificação de infraestrutura antes de uma sprint dependente (ex. a Sprint G.5.2.1 desta sessão, que certificou as Skills antes da G.5.3 poder começar); auditoria de sprint concluída, antes do encerramento.
**Quando NÃO utilizar:** quando correção também é esperada no mesmo ciclo — nesse caso use `IMPLEMENTATION_PLAYBOOK`/`REFACTORING_PLAYBOOK` depois da auditoria, nunca no mesmo Playbook (separação de papéis já estabelecida: quem audita não corrige).

## 2. Pré-condições / Pós-condições

**Pré-condições:** escopo da auditoria definido explicitamente (quais aspectos, quais arquivos); nenhuma alteração de arquivo autorizada durante a execução.
**Pós-condições:** laudo de certificação com veredito objetivo; zero arquivo alterado.

## 3. Entradas / Saídas

**Entradas:** escopo da auditoria + critérios de classificação (`PROJECT_GOVERNANCE.md` — Inconsistência/Observação Técnica/Melhoria Futura).
**Saídas:** laudo estruturado com achados classificados e veredito (certificado / certificado com ressalva / não certificado).

## 4. Artefatos produzidos

Laudo de auditoria (Relatório Executivo + Relatório Técnico + listas classificadas) — nunca um arquivo de código ou documento alterado.

## 5. Skills necessárias / Contracts utilizados / Operational Protocols utilizados / Sub-agents participantes

**Skills:** `sprint-audit`, `engineering-reviewer`, `governance`.
**Contracts:** `artifact-contract.md` (formato do laudo).
**Operational Protocols:** `review` (o protocolo central desta missão), `communication` (formato do retorno de cada sessão delegada).
**Sub-agents:** `ai-governance-officer` lidera e é o único que emite o veredito; outros Sub-agents (ex. `ai-backend-engineer`) podem ser delegados para auditar aspectos técnicos específicos de sua camada, mas sempre em modo somente-leitura.

## 6. Sequência completa de execução

1. `ai-project-manager` recebe o pedido de auditoria e define o escopo exato (quais aspectos).
2. Delega para `ai-governance-officer` (e, se o escopo exigir, outros Sub-agents em paralelo, cada um limitado a um aspecto — mesmo padrão de "cada sessão audita apenas um aspecto" já usado na Sprint G.5.2.1 desta sessão).
3. Cada sessão delegada lê, classifica achados (teste de duas perguntas de `sprint-audit`), e retorna sem alterar nenhum arquivo.
4. `ai-governance-officer` consolida os achados de todas as sessões em um único laudo.
5. Protocol `review`: veredito final (certificado / certificado com ressalva / não certificado), com justificativa.
6. Retorna ao Orchestrator/Product Owner — nenhuma correção é aplicada nesta mesma missão.

## 7. Critérios de sucesso / interrupção / retorno ao Orchestrator

**Sucesso:** laudo completo, todo achado classificado corretamente, zero arquivo alterado.
**Interrupção:** uma sessão delegada tenta alterar um arquivo (viola o escopo somente-leitura) — interromper e reportar, nunca aceitar a alteração.
**Retorno ao Orchestrator:** ao final, com o laudo completo e o veredito.

## 8. Exemplos completos

**Exemplo real:** a Sprint G.5.2.1 desta sessão ("Certificação da Infraestrutura de Skills") é uma instância real e completa deste Playbook — 10 sessões delegadas, cada uma auditando um aspecto (padrão de SKILL.md, referências cruzadas, economia de contexto, responsabilidades, meta-skill, CLAUDE.md, compatibilidade Sub-agents, artefatos, dependências, contratos), nenhuma alterou arquivo, e o veredito final foi "não certificada sem ressalva" com 3 Inconsistências pontuais listadas — exatamente o formato de saída exigido por este Playbook.

---

Precedência: em caso de conflito entre este Playbook e `playbooks/PLAYBOOK_ARCHITECTURE.md` ou qualquer Contract/Protocol/Sub-agent, os documentos/fonte originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.6 (Implementação dos Playbooks). -->
