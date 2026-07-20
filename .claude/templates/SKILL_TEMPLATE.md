<!--
SKILL_TEMPLATE.md — modelo oficial para criar qualquer nova Skill em .claude/skills/{nome}/SKILL.md
(arquivo de entrada obrigatoriamente maiúsculo — exigência do mecanismo de descoberta de Skills do
Claude Code, não estilo: https://code.claude.com/docs/pt/skills)

Antes de preencher este template:
1. Leia .claude/CLAUDE.md (visão, ordem de leitura, princípios).
2. Leia .claude/skills/project-skill-governance/SKILL.md e references/skill-format.md — o procedimento
   completo de formatação e o fluxo de validação obrigatório antes de incorporar a Skill ao projeto.
3. Leia .claude/skills/project-skill-governance/references/SKILL_DEPENDENCIES.md e RESPONSIBILITIES.md
   para confirmar que o assunto desta Skill nova não está coberto por nenhuma existente.

Regras ao preencher (não remover este bloco de comentário do rascunho de trabalho — pode remover
apenas na versão final publicada em SKILL.md):
- Corpo em português brasileiro; description (e when_to_use, se usado) sempre em inglês.
- Referenciar Skills/documentos existentes em vez de duplicar (limite: se mais de 30% do conteúdo é
  repetição do que já existe em outra Skill, revise e corte).
- Todo exemplo deve ser real (código, CHANGELOG, decisão já registrada neste projeto) — nunca genérico.
- Ambiguidade real entre documentos-fonte: sinalizar, nunca resolver sozinho dentro da Skill.
- Nem toda seção precisa de conteúdo extenso — "nenhum" é uma resposta válida quando genuína.
-->

---
name: {nome-kebab-case}
description: Use this skill when {situação exata de ativação, em inglês — caso de uso principal primeiro; deixe claro se há risco de confusão de nome com outra Skill ou documento}
---

# {Título da Skill} — Doce Menina (confeitaria-app)

{Parágrafo de escopo obrigatório — três coisas nesta ordem:
1. O que esta Skill cobre.
2. O que ela NÃO repete, citando pelo nome exato as Skills irmãs relevantes (ex.: "não repete o resumo geral já em `architecture`...").
3. Fonte de verdade — documento(s) original(is) de onde o conteúdo vem.}

## 1. Objetivo

{Uma ou duas frases — o que esta Skill existe para garantir.}

## 2. Quando utilizar

{Lista objetiva de gatilhos reais.}

## 3. Quando NÃO utilizar

{Lista do que esta Skill não cobre, apontando para a Skill certa em cada caso.}

## 4. Responsabilidades

{O que esta Skill orienta fazer — conteúdo próprio, não referência a outra Skill.}

## 5. Fluxo resumido

{Se aplicável — sequência curta de passos. Referenciar `project-skill-governance/references/WORKFLOW.md` para o fluxo ponta a ponta, não repeti-lo.}

## 6. Arquivos auxiliares disponíveis

{Tabela `references/`, `examples/`, `scripts/`, `checklists/`, `templates/`, `assets/` — só as pastas que esta Skill realmente usa. "Nenhum" é válido.}

## 7. Como carregar os arquivos auxiliares

{Para cada arquivo auxiliar listado acima: em qual situação carregá-lo.}

## 8. Critérios de sucesso

{Como saber que esta Skill foi seguida corretamente.}

## 9. Limitações

{O que esta Skill deliberadamente não resolve/decide.}

## 10. Anti-patterns

{Lista do que nunca fazer ao seguir esta Skill — exemplos reais do projeto quando existirem.}

## 11. Referências cruzadas

{Skills irmãs e documentos-fonte, sem repetir conteúdo. Incluir subseção "Compatibilidade com Sub-agents"
(ver `project-skill-governance/references/skill-format.md` item 6): que subagent futuro pré-carregaria
esta Skill via `skills:`, qual não deveria, que conhecimento/artefatos/entradas/saídas ela expõe.}

<!-- Adicionar seções extras numeradas apenas se genuinamente necessário — as 11 acima já são o padrão oficial deste projeto. -->

---

Precedência: em caso de conflito entre esta Skill e `{documento(s) de maior hierarquia aplicável}`, o documento original sempre prevalece.

<!-- Histórico: v1.0 criada em {data} — {sprint}. -->
