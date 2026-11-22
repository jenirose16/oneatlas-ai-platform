import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { rankingsQuerySchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  handleApiError,
  formatDecimal,
} from "@/lib/api-response";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const query = rankingsQuerySchema.parse(rawParams);

    const { benchmark, limit } = query;

    const where: Prisma.BenchmarkScoreWhereInput = {};

    let selectedBenchmark = null;
    if (benchmark) {
      selectedBenchmark = await prisma.benchmark.findFirst({
        where: {
          OR: [{ slug: benchmark.toLowerCase() }, { id: benchmark }],
        },
      });

      if (!selectedBenchmark) {
        return errorResponse(
          `Benchmark with identifier '${benchmark}' was not found.`,
          404,
          undefined,
          "BENCHMARK_NOT_FOUND"
        );
      }

      where.benchmarkId = selectedBenchmark.id;
    }

    const scores = await prisma.benchmarkScore.findMany({
      where,
      orderBy: [{ score: "desc" }, { evaluatedAt: "desc" }],
      take: limit,
      include: {
        model: {
          select: {
            id: true,
            name: true,
            slug: true,
            modelType: true,
            contextWindow: true,
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        benchmark: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
          },
        },
      },
    });

    const rankings = scores.map((item, index) => ({
      rank: index + 1,
      score: formatDecimal(item.score),
      evaluatedAt: item.evaluatedAt,
      model: item.model,
      benchmark: item.benchmark,
    }));

    return successResponse(rankings, {
      totalCount: rankings.length,
      filter: selectedBenchmark
        ? {
            benchmarkId: selectedBenchmark.id,
            benchmarkName: selectedBenchmark.name,
            benchmarkSlug: selectedBenchmark.slug,
            category: selectedBenchmark.category,
          }
        : "all_benchmarks",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
