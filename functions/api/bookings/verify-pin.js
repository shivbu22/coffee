// POST /api/bookings/verify-pin — participant only; identical error shape for
// wrong PIN vs non-existent booking so outsiders cannot probe either.
import { json, error, assertSameOrigin, readJson, requireDb } from '../../_lib/http.js';
import { requireUser, timingSafeEqual } from '../../_lib/auth.js';
export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  const body = await readJson(request); if (!body) return error('Invalid JSON body.');
  const bookingId = body.bookingId || body.booking_id || body.id;
  const pin = String(body.pin || body.handshake_pin || '');
  const row = bookingId ? await env.DB.prepare('SELECT * FROM bookings WHERE id = ?1').bind(bookingId).first() : null;
  if (!row || (row.client_id !== auth.user.id && row.buddy_id !== auth.user.id && auth.user.role !== 'admin')) {
    return error('Booking not found or PIN incorrect.', 404);
  }
  if (!timingSafeEqual(String(row.handshake_pin), pin)) return error('Booking not found or PIN incorrect.', 404);
  await env.DB.prepare("UPDATE bookings SET escrow_status = 'RELEASED', pin_verified = 1, completed_at = datetime('now') WHERE id = ?1").bind(row.id).run();
  const updated = await env.DB.prepare('SELECT * FROM bookings WHERE id = ?1').bind(row.id).first();
  return json({ booking: { ...updated, pin_verified: true }, verified: true });
}
