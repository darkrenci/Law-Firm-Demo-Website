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
