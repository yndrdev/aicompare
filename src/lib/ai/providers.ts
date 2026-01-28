/**
 * AI Provider Registry - OpenRouter Edition
 *
 * Uses OpenRouter as a unified gateway to access 200+ LLM models
 * with a single API key. Much simpler than managing multiple provider keys.
 *
 * OpenRouter benefits:
 * - Single API key for all models
 * - Built-in cost tracking
 * - Automatic fallbacks
 * - Unified rate limiting
 *
 * @see https://openrouter.ai/docs
 */

import { createOpenAI } from "@ai-sdk/openai";

// Create OpenRouter client (OpenAI-compatible)
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "AI Comparison Tool",
  },
});

// Provider categories for UI grouping
export type ProviderCategory =
  | "openai"
  | "anthropic"
  | "google"
  | "meta"
  | "mistral"
  | "xai"
  | "deepseek"
  | "qwen"
  | "other";

export interface ModelDefinition {
  id: string; // OpenRouter model ID (e.g., "openai/gpt-4o")
  provider: ProviderCategory;
  displayName: string;
  inputCostPer1k: number; // Cost per 1K input tokens (in USD)
  outputCostPer1k: number; // Cost per 1K output tokens (in USD)
  contextWindow: number;
  supportsVision: boolean;
  supportsJsonMode: boolean;
  description?: string;
}

/**
 * Model registry with OpenRouter pricing (as of January 2026)
 * Prices from: https://openrouter.ai/models
 *
 * Note: OpenRouter adds a small markup. Check their site for current prices.
 */
export const MODELS: ModelDefinition[] = [
  // ============ OpenAI ============
  {
    id: "openai/gpt-4o",
    provider: "openai",
    displayName: "GPT-4o",
    inputCostPer1k: 0.0025,
    outputCostPer1k: 0.01,
    contextWindow: 128000,
    supportsVision: true,
    supportsJsonMode: true,
    description: "Most capable GPT-4 model, optimized for speed",
  },
  {
    id: "openai/gpt-4o-mini",
    provider: "openai",
    displayName: "GPT-4o Mini",
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
    contextWindow: 128000,
    supportsVision: true,
    supportsJsonMode: true,
    description: "Affordable small model for simple tasks",
  },
  {
    id: "openai/gpt-4-turbo",
    provider: "openai",
    displayName: "GPT-4 Turbo",
    inputCostPer1k: 0.01,
    outputCostPer1k: 0.03,
    contextWindow: 128000,
    supportsVision: true,
    supportsJsonMode: true,
    description: "Previous flagship model",
  },
  {
    id: "openai/o1",
    provider: "openai",
    displayName: "o1",
    inputCostPer1k: 0.015,
    outputCostPer1k: 0.06,
    contextWindow: 200000,
    supportsVision: true,
    supportsJsonMode: false,
    description: "Reasoning model for complex tasks",
  },
  {
    id: "openai/o1-mini",
    provider: "openai",
    displayName: "o1 Mini",
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.012,
    contextWindow: 128000,
    supportsVision: false,
    supportsJsonMode: false,
    description: "Smaller reasoning model",
  },

  // ============ Anthropic ============
  {
    id: "anthropic/claude-sonnet-4",
    provider: "anthropic",
    displayName: "Claude Sonnet 4",
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    contextWindow: 200000,
    supportsVision: true,
    supportsJsonMode: true,
    description: "Latest Claude Sonnet model",
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    provider: "anthropic",
    displayName: "Claude 3.5 Sonnet",
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    contextWindow: 200000,
    supportsVision: true,
    supportsJsonMode: true,
    description: "Best balance of speed and intelligence",
  },
  {
    id: "anthropic/claude-3.5-haiku",
    provider: "anthropic",
    displayName: "Claude 3.5 Haiku",
    inputCostPer1k: 0.0008,
    outputCostPer1k: 0.004,
    contextWindow: 200000,
    supportsVision: true,
    supportsJsonMode: true,
    description: "Fast and affordable Claude",
  },
  {
    id: "anthropic/claude-3-haiku",
    provider: "anthropic",
    displayName: "Claude 3 Haiku",
    inputCostPer1k: 0.00025,
    outputCostPer1k: 0.00125,
    contextWindow: 200000,
    supportsVision: true,
    supportsJsonMode: true,
    description: "Fastest Claude model",
  },

  // ============ Google ============
  {
    id: "google/gemini-2.5-pro",
    provider: "google",
    displayName: "Gemini 2.5 Pro",
    inputCostPer1k: 0.00125,
    outputCostPer1k: 0.01,
    contextWindow: 1000000,
    supportsVision: true,
    supportsJsonMode: true,
    description: "Google's most capable model",
  },
  {
    id: "google/gemini-2.5-flash",
    provider: "google",
    displayName: "Gemini 2.5 Flash",
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
    contextWindow: 1000000,
    supportsVision: true,
    supportsJsonMode: true,
    description: "Fast and affordable Gemini",
  },

  // ============ Meta (Llama) ============
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    provider: "meta",
    displayName: "Llama 3.3 70B",
    inputCostPer1k: 0.00039,
    outputCostPer1k: 0.00039,
    contextWindow: 131072,
    supportsVision: false,
    supportsJsonMode: true,
    description: "Latest Llama, excellent value",
  },
  {
    id: "meta-llama/llama-3.1-70b-instruct",
    provider: "meta",
    displayName: "Llama 3.1 70B",
    inputCostPer1k: 0.00035,
    outputCostPer1k: 0.0004,
    contextWindow: 131072,
    supportsVision: false,
    supportsJsonMode: true,
    description: "Strong open-source model",
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct",
    provider: "meta",
    displayName: "Llama 3.1 8B",
    inputCostPer1k: 0.00005,
    outputCostPer1k: 0.00005,
    contextWindow: 131072,
    supportsVision: false,
    supportsJsonMode: true,
    description: "Fast, cheap, good for simple tasks",
  },

  // ============ Mistral ============
  {
    id: "mistralai/mistral-large-2512",
    provider: "mistral",
    displayName: "Mistral Large",
    inputCostPer1k: 0.002,
    outputCostPer1k: 0.006,
    contextWindow: 128000,
    supportsVision: false,
    supportsJsonMode: true,
    description: "Mistral's flagship model",
  },
  {
    id: "mistralai/mistral-small-3.2-24b-instruct",
    provider: "mistral",
    displayName: "Mistral Small 3.2",
    inputCostPer1k: 0.0001,
    outputCostPer1k: 0.0003,
    contextWindow: 32000,
    supportsVision: false,
    supportsJsonMode: true,
    description: "Efficient for simple tasks",
  },

  // ============ xAI ============
  {
    id: "x-ai/grok-3",
    provider: "xai",
    displayName: "Grok 3",
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    contextWindow: 131072,
    supportsVision: true,
    supportsJsonMode: true,
    description: "xAI's flagship model",
  },
  {
    id: "x-ai/grok-3-mini",
    provider: "xai",
    displayName: "Grok 3 Mini",
    inputCostPer1k: 0.0003,
    outputCostPer1k: 0.0005,
    contextWindow: 131072,
    supportsVision: false,
    supportsJsonMode: true,
    description: "Fast reasoning model from xAI",
  },

  // ============ DeepSeek ============
  {
    id: "deepseek/deepseek-chat-v3.1",
    provider: "deepseek",
    displayName: "DeepSeek V3.1",
    inputCostPer1k: 0.0001,
    outputCostPer1k: 0.0003,
    contextWindow: 64000,
    supportsVision: false,
    supportsJsonMode: true,
    description: "Extremely cheap, surprisingly capable",
  },
  {
    id: "deepseek/deepseek-r1-0528",
    provider: "deepseek",
    displayName: "DeepSeek R1",
    inputCostPer1k: 0.0008,
    outputCostPer1k: 0.002,
    contextWindow: 64000,
    supportsVision: false,
    supportsJsonMode: true,
    description: "Reasoning model, o1 competitor",
  },

  // ============ Qwen ============
  {
    id: "qwen/qwen-2.5-72b-instruct",
    provider: "qwen",
    displayName: "Qwen 2.5 72B",
    inputCostPer1k: 0.00035,
    outputCostPer1k: 0.0004,
    contextWindow: 131072,
    supportsVision: false,
    supportsJsonMode: true,
    description: "Alibaba's flagship model",
  },
];

/**
 * Get the AI SDK model instance for a given model ID
 * All models go through OpenRouter
 */
export function getModel(modelId: string) {
  const modelDef = MODELS.find((m) => m.id === modelId);
  if (!modelDef) {
    throw new Error(`Unknown model: ${modelId}`);
  }
  return openrouter(modelId);
}

/**
 * Calculate cost for a given extraction
 */
export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) return 0;

  const inputCost = (inputTokens / 1000) * model.inputCostPer1k;
  const outputCost = (outputTokens / 1000) * model.outputCostPer1k;

  return inputCost + outputCost;
}

/**
 * Get models by provider category
 */
export function getModelsByProvider(
  provider: ProviderCategory
): ModelDefinition[] {
  return MODELS.filter((m) => m.provider === provider);
}

/**
 * Get all unique provider categories
 */
export function getProviders(): ProviderCategory[] {
  return [...new Set(MODELS.map((m) => m.provider))];
}

/**
 * Get models that support vision (for PDF extraction)
 */
export function getVisionModels(): ModelDefinition[] {
  return MODELS.filter((m) => m.supportsVision);
}

/**
 * Get models that support JSON mode (for structured extraction)
 */
export function getJsonModels(): ModelDefinition[] {
  return MODELS.filter((m) => m.supportsJsonMode);
}

/**
 * Get models sorted by cost (cheapest first)
 */
export function getModelsByCost(): ModelDefinition[] {
  return [...MODELS].sort((a, b) => {
    const aCost = a.inputCostPer1k + a.outputCostPer1k;
    const bCost = b.inputCostPer1k + b.outputCostPer1k;
    return aCost - bCost;
  });
}

/**
 * Estimate cost for a benchmark run
 */
export function estimateBenchmarkCost(
  modelIds: string[],
  formCount: number,
  avgInputTokens: number = 2000,
  avgOutputTokens: number = 1000
): number {
  let totalCost = 0;
  for (const modelId of modelIds) {
    totalCost += calculateCost(modelId, avgInputTokens, avgOutputTokens);
  }
  return totalCost * formCount;
}
