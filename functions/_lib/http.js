// Shared HTTP helpers for FindCo Pages Functions.
export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}
export function error(message, status = 400, extraHeaders = {}) {
  return json({ error: message }, status, extraHeaders);
}
// Same-origin guard for state-changing requests: browsers send Origin on
// POST/PUT; reject cross-site callers. Requests without an Origin header
// (curl, webhooks handled elsewhere) are allowed through.
export function assertSameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  const host = request.headers.get('Host');
  try {
    const o = new URL(origin);
    if (host && o.host !== host) return error('Cross-origin request rejected.', 403);
  } catch { return error('Invalid Origin header.', 403); }
  return null;
}
export async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}
export function requireDb(env) {
  if (!env.DB) return error('Database is not configured on the server (D1 binding DB missing).', 500);
  return null;
}
export function newId() {
  return crypto.randomUUID();
}
