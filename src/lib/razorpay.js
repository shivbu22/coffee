// Real Razorpay checkout (client side only).
// The key_id here is the PUBLIC Razorpay Key ID (VITE_RAZORPAY_KEY_ID).
// The Key Secret / webhook secret are NEVER in client code — they live only
// in Cloudflare Pages Function env vars (see functions/api/payments/*).

export function isRazorpayConfigured() {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
  return Boolean(key && !key.includes('placeholder'));
}

let scriptPromise = null;
export function loadRazorpayScript() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => { scriptPromise = null; reject(new Error('Failed to load Razorpay checkout.')); };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Create an order on our server (amount is decided server-side from planId),
 * open Razorpay Checkout, then verify the payment signature on our server.
 * @param {{planId:string, couponCode?:string, name?:string, email?:string, contact?:string, accessToken?:string}} opts
 * @returns {Promise<{paymentId:string, orderId:string}>}
 */
export async function payWithRazorpay({ planId, couponCode = '', name = '', email = '', contact = '', accessToken = '' } = {}) {
  if (!isRazorpayConfigured()) throw new Error('Razorpay is not configured (VITE_RAZORPAY_KEY_ID missing).');
  if (!planId) throw new Error('planId is required.');

  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const orderRes = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers,
    body: JSON.stringify({ planId, couponCode: couponCode || undefined }),
  });
  const orderData = await orderRes.json().catch(() => ({}));
  if (!orderRes.ok || !orderData.orderId) {
    throw new Error(orderData.error || 'Could not create payment order.');
  }
  // 100%-off coupon: server returns free:true and no order is needed.
  if (orderData.free) return { paymentId: null, orderId: null, free: true };

  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: orderData.orderId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'FindCo',
      description: orderData.planName || 'FindCo membership',
      prefill: { name, email, contact },
      theme: { color: '#e11d48' },
      modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
      handler: async (response) => {
        try {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
            }),
          });
          const verifyData = await verifyRes.json().catch(() => ({}));
          if (!verifyRes.ok || !verifyData.verified) throw new Error(verifyData.error || 'Payment verification failed.');
          resolve({ paymentId: response.razorpay_payment_id, orderId: response.razorpay_order_id });
        } catch (err) {
          reject(err);
        }
      },
    });
    rzp.on('payment.failed', (resp) => reject(new Error(resp?.error?.description || 'Payment failed.')));
    rzp.open();
  });
}
