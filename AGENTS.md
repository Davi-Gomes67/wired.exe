# AGENTS.md

## Project
- WIRED.exe: marketplace (React/Vite frontend + Express/Prisma backend, SQLite).
- Package manager: npm (root `package.json` drives both frontend and backend).

## Commands
- Install: `npm install`
- Dev (api+web): `npm run dev`
- API only: `npm run dev:api`
- Web only: `npm run dev:web`
- Build frontend: `npm run build`
- Tests: `npm run test` (Node test runner, `backend/tests/*.test.js`)
- Single test file: `npm run test -- tests/admin.test.js`
- Prisma generate: `npm run db:generate`
- Prisma migrate (dev): `npm run db:migrate`
- Prisma migrate deploy: `npm run db:migrate:deploy`
- Seed: `npm run db:seed`

## Conventions
- Backend source: `backend/src/`; routes/controllers/services/middlewares split by domain.
- Prisma schema: `backend/prisma/schema.prisma`; migrations in `backend/prisma/migrations/`.
- Frontend source: `frontend/src/`; admin pages in `frontend/src/pages/admin/`.
- API client: `frontend/src/services/api.js`.
- Do not commit secrets (`.env`, DB files, uploads, logs, `node_modules` are gitignored).
- Prefer existing patterns; keep changes minimal and verify with relevant tests.
