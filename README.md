# CourageD Fitness Hub website

Public site plus member accounts: sign up, email confirmation, password reset, and a personal QR pass for the door scanner. It shares the POS's Supabase project (`../couraged-pos`). Prices come live from the POS (Members › Plans). Staff work (check-ins, sales, renewals) stays in the POS.

## Setup

1. In the POS repo, run `supabase/018_member_accounts.sql` in Supabase › SQL Editor. `npm run test:db` there checks it.
2. Supabase › Authentication:
   - **Sign In / Providers:** turn **on** "Allow new users to sign up" and keep **Confirm email** on. Website sign-ups get no staff profile, so they can never open the POS.
   - **URL Configuration:** set Site URL to the live site (e.g. `https://couragedph.com`). Add `https://couragedph.com/**` to Redirect URLs. Keep the POS URL there too.
   - **Emails › SMTP:** add your own SMTP (e.g. Resend or Brevo). Supabase's built-in sender only allows a few emails an hour, which is not enough for launch. Brand the Confirm signup and Reset password templates.
   - **Policies:** set the minimum password length to 8. Optionally turn on CAPTCHA (Turnstile) for sign-ups.
3. Copy `.env.example` to `.env.local` with the same URL and anon key as the POS. Never put the service_role key here.
4. `npm install`, then `npm run dev`.

## Deploy

Vercel (or Cloudflare Pages): set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then build with `npm run build` into `dist`. `vercel.json` adds the security headers (CSP, HSTS, no framing). On Cloudflare Pages, copy them into a `public/_headers` file.

## Launch checklist (owner)

- [ ] Fill in the DPO's name and privacy email in `src/data/gym.js` (`LEGAL`). The privacy page shows "TO FILL" until then.
- [ ] Add a public email to `GYM` and the footer. RA 11967 requires trade name, address, phone and email on the homepage.
- [ ] Have a lawyer review the refund wording (`LEGAL.refunds`), the Terms and the Privacy notice.
- [ ] Sign Supabase's DPA, and check the project region (Singapore is closest).
- [ ] Replace the "Sample" coach and about copy on the home page with real copy.
- [ ] See `docs/paymongo-legal-audit.md` before turning on online payments.
