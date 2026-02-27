"use server";

import Stripe from "stripe";
import { db } from "@/db";
import { consultants, invoices, engagements } from "@/db/schema/rebound-relay";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { logAudit } from "@/lib/admin/actions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * Process a consultant payout for a completed invoice
 * This is called after a client pays for an engagement
 */
export async function processConsultantPayout(invoiceId: string) {
  // Fetch invoice with engagement and consultant details
  const invoice = await db
    .select({
      id: invoices.id,
      amount: invoices.amount,
      commissionAmount: invoices.commissionAmount,
      engagementId: invoices.engagementId,
      consultantStripeAccountId: consultants.stripeAccountId,
      consultantId: consultants.id,
      consultantUserId: consultants.userId,
    })
    .from(invoices)
    .innerJoin(engagements, eq(invoices.engagementId, engagements.id))
    .innerJoin(consultants, eq(engagements.consultantId, consultants.id))
    .where(eq(invoices.id, invoiceId))
    .limit(1)
    .then((res) => res[0]);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (!invoice.consultantStripeAccountId) {
    console.warn(`Consultant ${invoice.consultantId} has no Stripe account connected`);
    return { skipped: true, reason: "No Stripe account connected" };
  }

  // Calculate payout amount (invoice amount minus platform commission)
  const payoutAmountCents = invoice.amount - (invoice.commissionAmount || 0);

  if (payoutAmountCents <= 0) {
    return { skipped: true, reason: "No payout amount" };
  }

  try {
    // Create a transfer to the consultant's Stripe account
    const transfer = await stripe.transfers.create({
      amount: payoutAmountCents,
      currency: "usd",
      destination: invoice.consultantStripeAccountId,
      transfer_group: `invoice_${invoice.id}`,
      metadata: {
        invoiceId: invoice.id,
        engagementId: invoice.engagementId,
        consultantId: invoice.consultantId,
      },
    });

    // Log the payout action
    await logAudit("PAYOUT_INITIATED", "invoice", invoice.id, {
      amount: payoutAmountCents,
      transferId: transfer.id,
      consultantId: invoice.consultantId,
    });

    return {
      success: true,
      transferId: transfer.id,
      amount: payoutAmountCents,
    };
  } catch (error) {
    console.error("Failed to create Stripe transfer:", error);

    // Log the failed payout attempt
    await logAudit("PAYOUT_FAILED", "invoice", invoice.id, {
      amount: payoutAmountCents,
      error: error instanceof Error ? error.message : "Unknown error",
      consultantId: invoice.consultantId,
    });

    throw error;
  }
}

/**
 * Get a list of recent payouts for a consultant
 */
export async function getConsultantPayouts(consultantId: string, limit = 20) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify ownership
  const consultant = await db
    .select()
    .from(consultants)
    .where(eq(consultants.id, consultantId))
    .limit(1)
    .then((res) => res[0]);

  if (!consultant) {
    throw new Error("Consultant profile not found");
  }

  if (consultant.userId !== session.user.id) {
    // Check if user is admin
    const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") || [];
    const isSuperAdmin = superAdminEmails.includes(session.user.email);
    if (!isSuperAdmin) {
      throw new Error("Forbidden");
    }
  }

  if (!consultant.stripeAccountId) {
    return { payouts: [], hasAccount: false };
  }

  try {
    // List transfers for this consultant's account
    const transfers = await stripe.transfers.list({
      destination: consultant.stripeAccountId,
      limit,
    });

    return {
      payouts: transfers.data.map((t) => ({
        id: t.id,
        amount: t.amount,
        currency: t.currency,
        created: new Date(t.created * 1000),
        description: t.description,
        metadata: t.metadata,
      })),
      hasAccount: true,
    };
  } catch (error) {
    console.error("Failed to fetch payouts:", error);
    return { payouts: [], hasAccount: true, error: "Failed to fetch payouts" };
  }
}

/**
 * Create a payout for a consultant (manual payout initiation)
 */
export async function createManualPayout(consultantId: string, amountCents: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify admin access
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") || [];
  const isSuperAdmin = superAdminEmails.includes(session.user.email);
  if (!isSuperAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  const consultant = await db
    .select()
    .from(consultants)
    .where(eq(consultants.id, consultantId))
    .limit(1)
    .then((res) => res[0]);

  if (!consultant || !consultant.stripeAccountId) {
    throw new Error("Consultant Stripe account not found");
  }

  try {
    const payout = await stripe.payouts.create({
      amount: amountCents,
      currency: "usd",
      destination: consultant.stripeAccountId,
      metadata: {
        consultantId,
        initiatedBy: session.user.id,
        manualPayout: "true",
      },
    });

    await logAudit("MANUAL_PAYOUT", "consultant", consultantId, {
      amount: amountCents,
      payoutId: payout.id,
    });

    return { success: true, payoutId: payout.id };
  } catch (error) {
    console.error("Failed to create manual payout:", error);
    throw error;
  }
}
