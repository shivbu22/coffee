// POST /api/payments/verify
// Verifies razorpay_signature = HMAC-SHA256(order_id + "|" + payment_id,
// RAZORPAY_KEY_SECRET). On success, fulfils into D1 payments + subscriptions
// when the DB binding exists (the webhook remains the authoritative backup).
import { hmacSha256Hex, timingSafeEqual, json, PLANS } from './_plans.js';
import { fulfilPayment } from './_fulfil.js';
import { getSessionUser } from '../../_lib/auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.RAZORPAY_KEY_SECRET) return json({ error: 'Payments are not configured on the server.' }, 500);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body.' }, 400); }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return json({ error: 'Missing payment fields.' }, 400);
  }
  const expected = await hmacSha256Hex(env.RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
  const verified = timingSafeEqual(expected, String(razorpay_signature));
  if (!verified) return json({ verified: false, error: 'Invalid signature.' }, 400);
  let fulfilled = false;
  try {
    const user = env.DB ? await getSessionUser(request, env) : null;
    fulfilled = await fulfilPayment(env, {
      orderId: razorpay_order_id, paymentId: razorpay_payment_id,
      planId: planId && PLANS[planId] ? planId : null,
      amountPaise: planId && PLANS[planId] ? PLANS[planId].amountPaise : undefined,
      userId: user?.id || null,
    });
  } catch (e) { console.warn('[payments] fulfil after verify failed:', e.message); }
  return json({ verified: true, fulfilled });
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  return onRequestPost(context);
}
