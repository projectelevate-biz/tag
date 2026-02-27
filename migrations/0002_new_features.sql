-- ============================================================================
-- Rebound & Relay - New Features Migration
-- ============================================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/sql
-- ============================================================================

-- Add profile image URL to consultant
ALTER TABLE "consultant" ADD COLUMN IF NOT EXISTS "profileImage" text;

-- Add years of experience to consultant
ALTER TABLE "consultant" ADD COLUMN IF NOT EXISTS "yearsOfExperience" integer DEFAULT 0;

-- Add timezone to consultant
ALTER TABLE "consultant" ADD COLUMN IF NOT EXISTS "timezone" text;

-- Add travel openness to consultant
ALTER TABLE "consultant" ADD COLUMN IF NOT EXISTS "travelOpen" boolean DEFAULT false;

-- Add languages to consultant
ALTER TABLE "consultant" ADD COLUMN IF NOT EXISTS "languages" jsonb;

-- Add profile slug (unique) to consultant
ALTER TABLE "consultant" ADD COLUMN IF NOT EXISTS "profileSlug" text;

-- Create unique index for profileSlug
CREATE UNIQUE INDEX IF NOT EXISTS "consultant_profileSlug_idx" ON "consultant"("profileSlug") WHERE "profileSlug" IS NOT NULL;

-- Set default availability and update existing NULL values
ALTER TABLE "consultant" ALTER COLUMN "availability" SET DEFAULT 'available';
UPDATE "consultant" SET "availability" = 'available' WHERE "availability" IS NULL;

-- Add internal notes to engagements
ALTER TABLE "engagement" ADD COLUMN IF NOT EXISTS "internalNotes" text;

-- Add organization type
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "type" text;

-- Create case_studies table
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

-- Create testimonials table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "case_study_consultantId_idx" ON "case_study"("consultantId");
CREATE INDEX IF NOT EXISTS "testimonial_consultantId_idx" ON "testimonial"("consultantId");
CREATE INDEX IF NOT EXISTS "testimonial_engagementId_idx" ON "testimonial"("engagementId");

-- ============================================================================
-- Success! New features are ready.
-- ============================================================================
