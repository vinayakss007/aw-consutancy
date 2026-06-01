"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { QrCode, Download, Copy, Check, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function QRCodePage() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("url") || "");
  const [size, setSize] = useState(300);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateQR = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, size, fgColor, bgColor }),
      });
      const data = await res.json();
      setQrDataUrl(data.qr);
    } catch (err) {
      console.error("Failed to generate QR", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyQR = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: copy URL
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">QR Code Generator</h1>
        <p className="text-gray-500 mt-1">
          Generate branded QR codes for your links
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <Input
              label="URL"
              placeholder="https://awlinks.co/my-link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              icon={<QrCode className="w-4 h-4" />}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size: {size}px
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <Button onClick={generateQR} loading={loading} className="w-full">
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
          </div>

          {/* Presets */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color Presets
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { fg: "#000000", bg: "#ffffff", label: "Classic" },
                { fg: "#4c6ef5", bg: "#ffffff", label: "Brand" },
                { fg: "#ffffff", bg: "#000000", label: "Inverted" },
                { fg: "#2d3436", bg: "#dfe6e9", label: "Soft" },
                { fg: "#e17055", bg: "#ffeaa7", label: "Warm" },
                { fg: "#00b894", bg: "#ffffff", label: "Green" },
                { fg: "#6c5ce7", bg: "#ffffff", label: "Purple" },
                { fg: "#fd79a8", bg: "#ffffff", label: "Pink" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setFgColor(preset.fg);
                    setBgColor(preset.bg);
                  }}
                  className="p-2 rounded-lg border border-gray-200 hover:border-brand-300 transition-colors text-center"
                >
                  <div
                    className="w-6 h-6 rounded mx-auto mb-1"
                    style={{ backgroundColor: preset.fg }}
                  />
                  <span className="text-xs text-gray-600">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center">
          {qrDataUrl ? (
            <div className="space-y-6 text-center">
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="mx-auto rounded-lg shadow-lg"
                style={{ maxWidth: "100%", height: "auto" }}
              />
              <div className="flex items-center justify-center gap-3">
                <Button onClick={downloadQR} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
                <Button onClick={copyQR} variant="outline">
                  {copied ? (
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <QrCode className="w-24 h-24 mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500">
                Enter a URL and click Generate to create your QR code
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
