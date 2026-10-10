# Hostinger MySQL migration

The MySQL backend, CMS connection, media endpoints, verified media migration, and MySQL SEO/pre-render build are implemented. The current deployment remains in Supabase mode until VITE_BACKEND=mysql is explicitly enabled. No production database or hosting settings have been changed by the local tests.

## Configuration

Public build variables:

- VITE_BACKEND=mysql
- VITE_SITE_URL=https://lalusispartnerslaw.com

Private server/build variables (never prefix these with VITE_):

- SITE_URL=https://lalusispartnerslaw.com
- INQUIRY_DATABASE=mysql
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD: use the actual Hostinger connection details.
- DB_SSL_CA_FILE: optional path to the provider's CA certificate for verified remote database TLS.
- MEDIA_ROOT=/home/u820151675/domains/lalusispartnerslaw.com/private-media. Hostinger confirmed this sibling folder is outside its normal deployment locations. The server performs a temporary write/read cleanup check during startup and refuses to start if the Node process cannot write there. Keep a separate backup because Hostinger did not provide an unconditional persistence guarantee for every deployment method.
- SMTP_HOST=smtp.hostinger.com
- SMTP_PORT=465 (587 with STARTTLS is also supported)
- SMTP_USER=inquiries@lalusispartnerslaw.com
- SMTP_PASSWORD: the mailbox password, preserved verbatim.
- INQUIRY_EMAIL_TO=inquiries@lalusispartnerslaw.com

Hostinger creates a new build folder on deployment and overwrites deployment-managed folders. Source: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
If this plan does not expose a persistent writable directory outside those folders, do not enable local media storage; an external object-storage adapter is required instead.

## Prepare the imported database and files

Use a trusted terminal on the host, or a staging environment connected to the intended database. Keep database backups, the media backup, and credentials outside Git and public_html. Confirm the imported database reflects the latest CMS edits before cutover.

1. Run npm run mysql:seed to preview missing public defaults. Run npm run mysql:seed -- --apply to insert only missing settings, core pages, practice areas, and navigation. Existing IDs and slugs are preserved. No sample users or inquiries are created.
2. Set ADMIN_EMAIL=lalusispartners@gmail.com and a new ADMIN_INITIAL_PASSWORD of at least 14 characters, then run npm run admin:setup once. This creates the protected app_admins/app_sessions tables. Remove ADMIN_INITIAL_PASSWORD afterward. It will not replace an existing account; Supabase passwords are not automatically migrated.
3. Copy storage-manifest.json and storage/media/ from the private backup to a private directory on the host. Set MEDIA_BACKUP_DIR to that directory and LEGACY_SUPABASE_URL to the original Supabase project origin. Set MEDIA_ROOT to the confirmed persistent destination.
4. Run npm run media:migrate to preview. It validates every SHA-256 hash and supported file signature before planning URL changes. Run npm run media:migrate -- --apply to copy the verified files and transactionally rewrite saved URLs. Run during a CMS editing pause so no edits arrive during the final transfer. Repeating it is safe and does not overwrite existing destination files.
5. Remove MEDIA_BACKUP_DIR and LEGACY_SUPABASE_URL from the runtime environment after migration. Keep the original backups separately.

The backup rehearsal inserted 4 missing core pages, 14 practice areas, and 5 navigation records into a disposable copy; it left existing settings unchanged. All 12 backup files verified; 11 unique file contents were copied (one duplicate). It updated 16 rows and added 1 missing media record. A second run made zero database changes. These counts describe the saved backup, not a live Hostinger migration.

## Build and deploy

Only after the database and persistent media directory are ready:

- Build command: npm run build:hostinger
- Start command: npm start
- Node entry: server.mjs
- Public static directory: dist
- Configure a Node/Express application; a static Vite deployment cannot run these APIs.
- Include server.mjs, runtime dependencies and dist. Do not expose the repository or server.mjs through static hosting. The app serves only dist and registered media routes.
- Node runtime listens on Hostinger's PORT, or 3000 by default.

MySQL build scripts connect using server-only DB_* variables. They take one consistent published-content snapshot for sitemap generation and pre-rendering. No admin sessions, private inquiry records, media inventory or raw settings secrets enter that snapshot. A database error fails the build instead of silently publishing seed content. The MySQL build snapshot is ignored by Git. Content changes appear in the running CMS, but generated HTML and SEO files require a fresh build/redeploy to update.

Verify the real host's admin login, upload, image retrieval after a redeploy, and inquiry delivery to the mailbox before ending the Supabase service. Actual SMTP delivery and the hosting account's persistent-directory permissions have not been tested locally.

## Media behavior

Authenticated uploads stream to disk with random names, file signatures, size limits (25 MB images/documents, 100 MB video), and at most two concurrent uploads per process. Supported formats: JPG, PNG, WEBP, GIF, PDF, MP4, WEBM. SVG uploads are rejected; bundled logo SVGs still work. PDFs download as attachments. /media/:id serves registered public assets with byte-range support for videos; there is no directory listing or public media-table API.

Metadata editing cannot replace an asset's URL or file path. Deleting an uploaded asset removes its row and its owned file; imported backup files are retained because multiple records may share them. Deleting an asset referenced by a page will break that page's image, so replace page references first. Back up both the MySQL database and MEDIA_ROOT together.

## Auth and operational behavior

Admin sessions use hashed random tokens with an 8-hour expiry and HttpOnly/Secure/SameSite cookies. Mutations require the configured Origin. Table/column allowlists and parameterized SQL protect CMS writes. Navigation replacement is transactional; a duplicate slug cannot overwrite a different row. There is no Supabase realtime subscription in MySQL mode; refresh to see another editor's changes. Activity logs/page-version UI retain their previous behavior; a durable audit/version API is not added by this migration.

Rate limits are per-process and use the socket peer. Verify Hostinger proxy behavior before launch: a shared proxy can group visitors under one limit. Do not trust arbitrary X-Forwarded-For headers. Inquiry retries preserve one database record but may resend the notification email.

## Tests

npm run test:mysql creates and removes its own local MySQL 8.4 Docker container with random credentials and synthetic data. It covers auth/CSRF boundaries, publication filtering, CRUD, navigation rollback, inquiries with stubbed SMTP, media migration and repeat runs, upload rejection, serving/ranges, restart persistence, deletion, and the actual MySQL SEO/pre-render build. The schema fixture contains no production records. Docker Desktop must be running.

The test build writes synthetic public artifacts to dist/public SEO files. Run npm run build:hostinger again with your intended deployment environment after testing. Never run the individual database tests against production.
