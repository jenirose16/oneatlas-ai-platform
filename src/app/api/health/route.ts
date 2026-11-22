import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ServiceHealth {
  status: "connected" | "disconnected" | "not_configured";
  latencyMs?: number;
  error?: string;
  details?: string;
}

export async function GET() {
  const startTime = Date.now();
  const databaseUrl = process.env.DATABASE_URL;

  let dbHealth: ServiceHealth;

  if (!databaseUrl || databaseUrl.trim() === "") {
    dbHealth = {
      status: "not_configured",
      details: "DATABASE_URL is not set in environment variables.",
    };
  } else {
    try {
      const dbPingStart = Date.now();
      // Run a lightweight raw query to test PostgreSQL connectivity
      await prisma.$queryRaw`SELECT 1 as ping`;
      const dbLatency = Date.now() - dbPingStart;

      dbHealth = {
        status: "connected",
        latencyMs: dbLatency,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Database connection failed";
      dbHealth = {
        status: "disconnected",
        error: errorMessage,
        details: "Unable to reach PostgreSQL. Verify credentials and network access.",
      };
    }
  }

  const isFullyHealthy = dbHealth.status === "connected";
  const overallStatus = isFullyHealthy
    ? "healthy"
    : dbHealth.status === "not_configured"
    ? "ready_for_database"
    : "degraded";

  // Return HTTP 200 for healthy or initial unconfigured state; HTTP 503 when configured DB connection fails
  const statusCode = dbHealth.status === "disconnected" ? 503 : 200;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      responseTimeMs: Date.now() - startTime,
      environment: process.env.NODE_ENV || "development",
      services: {
        server: {
          status: "healthy",
          framework: "Next.js App Router",
          nodeVersion: process.version,
        },
        database: dbHealth,
      },
      meta: {
        project: "OneAtlas",
        phase: "Phase 2 - Relational database design and sample data",
      },
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
