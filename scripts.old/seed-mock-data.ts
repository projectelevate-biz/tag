/**
 * Mock Data Seeding Script for Rebound & Relay
 *
 * This script creates comprehensive demo data for showcasing the platform.
 * Run with: npx tsx scripts/seed-mock-data.ts
 *
 * Prerequisites:
 * 1. Database connection is working (Supabase)
 * 2. Run migrations first: migrations/0002_new_features.sql
 */

import { db } from "../src/db";
import { consultants, engagements, invoices, caseStudies, testimonials } from "../src/db/schema/rebound-relay";
import { users, organizations } from "../src/db/schema";
import { eq } from "drizzle-orm";

// ============================================================================
// MOCK CONSULTANT DATA
// ============================================================================

const mockConsultants = [
  {
    // User 1: Senior Admissions Expert
    user: {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Dr. Sarah Mitchell",
      email: "sarah.mitchell@example.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      emailVerified: new Date(),
    },
    consultant: {
      id: "c1",
      userId: "550e8400-e29b-41d4-a716-446655440001",
      headline: "Former VP of Enrollment | 20+ Years in Higher Ed Admissions",
      bio: "I spent over two decades leading enrollment strategies at flagship public universities and selective liberal arts colleges. My expertise spans strategic planning, recruitment operations, and enrollment analytics. I've led teams through demographic shifts, changing enrollment landscapes, and the transition to test-optional admissions.",
      location: "Boston, MA",
      expertiseTags: ["Admissions Strategy", "Enrollment Management", "Strategic Planning", "Institutional Research"],
      hourlyRate: 25000, // $250/hr in cents
      availability: "available",
      website: "https://sarahmitchell-consulting.com",
      linkedin: "https://linkedin.com/in/sarahmitchell",
      yearsOfExperience: 22,
      timezone: "America/New_York",
      travelOpen: true,
      languages: ["Spanish", "French"],
      profileSlug: "sarah-mitchell",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4",
      status: "ACTIVE",
    },
    caseStudies: [
      {
        id: "cs1",
        consultantId: "c1",
        title: "Turning Around Declining Enrollment at Midwest University",
        clientType: "Public University",
        challenge: "Facing a 15% enrollment decline over 3 years, particularly among first-generation students. The institution's traditional recruitment methods were no longer effective.",
        solution: "Implemented a data-driven recruitment strategy focusing on community college partnerships, revised financial aid packaging, and a new digital-first marketing approach.",
        results: "Achieved 8% enrollment increase in year one, 12% in year two. First-generation student enrollment grew by 22%.",
        duration: "18 months",
        tags: ["Enrollment Growth", "First-Gen Students", "Data Strategy"],
        status: "PUBLISHED",
      },
    ],
    testimonials: [
      {
        id: "t1",
        consultantId: "c1",
        authorId: "author1",
        authorName: "Robert Chen",
        authorTitle: "Provost",
        authorInstitution: "Midwest University",
        content: "Sarah's strategic approach to our enrollment challenges was transformative. Her deep understanding of the landscape and practical solutions delivered measurable results.",
        rating: 5,
        engagementId: "e1",
        status: "APPROVED",
      },
    ],
  },
  {
    // User 2: DEI Specialist
    user: {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Marcus Williams",
      email: "marcus.williams@example.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      emailVerified: new Date(),
    },
    consultant: {
      id: "c2",
      userId: "550e8400-e29b-41d4-a716-446655440002",
      headline: "Chief Diversity Officer (Retired) | DEI Strategy & Implementation",
      bio: "As a former CDO at a major research university, I bring 15 years of experience developing and implementing comprehensive DEI initiatives. I specialize in faculty recruitment, inclusive curriculum development, and creating sustainable cultural change in higher education institutions.",
      location: "Atlanta, GA",
      expertiseTags: ["DEI Initiatives", "Faculty Development", "Student Affairs", "Strategic Planning"],
      hourlyRate: 22500, // $225/hr
      availability: "available",
      website: "https://williamsdei.com",
      linkedin: "https://linkedin.com/in/marcuswilliams",
      yearsOfExperience: 15,
      timezone: "America/New_York",
      travelOpen: true,
      languages: ["Spanish"],
      profileSlug: "marcus-williams",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=c0aede",
      status: "ACTIVE",
    },
    caseStudies: [],
    testimonials: [],
  },
  {
    // User 3: Financial Aid Expert
    user: {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Jennifer Park",
      email: "jennifer.park@example.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer",
      emailVerified: new Date(),
    },
    consultant: {
      id: "c3",
      userId: "550e8400-e29b-41d4-a716-446655440003",
      headline: "Former Director of Financial Aid | FAFSA & Regulatory Compliance Expert",
      bio: "I led financial aid offices at both private liberal arts colleges and large public universities for over 18 years. My expertise spans need analysis, regulatory compliance, packaging strategies, and leveraging financial aid for enrollment goals. I've navigated multiple FAFSA changes and NCAA compliance requirements.",
      location: "Denver, CO",
      expertiseTags: ["Financial Aid", "Enrollment Management", "Compliance", "Student Success"],
      hourlyRate: 20000, // $200/hr
      availability: "busy",
      website: "",
      linkedin: "https://linkedin.com/in/jenniferpark",
      yearsOfExperience: 18,
      timezone: "America/Denver",
      travelOpen: false,
      languages: [],
      profileSlug: "jennifer-park",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer&backgroundColor=ffdfbf",
      status: "ACTIVE",
    },
    caseStudies: [],
    testimonials: [],
  },
  {
    // User 4: Online Learning Specialist
    user: {
      id: "550e8400-e29b-41d4-a716-446655440004",
      name: "Dr. Michael Foster",
      email: "michael.foster@example.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      emailVerified: new Date(),
    },
    consultant: {
      id: "c4",
      userId: "550e8400-e29b-41d4-a716-446655440004",
      headline: "Dean of Online Learning (Retired) | Digital Transformation in Higher Ed",
      bio: "I built a fully online division from scratch at a major state university, growing it to serve 15,000+ students with 50+ programs. My expertise includes online program development, learning management systems, instructional design leadership, and faculty support for online teaching.",
      location: "Phoenix, AZ",
      expertiseTags: ["Online Learning", "Curriculum Development", "Faculty Development", "Strategic Planning"],
      hourlyRate: 27500, // $275/hr
      availability: "available",
      website: "https://michaelfoster-edtech.com",
      linkedin: "https://linkedin.com/in/michaelfoster",
      yearsOfExperience: 25,
      timezone: "America/Phoenix",
      travelOpen: true,
      languages: ["Mandarin"],
      profileSlug: "michael-foster",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=d1d4f9",
      status: "ACTIVE",
    },
    caseStudies: [
      {
        id: "cs2",
        consultantId: "c4",
        title: "Scaling Online Programs at State University",
        clientType: "Public University",
        challenge: "University needed to scale online offerings quickly to meet demand and compete with larger online providers, but lacked infrastructure and expertise.",
        solution: "Built centralized online learning division, established instructional design team, implemented faculty development program, and launched 15 new online programs in 24 months.",
        results: "15,000+ enrolled students, $45M annual revenue, 92% student satisfaction rate.",
        duration: "3 years",
        tags: ["Online Learning", "Program Development", "Revenue Growth"],
        status: "PUBLISHED",
      },
    ],
    testimonials: [],
  },
  {
    // User 5: Accreditation Expert
    user: {
      id: "550e8400-e29b-41d4-a716-446655440005",
      name: "Patricia Rodriguez",
      email: "patricia.rodrriguez@example.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia",
      emailVerified: new Date(),
    },
    consultant: {
      id: "c5",
      userId: "550e8400-e29b-41d4-a716-446655440005",
      headline: "Former Provost & Accreditation Liaison | Regional Accreditation Specialist",
      bio: "I've served as accreditation liaison officer for multiple institutions and have successfully guided 5 colleges through reaffirmation processes with regional accreditors. My background includes program review, assessment design, compliance documentation, and site visit preparation. I understand both the substance and the politics of accreditation.",
      location: "Washington, DC",
      expertiseTags: ["Accreditation", "Institutional Research", "Academic Affairs", "Strategic Planning"],
      hourlyRate: 30000, // $300/hr
      availability: "unavailable",
      website: "https://rodriguez-accreditation.com",
      linkedin: "https://linkedin.com/in/patriciarodriguez",
      yearsOfExperience: 30,
      timezone: "America/New_York",
      travelOpen: true,
      languages: ["Spanish", "Portuguese"],
      profileSlug: "patricia-rodriguez",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia&backgroundColor=ffd5dc",
      status: "ACTIVE",
    },
    caseStudies: [],
    testimonials: [],
  },
  {
    // User 6: Student Success Expert
    user: {
      id: "550e8400-e29b-41d4-a716-446655440006",
      name: "David Kim",
      email: "david.kim@example.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      emailVerified: new Date(),
    },
    consultant: {
      id: "c6",
      userId: "550e8400-e29b-41d4-a716-446655440006",
      headline: "VP of Student Success | Retention & Completion Strategies",
      bio: "I've spent my career focused on student persistence and completion. From designing first-year experience programs to building predictive analytics for early alert systems, I help institutions keep students enrolled and on track to graduate. Special expertise in serving underprepared and first-generation students.",
      location: "Chicago, IL",
      expertiseTags: ["Student Success", "Enrollment Management", "Institutional Research", "DEI Initiatives"],
      hourlyRate: 24000, // $240/hr
      availability: "available",
      website: "",
      linkedin: "https://linkedin.com/in/davidkim",
      yearsOfExperience: 12,
      timezone: "America/Chicago",
      travelOpen: true,
      languages: [],
      profileSlug: "david-kim",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=c0aede",
      status: "ACTIVE",
    },
    caseStudies: [],
    testimonials: [
      {
        id: "t2",
        consultantId: "c6",
        authorId: "author2",
        authorName: "Susan Martinez",
        authorTitle: "President",
        authorInstitution: "Riverside Community College",
        content: "David helped us redesign our student success infrastructure from the ground up. Our retention rates improved by 10 percentage points in just two years.",
        rating: 5,
        engagementId: "e2",
        status: "APPROVED",
      },
    ],
  },
  {
    // User 7: International Recruitment
    user: {
      id: "550e8400-e29b-41d4-a716-446655440007",
      name: "Aisha Hassan",
      email: "aisha.hassan@example.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha",
      emailVerified: new Date(),
    },
    consultant: {
      id: "c7",
      userId: "550e8400-e29b-41d4-a716-446655440007",
      headline: "Director of International Recruitment | Global Student Mobility Expert",
      bio: "I've built international recruitment programs for institutions across the US, with particular expertise in South Asia, East Asia, and the Middle East. From developing recruitment strategies to managing agent relationships and navigating visa regulations, I help institutions build sustainable international enrollment.",
      location: "San Francisco, CA",
      expertiseTags: ["International Recruitment", "Enrollment Management", "Marketing & Communications"],
      hourlyRate: 26000, // $260/hr
      availability: "available",
      website: "https://hassan-global.com",
      linkedin: "https://linkedin.com/in/aishahassan",
      yearsOfExperience: 14,
      timezone: "America/Los_Angeles",
      travelOpen: true,
      languages: ["Arabic", "Hindi", "Urdu"],
      profileSlug: "aisha-hassan",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha&backgroundColor=b6e3f4",
      status: "ACTIVE",
    },
    caseStudies: [],
    testimonials: [],
  },
  {
    // User 8: Advancement/Fundraising
    user: {
      id: "550e8400-e29b-41d4-a716-446655440008",
      name: "Thomas Wright",
      email: "thomas.wright@example.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
      emailVerified: new Date(),
    },
    consultant: {
      id: "c8",
      userId: "550e8400-e29b-41d4-a716-446655440008",
      headline: "VP for Advancement (Retired) | Campaign Planning & Major Gifts",
      bio: "I led a $500M comprehensive campaign as VP for Advancement at a major research university. My expertise includes campaign planning, major gift strategy, alumni engagement, and building development teams. I've worked with boards of trustees, senior leadership, and major donors to achieve ambitious fundraising goals.",
      location: "New York, NY",
      expertiseTags: ["advancement/Fundraising", "Strategic Planning", "Marketing & Communications"],
      hourlyRate: 35000, // $350/hr
      availability: "busy",
      website: "https://wrightadvancement.com",
      linkedin: "https://linkedin.com/in/thomaswright",
      yearsOfExperience: 35,
      timezone: "America/New_York",
      travelOpen: true,
      languages: ["French"],
      profileSlug: "thomas-wright",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas&backgroundColor=d1d4f9",
      status: "ACTIVE",
    },
    caseStudies: [
      {
        id: "cs3",
        consultantId: "c8",
        title: "$500M Campaign: From Planning to Completion",
        clientType: "Private Research University",
        challenge: "Institution had never conducted a campaign above $200M and needed to build capacity for a much larger effort while maintaining annual fund operations.",
        solution: "Designed phased campaign approach, rebuilt development team structure, implemented new donor management system, and focused on major gift pipeline development.",
        results: "Campaign exceeded goal at $525M. Major gift pipeline increased by 300%. Annual fund grew 40% during campaign period.",
        duration: "5 years",
        tags: ["Capital Campaign", "Major Gifts", "Team Building"],
        status: "PUBLISHED",
      },
    ],
    testimonials: [],
  },
];

// ============================================================================
// MOCK ORGANIZATION DATA (Clients)
// ============================================================================

const mockOrganizations = [
  {
    id: "org1",
    name: "Midwest University",
    slug: "midwest-university",
    type: "PUBLIC_UNIVERSITY",
  },
  {
    id: "org2",
    name: "Riverside Community College",
    slug: "riverside-cc",
    type: "COMMUNITY_COLLEGE",
  },
  {
    id: "org3",
    name: "Lakeside Liberal Arts College",
    slug: "lakeside-college",
    type: "PRIVATE_COLLEGE",
  },
  {
    id: "org4",
    name: "Metro State University",
    slug: "metro-state",
    type: "PUBLIC_UNIVERSITY",
  },
];

// ============================================================================
// MOCK ENGAGEMENT & INVOICE DATA
// ============================================================================

const mockEngagements = [
  {
    id: "e1",
    clientId: "org1",
    consultantId: "c1",
    title: "Strategic Enrollment Planning Initiative",
    description: "Comprehensive review and redesign of the university's enrollment strategy, including recruitment operations, financial aid packaging, and marketing approach.",
    status: "COMPLETED",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-06-30"),
    budget: 750000, // $7,500 in cents
    deliverables: ["Strategic Plan Document", "Financial Aid Packaging Analysis", "Recruitment Process Review"],
    internalNotes: "Excellent client relationship. Potential for Phase 2 work in fall 2024.",
  },
  {
    id: "e2",
    clientId: "org2",
    consultantId: "c6",
    title: "Student Success & Retention Program Design",
    description: "Design and implementation of a comprehensive student success infrastructure including early alert systems, advising protocols, and first-year experience programs.",
    status: "ACTIVE",
    startDate: new Date("2024-03-01"),
    endDate: null,
    budget: 1200000, // $12,000 in cents
    deliverables: ["Program Design", "Staff Training Plan", "Assessment Framework"],
    internalNotes: "Client very satisfied with progress. Discussing extension for faculty development component.",
  },
  {
    id: "e3",
    clientId: "org3",
    consultantId: "c3",
    title: "Financial Aid Optimization Review",
    description: "Review of current financial aid packaging strategies and recommendations for optimizing aid deployment to support enrollment and net tuition revenue goals.",
    status: "INITIATED",
    startDate: null,
    endDate: null,
    budget: 600000, // $6,000 in cents
    deliverables: ["Aid Packaging Analysis", "Recommendations Report"],
    internalNotes: "Initial consultation complete. Awaiting data from client business office.",
  },
];

const mockInvoices = [
  {
    id: "inv1",
    engagementId: "e1",
    amount: 750000,
    commissionAmount: 112500, // 15%
    status: "PAID",
    stripePaymentIntentId: "pi_test_123",
  },
  {
    id: "inv2",
    engagementId: "e2",
    amount: 400000,
    commissionAmount: 60000, // 15%
    status: "PENDING",
    stripePaymentIntentId: null,
  },
];

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function seedConsultants() {
  console.log("🌱 Seeding consultants...");

  for (const mock of mockConsultants) {
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, mock.user.id)).limit(1);

    if (!existingUser[0]) {
      await db.insert(users).values(mock.user);
      console.log(`  ✅ Created user: ${mock.user.name}`);
    }

    // Check if consultant exists
    const existingConsultant = await db.select().from(consultants).where(eq(consultants.id, mock.consultant.id)).limit(1);

    if (!existingConsultant[0]) {
      await db.insert(consultants).values(mock.consultant);
      console.log(`  ✅ Created consultant: ${mock.consultant.headline}`);

      // Insert case studies
      for (const cs of mock.caseStudies) {
        await db.insert(caseStudies).values(cs);
      }

      // Insert testimonials
      for (const t of mock.testimonials) {
        await db.insert(testimonials).values(t);
      }
    }
  }

  console.log("✅ Consultants seeded!\n");
}

async function seedOrganizations() {
  console.log("🌱 Seeding organizations...");

  for (const org of mockOrganizations) {
    const existing = await db.select().from(organizations).where(eq(organizations.id, org.id)).limit(1);

    if (!existing[0]) {
      await db.insert(organizations).values(org);
      console.log(`  ✅ Created organization: ${org.name}`);
    }
  }

  console.log("✅ Organizations seeded!\n");
}

async function seedEngagements() {
  console.log("🌱 Seeding engagements...");

  for (const eng of mockEngagements) {
    const existing = await db.select().from(engagements).where(eq(engagements.id, eng.id)).limit(1);

    if (!existing[0]) {
      await db.insert(engagements).values(eng);
      console.log(`  ✅ Created engagement: ${eng.title}`);
    }
  }

  console.log("✅ Engagements seeded!\n");
}

async function seedInvoices() {
  console.log("🌱 Seeding invoices...");

  for (const inv of mockInvoices) {
    const existing = await db.select().from(invoices).where(eq(invoices.id, inv.id)).limit(1);

    if (!existing[0]) {
      await db.insert(invoices).values(inv);
      console.log(`  ✅ Created invoice: ${inv.id}`);
    }
  }

  console.log("✅ Invoices seeded!\n");
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("🚀 Starting mock data seed...\n");

  try {
    await seedConsultants();
    await seedOrganizations();
    await seedEngagements();
    await seedInvoices();

    console.log("\n✅ Mock data seeding complete!");
    console.log("\n📊 Summary:");
    console.log(`  - ${mockConsultants.length} consultants`);
    console.log(`  - ${mockOrganizations.length} organizations`);
    console.log(`  - ${mockEngagements.length} engagements`);
    console.log(`  - ${mockInvoices.length} invoices`);
    console.log(`  - ${mockConsultants.reduce((sum, c) => sum + c.caseStudies.length, 0)} case studies`);
    console.log(`  - ${mockConsultants.reduce((sum, c) => sum + c.testimonials.length, 0)} testimonials`);
    console.log("\n🎉 Ready for demo!\n");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

main();
