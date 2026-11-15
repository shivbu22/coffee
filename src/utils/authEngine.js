/**
 * @deprecated LEGACY DEMO-ONLY — DO NOT USE FOR PRODUCTION AUTH.
 *
 * Previously this file implemented insecure local auth: SHA-256 with a fixed
 * salt, seeded accounts with a known default password, universal OTP test
 * codes, and credentials stored in localStorage. All of that has been REMOVED.
 *
 * Production auth is Supabase Auth only — see SupabaseAuthService in
 * src/lib/supabaseClient.js (email/password PKCE, magic link, phone OTP,
 * Google OAuth) and src/context/AuthContext.jsx.
 *
 * This shim is kept only so existing imports (AuthModal) do not break.
 * Every method delegates to Supabase when configured and otherwise throws a
 * clear error instead of silently creating a local account.
 */
import { SupabaseAuthService, isSupabaseConfigured, formatSupabaseUserProfile } from '../lib/supabaseClient';

function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error('Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY — local/demo auth has been removed for security.');
  }
}

export const AuthEngine = {
  async register({ email, password, fullName, role = 'client', city = 'Bengaluru', phone = '' }) {
    requireSupabase();
    const data = await SupabaseAuthService.signUpWithEmail({ email, password, fullName, role, phone, city });
    return { user: data?.user ? formatSupabaseUserProfile(data.user, role) : null, session: data?.session || null };
  },
  async login({ email, password }) {
    requireSupabase();
    const data = await SupabaseAuthService.signInWithEmail(email, password);
    return { user: data?.user ? formatSupabaseUserProfile(data.user) : null, session: data?.session || null };
  },
  async requestPhoneOtp(phone) {
    requireSupabase();
    await SupabaseAuthService.signInWithOtp(phone);
    return { success: true };
  },
  async verifyPhoneOtp(phone, code) {
    requireSupabase();
    const data = await SupabaseAuthService.verifyOtp({ phoneOrEmail: phone, token: code, type: 'sms' });
    return { user: data?.user ? formatSupabaseUserProfile(data.user) : null, session: data?.session || null };
  },
  listAccounts() { return []; },
};

// Kept for backwards-compat imports only; no local hashing is performed anymore.
export function generateSalt() { throw new Error('Legacy local auth removed. Use Supabase Auth.'); }
export async function hashPassword() { throw new Error('Legacy local auth removed. Use Supabase Auth.'); }
export async function verifyPassword() { throw new Error('Legacy local auth removed. Use Supabase Auth.'); }
