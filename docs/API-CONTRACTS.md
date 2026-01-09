# API Contracts

**Base URL:** `/api`
**Last Updated:** January 9, 2025

Claude: Reference this before creating or modifying API routes. Update when adding new endpoints.

---

## Authentication

All protected routes require Supabase session cookie. Session is automatically handled by `@supabase/ssr`.

### Getting Current User in API Routes
```typescript
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Continue with authenticated request
}
```

---

## Response Format

All API responses follow this structure:

### Success
```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

### Error Codes
| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `UNAUTHORIZED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | Logged in but not allowed |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `PROVIDER_ERROR` | 502 | AI provider API error |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Endpoints

### Forms

#### POST /api/forms/upload
Upload PDF forms for benchmarking.

**Auth:** Required

**Content-Type:** `multipart/form-data`

**Body:**
- `files`: PDF file(s) (max 50MB each, max 100 files per request)

**Response (201):**
```json
{
  "data": {
    "uploaded": [
      {
        "id": "uuid",
        "filename": "form_001.pdf",
        "original_name": "Patient Intake Form.pdf",
        "file_size": 245678,
        "page_count": 3,
        "status": "uploaded"
      }
    ],
    "failed": [
      {
        "filename": "bad_file.pdf",
        "error": "File exceeds maximum size"
      }
    ]
  },
  "meta": {
    "total_uploaded": 5,
    "total_failed": 1
  }
}
```

---

#### GET /api/forms
List all forms for current user.

**Auth:** Required

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `status` | string | all | Filter by status |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "filename": "form_001.pdf",
      "original_name": "Patient Intake Form.pdf",
      "file_size": 245678,
      "page_count": 3,
      "status": "uploaded",
      "created_at": "2025-01-09T00:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

#### DELETE /api/forms/:id
Delete a form.

**Auth:** Required (must own form)

**Response:** 204 No Content

---

### Models

#### GET /api/models
List all available LLM models.

**Auth:** Required

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `provider` | string | all | Filter by provider |
| `active` | boolean | true | Only active models |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "provider": "openai",
      "model_id": "gpt-4o",
      "display_name": "GPT-4o",
      "input_cost_per_1k": 0.0025,
      "output_cost_per_1k": 0.01,
      "context_window": 128000,
      "supports_vision": true,
      "supports_json_mode": true,
      "is_active": true
    }
  ]
}
```

---

### Benchmarks

#### POST /api/benchmarks
Create a new benchmark run.

**Auth:** Required

**Body:**
```json
{
  "name": "Q1 2025 Model Comparison",
  "description": "Testing new models against baseline",
  "form_ids": ["uuid1", "uuid2", "uuid3"],
  "model_ids": ["gpt-4o", "claude-3-5-sonnet-20241022", "gemini-1.5-pro"],
  "config": {
    "baseline_model": "gpt-4o",
    "extraction_prompt": "Extract all fields from this insurance form...",
    "output_schema": { ... }
  }
}
```

**Validation (Zod):**
```typescript
const createBenchmarkSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  form_ids: z.array(z.string().uuid()).min(1).max(1000),
  model_ids: z.array(z.string()).min(1).max(20),
  config: z.object({
    baseline_model: z.string().optional(),
    extraction_prompt: z.string().optional(),
    output_schema: z.record(z.any()).optional()
  }).optional()
});
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Q1 2025 Model Comparison",
    "status": "pending",
    "total_forms": 100,
    "total_models": 5,
    "total_extractions": 500,
    "estimated_cost": 12.50,
    "created_at": "2025-01-09T00:00:00Z"
  }
}
```

---

#### GET /api/benchmarks
List all benchmark runs.

**Auth:** Required

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `status` | string | all | Filter by status |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Q1 2025 Model Comparison",
      "status": "running",
      "total_forms": 100,
      "processed_forms": 45,
      "total_models": 5,
      "total_cost": 5.62,
      "progress_percent": 45,
      "created_at": "2025-01-09T00:00:00Z"
    }
  ],
  "meta": { "total": 10, "page": 1, "limit": 20 }
}
```

---

#### GET /api/benchmarks/:id
Get benchmark run details.

**Auth:** Required

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Q1 2025 Model Comparison",
    "description": "Testing new models",
    "status": "completed",
    "total_forms": 100,
    "processed_forms": 100,
    "total_models": 5,
    "total_cost": 12.34,
    "started_at": "2025-01-09T00:00:00Z",
    "completed_at": "2025-01-09T01:30:00Z",
    "config": { ... },
    "summary": {
      "models": [
        {
          "model_id": "gpt-4o",
          "extractions": 100,
          "success_rate": 0.99,
          "avg_latency_ms": 2500,
          "total_cost": 2.50,
          "avg_accuracy": 0.95
        }
      ]
    }
  }
}
```

---

#### POST /api/benchmarks/:id/start
Start a pending benchmark run.

**Auth:** Required

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "running",
    "started_at": "2025-01-09T00:00:00Z"
  }
}
```

---

#### POST /api/benchmarks/:id/cancel
Cancel a running benchmark.

**Auth:** Required

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "cancelled"
  }
}
```

---

### Results

#### GET /api/benchmarks/:id/results
Get extraction results for a benchmark.

**Auth:** Required

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 50 | Items per page |
| `model_id` | string | all | Filter by model |
| `form_id` | string | all | Filter by form |
| `status` | string | all | Filter by status |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "form_id": "uuid",
      "form_name": "form_001.pdf",
      "model_id": "gpt-4o",
      "status": "success",
      "structured_output": { ... },
      "freeform_output": "Patient presents with...",
      "latency_ms": 2345,
      "input_tokens": 1500,
      "output_tokens": 800,
      "cost": 0.0115,
      "accuracy_score": 0.95,
      "created_at": "2025-01-09T00:00:00Z"
    }
  ],
  "meta": { "total": 500, "page": 1, "limit": 50 }
}
```

---

#### GET /api/benchmarks/:id/compare
Get side-by-side comparison of model outputs.

**Auth:** Required

**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `form_id` | string | Yes | Form to compare |
| `model_ids` | string | No | Comma-separated models (default: all) |

**Response:**
```json
{
  "data": {
    "form": {
      "id": "uuid",
      "filename": "form_001.pdf"
    },
    "comparisons": [
      {
        "model_id": "gpt-4o",
        "structured_output": { ... },
        "freeform_output": "...",
        "cost": 0.0115,
        "latency_ms": 2345,
        "accuracy_score": 0.95
      },
      {
        "model_id": "claude-3-5-sonnet",
        "structured_output": { ... },
        "freeform_output": "...",
        "cost": 0.0098,
        "latency_ms": 1890,
        "accuracy_score": 0.97
      }
    ],
    "field_comparison": {
      "patient_name": {
        "gpt-4o": "John Smith",
        "claude-3-5-sonnet": "John Smith",
        "match": true
      },
      "dob": {
        "gpt-4o": "1985-03-15",
        "claude-3-5-sonnet": "03/15/1985",
        "match": "fuzzy"
      }
    }
  }
}
```

---

#### GET /api/benchmarks/:id/report
Export benchmark report.

**Auth:** Required

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `format` | string | json | Export format: json, csv, pdf |

**Response:**
- `json`: JSON report data
- `csv`: CSV file download
- `pdf`: PDF report download

---

### Extract (Single Extraction)

#### POST /api/extract
Run a single extraction (for testing/preview).

**Auth:** Required

**Body:**
```json
{
  "form_id": "uuid",
  "model_id": "gpt-4o",
  "prompt": "Extract all fields from this insurance form..."
}
```

**Response:**
```json
{
  "data": {
    "structured_output": {
      "patient_name": "John Smith",
      "dob": "1985-03-15",
      "policy_number": "POL-123456"
    },
    "freeform_output": "Patient presents with history of...",
    "latency_ms": 2345,
    "input_tokens": 1500,
    "output_tokens": 800,
    "cost": 0.0115
  }
}
```

---

## Rate Limiting

| Endpoint Pattern | Limit |
|------------------|-------|
| `/api/auth/*` | 10 req/min |
| `/api/extract` | 30 req/min (API costs) |
| `/api/*` (authenticated) | 100 req/min |

---

## Webhooks (Future)

### POST /api/webhooks/benchmark-complete
Notify when benchmark completes.

**Payload:**
```json
{
  "event": "benchmark.completed",
  "benchmark_id": "uuid",
  "status": "completed",
  "total_cost": 12.34,
  "completed_at": "2025-01-09T01:30:00Z"
}
```

---

## Notes for Claude

1. Always validate input with Zod schemas
2. Always check user ownership before update/delete
3. Use consistent error response format
4. Log errors but don't expose internal details to client
5. Track API costs in cost_logs table
6. Respect provider rate limits (handled in extraction service)
7. Update this doc when adding new endpoints
