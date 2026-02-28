import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, engagements, consultants } from "@/db/schema/rebound-relay";
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

    const invoiceResult = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (!invoiceResult[0]) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoice = invoiceResult[0];

    // Get engagement details
    const engagementResult = await db
      .select({
        id: engagements.id,
        title: engagements.title,
        description: engagements.description,
      })
      .from(engagements)
      .where(eq(engagements.id, invoice.engagementId))
      .limit(1);

    const engagement = engagementResult[0] || null;

    return NextResponse.json({
      invoice,
      engagement,
    });
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}
