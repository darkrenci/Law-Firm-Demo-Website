import nodemailer from 'nodemailer';
import { createHash } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

type Request = IncomingMessage & { body?: unknown };
const attempts = new Map<string, { count: number; expires: number }>();
const unavailable = 'Your inquiry could not be sent. Please try again or contact lalusispartners@gmail.com directly.';

export default async function handler(req: Request, res: ServerResponse) {
  const reply = (status: number, body: object) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
  };
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(405, { error: 'Use POST to submit an inquiry.' });
  }
  if (!req.headers['content-type']?.includes('application/json')) return reply(415, { error: 'Expected JSON.' });
  if (req.headers.origin) {
    try {
      if (new URL(req.headers.origin).host !== req.headers.host) return reply(403, { error: 'Invalid request origin.' });
    } catch { return reply(403, { error: 'Invalid request origin.' }); }
  }
  let body: any;
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!raw || Buffer.byteLength(raw) > 24000) return reply(413, { error: 'Please shorten your inquiry.' });
    body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch { return reply(400, { error: 'Invalid submission.' }); }
  const text = (key: string, max: number, required = false) => {
    if (body[key] !== undefined && typeof body[key] !== 'string') throw new Error(`Invalid ${key}.`);
    const value = (body[key] || '').trim();
    if ((required && !value) || value.length > max) throw new Error(`Please check ${key}.`);
    return value;
  };
  let data: { kind: string; fullName: string; email: string; phone: string; company: string; practiceArea: string; urgency: string; preferredDate: string; preferredTime: string; subject: string; message: string; consent: boolean };
  let requestId: string;
  try {
    requestId = text('requestId', 36, true);
    if (!/^[0-9a-f-]{36}$/i.test(requestId)) throw new Error('Invalid submission identifier.');
    if (!['consultation', 'contact'].includes(body.kind)) throw new Error('Invalid inquiry type.');
    data = {
      kind: body.kind, fullName: text('fullName', 160, true), email: text('email', 254, true),
      phone: text('phone', 60), company: text('company', 200), practiceArea: text('practiceArea', 200),
      urgency: text('urgency', 60), preferredDate: text('preferredDate', 10), preferredTime: text('preferredTime', 100),
      subject: text('subject', 200), message: text('message', 10000, true), consent: body.consent === true,
    };
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email)) throw new Error('Please enter a valid email address.');
    if (data.kind === 'consultation' && !data.consent) throw new Error('Please acknowledge the consultation notice.');
    if (data.preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.preferredDate)) throw new Error('Invalid preferred date.');
  } catch (error) { return reply(400, { error: (error as Error).message }); }

  const smtpUser = process.env.GMAIL_SMTP_USER?.trim();
  const smtpPassword = process.env.GMAIL_SMTP_APP_PASSWORD?.replace(/\s/g, '');
  const to = process.env.INQUIRY_EMAIL_TO || 'lalusispartners@gmail.com';
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!smtpUser || !smtpPassword || !supabaseUrl || !supabaseKey) {
    console.error('Inquiry endpoint configuration is incomplete.');
    return reply(503, { error: unavailable });
  }
  // Best-effort per-instance throttle; use Vercel Firewall for distributed limits.
  const now = Date.now();
  for (const [key, value] of attempts) if (value.expires < now) attempts.delete(key);
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0];
  const key = createHash('sha256').update(ip).digest('hex');
  const attempt = attempts.get(key) || { count: 0, expires: now + 60000 };
  if (attempt.count >= 5 || attempts.size >= 10000) return reply(429, { error: 'Please wait a minute before submitting again.' });
  attempt.count++;
  attempts.set(key, attempt);

  const hash = createHash('sha256').update(requestId + JSON.stringify(data)).digest('hex');
  const id = `inquiry-${hash}`;
  const referenceNumber = `LP-${hash.slice(0, 12).toUpperCase()}`;
  const details = [
    `Reference: ${referenceNumber}`, `Form: ${data.kind}`, `Name: ${data.fullName}`, `Email: ${data.email}`,
    `Phone: ${data.phone || 'Not supplied'}`, `Company: ${data.company || 'Not supplied'}`,
    `Practice area: ${data.practiceArea || 'Not specified'}`, `Urgency: ${data.urgency || 'Standard'}`,
    `Preferred date: ${data.preferredDate || 'Not specified'}`, `Preferred time: ${data.preferredTime || 'Not specified'}`,
    `Subject: ${data.subject || 'Legal inquiry'}`, `Consent acknowledged: ${data.consent ? 'Yes' : 'No'}`,
    '', 'Message:', data.message,
  ].join('\n');
  const consultation = data.kind === 'consultation';
  const record = consultation ? {
    id, reference_number: referenceNumber, full_name: data.fullName, email_address: data.email,
    contact_number: data.phone, company_name: data.company, preferred_consultation_type: 'online',
    preferred_date: data.preferredDate || null, preferred_time: data.preferredTime,
    brief_concern: `Practice area: ${data.practiceArea}\nUrgency: ${data.urgency}\n\n${data.message}`,
    privacy_consent: data.consent, status: 'new',
  } : { id, full_name: data.fullName, email: data.email, phone: data.phone,
    subject: data.subject || 'Chambers legal inquiry', message: details, status: 'unread' };
  try {
    const saved = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${consultation ? 'consultation_requests' : 'contact_messages'}`, {
      method: 'POST', headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(record), signal: AbortSignal.timeout(10000),
    });
    if (!saved.ok) {
      const result = await saved.json().catch(() => ({}));
      // A retry of this exact payload already has a durable database record.
      if (saved.status !== 409 || result.code !== '23505') {
        console.error('Inquiry database insert failed:', saved.status, result.code);
        return reply(502, { error: unavailable });
      }
    }
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user: smtpUser, pass: smtpPassword },
      connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000,
      disableFileAccess: true, disableUrlAccess: true,
    });
    try {
      const receipt = await transport.sendMail({
        from: { name: 'Lalusis & Partners Website', address: smtpUser },
        to, replyTo: data.email,
        messageId: '<' + id + '@' + smtpUser.split('@')[1] + '>',
        subject: (consultation ? 'Consultation request' : 'Chambers contact') + ' - ' + referenceNumber,
        text: details,
      });
      if (!receipt.accepted?.length || receipt.rejected?.length) throw new Error('Recipient not accepted');
    } catch {
      console.error('Gmail SMTP notification failed.');
      return reply(502, { error: 'Your inquiry was recorded, but the email notification failed. Please retry or contact lalusispartners@gmail.com directly.' });
    } finally {
      transport.close();
    }
    return reply(200, { id, referenceNumber });
  } catch {
    console.error('Inquiry submission encountered a network error.');
    return reply(502, { error: unavailable });
  }
}
