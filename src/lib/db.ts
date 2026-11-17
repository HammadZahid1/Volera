import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// VELORA ships as a self-contained demo. In production (e.g. Vercel) the
// serverless filesystem is read-only, so the bundled prisma/demo.db is
// copied once into the instance's temp directory and Prisma reads/writes
// there instead. The demo database is ephemeral by design: it resets when
// a server instance recycles or the project is redeployed.
//
// Local development keeps using prisma/dev.db via the schema's
// VELORA_DATABASE_URL (see `npm run db:reset`).
function demoDatabaseUrl(): string | undefined {
  if (process.env.NODE_ENV === "development") return undefined;

  const source = join(process.cwd(), "prisma", "demo.db");
  if (!existsSync(source)) return undefined;

  const target = join(tmpdir(), "velora-demo.db");
  if (!existsSync(target)) {
    copyFileSync(source, target);
  }
  return `file:${target}`;
}

const demoUrl = demoDatabaseUrl();

if (demoUrl) {
  console.log("[velora] Using bundled demo database (ephemeral per instance).");
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(demoUrl ? { datasourceUrl: demoUrl } : {}),
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
