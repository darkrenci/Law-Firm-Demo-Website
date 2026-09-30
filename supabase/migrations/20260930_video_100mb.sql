-- Requires a Supabase plan that supports files over 50 MB.
-- First set Storage Settings > Global file size limit to at least 100 MB.
-- This changes only the media bucket; administrator policies are unchanged.
UPDATE storage.buckets
SET file_size_limit = 104857600,
    allowed_mime_types = CASE
      WHEN allowed_mime_types IS NULL THEN NULL
      ELSE ARRAY(SELECT DISTINCT mime FROM unnest(allowed_mime_types || ARRAY['video/mp4','video/webm']) AS mime)
    END
WHERE id = 'media';
