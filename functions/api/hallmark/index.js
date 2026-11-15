// POST /api/hallmark — register a credential (auth required; replaces the old
// service-role-only insert policy from the previous backend).
import { json, error, assertSameOrigin, readJson, requireDb, newId } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); if (bad) return bad;
  const auth = await requireUser(request, env); if (auth.response) return auth.response;
  const body = await readJson(request); if (!body) return error('Invalid JSON body.');
  const required = ['companion_name', 'fingerprint_hash', 'uidai_enclave_ref', 'clearance_ref', 'merkle_root', 'aadhaar_masked'];
  const vals = {};
  for (const k of required) { const v = body[k] || body[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())]; if (!v) return error(`${k} is required.`); vals[k] = String(v).slice(0, 300); }
  const existing = await env.DB.prepare('SELECT * FROM hallmark_credentials WHERE fingerprint_hash = ?1').bind(vals.fingerprint_hash).first();
  if (existing) return json({ credential: existing });
  const id = newId();
  await env.DB.prepare(
    'INSERT INTO hallmark_credentials (id, companion_name, fingerprint_hash, uidai_enclave_ref, clearance_ref, merkle_root, aadhaar_masked, trust_grade) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)'
  ).bind(id, vals.companion_name, vals.fingerprint_hash, vals.uidai_enclave_ref, vals.clearance_ref, vals.merkle_root, vals.aadhaar_masked, String(body.trust_grade || 'SOVEREIGN_A+')).run();
  const row = await env.DB.prepare('SELECT * FROM hallmark_credentials WHERE id = ?1').bind(id).first();
  return json({ credential: row }, 201);
}
