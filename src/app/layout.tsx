import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "OneAtlas | AI Model Discovery & Intelligence Platform",
  description:
    "Discover, compare, and analyze AI models, specifications, and benchmark rankings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-slate-100">
        <Suspense
          fallback={
            <header className="h-16 border-b border-slate-800 bg-slate-950/80" />
          }
        >
          <Navbar />
        </Suspense>
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
