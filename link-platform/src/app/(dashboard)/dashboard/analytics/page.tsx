"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  MousePointerClick,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

interface AnalyticsState {
  summary: { totalClicks: number; uniqueVisitors: number; period: string };
  clicksByDate: { key: string; value: number }[];
  clicksByCountry: { key: string; value: number }[];
  clicksByDevice: { key: string; value: number }[];
  clicksByBrowser: { key: string; value: number }[];
  clicksByReferrer: { key: string; value: number }[];
  topLinks: any[];
}

const periods = [
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "1y", value: "1y" },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("7d");
  const [data, setData] = useState<AnalyticsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("date");

  useEffect(() => {
    fetchAnalytics();
  }, [period, activeTab]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/analytics?workspaceId=default&period=${period}&groupBy=${activeTab}`
      );
      const json = await res.json();
      setData({
        summary: json.summary,
        clicksByDate: activeTab === "date" ? json.data : [],
        clicksByCountry: activeTab === "country" ? json.data : [],
        clicksByDevice: activeTab === "device" ? json.data : [],
        clicksByBrowser: activeTab === "browser" ? json.data : [],
        clicksByReferrer: activeTab === "referrer" ? json.data : [],
        topLinks: json.topLinks || [],
      });
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case "mobile": return <Smartphone className="w-4 h-4" />;
      case "tablet": return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const tabs = [
    { key: "date", label: "Timeline" },
    { key: "country", label: "Countries" },
    { key: "device", label: "Devices" },
    { key: "browser", label: "Browsers" },
    { key: "referrer", label: "Referrers" },
  ];

  const currentData = (() => {
    if (!data) return [];
    switch (activeTab) {
      case "date": return data.clicksByDate;
      case "country": return data.clicksByCountry;
      case "device": return data.clicksByDevice;
      case "browser": return data.clicksByBrowser;
      case "referrer": return data.clicksByReferrer;
      default: return [];
    }
  })();

  const maxValue = Math.max(...currentData.map((d) => d.value), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your link performance</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MousePointerClick className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data?.summary.totalClicks || 0)}
              </p>
              <p className="text-sm text-gray-500">Total Clicks</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data?.summary.uniqueVisitors || 0)}
              </p>
              <p className="text-sm text-gray-500">Unique Visitors</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {data?.topLinks.length || 0}
              </p>
              <p className="text-sm text-gray-500">Active Links</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chart Content */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                  <div className="flex-1 h-8 bg-gray-100 rounded" />
                  <div className="w-12 h-4 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : currentData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium">No data yet</p>
              <p className="text-sm mt-1">
                Click data will appear here once your links get traffic
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentData.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-gray-700 font-medium truncate flex items-center gap-2">
                    {activeTab === "device" && getDeviceIcon(item.key)}
                    {activeTab === "country" && (
                      <span className="text-lg">
                        {getCountryFlag(item.key)}
                      </span>
                    )}
                    <span>{item.key}</span>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                    <div
                      className="h-full bg-brand-100 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                      style={{
                        width: `${Math.max((item.value / maxValue) * 100, 5)}%`,
                      }}
                    >
                      <span className="text-xs font-medium text-brand-700">
                        {formatNumber(item.value)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Links */}
      {data?.topLinks && data.topLinks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing Links
          </h3>
          <div className="space-y-3">
            {data.topLinks.map((link, i) => (
              <div
                key={link.id}
                className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm font-medium text-gray-400 w-6">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {link.title || link.shortCode}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{link.url}</p>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {formatNumber(link.clicks)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode === "Unknown") return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
