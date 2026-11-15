// GET/POST /api/bookings (auth, own only). client_id is ALWAYS the session
// user on create — a client cannot book "as" someone else.
import { json, error, assertSameOrigin, readJson, requireDb, newId } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';

function generateSecurePin() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(1000 + (buf[0] % 9000));
}

export async function onRequestGet({ request, env }) {
  const bad = requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  const { results } = await env.DB.prepare(
    'SELECT * FROM bookings WHERE client_id = ?1 OR buddy_id = ?1 ORDER BY created_at DESC'
  ).bind(auth.user.id).all();
  return json({ 
    bookings: (results || []).map(b => ({ 
      ...b, 
      // SEC-01 Fix: Never leak the client's handshake PIN to the companion
      handshake_pin: b.client_id === auth.user.id ? b.handshake_pin : undefined,
      pin_verified: Boolean(b.pin_verified) 
    })) 
  });
}
export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  const body = await readJson(request); if (!body) return error('Invalid JSON body.');
  const pin = String(body.handshake_pin || body.handshakePin || generateSecurePin());
  if (!/^\d{4}$/.test(pin)) return error('handshake_pin must be 4 digits.');
  const id = newId();
  await env.DB.prepare(
    `INSERT INTO bookings (id, client_id, client_name, buddy_id, buddy_name, activity, date, time, hours, hourly_rate, total_amount, escrow_status, handshake_pin)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)`
  ).bind(id, auth.user.id, String(body.client_name || body.clientName || auth.user.full_name || 'Member').slice(0, 80),
    body.buddy_id || body.buddyId || null, String(body.buddy_name || body.buddyName || 'Companion').slice(0, 80),
    String(body.activity || 'Hangout').slice(0, 120), String(body.date || '').slice(0, 40), String(body.time || '').slice(0, 40),
    Number(body.hours) || 2, Number(body.hourly_rate ?? body.hourlyRate) || 500, Number(body.total_amount ?? body.totalAmount) || 1000,
    'LOCKED', pin).run();
  const row = await env.DB.prepare('SELECT * FROM bookings WHERE id = ?1').bind(id).first();
  return json({ 
    booking: { 
      ...row, 
      handshake_pin: row.client_id === auth.user.id ? row.handshake_pin : undefined,
      pin_verified: Boolean(row.pin_verified) 
    } 
  }, 201);
}
