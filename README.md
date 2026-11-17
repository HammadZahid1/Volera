# VELORA

A full-stack e-commerce store built with Next.js, TypeScript, Tailwind CSS
and Prisma. This started as a side project: I wanted to build a complete
store from scratch, with real auth, a cart that actually persists, a
checkout flow that can't be tricked from the client, and an admin panel to
run it all.

> Heads up: this is a portfolio store, not a real one. Payments, reviews and
> the order history you see are sample data. No payment is ever taken;
> checkout records every order as not charged.

## What's inside

- A storefront with a searchable, filterable catalogue, product pages,
  collections and new arrivals
- Accounts with proper sessions: scrypt password hashing, signed httpOnly
  cookies and login rate limiting
- A cart that lives in the database for signed-in users and in localStorage
  for guests, merged when you sign in
- Checkout that re-checks prices and stock on the server and writes the
  order in a transaction, so nothing can be manipulated from the browser
- An account area with order history, a wishlist and profile settings
- An admin panel at `/admin` for products, orders and customers, guarded by
  role on the server
- A dark theme with restrained animation and reduced-motion support

## Tech stack

| Layer      | Choice                                        |
| ---------- | --------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack) + React 19 |
| Styling    | Tailwind CSS v4 (`@theme` tokens)             |
| Animation  | Framer Motion 14                              |
| Database   | SQLite (demo db included, Postgres optional)  |
| Auth       | Custom opaque-token sessions (node:crypto)    |
| Validation | Zod 4 + react-hook-form                       |

## Getting started

```bash
npm install
npm run db:reset
npm run dev
```

`db:reset` creates `prisma/dev.db` and fills it with the demo catalogue,
demo accounts and some sample orders. You don't need to set any environment
variables first; the seed script has defaults for everything.

### Demo accounts

| Role     | Email               | Password         |
| -------- | ------------------- | ---------------- |
| Admin    | admin@velora.com    | VeloraAdmin!2026 |
| Customer | customer@velora.com | VeloraDemo!2026  |

You can change these with the `SEED_*` variables, see `.env.example`.

## Scripts

| Command             | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start the development server               |
| `npm run build`     | Generate Prisma client + production build  |
| `npm run start`     | Serve the production build                 |
| `npm run lint`      | Run ESLint                                 |
| `npm run typecheck` | Run TypeScript                             |
| `npm run test`      | Run Vitest                                 |
| `npm run db:push`   | Push the Prisma schema to the database     |
| `npm run db:seed`   | Seed categories, products and accounts     |
| `npm run db:reset`  | Reset the database and reseed              |
| `npm run db:studio` | Open Prisma Studio                         |

## Deploying to Vercel

This deploys with no configuration and no environment variables. Import the
repo on Vercel, accept the defaults, and it just works.

How that works: the build bundles `prisma/demo.db`, a seeded snapshot of the
catalogue and demo accounts (see `outputFileTracingIncludes` in
`next.config.ts`). When a serverless instance starts, it copies that file
into a writable temp folder and uses it as the database. The live site is
fully usable: you can browse, sign in, add to cart and place an order.

### Things to know about demo mode

- Data doesn't stick. Orders and sign-ups live in that temp copy and
  disappear when the instance recycles or you redeploy.
- You may get signed out now and then if traffic moves to another instance.
  Signing in again sorts it out.
- `SESSION_SECRET` is optional. Without it, each instance generates its own
  secret and logs a warning. Set it if you want sessions to survive across
  instances.
- Payments are simulated, so there's no real money anywhere.

### Using a real database instead

If you want data that actually persists, switch to PostgreSQL:

1. Change `provider` to `"postgresql"` in `prisma/schema.prisma` and delete
   `prisma/demo.db` (and its entry in `outputFileTracingIncludes`).
2. Point `VELORA_DATABASE_URL` at your database. A Supabase session pooler
   string or a Neon connection string both work.
3. Set `SESSION_SECRET` to a random string of 32+ characters.
4. Run `npm run db:push` and then `npm run db:seed`.

If a deploy ever shows Vercel's generic error page (the one with an ID like
`ERROR 1654951400`), something crashed on the server. Look under
Deployments, then Runtime Logs, for the real message.

## Project structure

```
src/
  app/
    (site)/        # public and account pages (storefront shell)
    (auth)/        # login / register
    admin/         # studio admin (role-guarded)
    api/           # search API
  components/      # UI, layout, shop, admin and order components
  server/actions/  # server actions (auth, orders, admin)
  lib/             # db, auth, validation, cart, orders, products
prisma/
  schema.prisma    # data model
  seed.ts          # demo catalogue and accounts
```

## License

This is a portfolio project, so use the code however you like.
