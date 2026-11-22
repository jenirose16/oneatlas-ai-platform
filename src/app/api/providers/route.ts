import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { modelProviders: true },
        },
      },
    });

    const formatted = providers.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      website: p.website,
      modelCount: p._count.modelProviders,
      createdAt: p.createdAt,
    }));

    return successResponse(formatted, { totalCount: formatted.length });
  } catch (error) {
    return handleApiError(error);
  }
}
