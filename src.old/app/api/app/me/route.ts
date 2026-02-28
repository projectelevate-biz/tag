import withAuthRequired from "@/lib/auth/withAuthRequired";
import { NextResponse } from "next/server";
import { MeResponse } from "./types";
import { db } from "@/db";
import { users } from "@/db/schema/user";
import { organizations } from "@/db/schema/organization";
import { organizationMemberships } from "@/db/schema/organization-membership";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2),
  image: z.string().optional(),
});

export const GET = withAuthRequired(async (req, context) => {
  const { session } = context;

  return NextResponse.json<MeResponse>({
    user: await session.user,
  });
});

export const PATCH = withAuthRequired(async (req, context) => {
  const { session } = context;
  const body = await req.json();

  const validatedData = updateUserSchema.parse(body);
  const user = await session.user;

  const updatedUser = await db
    .update(users)
    .set({
      name: validatedData.name,
      image: validatedData.image,
    })
    .where(eq(users.id, user.id))
    .returning();

  return NextResponse.json(updatedUser[0]);
});

// TODO: Implement actual account deletion logic
export const DELETE = withAuthRequired(async (req, context) => {
  const { session } = context;
  const user = await session.user;

  // Find all organizations where the user is an owner
  const ownedOrgMemberships = await db
    .select({ organizationId: organizationMemberships.organizationId })
    .from(organizationMemberships)
    .where(
      and(
        eq(organizationMemberships.userId, user.id),
        eq(organizationMemberships.role, "owner"),
      ),
    );

  const ownedOrgIds = ownedOrgMemberships.map((m) => m.organizationId);

  // NOTE: This logic deletes the user and ALL organizations where they are an owner.
  // If you want to only delete organizations where they are the *sole* owner,
  // or transfer ownership before deletion, modify this logic.
  // You might also want to soft-delete instead of hard-delete.
  if (ownedOrgIds.length > 0) {
    await db
      .delete(organizations)
      .where(inArray(organizations.id, ownedOrgIds));
  }

  // Delete the user
  await db.delete(users).where(eq(users.id, user.id));

  return NextResponse.json({ success: true });
});
