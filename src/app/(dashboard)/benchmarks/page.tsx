"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCost, formatDuration } from "@/lib/utils";

interface BenchmarkRun {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  total_forms: number;
  processed_forms: number;
  total_models: number;
  total_cost: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  config?: {
    modelIds: string[];
    formIds: string[];
    estimatedCost: number;
  };
}

const statusConfig = {
  pending: { icon: Clock, color: "text-gray-500", bg: "bg-gray-100" },
  running: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-100" },
  completed: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100" },
  failed: { icon: XCircle, color: "text-red-500", bg: "bg-red-100" },
  cancelled: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-100" },
};

export default function BenchmarksPage() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBenchmarks();
    // Poll for updates every 5 seconds if there are running benchmarks
    const interval = setInterval(() => {
      if (benchmarks.some((b) => b.status === "running")) {
        fetchBenchmarks();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchBenchmarks = async () => {
    try {
      const response = await fetch("/api/benchmark");
      const data = await response.json();
      setBenchmarks(data.benchmarks || []);
    } catch (error) {
      console.error("Failed to fetch benchmarks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Benchmarks</h1>
          <p className="mt-2 text-gray-600">
            View and manage your benchmark comparison runs.
          </p>
        </div>
        <Link href="/benchmarks/new">
          <Button>
            <Play className="h-4 w-4" />
            New Benchmark
          </Button>
        </Link>
      </div>

      {/* Benchmarks List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : benchmarks.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <Play className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No benchmarks yet
          </h3>
          <p className="mt-2 text-gray-600">
            Create your first benchmark to compare model performance.
          </p>
          <Link href="/benchmarks/new">
            <Button className="mt-4">Create Benchmark</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {benchmarks.map((benchmark) => (
            <BenchmarkCard key={benchmark.id} benchmark={benchmark} />
          ))}
        </div>
      )}
    </div>
  );
}

function BenchmarkCard({ benchmark }: { benchmark: BenchmarkRun }) {
  const status = statusConfig[benchmark.status];
  const StatusIcon = status.icon;
  const isRunning = benchmark.status === "running";
  const progress = benchmark.total_forms > 0
    ? (benchmark.processed_forms / benchmark.total_forms) * 100
    : 0;

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`rounded-full p-2 ${status.bg}`}>
            <StatusIcon
              className={`h-5 w-5 ${status.color} ${
                isRunning ? "animate-spin" : ""
              }`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{benchmark.name}</h3>
            {benchmark.description && (
              <p className="mt-1 text-sm text-gray-600">
                {benchmark.description}
              </p>
            )}
            <div className="mt-2 flex gap-4 text-sm text-gray-500">
              <span>{benchmark.total_models} models</span>
              <span>{benchmark.total_forms} forms</span>
              <span>Cost: {formatCost(benchmark.total_cost)}</span>
            </div>
          </div>
        </div>

        <Link href={`/benchmarks/${benchmark.id}`}>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
            View Results
          </Button>
        </Link>
      </div>

      {/* Progress bar for running benchmarks */}
      {isRunning && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Processing: {benchmark.processed_forms} / {benchmark.total_forms}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Timing info */}
      <div className="mt-4 flex gap-4 text-xs text-gray-500">
        <span>Created: {new Date(benchmark.created_at).toLocaleString()}</span>
        {benchmark.started_at && (
          <span>Started: {new Date(benchmark.started_at).toLocaleString()}</span>
        )}
        {benchmark.completed_at && (
          <span>
            Duration:{" "}
            {formatDuration(
              new Date(benchmark.completed_at).getTime() -
                new Date(benchmark.started_at!).getTime()
            )}
          </span>
        )}
      </div>
    </div>
  );
}
