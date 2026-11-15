// POST /api/messages/read — Mark messages in a room as read
import { json, error, assertSameOrigin, readJson, requireDb } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env);
  if (bad) return bad;

  const auth = await requireUser(request, env);
  if (auth.response) return auth.response;

  const body = await readJson(request);
  if (!body) return error('Invalid JSON body.');

  const roomId = body.roomId || body.room_id;
  if (!roomId) return error('roomId is required.');

  const now = new Date().toISOString();

  // Mark all messages in this room not sent by this user as read
  await env.DB.prepare(
    `UPDATE chat_messages 
     SET status = 'read', read_at = ?1 
     WHERE room_id = ?2 AND (sender_id != ?3 OR sender_id IS NULL) AND status != 'read'`
  ).bind(now, roomId, auth.user.id).run();

  return json({ success: true, read_at: now });
}
