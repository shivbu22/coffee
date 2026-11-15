// POST /api/auth/signup — email+password registration.
// Role is clamped to client|buddy server-side; admin can NEVER be self-assigned.
import { json, error, assertSameOrigin, readJson, requireDb, newId } from '../../_lib/http.js';
import { hashPassword, publicUser, createSession, sessionCookie, isValidEmail, normalizePhoneIN, clampRole } from '../../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  const body = await readJson(request); if (!body) return error('Invalid JSON body.');
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!isValidEmail(email)) return error('Please enter a valid email address.');
  if (password.length < 8) return error('Password must be at least 8 characters.');
  let phone = '';
  if (body.phone) { phone = normalizePhoneIN(body.phone); if (!phone) return error('Please enter a valid 10-digit Indian mobile number.'); }
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?1').bind(email).first();
  if (existing) return error('An account with these details already exists. Try signing in.', 409);
  const { hash, salt } = await hashPassword(password);
  const id = newId();
  await env.DB.prepare(
    `INSERT INTO users (id, email, phone, password_hash, password_salt, role, full_name, city, avatar_url)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
  ).bind(id, email, phone || null, hash, salt, clampRole(body.role),
    String(body.fullName || body.full_name || email.split('@')[0]).slice(0, 80),
    String(body.city || 'Bengaluru').slice(0, 60),
    String(body.avatar_url || body.avatar || '').slice(0, 500) || null).run();
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?1').bind(id).first();
  const token = await createSession(env, id);
  return json({ user: publicUser(user) }, 201, { 'Set-Cookie': sessionCookie(token, request) });
}
