# Project Plan: AI Comparison

## Overview
LLM benchmarking platform for insurance intake form extraction. Compares accuracy and cost across multiple AI providers (OpenAI, Anthropic, Google, Meta, xAI, open-source) to find the optimal model for Blake's PDF form processing pipeline. Currently spending ~$1/file on OpenAI 4.2; goal is to find better accuracy-to-cost ratio.

## Success Criteria
- [ ] Process 1,000+ forms through 10+ different LLM models
- [ ] Achieve cost reduction from $1/file baseline (target: match OpenAI 5.2's $0.42/file or better)
- [ ] Generate accuracy comparison report showing which models match/exceed baseline quality
- [ ] Provide clear recommendation on optimal model(s) for production use

---

## Phase 1: Foundation
**Target:** Week 1
**Status:** 🔴 Not Started

### Deliverables
- [ ] Next.js project setup with Vercel AI SDK
- [ ] Supabase project setup + schema for storing forms/results
- [ ] Basic authentication flow (for team access)
- [ ] Environment configuration for all AI provider API keys
- [ ] PDF upload functionality
- [ ] Single-model extraction working (OpenAI baseline)

### Notes
- Need API keys for: OpenAI, Anthropic, Google, Groq (for Llama), xAI
- Forms are insurance intake forms with standard fields
- Output format: structured JSON + freeform text fields

---

## Phase 2: Multi-Model Benchmarking
**Target:** Week 2
**Status:** 🔴 Not Started

### Deliverables
- [ ] Provider registry with all supported models
- [ ] Model switching interface (select models to compare)
- [ ] Batch processing queue for running forms through multiple models
- [ ] Cost tracking per extraction (input tokens, output tokens, total cost)
- [ ] Result storage and comparison
- [ ] Progress tracking UI for long-running benchmarks

### Notes
- Models to support:
  - OpenAI: GPT-4o, GPT-4-turbo, GPT-4.1, o1-mini, o3-mini
  - Anthropic: Claude 3.5 Sonnet, Claude 3 Haiku
  - Google: Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 Flash
  - Meta: Llama 3.1 70B, Llama 3.1 8B (via Groq/Together)
  - xAI: Grok-2
  - Mistral: Mistral Large, Mistral Small
  - Open-source via OpenRouter

---

## Phase 3: Reporting & Analysis
**Target:** Week 3
**Status:** 🔴 Not Started

### Deliverables
- [ ] Accuracy scoring system (field-by-field comparison)
- [ ] Cost analysis dashboard
- [ ] Accuracy vs. Cost scatter plot visualization
- [ ] Export functionality (CSV, PDF report)
- [ ] Model recommendation engine
- [ ] Performance optimization for large batches

### Notes
- Accuracy measured by comparing outputs to baseline (current OpenAI 4.2 outputs)
- Key metrics: exact match %, fuzzy match %, missing fields, extra fields
- Report should clearly show "winners" by category (best accuracy, best cost, best value)

---

## Phase 4: Production Hardening
**Target:** Week 4
**Status:** 🔴 Not Started

### Deliverables
- [ ] Error handling and retry logic
- [ ] Rate limiting per provider
- [ ] API key rotation/management
- [ ] Historical benchmark storage
- [ ] Team sharing and collaboration features
- [ ] Production deployment on Vercel

### Notes
- Different providers have different rate limits
- Need graceful handling of API failures mid-benchmark

---

## Backlog
Items not yet scheduled:
- Real-time streaming comparison (show outputs as they generate)
- Custom prompt engineering per model
- A/B testing interface for prompt variations
- Integration with Blake's existing pipeline
- Automated re-benchmarking when new models release
- Fine-tuning comparison (if applicable)

---

## Out of Scope
- Building a production form extraction pipeline (this is benchmarking only)
- Training custom models
- On-premise/self-hosted model deployment
- Multi-tenant SaaS features

---

## Completed Phases
[Move completed phases here with completion dates]
