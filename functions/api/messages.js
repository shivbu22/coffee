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
  // 1. If user has already participated in this room, access granted
  const mine = await env.DB.prepare('SELECT COUNT(*) AS n FROM chat_messages WHERE room_id = ?1 AND sender_id = ?2').bind(roomId, user.id).first();
  if ((mine?.n || 0) > 0) return true;

  // 2. Count distinct participants already in this room
  const senders = await env.DB.prepare('SELECT DISTINCT sender_id FROM chat_messages WHERE room_id = ?1').bind(roomId).all();
  const distinctCount = (senders?.results || []).length;

  // SEC-03 Fix: If room is empty (0) or has only 1 sender, allow the second party to join
  if (distinctCount < 2) return true;

  // Room already has 2 participants and this user is not one of them
  return false;
}
export async function onRequestGet({ request, env }) {
  const bad = requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  const url = new URL(request.url);
  const roomId = url.searchParams.get('roomId') || url.searchParams.get('room_id');
  const since = url.searchParams.get('since');
  if (!roomId) return error('roomId is required.');
  if (!(await isParticipant(env, roomId, auth.user))) return error('You are not a participant of this conversation.', 403);

  let query = 'SELECT * FROM chat_messages WHERE room_id = ?1';
  const params = [roomId];
  if (since) {
    query += ' AND created_at > ?2 ORDER BY created_at ASC';
    params.push(since);
  } else {
    query += ' ORDER BY created_at ASC';
  }

  const { results } = await env.DB.prepare(query).bind(...params).all();
  return json({ 
    messages: (results || []).map(m => ({ 
      ...m, 
      counter_offer: m.counter_offer ? JSON.parse(m.counter_offer) : null,
      media_metadata: m.media_metadata ? JSON.parse(m.media_metadata) : null,
      location_data: m.location_data ? JSON.parse(m.location_data) : null
    })) 
  });
}
export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  const body = await readJson(request); if (!body) return error('Invalid JSON body.');
  const roomId = body.room_id || body.roomId;
  const text = String(body.text || '').trim();
  const mediaType = body.media_type || body.mediaType || null;
  const mediaUrl = body.media_url || body.mediaUrl || null;
  const mediaMetadata = body.media_metadata || body.mediaMetadata ? JSON.stringify(body.media_metadata || body.mediaMetadata) : null;
  const locationData = body.location_data || body.locationData ? JSON.stringify(body.location_data || body.locationData) : null;
  const clientTempId = body.client_temp_id || body.clientTempId || null;

  if (!roomId || (!text && !mediaUrl && !locationData)) return error('room_id and message content are required.');
  if (!(await isParticipant(env, roomId, auth.user))) return error('You are not a participant of this conversation.', 403);
  const id = newId();
  const role = auth.user.role === 'buddy' ? 'buddy' : 'client';
  await env.DB.prepare(
    'INSERT INTO chat_messages (id, room_id, sender_id, sender_name, sender_role, text, counter_offer, client_temp_id, status, media_type, media_url, media_metadata, location_data) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)'
  ).bind(
    id, 
    String(roomId).slice(0, 120), 
    auth.user.id, 
    auth.user.full_name || 'Member', 
    role, 
    text.slice(0, 4000),
    body.counter_offer ? JSON.stringify(body.counter_offer) : null,
    clientTempId,
    'delivered',
    mediaType,
    mediaUrl,
    mediaMetadata,
    locationData
  ).run();
  const row = await env.DB.prepare('SELECT * FROM chat_messages WHERE id = ?1').bind(id).first();
  return json({ 
    message: {
      ...row,
      counter_offer: row?.counter_offer ? JSON.parse(row.counter_offer) : null,
      media_metadata: row?.media_metadata ? JSON.parse(row.media_metadata) : null,
      location_data: row?.location_data ? JSON.parse(row.location_data) : null
    } 
  }, 201);
}
