import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/60 py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-200">OneAtlas</span>
            <span>&bull;</span>
            <span>Backend Engineer Internship Assessment</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/models"
              className="hover:text-slate-200 transition-colors"
            >
              Models
            </Link>
            <Link
              href="/compare"
              className="hover:text-slate-200 transition-colors"
            >
              Compare
            </Link>
            <Link
              href="/rankings"
              className="hover:text-slate-200 transition-colors"
            >
              Rankings
            </Link>
            <Link
              href="/providers"
              className="hover:text-slate-200 transition-colors"
            >
              Providers
            </Link>
            <Link
              href="/companies"
              className="hover:text-slate-200 transition-colors"
            >
              Companies
            </Link>
            <Link
              href="/api/health"
              target="_blank"
              className="text-blue-400 hover:text-blue-300 font-mono transition-colors"
            >
              GET /api/health
            </Link>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>
            Disclaimer: All specifications, token pricing, and benchmark scores
            are illustrative sample demonstration data for technical evaluation.
          </p>
          <p>
            Built with Next.js App Router, TypeScript, PostgreSQL &amp; Prisma ORM.
          </p>
        </div>
      </div>
    </footer>
  );
}
