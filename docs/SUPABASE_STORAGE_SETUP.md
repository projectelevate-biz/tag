# Supabase Storage Setup Guide

This guide explains how to set up the required storage buckets for Rebound & Relay.

## Storage Buckets Required

You need to create 5 storage buckets in Supabase:

1. rebound-profiles - Consultant profile pictures (Public)
2. rebound-documents - Consultant resumes, CVs, certificates (Private)
3. relay-documents - Institution RFPs, contracts (Private)
4. engagement-documents - Files shared during projects (Private)
5. proposal-documents - Formal proposal PDFs (Private)

---

## Step 1: Create the Storage Buckets

### Method A: Using Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/storage

2. Click the New bucket button for each bucket below:

#### Bucket 1: rebound-profiles
- Bucket name: rebound-profiles
- Make bucket public: YES (check the box)
- File size limit: 5242880 (5MB)
- Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif

#### Bucket 2: rebound-documents
- Bucket name: rebound-documents
- Make bucket public: NO
- File size limit: 10485760 (10MB)
- Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

#### Bucket 3: relay-documents
- Bucket name: relay-documents
- Make bucket public: NO
- File size limit: 10485760 (10MB)
- Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

#### Bucket 4: engagement-documents
- Bucket name: engagement-documents
- Make bucket public: NO
- File size limit: 26214400 (25MB)
- Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel

#### Bucket 5: proposal-documents
- Bucket name: proposal-documents
- Make bucket public: NO
- File size limit: 10485760 (10MB)
- Allowed MIME types: application/pdf

---

### Method B: Using SQL (Alternative)

Go to https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/sql and run this SQL:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('rebound-profiles', 'rebound-profiles', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
  ('rebound-documents', 'rebound-documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('relay-documents', 'relay-documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('engagement-documents', 'engagement-documents', false, 26214400, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']),
  ('proposal-documents', 'proposal-documents', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

---

## Step 2: Set Up Bucket Policies (Row Level Security)

After creating the buckets, you need to set up policies so users can access files. These are called RLS (Row Level Security) policies.

### What are Bucket Policies?

Bucket policies control WHO can access files in storage. They are separate from database table policies.

### How to Add Policies

For each bucket below:
1. Go to Storage page in Supabase Dashboard
2. Click on the bucket name
3. Click the Policies tab
4. Click New Policy
5. Select "For full customization" (NOT a template)
6. Enter the policy name and expression exactly as shown
7. Click Save

---

### rebound-profiles Bucket Policies

This bucket stores profile pictures that anyone can view, but only the owner can upload/delete.

Policy 1: Allow public to view profile pictures
- Policy name: Public read access
- Allowed operation: SELECT
- Using expression (check the box):
  true
- Click Review then Save

Policy 2: Allow users to upload their own profile picture
- Policy name: Authenticated upload
- Allowed operation: INSERT
- Using expression:
  auth.uid()::text = (storage.foldername(name))[1]
- Click Review then Save

Policy 3: Allow users to delete their own profile picture
- Policy name: Owner delete
- Allowed operation: DELETE
- Using expression:
  auth.uid()::text = (storage.foldername(name))[1]
- Click Review then Save

---

### rebound-documents Bucket Policies

This bucket stores consultant documents. Only the consultant can access their own documents.

Policy 1: Allow consultants to upload their documents
- Policy name: Consultant upload
- Allowed operation: INSERT
- Using expression:
  auth.uid()::text = (storage.foldername(name))[1]
- Click Review then Save

Policy 2: Allow consultants to view their documents
- Policy name: Consultant select
- Allowed operation: SELECT
- Using expression:
  auth.uid()::text = (storage.foldername(name))[1]
- Click Review then Save

Policy 3: Allow consultants to delete their documents
- Policy name: Consultant delete
- Allowed operation: DELETE
- Using expression:
  auth.uid()::text = (storage.foldername(name))[1]
- Click Review then Save

---

### relay-documents Bucket Policies

This bucket stores institution documents. Similar setup to rebound-documents.

Policy 1: Allow organizations to upload their documents
- Policy name: Organization upload
- Allowed operation: INSERT
- Using expression:
  auth.uid()::text = (storage.foldername(name))[1]
- Click Review then Save

Policy 2: Allow organizations to view their documents
- Policy name: Organization select
- Allowed operation: SELECT
- Using expression:
  auth.uid()::text = (storage.foldername(name))[1]
- Click Review then Save

Policy 3: Allow organizations to delete their documents
- Policy name: Organization delete
- Allowed operation: DELETE
- Using expression:
  auth.uid()::text = (storage.foldername(name))[1]
- Click Review then Save

---

### engagement-documents Bucket Policies

This bucket stores files shared between consultants and institutions during projects. Both parties can access files for their engagements.

Policy 1: Allow upload for engagement participants
- Policy name: Participant upload
- Allowed operation: INSERT
- Using expression (this is longer, copy carefully):
  EXISTS (
    SELECT 1 FROM "engagement"
    WHERE "engagement".id = (
      SELECT (storage.foldername(name))[2]::text FROM (SELECT name) AS subq LIMIT 1
    )
    AND (
      "engagement"."consultantId" IN (
        SELECT id FROM "consultant" WHERE "userId" = auth.uid()::text
      )
      OR "engagement"."clientId" = auth.uid()::text
    )
  )
- Click Review then Save

Policy 2: Allow viewing for engagement participants
- Policy name: Participant select
- Allowed operation: SELECT
- Using expression (same as above):
  EXISTS (
    SELECT 1 FROM "engagement"
    WHERE "engagement".id = (
      SELECT (storage.foldername(name))[2]::text FROM (SELECT name) AS subq LIMIT 1
    )
    AND (
      "engagement"."consultantId" IN (
        SELECT id FROM "consultant" WHERE "userId" = auth.uid()::text
      )
      OR "engagement"."clientId" = auth.uid()::text
    )
  )
- Click Review then Save

Policy 3: Allow deletion for engagement participants
- Policy name: Participant delete
- Allowed operation: DELETE
- Using expression (same as above):
  EXISTS (
    SELECT 1 FROM "engagement"
    WHERE "engagement".id = (
      SELECT (storage.foldername(name))[2]::text FROM (SELECT name) AS subq LIMIT 1
    )
    AND (
      "engagement"."consultantId" IN (
        SELECT id FROM "consultant" WHERE "userId" = auth.uid()::text
      )
      OR "engagement"."clientId" = auth.uid()::text
    )
  )
- Click Review then Save

---

### proposal-documents Bucket Policies

This bucket stores formal proposal PDFs. Similar to rebound-documents - only the creator can access.

Policy 1: Allow users to upload their proposals
- Policy name: Owner upload
- Allowed operation: INSERT
- Using expression:
  auth.uid()::text = (storage.foldername(name))[1]
- Click Review then Save

Policy 2: Allow users to view their proposals
- Policy name: Owner select
- Allowed operation: SELECT
- Using expression:
  auth.uid()::text = (storage.foldername(name))[1]
- Click Review then Save

Policy 3: Allow users to delete their proposals
- Policy name: Owner delete
- Allowed operation: DELETE
- Using expression:
  auth.uid()::text = (storage.foldername(name))[1]
- Click Review then Save

---

## Step 3: Verify Everything Works

1. Go to Storage page in Supabase Dashboard
2. You should see all 5 buckets listed
3. For each bucket, click Policies tab and verify your policies are there
4. Try uploading a test file to rebound-profiles (it should work)
5. Try viewing the public URL: https://owymreftwxadreqhtlrz.supabase.co/storage/v1/object/public/rebound-profiles/test.jpg

---

## Troubleshooting

Upload Errors
- Check policies are created for the correct bucket
- Verify you are logged in (authenticated)
- Check bucket names match exactly (case-sensitive)
- Check file size is within limit
- Check file type is in allowed MIME types

Public URL Not Working
- Only rebound-profiles is public, others are private
- For private buckets, use signed URLs from your code
- Check the bucket is set to Public in dashboard

Policy Expression Errors
- Copy the expression exactly as shown
- Make sure there are no extra quotes or spaces
- For engagement-documents, the expression is long - copy the whole thing

---

## Quick Reference: File Path Convention

When uploading files, use this path structure so policies work correctly:

- rebound-profiles: userId/filename.jpg (example: user_abc123/profile.jpg)
- rebound-documents: userId/filename.pdf (example: user_abc123/resume.pdf)
- relay-documents: orgId/filename.pdf (example: org_xyz456/rfp.pdf)
- engagement-documents: engagementId/userId/filename.pdf
- proposal-documents: userId/filename.pdf
