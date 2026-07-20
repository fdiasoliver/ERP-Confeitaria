# Checklist — UI (Interface Visual)

Parte da Skill `product-review`. Carregar sempre que revisar uma página/fluxo de Frontend. Baseado em `DESIGN_SYSTEM.md` (raiz do projeto) — não repete o conteúdo dos 20 componentes documentados, aponta a seção de origem de cada item.

- [ ] Usa apenas as cores do design system: `cream`, `chocolate`, `rose`, `sage`, `sand`, `muted` — nenhuma cor nova introduzida (Fundação visual, "Paleta de cores").
- [ ] `font-display` (Fraunces) usado em títulos; corpo em DM Sans padrão (Fundação visual, "Tipografia").
- [ ] Botões seguem as variações documentadas (Primário/Secundário/Ghost/Destrutivo) com `type="button"` explícito, exceto submit (Componente 1).
- [ ] Máximo 1 botão primário por tela (Componente 1, "Boas práticas").
- [ ] Inputs usam `.input-field`; label sempre associado via `htmlFor`+`id`; erro com borda vermelha + mensagem abaixo (Componente 2).
- [ ] Cards usam `.shadow-card`; não sobrecarregados com mais de 4-5 informações visíveis (Componente 6).
- [ ] Modais seguem a estrutura padrão (overlay + container + título + conteúdo + rodapé com ações) e fecham com `Escape`/clique fora, exceto confirmação crítica (Componente 7).
- [ ] Badges de status usam o mapa de cores oficial e sempre têm texto visível, nunca só cor (Componente 11).
- [ ] Loading usa skeleton (não spinner de página) quando o layout final é conhecido; spinner reservado para inicialização (Componentes 14-15).
- [ ] Filtros em chips horizontais para até 8 opções, com "Todos"/estado ativo visível e scroll horizontal sem quebra de linha (Componente 17).
- [ ] Hierarquia visual clara: título > subtítulo > corpo > metadados — nenhum elemento decorativo compete com informação funcional.
- [ ] Consistência: o mesmo componente para a mesma função em todas as telas da mesma sprint e de sprints anteriores do mesmo módulo (`UX_GUIDELINES.md` P5).
- [ ] Legibilidade: contraste mínimo AA confirmado para textos pequenos (`UX_GUIDELINES.md` Seção 18 — atenção especial a `muted` sobre `cream`, contraste ~3.2:1, abaixo do ideal para texto pequeno).

---

Precedência: em caso de conflito com `DESIGN_SYSTEM.md`, o documento original sempre prevalece — este checklist é apenas a versão em lista de verificação.
