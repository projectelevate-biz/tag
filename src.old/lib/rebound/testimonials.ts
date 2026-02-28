"use server";

import { db } from "@/db";
import { testimonials, engagements } from "@/db/schema/rebound-relay";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import { getConsultantProfile } from "./actions";

export async function getTestimonials() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await getConsultantProfile();
  if (!profile) return [];

  return await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.consultantId, profile.id))
    .orderBy(testimonials.createdAt);
}

export async function getTestimonialById(id: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await getConsultantProfile();
  if (!profile) throw new Error("Profile not found");

  const [testimonial] = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);

  if (!testimonial || testimonial.consultantId !== profile.id) {
    throw new Error("Testimonial not found");
  }

  return testimonial;
}

export async function createTestimonial(data: {
  authorName: string;
  authorTitle?: string;
  authorInstitution?: string;
  content: string;
  rating: number;
  engagementId?: string;
  status?: string;
}) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await getConsultantProfile();
  if (!profile) throw new Error("Profile not found");

  // If engagementId is provided, verify it belongs to this consultant
  if (data.engagementId) {
    const [engagement] = await db
      .select()
      .from(engagements)
      .where(eq(engagements.id, data.engagementId))
      .limit(1);

    if (!engagement || engagement.consultantId !== profile.id) {
      throw new Error("Engagement not found");
    }
  }

  const [created] = await db
    .insert(testimonials)
    .values({
      consultantId: profile.id,
      authorId: crypto.randomUUID(),
      authorName: data.authorName,
      authorTitle: data.authorTitle,
      authorInstitution: data.authorInstitution,
      content: data.content,
      rating: data.rating,
      engagementId: data.engagementId,
      status: data.status || "PENDING",
    })
    .returning();

  revalidatePath("/rebound/profile");
  revalidatePath("/rebound/testimonials");
  return created;
}

export async function updateTestimonial(
  id: string,
  data: {
    authorName?: string;
    authorTitle?: string;
    authorInstitution?: string;
    content?: string;
    rating?: number;
    status?: string;
  }
) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await getConsultantProfile();
  if (!profile) throw new Error("Profile not found");

  // Verify ownership
  const [existing] = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);

  if (!existing || existing.consultantId !== profile.id) {
    throw new Error("Testimonial not found");
  }

  const [updated] = await db
    .update(testimonials)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(testimonials.id, id))
    .returning();

  revalidatePath("/rebound/profile");
  revalidatePath("/rebound/testimonials");
  return updated;
}

export async function deleteTestimonial(id: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await getConsultantProfile();
  if (!profile) throw new Error("Profile not found");

  // Verify ownership
  const [existing] = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);

  if (!existing || existing.consultantId !== profile.id) {
    throw new Error("Testimonial not found");
  }

  await db.delete(testimonials).where(eq(testimonials.id, id));

  revalidatePath("/rebound/profile");
  revalidatePath("/rebound/testimonials");
  return true;
}

// Get approved testimonials for a consultant (public view)
export async function getApprovedTestimonials(consultantId: string) {
  return await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.consultantId, consultantId))
    .orderBy(testimonials.createdAt);
}

// Get testimonials for admin approval
export async function getPendingTestimonials() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if admin
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") || [];
  const isSuperAdmin = user.email && superAdminEmails.includes(user.email);

  if (!isSuperAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  return await db
    .select()
    .from(testimonials)
    .orderBy(testimonials.createdAt);
}

// Approve or reject a testimonial (admin only)
export async function updateTestimonialStatus(
  id: string,
  status: "APPROVED" | "REJECTED" | "PENDING"
) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if admin
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",") || [];
  const isSuperAdmin = user.email && superAdminEmails.includes(user.email);

  if (!isSuperAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  const [updated] = await db
    .update(testimonials)
    .set({ status, updatedAt: new Date() })
    .where(eq(testimonials.id, id))
    .returning();

  revalidatePath("/admin/testimonials");
  return updated;
}
