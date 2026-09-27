export interface Inquiry {
  kind: 'consultation' | 'contact';
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  practiceArea?: string;
  urgency?: string;
  preferredDate?: string;
  preferredTime?: string;
  subject?: string;
  message: string;
  consent?: boolean;
}

// Keep the same id on retry without storing confidential form text in browser storage.
const requests = new Map<string, string>();
export async function submitInquiry(data: Inquiry): Promise<{ id: string; referenceNumber: string }> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(data)));
  const key = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  if (!requests.has(key)) requests.set(key, crypto.randomUUID());
  let response: Response;
  try {
    response = await fetch('/api/inquiry', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, requestId: requests.get(key) }),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new Error('Unable to confirm submission. Your form is still here; please retry or contact the firm directly.');
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.id || !result?.referenceNumber) {
    throw new Error(result?.error || 'Your inquiry could not be sent. Please try again or contact the firm directly.');
  }
  requests.delete(key);
  return result;
}
