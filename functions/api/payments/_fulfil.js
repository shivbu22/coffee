// D1 fulfilment for verified Razorpay payments. No-ops (log-only) when the
// DB binding is absent so payments still work on a static-only deployment.
import { PLANS } from './_plans.js';
export async function fulfilPayment(env, { orderId, paymentId, planId, amountPaise, userId }) {
  if (!env.DB || !orderId) { console.log('[payments] fulfil skipped (no D1 binding)', { orderId, paymentId }); return false; }
  const plan = planId && PLANS[planId] ? planId : null;
  const amount = Number.isFinite(amountPaise) ? amountPaise : (plan ? PLANS[plan].amountPaise : 0);
  await env.DB.prepare(
    `INSERT INTO payments (id, user_id, razorpay_order_id, razorpay_payment_id, plan_id, amount_paise, status)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'paid')
     ON CONFLICT(razorpay_order_id) DO UPDATE SET razorpay_payment_id = excluded.razorpay_payment_id,
       status = 'paid', user_id = COALESCE(excluded.user_id, payments.user_id),
       plan_id = excluded.plan_id, updated_at = datetime('now')`
  ).bind(crypto.randomUUID(), userId || null, orderId, paymentId || null, plan || 'unknown', amount).run();
  const row = await env.DB.prepare('SELECT user_id, plan_id FROM payments WHERE razorpay_order_id = ?1').bind(orderId).first();
  const uid = userId || row?.user_id;
  const pid = plan || (row?.plan_id !== 'unknown' ? row?.plan_id : null);
  if (uid && pid) {
    await env.DB.prepare("UPDATE subscriptions SET status = 'cancelled', updated_at = datetime('now') WHERE user_id = ?1 AND status = 'active'").bind(uid).run();
    await env.DB.prepare(
      `INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, razorpay_payment_id)
       VALUES (?1, ?2, ?3, 'active', datetime('now'), datetime('now','+30 days'), ?4)`
    ).bind(crypto.randomUUID(), uid, pid, paymentId || null).run();
  }
  return true;
}
