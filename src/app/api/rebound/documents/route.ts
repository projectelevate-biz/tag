import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth";
import { getConsultantProfile } from "@/lib/rebound/actions";
import { db } from "@/db";
import { documents } from "@/db/schema/rebound-relay";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has a consultant profile
    const profile = await getConsultantProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Consultant profile not found" },
        { status: 404 }
      );
    }

    // Get all documents for this consultant
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.consultantId, profile.id))
      .orderBy(documents.createdAt);

    return NextResponse.json({ documents: docs });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has a consultant profile
    const profile = await getConsultantProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Consultant profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { type, storagePath, fileName } = body;

    if (!type || !storagePath || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert document metadata
    const [newDoc] = await db
      .insert(documents)
      .values({
        consultantId: profile.id,
        type,
        storagePath,
        fileName,
      })
      .returning();

    return NextResponse.json({ document: newDoc });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
