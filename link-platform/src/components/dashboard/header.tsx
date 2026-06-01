"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <Input
          placeholder="Search links..."
          icon={<Search className="w-4 h-4" />}
          className="w-full"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-600 rounded-full" />
        </button>
        <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-brand-700">U</span>
        </div>
      </div>
    </header>
  );
}
