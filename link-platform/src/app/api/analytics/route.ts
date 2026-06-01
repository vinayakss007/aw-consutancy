import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clicks, links } from "@/lib/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";

// GET /api/analytics - Workspace-level analytics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || "default";
    const period = searchParams.get("period") || "7d";
    const groupBy = searchParams.get("groupBy") || "date"; // date, country, device, browser, os, referrer

    // Calculate date range
    let startDate: Date;
    const now = new Date();
    switch (period) {
      case "1h":
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
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
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const conditions = [
      eq(clicks.workspaceId, workspaceId),
      gte(clicks.timestamp, startDate),
    ];

    // Total clicks
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(clicks)
      .where(and(...conditions));

    // Unique IPs (approximate unique visitors)
    const uniqueResult = await db
      .select({ count: sql<number>`count(distinct ${clicks.ip})` })
      .from(clicks)
      .where(and(...conditions));

    // Data grouped by the requested dimension
    let groupedData: any[] = [];

    switch (groupBy) {
      case "date":
        groupedData = await db
          .select({
            key: sql<string>`date(${clicks.timestamp} / 1000, 'unixepoch')`,
            count: sql<number>`count(*)`,
          })
          .from(clicks)
          .where(and(...conditions))
          .groupBy(sql`date(${clicks.timestamp} / 1000, 'unixepoch')`)
          .orderBy(sql`date(${clicks.timestamp} / 1000, 'unixepoch')`);
        break;

      case "country":
        groupedData = await db
          .select({
            key: clicks.country,
            count: sql<number>`count(*)`,
          })
          .from(clicks)
          .where(and(...conditions))
          .groupBy(clicks.country)
          .orderBy(sql`count(*) DESC`)
          .limit(20);
        break;

      case "device":
        groupedData = await db
          .select({
            key: clicks.device,
            count: sql<number>`count(*)`,
          })
          .from(clicks)
          .where(and(...conditions))
          .groupBy(clicks.device)
          .orderBy(sql`count(*) DESC`);
        break;

      case "browser":
        groupedData = await db
          .select({
            key: clicks.browser,
            count: sql<number>`count(*)`,
          })
          .from(clicks)
          .where(and(...conditions))
          .groupBy(clicks.browser)
          .orderBy(sql`count(*) DESC`)
          .limit(10);
        break;

      case "os":
        groupedData = await db
          .select({
            key: clicks.os,
            count: sql<number>`count(*)`,
          })
          .from(clicks)
          .where(and(...conditions))
          .groupBy(clicks.os)
          .orderBy(sql`count(*) DESC`)
          .limit(10);
        break;

      case "referrer":
        groupedData = await db
          .select({
            key: clicks.referrerDomain,
            count: sql<number>`count(*)`,
          })
          .from(clicks)
          .where(and(...conditions))
          .groupBy(clicks.referrerDomain)
          .orderBy(sql`count(*) DESC`)
          .limit(10);
        break;
    }

    // Top performing links
    const topLinks = await db
      .select({
        id: links.id,
        shortCode: links.shortCode,
        url: links.url,
        title: links.title,
        clicks: links.clicks,
      })
      .from(links)
      .where(eq(links.workspaceId, workspaceId))
      .orderBy(desc(links.clicks))
      .limit(10);

    return NextResponse.json({
      summary: {
        totalClicks: totalResult[0]?.count || 0,
        uniqueVisitors: uniqueResult[0]?.count || 0,
        period,
      },
      data: groupedData.map((r) => ({
        key: r.key || "Unknown",
        value: r.count,
      })),
      topLinks,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
