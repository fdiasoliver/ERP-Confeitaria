# README.md — Playbooks (Doce Menina confeitaria-app)

Porta de entrada humana desta pasta. Não repete o conteúdo de nenhum `*_PLAYBOOK.md` — só orienta a navegação. Para o conceito de Playbook (o que é, ciclo de vida, integração), veja `PLAYBOOK_ARCHITECTURE.md` (Sprint G.5.3) — este README não redefine, aponta.

## O que é um Playbook

Procedimento reutilizável de ponta a ponta que orquestra **Operational Protocols** (`.claude/protocols/`) e **Sub-agents** (`.claude/agents/`) para cumprir uma missão recorrente. Nunca reimplementa uma regra de negócio de Skill, nunca redefine um Contract/Protocol/Sub-agent já existente. Implementados na Sprint G.5.6, sobre a arquitetura de 8 camadas fechada nas Sprints G.5.3-G.5.5; `PRODUCT_REVIEW_PLAYBOOK.md` (11º) adicionado na Sprint G.6.

## Os 11 Playbooks

1 genérico (`MISSION_PLAYBOOK.md`) + 10 especializados, cada um em seu próprio arquivo. Comece por `PLAYBOOK_INDEX.md` para navegação rápida por categoria.

## Documentos desta pasta

| Arquivo | Cobre |
|---|---|
| `PLAYBOOK_ARCHITECTURE.md` | Conceito de Playbook (Sprint G.5.3) — leia primeiro |
| `PLAYBOOK_INDEX.md` | Navegação rápida dos 11 Playbooks por categoria |
| `MISSION_PLAYBOOK.md` | Fluxo genérico do qual os demais derivam |
| `IMPLEMENTATION_PLAYBOOK.md` | Desenvolvimento de funcionalidades novas |
| `ARCHITECTURE_PLAYBOOK.md` | Evolução da arquitetura do próprio AI Operating System |
| `AUDIT_PLAYBOOK.md` | Auditoria/certificação — somente leitura |
| `PRODUCT_REVIEW_PLAYBOOK.md` | Revisão de qualidade de produto (UX/UI/navegação/usabilidade) — somente leitura, entre Frontend e QA |
| `DOCUMENTATION_PLAYBOOK.md` | Missão dedicada a documentação |
| `REFACTORING_PLAYBOOK.md` | Dívida técnica sem mudar comportamento |
| `BUGFIX_PLAYBOOK.md` | Correção de comportamento incorreto ativo |
| `RELEASE_PLAYBOOK.md` | Encerramento formal de sprint/módulo |
| `GOVERNANCE_PLAYBOOK.md` | Evolução de regra de governança do ERP |
| `EMERGENCY_PLAYBOOK.md` | Bloqueio/erro de infraestrutura — transversal |

**Comece por `PLAYBOOK_INDEX.md`.**

---

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.6 (Implementação dos Playbooks). -->
