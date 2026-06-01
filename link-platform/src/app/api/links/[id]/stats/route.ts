import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clicks, links } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

// GET /api/links/[id]/stats - Get link analytics
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "7d"; // 24h, 7d, 30d, 90d, all

    // Get the link
    const link = await db
      .select()
      .from(links)
      .where(eq(links.id, params.id))
      .limit(1);

    if (link.length === 0) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Calculate date range
    let startDate: Date;
    const now = new Date();
    switch (period) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const conditions = [
      eq(clicks.linkId, params.id),
      gte(clicks.timestamp, startDate),
    ];

    // Total clicks in period
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(clicks)
      .where(and(...conditions));

    // Clicks by country
    const byCountry = await db
      .select({
        country: clicks.country,
        count: sql<number>`count(*)`,
      })
      .from(clicks)
      .where(and(...conditions))
      .groupBy(clicks.country)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    // Clicks by device
    const byDevice = await db
      .select({
        device: clicks.device,
        count: sql<number>`count(*)`,
      })
      .from(clicks)
      .where(and(...conditions))
      .groupBy(clicks.device)
      .orderBy(sql`count(*) DESC`);

    // Clicks by browser
    const byBrowser = await db
      .select({
        browser: clicks.browser,
        count: sql<number>`count(*)`,
      })
      .from(clicks)
      .where(and(...conditions))
      .groupBy(clicks.browser)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    // Clicks by OS
    const byOs = await db
      .select({
        os: clicks.os,
        count: sql<number>`count(*)`,
      })
      .from(clicks)
      .where(and(...conditions))
      .groupBy(clicks.os)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    // Clicks by referrer
    const byReferrer = await db
      .select({
        referrer: clicks.referrerDomain,
        count: sql<number>`count(*)`,
      })
      .from(clicks)
      .where(and(...conditions))
      .groupBy(clicks.referrerDomain)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    // Clicks over time (grouped by date)
    const clicksOverTime = await db
      .select({
        date: sql<string>`date(${clicks.timestamp} / 1000, 'unixepoch')`,
        count: sql<number>`count(*)`,
      })
      .from(clicks)
      .where(and(...conditions))
      .groupBy(sql`date(${clicks.timestamp} / 1000, 'unixepoch')`)
      .orderBy(sql`date(${clicks.timestamp} / 1000, 'unixepoch')`);

    return NextResponse.json({
      link: link[0],
      stats: {
        totalClicks: totalResult[0]?.count || 0,
        clicksOverTime: clicksOverTime.map((r) => ({
          date: r.date,
          clicks: r.count,
        })),
        countries: byCountry.map((r) => ({
          country: r.country || "Unknown",
          clicks: r.count,
        })),
        devices: byDevice.map((r) => ({
          device: r.device || "Unknown",
          clicks: r.count,
        })),
        browsers: byBrowser.map((r) => ({
          browser: r.browser || "Unknown",
          clicks: r.count,
        })),
        os: byOs.map((r) => ({
          os: r.os || "Unknown",
          clicks: r.count,
        })),
        referrers: byReferrer.map((r) => ({
          referrer: r.referrer || "Direct",
          clicks: r.count,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
