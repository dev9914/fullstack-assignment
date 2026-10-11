# Fastor7 Full Stack Assignment

This repository contains two independent projects:

- **`frontend/`** — a React + TypeScript + Vite mobile-first web app for employee registration, OTP login, and restaurant browsing against the Fastor staging API.
- **`backend/`** — a Node.js + Express + TypeScript CRM backend with JWT authentication, enquiry management, and PostgreSQL persistence.

The two projects are independent: the frontend can run against the Fastor staging API without the backend, and the backend can run and be tested without the frontend.

## Prerequisites

- Node.js >= 18 (developed on Node 22)
- npm >= 9
- Docker & Docker Compose (for the backend PostgreSQL database)

## Frontend

Location: [`frontend/`](./frontend/)

A React 19 + Vite app with a registration → OTP login → restaurant list → product detail flow. In development it proxies `/v1` requests to the Fastor staging API to avoid CORS.

### Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (proxies `/v1` to staging) |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Lint with ESLint |
| `npm run preview` | Preview the production build |

See [frontend/README.md](./frontend/README.md) and [frontend/.env.example](./frontend/.env.example) for details.

## Backend

Location: [`backend/`](./backend/)

An Express + TypeScript CRM API with:

- Employee registration/login (bcrypt + JWT)
- Public enquiry submission
- Authenticated enquiry claiming (atomic, concurrency-safe)
- Counselor-scoped enquiry listing
- PostgreSQL persistence with parameterized queries
- Zod validation and centralized error handling

### Setup

```bash
cd backend
npm install
cp .env.example .env
docker compose up -d
npm run migrate
npm run dev
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with auto-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run migrate` | Apply SQL migrations |
| `npm test` | Run the Jest + Supertest test suite (DB mocked) |
| `npm run lint` | Lint with ESLint |

See [backend/README.md](./backend/README.md) and [backend/.env.example](./backend/.env.example) for full endpoint documentation, environment variables, and migration instructions.
