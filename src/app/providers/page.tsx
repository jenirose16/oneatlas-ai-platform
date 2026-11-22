import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";

async function ProvidersContent() {
  const providers = await prisma.provider.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { modelProviders: true },
      },
      modelProviders: {
        include: {
          model: {
            select: { name: true, slug: true },
          },
        },
        take: 3,
      },
    },
  });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Description */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Cloud &amp; Inference API Providers
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore infrastructure platforms, hyperscalers, and routing services serving foundation models via API.
        </p>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {provider.name}
                </h2>
                <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {provider._count.modelProviders} models hosted
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                API Endpoint Identifier: <span className="text-slate-300">{provider.slug}</span>
              </p>

              {/* Sample Hosted Models */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono text-slate-500 uppercase">
                  Available Models:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {provider.modelProviders.map((mp) => (
                    <Link
                      key={mp.model.slug}
                      href={`/models/${mp.model.slug}`}
                      className="text-[11px] text-slate-300 hover:text-white bg-slate-950 border border-slate-800 px-2 py-0.5 rounded transition"
                    >
                      {mp.model.name}
                    </Link>
                  ))}
                  {provider._count.modelProviders > 3 && (
                    <span className="text-[11px] text-slate-500 px-1 py-0.5">
                      +{provider._count.modelProviders - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              {provider.website ? (
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-slate-200 transition"
                >
                  Provider Console ↗
                </a>
              ) : (
                <span className="text-slate-600">-</span>
              )}

              <Link
                href={`/models?provider=${provider.slug}`}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Filter Hosted Models →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-slate-400 text-center">
          Loading API Providers...
        </div>
      }
    >
      <ProvidersContent />
    </Suspense>
  );
}
