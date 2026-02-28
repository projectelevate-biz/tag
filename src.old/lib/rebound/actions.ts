"use server";

import { db } from "@/db";
import { consultants, documents, engagements, invoices } from "@/db/schema/rebound-relay";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import { organizations } from "@/db/schema/organization";

export async function getConsultantProfile() {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const profile = await db
        .select()
        .from(consultants)
        .where(eq(consultants.userId, user.id))
        .limit(1);
    return profile[0] || null;
}

export async function upsertConsultantProfile(data: {
    headline: string;
    bio: string;
    location: string;
    expertiseTags: string[];
    hourlyRate?: number;
    availability?: string;
    website?: string;
    linkedin?: string;
    yearsOfExperience?: number;
    timezone?: string;
    travelOpen?: boolean;
    languages?: string[];
    profileSlug?: string;
}) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const existing = await getConsultantProfile();
    if (existing) {
        await db
            .update(consultants)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(consultants.id, existing.id));
        return existing.id;
    } else {
        const [created] = await db
            .insert(consultants)
            .values({ ...data, userId: user.id, status: "DRAFT" })
            .returning({ id: consultants.id });
        return created.id;
    }
}

export async function submitConsultantProfile() {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const profile = await getConsultantProfile();
    if (!profile) throw new Error("Profile not found");

    await db
        .update(consultants)
        .set({ status: "SUBMITTED", updatedAt: new Date() })
        .where(eq(consultants.id, profile.id));

    revalidatePath("/rebound/profile");
    revalidatePath("/admin/consultants");

    // Inngest notification would go here in an actual deployment
    // e.g. inngest.send({ name: "rebound/profile.submitted", data: { consultantId: profile.id } })

    return true;
}

export async function uploadDocumentMeta(data: { type: string; storagePath: string; fileName: string }) {
    const profile = await getConsultantProfile();
    if (!profile) throw new Error("Profile not found");

    const [doc] = await db.insert(documents).values({
        consultantId: profile.id,
        type: data.type,
        storagePath: data.storagePath,
        fileName: data.fileName,
    }).returning();

    return doc;
}

export interface EarningsStats {
    totalEarnings: number; // After commission
    paidEarnings: number;
    pendingEarnings: number;
    totalCommission: number;
    engagementCount: number;
    paidInvoiceCount: number;
    pendingInvoiceCount: number;
}

export async function getEarningsStats(): Promise<EarningsStats> {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const profile = await getConsultantProfile();
    if (!profile) {
        return {
            totalEarnings: 0,
            paidEarnings: 0,
            pendingEarnings: 0,
            totalCommission: 0,
            engagementCount: 0,
            paidInvoiceCount: 0,
            pendingInvoiceCount: 0,
        };
    }

    // Get all engagements for this consultant
    const consultantEngagements = await db
        .select({ id: engagements.id })
        .from(engagements)
        .where(eq(engagements.consultantId, profile.id));

    const engagementIds = consultantEngagements.map((e) => e.id);

    if (engagementIds.length === 0) {
        return {
            totalEarnings: 0,
            paidEarnings: 0,
            pendingEarnings: 0,
            totalCommission: 0,
            engagementCount: 0,
            paidInvoiceCount: 0,
            pendingInvoiceCount: 0,
        };
    }

    // Get all invoices for these engagements
    const { inArray } = await import("drizzle-orm");
    const engagementInvoices = await db
        .select()
        .from(invoices)
        .where(inArray(invoices.engagementId, engagementIds));

    // Calculate stats
    const paidInvoices = engagementInvoices.filter((i) => i.status === "PAID");
    const pendingInvoices = engagementInvoices.filter((i) => i.status === "PENDING");

    const totalCommission = engagementInvoices.reduce(
        (sum, i) => sum + (i.commissionAmount || 0),
        0
    );
    const totalAmount = engagementInvoices.reduce((sum, i) => sum + i.amount, 0);
    const paidAmount = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
    const paidCommission = paidInvoices.reduce(
        (sum, i) => sum + (i.commissionAmount || 0),
        0
    );
    const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);
    const pendingCommission = pendingInvoices.reduce(
        (sum, i) => sum + (i.commissionAmount || 0),
        0
    );

    return {
        totalEarnings: totalAmount - totalCommission,
        paidEarnings: paidAmount - paidCommission,
        pendingEarnings: pendingAmount - pendingCommission,
        totalCommission,
        engagementCount: engagementIds.length,
        paidInvoiceCount: paidInvoices.length,
        pendingInvoiceCount: pendingInvoices.length,
    };
}

export async function getConsultantEngagements() {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const profile = await getConsultantProfile();
    if (!profile) return [];

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
            clientName: organizations.name,
        })
        .from(engagements)
        .innerJoin(organizations, eq(engagements.clientId, organizations.id))
        .where(eq(engagements.consultantId, profile.id))
        .orderBy(engagements.createdAt);

    return results;
}

export async function getEngagementInvoices(engagementId: string) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const profile = await getConsultantProfile();
    if (!profile) throw new Error("Consultant profile not found");

    // Verify the engagement belongs to this consultant
    const [engagement] = await db
        .select()
        .from(engagements)
        .where(eq(engagements.id, engagementId))
        .limit(1);

    if (!engagement || engagement.consultantId !== profile.id) {
        throw new Error("Engagement not found");
    }

    return await db
        .select()
        .from(invoices)
        .where(eq(invoices.engagementId, engagementId))
        .orderBy(invoices.createdAt);
}
