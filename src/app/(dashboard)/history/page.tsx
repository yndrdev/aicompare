"use client";

import { useState, useEffect } from "react";
import { History, Loader2, FileText, Clock } from "lucide-react";

interface HistoryItem {
  id: string;
  type: "upload" | "benchmark" | "extraction";
  description: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, show empty state
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">History</h1>
        <p className="mt-2 text-gray-600">
          View your recent activity and past extractions.
        </p>
      </div>

      {/* History List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <History className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No activity yet
          </h3>
          <p className="mt-2 text-gray-600">
            Your extraction history will appear here once you run benchmarks.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 rounded-lg bg-white p-4 shadow"
            >
              <div className="rounded-full bg-gray-100 p-2">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.description}</p>
                <p className="text-sm text-gray-500">
                  <Clock className="inline h-4 w-4" />{" "}
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
