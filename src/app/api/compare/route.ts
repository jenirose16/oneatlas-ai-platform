import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { compareQuerySchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  handleApiError,
  formatDecimal,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const { ids } = compareQuerySchema.parse(rawParams);

    // Query all requested models by id or slug
    const models = await prisma.model.findMany({
      where: {
        OR: [{ id: { in: ids } }, { slug: { in: ids.map((s) => s.toLowerCase()) } }],
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: true,
          },
        },
        providers: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                slug: true,
                website: true,
              },
            },
          },
          orderBy: {
            inputPrice: "asc",
          },
        },
        benchmarkScores: {
          include: {
            benchmark: {
              select: {
                id: true,
                name: true,
                slug: true,
                category: true,
              },
            },
          },
          orderBy: {
            score: "desc",
          },
        },
      },
    });

    // Check if any identifier failed to match
    const foundIdentifiers = new Set<string>();
    models.forEach((m) => {
      foundIdentifiers.add(m.id);
      foundIdentifiers.add(m.slug.toLowerCase());
    });

    const missing = ids.filter(
      (id) =>
        !foundIdentifiers.has(id) && !foundIdentifiers.has(id.toLowerCase())
    );

    if (missing.length > 0) {
      return errorResponse(
        `The following model identifiers were not found: [${missing.join(", ")}]`,
        404,
        { missingIdentifiers: missing },
        "MODELS_NOT_FOUND"
      );
    }

    // Preserve the exact request order of compared models
    const modelLookup = new Map<string, (typeof models)[0]>();
    models.forEach((m) => {
      modelLookup.set(m.id, m);
      modelLookup.set(m.slug.toLowerCase(), m);
    });

    const orderedModels = ids
      .map((id) => modelLookup.get(id) || modelLookup.get(id.toLowerCase()))
      .filter((m): m is (typeof models)[0] => Boolean(m));

    // Structure comparison response
    const comparedModels = orderedModels.map((m) => {
      const providersFormatted = m.providers.map((mp) => ({
        providerId: mp.provider.id,
        providerName: mp.provider.name,
        providerSlug: mp.provider.slug,
        inputPrice: formatDecimal(mp.inputPrice),
        outputPrice: formatDecimal(mp.outputPrice),
        currency: "USD",
        pricingUnit: "per_million_tokens",
        isAvailable: mp.isAvailable,
      }));

      const inputPrices = providersFormatted
        .map((p) => p.inputPrice)
        .filter((p): p is number => p !== null);
      const minInputPrice =
        inputPrices.length > 0 ? Math.min(...inputPrices) : null;

      const outputPrices = providersFormatted
        .map((p) => p.outputPrice)
        .filter((p): p is number => p !== null);
      const minOutputPrice =
        outputPrices.length > 0 ? Math.min(...outputPrices) : null;

      const benchmarkScoresFormatted = m.benchmarkScores.map((bs) => ({
        benchmarkId: bs.benchmark.id,
        benchmarkName: bs.benchmark.name,
        benchmarkSlug: bs.benchmark.slug,
        category: bs.benchmark.category,
        score: formatDecimal(bs.score),
      }));

      return {
        id: m.id,
        name: m.name,
        slug: m.slug,
        description: m.description,
        company: m.company,
        contextWindow: m.contextWindow,
        modelType: m.modelType,
        capabilities: m.capabilities,
        releaseDate: m.releaseDate,
        pricingSummary: {
          currency: "USD",
          unit: "per_million_tokens",
          lowestInputPrice: minInputPrice,
          lowestOutputPrice: minOutputPrice,
          availableProvidersCount: providersFormatted.length,
        },
        providers: providersFormatted,
        benchmarkScores: benchmarkScoresFormatted,
      };
    });

    // Compile side-by-side benchmark comparison matrix
    const allBenchmarkSlugs = new Set<string>();
    orderedModels.forEach((m) => {
      m.benchmarkScores.forEach((bs) => allBenchmarkSlugs.add(bs.benchmark.slug));
    });

    const benchmarkMatrix = Array.from(allBenchmarkSlugs).map((bSlug) => {
      let bName = bSlug;
      let bCategory = "General";

      const modelScores: Record<string, number | null> = {};
      orderedModels.forEach((m) => {
        const match = m.benchmarkScores.find((bs) => bs.benchmark.slug === bSlug);
        if (match) {
          bName = match.benchmark.name;
          bCategory = match.benchmark.category;
          modelScores[m.slug] = formatDecimal(match.score);
        } else {
          modelScores[m.slug] = null;
        }
      });

      return {
        benchmarkSlug: bSlug,
        benchmarkName: bName,
        category: bCategory,
        scoresByModel: modelScores,
      };
    });

    return successResponse(
      {
        comparedCount: comparedModels.length,
        models: comparedModels,
        benchmarkComparisonMatrix: benchmarkMatrix,
      },
      {
        comparisonTimestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
