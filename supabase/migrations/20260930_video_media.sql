-- Run in Supabase SQL Editor to allow browser-playable videos in the media bucket.
-- Existing admin-only upload/update/delete policies remain unchanged.
UPDATE storage.buckets
SET allowed_mime_types = CASE
  WHEN allowed_mime_types IS NULL THEN NULL
  ELSE ARRAY(SELECT DISTINCT mime FROM unnest(allowed_mime_types || ARRAY['video/mp4','video/webm']) AS mime)
END
WHERE id = 'media';
