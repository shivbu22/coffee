// GET /api/health — backend + D1 table readiness (used by the Admin Portal).
import { json, requireDb } from '../_lib/http.js';
const TABLES = ['users', 'profiles', 'companions', 'activity_requests', 'bookings', 'chat_messages', 'hallmark_credentials', 'payments', 'subscriptions', 'support_tickets'];
export async function onRequestGet({ env }) {
  const bad = requireDb(env); if (bad) return json({ db: false, error: 'D1 binding DB missing', tables: [] }, 500);
  const tables = [];
  const detail = {};
  for (const t of TABLES) {
    try {
      const row = await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${t}`).first();
      tables.push(t); detail[t] = { ready: true, count: row?.n || 0 };
    } catch (e) { detail[t] = { ready: false, count: 0, error: e.message }; }
  }
  return json({ db: true, tables, detail });
}
