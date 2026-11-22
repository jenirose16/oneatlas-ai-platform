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
      return errorResponse("Provider identifier is required.", 400);
    }

    // Lookup provider by CUID id or URL slug
    const provider = await prisma.provider.findFirst({
      where: {
        OR: [{ id: id }, { slug: id.toLowerCase() }],
      },
      include: {
        modelProviders: {
          include: {
            model: {
              include: {
                company: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
          orderBy: {
            inputPrice: "asc",
          },
        },
      },
    });

    if (!provider) {
      return errorResponse(
        `API Provider with identifier '${id}' was not found.`,
        404,
        undefined,
        "PROVIDER_NOT_FOUND"
      );
    }

    const modelsFormatted = provider.modelProviders.map((mp) => ({
      modelId: mp.model.id,
      name: mp.model.name,
      slug: mp.model.slug,
      description: mp.model.description,
      company: mp.model.company,
      contextWindow: mp.model.contextWindow,
      modelType: mp.model.modelType,
      capabilities: mp.model.capabilities,
      releaseDate: mp.model.releaseDate,
      pricing: {
        currency: "USD",
        unit: "per_million_tokens",
        inputPrice: formatDecimal(mp.inputPrice),
        outputPrice: formatDecimal(mp.outputPrice),
      },
      isAvailable: mp.isAvailable,
      updatedAt: mp.updatedAt,
    }));

    return successResponse(
      {
        provider: {
          id: provider.id,
          name: provider.name,
          slug: provider.slug,
          website: provider.website,
        },
        models: modelsFormatted,
      },
      { totalCount: modelsFormatted.length }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
