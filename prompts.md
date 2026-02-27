You are a senior full-stack engineer working inside an existing Indie Kit (Next.js 16) B2B SaaS codebase.

REPO FACTS (DO NOT IGNORE)
- package manager: pnpm
- framework: Next.js (v16) + React 19
- auth: next-auth v5 beta + @auth/drizzle-adapter
- database: drizzle-orm + drizzle-kit (schema/migrations already configured)
- background jobs: Inngest (inngest-cli dev runs with pnpm dev)
- emails: React Email (dev server runs on port 3001)
- payments: stripe is installed and MUST be used; do NOT use DodoPayments
- storage/email SDKs: AWS S3 + SES SDKs installed

PRIMARY GOAL
Implement a two-portal MVP inside this existing architecture:
1) Rebound (Consultant Portal)
2) Relay (Client/Institution Portal)
3) Admin moderation

ABSOLUTE RULES
1) Do NOT introduce a separate backend, microservices, or a different stack.
2) Follow the repository’s existing folder structure, patterns, utilities, and style.
3) Reuse existing auth/session helpers and data access patterns.
4) All new DB changes must be made via the repo’s Drizzle schema + migrations.
5) Store secrets only in .env.* (and add placeholders to .env.example if present).
6) Keep everything shippable: compile cleanly, lint cleanly, and align with existing UI patterns.

PHASE 0 — DISCOVERY (MANDATORY FIRST STEP)
Before creating any files:
- Inspect and summarize the project structure:
  - src/app routing structure
  - src/db schema location and db client
  - next-auth config location
  - existing org/team multi-tenancy model (if present)
  - existing Stripe integration routes or helpers (if present)
  - existing S3 utilities (presign helpers, upload patterns)
  - existing email sending helper and React Email templates
  - existing RBAC / protected route patterns
- Identify EXACT conventions for:
  - route handlers (app router route.ts)
  - server actions (if used)
  - validation (zod)
  - error handling + toast patterns
- Output a brief “File Plan” listing what you will create/modify.

PRODUCT REQUIREMENTS (MVP)
A) Rebound (Consultant Portal)
- Consultant creates/edits profile
- Upload resume + supporting docs
- Submit profile for review
- See status: DRAFT → SUBMITTED → APPROVED → ACTIVE → REJECTED
- Read-only view of engagements + invoices

B) Relay (Client/Institution Portal)
- Browse/search consultants (filters: expertise tags, location, availability)
- View consultant profile (only ACTIVE are public)
- Initiate engagement (simple scope summary + dates)
- Generate invoice and pay via Stripe Checkout

C) Admin (Moderation)
- List SUBMITTED consultants
- Approve/reject profiles with reason
- Basic audit trail view

DATA MODEL (IMPLEMENT USING EXISTING DRIZZLE PATTERNS)
Add tables (or extend existing if similar tables exist):

1) consultant_profiles
- id uuid pk
- user_id uuid fk → users.id (unique)
- status enum (DRAFT/SUBMITTED/APPROVED/ACTIVE/REJECTED)
- headline text, bio text
- location text, timezone text
- availability_now boolean default false
- availability_note text nullable
- created_at, updated_at

2) consultant_expertise
- id uuid pk
- consultant_profile_id uuid fk
- Never break existing kit features