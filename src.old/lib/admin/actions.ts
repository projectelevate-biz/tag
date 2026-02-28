"use server";

import { db } from "@/db";
import { consultants, auditLogs, engagements, invoices } from "@/db/schema/rebound-relay";
import { users } from "@/db/schema/user";
import { organizations } from "@/db/schema/organization";
import { eq, or, like } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function logAudit(action: string, entityType: string, entityId: string, details?: any) {
  const session = await auth();
  if (!session?.user) return;

  await db.insert(auditLogs).values({
    actorId: session.user.id,
    action,
    entityType,
    entityId,
    details,
  });
}

export async function approveConsultant(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.update(consultants).set({ status: "ACTIVE" }).where(eq(consultants.id, id));

  // Log the action
  await logAudit("APPROVAL", "consultant", id, {
    previousStatus: "SUBMITTED",
    newStatus: "ACTIVE",
  });

  // TODO: Send email notification to consultant
  // TODO: Fire Inngest event for notifications

  revalidatePath("/admin/consultants");
  return true;
}

export async function rejectConsultant(id: string, reason?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.update(consultants).set({ status: "REJECTED" }).where(eq(consultants.id, id));

  // Log the action with rejection reason
  await logAudit("REJECTION", "consultant", id, {
    previousStatus: "SUBMITTED",
    newStatus: "REJECTED",
    reason,
  });

  // TODO: Send email notification to consultant with reason
  // TODO: Fire Inngest event for notifications

  revalidatePath("/admin/consultants");
  return true;
}

export async function getConsultantsForModeration(filters?: {
  status?: string;
  search?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Check if user is admin or super admin
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") || [];
  const isSuperAdmin = superAdminEmails.includes(session.user.email);
  if (!isSuperAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  let query = db
    .select({
      id: consultants.id,
      headline: consultants.headline,
      bio: consultants.bio,
      status: consultants.status,
      expertiseTags: consultants.expertiseTags,
      location: consultants.location,
      hourlyRate: consultants.hourlyRate,
      availability: consultants.availability,
      createdAt: consultants.createdAt,
      updatedAt: consultants.updatedAt,
      userId: consultants.userId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(consultants)
    .leftJoin(users, eq(consultants.userId, users.id))
    .orderBy(consultants.createdAt);

  // Apply filters
  if (filters?.status && filters.status !== "ALL") {
    // @ts-ignore - dynamic query building
    query = query.where(eq(consultants.status, filters.status));
  }

  const results = await query;

  // Apply search filter in memory (simple approach)
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    return results.filter(
      (c) =>
        c.headline?.toLowerCase().includes(searchLower) ||
        c.bio?.toLowerCase().includes(searchLower) ||
        c.userEmail?.toLowerCase().includes(searchLower) ||
        c.location?.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

export async function getAdminStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") || [];
  const isSuperAdmin = superAdminEmails.includes(session.user.email);
  if (!isSuperAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  const allConsultants = await db.select().from(consultants);
  const allEngagements = await db.select().from(engagements);
  const allInvoices = await db.select().from(invoices);

  // Calculate revenue metrics
  const totalRevenue = allInvoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0);
  const totalCommission = allInvoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + (i.commissionAmount || 0), 0);
  const pendingRevenue = allInvoices
    .filter((i) => i.status === "PENDING")
    .reduce((sum, i) => sum + i.amount, 0);
  const pendingCommission = allInvoices
    .filter((i) => i.status === "PENDING")
    .reduce((sum, i) => sum + (i.commissionAmount || 0), 0);

  return {
    // Consultant stats
    totalConsultants: allConsultants.length,
    draftConsultants: allConsultants.filter((c) => c.status === "DRAFT").length,
    submittedConsultants: allConsultants.filter((c) => c.status === "SUBMITTED").length,
    activeConsultants: allConsultants.filter((c) => c.status === "ACTIVE").length,
    rejectedConsultants: allConsultants.filter((c) => c.status === "REJECTED").length,

    // Engagement stats
    totalEngagements: allEngagements.length,
    initiatedEngagements: allEngagements.filter((e) => e.status === "INITIATED").length,
    activeEngagements: allEngagements.filter((e) => e.status === "ACTIVE").length,
    completedEngagements: allEngagements.filter((e) => e.status === "COMPLETED").length,
    canceledEngagements: allEngagements.filter((e) => e.status === "CANCELED").length,

    // Invoice stats
    totalInvoices: allInvoices.length,
    paidInvoices: allInvoices.filter((i) => i.status === "PAID").length,
    pendingInvoices: allInvoices.filter((i) => i.status === "PENDING").length,
    failedInvoices: allInvoices.filter((i) => i.status === "FAILED").length,

    // Revenue stats (in cents)
    totalRevenue,
    totalCommission,
    pendingRevenue,
    pendingCommission,
    netRevenue: totalRevenue - totalCommission,
    pendingNetRevenue: pendingRevenue - pendingCommission,
  };
}

export async function getRecentAuditLogs(limit = 50) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") || [];
  const isSuperAdmin = superAdminEmails.includes(session.user.email);
  if (!isSuperAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  const logs = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      details: auditLogs.details,
      createdAt: auditLogs.createdAt,
      actorId: auditLogs.actorId,
      actorName: users.name,
      actorEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .orderBy(auditLogs.createdAt)
    .limit(limit);

  return logs;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") || [];
  const isSuperAdmin = superAdminEmails.includes(session.user.email);

  if (!isSuperAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  return true;
}

// ============================================================================
// Engagement Management (Admin)
// ============================================================================

export async function getAllEngagements(filters?: {
  status?: string;
  search?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") || [];
  const isSuperAdmin = superAdminEmails.includes(session.user.email);
  if (!isSuperAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  let query = db
    .select({
      id: engagements.id,
      title: engagements.title,
      description: engagements.description,
      status: engagements.status,
      startDate: engagements.startDate,
      endDate: engagements.endDate,
      budget: engagements.budget,
      internalNotes: engagements.internalNotes,
      createdAt: engagements.createdAt,
      updatedAt: engagements.updatedAt,
      clientId: engagements.clientId,
      clientName: organizations.name,
      consultantId: engagements.consultantId,
      consultantHeadline: consultants.headline,
    })
    .from(engagements)
    .innerJoin(consultants, eq(engagements.consultantId, consultants.id))
    .innerJoin(organizations, eq(engagements.clientId, organizations.id))
    .orderBy(engagements.createdAt);

  // Apply filters
  if (filters?.status && filters.status !== "ALL") {
    // @ts-ignore - dynamic query building
    query = query.where(eq(engagements.status, filters.status));
  }

  const results = await query;

  // Apply search filter in memory
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    return results.filter(
      (e) =>
        e.title?.toLowerCase().includes(searchLower) ||
        e.description?.toLowerCase().includes(searchLower) ||
        e.consultantHeadline?.toLowerCase().includes(searchLower) ||
        e.clientName?.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

export async function updateEngagementInternalNotes(
  engagementId: string,
  internalNotes: string
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") || [];
  const isSuperAdmin = superAdminEmails.includes(session.user.email);
  if (!isSuperAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  await db
    .update(engagements)
    .set({ internalNotes, updatedAt: new Date() })
    .where(eq(engagements.id, engagementId));

  // Log the action
  await logAudit("NOTES_UPDATED", "engagement", engagementId, {
    notes: internalNotes,
  });

  revalidatePath("/admin/engagements");
  return true;
}
