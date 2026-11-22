import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { modelQuerySchema } from "@/lib/validations";
import {
  successResponse,
  handleApiError,
  formatDecimal,
  PaginationMeta,
} from "@/lib/api-response";
import { Prisma } from "@prisma/client";

type ModelWithDetails = Prisma.ModelGetPayload<{
  include: {
    company: {
      select: { id: true; name: true; slug: true; website: true };
    };
    providers: {
      include: {
        provider: {
          select: { id: true; name: true; slug: true };
        };
      };
    };
    benchmarkScores: {
      include: {
        benchmark: {
          select: { id: true; name: true; slug: true; category: true };
        };
      };
    };
  };
}>;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const query = modelQuerySchema.parse(rawParams);

    const {
      search,
      company,
      provider,
      capability,
      modelType,
      sortBy,
      sortOrder,
      page,
      limit,
    } = query;

    const skip = (page - 1) * limit;

    // Construct database-level filtering
    const where: Prisma.ModelWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (company) {
      where.company = {
        OR: [
          { slug: { equals: company, mode: "insensitive" } },
          { id: company },
        ],
      };
    }

    if (provider) {
      where.providers = {
        some: {
          provider: {
            OR: [
              { slug: { equals: provider, mode: "insensitive" } },
              { id: provider },
            ],
          },
        },
      };
    }

    if (capability) {
      where.capabilities = {
        has: capability.toLowerCase(),
      };
    }

    if (modelType) {
      where.modelType = {
        equals: modelType,
        mode: "insensitive",
      };
    }

    const totalCount = await prisma.model.count({ where });

    let models: ModelWithDetails[] = [];

    if (sortBy === "inputPrice") {
      // Database-level sorting by minimum provider input price
      const orderDirection =
        sortOrder.toUpperCase() === "ASC"
          ? Prisma.sql`ASC`
          : Prisma.sql`DESC`;
      const searchPattern = search ? `%${search}%` : null;

      const orderedRows = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT m.id
        FROM models m
        LEFT JOIN model_providers mp ON mp."modelId" = m.id
        LEFT JOIN companies c ON m."companyId" = c.id
        LEFT JOIN providers p ON mp."providerId" = p.id
        WHERE 1=1
        ${
          search
            ? Prisma.sql`AND (m.name ILIKE ${searchPattern} OR m.description ILIKE ${searchPattern})`
            : Prisma.empty
        }
        ${
          company
            ? Prisma.sql`AND (c.slug ILIKE ${company} OR c.id = ${company})`
            : Prisma.empty
        }
        ${
          provider
            ? Prisma.sql`AND (p.slug ILIKE ${provider} OR p.id = ${provider})`
            : Prisma.empty
        }
        ${
          capability
            ? Prisma.sql`AND ${capability.toLowerCase()} = ANY(m.capabilities)`
            : Prisma.empty
        }
        ${
          modelType
            ? Prisma.sql`AND m."modelType" ILIKE ${modelType}`
            : Prisma.empty
        }
        GROUP BY m.id
        ORDER BY MIN(mp."inputPrice") ${orderDirection} NULLS LAST, m.id ASC
        OFFSET ${skip}
        LIMIT ${limit};
      `;

      const ids = orderedRows.map((r) => r.id);

      if (ids.length === 0) {
        models = [];
      } else {
        const fetched = await prisma.model.findMany({
          where: { id: { in: ids } },
          include: {
            company: {
              select: { id: true, name: true, slug: true, website: true },
            },
            providers: {
              include: {
                provider: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
            benchmarkScores: {
              include: {
                benchmark: {
                  select: { id: true, name: true, slug: true, category: true },
                },
              },
            },
          },
        });

        // Preserve PostgreSQL ID order
        const idMap = new Map(fetched.map((m) => [m.id, m]));
        models = ids.map((id) => idMap.get(id)!).filter(Boolean);
      }
    } else {
      // Standard Prisma orderBy with stable secondary sort
      const orderBy: Prisma.ModelOrderByWithRelationInput[] = [
        { [sortBy]: sortOrder },
        { id: "asc" },
      ];

      models = await prisma.model.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          company: {
            select: { id: true, name: true, slug: true, website: true },
          },
          providers: {
            include: {
              provider: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
          benchmarkScores: {
            include: {
              benchmark: {
                select: { id: true, name: true, slug: true, category: true },
              },
            },
          },
        },
      });
    }

    // Transform and serialize Decimal values to JSON-safe numbers
    const formattedData = models.map((model) => {
      const providersFormatted = model.providers.map((mp) => ({
        id: mp.id,
        providerId: mp.provider.id,
        providerName: mp.provider.name,
        providerSlug: mp.provider.slug,
        inputPrice: formatDecimal(mp.inputPrice),
        outputPrice: formatDecimal(mp.outputPrice),
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

      const benchmarkScoresFormatted = model.benchmarkScores.map((bs) => ({
        id: bs.id,
        benchmarkId: bs.benchmark.id,
        benchmarkName: bs.benchmark.name,
        benchmarkSlug: bs.benchmark.slug,
        category: bs.benchmark.category,
        score: formatDecimal(bs.score),
      }));

      return {
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
        pricing: {
          currency: "USD",
          unit: "per_million_tokens",
          minInputPrice,
          minOutputPrice,
          providersCount: providersFormatted.length,
        },
        providers: providersFormatted,
        benchmarkScores: benchmarkScoresFormatted,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);
    const meta: PaginationMeta = {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return successResponse(formattedData, meta);
  } catch (error) {
    return handleApiError(error);
  }
}
