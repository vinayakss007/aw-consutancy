import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { links } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/links/[id] - Get single link
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const link = await db
      .select()
      .from(links)
      .where(eq(links.id, params.id))
      .limit(1);

    if (link.length === 0) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json({ link: link[0] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch link" },
      { status: 500 }
    );
  }
}

// PATCH /api/links/[id] - Update link
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const now = new Date();

    // Check link exists
    const existing = await db
      .select()
      .from(links)
      .where(eq(links.id, params.id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const updateData: any = { updatedAt: now };

    // Allow updating specific fields
    const allowedFields = [
      "url", "title", "description", "shortCode", "domainId", "folderId",
      "ogTitle", "ogDescription", "ogImage",
      "utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent",
      "password", "expiresAt", "expiredUrl",
      "ios", "android", "geo",
      "cloaking", "archived", "publicStats",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "geo" && typeof body[field] === "object") {
          updateData[field] = JSON.stringify(body[field]);
        } else if (field === "expiresAt" && body[field]) {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    await db.update(links).set(updateData).where(eq(links.id, params.id));

    const updated = await db
      .select()
      .from(links)
      .where(eq(links.id, params.id))
      .limit(1);

    return NextResponse.json({ link: updated[0] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update link" },
      { status: 500 }
    );
  }
}

// DELETE /api/links/[id] - Delete link
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await db
      .select()
      .from(links)
      .where(eq(links.id, params.id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    await db.delete(links).where(eq(links.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete link" },
      { status: 500 }
    );
  }
}
