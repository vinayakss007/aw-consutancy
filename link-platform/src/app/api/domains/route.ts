import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { domains } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

// GET /api/domains
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || "default";

    const results = await db
      .select()
      .from(domains)
      .where(eq(domains.workspaceId, workspaceId));

    return NextResponse.json({ domains: results });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch domains" },
      { status: 500 }
    );
  }
}

// POST /api/domains
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, workspaceId = "default" } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Domain slug is required" },
        { status: 400 }
      );
    }

    // Check if domain already exists
    const existing = await db
      .select()
      .from(domains)
      .where(eq(domains.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Domain already registered" },
        { status: 409 }
      );
    }

    const id = generateId();
    await db.insert(domains).values({
      id,
      workspaceId,
      slug,
      verified: false,
      primary: false,
      createdAt: new Date(),
    });

    const domain = await db
      .select()
      .from(domains)
      .where(eq(domains.id, id))
      .limit(1);

    return NextResponse.json({ domain: domain[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add domain" },
      { status: 500 }
    );
  }
}
