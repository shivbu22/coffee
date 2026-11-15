// POST /api/payments/webhook
// Verifies X-Razorpay-Signature against the RAW body with RAZORPAY_WEBHOOK_SECRET.
// Configure this URL in Razorpay Dashboard -> Webhooks. Fulfilment (writing to
// Supabase payments/subscriptions with SUPABASE_SERVICE_ROLE_KEY) belongs here
// once the service-role key is set in Cloudflare env — never expose it client-side.
import { hmacSha256Hex, timingSafeEqual, json } from './_plans.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.RAZORPAY_WEBHOOK_SECRET) return json({ error: 'Webhook is not configured.' }, 500);
  const signature = request.headers.get('x-razorpay-signature') || '';
  const rawBody = await request.text(); // raw body is required for signature check
  const expected = await hmacSha256Hex(env.RAZORPAY_WEBHOOK_SECRET, rawBody);
  if (!timingSafeEqual(expected, signature)) return json({ error: 'Invalid webhook signature.' }, 400);

  let event;
  try { event = JSON.parse(rawBody); } catch { return json({ error: 'Invalid JSON.' }, 400); }

  // Acknowledge known events. TODO (server-only): on payment.captured /
  // subscription.activated, upsert into public.payments / public.subscriptions
  // using SUPABASE_SERVICE_ROLE_KEY via the Supabase REST API.
  const type = event?.event || 'unknown';
  return json({ received: true, event: type });
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  return onRequestPost(context);
}
