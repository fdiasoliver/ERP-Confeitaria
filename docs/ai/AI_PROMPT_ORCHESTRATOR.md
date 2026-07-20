# AI_PROMPT_ORCHESTRATOR.md

# AI Prompt Orchestrator
**Versão:** 1.2  
**Status:** Ativo  
**Projeto:** Doce Menina ERP

---

## Nota de vigência (Sprint G.6.4 — Sprint Backlog Governance)

Este documento representa uma **arquitetura expandida de orquestração** (papéis Orchestrator/Executor/Auditor, FASE 0/-1/0.5/6, artefatos `SPRINT_X.md`/`SPRINT_AUDIT.md`, máquina de 8 estados — "Estados da Sprint", abaixo) — permanece válido como **referência arquitetural** para evolução futura do processo, não é revogado nem depreciado por esta nota.

O **fluxo operacional vigente** — o que conduz de fato toda Sprint deste projeto, confirmado pelo histórico real em `CHANGELOG.md` — é o definido em `PROJECT_GOVERNANCE.md` Seção 4 (item 4.1), espelhado em `CLAUDE.md` (raiz, "Fluxo obrigatório para implementação de Sprints"): mais simples, sem os artefatos `SPRINT_X.md`/`SPRINT_AUDIT.md` e sem os nomes de estado abaixo. Nenhuma Sprint real produziu esses dois artefatos até hoje. Ver `PROJECT_GOVERNANCE.md` Seção 4.1 para o registro completo.

---

# 1. Objetivo

Este documento define o processo oficial de colaboração entre as Inteligências Artificiais utilizadas no desenvolvimento do projeto.

Seu objetivo é garantir que todas as implementações sigam rigorosamente a arquitetura do sistema, evitando improvisações, mudanças de escopo e inconsistências entre módulos.

Este documento complementa o PROJECT_GOVERNANCE.md e não o substitui.

Em caso de conflito entre este documento e o PROJECT_GOVERNANCE.md, prevalece sempre o PROJECT_GOVERNANCE.md.

---

# 2. Papéis

Este documento define **papéis arquiteturais**, não ferramentas específicas. Qualquer Inteligência Artificial poderá assumir qualquer papel, desde que cumpra integralmente as responsabilidades definidas abaixo.

Exemplos ilustrativos (não normativos, não fazem parte da regra oficial):
- ChatGPT pode atuar como Orchestrator.
- Claude pode atuar como Executor.
- Gemini pode atuar como Auditor.

## Product Owner (Fernando)

Responsável por:

- definir requisitos de negócio;
- aprovar funcionalidades;
- decidir prioridades;
- aprovar alterações arquiteturais;
- fornecer o documento `SPRINT_X.md` de cada sprint.

Não é responsável por decisões técnicas de implementação.

---

## Orchestrator

Responsável por:

- analisar impacto arquitetural;
- revisar escopo;
- identificar riscos;
- propor melhorias (quando compatíveis com o escopo);
- gerar os documentos `SPRINT_X.md` e `SPRINT_AUDIT.md` completos.

O Orchestrator não implementa código.

### Responsabilidades obrigatórias do Orchestrator

Antes de gerar qualquer Sprint, o Orchestrator deverá responder explicitamente:

- Por que esta Sprint existe?
- Por que ela precisa existir agora?
- Quais dependências justificam sua execução?
- Quais riscos são evitados ao executá-la agora?
- Por que ela não deve ser dividida?
- Quais melhorias arquiteturais são compatíveis com o escopo?
- Quais melhorias deverão ficar para sprints futuras?

Essas respostas deverão orientar a criação do `SPRINT_X.md`.

É proibido gerar uma Sprint sem responder essas perguntas.

---

## Executor

Responsável por:

- validar a sprint (FASE -1) antes de qualquer leitura de código;
- implementar código;
- executar comandos;
- atualizar documentação;
- realizar validações;
- produzir relatórios.

O Executor não deve tomar decisões arquiteturais sem autorização explícita.

---

## Auditor

Responsável por:

- revisar a implementação realizada;
- auditar documentação;
- classificar achados conforme a Seção 24 do `PROJECT_GOVERNANCE.md` (Inconsistência / Observação Técnica / Melhoria Futura);
- aprovar ou solicitar correções.

O Auditor não implementa código.

---

# 3. Fluxo Oficial

Toda Sprint deverá seguir obrigatoriamente a sequência abaixo.

```
FASE 0 — Análise Arquitetural
        ↓
SPRINT_X.md + SPRINT_AUDIT.md
        ↓
FASE -1 — Validação da Sprint
        ↓
FASE 0.5 — Auditoria de Contratos
        ↓
Implementação
        ↓
Autoauditoria Arquitetural
        ↓
Validações
        ↓
Auditoria Documental
        ↓
Atualização da Documentação
        ↓
Auditoria (Auditor)
        ↓
FASE 6 — Evolução da Governança
        ↓
Encerramento da Sprint
```

Nenhuma etapa poderá ser ignorada.

---

# 4. Fluxo Operacional

## Etapa 1

O Product Owner aprova a Sprint (estado PLANEJADA); o Orchestrator então produz `SPRINT_X.md` e `SPRINT_AUDIT.md` (ver Seção 5 — Artefatos Obrigatórios da Sprint).

---

## Etapa 2

O Orchestrator executa a FASE 0 — Análise Arquitetural e, em seguida, deverá:

- revisar arquitetura;
- analisar dependências;
- verificar riscos;
- identificar inconsistências;
- sugerir melhorias (quando compatíveis com o escopo);
- gerar os documentos `SPRINT_X.md` e `SPRINT_AUDIT.md` completos.

---

## Etapa 3

O Executor valida a sprint (FASE -1) e executa a implementação.

---

## Etapa 4

O Product Owner envia o log completo da execução ao Auditor.

---

## Etapa 5

O Auditor realiza a auditoria técnica.

O resultado deverá ser apenas um dos seguintes:

- APROVADO
- NECESSITA CORREÇÃO
- BLOQUEADO

---

# 5. Artefatos Obrigatórios da Sprint

A partir desta versão, toda Sprint deverá possuir obrigatoriamente **dois documentos**, ambos produzidos pelo Orchestrator na FASE 0. Nenhuma sprint poderá iniciar sem que os dois existam.

Caso qualquer um esteja ausente, o Executor deverá interromper imediatamente a execução e solicitar o documento correto. É proibido inferir ou assumir o escopo na ausência desses documentos.

## Documento 1 — SPRINT_X.md

Responsável: Orchestrator.

Objetivo: definir completamente a Sprint. Torna-se a fonte oficial de escopo da sprint (ex.: `SPRINT_2D6.md`, `SPRINT_2E1.md`).

Estrutura obrigatória (permanece a existente):

1. Objetivo
2. Escopo
3. Fora do Escopo
4. Arquivos permitidos
5. Arquivos proibidos
6. Dependências
7. Critérios técnicos
8. Critérios de aceite
9. Validações obrigatórias
10. Atualização documental
11. Resultado esperado

## Documento 2 — SPRINT_AUDIT.md

Responsável: Orchestrator.

Objetivo: definir exatamente o que deverá ser auditado após a implementação.

Estrutura mínima obrigatória:

1. Objetivo da auditoria
2. Escopo esperado
3. Arquivos permitidos
4. Arquivos proibidos
5. Checklist arquitetural
6. Checklist documental
7. Checklist de código
8. Checklist de validações
9. Critérios de aprovação
10. Critérios de bloqueio
11. Resultado esperado

O Auditor nunca deverá interpretar livremente a Sprint. Ele deverá confrontar o resultado obtido com este documento.

Essas duas estruturas são obrigatórias para todas as futuras sprints.

## Leitura obrigatória

Após receber o `SPRINT_X.md` e o `SPRINT_AUDIT.md`, o Executor deve sempre ler, nesta ordem:

- PROJECT_GOVERNANCE.md
- REGRAS_NEGOCIO.md
- PLAN.md
- CHANGELOG.md
- docs/ai/AI_PROMPT_ORCHESTRATOR.md
- `SPRINT_X.md`
- `SPRINT_AUDIT.md`

Quando necessário: VISION.md ou outros documentos específicos citados no `SPRINT_X.md`.

Classificação de achados de auditoria (arquitetural, documental ou de contratos): sempre conforme a Seção 24 do `PROJECT_GOVERNANCE.md` (Inconsistência / Observação Técnica / Melhoria Futura) — regra não duplicada aqui.

---

# FASE 0 — Análise Arquitetural

Formaliza o trabalho realizado pelo Orchestrator antes da geração da Sprint. Deverá conter obrigatoriamente:

- entendimento do objetivo da Sprint;
- análise das dependências;
- análise de impacto arquitetural (quais camadas serão afetadas);
- identificação de riscos (quebra de arquitetura, duplicidades, violações do PROJECT_GOVERNANCE.md, alterações fora do escopo, inconsistências documentais);
- verificação de conflitos com módulos existentes;
- identificação de oportunidades de melhoria compatíveis com o escopo (melhorias fora do escopo são apenas recomendação futura);
- validação da ordem do roadmap;
- definição da estratégia de implementação.

## Resultado obrigatório da FASE 0

- `SPRINT_X.md`
- `SPRINT_AUDIT.md`

Sem esses dois documentos a Sprint não poderá iniciar.

---

# FASE -1 — Validação da Sprint

Antes de qualquer leitura de código, o Executor deverá validar que o `SPRINT_X.md` recebido contém:

- objetivo;
- escopo;
- fora do escopo;
- arquivos permitidos;
- arquivos proibidos;
- critérios de aceite;
- validações obrigatórias;
- atualização documental prevista.

Caso qualquer item esteja ausente, o Executor deverá interromper imediatamente a execução e solicitar esclarecimento.

É proibido inferir requisitos.
É proibido assumir escopo.
É proibido implementar parcialmente.

---

# FASE 0.5 — Auditoria de Contratos

Antes de criar qualquer arquivo, o Executor deverá verificar previamente:

- DTOs;
- Types;
- Contratos HTTP;
- Responses;
- Requests;
- Interfaces públicas.

Regras:

- Nunca criar DTO duplicado.
- Nunca criar Type duplicado.
- Nunca criar contrato HTTP incompatível.
- Nunca criar contrato público novo sem autorização explícita.
- Sempre reutilizar contratos existentes quando possível.

Caso um contrato necessário não exista, interromper a execução e apresentar o bloqueio técnico antes de implementar qualquer solução alternativa.

---

# Estados da Sprint

Toda Sprint deverá obrigatoriamente possuir exatamente um estado. A transição ocorre apenas para frente — nunca é permitido retorno de estado.

```
PLANEJADA
    ↓
ORQUESTRADA
    ↓
VALIDADA
    ↓
EM IMPLEMENTAÇÃO
    ↓
IMPLEMENTADA
    ↓
AUTOAUDITADA
    ↓
AUDITADA
    ↓
ENCERRADA
```

**PLANEJADA** — Sprint aprovada pelo Product Owner.

**ORQUESTRADA** — `SPRINT_X.md` e `SPRINT_AUDIT.md` produzidos (FASE 0 concluída).

**VALIDADA** — Executor concluiu FASE -1 e FASE 0.5.

**EM IMPLEMENTAÇÃO** — Código em desenvolvimento.

**IMPLEMENTADA** — Implementação concluída.

**AUTOAUDITADA** — Executor realizou sua própria auditoria.

**AUDITADA** — Auditor concluiu revisão independente, confrontando o resultado com o `SPRINT_AUDIT.md`.

**ENCERRADA** — Toda documentação atualizada; governança evoluída (FASE 6); Sprint oficialmente concluída.

---

# 6. Auditoria Pós-Execução

Após receber o log do Executor, o Auditor deverá verificar:

- arquitetura;
- responsabilidades das camadas;
- documentação;
- regras de negócio;
- escopo;
- consistência do código;
- aderência ao padrão do projeto.

---

# 7. Resultado da Auditoria

A auditoria poderá ser realizada por qualquer agente que esteja exercendo o papel de Auditor, independentemente da ferramenta utilizada.

Somente três possibilidades:

## APROVADO

A Sprint pode ser encerrada.

---

## NECESSITA CORREÇÃO

Gerar um único Prompt corretivo.

---

## BLOQUEADO

Explicar claramente o motivo.

Nenhuma implementação deverá prosseguir até o bloqueio ser resolvido.

---

# Fluxo Oficial de Auditoria

Toda auditoria deverá seguir exatamente esta sequência. É proibido alterar esta ordem.

1. Conferir escopo da Sprint (contra o `SPRINT_X.md`)
2. Conferir arquivos alterados (contra "Arquivos permitidos"/"Arquivos proibidos" do `SPRINT_AUDIT.md`)
3. Conferir arquitetura
4. Conferir responsabilidades das camadas
5. Conferir documentação
6. Classificar achados (Inconsistência / Observação Técnica / Melhoria Futura — Seção 24 do `PROJECT_GOVERNANCE.md`)
7. Emitir parecer (APROVADO / NECESSITA CORREÇÃO / BLOQUEADO — ver Seção 7)
8. Gerar melhorias (ver FASE 6 — Evolução da Governança)
9. Gerar Prompt da próxima Sprint

Os itens 2 a 5 seguem os critérios da Seção 6 (Auditoria Pós-Execução) e do `SPRINT_AUDIT.md`.

---

# FASE 6 — Evolução da Governança

Após cada Sprint concluída e auditada (estado AUDITADA), identificar melhorias permanentes para o processo. Esta fase deverá avaliar:

- padrões repetitivos encontrados;
- regras que podem ser transformadas em governança;
- melhorias arquiteturais permanentes;
- simplificação do processo;
- eliminação de ambiguidades;
- prevenção de retrabalho futuro.

Resultado possível:

- atualização do `PROJECT_GOVERNANCE.md`;
- atualização do `AI_PROMPT_ORCHESTRATOR.md`;
- criação de ADR (quando necessário).

Esta fase nunca altera código.

---

# 8. Regras Gerais

É proibido:

- alterar arquivos fora do escopo definido no `SPRINT_X.md`;
- ampliar escopo por iniciativa própria;
- alterar arquitetura sem autorização;
- alterar o roadmap;
- criar novas sprints ou sub-sprints (ex.: `2.D.2.1`, `2.D.2.2`) para ajustes pontuais — ajustes encontrados durante uma sprint pertencem à própria sprint, exceto quando previamente planejados e aprovados como entregas independentes;
- criar contratos públicos, DTOs ou tipos duplicados sem autorização explícita (ver `PROJECT_GOVERNANCE.md` Seção 8.7 e FASE 0.5);
- alterar `PROJECT_GOVERNANCE.md` ou `REGRAS_NEGOCIO.md` sem autorização explícita;
- criar novas ADRs sem autorização;
- inferir requisitos não descritos no `SPRINT_X.md` (ver FASE -1);
- gerar mais de um `SPRINT_X.md` / mais de uma iteração por sprint;
- executar comandos ou validações não previstos no `SPRINT_X.md`.

É obrigatório:

- revisar arquitetura e documentação antes de implementar;
- seguir exatamente os padrões dos módulos existentes;
- respeitar integralmente o `PROJECT_GOVERNANCE.md` e este documento;
- classificar todo achado de auditoria conforme a Seção 24 do `PROJECT_GOVERNANCE.md`, sem misturar categorias;
- revisar `PLAN.md` e `CHANGELOG.md` quanto a duplicidade antes de atualizá-los;
- realizar auditoria após toda implementação;
- interromper imediatamente a execução diante de qualquer bloqueio técnico real, apresentar um diagnóstico objetivo e aguardar decisão do Product Owner — nunca assumir a solução.

Toda regra já definida em `PROJECT_GOVERNANCE.md` é referenciada aqui, não duplicada.

---

# 9. Regras de Documentação

O PLAN.md representa exclusivamente o estado atual do projeto.

O CHANGELOG.md representa exclusivamente o histórico do projeto.

Nunca registrar no CHANGELOG:

- opiniões;
- recomendações futuras;
- decisões não implementadas;
- planejamento.

Sempre registrar apenas fatos efetivamente ocorridos.

---

# 10. Evolução deste Documento

Este documento deverá evoluir juntamente com o projeto.

Toda alteração deverá:

- preservar compatibilidade com o processo existente;
- reduzir retrabalho;
- aumentar previsibilidade;
- manter simplicidade;
- evitar duplicidade de regras.

---

# 11. Processo Oficial de Trabalho

A partir deste documento, o fluxo oficial passa a ser:

```
Product Owner

↓

FASE 0 — Análise Arquitetural
(Orchestrator)

↓

SPRINT_X.md + SPRINT_AUDIT.md

↓

FASE -1 — Validação da Sprint
(Executor)

↓

FASE 0.5 — Auditoria de Contratos
(Executor)

↓

Implementação
(Executor)

↓

Autoauditoria + Validações
(Executor)

↓

Product Owner
(Log)

↓

Auditor
(Fluxo Oficial de Auditoria)

↓

APROVADO
ou
CORREÇÃO

↓

FASE 6 — Evolução da Governança

↓

Encerramento (ENCERRADA)
```

Este passa a ser o único fluxo oficial de desenvolvimento do projeto.

Nenhuma implementação poderá ser iniciada sem a leitura completa deste documento.
---

# 12. Histórico

| Versão | Data | Descrição |
|---------|------|-----------|
| 1.0 | 06/07/2026 | Criação do AI Prompt Orchestrator |
| 1.1 | 11/07/2026 | Sprint G.1 — Papéis reformulados como funções arquiteturais (Product Owner / Orchestrator / Executor / Auditor); FASE -1 (Validação da Sprint) e FASE 0.5 (Auditoria de Contratos) adicionadas; documento `SPRINT_X.md` formalizado como fonte obrigatória de escopo (Seção 5); Seções 9 e 10 consolidadas em "Regras Gerais"; proibição de sub-sprints incorporada; duplicidade com PROJECT_GOVERNANCE.md Seção 24 eliminada (referência, não repetição) |
| 1.2 | 11/07/2026 | Sprint G.2 — FASE 0 (Análise Arquitetural) e FASE 6 (Evolução da Governança) criadas; `SPRINT_AUDIT.md` formalizado como segundo artefato obrigatório de toda Sprint (Seção 5 retitulada "Artefatos Obrigatórios da Sprint"); seção "Estados da Sprint" criada (8 estados, transição unidirecional); seção "Fluxo Oficial de Auditoria" criada (9 passos); subseção "Responsabilidades obrigatórias do Orchestrator" adicionada à Seção 2; antiga Seção 6 (Auditoria Prévia) absorvida pela FASE 0; diagramas das Seções 3 e 11 atualizados; seções renumeradas em decorrência |
| 1.2 (nota) | 16/07/2026 | Sprint G.6.4 (Sprint Backlog Governance) — "Nota de vigência" adicionada ao topo: este documento permanece referência arquitetural válida; o fluxo operacional vigente é `PROJECT_GOVERNANCE.md` Seção 4.1. Nenhum conteúdo normativo deste documento foi removido ou alterado. |