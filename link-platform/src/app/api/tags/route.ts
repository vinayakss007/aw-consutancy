import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

// GET /api/tags
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || "default";

    const results = await db
      .select()
      .from(tags)
      .where(eq(tags.workspaceId, workspaceId));

    return NextResponse.json({ tags: results });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

// POST /api/tags
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, color, workspaceId = "default" } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const id = generateId();
    await db.insert(tags).values({
      id,
      workspaceId,
      name,
      color: color || "#4c6ef5",
      createdAt: new Date(),
    });

    const tag = await db.select().from(tags).where(eq(tags.id, id)).limit(1);

    return NextResponse.json({ tag: tag[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create tag" },
      { status: 500 }
    );
  }
}
