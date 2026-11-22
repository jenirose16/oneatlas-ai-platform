"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ModelListItem, CompanySummary, PaginationMeta } from "@/types/api";

function ModelExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const search = searchParams.get("search") || "";
  const company = searchParams.get("company") || "";
  const capability = searchParams.get("capability") || "";
  const modelType = searchParams.get("modelType") || "";
  const sortBy = searchParams.get("sortBy") || "releaseDate";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Local state
  const [searchInput, setSearchInput] = useState(search);
  const [models, setModels] = useState<ModelListItem[]>([]);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync search input when URL changes
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Fetch companies for dropdown
  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setCompanies(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch models from API
  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (company) params.set("company", company);
    if (capability) params.set("capability", capability);
    if (modelType) params.set("modelType", modelType);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    params.set("page", page.toString());
    params.set("limit", "9");

    try {
      const res = await fetch(`/api/models?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setModels(json.data);
        setMeta(json.meta as PaginationMeta);
      } else {
        setError(json.error?.message || "Failed to load models");
      }
    } catch {
      setError("Network error while connecting to OneAtlas API.");
    } finally {
      setLoading(false);
    }
  }, [search, company, capability, modelType, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // Update URL search parameters
  const updateQuery = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === undefined) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    // Reset to page 1 unless navigating page
    if (!("page" in updates)) {
      nextParams.delete("page");
    }

    router.push(`/models?${nextParams.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ search: searchInput });
  };

  const clearFilters = () => {
    setSearchInput("");
    router.push("/models");
  };

  const capabilitiesList = ["vision", "code", "reasoning", "audio", "function_calling", "multilingual"];
  const modelTypesList = ["multimodal", "text-only", "reasoning", "code"];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Model Explorer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover, filter, and inspect specifications powered by our PostgreSQL discovery API.
          </p>
        </div>

        <Link
          href="/compare"
          className="inline-flex items-center self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
        >
          Compare Models →
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        {/* Search Input Row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by model name or keywords (e.g., Claude, Llama, Reasoning)..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateQuery({ search: null });
                }}
                className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Company Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Company</label>
            <select
              value={company}
              onChange={(e) => updateQuery({ company: e.target.value || null })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name} ({c.modelCount})
                </option>
              ))}
            </select>
          </div>

          {/* Model Type Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Architecture Type</label>
            <select
              value={modelType}
              onChange={(e) => updateQuery({ modelType: e.target.value || null })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="">All Types</option>
              {modelTypesList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Capability Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Required Capability</label>
            <select
              value={capability}
              onChange={(e) => updateQuery({ capability: e.target.value || null })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="">Any Capability</option>
              {capabilitiesList.map((cap) => (
                <option key={cap} value={cap}>
                  {cap}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Field */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Sort By</label>
            <div className="flex gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => updateQuery({ sortBy: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
              >
                <option value="releaseDate">Release Date</option>
                <option value="contextWindow">Context Window</option>
                <option value="inputPrice">Input Price</option>
                <option value="name">Model Name</option>
              </select>
              <button
                type="button"
                onClick={() => updateQuery({ sortOrder: sortOrder === "asc" ? "desc" : "asc" })}
                title={`Order: ${sortOrder.toUpperCase()}`}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-mono text-slate-300"
              >
                {sortOrder === "asc" ? "↑ ASC" : "↓ DESC"}
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Tags */}
        {(search || company || capability || modelType) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Active Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[11px]">
                Search: &quot;{search}&quot;
                <button onClick={() => updateQuery({ search: null })}>✕</button>
              </span>
            )}
            {company && (
              <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[11px]">
                Company: {company}
                <button onClick={() => updateQuery({ company: null })}>✕</button>
              </span>
            )}
            {modelType && (
              <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[11px]">
                Type: {modelType}
                <button onClick={() => updateQuery({ modelType: null })}>✕</button>
              </span>
            )}
            {capability && (
              <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[11px]">
                Capability: {capability}
                <button onClick={() => updateQuery({ capability: null })}>✕</button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-slate-400 hover:text-white underline ml-auto"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-56 bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-full" />
              </div>
              <div className="h-4 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-slate-900 border border-red-500/20 rounded-xl space-y-3">
          <div className="text-red-400 text-lg">⚠️ Error Loading Models</div>
          <p className="text-sm text-slate-400">{error}</p>
          <button
            onClick={fetchModels}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg transition"
          >
            Retry Request
          </button>
        </div>
      ) : models.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="text-3xl">🔍</div>
          <h2 className="text-base font-semibold text-white">No Matching Models Found</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No models in PostgreSQL matched your search and filter criteria. Try adjusting your parameters.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white rounded-lg transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <Link
                key={model.id}
                href={`/models/${model.slug}`}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Company & Model Type Badge */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {model.company.name}
                    </span>
                    <span className="font-mono text-slate-500 uppercase text-[10px]">
                      {model.modelType}
                    </span>
                  </div>

                  {/* Model Name & Description */}
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                      {model.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {model.description}
                    </p>
                  </div>

                  {/* Capabilities Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {model.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Context: </span>
                    <span className="font-mono text-slate-300">
                      {(model.contextWindow / 1000).toLocaleString()}k tokens
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-500">Min Price: </span>
                    <span className="font-mono text-emerald-400 font-medium">
                      {model.pricing.minInputPrice !== null
                        ? `$${model.pricing.minInputPrice}/1M`
                        : "Free"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div>
                Showing page <strong className="text-slate-200">{meta.page}</strong> of{" "}
                <strong className="text-slate-200">{meta.totalPages}</strong> ({meta.totalCount} total models)
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!meta.hasPreviousPage}
                  onClick={() => updateQuery({ page: (meta.page - 1).toString() })}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:hover:border-slate-800 text-slate-200 transition"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  disabled={!meta.hasNextPage}
                  onClick={() => updateQuery({ page: (meta.page + 1).toString() })}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:hover:border-slate-800 text-slate-200 transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ModelExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-slate-400 text-center">
          Loading AI Model Explorer...
        </div>
      }
    >
      <ModelExplorerContent />
    </Suspense>
  );
}
