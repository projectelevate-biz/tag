# Clean Rebuild Guide for Rebound & Relay

This guide will help you rebuild the project from scratch in a clean environment.

## Step 1: Create New Project

```bash
# Create a new directory
mkdir rebound-relay-clean
cd rebound-relay-clean

# Initialize Next.js 15
npx create-next-app@15.0.3 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --turbopack

# Install additional dependencies
npm install @supabase/supabase-js @supabase/ssr zod lucide-react
npm install -D @types/node
```

## Step 2: Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Copy your project URL and anon key
3. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Step 3: Create Database Schema

Run the SQL in `supabase-schema.sql` (will be created next) in your Supabase SQL Editor.

## Step 4: Copy Files

Copy all the files from the `/app`, `/lib`, and `/components` directories that I'll create.

## Step 5: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
rebound-relay-clean/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── rebound/
│   │   └── relay/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
├── components/
│   ├── ui/
│   └── ...
└── middleware.ts
```

## Key Features to Implement

1. **Authentication** - Supabase Auth with email/password
2. **Consultant Portal (Rebound)** - Profile management, engagements, earnings
3. **Institution Portal (Relay)** - Search consultants, create engagements
4. **Engagement Management** - Track projects, milestones, documents
5. **Payments** - Stripe integration for payments and payouts
6. **Messaging** - Real-time chat between consultants and institutions
7. **Admin Dashboard** - Manage users, approve consultants, analytics

## Next Steps

Follow the files I'm creating to implement each feature step by step.
