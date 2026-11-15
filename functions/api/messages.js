// GET/POST /api/messages?roomId= — room participants only.
// Participant rule (inferred from the app): a room's participants are the
// users who have exchanged messages in it. The FIRST message in an empty
// room establishes participation; after that, only existing participants
// (users with a message in the room) or an admin may read/post. sender_id is
// always forced to the session user — client-supplied sender fields ignored.
import { json, error, assertSameOrigin, readJson, requireDb, newId } from '../_lib/http.js';
import { requireUser } from '../_lib/auth.js';
async function isParticipant(env, roomId, user) {
  if (user.role === 'admin') return true;
  const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM chat_messages WHERE room_id = ?1').bind(roomId).first();
  if (!count || count.n === 0) return true; // empty room: any signed-in user may open it
  const mine = await env.DB.prepare('SELECT COUNT(*) AS n FROM chat_messages WHERE room_id = ?1 AND sender_id = ?2').bind(roomId, user.id).first();
  return (mine?.n || 0) > 0;
}
export async function onRequestGet({ request, env }) {
  const bad = requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  const roomId = new URL(request.url).searchParams.get('roomId') || new URL(request.url).searchParams.get('room_id');
  if (!roomId) return error('roomId is required.');
  if (!(await isParticipant(env, roomId, auth.user))) return error('You are not a participant of this conversation.', 403);
  const { results } = await env.DB.prepare('SELECT * FROM chat_messages WHERE room_id = ?1 ORDER BY created_at ASC').bind(roomId).all();
  return json({ messages: (results || []).map(m => ({ ...m, counter_offer: m.counter_offer ? JSON.parse(m.counter_offer) : null })) });
}
export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  const body = await readJson(request); if (!body) return error('Invalid JSON body.');
  const roomId = body.room_id || body.roomId;
  const text = String(body.text || '').trim();
  if (!roomId || !text) return error('room_id and text are required.');
  if (!(await isParticipant(env, roomId, auth.user))) return error('You are not a participant of this conversation.', 403);
  const id = newId();
  const role = auth.user.role === 'buddy' ? 'buddy' : 'client';
  await env.DB.prepare(
    'INSERT INTO chat_messages (id, room_id, sender_id, sender_name, sender_role, text, counter_offer) VALUES (?1,?2,?3,?4,?5,?6,?7)'
  ).bind(id, String(roomId).slice(0, 120), auth.user.id, auth.user.full_name || 'Member', role, text.slice(0, 4000),
    body.counter_offer ? JSON.stringify(body.counter_offer) : null).run();
  const row = await env.DB.prepare('SELECT * FROM chat_messages WHERE id = ?1').bind(id).first();
  return json({ message: row }, 201);
}
