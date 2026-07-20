# Checklist — Funcional (o que classifica como categoria A, bloqueante)

Parte da Skill `product-review`. Único checklist cujos itens, se violados, geram achado de **categoria A (Problema Funcional)** — a única categoria que bloqueia a homologação técnica (`PROJECT_GOVERNANCE.md` Seção 16.5). Todos os demais checklists (UX/UI/Navegação) geram apenas B–F, nunca bloqueantes.

- [ ] Toda ação primária da tela (criar, salvar, ativar, desativar, adicionar item, remover item) produz o efeito esperado, sem exigir recarregar a página manualmente.
- [ ] Toda mutação que altera dados derivados (ex. custo de receita após alterar item) reflete o valor atualizado na mesma tela, sem exigir navegação extra.
- [ ] Nenhum botão de ação fica permanentemente desabilitado ou travado em estado "carregando" após uma resposta da API (sucesso ou erro).
- [ ] Toda mensagem de erro retornada pela API é exibida ao usuário — nenhum erro é silenciosamente engolido.
- [ ] Formulário não permite submissão dupla (botão desabilitado durante `submitting`).
- [ ] Navegação entre lista e detalhe (fluxo Mestre/Detalhe) não perde o estado esperado — voltar da tela de detalhe para a lista reflete a mutação feita.
- [ ] Nenhum campo obrigatório do backend fica ausente do formulário do frontend, tornando impossível criar um registro válido.
- [ ] Nenhuma tela trava em estado de loading infinito quando a API responde com erro.

## Fora de escopo desta checklist (não é categoria A)

- Cor errada, espaçamento inconsistente → categoria C (UI).
- Texto poco claro, falta de confirmação em ação reversível → categoria B (UX).
- Breadcrumb ausente, link que deveria ser `<Link>` e é `<a>` → categoria D (Navegação).
- Contraste insuficiente, `aria-label` ausente → categoria E (Acessibilidade).
- Componente que poderia ser compartilhado mas foi copiado → categoria F (Melhoria).

---

Precedência: em caso de conflito com `PROJECT_GOVERNANCE.md` Seção 16.5 (regra de bloqueio), o documento original sempre prevalece.
