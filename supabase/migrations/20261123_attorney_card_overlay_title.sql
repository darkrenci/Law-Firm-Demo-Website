-- Separates the portrait-card overlay from the Professional Title / Rank below it.
-- An empty string intentionally hides the overlay; NULL retains the existing fallback.
ALTER TABLE public.attorneys ADD COLUMN IF NOT EXISTS card_overlay_title TEXT;
NOTIFY pgrst, 'reload schema';
