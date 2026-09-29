# Activate administrator protection

The frontend and database must both be updated. Until the SQL below is applied, the new website will deny administrator access. Deploying code alone does not change Supabase permissions.

1. Open your Supabase project → **Authentication → Users**. Confirm that `lalusispartners@gmail.com` is your account and its email is confirmed. Keep the existing account/password. If it does not exist, create it using the dashboard and set a strong password. Never share the password or service-role key.
2. Open **SQL Editor → New query**. Paste the complete contents of `supabase/migrations/20260929_admin_authorization.sql` and click **Run**. Use this incremental migration for the existing website, not the full initial schema. It runs in a transaction and stops without applying permission changes if the confirmed admin account is missing.
3. Reload `/admin` and sign in with that account. Verify that you can edit content, upload media, and view inquiries. In a private browser window, `/admin` must show the login form; the public website and inquiry submissions should still work.
4. If none of the other apps sharing this Supabase project need public registration, disable **Allow new users to sign up** in Authentication settings. This setting affects the whole project. The law-firm allowlist protects admin access even if other apps still need signup enabled.

The migration replaces policies only on the listed law-firm tables and protects writes to the `media` bucket. Public website content and media remain readable. Inquiries, page history and activity logs require approved admin access. Existing unrelated tables and other buckets keep their policies. Public inquiry inserts remain available to the server endpoint; additional spam controls are a separate task.

Admin permissions are stored in `lawfirm_private.admin_users`, which browser clients cannot change. User metadata, demo roles and simply having a Supabase login do not grant access. To revoke access, use SQL Editor to delete that user's row from this table. Database enforcement is immediate; the open admin screen rechecks on focus and every minute.

Private inquiry/history caches are held in memory and cleared on logout; old localStorage copies are removed when the updated website runs. This cannot erase copies previously exported or stored on devices that have not reopened the website.

## Validation

`node tests/persistence.test.mjs` checks cache persistence and logout behavior. `node tests/admin-auth.test.mjs` checks administrator verification. To run isolated PostgreSQL policy tests, install the test-only dependency with `npm install --prefix .security-tools --no-save --package-lock=false @electric-sql/pglite`, then run `node tests/admin-permissions.test.mjs`. These tests do not connect to production.

These changes address administrator authorization and database permissions, not a complete security or SEO audit. Production permissions still need activation and verification in your Supabase project.
