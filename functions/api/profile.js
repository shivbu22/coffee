// GET/PUT /api/profile — the session user's own profile only.
// PUT can never change role/email/id: role escalation attempts are dropped.
import { json, error, assertSameOrigin, readJson, requireDb } from '../_lib/http.js';
import { requireUser, publicUser, normalizePhoneIN } from '../_lib/auth.js';
export async function onRequestGet({ request, env }) {
  const bad = requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  return json({ user: publicUser(auth.user), profile: publicUser(auth.user) });
}
export async function onRequestPut({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  const body = await readJson(request); if (!body) return error('Invalid JSON body.');
  const allowed = {};
  if (body.full_name !== undefined || body.fullName !== undefined || body.name !== undefined) allowed.full_name = String(body.full_name ?? body.fullName ?? body.name).slice(0, 80);
  if (body.city !== undefined) allowed.city = String(body.city).slice(0, 60);
  if (body.avatar_url !== undefined || body.avatar !== undefined) allowed.avatar_url = String(body.avatar_url ?? body.avatar).slice(0, 500);
  if (body.phone !== undefined) { const p = normalizePhoneIN(body.phone); if (!p) return error('Please enter a valid 10-digit Indian mobile number.'); allowed.phone = p; }
  const keys = Object.keys(allowed);
  if (keys.length) {
    const sets = keys.map((k, i) => `${k} = ?${i + 1}`).join(', ');
    await env.DB.prepare(`UPDATE users SET ${sets}, updated_at = datetime('now') WHERE id = ?${keys.length + 1}`)
      .bind(...keys.map(k => allowed[k]), auth.user.id).run();
  }
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?1').bind(auth.user.id).first();
  return json({ user: publicUser(user), profile: publicUser(user) });
}
