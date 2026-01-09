"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCost, formatDuration, formatNumber } from "@/lib/utils";

interface ExtractionResult {
  id: string;
  model_id: string;
  form_id: string;
  status: string;
  structured_output: Record<string, unknown>;
  freeform_output: string;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  cost: number;
  error_message?: string;
}

interface BenchmarkRun {
  id: string;
  name: string;
  description?: string;
  status: string;
  total_forms: number;
  processed_forms: number;
  total_models: number;
  total_cost: number;
  started_at?: string;
  completed_at?: string;
  config?: {
    modelIds: string[];
    formIds: string[];
  };
}

export default function BenchmarkResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [benchmark, setBenchmark] = useState<BenchmarkRun | null>(null);
  const [results, setResults] = useState<ExtractionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
    // Poll while running
    const interval = setInterval(() => {
      if (benchmark?.status === "running") {
        fetchResults();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [id, benchmark?.status]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/benchmark/${id}/results`);
      const data = await response.json();
      setBenchmark(data.benchmark);
      setResults(data.results || []);
      if (!selectedModel && data.results?.length > 0) {
        const models = [...new Set(data.results.map((r: ExtractionResult) => r.model_id))];
        setSelectedModel(models[0] as string);
      }
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!benchmark) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Benchmark not found.</p>
        <Link href="/benchmarks">
          <Button className="mt-4">Back to Benchmarks</Button>
        </Link>
      </div>
    );
  }

  const models = [...new Set(results.map((r) => r.model_id))];
  const isRunning = benchmark.status === "running";

  // Group results by model for comparison
  const resultsByModel = models.reduce(
    (acc, modelId) => {
      acc[modelId] = results.filter((r) => r.model_id === modelId);
      return acc;
    },
    {} as Record<string, ExtractionResult[]>
  );

  // Calculate aggregates per model
  const modelStats = models.map((modelId) => {
    const modelResults = resultsByModel[modelId] || [];
    const successful = modelResults.filter((r) => r.status === "success");
    const totalCost = successful.reduce((sum, r) => sum + (r.cost || 0), 0);
    const avgLatency =
      successful.length > 0
        ? successful.reduce((sum, r) => sum + (r.latency_ms || 0), 0) / successful.length
        : 0;
    const totalTokens = successful.reduce(
      (sum, r) => sum + (r.input_tokens || 0) + (r.output_tokens || 0),
      0
    );

    return {
      modelId,
      total: modelResults.length,
      successful: successful.length,
      failed: modelResults.filter((r) => r.status === "error").length,
      totalCost,
      avgLatency,
      totalTokens,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/benchmarks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{benchmark.name}</h1>
            {isRunning && (
              <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Running
              </span>
            )}
            {benchmark.status === "completed" && (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                <CheckCircle className="h-4 w-4" />
                Completed
              </span>
            )}
            {benchmark.status === "failed" && (
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                <XCircle className="h-4 w-4" />
                Failed
              </span>
            )}
          </div>
          {benchmark.description && (
            <p className="mt-1 text-gray-600">{benchmark.description}</p>
          )}
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Total Cost</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCost(benchmark.total_cost)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Models</p>
          <p className="text-2xl font-bold text-gray-900">{models.length}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Forms Processed</p>
          <p className="text-2xl font-bold text-gray-900">
            {benchmark.processed_forms} / {benchmark.total_forms}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Duration</p>
          <p className="text-2xl font-bold text-gray-900">
            {benchmark.started_at && benchmark.completed_at
              ? formatDuration(
                  new Date(benchmark.completed_at).getTime() -
                    new Date(benchmark.started_at).getTime()
                )
              : isRunning
              ? "In progress..."
              : "-"}
          </p>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">
          Model Comparison
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Model
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Success
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Failed
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Avg Latency
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total Tokens
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {modelStats.map((stats) => (
                <tr
                  key={stats.modelId}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedModel(stats.modelId)}
                >
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`font-medium ${
                        selectedModel === stats.modelId
                          ? "text-blue-600"
                          : "text-gray-900"
                      }`}
                    >
                      {stats.modelId.split("/").pop()}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-green-600">
                    {stats.successful}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-red-600">
                    {stats.failed}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-gray-600">
                    {formatDuration(stats.avgLatency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-gray-600">
                    {formatNumber(stats.totalTokens)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-gray-900">
                    {formatCost(stats.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample Output */}
      {selectedModel && resultsByModel[selectedModel]?.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">
            Sample Output: {selectedModel.split("/").pop()}
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-700">
                Structured Output
              </h3>
              <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-green-400">
                {JSON.stringify(
                  resultsByModel[selectedModel][0]?.structured_output,
                  null,
                  2
                )}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">
                Freeform Output
              </h3>
              <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-900 p-4 text-sm text-gray-300">
                {resultsByModel[selectedModel][0]?.freeform_output ||
                  "No freeform output"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
