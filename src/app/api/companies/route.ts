import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { models: true },
        },
      },
    });

    const formatted = companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      website: c.website,
      modelCount: c._count.models,
      createdAt: c.createdAt,
    }));

    return successResponse(formatted, { totalCount: formatted.length });
  } catch (error) {
    return handleApiError(error);
  }
}
