// PUT /api/companions/[id] — owner or admin only (replaces the old RLS rule).
import { json, error, assertSameOrigin, readJson, requireDb } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { formatCompanion } from './index.js';
export async function onRequestPut({ request, env, params }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  const row = await env.DB.prepare('SELECT * FROM companions WHERE id = ?1').bind(params.id).first();
  if (!row) return error('Companion not found.', 404);
  if (row.user_id !== auth.user.id && auth.user.role !== 'admin') return error('You can only update your own companion profile.', 403);
  const body = await readJson(request); if (!body) return error('Invalid JSON body.');
  const map = { name: 'name', age: 'age', gender: 'gender', city: 'city', area: 'area', hourly_rate: 'hourly_rate', hourlyRate: 'hourly_rate', trip_rate: 'trip_rate', tripRate: 'trip_rate', bio: 'bio', avatar: 'avatar', is_online: 'is_online', isOnline: 'is_online', services: 'services', languages: 'languages' };
  const sets = [], vals = [];
  for (const [k, col] of Object.entries(map)) {
    if (body[k] === undefined) continue;
    let v = body[k];
    if (col === 'services' || col === 'languages') v = JSON.stringify(Array.isArray(v) ? v : []);
    if (col === 'is_online') v = v ? 1 : 0;
    if (col === 'hourly_rate' && (Number(v) < 300 || Number(v) > 3000)) return error('hourly_rate must be between 300 and 3000.');
    sets.push(`${col} = ?${vals.length + 1}`); vals.push(v);
  }
  // user_id and hallmark_id are never writable through this endpoint.
  if (sets.length) {
    await env.DB.prepare(`UPDATE companions SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?${vals.length + 1}`).bind(...vals, params.id).run();
  }
  const updated = await env.DB.prepare('SELECT * FROM companions WHERE id = ?1').bind(params.id).first();
  return json({ companion: formatCompanion(updated) });
}
