# prisma/demo-seeds/ — Arquitetura da Pasta de Seed de Demonstração

Documento de arquitetura, criado na Sprint T.3 (Demo Environment & Product Validation Platform). **Esta sprint prepara apenas a arquitetura desta pasta — nenhum dado real, nenhum script executável foi implementado aqui.** Conteúdo pretendido em `DEMO_DATASET.md` (raiz do projeto); uso pretendido em `DEMO_GUIDE.md` (raiz do projeto).

---

## Por que esta pasta existe separada de `prisma/seed.ts`

`prisma/seed.ts` (existente desde a Sprint 0.5) popula o banco de **desenvolvimento** — dados mínimos para a equipe implementar e testar localmente. `prisma/demo-seeds/` populará o banco de **demonstração** — dataset completo e realista (`DEMO_DATASET.md`), pensado para ser mostrado a terceiros, usado em Product Review/Platform Review e treinamento. Misturar os dois teria dois efeitos indesejados: (1) o seed de desenvolvimento ficaria pesado e lento para o uso diário; (2) o dataset de demonstração ficaria acoplado ao ritmo de mudança do seed de dev, em vez de evoluir junto com `DEMO_DATASET.md` de forma deliberada (`DEMO_DATASET.md`, Seção 9 — Demo Dataset Version).

## Organização pretendida

```
prisma/demo-seeds/
├── README.md              # este documento (único arquivo real desta sprint)
├── index.ts                # pendente — ponto de entrada, executado por `npm run db:seed:demo`
└── fixtures/                # pendente — um arquivo por domínio, espelhando DEMO_DATASET.md
    ├── store-config.ts       # Seção 1 de DEMO_DATASET.md
    ├── categories.ts          # Seção 2
    ├── units.ts                # Seção 3
    ├── ingredients.ts           # Seção 4
    ├── recipes.ts                 # Seção 5
    └── demo-users.ts                # Seção 6
```

Cada arquivo de `fixtures/` corresponderá 1:1 a uma seção de `DEMO_DATASET.md` — nunca um arquivo genérico "dados.ts" com tudo misturado, mesmo princípio de separação por domínio já usado em `prisma/schema.prisma` (comentários de seção `// ─── Insumos`, `// ─── Receitas`, etc.).

## Responsabilidades (quando implementado)

- `index.ts` orquestra a ordem de criação respeitando dependências reais do schema (`StoreConfig` e `UnitOfMeasure` antes de `Ingredient`; `Ingredient` antes de `RecipeIngredient`; `Recipe` antes de `ProductRecipe`) — mesma disciplina de ordem já usada em `prisma/seed.ts`.
- Cada arquivo de `fixtures/` exporta apenas dado estruturado (arrays/objetos tipados) — nunca lógica de conexão com banco; `index.ts` é o único arquivo que importa o Prisma Client, mesmo padrão de responsabilidade única já exigido de Repository (`PROJECT_GOVERNANCE.md` Seção 8.4).
- `index.ts` usa `upsert` (nunca `create` puro) para todo registro com chave natural conhecida (slug, e-mail, nome único) — mesmo padrão já usado em `prisma/seed.ts`, para que rodar o seed de demonstração duas vezes seguidas não gere duplicidade.

## Forma de utilização (quando implementado)

Dois scripts novos em `package.json` (pendentes, nomes já reservados em `DEMO_GUIDE.md`):

| Script | Efeito |
|---|---|
| `db:seed:demo` | Executa `index.ts` contra o `DATABASE_URL` atual — populariza sem apagar dado existente (via `upsert`) |
| `db:reset:demo` | `prisma migrate reset` seguido de `db:seed:demo` — apaga e repopula do zero |

Ambos pressupõem um `DATABASE_URL` **dedicado ao ambiente de demonstração**, nunca o mesmo banco usado por `npm run dev` no dia a dia (`DEMO_GUIDE.md`, Seção 3) — evita que rodar `db:reset:demo` por engano apague trabalho de desenvolvimento em andamento.

## Estratégia de manutenção

- Toda mudança em `DEMO_DATASET.md` que afete dado estruturado deve refletir no arquivo de `fixtures/` correspondente na mesma sprint que implementar essa mudança — nunca deixar os dois divergirem silenciosamente (mesma regra de "documento como fonte de verdade" já usada em `types.ts` vs. schema, `PROJECT_GOVERNANCE.md` Seção 8.7).
- Toda sprint de Schema (`{M}.1`, `PROJECT_GOVERNANCE.md` Seção 17) que adiciona um model coberto pelo Demo Dataset deve avaliar se `fixtures/` precisa de arquivo novo — registrado em `KNOWN_ISSUES.md` quando não resolvido na própria sprint (`DEMO_DATASET.md`, Seção 9).
- Nenhum dado de pessoa real, credencial real ou segredo de produção deve, em nenhuma hipótese, ser commitado nesta pasta — mesmo cuidado já aplicado a `.env`/`.env.example` no projeto.

---

Precedência: em caso de conflito entre este documento e `DEMO_DATASET.md`, `DEMO_GUIDE.md` ou `prisma/schema.prisma`, os documentos originais sempre prevalecem — este documento é arquitetura de implementação, não fonte de conteúdo nem de uso.

<!-- Histórico: v1.0 criada em 16/07/2026 — Sprint T.3 (Demo Environment & Product Validation Platform). Apenas arquitetura — nenhum script ou fixture implementado nesta sprint. -->
