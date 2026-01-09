# Agent Behavior Configuration

**Purpose:** Track usage patterns and identify optimization opportunities in the benchmarking workflow.

---

## Agent Overview

For this project, "agent behavior" refers to tracking how users interact with the benchmarking tool to identify UX improvements and feature priorities.

### What We Track
- Benchmark creation patterns (which models selected, how many forms)
- Time to complete benchmarks
- Most/least used models
- Export format preferences
- Error patterns and recovery
- Feature adoption (comparison view, reports, etc.)

### What We Do NOT Track
- Actual form content (PHI/PII in insurance forms)
- API keys or credentials
- Raw extraction outputs (stored separately with RLS)
- Individual user browsing patterns beyond the app

---

## Event Definitions

### Standard Events

| Event | Trigger | Data Captured |
|-------|---------|---------------|
| `page_view` | Route change | route, referrer, timestamp |
| `benchmark_created` | New benchmark run | model_count, form_count, estimated_cost |
| `benchmark_started` | Run initiated | benchmark_id |
| `benchmark_completed` | Run finished | benchmark_id, duration_min, total_cost, success_rate |
| `benchmark_cancelled` | Run cancelled | benchmark_id, progress_percent, reason |
| `forms_uploaded` | Forms added | file_count, total_size_mb |
| `comparison_viewed` | Side-by-side view | benchmark_id, models_compared |
| `report_exported` | Export action | benchmark_id, format (json/csv/pdf) |
| `model_selected` | Model toggled | model_id, action (add/remove) |
| `error_encounter` | API or UI error | error_type, route, context |

### Custom Events

```typescript
// Track model preference patterns
trackEvent('model_preference', {
  most_selected: ['gpt-4o', 'claude-3-5-sonnet'],
  never_selected: ['mistral-small'],
  session_count: 5
});

// Track cost awareness
trackEvent('cost_estimate_viewed', {
  benchmark_id: 'uuid',
  estimated_cost: 12.50,
  proceeded: true
});

// Track comparison behavior
trackEvent('field_comparison_drilldown', {
  benchmark_id: 'uuid',
  field_name: 'patient_name',
  models_compared: ['gpt-4o', 'claude-3-5-sonnet']
});
```

---

## Key Metrics to Monitor

### Usage Metrics
- Daily active users
- Benchmarks created per user
- Forms processed per day
- Total API spend per day

### Performance Metrics
- Average benchmark duration
- Extraction success rate by model
- Most common error types
- Queue processing time

### Business Metrics
- Cost per extraction by model
- Cost savings vs. baseline
- Model recommendation accuracy
- Report export frequency

---

## Insights We Want

### Model Performance
- Which models have highest success rates?
- Which models are fastest?
- Which models provide best cost/accuracy ratio?
- Are there form types that certain models handle better?

### User Behavior
- Do users compare all models or just a few?
- How often do users re-run benchmarks?
- What prompts users to export reports?
- Where do users drop off in the workflow?

### Product Optimization
- Which features are underused?
- What errors cause benchmark failures?
- How can we reduce time-to-insight?
- What additional models should we support?

---

## Implementation

### Event Tracking (lib/analytics/tracker.ts)
```typescript
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  // Implementation depends on analytics provider
  // Options: Supabase custom table, PostHog, Mixpanel, etc.

  // For MVP, log to Supabase analytics table
  supabase.from('analytics_events').insert({
    user_id: getCurrentUserId(),
    event,
    properties,
    timestamp: new Date().toISOString()
  });
};
```

### Analytics Table
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_event ON analytics_events(event);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp);
```

---

## Privacy & Compliance

### Data Handling
- No PHI from forms is tracked in analytics
- User IDs are internal UUIDs, not emails
- Event properties contain aggregate data only
- Raw extraction results are NOT part of analytics

### Retention
- Analytics events: 90 days
- Aggregated metrics: Indefinite
- Can be purged on user request

---

## Dashboard Ideas (Future)

1. **Model Leaderboard** — Accuracy vs. Cost scatter plot
2. **Usage Trends** — Benchmarks over time, popular models
3. **Cost Tracker** — Spend by model, projected monthly costs
4. **Error Monitor** — Common failures, provider status

---

## Notes for Claude

1. Keep analytics lightweight — don't slow down the app
2. Never track form content or extraction outputs in analytics
3. Focus on actionable metrics that improve the product
4. Update this doc when adding new tracked events
