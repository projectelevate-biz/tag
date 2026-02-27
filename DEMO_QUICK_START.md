# Demo Quick Start Guide

> **Last Updated:** 2025-02-24
> **Goal:** Get the Rebound & Relay marketplace demo running locally

---

## ✅ Code Changes Completed

All code has been migrated from NextAuth/AWS S3 to Supabase Auth/Storage:

- ✅ Supabase Auth (Google OAuth + Email/Password)
- ✅ Supabase Storage (Document uploads)
- ✅ Stripe keys updated
- ✅ Auth middleware updated
- ✅ Sign-out functionality updated
- ✅ Document upload/download with signed URLs

---

## 🚀 Two Steps to Run Demo

### Step 1: Configure Supabase Storage (10 minutes total)

**Part A: Run SQL Script (2 min)**
1. Go to: **https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/sql**
2. Copy the contents of [`supabase-setup.sql`](./supabase-setup.sql)
3. Paste into SQL Editor and click "Run"
4. Verify bucket created

**Part B: Create Policies via Dashboard (8 min)**
1. Go to: **https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/storage**
2. Click on `rebound-documents` bucket → "Policies" tab
3. Create 3 policies (see detailed steps in [`SETUP_CHECKLIST.md`](./SETUP_CHECKLIST.md#step-3-set-up-supabase-storage)):
   - **INSERT policy** (upload) - check expression: `bucket_id = 'rebound-documents' AND (storage.foldername(name))[1] = auth.uid()::text`
   - **SELECT policy** (view/download) - using expression: `bucket_id = 'rebound-documents' AND (storage.foldername(name))[1] = auth.uid()::text`
   - **DELETE policy** - using expression: `bucket_id = 'rebound-documents' AND (storage.foldername(name))[1] = auth.uid()::text`

### Step 2: Enable Google OAuth (3 minutes)

1. Go to: **https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/auth/templates**
2. Find **Google** under "Social login"
3. Click to configure:
   - **Enable** the Google provider
   - **Client ID:** `YOUR_GOOGLE_CLIENT_ID`
   - **Client Secret:** `YOUR_GOOGLE_CLIENT_SECRET`
   - **Redirect URL:** `http://localhost:3000/auth/callback`
4. Save

---

## 🏃 Run the Demo

```bash
# Install dependencies (if needed)
pnpm install

# Start dev server
pnpm dev

# Visit: http://localhost:3000
```

---

## 📋 Demo Flow Script

Follow this sequence for your presentation:

### 1. Sign In (Google OAuth)
- Navigate to: `http://localhost:3000/sign-in`
- Click "Continue with Google"
- Authorize with your Google account

### 2. Create Consultant Profile
- Navigate to: `http://localhost:3000/rebound/profile`
- Fill out:
  - **Name:** Your name
  - **Title:** e.g., "Senior Software Engineer"
  - **Bio:** Brief professional summary
  - **Expertise Areas:** Add tags like "React", "Node.js", "AWS"
  - **Hourly Rate:** e.g., $100
  - **LinkedIn/Portfolio:** Add links (optional)
- Click "Update Profile"

### 3. Upload Documents
- Navigate to: `http://localhost:3000/rebound/documents`
- Click "Upload Document"
- Select document type: "Resume/CV"
- Upload a PDF file (max 10MB)
- Click "Upload Document"
- Verify document appears in list

### 4. Submit Profile for Approval
- After uploading documents, profile status will be "DRAFT"
- Click "Submit for Review" (on profile page)
- Status changes to "SUBMITTED"

### 5. Admin Approval (Switch to Admin Account)
- Sign out and sign in as: `rupeshkoirala33@gmail.com`
- Navigate to: `http://localhost:3000/admin/consultants`
- Find your consultant profile
- Click "Approve"
- Status changes to "ACTIVE"

### 6. Search in Relay
- Navigate to: `http://localhost:3000/relay/search`
- Search for expertise you added (e.g., "React")
- Your profile should appear in results
- Click to view full profile

### 7. Create Engagement
- Click "Start Engagement" on consultant profile
- Fill out engagement details:
  - **Title:** e.g., "React Development Project"
  - **Description:** Project details
  - **Start Date:** Select date
  - **Budget:** e.g., $5000
- Click "Create Engagement"

### 8. Create Invoice
- Navigate to: `http://localhost:3000/relay/engagements`
- Find your engagement
- Click "Create Invoice"
- Fill out invoice details:
  - **Amount:** e.g., $1000
  - **Description:** Milestone payment
- Click "Send Invoice"
- Stripe Checkout page opens (test mode)

### 9. View Earnings
- Navigate to: `http://localhost:3000/rebound/earnings`
- See your earnings dashboard

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `rupeshkoirala33@gmail.com` | (use Google OAuth) |
| **Test Consultant** | Your Google email | (use Google OAuth) |

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| [`supabase-setup.sql`](./supabase-setup.sql) | Storage bucket + RLS policies |
| [`SETUP_CHECKLIST.md`](./SETUP_CHECKLIST.md) | Full setup guide |
| [`src/lib/supabase/client.ts`](./src/lib/supabase/client.ts) | Supabase client initialization |
| [`src/lib/supabase/auth.ts`](./src/lib/supabase/auth.ts) | Auth utilities |
| [`src/lib/supabase/storage.ts`](./src/lib/supabase/storage.ts) | Storage utilities |
| [`src/app/auth/callback/route.ts`](./src/app/auth/callback/route.ts) | OAuth callback handler |

---

## 🐛 Troubleshooting

### "Unauthorized" error
- Ensure you're signed in with Google OAuth
- Check console for errors

### File upload fails
- Verify storage bucket exists: https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/storage
- Check RLS policies are created
- File must be PDF, DOC, or DOCX under 10MB

### Google OAuth redirect fails
- Verify redirect URL in Supabase: `http://localhost:3000/auth/callback`
- Check Google OAuth credentials are correct

### Profile not saving
- Check browser console for errors
- Verify database connection in `.env`

---

## 🎯 Presentation Tips

1. **Pre-load the page** - Have the sign-in page ready before presenting
2. **Use a test Google account** - Don't use your personal email
3. **Prepare a sample PDF** - Have a small PDF ready for upload demo
4. **Keep Stripe in test mode** - Don't use real payment cards
5. **Focus on the flow** - Emphasize the end-to-end marketplace experience

---

## 📊 What This Demo Shows

| Feature | Description |
|---------|-------------|
| **Authentication** | Google OAuth via Supabase Auth |
| **User Profiles** | Consultant profiles with expertise and rates |
| **File Storage** | Secure document upload via Supabase Storage |
| **Admin Approval** | Consultant verification workflow |
| **Search** | Find consultants by expertise |
| **Engagements** | Create and manage client projects |
| **Payments** | Stripe Checkout integration |
| **Earnings** | Consultant earnings dashboard |

---

**For questions or issues**, refer to [`SETUP_CHECKLIST.md`](./SETUP_CHECKLIST.md) for detailed setup steps.
