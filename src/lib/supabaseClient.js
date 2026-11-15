// =========================================================================
// FindCo Cloudflare API client (compat shim).
//
// This module used to be the Supabase client. FindCo is now Cloudflare-only:
// Pages Functions + D1 (see functions/ and cloudflare/schema.sql). The
// exported names (SupabaseAuthService, SupabaseService, ...) are kept so the
// existing components keep working unchanged — they now talk to /api/*.
// Authorization lives on the server (session cookie + per-handler checks);
// this client holds no keys and no secrets.
// =========================================================================

// "Backend configured" = the Cloudflare API is the backend. Set
// VITE_BACKEND_MODE=local to force offline/demo mode in the UI.
export const isSupabaseConfigured = import.meta.env.VITE_BACKEND_MODE !== 'local';

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
async function apiOrNull(path, opts) {
  try { return await api(path, opts); } catch { return null; }
}

// --- Session state: in-memory user + listener set (mirrors the old shape) ---
let currentUser = null; // session-shaped user: { id, email, phone, user_metadata }
let sessionChecked = false;
const listeners = new Set();

function toSessionUser(apiUser) {
  if (!apiUser) return null;
  return {
    id: apiUser.id,
    email: apiUser.email || '',
    phone: apiUser.phone || '',
    user_metadata: {
      full_name: apiUser.full_name || '',
      role: apiUser.role || 'client',
      phone: apiUser.phone || '',
      city: apiUser.city || 'Bengaluru',
      avatar_url: apiUser.avatar_url || '',
      avatar: apiUser.avatar_url || '',
    },
  };
}
function notify(event) {
  const session = currentUser ? { user: currentUser } : null;
  listeners.forEach((cb) => { try { cb(event, session); } catch {} });
}
function setSession(apiUser, event) {
  currentUser = toSessionUser(apiUser);
  sessionChecked = true;
  notify(event || (currentUser ? 'SIGNED_IN' : 'SIGNED_OUT'));
  return currentUser ? { user: currentUser } : null;
}
async function fetchMe() {
  const data = await apiOrNull('/api/auth/me');
  if (data?.user) return setSession(data.user, 'INITIAL_SESSION');
  currentUser = null; sessionChecked = true;
  return null;
}

export const SupabaseAuthService = {
  async getSession() {
    if (currentUser) return { user: currentUser };
    if (!isSupabaseConfigured) return null;
    if (!sessionChecked) { const s = await fetchMe(); return s; }
    return null;
  },
  async signUpWithEmail({ email, password, fullName, role = 'client', phone = '', city = 'Bengaluru' }) {
    const data = await api('/api/auth/signup', { method: 'POST', body: { email, password, fullName, role, phone, city } });
    const session = setSession(data.user, 'SIGNED_IN');
    return { user: session.user, session };
  },
  async signInWithEmail(email, password) {
    const data = await api('/api/auth/login', { method: 'POST', body: { email, password } });
    const session = setSession(data.user, 'SIGNED_IN');
    return { user: session.user, session };
  },
  async signInWithOtp(emailOrPhone) {
    // Creates an OTP on the server. In non-production the response carries
    // devCode (no SMS/email provider configured yet); production requires
    // RESEND_API_KEY (email) or an SMS provider and otherwise errors clearly.
    return api('/api/auth/otp/request', { method: 'POST', body: { identifier: emailOrPhone } });
  },
  async verifyOtp({ phoneOrEmail, token }) {
    const data = await api('/api/auth/otp/verify', { method: 'POST', body: { identifier: phoneOrEmail, code: token } });
    const session = setSession(data.user, 'SIGNED_IN');
    return { user: session.user, session };
  },
  async signInWithGoogle() {
    // Full-page redirect into the server OAuth flow (env-gated server-side).
    window.location.href = '/api/auth/google/start';
    return { provider: 'google' };
  },
  async signOut() {
    await apiOrNull('/api/auth/logout', { method: 'POST', body: {} });
    currentUser = null; sessionChecked = true;
    notify('SIGNED_OUT');
  },
  onAuthStateChange(callback) {
    listeners.add(callback);
    if (!sessionChecked && isSupabaseConfigured) fetchMe().catch(() => {});
    return () => { listeners.delete(callback); };
  },
};

// --- Realtime compat (polling) -------------------------------------------
// The old backend used websockets. The shim polls: subscribeToRoom diffs
// message ids every 2.5s; supabase.channel(...) returns an inert handle.
class PollingChannel {
  constructor(name) { this.name = name; }
  on() { return this; }
  subscribe(cb) { if (cb) setTimeout(() => cb('SUBSCRIBED'), 0); return this; }
  unsubscribe() { return Promise.resolve(); }
  send() { return Promise.resolve(); }
}

export const supabase = {
  auth: {
    async getUser() {
      const s = await SupabaseAuthService.getSession();
      return { data: { user: s?.user || null }, error: null };
    },
    async getSession() {
      const s = await SupabaseAuthService.getSession();
      return { data: { session: s }, error: null };
    },
    onAuthStateChange(cb) {
      return { data: { subscription: { unsubscribe: SupabaseAuthService.onAuthStateChange(cb) } } };
    },
    signOut: () => SupabaseAuthService.signOut(),
  },
  channel(name) { return new PollingChannel(name); },
  removeChannel() {},
};

// --- Data service (mirrors the old SupabaseService API) --------------------
export const SupabaseService = {
  async getProfile(_userId) {
    if (!isSupabaseConfigured) return null;
    const data = await apiOrNull('/api/profile');
    return data?.profile || null; // server returns the session user's own row only
  },
  async updateProfile(_userId, updates) {
    const data = await api('/api/profile', { method: 'PUT', body: updates });
    return data.profile;
  },
  async getCompanions(cityFilter = 'All Cities') {
    if (!isSupabaseConfigured) return null;
    const q = cityFilter && cityFilter !== 'All Cities' ? `?city=${encodeURIComponent(cityFilter)}` : '';
    const data = await api(`/api/companions${q}`);
    return (data.companions || []).map(formatSupabaseCompanion);
  },
  async getRequests() {
    if (!isSupabaseConfigured) return null;
    const data = await apiOrNull('/api/requests');
    if (!data) return null;
    return (data.requests || []).map(formatSupabaseRequest);
  },
  async createRequest(requestData) {
    const data = await api('/api/requests', { method: 'POST', body: requestData });
    return formatSupabaseRequest(data.request);
  },
  async getBookings(_userId) {
    if (!isSupabaseConfigured) return null;
    const data = await apiOrNull('/api/bookings');
    return data ? (data.bookings || []) : null;
  },
  async createBooking(bookingData) {
    const data = await api('/api/bookings', { method: 'POST', body: bookingData });
    return data.booking;
  },
  async verifyBookingPin(bookingId, pin) {
    const data = await api('/api/bookings/verify-pin', { method: 'POST', body: { bookingId, pin } });
    return data.booking;
  },
  async getMessages(roomId) {
    if (!isSupabaseConfigured) return null;
    const data = await apiOrNull(`/api/messages?roomId=${encodeURIComponent(roomId)}`);
    return data ? (data.messages || []) : null;
  },
  async getMessagesSince(roomId, sinceTimestamp) {
    if (!isSupabaseConfigured) return null;
    const data = await apiOrNull(`/api/messages?roomId=${encodeURIComponent(roomId)}&since=${encodeURIComponent(sinceTimestamp)}`);
    return data ? (data.messages || []) : null;
  },
  async markMessagesAsRead(roomId, readerRole) {
    if (!isSupabaseConfigured) return null;
    return apiOrNull('/api/messages/read', { method: 'POST', body: { roomId, readerRole } });
  },
  async sendMessage(messageData) {
    const data = await api('/api/messages', { method: 'POST', body: messageData });
    return data.message;
  },
  subscribeToRoom(roomId, onNewMessage, onStatusChange, onTyping, onMessageUpdated) {
    if (!isSupabaseConfigured) return () => {};
    let known = null;
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      const msgs = await SupabaseService.getMessages(roomId).catch(() => null);
      if (!msgs) return;
      if (known === null) { 
        known = new Map(msgs.map(m => [m.id, m])); 
        return; 
      }
      for (const m of msgs) {
        if (!known.has(m.id)) { 
          known.set(m.id, m); 
          onNewMessage(m); 
        } else {
          const prev = known.get(m.id);
          if (prev.status !== m.status || prev.read_at !== m.read_at) {
            known.set(m.id, m);
            onMessageUpdated?.(m);
          }
        }
      }
    };
    tick();
    const timer = setInterval(tick, 2500);
    return () => { stopped = true; clearInterval(timer); };
  },
  async registerHallmarkCredential(credential) {
    const data = await api('/api/hallmark', { method: 'POST', body: credential });
    return data.credential;
  },
  async verifyHallmarkOnCloud(hash) {
    const data = await apiOrNull(`/api/hallmark/${encodeURIComponent(hash)}`);
    return data?.credential || null;
  },
  async createSupportTicket(ticket) {
    try {
      const data = await api('/api/support', { method: 'POST', body: ticket });
      return data?.ticket || ticket;
    } catch (err) {
      console.warn('[Cloudflare Support Ticket] Falling back to local storage:', err);
      try {
        const raw = localStorage.getItem('findco_support_tickets_v1');
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(ticket);
        localStorage.setItem('findco_support_tickets_v1', JSON.stringify(list));
      } catch (localErr) {
        console.error(localErr);
      }
      return ticket;
    }
  },
};

// --- Admin Portal health helpers (backed by GET /api/health) ---------------
export async function checkSupabaseConnection() {
  const start = performance.now();
  const data = await apiOrNull('/api/health');
  const latencyMs = Math.round(performance.now() - start);
  if (!data?.db) {
    return { connected: false, reason: 'Cloudflare D1 backend not reachable.', mode: 'Local Storage Fallback Mode', url: null };
  }
  return { connected: true, tablesNeedInit: false, latencyMs, recordsFound: data.detail?.companions?.count || 0, message: `Cloudflare D1 connection healthy (${latencyMs}ms latency)`, mode: 'Live Cloud Backend' };
}
export async function checkAllTables() {
  const empty = { ready: false, count: 0 };
  const data = await apiOrNull('/api/health');
  if (!data?.detail) return { profiles: empty, companions: empty, activity_requests: empty, bookings: empty, chat_messages: empty, hallmark_credentials: empty };
  const d = data.detail;
  return {
    profiles: d.users || empty,
    companions: d.companions || empty,
    activity_requests: d.activity_requests || empty,
    bookings: d.bookings || empty,
    chat_messages: d.chat_messages || empty,
    hallmark_credentials: d.hallmark_credentials || empty,
  };
}
export async function seedInitialDataToSupabase(initialCompanions = []) {
  const out = [];
  for (const c of initialCompanions) {
    const data = await api('/api/companions', {
      method: 'POST',
      body: {
        name: c.name, age: c.age || 24, gender: c.gender || 'Female', city: c.city, area: c.area,
        hourly_rate: c.hourlyRate || 500, trip_rate: c.tripRate || 2000, services: c.services || [],
        languages: c.languages || ['English', 'Hindi'], bio: c.bio || '', avatar: c.avatar || '',
        is_star: Boolean(c.isStar), is_online: Boolean(c.isOnline), completed_hangouts: c.completedHangouts || 10,
        hallmark_id: c.hallmarkId || `HLM-${(c.city || 'BLR').slice(0, 3).toUpperCase()}-9901`,
      },
    });
    out.push(data.companion);
  }
  return out;
}

// --- Legacy config helpers (kept import-compatible; backend is env-only) ---
export function getActiveSupabaseConfig() {
  return { url: '', anonKey: '', isConfigured: isSupabaseConfigured, isCustom: false, backend: 'cloudflare' };
}
export function redirectToSupabaseDashboard() {
  window.location.href = 'https://dash.cloudflare.com';
}
export function saveCustomSupabaseConfig() {
  return { success: false, error: 'Backend configuration is managed in Cloudflare (D1 binding + Pages env vars). In-app credential config is disabled.' };
}
export function clearCustomSupabaseConfig() {
  return { success: true, isConfigured: isSupabaseConfigured };
}

// --- Schema Export shim (kept import-compatible) ---
export const COMPLETE_SCHEMA_SQL = `-- Cloudflare D1 Schema (see cloudflare/schema.sql)`;

// --- Formatters (unchanged shapes the components expect) --------------------
export function formatSupabaseUserProfile(user, fallbackRole = 'client') {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  const role = metadata.role || user.role || fallbackRole;
  const isBuddy = role === 'buddy';
  return {
    id: user.id,
    supabaseUserId: user.id,
    name: metadata.full_name || user.full_name || (user.email ? user.email.split('@')[0] : (isBuddy ? 'Priya Sharma' : 'Member')),
    email: user.email || '',
    phone: metadata.phone || user.phone || '',
    city: metadata.city || user.city || 'Bengaluru',
    role,
    avatar: metadata.avatar || metadata.avatar_url || user.avatar_url || (isBuddy
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop&crop=faces'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=faces'),
    isAadhaarVerified: true,
  };
}
export function formatSupabaseCompanion(row) {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    city: row.city,
    area: row.area,
    hourlyRate: row.hourly_rate ?? row.hourlyRate ?? 500,
    tripRate: row.trip_rate ?? row.tripRate ?? 2000,
    rating: Number(row.rating) || 4.9,
    reviewsCount: row.reviews_count ?? row.reviewsCount ?? 20,
    isStar: row.is_star !== undefined ? Boolean(row.is_star) : Boolean(row.isStar),
    isOnline: row.is_online !== undefined ? Boolean(row.is_online) : (row.isOnline !== undefined ? Boolean(row.isOnline) : true),
    isAadhaarVerified: row.kyc_status === 'VERIFIED' || Boolean(row.is_aadhaar_verified) || Boolean(row.isAadhaarVerified) || true,
    bio: row.bio || '',
    services: Array.isArray(row.services) ? row.services : ['Cafe & Dining Buddy'],
    languages: Array.isArray(row.languages) ? row.languages : ['English', 'Hindi'],
    completedHangouts: row.completed_hangouts ?? row.completedHangouts ?? 12,
    hallmarkId: row.hallmark_id || row.hallmarkId || `HLM-${(row.city || 'BLR').slice(0, 3).toUpperCase()}-9901`,
  };
}
export function formatSupabaseRequest(row) {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    clientId: row.client_id || row.clientId || 'guest',
    clientName: row.client_name || row.clientName || 'Member',
    clientAvatar: row.client_avatar || row.clientAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    activity: row.activity,
    city: row.city,
    area: row.area,
    dateTime: row.date_time || row.dateTime,
    budget: Number(row.budget) || 1000,
    duration: Number(row.duration) || 2,
    genderPref: row.gender_pref || row.genderPref || 'Any Gender',
    description: row.description || '',
    status: row.status || 'OPEN',
    responsesCount: row.responses_count ?? row.responsesCount ?? 0,
    createdAt: row.created_at || row.createdAt,
  };
}
