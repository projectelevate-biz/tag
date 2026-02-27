import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getConsultantProfile } from "@/lib/rebound/actions";
import { db } from "@/db";
import { documents } from "@/db/schema/rebound-relay";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
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

    const { id } = await params;

    // Verify the document belongs to this consultant
    const doc = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1)
      .then((docs) => docs[0]);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.consultantId !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the document
    await db.delete(documents).where(eq(documents.id, id));

    // Return updated list of documents
    const remainingDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.consultantId, profile.id))
      .orderBy(documents.createdAt);

    return NextResponse.json({ documents: remainingDocs });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

export const maxDuration = 60;
