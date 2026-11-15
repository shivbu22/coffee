// GET /api/auth/google/start — begins Google OAuth2 code flow.
// Env-gated: needs GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET; returns 501 with a
// clear message when unconfigured. CSRF: random state stored in a short-lived
// HttpOnly cookie and checked in the callback.
import { error } from '../../../_lib/http.js';
export async function onRequestGet({ request, env }) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return error('Google sign-in is not configured on this deployment (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing).', 501);
  }
  const state = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
  const origin = new URL(request.url).origin;
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${origin}/api/auth/google/callback`,
    response_type: 'code', scope: 'openid email profile', state,
    access_type: 'online', prompt: 'select_account',
  });
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return new Response(null, {
    status: 302,
    headers: { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params}`, 'Set-Cookie': `findco_oauth_state=${state}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=600` },
  });
}
