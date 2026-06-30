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
