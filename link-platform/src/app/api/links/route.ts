import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { links, linkTags } from "@/lib/db/schema";
import { eq, desc, and, like, sql } from "drizzle-orm";
import { generateShortCode, generateId, isValidUrl } from "@/lib/utils";
import { z } from "zod";

const createLinkSchema = z.object({
  url: z.string().url("Invalid URL"),
  shortCode: z.string().min(1).max(50).optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  domainId: z.string().optional(),
  folderId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  ogTitle: z.string().max(200).optional(),
  ogDescription: z.string().max(500).optional(),
  ogImage: z.string().url().optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  utmTerm: z.string().max(100).optional(),
  utmContent: z.string().max(100).optional(),
  password: z.string().max(100).optional(),
  expiresAt: z.string().datetime().optional(),
  expiredUrl: z.string().url().optional(),
  ios: z.string().url().optional(),
  android: z.string().url().optional(),
  geo: z.record(z.string()).optional(),
  cloaking: z.boolean().optional(),
  publicStats: z.boolean().optional(),
});

// GET /api/links - List links
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const folderId = searchParams.get("folderId");
    const archived = searchParams.get("archived") === "true";
    // Default workspace for now (will be replaced with auth)
    const workspaceId = searchParams.get("workspaceId") || "default";

    const offset = (page - 1) * limit;

    let conditions = [eq(links.workspaceId, workspaceId)];
    
    if (search) {
      conditions.push(
        sql`(${links.url} LIKE ${"%" + search + "%"} OR ${links.shortCode} LIKE ${"%" + search + "%"} OR ${links.title} LIKE ${"%" + search + "%"})`
      );
    }
    if (folderId) {
      conditions.push(eq(links.folderId, folderId));
    }
    if (!archived) {
      conditions.push(eq(links.archived, false));
    }

    const results = await db
      .select()
      .from(links)
      .where(and(...conditions))
      .orderBy(desc(links.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(links)
      .where(and(...conditions));

    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      links: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch links" },
      { status: 500 }
    );
  }
}

// POST /api/links - Create a new link
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createLinkSchema.parse(body);

    const workspaceId = body.workspaceId || "default";
    const userId = body.userId || "default-user";

    // Generate or validate short code
    let shortCode = validated.shortCode || generateShortCode();

    // Check if short code already exists
    const existing = await db
      .select()
      .from(links)
      .where(eq(links.shortCode, shortCode))
      .limit(1);

    if (existing.length > 0) {
      if (validated.shortCode) {
        return NextResponse.json(
          { error: "Short code already taken" },
          { status: 409 }
        );
      }
      // Auto-generated collision, try again
      shortCode = generateShortCode();
    }

    const now = new Date();
    const linkId = generateId();

    await db.insert(links).values({
      id: linkId,
      workspaceId,
      userId,
      domainId: validated.domainId || null,
      folderId: validated.folderId || null,
      shortCode,
      url: validated.url,
      title: validated.title || null,
      description: validated.description || null,
      ogTitle: validated.ogTitle || null,
      ogDescription: validated.ogDescription || null,
      ogImage: validated.ogImage || null,
      utmSource: validated.utmSource || null,
      utmMedium: validated.utmMedium || null,
      utmCampaign: validated.utmCampaign || null,
      utmTerm: validated.utmTerm || null,
      utmContent: validated.utmContent || null,
      password: validated.password || null,
      expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
      expiredUrl: validated.expiredUrl || null,
      ios: validated.ios || null,
      android: validated.android || null,
      geo: validated.geo ? JSON.stringify(validated.geo) : null,
      cloaking: validated.cloaking || false,
      publicStats: validated.publicStats || false,
      clicks: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Add tags if provided
    if (validated.tagIds && validated.tagIds.length > 0) {
      for (const tagId of validated.tagIds) {
        await db.insert(linkTags).values({
          id: generateId(),
          linkId,
          tagId,
        });
      }
    }

    const newLink = await db
      .select()
      .from(links)
      .where(eq(links.id, linkId))
      .limit(1);

    return NextResponse.json({ link: newLink[0] }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create link" },
      { status: 500 }
    );
  }
}
