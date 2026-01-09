"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileUp,
  BarChart3,
  Settings,
  Home,
  Cpu,
  History,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Upload Forms", href: "/upload", icon: FileUp },
  { name: "Models", href: "/models", icon: Cpu },
  { name: "Benchmarks", href: "/benchmarks", icon: BarChart3 },
  { name: "History", href: "/history", icon: History },
  { name: "Costs", href: "/costs", icon: DollarSign },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold text-white">AI Compare</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 py-4">
        <ul role="list" className="flex flex-1 flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex gap-x-3 rounded-md p-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Settings at bottom */}
        <div className="mt-auto pt-4 border-t border-gray-800">
          <Link
            href="/settings"
            className={cn(
              "group flex gap-x-3 rounded-md p-3 text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            Settings
          </Link>
        </div>
      </nav>
    </div>
  );
}
