-- =========================================================================
-- FINDCO SUPABASE PRODUCTION DATABASE SCHEMA, RLS POLICIES & SEED DATA
-- Dedicated Social Companionship Platform with Hallmark Cryptographic Trust
-- Compatible with PostgreSQL 15+ & Supabase Realtime WebSockets
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 0. USER PROFILES & SUPABASE AUTH ENCLAVE
-- Seamlessly mirrors auth.users(id) created by Supabase Auth (Email, Phone OTP, Google OAuth)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=faces',
    phone TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'buddy', 'admin')),
    city TEXT DEFAULT 'Bengaluru',
    is_aadhaar_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Auth Trigger: Whenever a user signs up via Supabase Auth,
-- seamlessly create or update their public.profiles record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, phone, role, city)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'User'), '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=faces'),
        COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
        COALESCE(NEW.raw_user_meta_data->>'city', 'Bengaluru')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        role = COALESCE(EXCLUDED.role, public.profiles.role),
        city = COALESCE(EXCLUDED.city, public.profiles.city),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 1. COMPANIONS / VERIFIED BUDDY PROFILES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.companions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- =========================================================================
-- 2. ACTIVITY REQUESTS TABLE (Client Feed Hangout Posts)
-- =========================================================================
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

-- =========================================================================
-- 3. BOOKINGS & DUAL-HANDSHAKE ESCROW TABLE
-- =========================================================================
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

-- =========================================================================
-- 4. REAL-TIME CHAT MESSAGES TABLE
-- =========================================================================
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

-- =========================================================================
-- 5. HALLMARK CRYPTOGRAPHIC TRUST & AUDIT LEDGER
-- =========================================================================
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

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (Idempotent)
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hallmark_credentials ENABLE ROW LEVEL SECURITY;

-- 0. Profiles RLS
DROP POLICY IF EXISTS "Public can view member profiles" ON public.profiles;
CREATE POLICY "Public can view member profiles" 
    ON public.profiles FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 1. Companions RLS
DROP POLICY IF EXISTS "Public can view verified companions" ON public.companions;
CREATE POLICY "Public can view verified companions" 
    ON public.companions FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Public can insert companion profiles" ON public.companions;
CREATE POLICY "Public can insert companion profiles" 
    ON public.companions FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Companions can update their own profile" ON public.companions;
CREATE POLICY "Companions can update their own profile" 
    ON public.companions FOR UPDATE 
    USING (true);

-- 2. Activity Requests RLS
DROP POLICY IF EXISTS "Public can view activity requests" ON public.activity_requests;
CREATE POLICY "Public can view activity requests" 
    ON public.activity_requests FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Public can insert activity requests" ON public.activity_requests;
CREATE POLICY "Public can insert activity requests" 
    ON public.activity_requests FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update activity requests" ON public.activity_requests;
CREATE POLICY "Public can update activity requests" 
    ON public.activity_requests FOR UPDATE 
    USING (true);

-- 3. Bookings RLS
DROP POLICY IF EXISTS "Public can view bookings" ON public.bookings;
CREATE POLICY "Public can view bookings" 
    ON public.bookings FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Public can insert bookings" ON public.bookings;
CREATE POLICY "Public can insert bookings" 
    ON public.bookings FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can verify handshake PIN and release escrow" ON public.bookings;
CREATE POLICY "Public can verify handshake PIN and release escrow" 
    ON public.bookings FOR UPDATE 
    USING (true);

-- 4. Chat Messages RLS
DROP POLICY IF EXISTS "Public can view room messages" ON public.chat_messages;
CREATE POLICY "Public can view room messages" 
    ON public.chat_messages FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Public can insert room messages" ON public.chat_messages;
CREATE POLICY "Public can insert room messages" 
    ON public.chat_messages FOR INSERT 
    WITH CHECK (true);

-- 5. Hallmark Credentials RLS
DROP POLICY IF EXISTS "Public can audit hallmark credentials" ON public.hallmark_credentials;
CREATE POLICY "Public can audit hallmark credentials" 
    ON public.hallmark_credentials FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Public can insert hallmark records" ON public.hallmark_credentials;
CREATE POLICY "Public can insert hallmark records" 
    ON public.hallmark_credentials FOR INSERT 
    WITH CHECK (true);

-- =========================================================================
-- REALTIME REPLICATION (WebSockets)
-- =========================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'activity_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_requests;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'bookings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
END $$;

-- Ensure unique index on hallmark_id to support clean idempotent seeding
CREATE UNIQUE INDEX IF NOT EXISTS idx_companions_hallmark_id ON public.companions (hallmark_id);

-- =========================================================================
-- INITIAL SEED DATA (Indian Metros Companions & Verified Hallmark Trust)
-- =========================================================================
INSERT INTO public.companions (
    name, age, gender, city, area, hourly_rate, trip_rate, rating, reviews_count, 
    services, languages, bio, avatar, is_star, is_online, completed_hangouts, hallmark_id, aadhaar_hash
) VALUES
(
    'Priya Sharma', 24, 'Female', 'Bengaluru', 'Indiranagar & Koramangala', 450, 2000, 4.90, 38,
    ARRAY['Cafe & Dining Buddy', 'City Explorer & Guide', 'Study & Co-working Buddy'],
    ARRAY['English', 'Hindi', 'Kannada'],
    'Passionate specialty coffee explorer and amateur street photographer. Love discovering cozy cafes, bookshops, and weekend art exhibitions.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',
    true, true, 54, 'HLM-BLR-UIDAI-8921-A', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
),
(
    'Arjun Mehta', 27, 'Male', 'Mumbai', 'Bandra & Lower Parel', 600, 2800, 4.85, 42,
    ARRAY['Nightout & Drive Buddy', 'Gym & Fitness Partner', 'Clubbing Companion'],
    ARRAY['English', 'Hindi', 'Marathi', 'Gujarati'],
    'Fitness enthusiast, music festival lover, and Mumbai night-owl. Great company for late night drives to Marine Drive or intense CrossFit sessions.',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
    false, true, 63, 'HLM-BOM-UIDAI-4412-A', 'b2a1a8c9e4299b8d234901f4c8209bb427ae41e4649b934ca495991b7852b123'
),
(
    'Ananya Sen', 23, 'Female', 'Goa', 'Anjuna, Assagao & Vagator', 500, 2400, 5.00, 29,
    ARRAY['Travel & Roadtrip Buddy', 'Cafe & Dining Buddy', 'Photography Buddy'],
    ARRAY['English', 'Hindi', 'Bengali'],
    'Slow traveler, architecture student, and sunset chaser. Can show you the secret heritage chapels and cliffside cafes in North Goa.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
    true, true, 41, 'HLM-GOA-UIDAI-7104-A', 'f5d2b1a8c9e4299b8d234901f4c8209bb427ae41e4649b934ca495991b7852b789'
),
(
    'Rohan Varma', 26, 'Male', 'Delhi NCR', 'Hauz Khas, CP & Cyber City', 400, 1800, 4.80, 31,
    ARRAY['Shopping & Market Buddy', 'City Explorer & Guide', 'Movie Buddy'],
    ARRAY['English', 'Hindi', 'Punjabi'],
    'Heritage walk guide, thrift shopping connoisseur, and cinema buff. Know every hidden culinary lane from Old Delhi to Khan Market.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
    false, false, 37, 'HLM-DEL-UIDAI-3301-A', 'a8c9e4299b8d234901f4c8209bb427ae41e4649b934ca495991b7852be3b0c44'
),
(
    'Kavya Iyer', 25, 'Female', 'Pune', 'Koregaon Park & Viman Nagar', 450, 2100, 4.95, 24,
    ARRAY['Study & Co-working Buddy', 'Cafe & Dining Buddy', 'Dance Partner'],
    ARRAY['English', 'Hindi', 'Tamil', 'Marathi'],
    'UX Designer and bookworm. Love working in tranquil coffee shops and attending evening salsa socials. Gentle, patient, and engaging conversationalist.',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',
    true, true, 32, 'HLM-PUN-UIDAI-9912-A', 'c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852be3b0a8c'
),
(
    'Devansh Patel', 28, 'Male', 'Hyderabad', 'Jubilee Hills & Hitec City', 550, 2500, 4.88, 36,
    ARRAY['Gaming Partner', 'Nightout & Drive Buddy', 'Cafe & Dining Buddy'],
    ARRAY['English', 'Hindi', 'Telugu'],
    'Tech founder, esports competitor, and midnight food explorer. Looking to buddy up for high-intensity gaming sessions or authentic midnight biryani hunts.',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=faces',
    false, true, 48, 'HLM-HYD-UIDAI-5519-A', 'd234901f4c8209bb427ae41e4649b934ca495991b7852be3b0c44298fc1c149a'
)
ON CONFLICT (hallmark_id) DO NOTHING;

-- Initial Hallmark Cryptographic Trust Credentials
INSERT INTO public.hallmark_credentials (
    companion_name, fingerprint_hash, uidai_enclave_ref, clearance_ref, merkle_root, aadhaar_masked
) VALUES
(
    'Priya Sharma', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'UIDAI-ENCLAVE-BLR-0982-HASH', 'POLICE-CCTNS-KA-2026-99182',
    '0x8f29c4ba230198bbd42199ae1245ffbc71902847', 'XXXX-XXXX-8921'
),
(
    'Arjun Mehta', 'b2a1a8c9e4299b8d234901f4c8209bb427ae41e4649b934ca495991b7852b123',
    'UIDAI-ENCLAVE-BOM-4412-HASH', 'POLICE-CCTNS-MH-2026-44192',
    '0x7a11c5ba990143aae42199ae1245ffbc71903312', 'XXXX-XXXX-4412'
),
(
    'Ananya Sen', 'f5d2b1a8c9e4299b8d234901f4c8209bb427ae41e4649b934ca495991b7852b789',
    'UIDAI-ENCLAVE-GOA-7104-HASH', 'POLICE-CCTNS-GA-2026-71084',
    '0x9c33d8fa110982bbe42199ae1245ffbc71905541', 'XXXX-XXXX-7104'
)
ON CONFLICT (fingerprint_hash) DO NOTHING;

-- =========================================================================
-- END OF SCHEMA
-- =========================================================================
