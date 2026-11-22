"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BenchmarkItem, RankingItem } from "@/types/api";

function RankingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedBenchmark = searchParams.get("benchmark") || "";

  const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch benchmark definitions
  useEffect(() => {
    fetch("/api/benchmarks")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setBenchmarks(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch rankings
  useEffect(() => {
    setLoading(true);
    setError(null);

    const endpoint = selectedBenchmark
      ? `/api/rankings?benchmark=${encodeURIComponent(selectedBenchmark)}&limit=50`
      : `/api/rankings?limit=50`;

    fetch(endpoint)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setRankings(json.data);
        } else {
          setError(json.error?.message || "Failed to load rankings.");
        }
      })
      .catch(() => {
        setError("Network error while connecting to rankings API.");
      })
      .finally(() => setLoading(false));
  }, [selectedBenchmark]);

  const handleBenchmarkSelect = (slug: string) => {
    if (slug) {
      router.push(`/rankings?benchmark=${slug}`);
    } else {
      router.push("/rankings");
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-amber-400 font-bold">🥇 1</span>;
    if (rank === 2) return <span className="text-slate-300 font-bold">🥈 2</span>;
    if (rank === 3) return <span className="text-amber-600 font-bold">🥉 3</span>;
    return <span className="text-slate-400 font-mono">#{rank}</span>;
  };

  const activeBenchmarkInfo = benchmarks.find((b) => b.slug === selectedBenchmark);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Description */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Benchmark Leaderboard &amp; Rankings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore empirical evaluation performance across standardized AI benchmarks.
        </p>
      </div>

      {/* Benchmark Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleBenchmarkSelect("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedBenchmark === ""
              ? "bg-blue-600 text-white font-semibold"
              : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
          }`}
        >
          All Benchmarks
        </button>

        {benchmarks.map((b) => (
          <button
            key={b.id}
            onClick={() => handleBenchmarkSelect(b.slug)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedBenchmark === b.slug
                ? "bg-blue-600 text-white font-semibold"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {b.name.split("(")[0].trim()} ({b.evaluatedModelsCount})
          </button>
        ))}
      </div>

      {/* Active Benchmark Details (if filtered) */}
      {activeBenchmarkInfo && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">{activeBenchmarkInfo.name}</span>
            <span className="text-slate-400 font-mono">Category: {activeBenchmarkInfo.category}</span>
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            {activeBenchmarkInfo.description}
          </p>
        </div>
      )}

      {/* Rankings Leaderboard Table */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">Loading benchmark rankings...</div>
      ) : error ? (
        <div className="p-8 text-center bg-slate-900 border border-red-500/20 rounded-xl space-y-2">
          <div className="text-red-400 font-semibold text-sm">Error Loading Rankings</div>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      ) : rankings.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-sm text-slate-400">No evaluations found for this benchmark.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs divide-y divide-slate-800/80">
            <thead className="bg-slate-950 text-slate-400 font-mono">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">Research Lab</th>
                <th className="py-3 px-4">Benchmark Suite</th>
                <th className="py-3 px-4 w-48">Score</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {rankings.map((item) => (
                <tr key={`${item.model.id}-${item.benchmark.id}`} className="hover:bg-slate-850/50 transition">
                  <td className="py-3.5 px-4 text-center font-bold">
                    {getRankBadge(item.rank)}
                  </td>
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/models/${item.model.slug}`}
                      className="font-bold text-white hover:text-blue-400 transition"
                    >
                      {item.model.name}
                    </Link>
                    <div className="text-[11px] font-mono text-slate-500 uppercase">
                      {item.model.modelType}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-medium text-slate-300">
                      {item.model.company.name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">
                      {item.benchmark.name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {item.benchmark.category}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white w-14">
                        {item.score}%
                      </span>
                      <div className="flex-1 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(item.score, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/models/${item.model.slug}`}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dataset Notice */}
      <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-500 flex items-start gap-2">
        <span>ℹ️</span>
        <p>
          <strong>Notice:</strong> All benchmark scores and rankings are derived from sample demonstration data seeded into PostgreSQL. They are not intended as certified real-world measurements.
        </p>
      </div>
    </div>
  );
}

export default function RankingsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-slate-400 text-center">
          Loading Leaderboards...
        </div>
      }
    >
      <RankingsContent />
    </Suspense>
  );
}
