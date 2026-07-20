# checklist.md — Bootstrap e início de Sprint

Parte da Skill `project-bootstrap`. Duas checklists sequenciais: a primeira ao assumir o projeto pela primeira vez numa sessão, a segunda antes de escrever a primeira linha de código de uma sprint.

## Checklist de bootstrap (início de sessão)

Ao assumir este projeto pela primeira vez em uma sessão:

- [ ] Ler `CLAUDE.md` integralmente.
- [ ] Ler, na ordem oficial: `PROJECT_GOVERNANCE.md` → `REGRAS_NEGOCIO.md` → `PLAN.md` → `CHANGELOG.md` → `docs/ai/AI_PROMPT_ORCHESTRATOR.md` → `SPRINT_X.md`/`SPRINT_AUDIT.md` da sprint corrente (quando existirem).
- [ ] Verificar o estado atual do roadmap em `PLAN.md` (quais módulos/sprints já estão concluídos).
- [ ] Verificar `CHANGELOG.md` para entender o histórico recente.
- [ ] Se for tocar em código: confirmar `npm install` executado e `npm run db:generate` executado após qualquer alteração de schema (obrigatório após `npm install`, ver `CLAUDE.md`).
- [ ] Não assumir escopo de nenhuma tarefa sem um `SPRINT_X.md` (skill `sprint-governance`).

## Critérios para iniciar uma Sprint

Antes de escrever qualquer linha de código, todos os itens abaixo devem estar satisfeitos:

- Módulo e sprint identificados com nomenclatura oficial (ex.: "Sprint 2.G.4 — API").
- Documentação relevante lida (documentos obrigatórios + ordem de leitura, ver `SKILL.md`).
- Dependências confirmadas como existentes.
- Arquivos a criar/alterar listados explicitamente.
- Microtarefas declaradas (verbo + objeto + arquivo).
- Critérios de aceite definidos.
- **Aprovação explícita do Product Owner recebida.**
- Os dois artefatos obrigatórios existem: `SPRINT_X.md` e `SPRINT_AUDIT.md` (produzidos pelo Orchestrator na FASE 0).

Critérios completos: `PROJECT_GOVERNANCE.md` Seção 5; artefatos obrigatórios: `AI_PROMPT_ORCHESTRATOR.md` Seção 5.
