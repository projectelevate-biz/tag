-- ============================================================================
-- Rebound & Relay - Initial Schema Migration
-- ============================================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/sql
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE (from auth.users reference)
-- ============================================================================
-- Note: Supabase auth creates the auth.users table automatically.
-- This creates a local users table for app-specific data.

CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY,
    "name" text,
    "email" text NOT NULL UNIQUE,
    "emailVerified" timestamp,
    "image" text,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "organization" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "slug" text UNIQUE NOT NULL,
    "type" text,
    "image" text,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    "credits" jsonb,
    "onboardingDone" boolean DEFAULT false,
    "onboardingData" jsonb,
    "stripeCustomerId" text,
    "stripeSubscriptionId" text,
    "lemonSqueezyCustomerId" text,
    "lemonSqueezySubscriptionId" text,
    "dodoCustomerId" text,
    "dodoSubscriptionId" text,
    "planId" text
);

-- ============================================================================
-- CONSULTANTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "consultant" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    "headline" text,
    "bio" text,
    "status" text DEFAULT 'DRAFT' NOT NULL,
    "expertiseTags" jsonb,
    "location" text,
    "hourlyRate" integer,
    "availability" text DEFAULT 'available' NOT NULL,
    "website" text,
    "linkedin" text,
    -- Additional fields
    "profileImage" text,
    "yearsOfExperience" integer DEFAULT 0,
    "timezone" text,
    "travelOpen" boolean DEFAULT false,
    "languages" jsonb,
    "profileSlug" text UNIQUE,
    -- Stripe Connect fields
    "stripeAccountId" text,
    "stripeOnboardingComplete" boolean DEFAULT false,
    "onboardingLinkUrl" text,
    "payoutsEnabled" boolean DEFAULT false,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "consultant_userId_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
);

-- Create unique index for profileSlug
CREATE UNIQUE INDEX IF NOT EXISTS "consultant_profileSlug_idx" ON "consultant"("profileSlug") WHERE "profileSlug" IS NOT NULL;

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "document" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "consultantId" text NOT NULL,
    "type" text NOT NULL,
    "s3Key" text NOT NULL,
    "originalFilename" text NOT NULL,
    "createdAt" timestamp DEFAULT now(),
    CONSTRAINT "document_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade
);

-- ============================================================================
-- ENGAGEMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "engagement" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "clientId" text NOT NULL,
    "consultantId" text NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "status" text DEFAULT 'INITIATED' NOT NULL,
    "startDate" timestamp,
    "endDate" timestamp,
    "budget" integer,
    "deliverables" jsonb,
    "internalNotes" text,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "engagement_clientId_fk" FOREIGN KEY ("clientId") REFERENCES "organization"("id") ON DELETE cascade,
    CONSTRAINT "engagement_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade
);

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "invoice" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "engagementId" text NOT NULL,
    "amount" integer NOT NULL,
    "commissionAmount" integer,
    "status" text DEFAULT 'PENDING' NOT NULL,
    "stripePaymentIntentId" text,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "invoice_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE cascade
);

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "audit_log" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "actorId" text NOT NULL,
    "action" text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    "details" jsonb,
    "createdAt" timestamp DEFAULT now(),
    CONSTRAINT "audit_log_actorId_fk" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE cascade
);

-- ============================================================================
-- CASE STUDIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "case_study" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "consultantId" text NOT NULL,
    "title" text NOT NULL,
    "clientType" text NOT NULL,
    "challenge" text NOT NULL,
    "solution" text NOT NULL,
    "results" text NOT NULL,
    "duration" text,
    "tags" jsonb,
    "status" text DEFAULT 'DRAFT' NOT NULL,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "case_study_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade
);

-- ============================================================================
-- TESTIMONIALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "testimonial" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "consultantId" text NOT NULL,
    "authorName" text NOT NULL,
    "authorTitle" text,
    "authorInstitution" text,
    "content" text NOT NULL,
    "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "engagementId" text,
    "status" text DEFAULT 'PENDING' NOT NULL,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "testimonial_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade,
    CONSTRAINT "testimonial_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE set null
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Consultant indexes
CREATE INDEX IF NOT EXISTS "consultant_userId_idx" ON "consultant"("userId");
CREATE INDEX IF NOT EXISTS "consultant_status_idx" ON "consultant"("status");

-- Document indexes
CREATE INDEX IF NOT EXISTS "document_consultantId_idx" ON "document"("consultantId");

-- Engagement indexes
CREATE INDEX IF NOT EXISTS "engagement_clientId_idx" ON "engagement"("clientId");
CREATE INDEX IF NOT EXISTS "engagement_consultantId_idx" ON "engagement"("consultantId");
CREATE INDEX IF NOT EXISTS "engagement_status_idx" ON "engagement"("status");

-- Invoice indexes
CREATE INDEX IF NOT EXISTS "invoice_engagementId_idx" ON "invoice"("engagementId");
CREATE INDEX IF NOT EXISTS "invoice_status_idx" ON "invoice"("status");

-- Audit log indexes
CREATE INDEX IF NOT EXISTS "audit_log_actorId_idx" ON "audit_log"("actorId");
CREATE INDEX IF NOT EXISTS "audit_log_entityType_idx" ON "audit_log"("entityType");

-- Case study indexes
CREATE INDEX IF NOT EXISTS "case_study_consultantId_idx" ON "case_study"("consultantId");

-- Testimonial indexes
CREATE INDEX IF NOT EXISTS "testimonial_consultantId_idx" ON "testimonial"("consultantId");
CREATE INDEX IF NOT EXISTS "testimonial_engagementId_idx" ON "testimonial"("engagementId");

-- ============================================================================
-- RELAY (INSTITUTION) SIDE TABLES
-- ============================================================================

-- ============================================================================
-- INQUIRIES TABLE
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
    "status" text DEFAULT 'PENDING' NOT NULL,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "inquiry_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade,
    CONSTRAINT "inquiry_organizationId_fk" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE cascade
);

-- ============================================================================
-- ENGAGEMENT DOCUMENTS TABLE
-- Documents shared between institutions and consultants during engagements
-- ============================================================================

CREATE TABLE IF NOT EXISTS "engagement_document" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "engagementId" text NOT NULL,
    "uploadedBy" text NOT NULL,
    "fileName" text NOT NULL,
    "storagePath" text NOT NULL,
    "fileSize" integer,
    "mimeType" text,
    "description" text,
    "createdAt" timestamp DEFAULT now(),
    CONSTRAINT "engagement_document_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE cascade
);

-- ============================================================================
-- MESSAGES TABLE
-- Direct messaging between consultants and institutions
-- ============================================================================

CREATE TABLE IF NOT EXISTS "message" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "engagementId" text,
    "inquiryId" text,
    "senderId" text NOT NULL,
    "senderType" text NOT NULL,
    "recipientId" text NOT NULL,
    "recipientType" text NOT NULL,
    "content" text NOT NULL,
    "readAt" timestamp,
    "createdAt" timestamp DEFAULT now(),
    CONSTRAINT "message_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE cascade,
    CONSTRAINT "message_inquiryId_fk" FOREIGN KEY ("inquiryId") REFERENCES "inquiry"("id") ON DELETE cascade
);

-- ============================================================================
-- CONVERSATIONS TABLE
-- Groups messages by thread
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

-- ============================================================================
-- RELAY INDEXES
-- ============================================================================

-- Inquiry indexes
CREATE INDEX IF NOT EXISTS "inquiry_consultantId_idx" ON "inquiry"("consultantId");
CREATE INDEX IF NOT EXISTS "inquiry_organizationId_idx" ON "inquiry"("organizationId");
CREATE INDEX IF NOT EXISTS "inquiry_status_idx" ON "inquiry"("status");

-- Engagement document indexes
CREATE INDEX IF NOT EXISTS "engagement_document_engagementId_idx" ON "engagement_document"("engagementId");

-- Message indexes
CREATE INDEX IF NOT EXISTS "message_engagementId_idx" ON "message"("engagementId");
CREATE INDEX IF NOT EXISTS "message_inquiryId_idx" ON "message"("inquiryId");
CREATE INDEX IF NOT EXISTS "message_senderId_idx" ON "message"("senderId");
CREATE INDEX IF NOT EXISTS "message_recipientId_idx" ON "message"("recipientId");

-- Conversation indexes
CREATE INDEX IF NOT EXISTS "conversation_consultantId_idx" ON "conversation"("consultantId");
CREATE INDEX IF NOT EXISTS "conversation_organizationId_idx" ON "conversation"("organizationId");

-- ============================================================================
-- Success! Initial schema created.
-- ============================================================================
