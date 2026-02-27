# Rebound & Relay - Complete Setup Checklist

> **Last Updated:** 2025-02-24
> **Purpose:** Complete environment and service configuration guide

---

## ✅ Already Configured

- **Database:** Supabase PostgreSQL (connected via Drizzle ORM)
- **Authentication:** Switched from NextAuth → **Supabase Auth**
- **File Storage:** Switched from AWS S3 → **Supabase Storage**
- **Stripe:** Updated with new test keys
- **Super Admin:** `rupeshkoirala33@gmail.com`

---

## 🚨 IMMEDIATE ACTION REQUIRED (2 Steps)

Before the app works, complete these 2 steps:

### 1. Run SQL Script for Storage (5 minutes)
1. Go to: https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/sql
2. Open [`supabase-setup.sql`](./supabase-setup.sql) from this project
3. Paste and run the SQL

### 2. Enable Google OAuth in Supabase (3 minutes)
1. Go to: https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/auth/templates
2. Click "Google" and enable it
3. Add credentials (see Step 2.1 below)
4. Add redirect URL: `http://localhost:3000/auth/callback`

---

## 🔧 Required Configuration Steps

### Step 1: Update Environment Variables (.env)

```bash
# ============================================
# STRIPE PAYMENTS (UPDATE WITH NEW KEYS)
# ============================================
# Update these with your new Stripe test keys:
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY

STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY

# Stripe Connect (for consultant payouts) - NEEDED LATER
# 1. Go to: https://dashboard.stripe.com/settings/connect
# 2. Enable Stripe Connect Express
# 3. Copy your Connect Client ID
STRIPE_CONNECT_CLIENT_ID=ca_YOUR_CONNECT_CLIENT_ID_HERE

# Stripe Webhook - NEEDED AFTER DEPLOYMENT
# 1. Go to: https://dashboard.stripe.com/webhooks
# 2. Create webhook pointing to: https://yourdomain.com/api/webhooks/stripe
# 3. Select events: checkout.session.completed, invoice.paid
# 4. Copy the webhook secret
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# ============================================
# GOOGLE OAUTH (PROVIDED - SAVE THESE)
# ============================================
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# ============================================
# SUPABASE (ALREADY CONFIGURED)
# ============================================
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.owymreftwxadreqhtlrz.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://owymreftwxadreqhtlrz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# ============================================
# APP CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PROJECT_NAME=Rebound & Relay
NEXT_PUBLIC_SIGNIN_ENABLED=true

# ============================================
# AUTH (SUPABASE AUTH - TO BE IMPLEMENTED)
# ============================================
AUTH_SECRET=7671df75478eea83715d7dffd7410ba31a5066800a357ef871f36536a09ca
SUPER_ADMIN_EMAILS=rupeshkoirala33@gmail.com

# ============================================
# EMAIL SERVICE (NEEDED FOR NOTIFICATIONS)
# ============================================
# Option A: Resend (Easiest - has free tier)
# 1. Sign up at https://resend.com/
# 2. Get SMTP credentials
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=your-resend-api-key
FROM_EMAIL=notifications@yourdomain.com
FROM_NAME=Rebound & Relay

# Option B: AWS SES (For production)
# SMTP_HOST=email-smtp.us-east-1.amazonaws.com
# SMTP_PORT=587
# SMTP_USER=your-ses-smtp-username
# SMTP_PASSWORD=your-ses-smtp-password
# FROM_EMAIL=noreply@yourdomain.com
# FROM_NAME=Rebound & Relay

# ============================================
# SUPABASE STORAGE (FOR DOCUMENT UPLOADS)
# ============================================
# Storage bucket will be created via Supabase dashboard
# No additional keys needed - uses existing Supabase credentials
```

---

### Step 2: Configure Supabase Auth

#### 2.1 Enable Google OAuth in Supabase

1. Go to: https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/auth/templates
2. Click "Google" under "Social login"
3. Enable Google provider
4. Add your Google OAuth credentials:
   - **Client ID:** `YOUR_GOOGLE_CLIENT_ID`
   - **Client Secret:** `YOUR_GOOGLE_CLIENT_SECRET`
5. Add redirect URL: `http://localhost:3000/auth/callback`
6. Save

#### 2.2 Configure Supabase Email (for magic links)

1. In Supabase Dashboard → Authentication → Email Templates
2. Customize email templates if needed
3. For production, configure custom SMTP in Supabase settings

---

### Step 3: Set Up Supabase Storage

**IMPORTANT: Complete BOTH parts below - SQL script + Dashboard policies**

#### 3.1 Run SQL Script to Create Bucket (2 minutes)

1. Go to: https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/sql
2. Copy the contents of [`supabase-setup.sql`](./supabase-setup.sql)
3. Paste into SQL Editor and click "Run"
4. You should see the bucket created in the results

#### 3.2 Create Storage Policies via Dashboard (5 minutes)

**Why via Dashboard?** Supabase doesn't allow policy creation via SQL due to security restrictions.

1. Go to: https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/storage
2. Click on the `rebound-documents` bucket
3. Click the "Policies" tab
4. Create these 3 policies:

**Policy 1: Upload (INSERT)**
- Click "New Policy" → "For full customization"
- **Policy name:** `Allow authenticated upload`
- **Allowed operation:** `INSERT`
- **Using expression:** (leave empty)
- **With check expression:**
  ```
  bucket_id = 'rebound-documents' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- Click "Save"

**Policy 2: View/Download (SELECT)**
- Click "New Policy" → "For full customization"
- **Policy name:** `Allow users to view own files`
- **Allowed operation:** `SELECT`
- **Using expression:**
  ```
  bucket_id = 'rebound-documents' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- **With check expression:** (leave empty)
- Click "Save"

**Policy 3: Delete**
- Click "New Policy" → "For full customization"
- **Policy name:** `Allow users to delete own files`
- **Allowed operation:** `DELETE`
- **Using expression:**
  ```
  bucket_id = 'rebound-documents' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- **With check expression:** (leave empty)
- Click "Save"

#### 3.3 Verify Setup

You should see 3 policies listed under the bucket's Policies tab.

---

### Step 4: Set Up Stripe Connect (For Consultant Payouts)

#### 4.1 Enable Stripe Connect

1. Go to: https://dashboard.stripe.com/settings/connect
2. Enable **Stripe Connect Express**
3. Configure platform profile:
   - Platform name: "Rebound & Relay"
   - Support email: your email
4. Get your **Connect Client ID** (starts with `ca_`)
5. Add to `.env`: `STRIPE_CONNECT_CLIENT_ID=ca_...`

#### 4.2 Configure Connect Settings

In Stripe Connect Settings:
- Set redirect URL: `http://localhost:3000/rebound/onboarding/callback`
- Enable "Express" accounts
- Set country support as needed

---

### Step 5: Configure Stripe Webhooks

#### 5.1 Create Webhook Endpoint

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `http://localhost:3000/api/webhooks/stripe` (dev)
4. For production: `https://yourdomain.com/api/webhooks/stripe`
5. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.paid`
   - `account.updated` (for Connect)
6. Click "Add endpoint"
7. Copy the **Webhook Signing Secret** (starts with `whsec_`)
8. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

### Step 6: Set Up Email Service

#### Option A: Resend (Recommended for Testing)

1. Sign up at https://resend.com/
2. Create API key
3. Add to `.env`:
   ```bash
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=587
   SMTP_USER=resend
   SMTP_PASSWORD=re_your_api_key_here
   FROM_EMAIL=notifications@yourdomain.com
   FROM_NAME=Rebound & Relay
   ```

#### Option B: AWS SES (For Production)

1. Go to: https://console.aws.amazon.com/ses/
2. Verify your sending domain
3. Create SMTP credentials
4. Add to `.env`

---

### Step 7: Run Database Migrations

```bash
# Push database schema to Supabase
pnpm drizzle-kit push:pg

# Or generate migration and apply
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

---

### Step 8: Deploy and Test

#### Development Testing

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Visit: http://localhost:3000
```

#### Production Deployment

1. Deploy to Vercel/Railway/etc.
2. Update environment variables in production
3. Update Stripe webhook URL to production domain
4. Update Supabase redirect URLs to production domain

---

## 🔑 Quick Reference: Your Credentials

| Service | Credential |
|---------|------------|
| **Google Client ID** | `YOUR_GOOGLE_CLIENT_ID` |
| **Google Client Secret** | `YOUR_GOOGLE_CLIENT_SECRET` |
| **Stripe Publishable** | `pk_test_YOUR_STRIPE_PUBLISHABLE_KEY` |
| **Stripe Secret** | `sk_test_YOUR_STRIPE_SECRET_KEY` |
| **Supabase URL** | `https://owymreftwxadreqhtlrz.supabase.co` |
| **Super Admin Email** | `rupeshkoirala33@gmail.com` |

---

## ⚠️ Still Needed (For Full Production)

- [ ] **Run `supabase-setup.sql` in Supabase SQL Editor** (Storage bucket + policies)
- [ ] **Configure Google OAuth in Supabase Dashboard** (Step 2.1 below)
- [ ] Stripe Connect Client ID (for consultant payouts)
- [ ] Stripe Webhook Secret (set up after deployment)
- [ ] Email service credentials (Resend or AWS SES)
- [ ] Custom domain name

---

## 📝 Notes

- This template uses **Supabase** as the database
- ✅ **Supabase Auth** is now used for authentication (replaced NextAuth)
- ✅ **Supabase Storage** is now used for file uploads (replaced AWS S3)
- **Stripe** is used for all payment processing
- Google OAuth credentials are already provided

---

## 🔗 Helpful Links

- Supabase Dashboard: https://supabase.com/dashboard/project/owymreftwxadreqhtlrz
- Stripe Dashboard: https://dashboard.stripe.com
- Google Cloud Console: https://console.cloud.google.com/
- Resend: https://resend.com/
