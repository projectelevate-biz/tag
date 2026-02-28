"use server";

import { db } from "@/db";
import { inquiries, messages, conversations, consultants } from "@/db/schema/rebound-relay";
import { organizations } from "@/db/schema/organization";
import { eq, and } from "drizzle-orm";
import { getUser } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";

// ============================================================================
// INQUIRIES - Contact consultants before engagement
// ============================================================================

export async function createInquiry(data: {
  consultantId: string;
  senderName: string;
  senderEmail: string;
  senderTitle?: string;
  subject: string;
  message: string;
}) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Get the user's organization
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.id))
    .limit(1);

  if (!org) throw new Error("Organization not found");

  // Check if consultant exists and is active
  const [consultant] = await db
    .select()
    .from(consultants)
    .where(eq(consultants.id, data.consultantId))
    .limit(1);

  if (!consultant) throw new Error("Consultant not found");
  if (consultant.status !== "ACTIVE") throw new Error("Consultant is not available");

  // Create inquiry
  const [inquiry] = await db
    .insert(inquiries)
    .values({
      consultantId: data.consultantId,
      organizationId: org.id,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      senderTitle: data.senderTitle,
      subject: data.subject,
      message: data.message,
      status: "PENDING",
    })
    .returning();

  revalidatePath("/relay/inquiries");
  return inquiry;
}

export async function getInquiriesForConsultant() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Get consultant profile
  const [consultant] = await db
    .select()
    .from(consultants)
    .where(eq(consultants.userId, user.id))
    .limit(1);

  if (!consultant) return [];

  return await db
    .select({
      id: inquiries.id,
      senderName: inquiries.senderName,
      senderEmail: inquiries.senderEmail,
      senderTitle: inquiries.senderTitle,
      subject: inquiries.subject,
      message: inquiries.message,
      status: inquiries.status,
      createdAt: inquiries.createdAt,
      organizationName: organizations.name,
    })
    .from(inquiries)
    .innerJoin(organizations, eq(inquiries.organizationId, organizations.id))
    .where(eq(inquiries.consultantId, consultant.id))
    .orderBy(inquiries.createdAt);
}

export async function getInquiriesForOrganization() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Get user's organization
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.id))
    .limit(1);

  if (!org) return [];

  return await db
    .select({
      id: inquiries.id,
      subject: inquiries.subject,
      message: inquiries.message,
      status: inquiries.status,
      createdAt: inquiries.createdAt,
      consultantHeadline: consultants.headline,
      consultantName: consultants.headline, // In real app, would join with users
    })
    .from(inquiries)
    .innerJoin(consultants, eq(inquiries.consultantId, consultants.id))
    .where(eq(inquiries.organizationId, org.id))
    .orderBy(inquiries.createdAt);
}

export async function respondToInquiry(inquiryId: string, response: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Get consultant profile
  const [consultant] = await db
    .select()
    .from(consultants)
    .where(eq(consultants.userId, user.id))
    .limit(1);

  if (!consultant) throw new Error("Consultant profile not found");

  // Get inquiry
  const [inquiry] = await db
    .select()
    .from(inquiries)
    .where(eq(inquiries.id, inquiryId))
    .limit(1);

  if (!inquiry || inquiry.consultantId !== consultant.id) {
    throw new Error("Inquiry not found");
  }

  // Update inquiry status
  await db
    .update(inquiries)
    .set({ status: "RESPONDED", updatedAt: new Date() })
    .where(eq(inquiries.id, inquiryId));

  // Send notification email (would implement this)
  // For now, just return success

  revalidatePath("/rebound/inquiries");
  return true;
}

// ============================================================================
// MESSAGES - Direct messaging
// ============================================================================

export async function sendMessage(data: {
  engagementId?: string;
  inquiryId?: string;
  recipientId: string;
  recipientType: "CONSULTANT" | "ORGANIZATION";
  content: string;
}) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Determine sender type
  let senderType: "CONSULTANT" | "ORGANIZATION";
  let senderId: string;

  // Check if user is a consultant
  const [consultant] = await db
    .select()
    .from(consultants)
    .where(eq(consultants.userId, user.id))
    .limit(1);

  if (consultant) {
    senderType = "CONSULTANT";
    senderId = consultant.id;
  } else {
    // User is from an organization
    senderType = "ORGANIZATION";
    senderId = user.id;
  }

  // Create or update conversation
  let conversationId: string | null = null;

  if (data.engagementId) {
    // Find or create conversation for engagement
    const [existing] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.engagementId, data.engagementId))
      .limit(1);

    if (existing) {
      conversationId = existing.id;
      await db
        .update(conversations)
        .set({
          lastMessageAt: new Date(),
          lastMessagePreview: data.content.slice(0, 100),
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, existing.id));
    } else {
      const [created] = await db
        .insert(conversations)
        .values({
          consultantId: senderType === "CONSULTANT" ? senderId : data.recipientId,
          organizationId: senderType === "ORGANIZATION" ? senderId : data.recipientId,
          engagementId: data.engagementId,
          lastMessageAt: new Date(),
          lastMessagePreview: data.content.slice(0, 100),
        })
        .returning();
      conversationId = created.id;
    }
  } else if (data.inquiryId) {
    // Find inquiry to get consultant and org IDs
    const [inquiry] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, data.inquiryId))
      .limit(1);

    if (!inquiry) throw new Error("Inquiry not found");

    // Look for existing conversation between this consultant and org
    const [existing] = await db
      .select()
      .from(conversations)
      .where(and(
        eq(conversations.consultantId, inquiry.consultantId),
        eq(conversations.organizationId, inquiry.organizationId)
      ))
      .limit(1);

    if (existing) {
      conversationId = existing.id;
      await db
        .update(conversations)
        .set({
          lastMessageAt: new Date(),
          lastMessagePreview: data.content.slice(0, 100),
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, existing.id));
    } else {
      const [created] = await db
        .insert(conversations)
        .values({
          consultantId: inquiry.consultantId,
          organizationId: inquiry.organizationId,
          lastMessageAt: new Date(),
          lastMessagePreview: data.content.slice(0, 100),
        })
        .returning();
      conversationId = created.id;
    }
  }

  if (!conversationId) {
    throw new Error("Failed to create or find conversation");
  }

  // Create message
  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      engagementId: data.engagementId,
      inquiryId: data.inquiryId,
      senderId,
      senderType,
      content: data.content,
    })
    .returning();

  revalidatePath("/rebound/messages");
  revalidatePath("/relay/messages");
  return message;
}

export async function getMessagesForEngagement(engagementId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  return await db
    .select()
    .from(messages)
    .where(eq(messages.engagementId, engagementId))
    .orderBy(messages.createdAt);
}

export async function getConversations() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is consultant or organization
  const [consultant] = await db
    .select()
    .from(consultants)
    .where(eq(consultants.userId, user.id))
    .limit(1);

  if (consultant) {
    // User is consultant
    return await db
      .select({
        id: conversations.id,
        subject: conversations.subject,
        lastMessageAt: conversations.lastMessageAt,
        lastMessagePreview: conversations.lastMessagePreview,
        engagementId: conversations.engagementId,
        organizationName: organizations.name,
      })
      .from(conversations)
      .innerJoin(organizations, eq(conversations.organizationId, organizations.id))
      .where(eq(conversations.consultantId, consultant.id))
      .orderBy(conversations.lastMessageAt);
  } else {
    // User is from organization
    return await db
      .select({
        id: conversations.id,
        subject: conversations.subject,
        lastMessageAt: conversations.lastMessageAt,
        lastMessagePreview: conversations.lastMessagePreview,
        engagementId: conversations.engagementId,
        consultantHeadline: consultants.headline,
      })
      .from(conversations)
      .innerJoin(consultants, eq(conversations.consultantId, consultants.id))
      .where(eq(conversations.organizationId, user.id))
      .orderBy(conversations.lastMessageAt);
  }
}

export async function markMessageAsRead(messageId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(eq(messages.id, messageId));

  return true;
}

export async function getUnreadMessageCount() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is consultant or organization
  const [consultant] = await db
    .select()
    .from(consultants)
    .where(eq(consultants.userId, user.id))
    .limit(1);

  let senderId: string;
  if (consultant) {
    senderId = consultant.id;
  } else {
    senderId = user.id;
  }

  // Find conversations where user is consultant or organization
  const userConversations = consultant
    ? await db.select().from(conversations).where(eq(conversations.consultantId, senderId))
    : await db.select().from(conversations).where(eq(conversations.organizationId, senderId));

  if (userConversations.length === 0) return 0;

  // Get unread messages in those conversations (not sent by current user)
  const conversationIds = userConversations.map((c) => c.id);
  let unreadCount = 0;

  for (const convId of conversationIds) {
    const convMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, convId));

    unreadCount += convMessages.filter((m) => m.senderId !== senderId && !m.readAt).length;
  }

  return unreadCount;
}
