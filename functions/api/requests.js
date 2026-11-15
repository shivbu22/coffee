// GET/POST /api/requests (auth). Visibility replaces the old public RLS:
// buddies see OPEN requests + their own; clients see their own; admins see all.
import { json, error, assertSameOrigin, readJson, requireDb, newId } from '../_lib/http.js';
import { requireUser } from '../_lib/auth.js';
export async function onRequestGet({ request, env }) {
  const bad = requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  let stmt;
  if (auth.user.role === 'admin') stmt = env.DB.prepare('SELECT * FROM activity_requests ORDER BY created_at DESC');
  else if (auth.user.role === 'buddy') stmt = env.DB.prepare("SELECT * FROM activity_requests WHERE status = 'OPEN' OR client_id = ?1 ORDER BY created_at DESC").bind(auth.user.id);
  else stmt = env.DB.prepare('SELECT * FROM activity_requests WHERE client_id = ?1 ORDER BY created_at DESC').bind(auth.user.id);
  const { results } = await stmt.all();
  return json({ requests: results || [] });
}
export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  const body = await readJson(request); if (!body) return error('Invalid JSON body.');
  if (!body.activity) return error('activity is required.');
  const id = newId();
  await env.DB.prepare(
    `INSERT INTO activity_requests (id, client_id, client_name, client_avatar, activity, city, area, date_time, budget, duration, gender_pref, description, status, responses_count)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,'OPEN',0)`
  ).bind(id, auth.user.id, auth.user.full_name || 'Member', auth.user.avatar_url || null,
    String(body.activity).slice(0, 120), String(body.city || 'Bengaluru').slice(0, 60), String(body.area || 'City Center').slice(0, 120),
    String(body.dateTime || body.date_time || 'Today, 7:00 PM').slice(0, 80), Number(body.budget) || 1000, Number(body.duration) || 2,
    String(body.genderPref || body.gender_pref || 'Any Gender').slice(0, 30), String(body.description || '').slice(0, 1000)).run();
  const row = await env.DB.prepare('SELECT * FROM activity_requests WHERE id = ?1').bind(id).first();
  return json({ request: row }, 201);
}
