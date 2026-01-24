-- PostgreSQL Migration
-- Note: Supabase Storage buckets must be created via the Supabase dashboard or API
-- This is a reference for the bucket configuration needed

-- Create a public bucket called 'images' with the following settings:
-- Name: images
-- Public: true
-- File size limit: 500KB (512000 bytes)
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- After creating the bucket, add RLS policy to allow public uploads:
-- INSERT policy: Allow anyone to upload (or restrict to authenticated users)
-- SELECT policy: Allow anyone to view

-- Example SQL to enable public access (run in SQL editor after bucket creation):
-- CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
-- CREATE POLICY "Allow public downloads" ON storage.objects FOR SELECT USING (bucket_id = 'images');
