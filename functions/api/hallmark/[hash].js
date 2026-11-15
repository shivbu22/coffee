// GET /api/hallmark/[hash] — public verification lookup by fingerprint hash.
import { json, error, requireDb } from '../../_lib/http.js';
export async function onRequestGet({ env, params }) {
  const bad = requireDb(env); if (bad) return bad;
  const row = await env.DB.prepare('SELECT * FROM hallmark_credentials WHERE fingerprint_hash = ?1').bind(params.hash).first();
  if (!row) return error('Credential not found.', 404);
  return json({ credential: row });
}
