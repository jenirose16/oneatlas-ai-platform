import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  handleApiError,
  formatDecimal,
} from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id.trim() === "") {
      return errorResponse("Model identifier is required.", 400);
    }

    // Lookup model by either CUID id or URL slug
    const model = await prisma.model.findFirst({
      where: {
        OR: [{ id: id }, { slug: id.toLowerCase() }],
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
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
                description: true,
              },
            },
          },
          orderBy: {
            score: "desc",
          },
        },
      },
    });

    if (!model) {
      return errorResponse(
        `AI Model with identifier '${id}' was not found.`,
        404,
        undefined,
        "MODEL_NOT_FOUND"
      );
    }

    const providersFormatted = model.providers.map((mp) => ({
      id: mp.id,
      providerId: mp.provider.id,
      providerName: mp.provider.name,
      providerSlug: mp.provider.slug,
      providerWebsite: mp.provider.website,
      inputPrice: formatDecimal(mp.inputPrice),
      outputPrice: formatDecimal(mp.outputPrice),
      currency: "USD",
      pricingUnit: "per_million_tokens",
      isAvailable: mp.isAvailable,
      updatedAt: mp.updatedAt,
    }));

    const benchmarkScoresFormatted = model.benchmarkScores.map((bs) => ({
      id: bs.id,
      benchmarkId: bs.benchmark.id,
      benchmarkName: bs.benchmark.name,
      benchmarkSlug: bs.benchmark.slug,
      category: bs.benchmark.category,
      benchmarkDescription: bs.benchmark.description,
      score: formatDecimal(bs.score),
      evaluatedAt: bs.evaluatedAt,
    }));

    const formattedModel = {
      id: model.id,
      name: model.name,
      slug: model.slug,
      description: model.description,
      company: model.company,
      contextWindow: model.contextWindow,
      modelType: model.modelType,
      capabilities: model.capabilities,
      releaseDate: model.releaseDate,
      createdAt: model.createdAt,
      providers: providersFormatted,
      benchmarkScores: benchmarkScoresFormatted,
    };

    return successResponse(formattedModel);
  } catch (error) {
    return handleApiError(error);
  }
}
