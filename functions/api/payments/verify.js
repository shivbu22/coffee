// POST /api/payments/verify
// Verifies razorpay_signature = HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)
// NOTE: persisting to Supabase payments/subscriptions should be done with the
// service-role key from a trusted server context. This function only verifies
// the signature; the webhook is the authoritative record for fulfilment.
import { hmacSha256Hex, timingSafeEqual, json } from './_plans.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.RAZORPAY_KEY_SECRET) return json({ error: 'Payments are not configured on the server.' }, 500);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body.' }, 400); }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return json({ error: 'Missing payment fields.' }, 400);
  }
  const expected = await hmacSha256Hex(env.RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
  const verified = timingSafeEqual(expected, String(razorpay_signature));
  return verified ? json({ verified: true }) : json({ verified: false, error: 'Invalid signature.' }, 400);
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  return onRequestPost(context);
}
