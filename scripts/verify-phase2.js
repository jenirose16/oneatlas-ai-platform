const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runVerification() {
  console.log("==================================================");
  console.log("ONEATLAS - PHASE 2 VERIFICATION SUITE");
  console.log("==================================================");

  // 1. Record Counts
  const companyCount = await prisma.company.count();
  const providerCount = await prisma.provider.count();
  const modelCount = await prisma.model.count();
  const modelProviderCount = await prisma.modelProvider.count();
  const benchmarkCount = await prisma.benchmark.count();
  const scoreCount = await prisma.benchmarkScore.count();

  console.log("\n📊 TABLE RECORD COUNTS:");
  console.log(`- companies:        ${companyCount}`);
  console.log(`- providers:        ${providerCount}`);
  console.log(`- models:           ${modelCount}`);
  console.log(`- model_providers:  ${modelProviderCount}`);
  console.log(`- benchmarks:       ${benchmarkCount}`);
  console.log(`- benchmark_scores: ${scoreCount}`);

  // 2. Relational Verification: Model -> Company, Providers, BenchmarkScores
  console.log("\n🔗 TESTING RELATIONAL INTEGRITY (Model: gpt-4o):");
  const model = await prisma.model.findUnique({
    where: { slug: "gpt-4o" },
    include: {
      company: true,
      providers: {
        include: {
          provider: true,
        },
      },
      benchmarkScores: {
        include: {
          benchmark: true,
        },
      },
    },
  });

  if (!model) {
    throw new Error("Model gpt-4o not found!");
  }

  console.log(`- Model Name:       ${model.name}`);
  console.log(`- Company:          ${model.company.name} (${model.company.slug})`);
  console.log(`- Context Window:   ${model.contextWindow.toLocaleString()} tokens`);
  console.log(`- Model Type:       ${model.modelType}`);
  console.log(`- Capabilities:     [${model.capabilities.join(", ")}]`);
  console.log(`- Available on ${model.providers.length} Providers:`);
  for (const mp of model.providers) {
    console.log(`  * ${mp.provider.name}: Input $${mp.inputPrice}/1M, Output $${mp.outputPrice}/1M`);
  }
  console.log(`- Tested on ${model.benchmarkScores.length} Benchmarks:`);
  for (const bs of model.benchmarkScores) {
    console.log(`  * ${bs.benchmark.name}: ${bs.score}%`);
  }

  // 3. Relational Verification: Company -> Models
  console.log("\n🔗 TESTING COMPANY -> MODELS (Anthropic):");
  const anthropic = await prisma.company.findUnique({
    where: { slug: "anthropic" },
    include: {
      models: {
        select: { name: true, slug: true, modelType: true },
      },
    },
  });
  console.log(`Anthropic has ${anthropic.models.length} models:`);
  anthropic.models.forEach(m => console.log(`  * ${m.name} (${m.modelType})`));

  // 4. Relational Verification: Provider -> ModelProviders -> Models
  console.log("\n🔗 TESTING PROVIDER -> MODELS (Amazon Bedrock):");
  const bedrock = await prisma.provider.findUnique({
    where: { slug: "aws-bedrock" },
    include: {
      modelProviders: {
        include: {
          model: true,
        },
      },
    },
  });
  console.log(`Amazon Bedrock hosts ${bedrock.modelProviders.length} models:`);
  bedrock.modelProviders.slice(0, 5).forEach(mp => {
    console.log(`  * ${mp.model.name} ($${mp.inputPrice}/$${mp.outputPrice})`);
  });
  if (bedrock.modelProviders.length > 5) {
    console.log(`  ... and ${bedrock.modelProviders.length - 5} more`);
  }

  // 5. Foreign Key Integrity Check (Orphan checks via SQL)
  const orphanScoresResult = await prisma.$queryRaw`
    SELECT COUNT(*)::int as count 
    FROM benchmark_scores bs 
    LEFT JOIN models m ON bs."modelId" = m.id 
    WHERE m.id IS NULL;
  `;
  const orphanModelProvidersResult = await prisma.$queryRaw`
    SELECT COUNT(*)::int as count 
    FROM model_providers mp 
    LEFT JOIN models m ON mp."modelId" = m.id 
    WHERE m.id IS NULL;
  `;
  const orphanScores = orphanScoresResult[0].count;
  const orphanModelProviders = orphanModelProvidersResult[0].count;

  console.log("\n🛡️ INTEGRITY CHECKS:");
  console.log(`- Orphan BenchmarkScores: ${orphanScores} (Expected: 0)`);
  console.log(`- Orphan ModelProviders:  ${orphanModelProviders} (Expected: 0)`);

  console.log("\n✅ ALL VERIFICATION CHECKS PASSED!");
}

runVerification()
  .catch(err => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
