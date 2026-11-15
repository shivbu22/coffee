// GET /api/auth/google/callback — exchanges the code, verifies state, then
// find-or-creates the user by email (role stays whatever the DB row says;
// new users are 'client') and sets the session cookie.
import { error, newId } from '../../../_lib/http.js';
import { createSession, sessionCookie } from '../../../_lib/auth.js';
export async function onRequestGet({ request, env }) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return error('Google sign-in is not configured.', 501);
  if (!env.DB) return error('Database is not configured.', 500);
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(/(?:^|;\s*)findco_oauth_state=([^;]+)/);
  if (!code || !state || !m || decodeURIComponent(m[1]) !== state) return error('Invalid OAuth state. Please try signing in again.', 400);
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: `${url.origin}/api/auth/google/callback`, grant_type: 'authorization_code' }),
  });
  if (!tokenRes.ok) return error('Google sign-in failed during token exchange.', 502);
  const tokens = await tokenRes.json();
  const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (!infoRes.ok) return error('Google sign-in failed while loading your profile.', 502);
  const info = await infoRes.json();
  if (!info.email || info.email_verified === false) return error('Google account email is not verified.', 400);
  const email = String(info.email).toLowerCase();
  let user = await env.DB.prepare('SELECT * FROM users WHERE email = ?1').bind(email).first();
  if (!user) {
    const id = newId();
    await env.DB.prepare('INSERT INTO users (id, email, role, full_name, avatar_url) VALUES (?1, ?2, ?3, ?4, ?5)')
      .bind(id, email, 'client', String(info.name || email.split('@')[0]).slice(0, 80), String(info.picture || '').slice(0, 500) || null).run();
    user = { id };
  }
  const token = await createSession(env, user.id);
  const secure = url.protocol === 'https:' ? '; Secure' : '';
  const headers = new Headers({ Location: '/' });
  headers.append('Set-Cookie', sessionCookie(token, request));
  headers.append('Set-Cookie', `findco_oauth_state=; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=0`);
  return new Response(null, { status: 302, headers });
}
