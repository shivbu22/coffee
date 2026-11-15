// GET /api/auth/me — current session user or 401.
import { json, error, requireDb } from '../../_lib/http.js';
import { getSessionUser, publicUser } from '../../_lib/auth.js';
export async function onRequestGet({ request, env }) {
  const bad = requireDb(env); if (bad) return bad;
  const user = await getSessionUser(request, env);
  if (!user) return error('Not signed in.', 401);
  return json({ user: publicUser(user) });
}
