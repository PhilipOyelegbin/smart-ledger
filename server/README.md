# SmartLedger Server

Production-ready backend API for the SmartLedger invoice platform.

---

## Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- TypeORM
- JWT authentication with refresh tokens
- argon2 password hashing
- Joi validation
- PDFKit PDF generation
- Postmark email delivery
- Swagger/OpenAPI docs
- Jest and Supertest
- Docker

---

## Setup

1. Copy `.env.example` to `.env` and update the values.
2. Install dependencies.
3. Run database migrations or use TypeORM synchronize in development.
4. Start the API.

```bash
pnpm install
pnpm run dev
```

---

## Scripts

- `pnpm run dev` starts the development server.
- `pnpm run build` compiles TypeScript to `dist`.
- `pnpm run start` runs the compiled server.
- `pnpm run test` executes Jest tests.
- `pnpm run seed` loads sample demo data.

---

## API

Base URL: `/api/v1`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/verify-email`

### Users

- `GET /users/me`

### Businesses

- `POST /businesses`
- `GET /businesses/:id`
- `PUT /businesses/:id`

### Customers

- `POST /customers`
- `GET /customers`
- `GET /customers/:id`
- `PUT /customers/:id`
- `DELETE /customers/:id`
- `GET /customers/:id/invoices`

### Invoices

- `POST /invoices`
- `GET /invoices`
- `GET /invoices/:id`
- `PUT /invoices/:id`
- `DELETE /invoices/:id`
- `GET /invoices/:id/pdf`
- `POST /invoices/:id/send`

### Receipts

- `POST /receipts`
- `GET /receipts`
- `GET /receipts/:id`
- `GET /receipts/:id/pdf`
- `POST /receipts/:id/send`

### Analytics

- `GET /analytics/dashboard`

---

## Example response

```json
{
  "success": true,
  "message": "Invoice created successfully",
  "result": {}
}
```

---

## Swagger

Open `/api-docs` after starting the server.

---

## Docker

```bash
docker compose up --build
```

---
