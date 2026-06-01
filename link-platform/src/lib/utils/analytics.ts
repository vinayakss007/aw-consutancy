import UAParser from "ua-parser-js";

export interface ClickData {
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  device?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  referrer?: string;
  referrerDomain?: string;
  ip?: string;
  userAgent?: string;
}

export function parseUserAgent(userAgent: string): {
  device: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
} {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  let device = "desktop";
  if (result.device.type === "mobile") device = "mobile";
  else if (result.device.type === "tablet") device = "tablet";

  return {
    device,
    browser: result.browser.name || "Unknown",
    browserVersion: result.browser.version || "",
    os: result.os.name || "Unknown",
    osVersion: result.os.version || "",
  };
}

export function extractReferrerDomain(referrer: string): string {
  try {
    return new URL(referrer).hostname;
  } catch {
    return referrer || "Direct";
  }
}

export function getGeoFromHeaders(headers: Headers): {
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
} {
  // These headers are typically set by CDN/reverse proxy (Vercel, Cloudflare, etc.)
  return {
    country: headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || undefined,
    city: headers.get("x-vercel-ip-city") || undefined,
    region: headers.get("x-vercel-ip-country-region") || undefined,
    latitude: headers.get("x-vercel-ip-latitude")
      ? parseFloat(headers.get("x-vercel-ip-latitude")!)
      : undefined,
    longitude: headers.get("x-vercel-ip-longitude")
      ? parseFloat(headers.get("x-vercel-ip-longitude")!)
      : undefined,
  };
}

export function getIpFromHeaders(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
