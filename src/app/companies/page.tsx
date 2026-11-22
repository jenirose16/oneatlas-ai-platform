import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";

async function CompaniesContent() {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { models: true },
      },
      models: {
        select: { name: true, slug: true, modelType: true },
        take: 3,
      },
    },
  });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Description */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Research Organizations &amp; Labs
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore the world&apos;s leading AI labs, foundation research organizations, and their model catalogs.
        </p>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => (
          <div
            key={company.id}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {company.name}
                </h2>
                <span className="text-xs font-mono font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  {company._count.models} models
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {company.description || "Leading artificial intelligence research organization."}
              </p>

              {/* Sample Models List */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-mono text-slate-500 uppercase">
                  Featured Models:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {company.models.map((m) => (
                    <Link
                      key={m.slug}
                      href={`/models/${m.slug}`}
                      className="text-[11px] text-slate-300 hover:text-white bg-slate-950 border border-slate-800 px-2 py-0.5 rounded transition"
                    >
                      {m.name}
                    </Link>
                  ))}
                  {company._count.models > 3 && (
                    <span className="text-[11px] text-slate-500 px-1 py-0.5">
                      +{company._count.models - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-slate-200 transition"
                >
                  Official Website ↗
                </a>
              ) : (
                <span className="text-slate-600">-</span>
              )}

              <Link
                href={`/models?company=${company.slug}`}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Browse Models →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-slate-400 text-center">
          Loading AI Companies...
        </div>
      }
    >
      <CompaniesContent />
    </Suspense>
  );
}
