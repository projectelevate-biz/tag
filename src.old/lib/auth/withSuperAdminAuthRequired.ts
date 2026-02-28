import { getUser, isSuperAdmin } from "@/lib/supabase/auth";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema/user";
import { NextRequest, NextResponse } from "next/server";
import { WithAuthHandler } from "./withAuthRequired";

/**
 * Higher-order function that wraps API route handlers to require super admin authentication
 * Uses Supabase auth instead of NextAuth
 */
const withSuperAdminAuthRequired = (handler: WithAuthHandler) => {
  return async (
    req: NextRequest,
    context: {
      params: Promise<Record<string, unknown>>;
    }
  ) => {
    const user = await getUser();

    if (!user || !user.id || !user.email) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You are not authorized to perform this action",
        },
        { status: 401 }
      );
    }

    if (!process.env.SUPER_ADMIN_EMAILS) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "No super admins configured",
        },
        { status: 403 }
      );
    }

    const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",");

    if (!user.email || !superAdminEmails.includes(user.email)) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Only super admins can access this resource",
        },
        { status: 403 }
      );
    }

    // Get user details from our database
    const userDetails = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .then((users) => users[0]);

    const sessionObject = {
      user: Promise.resolve({
        ...user,
        ...userDetails,
        name: userDetails?.name || user.user_metadata?.name || user.email?.split('@')[0],
        image: userDetails?.image || user.user_metadata?.avatar_url,
      }),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    return await handler(req, {
      ...context,
      session: sessionObject as any,
    });
  };
};

export default withSuperAdminAuthRequired;
