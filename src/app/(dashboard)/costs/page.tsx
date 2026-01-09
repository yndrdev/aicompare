"use client";

import { useState, useEffect } from "react";
import { DollarSign, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { formatCost } from "@/lib/utils";

interface CostSummary {
  totalSpend: number;
  lastMonthSpend: number;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
}

export default function CostsPage() {
  const [costs, setCosts] = useState<CostSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, show empty state
    setCosts({
      totalSpend: 0,
      lastMonthSpend: 0,
      byProvider: {},
      byModel: {},
    });
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cost Analysis</h1>
        <p className="mt-2 text-gray-600">
          Track and analyze your LLM API spending.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 p-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Spend</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCost(costs?.totalSpend || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCost(costs?.lastMonthSpend || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-100 p-3">
                  <TrendingDown className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Cost/Form</p>
                  <p className="text-2xl font-bold text-gray-900">$0.00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">
              Cost by Provider
            </h2>
            {Object.keys(costs?.byProvider || {}).length === 0 ? (
              <div className="mt-4 flex items-center justify-center py-12 text-gray-500">
                <p>No cost data yet. Run a benchmark to see spending analysis.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {Object.entries(costs?.byProvider || {}).map(([provider, cost]) => (
                  <div key={provider} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{provider}</span>
                    <span className="text-gray-600">{formatCost(cost)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
