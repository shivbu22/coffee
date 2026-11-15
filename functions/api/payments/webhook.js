// POST /api/payments/webhook
// Verifies X-Razorpay-Signature against the RAW body with RAZORPAY_WEBHOOK_SECRET.
// On payment.captured, fulfils into D1 payments + subscriptions when env.DB is
// bound; without a DB binding it acknowledges log-only (previous behaviour).
import { hmacSha256Hex, timingSafeEqual, json } from './_plans.js';
import { fulfilPayment } from './_fulfil.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.RAZORPAY_WEBHOOK_SECRET) return json({ error: 'Webhook is not configured.' }, 500);
  const signature = request.headers.get('x-razorpay-signature') || '';
  const rawBody = await request.text(); // raw body is required for signature check
  const expected = await hmacSha256Hex(env.RAZORPAY_WEBHOOK_SECRET, rawBody);
  if (!timingSafeEqual(expected, signature)) return json({ error: 'Invalid webhook signature.' }, 400);

  let event;
  try { event = JSON.parse(rawBody); } catch { return json({ error: 'Invalid JSON.' }, 400); }

  const type = event?.event || 'unknown';
  let fulfilled = false;
  if (type === 'payment.captured' || type === 'payment.authorized') {
    const entity = event?.payload?.payment?.entity || {};
    try {
      fulfilled = await fulfilPayment(env, {
        orderId: entity.order_id, paymentId: entity.id,
        planId: entity.notes?.planId || null,
        amountPaise: Number.isFinite(entity.amount) ? entity.amount : undefined,
        userId: null, // webhook carries no FindCo user id; verify.js links the user
      });
    } catch (e) { console.warn('[payments] webhook fulfil failed:', e.message); }
  }
  return json({ received: true, event: type, fulfilled });
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  return onRequestPost(context);
}
