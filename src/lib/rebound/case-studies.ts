"use server";

import { db } from "@/db";
import { caseStudies } from "@/db/schema/rebound-relay";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import { getConsultantProfile } from "./actions";

export async function getCaseStudies() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await getConsultantProfile();
  if (!profile) return [];

  return await db
    .select()
    .from(caseStudies)
    .where(eq(caseStudies.consultantId, profile.id))
    .orderBy(caseStudies.createdAt);
}

export async function getCaseStudyById(id: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await getConsultantProfile();
  if (!profile) throw new Error("Profile not found");

  const [caseStudy] = await db
    .select()
    .from(caseStudies)
    .where(eq(caseStudies.id, id))
    .limit(1);

  if (!caseStudy || caseStudy.consultantId !== profile.id) {
    throw new Error("Case study not found");
  }

  return caseStudy;
}

export async function createCaseStudy(data: {
  title: string;
  clientType: string;
  challenge: string;
  solution: string;
  results: string;
  duration?: string;
  tags?: string[];
  status?: string;
}) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await getConsultantProfile();
  if (!profile) throw new Error("Profile not found");

  const [created] = await db
    .insert(caseStudies)
    .values({
      consultantId: profile.id,
      title: data.title,
      clientType: data.clientType,
      challenge: data.challenge,
      solution: data.solution,
      results: data.results,
      duration: data.duration,
      tags: data.tags || [],
      status: data.status || "DRAFT",
    })
    .returning();

  revalidatePath("/rebound/profile");
  revalidatePath("/rebound/case-studies");
  return created;
}

export async function updateCaseStudy(
  id: string,
  data: {
    title?: string;
    clientType?: string;
    challenge?: string;
    solution?: string;
    results?: string;
    duration?: string;
    tags?: string[];
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
    .from(caseStudies)
    .where(eq(caseStudies.id, id))
    .limit(1);

  if (!existing || existing.consultantId !== profile.id) {
    throw new Error("Case study not found");
  }

  const [updated] = await db
    .update(caseStudies)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(caseStudies.id, id))
    .returning();

  revalidatePath("/rebound/profile");
  revalidatePath("/rebound/case-studies");
  return updated;
}

export async function deleteCaseStudy(id: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await getConsultantProfile();
  if (!profile) throw new Error("Profile not found");

  // Verify ownership
  const [existing] = await db
    .select()
    .from(caseStudies)
    .where(eq(caseStudies.id, id))
    .limit(1);

  if (!existing || existing.consultantId !== profile.id) {
    throw new Error("Case study not found");
  }

  await db.delete(caseStudies).where(eq(caseStudies.id, id));

  revalidatePath("/rebound/profile");
  revalidatePath("/rebound/case-studies");
  return true;
}

// Get published case studies for a consultant (public view)
export async function getPublishedCaseStudies(consultantId: string) {
  return await db
    .select()
    .from(caseStudies)
    .where(eq(caseStudies.consultantId, consultantId))
    .orderBy(caseStudies.createdAt);
}
