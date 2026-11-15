// POST /api/auth/logout — deletes the session row and clears the cookie.
import { json, assertSameOrigin, requireDb } from '../../_lib/http.js';
import { destroySession, clearCookie } from '../../_lib/auth.js';
export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  await destroySession(request, env);
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie(request) });
}
