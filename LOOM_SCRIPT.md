# OneAtlas — Technical Internship Video Walkthrough Script (7–8 Minutes)

> **Role:** Backend Engineering Intern Candidate  
> **Project:** OneAtlas — AI Model Discovery & Intelligence Platform  
> **Assessment Stage:** Technical Walkthrough & Architecture Presentation  
> **Duration Target:** 7:00 – 8:00 minutes

---

## Walkthrough Timeline Overview

| Section | Time | What to Show on Screen | Key Technical Message |
| :---: | :---: | :--- | :--- |
| **1. Intro** | 0:00 – 0:45 | OneAtlas Homepage Dashboard | Project purpose, problem statement, and scope. |
| **2. Architecture** | 0:45 – 1:45 | `DATABASE_DESIGN.md` ER Diagram & Codebase | System architecture: Next.js App Router, Route Handlers, Zod, Prisma, PostgreSQL. |
| **3. Database Design** | 1:45 – 3:00 | `prisma/schema.prisma` & PostgreSQL tables | Six normalized tables, Decimal pricing, text array capabilities, cascade rules. |
| **4. Backend APIs** | 3:00 – 4:30 | `API_DOCUMENTATION.md` & `/api/health` | Defensive pipeline: Zod validation, error shielding, database-level sorting/pagination. |
| **5. Live Demo** | 4:30 – 6:00 | Live Web App (`/models`, `/compare`, `/rankings`) | Real-time search, multi-filter, 2-4 model comparison matrix, leaderboard. |
| **6. Challenges & Solutions**| 6:00 – 7:00 | Code snippet (`src/lib/prisma.ts` / package.json) | Windows DLL file-locking on Prisma generate & Next.js hot-reload connection pooling. |
| **7. Testing & Conclusion** | 7:00 – 7:45 | Terminal test output (`npm run test:api`) | 13/13 passing automated tests, deployment summary, closing thoughts. |

---

## Detailed Step-by-Step Script

### Section 1: Introduction & Project Scope (0:00 – 0:45)
**Screen:** Homepage (`http://localhost:3000` or deployed Vercel URL)

> *"Hello everyone! My name is [Your Name], and I am excited to present **OneAtlas**, an AI Model Discovery and Intelligence Platform built for the Backend Engineer internship assessment.*
>
> *As generative AI models rapidly proliferate, developers and organizations struggle with fragmented specifications, opaque token pricing structures across hyperscalers, and inconsistent benchmark claims.*
>
> *OneAtlas solves this by creating a centralized, backend-driven platform where developers can search foundation models, filter by technical capabilities, compare multi-provider pricing side-by-side, and inspect empirical benchmark rankings. Today, I'll walk you through our relational architecture, defensive API design, and live demonstration."*

---

### Section 2: System Architecture (0:45 – 1:45)
**Screen:** Show the request flow diagram from `API_DOCUMENTATION.md` or high-level architecture.

> *"Let's examine the system architecture.*
>
> *We selected a modern, cohesive stack centered around Node.js and TypeScript. For our runtime framework, we utilized the Next.js App Router with TypeScript. This gives us high-performance Route Handlers for our REST APIs, alongside server-rendered streaming UI.*
>
> *Every incoming request follows a strict, defensive pipeline:*
> 1. *The client requests an endpoint like `/api/models`.*
> 2. *The Next.js Route Handler passes the raw query parameters into a strict **Zod** validation schema.*
> 3. *If validation fails, execution halts immediately with a structured HTTP 400 response before touching our database.*
> 4. *Valid parameters are executed directly in **PostgreSQL** via **Prisma ORM**, ensuring parameterized queries that eliminate SQL injection vectors.*
> 5. *Finally, our serialization layer formats decimal values safely into JSON, shielding any internal database errors or credentials."*

---

### Section 3: Relational Database Design (1:45 – 3:00)
**Screen:** Open `prisma/schema.prisma` in your code editor.

> *"A core requirement of this assessment was designing a clean, normalized relational database as the single source of truth. We modeled the AI ecosystem into six relational tables in PostgreSQL:*
>
> 1. *First is `Company`, representing AI creators like Anthropic, OpenAI, and Google DeepMind.*
> 2. *Second is `Model`, holding foundation architectures like GPT-4o, Claude 3.5 Sonnet, and Llama 3.1 405B. Rather than creating a heavy sub-table for tags, we leveraged PostgreSQL's native `TEXT[]` array for model capabilities like vision, reasoning, and code.*
> 3. *Third is `Provider`, capturing API hosts like Amazon Bedrock, Microsoft Azure AI, and Vertex AI.*
> 4. *Fourth is our first critical junction table: `ModelProvider`. In the real world, a model is hosted on multiple providers with varying token rates. We enforced a compound unique constraint on `[modelId, providerId]` and used exact SQL `DECIMAL(10, 4)` types for input and output pricing in USD per 1M tokens to avoid floating-point inaccuracies.*
> 5. *Fifth is `Benchmark`, defining standardized evaluation suites like MMLU, HumanEval, and GSM8K.*
> 6. *And sixth is `BenchmarkScore`, our second junction table linking models to benchmark performance with composite unique indexing.*
>
> *We applied this schema via a version-controlled Prisma migration and built an idempotent seed script with upsert logic that populated 6 companies, 6 providers, 28 AI models, 57 pricing tiers, and 57 benchmark scores without risk of duplicate rows."*

---

### Section 4: Backend REST API Engineering (3:00 – 4:30)
**Screen:** Show `src/app/api/models/route.ts` and `src/app/api/health/route.ts`.

> *"Now let's examine the backend REST API engineering.*
>
> *A common junior engineering mistake is fetching the entire database into JavaScript memory and filtering with `Array.prototype.filter()`. In OneAtlas, all search matching (`ILIKE`), company/provider filtering, array containment (`ANY(capabilities)`), sorting, and pagination (`LIMIT/OFFSET`) are pushed down to PostgreSQL.*
>
> *For example, our Model Discovery endpoint at `GET /api/models` accepts nine query parameters validated via Zod. When sorting by token price, it executes an optimized SQL query against `model_providers` to identify the lowest available rate across all cloud providers.*
>
> *In `GET /api/compare`, developers can supply 2 to 4 model identifiers. The endpoint validates the identifiers, queries PostgreSQL, and dynamically compiles an empirical benchmark comparison matrix.*
>
> *To guarantee operational visibility, we created `GET /api/health`, which tests active Node.js uptime and performs a live `SELECT 1` ping against PostgreSQL, reporting exact database connection latency in milliseconds."*

---

### Section 5: Live Platform Demonstration (4:30 – 6:00)
**Screen:** Switch to browser: `http://localhost:3000`.

> *"Let's see this in action on the live platform.*
>
> *On the **Homepage Dashboard**, all metric counters—28 models, 6 research labs, 57 pricing tiers—are computed dynamically from PostgreSQL.*
>
> *Navigating to the **Model Explorer** (`/models`), I can type `claude` in the search bar. The backend returns matching models in real time. If I filter by `Multimodal` architecture and `Vision` capability, the query updates in the URL search parameters and returns matching models with server-side pagination.*
>
> *Clicking on **Claude 3.5 Sonnet** takes us to its detailed view at `/models/claude-3-5-sonnet`. We see its 200,000 token context window, its capabilities, an active pricing comparison across Anthropic Direct, AWS Bedrock, and OpenRouter, and its benchmark scores.*
>
> *Now let's test **Model Comparison** (`/compare`). I'll click our preset comparing **GPT-4o vs Claude 3.5 Sonnet**. The endpoint `/api/compare` builds an automated side-by-side specification table and benchmark matrix, highlighting HumanEval and MMLU comparisons.*
>
> *Lastly, in **Benchmark Rankings** (`/rankings`), we can filter by MMLU or HumanEval to see an interactive leaderboard ranked by score descending."*

---

### Section 6: Key Technical Decisions & Development Challenges (6:00 – 7:00)
**Screen:** Show `src/lib/prisma.ts` in VS Code.

> *"As a senior backend engineer mentor would emphasize, real engineering involves overcoming unexpected environment challenges:*
>
> 1. *Next.js Connection Pool Exhaustion:* In development mode, Next.js hot module replacement (HMR) re-evaluates files on every change. If you instantiate `new PrismaClient()` in API routes, every reload creates a new connection pool, rapidly crashing PostgreSQL. To solve this, we implemented a global singleton pattern (`globalThis.prisma`) in `src/lib/prisma.ts` ensuring a single connection pool across hot reloads.*
> 2. *Prisma Windows DLL File Lock:* During development on Windows, regenerating the Prisma Client while the dev server was holding the `query_engine-windows.dll.node` caused transient `EPERM` file-rename locks. We diagnosed this by inspecting active Node processes holding the binary handle, gracefully stopping the dev server, pinning stable Prisma 6.19.3, and adding a `postinstall: prisma generate` script for cross-platform Linux deployment builds.*
> 3. *Cache Components Dynamic Bailouts:* In Next.js 16, route handlers accessing `request.url` during build prerendering throw dynamic bailout errors. We updated our `handleApiError` middleware to detect and allow Next.js internal dynamic signals to propagate, achieving a clean 17-route static and partial prerendering build."*

---

### Section 7: Testing, Deployment & Conclusion (7:00 – 7:45)
**Screen:** Terminal showing `npm run test:api`.

> *"To ensure high quality, we authored an automated test suite in `scripts/test-apis.js`. Let's run it live in the terminal: `npm run test:api`.*
>
> *(Point to terminal output)*
> *All 13 test scenarios pass cleanly—covering model listing, search queries, combined filters, context window sorting, token price sorting, pagination limits, 404 missing resource handling, and Zod 400 validation.*
>
> *We pushed our code to a public GitHub repository at `oneatlas-ai-platform`, deployed the application on Vercel backed by our hosted PostgreSQL database, and verified production health.*
>
> *Thank you very much for your time and for reviewing OneAtlas. I look forward to your questions during the technical interview!"*

---

## Filming Checklist
- [ ] Open browser with Homepage (`/`), Explorer (`/models`), Compare (`/compare`), and Rankings (`/rankings`).
- [ ] Open code editor with `prisma/schema.prisma` and `src/lib/prisma.ts`.
- [ ] Have terminal ready in project root to execute `npm run test:api`.
- [ ] Test microphone audio levels.
- [ ] Record cleanly within the 7–8 minute target!
