"use client";

import { useState } from "react";
import {
  Copy,
  BarChart3,
  QrCode,
  MoreVertical,
  ExternalLink,
  Trash2,
  Edit,
  Archive,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNumber, getRelativeTime, getDomainFromUrl } from "@/lib/utils";
import Link from "next/link";

interface LinkCardProps {
  link: {
    id: string;
    shortCode: string;
    url: string;
    title?: string | null;
    clicks: number;
    createdAt: string | Date;
    archived?: boolean;
    password?: string | null;
    expiresAt?: string | Date | null;
    utmSource?: string | null;
  };
  appUrl?: string;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function LinkCard({
  link,
  appUrl = "awlinks.co",
  onDelete,
  onArchive,
}: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const shortUrl = `${appUrl}/${link.shortCode}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group">
      <div className="flex items-start gap-4">
        {/* Favicon */}
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <img
            src={`https://www.google.com/s2/favicons?domain=${getDomainFromUrl(link.url)}&sz=32`}
            alt=""
            className="w-5 h-5"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* Link Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {link.title || link.shortCode}
            </h3>
            {link.password && <Badge variant="warning">Protected</Badge>}
            {link.archived && <Badge variant="default">Archived</Badge>}
            {link.expiresAt && <Badge variant="info">Expires</Badge>}
          </div>

          {/* Short URL */}
          <div className="flex items-center gap-2 mt-1">
            <a
              href={`/api/redirect/${link.shortCode}`}
              target="_blank"
              rel="noopener"
              className="text-sm font-medium text-brand-600 hover:text-brand-800 truncate"
            >
              {shortUrl}
            </a>
            <button
              onClick={copyToClipboard}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy link"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Destination URL */}
          <p className="text-sm text-gray-500 truncate mt-0.5">
            {link.url}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-gray-400">
              {getRelativeTime(new Date(link.createdAt))}
            </span>
            {link.utmSource && (
              <Badge variant="info">{link.utmSource}</Badge>
            )}
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {formatNumber(link.clicks)}
            </p>
            <p className="text-xs text-gray-500">clicks</p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/dashboard/links/${link.id}`}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              title="View analytics"
            >
              <BarChart3 className="w-4 h-4" />
            </Link>
            <Link
              href={`/dashboard/qr?url=${encodeURIComponent(shortUrl)}`}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              title="QR Code"
            >
              <QrCode className="w-4 h-4" />
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <Link
                    href={`/dashboard/links/${link.id}/edit`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Visit URL
                  </a>
                  <button
                    onClick={() => {
                      onArchive?.(link.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(link.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
