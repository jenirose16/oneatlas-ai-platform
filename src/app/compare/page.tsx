"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ComparisonData, ModelListItem } from "@/types/api";

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialIds = (searchParams.get("ids") || "gpt-4o,claude-3-5-sonnet")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const [allModels, setAllModels] = useState<ModelListItem[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialIds);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch model options for dropdown
  useEffect(() => {
    fetch("/api/models?limit=50&sortBy=name&sortOrder=asc")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setAllModels(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch comparison data when selectedSlugs changes
  useEffect(() => {
    if (selectedSlugs.length < 2) {
      setComparison(null);
      setError(null);
      return;
    }

    if (selectedSlugs.length > 4) {
      setError("At most 4 models can be compared simultaneously.");
      return;
    }

    setLoading(true);
    setError(null);

    const queryIds = selectedSlugs.join(",");
    router.replace(`/compare?ids=${queryIds}`, { scroll: false });

    fetch(`/api/compare?ids=${encodeURIComponent(queryIds)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setComparison(json.data);
        } else {
          setError(json.error?.message || "Failed to compare selected models.");
        }
      })
      .catch(() => {
        setError("Network error while connecting to comparison API.");
      })
      .finally(() => setLoading(false));
  }, [selectedSlugs, router]);

  const toggleModel = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      if (selectedSlugs.length <= 2) {
        alert("You must have at least 2 models to compare.");
        return;
      }
      setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
    } else {
      if (selectedSlugs.length >= 4) {
        alert("You can compare a maximum of 4 models at once.");
        return;
      }
      setSelectedSlugs([...selectedSlugs, slug]);
    }
  };

  const loadPreset = (presetSlugs: string[]) => {
    setSelectedSlugs(presetSlugs);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Description */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Model Comparison Matrix
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Perform side-by-side technical evaluation of specifications, token economics, and empirical benchmark scores.
        </p>
      </div>

      {/* Model Selector Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-semibold text-white">
            Selected Models ({selectedSlugs.length}/4):
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Presets:</span>
            <button
              onClick={() => loadPreset(["gpt-4o", "claude-3-5-sonnet"])}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              GPT-4o vs Claude 3.5 Sonnet
            </button>
            <button
              onClick={() => loadPreset(["gpt-4o-mini", "claude-3-5-haiku", "gemini-1-5-flash"])}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Mini/Flash Battle (3)
            </button>
            <button
              onClick={() => loadPreset(["o1", "claude-3-5-sonnet", "llama-3-1-405b", "mistral-large-2"])}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Frontier Labs (4)
            </button>
          </div>
        </div>

        {/* Selected Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedSlugs.map((slug) => {
            const m = allModels.find((model) => model.slug === slug);
            return (
              <span
                key={slug}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium"
              >
                {m?.name || slug}
                <button
                  type="button"
                  onClick={() => toggleModel(slug)}
                  title="Remove from comparison"
                  className="hover:text-white"
                >
                  ✕
                </button>
              </span>
            );
          })}

          {/* Quick Model Selector Dropdown */}
          {selectedSlugs.length < 4 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) toggleModel(e.target.value);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 outline-none focus:border-blue-500"
            >
              <option value="">+ Add Model to Compare...</option>
              {allModels
                .filter((m) => !selectedSlugs.includes(m.slug))
                .map((m) => (
                  <option key={m.id} value={m.slug}>
                    {m.name} ({m.company.name})
                  </option>
                ))}
            </select>
          )}
        </div>
      </div>

      {/* Comparison Display */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          Generating side-by-side comparison matrix...
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-slate-900 border border-red-500/20 rounded-xl space-y-2">
          <div className="text-red-400 font-semibold text-sm">Comparison Error</div>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      ) : !comparison || comparison.models.length < 2 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <h2 className="text-base font-semibold text-white">Select at least 2 models</h2>
          <p className="text-xs text-slate-400">
            Choose between 2 and 4 models from the selector above to compare their specifications.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs divide-y divide-slate-800/80">
              {/* Header: Model Names */}
              <thead className="bg-slate-950 font-mono">
                <tr>
                  <th className="py-4 px-4 w-48 text-slate-400">Metric / Feature</th>
                  {comparison.models.map((m) => (
                    <th key={m.id} className="py-4 px-4 font-bold text-white text-sm">
                      <Link
                        href={`/models/${m.slug}`}
                        className="hover:text-blue-400 transition-colors"
                      >
                        {m.name} ↗
                      </Link>
                      <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                        {m.company.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/80">
                {/* Architecture Type */}
                <tr className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-semibold text-slate-400">Model Type</td>
                  {comparison.models.map((m) => (
                    <td key={m.id} className="py-3 px-4 uppercase font-mono text-slate-300">
                      {m.modelType}
                    </td>
                  ))}
                </tr>

                {/* Context Window */}
                <tr className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-semibold text-slate-400">Context Window</td>
                  {comparison.models.map((m) => (
                    <td key={m.id} className="py-3 px-4 font-bold font-mono text-white">
                      {m.contextWindow.toLocaleString()} tokens
                    </td>
                  ))}
                </tr>

                {/* Lowest Input Pricing */}
                <tr className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-semibold text-slate-400">Lowest Input Price</td>
                  {comparison.models.map((m) => (
                    <td key={m.id} className="py-3 px-4 font-mono font-medium text-emerald-400">
                      {m.pricingSummary.lowestInputPrice !== null
                        ? `$${m.pricingSummary.lowestInputPrice.toFixed(4)} / 1M`
                        : "N/A"}
                    </td>
                  ))}
                </tr>

                {/* Lowest Output Pricing */}
                <tr className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-semibold text-slate-400">Lowest Output Price</td>
                  {comparison.models.map((m) => (
                    <td key={m.id} className="py-3 px-4 font-mono font-medium text-emerald-400">
                      {m.pricingSummary.lowestOutputPrice !== null
                        ? `$${m.pricingSummary.lowestOutputPrice.toFixed(4)} / 1M`
                        : "N/A"}
                    </td>
                  ))}
                </tr>

                {/* Available Providers Count */}
                <tr className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-semibold text-slate-400">Available Providers</td>
                  {comparison.models.map((m) => (
                    <td key={m.id} className="py-3 px-4 text-slate-300">
                      {m.pricingSummary.availableProvidersCount} providers registered
                    </td>
                  ))}
                </tr>

                {/* Capabilities */}
                <tr className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-semibold text-slate-400">Capabilities</td>
                  {comparison.models.map((m) => (
                    <td key={m.id} className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {m.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="text-[10px] font-mono bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Benchmark Score Matrix */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Empirical Benchmark Comparison Matrix
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs divide-y divide-slate-800/80">
                <thead className="bg-slate-950 font-mono">
                  <tr>
                    <th className="py-3 px-4 w-48 text-slate-400">Benchmark</th>
                    <th className="py-3 px-4 text-slate-400">Category</th>
                    {comparison.models.map((m) => (
                      <th key={m.id} className="py-3 px-4 font-bold text-white">
                        {m.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {comparison.benchmarkComparisonMatrix.map((bm) => (
                    <tr key={bm.benchmarkSlug} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {bm.benchmarkName}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {bm.category}
                      </td>
                      {comparison.models.map((m) => {
                        const score = bm.scoresByModel[m.slug];
                        return (
                          <td key={m.id} className="py-3 px-4 font-mono font-bold">
                            {score !== null && score !== undefined ? (
                              <span className="text-blue-400">{score}%</span>
                            ) : (
                              <span className="text-slate-600 font-normal">Not Tested</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-slate-400 text-center">
          Loading Model Comparison...
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
