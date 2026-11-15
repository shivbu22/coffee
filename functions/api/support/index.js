// POST /api/support — Submit a customer support or safety incident ticket
import { json, error, assertSameOrigin, readJson, requireDb, newId } from '../../_lib/http.js';
import { getSessionUser } from '../../_lib/auth.js';

const VALID_CATEGORIES = new Set(['escrow', 'safety', 'harassment', 'technical', 'refund', 'other']);
const VALID_PRIORITIES = new Set(['low', 'normal', 'urgent', 'emergency']);

export async function onRequestPost({ request, env }) {
  const bad = assertSameOrigin(request) || requireDb(env); 
  if (bad) return bad;

  const body = await readJson(request);
  if (!body) return error('Invalid JSON body.');

  const subject = String(body.subject || body.title || '').trim().slice(0, 200);
  const message = String(body.message || body.description || '').trim().slice(0, 4000);
  if (!subject) return error('Subject is required.');
  if (!message) return error('Message description is required.');

  let category = String(body.category || 'other').toLowerCase();
  if (!VALID_CATEGORIES.has(category)) category = 'other';

  let priority = String(body.priority || 'normal').toLowerCase();
  if (!VALID_PRIORITIES.has(priority)) priority = 'normal';

  const user = await getSessionUser(request, env);
  const userId = user ? user.id : null;
  const id = body.id && typeof body.id === 'string' && body.id.length <= 64 ? body.id : newId();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO support_tickets (id, user_id, category, priority, subject, message, status, created_at, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'open', ?7, ?7)`
  ).bind(id, userId, category, priority, subject, message, now).run();

  return json({
    success: true,
    ticket: {
      id,
      user_id: userId,
      category,
      priority,
      subject,
      message,
      status: 'open',
      created_at: now
    }
  }, { status: 201 });
}

export async function onRequestGet({ request, env }) {
  const bad = requireDb(env);
  if (bad) return bad;

  const user = await getSessionUser(request, env);
  if (!user) return error('Authentication required to view support tickets.', 401);

  let query = 'SELECT * FROM support_tickets WHERE user_id = ?1 ORDER BY created_at DESC';
  let params = [user.id];

  if (user.role === 'admin') {
    query = 'SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 100';
    params = [];
  }

  const { results } = await env.DB.prepare(query).bind(...params).all();
  return json({ tickets: results || [] });
}

