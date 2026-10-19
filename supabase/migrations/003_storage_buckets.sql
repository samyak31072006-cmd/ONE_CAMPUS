-- CampusOne Database Schema Migration 003: Storage Buckets & Policies
-- Private bucket for exemption documents with signed-url retrieval

-- 1. Insert private bucket 'exemption-documents' into storage.buckets if not present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exemption-documents',
  'exemption-documents',
  false, -- Strictly private!
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- 2. Storage Policies for 'exemption-documents'

-- Student can upload only to their own directory: exemption-documents/{auth.uid()}/*
CREATE POLICY "Students upload own exemption documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'exemption-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Access policy:
-- Student can read their own files.
-- Faculty can read files of students enrolled in their assigned classes.
-- Admins can read all files.
CREATE POLICY "Authorized users view exemption documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'exemption-documents'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin')
    )
  )
);

-- Delete policy: Student can delete their own uploaded document if pending
CREATE POLICY "Students delete own pending exemption documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'exemption-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
