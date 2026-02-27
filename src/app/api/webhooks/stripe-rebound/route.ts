import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { invoices, auditLogs } from "@/db/schema/rebound-relay";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const invoiceId = session.metadata?.invoiceId;
        if (!invoiceId) {
            return NextResponse.json({ error: "Missing invoiceId metadata" }, { status: 400 });
        }

        // idempotency handled by status check
        const [existing] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);

        if (existing && existing.status === 'PENDING') {
            await db.update(invoices).set({ status: 'PAID', updatedAt: new Date() }).where(eq(invoices.id, invoiceId));

            await db.insert(auditLogs).values({
                actorId: 'system',
                action: 'INVOICE_PAID',
                entityType: 'invoice',
                entityId: invoiceId,
                details: { checkoutSessionId: session.id }
            });

            // Fire inngest events here
        }
    }

    return NextResponse.json({ received: true });
}
