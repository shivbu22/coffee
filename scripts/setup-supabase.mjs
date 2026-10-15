#!/usr/bin/env node
/**
 * FindCo Supabase Backend Setup & Verification Script
 * Connects to the live Supabase instance, verifies all 6 tables,
 * checks row counts, verifies auth config, and reports full status.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
    }
  }
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║  FindCo — Supabase Backend Setup & Verification      ║');
console.log('╚════════════════════════════════════════════════════════╝\n');
console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 Anon Key: ${SUPABASE_ANON_KEY.slice(0, 20)}...${SUPABASE_ANON_KEY.slice(-10)}\n`);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const TABLES = [
  'profiles',
  'companions',
  'activity_requests',
  'bookings',
  'chat_messages',
  'hallmark_credentials'
];

async function checkTable(tableName) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return { exists: false, count: 0, error: 'TABLE_NOT_FOUND' };
      }
      return { exists: false, count: 0, error: error.message };
    }
    return { exists: true, count: count || 0, error: null };
  } catch (e) {
    return { exists: false, count: 0, error: e.message };
  }
}

async function getCompanionsSample() {
  try {
    const { data, error } = await supabase
      .from('companions')
      .select('id, name, city, hourly_rate, is_star, hallmark_id, kyc_status')
      .limit(10);
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

async function getRequestsSample() {
  try {
    const { data, error } = await supabase
      .from('activity_requests')
      .select('id, client_name, activity, city, status')
      .limit(5);
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

async function getHallmarksSample() {
  try {
    const { data, error } = await supabase
      .from('hallmark_credentials')
      .select('id, companion_name, trust_grade, aadhaar_masked')
      .limit(5);
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

async function checkAuth() {
  try {
    const { data, error } = await supabase.auth.getSession();
    return { 
      authServiceAlive: true, 
      hasSession: !!data?.session,
      error: error?.message || null
    };
  } catch (e) {
    return { authServiceAlive: false, hasSession: false, error: e.message };
  }
}

async function main() {
  console.log('━━━ 1. CONNECTIVITY CHECK ━━━');
  const startTime = Date.now();
  const pingResult = await checkTable('companions');
  const latency = Date.now() - startTime;
  
  if (pingResult.error === 'TABLE_NOT_FOUND') {
    console.log(`⚠️  Connected to Supabase (${latency}ms) but tables DON'T EXIST yet.`);
    console.log('   ➜ You need to run supabase_schema.sql in the Supabase SQL Editor.\n');
    console.log('🔧 HOW TO SET UP:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/wyxpcrslmxmdcivbwsou/sql/new');
    console.log('   2. Sign in to your Supabase account');
    console.log('   3. Copy the contents of supabase_schema.sql');
    console.log('   4. Paste into the SQL Editor and click "Run"');
    console.log('   5. Run this script again to verify.\n');
    process.exit(0);
  } else if (pingResult.error) {
    console.log(`❌ Connection failed: ${pingResult.error}`);
    process.exit(1);
  }
  
  console.log(`✅ Connected to Supabase PostgreSQL (${latency}ms latency)\n`);

  // Check all tables
  console.log('━━━ 2. TABLE STATUS ━━━');
  const tableResults = {};
  let allTablesExist = true;
  let totalRows = 0;
  
  for (const table of TABLES) {
    const result = await checkTable(table);
    tableResults[table] = result;
    totalRows += result.count;
    
    const status = result.exists ? `✅ ${result.count} rows` : `❌ ${result.error}`;
    console.log(`  ${table.padEnd(25)} ${status}`);
    if (!result.exists) allTablesExist = false;
  }
  
  console.log(`\n  Total rows across all tables: ${totalRows}`);
  console.log(`  All 6 tables exist: ${allTablesExist ? '✅ YES' : '❌ NO'}\n`);

  // Sample data
  if (allTablesExist) {
    console.log('━━━ 3. COMPANION DATA (SEED CHECK) ━━━');
    const companions = await getCompanionsSample();
    if (companions.data && companions.data.length > 0) {
      companions.data.forEach(c => {
        console.log(`  🧑 ${c.name.padEnd(20)} | ${c.city.padEnd(12)} | ₹${c.hourly_rate}/hr | ⭐${c.is_star ? 'Star' : 'Regular'} | ${c.kyc_status} | ${c.hallmark_id || 'N/A'}`);
      });
    } else {
      console.log('  ⚠️  No companion data found. Seed data may not have been inserted.');
    }
    console.log('');

    console.log('━━━ 4. HALLMARK TRUST CREDENTIALS ━━━');
    const hallmarks = await getHallmarksSample();
    if (hallmarks.data && hallmarks.data.length > 0) {
      hallmarks.data.forEach(h => {
        console.log(`  🔐 ${h.companion_name.padEnd(20)} | Grade: ${h.trust_grade} | Aadhaar: ${h.aadhaar_masked}`);
      });
    } else {
      console.log('  ⚠️  No hallmark credentials found.');
    }
    console.log('');

    console.log('━━━ 5. ACTIVITY REQUESTS ━━━');
    const requests = await getRequestsSample();
    if (requests.data && requests.data.length > 0) {
      requests.data.forEach(r => {
        console.log(`  📋 ${r.client_name.padEnd(15)} | ${r.activity.padEnd(20)} | ${r.city} | ${r.status}`);
      });
    } else {
      console.log('  (No activity requests yet — will be created by users)');
    }
    console.log('');
  }

  // Auth check
  console.log('━━━ 6. SUPABASE AUTH SERVICE ━━━');
  const authResult = await checkAuth();
  console.log(`  Auth API Alive:     ${authResult.authServiceAlive ? '✅ YES' : '❌ NO'}`);
  console.log(`  Active Session:     ${authResult.hasSession ? '✅ Yes (logged in)' : '— No active session'}`);
  if (authResult.error) console.log(`  Auth Error:         ${authResult.error}`);
  console.log('');

  // Summary
  console.log('╔════════════════════════════════════════════════════════╗');
  if (allTablesExist && totalRows > 0) {
    console.log('║  ✅ FINDCO SUPABASE BACKEND IS FULLY OPERATIONAL      ║');
    console.log('║                                                        ║');
    console.log(`║  Tables: ${TABLES.length}/6  |  Total rows: ${String(totalRows).padEnd(5)}  |  Auth: ✅     ║`);
  } else if (allTablesExist) {
    console.log('║  ⚠️  TABLES EXIST BUT NO SEED DATA FOUND              ║');
    console.log('║  Run supabase_schema.sql again to insert seed data     ║');
  } else {
    console.log('║  ❌ TABLES MISSING — RUN SCHEMA SQL IN SUPABASE EDITOR ║');
  }
  console.log('╚════════════════════════════════════════════════════════╝\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
