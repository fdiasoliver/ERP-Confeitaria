---
name: architecture
description: Use this skill when writing or reviewing a Route Handler, Service, Repository, or Validator in the Doce Menina confeitaria-app project — questions about layer responsibilities, allowed coupling between layers, DTO/mapper conventions, or whether a code pattern is prohibited. This is about code architecture itself, not sprint process (use sprint-governance) or documentation governance (use governance).
---

# Arquitetura de Código — Doce Menina (confeitaria-app)

Esta Skill documenta a arquitetura de camadas já em uso real no código deste projeto — não é processo de sprint (`sprint-governance`) nem governança documental (`governance`). Onde uma regra já está resumida em `governance` (ex.: tipos compartilhados) ou aprofundada em `schema-pattern` (ex.: schema Prisma), esta Skill referencia em vez de repetir. Fonte de verdade: `PROJECT_GOVERNANCE.md` Seção 8 (Padrões arquiteturais), Seção 10 (Convenções para Prisma) e Seção 7 (Checklist de qualidade).

## 1. Objetivo

Garantir que todo código novo (Route Handler, Service, Validator, Repository, Prisma) respeite o fluxo de camadas único do projeto — sem inversão, sem pular camada, sem duplicar lógica entre camadas.

## 2. Quando utilizar

- Escrevendo ou revisando um Route Handler, Service, Repository ou Validator.
- Dúvida sobre a responsabilidade de uma camada ou o acoplamento permitido entre duas camadas.
- Dúvida se um padrão de código é proibido (ver item 10, Anti-patterns).

## 3. Quando NÃO utilizar

- Processo e estados de uma sprint → `sprint-governance`/`orchestrator`.
- Governança documental (ADR, DoD, onde um tipo compartilhado deve residir) → `governance`.
- Modelagem de schema Prisma em profundidade (índices, migração, divergências aceitas) → `schema-pattern` — esta Skill só resume convenções de banco (ver `references/layers.md`, seção "Banco").
- Convenções de página/componente admin → `frontend-pattern`.

## 4. Responsabilidades

Fluxo de camadas obrigatório:

```
Route Handler  →  Service  →  Validator  →  Repository  →  Prisma
(src/app/api)     (src/lib)   (src/lib)     (src/lib)      (singleton)
```

Nunca inverter, nunca pular uma camada, nunca replicar lógica de uma camada em outra.

| Camada | Pode | Não pode |
|---|---|---|
| Route Handler | Parse de body, chamar `requireAdmin()`, chamar Service, mapear erro→HTTP via `responses.ts` | Lógica de negócio, acesso a Prisma, validação de domínio |
| Service | Chamar Validator, orquestrar Repository, mapear Prisma→TypeScript, declarar erros de domínio | Acessar Prisma diretamente, retornar `Response`/status HTTP |
| Validator | Validar campos, retornar `ValidationError[]` | Acessar Prisma/Repository/`fetch`, mutar ou normalizar o input |
| Repository | Queries Prisma puras | Lógica de negócio, autenticação, mapeamento de tipos de domínio |
| Prisma | Executar queries via singleton (`src/lib/prisma.ts`) | Ser instanciado (`new PrismaClient()`) fora do singleton |

Contrato completo de cada camada (responsabilidades detalhadas, proibições, padrões reais de resposta/erro/auth, DTO/tipos, mapper, acoplamento permitido com exceções documentadas, fluxo de chamadas ponta a ponta): `references/layers.md`.

## 5. Fluxo resumido

Ao escrever ou revisar código: (1) identificar a camada pelo caminho do arquivo; (2) checar a linha correspondente na tabela acima; (3) para o contrato completo dessa camada, carregar `references/layers.md`; (4) antes de considerar pronto, checar cada item de Anti-patterns (item 10).

## 6. Arquivos auxiliares disponíveis

| Arquivo | Conteúdo |
|---|---|
| `references/layers.md` | Contrato completo por camada, DTO/tipos, mapper, acoplamento permitido (com exceções documentadas), fluxo de chamadas ponta a ponta |

## 7. Como carregar os arquivos auxiliares

- **Escrevendo/revisando uma camada específica:** carregar `references/layers.md`.
- **Dúvida rápida de responsabilidade geral ou acoplamento:** a tabela e o diagrama já em `SKILL.md` costumam bastar, sem precisar carregar o auxiliar.

## 8. Critérios de sucesso

Código novo não viola nenhum item de Anti-patterns (item 10); nenhuma camada pula ou inverte o fluxo do item 4; cada Service tem exatamente um mapper; nenhum acoplamento fora dos permitidos em `references/layers.md`.

## 9. Limitações

- Não cobre modelagem de schema Prisma em profundidade — usar `schema-pattern`.
- Não decide se uma sprint pode tocar múltiplas camadas — usar `sprint-planning`.
- Não é o DoD completo de uma sprint — usar `governance`.

## 10. Anti-patterns

- `any` explícito.
- Função duplicada (lógica idêntica em dois arquivos).
- Lógica de negócio em Route Handler.
- Acesso direto ao Prisma fora de Repository.
- `new PrismaClient()` fora de `src/lib/prisma.ts`.
- `NextResponse.json()` direto (usar sempre `responses.ts`).
- `$queryRaw`/`$executeRaw` com input do usuário sem parametrização.
- Retornar `passwordHash` (ou qualquer dado sensível) em resposta de API.

Fonte: `PROJECT_GOVERNANCE.md` Seção 7.

## 11. Referências cruzadas

`PROJECT_GOVERNANCE.md` Seções 7, 8 e 10; [ADR-005](../../../ADR-005.md) (padrão de IDs); skill `governance` (tipos compartilhados/DTO); skill `schema-pattern` (schema Prisma em profundidade); skills `repository-pattern`, `api-pattern`, `frontend-pattern` (aprofundamento por camada específica).

### Compatibilidade com Sub-agents

Nenhum Sub-agent foi criado neste projeto ainda (previsto para a Sprint G.5.3). Quando existirem:

- **Deveriam pré-carregar esta Skill** (via `skills:` no frontmatter do subagent): qualquer subagent de implementação de código do ERP (ex.: um futuro `code-implementer` ou `api-developer`) — é a Skill mais fundamental para escrever Route/Service/Validator/Repository corretamente. Também um futuro subagent de revisão de código.
- **Não deveriam pré-carregá-la**: `Explore`/`Plan` (agentes somente-leitura embutidos, já pulam CLAUDE.md por design e não escrevem código); subagents de processo de sprint sem tarefa de código (ex.: um futuro `sprint-auditor` focado só em documentação).
- **Conhecimento fornecido:** fluxo de camadas, responsabilidades e proibições por camada, acoplamento permitido, anti-patterns proibidos.
- **Artefatos produzidos:** nenhum arquivo — conhecimento aplicado ao código que o agente escreve/revisa.
- **Entradas esperadas:** um Route Handler, Service, Repository ou Validator sendo escrito ou revisado.
- **Saídas entregues:** confirmação de conformidade com o fluxo de camadas, ou lista de violações encontradas.

---

Precedência: em caso de conflito entre esta Skill e `PROJECT_GOVERNANCE.md`, o documento original sempre prevalece.

<!-- Histórico: v1.0 criada nesta sessão (Sprint G.5.1). v2.0 em 13/07/2026 — Sprint G.5.2: renomeada skill.md→SKILL.md, corpo reestruturado nas 11 seções oficiais, contrato detalhado por camada movido para references/layers.md, adicionada seção "Compatibilidade com Sub-agents". -->
