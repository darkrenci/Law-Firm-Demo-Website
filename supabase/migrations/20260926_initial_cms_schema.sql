-- ============================================================================
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
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 26214400;

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attorneys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC READ POLICIES
DROP POLICY IF EXISTS "Public Read Settings" ON public.site_settings;
CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Pages" ON public.pages;
CREATE POLICY "Public Read Pages" ON public.pages FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read Page Versions" ON public.page_versions;
CREATE POLICY "Public Read Page Versions" ON public.page_versions FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read Attorneys" ON public.attorneys;
CREATE POLICY "Public Read Attorneys" ON public.attorneys FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read Practice Areas" ON public.practice_areas;
CREATE POLICY "Public Read Practice Areas" ON public.practice_areas FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read Articles" ON public.articles;
CREATE POLICY "Public Read Articles" ON public.articles FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read News" ON public.news;
CREATE POLICY "Public Read News" ON public.news FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read FAQ Categories" ON public.faq_categories;
CREATE POLICY "Public Read FAQ Categories" ON public.faq_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read FAQs" ON public.faqs;
CREATE POLICY "Public Read FAQs" ON public.faqs FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read Media" ON public.media;
CREATE POLICY "Public Read Media" ON public.media FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Navigation" ON public.navigation;
CREATE POLICY "Public Read Navigation" ON public.navigation FOR SELECT USING (true);

-- 2. PUBLIC INTAKE POLICIES
DROP POLICY IF EXISTS "Public Insert Consultation" ON public.consultation_requests;
CREATE POLICY "Public Insert Consultation" ON public.consultation_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Insert Contact" ON public.contact_messages;
CREATE POLICY "Public Insert Contact" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- 3. AUTHENTICATED ADMIN ACCESS
DROP POLICY IF EXISTS "Admin All Settings" ON public.site_settings;
CREATE POLICY "Admin All Settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Pages" ON public.pages;
CREATE POLICY "Admin All Pages" ON public.pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Page Versions" ON public.page_versions;
CREATE POLICY "Admin All Page Versions" ON public.page_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Attorneys" ON public.attorneys;
CREATE POLICY "Admin All Attorneys" ON public.attorneys FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Practice Areas" ON public.practice_areas;
CREATE POLICY "Admin All Practice Areas" ON public.practice_areas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Articles" ON public.articles;
CREATE POLICY "Admin All Articles" ON public.articles FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All News" ON public.news;
CREATE POLICY "Admin All News" ON public.news FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All FAQ Categories" ON public.faq_categories;
CREATE POLICY "Admin All FAQ Categories" ON public.faq_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All FAQs" ON public.faqs;
CREATE POLICY "Admin All FAQs" ON public.faqs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Consultations" ON public.consultation_requests;
CREATE POLICY "Admin All Consultations" ON public.consultation_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Contact" ON public.contact_messages;
CREATE POLICY "Admin All Contact" ON public.contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Media" ON public.media;
CREATE POLICY "Admin All Media" ON public.media FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Navigation" ON public.navigation;
CREATE POLICY "Admin All Navigation" ON public.navigation FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Activity Logs" ON public.activity_logs;
CREATE POLICY "Admin All Activity Logs" ON public.activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. STORAGE POLICIES
DROP POLICY IF EXISTS "Public Read Media Files" ON storage.objects;
CREATE POLICY "Public Read Media Files" ON storage.objects FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admin Upload Media Files" ON storage.objects;
CREATE POLICY "Admin Upload Media Files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Admin Update Media Files" ON storage.objects;
CREATE POLICY "Admin Update Media Files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admin Delete Media Files" ON storage.objects;
CREATE POLICY "Admin Delete Media Files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');
