# Project Context

## CRITICAL: Read This Every Session

1. **New Project?** → Run PROJECT-INTERVIEW.md first. No coding until docs are filled.
2. **Returning?** → Read TASKS.md and PROJECT-PLAN.md before doing anything.
3. **Making changes?** → Check the relevant doc first. Update it after.
4. **Unsure?** → Ask. Don't guess. Don't assume.

See docs/DOC-ENFORCEMENT.md for full rules.

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| [PROJECT-PLAN.md](docs/PROJECT-PLAN.md) | Phases, deliverables, success criteria |
| [PROJECT-INTERVIEW.md](docs/PROJECT-INTERVIEW.md) | Completed requirements interview |
| [TASKS.md](docs/TASKS.md) | Current tasks, session notes |
| [SCHEMA.md](docs/SCHEMA.md) | Database tables, RLS policies |
| [DECISIONS.md](docs/DECISIONS.md) | Architectural decisions log |
| [API-CONTRACTS.md](docs/API-CONTRACTS.md) | API endpoint specifications |
| [AGENT-BEHAVIOR.md](docs/AGENT-BEHAVIOR.md) | Analytics and tracking config |
| [DOC-ENFORCEMENT.md](docs/DOC-ENFORCEMENT.md) | Rules Claude must follow |
| [ENV-TEMPLATE.md](docs/ENV-TEMPLATE.md) | Environment variables guide |

---

## Stack
- **Framework:** Next.js 14+ (App Router)
- **Database:** Supabase (Postgres + Auth + Storage)
- **Hosting:** Vercel
- **AI Integration:** Vercel AI SDK (`ai` package) for multi-provider LLM switching
- **Supported LLM Providers:**
  - OpenAI (GPT-4o, GPT-4-turbo, GPT-4.1, o1, o3)
  - Anthropic (Claude 3.5, Claude 3)
  - Google (Gemini 1.5, Gemini 2.0)
  - Meta (Llama 3.x via Groq/Together/Fireworks)
  - xAI (Grok)
  - Mistral
  - Open-source via OpenRouter

## Directory Structure
```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth-grouped routes
│   ├── (dashboard)/       # Protected routes
│   ├── api/               # API routes
│   │   ├── extract/       # Form extraction endpoint
│   │   ├── benchmark/     # Benchmark execution
│   │   └── results/       # Results retrieval
│   └── layout.tsx
├── components/
│   ├── ui/                # Reusable UI components
│   ├── forms/             # Form upload components
│   ├── benchmark/         # Benchmark UI components
│   └── results/           # Results visualization
├── lib/
│   ├── supabase/          # Supabase client configs
│   ├── ai/                # AI SDK provider configs
│   │   ├── providers.ts   # Provider registry
│   │   ├── models.ts      # Model definitions
│   │   └── pricing.ts     # Cost tracking
│   └── utils/             # Helper functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
├── docs/                  # Project documentation
│   ├── PROJECT-PLAN.md      # Phases and deliverables
│   ├── PROJECT-INTERVIEW.md # Requirements interview (completed)
│   ├── TASKS.md             # Task tracking
│   ├── SCHEMA.md            # Database schema
│   ├── DECISIONS.md         # Architecture decisions
│   ├── API-CONTRACTS.md     # API specifications
│   ├── AGENT-BEHAVIOR.md    # Analytics config
│   ├── DOC-ENFORCEMENT.md   # Rules for Claude
│   └── ENV-TEMPLATE.md      # Environment variables
└── supabase/
    └── migrations/        # Database migrations
```

## Commands
```bash
npm run dev              # Local dev server
npm run build            # Production build
npm run lint             # ESLint
npm run type-check       # TypeScript check
npx supabase db push     # Push migrations
npx supabase gen types   # Generate TypeScript types from schema
vercel --prod            # Deploy to production
```

## Session Start Protocol

Every session, Claude must:
```
📍 Current Phase: [Read from PROJECT-PLAN.md]
📋 Current Task: [Read from TASKS.md]
📖 Last Session: [Read from TASKS.md session notes]

"Ready to continue. What are we working on?"
```

## Before Making Changes

| Change Type | Read First | Update After |
|-------------|------------|--------------|
| Database | SCHEMA.md | SCHEMA.md |
| API | API-CONTRACTS.md | API-CONTRACTS.md |
| Architecture | DECISIONS.md | DECISIONS.md |
| New feature | PROJECT-PLAN.md | TASKS.md |
| AI Providers | lib/ai/providers.ts | DECISIONS.md |

## Conventions
- Use server components by default, client components only when needed
- All database queries go through lib/supabase
- All LLM calls go through Vercel AI SDK unified interface
- Environment variables: .env.local (never commit)
- Row Level Security (RLS) required on all tables
- All API routes validate input with Zod
- Track cost per extraction in every benchmark run

## End of Session Protocol

Before ending:
1. Update TASKS.md with progress
2. Note any blockers or decisions made
3. State what comes next

---

## Quick Reference: Enforcement Phrases

User can say these to keep Claude on track:

| Phrase | What Claude Does |
|--------|------------------|
| "Check the docs" | Re-read relevant docs |
| "Are you following the plan?" | Quote current phase/task |
| "Document this first" | Add to DECISIONS.md before coding |
| "What phase are we in?" | State phase and progress |
| "Update the docs" | Update all relevant docs |
