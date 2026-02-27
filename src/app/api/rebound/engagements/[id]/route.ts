import { NextResponse } from "next/server";
import { db } from "@/db";
import { engagements, consultants, organizations } from "@/db/schema/rebound-relay";
import { users } from "@/db/schema/user";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Get the consultant profile for this user
    const [consultant] = await db
      .select()
      .from(consultants)
      .where(eq(consultants.userId, session.user.id))
      .limit(1);

    if (!consultant) {
      return NextResponse.json(
        { error: "Consultant profile not found" },
        { status: 404 }
      );
    }

    // Get the engagement and verify it belongs to this consultant
    const engagementResult = await db
      .select({
        id: engagements.id,
        title: engagements.title,
        description: engagements.description,
        status: engagements.status,
        startDate: engagements.startDate,
        endDate: engagements.endDate,
        budget: engagements.budget,
        deliverables: engagements.deliverables,
        createdAt: engagements.createdAt,
        clientName: organizations.name,
      })
      .from(engagements)
      .innerJoin(organizations, eq(engagements.clientId, organizations.id))
      .where(eq(engagements.id, id))
      .limit(1);

    if (!engagementResult[0]) {
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 }
      );
    }

    // Verify this engagement belongs to the consultant
    const [verification] = await db
      .select({ consultantId: engagements.consultantId })
      .from(engagements)
      .where(eq(engagements.id, id))
      .limit(1);

    if (!verification || verification.consultantId !== consultant.id) {
      return NextResponse.json(
        { error: "Unauthorized access to this engagement" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      engagement: engagementResult[0],
    });
  } catch (error) {
    console.error("Failed to fetch engagement:", error);
    return NextResponse.json(
      { error: "Failed to fetch engagement" },
      { status: 500 }
    );
  }
}
