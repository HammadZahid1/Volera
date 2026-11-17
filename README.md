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
| Database   | SQLite (bundled demo db) · PostgreSQL optional      |
| Auth       | Custom opaque-token sessions (node:crypto)          |
| Validation | Zod 4 + react-hook-form                             |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database and seed demo data

```bash
npm run db:reset
```

This creates `prisma/dev.db` (SQLite) and fills it with the demo catalogue,
demo accounts and sample orders. **No environment variables are required** —
all seed credentials have built-in defaults.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role     | Email               | Password         |
| -------- | ------------------- | ---------------- |
| Admin    | admin@velora.com    | VeloraAdmin!2026 |
| Customer | customer@velora.com | VeloraDemo!2026  |

(Override via the `SEED_*` environment variables — see `.env.example`.)

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

The project deploys with **zero configuration and zero environment
variables**. Import the repo on Vercel, take the defaults, and it works.

How it works: the production build bundles `prisma/demo.db` — a pristine
seeded snapshot of the catalogue and demo accounts (see
`outputFileTracingIncludes` in `next.config.ts`). At runtime each serverless
instance copies it into its writable temp directory and uses that as the
database, so browsing, signing in, carting and even checkout all function.

### Demo-mode caveats

- **Data is ephemeral per instance.** Orders, sessions and admin edits live
  in the instance's temp copy and reset when the instance recycles or the
  project is redeployed.
- **Sessions can drop.** If traffic shifts to a different server instance,
  you may be signed out (sign in again and continue).
- `SESSION_SECRET` is optional: without it an ephemeral secret is used per
  instance (a warning is logged). Set it in the environment for stable
  sessions across instances.
- Checkout and payments are simulated (`paymentStatus: "not_charged"`) — no
  real money is ever involved.

### Using a real database instead

For persistent production data, switch to PostgreSQL:

1. Change `provider` to `"postgresql"` in `prisma/schema.prisma` and delete
   `prisma/demo.db` (plus its entry in `outputFileTracingIncludes`).
2. Point `VELORA_DATABASE_URL` at your database (Supabase "Session pooler"
   string or a Neon connection string both work).
3. Set `SESSION_SECRET` to a 32+ character random string.
4. Create the schema and seed: `npm run db:push && npm run db:seed`.

If you ever see Vercel's generic error page (with an ID like
`ERROR 1654951400`), it means a server-side function crashed — check
**Deployments → Runtime Logs** for the underlying message.

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
