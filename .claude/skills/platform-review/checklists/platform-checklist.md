# Checklist — Conformidade de Plataforma

Parte da Skill `platform-review`. Carregar sempre que revisar Backend e/ou Frontend de um módulo já implementado. Baseado em `PLATFORM_OVERVIEW.md`/`ERP_PRODUCT_VISION.md` (raiz do projeto, Sprint G.6.1).

## Multi-tenant / Isolamento de dados

- [ ] Nenhuma query nova assume implicitamente um único tenant sem passar pelo mecanismo de escopo já existente (`StoreConfig`, quando aplicável).
- [ ] Nenhum ID ou nome de negócio (ex. "Doce Atelier") está hardcoded em lógica de Service/Repository — dados de negócio vêm de `StoreConfig`/parametrização existente.

## Branding / White Label

- [ ] Nenhuma string de UI usa o nome da empresa fora de uma leitura de `StoreConfig` (ou equivalente já parametrizado).
- [ ] Nenhuma nova cor introduzida fora da paleta do design system (`cream`/`chocolate`/`rose`/`sage`/`sand`/`muted`) sem decisão explícita — mesma regra já vigente em `CLAUDE.md` raiz, "Estilo e design".
- [ ] Nenhum logo, favicon ou domínio fixo introduzido em código novo fora do que já é parametrizável.

## Theme Engine

- [ ] Se o módulo toca PDF, e-mail, relatório, impressão, WhatsApp ou QR Code PIX: usa os dados de identidade já parametrizados (`StoreConfig`), não valores fixos.

## Parametrização de negócio

- [ ] Nenhum campo de regra de negócio (ex. taxa, prazo, política) que a visão de plataforma já documenta como parametrizável foi implementado como constante fixa no código.

## Classificação do achado

- **Bloqueante:** algo que já deveria estar parametrizado (`StoreConfig` ou equivalente já existente) e foi implementado como fixo — regressão real.
- **Não-bloqueante (lacuna de escopo futuro):** multi-tenência estrutural (schema com `tenantId`, isolamento por linha) ainda não existe neste projeto — isso é a lacuna já conhecida e documentada em `ERP_PRODUCT_VISION.md`, não uma regressão desta sprint, a menos que a Ordem de Missão da sprint fosse especificamente sobre isso.

---

Precedência: em caso de conflito com `PLATFORM_OVERVIEW.md`/`ERP_PRODUCT_VISION.md`, os documentos originais sempre prevalecem — este checklist é apenas a versão em lista de verificação.
