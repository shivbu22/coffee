-- =========================================================================
-- FINDCO — Cloudflare D1 (SQLite) canonical schema
-- Replaces supabase_schema.sql (kept as legacy/reference only).
-- Authorization is enforced in Pages Functions (functions/_lib/auth.js +
-- each handler); there is no RLS in SQLite, so every handler MUST check
-- ownership/role server-side. IDs are UUID strings generated in app code.
-- =========================================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT,
  password_hash TEXT,
  password_salt TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client','buddy','admin')),
  full_name TEXT,
  city TEXT DEFAULT 'Bengaluru',
  avatar_url TEXT,
  is_aadhaar_verified INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role_city ON users(role, city);

-- Compatibility view: profile-shaped read of users (no password columns).
CREATE VIEW IF NOT EXISTS profiles AS
  SELECT id, email, phone, role, full_name, city, avatar_url,
         is_aadhaar_verified, created_at, updated_at FROM users;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_otp_identifier ON otp_codes(identifier, created_at DESC);

CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier TEXT NOT NULL,
  success INTEGER NOT NULL DEFAULT 0,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_login_attempts ON login_attempts(identifier, attempted_at DESC);

CREATE TABLE IF NOT EXISTS companions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL DEFAULT 24 CHECK (age >= 18),
  gender TEXT DEFAULT 'Female',
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  hourly_rate INTEGER NOT NULL CHECK (hourly_rate >= 300 AND hourly_rate <= 3000),
  trip_rate INTEGER DEFAULT 2000,
  rating REAL DEFAULT 4.90,
  reviews_count INTEGER DEFAULT 25,
  services TEXT NOT NULL DEFAULT '[]',
  languages TEXT NOT NULL DEFAULT '[]',
  bio TEXT,
  avatar TEXT,
  is_star INTEGER NOT NULL DEFAULT 0,
  is_online INTEGER NOT NULL DEFAULT 1,
  completed_hangouts INTEGER DEFAULT 12,
  kyc_status TEXT DEFAULT 'VERIFIED' CHECK (kyc_status IN ('PENDING','VERIFIED','REJECTED')),
  hallmark_id TEXT UNIQUE,
  aadhaar_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_companions_city ON companions(city, rating DESC);
CREATE INDEX IF NOT EXISTS idx_companions_user ON companions(user_id);

CREATE TABLE IF NOT EXISTS activity_requests (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  client_name TEXT NOT NULL,
  client_avatar TEXT,
  activity TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  date_time TEXT NOT NULL,
  budget INTEGER NOT NULL,
  duration INTEGER NOT NULL DEFAULT 2,
  gender_pref TEXT DEFAULT 'Any Gender',
  description TEXT,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN','MATCHED','COMPLETED','CANCELLED')),
  responses_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_requests_client ON activity_requests(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_status ON activity_requests(status, created_at DESC);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  client_name TEXT NOT NULL,
  buddy_id TEXT,
  buddy_name TEXT NOT NULL,
  activity TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  hours INTEGER NOT NULL DEFAULT 2,
  hourly_rate INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  escrow_status TEXT DEFAULT 'LOCKED' CHECK (escrow_status IN ('PENDING','LOCKED','RELEASED','REFUNDED')),
  handshake_pin TEXT NOT NULL CHECK (length(handshake_pin) = 4),
  pin_verified INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_buddy ON bookings(buddy_id, created_at DESC);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  sender_id TEXT,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client','buddy','system')),
  text TEXT NOT NULL,
  counter_offer TEXT,
  client_temp_id TEXT,
  status TEXT DEFAULT 'delivered',
  read_at TEXT,
  media_type TEXT,
  media_url TEXT,
  media_metadata TEXT,
  location_data TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_room ON chat_messages(room_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON chat_messages(sender_id);

CREATE TABLE IF NOT EXISTS hallmark_credentials (
  id TEXT PRIMARY KEY,
  companion_name TEXT NOT NULL,
  fingerprint_hash TEXT UNIQUE NOT NULL,
  uidai_enclave_ref TEXT NOT NULL,
  clearance_ref TEXT NOT NULL,
  merkle_root TEXT NOT NULL,
  aadhaar_masked TEXT NOT NULL,
  verified_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL DEFAULT (datetime('now','+365 days')),
  trust_grade TEXT DEFAULT 'SOVEREIGN_A+'
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  plan_id TEXT NOT NULL,
  amount_paise INTEGER NOT NULL CHECK (amount_paise >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','paid','failed','refunded')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  current_period_start TEXT NOT NULL DEFAULT (datetime('now')),
  current_period_end TEXT,
  razorpay_payment_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id, status);

CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('escrow','safety','harassment','technical','refund','other')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','urgent','emergency')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','under_investigation','resolved','closed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id, created_at DESC);

-- Seed companions (ported from supabase_schema.sql)
INSERT OR IGNORE INTO companions (id, name, age, gender, city, area, hourly_rate, trip_rate, rating, reviews_count, services, languages, bio, avatar, is_star, is_online, completed_hangouts, hallmark_id, aadhaar_hash) VALUES
(lower(hex(randomblob(16))),'Priya Sharma',24,'Female','Bengaluru','Indiranagar & Koramangala',450,2000,4.90,38,'["Cafe & Dining Buddy","City Explorer & Guide","Study & Co-working Buddy"]','["English","Hindi","Kannada"]','Passionate specialty coffee explorer and amateur street photographer. Love discovering cozy cafes, bookshops, and weekend art exhibitions.','https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',1,1,54,'HLM-BLR-UIDAI-8921-A','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),
(lower(hex(randomblob(16))),'Arjun Mehta',27,'Male','Mumbai','Bandra & Lower Parel',600,2800,4.85,42,'["Nightout & Drive Buddy","Gym & Fitness Partner","Clubbing Companion"]','["English","Hindi","Marathi","Gujarati"]','Fitness enthusiast, music festival lover, and Mumbai night-owl. Great company for late night drives to Marine Drive or intense CrossFit sessions.','https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',0,1,63,'HLM-BOM-UIDAI-4412-A','b2a1a8c9e4299b8d234901f4c8209bb427ae41e4649b934ca495991b7852b123'),
(lower(hex(randomblob(16))),'Ananya Sen',23,'Female','Goa','Anjuna, Assagao & Vagator',500,2400,5.00,29,'["Travel & Roadtrip Buddy","Cafe & Dining Buddy","Photography Buddy"]','["English","Hindi","Bengali"]','Slow traveler, architecture student, and sunset chaser. Can show you the secret heritage chapels and cliffside cafes in North Goa.','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',1,1,41,'HLM-GOA-UIDAI-7104-A','f5d2b1a8c9e4299b8d234901f4c8209bb427ae41e4649b934ca495991b7852b789'),
(lower(hex(randomblob(16))),'Rohan Varma',26,'Male','Delhi NCR','Hauz Khas, CP & Cyber City',400,1800,4.80,31,'["Shopping & Market Buddy","City Explorer & Guide","Movie Buddy"]','["English","Hindi","Punjabi"]','Heritage walk guide, thrift shopping connoisseur, and cinema buff. Know every hidden culinary lane from Old Delhi to Khan Market.','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',0,0,37,'HLM-DEL-UIDAI-3301-A','a8c9e4299b8d234901f4c8209bb427ae41e4649b934ca495991b7852be3b0c44'),
(lower(hex(randomblob(16))),'Kavya Iyer',25,'Female','Pune','Koregaon Park & Viman Nagar',450,2100,4.95,24,'["Study & Co-working Buddy","Cafe & Dining Buddy","Dance Partner"]','["English","Hindi","Tamil","Marathi"]','UX Designer and bookworm. Love working in tranquil coffee shops and attending evening salsa socials. Gentle, patient, and engaging conversationalist.','https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',1,1,32,'HLM-PUN-UIDAI-9912-A','c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852be3b0a8c'),
(lower(hex(randomblob(16))),'Devansh Patel',28,'Male','Hyderabad','Jubilee Hills & Hitec City',550,2500,4.88,36,'["Gaming Partner","Nightout & Drive Buddy","Cafe & Dining Buddy"]','["English","Hindi","Telugu"]','Tech founder, esports competitor, and midnight food explorer. Looking to buddy up for high-intensity gaming sessions or authentic midnight biryani hunts.','https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=faces',0,1,48,'HLM-HYD-UIDAI-5519-A','d234901f4c8209bb427ae41e4649b934ca495991b7852be3b0c44298fc1c149a');

INSERT OR IGNORE INTO hallmark_credentials (id, companion_name, fingerprint_hash, uidai_enclave_ref, clearance_ref, merkle_root, aadhaar_masked) VALUES
(lower(hex(randomblob(16))),'Priya Sharma','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855','UIDAI-ENCLAVE-BLR-0982-HASH','POLICE-CCTNS-KA-2026-99182','0x8f29c4ba230198bbd42199ae1245ffbc71902847','XXXX-XXXX-8921'),
(lower(hex(randomblob(16))),'Arjun Mehta','b2a1a8c9e4299b8d234901f4c8209bb427ae41e4649b934ca495991b7852b123','UIDAI-ENCLAVE-BOM-4412-HASH','POLICE-CCTNS-MH-2026-44192','0x7a11c5ba990143aae42199ae1245ffbc71903312','XXXX-XXXX-4412'),
(lower(hex(randomblob(16))),'Ananya Sen','f5d2b1a8c9e4299b8d234901f4c8209bb427ae41e4649b934ca495991b7852b789','UIDAI-ENCLAVE-GOA-7104-HASH','POLICE-CCTNS-GA-2026-71084','0x9c33d8fa110982bbe42199ae1245ffbc71905541','XXXX-XXXX-7104');
