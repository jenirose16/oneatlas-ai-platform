import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatDecimal } from "@/lib/api-response";

async function HomeContent() {
  const [
    modelCount,
    companyCount,
    providerCount,
    pricingCount,
    benchmarkCount,
    recentModels,
  ] = await Promise.all([
    prisma.model.count(),
    prisma.company.count(),
    prisma.provider.count(),
    prisma.modelProvider.count(),
    prisma.benchmark.count(),
    prisma.model.findMany({
      take: 4,
      orderBy: { releaseDate: "desc" },
      include: {
        company: { select: { name: true, slug: true } },
        providers: {
          select: { inputPrice: true, outputPrice: true },
          orderBy: { inputPrice: "asc" },
          take: 1,
        },
      },
    }),
  ]);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <section className="space-y-6 pt-4 sm:pt-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          Backend Engineer Assessment Platform &bull; Phase 4
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl">
          AI Model Discovery &amp; <span className="text-blue-500">Intelligence</span> Platform
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          OneAtlas is a backend-driven discovery engine for developers and
          researchers to search foundation models, compare pricing structures,
          inspect architectures, and evaluate standardized benchmark rankings.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2 justify-center sm:justify-start">
          <Link
            href="/models"
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shadow-md shadow-blue-500/10"
          >
            Explore 28 Models →
          </Link>
          <Link
            href="/compare"
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-medium text-sm transition"
          >
            Compare Models
          </Link>
          <Link
            href="/rankings"
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-medium text-sm transition"
          >
            Leaderboards
          </Link>
        </div>
      </section>

      {/* Real PostgreSQL Metrics Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 sm:p-6 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{modelCount}</div>
          <div className="text-xs text-slate-400 font-medium mt-0.5">AI Models</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{companyCount}</div>
          <div className="text-xs text-slate-400 font-medium mt-0.5">Research Labs</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{providerCount}</div>
          <div className="text-xs text-slate-400 font-medium mt-0.5">API Providers</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{pricingCount}</div>
          <div className="text-xs text-slate-400 font-medium mt-0.5">Pricing Tiers</div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{benchmarkCount}</div>
          <div className="text-xs text-slate-400 font-medium mt-0.5">Benchmark Suites</div>
        </div>
      </section>

      {/* Feature Navigation Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/models"
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition flex flex-col justify-between group"
          >
            <div className="space-y-2">
              <div className="text-blue-400 text-lg">🔍</div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                Model Explorer
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Search, filter by company or capability, sort by context window or price, and paginate via REST APIs.
              </p>
            </div>
            <span className="text-xs font-medium text-blue-400 mt-4 inline-flex items-center gap-1">
              Browse Models →
            </span>
          </Link>

          <Link
            href="/compare"
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition flex flex-col justify-between group"
          >
            <div className="space-y-2">
              <div className="text-blue-400 text-lg">⚖️</div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                Model Comparison
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Select 2–4 models to generate an interactive side-by-side comparison of specs, token pricing, and scores.
              </p>
            </div>
            <span className="text-xs font-medium text-blue-400 mt-4 inline-flex items-center gap-1">
              Compare Side-by-Side →
            </span>
          </Link>

          <Link
            href="/rankings"
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition flex flex-col justify-between group"
          >
            <div className="space-y-2">
              <div className="text-blue-400 text-lg">🏆</div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                Benchmark Rankings
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Inspect AI leaderboards across MMLU, HumanEval, GSM8K, GPQA, and SWE-bench with score sorting.
              </p>
            </div>
            <span className="text-xs font-medium text-blue-400 mt-4 inline-flex items-center gap-1">
              View Leaderboards →
            </span>
          </Link>

          <Link
            href="/providers"
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition flex flex-col justify-between group"
          >
            <div className="space-y-2">
              <div className="text-blue-400 text-lg">☁️</div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                Cloud Providers
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Explore AWS Bedrock, Azure AI, Vertex AI, OpenRouter, and direct lab APIs with exact token rates.
              </p>
            </div>
            <span className="text-xs font-medium text-blue-400 mt-4 inline-flex items-center gap-1">
              Inspect Providers →
            </span>
          </Link>
        </div>
      </section>

      {/* Recent Models Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Recent Frontier Models</h2>
          <Link href="/models" className="text-xs font-medium text-blue-400 hover:underline">
            View All ({modelCount}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentModels.map((m) => {
            const lowestPrice = m.providers[0]?.inputPrice
              ? formatDecimal(m.providers[0].inputPrice)
              : null;
            return (
              <Link
                key={m.id}
                href={`/models/${m.slug}`}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {m.company.name}
                    </span>
                    <span className="text-[11px] text-slate-500 uppercase font-mono">
                      {m.modelType}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                    {m.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {m.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>{(m.contextWindow / 1000).toFixed(0)}k ctx</span>
                  <span className="font-mono text-slate-300">
                    {lowestPrice !== null ? `$${lowestPrice}/1M` : "Free"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Dataset Notice Banner */}
      <section className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <span className="text-base">ℹ️</span>
        <div>
          <strong className="text-slate-300">Demonstration Dataset Notice:</strong> All AI model records, context limits, token pricing, and benchmark scores in this application are illustrative sample data seeded in PostgreSQL for technical evaluation of the OneAtlas backend architecture.
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-slate-400 text-center">
          Loading OneAtlas Platform Overview...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
