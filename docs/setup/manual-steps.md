# Manual steps — do these yourself

Steps that require you to use an external dashboard or service. Check off as you go.

---

## Expected costs (rough guide)

Use this as a planning guide. Pricing changes; check each provider’s site for current numbers.

| Service | Typical cost to get started | Notes |
|--------|-----------------------------|--------|
| **Vercel** (hosting) | **$0** (Hobby) | Free for personal/non-commercial. Plenty for this app (Next.js on Hobby). Pro is ~$20/mo per user if you need commercial use or higher limits. |
| **PostgreSQL** | **$0** (free tiers) | **Neon:** Free tier (0.5 GB storage, generous CU-hrs). **Supabase:** Free tier (500 MB DB, 2 projects). **Railway:** $5 trial then ~$1/mo credit on free plan (may be tight for always-on DB). Pick one; no card needed for Neon or Supabase free. |
| **Clerk** (auth) | **$0** (free tier) | Free tier includes a large number of monthly users (e.g. 50k MRU). Enough for MVP and early launch. Paid plans from ~$20/mo if you outgrow it. |
| **Stripe** (payments) | **$0** monthly | No monthly fee. You pay **per transaction** (e.g. 2.9% + 30¢ per successful card charge in the US). Test mode is free. |

**Bottom line:** You can run and test the full stack (Vercel + Neon or Supabase + Clerk + Stripe test mode) for **$0/month**. Production costs are hosting (often still $0 on Hobby) + DB (often $0 on free tier) + Clerk (often $0) + Stripe only when you get paid (transaction fees). Add a card only when you choose a paid plan or exceed free limits.

---

## Hosting & deployment

- [ ] **Vercel:** Create account (if needed), create project, connect this repo. Set **Root Directory** to `app` if repo root is the parent folder. Add env vars from `app/.env.example` (and any added later).
- [ ] **PostgreSQL:** Create a database (Neon, Supabase, or Railway). Copy the connection string and set `DATABASE_URL` in local `app/.env` (and in Vercel for production).
- [ ] **First-time DB setup (local):** From `app/` run `npm run db:migrate` to create tables. Optionally `npm run db:seed` for dev data. For production, run `npx prisma migrate deploy` once (e.g. from Vercel build or a one-off script).

---

## Seed data (optional)

Run `npm run db:seed` from `app/` to create 3 test accounts with distinct use cases:

| Account | Email | Tier | Properties | Use case |
|---------|-------|------|------------|----------|
| **Solo Starter** | dev@example.com | Free | 1 single-family, no mortgage | New landlord testing the waters |
| **Growth Investor** | investor@example.com | Investor | 3 properties: SFH + duplex (with mortgages), condo (50% ownership) | Active investor with mixed portfolio |
| **Professional Portfolio** | pro@example.com | Pro | 5 properties: SFH, townhouse, 4-plex, condo (mix of mortgages) | Full portfolio manager |

Seed users use placeholder Clerk IDs (`seed_solo_starter`, etc.). To sign in as them, create matching test users in Clerk Dashboard with these emails, then update the `clerkUserId` in the DB to match the real Clerk IDs. Or use **Prisma Studio** (`npm run db:studio`) to browse the data without signing in.

---

## Auth (Clerk)

- [ ] **Clerk:** Create application at [clerk.com](https://clerk.com). In Dashboard: get **Publishable key** and **Secret key**; add to `.env` as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
- [ ] **Clerk redirect URLs:** In Clerk Dashboard → Paths, set Sign-in and Sign-up redirect URLs (e.g. `/dashboard` after login). For production, add your Vercel URL.

---

## Billing (Stripe)

- [ ] **Stripe account:** Create at [stripe.com](https://stripe.com). Use test mode for development.
- [ ] **Products and prices:** In Stripe Dashboard → Products, create two products (e.g. "Investor", "Pro"). For each product, create a monthly recurring price and an annual recurring price. Copy all four price IDs (`price_...`).
- [ ] **Env vars (from `app/.env.example`):** Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID_INVESTOR_MONTHLY`, `STRIPE_PRICE_ID_INVESTOR_YEARLY`, `STRIPE_PRICE_ID_PRO_MONTHLY`, `STRIPE_PRICE_ID_PRO_YEARLY`.
- [ ] **Webhook:** In Stripe Dashboard → Developers → Webhooks, add endpoint URL: `https://<your-app>/api/billing/webhook`. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`. Copy the signing secret and set as `STRIPE_WEBHOOK_SECRET`. Webhook signatures are verified in code (see [security-notes.md](../security/security-notes.md)).
- [ ] **Stripe production:** For production, use live keys and add production webhook URL in Vercel env.

---

## Security (manual)

- [ ] **Production:** Use HTTPS only. Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://veldportfolio.com`) for canonical URLs, sitemap, and redirects. Set Clerk/Stripe redirect URLs to match. Never commit production keys or DB URL.
- [ ] **Stripe:** When adding webhooks, verify signature with `STRIPE_WEBHOOK_SECRET` in the webhook handler; reject requests with invalid or missing signature.
- [ ] **Clerk:** In production, use production Clerk instance and keys; update redirect URLs for production domain.

---

## Rent estimate (RentCast — optional)

- [ ] **RentCast API key:** To enable "Estimate rent" when adding or editing properties, create an API key at [RentCast API Dashboard](https://app.rentcast.io/app/api). Add `RENTCAST_API_KEY` to `app/.env` (and Vercel env for production). Free tier includes 50 calls/month.

---

## Admin dashboard (optional)

- [ ] **Admin emails:** To access `/admin`, set `ADMIN_EMAILS` in `app/.env` (and Vercel env for production). Use a comma-separated list of allowed emails, e.g. `ADMIN_EMAILS=you@example.com,other@example.com`. Do not commit real admin emails. If unset or empty, no one can access admin.

---

## Support / contact (launch pre-flight)

- [ ] **Support email:** Create a support email address (e.g. `support@yourdomain.com`). Add it to `app/.env` as `SUPPORT_EMAIL`. Also add to Vercel env for production. The Support link in the footer goes to `/contact`; when `SUPPORT_EMAIL` is unset, the link shows as "Contact" instead. Do not commit the real email.
- [ ] **Resend (contact form):** To enable the contact form to send emails, create an API key at [Resend](https://resend.com/api-keys) and add `RESEND_API_KEY` to `app/.env` (and Vercel env for production). For production, verify your domain at [Resend Domains](https://resend.com/domains) and set `RESEND_FROM_DOMAIN=yourdomain.com` so emails are sent from your domain instead of the test address.

---

## Later / as needed

- [ ] **Custom domain** (Vercel): Add domain in Vercel project settings.
- [ ] **Clerk production instance** if you used development first.

---

---

## After pulling / first-time app setup

- [ ] From repo root: `cd app && npm install`.
- [ ] Copy `app/.env.example` to `app/.env` and fill in any keys you need (Clerk and `DATABASE_URL` for DB; see Auth and Hosting sections above).

---

*This file is updated as we add features. New manual steps will be appended to the right section.*
