import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDecimal } from "@/lib/api-response";

async function ModelDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const model = await prisma.model.findFirst({
    where: {
      OR: [{ id: id }, { slug: id.toLowerCase() }],
    },
    include: {
      company: true,
      providers: {
        include: {
          provider: true,
        },
        orderBy: {
          inputPrice: "asc",
        },
      },
      benchmarkScores: {
        include: {
          benchmark: true,
        },
        orderBy: {
          score: "desc",
        },
      },
    },
  });

  if (!model) {
    notFound();
  }

  const providers = model.providers.map((mp) => ({
    id: mp.id,
    name: mp.provider.name,
    slug: mp.provider.slug,
    website: mp.provider.website,
    inputPrice: formatDecimal(mp.inputPrice),
    outputPrice: formatDecimal(mp.outputPrice),
    isAvailable: mp.isAvailable,
    updatedAt: mp.updatedAt,
  }));

  const scores = model.benchmarkScores.map((bs) => ({
    id: bs.id,
    name: bs.benchmark.name,
    slug: bs.benchmark.slug,
    category: bs.benchmark.category,
    description: bs.benchmark.description,
    score: formatDecimal(bs.score),
    evaluatedAt: bs.evaluatedAt,
  }));

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/models"
          className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors mb-4"
        >
          ← Back to Model Explorer
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded">
                {model.company.name}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded uppercase">
                {model.modelType}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {model.name}
            </h1>
            <p className="text-sm font-mono text-slate-500">slug: {model.slug}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/compare?ids=${model.slug}`}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              Compare Model →
            </Link>
            <Link
              href={`/api/models/${model.slug}`}
              target="_blank"
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition"
            >
              Raw JSON ↗
            </Link>
          </div>
        </div>
      </div>

      {/* Description & Specs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-white">Overview &amp; Architecture</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {model.description || "No description provided for this model."}
          </p>

          <div>
            <h3 className="text-xs font-medium text-slate-400 mb-2">Native Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {model.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-white">Hardware &amp; Limits</h2>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-slate-400">Context Window</div>
              <div className="text-base font-bold text-white font-mono mt-0.5">
                {model.contextWindow.toLocaleString()} tokens
              </div>
            </div>

            <div>
              <div className="text-slate-400">Release Date</div>
              <div className="text-sm font-medium text-slate-200 mt-0.5">
                {model.releaseDate
                  ? new Date(model.releaseDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </div>
            </div>

            <div>
              <div className="text-slate-400">Creator Organization</div>
              <div className="text-sm font-medium text-blue-400 mt-0.5">
                {model.company.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Pricing Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Available API Providers &amp; Pricing</h2>
          <span className="text-xs text-slate-400">
            Rates in USD per 1,000,000 tokens
          </span>
        </div>

        {providers.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            No active API providers currently registered for this model.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Input Price (1M tokens)</th>
                  <th className="py-3 px-4">Output Price (1M tokens)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Portal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      {p.inputPrice !== null ? `$${p.inputPrice.toFixed(4)}` : "Custom"}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      {p.outputPrice !== null ? `$${p.outputPrice.toFixed(4)}` : "Custom"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Available
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.website ? (
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Visit ↗
                        </a>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Benchmark Performance Scores */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Benchmark Evaluations</h2>
          <span className="text-xs text-slate-400">
            Standardized evaluation metrics (0-100%)
          </span>
        </div>

        {scores.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            No benchmark evaluation records registered for this model yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {scores.map((score) => (
              <div
                key={score.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[11px]">{score.category}</span>
                    <span className="font-bold text-base text-white font-mono">
                      {score.score}%
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-200 mt-1">{score.name}</h3>
                  {score.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {score.description}
                    </p>
                  )}
                </div>

                <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(score.score || 0, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-12 text-slate-400 text-center">
          Loading Model Details...
        </div>
      }
    >
      <ModelDetailContent params={params} />
    </Suspense>
  );
}
