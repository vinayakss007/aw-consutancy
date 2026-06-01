"use client";

import { useState } from "react";
import { Settings, Globe, Users, Key, CreditCard, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [workspaceName, setWorkspaceName] = useState("ABetWorks");
  const [workspaceSlug, setWorkspaceSlug] = useState("abetworks");
  const [newDomain, setNewDomain] = useState("");
  const [domains, setDomains] = useState([
    { id: "1", slug: "abetworks.awlinks.co", verified: true, primary: true },
  ]);

  const addDomain = async () => {
    if (!newDomain) return;
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: newDomain, workspaceId: "default" }),
      });
      if (res.ok) {
        const data = await res.json();
        setDomains([...domains, data.domain]);
        setNewDomain("");
      }
    } catch (err) {
      console.error("Failed to add domain", err);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your workspace settings</p>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          General
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Workspace Name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
          <Input
            label="Workspace Slug"
            value={workspaceSlug}
            onChange={(e) => setWorkspaceSlug(e.target.value)}
          />
        </div>
        <Button>Save Changes</Button>
      </div>

      {/* Domains */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Custom Domains
        </h2>
        <p className="text-sm text-gray-500">
          Add your own domain to create branded short links
        </p>

        <div className="space-y-3">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{domain.slug}</span>
                {domain.verified && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    Verified
                  </span>
                )}
                {domain.primary && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Primary
                  </span>
                )}
              </div>
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="yourdomain.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addDomain} variant="outline">
            Add Domain
          </Button>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Key className="w-5 h-5" />
          API Keys
        </h2>
        <p className="text-sm text-gray-500">
          Manage your API keys for programmatic access
        </p>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Production Key</p>
              <p className="text-xs text-gray-500 font-mono mt-1">
                awl_sk_••••••••••••••••
              </p>
            </div>
            <Button variant="outline" size="sm">
              Regenerate
            </Button>
          </div>
        </div>
        <Button variant="outline">
          <Key className="w-4 h-4 mr-2" />
          Create New API Key
        </Button>
      </div>

      {/* Plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Plan & Billing
        </h2>
        <div className="p-4 bg-brand-50 rounded-lg border border-brand-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-brand-900">Free Plan</p>
              <p className="text-xs text-brand-700 mt-1">
                25 links/mo | 3 domains | 1,000 clicks tracked
              </p>
            </div>
            <Button size="sm">Upgrade to Pro</Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-sm text-gray-500">
          Permanently delete your workspace and all associated data
        </p>
        <Button variant="destructive">Delete Workspace</Button>
      </div>
    </div>
  );
}
