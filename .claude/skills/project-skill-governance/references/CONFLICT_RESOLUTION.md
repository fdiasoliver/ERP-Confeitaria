# CONFLICT_RESOLUTION.md — project-skill-governance

Regras oficiais de resolução de conflito entre Skills, documentos, regras e agentes neste projeto. Parte da meta-skill `project-skill-governance` (Sprint G.5.1). Não implementa nada, não altera nada — apenas declara como decidir quando duas fontes de verdade parecem discordar.

---

## Hierarquia definitiva

```
PROJECT_GOVERNANCE.md
  ↓
REGRAS_NEGOCIO.md
  ↓
ADR (registradas em CLAUDE.md "Decisões arquiteturais tomadas" + ARCHITECTURE.md)
  ↓
AI_PROMPT_ORCHESTRATOR.md
  ↓
CLAUDE.md (raiz do projeto)
  ↓
project-skill-governance (esta meta-skill)
  ↓
Demais Skills (sprint-governance, project-bootstrap, orchestrator, governance,
               architecture, coding-standards, repository-pattern, api-pattern,
               frontend-pattern, sprint-planning, sprint-execution, documentation,
               sprint-audit, engineering-reviewer)
  ↓
Templates (PROJECT_GOVERNANCE.md Seções 19–22; futuro .claude/templates/)
```

**Nota de desambiguação:** "CLAUDE.md" nesta hierarquia é o arquivo da **raiz do projeto** (documentação permanente do Doce Menina — stack, arquitetura, convenções). Não confundir com `.claude/CLAUDE.md`, que é um documento diferente, local à pasta `.claude/`, e trata exclusivamente de convenções de formato para Skills — esse último não tem posição própria nesta hierarquia porque é meta-documentação sobre *como escrever* uma Skill, não uma fonte de regra de negócio ou processo.

**Regra central, inegociável:** nenhuma Skill — incluindo esta — pode contrariar esta hierarquia. Um nível inferior nunca invalida, reinterpreta ou "atualiza silenciosamente" um nível superior. Se um nível inferior parecer divergir de um superior, o nível inferior está errado até prova em contrário (ADR ou aprovação explícita do Product Owner), nunca o inverso.

---

## 1. Conflitos entre Skills

Quando duas Skills parecem dar orientação diferente sobre o mesmo assunto: **a Skill mais específica ao tópico prevalece sobre a mais geral.** Exemplo já válido no projeto: `repository-pattern` prevalece sobre `architecture` para o detalhe operacional de escrever um Repository — mas `architecture` prevalece se `repository-pattern` genuinamente *contradisser* algo nela (o que não deveria acontecer, já que ambas devem obedecer à mesma hierarquia acima).

**Prevenção já em prática:** cada uma das 14 Skills criadas nesta sessão leu as skills-irmãs potencialmente sobrepostas *antes* de escrever, exatamente para evitar este tipo de conflito nascer. Esta seção trata do que fazer se, apesar disso, um conflito real for encontrado depois:

1. Confirmar que é conflito real, não apenas nível de detalhe diferente (uma Skill mais funda em um assunto não "conflita" com um resumo em outra — ela o complementa).
2. Se for conflito real: a Skill mais específica ao tópico prevalece na prática, mas o conflito deve ser **registrado** (não silenciosamente ignorado) como Inconsistência (ver `sprint-audit`) para correção na Skill mais geral em uma sprint futura.
3. Nunca decidir por edição imediata das duas Skills durante uma sprint não dedicada a isso — registrar e seguir.

## 2. Conflitos entre documentos

A hierarquia da seção anterior resolve isto por definição: o documento mais alto na lista prevalece sempre. Não há ambiguidade a resolver caso a caso — é mecânico.

**Um terceiro tipo de conflito, não coberto pela hierarquia simples:** documento vs. prática real do código. Caso real já registrado nesta sessão (skill `architecture`, `references/layers.md`): `PROJECT_GOVERNANCE.md` Seção 8.2 mostra, no exemplo de código, o Service fazendo `getServerSession()` para checar autenticação — mas nenhum dos Services realmente implementados no projeto faz isso; a autenticação é feita exclusivamente na Route via `requireAdmin()`, em 100% dos módulos já construídos.

Isso **não** é um conflito entre dois documentos (a hierarquia não se aplica diretamente) — é uma divergência entre o que um documento *exemplifica* e o que a prática real *estabeleceu*. A hierarquia formal ainda diz que `PROJECT_GOVERNANCE.md` prevalece sobre qualquer Skill, mas quando o próprio texto do documento está desatualizado em relação à prática consolidada, a resolução correta não é "seguir o documento cegamente" nem "seguir o código cegamente" — é **sinalizar para decisão humana via FASE 6 (Evolução da Governança)**, nunca resolver automaticamente. Nenhuma Skill deve, por conta própria, decidir que o código está certo e o documento errado (ou vice-versa) — isso é uma alteração de `PROJECT_GOVERNANCE.md`, que exige aprovação explícita e ADR.

## 3. Conflitos entre regras

Quando duas regras específicas (não documentos inteiros) parecem se aplicar simultaneamente de forma incompatível — tipicamente uma regra nova proposta versus uma regra já em produção.

**Exemplo real desta própria sprint:** o prompt que originou a Sprint G.5.1 pediu uma máquina de estados com os nomes `Backlog → Planning → Ready → Executing → Review → Audit → Documentation → Approved → Closed`. A skill `sprint-governance` (já em produção, já usada em sprints reais deste projeto) define uma máquina de estados diferente: `PLANEJADA → ORQUESTRADA → VALIDADA → EM IMPLEMENTAÇÃO → IMPLEMENTADA → AUTOAUDITADA → AUDITADA → ENCERRADA`. Um fork irmão desta sprint está documentando essa divergência em detalhe em `STATE_MACHINE.md` — este documento não decide qual conjunto de nomes é o correto, apenas registra o **tipo** de conflito e o princípio de resolução.

**Princípio de resolução (regra geral, aplicável a qualquer caso futuro do mesmo tipo):** regra já em produção e validada em sprints reais prevalece sobre regra nova até reconciliação explícita via FASE 6 ou ADR. Uma regra proposta em uma única sprint documental nunca substitui automaticamente uma regra que já orientou trabalho real — mesmo que a regra nova pareça mais completa ou melhor desenhada.

## 4. Conflitos entre agentes

Quando dois agentes (ou dois papéis — Product Owner, Orchestrator, Executor, Auditor, conforme `AI_PROMPT_ORCHESTRATOR.md` Seção 2) chegam a conclusões diferentes sobre a mesma sprint.

**Hierarquia de autoridade de decisão** (derivada de quem aprova o quê em `AI_PROMPT_ORCHESTRATOR.md`): **Product Owner > Auditor > Orchestrator > Executor.** O papel mais próximo da aprovação final prevalece — mas **nunca sem registrar o desacordo.** Um agente nunca sobrescreve silenciosamente a conclusão de outro; se o Auditor discorda do Executor, o desacordo entra no relatório da auditoria como parte do veredito (NECESSITA CORREÇÃO ou BLOQUEADO — ver `sprint-audit` item 10), nunca é apagado ou substituído sem rastro.

---

## Checklist

- [ ] Hierarquia de 8 níveis declarada exatamente na ordem fornecida, sem reordenação.
- [ ] Distinção entre `CLAUDE.md` (raiz) e `.claude/CLAUDE.md` explícita.
- [ ] Regra central ("nenhuma Skill pode contrariar a hierarquia") declarada de forma inequívoca.
- [ ] 4 tipos de conflito cobertos, cada um com regra de resolução objetiva.
- [ ] Terceiro tipo de conflito (documento vs. prática real) isolado do conflito simples entre documentos — não usa a hierarquia simples, exige FASE 6.
- [ ] Nenhuma decisão de mérito tomada (ex.: não decidiu se os estados do STATE_MACHINE.md ou os de sprint-governance estão "certos").

## Problemas encontrados

Nenhum problema estrutural nos 5 documentos-fonte relidos. Um ponto de atenção, não um problema: a divergência de estados (Seção 3 acima) é real e ativa nesta própria sprint — este documento e `STATE_MACHINE.md` (fork irmão) tratam do mesmo fato por ângulos diferentes (princípio de resolução aqui; detalhamento da divergência lá). Risco de leve sobreposição textual entre os dois — resolvido mantendo aqui apenas o princípio geral e a citação breve do caso, sem repetir a tabela completa dos dois conjuntos de estados (isso é exclusivamente de `STATE_MACHINE.md`).

## Melhorias (não implementadas nesta sprint)

- A divergência do item 2 (Seção 8.2 de `PROJECT_GOVERNANCE.md` vs. prática real de auth) é uma Melhoria Futura já identificada anteriormente (skill `architecture`) — candidata real a uma FASE 6 de correção do próprio `PROJECT_GOVERNANCE.md`.
- A divergência de estados (Seção 3) é candidata a uma decisão formal via ADR: manter `sprint-governance` como única fonte de estados e descartar os nomes propostos nesta sprint, ou reconciliar os dois vocabulários. Não decidido aqui — fica para o Product Owner.

## Dependências

- **Hierarquia geral:** `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, `AI_PROMPT_ORCHESTRATOR.md`, `CLAUDE.md` (raiz) — todos lidos, nenhum alterado.
- **`STATE_MACHINE.md`** (fork irmão): trata da mesma divergência de estados citada na Seção 3 daqui, em profundidade — este documento não duplica aquele, apenas referencia o tipo de conflito.
- **`SKILL_DEPENDENCIES.md`** (fork irmão): mapeia quem depende de quem entre as Skills — relevante para a Seção 1 (conflitos entre Skills), mas não repetido aqui.
- **`SKILL.md`** da meta-skill: deve referenciar este arquivo na sua própria seção "Referências cruzadas", sem repetir o conteúdo.
- Nenhuma dependência de código, schema ou API.

---

Precedência: em caso de conflito entre este documento e `PROJECT_GOVERNANCE.md`, `PROJECT_GOVERNANCE.md` sempre prevalece — inclusive sobre esta própria declaração de hierarquia.
