-- ============================================================================
-- Rebound & Relay - COMPLETE 5-Year Schema Migration
-- ============================================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/sql
-- ============================================================================
-- This migration includes ALL tables needed for:
-- - Rebound (Consultant Marketplace)
-- - Relay (Institution Platform)
-- - 5-year product vision
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE USER & ORGANIZATION TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY,
    "name" text,
    "email" text NOT NULL UNIQUE,
    "emailVerified" timestamp,
    "image" text,
    "role" text DEFAULT 'USER', -- USER, ADMIN, SUPER_ADMIN
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "organization" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "slug" text UNIQUE NOT NULL,
    "type" text, -- PUBLIC_UNIVERSITY, PRIVATE_COLLEGE, COMMUNITY_COLLEGE, etc.
    "image" text,
    "description" text,
    "website" text,
    "location" text,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    -- Billing/Credits
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
-- CONSULTANT PROFILE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS "consultant" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    -- Basic Info
    "headline" text,
    "bio" text,
    "location" text,
    "profileImage" text,
    "profileSlug" text UNIQUE,
    -- Status
    "status" text DEFAULT 'DRAFT' NOT NULL, -- DRAFT, SUBMITTED, ACTIVE, REJECTED, SUSPENDED
    "availability" text DEFAULT 'available' NOT NULL, -- available, busy, unavailable
    -- Expertise
    "expertiseTags" jsonb, -- Array of expertise areas
    "yearsOfExperience" integer DEFAULT 0,
    "timezone" text,
    "travelOpen" boolean DEFAULT false,
    "languages" jsonb, -- Array of languages
    -- Pricing
    "hourlyRate" integer, -- In cents
    "projectRateMin" integer, -- Minimum project rate
    "projectRateMax" integer, -- Maximum project rate
    -- Links
    "website" text,
    "linkedin" text,
    "cv" text, -- Link to CV/resume
    -- Education & Certifications
    "education" jsonb, -- Array of education objects
    "certifications" jsonb, -- Array of certifications
    -- Stripe Connect
    "stripeAccountId" text,
    "stripeOnboardingComplete" boolean DEFAULT false,
    "onboardingLinkUrl" text,
    "payoutsEnabled" boolean DEFAULT false,
    -- Metrics
    "profileViews" integer DEFAULT 0,
    "inquiryCount" integer DEFAULT 0,
    "engagementCount" integer DEFAULT 0,
    "avgRating" numeric, -- Average rating from reviews
    -- Timestamps
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    "publishedAt" timestamp, -- When profile went live
    CONSTRAINT "consultant_userId_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
);

CREATE UNIQUE INDEX IF NOT EXISTS "consultant_profileSlug_idx" ON "consultant"("profileSlug") WHERE "profileSlug" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "consultant_userId_idx" ON "consultant"("userId");
CREATE INDEX IF NOT EXISTS "consultant_status_idx" ON "consultant"("status");
CREATE INDEX IF NOT EXISTS "consultant_availability_idx" ON "consultant"("availability");

-- ============================================================================
-- CONSULTANT DOCUMENTS & PORTFOLIO
-- ============================================================================

CREATE TABLE IF NOT EXISTS "document" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "consultantId" text NOT NULL,
    "type" text NOT NULL, -- RESUME, CV, PROPOSAL, CERTIFICATE, OTHER
    "title" text,
    "description" text,
    "storagePath" text NOT NULL, -- Supabase storage path
    "fileName" text NOT NULL,
    "fileSize" integer,
    "mimeType" text,
    "isPublic" boolean DEFAULT false, -- Can be shared publicly
    "createdAt" timestamp DEFAULT now(),
    CONSTRAINT "document_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "document_consultantId_idx" ON "document"("consultantId");

-- ============================================================================
-- CASE STUDIES & WORK SAMPLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS "case_study" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "consultantId" text NOT NULL,
    "title" text NOT NULL,
    "clientType" text NOT NULL, -- University, Community College, Private, etc.
    "industry" text, -- Higher Ed, Healthcare, etc.
    "challenge" text NOT NULL,
    "solution" text NOT NULL,
    "results" text NOT NULL,
    "duration" text, -- e.g., "6 months", "1 year"
    "teamSize" text,
    "budget" text, -- Project budget range (display only)
    "tags" jsonb,
    "images" jsonb, -- Array of image URLs
    "status" text DEFAULT 'DRAFT' NOT NULL, -- DRAFT, PUBLISHED, ARCHIVED
    "featured" boolean DEFAULT false,
    "orderIndex" integer DEFAULT 0,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "case_study_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "case_study_consultantId_idx" ON "case_study"("consultantId");
CREATE INDEX IF NOT EXISTS "case_study_status_idx" ON "case_study"("status");

-- ============================================================================
-- ENGAGEMENTS & PROJECTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "engagement" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "clientId" text NOT NULL,
    "consultantId" text NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "status" text DEFAULT 'INITIATED' NOT NULL, -- INITIATED, ACTIVE, PAUSED, COMPLETED, CANCELED
    "type" text DEFAULT 'CONSULTING', -- CONSULTING, TRAINING, COACHING, ADVISORY
    "startDate" timestamp,
    "endDate" timestamp,
    "estimatedHours" integer,
    "actualHours" integer,
    "budget" integer, -- In cents
    "actualCost" integer, -- In cents
    "deliverables" jsonb,
    "internalNotes" text, -- Private notes for admin/internal team
    "clientNotes" text, -- Notes visible to client
    "consultantNotes" text, -- Notes visible to consultant
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "engagement_clientId_fk" FOREIGN KEY ("clientId") REFERENCES "organization"("id") ON DELETE cascade,
    CONSTRAINT "engagement_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "engagement_clientId_idx" ON "engagement"("clientId");
CREATE INDEX IF NOT EXISTS "engagement_consultantId_idx" ON "engagement"("consultantId");
CREATE INDEX IF NOT EXISTS "engagement_status_idx" ON "engagement"("status");

-- ============================================================================
-- ENGAGEMENT MILESTONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS "milestone" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "engagementId" text NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "dueDate" timestamp,
    "completedAt" timestamp,
    "status" text DEFAULT 'PENDING' NOT NULL, -- PENDING, IN_PROGRESS, COMPLETED, CANCELED
    "orderIndex" integer DEFAULT 0,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "milestone_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "milestone_engagementId_idx" ON "milestone"("engagementId");

-- ============================================================================
-- ENGAGEMENT DOCUMENTS (Shared files)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "engagement_document" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "engagementId" text NOT NULL,
    "uploadedBy" text NOT NULL, -- CLIENT or CONSULTANT
    "uploadedById" text NOT NULL, -- User ID
    "fileName" text NOT NULL,
    "storagePath" text NOT NULL,
    "fileSize" integer,
    "mimeType" text,
    "description" text,
    "category" text, -- CONTRACT, DELIVERABLE, REPORT, OTHER
    "isConfidential" boolean DEFAULT false,
    "createdAt" timestamp DEFAULT now(),
    CONSTRAINT "engagement_document_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "engagement_document_engagementId_idx" ON "engagement_document"("engagementId");

-- ============================================================================
-- INVOICES & PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "invoice" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "engagementId" text NOT NULL,
    "invoiceNumber" text UNIQUE,
    "amount" integer NOT NULL, -- In cents
    "commissionAmount" integer, -- Platform fee in cents
    "description" text,
    "dueDate" timestamp,
    "paidAt" timestamp,
    "status" text DEFAULT 'PENDING' NOT NULL, -- PENDING, PROCESSING, PAID, FAILED, REFUNDED, PARTIAL
    "stripePaymentIntentId" text,
    "stripeInvoiceId" text,
    "metadata" jsonb,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "invoice_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "invoice_engagementId_idx" ON "invoice"("engagementId");
CREATE INDEX IF NOT EXISTS "invoice_status_idx" ON "invoice"("status");

-- ============================================================================
-- TESTIMONIALS & REVIEWS (Two-way)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "testimonial" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "consultantId" text NOT NULL,
    "authorId" text NOT NULL, -- Organization ID
    "authorName" text NOT NULL,
    "authorTitle" text,
    "authorInstitution" text,
    "authorImage" text,
    "content" text NOT NULL,
    "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "engagementId" text,
    "status" text DEFAULT 'PENDING' NOT NULL, -- PENDING, APPROVED, REJECTED
    "response" text, -- Consultant's response to review
    "respondedAt" timestamp,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "testimonial_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade,
    CONSTRAINT "testimonial_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE set null
);

CREATE INDEX IF NOT EXISTS "testimonial_consultantId_idx" ON "testimonial"("consultantId");
CREATE INDEX IF NOT EXISTS "testimonial_engagementId_idx" ON "testimonial"("engagementId");

-- Organization reviews (consultants review institutions)
CREATE TABLE IF NOT EXISTS "organization_review" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "organizationId" text NOT NULL,
    "consultantId" text NOT NULL,
    "consultantName" text,
    "consultantImage" text,
    "engagementId" text,
    "content" text NOT NULL,
    "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "wouldRecommend" boolean DEFAULT true,
    "status" text DEFAULT 'PENDING' NOT NULL,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "org_review_organizationId_fk" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE cascade,
    CONSTRAINT "org_review_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE set null
);

CREATE INDEX IF NOT EXISTS "org_review_organizationId_idx" ON "organization_review"("organizationId");

-- ============================================================================
-- INQUIRIES (Contact before engagement)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "inquiry" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "consultantId" text NOT NULL,
    "organizationId" text NOT NULL,
    "senderName" text NOT NULL,
    "senderEmail" text NOT NULL,
    "senderTitle" text,
    "senderPhone" text,
    "subject" text NOT NULL,
    "message" text NOT NULL,
    "budget" text,
    "timeline" text,
    "status" text DEFAULT 'PENDING' NOT NULL, -- PENDING, RESPONDED, CONVERTED_TO_ENGAGEMENT, DECLINED
    "convertedToEngagementId" text,
    "adminNotes" text, -- Internal notes
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "inquiry_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade,
    CONSTRAINT "inquiry_organizationId_fk" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE cascade,
    CONSTRAINT "inquiry_engagement_fk" FOREIGN KEY ("convertedToEngagementId") REFERENCES "engagement"("id") ON DELETE set null
);

CREATE INDEX IF NOT EXISTS "inquiry_consultantId_idx" ON "inquiry"("consultantId");
CREATE INDEX IF NOT EXISTS "inquiry_organizationId_idx" ON "inquiry"("organizationId");
CREATE INDEX IF NOT EXISTS "inquiry_status_idx" ON "inquiry"("status");

-- ============================================================================
-- PROPOSALS (RFP workflow)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "proposal" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "engagementId" text, -- If created from engagement
    "inquiryId" text, -- If created from inquiry
    "consultantId" text NOT NULL,
    "organizationId" text NOT NULL,
    "title" text NOT NULL,
    "summary" text,
    "scope" text, -- Detailed scope of work
    "deliverables" jsonb,
    "timeline" text,
    "amount" integer, -- Proposed amount in cents
    "status" text DEFAULT 'DRAFT' NOT NULL, -- DRAFT, SENT, UNDER_REVIEW, ACCEPTED, REJECTED, EXPIRED
    "validUntil" timestamp,
    "documentPath" text, -- Link to proposal PDF
    "adminNotes" text,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "proposal_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade,
    CONSTRAINT "proposal_organizationId_fk" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE cascade,
    CONSTRAINT "proposal_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE set null,
    CONSTRAINT "proposal_inquiryId_fk" FOREIGN KEY ("inquiryId") REFERENCES "inquiry"("id") ON DELETE set null
);

CREATE INDEX IF NOT EXISTS "proposal_consultantId_idx" ON "proposal"("consultantId");
CREATE INDEX IF NOT EXISTS "proposal_organizationId_idx" ON "proposal"("organizationId");
CREATE INDEX IF NOT EXISTS "proposal_status_idx" ON "proposal"("status");

-- ============================================================================
-- MESSAGING & NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS "conversation" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "consultantId" text NOT NULL,
    "organizationId" text NOT NULL,
    "engagementId" text,
    "subject" text,
    "lastMessageAt" timestamp,
    "lastMessagePreview" text,
    "lastMessageById" text,
    "archivedBy" jsonb, -- Array of user IDs who archived
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "conversation_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade,
    CONSTRAINT "conversation_organizationId_fk" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE cascade,
    CONSTRAINT "conversation_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE set null,
    UNIQUE("consultantId", "organizationId", "engagementId")
);

CREATE TABLE IF NOT EXISTS "message" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "conversationId" text NOT NULL,
    "engagementId" text,
    "inquiryId" text,
    "senderId" text NOT NULL, -- userId or organizationId
    "senderType" text NOT NULL, -- CONSULTANT or ORGANIZATION
    "content" text NOT NULL,
    "attachments" jsonb, -- Array of file URLs
    "readAt" timestamp,
    "createdAt" timestamp DEFAULT now(),
    CONSTRAINT "message_conversationId_fk" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE cascade,
    CONSTRAINT "message_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE cascade,
    CONSTRAINT "message_inquiryId_fk" FOREIGN KEY ("inquiryId") REFERENCES "inquiry"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "conversation_consultantId_idx" ON "conversation"("consultantId");
CREATE INDEX IF NOT EXISTS "conversation_organizationId_idx" ON "conversation"("organizationId");
CREATE INDEX IF NOT EXISTS "message_conversationId_idx" ON "message"("conversationId");
CREATE INDEX IF NOT EXISTS "message_senderId_idx" ON "message"("senderId");

CREATE TABLE IF NOT EXISTS "notification" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    "type" text NOT NULL, -- INQUIRY_RECEIVED, MESSAGE_RECEIVED, ENGAGEMENT_UPDATE, INVOICE_PAID, etc.
    "title" text NOT NULL,
    "body" text,
    "link" text, -- URL to relevant resource
    "metadata" jsonb, -- Additional data
    "readAt" timestamp,
    "createdAt" timestamp DEFAULT now(),
    CONSTRAINT "notification_userId_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "notification_userId_idx" ON "notification"("userId");
CREATE INDEX IF NOT EXISTS "notification_readAt_idx" ON "notification"("readAt") WHERE "readAt" IS NULL;

-- ============================================================================
-- CALENDAR & SCHEDULING
-- ============================================================================

CREATE TABLE IF NOT EXISTS "calendar_event" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "engagementId" text,
    "consultantId" text,
    "organizationId" text,
    "title" text NOT NULL,
    "description" text,
    "startTime" timestamp NOT NULL,
    "endTime" timestamp NOT NULL,
    "location" text, -- Physical address or meeting link
    "meetingLink" text, -- Zoom/Teams link
    "type" text DEFAULT 'MEETING', -- MEETING, CALL, SITE_VISIT, WORKSHOP
    "status" text DEFAULT 'SCHEDULED' NOT NULL, -- SCHEDULED, CONFIRMED, COMPLETED, CANCELED
    "reminderSent" boolean DEFAULT false,
    "notes" text,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "calendar_event_engagementId_fk" FOREIGN KEY ("engagementId") REFERENCES "engagement"("id") ON DELETE cascade,
    CONSTRAINT "calendar_event_consultantId_fk" FOREIGN KEY ("consultantId") REFERENCES "consultant"("id") ON DELETE cascade,
    CONSTRAINT "calendar_event_organizationId_fk" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "calendar_event_consultantId_idx" ON "calendar_event"("consultantId");
CREATE INDEX IF NOT EXISTS "calendar_event_organizationId_idx" ON "calendar_event"("organizationId");
CREATE INDEX IF NOT EXISTS "calendar_event_startTime_idx" ON "calendar_event"("startTime");

-- ============================================================================
-- SAVED SEARCHES & FAVORITES
-- ============================================================================

CREATE TABLE IF NOT EXISTS "saved_search" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    "name" text NOT NULL,
    "filters" jsonb NOT NULL, -- Search filter parameters
    "type" text NOT NULL, -- CONSULTANT_SEARCH or OPPORTUNITY_SEARCH
    "notifyOnNew" boolean DEFAULT false, -- Email alerts for new matches
    "lastRunAt" timestamp,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now(),
    CONSTRAINT "saved_search_userId_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "saved_search_userId_idx" ON "saved_search"("userId");

CREATE TABLE IF NOT EXISTS "favorite" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" text NOT NULL,
    "favoritableType" text NOT NULL, -- CONSULTANT or ORGANIZATION
    "favoritableId" text NOT NULL,
    "notes" text,
    "createdAt" timestamp DEFAULT now(),
    UNIQUE("userId", "favoritableType", "favoritableId")
);

CREATE INDEX IF NOT EXISTS "favorite_userId_idx" ON "favorite"("userId");

-- ============================================================================
-- ADMIN & AUDIT
-- ============================================================================

CREATE TABLE IF NOT EXISTS "audit_log" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "actorId" text NOT NULL,
    "action" text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    "details" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp DEFAULT now(),
    CONSTRAINT "audit_log_actorId_fk" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "audit_log_actorId_idx" ON "audit_log"("actorId");
CREATE INDEX IF NOT EXISTS "audit_log_entityType_idx" ON "audit_log"("entityType");
CREATE INDEX IF NOT EXISTS "audit_log_action_idx" ON "audit_log"("action");

-- ============================================================================
-- Success! Complete 5-year schema created.
-- ============================================================================
-- Next steps:
-- 1. Create Supabase storage buckets (see SUPABASE_STORAGE_SETUP.md)
-- 2. Set up Row Level Security (RLS) policies
-- 3. Run seed script to populate with mock data
-- ============================================================================
