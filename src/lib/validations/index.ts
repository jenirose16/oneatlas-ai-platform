import { z } from "zod";

/**
 * Validation schema for GET /api/models query parameters
 */
export const modelQuerySchema = z.object({
  search: z.string().trim().optional(),
  company: z.string().trim().optional(),
  provider: z.string().trim().optional(),
  capability: z.string().trim().optional(),
  modelType: z.string().trim().optional(),
  sortBy: z
    .enum(["releaseDate", "contextWindow", "inputPrice", "name"])
    .default("releaseDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ModelQueryParams = z.infer<typeof modelQuerySchema>;

/**
 * Validation schema for GET /api/rankings query parameters
 */
export const rankingsQuerySchema = z.object({
  benchmark: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type RankingsQueryParams = z.infer<typeof rankingsQuerySchema>;

/**
 * Validation schema for GET /api/compare query parameters
 */
export const compareQuerySchema = z.object({
  ids: z
    .string()
    .min(1, "Parameter 'ids' cannot be empty (e.g. ?ids=id1,id2)")
    .transform((val) =>
      val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
    .refine((arr) => arr.length >= 2, {
      message: "At least 2 model identifiers are required for comparison (e.g. ?ids=id1,id2)",
    })
    .refine((arr) => arr.length <= 4, {
      message: "At most 4 model identifiers can be compared at once",
    })
    .refine((arr) => new Set(arr).size === arr.length, {
      message: "Duplicate model identifiers provided for comparison",
    }),
});

export type CompareQueryParams = z.infer<typeof compareQuerySchema>;
