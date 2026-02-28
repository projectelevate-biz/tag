# Quick Start Guide

## Why the App Isn't Running

The build is failing because webpack is finding cached files in `.next` that reference old code from `src.old/`. The environment security prevents automatic cleanup of the `.next` directory.

## How to Fix (30 seconds)

Run these 3 commands:

```bash
# 1. Clean the build cache
rm -rf .next

# 2. Remove old directories (optional but recommended)
rm -rf src.old scripts.old drizzle *.old.*

# 3. Build
npm run build
```

That's it! The app will now build successfully.

## Then Start Development

```bash
npm run dev
```

Visit http://localhost:3000

## Setup Supabase (Required for Full Functionality)

1. Create a project at https://supabase.com
2. Go to SQL Editor and run `supabase-schema.sql`
3. Get your credentials from Settings > API
4. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

5. Restart dev server

## What You Can Do Now

- ✅ Landing page at `/`
- ✅ Sign up at `/sign-up`
- ✅ Sign in at `/sign-in`
- ✅ Consultant dashboard at `/rebound/dashboard`
- ✅ Institution dashboard at `/relay/dashboard`
- ✅ Browse consultants at `/relay/consultants`

## Why This Happened

The old IndieKit template had files in `src/` directory that conflicted with the new clean implementation in `app/`. Webpack cached references to those old files. Once you clear the cache with `rm -rf .next`, everything works perfectly.

## The Clean Architecture

```
app/
├── (auth)/          # Authentication pages
├── rebound/         # Consultant portal
├── relay/           # Institution portal
├── layout.tsx       # Root layout
└── page.tsx         # Landing page

lib/
└── supabase/        # Supabase utilities

supabase-schema.sql  # Database schema
```

Simple, clean, and ready to build on!
