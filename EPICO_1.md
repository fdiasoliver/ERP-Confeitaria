# ÉPICO 1 — Relatório Executivo de Encerramento

**Doce Menina — Sistema de Gestão de Confeitaria Artesanal**
**Encerrado em:** 30/06/2026
**Duração:** 2 dias (28–30/06/2026)
**Sprints concluídas:** 11

---

## 1. Sprints concluídas

| Sprint | Tipo | Objetivo | Entrega | Data |
|--------|------|---------|---------|------|
| Sprint 0 | Implementação | Front-end completo com dados mockados | 10 páginas, design system, CartContext, 6 bugs corrigidos | 28/06/2026 |
| Sprint 0.5 | Infraestrutura | Banco real, auth, proxy, API routes, seed | PostgreSQL conectado, 4 APIs, NextAuth admin, proxy.ts | 29/06/2026 |
| Sprint 0.6 | Correção crítica | Persistência real de pedidos e /pedidos com dados reais | POST /api/orders com Address real, /pedidos sem mocks | 29/06/2026 |
| Sprint A1 | Arquitetura | Revisão arquitetural e documentação da fundação | 5 documentos: ARCHITECTURE, DOMAIN_MODEL, MODULES, KNOWN_ISSUES, CHANGELOG | 29/06/2026 |
| Sprint A2 | Consolidação | Resolver 11 dos 16 problemas conhecidos (KI-01 a KI-14) | Auth cliente, proxy por role, validação checkout, 3 novas APIs | 29/06/2026 |
| Sprint P1 | Planejamento | Documentação funcional completa | 4 documentos: MENU_STRUCTURE, SCREENS, USER_FLOW, USER_JOURNEY | 29/06/2026 |
| Sprint P2 | Design | Design System documentado | DESIGN_SYSTEM.md — 20 componentes documentados | 29/06/2026 |
| Sprint P3 | UX | Diretrizes de interface documentadas | UX_GUIDELINES.md — 18 seções | 29/06/2026 |
| Sprint C1 | Revisão | Consistência entre todos os 16 documentos | KI-17 identificado, PLAN.md e MODULES.md atualizados | 30/06/2026 |
| Sprint 1.1 + 1.2 | Implementação | Módulo Configuração da Empresa completo | 6 seções, 7 APIs, upload, ViaCEP, PIX preview, validação inline | 30/06/2026 |
| Sprint 1.3 | Refatoração | Redução de page.tsx 774→171 linhas | 11 componentes, 6 formatters, 2 serviços extraídos | 30/06/2026 |

---

## 2. Funcionalidades entregues

### Área do Cliente

| Funcionalidade | Status | Observação |
|---------------|--------|-----------|
| Vitrine de produtos com filtro por ocasião | ✅ | Ocasiões da API real |
| Seção de destaques (`featured: true`) | ✅ | |
| Agrupamento dinâmico por categoria | ✅ | Derivado da API, sem hardcode |
| Carrinho (adicionar, remover, quantidade, observação por item) | ✅ | CartContext com useMemo/useCallback |
| CartFab flutuante e CartDrawer (bottom sheet) | ✅ | |
| Checkout: seleção de data, entrega, pagamento | ✅ | |
| Checkout: endereço real com validação de campos | ✅ | |
| Checkout: criação real de pedido no banco | ✅ | Address + Order + OrderItems em $transaction |
| Histórico de pedidos com dados reais | ✅ | |
| "Pedir novamente" e "Pedir e personalizar" | ✅ | Snapshot preservado |
| Login cliente (telefone + nome) | ⚠️ | Sem OTP WhatsApp — Fase 8 |

### Área Administrativa

| Funcionalidade | Status | Observação |
|---------------|--------|-----------|
| Login admin (e-mail + senha + bcrypt) | ✅ | NextAuth credentials provider |
| Hub administrativo com 8 módulos | ✅ | 1 implementado, 7 com placeholder |
| Dashboard de produção (Kanban, urgentes, batch) | ⚠️ | UI completa, dados hardcoded |
| Módulo Configuração da Empresa — 6 seções completas | ✅ | |
| — Seção Identificação (nome, razão social, CNPJ, Instagram) | ✅ | Máscara CNPJ |
| — Seção Contato (telefone, e-mail) | ✅ | Máscara telefone |
| — Seção Endereço com autopreenchimento via ViaCEP | ✅ | |
| — Seção Entrega (raio de entrega gratuita) | ✅ | |
| — Seção PIX (tipo + chave + preview antes de salvar) | ✅ | 5 tipos de chave |
| — Seção Precificação (custo MO, fixos, produção, margem) | ✅ | |
| Upload de logomarca (≤2 MB) e favicon (≤512 KB) | ✅ | Supabase Storage REST |
| Toast de loading/success/error por operação | ✅ | |
| Skeleton de carregamento por seção | ✅ | |
| Validação inline por campo (onBlur + submit) | ✅ | |

---

## 3. Arquitetura construída

### Camadas de responsabilidade

```
Route (src/app/api/)
  └── Service (src/lib/*Service.ts)
        └── Validator (src/lib/validators/)
              └── Repository (src/lib/repositories/)
                    └── Prisma singleton (src/lib/prisma.ts)
```

Cada camada tem responsabilidade única:

| Camada | Responsabilidade | Arquivos |
|--------|-----------------|---------|
| **Route** | Parse HTTP, mapear erros para status codes, sem lógica de negócio | `src/app/api/**/route.ts` |
| **Service** | Autenticação, orquestração, mapeamento de tipos | `src/lib/storeConfigService.ts` |
| **Validator** | Regras de negócio puras, sem dependências externas, reutilizável no cliente | `src/lib/validators/storeConfig.ts` |
| **Repository** | Queries Prisma isoladas, único ponto de acesso ao banco | `src/lib/repositories/*.ts` |
| **Prisma** | Singleton global, nunca instanciado fora de `src/lib/prisma.ts` | `src/lib/prisma.ts` |

### Decisões arquiteturais registradas

| Decisão | Motivo |
|---------|--------|
| `src/proxy.ts` (não `middleware.ts`) | Convenção do Next.js 16 — hot reload não recompila; reiniciar server após editar |
| `export function proxy()` (não `middleware`) | Mesma convenção |
| `getToken` com `secret` explícito | Edge runtime exige `secret: process.env.NEXTAUTH_SECRET` mesmo com env configurado |
| `findFirst()` → `update/create` (não `upsert`) | StoreConfig singleton sem chave natural; `upsert` exige `@unique` como chave de busca |
| `$executeRaw`/`$queryRaw` no themeConfigRepository | `faviconUrl` adicionado ao schema mas `db:generate` bloqueado por DLL lock no Windows |
| `CartContext` com `useMemo`/`useCallback` | Previne re-renders desnecessários em todos os filhos do Provider |
| Snapshot em `OrderItem` | `productName`, `unitPrice`, `totalPrice` preservam estado no momento do pedido |
| `Address` criado em `$transaction` | Garante consistência — Address e Order nunca são criados separadamente |

### Autenticação

| Provider | Fluxo | Sessão |
|----------|-------|--------|
| `credentials` (admin) | e-mail + senha, bcrypt hash no banco | `userType: "admin"`, `role: UserRole` |
| `customer` (cliente) | phone + name, upsert de Customer no banco | `userType: "customer"`, `phone` |

O `proxy.ts` bloqueia clientes de acessar `/admin/*` verificando `token.userType === "admin"`.

---

## 4. APIs disponíveis

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/products` | Pública | Lista produtos ativos com categorias e ocasiões |
| `GET` | `/api/occasions` | Pública | Lista OccasionTags do banco |
| `GET` | `/api/config` | Pública | Lê StoreConfig + ThemeConfig branding |
| `PATCH` | `/api/config` | Admin | Atualiza StoreConfig + ThemeConfig branding |
| `GET` | `/api/orders?phone=` | Pública | Lista pedidos por telefone do cliente |
| `POST` | `/api/orders` | Pública | Cria pedido real (Address + Order + OrderItems + OrderStatusHistory em `$transaction`) |
| `PATCH` | `/api/orders/[id]/status` | Pública | Atualiza status com VALID_TRANSITIONS + grava OrderStatusHistory |
| `POST` | `/api/admin/upload` | Admin | Upload de logo/favicon para Supabase Storage; valida MIME e tamanho |
| `GET/POST` | `/api/auth/[...nextauth]` | — | Handlers NextAuth: admin credentials + customer provider |

**Total: 9 rotas** (7 arquivos `route.ts`)

---

## 5. Componentes reutilizáveis criados

### Componentes de layout e vitrine

| Componente | Arquivo | Exportações | Linhas |
|-----------|---------|-------------|--------|
| Header | `src/components/layout/Header.tsx` | `Header`, `HeaderMinimal` | — |
| CartDrawer | `src/components/layout/CartDrawer.tsx` | `CartDrawer`, `CartFab`, `Toast` | — |
| ProductCard | `src/components/vitrine/ProductCard.tsx` | `ProductCard`, `CategoryChips` | — |
| Providers | `src/components/Providers.tsx` | `Providers` (SessionProvider + CartProvider) | — |

### Componentes do módulo Configuração (`src/components/admin/config/`)

| Componente | Responsabilidade | Linhas |
|-----------|-----------------|--------|
| `FormPrimitives.tsx` | `Field`, `Section`, `inputClass`, tipos `FormSetter`, `FieldErrorSetter` | 52 |
| `LoadingSkeleton.tsx` | Skeleton de carregamento com 6 seções pulsantes | 32 |
| `ValidationSummary.tsx` | Toast (success/error/warning/loading) + tipos `ToastType`, `ToastState` | 44 |
| `ActionBar.tsx` | Barra fixa de rodapé: Voltar + Salvar | 26 |
| `UploadImage.tsx` | Upload com preview, botões Trocar/Remover, error inline | 81 |
| `BrandSection.tsx` | Seção Identidade visual (logo + favicon via UploadImage) | 46 |
| `CompanySection.tsx` | Seções Identificação + Contato com máscaras | 113 |
| `AddressSection.tsx` | Seção Endereço com busca ViaCEP e grid responsivo | 136 |
| `DeliverySection.tsx` | Seção Entrega (raio km) | 26 |
| `PixSection.tsx` | Seção PIX com select tipo, campo chave e preview | 79 |
| `PricingSection.tsx` | Seção Precificação com 4 campos numéricos | 88 |

**Total: 15 componentes** (4 gerais + 11 do módulo Config)

---

## 6. Serviços criados

| Serviço | Arquivo | Escopo | Responsabilidade |
|---------|---------|--------|-----------------|
| `storeConfigService` | `src/lib/storeConfigService.ts` | Servidor | Auth, validação, upsert singleton StoreConfig + ThemeConfig; mapeia Decimal→number |
| `StorageService` | `src/lib/storage/StorageService.ts` | Cliente | Upload de assets via `/api/admin/upload`; abstrai tipo, erro e retorno |
| `ViaCepService` | `src/lib/address/ViaCepService.ts` | Cliente | Consulta CEP na API pública ViaCEP; lança `CepNotFoundError` tipado |
| `orderService` | `src/services/orderService.ts` | Cliente | `createOrder`, `getOrdersByPhone`, `updateOrderStatus` via fetch |
| `productService` | `src/services/productService.ts` | Cliente | `getProducts` via fetch com interfaces `RawProduct`, `RawProductOccasion` |

**Total: 5 serviços** (1 servidor + 4 cliente)

---

## 7. Validators criados

| Validator | Arquivo | Contrato | Regras |
|-----------|---------|---------|--------|
| `validateStoreConfig` | `src/lib/validators/storeConfig.ts` | `(input: StoreConfigInput): ValidationError[]` | nome obrigatório (máx 100), e-mail regex, CNPJ 14 dígitos, telefone 10–11 dígitos, raioKm 0–50, custo MO ≥ 0, fixos ≥ 0, produção ≥ 1, margem 0–100, CEP 8 dígitos, pixKey+pixKeyType consistência, pixKeyType enum |

- Sem dependências externas — pode ser importado em componente React sem erro de bundle
- Reutilizado: Service (servidor, antes de persistir) e `page.tsx` (cliente, antes de `fetch PATCH`)
- Retorna `[]` se válido; `ValidationError[]` se inválido
- `ValidationError = { field: string; code: string; message: string }`

**Total: 1 validator** (cobre 12+ regras de negócio)

---

## 8. Repositories criados

| Repository | Arquivo | Funções | Notas |
|-----------|---------|---------|-------|
| `storeConfigRepository` | `src/lib/repositories/storeConfigRepository.ts` | `findStoreConfig`, `updateStoreConfig`, `createStoreConfig` | Queries Prisma tipadas; singleton via findFirst+update/create |
| `themeConfigRepository` | `src/lib/repositories/themeConfigRepository.ts` | `findActiveThemeConfig`, `getThemeBranding`, `updateThemeConfigBranding`, `createDefaultThemeConfig` | Usa `$executeRaw`/`$queryRaw` para `faviconUrl` (ver dívida técnica DT-01) |

**Total: 2 repositories**

---

## 9. Cobertura funcional atual do ERP

### Área do cliente

| Módulo | Status | Dados |
|--------|--------|-------|
| Vitrine | ✅ Funcional | Banco real |
| Carrinho | ✅ Funcional | Estado local |
| Checkout | ✅ Funcional (sem PIX/distância) | Banco real |
| Histórico de Pedidos | ✅ Funcional | Banco real |
| Login | ⚠️ Parcial (sem OTP WhatsApp) | Banco real |
| Detalhes do Pedido | ❌ Não implementado | — |

### Área administrativa

| Módulo | Status | Dados |
|--------|--------|-------|
| Login Admin | ✅ Funcional | Banco real |
| Hub Admin | ✅ Funcional | — |
| Configuração da Empresa | ✅ Funcional (6 seções + upload) | Banco real |
| Dashboard de Produção | ⚠️ UI pronta, sem dados reais | Hardcoded |
| Produtos (admin) | ❌ Não implementado | — |
| Clientes (admin) | ❌ Não implementado | — |
| Insumos (admin) | ❌ Não implementado | — |
| Receitas (admin) | ❌ Não implementado | — |
| Unidades (admin) | ❌ Não implementado | — |
| Usuários (admin) | ❌ Não implementado | — |
| Tema Visual (admin) | ❌ Não implementado | — |

### Infraestrutura

| Componente | Status |
|-----------|--------|
| PostgreSQL (Supabase) | ✅ Conectado e seedado |
| NextAuth (admin + customer) | ✅ Funcional |
| Proxy de rotas (proxy.ts) | ✅ Funcional |
| Supabase Storage (upload) | ✅ Funcional |
| ViaCEP | ✅ Funcional |
| WhatsApp API | ❌ Não integrado |
| PIX gateway | ❌ Não integrado |
| Google Maps API | ❌ Não integrado |

---

## 10. Pendências conhecidas

| ID | Descrição | Prioridade | Bloqueia |
|----|-----------|-----------|---------|
| KI-03 | WhatsApp e PIX ausentes (sem notificações, sem pagamento integrado) | Alta | Uso em produção |
| KI-04 | Dashboard de produção com dados hardcoded | Alta | Operação diária da equipe |
| KI-05 (parcial) | OTP via WhatsApp não implementado (login funciona com nome) | Alta | Segurança do cliente |
| KI-08 (parcial) | `ROLE_REQUIRED` vazio — mapa preparado mas sem restrições granulares | Média | Segurança por papel |
| KI-10 | `Address` acumula sem deduplicação (1 por pedido de entrega) | Baixa | Módulo Clientes |
| KI-15 (parcial) | Regra "sem entrega no fim de semana" implementada mas não documentada em REGRAS_NEGOCIO.md | Baixa | Regressão futura |
| KI-16 | `Product.costPrice` sempre 0 — precificação automática não existe | Baixa | Fase 3 (Receitas) |
| KI-17 | `PaymentStatus` divergente: TypeScript tem `"FALHOU"/"REEMBOLSADO"`, banco tem `PARCIAL/ESTORNADO` | Alta | Integração PIX |
| — | Upload de fotos de referência no checkout (placeholder visual existe, backend ausente) | Média | Personalização |
| — | 7 módulos admin sem implementação (Produtos, Clientes, Insumos, Receitas, Unidades, Usuários, Tema) | Alta | Operação completa |

---

## 11. Dívida técnica existente

| ID | Descrição | Arquivo | Impacto | Resolução |
|----|-----------|---------|---------|-----------|
| DT-01 | `themeConfigRepository.ts` usa `$executeRaw`/`$queryRaw` para `faviconUrl` | `src/lib/repositories/themeConfigRepository.ts` | Baixo (funcional; sem type-safety) | Rodar `npm run db:generate` (parar servidor para liberar DLL) → substituir por client tipado |
| DT-02 | `PaymentStatus` divergente entre TypeScript e Prisma schema (KI-17) | `src/lib/types.ts`, `prisma/schema.prisma` | Alto (bloqueia integração PIX) | Corrigir `types.ts`: `"FALHOU"→"PARCIAL"`, `"REEMBOLSADO"→"ESTORNADO"` |
| DT-03 | `ROLE_REQUIRED` vazio no proxy — qualquer admin acessa todos os módulos | `src/proxy.ts` | Médio (segurança) | Preencher à medida que módulos sensíveis forem implementados |
| DT-04 | `imageEmoji` (TypeScript) vs `imageUrl` (Prisma) — coexistência sem resolução formal | `src/lib/types.ts`, `src/components/vitrine/ProductCard.tsx` | Baixo (funcional) | Resolver na implementação do módulo Produtos com upload de imagem |
| DT-05 | `KI-15` não documentada em `REGRAS_NEGOCIO.md` — sem entrega no fim de semana | `src/lib/utils.ts` | Baixo (risco de regressão) | Adicionar entrada em REGRAS_NEGOCIO.md |
| DT-06 | `Address` não é deduplicado — cliente recorrente acumula 1 Address por pedido | `src/app/api/orders/route.ts` | Baixo (dados) | Deduplicar ao implementar módulo Clientes |

---

## 12. Próximos épicos planejados

### ÉPICO 2 — Operação Básica Real
**Objetivo:** Conectar o dashboard de produção ao banco e implementar o módulo Produtos.

| Sprint | Entrega estimada |
|--------|-----------------|
| 2.1 — Dashboard de produção real (KI-04) | GET /api/orders com filtros data/status; Kanban interativo com PATCH; consolidação batch |
| 2.2 — Módulo Produtos (admin) | CRUD produtos: listagem, formulário, ativar/desativar, upload de imagem, vínculos categoria/ocasião |
| 2.3 — Módulo Usuários (admin) | CRUD de User com papéis (ADMIN, ATENDIMENTO, PRODUCAO, FINANCEIRO) |
| 2.4 — ROLE_REQUIRED por módulo | Preencher restrições granulares no proxy.ts conforme módulos implementados |

**Desbloqueado por:** KI-17 corrigido (DT-02) antes de qualquer integração.

---

### ÉPICO 3 — Cadastros de Insumos e Receitas
**Objetivo:** Base para precificação automática.

| Sprint | Entrega estimada |
|--------|-----------------|
| 3.1 — Módulo Unidades de medida | CRUD UnitOfMeasure + UnitConversion |
| 3.2 — Módulo Insumos | CRUD Ingredient + IngredientCategory + IngredientPriceHistory |
| 3.3 — Módulo Receitas | CRUD Recipe + RecipeIngredient com cálculo de custo |
| 3.4 — Vínculo Produto-Receita | ProductRecipe; cálculo automático de costPrice |

---

### ÉPICO 4 — Inteligência de Negócio
**Objetivo:** Decisões baseadas em dados.

| Sprint | Entrega estimada |
|--------|-----------------|
| 4.1 — Precificação automática | Calculadora custo+margem; alerta de margem negativa |
| 4.2 — Relatórios financeiros | Faturamento, ticket médio, margem real por período |
| 4.3 — Calendário de produção | Visualização de carga, alertas de overbooking |

---

### ÉPICO 5 — Integrações Externas
**Objetivo:** Automação e pagamento.

| Sprint | Entrega estimada |
|--------|-----------------|
| 5.1 — WhatsApp OTP (KI-03/KI-05) | OTP via Z-API/Evolution; validação de código em `authorize()` |
| 5.2 — Notificações WhatsApp | Templates por status de pedido; registro em WhatsAppLog |
| 5.3 — PIX integrado (KI-03) | QR Code no checkout; webhook de confirmação; atualização de paymentStatus |
| 5.4 — Google Maps (KI-04 derivado) | Cálculo de distância para entrega gratuita |

---

### ÉPICO 6 — Experiência do Cliente
**Objetivo:** App completo para o cliente final.

| Sprint | Entrega estimada |
|--------|-----------------|
| 6.1 — Módulo Clientes (admin) | Listagem, perfil, histórico, endereços salvos, deduplicação KI-10 |
| 6.2 — Detalhes do pedido | /pedidos/[id] com timeline de status, itens, fotos |
| 6.3 — Upload de fotos de referência | Input no checkout; OrderAttachment; exibição no dashboard |
| 6.4 — PWA | manifest.json, service worker, prompt de instalação |

---

## 13. Riscos conhecidos

| Risco | Severidade | Probabilidade | Mitigação |
|-------|-----------|--------------|-----------|
| **KI-17** — `PaymentStatus` divergente bloqueia integração PIX | Alta | Certa (se não corrigido) | Corrigir `types.ts` antes do ÉPICO 5 |
| **Supabase free tier auto-pausa** — banco inativo por 1 semana é pausado automaticamente | Alta | Alta (projeto em desenvolvimento ativo) | Restaurar via painel Supabase; considerar upgrade se for para produção |
| **DLL lock Windows** — `query_engine-windows.dll.node` não pode ser regenerado com servidor ativo | Médio | Certa no Windows | Parar servidor dev → `npm run db:generate` → reiniciar |
| **ROLE_REQUIRED vazio** — qualquer admin acessa módulos sensíveis (Financeiro, Usuários) | Médio | Atual | Preencher mapa ao implementar cada módulo no ÉPICO 2 |
| **Proxy.ts sem hot reload** — mudanças no proxy não são aplicadas sem reiniciar o servidor | Médio | Certa no dev | Reiniciar servidor após toda alteração em `src/proxy.ts` |
| **imageEmoji vs imageUrl** — coexistência sem resolução pode causar regressão no catálogo | Baixo | Médio | Resolver em Sprint 2.F.5 (módulo Produtos, upload de imagem) |
| **Sem testes automatizados** — nenhum teste unitário, integração ou e2e | Médio | — | Definir estratégia de testes antes do ÉPICO 3 |

---

## 14. Métricas do projeto

### Arquivos de código

| Categoria | Quantidade |
|-----------|-----------|
| Páginas (`page.tsx`) | **10** |
| Componentes (`*.tsx` em `src/components/`) | **15** |
| Services | **5** |
| Repositories | **2** |
| Validators | **1** |
| Formatters (`src/lib/formatters/`) | **6** |
| API route handlers (`route.ts`) | **7** |
| Hooks (`src/hooks/`) | **2** |
| Arquivos de contexto | **1** |

### Banco de dados

| Categoria | Quantidade |
|-----------|-----------|
| Modelos Prisma (tabelas) | **23** |
| Enums Prisma | **7** |

### Volume de código

| Métrica | Valor |
|---------|-------|
| Total de linhas TypeScript/TSX | **~3.787** |
| Maior arquivo (`checkout/page.tsx`) | 373 linhas |
| `admin/config/page.tsx` (pós-refatoração) | 171 linhas (era 774) |
| Componentes acima de 200 linhas | **0** |

### Documentação

| Tipo | Quantidade |
|------|-----------|
| Documentos de arquitetura | 5 (ARCHITECTURE, DOMAIN_MODEL, MODULES, KNOWN_ISSUES, CHANGELOG) |
| Documentos de planejamento | 4 (MENU_STRUCTURE, SCREENS, USER_FLOW, USER_JOURNEY) |
| Documentos de design/UX | 2 (DESIGN_SYSTEM, UX_GUIDELINES) |
| Documentos de produto | 3 (VISION, REGRAS_NEGOCIO, PLAN) |
| Wireframes HTML | 6 |
| **Total de documentos** | **20+** |

---

*Documento gerado em 30/06/2026 — encerramento oficial do ÉPICO 1.*
