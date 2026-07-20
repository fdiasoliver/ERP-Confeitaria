# Checklist — UX (Experiência do Usuário)

Parte da Skill `product-review`. Carregar sempre que revisar uma página/fluxo de Frontend. Baseado em `UX_GUIDELINES.md` Seções 1-8 (raiz do projeto) — não repete o conteúdo, aponta a seção de origem de cada item.

- [ ] A interface comunica claramente o estado atual e a próxima ação possível (P1 — Clareza acima de estética).
- [ ] O sistema faz o máximo possível pelo usuário: pré-preenchimento, cálculo automático, sugestão de valores (P2 — Economia de esforço).
- [ ] Ações destrutivas ou irreversíveis pedem confirmação explícita, com o botão de confirmação repetindo a ação (nunca "Sim"/"OK") (P3, Seção 6).
- [ ] Formulário segue a estrutura padrão: título → campos agrupados por contexto → opcionais marcados "(opcional)" → rodapé com ações (Seção 2).
- [ ] Campos obrigatórios com `*`; ordem dos campos segue importância → numéricos → opcionais (Seção 2).
- [ ] Botão de submit desabilitado imediatamente após clique, com label trocado ("Salvar" → "Salvando…") (Seção 2, "Submissão").
- [ ] Mensagens seguem os princípios de redação: pessoa direta, voz ativa, sem jargão técnico, tom acolhedor, breve (Seção 4).
- [ ] Mensagem de erro é acionável — diz o que corrigir, nunca só "erro" (P6, Seção 4).
- [ ] Feedback imediato (<100ms) em toda ação do usuário: clique, toque em chip, toggle (Seção 5).
- [ ] Feedback de processo (100ms–3s) presente em operações com latência: submit, busca, upload, carregamento de lista (Seção 5).
- [ ] Estado vazio comunica o que não existe, por que pode estar vazio, e o que fazer agora — nunca só "nenhum resultado" (Seção 5, "Feedback de estado vazio").
- [ ] Validação ocorre no momento certo: `onChange` só formatação simples, `onBlur` regra completa, `onSubmit` regras cruzadas (Seção 8).
- [ ] **(Sprint T.3 — escopo: páginas que compõem o fluxo do Demo Environment, ver `DEMO_GUIDE.md`)** O ambiente demonstra claramente o fluxo completo do negócio para um usuário que nunca viu o sistema — do primeiro ao último passo relevante, sem exigir conhecimento prévio não explicado na própria tela.

---

Precedência: em caso de conflito com `UX_GUIDELINES.md`, o documento original sempre prevalece — este checklist é apenas a versão em lista de verificação. O item de Demo Environment (Sprint T.3) tem `DEMO_GUIDE.md` como fonte, não `UX_GUIDELINES.md` — aplica-se apenas quando a revisão envolve uma página do fluxo de demonstração, nunca a toda revisão de Product Review.
