# Publishing the persistence fix

1. In the Supabase SQL Editor for the website's project, run `supabase/migrations/20260927_partner_image_placements.sql`. This only adds missing image columns; it does not replace existing records.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting project's production environment, using the same Supabase project. Redeploy this updated source. Credentials entered through the admin's manual connection form apply only to that browser; they do not configure other devices.
3. On the device containing your intended photos, select and save the home card, popup, and partner page images again. Older saves may have discarded those fields in Supabase. A successful upload alone does not publish the partner form; save the partner afterward.
4. Delete unwanted starter media from the updated Media Library. Reload, then open the site in another browser/device to verify images and deletions.

Normal page loads now only read cloud records. They no longer seed the database automatically, restore starter media, or upload stale local media. Initial database setup remains an explicit admin action.

Validation: `npm run lint`, `npm run build`, and `node tests/persistence.test.mjs` (Node 24). The persistence tests use a fake cloud service; live Supabase permissions and deployment configuration must also be verified on the deployed site.
