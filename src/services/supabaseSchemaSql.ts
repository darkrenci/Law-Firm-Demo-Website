// Keep in sync with the initial Supabase migration.
export const SUPABASE_CMS_SQL_SCHEMA = `-- ============================================================================
-- SUPABASE POSTGRESQL SCHEMA & RLS MIGRATION
-- Project: Lalusis & Partners Law Firm CMS
-- Target: Supabase PostgreSQL Database & Supabase Storage
-- ============================================================================

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY,
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. PAGES
CREATE TABLE IF NOT EXISTS public.pages (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    meta_title TEXT,
    meta_description TEXT,
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PAGE VERSIONS
CREATE TABLE IF NOT EXISTS public.page_versions (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    version INT NOT NULL,
    snapshot JSONB NOT NULL,
    note TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. ATTORNEYS / PARTNERS
CREATE TABLE IF NOT EXISTS public.attorneys (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    professional_title TEXT NOT NULL,
    portrait_url TEXT,
    home_card_image_url TEXT,
    home_modal_image_url TEXT,
    partner_page_image_url TEXT,
    primary_specialization TEXT,
    biography TEXT,
    email TEXT,
    direct_phone TEXT,
    linkedin_url TEXT,
    is_partner BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT true,
    is_published BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0,
    practice_area_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    education JSONB NOT NULL DEFAULT '[]'::jsonb,
    bar_admissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    professional_experience JSONB NOT NULL DEFAULT '[]'::jsonb,
    memberships JSONB NOT NULL DEFAULT '[]'::jsonb,
    awards JSONB NOT NULL DEFAULT '[]'::jsonb,
    selected_publications JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Idempotent column migrations for existing tables
ALTER TABLE public.attorneys ADD COLUMN IF NOT EXISTS home_card_image_url TEXT;
ALTER TABLE public.attorneys ADD COLUMN IF NOT EXISTS home_modal_image_url TEXT;
ALTER TABLE public.attorneys ADD COLUMN IF NOT EXISTS partner_page_image_url TEXT;

-- 5. PRACTICE AREAS
CREATE TABLE IF NOT EXISTS public.practice_areas (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    icon_name TEXT,
    short_description TEXT,
    full_description TEXT,
    key_capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    key_stat TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. ARTICLES (LEGAL INSIGHTS)
CREATE TABLE IF NOT EXISTS public.articles (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    reading_time TEXT,
    category TEXT,
    published_at TIMESTAMPTZ,
    author JSONB,
    status TEXT NOT NULL DEFAULT 'published',
    featured_image TEXT,
    practice_area_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. NEWS
CREATE TABLE IF NOT EXISTS public.news (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    date TEXT,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'published',
    featured_image TEXT,
    practice_area_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. FAQ CATEGORIES
CREATE TABLE IF NOT EXISTS public.faq_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. FAQS
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES public.faq_categories(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. CONSULTATION REQUESTS
CREATE TABLE IF NOT EXISTS public.consultation_requests (
    id TEXT PRIMARY KEY,
    reference_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email_address TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    company_name TEXT,
    preferred_consultation_type TEXT NOT NULL DEFAULT 'online',
    practice_area_id TEXT,
    preferred_date TEXT,
    preferred_time TEXT,
    brief_concern TEXT NOT NULL,
    privacy_consent BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'pending',
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. MEDIA REPOSITORY
CREATE TABLE IF NOT EXISTS public.media (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    filename TEXT,
    original_name TEXT,
    storage_path TEXT,
    url TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'image',
    format TEXT,
    size_bytes BIGINT,
    size TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    alt_text TEXT,
    uploaded_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. NAVIGATION
CREATE TABLE IF NOT EXISTS public.navigation (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    path TEXT NOT NULL,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0,
    children JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. ACTIVITY LOGS (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    record_id TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_attorneys_slug ON public.attorneys(slug);
CREATE INDEX IF NOT EXISTS idx_practice_areas_slug ON public.practice_areas(slug);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news(slug);
CREATE INDEX IF NOT EXISTS idx_media_category ON public.media(category);
CREATE INDEX IF NOT EXISTS idx_consultation_status ON public.consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON public.activity_logs(timestamp DESC);

-- SUPABASE STORAGE BUCKET CONFIGURATION
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media',
    'media',
    true,
    26214400, -- 25MB max
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 26214400,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Law-firm permissions only. Run in Supabase SQL Editor as the project owner.
-- First create/confirm lalusispartners@gmail.com in Authentication > Users.
BEGIN;
CREATE SCHEMA IF NOT EXISTS lawfirm_private;
REVOKE ALL ON SCHEMA lawfirm_private FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS lawfirm_private.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE lawfirm_private.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON lawfirm_private.admin_users FROM PUBLIC, anon, authenticated;

DO $bootstrap$
DECLARE admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users
    WHERE lower(email) = 'lalusispartners@gmail.com' AND email_confirmed_at IS NOT NULL;
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Create and confirm lalusispartners@gmail.com in Authentication > Users first. No permission changes were applied.';
  END IF;
  INSERT INTO lawfirm_private.admin_users(user_id) VALUES (admin_id) ON CONFLICT DO NOTHING;
END
$bootstrap$;

CREATE OR REPLACE FUNCTION public.is_lawfirm_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT EXISTS (SELECT 1 FROM lawfirm_private.admin_users WHERE user_id = (SELECT auth.uid()));
$function$;
REVOKE ALL ON FUNCTION public.is_lawfirm_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_lawfirm_admin() TO anon, authenticated;

-- Replace all policies only on the named law-firm tables. Unknown policies must
-- not remain as permissive alternatives. Other public tables are untouched.
DO $policies$
DECLARE table_name text; policy_row record; public_filter text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['site_settings','pages','page_versions','attorneys',
    'practice_areas','articles','news','faq_categories','faqs','consultation_requests',
    'contact_messages','media','navigation','activity_logs']
  LOOP
    IF to_regclass('public.' || table_name) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', table_name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', table_name);
    FOR policy_row IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = table_name
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', policy_row.policyname, table_name);
    END LOOP;
    EXECUTE format('CREATE POLICY "Lawfirm approved administrators" ON public.%I FOR ALL TO authenticated USING ((SELECT public.is_lawfirm_admin())) WITH CHECK ((SELECT public.is_lawfirm_admin()))', table_name);
    public_filter := CASE
      WHEN table_name IN ('pages','attorneys','practice_areas','faqs') THEN 'is_published = true'
      WHEN table_name IN ('articles','news') THEN 'status = ''published'''
      WHEN table_name IN ('site_settings','faq_categories','media','navigation') THEN 'true'
      ELSE NULL END;
    IF public_filter IS NOT NULL THEN
      EXECUTE format('GRANT SELECT ON public.%I TO anon', table_name);
      EXECUTE format('CREATE POLICY "Lawfirm public content" ON public.%I FOR SELECT TO anon, authenticated USING (%s)', table_name, public_filter);
    END IF;
  END LOOP;
END
$policies$;

-- Maintain the existing public intake API, which uses the anon key. Visitors
-- may submit but cannot read, change or delete any inquiry. Anti-bot enforcement
-- remains a separate server/edge task, not an administrator permission.
GRANT INSERT ON public.consultation_requests, public.contact_messages TO anon;
CREATE POLICY "Lawfirm public consultation submission" ON public.consultation_requests
FOR INSERT TO anon, authenticated WITH CHECK (
  status = 'new' AND privacy_consent = true AND internal_notes IS NULL
  AND char_length(trim(full_name)) BETWEEN 1 AND 160
  AND char_length(email_address) BETWEEN 3 AND 254
  AND char_length(brief_concern) BETWEEN 1 AND 11000
);
CREATE POLICY "Lawfirm public contact submission" ON public.contact_messages
FOR INSERT TO anon, authenticated WITH CHECK (
  status = 'unread' AND notes IS NULL
  AND char_length(trim(full_name)) BETWEEN 1 AND 160
  AND char_length(email) BETWEEN 3 AND 254
  AND char_length(message) BETWEEN 1 AND 14000
);

-- The media bucket is public website imagery. Restrictive write guards prevent
-- other permissive Storage policies from allowing non-admin writes to it.
-- Guards evaluate true for other buckets so their policies are unaffected.
DROP POLICY IF EXISTS "Admin Upload Media Files" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Media Files" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Media Files" ON storage.objects;
DROP POLICY IF EXISTS "Lawfirm media insert guard" ON storage.objects;
DROP POLICY IF EXISTS "Lawfirm media update guard" ON storage.objects;
DROP POLICY IF EXISTS "Lawfirm media delete guard" ON storage.objects;
CREATE POLICY "Admin Upload Media Files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND (SELECT public.is_lawfirm_admin()));
CREATE POLICY "Admin Update Media Files" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'media' AND (SELECT public.is_lawfirm_admin()))
WITH CHECK (bucket_id = 'media' AND (SELECT public.is_lawfirm_admin()));
CREATE POLICY "Admin Delete Media Files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'media' AND (SELECT public.is_lawfirm_admin()));
CREATE POLICY "Lawfirm media insert guard" ON storage.objects AS RESTRICTIVE FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id <> 'media' OR (SELECT public.is_lawfirm_admin()));
CREATE POLICY "Lawfirm media update guard" ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon, authenticated
USING (bucket_id <> 'media' OR (SELECT public.is_lawfirm_admin()))
WITH CHECK (bucket_id <> 'media' OR (SELECT public.is_lawfirm_admin()));
CREATE POLICY "Lawfirm media delete guard" ON storage.objects AS RESTRICTIVE FOR DELETE TO anon, authenticated
USING (bucket_id <> 'media' OR (SELECT public.is_lawfirm_admin()));
DROP POLICY IF EXISTS "Public Read Media Files" ON storage.objects;
CREATE POLICY "Public Read Media Files" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
NOTIFY pgrst, 'reload schema';
COMMIT;
`;
