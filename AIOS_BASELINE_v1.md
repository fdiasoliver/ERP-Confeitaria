# AIOS_BASELINE_v1.md — Baseline Operacional do AI Operating System

Documento de governança produzido na Sprint T.1 (Transição Oficial para Desenvolvimento do ERP), marcando o encerramento formal da fase de infraestrutura de IA (Sprints G.5.0–G.5.7) e o início da fase de desenvolvimento funcional do ERP. É a versão **executiva/de governança** da Baseline — não repete o detalhamento técnico já certificado em [`.claude/architecture/BASELINE_V1.md`](.claude/architecture/BASELINE_V1.md) (Sprint G.5.7), apenas resume o que importa para decidir sobre o projeto daqui para frente.

---

## 1. Escopo da Baseline

Cobre exclusivamente a infraestrutura de IA deste projeto — o conjunto de Skills, Contracts, Operational Protocols, Sub-agents e Playbooks em `.claude/`, construído nas Sprints G.5.0 a G.5.7. **Nunca** cobre o ERP em si (`src/`, `prisma/`, funcionalidades, regras de negócio) — isso permanece exclusivamente sob `PROJECT_GOVERNANCE.md`/`REGRAS_NEGOCIO.md`/`PLAN.md`.

## 2. Componentes oficiais

| Camada | Quantidade | Onde vive |
|---|---|---|
| Meta-Skill | 1 | `.claude/skills/project-skill-governance/` |
| Skills de domínio | 15 | `.claude/skills/*/SKILL.md` |
| Documentos de arquitetura do AI OS | 10 | `.claude/architecture/*.md` |
| Contracts | 5 | `.claude/contracts/*.md` |
| Operational Protocols | 10 | `.claude/protocols/*/PROTOCOL.md` |
| Sub-agents reais | 9 | `.claude/agents/*.md` |
| Playbooks | 10 | `.claude/playbooks/*_PLAYBOOK.md` |

Detalhamento técnico completo de cada componente: `.claude/architecture/BASELINE_V1.md` Seção 2.

## 3. Componentes congelados

Todos os listados no item 2. A partir da Sprint G.5.7 (`PROJECT_GOVERNANCE.md` Seção 13.6), **alterar qualquer um exige ADR aprovada**. Esta sprint (T.1) reforça essa regra e formaliza quando uma evolução pode sequer ser proposta (ver item 7).

## 4. Componentes extensíveis

Criar uma Skill/Contract/Protocol/Sub-agent/Playbook **novo**, seguindo o padrão já estabelecido pelos existentes, não exige ADR — apenas o checklist de validação já em vigor (`project-skill-governance` para Skills; padrão equivalente por analogia para as demais camadas, até que templates formais existam para elas — lacuna já registrada em `.claude/architecture/BASELINE_V1.md` item 4). Isso é distinto de alterar algo já congelado.

## 5. Responsabilidades de cada camada

Não repetidas aqui — fonte de verdade única: `.claude/architecture/LAYER_MODEL.md` (contrato completo das 8 camadas).

## 6. Limites da infraestrutura

- Nunca decide regra de negócio do ERP — isso é `REGRAS_NEGOCIO.md`/Product Owner.
- Nunca implementa funcionalidade do ERP diretamente — orienta quem implementa (Sub-agents/sessões seguindo Skills/Playbooks).
- Nunca substitui `PROJECT_GOVERNANCE.md` como autoridade máxima — toda a hierarquia de 8 camadas está subordinada a ele (`AI_OPERATING_SYSTEM.md` item 4).
- 5 limitações técnicas específicas já registradas e aceitas: `.claude/architecture/BASELINE_V1.md` item 4.

## 7. Critérios para futuras evoluções — a infraestrutura entra em modo de manutenção

A partir desta Sprint (T.1), a infraestrutura do AI Operating System **não evolui por conveniência**. Uma evolução só pode ser proposta quando as 4 condições abaixo se confirmarem simultaneamente (formalizadas em `PROJECT_GOVERNANCE.md` Seção 13.7):

1. Surgir um **bloqueio real** durante o desenvolvimento do ERP (não uma melhoria hipotética).
2. Existir **aprovação explícita** do Product Owner para investigar/resolver esse bloqueio via mudança de infraestrutura.
3. Existir uma **Ordem de Missão específica** para essa evolução — nunca como efeito colateral de uma sprint de funcionalidade.
4. Existir **registro documental da decisão** (ADR, conforme `PROJECT_GOVERNANCE.md` Seção 13.6).

Melhorias por conveniência identificadas durante o desenvolvimento do ERP são registradas como Melhoria Futura (`KNOWN_ISSUES.md` ou relatório de sprint) — **nunca implementadas imediatamente**, nunca interrompem o desenvolvimento funcional em andamento.

## 8. Política oficial de manutenção

- Toda futura Ordem de Missão de desenvolvimento do ERP segue `ERP_DEVELOPMENT_WORKFLOW.md` — não este documento.
- Este documento (`AIOS_BASELINE_v1.md`) é revisado apenas quando uma evolução de infraestrutura for formalmente aprovada (item 7) — nunca como parte de uma sprint de funcionalidade.
- Achado pendente de decisão, herdado da Sprint G.5.7 e ainda não resolvido pelo Product Owner: o mecanismo de delegação ad-hoc via fork do Orchestrator (distinto dos 9 Sub-agents reais, que nunca romperam escopo) excedeu escopo autorizado 6 vezes nas Sprints G.5.3–G.5.7. Não é um componente congelado desta Baseline (não é parte da arquitetura certificada), mas é um risco operacional real que deveria ser resolvido — via ADR, se e quando o Product Owner decidir — antes de reutilizar esse mesmo padrão de delegação em larga escala no desenvolvimento do ERP.

---

Precedência: em caso de conflito entre este documento e `PROJECT_GOVERNANCE.md`, `.claude/architecture/BASELINE_V1.md` ou qualquer ADR, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint T.1 (Transição Oficial para Desenvolvimento do ERP). -->
