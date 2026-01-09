"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MODELS, type ModelDefinition } from "@/lib/ai/providers";
import { formatCost } from "@/lib/utils";

interface Form {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  created_at: string;
}

export default function NewBenchmarkPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [selectedForms, setSelectedForms] = useState<Set<string>>(new Set());
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/forms");
      const data = await response.json();
      setForms(data.forms || []);
    } catch (error) {
      console.error("Failed to fetch forms:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const toggleForm = (formId: string) => {
    setSelectedForms((prev) => {
      const next = new Set(prev);
      if (next.has(formId)) {
        next.delete(formId);
      } else {
        next.add(formId);
      }
      return next;
    });
  };

  const selectAllModels = () => {
    setSelectedModels(new Set(MODELS.map((m) => m.id)));
  };

  const selectAllForms = () => {
    setSelectedForms(new Set(forms.map((f) => f.id)));
  };

  // Calculate estimated cost
  const estimatedCost = Array.from(selectedModels).reduce((total, modelId) => {
    const model = MODELS.find((m) => m.id === modelId);
    if (!model) return total;
    const costPerForm =
      (2000 / 1000) * model.inputCostPer1k + (1000 / 1000) * model.outputCostPer1k;
    return total + costPerForm * selectedForms.size;
  }, 0);

  const handleSubmit = async () => {
    if (selectedModels.size === 0 || selectedForms.size === 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || `Benchmark ${new Date().toISOString()}`,
          description,
          modelIds: Array.from(selectedModels),
          formIds: Array.from(selectedForms),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/benchmarks/${data.benchmark.id}`);
      } else {
        console.error("Failed to create benchmark");
      }
    } catch (error) {
      console.error("Error creating benchmark:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    selectedModels.size > 0 && selectedForms.size > 0 && !isSubmitting;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/benchmarks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Benchmark</h1>
          <p className="mt-1 text-gray-600">
            Configure and run a new model comparison benchmark.
          </p>
        </div>
      </div>

      {/* Name and Description */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Details</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Benchmark"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you testing?"
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Select Models ({selectedModels.size} selected)
          </h2>
          <Button variant="outline" size="sm" onClick={selectAllModels}>
            Select All
          </Button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {MODELS.map((model) => (
            <ModelCheckbox
              key={model.id}
              model={model}
              isSelected={selectedModels.has(model.id)}
              onToggle={() => toggleModel(model.id)}
            />
          ))}
        </div>
      </div>

      {/* Form Selection */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Select Forms ({selectedForms.size} selected)
          </h2>
          {forms.length > 0 && (
            <Button variant="outline" size="sm" onClick={selectAllForms}>
              Select All
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : forms.length === 0 ? (
          <div className="mt-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-600">
              No forms uploaded yet.{" "}
              <Link href="/upload" className="text-blue-600 hover:underline">
                Upload forms first
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {forms.map((form) => (
              <div
                key={form.id}
                onClick={() => toggleForm(form.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  selectedForms.has(form.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded ${
                    selectedForms.has(form.id)
                      ? "bg-blue-500 text-white"
                      : "border border-gray-300"
                  }`}
                >
                  {selectedForms.has(form.id) && <Check className="h-3 w-3" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{form.original_name}</p>
                  <p className="text-sm text-gray-500">
                    {(form.file_size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cost Estimate & Submit */}
      <div className="flex items-center justify-between rounded-lg bg-gray-900 p-6 text-white">
        <div>
          <p className="text-sm text-gray-400">Estimated Cost</p>
          <p className="text-2xl font-bold">{formatCost(estimatedCost)}</p>
          <p className="text-sm text-gray-400">
            {selectedModels.size} models × {selectedForms.size} forms ={" "}
            {selectedModels.size * selectedForms.size} extractions
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          size="lg"
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            "Run Benchmark"
          )}
        </Button>
      </div>
    </div>
  );
}

function ModelCheckbox({
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
      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div
        className={`flex h-5 w-5 items-center justify-center rounded ${
          isSelected ? "bg-blue-500 text-white" : "border border-gray-300"
        }`}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{model.displayName}</p>
        <p className="text-xs text-gray-500">{formatCost(model.inputCostPer1k + model.outputCostPer1k)}/1K</p>
      </div>
    </div>
  );
}
