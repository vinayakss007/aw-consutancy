import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clicks, links } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { parseUserAgent, extractReferrerDomain, getGeoFromHeaders, getIpFromHeaders } from "@/lib/utils/analytics";

// GET /api/redirect/[code] - Redirect short link & track click
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const link = await db
      .select()
      .from(links)
      .where(eq(links.shortCode, params.code))
      .limit(1);

    if (link.length === 0) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const linkData = link[0];

    // Check if link is archived
    if (linkData.archived) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Check if link is expired
    if (linkData.expiresAt && new Date(linkData.expiresAt) < new Date()) {
      if (linkData.expiredUrl) {
        return NextResponse.redirect(linkData.expiredUrl);
      }
      return NextResponse.json({ error: "Link has expired" }, { status: 410 });
    }

    // Check password protection (redirect to password page)
    if (linkData.password) {
      return NextResponse.redirect(
        new URL(`/p/${params.code}`, req.url)
      );
    }

    // Determine redirect URL based on targeting
    let redirectUrl = linkData.url;

    // Device targeting
    const userAgent = req.headers.get("user-agent") || "";
    const { device } = parseUserAgent(userAgent);

    if (device === "mobile" && linkData.ios) {
      // Simple iOS detection
      if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
        redirectUrl = linkData.ios;
      } else if (linkData.android) {
        redirectUrl = linkData.android;
      }
    }

    // Geo targeting
    if (linkData.geo) {
      const geo = getGeoFromHeaders(req.headers);
      const geoRules = JSON.parse(linkData.geo as string);
      if (geo.country && geoRules[geo.country]) {
        redirectUrl = geoRules[geo.country];
      }
    }

    // Append UTM parameters if set on link
    if (linkData.utmSource || linkData.utmMedium || linkData.utmCampaign) {
      const url = new URL(redirectUrl);
      if (linkData.utmSource) url.searchParams.set("utm_source", linkData.utmSource);
      if (linkData.utmMedium) url.searchParams.set("utm_medium", linkData.utmMedium);
      if (linkData.utmCampaign) url.searchParams.set("utm_campaign", linkData.utmCampaign);
      if (linkData.utmTerm) url.searchParams.set("utm_term", linkData.utmTerm);
      if (linkData.utmContent) url.searchParams.set("utm_content", linkData.utmContent);
      redirectUrl = url.toString();
    }

    // Track click asynchronously
    const parsedUA = parseUserAgent(userAgent);
    const geo = getGeoFromHeaders(req.headers);
    const referrer = req.headers.get("referer") || "";
    const ip = getIpFromHeaders(req.headers);

    // Record click
    await db.insert(clicks).values({
      id: generateId(),
      linkId: linkData.id,
      workspaceId: linkData.workspaceId,
      timestamp: new Date(),
      country: geo.country || null,
      city: geo.city || null,
      region: geo.region || null,
      latitude: geo.latitude || null,
      longitude: geo.longitude || null,
      device: parsedUA.device,
      browser: parsedUA.browser,
      browserVersion: parsedUA.browserVersion,
      os: parsedUA.os,
      osVersion: parsedUA.osVersion,
      referrer: referrer || null,
      referrerDomain: referrer ? extractReferrerDomain(referrer) : "Direct",
      ip,
      userAgent,
      utmSource: linkData.utmSource || null,
      utmMedium: linkData.utmMedium || null,
      utmCampaign: linkData.utmCampaign || null,
    });

    // Update click count on link
    await db
      .update(links)
      .set({
        clicks: sql`${links.clicks} + 1`,
        lastClicked: new Date(),
      })
      .where(eq(links.id, linkData.id));

    // Redirect
    if (linkData.cloaking) {
      // For cloaked links, serve in iframe
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${linkData.ogTitle || linkData.title || "Redirecting..."}</title>
            <meta name="robots" content="noindex">
            ${linkData.ogTitle ? `<meta property="og:title" content="${linkData.ogTitle}">` : ""}
            ${linkData.ogDescription ? `<meta property="og:description" content="${linkData.ogDescription}">` : ""}
            ${linkData.ogImage ? `<meta property="og:image" content="${linkData.ogImage}">` : ""}
          </head>
          <body style="margin:0;padding:0;overflow:hidden">
            <iframe src="${redirectUrl}" style="width:100%;height:100vh;border:none"></iframe>
          </body>
        </html>
      `;
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}
