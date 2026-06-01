"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Link2,
  BarChart3,
  MousePointerClick,
  Globe,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  clicksToday: number;
  activeDomains: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLinks: 0,
    totalClicks: 0,
    clicksToday: 0,
    activeDomains: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats
    async function loadStats() {
      try {
        const [linksRes, analyticsRes] = await Promise.all([
          fetch("/api/links?workspaceId=default&limit=1"),
          fetch("/api/analytics?workspaceId=default&period=24h"),
        ]);
        const linksData = await linksRes.json();
        const analyticsData = await analyticsRes.json();

        setStats({
          totalLinks: linksData.pagination?.total || 0,
          totalClicks: analyticsData.summary?.totalClicks || 0,
          clicksToday: analyticsData.summary?.totalClicks || 0,
          activeDomains: 1,
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    {
      label: "Total Links",
      value: formatNumber(stats.totalLinks),
      icon: Link2,
      color: "text-blue-600 bg-blue-100",
      change: "+12%",
    },
    {
      label: "Total Clicks",
      value: formatNumber(stats.totalClicks),
      icon: MousePointerClick,
      color: "text-green-600 bg-green-100",
      change: "+8%",
    },
    {
      label: "Clicks Today",
      value: formatNumber(stats.clicksToday),
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-100",
      change: "+23%",
    },
    {
      label: "Active Domains",
      value: formatNumber(stats.activeDomains),
      icon: Globe,
      color: "text-orange-600 bg-orange-100",
      change: "0%",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of your link performance
          </p>
        </div>
        <Link href="/dashboard/links?create=true">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Link
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-green-600">
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/links?create=true"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
              <Link2 className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Create Short Link</h3>
              <p className="text-sm text-gray-500">
                Shorten a URL with custom settings
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
          </div>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Analytics</h3>
              <p className="text-sm text-gray-500">
                Track clicks, devices & more
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
          </div>
        </Link>

        <Link
          href="/dashboard/qr"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Generate QR Code</h3>
              <p className="text-sm text-gray-500">
                Branded QR codes for any link
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
          </div>
        </Link>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Links
        </h2>
        <div className="text-center py-12 text-gray-500">
          <Link2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium">No links yet</p>
          <p className="text-sm mt-1">
            Create your first short link to get started
          </p>
          <Link href="/dashboard/links?create=true">
            <Button className="mt-4" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create your first link
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
