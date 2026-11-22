const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

const routes = [
  { path: "/", title: "Homepage", keyword: "OneAtlas" },
  { path: "/models", title: "Model Explorer", keyword: "AI Model Explorer" },
  { path: "/models/gpt-4o", title: "Model Detail (GPT-4o)", keyword: "GPT-4o" },
  { path: "/compare?ids=gpt-4o,claude-3-5-sonnet", title: "Comparison Matrix", keyword: "Comparison Matrix" },
  { path: "/rankings", title: "Benchmark Leaderboard", keyword: "Benchmark Leaderboard" },
  { path: "/companies", title: "Companies Directory", keyword: "AI Research Organizations" },
  { path: "/providers", title: "Providers Directory", keyword: "Inference API Providers" },
];

async function runFrontendChecks() {
  console.log("==================================================");
  console.log("🌐 VERIFYING FRONTEND PAGES OVER HTTP");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  for (const route of routes) {
    try {
      const start = Date.now();
      const res = await fetch(`${BASE_URL}${route.path}`);
      const text = await res.text();
      const duration = Date.now() - start;

      if (res.status !== 200) {
        throw new Error(`Expected HTTP 200, got ${res.status}`);
      }

      if (!text.includes(route.keyword)) {
        throw new Error(`Expected page to contain keyword "${route.keyword}"`);
      }

      passed++;
      console.log(`✅ [PASS] ${route.title} (${route.path}) - HTTP 200 (${duration}ms)`);
    } catch (err) {
      failed++;
      console.error(`❌ [FAIL] ${route.title} (${route.path}):`, err.message);
    }
  }

  console.log("\n==================================================");
  console.log(`📊 FRONTEND VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runFrontendChecks().catch((err) => {
  console.error(err);
  process.exit(1);
});
