# WIRED.exe

WIRED.exe é um marketplace full-stack demonstrativo com identidade visual própria, focado em eletrônicos, hardware e cultura geek. O projeto reúne vitrine pública, conta do cliente, painel administrativo, conteúdo editorial e comunidade, com fluxo de compra **simulado** (sem pagamentos reais).

## Visão geral

O repositório contém uma aplicação web completa com:

- **Frontend** em React + Vite + Tailwind CSS.
- **Backend** em Node.js + Express.
- **Banco de dados** SQLite com Prisma ORM.
- **Autenticação** com JWT Bearer e senhas com bcrypt.
- **Uploads locais** para mídias administrativas e avatar/comunidade.

O objetivo do projeto é demonstrar arquitetura, integração frontend/backend, regras de negócio, autenticação, administração e experiência de produto em um ambiente de desenvolvimento/local.

## Principais módulos

### Loja e catálogo
- Catálogo público com categorias, busca, filtros e página de produto.
- Carrinho no frontend com validação de itens, preço e estoque no backend.
- Checkout protegido por autenticação, com criação de pedido em transação.
- Métodos de pagamento **simulados**: `PIX_SIMULADO`, `BOLETO_SIMULADO`, `CARTAO_ENTREGA_SIMULADO`.
- Status de pagamento simulado (`NOT_PROCESSED`) — nenhuma cobrança real é processada.

### Conta do cliente (WIRED ID)
- Cadastro, login, recuperação/redefinição de senha.
- Área `/conta` com visão geral, pedidos, favoritos, vistos recentemente, assinatura, conquistas, comunidade salva e configurações.
- Preferência de tema claro/escuro persistida em `localStorage` (`wired.exe.theme`), com padrão escuro.

### ROOT ACCESS
- Página dedicada à assinatura/conceito ROOT ACCESS.
- Opt-in explícito no checkout para criar assinatura `PENDING`, separada do pedido.
- A adesão não altera total, itens ou fluxo principal do pedido.

### WIRED JOURNAL
- Área pública de artigos com listagem e página por slug.
- Painel administrativo para gestão de conteúdo editorial.
- Renderização de conteúdo por blocos/estrutura controlada, sem execução de HTML bruto.

### WIRED COMMUNITY
- Feed público, página de post e perfil público.
- Criação/interação de posts para usuários autenticados, conforme regras da API.
- Área administrativa para moderação/gestão.
- Conteúdo salvo na conta do usuário.

### Painel administrativo
- Dashboard com indicadores agregados a partir do banco local.
- CRUD de categorias e produtos, destaques, mídia, estoque, pedidos e clientes.
- Gestão de journal e comunidade.
- Configurações administrativas.
- Rotas `/api/admin/*` protegidas por autenticação, usuário ativo e papel `ADMIN`.

### Recursos adicionais
- Comparação de produtos e lista de favoritos.
- Página de terminal/experiência temática.
- Layout responsivo com navegação pública e administrativa.

## Stack técnica

| Camada | Tecnologias |
|---|---|
| Frontend | React 18, Vite, JavaScript, Tailwind CSS, React Router, Axios, Lucide React |
| Backend | Node.js, Express, Prisma ORM |
| Banco | SQLite |
| Autenticação | JWT Bearer, bcryptjs |
| Upload | Multer (armazenamento local) |
| Testes | Node Test Runner (`node --test`) + Supertest |

## Estrutura do projeto

```text
WIRED.exe/
├── backend/
│   ├── prisma/                 # schema, migrations, seed, dev.db local
│   ├── src/
│   │   ├── config/             # env, prisma, bootstrap
│   │   ├── controllers/        # controllers públicos, conta e admin
│   │   ├── middlewares/        # auth, validação, upload, erros
│   │   ├── routes/             # rotas da API
│   │   ├── services/           # regras de negócio
│   │   └── utils/              # utilitários
│   └── tests/                  # testes backend
├── frontend/
│   ├── public/                 # assets públicos
│   └── src/
│       ├── components/         # UI, layout, conta, journal, community
│       ├── context/            # auth, cart, theme, wishlist, compare
│       ├── layouts/            # layout público e admin
│       ├── pages/              # páginas públicas, conta e admin
│       ├── routes/             # definição de rotas React
│       ├── services/           # cliente API
│       └── utils/              # helpers de UI/storage/format
├── .env.example
├── package.json
└── README.md
```

## Pré-requisitos

- **Node.js** 20+ (recomendado 22+)
- **npm**

## Instalação e execução

### 1. Clonar o repositório

```bash
git clone https://github.com/Davi-Gomes67/wired.exe.git
cd wired.exe
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
copy .env.example .env
copy frontend\.env.example frontend\.env
```

No PowerShell, você também pode usar `Copy-Item` se preferir.

### 4. Preparar o banco de dados

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Iniciar em desenvolvimento

```bash
npm run dev
```

Aplicação disponível em:

- Frontend: `http://127.0.0.1:5173`
- API: `http://localhost:4000/api`
- Health check: `http://localhost:4000/api/health`

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Sobe API e frontend em paralelo |
| `npm run dev:api` | Sobe apenas a API |
| `npm run dev:web` | Sobe apenas o frontend |
| `npm run build` | Gera build de produção do frontend |
| `npm run start` | Sobe apenas a API |
| `npm run preview` | Preview do build frontend |
| `npm test` | Executa testes backend (`node --test backend/tests/*.test.js`) |
| `npm run db:generate` | Gera Prisma Client |
| `npm run db:migrate` | Cria/aplica migração em desenvolvimento |
| `npm run db:migrate:deploy` | Aplica migrações em ambiente de deploy |
| `npm run db:seed` | Executa seed do banco |
| `npm run db:studio` | Abre Prisma Studio |

## Variáveis de ambiente

### Raiz / Backend (`.env`)

| Variável | Exemplo/Padrão | Descrição |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Caminho do banco SQLite usado pelo Prisma |
| `PORT` | `4000` | Porta da API |
| `CLIENT_URL` | `http://localhost:5173` | Origem permitida pelo CORS |
| `NODE_ENV` | `development` | Ambiente de execução |
| `JWT_SECRET` | `change-me-in-production` | Segredo JWT; obrigatório usar valor forte em produção |
| `JWT_EXPIRES_IN` | `7d` | Expiração do token |
| `ADMIN_EMAIL` | vazio | E-mail para bootstrap de administrador (opcional) |
| `ADMIN_PASSWORD` | vazio | Senha para bootstrap de administrador (opcional) |
| `ADMIN_NAME` | `Administrador WIRED.exe` | Nome do admin bootstrap |
| `ADMIN_RESET_PASSWORD` | `false` | Se `true`, redefine senha do admin existente na inicialização |

### Frontend (`frontend/.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/api` | URL base da API |

## API (visão geral)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/api/health` | Público | Status da API |
| `POST` | `/api/auth/register` | Público | Cadastro |
| `POST` | `/api/auth/login` | Público | Login |
| `GET` | `/api/auth/me` | Autenticado | Perfil atual |
| `GET` | `/api/categories` | Público | Categorias |
| `GET` | `/api/products` | Público | Catálogo com filtros/paginação |
| `GET` | `/api/products/:slug` | Público | Detalhe do produto |
| `POST` | `/api/cart/validate` | Público | Validação de carrinho |
| `POST` | `/api/orders` | Autenticado | Criação de pedido simulado |
| `GET` | `/api/orders` | Autenticado | Pedidos do usuário |
| `GET` | `/api/orders/:code` | Autenticado | Detalhe do pedido próprio |
| `GET/POST/...` | `/api/root-access` | Público/Autenticado | Fluxos ROOT ACCESS |
| `GET/POST/...` | `/api/journal` | Público/Admin | Conteúdo editorial |
| `GET/POST/...` | `/api/community` | Público/Autenticado/Admin | Comunidade e moderação |
| `GET/PATCH/...` | `/api/admin/*` | Admin | Operações administrativas |

> A lista acima é resumida. Consulte `backend/src/routes/` para o contrato completo de rotas.

## Autenticação e segurança

- Autenticação por JWT Bearer.
- Senhas armazenadas com hash (`bcryptjs`).
- Rotas administrativas exigem usuário autenticado, ativo e com papel `ADMIN`.
- Uploads passam por validações de tipo/tamanho/assinatura conforme middleware.
- Não commitar segredos (`.env`), bancos locais, uploads, logs ou artefatos gerados.

## Testes e validação

Testes backend:

```bash
npm test
```

Build do frontend:

```bash
npm run build
```

Validação útil em desenvolvimento:

```bash
npm run db:generate
node -e "require('./backend/src/app'); console.log('ok')"
```

## Limitações conhecidas

- **Sem pagamentos reais**: o checkout é simulado para fins de demonstração.
- **SQLite local**: adequado para desenvolvimento/demo; não recomendado para alta concorrência ou escala horizontal.
- **Uploads locais**: sem CDN, antivírus/quarentena ou armazenamento distribuído.
- **Cobertura de testes parcial**: há testes backend, mas ainda não há suíte completa de testes frontend/e2e/acessibilidade automatizada.
- **JWT em armazenamento web**: funcional para o escopo atual, mas exige endurecimento adicional conforme contexto de produção.
- **Observabilidade limitada**: não há stack completa de logs estruturados, métricas, alertas e backup automatizado.

## Deploy / produção

Para uso além de desenvolvimento local, avaliar antes:

- Definir `JWT_SECRET` forte e variáveis de ambiente por ambiente seguro.
- Usar `npm run db:migrate:deploy` no deploy.
- Substituir SQLite/uploads locais por serviços gerenciados quando houver múltiplas instâncias.
- Configurar HTTPS, CORS, headers de segurança, rate limit/WAF e monitoramento.
- Revisar políticas de backup, retenção e observabilidade.

## Licença

Este projeto não possui arquivo de licença definido no repositório até o momento. Caso vá publicar ou distribuir, adicione uma licença explícita.
