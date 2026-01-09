# Architectural Decisions

Record of significant technical decisions. Claude should read this before making changes that might conflict with past decisions.

---

## Active Decisions

### [DECISION-001] Use Vercel AI SDK for Multi-Provider LLM Access
**Date:** January 9, 2025
**Status:** Accepted

**Context:**
Need to compare extractions across 10+ LLM models from different providers (OpenAI, Anthropic, Google, Meta, xAI, Mistral). Each provider has different APIs, authentication, and response formats.

**Decision:**
Use Vercel AI SDK (`ai` package with provider packages) to unify the interface across all providers. This gives us:
- Single `generateText()` / `generateObject()` interface
- Built-in streaming support
- Token counting and cost tracking
- Type-safe responses

**Alternatives Considered:**
- Direct API calls to each provider — Too much boilerplate, different error handling
- LangChain — Heavier, more abstraction than needed
- OpenRouter only — Limited to their supported models, another middleman

**Consequences:**
- Unified codebase, easy to add new models
- Dependent on AI SDK maintenance
- Some providers may need `@ai-sdk/openai-compatible` wrapper

---

### [DECISION-002] Compare Against Baseline (No Ground Truth)
**Date:** January 9, 2025
**Status:** Accepted

**Context:**
Blake's team doesn't have verified "correct" outputs for forms. They want to compare new models against their current OpenAI 4.2 outputs.

**Decision:**
Use current OpenAI extraction as the baseline. Measure accuracy as "similarity to baseline" rather than "correctness." Track:
- Exact field matches
- Fuzzy matches (minor differences)
- Missing fields
- Extra fields

**Alternatives Considered:**
- Create ground truth dataset — Time-consuming, delays project
- Use multiple models as consensus — Expensive, complex logic

**Consequences:**
- Faster to implement
- "Accuracy" really means "consistency with baseline"
- If baseline has errors, those become the standard
- Should note this limitation in reports

---

### [DECISION-003] Structured JSON + Freeform Text Output
**Date:** January 9, 2025
**Status:** Accepted

**Context:**
Insurance intake forms have both structured fields (name, DOB, policy number) and freeform text (medical history, notes).

**Decision:**
Request two outputs from each model:
1. `structured_output`: JSON with predefined schema for known fields
2. `freeform_output`: Extracted text for narrative sections

**Alternatives Considered:**
- Single JSON output — Loses nuance in freeform sections
- Single text output — Harder to compare structured data

**Consequences:**
- More comprehensive extraction
- Need to define schema for structured fields
- Comparison logic differs for structured vs. freeform

---

### [DECISION-004] Store All Raw Responses
**Date:** January 9, 2025
**Status:** Accepted

**Context:**
Debugging model differences requires seeing exactly what each model returned.

**Decision:**
Store full API response in `extraction_results.raw_response` JSONB column. Include:
- Full response body
- Token counts
- Finish reason
- Model version

**Consequences:**
- Larger database storage
- Complete audit trail
- Can reprocess/reanalyze without re-running extractions
- Should implement archiving for old data

---

### [DECISION-005] Use Supabase Storage for PDFs
**Date:** January 9, 2025
**Status:** Accepted

**Context:**
Need to store 1000+ PDF forms securely with user isolation.

**Decision:**
Use Supabase Storage with RLS policies. Store files at `forms/{user_id}/{form_id}.pdf`. Keep original filename in database but use UUID for storage path.

**Alternatives Considered:**
- Vercel Blob — Additional service, cost
- S3 directly — More configuration, separate auth
- Local filesystem — Not scalable, deployment issues

**Consequences:**
- Unified auth between database and storage
- Easy to implement user isolation
- Supabase handles CDN/caching
- File size limits apply (default 50MB, configurable)

---

### [DECISION-006] Batch Processing with Queue
**Date:** January 9, 2025
**Status:** Accepted

**Context:**
Running 1000 forms × 10 models = 10,000 API calls. Can't do this synchronously.

**Decision:**
Implement job queue pattern:
1. User creates benchmark_run with selected forms and models
2. Background process picks up pending extractions
3. Updates progress in real-time via Supabase Realtime
4. Handles rate limits and retries per provider

**Alternatives Considered:**
- Synchronous processing — Too slow, timeout issues
- External queue (SQS, Redis) — Additional infrastructure

**Consequences:**
- Better UX with progress tracking
- Can pause/resume benchmarks
- Need to handle partial failures gracefully
- Vercel serverless may need Edge Functions for long-running tasks

---

### [DECISION-007] Server Components by Default
**Date:** January 9, 2025
**Status:** Accepted

**Context:**
Need consistent pattern for component architecture.

**Decision:**
Default to React Server Components. Only use 'use client' when component needs interactivity, hooks, or browser APIs.

**Consequences:**
- Better performance, smaller client bundles
- Must think about data fetching differently
- Some third-party libraries need client wrapper

---

### [DECISION-008] Use Supabase Auth
**Date:** January 9, 2025
**Status:** Accepted

**Context:**
Needed authentication system for team access to benchmark tool.

**Decision:**
Use Supabase Auth because it's already in our stack, integrates with RLS policies, and handles session management.

**Alternatives Considered:**
- Custom JWT — Too much maintenance overhead
- Auth0 — Additional cost and complexity for our scale
- Clerk — Good but another vendor dependency

**Consequences:**
- Simpler architecture, one less service
- Tied to Supabase ecosystem (acceptable trade-off)
- Get RLS integration out of the box

---

## Superseded Decisions
[Move old decisions here when they're replaced]
