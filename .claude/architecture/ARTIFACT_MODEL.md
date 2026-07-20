# ARTIFACT_MODEL.md — Modelo de Ciclo de Vida de Artefatos

Parte da arquitetura do AI Operating System (Sprint G.5.3). Define o **modelo/ciclo de vida** de um artefato dentro do sistema — não é o catálogo de nomes canônicos (isso é `../contracts/artifact-contract.md`, que deriva deste modelo). Fonte de verdade da hierarquia: `AI_OPERATING_SYSTEM.md` item 4; das 7 camadas: `LAYER_MODEL.md`.

## 1. O que é um artefato

Um artefato é qualquer coisa produzida por uma camada do AI Operating System e consumida por outra, com **identidade estável**: um nome canônico, um formato definido e um local canônico no repositório. Isso o distingue de um resultado efêmero de conversa (uma resposta de chat, um resumo intermediário que nenhuma outra camada volta a consultar) — se nada além da sessão atual precisa reencontrar aquele conteúdo, não é um artefato deste modelo.

## 2. Ciclo de vida

```
Nasce → Validado → Entregue → Consumido → (opcional) Arquivado/Superado
```

| Etapa | Critério |
|---|---|
| Nasce | Produzido por uma camada/papel específico, seguindo o contrato aplicável (`../contracts/artifact-contract.md`, quando existir para o tipo). |
| Validado | Confere contra um critério objetivo — não "parece pronto", mas uma checklist verificável (ex.: `SPRINT_AUDIT.md` confrontado item a item, não só lido). |
| Entregue | Chega ao consumidor esperado (outra camada, outro papel, ou o Product Owner) no local canônico. |
| Consumido | Uma camada/papel posterior o usa como entrada real de uma decisão ou de outro artefato. |
| Arquivado/Superado | Uma versão nova o substitui (ex.: um `SPRINT_AUDIT.md` novo não apaga o anterior, mas o anterior deixa de ser a referência ativa) — opcional; nem todo artefato é versionado (`PLAN.md`/`CHANGELOG.md` são cumulativos, não substituídos).

Um artefato que nasce mas nunca é validado nem entregue não conta como concluído — está preso na etapa "Nasce", independentemente de o conteúdo existir em disco.

## 3. Categorias de artefato

| Categoria | Exemplos reais já no projeto |
|---|---|
| Sprint | `SPRINT_X.md`, `SPRINT_AUDIT.md` |
| Governança | `PLAN.md`, `CHANGELOG.md`, `KNOWN_ISSUES.md`, ADR |
| Relatório | Resumo/Relatório Executivo, Relatório Técnico, os 6 blocos do relatório final de `engineering-reviewer` |
| Arquitetura | Os documentos desta própria Sprint G.5.3 (`AI_OPERATING_SYSTEM.md`, `LAYER_MODEL.md` e os demais em `.claude/architecture/`) |
| Código | Fora do escopo de produção por IA-governança — é o destino final da Camada 7 (ERP), não um artefato desta pilha |

Categorias novas só devem ser adicionadas quando um artefato real não se encaixa em nenhuma das acima — não crie categoria especulativa.

## 4. Regra de identidade única

Todo artefato tem exatamente **um** nome canônico e **um** local canônico — nunca duas grafias diferentes apontando para o mesmo conceito. A Auditoria 8 da Sprint G.5.2.1 encontrou uma violação leve real desta regra (o handoff de fim-de-sprint nomeado de três formas distintas entre `engineering-reviewer`, `sprint-audit` e `orchestrator`, sem confusão de arquivo mas sem nome único) — esse achado é o motivador direto desta regra formal. `../contracts/artifact-contract.md` é responsável por listar o catálogo completo e eliminar esses sinônimos remanescentes; este modelo apenas estabelece que a regra existe e por quê.

## 5. Produção e consumo por camada

| Camada | Produz | Consome |
|---|---|---|
| CLAUDE.md (raiz) | Nenhum artefato próprio — é fonte, não produto | Nenhum |
| Meta-Skill | Validação passa/falha (não é artefato-arquivo, é um veredito) | `SKILL_TEMPLATE.md`, Skills propostas |
| Skills | Nenhum artefato-arquivo próprio (orientação aplicada, não documento) — exceto `engineering-reviewer`, que produz os 6 blocos de relatório | `CLAUDE.md`, outras Skills |
| Contracts | Os 5 contratos formais (`agent-contract.md` etc.) | Os `*_MODEL.md` correspondentes |
| Sub-agents (G.5.4+) | Resultado resumido devolvido ao chamador; artefatos de código/documento conforme a persona | Skills pré-carregadas, `agent-contract.md`, artefatos de entrada da delegação |
| Playbooks (futuro) | Conjunto de artefatos da missão completa + relatório consolidado | Sub-agents, Skills, Contracts |
| ERP | Código, build, deploy | Todo o processo acima, indiretamente |

---

Precedência: em caso de conflito entre este documento e `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, qualquer ADR ou `CLAUDE.md` (raiz), o documento original sempre prevalece.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.3 (AI Operating System Architecture). -->
