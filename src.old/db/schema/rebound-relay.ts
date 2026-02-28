import {
    pgTable,
    text,
    timestamp,
    integer,
    boolean,
    jsonb,
    numeric,
} from "drizzle-orm/pg-core";
import { users } from "./user";
import { organizations } from "./organization";

// Re-export organizations for convenience
export { organizations };

// ============================================================================
// CONSULTANT PROFILE
// ============================================================================

export const consultants = pgTable("consultant", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    // Basic Info
    headline: text("headline"),
    bio: text("bio"),
    location: text("location"),
    profileImage: text("profileImage"),
    profileSlug: text("profileSlug").unique(),
    // Status
    status: text("status").notNull().default("DRAFT"), // DRAFT, SUBMITTED, ACTIVE, REJECTED, SUSPENDED
    availability: text("availability").notNull().default("available"), // available, busy, unavailable
    // Expertise
    expertiseTags: jsonb("expertiseTags").$type<string[]>(),
    yearsOfExperience: integer("yearsOfExperience").default(0),
    timezone: text("timezone"),
    travelOpen: boolean("travelOpen").default(false),
    languages: jsonb("languages").$type<string[]>(),
    // Pricing
    hourlyRate: integer("hourlyRate"), // In cents
    projectRateMin: integer("projectRateMin"),
    projectRateMax: integer("projectRateMax"),
    // Links
    website: text("website"),
    linkedin: text("linkedin"),
    cv: text("cv"),
    // Education & Certifications
    education: jsonb("education"),
    certifications: jsonb("certifications"),
    // Stripe Connect
    stripeAccountId: text("stripeAccountId"),
    stripeOnboardingComplete: boolean("stripeOnboardingComplete").default(false),
    onboardingLinkUrl: text("onboardingLinkUrl"),
    payoutsEnabled: boolean("payoutsEnabled").default(false),
    // Metrics
    profileViews: integer("profileViews").default(0),
    inquiryCount: integer("inquiryCount").default(0),
    engagementCount: integer("engagementCount").default(0),
    avgRating: numeric("avgRating"),
    // Timestamps
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
    publishedAt: timestamp("publishedAt", { mode: "date" }),
});

// ============================================================================
// DOCUMENTS & PORTFOLIO
// ============================================================================

export const documents = pgTable("document", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    consultantId: text("consultantId")
        .notNull()
        .references(() => consultants.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // RESUME, CV, PROPOSAL, CERTIFICATE, OTHER
    title: text("title"),
    description: text("description"),
    storagePath: text("storagePath").notNull(),
    fileName: text("fileName").notNull(),
    fileSize: integer("fileSize"),
    mimeType: text("mimeType"),
    isPublic: boolean("isPublic").default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const caseStudies = pgTable("case_study", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    consultantId: text("consultantId")
        .notNull()
        .references(() => consultants.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    clientType: text("clientType").notNull(),
    industry: text("industry"),
    challenge: text("challenge").notNull(),
    solution: text("solution").notNull(),
    results: text("results").notNull(),
    duration: text("duration"),
    teamSize: text("teamSize"),
    budget: text("budget"),
    tags: jsonb("tags").$type<string[]>(),
    images: jsonb("images").$type<string[]>(),
    status: text("status").notNull().default("DRAFT"), // DRAFT, PUBLISHED, ARCHIVED
    featured: boolean("featured").default(false),
    orderIndex: integer("orderIndex").default(0),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

// ============================================================================
// ENGAGEMENTS & PROJECTS
// ============================================================================

export const engagements = pgTable("engagement", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    clientId: text("clientId")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    consultantId: text("consultantId")
        .notNull()
        .references(() => consultants.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().default("INITIATED"), // INITIATED, ACTIVE, PAUSED, COMPLETED, CANCELED
    type: text("type").notNull().default("CONSULTING"), // CONSULTING, TRAINING, COACHING, ADVISORY
    startDate: timestamp("startDate", { mode: "date" }),
    endDate: timestamp("endDate", { mode: "date" }),
    estimatedHours: integer("estimatedHours"),
    actualHours: integer("actualHours"),
    budget: integer("budget"), // In cents
    actualCost: integer("actualCost"),
    deliverables: jsonb("deliverables").$type<string[]>(),
    internalNotes: text("internalNotes"),
    clientNotes: text("clientNotes"),
    consultantNotes: text("consultantNotes"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

export const milestones = pgTable("milestone", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    engagementId: text("engagementId")
        .notNull()
        .references(() => engagements.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    dueDate: timestamp("dueDate", { mode: "date" }),
    completedAt: timestamp("completedAt", { mode: "date" }),
    status: text("status").notNull().default("PENDING"), // PENDING, IN_PROGRESS, COMPLETED, CANCELED
    orderIndex: integer("orderIndex").default(0),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

export const engagementDocuments = pgTable("engagement_document", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    engagementId: text("engagementId")
        .notNull()
        .references(() => engagements.id, { onDelete: "cascade" }),
    uploadedBy: text("uploadedBy").notNull(), // CLIENT or CONSULTANT
    uploadedById: text("uploadedById").notNull(),
    fileName: text("fileName").notNull(),
    storagePath: text("storagePath").notNull(),
    fileSize: integer("fileSize"),
    mimeType: text("mimeType"),
    description: text("description"),
    category: text("category"), // CONTRACT, DELIVERABLE, REPORT, OTHER
    isConfidential: boolean("isConfidential").default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

// ============================================================================
// INVOICES & PAYMENTS
// ============================================================================

export const invoices = pgTable("invoice", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    engagementId: text("engagementId")
        .notNull()
        .references(() => engagements.id, { onDelete: "cascade" }),
    invoiceNumber: text("invoiceNumber").unique(),
    amount: integer("amount").notNull(), // In cents
    commissionAmount: integer("commissionAmount"), // Platform fee in cents
    description: text("description"),
    dueDate: timestamp("dueDate", { mode: "date" }),
    paidAt: timestamp("paidAt", { mode: "date" }),
    status: text("status").notNull().default("PENDING"), // PENDING, PROCESSING, PAID, FAILED, REFUNDED, PARTIAL
    stripePaymentIntentId: text("stripePaymentIntentId"),
    stripeInvoiceId: text("stripeInvoiceId"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

// ============================================================================
// TESTIMONIALS & REVIEWS (Two-way)
// ============================================================================

export const testimonials = pgTable("testimonial", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    consultantId: text("consultantId")
        .notNull()
        .references(() => consultants.id, { onDelete: "cascade" }),
    authorId: text("authorId").notNull(),
    authorName: text("authorName").notNull(),
    authorTitle: text("authorTitle"),
    authorInstitution: text("authorInstitution"),
    authorImage: text("authorImage"),
    content: text("content").notNull(),
    rating: integer("rating").notNull(), // 1-5 stars
    engagementId: text("engagementId").references(() => engagements.id, { onDelete: "set null" }),
    status: text("status").notNull().default("PENDING"), // PENDING, APPROVED, REJECTED
    response: text("response"), // Consultant's response
    respondedAt: timestamp("respondedAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

// Organization reviews (consultants review institutions)
export const organizationReviews = pgTable("organization_review", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organizationId")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    consultantId: text("consultantId")
        .notNull()
        .references(() => consultants.id, { onDelete: "cascade" }),
    consultantName: text("consultantName"),
    consultantImage: text("consultantImage"),
    engagementId: text("engagementId").references(() => engagements.id, { onDelete: "set null" }),
    content: text("content").notNull(),
    rating: integer("rating").notNull(), // 1-5 stars
    wouldRecommend: boolean("wouldRecommend").default(true),
    status: text("status").notNull().default("PENDING"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

// ============================================================================
// INQUIRIES & PROPOSALS
// ============================================================================

export const inquiries = pgTable("inquiry", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    consultantId: text("consultantId")
        .notNull()
        .references(() => consultants.id, { onDelete: "cascade" }),
    organizationId: text("organizationId")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    senderName: text("senderName").notNull(),
    senderEmail: text("senderEmail").notNull(),
    senderTitle: text("senderTitle"),
    senderPhone: text("senderPhone"),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    budget: text("budget"),
    timeline: text("timeline"),
    status: text("status").notNull().default("PENDING"), // PENDING, RESPONDED, CONVERTED_TO_ENGAGEMENT, DECLINED
    convertedToEngagementId: text("convertedToEngagementId").references(() => engagements.id),
    adminNotes: text("adminNotes"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

export const proposals = pgTable("proposal", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    engagementId: text("engagementId").references(() => engagements.id, { onDelete: "set null" }),
    inquiryId: text("inquiryId").references(() => inquiries.id, { onDelete: "set null" }),
    consultantId: text("consultantId")
        .notNull()
        .references(() => consultants.id, { onDelete: "cascade" }),
    organizationId: text("organizationId")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    summary: text("summary"),
    scope: text("scope"),
    deliverables: jsonb("deliverables").$type<string[]>(),
    timeline: text("timeline"),
    amount: integer("amount"), // Proposed amount in cents
    status: text("status").notNull().default("DRAFT"), // DRAFT, SENT, UNDER_REVIEW, ACCEPTED, REJECTED, EXPIRED
    validUntil: timestamp("validUntil", { mode: "date" }),
    documentPath: text("documentPath"),
    adminNotes: text("adminNotes"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

// ============================================================================
// MESSAGING & NOTIFICATIONS
// ============================================================================

export const conversations = pgTable("conversation", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    consultantId: text("consultantId")
        .notNull()
        .references(() => consultants.id, { onDelete: "cascade" }),
    organizationId: text("organizationId")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    engagementId: text("engagementId").references(() => engagements.id, { onDelete: "set null" }),
    subject: text("subject"),
    lastMessageAt: timestamp("lastMessageAt", { mode: "date" }),
    lastMessagePreview: text("lastMessagePreview"),
    lastMessageById: text("lastMessageById"),
    archivedBy: jsonb("archivedBy").$type<string[]>(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

export const messages = pgTable("message", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversationId")
        .notNull()
        .references(() => conversations.id, { onDelete: "cascade" }),
    engagementId: text("engagementId").references(() => engagements.id, { onDelete: "cascade" }),
    inquiryId: text("inquiryId").references(() => inquiries.id, { onDelete: "cascade" }),
    senderId: text("senderId").notNull(),
    senderType: text("senderType").notNull(), // CONSULTANT or ORGANIZATION
    content: text("content").notNull(),
    attachments: jsonb("attachments").$type<string[]>(),
    readAt: timestamp("readAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const notifications = pgTable("notification", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // INQUIRY_RECEIVED, MESSAGE_RECEIVED, ENGAGEMENT_UPDATE, INVOICE_PAID, etc.
    title: text("title").notNull(),
    body: text("body"),
    link: text("link"),
    metadata: jsonb("metadata"),
    readAt: timestamp("readAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

// ============================================================================
// CALENDAR & SCHEDULING
// ============================================================================

export const calendarEvents = pgTable("calendar_event", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    engagementId: text("engagementId").references(() => engagements.id, { onDelete: "cascade" }),
    consultantId: text("consultantId").references(() => consultants.id, { onDelete: "cascade" }),
    organizationId: text("organizationId").references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    startTime: timestamp("startTime", { mode: "date" }).notNull(),
    endTime: timestamp("endTime", { mode: "date" }).notNull(),
    location: text("location"),
    meetingLink: text("meetingLink"),
    type: text("type").notNull().default("MEETING"), // MEETING, CALL, SITE_VISIT, WORKSHOP
    status: text("status").notNull().default("SCHEDULED"), // SCHEDULED, CONFIRMED, COMPLETED, CANCELED
    reminderSent: boolean("reminderSent").default(false),
    notes: text("notes"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

// ============================================================================
// SAVED SEARCHES & FAVORITES
// ============================================================================

export const savedSearches = pgTable("saved_search", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    filters: jsonb("filters").notNull(), // Search filter parameters
    type: text("type").notNull(), // CONSULTANT_SEARCH or OPPORTUNITY_SEARCH
    notifyOnNew: boolean("notifyOnNew").default(false),
    lastRunAt: timestamp("lastRunAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

export const favorites = pgTable("favorite", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    favoritableType: text("favoritableType").notNull(), // CONSULTANT or ORGANIZATION
    favoritableId: text("favoritableId").notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

// ============================================================================
// ADMIN & AUDIT
// ============================================================================

export const auditLogs = pgTable("audit_log", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    actorId: text("actorId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    entityType: text("entityType").notNull(),
    entityId: text("entityId").notNull(),
    details: jsonb("details"),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});
