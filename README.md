# VELORA

A premium full-stack e-commerce platform for modern essentials — built with
Next.js (App Router), TypeScript, Tailwind CSS v4, Framer Motion, and Prisma
on PostgreSQL.

> **Demo notice** — VELORA is a portfolio demonstration store. Payments,
> reviews, testimonials and seeded order history are illustrative only; no
> real payment is ever collected (checkout records orders as
> `paymentStatus: "not_charged"`).

## Features

- **Storefront** — editorial homepage, filterable/searchable catalogue
  (`/shop`), product detail pages, collections, new arrivals
- **Accounts** — register/login with secure first-party sessions (scrypt
  password hashing, HMAC-signed httpOnly session cookies, rate limiting)
- **Cart** — persistent for signed-in users (database), guest carts in
  localStorage, merged on sign-in; slide-over cart drawer
- **Checkout** — server-authoritative pricing/stock validation, transactional
  order creation, idempotency keys, guest-friendly
- **Account area** — order history with status timeline, wishlist, profile
  and password management
- **Studio admin** (`/admin`) — live dashboard, product CRUD, order status
  management (with stock restock/re-reserve logic), customer views; guarded
  server-side by role
- **Design** — layered dark theme, purposeful motion, reduced-motion support,
  fully responsive

## Tech Stack

| Layer      | Choice                                              |
| ---------- | --------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack) + React 19       |
| Styling    | Tailwind CSS v4 (`@theme` tokens)                   |
| Animation  | Framer Motion 14                                    |
| Database   | PostgreSQL via Prisma ORM                           |
| Auth       | Custom opaque-token sessions (node:crypto)          |
| Validation | Zod 4 + react-hook-form                             |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a PostgreSQL database

The app needs a PostgreSQL database for both local development and
production. The easiest option is a free
[Supabase](https://supabase.com) project:

1. Create a project at [database.new](https://database.new).
2. Open **Project Settings → Database**.
3. Copy the **Session pooler** connection string (port `5432`).

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in:

- `VELORA_DATABASE_URL` — your Postgres connection string
- `SESSION_SECRET` — 32+ random characters
  (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### 4. Create the schema and seed demo data

```bash
npm run db:push   # push the Prisma schema to the database
npm run db:seed   # create categories, products and demo accounts
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role     | Email               | Password         |
| -------- | ------------------- | ---------------- |
| Admin    | admin@velora.com    | VeloraAdmin!2026 |
| Customer | customer@velora.com | VeloraDemo!2026  |

(Change these via the seed environment variables for your own deployment.)

## Scripts

| Command             | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the development server                 |
| `npm run build`     | Generate Prisma client + production build    |
| `npm run start`     | Serve the production build                   |
| `npm run lint`      | Run ESLint                                   |
| `npm run typecheck` | Run TypeScript                               |
| `npm run test`      | Run Vitest                                   |
| `npm run db:push`   | Push the Prisma schema to the database       |
| `npm run db:seed`   | Seed categories/products and demo accounts   |
| `npm run db:reset`  | Reset the database and reseed                |
| `npm run db:studio` | Open Prisma Studio                           |

## Deploying to Vercel

The project is Vercel-ready out of the box (`npm run build` generates the
Prisma client before `next build`).

1. **Database** — create a Supabase (or Neon) project and copy its
   connection string. Do **not** use a local SQLite file: the serverless
   filesystem is ephemeral.
2. **Import the repo on Vercel** — the Next.js preset and build command are
   detected automatically.
3. **Set environment variables** (Project → Settings → Environment Variables):

   | Variable               | Value                                              |
   | ---------------------- | -------------------------------------------------- |
   | `VELORA_DATABASE_URL`  | Your Postgres connection string (Supabase session pooler) |
   | `SESSION_SECRET`       | 32+ random characters — **required**, sessions fail without it |
   | `NEXT_PUBLIC_SITE_URL` | Your production URL, e.g. `https://velora.vercel.app` |

4. **Create the schema + seed** (from your machine, against the production
   database):

   ```bash
   # point VELORA_DATABASE_URL in .env at the production database first
   npm run db:push
   npm run db:seed
   ```

5. **Redeploy** — every push to `main` creates a new deployment.

If you see Vercel's generic "Error" page (with an ID like `ERROR 1654951400`),
it means a server-side function crashed — almost always a missing environment
variable or an unreachable database. Check **Deployments → Runtime Logs** for
the underlying message.

## Project Structure

```
src/
  app/
    (site)/        # public + account pages (storefront shell)
    (auth)/        # login / register
    admin/         # studio admin (role-guarded)
    api/           # search API
  components/      # UI, layout, shop, admin, order components
  server/actions/  # server actions (auth, orders, admin)
  lib/             # db, auth, validation, cart, orders, products
prisma/
  schema.prisma    # data model
  seed.ts          # demo catalogue + accounts
```

## License

Portfolio demonstration project.
