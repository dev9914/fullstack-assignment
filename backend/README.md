# Fastor7 CRM Backend

A Node.js + Express + TypeScript backend for the Fastor7 CRM assignment. It provides employee authentication and enquiry management with PostgreSQL persistence, JWT auth, bcrypt password hashing, Zod validation, and a tested API.

## Tech Stack

- **Runtime**: Node.js (>= 18), Express 4, TypeScript 5
- **Database**: PostgreSQL 16 (`pg` driver with parameterized queries)
- **Auth**: JWT (`jsonwebtoken`), bcrypt password hashing (`bcryptjs`)
- **Validation**: Zod
- **Security**: helmet, cors
- **Config**: dotenv
- **Testing**: Jest + Supertest (database mocked)
- **Linting**: ESLint 9 with `@typescript-eslint`

## Project Structure

```
backend/
  migrations/
    001_create_tables.sql
  src/
    config/
      database.ts        # PostgreSQL pool
      env.ts             # Zod-validated environment variables
    controllers/
      auth.controller.ts
      enquiry.controller.ts
    middleware/
      auth.middleware.ts  # JWT verification
      error.middleware.ts # centralized error handler
      validate.middleware.ts # Zod request validation
    repositories/
      employee.repository.ts
      enquiry.repository.ts
    routes/
      auth.routes.ts
      enquiry.routes.ts
    schemas/
      auth.schema.ts
      enquiry.schema.ts
    services/
      auth.service.ts
      enquiry.service.ts
    utils/
      AppError.ts
      asyncHandler.ts
    app.ts
    server.ts
    migrate.ts
  tests/
    auth.test.ts
    enquiry.test.ts
    helpers.ts
    setup.ts
  .env.example
  docker-compose.yml
  package.json
  tsconfig.json
```

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

Required variables (see [`.env.example`](./.env.example)):

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP port | `4000` |
| `NODE_ENV` | `development` / `test` / `production` | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL user | `fastor` |
| `DB_PASSWORD` | PostgreSQL password | `fastor_password` |
| `DB_NAME` | PostgreSQL database | `fastor_crm` |
| `JWT_SECRET` | Secret for signing JWTs (min 16 chars) | — |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `7d`, `24h`) | `7d` |
| `CORS_ORIGIN` | Comma-separated allowed origins | `http://localhost:5173` |

> **Never commit real secrets.** `.env` is git-ignored.

### 3. Start PostgreSQL

A Docker Compose service is provided:

```bash
docker compose up -d
```

This starts PostgreSQL 16 on port `5432` with database `fastor_crm`, user `fastor`, password `fastor_password`.

### 4. Run migrations

```bash
npm run migrate
```

This applies all `*.sql` files in `migrations/` (currently `001_create_tables.sql`) inside a transaction.

### 5. Run the server

```bash
# Development (auto-reload with tsx)
npm run dev

# Production build
npm run build
npm start
```

The server listens on `http://localhost:4000`.

## Endpoints

Base path: `/api/v1`

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | No | Register an employee |
| `POST` | `/api/v1/auth/login` | No | Login and receive a JWT |

### Enquiries

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/enquiries` | No | Public enquiry submission |
| `GET` | `/api/v1/enquiries/unclaimed` | Yes | List all unclaimed enquiries |
| `GET` | `/api/v1/enquiries/my` | Yes | List enquiries claimed by the authenticated employee |
| `PATCH` | `/api/v1/enquiries/:id/claim` | Yes | Claim an enquiry (atomic) |

### Pagination

`GET /api/v1/enquiries/unclaimed` and `GET /api/v1/enquiries/my` accept query parameters:

- `limit` (1–100, default 50)
- `offset` (>= 0, default 0)

## Example Requests & Responses

### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Jane Counselor",
  "email": "jane@example.com",
  "password": "Password123"
}
```

**201 Created**
```json
{
  "status": "success",
  "data": {
    "employee": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Jane Counselor",
      "email": "jane@example.com",
      "created_at": "2026-01-01T00:00:00.000Z"
    },
    "token": "<jwt>"
  }
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "Password123"
}
```

**200 OK** — same shape as register.

### Create Enquiry (public)

```http
POST /api/v1/enquiries
Content-Type: application/json

{
  "name": "Prospect Student",
  "email": "prospect@example.com",
  "phone": "+919999999999",
  "course_interest": "Full Stack Development",
  "message": "I want to enroll."
}
```

**201 Created**
```json
{
  "status": "success",
  "data": {
    "enquiry": {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "Prospect Student",
      "email": "prospect@example.com",
      "phone": "+919999999999",
      "course_interest": "Full Stack Development",
      "message": "I want to enroll.",
      "claimed_by": null,
      "created_at": "2026-01-02T00:00:00.000Z",
      "claimed_at": null
    }
  }
}
```

### List Unclaimed Enquiries

```http
GET /api/v1/enquiries/unclaimed?limit=20&offset=0
Authorization: Bearer <jwt>
```

**200 OK**
```json
{
  "status": "success",
  "data": {
    "enquiries": [ ... ]
  }
}
```

### Claim an Enquiry

```http
PATCH /api/v1/enquiries/<enquiry-id>/claim
Authorization: Bearer <jwt>
```

**200 OK** — returns the claimed enquiry with `claimed_by` set to the authenticated employee's id and `claimed_at` set.

- **404** if the enquiry does not exist.
- **409** if the enquiry was already claimed by someone else.

### My Enquiries

```http
GET /api/v1/enquiries/my
Authorization: Bearer <jwt>
```

Returns only enquiries claimed by the authenticated employee.

## Error Responses

All errors follow a consistent shape:

```json
{
  "status": "fail",
  "message": "Human-readable error message"
}
```

Validation errors include a `; `-separated list of field messages. Stack traces and database internals are never exposed in production.

## Business Rules

- Passwords are hashed with bcrypt (12 salt rounds). Password hashes are never returned in responses.
- Employee emails are matched case-insensitively on registration and login; uniqueness is enforced at the database level.
- JWTs carry the employee id in the `sub` claim. The authenticated employee id is derived from the verified token, never from client input.
- Claiming is concurrency-safe: a single atomic `UPDATE ... WHERE claimed_by IS NULL RETURNING *`. If no row is returned, a follow-up `SELECT` distinguishes a nonexistent enquiry (404) from an already-claimed one (409).
- A counselor cannot see another counselor's claimed enquiries through the unclaimed or own-enquiries endpoints.
- All SQL queries use parameterized statements.

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with auto-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server |
| `npm run migrate` | Apply SQL migrations |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |

## Testing

Tests use Jest + Supertest with the PostgreSQL pool mocked (no live database required):

```bash
npm test
```

Coverage includes:
- Registration success, duplicate email, weak password, invalid email, missing fields
- Login success, wrong password, non-existent email, case-insensitive lookup
- Public enquiry creation (no auth), optional fields, validation
- Authentication failure (401) on protected routes
- Claim success, 404 for missing enquiry, 409 for already-claimed, malformed UUID
- Employee id derived from token (not client-supplied)
- Ownership isolation on `/my` and `/unclaimed`

## Database Schema

### `employees`
- `id` UUID PK (default `gen_random_uuid()`)
- `name` VARCHAR(100) NOT NULL
- `email` VARCHAR(255) NOT NULL UNIQUE
- `password_hash` VARCHAR(255) NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- Unique index on `LOWER(email)`

### `enquiries`
- `id` UUID PK (default `gen_random_uuid()`)
- `name` VARCHAR(100) NOT NULL
- `email` VARCHAR(255) NOT NULL
- `phone` VARCHAR(30)
- `course_interest` VARCHAR(100) NOT NULL
- `message` TEXT
- `claimed_by` UUID → `employees(id)` ON DELETE SET NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `claimed_at` TIMESTAMPTZ
- Check constraint enforcing `claimed_by` and `claimed_at` are both set or both null
- Partial index on `created_at DESC` where `claimed_by IS NULL` (unclaimed lookups)
- Partial index on `(claimed_by, claimed_at DESC)` where `claimed_by IS NOT NULL` (per-counselor lookups)
