import { PrismaClient } from "@prisma/client";

/**
 * Singleton pattern for PrismaClient in Next.js.
 *
 * In Next.js development mode, hot-module-replacement (HMR) re-runs files on change.
 * If we instantiate `new PrismaClient()` directly in routes or utilities, each rebuild
 * would create a new connection pool to PostgreSQL, rapidly exhausting available connections.
 *
 * Attaching the client to `globalThis` preserves a single instance across reloads.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
