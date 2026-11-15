#!/usr/bin/env node
/**
 * LEGACY — FindCo no longer uses Supabase. The backend is Cloudflare D1.
 * Setup: npx wrangler d1 create findco
 *        npx wrangler d1 execute findco --remote --file cloudflare/schema.sql
 * Verify locally: npm run build && npx wrangler pages dev dist --d1 DB
 * then GET http://localhost:8788/api/health
 */
console.log('FindCo is Cloudflare-only now. See README.md → "Cloudflare setup (D1)".');
