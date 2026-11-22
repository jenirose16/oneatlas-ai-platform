/**
 * OneAtlas - Frontend & API TypeScript Type Definitions
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface CompanySummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  website?: string | null;
  modelCount?: number;
}

export interface ProviderSummary {
  id: string;
  name: string;
  slug: string;
  website?: string | null;
  modelCount?: number;
}

export interface ModelProviderPricing {
  id: string;
  providerId: string;
  providerName: string;
  providerSlug: string;
  providerWebsite?: string | null;
  inputPrice: number | null;
  outputPrice: number | null;
  currency?: string;
  pricingUnit?: string;
  isAvailable: boolean;
  updatedAt?: string;
}

export interface BenchmarkScoreSummary {
  id: string;
  benchmarkId: string;
  benchmarkName: string;
  benchmarkSlug: string;
  category: string;
  benchmarkDescription?: string | null;
  score: number | null;
  evaluatedAt?: string;
}

export interface ModelListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    website?: string | null;
  };
  contextWindow: number;
  modelType: string;
  capabilities: string[];
  releaseDate: string | null;
  createdAt: string;
  pricing: {
    currency: string;
    unit: string;
    minInputPrice: number | null;
    minOutputPrice: number | null;
    providersCount: number;
  };
  providers: ModelProviderPricing[];
  benchmarkScores: BenchmarkScoreSummary[];
}

export interface ModelDetailItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    website?: string | null;
  };
  contextWindow: number;
  modelType: string;
  capabilities: string[];
  releaseDate: string | null;
  createdAt: string;
  providers: ModelProviderPricing[];
  benchmarkScores: BenchmarkScoreSummary[];
}

export interface BenchmarkItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  evaluatedModelsCount: number;
}

export interface RankingItem {
  rank: number;
  score: number;
  evaluatedAt: string;
  model: {
    id: string;
    name: string;
    slug: string;
    modelType: string;
    contextWindow: number;
    company: {
      id: string;
      name: string;
      slug: string;
    };
  };
  benchmark: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
}

export interface ComparisonMatrixRow {
  benchmarkSlug: string;
  benchmarkName: string;
  category: string;
  scoresByModel: Record<string, number | null>;
}

export interface ComparisonData {
  comparedCount: number;
  models: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    company: {
      id: string;
      name: string;
      slug: string;
      website?: string | null;
    };
    contextWindow: number;
    modelType: string;
    capabilities: string[];
    releaseDate: string | null;
    pricingSummary: {
      currency: string;
      unit: string;
      lowestInputPrice: number | null;
      lowestOutputPrice: number | null;
      availableProvidersCount: number;
    };
    providers: ModelProviderPricing[];
    benchmarkScores: BenchmarkScoreSummary[];
  }>;
  benchmarkComparisonMatrix: ComparisonMatrixRow[];
}
