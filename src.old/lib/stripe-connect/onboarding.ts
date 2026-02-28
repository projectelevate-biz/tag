"use server";

import Stripe from "stripe";
import { db } from "@/db";
import { consultants } from "@/db/schema/rebound-relay";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

const STRIPE_CONNECT_CLIENT_ID = process.env.STRIPE_CONNECT_CLIENT_ID;

if (!STRIPE_CONNECT_CLIENT_ID) {
  throw new Error("STRIPE_CONNECT_CLIENT_ID is not set");
}

export async function createStripeConnectAccount(consultantId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify the consultant profile belongs to the user
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
    throw new Error("Forbidden: You can only create accounts for your own profile");
  }

  // If consultant already has a Stripe account, return the existing onboarding link
  if (consultant.stripeAccountId) {
    const accountLink = await stripe.accountLinks.create({
      account: consultant.stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/rebound/onboarding`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/rebound/onboarding?refresh=true`,
      type: "account_onboarding",
    });

    // Update the onboarding link in the database
    await db
      .update(consultants)
      .set({ onboardingLinkUrl: accountLink.url })
      .where(eq(consultants.id, consultantId));

    return { url: accountLink.url, existing: true };
  }

  // Create a new Connect account
  const account = await stripe.accounts.create({
    type: "express",
    country: "US",
    email: session.user.email,
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    business_type: "individual",
    business_profile: {
      url: consultant.website || undefined,
      mcc: "5734", // Professional services - NAICS code
    },
    tos_acceptance: {
      date: Math.floor(Date.now() / 1000),
      ip: "0.0.0.0", // In production, get this from the request
    },
  });

  // Store the Stripe account ID
  await db
    .update(consultants)
    .set({ stripeAccountId: account.id })
    .where(eq(consultants.id, consultantId));

  // Create an account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/rebound/onboarding`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/rebound/onboarding?refresh=true`,
    type: "account_onboarding",
  });

  // Store the onboarding link
  await db
    .update(consultants)
    .set({ onboardingLinkUrl: accountLink.url })
    .where(eq(consultants.id, consultantId));

  return { url: accountLink.url, existing: false };
}

export async function getStripeConnectStatus(consultantId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const consultant = await db
    .select({
      stripeAccountId: consultants.stripeAccountId,
      stripeOnboardingComplete: consultants.stripeOnboardingComplete,
      payoutsEnabled: consultants.payoutsEnabled,
    })
    .from(consultants)
    .where(eq(consultants.id, consultantId))
    .limit(1)
    .then((res) => res[0]);

  if (!consultant) {
    throw new Error("Consultant profile not found");
  }

  if (!consultant.stripeAccountId) {
    return {
      hasAccount: false,
      onboardingComplete: false,
      payoutsEnabled: false,
    };
  }

  // Fetch fresh status from Stripe
  try {
    const account = await stripe.accounts.retrieve(consultant.stripeAccountId);

    // Update the database with current status
    const isOnboardingComplete = account.details_submitted;
    const arePayoutsEnabled = account.payouts_enabled;

    await db
      .update(consultants)
      .set({
        stripeOnboardingComplete: isOnboardingComplete,
        payoutsEnabled: arePayoutsEnabled,
      })
      .where(eq(consultants.id, consultantId));

    return {
      hasAccount: true,
      onboardingComplete: isOnboardingComplete,
      payoutsEnabled: arePayoutsEnabled,
    };
  } catch (error) {
    console.error("Failed to fetch Stripe account status:", error);
    return {
      hasAccount: true,
      onboardingComplete: consultant.stripeOnboardingComplete || false,
      payoutsEnabled: consultant.payoutsEnabled || false,
    };
  }
}

export async function createLoginLink(consultantId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const consultant = await db
    .select()
    .from(consultants)
    .where(eq(consultants.id, consultantId))
    .limit(1)
    .then((res) => res[0]);

  if (!consultant || !consultant.stripeAccountId) {
    throw new Error("Stripe account not found");
  }

  if (consultant.userId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const loginLink = await stripe.accounts.createLoginLink(consultant.stripeAccountId);

  return { url: loginLink.url };
}
