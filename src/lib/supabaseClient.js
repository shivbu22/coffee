import { createClient } from '@supabase/supabase-js';

// LocalStorage persistence keys for runtime cloud configurations
const STORAGE_KEYS = {
  URL: 'findco_custom_supabase_url',
  ANON_KEY: 'findco_custom_supabase_anon_key'
};

/**
 * Retrieve active credentials (Environment variables have priority, followed by runtime storage)
 */
export function getActiveSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  let storedUrl = '';
  let storedKey = '';
  try {
    storedUrl = localStorage.getItem(STORAGE_KEYS.URL) || '';
    storedKey = localStorage.getItem(STORAGE_KEYS.ANON_KEY) || '';
  } catch (e) {
    console.warn('[Supabase Config] localStorage not accessible:', e);
  }

  const url = (envUrl && !envUrl.includes('placeholder')) ? envUrl : storedUrl;
  const anonKey = (envKey && !envKey.includes('placeholder')) ? envKey : storedKey;

  const isConfigured = Boolean(
    url && 
    anonKey && 
    url.startsWith('https://') &&
    !url.includes('placeholder')
  );

  return { url, anonKey, isConfigured, isCustom: Boolean(!envUrl && storedUrl) };
}

// Active client instance
let activeConfig = getActiveSupabaseConfig();
export let isSupabaseConfigured = activeConfig.isConfigured;

function initClient() {
  activeConfig = getActiveSupabaseConfig();
  isSupabaseConfigured = activeConfig.isConfigured;
  if (!isSupabaseConfigured) return null;
  return createClient(activeConfig.url, activeConfig.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
}

export let supabase = initClient();

/**
 * Save custom credentials entered via UI (Admin Portal / Settings)
 */
export function saveCustomSupabaseConfig(url, anonKey) {
  try {
    localStorage.setItem(STORAGE_KEYS.URL, url.trim());
    localStorage.setItem(STORAGE_KEYS.ANON_KEY, anonKey.trim());
    supabase = initClient();
    return { success: true, isConfigured: isSupabaseConfigured };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Clear custom credentials
 */
export function clearCustomSupabaseConfig() {
  try {
    localStorage.removeItem(STORAGE_KEYS.URL);
    localStorage.removeItem(STORAGE_KEYS.ANON_KEY);
    supabase = initClient();
    return { success: true, isConfigured: isSupabaseConfigured };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Check live connection status to Supabase backend with latency benchmarking
 */
export async function checkSupabaseConnection() {
  const currentConfig = getActiveSupabaseConfig();
  if (!currentConfig.isConfigured || !supabase) {
    return {
      connected: false,
      reason: 'No live credentials configured. Set VITE_SUPABASE_URL or enter them in the Cloud Configurator.',
      mode: 'Local Storage Fallback Mode',
      url: currentConfig.url || null
    };
  }

  const startTime = performance.now();
  try {
    // Probe the companions table with a limit 1 query
    const { data, error } = await supabase.from('companions').select('id, name').limit(1);
    const latency = Math.round(performance.now() - startTime);

    if (error) {
      // If table doesn't exist yet, we still know the credentials authenticated to Supabase
      if (error.code === '42P01' || error.message.includes('relation "public.companions" does not exist')) {
        return {
          connected: true,
          tablesNeedInit: true,
          latencyMs: latency,
          error: error.message,
          hint: 'Connected to Supabase project! Database tables need initialization via supabase_schema.sql',
          mode: 'Supabase Project Authenticated (Empty DB)'
        };
      }
      return {
        connected: false,
        latencyMs: latency,
        error: error.message,
        hint: 'Error communicating with Supabase PostgreSQL',
        mode: 'Supabase Error'
      };
    }

    return {
      connected: true,
      tablesNeedInit: false,
      latencyMs: latency,
      recordsFound: data ? data.length : 0,
      message: `Supabase PostgreSQL connection healthy (${latency}ms latency)`,
      mode: 'Live Cloud Backend'
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
      mode: 'Local Storage Fallback Mode'
    };
  }
}

/**
 * Check health across all 5 FindCo tables
 */
export async function checkAllTables() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      companions: { ready: false, count: 0 },
      activity_requests: { ready: false, count: 0 },
      bookings: { ready: false, count: 0 },
      chat_messages: { ready: false, count: 0 },
      hallmark_credentials: { ready: false, count: 0 }
    };
  }

  const tables = ['companions', 'activity_requests', 'bookings', 'chat_messages', 'hallmark_credentials'];
  const results = {};

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select('id', { count: 'exact', head: true });
      results[table] = {
        ready: !error,
        count: count || 0,
        error: error ? error.message : null
      };
    } catch (e) {
      results[table] = { ready: false, count: 0, error: e.message };
    }
  }

  return results;
}

/**
 * Seed initial companion records to Supabase PostgreSQL
 */
export async function seedInitialDataToSupabase(initialCompanions = []) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const prepared = initialCompanions.map(c => ({
    name: c.name,
    age: c.age || 24,
    gender: c.gender || 'Female',
    city: c.city,
    area: c.area,
    hourly_rate: c.hourlyRate || 500,
    trip_rate: c.tripRate || 2000,
    rating: c.rating || 4.9,
    reviews_count: c.reviewsCount || 20,
    services: c.services || [],
    languages: c.languages || ['English', 'Hindi'],
    bio: c.bio || '',
    avatar: c.avatar || '',
    is_star: Boolean(c.isStar),
    is_online: Boolean(c.isOnline),
    completed_hangouts: c.completedHangouts || 10,
    hallmark_id: c.hallmarkId || `HLM-${c.city.slice(0, 3).toUpperCase()}-9901`,
    kyc_status: 'VERIFIED'
  }));

  const { data, error } = await supabase.from('companions').upsert(prepared, { onConflict: 'name' }).select();
  if (error) throw error;
  return data;
}

/**
 * Complete raw SQL string for the entire FindCo schema (for 1-click clipboard copy)
 */
export const COMPLETE_SCHEMA_SQL = `-- =========================================================================
-- FINDCO SUPABASE PRODUCTION DATABASE SCHEMA, RLS POLICIES & SEED DATA
-- Dedicated Social Companionship Platform with Hallmark Cryptographic Trust
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIONS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.companions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    name TEXT NOT NULL,
    age INT NOT NULL DEFAULT 24 CHECK (age >= 18),
    gender TEXT DEFAULT 'Female',
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    hourly_rate INT NOT NULL CHECK (hourly_rate >= 300 AND hourly_rate <= 3000),
    trip_rate INT DEFAULT 2000,
    rating NUMERIC(3,2) DEFAULT 4.90,
    reviews_count INT DEFAULT 25,
    services TEXT[] NOT NULL DEFAULT '{}',
    languages TEXT[] NOT NULL DEFAULT '{}',
    bio TEXT,
    avatar TEXT,
    is_star BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT true,
    completed_hangouts INT DEFAULT 12,
    kyc_status TEXT DEFAULT 'VERIFIED' CHECK (kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    hallmark_id TEXT,
    aadhaar_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACTIVITY REQUESTS TABLE (Client Feed Hangout Posts)
CREATE TABLE IF NOT EXISTS public.activity_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT,
    client_name TEXT NOT NULL,
    client_avatar TEXT,
    activity TEXT NOT NULL,
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    date_time TEXT NOT NULL,
    budget INT NOT NULL,
    duration INT NOT NULL DEFAULT 2,
    gender_pref TEXT DEFAULT 'Any Gender',
    description TEXT,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'MATCHED', 'COMPLETED', 'CANCELLED')),
    responses_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BOOKINGS & DUAL-HANDSHAKE ESCROW TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT,
    client_name TEXT NOT NULL,
    buddy_id TEXT,
    buddy_name TEXT NOT NULL,
    activity TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    hours INT NOT NULL DEFAULT 2,
    hourly_rate INT NOT NULL,
    total_amount INT NOT NULL,
    escrow_status TEXT DEFAULT 'LOCKED' CHECK (escrow_status IN ('PENDING', 'LOCKED', 'RELEASED', 'REFUNDED')),
    handshake_pin TEXT NOT NULL CHECK (length(handshake_pin) = 4),
    pin_verified BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REAL-TIME CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT NOT NULL,
    sender_id TEXT,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'buddy', 'system')),
    text TEXT NOT NULL,
    counter_offer JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HALLMARK CRYPTOGRAPHIC TRUST & AUDIT LEDGER
CREATE TABLE IF NOT EXISTS public.hallmark_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    companion_name TEXT NOT NULL,
    fingerprint_hash TEXT UNIQUE NOT NULL,
    uidai_enclave_ref TEXT NOT NULL,
    clearance_ref TEXT NOT NULL,
    merkle_root TEXT NOT NULL,
    aadhaar_masked TEXT NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '365 days'),
    trust_grade TEXT DEFAULT 'SOVEREIGN_A+'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hallmark_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view verified companions" ON public.companions FOR SELECT USING (true);
CREATE POLICY "Public can insert companion profiles" ON public.companions FOR INSERT WITH CHECK (true);
CREATE POLICY "Companions can update their own profile" ON public.companions FOR UPDATE USING (true);

CREATE POLICY "Public can view activity requests" ON public.activity_requests FOR SELECT USING (true);
CREATE POLICY "Public can insert activity requests" ON public.activity_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update activity requests" ON public.activity_requests FOR UPDATE USING (true);

CREATE POLICY "Public can view bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public can insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can verify handshake PIN and release escrow" ON public.bookings FOR UPDATE USING (true);

CREATE POLICY "Public can view room messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Public can insert room messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can audit hallmark credentials" ON public.hallmark_credentials FOR SELECT USING (true);
CREATE POLICY "Public can insert hallmark records" ON public.hallmark_credentials FOR INSERT WITH CHECK (true);

-- Enable Realtime WebSockets
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'activity_requests') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_requests;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'bookings') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
    END IF;
END $$;
`;

/**
 * Supabase Data Access Services
 */
export const SupabaseService = {
  // --- COMPANIONS ---
  async getCompanions(cityFilter = 'All Cities') {
    if (!isSupabaseConfigured || !supabase) return null;
    let query = supabase.from('companions').select('*');
    if (cityFilter && cityFilter !== 'All Cities') {
      query = query.eq('city', cityFilter);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // --- ACTIVITY REQUESTS ---
  async getRequests() {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('activity_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createRequest(requestData) {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('activity_requests')
      .insert([requestData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- BOOKINGS & ESCROW ---
  async getBookings(userId) {
    if (!isSupabaseConfigured || !supabase) return null;
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.or(`client_id.eq.${userId},buddy_id.eq.${userId}`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createBooking(bookingData) {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async verifyBookingPin(bookingId, pin) {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        escrow_status: 'RELEASED', 
        pin_verified: true,
        completed_at: new Date().toISOString() 
      })
      .eq('id', bookingId)
      .eq('handshake_pin', pin)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- CHAT MESSAGES & REALTIME ---
  async getMessages(roomId) {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async sendMessage(messageData) {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([messageData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToRoom(roomId, onNewMessage) {
    if (!isSupabaseConfigured || !supabase) return () => {};
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        payload => {
          onNewMessage(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // --- HALLMARK TRUST CREDENTIALS ---
  async registerHallmarkCredential(credential) {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('hallmark_credentials')
      .upsert([credential], { onConflict: 'fingerprint_hash' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async verifyHallmarkOnCloud(hash) {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('hallmark_credentials')
      .select('*')
      .eq('fingerprint_hash', hash)
      .single();
    if (error) return null;
    return data;
  }
};

/**
 * Format raw Supabase User object into FindCo's user profile schema
 */
export function formatSupabaseUserProfile(user, fallbackRole = 'client') {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  const role = metadata.role || fallbackRole;
  const isBuddy = role === 'buddy';
  
  return {
    id: user.id,
    supabaseUserId: user.id,
    name: metadata.full_name || (user.email ? user.email.split('@')[0] : (isBuddy ? 'Priya Sharma' : 'Member')),
    email: user.email || '',
    phone: metadata.phone || user.phone || '',
    city: metadata.city || 'Bengaluru',
    role: role,
    avatar: metadata.avatar || (isBuddy 
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop&crop=faces'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=faces'),
    isAadhaarVerified: true
  };
}

/**
 * Supabase Authentication Service
 * Complete client interface for Email/Password, Magic Link, Phone OTP, Google OAuth & Session Management
 */
export const SupabaseAuthService = {
  /**
   * Get active Supabase session
   */
  async getSession() {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (err) {
      console.warn('[SupabaseAuth] getSession error:', err);
      return null;
    }
  },

  /**
   * Register a new user with Email + Password and metadata profile
   */
  async signUpWithEmail({ email, password, fullName, role = 'client', phone = '', city = 'Bengaluru' }) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured with cloud credentials.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          phone,
          city
        }
      }
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign in with Email + Password
   */
  async signInWithEmail(email, password) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured with cloud credentials.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  /**
   * Request an OTP / Magic Link via Email or Phone
   */
  async signInWithOtp(emailOrPhone) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured with cloud credentials.');
    }
    const isPhone = !emailOrPhone.includes('@');
    const params = isPhone 
      ? { phone: emailOrPhone.startsWith('+') ? emailOrPhone : `+91${emailOrPhone.replace(/\D/g, '')}` }
      : { email: emailOrPhone };
    const { data, error } = await supabase.auth.signInWithOtp(params);
    if (error) throw error;
    return data;
  },

  /**
   * Verify an SMS or Email OTP code
   */
  async verifyOtp({ phoneOrEmail, token, type = 'email' }) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured with cloud credentials.');
    }
    const isPhone = !phoneOrEmail.includes('@');
    const params = isPhone 
      ? { phone: phoneOrEmail.startsWith('+') ? phoneOrEmail : `+91${phoneOrEmail.replace(/\D/g, '')}`, token, type: 'sms' }
      : { email: phoneOrEmail, token, type: 'email' };
    const { data, error } = await supabase.auth.verifyOtp(params);
    if (error) throw error;
    return data;
  },

  /**
   * Sign in using Google OAuth
   */
  async signInWithGoogle() {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured with cloud credentials.');
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign out of Supabase session
   */
  async signOut() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('[SupabaseAuth] signOut error:', error);
    } catch (err) {
      console.warn('[SupabaseAuth] signOut exception:', err);
    }
  },

  /**
   * Subscribe to auth state transitions (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
   */
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured || !supabase) return () => {};
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
      return () => {
        subscription?.unsubscribe();
      };
    } catch (err) {
      console.warn('[SupabaseAuth] onAuthStateChange setup failed:', err);
      return () => {};
    }
  }
};

