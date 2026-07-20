# skill-format.md — Como escrever uma Skill neste projeto

Parte da meta-skill `project-skill-governance`. Este é o procedimento completo de formatação — migrado de `.claude/CLAUDE.md` na Sprint G.5.2, quando aquele arquivo foi enxugado para conter apenas princípios e referências, nunca procedimento. Leia este arquivo antes de escrever ou editar qualquer `SKILL.md`.

## 1. Caminho e nome do arquivo

Caminho obrigatório: `.claude/skills/{nome-kebab-case}/SKILL.md` — **maiúsculo, exatamente `SKILL.md`**, nunca `skill.md`. Isso não é estilo: é o nome de arquivo que o mecanismo de Skills do Claude Code procura para descobrir a skill (ver [documentação oficial](https://code.claude.com/docs/pt/skills)). Um único `SKILL.md` por Skill; arquivos auxiliares vivem em subpastas (`references/`, `examples/`, `scripts/`, `templates/`, `checklists/`, `assets/` — só as que fizerem sentido real, nunca pasta vazia). Exceção documentada: `project-skill-governance` (esta própria meta-skill), que mantém `README.md` na raiz da pasta além do `SKILL.md`, por ser a única com porta de entrada humana distinta do arquivo ativável.

O nome do diretório é sempre kebab-case. O campo `name` do frontmatter, se presente, deve ser idêntico a ele.

## 2. Frontmatter YAML oficial

Campos suportados pelo Claude Code (todos opcionais, mas `description` é o mais importante — é o que o mecanismo de ativação usa):

| Campo | Uso neste projeto |
|---|---|
| `name` | kebab-case, idêntico ao nome da pasta |
| `description` | **sempre em inglês**, mesmo com corpo em português — é o campo de descoberta/ativação, convenção do próprio Claude Code. Deixe claro **quando ativar**; se houver risco de confusão com outro nome (ex.: `architecture` vs. `ARCHITECTURE.md`), diga isso explicitamente. Combinado com `when_to_use`, é truncado em 1.536 caracteres na listagem — o caso de uso principal vai primeiro. |
| `when_to_use` | Opcional — frases-gatilho adicionais, quando a `description` sozinha não é suficiente. |
| `disable-model-invocation` | `true` só para skills de ação com efeito colateral que exigem disparo manual (nenhuma das Skills deste projeto usa hoje — são todas de conhecimento/processo, não de ação). |
| `user-invocable` | `false` só para conhecimento de fundo que não faz sentido como comando `/nome` direto. |
| `allowed-tools` / `disallowed-tools`, `model`, `effort`, `context`, `agent`, `hooks`, `paths`, `shell` | Usar apenas quando a Skill genuinamente precisar — não preencher por preencher. |

Campos não usados neste projeto até esta sprint (G.5.2): `argument-hint`, `arguments`, `paths`, `shell` — nenhuma Skill atual precisa de argumentos posicionais ou de ativação restrita a glob de arquivo.

## 3. Estrutura obrigatória do corpo do `SKILL.md`

Após o frontmatter, nesta ordem:

1. **Título H1** — `# {Título da Skill} — Doce Menina (confeitaria-app)`.
2. **Parágrafo de escopo** — o que a Skill cobre, o que ela **não repete** (nome exato das Skills irmãs relevantes), fonte de verdade (documento(s) original(is)).
3. **## 1. Objetivo**
4. **## 2. Quando utilizar**
5. **## 3. Quando NÃO utilizar**
6. **## 4. Responsabilidades**
7. **## 5. Fluxo resumido**
8. **## 6. Arquivos auxiliares disponíveis**
9. **## 7. Como carregar os arquivos auxiliares**
10. **## 8. Critérios de sucesso**
11. **## 9. Limitações**
12. **## 10. Anti-patterns**
13. **## 11. Referências cruzadas** (inclui, quando aplicável, uma subseção "Compatibilidade com Sub-agents" — ver item 6 abaixo)
14. **Rodapé de precedência**, precedido de `---`: `Precedência: em caso de conflito entre esta Skill e {documento}, o documento original sempre prevalece.`

Nem toda seção precisa de conteúdo extenso — uma Skill simples pode ter "Arquivos auxiliares disponíveis: nenhum" e isso é aceitável. Não invente conteúdo para preencher uma seção vazia.

## 4. Tamanho e progressive disclosure

Recomendação oficial: manter `SKILL.md` abaixo de 500 linhas. Neste projeto, nenhuma das 17 Skills chega perto disso (a maior tinha 167 linhas antes da Sprint G.5.2) — então a divisão em arquivos auxiliares não é uma exigência de tamanho aqui, é uma exigência de **função**: mover para `references/`, `examples/`, `checklists/`, `templates/` ou `scripts/` o material que é genuinamente consultado à parte (checklist longo, catálogo de anti-patterns, exemplo de código extenso), mantendo o `SKILL.md` como um hub de navegação enxuto. Julgue caso a caso — não fragmente um documento curto só para ter subpastas.

Todo arquivo auxiliar deve ser referenciado a partir do `SKILL.md` (link + explicação do que contém e quando carregar) — nunca deixar um arquivo órfão que ninguém sabe quando abrir.

## 5. Estilo

- **Corpo em português brasileiro** (única exceção: `description`/`when_to_use` do frontmatter).
- **Referenciar, nunca duplicar.** Se uma regra já está em `PROJECT_GOVERNANCE.md`, `REGRAS_NEGOCIO.md`, `AI_PROMPT_ORCHESTRATOR.md`, `CLAUDE.md` (raiz) ou outra Skill, apontar para lá em vez de copiar. Limite: se mais de 30% do conteúdo é repetição do que já existe em outra Skill, revisar e cortar (mesmo critério de `references/RESPONSIBILITIES.md`… — ver critério de aceite em [SKILL.md](../SKILL.md) item 8).
- **Exemplos reais, nunca genéricos** — código, CHANGELOG ou decisão já registrada neste projeto.
- **Sinalizar, não resolver.** Ambiguidade real entre documentos-fonte: registrar no relatório da sprint, nunca decidir sozinho dentro do `SKILL.md`.
- **Declarar o que fazer, não narrar como/por quê** — mesmo teste de concisão do CLAUDE.md raiz (recomendação oficial do Claude Code, já que o conteúdo de uma skill carregada permanece em contexto entre turnos e cada linha é custo de token recorrente).

## 6. Preparação para Sub-agents

Nenhum Sub-agent (`.claude/agents/*.md`) foi criado neste projeto ainda (previsto para a Sprint G.5.3). Toda Skill deve, ainda assim, documentar em "Referências cruzadas" uma subseção "Compatibilidade com Sub-agents" respondendo:

- Que tipo de subagent futuro faria sentido **pré-carregar** esta Skill via seu campo `skills:` de frontmatter (conteúdo integral injetado na inicialização do subagent)?
- Que tipo de subagent **não deveria** pré-carregá-la (ex.: agentes somente-leitura como `Explore`/`Plan`, que já pulam CLAUDE.md por design, não ganham nada de uma Skill de convenção de código)?
- Que conhecimento esta Skill fornece, que artefatos ela produz, que entradas espera, que saídas entrega — isto normalmente já está coberto pela seção "Responsabilidades" e por `references/RESPONSIBILITIES.md`; não duplicar, só referenciar.

## 7. Referências cruzadas

- Formato: `` `DOCUMENTO.md` Seção N `` para documentos oficiais; `skill {nome}` para Skills irmãs (sem mais "item N" solto — apontar para a seção numerada 1-11 quando possível, já que agora todas as Skills seguem a mesma numeração).
- Confirmar que um caminho de arquivo existe **no momento da escrita** — não assumir que uma citação antiga ainda está correta (lição real: skill `documentation`).
- Ler as Skills irmãs potencialmente sobrepostas **antes** de escrever uma nova.

## 8. Versionamento

Skill que sofrer alteração de conteúdo relevante (não só correção de digitação) ganha, antes do rodapé de precedência, um bloco:
```
<!-- Histórico: v1.0 criada em {data} — {sprint}. -->
```
Sem retrofit obrigatório das Skills anteriores à convenção.

---

Precedência: em caso de conflito entre este documento e `PROJECT_GOVERNANCE.md`, `PROJECT_GOVERNANCE.md` sempre prevalece.
