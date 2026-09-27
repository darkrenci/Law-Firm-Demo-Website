# Gmail SMTP inquiry notifications

Both Consultation and Chambers Contact save the inquiry to Supabase and send a notification to `lalusispartners@gmail.com`. The sender is your authenticated Gmail account; Reply-To is the customer's email. Open the notification in Gmail and click Reply to respond manually. No automatic reply is sent to the customer, and no custom sending domain is needed.

## Activate in production

1. Sign in to the Gmail account that will send notifications, normally lalusispartners@gmail.com.
2. Enable 2-Step Verification in Google Account Security.
3. Open https://myaccount.google.com/apppasswords and create an App Password named Law Firm Website. If the option is unavailable, check Google's account restrictions: https://support.google.com/accounts/answer/185833 .
4. Add these in Vercel > Project Settings > Environment Variables, scoped to Production:
   - `GMAIL_SMTP_USER`: `lalusispartners@gmail.com`
   - `GMAIL_SMTP_APP_PASSWORD`: the generated Google App Password, not your normal Gmail password.
   - `INQUIRY_EMAIL_TO`: `lalusispartners@gmail.com`
5. Keep the existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured. Redeploy after saving the new variables.

Never prefix the Gmail credentials with VITE_, paste them into chat, or commit them. The old RESEND_API_KEY and INQUIRY_EMAIL_FROM are no longer used and can be removed from Vercel.

SMTP uses smtp.gmail.com port 465 with TLS and certificate verification. Gmail sending limits and account restrictions still apply. A successful form means the database saved the record and Gmail's SMTP server accepted the message; it does not guarantee inbox placement.

## Verify

Submit a clearly labelled test from each form, confirm the corresponding Supabase record and Gmail notification (including Spam), and click Reply to verify the customer's address. Automated tests use mocks and do not send real messages.

If SMTP fails, the database record remains, the form stays filled, and the visitor sees an error. Retrying unchanged data in the same page session reuses the database ID and email Message-ID. SMTP has no guaranteed idempotency: a timeout after Gmail accepts a message can result in a duplicate email on retry. Reloading starts a new submission.

The endpoint uses the public INSERT policies on consultation_requests and contact_messages. It validates fields, rejects cross-origin browser submissions, and uses a best-effort per-instance throttle. For shared rate limits across Vercel instances, configure a Firewall rule for /api/inquiry.

Run through `vercel dev` to exercise the API locally. Vite alone serves only the frontend.
