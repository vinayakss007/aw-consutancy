"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, Globe, Tag, Clock, Lock, Smartphone, ChevronDown, ChevronUp } from "lucide-react";

interface CreateLinkModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateLinkModal({ open, onClose, onCreated }: CreateLinkModalProps) {
  const [url, setUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [title, setTitle] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [ios, setIos] = useState("");
  const [android, setAndroid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body: any = { url, workspaceId: "default" };
      if (shortCode) body.shortCode = shortCode;
      if (title) body.title = title;
      if (utmSource) body.utmSource = utmSource;
      if (utmMedium) body.utmMedium = utmMedium;
      if (utmCampaign) body.utmCampaign = utmCampaign;
      if (password) body.password = password;
      if (expiresAt) body.expiresAt = new Date(expiresAt).toISOString();
      if (ios) body.ios = ios;
      if (android) body.android = android;

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create link");
      }

      onCreated?.();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUrl("");
    setShortCode("");
    setTitle("");
    setUtmSource("");
    setUtmMedium("");
    setUtmCampaign("");
    setPassword("");
    setExpiresAt("");
    setIos("");
    setAndroid("");
    setError("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Link" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <Input
          label="Destination URL"
          placeholder="https://example.com/my-long-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          icon={<Link2 className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Custom Short Code (optional)"
            placeholder="my-link"
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value)}
          />
          <Input
            label="Title (optional)"
            placeholder="My Campaign Link"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            {/* UTM Parameters */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" /> UTM Parameters
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Source" value={utmSource} onChange={(e) => setUtmSource(e.target.value)} />
                <Input placeholder="Medium" value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} />
                <Input placeholder="Campaign" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} />
              </div>
            </div>

            {/* Password & Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Password Protection"
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
              />
              <Input
                label="Expiration Date"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                icon={<Clock className="w-4 h-4" />}
              />
            </div>

            {/* Device Targeting */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Device Targeting
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="iOS URL" value={ios} onChange={(e) => setIos(e.target.value)} />
                <Input placeholder="Android URL" value={android} onChange={(e) => setAndroid(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Link
          </Button>
        </div>
      </form>
    </Modal>
  );
}
