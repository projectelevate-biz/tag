import { getUser } from "@/lib/supabase/auth";
import { db } from "@/db";
import * as Sentry from "@sentry/nextjs";
import {
  OrganizationMembership,
  organizationMemberships,
} from "@/db/schema/organization-membership";
import { OrganizationRole, organizations } from "@/db/schema/organization";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { MeResponse } from "@/app/api/app/me/types";
import { users } from "@/db/schema/user";
import type { InferSelectModel } from "drizzle-orm";
import { getSession } from "../session";
import { hasHigherOrEqualRole } from "../organizations/hasHigherOrEqualRole";
import { plans } from "@/db/schema/plans";

type Organization = InferSelectModel<typeof organizations>;

export interface WithOrganizationAuthHandler {
  (
    req: NextRequest,
    context: {
      session: NonNullable<{
        expires: string;
        user: Promise<MeResponse["user"]>;
        organization: Promise<
          Organization & {
            role: OrganizationMembership["role"];
            plan: InferSelectModel<typeof plans> | null;
          }
        >;
      }>;
      params: Promise<Record<string, unknown>>;
    }
  ): Promise<NextResponse | Response>;
}

/**
 * Higher-order function that wraps API route handlers to require organization authentication
 * Uses Supabase auth instead of NextAuth
 */
const withOrganizationAuthRequired = (
  handler: WithOrganizationAuthHandler,
  requiredRole: OrganizationRole
) => {
  return async (
    req: NextRequest,
    context: {
      params: Promise<Record<string, unknown>>;
    }
  ) => {
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You are not authorized to perform this action",
        },
        { status: 401 }
      );
    }

    const browserSession = await getSession();
    const currentOranizationId = browserSession?.currentOrganizationId;

    if (currentOranizationId) {
      Sentry.setTag("organization_id", currentOranizationId);
    }

    if (user.id) {
      Sentry.setUser({ id: user.id, email: user.email || undefined });
    }

    if (!currentOranizationId) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Current organization ID is required in session.",
        },
        { status: 400 }
      );
    }

    // Check if User belong to the organization
    const isMember = await db
      .select({ role: organizationMemberships.role })
      .from(organizationMemberships)
      .where(
        and(
          eq(organizationMemberships.userId, user.id),
          eq(organizationMemberships.organizationId, currentOranizationId)
        )
      )
      .limit(1)
      .then((memberships) => memberships[0]);

    if (!isMember) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You do not have access to this organization",
        },
        { status: 403 }
      );
    }

    // Role Check
    if (
      !hasHigherOrEqualRole({
        currentRole: isMember.role,
        requiredRole,
      })
    ) {
      return NextResponse.json({
        error: "Forbidden",
        message: "You do not have the required role to perform this action",
      }, { status: 403 });
    }

    const sessionObject = {
      user: Promise.resolve({
        ...user,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        image: user.user_metadata?.avatar_url,
        id: user.id,
      }),
      // Getter for organization to load when needed
      organization: (async () => {
        const org = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, currentOranizationId))
          .limit(1)
          .then((orgs) => orgs[0]);

        const membership = await db
          .select({
            role: organizationMemberships.role,
          })
          .from(organizationMemberships)
          .where(
            and(
              eq(organizationMemberships.userId, user.id),
              eq(organizationMemberships.organizationId, org.id)
            )
          )
          .limit(1)
          .then((memberships) => memberships[0]);

        const currentPlan = org.planId
          ? await db
              .select()
              .from(plans)
              .where(eq(plans.id, org.planId))
              .limit(1)
              .then((plans) => plans[0])
          : null;

        return {
          ...org,
          role: membership.role,
          plan: currentPlan,
        };
      })(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    return await handler(req, {
      ...context,
      session: sessionObject as any,
    });
  };
};

export default withOrganizationAuthRequired;
