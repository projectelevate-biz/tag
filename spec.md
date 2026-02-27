# Rebound Relay - Technical Specification

> **Version:** 1.0.0
> **Last Updated:** February 2026
> **Status:** Production Ready

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Core Services & Integrations](#4-core-services--integrations)
5. [Database Schema](#5-database-schema)
6. [API Architecture](#6-api-architecture)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Payment Processing](#8-payment-processing)
9. [File Storage](#9-file-storage)
10. [Background Jobs](#10-background-jobs)
11. [Monitoring & Observability](#11-monitoring--observability)
12. [Email System](#12-email-system)
13. [Security](#13-security)
14. [Environment Configuration](#14-environment-configuration)
15. [Future Specifications](#15-future-specifications)
16. [Deployment Architecture](#16-deployment-architecture)

---

## 1. Executive Summary

**Rebound Relay** is a B2B SaaS platform designed as a consulting marketplace connecting higher education consultants with institutions. The platform supports dual-user modes:

- **Consultants (Rebound)** - Experts offering consulting services
- **Organizations (Relay)** - Institutions seeking consulting services

### Key Capabilities

- Multi-tenant organization management
- Consultant profile and engagement system
- Credit-based transaction system
- Subscription and one-time payment processing
- Document management and storage
- Real-time messaging and notifications
- Admin moderation and approval workflows

---

## 2. System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Next.js 16 App Router (React 19)                                           │
│  ├── Public Pages (Marketing, Blog, Docs)                                   │
│  ├── Auth Pages (Sign In/Up, Password Reset)                                │
│  ├── App Dashboard (Organization Management)                                │
│  ├── Rebound Portal (Consultant Interface)                                  │
│  ├── Relay Portal (Client Interface)                                        │
│  └── Admin Panel (Super Admin, Moderation)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Next.js API Routes (Route Handlers)                                        │
│  ├── /api/auth/* - Authentication endpoints                                 │
│  ├── /api/app/* - Application endpoints                                     │
│  ├── /api/rebound/* - Consultant endpoints                                  │
│  ├── /api/relay/* - Client endpoints                                        │
│  ├── /api/webhooks/* - Payment webhooks                                     │
│  ├── /api/super-admin/* - Admin endpoints                                   │
│  └── /api/cron/* - Scheduled tasks                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Server Actions & Business Logic                                            │
│  ├── src/lib/rebound/actions.ts - Consultant operations                     │
│  ├── src/lib/relay/contact.ts - Client operations                           │
│  ├── src/lib/admin/actions.ts - Admin operations                            │
│  └── src/lib/organizations/* - Organization management                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                   │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│   Supabase           │      Stripe          │         AWS S3               │
│   (Database/Auth)    │   (Payments)         │      (File Storage)          │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│   Inngest            │      Sentry          │      AWS SES/Resend          │
│   (Background Jobs)  │   (Monitoring)       │        (Email)               │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

### Application Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Visitor    │────▶│   Auth       │────▶│  Dashboard   │────▶│  Protected   │
│   (Public)   │     │  (Supabase)  │     │   (App)      │     │   Routes     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Organization │
                     │  Selection   │
                     └──────────────┘
                      │            │
              ┌───────┘            └───────┐
              ▼                            ▼
     ┌──────────────┐             ┌──────────────┐
     │   Rebound    │             │    Relay     │
     │  (Consultant)│             │   (Client)   │
     └──────────────┘             └──────────────┘
```

---

## 3. Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | Full-stack React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Node.js | 18.x+ | Runtime environment |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 4.1.18 | Utility-first CSS |
| Radix UI | Latest | Accessible UI primitives |
| Shadcn UI | Latest | Component library |
| Framer Motion | 11.x | Animations |
| React Hook Form | 7.x | Form management |
| Zod | 3.x | Schema validation |
| Recharts | 2.x | Data visualization |
| Lucide Icons | Latest | Icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Drizzle ORM | 0.38.x | Database ORM |
| NextAuth.js | 5.0.0-beta.30 | Authentication |
| Server Actions | Native | Server-side mutations |

### Database

| Technology | Purpose |
|------------|---------|
| Supabase PostgreSQL | Primary database |
| Neon Serverless | Serverless PostgreSQL client |

---

## 4. Core Services & Integrations

### 4.1 Supabase

**Purpose:** Primary database, authentication, and file storage

**Configuration:**
```typescript
// src/lib/supabase/server.ts
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll, setAll } }
  )
}
```

**Features Used:**
- PostgreSQL Database
- Row Level Security (RLS)
- Supabase Auth (Google OAuth)
- Supabase Storage (profile pictures, documents)

**Storage Buckets:**
| Bucket | Access | Purpose |
|--------|--------|---------|
| `rebound-profiles` | Public | Consultant profile pictures |
| `rebound-documents` | Private | Consultant documents (CV, certificates) |

---

### 4.2 Stripe

**Purpose:** Primary payment processor for subscriptions and one-time payments

**Integration Points:**
```typescript
// src/lib/stripe/client.ts
import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

**Features Used:**
- Customer Management
- Subscription Billing
- Payment Intents
- Webhooks
- Invoice Generation
- Connect (for consultant payouts)

**Webhook Events Handled:**
| Event | Handler |
|-------|---------|
| `checkout.session.completed` | Order fulfillment |
| `invoice.paid` | Subscription renewal |
| `invoice.payment_failed` | Payment failure handling |
| `customer.subscription.updated` | Plan updates |
| `customer.subscription.deleted` | Subscription cancellation |

---

### 4.3 PayPal

**Purpose:** Alternative payment method for organization subscriptions

**Integration:**
```typescript
// src/app/api/webhooks/paypal/route.ts
// Handles PayPal webhook events
```

---

### 4.4 Dodo Payments

**Purpose:** Alternative payment gateway (regional support)

**Configuration:**
```typescript
// src/lib/dodopayments/client.ts
const client = new DodoPaymentsClient({
  apiUrl: process.env.DODO_PAYMENTS_API_URL,
  apiKey: process.env.DODO_PAYMENTS_API_KEY,
})
```

---

### 4.5 AWS S3

**Purpose:** Scalable file storage for documents and media

**Configuration:**
```typescript
// src/lib/s3/client.ts
import { S3Client } from '@aws-sdk/client-s3'

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})
```

**Operations:**
- Presigned POST URLs for client-side uploads
- Presigned GET URLs for secure downloads
- File deletion on document removal

**File Constraints:**
| Property | Value |
|----------|-------|
| Max File Size | 10MB |
| Allowed Types | PDF, DOC, DOCX, Images |

---

### 4.6 Sentry

**Purpose:** Error tracking, performance monitoring, and alerting

**Configuration:**
```typescript
// src/lib/sentry/init.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

**Features:**
- Automatic error capture
- Performance tracing
- Session replay
- Source maps for debugging
- Inngest middleware integration

---

### 4.7 Inngest

**Purpose:** Reliable background job processing and scheduled tasks

**Configuration:**
```typescript
// src/lib/inngest/client.ts
import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'rebound-relay',
  middleware: [sentryMiddleware()],
})
```

**Functions:**
| Function | Schedule | Purpose |
|----------|----------|---------|
| `expire-credits` | Daily | Expire credits past validity date |
| Future: `engagement-reminders` | Daily | Send engagement deadline reminders |
| Future: `invoice-reminders` | Configurable | Payment reminder notifications |

---

### 4.8 Crisp Chat

**Purpose:** Customer support and live chat

**Configuration:**
```typescript
// src/components/chat/crisp.tsx
<Script id="crisp-widget">
  window.$crisp.push(["set", "token:edition", ["essential"]])
  window.$crisp.push(["set", "user:email", [userEmail]])
</Script>
```

---

## 5. Database Schema

### Entity Relationship Diagram

```
┌────────────────┐       ┌────────────────┐       ┌────────────────┐
│     users      │       │ organizations  │       │     plans      │
├────────────────┤       ├────────────────┤       ├────────────────┤
│ id (PK)        │       │ id (PK)        │       │ id (PK)        │
│ name           │       │ name           │       │ name           │
│ email          │       │ slug           │       │ price          │
│ image          │       │ type           │       │ credits        │
│ role           │       │ logo           │       │ features       │
└───────┬────────┘       │ planId (FK)    │───────│ interval       │
        │                └───────┬────────┘       └────────────────┘
        │                        │
        │                ┌───────┴────────┐
        │                │                │
        ▼                ▼                ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ organization   │ │    credits     │ │  invitations   │
│   _members     │ │                │ │                │
├────────────────┤ ├────────────────┤ ├────────────────┤
│ organizationId │ │ orgId (FK)     │ │ orgId (FK)     │
│ userId (FK)    │ │ amount         │ │ email          │
│ role           │ │ type           │ │ role           │
└────────────────┘ │ expiresAt      │ │ token          │
                   └────────────────┘ └────────────────┘
```

### Rebound/Relay Tables

```
┌────────────────┐       ┌────────────────┐       ┌────────────────┐
│   consultant   │       │  engagements   │       │   invoices     │
├────────────────┤       ├────────────────┤       ├────────────────┤
│ id (PK)        │       │ id (PK)        │       │ id (PK)        │
│ userId (FK)    │       │ consultantId   │       │ engagementId   │
│ headline       │       │ clientId (FK)  │       │ amount         │
│ bio            │       │ title          │       │ status         │
│ expertiseTags  │       │ status         │       │ stripeId       │
│ hourlyRate     │       │ budget         │       │ commission     │
│ status         │       │ startDate      │       └────────────────┘
└───────┬────────┘       │ endDate        │
        │                └───────┬────────┘
        │                        │
        ▼                        ▼
┌────────────────┐       ┌────────────────┐
│  case_studies  │       │  testimonials  │
├────────────────┤       ├────────────────┤
│ id (PK)        │       │ id (PK)        │
│ consultantId   │       │ consultantId   │
│ title          │       │ authorId       │
│ challenge      │       │ authorName     │
│ solution       │       │ content        │
│ results        │       │ rating         │
│ status         │       │ status         │
└────────────────┘       └────────────────┘
```

### Complete Schema Reference

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts | id, email, name, role |
| `organizations` | Client organizations | id, name, slug, type, planId |
| `organization_members` | Organization membership | organizationId, userId, role |
| `plans` | Subscription plans | id, name, price, credits, features |
| `credits` | Credit balances | orgId, amount, type, expiresAt |
| `credit_transactions` | Credit history | orgId, amount, type, reference |
| `invitations` | Org invitations | orgId, email, role, token |
| `consultant` | Consultant profiles | id, userId, headline, bio, status |
| `document` | Consultant documents | id, consultantId, type, storagePath |
| `case_study` | Consultant case studies | id, consultantId, title, status |
| `testimonial` | Client testimonials | id, consultantId, authorId, rating |
| `engagement` | Consulting engagements | id, consultantId, clientId, status |
| `milestone` | Engagement milestones | id, engagementId, title, status |
| `invoice` | Payment invoices | id, engagementId, amount, status |
| `inquiry` | Contact inquiries | id, consultantId, organizationId |
| `proposal` | Project proposals | id, inquiryId, consultantId, status |
| `conversation` | Message threads | id, consultantId, organizationId |
| `message` | Individual messages | id, conversationId, senderId, content |
| `notification` | User notifications | id, userId, type, readAt |
| `calendar_event` | Scheduled events | id, engagementId, startTime |
| `saved_search` | Saved search filters | id, userId, filters |
| `favorite` | Saved favorites | id, userId, favoritableId |
| `audit_log` | Activity audit trail | id, actorId, action, entityType |
| `organization_review` | Org reviews by consultants | id, organizationId, consultantId |
| `waitlist_entry` | Waitlist signups | id, email, status |

---

## 6. API Architecture

### Route Structure

```
src/app/api/
├── auth/
│   ├── [...nextauth]/route.ts     # NextAuth handlers
│   ├── complete-signup/route.ts   # Email verification
│   ├── reset-password-request/    # Password reset
│   ├── reset-password-confirm/    # Password reset confirm
│   └── signup-request/route.ts    # New user signup
│
├── app/
│   └── me/
│       ├── route.ts               # Current user info
│       └── upload-avatar/route.ts # Avatar upload
│
├── app/organizations/
│   ├── route.ts                   # List/create orgs
│   ├── accept-invite/route.ts     # Accept invitation
│   ├── current/route.ts           # Current org
│   ├── current/invites/           # Org invitations
│   ├── current/members/           # Member management
│   ├── current/paypal/            # PayPal integration
│   ├── current/redeem-ltd/        # Lifetime deal redemption
│   └── current/update/            # Org updates
│
├── rebound/                       # Consultant API
│   ├── documents/                 # Document management
│   ├── documents/[id]/            # Single document
│   ├── engagements/[id]/          # Engagement details
│   ├── profile-picture/           # Profile image
│   ├── s3/presign/                # S3 presigned URLs
│   └── upload/                    # File uploads
│
├── relay/                         # Client API
│   ├── invoices/[id]/             # Invoice details
│   └── consultants/               # Consultant search
│
├── webhooks/
│   ├── stripe/route.ts            # Stripe webhooks
│   ├── stripe-rebound/route.ts    # Consultant payouts
│   ├── paypal/route.ts            # PayPal webhooks
│   └── dodo/route.ts              # Dodo webhooks
│
├── super-admin/                   # Admin API
│   ├── coupons/                   # Coupon management
│   ├── messages/                  # Contact messages
│   ├── organizations/             # Org management
│   ├── plans/                     # Plan management
│   ├── stats/                     # Dashboard stats
│   ├── users/                     # User management
│   └── waitlist-entries/          # Waitlist management
│
├── inngest/route.ts               # Inngest endpoint
├── contact/route.ts               # Contact form
├── waitlist/route.ts              # Waitlist signup
└── docs/search/route.ts           # Docs search
```

### API Response Format

```typescript
// Success Response
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}

// Error Response
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## 7. Authentication & Authorization

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Google    │────▶│  Supabase   │────▶│  Session    │
│    OAuth    │     │    Auth     │     │   Cookie    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  NextAuth   │
                    │  Session    │
                    └─────────────┘
```

### User Roles

| Role | Access Level | Permissions |
|------|--------------|-------------|
| `USER` | Basic | View public content, create organization |
| `MEMBER` | Organization | Access org resources, limited billing |
| `ADMIN` | Organization | Full org management, billing access |
| `SUPER_ADMIN` | Platform | All organizations, user management, analytics |

### Authorization Middleware

```typescript
// Role-based access control
export async function requireRole(role: 'ADMIN' | 'SUPER_ADMIN') {
  const user = await getUser()
  if (!user || !hasRole(user, role)) {
    throw new Error('Unauthorized')
  }
  return user
}
```

---

## 8. Payment Processing

### Payment Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Checkout  │────▶│   Stripe    │────▶│   Webhook   │
│   Session   │     │   Payment   │     │   Handler   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
              ┌─────────────┐
              │   Credits   │
              │   Allocated │
              └─────────────┘
```

### Subscription Plans

| Plan | Price | Credits | Features |
|------|-------|---------|----------|
| Starter | $29/mo | 100 | Basic access |
| Professional | $99/mo | 500 | Priority support |
| Enterprise | Custom | Unlimited | Dedicated support |

### Credit System

```typescript
// Credit transaction types
type CreditTransactionType =
  | 'PURCHASE'      // Bought credits
  | 'ALLOCATION'    // Monthly allocation
  | 'USAGE'         // Service usage
  | 'EXPIRATION'    // Expired credits
  | 'REFUND'        // Refunded credits
  | 'BONUS'         // Promotional credits
```

---

## 9. File Storage

### Storage Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    File Upload Flow                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Client                Server                  S3        │
│    │                     │                      │        │
│    │  1. Request URL    │                      │        │
│    │ ──────────────────▶│                      │        │
│    │                     │  2. Generate        │        │
│    │                     │     Presigned URL   │        │
│    │                     │ ───────────────────▶│        │
│    │                     │                      │        │
│    │  3. Presigned URL   │                      │        │
│    │ ◀──────────────────│                      │        │
│    │                     │                      │        │
│    │  4. Upload File     │                      │        │
│    │ ──────────────────────────────────────────▶│        │
│    │                     │                      │        │
│    │  5. Confirm Upload  │                      │        │
│    │ ◀─────────────────────────────────────────│        │
│    │                     │                      │        │
│    │  6. Save Metadata   │                      │        │
│    │ ──────────────────▶│                      │        │
│    │                     │                      │        │
└─────────────────────────────────────────────────────────┘
```

### Supported File Types

| Category | Types | Max Size |
|----------|-------|----------|
| Documents | PDF, DOC, DOCX | 10MB |
| Images | JPEG, PNG, WebP, GIF | 5MB |
| Profile Pictures | JPEG, PNG, WebP | 5MB |

---

## 10. Background Jobs

### Inngest Functions

```typescript
// src/inngest/functions/expire-credits.ts
export const expireCredits = inngest.createFunction(
  { id: 'expire-credits' },
  { cron: '0 0 * * *' }, // Daily at midnight
  async ({ step }) => {
    // Find expired credits
    // Mark as expired
    // Send notifications
  }
)
```

### Job Queue

| Job | Trigger | Purpose |
|-----|---------|---------|
| `expire-credits` | Cron (Daily) | Expire past-due credits |
| `send-email` | Event | Send transactional emails |
| `process-webhook` | Event | Handle payment webhooks |
| `generate-invoice` | Event | Create PDF invoices |

---

## 11. Monitoring & Observability

### Sentry Configuration

```typescript
// Performance Monitoring
tracesSampleRate: 0.1,  // 10% of transactions

// Session Replay
replaysSessionSampleRate: 0.1,  // 10% of sessions
replaysOnErrorSampleRate: 1.0,  // 100% on error
```

### Logging Strategy

| Level | Use Case |
|-------|----------|
| `error` | Exceptions, failed operations |
| `warn` | Deprecated features, recoverable errors |
| `info` | Business events, user actions |
| `debug` | Development debugging |

---

## 12. Email System

### Email Templates (React Email)

```
src/emails/
├── layouts/
│   └── base-layout.tsx
├── components/
│   ├── header.tsx
│   ├── footer.tsx
│   └── button.tsx
└── templates/
    ├── welcome.tsx
    ├── password-reset.tsx
    ├── invitation.tsx
    └── invoice.tsx
```

### Email Providers

| Provider | Use Case | Priority |
|----------|----------|----------|
| AWS SES | Transactional | Primary |
| Resend | Marketing | Secondary |

---

## 13. Security

### Security Measures

| Measure | Implementation |
|---------|----------------|
| CSRF Protection | Built into Next.js |
| XSS Prevention | React auto-escaping |
| SQL Injection | Drizzle ORM parameterized queries |
| Rate Limiting | API route middleware |
| Input Validation | Zod schemas |
| Authentication | Supabase Auth + NextAuth |
| Authorization | Role-based access control |
| File Upload | Type validation, size limits |
| Secrets | Environment variables |

### Content Security Policy

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
]
```

---

## 14. Environment Configuration

### Required Environment Variables

```bash
# Core Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=your-super-secret-auth-key-min-32-chars

# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAxxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_BUCKET_NAME=rebound-documents

# Sentry (Optional)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=sntrys_xxx

# Crisp Chat (Optional)
NEXT_PUBLIC_CRISP_WEBSITE_ID=xxx

# Dodo Payments (Optional)
DODO_PAYMENTS_API_URL=https://live.dodopayments.com
DODO_PAYMENTS_API_KEY=xxx

# Cron Jobs
CRON_USERNAME=admin
CRON_PASSWORD=secure-password
```

---

## 15. Future Specifications

### 15.1 Phase 2: Enhanced Marketplace

#### Video Consultations
- **Integration:** Daily.co or Zoom API
- **Features:**
  - Scheduled video calls
  - Screen sharing
  - Recording (with consent)
  - Automatic transcription

```typescript
// Future: Video consultation schema
export const videoConsultations = pgTable('video_consultation', {
  id: text('id').primaryKey(),
  engagementId: text('engagementId').references(() => engagements.id),
  scheduledAt: timestamp('scheduledAt').notNull(),
  duration: integer('duration'), // minutes
  meetingUrl: text('meetingUrl'),
  recordingUrl: text('recordingUrl'),
  transcript: text('transcript'),
  status: text('status'), // SCHEDULED, COMPLETED, CANCELLED
})
```

#### Advanced Search & Matching
- **AI-Powered Matching:** Recommend consultants based on project requirements
- **Skill Taxonomy:** Standardized skill categorization
- **Availability Calendar:** Real-time consultant availability

### 15.2 Phase 3: Analytics & Reporting

#### Dashboard Analytics
```typescript
// Future: Analytics schema
export const analyticsEvents = pgTable('analytics_event', {
  id: text('id').primaryKey(),
  eventType: text('eventType').notNull(),
  userId: text('userId'),
  organizationId: text('organizationId'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('createdAt').defaultNow(),
})
```

#### Report Generation
- PDF report generation for engagements
- Custom date range reports
- Export to CSV/Excel
- Automated weekly/monthly reports

### 15.3 Phase 4: Mobile Applications

#### React Native Mobile Apps
- iOS and Android applications
- Push notifications
- Offline support
- Biometric authentication

### 15.4 Phase 5: AI Features

#### AI-Powered Features
| Feature | Description | Priority |
|---------|-------------|----------|
| Proposal Generator | AI-assisted proposal writing | High |
| Meeting Summarizer | Auto-generate meeting notes | Medium |
| Skill Matching | ML-based consultant matching | High |
| Sentiment Analysis | Analyze feedback and reviews | Low |
| Chatbot Support | AI-powered customer support | Medium |

```typescript
// Future: AI integration
import { OpenAI } from 'openai'

export async function generateProposal(inquiry: Inquiry) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: 'You are a proposal writing assistant...' },
      { role: 'user', content: `Generate a proposal for: ${inquiry.message}` },
    ],
  })
  return completion.choices[0].message.content
}
```

### 15.6 Phase 6: Enterprise Features

#### SSO Integration
- SAML 2.0 support
- Okta integration
- Azure AD integration
- Google Workspace SSO

#### Advanced Permissions
- Custom role creation
- Granular permissions
- Audit logging
- IP allowlisting

#### White Labeling
- Custom domain support
- Brand customization
- Custom email templates
- Private cloud deployment

### 15.7 Phase 7: Internationalization

#### Multi-language Support
- i18n framework integration (next-intl)
- RTL language support
- Currency localization
- Timezone handling

#### Regional Payment Methods
- SEPA (Europe)
- UPI (India)
- Alipay/WeChat Pay (China)
- Local bank transfers

### 15.8 Technical Debt & Improvements

| Area | Improvement | Priority |
|------|-------------|----------|
| Testing | Add comprehensive unit/integration tests | High |
| Performance | Implement caching (Redis) | Medium |
| Monitoring | Add APM (Application Performance Monitoring) | Medium |
| Documentation | API documentation (OpenAPI/Swagger) | Medium |
| Accessibility | WCAG 2.1 AA compliance | High |
| SEO | Advanced SEO optimizations | Medium |

---

## 16. Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL (Edge Network)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Next.js    │  │   Next.js    │  │   Next.js    │          │
│  │  Edge Func   │  │  Edge Func   │  │  Edge Func   │          │
│  │  (US East)   │  │  (EU West)   │  │  (Asia)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Supabase   │   │    Stripe    │   │    AWS S3    │
│  (PostgreSQL)│   │   (Payments) │   │  (Storage)   │
└──────────────┘   └──────────────┘   └──────────────┘
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml (Future)
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Scaling Considerations

| Component | Current | Scale Strategy |
|-----------|---------|----------------|
| Next.js | Vercel Edge | Auto-scaling |
| Database | Supabase | Connection pooling, read replicas |
| File Storage | S3 | CloudFront CDN |
| Background Jobs | Inngest | Horizontal scaling |
| Cache | N/A | Add Redis (Upstash) |

---

## Appendix A: Third-Party Service Limits

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Supabase | 500MB DB, 1GB storage | Unlimited |
| Stripe | 2.9% + 30¢ per transaction | Volume discounts |
| Sentry | 5K errors/month | Unlimited |
| Vercel | 100GB bandwidth | Unlimited |
| AWS S3 | 5GB (12 months) | Pay per use |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Rebound** | Consultant-facing portal and operations |
| **Relay** | Client/organization-facing portal |
| **Engagement** | A consulting project/contract |
| **Credits** | Platform currency for services |
| **Consultant** | Expert offering consulting services |
| **Organization** | Client entity seeking consulting |
| **Super Admin** | Platform administrator |

---

## Appendix C: Contact & Support

- **Technical Issues:** GitHub Issues
- **Security Concerns:** security@example.com
- **Feature Requests:** GitHub Discussions

---

*Document maintained by the Rebound Relay development team.*
