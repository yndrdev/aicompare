"use client";

import { useState } from "react";
import { Check, Eye, Code, DollarSign } from "lucide-react";
import { MODELS, type ModelDefinition, type ProviderCategory } from "@/lib/ai/providers";
import { formatCost } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const providerColors: Record<ProviderCategory, string> = {
  openai: "bg-green-100 text-green-800",
  anthropic: "bg-orange-100 text-orange-800",
  google: "bg-blue-100 text-blue-800",
  meta: "bg-purple-100 text-purple-800",
  mistral: "bg-cyan-100 text-cyan-800",
  xai: "bg-gray-100 text-gray-800",
  deepseek: "bg-indigo-100 text-indigo-800",
  qwen: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800",
};

const providerNames: Record<ProviderCategory, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  meta: "Meta",
  mistral: "Mistral",
  xai: "xAI",
  deepseek: "DeepSeek",
  qwen: "Qwen",
  other: "Other",
};

export default function ModelsPage() {
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [filterProvider, setFilterProvider] = useState<ProviderCategory | "all">("all");

  const providers = [...new Set(MODELS.map((m) => m.provider))] as ProviderCategory[];

  const filteredModels =
    filterProvider === "all"
      ? MODELS
      : MODELS.filter((m) => m.provider === filterProvider);

  const toggleModel = (modelId: string) => {
    setSelectedModels((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedModels(new Set(filteredModels.map((m) => m.id)));
  };

  const clearSelection = () => {
    setSelectedModels(new Set());
  };

  // Calculate estimated cost for benchmark
  const estimatedCost = Array.from(selectedModels).reduce((total, modelId) => {
    const model = MODELS.find((m) => m.id === modelId);
    if (!model) return total;
    // Estimate: 2000 input tokens, 1000 output tokens per form
    const costPerForm =
      (2000 / 1000) * model.inputCostPer1k + (1000 / 1000) * model.outputCostPer1k;
    return total + costPerForm;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Models</h1>
          <p className="mt-2 text-gray-600">
            Select models to include in your benchmark comparison.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearSelection}>
            Clear
          </Button>
          <Button variant="outline" onClick={selectAll}>
            Select All
          </Button>
          <Button disabled={selectedModels.size === 0}>
            Run Benchmark ({selectedModels.size})
          </Button>
        </div>
      </div>

      {/* Cost Estimate */}
      {selectedModels.size > 0 && (
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              Estimated cost per form: {formatCost(estimatedCost)}
            </span>
            <span className="text-blue-700">
              ({selectedModels.size} models selected)
            </span>
          </div>
        </div>
      )}

      {/* Provider Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterProvider("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filterProvider === "all"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({MODELS.length})
        </button>
        {providers.map((provider) => {
          const count = MODELS.filter((m) => m.provider === provider).length;
          return (
            <button
              key={provider}
              onClick={() => setFilterProvider(provider)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterProvider === provider
                  ? "bg-gray-900 text-white"
                  : `${providerColors[provider]} hover:opacity-80`
              }`}
            >
              {providerNames[provider]} ({count})
            </button>
          );
        })}
      </div>

      {/* Models Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            isSelected={selectedModels.has(model.id)}
            onToggle={() => toggleModel(model.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ModelCard({
  model,
  isSelected,
  onToggle,
}: {
  model: ModelDefinition;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`
        relative cursor-pointer rounded-lg border-2 p-4 transition-all
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow"
        }
      `}
    >
      {/* Selection indicator */}
      <div
        className={`
          absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full
          ${isSelected ? "bg-blue-500 text-white" : "border-2 border-gray-300"}
        `}
      >
        {isSelected && <Check className="h-4 w-4" />}
      </div>

      {/* Provider badge */}
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
          providerColors[model.provider]
        }`}
      >
        {providerNames[model.provider]}
      </span>

      {/* Model name */}
      <h3 className="mt-2 font-semibold text-gray-900">{model.displayName}</h3>

      {/* Description */}
      {model.description && (
        <p className="mt-1 text-sm text-gray-600">{model.description}</p>
      )}

      {/* Features */}
      <div className="mt-3 flex gap-3">
        {model.supportsVision && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Eye className="h-3.5 w-3.5" />
            Vision
          </div>
        )}
        {model.supportsJsonMode && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Code className="h-3.5 w-3.5" />
            JSON
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Input</span>
          <span className="font-medium text-gray-900">
            {formatCost(model.inputCostPer1k)}/1K
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Output</span>
          <span className="font-medium text-gray-900">
            {formatCost(model.outputCostPer1k)}/1K
          </span>
        </div>
      </div>
    </div>
  );
}
