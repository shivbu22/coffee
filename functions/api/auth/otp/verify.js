// POST /api/auth/otp/verify — verifies OTP; find-or-create user (role clamped),
// then sets the session cookie.
import { json, error, assertSameOrigin, readJson, requireDb, newId } from '../../../_lib/http.js';
import { verifyOtpCode, publicUser, createSession, sessionCookie, normalizePhoneIN, clampRole } from '../../../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  const body = await readJson(request); if (!body) return error('Invalid JSON body.');
  const raw = String(body.identifier || body.phoneOrEmail || body.phone || body.email || '').trim();
  const code = String(body.code || body.token || '').trim();
  if (!/^\d{6}$/.test(code)) return error('Please enter the 6-digit verification code.');
  let identifier, isEmail = raw.includes('@');
  if (isEmail) identifier = raw.toLowerCase();
  else { const p = normalizePhoneIN(raw); if (!p) return error('Please enter a valid 10-digit Indian mobile number.'); identifier = `+91${p}`; }
  const res = await verifyOtpCode(env, identifier, code);
  if (!res.ok) return error(res.error, 401);
  let user = isEmail
    ? await env.DB.prepare('SELECT * FROM users WHERE email = ?1').bind(identifier).first()
    : await env.DB.prepare('SELECT * FROM users WHERE phone = ?1').bind(identifier.replace('+91', '')).first();
  if (!user) {
    const id = newId();
    await env.DB.prepare(
      `INSERT INTO users (id, email, phone, role, full_name, city) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    ).bind(id, isEmail ? identifier : null, isEmail ? null : identifier.replace('+91', ''), clampRole(body.role),
      String(body.fullName || body.full_name || (isEmail ? identifier.split('@')[0] : 'Member')).slice(0, 80),
      String(body.city || 'Bengaluru').slice(0, 60)).run();
    user = await env.DB.prepare('SELECT * FROM users WHERE id = ?1').bind(id).first();
  }
  const token = await createSession(env, user.id);
  return json({ user: publicUser(user) }, 200, { 'Set-Cookie': sessionCookie(token, request) });
}
