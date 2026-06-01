import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, domains } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

// GET /api/workspaces
export async function GET(req: NextRequest) {
  try {
    const results = await db.select().from(workspaces);
    return NextResponse.json({ workspaces: results });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

// POST /api/workspaces - Create workspace
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, userId = "default-user" } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Workspace slug already taken" },
        { status: 409 }
      );
    }

    const now = new Date();
    const workspaceId = generateId();

    await db.insert(workspaces).values({
      id: workspaceId,
      name,
      slug,
      plan: "free",
      linksLimit: 25,
      domainsLimit: 3,
      usersLimit: 1,
      createdAt: now,
      updatedAt: now,
    });

    // Add creator as owner
    await db.insert(workspaceMembers).values({
      id: generateId(),
      workspaceId,
      userId,
      role: "owner",
      createdAt: now,
    });

    // Add default domain
    await db.insert(domains).values({
      id: generateId(),
      workspaceId,
      slug: `${slug}.awlinks.co`,
      verified: true,
      primary: true,
      createdAt: now,
    });

    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    return NextResponse.json({ workspace: workspace[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create workspace" },
      { status: 500 }
    );
  }
}
