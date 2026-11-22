import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function formatDecimal(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (val instanceof Prisma.Decimal) return val.toNumber();
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  }
  return null;
}

export function successResponse<T>(
  data: T,
  meta?: PaginationMeta | Record<string, unknown>,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  status: number = 400,
  details?: unknown,
  code?: string
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code:
          code ??
          (status === 404
            ? "NOT_FOUND"
            : status === 400
            ? "BAD_REQUEST"
            : "INTERNAL_SERVER_ERROR"),
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

export function handleApiError(error: unknown) {
  // Allow Next.js internal dynamic bailout errors to propagate during build prerendering
  if (
    error &&
    typeof error === "object" &&
    (("digest" in error &&
      typeof (error as { digest: unknown }).digest === "string" &&
      (error as { digest: string }).digest.includes("DYNAMIC_SERVER_USAGE")) ||
      ("name" in error && (error as { name: unknown }).name === "DynamicServerError") ||
      ("message" in error &&
        typeof (error as Error).message === "string" &&
        (error as Error).message.includes("bail out of prerendering")))
  ) {
    throw error;
  }

  if (error instanceof ZodError) {
    const formatted = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return errorResponse(
      "Invalid request query parameters",
      400,
      formatted,
      "VALIDATION_ERROR"
    );
  }

  // Never expose database credentials, SQL details or raw stack traces in responses
  console.error(
    "[API Internal Error]:",
    error instanceof Error ? error.message : error
  );

  return errorResponse(
    "An unexpected server error occurred. Please try again later.",
    500,
    undefined,
    "INTERNAL_SERVER_ERROR"
  );
}
