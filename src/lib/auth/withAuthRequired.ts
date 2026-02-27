import { getUser } from "@/lib/supabase/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema/user";
import { NextRequest, NextResponse } from "next/server";
import { MeResponse } from "@/app/api/app/me/types";

export interface WithAuthHandler {
  (
    req: NextRequest,
    context: {
      session: NonNullable<{
        user: Promise<MeResponse["user"]>;
        expires: string;
      }>;
      params: Promise<Record<string, unknown>>;
    }
  ): Promise<NextResponse | Response>;
}

/**
 * Higher-order function that wraps API route handlers to require authentication
 * Uses Supabase auth instead of NextAuth
 */
const withAuthRequired = (handler: WithAuthHandler) => {
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

    // Get user details from our database (if they exist)
    // Note: Supabase users are synced to our users table
    const userDetails = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        createdAt: users.createdAt,
        emailVerified: users.emailVerified,
      })
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

export default withAuthRequired;
