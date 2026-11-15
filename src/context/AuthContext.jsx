import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, SupabaseAuthService, formatSupabaseUserProfile, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * AuthContext — Supabase session is the single source of truth.
 * App.jsx still owns its legacy local session state for now; this provider
 * mirrors the Supabase session so new code can use useAuth() and
 * <ProtectedRoute> without depending on localStorage.
 */
const AuthContext = createContext({ user: null, session: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await SupabaseAuthService.getSession().catch(() => null);
      if (cancelled) return;
      setSession(s);
      setUser(s?.user ? formatSupabaseUserProfile(s.user) : null);
      setLoading(false);
    })();

    const unsubscribe = SupabaseAuthService.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ? formatSupabaseUserProfile(s.user) : null);
      setLoading(false);
    });
    return () => { cancelled = true; if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  const value = {
    user,
    session,
    loading,
    isConfigured: isSupabaseConfigured,
    signOut: async () => { await SupabaseAuthService.signOut(); setUser(null); setSession(null); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * ProtectedRoute — render children only with a Supabase session.
 * While App.jsx keeps its own isLoggedIn gate, this guard is used for the
 * admin gate at minimum; pass `fallback` (e.g. an auth prompt) for the rest.
 * If Supabase is not configured, it falls back to `allowWhenUnconfigured`
 * so local/demo runs are not locked out — set it false in production.
 */
export function ProtectedRoute({ children, fallback = null, allowWhenUnconfigured = true, isAuthenticated = null }) {
  const { user, loading, isConfigured } = useAuth();
  // Explicit override (e.g. App's admin passkey session) wins — used for the
  // admin gate so operators are not locked out by a missing consumer session.
  if (isAuthenticated !== null) return isAuthenticated ? children : fallback;
  if (!isConfigured) return allowWhenUnconfigured ? children : fallback;
  if (loading) return null;
  if (!user) return fallback;
  return children;
}

export { supabase };
export default AuthContext;
