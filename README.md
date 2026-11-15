# FindCo

FindCo is a companionship platform for India — discover verified companions ("buddies") by city, post activity requests, chat, book with escrow-style handshake verification, and unlock membership passes.

> Note: this repository was originally named `coffee` on GitHub. The product is FindCo; the name was not changed in code.

## Stack

- React 19 + Vite (SPA)
- Supabase — Postgres, Auth (email/password PKCE, magic link, phone OTP, Google OAuth), Realtime, Row Level Security
- Razorpay — real payments via Cloudflare Pages Functions (orders, signature verification, webhooks)
- Cloudflare Pages — hosting, security headers, SPA fallback (Vercel config in `vercel.json` is also kept)

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the public VITE_ values
npm run dev
npm run build
```

## Environment variables

Public (build-time, in `.env.local` locally / Cloudflare Pages settings in production):

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_RAZORPAY_KEY_ID` | Razorpay **public** Key ID (`rzp_test_...` or `rzp_live_...`) |

Server-only secrets — set **only** in Cloudflare Dashboard → Pages → findco → Settings → Environment variables. Never prefix them with `VITE_`, never commit them:

`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`

## Supabase setup

1. Create a Supabase project.
2. In the SQL Editor, run `supabase_schema.sql` (idempotent — safe to re-run). It creates tables, RLS policies, the `public_profiles` view, and the `payments` / `subscriptions` tables.
3. Enable the auth providers you use (Email, Phone, Google) in Authentication → Providers.
4. Put the project URL + anon key in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

Auth notes: Supabase Auth is the **single** source of truth (`SupabaseAuthService` in `src/lib/supabaseClient.js`, `AuthContext` in `src/context/AuthContext.jsx`). The old local auth engine (`src/utils/authEngine.js`) is deprecated and delegates to Supabase — it stores no passwords locally. Password minimum is 8 characters. Supabase credentials are read from env vars only; there is no in-app "paste your keys" config anymore.

## Razorpay setup

1. Create keys in Razorpay Dashboard → Settings → API Keys.
2. Set `VITE_RAZORPAY_KEY_ID` (public) at build time, and `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` as Cloudflare secrets.
3. Add a webhook in Razorpay Dashboard → Webhooks pointing to `https://<your-domain>/api/payments/webhook`, set its secret as `RAZORPAY_WEBHOOK_SECRET`.
4. Flow: browser → `POST /api/payments/create-order` (amount decided server-side from a fixed plan map in `functions/api/payments/_plans.js`) → Razorpay Checkout → `POST /api/payments/verify` (HMAC-SHA256 signature check) → webhook confirms fulfilment.
5. If `VITE_RAZORPAY_KEY_ID` is not set, the subscription modal runs in clearly labelled **DEMO MODE** and makes no real charge.

## Deploy — Cloudflare Pages

1. Cloudflare Dashboard → Pages → Create → connect this repo (or run `npx wrangler pages deploy dist`).
2. Build command: `npm run build` · Output directory: `dist` (see `wrangler.toml`, project name `findco`).
3. Set all env vars above in Pages settings, then redeploy.
4. `public/_headers` ships CSP/HSTS and other security headers; `public/_redirects` provides the SPA fallback. Payment endpoints live in `functions/api/payments/`.

## Security notes

- No secrets in client code; Razorpay secret and Supabase service-role key are server-only.
- RLS is enabled on all tables. Companions can only insert/update rows where `user_id = auth.uid()`. `payments` / `subscriptions` are readable by their owner only and writable only via the service role.
- `public.profiles` contains email/phone — do not query it publicly. Use the `public.public_profiles` view (id, full_name, avatar_url, city, role) for public listings.
- Input validation helpers live in `src/utils/validate.js` (email, Indian phone, password strength, amount).
