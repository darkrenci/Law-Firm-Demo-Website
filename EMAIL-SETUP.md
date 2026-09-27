# Consultation and Chambers Contact email

The forms submit to `/api/inquiry`, a Vercel Node function. It saves to Supabase first, then sends a notification to the firm through Resend. The visitor's email is Reply-To; the recipient is controlled by server environment variables, not form input. A success message means Supabase saved the inquiry and Resend accepted the email, not guaranteed inbox delivery.

## Production configuration

In Vercel Project Settings > Environment Variables, add these for Production:

- `RESEND_API_KEY`: a sending API key from your Resend account.
- `INQUIRY_EMAIL_FROM`: a sender address permitted by Resend, such as `Lalusis & Partners <inquiries@your-verified-domain.com>`.
- `INQUIRY_EMAIL_TO`: `lalusispartners@gmail.com`.

Keep the existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured for the same environment. Never put the email key in a `VITE_` variable or commit it. Redeploy after adding the variables.

Resend requires a verified sending domain for production. Its test sender can only send to the Resend account's own email address; if testing with that sender, the account address must match the recipient. You cannot verify gmail.com as your sending domain.

The existing Supabase public INSERT policies on `consultation_requests` and `contact_messages` must be present. The endpoint uses the public anon key and does not need a service-role key or changes to unrelated tables.

## Verification

1. Submit a clearly labelled test from Consultation and from Chambers Contact.
2. Confirm each success screen, the record in the corresponding Supabase table, and receipt in lalusispartners@gmail.com (including Spam).
3. Confirm Reply addresses the visitor, and the message includes company, practice area, urgency, and the requested schedule when supplied.
4. If email fails after the database save, retry the unchanged form. The same payload uses the same database ID and Resend idempotency key during that page session. Resend's deduplication window is 24 hours. Reloading the page starts a new request.

The API validates fields and size, rejects cross-origin browser submissions, and limits attempts per running server instance. For global bot/rate protection, configure a Vercel Firewall rate-limit rule for `/api/inquiry`; the in-memory limit is not shared across instances.

Run locally through `vercel dev` to exercise the API. Vite alone serves the frontend, not Vercel functions. Automated endpoint tests use mocks and do not send real email.

References: https://resend.com/docs/api-reference/emails/send-email and https://vercel.com/docs/functions/runtimes/node-js
