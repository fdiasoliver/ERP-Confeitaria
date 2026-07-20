# Checklist — Navegação

Parte da Skill `product-review`. Carregar sempre que revisar uma página/fluxo de Frontend. Baseado em `UX_GUIDELINES.md` Seção 9 (Navegação) e `DESIGN_SYSTEM.md` (raiz do projeto).

- [ ] `<Link>` do Next.js usado para navegação interna — nunca `<a href>` (`UX_GUIDELINES.md` Seção 9).
- [ ] `<button>` usado para ações que não navegam (submit, toggle, abrir modal) — nunca `<Link>` para isso.
- [ ] Contexto de volta sempre presente em telas de detalhe/formulário: botão "Voltar" ou link equivalente (Seção 9).
- [ ] Após criar item: comportamento de redirecionamento é intencional e consistente com o padrão do módulo (lista vs. tela de detalhe do item criado).
- [ ] Após editar item: usuário retorna a um estado onde vê a mudança refletida.
- [ ] Fluxo Mestre/Detalhe (quando aplicável): navegação lista → detalhe → volta para lista é consistente e não perde o item de contexto.
- [ ] Quantidade de cliques para completar a ação principal da tela é razoável — nenhum passo redundante ou tela intermediária sem propósito.
- [ ] Filtros/busca aplicados não exigem recarregar a página ou perder a posição de scroll desnecessariamente.
- [ ] Estado ativo de filtro/chip/aba é visualmente óbvio (Componente 9/17 de `DESIGN_SYSTEM.md`).

---

Precedência: em caso de conflito com `UX_GUIDELINES.md`, o documento original sempre prevalece — este checklist é apenas a versão em lista de verificação.
