# Current Tasks

**Last Updated:** January 9, 2025
**Current Phase:** Phase 1 - Foundation

---

## In Progress

### Build Foundation UI and API Routes
- **Started:** January 9, 2025
- **Context:** Infrastructure complete, need to build actual UI and API endpoints
- **Files Touched:**
  - (Not started yet)
- **Status Notes:** Ready to begin implementation

---

## Completed This Session (January 9, 2025)

### Infrastructure Setup
- [x] Created Supabase project (ID: rstpvkotrasqzwgamuqf)
- [x] Applied database schema migration (6 tables with RLS)
- [x] Seeded 22 LLM models from OpenRouter
- [x] Updated code to use OpenRouter (single API key for all providers)
- [x] Pushed to GitHub: https://github.com/yndrdev/aicompare
- [x] Deployed to Vercel: https://ai-comparison.vercel.app

### Resources Created
- **Supabase URL:** https://rstpvkotrasqzwgamuqf.supabase.co
- **Vercel URL:** https://ai-comparison.vercel.app
- **GitHub Repo:** https://github.com/yndrdev/aicompare

---

## Up Next

1. **Create layout and navigation** — Dashboard layout with sidebar
2. **Build form upload page** — Drag-and-drop PDF upload with Supabase Storage
3. **Create models API** — List available models from registry
4. **Build extraction API** — Single form extraction endpoint
5. **Create benchmark API** — Create and manage benchmark runs
6. **Build results viewing page** — Display extraction results

---

## Blocked

None currently.

---

## Completed This Sprint

- [x] **Project documentation structure** — Completed January 9, 2025
- [x] **Requirements gathering from meeting notes** — Completed January 9, 2025
- [x] **PROJECT-INTERVIEW.md completed** — Completed January 9, 2025
- [x] **All 9 project docs populated** — Completed January 9, 2025
- [x] **Next.js project initialized** — Completed January 9, 2025
- [x] **Vercel AI SDK installed and configured** — Completed January 9, 2025
- [x] **Provider registry created (15 models)** — Completed January 9, 2025
- [x] **Extraction service created** — Completed January 9, 2025
- [x] **Supabase client configured** — Completed January 9, 2025
- [x] **TypeScript types defined** — Completed January 9, 2025

---

## Session Notes

### January 9, 2025 Session — Initial Setup
**Duration:** ~30 minutes
**Phase:** Pre-Phase 1 → Phase 1 Ready

**What was accomplished:**
1. Created project structure at `/Users/yndr/ai-comparison`
2. Initialized Next.js 16 with TypeScript, Tailwind, App Router
3. Installed Vercel AI SDK and all provider packages:
   - @ai-sdk/openai
   - @ai-sdk/anthropic
   - @ai-sdk/google
   - @ai-sdk/openai-compatible (for Groq, xAI, Mistral, Together, Fireworks)
4. Installed Supabase SSR and Zod
5. Created all 9 project docs based on template:
   - CLAUDE.md (project context)
   - PROJECT-PLAN.md (4 phases)
   - PROJECT-INTERVIEW.md (completed with meeting context)
   - TASKS.md (this file)
   - SCHEMA.md (6 tables)
   - DECISIONS.md (8 architectural decisions)
   - API-CONTRACTS.md (full endpoint specs)
   - AGENT-BEHAVIOR.md (tracking config)
   - DOC-ENFORCEMENT.md (rules for Claude)
   - ENV-TEMPLATE.md (environment variables)
6. Created code infrastructure:
   - src/lib/ai/providers.ts — 15 models across 7 providers
   - src/lib/ai/extract.ts — Extraction service
   - src/lib/supabase/client.ts — Browser client
   - src/lib/supabase/server.ts — Server client
   - src/types/database.ts — TypeScript types for all tables

**Key context from meeting:**
- Blake's team processes hundreds of insurance intake forms
- Currently using OpenAI 4.2 at ~$1/file
- OpenAI 5.2 can do it for ~$0.42/file
- Want to test ALL models to find best accuracy/cost ratio
- Forms have standard structured fields + freeform text
- No ground truth — comparing outputs against baseline
- Volume: 1,000+ forms is acceptable for benchmarking

**Models configured:**
- OpenAI: gpt-4o, gpt-4o-mini, gpt-4-turbo, o1-mini, o3-mini
- Anthropic: claude-3-5-sonnet, claude-3-haiku
- Google: gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash-exp
- Groq: llama-3.1-70b, llama-3.1-8b
- xAI: grok-2-latest
- Mistral: mistral-large, mistral-small

**Decisions made:**
- Use Vercel AI SDK for unified LLM interface (DECISION-001)
- Compare against baseline (no ground truth) (DECISION-002)
- Structured JSON + Freeform text output (DECISION-003)
- Store all raw responses (DECISION-004)
- Use Supabase Storage for PDFs (DECISION-005)
- Batch processing with queue pattern (DECISION-006)
- Server Components by default (DECISION-007)
- Use Supabase Auth (DECISION-008)

**Next session should:**
1. Create Supabase project and run schema migration
2. Add API keys to .env.local
3. Build the form upload UI
4. Create the API routes
5. Get first extraction working end-to-end
