// POST /api/payments/create-order
// Creates a Razorpay order. Amount/plan are validated server-side.
// Secrets (server-only Cloudflare env): RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
import { priceFor, json } from './_plans.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return json({ error: 'Payments are not configured on the server.' }, 500);
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body.' }, 400); }

  const priced = priceFor(body?.planId, body?.couponCode);
  if (!priced) return json({ error: 'Unknown plan.' }, 400);
  if (priced.free) return json({ free: true, planName: priced.plan.name, amount: 0, currency: 'INR' });

  const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: priced.amountPaise,
      currency: 'INR',
      receipt: `findco_${body.planId}_${Date.now()}`,
      notes: { planId: body.planId },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return json({ error: data?.error?.description || 'Razorpay order creation failed.' }, 502);
  return json({ orderId: data.id, amount: data.amount, currency: data.currency, planName: priced.plan.name });
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  return onRequestPost(context);
}
