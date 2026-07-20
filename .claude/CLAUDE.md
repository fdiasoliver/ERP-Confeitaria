# .claude/CLAUDE.md — Visão e princípios de `.claude/`

**Não confundir com o `CLAUDE.md` da raiz do projeto** — aquele é a documentação permanente do Doce Menina (stack, arquitetura, fluxo de sprints). Este arquivo é local a `.claude/` e cobre apenas visão, arquitetura, ordem de leitura/carregamento e princípios desta pasta. **Não é** o lugar do procedimento de como escrever uma Skill — isso agora vive em `.claude/skills/project-skill-governance/references/skill-format.md` (Sprint G.5.2, alinhando com a [documentação oficial de Skills](https://code.claude.com/docs/pt/skills), que reserva o corpo de uma Skill para conteúdo carregado sob demanda, nunca para procedimento permanente).

---

## Visão

`.claude/` é a infraestrutura de Skills deste projeto: conhecimento e processo que uma IA carrega sob demanda (não em toda sessão, como o `CLAUDE.md` raiz) para executar tarefas de arquitetura, camada de código, sprint e governança de forma consistente entre sessões.

## Arquitetura da pasta

```
.claude/
├── CLAUDE.md          # este arquivo — visão, ordem de leitura, princípios
├── skills/             # Skills do Claude Code
│   └── {nome}/SKILL.md
├── architecture/        # arquitetura do AI Operating System (Sprint G.5.3) — camada acima das Skills
├── contracts/            # contratos formais — interfaces (agent/skill/artifact/communication/delegation)
├── protocols/             # Operational Protocols — comportamentos (Sprint G.5.5, 10 protocolos)
├── agents/                # Sub-agents reais implementados (Sprint G.5.4)
├── playbooks/             # arquitetura de Playbooks (implementação agendada — Sprint G.5.6)
├── templates/          # modelos reutilizáveis (SKILL_TEMPLATE.md populado — ver project-skill-governance)
└── prompts/             # prompts reutilizáveis (ainda vazia)
```

`skills/`, `templates/` e `prompts/` têm propósito distinto — nunca misturar conteúdo entre elas. Uma Skill ensina uma IA a se comportar; um template é um modelo de documento a preencher; um prompt é um texto pronto para reenviar.

## Ordem de leitura recomendada

Antes de criar ou alterar qualquer Skill: `.claude/skills/project-skill-governance/SKILL.md` (o que ela cobre) → `references/skill-format.md` (como formatar) → `references/SKILL_DEPENDENCIES.md` (onde a Skill se encaixa) → `references/RESPONSIBILITIES.md` (não sobrepor outra Skill já existente).

Antes de trabalhar em qualquer tarefa do projeto: `CLAUDE.md` (raiz) primeiro — este arquivo e as Skills são um nível abaixo dele na hierarquia (ver `project-skill-governance/references/CONFLICT_RESOLUTION.md`).

Antes de qualquer decisão de arquitetura do próprio AI Operating System (não do ERP): `architecture/AI_OPERATING_SYSTEM.md` (visão e hierarquia completa, Sprint G.5.3) — esta camada fica entre a meta-skill e as Skills, e nenhuma Skill ou contrato pode contrariá-la.

## Ordem de carregamento

O Claude Code descobre uma Skill pelo arquivo `.claude/skills/{nome}/SKILL.md` (maiúsculo — exigência funcional do mecanismo de descoberta, não estilo). A `description` do frontmatter fica sempre em contexto; o corpo completo só carrega quando a Skill é invocada (por você ou automaticamente pelo Claude, conforme a `description`). Detalhe técnico completo: [documentação oficial de Skills](https://code.claude.com/docs/pt/skills).

## Princípios

- **Referenciar, nunca duplicar.** Uma regra já documentada em `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, `AI_PROMPT_ORCHESTRATOR.md`, `CLAUDE.md` (raiz) ou outra Skill é apontada, não copiada.
- **Exemplos reais, nunca genéricos.** Toda Skill deste projeto cita código, CHANGELOG ou decisão real já existente.
- **Sinalizar, não resolver.** Ambiguidade real entre documentos-fonte é registrada, nunca decidida sozinha dentro de uma Skill.
- **PT-BR no corpo, inglês na `description`.** Exceção deliberada — a `description` é o campo de descoberta/ativação do próprio Claude Code.
- **Toda Skill nova nasce de `.claude/templates/SKILL_TEMPLATE.md`** e é validada por `project-skill-governance` antes de ser considerada incorporada ao projeto.

## Referências

| Preciso de... | Vou em... |
|---|---|
| Procedimento completo de como escrever/formatar um `SKILL.md` | `skills/project-skill-governance/references/skill-format.md` |
| Onde uma Skill nova se encaixa, dependências | `skills/project-skill-governance/references/SKILL_DEPENDENCIES.md` |
| Responsabilidades/limites de cada Skill | `skills/project-skill-governance/references/RESPONSIBILITIES.md` |
| Fluxo oficial de sprint ponta a ponta | `skills/project-skill-governance/references/WORKFLOW.md` |
| Resolução de conflito entre Skills/documentos | `skills/project-skill-governance/references/CONFLICT_RESOLUTION.md` |
| Template oficial para gerar uma Skill nova | `templates/SKILL_TEMPLATE.md` |
| Arquitetura completa do AI Operating System (camadas, fluxo, estados, contratos, Protocols, Sub-agents, Playbooks) | `architecture/AI_OPERATING_SYSTEM.md` |
| Operational Protocols (comportamentos de colaboração entre Sub-agents) | `protocols/README.md` |

---

<!-- Histórico: v1.0 criada em 13/07/2026 — Sprint G.5.0 (Infraestrutura das Skills). -->
<!-- v1.1 em 13/07/2026 — item 1 atualizado: toda Skill nova passa a ser gerada a partir de SKILL_TEMPLATE.md e validada por project-skill-governance antes de incorporação; item 6 e diagrama de estrutura atualizados para refletir SKILL_TEMPLATE.md já populado. -->
<!-- v2.0 em 13/07/2026 — Sprint G.5.2: arquivo enxugado para conter apenas visão/arquitetura/ordem de leitura/princípios/referências, alinhado à documentação oficial de Skills. Procedimento completo de formatação (frontmatter, seções, estilo, versionamento) migrado para skills/project-skill-governance/references/skill-format.md. SKILL.md (maiúsculo) passa a ser o nome de arquivo obrigatório em toda a árvore de skills/. -->
<!-- v2.1 em 15/07/2026 — Sprint G.5.3: adicionadas architecture/, contracts/ e playbooks/ ao diagrama de estrutura e à tabela de referências — nova camada de arquitetura do AI Operating System acima das Skills. -->
<!-- v2.2 em 15/07/2026 — Sprint G.5.4: adicionada agents/ (9 Sub-agents reais implementados). -->
<!-- v2.3 em 15/07/2026 — Sprint G.5.5: adicionada protocols/ (Operational Protocols, camada de comportamentos entre Contracts e Sub-agents). -->
