# Database Schema

**Database:** Supabase (PostgreSQL)
**Last Updated:** January 9, 2025

Claude: Read this before any database changes. Update this file after schema modifications.

---

## Tables Overview

| Table | Purpose | RLS |
|-------|---------|-----|
| `users` | Extended user profiles | ✅ |
| `forms` | Uploaded PDF forms for benchmarking | ✅ |
| `models` | Registry of available LLM models | ❌ (public read) |
| `benchmark_runs` | Individual benchmark execution records | ✅ |
| `extraction_results` | Results from each model extraction | ✅ |
| `cost_logs` | Token usage and cost tracking | ✅ |

---

## Table: users

Extended profile data linked to Supabase Auth.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

---

## Table: forms

Uploaded PDF forms to be processed.

```sql
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,  -- Supabase Storage path
  mime_type TEXT DEFAULT 'application/pdf',
  page_count INTEGER,
  metadata JSONB DEFAULT '{}',  -- Additional form metadata
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own forms"
  ON forms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own forms"
  ON forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms"
  ON forms FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_forms_user_id ON forms(user_id);
CREATE INDEX idx_forms_status ON forms(status);
```

---

## Table: models

Registry of available LLM models with pricing info.

```sql
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,  -- openai, anthropic, google, meta, xai, mistral, openrouter
  model_id TEXT NOT NULL UNIQUE,  -- e.g., 'gpt-4o', 'claude-3-5-sonnet'
  display_name TEXT NOT NULL,
  input_cost_per_1k DECIMAL(10, 6) NOT NULL,  -- Cost per 1K input tokens
  output_cost_per_1k DECIMAL(10, 6) NOT NULL,  -- Cost per 1K output tokens
  context_window INTEGER,  -- Max context size
  supports_vision BOOLEAN DEFAULT false,
  supports_json_mode BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS - public read access for model list
-- Seed data will be inserted via migration
```

---

## Table: benchmark_runs

Individual benchmark execution tracking.

```sql
CREATE TABLE benchmark_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,  -- Optional name for the run
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  total_forms INTEGER DEFAULT 0,
  processed_forms INTEGER DEFAULT 0,
  total_models INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  config JSONB DEFAULT '{}',  -- Benchmark configuration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE benchmark_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own benchmark runs"
  ON benchmark_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own benchmark runs"
  ON benchmark_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own benchmark runs"
  ON benchmark_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_benchmark_runs_user_id ON benchmark_runs(user_id);
CREATE INDEX idx_benchmark_runs_status ON benchmark_runs(status);
```

---

## Table: extraction_results

Results from each model's extraction attempt.

```sql
CREATE TABLE extraction_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_run_id UUID REFERENCES benchmark_runs(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  model_id TEXT REFERENCES models(model_id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'error')),

  -- Extracted data
  structured_output JSONB,  -- Structured JSON fields
  freeform_output TEXT,     -- Freeform text extraction
  raw_response JSONB,       -- Full API response for debugging

  -- Performance metrics
  latency_ms INTEGER,       -- Time to complete extraction
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  cost DECIMAL(10, 6),      -- Calculated cost for this extraction

  -- Accuracy metrics (calculated later)
  accuracy_score DECIMAL(5, 4),  -- 0.0000 to 1.0000
  field_matches INTEGER,
  field_mismatches INTEGER,
  missing_fields INTEGER,
  extra_fields INTEGER,

  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE extraction_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view results for own benchmark runs"
  ON extraction_results FOR SELECT
  USING (
    benchmark_run_id IN (
      SELECT id FROM benchmark_runs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert results for own benchmark runs"
  ON extraction_results FOR INSERT
  WITH CHECK (
    benchmark_run_id IN (
      SELECT id FROM benchmark_runs WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_extraction_results_benchmark_run_id ON extraction_results(benchmark_run_id);
CREATE INDEX idx_extraction_results_form_id ON extraction_results(form_id);
CREATE INDEX idx_extraction_results_model_id ON extraction_results(model_id);
CREATE INDEX idx_extraction_results_status ON extraction_results(status);
```

---

## Table: cost_logs

Detailed token usage and cost tracking.

```sql
CREATE TABLE cost_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  extraction_result_id UUID REFERENCES extraction_results(id) ON DELETE CASCADE,
  model_id TEXT REFERENCES models(model_id),
  provider TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  input_cost DECIMAL(10, 6) NOT NULL,
  output_cost DECIMAL(10, 6) NOT NULL,
  total_cost DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE cost_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cost logs"
  ON cost_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_cost_logs_user_id ON cost_logs(user_id);
CREATE INDEX idx_cost_logs_model_id ON cost_logs(model_id);
CREATE INDEX idx_cost_logs_created_at ON cost_logs(created_at);
```

---

## Functions & Triggers

### handle_updated_at()
Automatically updates `updated_at` timestamp.

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON models FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON benchmark_runs FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON extraction_results FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

### update_benchmark_run_stats()
Automatically updates benchmark run statistics.

```sql
CREATE OR REPLACE FUNCTION update_benchmark_run_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE benchmark_runs
  SET
    processed_forms = (
      SELECT COUNT(DISTINCT form_id)
      FROM extraction_results
      WHERE benchmark_run_id = NEW.benchmark_run_id
      AND status = 'success'
    ),
    total_cost = (
      SELECT COALESCE(SUM(cost), 0)
      FROM extraction_results
      WHERE benchmark_run_id = NEW.benchmark_run_id
    ),
    updated_at = NOW()
  WHERE id = NEW.benchmark_run_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_benchmark_stats
AFTER INSERT OR UPDATE ON extraction_results
FOR EACH ROW EXECUTE FUNCTION update_benchmark_run_stats();
```

---

## Seed Data: Models

```sql
INSERT INTO models (provider, model_id, display_name, input_cost_per_1k, output_cost_per_1k, context_window, supports_vision, supports_json_mode) VALUES
-- OpenAI
('openai', 'gpt-4o', 'GPT-4o', 0.0025, 0.010, 128000, true, true),
('openai', 'gpt-4o-mini', 'GPT-4o Mini', 0.00015, 0.0006, 128000, true, true),
('openai', 'gpt-4-turbo', 'GPT-4 Turbo', 0.01, 0.03, 128000, true, true),
('openai', 'o1-mini', 'o1 Mini', 0.003, 0.012, 128000, false, false),
('openai', 'o3-mini', 'o3 Mini', 0.0011, 0.0044, 200000, false, false),

-- Anthropic
('anthropic', 'claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 0.003, 0.015, 200000, true, true),
('anthropic', 'claude-3-haiku-20240307', 'Claude 3 Haiku', 0.00025, 0.00125, 200000, true, true),

-- Google
('google', 'gemini-1.5-pro', 'Gemini 1.5 Pro', 0.00125, 0.005, 2000000, true, true),
('google', 'gemini-1.5-flash', 'Gemini 1.5 Flash', 0.000075, 0.0003, 1000000, true, true),
('google', 'gemini-2.0-flash-exp', 'Gemini 2.0 Flash', 0.0001, 0.0004, 1000000, true, true),

-- Meta (via Groq)
('groq', 'llama-3.1-70b-versatile', 'Llama 3.1 70B', 0.00059, 0.00079, 131072, false, true),
('groq', 'llama-3.1-8b-instant', 'Llama 3.1 8B', 0.00005, 0.00008, 131072, false, true),

-- xAI
('xai', 'grok-2-latest', 'Grok 2', 0.002, 0.01, 131072, true, true),

-- Mistral
('mistral', 'mistral-large-latest', 'Mistral Large', 0.002, 0.006, 128000, false, true),
('mistral', 'mistral-small-latest', 'Mistral Small', 0.0002, 0.0006, 32000, false, true);
```

---

## Migration History

| Version | Description | Date |
|---------|-------------|------|
| 001 | Initial schema with all tables | Pending |
| 002 | Seed model pricing data | Pending |

---

## Notes for Claude

1. Always use RLS policies — no exceptions
2. Generate TypeScript types after schema changes: `npx supabase gen types typescript --local > types/database.ts`
3. Test RLS policies manually before deploying
4. Foreign keys should CASCADE on delete unless business logic requires otherwise
5. Model pricing should be updated regularly as providers change rates
6. Keep extraction_results.raw_response for debugging but consider archiving old data
