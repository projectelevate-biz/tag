-- ============================================================================
-- Rebound & Relay - Relay Features (Institution Side)
-- ============================================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/sql
-- ============================================================================

-- ============================================================================
-- CONTACT INQUIRIES TABLE
-- Allows institutions to send inquiries to consultants before engagement
-- ============================================================================

CREATE TABLE IF NOT EXISTS "inquiry" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "consultantId" text NOT NULL,
    "organizationId" text NOT NULL,
    "senderName" text NOT NULL,
    "senderEmail" text NOT NULL,
    "senderTitle" text,
    "subject" text NOT NULL,
    "message" text NOT NULL,
    "status" text DEFAULT 'PENDING' NOT NULL, -- PENDING, RESPONDED, CONVERTED_TO_ENGAGEMENT
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "inquiry_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade,
    CONSTRAINT "inquiry_organizationId_fk" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE cascade
);

-- Index for inquiries
CREATE INDEX IF NOT EXISTS "inquiry_consultantId_idx" ON "inquiry"("consultantId");
CREATE INDEX IF NOT EXISTS "inquiry_organizationId_idx" ON "inquiry"("organizationId");
CREATE INDEX IF NOT EXISTS "inquiry_status_idx" ON "inquiry"("status");

-- ============================================================================
-- ENGAGEMENT DOCUMENTS TABLE
-- Documents shared between institutions and consultants during engagements
-- ============================================================================

CREATE TABLE IF NOT EXISTS "engagement_document" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "engagementId" text NOT NULL,
    "uploadedBy" text NOT NULL, -- 'CLIENT' or 'CONSULTANT'
    "fileName" text NOT NULL,
    "storagePath" text NOT NULL,
    "fileSize" integer,
    "mimeType" text,
    "description" text,
    "createdAt" timestamp DEFAULT now(),
    CONSTRAINT "engagement_document_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE cascade
);

-- Index for engagement documents
CREATE INDEX IF NOT EXISTS "engagement_document_engagementId_idx" ON "engagement_document"("engagementId");

-- ============================================================================
-- MESSAGES TABLE
-- Direct messaging between consultants and institutions
-- ============================================================================

CREATE TABLE IF NOT EXISTS "message" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "engagementId" text, -- Optional: messages can be outside an engagement
    "inquiryId" text, -- Optional: can be linked to an inquiry
    "senderId" text NOT NULL, -- Can be userId or organizationId
    "senderType" text NOT NULL, -- 'CONSULTANT' or 'ORGANIZATION'
    "recipientId" text NOT NULL,
    "recipientType" text NOT NULL, -- 'CONSULTANT' or 'ORGANIZATION'
    "content" text NOT NULL,
    "readAt" timestamp,
    "createdAt" timestamp DEFAULT now(),
    CONSTRAINT "message_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE cascade,
    CONSTRAINT "message_inquiryId_fk" FOREIGN KEY ("inquiryId") REFERENCES "inquiry"("id") ON DELETE cascade
);

-- Index for messages
CREATE INDEX IF NOT EXISTS "message_engagementId_idx" ON "message"("engagementId");
CREATE INDEX IF NOT EXISTS "message_inquiryId_idx" ON "message"("inquiryId");
CREATE INDEX IF NOT EXISTS "message_senderId_idx" ON "message"("senderId");
CREATE INDEX IF NOT EXISTS "message_recipientId_idx" ON "message"("recipientId");

-- ============================================================================
-- CONVERSATIONS TABLE (optional - groups messages by thread)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "conversation" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "consultantId" text NOT NULL,
    "organizationId" text NOT NULL,
    "engagementId" text,
    "subject" text,
    "lastMessageAt" timestamp,
    "lastMessagePreview" text,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "conversation_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade,
    CONSTRAINT "conversation_organizationId_fk" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE cascade,
    CONSTRAINT "conversation_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE set null,
    UNIQUE("consultantId", "organizationId", "engagementId")
);

-- Index for conversations
CREATE INDEX IF NOT EXISTS "conversation_consultantId_idx" ON "conversation"("consultantId");
CREATE INDEX IF NOT EXISTS "conversation_organizationId_idx" ON "conversation"("organizationId");

-- ============================================================================
-- Success! Relay features are ready.
-- ============================================================================
