// GET /api/companions (public, ?city= filter) / POST (auth; owner = session user)
import { json, error, assertSameOrigin, readJson, requireDb, newId } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
export function formatCompanion(row) {
  if (!row) return null;
  const parse = (v, fb) => { try { const p = JSON.parse(v); return Array.isArray(p) ? p : fb; } catch { return fb; } };
  return { ...row, is_star: Boolean(row.is_star), is_online: Boolean(row.is_online),
    services: parse(row.services, []), languages: parse(row.languages, []) };
}
export async function onRequestGet({ request, env }) {
  const bad = requireDb(env); if (bad) return bad;
  const city = new URL(request.url).searchParams.get('city');
  const stmt = city && city !== 'All Cities'
    ? env.DB.prepare('SELECT * FROM companions WHERE city = ?1 ORDER BY rating DESC').bind(city)
    : env.DB.prepare('SELECT * FROM companions ORDER BY rating DESC');
  const { results } = await stmt.all();
  return json({ companions: (results || []).map(formatCompanion) });
}
export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  const body = await readJson(request); if (!body) return error('Invalid JSON body.');
  const name = String(body.name || auth.user.full_name || '').trim();
  const city = String(body.city || '').trim();
  const area = String(body.area || '').trim();
  const hourly = Number(body.hourly_rate ?? body.hourlyRate);
  if (!name || !city || !area) return error('name, city and area are required.');
  if (!Number.isFinite(hourly) || hourly < 300 || hourly > 3000) return error('hourly_rate must be between 300 and 3000.');
  const age = Number(body.age || 24); if (!Number.isFinite(age) || age < 18) return error('Companions must be 18 or older.');
  const id = newId();
  await env.DB.prepare(
    `INSERT INTO companions (id, user_id, name, age, gender, city, area, hourly_rate, trip_rate, rating, reviews_count, services, languages, bio, avatar, is_star, is_online, completed_hangouts, hallmark_id)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19)`
  ).bind(id, auth.user.id, name.slice(0, 80), age, String(body.gender || 'Female').slice(0, 20), city.slice(0, 60), area.slice(0, 120),
    hourly, Number(body.trip_rate ?? body.tripRate ?? 2000) || 2000, 4.9, 0,
    JSON.stringify(Array.isArray(body.services) ? body.services : []), JSON.stringify(Array.isArray(body.languages) ? body.languages : ['English', 'Hindi']),
    String(body.bio || '').slice(0, 1000), String(body.avatar || auth.user.avatar_url || '').slice(0, 500),
    body.is_star || body.isStar ? 1 : 0, body.is_online === false || body.isOnline === false ? 0 : 1,
    Number(body.completed_hangouts ?? body.completedHangouts ?? 0) || 0, body.hallmark_id || body.hallmarkId || null).run();
  const row = await env.DB.prepare('SELECT * FROM companions WHERE id = ?1').bind(id).first();
  return json({ companion: formatCompanion(row) }, 201);
}
