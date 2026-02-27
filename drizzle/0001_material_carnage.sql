CREATE TABLE "case_study" (
	"id" text PRIMARY KEY NOT NULL,
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
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "testimonial" (
	"id" text PRIMARY KEY NOT NULL,
	"consultantId" text NOT NULL,
	"authorName" text NOT NULL,
	"authorTitle" text,
	"authorInstitution" text,
	"content" text NOT NULL,
	"rating" integer NOT NULL,
	"engagementId" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "consultant" ADD COLUMN "hourlyRate" integer;--> statement-breakpoint
ALTER TABLE "consultant" ADD COLUMN "availability" text DEFAULT 'available' NOT NULL;--> statement-breakpoint
ALTER TABLE "consultant" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "consultant" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "consultant" ADD COLUMN "yearsOfExperience" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "consultant" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "consultant" ADD COLUMN "travelOpen" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "consultant" ADD COLUMN "languages" jsonb;--> statement-breakpoint
ALTER TABLE "consultant" ADD COLUMN "profileSlug" text;--> statement-breakpoint
ALTER TABLE "consultant" ADD COLUMN "stripeAccountId" text;--> statement-breakpoint
ALTER TABLE "consultant" ADD COLUMN "stripeOnboardingComplete" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "consultant" ADD COLUMN "onboardingLinkUrl" text;--> statement-breakpoint
ALTER TABLE "consultant" ADD COLUMN "payoutsEnabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "engagement" ADD COLUMN "startDate" timestamp;--> statement-breakpoint
ALTER TABLE "engagement" ADD COLUMN "endDate" timestamp;--> statement-breakpoint
ALTER TABLE "engagement" ADD COLUMN "budget" integer;--> statement-breakpoint
ALTER TABLE "engagement" ADD COLUMN "deliverables" jsonb;--> statement-breakpoint
ALTER TABLE "engagement" ADD COLUMN "internalNotes" text;--> statement-breakpoint
ALTER TABLE "case_study" ADD CONSTRAINT "case_study_consultantId_consultant_id_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."consultant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonial" ADD CONSTRAINT "testimonial_consultantId_consultant_id_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."consultant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonial" ADD CONSTRAINT "testimonial_engagementId_engagement_id_fk" FOREIGN KEY ("engagementId") REFERENCES "public"."engagement"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultant" ADD CONSTRAINT "consultant_profileSlug_unique" UNIQUE("profileSlug");