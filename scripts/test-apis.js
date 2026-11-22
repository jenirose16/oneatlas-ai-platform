/**
 * ==============================================================================
 * OneAtlas - Comprehensive REST API Automated Test Suite (Phase 3)
 * ==============================================================================
 * Tests all 12 required scenarios against live Next.js API route handlers
 * and the seeded PostgreSQL database.
 * ==============================================================================
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let passedCount = 0;
let failedCount = 0;
const results = [];

async function assertTest(name, testFn) {
  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    passedCount++;
    results.push({ name, status: "PASSED", durationMs: duration });
    console.log(`✅ [PASS] ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    failedCount++;
    results.push({ name, status: "FAILED", durationMs: duration, error: error.message });
    console.error(`❌ [FAIL] ${name} (${duration}ms):`, error.message);
  }
}

async function fetchJson(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json();
  return { status: res.status, ok: res.ok, body: data };
}

async function runTestSuite() {
  console.log("==================================================");
  console.log(`🧪 RUNNING ONEATLAS API TEST SUITE against ${BASE_URL}`);
  console.log("==================================================\n");

  // 1. Model Listing
  await assertTest("1. Model Listing (GET /api/models)", async () => {
    const { status, body } = await fetchJson("/api/models");
    if (status !== 200) throw new Error(`Expected HTTP 200, got ${status}`);
    if (!body.success) throw new Error("Expected body.success to be true");
    if (!Array.isArray(body.data)) throw new Error("Expected body.data to be an array");
    if (body.data.length === 0) throw new Error("Expected non-empty model list");
    if (!body.meta || typeof body.meta.totalCount !== "number") throw new Error("Missing pagination metadata");
    if (body.meta.totalCount < 25) throw new Error(`Expected at least 25 models, found ${body.meta.totalCount}`);
  });

  // 2. Search
  await assertTest("2. Search by Model Name & Description (GET /api/models?search=claude)", async () => {
    const { status, body } = await fetchJson("/api/models?search=claude");
    if (status !== 200) throw new Error(`Expected HTTP 200, got ${status}`);
    if (body.data.length === 0) throw new Error("Expected search to return matching models");
    for (const model of body.data) {
      const match =
        model.name.toLowerCase().includes("claude") ||
        (model.description && model.description.toLowerCase().includes("claude"));
      if (!match) throw new Error(`Model ${model.name} does not match search query 'claude'`);
    }
  });

  // 3. Combined Filters
  await assertTest("3. Combined Filters (company=anthropic, capability=vision, modelType=multimodal)", async () => {
    const { status, body } = await fetchJson(
      "/api/models?company=anthropic&capability=vision&modelType=multimodal"
    );
    if (status !== 200) throw new Error(`Expected HTTP 200, got ${status}`);
    if (body.data.length === 0) throw new Error("Expected models matching combined filters");
    for (const model of body.data) {
      if (model.company.slug !== "anthropic") throw new Error(`Expected company 'anthropic', got ${model.company.slug}`);
      if (model.modelType !== "multimodal") throw new Error(`Expected modelType 'multimodal', got ${model.modelType}`);
      if (!model.capabilities.includes("vision")) throw new Error(`Expected capabilities to include 'vision'`);
    }
  });

  // 4. Sorting
  await assertTest("4. Sorting (sortBy=contextWindow&sortOrder=desc)", async () => {
    const { status, body } = await fetchJson("/api/models?sortBy=contextWindow&sortOrder=desc&limit=10");
    if (status !== 200) throw new Error(`Expected HTTP 200, got ${status}`);
    for (let i = 0; i < body.data.length - 1; i++) {
      if (body.data[i].contextWindow < body.data[i + 1].contextWindow) {
        throw new Error(
          `Context window sorting failed: ${body.data[i].name} (${body.data[i].contextWindow}) < ${body.data[i + 1].name} (${body.data[i + 1].contextWindow})`
        );
      }
    }
  });

  // 4b. Pricing Sorting
  await assertTest("4b. Pricing Sorting (sortBy=inputPrice&sortOrder=asc)", async () => {
    const { status, body } = await fetchJson("/api/models?sortBy=inputPrice&sortOrder=asc&limit=5");
    if (status !== 200) throw new Error(`Expected HTTP 200, got ${status}`);
    const firstPrice = body.data[0].pricing.minInputPrice;
    if (firstPrice === null || firstPrice > 0.1) {
      throw new Error(`Expected lowest priced model first, got $${firstPrice}`);
    }
  });

  // 5. Pagination
  await assertTest("5. Pagination (page=2&limit=5)", async () => {
    const { status, body } = await fetchJson("/api/models?page=2&limit=5");
    if (status !== 200) throw new Error(`Expected HTTP 200, got ${status}`);
    if (body.meta.page !== 2) throw new Error(`Expected page 2, got ${body.meta.page}`);
    if (body.meta.limit !== 5) throw new Error(`Expected limit 5, got ${body.meta.limit}`);
    if (body.data.length > 5) throw new Error(`Expected at most 5 records, got ${body.data.length}`);
    if (!body.meta.hasPreviousPage) throw new Error("Expected hasPreviousPage to be true on page 2");
  });

  // 6. Model Details
  await assertTest("6. Model Details (GET /api/models/gpt-4o)", async () => {
    const { status, body } = await fetchJson("/api/models/gpt-4o");
    if (status !== 200) throw new Error(`Expected HTTP 200, got ${status}`);
    const model = body.data;
    if (model.slug !== "gpt-4o") throw new Error(`Expected model slug gpt-4o, got ${model.slug}`);
    if (!model.company || model.company.name !== "OpenAI") throw new Error("Expected company OpenAI");
    if (!Array.isArray(model.providers) || model.providers.length === 0) throw new Error("Missing providers array");
    if (!Array.isArray(model.benchmarkScores) || model.benchmarkScores.length === 0) throw new Error("Missing benchmark scores");
    // Verify decimal formatting is a valid number
    const samplePrice = model.providers[0].inputPrice;
    if (typeof samplePrice !== "number") throw new Error(`Expected inputPrice to be number, got ${typeof samplePrice}`);
  });

  // 7. Unknown Model ID (404)
  await assertTest("7. Unknown Model ID Returns 404 (GET /api/models/unknown-model-xyz)", async () => {
    const { status, body } = await fetchJson("/api/models/unknown-model-xyz");
    if (status !== 404) throw new Error(`Expected HTTP 404, got ${status}`);
    if (body.success !== false) throw new Error("Expected body.success to be false");
    if (body.error.code !== "MODEL_NOT_FOUND") throw new Error(`Expected error code MODEL_NOT_FOUND, got ${body.error.code}`);
  });

  // 8. Provider & Provider Models Listing
  await assertTest("8. Provider & Provider Models Listing (GET /api/providers and /api/providers/[id]/models)", async () => {
    const { status: provStatus, body: provBody } = await fetchJson("/api/providers");
    if (provStatus !== 200) throw new Error(`Expected HTTP 200, got ${provStatus}`);
    if (provBody.data.length < 4) throw new Error(`Expected at least 4 providers, got ${provBody.data.length}`);

    // Inspect models for AWS Bedrock
    const { status: modStatus, body: modBody } = await fetchJson("/api/providers/aws-bedrock/models");
    if (modStatus !== 200) throw new Error(`Expected HTTP 200 for Bedrock models, got ${modStatus}`);
    if (!modBody.data.provider || modBody.data.provider.slug !== "aws-bedrock") throw new Error("Provider metadata mismatch");
    if (!Array.isArray(modBody.data.models) || modBody.data.models.length === 0) throw new Error("Expected hosted models on Bedrock");
  });

  // 9. Benchmarks & Rankings
  await assertTest("9. Benchmarks & Rankings (GET /api/benchmarks and /api/rankings?benchmark=mmlu)", async () => {
    const { status: bStatus, body: bBody } = await fetchJson("/api/benchmarks");
    if (bStatus !== 200) throw new Error(`Expected HTTP 200 for benchmarks, got ${bStatus}`);
    if (bBody.data.length < 4) throw new Error(`Expected at least 4 benchmarks, got ${bBody.data.length}`);

    // Query rankings
    const { status: rStatus, body: rBody } = await fetchJson("/api/rankings?benchmark=mmlu");
    if (rStatus !== 200) throw new Error(`Expected HTTP 200 for rankings, got ${rStatus}`);
    if (rBody.data.length === 0) throw new Error("Expected non-empty rankings");
    // Verify rank 1 is highest score
    if (rBody.data[0].rank !== 1) throw new Error("Expected first entry to be rank 1");
    for (let i = 0; i < rBody.data.length - 1; i++) {
      if (rBody.data[i].score < rBody.data[i + 1].score) {
        throw new Error(`Rankings sorting error: score ${rBody.data[i].score} < ${rBody.data[i + 1].score}`);
      }
    }
  });

  // 10. Model Comparison
  await assertTest("10. Model Comparison (GET /api/compare?ids=gpt-4o,claude-3-5-sonnet)", async () => {
    const { status, body } = await fetchJson("/api/compare?ids=gpt-4o,claude-3-5-sonnet");
    if (status !== 200) throw new Error(`Expected HTTP 200, got ${status}`);
    if (body.data.comparedCount !== 2) throw new Error(`Expected 2 compared models, got ${body.data.comparedCount}`);
    if (body.data.models.length !== 2) throw new Error(`Expected 2 models in response`);
    if (!Array.isArray(body.data.benchmarkComparisonMatrix)) throw new Error("Missing benchmarkComparisonMatrix");
    if (body.data.benchmarkComparisonMatrix.length === 0) throw new Error("Expected common benchmark matrix rows");
  });

  // 11. Invalid Query Parameters (400 Bad Request)
  await assertTest("11. Invalid Query Parameters Return 400 (Validation Error)", async () => {
    // Test 1: page < 1
    const res1 = await fetchJson("/api/models?page=0");
    if (res1.status !== 400) throw new Error(`Expected HTTP 400 for page=0, got ${res1.status}`);
    if (res1.body.error.code !== "VALIDATION_ERROR") throw new Error("Expected VALIDATION_ERROR code");

    // Test 2: compare with only 1 model
    const res2 = await fetchJson("/api/compare?ids=gpt-4o");
    if (res2.status !== 400) throw new Error(`Expected HTTP 400 for single model comparison, got ${res2.status}`);

    // Test 3: compare with more than 4 models
    const res3 = await fetchJson("/api/compare?ids=gpt-4o,claude-3-5-sonnet,gemini-1-5-pro,o1,mistral-large-2");
    if (res3.status !== 400) throw new Error(`Expected HTTP 400 for 5 models comparison, got ${res3.status}`);
  });

  // 12. Database Error & Missing Resource Handling
  await assertTest("12. Missing Resource & Error Handling (404 on invalid provider/benchmark/compare)", async () => {
    // Missing provider
    const res1 = await fetchJson("/api/providers/non-existent-provider-999/models");
    if (res1.status !== 404) throw new Error(`Expected HTTP 404 for unknown provider, got ${res1.status}`);

    // Missing benchmark in rankings
    const res2 = await fetchJson("/api/rankings?benchmark=non-existent-benchmark-xyz");
    if (res2.status !== 404) throw new Error(`Expected HTTP 404 for unknown benchmark, got ${res2.status}`);

    // Missing model in compare
    const res3 = await fetchJson("/api/compare?ids=gpt-4o,non-existent-model-999");
    if (res3.status !== 404) throw new Error(`Expected HTTP 404 for comparison with non-existent model, got ${res3.status}`);
  });

  console.log("\n==================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution crashed:", err);
  process.exit(1);
});
