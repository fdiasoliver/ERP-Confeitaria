# skill-contract.md — Contrato formal de Skill

Parte da camada Contracts do AI Operating System (`.claude/architecture/LAYER_MODEL.md`, Camada 4). Deriva de `.claude/skills/project-skill-governance/references/skill-format.md` (procedimento completo de formatação) — não repete esse procedimento, é o checklist objetivo e verificável para decidir se uma Skill está conforme. Referenciado por `project-skill-governance/SKILL.md` item 8 ("Critérios de aceite") como o detalhamento operacional daquele item.

## 1. Entradas

- [ ] `description` deixa claro, em uma leitura, qual situação real aciona a Skill.
- [ ] Se há risco de confusão de nome com outra Skill/documento (ex. `architecture` vs. `ARCHITECTURE.md`), a `description` diz isso explicitamente.

## 2. Saídas

- [ ] A Skill entrega orientação aplicada à tarefa do consumidor — nenhuma Skill de camada de código (`architecture`, `api-pattern`, `repository-pattern`, `frontend-pattern`, `schema-pattern`, `coding-standards`) produz arquivo de documento próprio; confirmado contra as 17 Skills existentes, nenhuma viola isso hoje.

## 3. Artefatos

- [ ] A Skill declara, na sua seção "Responsabilidades" ou "Compatibilidade com Sub-agents", se produz algum artefato de arquivo real (nenhuma das 17 Skills atuais produz — todas apenas orientam a produção de artefatos definidos em `ARTIFACT_MODEL.md`, como `SPRINT_X.md`).
- [ ] Se uma Skill futura vier a produzir artefato de arquivo diretamente, o nome desse artefato deve seguir `contracts/artifact-contract.md`.

## 4. Dependências

- [ ] Toda Skill nova é registrada em `project-skill-governance/references/SKILL_DEPENDENCIES.md` com suas dependências reais (Skills que cita) e quem passa a depender dela.
- [ ] Este contrato **não repete** o mapa — só formaliza a obrigação de mantê-lo atualizado.

## 5. Pré-condições

- [ ] A Skill declara, em "Quando utilizar"/"Quando NÃO utilizar", o que precisa existir antes de ela ser útil (ex. `frontend-pattern` pressupõe API já implementada; `sprint-execution` pressupõe FASE -1/0.5 concluídas).

## 6. Pós-condições

- [ ] A Skill declara o estado esperado depois de seguida (ex. "Critérios de sucesso" de cada Skill já cumpre isso — confirmar que a seção existe e é objetiva, não vaga).

## 7. Compatibilidade com Sub-agents

- [ ] Toda Skill tem a subseção "Compatibilidade com Sub-agents" (obrigatória desde a Sprint G.5.2) dentro de "Referências cruzadas", respondendo: quem pré-carregaria via `skills:`, quem não deveria, conhecimento fornecido, artefatos produzidos, entradas/saídas.
- [ ] Este contrato torna esse requisito formal e verificável — uma Skill sem essa subseção **não está conforme**, independentemente de qualquer outro critério.

## Checklist de conformidade

Uma Skill só está pronta para incorporação quando:

- [ ] Arquivo é exatamente `SKILL.md` (maiúsculo), único na pasta (exceção documentada: `project-skill-governance`).
- [ ] Frontmatter válido, `description` em inglês, corpo em português.
- [ ] Segue a estrutura de 11 seções de `skill-format.md` item 3.
- [ ] Item 1 (Entradas) — description clara.
- [ ] Item 2 (Saídas) — não produz artefato de arquivo se for Skill de camada de código.
- [ ] Item 3 (Artefatos) — declarado explicitamente, mesmo que "nenhum".
- [ ] Item 4 (Dependências) — registrada em `SKILL_DEPENDENCIES.md`.
- [ ] Item 5 (Pré-condições) — declaradas em "Quando NÃO utilizar" ou equivalente.
- [ ] Item 6 (Pós-condições) — "Critérios de sucesso" objetivo.
- [ ] Item 7 (Compatibilidade com Sub-agents) — subseção presente e completa.
- [ ] Não duplica mais de 30% de conteúdo de outra Skill (`skill-format.md` item 5).

---

Precedência: em caso de conflito entre este contrato e `project-skill-governance/references/skill-format.md` ou `PROJECT_GOVERNANCE.md`, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
