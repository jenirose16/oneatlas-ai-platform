"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<"connected" | "disconnected" | "loading">("loading");

  useEffect(() => {
    // Quick probe to check live database connectivity
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.services?.database?.status === "connected") {
          setDbStatus("connected");
        } else {
          setDbStatus("disconnected");
        }
      })
      .catch(() => setDbStatus("disconnected"));
  }, []);

  const navLinks = [
    { name: "Explore Models", href: "/models" },
    { name: "Compare", href: "/compare" },
    { name: "Rankings", href: "/rankings" },
    { name: "Providers", href: "/providers" },
    { name: "Companies", href: "/companies" },
  ];

  const isActive = (href: string) => {
    if (href === "/models") {
      return pathname.startsWith("/models");
    }
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-blue-600 group-hover:bg-blue-500 transition-colors flex items-center justify-center font-bold text-white text-sm shadow-sm shadow-blue-500/20">
                1A
              </div>
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-slate-100 transition-colors">
                OneAtlas
              </span>
            </Link>

            {/* Live Database Status Pill */}
            <Link
              href="/api/health"
              target="_blank"
              title="Click to inspect live /api/health endpoint"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors bg-slate-900 border-slate-800 hover:border-slate-700"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  dbStatus === "connected"
                    ? "bg-emerald-400 animate-pulse"
                    : dbStatus === "loading"
                    ? "bg-amber-400"
                    : "bg-red-400"
                }`}
              />
              <span className="text-slate-400">
                {dbStatus === "connected"
                  ? "PostgreSQL Connected"
                  : dbStatus === "loading"
                  ? "Checking DB..."
                  : "DB Disconnected"}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? "bg-slate-800 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* API Links & Mobile Toggle */}
          <div className="flex items-center space-x-3">
            <Link
              href="/api/models"
              target="_blank"
              className="hidden sm:inline-flex items-center text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-md transition"
            >
              API Docs ↗
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-850 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.href)
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/api/models"
                target="_blank"
                className="block px-3 py-2 text-xs font-mono text-blue-400 hover:underline"
              >
                Open API Route: GET /api/models ↗
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
