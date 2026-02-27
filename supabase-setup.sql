-- ============================================================================
-- Supabase Storage Setup for Rebound Documents
-- ============================================================================
-- Run this in your Supabase Dashboard: https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/sql
-- ============================================================================

-- Step 1: Create the storage bucket (run this FIRST)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rebound-documents',
  'rebound-documents',
  false, -- Private bucket (requires signed URLs)
  10485760, -- 10MB file size limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- ============================================================================
-- IMPORTANT: Policies must be created via Dashboard UI
-- ============================================================================
-- After running this script successfully, go to:
-- https://supabase.com/dashboard/project/owymreftwxadreqhtlrz/storage/rebound-documents/policies
--
-- Click "New Policy" and create these 3 policies:
--
-- 1. UPLOAD Policy (INSERT):
--    - Name: "Allow authenticated upload"
--    - Allowed operation: INSERT
--    - Target role: authenticated
--    - Policy definition: Using custom expression:
--      bucket_id = 'rebound-documents' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- 2. SELECT Policy (view/download):
--    - Name: "Allow users to view own files"
--    - Allowed operation: SELECT
--    - Target role: authenticated
--    - Policy definition: Using custom expression:
--      bucket_id = 'rebound-documents' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- 3. DELETE Policy:
--    - Name: "Allow users to delete own files"
--    - Allowed operation: DELETE
--    - Target role: authenticated
--    - Policy definition: Using custom expression:
--      bucket_id = 'rebound-documents' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- ============================================================================

-- Verification: Check if bucket was created successfully
SELECT * FROM storage.buckets WHERE id = 'rebound-documents';
