# Project Interview — AI Comparison

**Purpose:** Claude asks these questions before writing any code. Answers populate the project docs.

**Status:** ✅ COMPLETED — January 9, 2025

---

## Section 1: Project Identity (Required)

### 1.1 What is this?
> "Describe this project in one sentence. Who is it for and what does it do?"

**Answer:** LLM benchmarking platform for Blake's team to compare accuracy and cost across multiple AI providers (OpenAI, Anthropic, Google, Meta, xAI, open-source) for insurance intake form extraction.

**Populated:** PROJECT-PLAN.md → Overview ✅

---

### 1.2 What does success look like?
> "Give me 3 measurable outcomes that mean this project succeeded."

**Answer:**
1. Process 1,000+ forms through 10+ different LLM models
2. Achieve cost reduction from $1/file baseline (target: match OpenAI 5.2's $0.42/file or better)
3. Generate accuracy comparison report showing which models match/exceed baseline quality

**Populated:** PROJECT-PLAN.md → Success Criteria ✅

---

### 1.3 Who's the user?
> "Describe the primary user. What's their role, technical level, and main pain point?"

**Answer:**
- **Role:** Blake's team at the insurance company — operations/tech team responsible for form processing
- **Technical Level:** Technical enough to evaluate API outputs, but need a UI to compare without coding
- **Pain Point:** Currently spending ~$1/file on OpenAI 4.2 for form extraction. Want to test if newer or alternative models can do the same job cheaper/better, but don't have capability to test all LLMs

**Populated:** DECISIONS.md → Context ✅

---

## Section 2: Core Features (Required)

### 2.1 What are the 3-5 core things a user can DO?
> "List the main actions/features. Not screens—actions. What verbs describe what users do?"

**Answer:**
1. **Upload forms** — Upload PDF insurance intake forms (up to 1,000+)
2. **Select models** — Choose which LLM models to include in benchmark
3. **Run benchmarks** — Execute extraction across all selected models
4. **Compare results** — View side-by-side output comparison
5. **Export reports** — Generate accuracy vs. cost comparison reports

**Populated:** PROJECT-PLAN.md → Phase 2 Deliverables ✅

---

### 2.2 What's the ONE thing that must work perfectly?
> "If everything else is buggy but this one thing works flawlessly, the project still has value. What is it?"

**Answer:** **The benchmark loop** — Take a form, run it through multiple models, capture output + cost + timing for each. This is the core value proposition. If this works, everything else is reporting on top of it.

**Populated:** PROJECT-PLAN.md → Phase 1 priority ✅

---

### 2.3 What should this NOT do?
> "What's explicitly out of scope? What features will people ask for that we're saying no to?"

**Answer:**
- ❌ Build a production form extraction pipeline (this is benchmarking only)
- ❌ Train or fine-tune custom models
- ❌ Deploy on-premise/self-hosted models
- ❌ Multi-tenant SaaS features (this is an internal tool)
- ❌ Real-time streaming comparison (nice-to-have, not MVP)

**Populated:** PROJECT-PLAN.md → Out of Scope ✅

---

## Section 3: Data & Schema (Required)

### 3.1 What are the main "things" in this app?
> "List the nouns. Users have _____. They create _____. They belong to _____."

**Answer:**
- **Users** — Team members who access the tool
- **Forms** — Uploaded PDF files to be processed
- **Models** — Registry of available LLM models with pricing
- **Benchmark Runs** — Individual benchmark execution sessions
- **Extraction Results** — Output from each model for each form
- **Cost Logs** — Detailed token usage and cost tracking

**Populated:** SCHEMA.md → Tables Overview ✅

---

### 3.2 For each thing, what info do we store?
> "Walk through each noun. What fields does it need?"

**Answer:** See SCHEMA.md for full definitions. Key highlights:
- **Forms:** filename, storage_path, page_count, status
- **Models:** provider, model_id, input_cost_per_1k, output_cost_per_1k, supports_vision, supports_json_mode
- **Extraction Results:** structured_output (JSON), freeform_output (text), latency_ms, tokens, cost, accuracy_score
- **Benchmark Runs:** status, total_forms, processed_forms, total_cost, progress tracking

**Populated:** SCHEMA.md → Table definitions ✅

---

### 3.3 Who can see/edit what?
> "What are the access rules? Users see only their own? Org members see org data? Admins see all?"

**Answer:**
- Users see only their own forms, benchmark runs, and results
- RLS policies on all tables for user isolation
- Models table is public read (no RLS) — everyone sees the same model list
- Admin role can see all data (for debugging/support)

**Populated:** SCHEMA.md → RLS Policies ✅

---

## Section 4: Authentication & Roles (Required)

### 4.1 How do users sign up/in?
> "Email/password? Magic link? Google/Apple OAuth? All of the above?"

**Answer:** Email/password via Supabase Auth. This is an internal tool, so simple auth is fine. Can add OAuth later if needed.

**Populated:** DECISIONS.md → DECISION-008 ✅

---

### 4.2 Are there different user roles?
> "What can different types of users do? Admin vs regular? Free vs paid?"

**Answer:**
- **user** (default) — Can upload forms, run benchmarks, view own results
- **admin** — Same as user + can see all users' data, manage model registry

**Populated:** SCHEMA.md → users table ✅

---

### 4.3 What's protected vs public?
> "What can someone see without logging in? What requires auth?"

**Answer:**
- **Public:** Nothing (must be logged in to see anything)
- **Protected:** Everything — forms, benchmarks, results, reports

**Populated:** API-CONTRACTS.md → Auth requirements ✅

---

## Section 5: Agent Behavior (Required)

### 5.1 What user behaviors do we want to understand?
> "What questions do you want answered about how people use this?"

**Answer:**
- Which models do users select most often?
- How many forms per benchmark run?
- Do users actually look at the comparison reports?
- What's the average cost per benchmark?
- Where do users get stuck?

**Populated:** AGENT-BEHAVIOR.md → Tracking goals ✅

---

### 5.2 What should we NOT track?
> "What's sensitive? Health data? Financial info? Anything HIPAA/privacy related?"

**Answer:**
- ❌ Actual form content (PHI/PII in insurance forms)
- ❌ Extraction outputs (stored separately with RLS, not in analytics)
- ❌ API keys or credentials
- Analytics should only capture aggregate metadata (counts, costs, timing)

**Populated:** AGENT-BEHAVIOR.md → Exclusions ✅

---

### 5.3 What are the key flows to watch?
> "What are the 2-3 user journeys that matter most?"

**Answer:**
1. **Benchmark creation flow:** Upload → Select Models → Run → View Results
2. **Comparison flow:** Open benchmark → Compare outputs → Export report
3. **Cost analysis flow:** View cost breakdown → Identify savings opportunities

**Populated:** AGENT-BEHAVIOR.md → Custom events ✅

---

## Section 6: Technical Preferences (Optional but Recommended)

### 6.1 Any specific libraries or patterns you want?
> "Preferred UI library? State management? Form handling?"

**Answer:**
- **UI:** Tailwind CSS (already included with Next.js)
- **AI:** Vercel AI SDK for unified provider interface
- **Forms:** Zod for validation
- **State:** React Server Components by default, client components only when needed

**Populated:** CLAUDE.md → Conventions, DECISIONS.md ✅

---

### 6.2 Any technical constraints?
> "Existing systems to integrate with? Performance requirements? Offline needs?"

**Answer:**
- Must support large batches (1,000+ forms × 10+ models = 10,000+ API calls)
- Need to handle different rate limits per provider
- Should track costs accurately for billing reconciliation
- No offline requirements

**Populated:** DECISIONS.md → DECISION-006 ✅

---

### 6.3 How should errors be handled?
> "Toast notifications? Error pages? Logging service?"

**Answer:**
- API errors: Return structured error response with code + message
- UI errors: Toast notifications for recoverable, error page for fatal
- Extraction errors: Log to extraction_results.error_message, don't stop entire benchmark
- Track provider API errors separately for debugging

**Populated:** API-CONTRACTS.md → Error Codes ✅

---

## Section 7: Phasing (Required)

### 7.1 What's the MVP?
> "If you had to ship something in 2 weeks, what would be in it?"

**Answer:**
- Basic auth (login/logout)
- Form upload (PDF)
- Single-model extraction working
- Multi-model benchmark execution
- Results viewing (table format)
- Cost tracking per extraction

**Populated:** PROJECT-PLAN.md → Phase 1 ✅

---

### 7.2 What comes after MVP?
> "Once the basics work, what's the first thing you'd add?"

**Answer:**
- Side-by-side comparison view
- Accuracy scoring (vs. baseline)
- Export to CSV/PDF
- Progress tracking for long benchmarks
- Model recommendation based on results

**Populated:** PROJECT-PLAN.md → Phase 2-3 ✅

---

### 7.3 Any hard deadlines?
> "Demo date? Launch date? Client milestone?"

**Answer:** No hard deadline mentioned, but Blake wants to run a comprehensive test soon. Target: working benchmarking capability within 1-2 weeks.

**Populated:** PROJECT-PLAN.md → Target dates ✅

---

## Section 8: Platform Specific (React Native Only)

**N/A** — This is a web application (Next.js), not React Native.

---

## Post-Interview Checklist

After completing the interview, Claude must:

- [x] Update PROJECT-PLAN.md with phases and deliverables
- [x] Update SCHEMA.md with tables and relationships
- [x] Update DECISIONS.md with initial architectural decisions
- [x] Update AGENT-BEHAVIOR.md with tracking configuration
- [x] Update API-CONTRACTS.md with initial endpoint structure
- [x] Update ENV-TEMPLATE.md with required environment variables
- [x] Create initial code structure (lib/ai, lib/supabase, types)
- [x] Read back the summary to the user for confirmation

**Status:** ✅ Interview completed. Project documentation populated. Ready for Phase 1 implementation.
