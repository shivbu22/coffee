// POST /api/auth/login — generic error on any bad credential (no enumeration),
// rate limited to 10 failed attempts per identifier per 15 minutes.
import { json, error, assertSameOrigin, readJson, requireDb } from '../../_lib/http.js';
import { verifyPassword, publicUser, createSession, sessionCookie, isLoginRateLimited, recordLoginAttempt } from '../../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  const body = await readJson(request); if (!body) return error('Invalid JSON body.');
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) return error('Email and password are required.');
  if (await isLoginRateLimited(env, email)) return error('Too many failed sign-in attempts. Please try again in 15 minutes.', 429);
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?1').bind(email).first();
  const ok = user && user.password_hash ? await verifyPassword(password, user.password_hash, user.password_salt) : false;
  await recordLoginAttempt(env, email, ok);
  if (!ok) return error('Invalid email or password.', 401);
  const token = await createSession(env, user.id);
  return json({ user: publicUser(user) }, 200, { 'Set-Cookie': sessionCookie(token, request) });
}
