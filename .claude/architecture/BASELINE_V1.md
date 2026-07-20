# BASELINE_V1.md — AI Operating System v1.0 (Doce Menina confeitaria-app)

Documento de congelamento oficial produzido na Sprint G.5.7, encerrando o ciclo de construção iniciado na Sprint G.5.0. A partir deste documento, o AI Operating System é considerado **estável** — pronto para sustentar o desenvolvimento funcional do ERP. Qualquer alteração no que está congelado aqui exige ADR (`PROJECT_GOVERNANCE.md` Seção 13.6).

---

## 1. Escopo da Baseline

A Baseline cobre exclusivamente a infraestrutura de IA deste projeto — nunca o ERP (`src/`, `prisma/`) em si. Abrange as 8 camadas construídas nas Sprints G.5.0–G.5.6, certificadas na G.5.7:

```
CLAUDE.md (raiz)
        ↓
Meta-Skill (project-skill-governance)
        ↓
Skills (.claude/skills/*)
        ↓
Contracts (.claude/contracts/*)
        ↓
Operational Protocols (.claude/protocols/*)
        ↓
Sub-agents (.claude/agents/*)
        ↓
Playbooks (.claude/playbooks/*)
        ↓
ERP (src/, prisma/) — fora da Baseline, é o alvo, não um componente dela
```

## 2. Componentes congelados

| Componente | Quantidade | Local |
|---|---|---|
| Skills de domínio | 15 | `.claude/skills/*/SKILL.md` |
| Meta-Skill | 1 (+ 8 arquivos) | `.claude/skills/project-skill-governance/` |
| Documentos de arquitetura do AI OS | 10 | `.claude/architecture/*.md` |
| Contracts | 5 | `.claude/contracts/*.md` |
| Operational Protocols | 10 | `.claude/protocols/*/PROTOCOL.md` (+ 5 docs de hub) |
| Sub-agents reais | 9 | `.claude/agents/*.md` (+ 7 docs de hub) |
| Arquitetura de personas (pré-implementação) | 1 hub + 9 | `.claude/architecture/agents/` |
| Playbooks | 10 | `.claude/playbooks/*_PLAYBOOK.md` (+ 2 docs de hub + `PLAYBOOK_ARCHITECTURE.md`) |
| **Total de arquivos de infraestrutura** | **~104** | `.claude/` |

## 3. Responsabilidades por camada

Não repetidas aqui — fonte de verdade única: `LAYER_MODEL.md` (contrato completo das 8 camadas: objetivo, responsabilidade, entradas/saídas, dependências, consumidores/produtores, limites, regras).

## 4. Limitações conhecidas e aceitas (não bloqueiam a certificação)

- **`ai-refactoring-engineer` opera sem Skill de refatoração dedicada** — `architecture`/`coding-standards` descrevem o padrão-alvo, não a técnica de migração segura. Lacuna real, herdada desde a Sprint G.5.3, carregada conscientemente até aqui.
- **Ausência de suíte de testes automatizados no ERP** — `ai-qa-engineer`/`BUGFIX_PLAYBOOK` operam só com `tsc`/`lint`/`build`/regressão manual das 5 funcionalidades-âncora. Já registrado em `CLAUDE.md` (raiz), seção "A definir", desde antes desta série de sprints.
- **Sem template formal para Contracts/Protocols/Playbooks/Sub-agents** — só Skills têm `SKILL_TEMPLATE.md`. A uniformidade das outras 4 camadas foi mantida manualmente (prompts de delegação idênticos), não por um arquivo-template referenciável.
- **Meta-skill não estende sua governança às 4 camadas novas** (Contracts/Protocols/Sub-agents/Playbooks) — decisão deliberada desde a G.5.3 (`LAYER_MODEL.md` Camada 2: "nunca decide arquitetura acima do nível de Skill"), não uma lacuna a corrigir.
- **Overreach recorrente de fork em sprints de implementação** (4 episódios em G.5.3–G.5.6) — mecanismo de delegação ad-hoc via ferramenta Agent/fork (usado pelo Orchestrator para dividir trabalho) é distinto e menos restrito que os Sub-agents reais certificados aqui (que têm `tools`/`disallowedTools` explícitos). Os Sub-agents reais nunca violaram essa regra — a falha ocorreu apenas nas sessões de fork usadas para construí-los, não no comportamento dos Sub-agents certificados em si.

## 5. Premissas

- O mecanismo de Skills/Sub-agents é o oficial do Claude Code (https://code.claude.com/docs/pt/skills, https://code.claude.com/docs/pt/sub-agents) — a Baseline não inventa nenhum mecanismo próprio de descoberta/carregamento.
- Contracts, Operational Protocols e Playbooks são **convenções próprias deste projeto**, em markdown puro, sem mecanismo nativo do Claude Code — sua "execução" depende de uma sessão de IA (ou Sub-agent) lê-los e segui-los, não de enforcement automático da ferramenta.
- `.claude/agents/` é tratado como caminho funcionalmente reservado — nenhum outro documento de arquitetura vive lá; documentação de persona (pré-implementação) vive em `.claude/architecture/agents/`.

## 6. Pontos de extensão futuros

- Novas Skills, Contracts, Protocols, Sub-agents ou Playbooks podem ser adicionados seguindo o padrão já estabelecido, sem exigir redesenho de camada (confirmado na Auditoria de Escalabilidade da G.5.7).
- Playbooks são o ponto de extensão mais natural para novos tipos de missão recorrente — a estrutura de 8 seções e o `MISSION_PLAYBOOK.md` genérico já suportam um 10º Playbook sem alteração de arquitetura.
- Um mecanismo técnico de enforcement de escopo de fork (hook ou verificação automática pós-delegação) é o próximo passo natural para resolver a Limitação 4 do item 4 — não implementado nesta Baseline, candidato a ADR futura.

## 7. Critérios para evolução (a partir de agora)

Formalizados em `PROJECT_GOVERNANCE.md` Seção 13.6:
1. Alteração em Skill/Contract/Sub-agent/Playbook **existente** → exige ADR.
2. Alteração **estrutural** da arquitetura (camada nova, hierarquia nova) → exige Sprint arquitetural dedicada.
3. Criação de Skill/Contract/Protocol/Playbook **novo**, seguindo o padrão já estabelecido → não exige ADR, exige apenas o checklist já existente (`project-skill-governance` para Skills; padrão equivalente por analogia para as demais camadas, até que templates formais sejam criados).

---

Precedência: em caso de conflito entre este documento e `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md` ou qualquer ADR, os documentos originais sempre prevalecem.

<!-- Histórico: v1.0 criada em 15/07/2026 — Sprint G.5.7 (Certificação e Congelamento do AI Operating System). -->
