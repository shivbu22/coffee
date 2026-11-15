// FindCo server-side auth for Cloudflare Pages Functions + D1.
// - Passwords: PBKDF2-SHA256, 100k iterations, per-user random salt (WebCrypto).
// - Sessions: 32 random bytes, only the SHA-256 hash is stored; the raw token
//   lives in an HttpOnly + Secure + SameSite=Lax cookie for 30 days.
// - Roles are ALWAYS read from the users table. Client input / metadata can
//   never grant admin: signup/OTP clamp role to client|buddy, and requireAdmin
//   re-checks the DB row on every call.
const PBKDF2_ITERATIONS = 100000;
const SESSION_COOKIE = 'findco_session';
const SESSION_DAYS = 30;

const enc = new TextEncoder();
export function toHex(buf) { return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join(''); }
export async function sha256Hex(text) { return toHex(await crypto.subtle.digest('SHA-256', enc.encode(text))); }
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
export async function hashPassword(password, saltHex) {
  const salt = saltHex ? Uint8Array.from(saltHex.match(/.{2}/g).map(h => parseInt(h, 16))) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS }, key, 256);
  return { hash: toHex(bits), salt: toHex(salt) };
}
export async function verifyPassword(password, expectedHash, saltHex) {
  const { hash } = await hashPassword(password, saltHex);
  return timingSafeEqual(hash, expectedHash);
}
export function publicUser(u) {
  if (!u) return null;
  return { id: u.id, email: u.email || '', phone: u.phone || '', role: u.role, full_name: u.full_name || '', city: u.city || 'Bengaluru', avatar_url: u.avatar_url || '', is_aadhaar_verified: Boolean(u.is_aadhaar_verified), created_at: u.created_at };
}
export function sessionCookie(token, request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}
export function clearCookie(request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=0`;
}
export async function createSession(env, userId) {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256Hex(token);
  const expires = new Date(Date.now() + SESSION_DAYS * 86400 * 1000).toISOString().replace('T', ' ').slice(0, 19);
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?1, ?2, ?3)').bind(tokenHash, userId, expires).run();
  return token;
}
export async function destroySession(request, env) {
  const token = readSessionToken(request);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(await sha256Hex(token)).run();
}
export function readSessionToken(request) {
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
export async function getSessionUser(request, env) {
  if (!env.DB) return null;
  const token = readSessionToken(request);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?1 AND s.expires_at > datetime('now')`
  ).bind(tokenHash).first();
  return row || null;
}
// Returns { user } or { response } (401). Handlers: if (auth.response) return auth.response;
export async function requireUser(request, env) {
  const user = await getSessionUser(request, env);
  if (!user) return { response: new Response(JSON.stringify({ error: 'Authentication required.' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  return { user };
}
export async function requireAdmin(request, env) {
  const auth = await requireUser(request, env);
  if (auth.response) return auth;
  if (auth.user.role !== 'admin') {
    return { response: new Response(JSON.stringify({ error: 'Admin access required.' }), { status: 403, headers: { 'Content-Type': 'application/json' } }) };
  }
  return auth;
}
// --- OTP: 6-digit, hashed at rest, 10-min expiry, max 5 verify attempts ---
export async function createOtp(env, identifier) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await sha256Hex(`${identifier}:${code}`);
  await env.DB.prepare('DELETE FROM otp_codes WHERE identifier = ?1').bind(identifier).run();
  await env.DB.prepare(
    `INSERT INTO otp_codes (identifier, code_hash, expires_at) VALUES (?1, ?2, datetime('now','+10 minutes'))`
  ).bind(identifier, codeHash).run();
  return code;
}
export async function verifyOtpCode(env, identifier, code) {
  const row = await env.DB.prepare(
    `SELECT * FROM otp_codes WHERE identifier = ?1 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`
  ).bind(identifier).first();
  if (!row) return { ok: false, error: 'Code expired or not requested. Please request a new code.' };
  if (row.attempts >= 5) return { ok: false, error: 'Too many attempts. Please request a new code.' };
  const candidate = await sha256Hex(`${identifier}:${code}`);
  if (!timingSafeEqual(candidate, row.code_hash)) {
    await env.DB.prepare('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?1').bind(row.id).run();
    return { ok: false, error: 'Invalid verification code.' };
  }
  await env.DB.prepare('DELETE FROM otp_codes WHERE identifier = ?1').bind(identifier).run();
  return { ok: true };
}
// --- Login rate limit: max 10 FAILED attempts per identifier per 15 min ---
export async function isLoginRateLimited(env, identifier) {
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM login_attempts WHERE identifier = ?1 AND success = 0 AND attempted_at > datetime('now','-15 minutes')`
  ).bind(identifier).first();
  return (row?.n || 0) >= 10;
}
export async function recordLoginAttempt(env, identifier, success) {
  await env.DB.prepare('INSERT INTO login_attempts (identifier, success) VALUES (?1, ?2)').bind(identifier, success ? 1 : 0).run();
  if (success) await env.DB.prepare('DELETE FROM login_attempts WHERE identifier = ?1 AND success = 0').bind(identifier).run();
}
// Validation mirrors src/utils/validate.js
export function isValidEmail(v) { return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) && v.length <= 254; }
export function normalizePhoneIN(value) {
  let d = String(value ?? '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}
export function clampRole(role) { return role === 'buddy' ? 'buddy' : 'client'; }
