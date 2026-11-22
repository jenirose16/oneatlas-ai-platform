import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ==============================================================================
 * OneAtlas - Database Seed Script (Idempotent)
 * ==============================================================================
 * NOTICE:
 * All specifications, pricing figures (USD per 1M tokens), and benchmark
 * scores contained herein are illustrative SAMPLE DATA generated strictly for
 * demonstration and technical assessment purposes. They do NOT represent
 * official, verified, or guaranteed real-world values.
 * ==============================================================================
 */

async function main() {
  console.log("🌱 Starting OneAtlas database seeding...");

  // ----------------------------------------------------------------------------
  // 1. AI Companies (6 total - Minimum 5 required)
  // ----------------------------------------------------------------------------
  console.log("🏢 Seeding AI Companies...");
  const companiesData = [
    {
      name: "OpenAI",
      slug: "openai",
      description: "Pioneering AI research and deployment lab known for the GPT and o-series reasoning models. (Sample Profile)",
      website: "https://openai.com",
    },
    {
      name: "Anthropic",
      slug: "anthropic",
      description: "AI safety and research company creating dependable, interpretable, and steerable AI systems including Claude. (Sample Profile)",
      website: "https://anthropic.com",
    },
    {
      name: "Google DeepMind",
      slug: "google-deepmind",
      description: "Google's premier AI research unit developing state-of-the-art multimodal Gemini architectures. (Sample Profile)",
      website: "https://deepmind.google",
    },
    {
      name: "Meta AI",
      slug: "meta-ai",
      description: "Open-source frontier AI developer behind the open-weights Llama family of foundation models. (Sample Profile)",
      website: "https://ai.meta.com",
    },
    {
      name: "Mistral AI",
      slug: "mistral-ai",
      description: "European frontier AI lab offering efficient, open-weights, and commercial generative models. (Sample Profile)",
      website: "https://mistral.ai",
    },
    {
      name: "Cohere",
      slug: "cohere",
      description: "Enterprise-focused AI platform specializing in retrieval-augmented generation (RAG) and multilingual models. (Sample Profile)",
      website: "https://cohere.com",
    },
  ];

  const companies: Record<string, string> = {};
  for (const comp of companiesData) {
    const record = await prisma.company.upsert({
      where: { slug: comp.slug },
      update: {
        name: comp.name,
        description: comp.description,
        website: comp.website,
      },
      create: comp,
    });
    companies[comp.slug] = record.id;
  }
  console.log(`✅ Upserted ${Object.keys(companies).length} AI companies.`);

  // ----------------------------------------------------------------------------
  // 2. API Providers (6 total - Minimum 4 required)
  // ----------------------------------------------------------------------------
  console.log("☁️  Seeding API Providers...");
  const providersData = [
    {
      name: "OpenAI Direct",
      slug: "openai-direct",
      website: "https://platform.openai.com",
    },
    {
      name: "Anthropic Direct",
      slug: "anthropic-direct",
      website: "https://console.anthropic.com",
    },
    {
      name: "Google Cloud Vertex AI",
      slug: "vertex-ai",
      website: "https://cloud.google.com/vertex-ai",
    },
    {
      name: "Amazon Bedrock",
      slug: "aws-bedrock",
      website: "https://aws.amazon.com/bedrock",
    },
    {
      name: "Microsoft Azure AI Foundry",
      slug: "azure-ai",
      website: "https://azure.microsoft.com/en-us/solutions/ai",
    },
    {
      name: "OpenRouter",
      slug: "openrouter",
      website: "https://openrouter.ai",
    },
  ];

  const providers: Record<string, string> = {};
  for (const prov of providersData) {
    const record = await prisma.provider.upsert({
      where: { slug: prov.slug },
      update: {
        name: prov.name,
        website: prov.website,
      },
      create: prov,
    });
    providers[prov.slug] = record.id;
  }
  console.log(`✅ Upserted ${Object.keys(providers).length} API providers.`);

  // ----------------------------------------------------------------------------
  // 3. Benchmarks (5 total - Minimum 4 required)
  // ----------------------------------------------------------------------------
  console.log("📊 Seeding Benchmark Suites...");
  const benchmarksData = [
    {
      name: "MMLU (Massive Multitask Language Understanding)",
      slug: "mmlu",
      category: "General Knowledge",
      description: "Cross-disciplinary benchmark covering 57 subjects across STEM, humanities, and social sciences. (Illustrative Test)",
    },
    {
      name: "HumanEval",
      slug: "humaneval",
      category: "Coding",
      description: "Python code synthesis benchmark evaluating zero-shot pass@1 programming problem-solving. (Illustrative Test)",
    },
    {
      name: "GSM8K (Grade School Math)",
      slug: "gsm8k",
      category: "Mathematics",
      description: "High-quality dataset of 8,500 grade-school math word problems testing multi-step reasoning. (Illustrative Test)",
    },
    {
      name: "GPQA (Graduate-Level Google-Proof Q&A)",
      slug: "gpqa",
      category: "Reasoning",
      description: "Challenging multiple-choice biology, physics, and chemistry questions written by domain experts. (Illustrative Test)",
    },
    {
      name: "SWE-bench Verified",
      slug: "swe-bench",
      category: "Software Engineering",
      description: "Evaluation benchmark resolving real-world GitHub issues in Python repositories. (Illustrative Test)",
    },
  ];

  const benchmarks: Record<string, string> = {};
  for (const b of benchmarksData) {
    const record = await prisma.benchmark.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        category: b.category,
        description: b.description,
      },
      create: b,
    });
    benchmarks[b.slug] = record.id;
  }
  console.log(`✅ Upserted ${Object.keys(benchmarks).length} benchmarks.`);

  // ----------------------------------------------------------------------------
  // 4. AI Models (28 total - Target 25–30 models)
  // ----------------------------------------------------------------------------
  console.log("🤖 Seeding AI Models...");
  const modelsData = [
    // OpenAI Models (6)
    {
      name: "GPT-4o",
      slug: "gpt-4o",
      companySlug: "openai",
      description: "Flagship omni model natively processing text, audio, and vision with real-time responsiveness. (Sample data)",
      contextWindow: 128000,
      modelType: "multimodal",
      capabilities: ["text", "vision", "audio", "code", "function_calling"],
      releaseDate: new Date("2024-05-13"),
    },
    {
      name: "GPT-4o mini",
      slug: "gpt-4o-mini",
      companySlug: "openai",
      description: "High-speed, cost-efficient multimodal model designed for lightweight vision and text tasks. (Sample data)",
      contextWindow: 128000,
      modelType: "multimodal",
      capabilities: ["text", "vision", "code", "function_calling"],
      releaseDate: new Date("2024-07-18"),
    },
    {
      name: "o1",
      slug: "o1",
      companySlug: "openai",
      description: "Advanced reasoning model using reinforcement learning chain-of-thought for deep science and coding. (Sample data)",
      contextWindow: 200000,
      modelType: "reasoning",
      capabilities: ["text", "vision", "code", "reasoning"],
      releaseDate: new Date("2024-12-05"),
    },
    {
      name: "o1-mini",
      slug: "o1-mini",
      companySlug: "openai",
      description: "Fast reasoning model specialized in STEM, competitive coding, and multi-step mathematics. (Sample data)",
      contextWindow: 128000,
      modelType: "reasoning",
      capabilities: ["text", "code", "reasoning"],
      releaseDate: new Date("2024-09-12"),
    },
    {
      name: "GPT-4 Turbo",
      slug: "gpt-4-turbo",
      companySlug: "openai",
      description: "High-capability multimodal predecessor with a 128k context window and JSON mode support. (Sample data)",
      contextWindow: 128000,
      modelType: "multimodal",
      capabilities: ["text", "vision", "code", "function_calling"],
      releaseDate: new Date("2024-04-09"),
    },
    {
      name: "GPT-3.5 Turbo",
      slug: "gpt-3-5-turbo",
      companySlug: "openai",
      description: "Legacy fast text-generation model optimized for conversational flows and basic tasks. (Sample data)",
      contextWindow: 16384,
      modelType: "text-only",
      capabilities: ["text", "code", "function_calling"],
      releaseDate: new Date("2023-03-01"),
    },

    // Anthropic Models (5)
    {
      name: "Claude 3.5 Sonnet",
      slug: "claude-3-5-sonnet",
      companySlug: "anthropic",
      description: "Industry-leading intelligence with exceptional coding, visual analysis, and agentic workflows. (Sample data)",
      contextWindow: 200000,
      modelType: "multimodal",
      capabilities: ["text", "vision", "code", "reasoning"],
      releaseDate: new Date("2024-06-20"),
    },
    {
      name: "Claude 3.5 Haiku",
      slug: "claude-3-5-haiku",
      companySlug: "anthropic",
      description: "Next-generation compact model combining sub-second latency with high reasoning scores. (Sample data)",
      contextWindow: 200000,
      modelType: "multimodal",
      capabilities: ["text", "vision", "code"],
      releaseDate: new Date("2024-10-22"),
    },
    {
      name: "Claude 3 Opus",
      slug: "claude-3-opus",
      companySlug: "anthropic",
      description: "Deep analytical model built for nuanced comprehension and complex open-ended research. (Sample data)",
      contextWindow: 200000,
      modelType: "multimodal",
      capabilities: ["text", "vision", "code", "reasoning"],
      releaseDate: new Date("2024-03-04"),
    },
    {
      name: "Claude 3 Sonnet",
      slug: "claude-3-sonnet",
      companySlug: "anthropic",
      description: "Balanced enterprise workhorse for data processing, document summarization, and search. (Sample data)",
      contextWindow: 200000,
      modelType: "multimodal",
      capabilities: ["text", "vision", "code"],
      releaseDate: new Date("2024-03-04"),
    },
    {
      name: "Claude 3 Haiku",
      slug: "claude-3-haiku",
      companySlug: "anthropic",
      description: "Ultra-fast lightweight model for customer service chat and instant document extraction. (Sample data)",
      contextWindow: 200000,
      modelType: "multimodal",
      capabilities: ["text", "vision", "code"],
      releaseDate: new Date("2024-03-04"),
    },

    // Google DeepMind Models (5)
    {
      name: "Gemini 1.5 Pro",
      slug: "gemini-1-5-pro",
      companySlug: "google-deepmind",
      description: "Breakthrough 2-million-token context model natively handling video, audio, code, and text. (Sample data)",
      contextWindow: 2000000,
      modelType: "multimodal",
      capabilities: ["text", "vision", "audio", "video", "code", "reasoning"],
      releaseDate: new Date("2024-02-15"),
    },
    {
      name: "Gemini 1.5 Flash",
      slug: "gemini-1-5-flash",
      companySlug: "google-deepmind",
      description: "Lightweight, high-frequency multimodal model with 1M context window built for high-scale apps. (Sample data)",
      contextWindow: 1000000,
      modelType: "multimodal",
      capabilities: ["text", "vision", "audio", "video", "code"],
      releaseDate: new Date("2024-05-14"),
    },
    {
      name: "Gemini 1.5 Flash-8B",
      slug: "gemini-1-5-flash-8b",
      companySlug: "google-deepmind",
      description: "Extremely cost-effective 8-billion parameter model for high-volume multimodal batch tasks. (Sample data)",
      contextWindow: 1000000,
      modelType: "multimodal",
      capabilities: ["text", "vision", "code"],
      releaseDate: new Date("2024-10-03"),
    },
    {
      name: "Gemini 1.0 Pro",
      slug: "gemini-1-0-pro",
      companySlug: "google-deepmind",
      description: "First-generation foundational model for general natural language processing and dialog. (Sample data)",
      contextWindow: 32768,
      modelType: "text-only",
      capabilities: ["text", "code"],
      releaseDate: new Date("2023-12-06"),
    },
    {
      name: "Gemma 2 27B",
      slug: "gemma-2-27b",
      companySlug: "google-deepmind",
      description: "Open-weights model built from Google Gemini research with competitive enterprise performance. (Sample data)",
      contextWindow: 8192,
      modelType: "text-only",
      capabilities: ["text", "code"],
      releaseDate: new Date("2024-06-27"),
    },

    // Meta AI Models (5)
    {
      name: "Llama 3.1 405B",
      slug: "llama-3-1-405b",
      companySlug: "meta-ai",
      description: "World-class open foundation model rivaling leading closed models in general intelligence and math. (Sample data)",
      contextWindow: 128000,
      modelType: "text-only",
      capabilities: ["text", "code", "reasoning", "multilingual"],
      releaseDate: new Date("2024-07-23"),
    },
    {
      name: "Llama 3.1 70B",
      slug: "llama-3-1-70b",
      companySlug: "meta-ai",
      description: "Highly capable open model delivering near-frontier performance for enterprise deployments. (Sample data)",
      contextWindow: 128000,
      modelType: "text-only",
      capabilities: ["text", "code", "reasoning"],
      releaseDate: new Date("2024-07-23"),
    },
    {
      name: "Llama 3.1 8B",
      slug: "llama-3-1-8b",
      companySlug: "meta-ai",
      description: "Ultra-efficient open model capable of edge deployment, fast fine-tuning, and local inference. (Sample data)",
      contextWindow: 128000,
      modelType: "text-only",
      capabilities: ["text", "code"],
      releaseDate: new Date("2024-07-23"),
    },
    {
      name: "Llama 3.2 11B Vision",
      slug: "llama-3-2-11b-vision",
      companySlug: "meta-ai",
      description: "Compact open multimodal model supporting image-text reasoning, chart understanding, and OCR. (Sample data)",
      contextWindow: 128000,
      modelType: "multimodal",
      capabilities: ["text", "vision", "code"],
      releaseDate: new Date("2024-09-25"),
    },
    {
      name: "Llama 3.2 3B",
      slug: "llama-3-2-3b",
      companySlug: "meta-ai",
      description: "On-device edge model optimized for summarization, rewriting, and offline task completion. (Sample data)",
      contextWindow: 128000,
      modelType: "text-only",
      capabilities: ["text", "code"],
      releaseDate: new Date("2024-09-25"),
    },

    // Mistral AI Models (4)
    {
      name: "Mistral Large 2",
      slug: "mistral-large-2",
      companySlug: "mistral-ai",
      description: "Frontier commercial model with top-tier multilingual capabilities, coding fluency, and math reasoning. (Sample data)",
      contextWindow: 128000,
      modelType: "text-only",
      capabilities: ["text", "code", "reasoning", "multilingual"],
      releaseDate: new Date("2024-07-24"),
    },
    {
      name: "Pixtral 12B",
      slug: "pixtral-12b",
      companySlug: "mistral-ai",
      description: "Multimodal model trained natively on images and text with natural chart and diagram extraction. (Sample data)",
      contextWindow: 128000,
      modelType: "multimodal",
      capabilities: ["text", "vision", "code"],
      releaseDate: new Date("2024-09-17"),
    },
    {
      name: "Mistral Nemo",
      slug: "mistral-nemo",
      companySlug: "mistral-ai",
      description: "12B multilingual model co-developed with NVIDIA with a large 128k context window. (Sample data)",
      contextWindow: 128000,
      modelType: "text-only",
      capabilities: ["text", "code", "function_calling"],
      releaseDate: new Date("2024-07-18"),
    },
    {
      name: "Codestral 22B",
      slug: "codestral-22b",
      companySlug: "mistral-ai",
      description: "Open-weight generative model explicitly designed for code completion, refactoring, and test generation. (Sample data)",
      contextWindow: 32768,
      modelType: "code",
      capabilities: ["code", "text", "function_calling"],
      releaseDate: new Date("2024-05-29"),
    },

    // Cohere Models (3)
    {
      name: "Command R+",
      slug: "command-r-plus",
      companySlug: "cohere",
      description: "Scalable enterprise model optimized for complex Retrieval Augmented Generation (RAG) and multi-step tool use. (Sample data)",
      contextWindow: 128000,
      modelType: "text-only",
      capabilities: ["text", "code", "search", "function_calling"],
      releaseDate: new Date("2024-04-04"),
    },
    {
      name: "Command R",
      slug: "command-r",
      companySlug: "cohere",
      description: "Targeted enterprise model combining strong RAG performance with lower latency and cost. (Sample data)",
      contextWindow: 128000,
      modelType: "text-only",
      capabilities: ["text", "code", "search"],
      releaseDate: new Date("2024-03-11"),
    },
    {
      name: "Command Light",
      slug: "command-light",
      companySlug: "cohere",
      description: "Compact model built for sub-second generation, text classification, and basic enterprise chatbots. (Sample data)",
      contextWindow: 4096,
      modelType: "text-only",
      capabilities: ["text"],
      releaseDate: new Date("2023-08-01"),
    },
  ];

  const models: Record<string, string> = {};
  for (const m of modelsData) {
    const companyId = companies[m.companySlug];
    if (!companyId) {
      throw new Error(`Company slug ${m.companySlug} not found for model ${m.slug}`);
    }
    const record = await prisma.model.upsert({
      where: { slug: m.slug },
      update: {
        name: m.name,
        description: m.description,
        companyId,
        contextWindow: m.contextWindow,
        modelType: m.modelType,
        capabilities: m.capabilities,
        releaseDate: m.releaseDate,
      },
      create: {
        name: m.name,
        slug: m.slug,
        description: m.description,
        companyId,
        contextWindow: m.contextWindow,
        modelType: m.modelType,
        capabilities: m.capabilities,
        releaseDate: m.releaseDate,
      },
    });
    models[m.slug] = record.id;
  }
  console.log(`✅ Upserted ${Object.keys(models).length} AI models.`);

  // ----------------------------------------------------------------------------
  // 5. ModelProvider Pricing Records (USD per 1M tokens)
  // ----------------------------------------------------------------------------
  console.log("💰 Seeding ModelProvider pricing and availability...");
  // Mapping of sample prices: [modelSlug, providerSlug, inputPricePer1M, outputPricePer1M]
  const pricingData: Array<[string, string, number, number]> = [
    // OpenAI models on OpenAI Direct, Azure AI, OpenRouter
    ["gpt-4o", "openai-direct", 2.50, 10.00],
    ["gpt-4o", "azure-ai", 2.50, 10.00],
    ["gpt-4o", "openrouter", 2.55, 10.10],

    ["gpt-4o-mini", "openai-direct", 0.15, 0.60],
    ["gpt-4o-mini", "azure-ai", 0.15, 0.60],
    ["gpt-4o-mini", "openrouter", 0.15, 0.60],

    ["o1", "openai-direct", 15.00, 60.00],
    ["o1", "azure-ai", 15.00, 60.00],

    ["o1-mini", "openai-direct", 3.00, 12.00],
    ["o1-mini", "azure-ai", 3.00, 12.00],

    ["gpt-4-turbo", "openai-direct", 10.00, 30.00],
    ["gpt-4-turbo", "azure-ai", 10.00, 30.00],

    ["gpt-3-5-turbo", "openai-direct", 0.50, 1.50],
    ["gpt-3-5-turbo", "openrouter", 0.50, 1.50],

    // Anthropic models on Anthropic Direct, AWS Bedrock, OpenRouter
    ["claude-3-5-sonnet", "anthropic-direct", 3.00, 15.00],
    ["claude-3-5-sonnet", "aws-bedrock", 3.00, 15.00],
    ["claude-3-5-sonnet", "openrouter", 3.00, 15.00],

    ["claude-3-5-haiku", "anthropic-direct", 0.80, 4.00],
    ["claude-3-5-haiku", "aws-bedrock", 0.80, 4.00],

    ["claude-3-opus", "anthropic-direct", 15.00, 75.00],
    ["claude-3-opus", "aws-bedrock", 15.00, 75.00],

    ["claude-3-sonnet", "anthropic-direct", 3.00, 15.00],
    ["claude-3-sonnet", "aws-bedrock", 3.00, 15.00],

    ["claude-3-haiku", "anthropic-direct", 0.25, 1.25],
    ["claude-3-haiku", "aws-bedrock", 0.25, 1.25],
    ["claude-3-haiku", "openrouter", 0.25, 1.25],

    // Google DeepMind models on Vertex AI, OpenRouter
    ["gemini-1-5-pro", "vertex-ai", 1.25, 5.00],
    ["gemini-1-5-pro", "openrouter", 1.30, 5.20],

    ["gemini-1-5-flash", "vertex-ai", 0.075, 0.30],
    ["gemini-1-5-flash", "openrouter", 0.075, 0.30],

    ["gemini-1-5-flash-8b", "vertex-ai", 0.0375, 0.15],

    ["gemini-1-0-pro", "vertex-ai", 0.50, 1.50],

    ["gemma-2-27b", "vertex-ai", 0.27, 0.27],
    ["gemma-2-27b", "openrouter", 0.27, 0.27],

    // Meta Llama models on AWS Bedrock, Azure AI, OpenRouter
    ["llama-3-1-405b", "aws-bedrock", 2.40, 2.40],
    ["llama-3-1-405b", "azure-ai", 2.40, 2.40],
    ["llama-3-1-405b", "openrouter", 2.50, 2.50],

    ["llama-3-1-70b", "aws-bedrock", 0.72, 0.72],
    ["llama-3-1-70b", "azure-ai", 0.72, 0.72],
    ["llama-3-1-70b", "openrouter", 0.70, 0.70],

    ["llama-3-1-8b", "aws-bedrock", 0.22, 0.22],
    ["llama-3-1-8b", "openrouter", 0.18, 0.18],

    ["llama-3-2-11b-vision", "aws-bedrock", 0.35, 0.35],
    ["llama-3-2-11b-vision", "openrouter", 0.35, 0.35],

    ["llama-3-2-3b", "aws-bedrock", 0.15, 0.15],

    // Mistral models on Azure AI, AWS Bedrock, OpenRouter
    ["mistral-large-2", "azure-ai", 2.00, 6.00],
    ["mistral-large-2", "aws-bedrock", 2.00, 6.00],
    ["mistral-large-2", "openrouter", 2.00, 6.00],

    ["pixtral-12b", "openrouter", 0.15, 0.15],

    ["mistral-nemo", "azure-ai", 0.30, 0.30],
    ["mistral-nemo", "openrouter", 0.30, 0.30],

    ["codestral-22b", "openrouter", 0.20, 0.60],

    // Cohere models on AWS Bedrock, Azure AI
    ["command-r-plus", "aws-bedrock", 2.50, 10.00],
    ["command-r-plus", "azure-ai", 2.50, 10.00],

    ["command-r", "aws-bedrock", 0.50, 1.50],
    ["command-r", "azure-ai", 0.50, 1.50],

    ["command-light", "aws-bedrock", 0.30, 0.60],
  ];

  let modelProviderCount = 0;
  for (const [mSlug, pSlug, inPrice, outPrice] of pricingData) {
    const modelId = models[mSlug];
    const providerId = providers[pSlug];

    if (!modelId || !providerId) {
      console.warn(`Skipping pricing record for ${mSlug} on ${pSlug}: record not found.`);
      continue;
    }

    await prisma.modelProvider.upsert({
      where: {
        modelId_providerId: {
          modelId,
          providerId,
        },
      },
      update: {
        inputPrice: new Prisma.Decimal(inPrice),
        outputPrice: new Prisma.Decimal(outPrice),
        isAvailable: true,
      },
      create: {
        modelId,
        providerId,
        inputPrice: new Prisma.Decimal(inPrice),
        outputPrice: new Prisma.Decimal(outPrice),
        isAvailable: true,
      },
    });
    modelProviderCount++;
  }
  console.log(`✅ Upserted ${modelProviderCount} model provider pricing records.`);

  // ----------------------------------------------------------------------------
  // 6. Benchmark Scores (Sample Illustrative Evaluations)
  // ----------------------------------------------------------------------------
  console.log("📈 Seeding Sample Benchmark Scores...");
  // Mapping: [modelSlug, benchmarkSlug, sampleScorePercentage]
  const scoresData: Array<[string, string, number]> = [
    // GPT-4o
    ["gpt-4o", "mmlu", 88.70],
    ["gpt-4o", "humaneval", 90.20],
    ["gpt-4o", "gsm8k", 95.80],
    ["gpt-4o", "gpqa", 53.60],
    ["gpt-4o", "swe-bench", 38.80],

    // o1
    ["o1", "mmlu", 91.80],
    ["o1", "humaneval", 94.60],
    ["o1", "gsm8k", 98.40],
    ["o1", "gpqa", 77.30],
    ["o1", "swe-bench", 48.90],

    // o1-mini
    ["o1-mini", "mmlu", 85.20],
    ["o1-mini", "humaneval", 92.40],
    ["o1-mini", "gsm8k", 97.00],
    ["o1-mini", "gpqa", 60.00],

    // GPT-4o mini
    ["gpt-4o-mini", "mmlu", 82.00],
    ["gpt-4o-mini", "humaneval", 87.20],
    ["gpt-4o-mini", "gsm8k", 91.60],
    ["gpt-4o-mini", "gpqa", 40.20],

    // Claude 3.5 Sonnet
    ["claude-3-5-sonnet", "mmlu", 88.30],
    ["claude-3-5-sonnet", "humaneval", 93.70],
    ["claude-3-5-sonnet", "gsm8k", 96.40],
    ["claude-3-5-sonnet", "gpqa", 65.00],
    ["claude-3-5-sonnet", "swe-bench", 49.00],

    // Claude 3 Opus
    ["claude-3-opus", "mmlu", 86.80],
    ["claude-3-opus", "humaneval", 84.90],
    ["claude-3-opus", "gsm8k", 95.00],
    ["claude-3-opus", "gpqa", 50.40],

    // Claude 3.5 Haiku
    ["claude-3-5-haiku", "mmlu", 84.10],
    ["claude-3-5-haiku", "humaneval", 88.50],
    ["claude-3-5-haiku", "gsm8k", 92.20],
    ["claude-3-5-haiku", "gpqa", 42.50],

    // Gemini 1.5 Pro
    ["gemini-1-5-pro", "mmlu", 85.90],
    ["gemini-1-5-pro", "humaneval", 84.10],
    ["gemini-1-5-pro", "gsm8k", 91.70],
    ["gemini-1-5-pro", "gpqa", 46.20],

    // Gemini 1.5 Flash
    ["gemini-1-5-flash", "mmlu", 78.90],
    ["gemini-1-5-flash", "humaneval", 74.30],
    ["gemini-1-5-flash", "gsm8k", 86.50],

    // Llama 3.1 405B
    ["llama-3-1-405b", "mmlu", 88.60],
    ["llama-3-1-405b", "humaneval", 89.00],
    ["llama-3-1-405b", "gsm8k", 96.80],
    ["llama-3-1-405b", "gpqa", 51.10],

    // Llama 3.1 70B
    ["llama-3-1-70b", "mmlu", 86.00],
    ["llama-3-1-70b", "humaneval", 80.50],
    ["llama-3-1-70b", "gsm8k", 95.10],
    ["llama-3-1-70b", "gpqa", 46.70],

    // Llama 3.1 8B
    ["llama-3-1-8b", "mmlu", 73.00],
    ["llama-3-1-8b", "humaneval", 72.60],
    ["llama-3-1-8b", "gsm8k", 84.50],

    // Mistral Large 2
    ["mistral-large-2", "mmlu", 84.00],
    ["mistral-large-2", "humaneval", 92.00],
    ["mistral-large-2", "gsm8k", 91.20],
    ["mistral-large-2", "gpqa", 45.00],

    // Codestral 22B
    ["codestral-22b", "humaneval", 81.10],

    // Command R+
    ["command-r-plus", "mmlu", 75.70],
    ["command-r-plus", "humaneval", 71.00],
    ["command-r-plus", "gsm8k", 85.00],
  ];

  let benchmarkScoreCount = 0;
  for (const [mSlug, bSlug, score] of scoresData) {
    const modelId = models[mSlug];
    const benchmarkId = benchmarks[bSlug];

    if (!modelId || !benchmarkId) {
      console.warn(`Skipping score record for ${mSlug} on ${bSlug}: record not found.`);
      continue;
    }

    await prisma.benchmarkScore.upsert({
      where: {
        modelId_benchmarkId: {
          modelId,
          benchmarkId,
        },
      },
      update: {
        score: new Prisma.Decimal(score),
        evaluatedAt: new Date(),
      },
      create: {
        modelId,
        benchmarkId,
        score: new Prisma.Decimal(score),
        evaluatedAt: new Date(),
      },
    });
    benchmarkScoreCount++;
  }
  console.log(`✅ Upserted ${benchmarkScoreCount} sample benchmark score records.`);

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
