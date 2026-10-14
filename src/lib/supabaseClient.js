import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if live credentials are configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

// Initialize Supabase client if credentials exist, otherwise provide safe fallback
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

/**
 * Check live connection status to Supabase backend
 */
export async function checkSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      reason: 'Missing or placeholder VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local',
      mode: 'AntiVibe Local Storage Fallback Mode'
    };
  }

  try {
    const { data, error } = await supabase.from('companions').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        error: error.message,
        hint: 'Connected to Supabase project, but tables may need initialization via supabase_schema.sql',
        mode: 'Supabase Project Connected'
      };
    }
    return {
      connected: true,
      message: 'Supabase PostgreSQL connection healthy and active',
      mode: 'Live Cloud Backend'
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
      mode: 'AntiVibe Local Storage Fallback Mode'
    };
  }
}

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
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .or(`client_id.eq.${userId},buddy_id.eq.${userId}`)
      .order('created_at', { ascending: false });
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
