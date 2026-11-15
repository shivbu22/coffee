// POST /api/auth/otp/request — creates a 6-digit OTP (hashed at rest, 10 min).
// Delivery: Resend email when RESEND_API_KEY is set and the identifier is an
// email. Phone OTP has no SMS provider configured, so in non-production the
// code is returned in the response for local testing ONLY (ENVIRONMENT !==
// 'production'). In production without a provider this returns 501 rather
// than leaking codes.
import { json, error, assertSameOrigin, readJson, requireDb } from '../../../_lib/http.js';
import { createOtp, isValidEmail, normalizePhoneIN } from '../../../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  const body = await readJson(request); if (!body) return error('Invalid JSON body.');
  const raw = String(body.identifier || body.emailOrPhone || body.phone || body.email || '').trim();
  let identifier;
  if (raw.includes('@')) { if (!isValidEmail(raw)) return error('Please enter a valid email address.'); identifier = raw.toLowerCase(); }
  else { const p = normalizePhoneIN(raw); if (!p) return error('Please enter a valid 10-digit Indian mobile number.'); identifier = `+91${p}`; }
  const code = await createOtp(env, identifier);
  let delivered = false;
  if (identifier.includes('@') && env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.OTP_FROM_EMAIL || 'FindCo <onboarding@resend.dev>', to: [identifier], subject: 'Your FindCo verification code', text: `Your FindCo verification code is ${code}. It expires in 10 minutes.` }),
    });
    delivered = res.ok;
  }
  const isLocalDev = env.ENVIRONMENT === 'development' || env.ENVIRONMENT === 'local';
  const isProd = env.ENVIRONMENT === 'production' || !isLocalDev;
  if (!delivered && isProd) return error('OTP delivery is not configured on this deployment (set RESEND_API_KEY or an SMS provider).', 501);
  // SEC-06 Fix: devCode is strictly restricted to explicit local development environments
  return json({ ok: true, delivered, ...(isLocalDev ? { devCode: code } : {}) });
}
