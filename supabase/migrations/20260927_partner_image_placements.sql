-- Preserve each partner image placement across devices.
ALTER TABLE public.attorneys ADD COLUMN IF NOT EXISTS home_card_image_url TEXT;
ALTER TABLE public.attorneys ADD COLUMN IF NOT EXISTS home_modal_image_url TEXT;
ALTER TABLE public.attorneys ADD COLUMN IF NOT EXISTS partner_page_image_url TEXT;
NOTIFY pgrst, 'reload schema';
