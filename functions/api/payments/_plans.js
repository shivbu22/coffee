// Shared server-side plan map for Cloudflare Pages Functions.
// Amounts are decided HERE, never trusted from the client.
// Keep in sync with SUBSCRIPTION_PLANS in src/data/mockData.js (price in INR).
export const PLANS = {
  basic: { name: '1 Month', amountPaise: 9900 },
  premium: { name: '6 Months', amountPaise: 29900 },
  star_member: { name: '1 Year', amountPaise: 49900 },
  star: { name: '1 Year', amountPaise: 49900 },
};

export const COUPONS = {
  BUDDY50: 50,
  BUDDYSEARCH50: 50,
  FINDCO50: 50,
  FINDCO100: 100,
  FREEPASS: 100,
};

export function priceFor(planId, couponCode) {
  const plan = PLANS[planId];
  if (!plan) return null;
  const pct = couponCode ? COUPONS[String(couponCode).trim().toUpperCase()] || 0 : 0;
  const amountPaise = Math.max(0, Math.round(plan.amountPaise * (1 - pct / 100)));
  return { plan, discountPercent: pct, amountPaise, currency: 'INR', free: amountPaise === 0 };
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
