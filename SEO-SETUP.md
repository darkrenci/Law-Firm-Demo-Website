# Search discovery configuration

The current public origin is https://lawfirmdemowebsite.vercel.app.
Set VITE_SITE_URL to the final HTTPS origin (no path) in hosting build variables and redeploy when the domain changes. Redirect the old site to the final domain separately.

npm run generate:seo writes public/sitemap.xml, public/robots.txt, public/business-schema.json, and public/site.webmanifest. npm run build runs this before Vite. With Supabase variables configured, it reads published public records using the anon key; it fails on fetch errors instead of silently publishing a stale sitemap. Without Supabase variables, it uses bundled public seed records.

Redeploy after adding, removing, publishing, or changing the slug of a page, practice area, or partner so the static sitemap stays current. Existing files are deployment snapshots, not a live database endpoint. Retired news, insights and FAQ routes, admin routes, and drafts are excluded. No fabricated lastmod dates or ranking priorities are generated.

Business schema is embedded as JSON-LD in initial HTML and refreshed from the public settings in the browser. It uses LegalService, the address, phone, email, real group photograph and logo. No unverified reviews, ratings, coordinates, awards or social profiles are included. Page canonical URLs update through JavaScript; per-route initial HTML still needs pre-rendering.

The manifest describes browser presentation; it does not guarantee indexing or offline functionality. No service worker is installed.

After deployment, verify /sitemap.xml returns XML, /robots.txt returns text, and /site.webmanifest returns JSON. Vercel configuration explicitly serves these files. On another host, serve static files before the SPA fallback, preserve the admin noindex header, and configure the API separately.

Verify your domain in Google Search Console, submit sitemap.xml, and inspect representative pages. Test business markup with Google's Rich Results Test. robots.txt is crawl guidance, not access control; admin authentication remains required. Admin URLs stay crawlable so their noindex directive can be read.

## Public HTML pre-rendering

npm run build now also runs npm run prerender, creating HTML for the sitemap routes plus 404.html and a separate admin.html shell. The server renderer reads public CMS data only and fails if configured CMS reads fail. Public build snapshots keep the initial browser render consistent with the delivered HTML; live CMS refresh still runs afterward. Redeploy when publishing content so search engines and visitors without JavaScript receive current HTML.

Vercel clean URLs serve the generated pages; there is no general SPA catch-all. Unknown routes return 404. Admin routes use the noindex shell, and API functions remain native Vercel endpoints. Partners aliases redirect to attorneys URLs. When moving hosts, configure equivalent clean-URL, redirect, API and custom-404 behavior; do not rewrite every unknown route to index.html.

Public forms become interactive when JavaScript loads. This is static pre-rendering followed by React client rendering, not a continuously running SSR server. The opening overlay is skipped on pre-rendered arrivals to keep content visible immediately.
