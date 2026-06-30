# Car-dekho-assignment

Car research platform.

- [`backend/`](backend) — NestJS API (search, compare, health, Swagger, Postgres + TypeORM, Redis cache)
- [`frontend/`](frontend) — Vite + React UI

## Running everything with Docker

```bash
cp .env.example .env   # adjust DB credentials if needed
docker compose up --build
```

| Service  | URL                              |
| -------- | --------------------------------- |
| frontend | http://localhost:8080             |
| backend  | http://localhost:3000             |
| Swagger  | http://localhost:3000/api/docs    |
| postgres | localhost:5432                    |
| redis    | localhost:6379                    |
