"use server";

import { db } from "@/db";
import { consultants, engagements, invoices } from "@/db/schema/rebound-relay";
import { users } from "@/db/schema/user";
import { eq, or, like, sql, and } from "drizzle-orm";
import { auth } from "@/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-02-24.acacia",
});

export interface SearchFilters {
    query?: string;
    expertise?: string[];
    location?: string;
    availability?: string;
    minRate?: number;
    maxRate?: number;
}

export async function searchConsultants(filters: SearchFilters) {
    // Only show ACTIVE consultants to institutions
    const conditions: any[] = [eq(consultants.status, "ACTIVE")];

    // Build dynamic conditions for search
    if (filters.query) {
        const searchTerm = `%${filters.query}%`;
        conditions.push(
            or(
                like(consultants.headline, searchTerm),
                like(consultants.bio, searchTerm),
                like(consultants.location, searchTerm)
            )
        );
    }

    const results = await db
        .select({
            id: consultants.id,
            headline: consultants.headline,
            bio: consultants.bio,
            expertiseTags: consultants.expertiseTags,
            location: consultants.location,
            hourlyRate: consultants.hourlyRate,
            availability: consultants.availability,
            website: consultants.website,
            linkedin: consultants.linkedin,
            status: consultants.status,
            createdAt: consultants.createdAt,
            userName: users.name,
            userId: consultants.userId,
        })
        .from(consultants)
        .innerJoin(users, eq(consultants.userId, users.id))
        .where(and(...conditions));

    // Apply additional filters in-memory for complex cases
    let filtered = results;

    // Filter by expertise (array overlap)
    if (filters.expertise && filters.expertise.length > 0) {
        filtered = filtered.filter((c) =>
            filters.expertise!.some((tag) => c.expertiseTags?.includes(tag))
        );
    }

    // Filter by availability
    if (filters.availability && filters.availability !== "all") {
        filtered = filtered.filter((c) => c.availability === filters.availability);
    }

    // Filter by hourly rate
    if (filters.minRate !== undefined) {
        const minCents = Math.round(filters.minRate * 100);
        filtered = filtered.filter((c) => c.hourlyRate && c.hourlyRate >= minCents);
    }

    if (filters.maxRate !== undefined) {
        const maxCents = Math.round(filters.maxRate * 100);
        filtered = filtered.filter((c) => !c.hourlyRate || c.hourlyRate <= maxCents);
    }

    return filtered;
}

export async function getConsultantById(id: string) {
    const results = await db
        .select({
            id: consultants.id,
            headline: consultants.headline,
            bio: consultants.bio,
            expertiseTags: consultants.expertiseTags,
            location: consultants.location,
            hourlyRate: consultants.hourlyRate,
            availability: consultants.availability,
            website: consultants.website,
            linkedin: consultants.linkedin,
            status: consultants.status,
            userName: users.name,
            userId: consultants.userId,
        })
        .from(consultants)
        .innerJoin(users, eq(consultants.userId, users.id))
        .where(eq(consultants.id, id))
        .limit(1);

    return results[0] || null;
}

export async function getExpertiseOptions() {
    // Return all unique expertise tags from ACTIVE consultants
    const results = await db
        .select({ expertiseTags: consultants.expertiseTags })
        .from(consultants)
        .where(eq(consultants.status, "ACTIVE"));

    const allTags = new Set<string>();
    results.forEach((r) => {
        r.expertiseTags?.forEach((tag) => allTags.add(tag));
    });

    return Array.from(allTags).sort();
}

export async function createEngagement(
    consultantId: string,
    title: string,
    description: string,
    clientId: string,
    startDate?: Date,
    endDate?: Date,
    budget?: number,
    deliverables?: string[]
) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const [engagement] = await db.insert(engagements).values({
        clientId,
        consultantId,
        title,
        description,
        status: "INITIATED",
        startDate,
        endDate,
        budget,
        deliverables,
    }).returning();

    return engagement.id;
}

export async function createInvoiceAndCheckoutInfo(engagementId: string, amountCents: number) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const [invoice] = await db.insert(invoices).values({
        engagementId,
        amount: amountCents,
        commissionAmount: Math.floor(amountCents * 0.15), // 15% platform fee
        status: "PENDING"
    }).returning();

    // Fetch engagement and consultant for Stripe Connect transfer
    const engagementData = await db
        .select({
            consultantStripeAccountId: consultants.stripeAccountId,
        })
        .from(engagements)
        .innerJoin(consultants, eq(engagements.consultantId, consultants.id))
        .where(eq(engagements.id, engagementId))
        .limit(1)
        .then((res) => res[0]);

    if (!engagementData) {
        throw new Error("Engagement not found");
    }

    // Create Stripe Checkout Session with Connect transfer if consultant has Stripe account
    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `Invoice for Engagement ${engagementId}`,
                },
                unit_amount: amountCents,
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.NEXTAUTH_URL}/relay/invoices/${invoice.id}?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/relay/invoices/${invoice.id}?canceled=true`,
        metadata: {
            invoiceId: invoice.id,
            engagementId: engagementId
        }
    };

    // If consultant has a Stripe Connect account with payouts enabled, use Connect transfer
    if (engagementData.consultantStripeAccountId) {
        checkoutParams.payment_intent_data = {
            transfer_data: {
                amount: Math.floor(amountCents * 0.85), // 85% to consultant
                destination: engagementData.consultantStripeAccountId,
            },
        };
    }

    const paymentSession = await stripe.checkout.sessions.create(checkoutParams);

    return { invoiceId: invoice.id, checkoutUrl: paymentSession.url };
}

export async function getEngagementsForClient(clientId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const results = await db
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
            consultantId: engagements.consultantId,
            consultantHeadline: consultants.headline,
            consultantLocation: consultants.location,
            consultantHourlyRate: consultants.hourlyRate,
        })
        .from(engagements)
        .innerJoin(consultants, eq(engagements.consultantId, consultants.id))
        .where(eq(engagements.clientId, clientId))
        .orderBy(engagements.createdAt);

    return results;
}

export async function getEngagementById(engagementId: string) {
    const results = await db
        .select({
            id: engagements.id,
            title: engagements.title,
            description: engagements.description,
            status: engagements.status,
            startDate: engagements.startDate,
            endDate: engagements.endDate,
            budget: engagements.budget,
            deliverables: engagements.deliverables,
            internalNotes: engagements.internalNotes,
            createdAt: engagements.createdAt,
            clientId: engagements.clientId,
            consultantId: engagements.consultantId,
            consultantHeadline: consultants.headline,
            consultantLocation: consultants.location,
            consultantHourlyRate: consultants.hourlyRate,
            consultantAvailability: consultants.availability,
            consultantStripeAccountId: consultants.stripeAccountId,
        })
        .from(engagements)
        .innerJoin(consultants, eq(engagements.consultantId, consultants.id))
        .where(eq(engagements.id, engagementId))
        .limit(1);

    return results[0] || null;
}

export async function getInvoicesForEngagement(engagementId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    return await db
        .select()
        .from(invoices)
        .where(eq(invoices.engagementId, engagementId))
        .orderBy(invoices.createdAt);
}

export async function updateEngagementStatus(
    engagementId: string,
    status: "INITIATED" | "ACTIVE" | "COMPLETED" | "CANCELED"
) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const [updated] = await db
        .update(engagements)
        .set({ status, updatedAt: new Date() })
        .where(eq(engagements.id, engagementId))
        .returning();

    return updated;
}

export async function updateEngagementInternalNotes(
    engagementId: string,
    internalNotes: string
) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const [updated] = await db
        .update(engagements)
        .set({ internalNotes, updatedAt: new Date() })
        .where(eq(engagements.id, engagementId))
        .returning();

    return updated;
}
