-- AI Comparison Tool - Initial Schema
-- Created: January 9, 2025

-- ============================================
-- Functions & Triggers (create first for dependencies)
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Table: forms
-- ============================================

CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT DEFAULT 'application/pdf',
  page_count INTEGER,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_forms_updated_at ON forms;
CREATE TRIGGER set_forms_updated_at BEFORE UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- Table: benchmark_runs
-- ============================================

CREATE TABLE IF NOT EXISTS benchmark_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  total_forms INTEGER DEFAULT 0,
  processed_forms INTEGER DEFAULT 0,
  total_models INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_benchmark_runs_user_id ON benchmark_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_runs_status ON benchmark_runs(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_benchmark_runs_updated_at ON benchmark_runs;
CREATE TRIGGER set_benchmark_runs_updated_at BEFORE UPDATE ON benchmark_runs FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- Table: extraction_results
-- ============================================

CREATE TABLE IF NOT EXISTS extraction_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_run_id UUID REFERENCES benchmark_runs(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'error')),

  -- Extracted data
  structured_output JSONB,
  freeform_output TEXT,
  raw_response JSONB,

  -- Performance metrics
  latency_ms INTEGER,
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  cost DECIMAL(10, 6),

  -- Accuracy metrics
  accuracy_score DECIMAL(5, 4),
  field_matches INTEGER,
  field_mismatches INTEGER,
  missing_fields INTEGER,
  extra_fields INTEGER,

  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_extraction_results_benchmark_run_id ON extraction_results(benchmark_run_id);
CREATE INDEX IF NOT EXISTS idx_extraction_results_form_id ON extraction_results(form_id);
CREATE INDEX IF NOT EXISTS idx_extraction_results_model_id ON extraction_results(model_id);
CREATE INDEX IF NOT EXISTS idx_extraction_results_status ON extraction_results(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_extraction_results_updated_at ON extraction_results;
CREATE TRIGGER set_extraction_results_updated_at BEFORE UPDATE ON extraction_results FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- Table: cost_logs
-- ============================================

CREATE TABLE IF NOT EXISTS cost_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  extraction_result_id UUID REFERENCES extraction_results(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  input_cost DECIMAL(10, 6) NOT NULL,
  output_cost DECIMAL(10, 6) NOT NULL,
  total_cost DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cost_logs_user_id ON cost_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_cost_logs_model_id ON cost_logs(model_id);
CREATE INDEX IF NOT EXISTS idx_cost_logs_created_at ON cost_logs(created_at);

-- ============================================
-- Benchmark Stats Auto-Update Function
-- ============================================

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

DROP TRIGGER IF EXISTS trigger_update_benchmark_stats ON extraction_results;
CREATE TRIGGER trigger_update_benchmark_stats
AFTER INSERT OR UPDATE ON extraction_results
FOR EACH ROW EXECUTE FUNCTION update_benchmark_run_stats();

-- ============================================
-- Disable RLS for demo mode
-- ============================================

ALTER TABLE forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE cost_logs DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Success message
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Initial schema created successfully';
END $$;
