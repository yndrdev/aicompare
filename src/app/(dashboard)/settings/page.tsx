"use client";

import { useState } from "react";
import { Settings, Key, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [openRouterKey, setOpenRouterKey] = useState("");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account and application preferences.
        </p>
      </div>

      {/* API Keys Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center gap-3">
          <Key className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Configure your LLM provider API keys.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              OpenRouter API Key
            </label>
            <p className="text-xs text-gray-500">
              Used to access all LLM providers through a single API.
            </p>
            <div className="mt-2 flex gap-2">
              <input
                type="password"
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button variant="outline">Update</Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Get your key at{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Configure notification preferences.
        </p>

        <div className="mt-6 space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              defaultChecked
            />
            <span className="text-sm text-gray-700">
              Email when benchmark completes
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Alert when spending exceeds budget
            </span>
          </label>
        </div>
      </div>

      {/* Account Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Account</h2>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings.
        </p>

        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Authentication is not configured yet. This is a demo version.
          </p>
        </div>
      </div>
    </div>
  );
}
