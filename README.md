# Car Dekho — Car Research Platform

A full-stack car research platform: search ~1,200 cars by make, body type, fuel
type, transmission, seating capacity and price, view full spec sheets, and
compare two cars side by side.

## About

The dataset (`cars_ds_final.csv` + `cars_ds_final_2021.csv`) contains ~140
columns of spec data per car (engine, dimensions, brakes, infotainment,
safety features, etc). On first boot, the backend seeds Postgres from both
CSVs, merging on `(make, model, variant)` so the more complete 2021 file
wins on overlaps. From there, the API serves fast, filtered search and
comparison endpoints backed by a Redis cache.

## Tech stack

| Layer       | Tech                                                            |
| ----------- | ---------------------------------------------------------------- |
| Frontend    | React 19, Vite, plain `fetch` (no extra state library)           |
| Backend     | NestJS 11, TypeScript                                            |
| Database    | PostgreSQL 16 + TypeORM                                          |
| Cache       | Redis 7 (`@nestjs/cache-manager`)                                |
| Docs        | Swagger / OpenAPI (`@nestjs/swagger`)                            |
| Health      | `@nestjs/terminus` (Postgres + Redis indicators)                 |
| Validation  | `class-validator` / `class-transformer`                          |
| Web server  | nginx (serves the built frontend, proxies `/api` to the backend) |
| Containers  | Docker, Docker Compose                                           |

## Project structure

```
.
├── backend/             NestJS API
│   ├── src/
│   │   ├── cars/        Search, compare, filters — controller/service/entity
│   │   ├── database/seed/  CSV parsing + one-time DB seeding on boot
│   │   ├── health/       /health endpoint (Postgres + Redis checks)
│   │   ├── cache/        Redis cache module
│   │   └── main.ts       Bootstrap: Swagger, CORS, validation pipe
│   ├── seed/data/        Source CSVs seeded into Postgres on first boot
│   └── Dockerfile
├── frontend/             Vite + React UI
│   ├── src/
│   │   ├── api/          fetch wrapper + cars API client
│   │   ├── components/   FilterPanel, CarResultsTable, CompareView, CarDetailView
│   │   └── App.jsx       Orchestrates search state, pagination, compare flow
│   ├── nginx.conf        Serves the built app, proxies /api/* to the backend
│   └── Dockerfile
└── docker-compose.yml    Orchestrates postgres, redis, backend, frontend
```

## How to start

### Option A — Docker (recommended)

Requires Docker + Docker Compose.

```bash
cp .env.example .env   # adjust DB credentials / CORS origin if needed
docker compose up --build
```

This starts all four services. On first run, the backend seeds Postgres
from the bundled CSVs (~1,200 cars) — check `docker compose logs backend`
for `Seeded 1192 cars`. Subsequent restarts skip seeding since the data
already exists (Postgres data persists in a named volume).

| Service  | URL                              |
| -------- | --------------------------------- |
| Frontend | http://localhost:8080             |
| Backend  | http://localhost:3000             |
| Swagger  | http://localhost:3000/api/docs    |
| Postgres | localhost:5432                    |
| Redis    | localhost:6379                    |

To stop: `docker compose down` (add `-v` to also wipe the DB/Redis volumes
and force a reseed on next start).

### Option B — Run locally without Docker

You'll need local Postgres and Redis instances running.

**Backend**
```bash
cd backend
cp .env.example .env   # point DB_HOST/REDIS_HOST at your local instances
npm install
npm run start:dev      # http://localhost:3000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev             # http://localhost:5173, set VITE_API_URL if backend isn't on :3000
```

## What to expect

- **Search** — free-text search (make/model/variant) plus filters for make,
  body type, fuel type, transmission, seating capacity, and price range.
  Results are paginated and cached in Redis for ~60s to keep repeat queries
  fast.
- **Compare** — select exactly two cars from the results table and compare
  their full spec sheets side by side, with mismatched rows highlighted.
- **Car detail** — view a car's complete spec sheet (all ~140 raw CSV
  columns) on demand.
- **Health check** — `GET /health` reports Postgres and Redis connectivity,
  useful for container orchestration or uptime checks.
- **API docs** — interactive Swagger UI at `/api/docs` for exploring and
  trying every endpoint.

## API overview

| Method | Path            | Description                                  |
| ------ | --------------- | --------------------------------------------- |
| GET    | `/cars/search`  | Filtered, paginated car search                |
| GET    | `/cars/filters` | Distinct values for building filter dropdowns |
| GET    | `/cars/:id`     | Full spec sheet for a single car              |
| GET    | `/cars/compare` | Side-by-side spec comparison of two cars      |
| GET    | `/health`       | Postgres + Redis health status                |

Full request/response schemas are documented in Swagger at `/api/docs`.

## Environment variables

Root `.env` (Docker Compose):

| Variable      | Default                                          | Purpose                          |
| ------------- | ------------------------------------------------- | --------------------------------- |
| `DB_USERNAME` | `postgres`                                        | Postgres user                     |
| `DB_PASSWORD` | `postgres`                                        | Postgres password                 |
| `DB_NAME`     | `car_dekho`                                       | Postgres database name            |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:8080`     | Allowed origins for the backend   |

See [`backend/.env.example`](backend/.env.example) for backend-only
variables (`DB_SYNCHRONIZE`, `REDIS_HOST`, etc.) used when running the
backend outside Docker.

## Scripts

**Backend** (`cd backend`): `npm run start:dev`, `npm run build`, `npm run
test`, `npm run test:e2e`, `npm run lint`.

**Frontend** (`cd frontend`): `npm run dev`, `npm run build`, `npm run
lint`, `npm run preview`.

## Build notes & retrospective

### What did I build and why?

A full-stack car research platform: a NestJS API backed by Postgres
(TypeORM) and Redis, serving search, filter, comparison, and detail
endpoints over a ~1,200-car dataset, plus a React/Vite frontend consuming
it — all containerized with Docker Compose. The brief was "let users
research and compare cars without lag," so the core decisions (Redis
caching, paginated search, indexed columns) were driven by that latency
requirement rather than feature completeness.

### What did I deliberately cut?

- **No auth/users** — out of scope for a research tool with no personal
  data to protect.
- **No DB migrations** — used `synchronize: true` since this is
  early-stage with no production data to protect yet; a known gap, not an
  oversight.
- **No router/state library on the frontend** — a single-page flow
  doesn't need React Router or Redux/TanStack Query; plain `fetch` +
  `useState` keeps the bundle small and the code legible.
- **Compare limited to 2 cars** — matched the explicit ask rather than
  building an N-way compare UI nobody requested.
- **No full-text/fuzzy search engine** (Elasticsearch, pg_trgm) — `ILIKE`
  + indexed columns + Redis cache was enough for 1,200 rows; would
  revisit only if the dataset grew by orders of magnitude.

### Tech stack and why

- **NestJS** — opinionated structure (modules/controllers/services) that
  scales better than raw Express for a multi-feature API, built-in DI,
  and first-class Swagger/TypeORM/Terminus integrations.
- **PostgreSQL + TypeORM** — relational fit for structured spec data with
  a `jsonb` column for the long tail of raw CSV fields not worth
  normalizing into 140 typed columns.
- **Redis** — the explicit latency requirement made caching non-optional;
  reused for both search-result caching and filter-option caching.
- **React + Vite** — fast dev loop, no SSR/routing complexity needed for
  a single research page.
- **Docker Compose** — one command to stand up Postgres, Redis, backend,
  and frontend together; matches how this would actually get
  deployed/demoed.

### What did I delegate to AI tools vs. do manually?

**Delegated (and where it helped most):**
- Boilerplate scaffolding (NestJS project setup, Dockerfiles,
  CRUD-shaped controllers/services/DTOs) — fast and mechanical, easy to
  verify by running it.
- CSV-to-entity parsing — tedious string-cleanup logic (price formatting,
  mileage units) that's quick to write and quick to spot-check against
  sample rows.
- Docker/compose debugging loop — iterating on build errors (npm ci
  lockfile drift, TypeORM column-type inference, `NODE_ENV=production`
  disabling `synchronize`) was much faster having the agent run, read,
  and re-run builds than doing it by hand.
- Git history surgery (subtree-merging branches into subdirectories
  without conflicts) — mechanically fiddly with a high error cost by
  hand, easy to verify the end state (`git ls-tree`, rebuild and rerun).

**Done manually (decisions, not execution):** architecture calls (entity
shape, what to cache and for how long, branch/merge strategy), and
reviewing every generated diff before accepting it — the agent proposes,
I decide.

### Where did the tools get in the way?

- **Silent assumptions that only broke at runtime**: the price-parsing
  bug (`"Rs. 2,92,667"` → `0.292667` because a stray period in "Rs."
  survived the digit/dot regex) and `NODE_ENV=production` silently
  disabling `synchronize` both looked like correct code until actually
  run against a real Postgres container.
- **Branch/merge state drift**: the agent's model of the repo's branch
  structure went stale the moment a teammate merged a PR out-of-band
  (`backend` branch landed at the repo root instead of nested) — required
  re-diagnosing from `git fetch` rather than trusting the earlier plan.

### If I had another 4 hours

1. **Proper migrations** (TypeORM migrations) instead of
   `synchronize: true`, so schema changes are reviewable and safe to run
   against real data.
2. **Frontend polish**: URL-synced filter state (shareable/bookmarkable
   searches), a loading skeleton instead of plain text, and a mobile
   layout for the comparison table.
3. **Backend tests**: unit tests for the CSV parser (the riskiest, least
   type-checked code in the system) and e2e tests for `/cars/search` and
   `/cars/compare`.
4. **Observability**: structured logging and basic request metrics, since
   "latency matters" was a stated requirement that was never actually
   instrumented with real p95s.
5. **CI**: GitHub Actions running lint/build/test on PRs, given the repo
   now has a real merge history worth protecting.
