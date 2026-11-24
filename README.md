# WIRED.exe

Marketplace full-stack demonstrativo (catálogo, carrinho, checkout simulado, autenticação e painel administrativo). **Sem pagamentos reais** e sem dados fictícios de vendas em indicadores administrativos.

## Stack

- **Frontend**: React 18, Vite, JavaScript, Tailwind CSS, Lucide React, React Router, Axios
- **Backend**: Node.js, Express
- **Banco**: SQLite + Prisma ORM
- **Auth**: JWT Bearer + bcryptjs
- **Upload**: Multer (armazenamento local)
- **Testes**: `node:test` + Supertest

## Estrutura

```text
WIRED.exe/
├── .env / .env.example
├── package.json
├── README.md
├── backend/
│   ├── prisma/ (schema, migrations, seed, dev.db)
│   ├── src/ (app, server, config, routes, controllers, services, middlewares, utils)
│   └── tests/
├── frontend/
│   ├── .env.example
│   └── src/ (layouts, routes, pages, components, context, services, utils)
└── uploads/products/ (imagens enviadas pelo admin, gerado em runtime)
```

## Pré-requisitos

- Node.js 20+ (recomendado 22+)
- npm

## Instalação e configuração

1. Instale dependências:
   ```bash
   npm install
   ```
2. Configure ambiente:
   ```bash
   copy .env.example .env
   copy frontend\.env.example frontend\.env
   ```
3. Gere Prisma Client, aplique migrações e rode seed:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

## Variáveis de ambiente

### Raiz / Backend (`.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite usado pelo Prisma |
| `PORT` | `4000` | Porta da API |
| `CLIENT_URL` | `http://localhost:5173` | Origem permitida no CORS |
| `NODE_ENV` | `development` | Ambiente |
| `JWT_SECRET` | obrigatório em produção | Segredo JWT |
| `JWT_EXPIRES_IN` | `7d` | Expiração do token |
| `ADMIN_EMAIL` | vazio | E-mail do admin bootstrap (opcional) |
| `ADMIN_PASSWORD` | vazio | Senha do admin bootstrap (opcional) |
| `ADMIN_NAME` | `Administrador WIRED.exe` | Nome do admin bootstrap |
| `ADMIN_RESET_PASSWORD` | `false` | Se `true`, redefine senha do admin existente no startup |

### Frontend (`frontend/.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/api` | Base URL da API |

## Execu��o (VS Code)

1. Abra a pasta do projeto no VS Code.
2. Abra o terminal integrado: `Ctrl+'` (ou Terminal > New Terminal).
3. Na raiz `WIRED.exe`, rode:

```bash
npm run dev
```

Isso sobe API e frontend juntos. Acesse:
- Frontend: http://127.0.0.1:5173
- API: http://localhost:4000/api
- Health: http://localhost:4000/api/health

Comandos separados:

```bash
npm run dev:api   # s� backend
npm run dev:web   # s� frontend
npm run build     # build frontend
npm test          # testes backend
```

Se a porta 5173 estiver ocupada, pare processos Node antigos antes: `Stop-Process -Name node -Force` (PowerShell).

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Sobe API e frontend em paralelo |
| `npm run dev:api` | Sobe apenas API |
| `npm run dev:web` | Sobe apenas frontend |
| `npm run build` | Build de produção do frontend |
| `npm run start` | Sobe apenas API |
| `npm test` | Testes backend (`node --test`) |
| `npm run db:generate` | Gera Prisma Client |
| `npm run db:migrate` | Migração de desenvolvimento |
| `npm run db:migrate:deploy` | Aplica migrações em deploy |
| `npm run db:seed` | Seed de catálogo demonstrativo |
| `npm run db:studio` | Prisma Studio |

## Autenticação e papéis

- Cadastro/login com JWT Bearer. O frontend armazena sessão em `localStorage` (`wired.exe.auth.v1`).
- Papéis: `CUSTOMER` e `ADMIN`.
- Bootstrap admin: defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`. Na inicialização, o usuário é criado/promovido a ADMIN ativo; a senha existente **não** é sobrescrita por padrão. Para forçar reset, use `ADMIN_RESET_PASSWORD=true` uma vez.
- Rotas `/api/admin/*` exigem usuário autenticado, ativo e com role `ADMIN`.

## Fluxo de compra (simulado)

- Carrinho no frontend (`wired.exe.cart.v1`) com validação de estoque/preço no backend.
- `POST /api/cart/validate`: valida itens e totais pelo banco.
- `POST /api/orders`: exige autenticação, valida estoque/preço, cria pedido em transação, decrementa estoque e gera `orderCode`.
- Pagamentos são **simulados** (`PIX_SIMULADO`, `BOLETO_SIMULADO`, `CARTAO_ENTREGA_SIMULADO`) com `paymentStatus=NOT_PROCESSED`. Nenhuma cobrança real é processada.
- Cliente vê apenas seus pedidos (`GET /api/orders`, `GET /api/orders/:code`).

## Painel administrativo

- Dashboard com KPIs agregados do SQLite real (sem dados fictícios).
- CRUD de categorias e produtos, controle de estoque.
- Upload local de imagens de produto (JPG/PNG/WEBP/GIF, 5MB, máx. 5 arquivos por envio, validação de assinatura).
- Gestão de pedidos: status operacional e status de pagamento simulado.
- Gestão de clientes: listagem, detalhe e ativar/desativar conta.

## API principal

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/health` | não | Status da API |
| `POST` | `/api/auth/register` | não | Cadastro |
| `POST` | `/api/auth/login` | não | Login |
| `GET` | `/api/auth/me` | usuário | Perfil atual |
| `GET` | `/api/categories` | não | Categorias públicas |
| `GET` | `/api/products` | não | Catálogo com filtros/paginação |
| `GET` | `/api/products/:slug` | não | Detalhe do produto |
| `POST` | `/api/cart/validate` | não | Validação de carrinho |
| `POST` | `/api/orders` | usuário | Cria pedido simulado |
| `GET` | `/api/orders` | usuário | Pedidos do usuário |
| `GET` | `/api/orders/:code` | usuário | Detalhe do pedido próprio |
| `GET/PATCH/...` | `/api/admin/*` | admin | Dashboard, CRUD, estoque, pedidos, clientes, upload |

## Testes e verificação

- Testes automatizados backend: `npm test` (auth, orders, products, admin).
- Build frontend: `npm run build`.
- Não há script de lint/typecheck configurado; adicionar ESLint/TypeScript é pendência real.

## Deploy / produção

- Defina `NODE_ENV=production`, `JWT_SECRET` forte, `CLIENT_URL` correto e credenciais de admin por ambiente seguro.
- Aplique migrações com `npm run db:migrate:deploy` antes de subir a API.
- Sirva frontend buildado (`frontend/dist`) por CDN/host estático ou atrás de proxy; a API pode rodar com `npm run start`.
- SQLite/local uploads são adequados para demo/dev; produção multi-instância exige banco gerenciado e storage externo.

## Pendências e limitações reais

- **Sem pagamentos reais**: checkout/pagamento são simulados por design.
- **JWT em localStorage**: funcional, mas sujeito a risco se houver XSS; falta endurecimento completo de CSP/headers por ambiente.
- **Rate limit básico**: aplicado em `/api` e rotas de auth; não substitui WAF/monitoramento.
- **Upload local**: sem CDN, antivírus, quarentena ou storage distribuído; remoção de arquivo ocorre em remoção de imagem, mas não há limpeza órfã completa.
- **SQLite**: bom para demo; não recomendado para alta concorrência/escala horizontal.
- **Cobertura de testes**: backend parcial; sem testes frontend/e2e/acessibilidade automatizada.
- **Vulnerabilidades npm**: auditoria pode reportar dependências transitive/dev; avaliar upgrades com cuidado (especialmente major).
- **Observabilidade/ops**: sem logs estruturados, métricas, alertas, backup automatizado e fila.