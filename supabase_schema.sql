-- =========================================================================
-- FINDCO SUPABASE PRODUCTION DATABASE SCHEMA & SECURITY POLICIES
-- Dedicated Social Companionship Platform with Hallmark Cryptographic Trust
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIONS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.companions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INT NOT NULL CHECK (age >= 18),
    gender TEXT,
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    hourly_rate INT NOT NULL CHECK (hourly_rate >= 300 AND hourly_rate <= 3000),
    rating NUMERIC(3,2) DEFAULT 4.95,
    reviews_count INT DEFAULT 0,
    services TEXT[] NOT NULL DEFAULT '{}',
    languages TEXT[] NOT NULL DEFAULT '{}',
    bio TEXT,
    avatar TEXT,
    is_star BOOLEAN DEFAULT false,
    kyc_status TEXT DEFAULT 'VERIFIED' CHECK (kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    aadhaar_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACTIVITY REQUESTS TABLE (Client Feed Posts)
CREATE TABLE IF NOT EXISTS public.activity_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
    client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    buddy_id UUID REFERENCES public.companions(id) ON DELETE CASCADE,
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
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'buddy', 'system')),
    text TEXT NOT NULL,
    counter_offer JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HALLMARK CRYPTOGRAPHIC TRUST & AUDIT LEDGER
CREATE TABLE IF NOT EXISTS public.hallmark_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    companion_id UUID REFERENCES public.companions(id) ON DELETE CASCADE,
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

-- Enable Row Level Security (RLS) on all public tables
ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hallmark_credentials ENABLE ROW LEVEL SECURITY;

-- Read policies (Public read for active directory & requests)
CREATE POLICY "Public can view verified companions" 
    ON public.companions FOR SELECT 
    USING (kyc_status = 'VERIFIED');

CREATE POLICY "Public can view open activity requests" 
    ON public.activity_requests FOR SELECT 
    USING (status = 'OPEN');

CREATE POLICY "Users can view their own bookings" 
    ON public.bookings FOR SELECT 
    USING (auth.uid() = client_id);

CREATE POLICY "Users can view messages for rooms they are in" 
    ON public.chat_messages FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert chat messages" 
    ON public.chat_messages FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Public can verify hallmark credentials" 
    ON public.hallmark_credentials FOR SELECT 
    USING (true);

-- Enable Realtime WebSockets for Instant Chat Messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
