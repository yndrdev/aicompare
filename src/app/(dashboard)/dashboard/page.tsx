import { FileUp, Cpu, BarChart3, DollarSign } from "lucide-react";
import Link from "next/link";

const stats = [
  { name: "Forms Uploaded", value: "0", icon: FileUp, href: "/upload" },
  { name: "Models Available", value: "22", icon: Cpu, href: "/models" },
  { name: "Benchmark Runs", value: "0", icon: BarChart3, href: "/benchmarks" },
  { name: "Total Spend", value: "$0.00", icon: DollarSign, href: "/costs" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Compare LLM models for form extraction accuracy and cost.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="relative overflow-hidden rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Quick Start</h2>
        <p className="mt-1 text-sm text-gray-600">
          Get started by uploading forms and running a benchmark.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/upload"
            className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <FileUp className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Upload Forms</p>
              <p className="text-sm text-gray-600">Upload PDF forms to extract</p>
            </div>
          </Link>

          <Link
            href="/models"
            className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <Cpu className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Select Models</p>
              <p className="text-sm text-gray-600">Choose models to compare</p>
            </div>
          </Link>

          <Link
            href="/benchmarks"
            className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Run Benchmark</p>
              <p className="text-sm text-gray-600">Compare model outputs</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <div className="mt-4 flex items-center justify-center py-12 text-gray-500">
          <p>No recent activity. Start by uploading some forms.</p>
        </div>
      </div>
    </div>
  );
}
