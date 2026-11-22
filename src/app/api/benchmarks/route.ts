import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    const benchmarks = await prisma.benchmark.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { scores: true },
        },
      },
    });

    const formatted = benchmarks.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      category: b.category,
      description: b.description,
      evaluatedModelsCount: b._count.scores,
    }));

    return successResponse(formatted, { totalCount: formatted.length });
  } catch (error) {
    return handleApiError(error);
  }
}
