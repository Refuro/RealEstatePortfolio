# Business Launch Checklist — North Dakota

This document outlines steps to launch Veld Portfolio (or "Veld") as a formal business. It also covers launching without a formal entity (sole proprietor). **You are in North Dakota** — fees and processes reflect ND law.

---

## Option A: Launch as Sole Proprietor (No Formal Business)

### What it means

You operate as yourself. No LLC, no corporation. Your legal name is the business name. You can use a trade name (DBA) like "Veld Portfolio" for customer-facing purposes.

### Pros

- **Free** — No formation fees
- **Simple** — No annual reports, no operating agreement
- **Fast** — Start immediately
- **Stripe** — Stripe accepts sole proprietors. Use your SSN (no EIN required). Business name can be "Veld Portfolio" or your name.

### Cons

- **No liability protection** — If the business is sued or can't pay debts, your personal assets (home, car, savings) are at risk
- **Less professional** — Some customers or partners prefer working with an LLC
- **Tax** — Income reported on Schedule C; you pay 15.3% self-employment tax on net income

### When it makes sense

- **Testing the idea** — Early stage, few or no paying customers
- **Low risk** — SaaS with minimal liability exposure (no physical products, no employees, no high-stakes advice)
- **Planning to form LLC soon** — Once you have traction, form an LLC and migrate

### What you need (sole proprietor)

| Step | Action | Cost |
|------|--------|------|
| 1 | Buy domain (veldportfolio.com) | ~$10–15/year |
| 2 | Register trade name (DBA) "Veld Portfolio" with ND Secretary of State if you want to use that name | $25 (expires in 5 years) |
| 3 | Stripe account — sign up as Individual/Sole proprietor, use SSN | Free |
| 4 | Terms/Privacy — use your legal name or "Veld Portfolio" as the operating name | — |

**Trade name (DBA):** If you operate as "Veld Portfolio" but your legal name is "John Smith," North Dakota requires a trade name registration. File at [FirstStop](https://firststop.sos.nd.gov/). Fee: $25.

---

## Option B: Launch with LLC (Recommended Before Real Revenue)

### What it means

Form a limited liability company. The LLC is a separate legal entity. Your personal assets are generally protected from business debts and lawsuits.

### When to form

- **Before launch** — If you want protection from day one
- **Before meaningful revenue** — Once you have paying customers, liability exposure grows
- **Before contracts** — If you sign agreements (e.g., RentCast, Vercel), having an LLC is cleaner

### North Dakota LLC — Steps and Costs

| Step | Action | Cost | Where |
|------|--------|------|-------|
| 1 | **Name search** — Ensure "Veld Software LLC" (or chosen name) is available | Free | [ND FirstStop](https://firststop.sos.nd.gov/) |
| 2 | **File Articles of Organization** | $135 (online) / $145 (paper) | [ND FirstStop](https://firststop.sos.nd.gov/) |
| 3 | **Registered agent** — You can be your own if you have an ND address | $0 (self) or $100–300/year (service) | — |
| 4 | **Operating agreement** — Recommended but not required by ND | $0 (DIY) or $100+ (template/service) | — |
| 5 | **EIN (Employer ID)** — From IRS | Free | [IRS EIN](https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online) |
| 6 | **Trade name (DBA)** — If operating as "Veld Portfolio" instead of "Veld Software LLC" | $25 | [ND FirstStop](https://firststop.sos.nd.gov/) |
| 7 | **Business bank account** | Free (many banks) | Your bank |

**Ongoing:** Annual report — $50/year to keep LLC active.

### Suggested LLC name

- **Veld Software LLC** — Legal entity name (if you form an LLC, update the Terms of Service and Privacy Policy to name the entity)
- **Veld Portfolio** — Trade name (DBA) for the product

**Current in-app copy (as of March 2026):** Terms and Privacy describe the operator as an **individual** doing business as Veld Portfolio (sole proprietor–style). Replace with your legal entity name when you register a business.

### Timeline

- Online filing: typically 1–2 business days
- EIN: immediate online
- Bank account: same day or next with EIN and formation docs

---

## Full Launch Checklist (LLC Path)

Use this when you're ready to launch with an LLC.

### Pre-launch (2–4 weeks before)

- [ ] **Domain** — Purchase veldportfolio.com (and optionally veldportfolio.io)
- [ ] **Name search** — Check ND FirstStop for "Veld Software LLC" availability
- [ ] **Form LLC** — File Articles of Organization via FirstStop ($135)
- [ ] **Operating agreement** — Draft and sign (keep for your records)
- [ ] **EIN** — Apply at IRS.gov (free)
- [ ] **Trade name** — Register "Veld Portfolio" if using that as DBA ($25)
- [ ] **Business bank account** — Open account in LLC name
- [ ] **Stripe** — Create account under LLC, use EIN. Update from test to live when ready.
- [ ] **Terms/Privacy** — Update legal entity to "Veld Software LLC" (or your LLC name)
- [ ] **Clerk, Vercel, etc.** — Ensure production env vars use your domain

### Launch day

- [ ] **DNS** — Point domain to Vercel (or host)
- [ ] **Stripe** — Switch to live keys
- [ ] **Smoke test** — Sign up, add property, subscribe (test with real card or use Stripe test mode first)

### Post-launch (when you have traction)

- [ ] **Trademark** — Consider federal registration for "Veld Portfolio" (~$600–850 with attorney)
- [ ] **Business license** — Check if ND or your city requires a general business license (varies)

---

## Sole Proprietor → LLC Migration

If you launch as a sole proprietor and later form an LLC:

1. Form the LLC (same steps above)
2. Get EIN for LLC
3. Create new Stripe account under LLC (or contact Stripe to migrate — they may support it)
4. Update bank account — new account for LLC
5. Update Terms/Privacy with new entity name
6. Cancel/close sole proprietor Stripe account and migrate customers if possible

**Note:** Migrating Stripe can be disruptive. If you expect to form an LLC within a few months, forming it before launch is simpler.

---

## North Dakota Resources

- **Secretary of State / FirstStop:** https://firststop.sos.nd.gov/
- **Business services:** https://www.sos.nd.gov/business
- **IRS EIN:** https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online

---

## Summary Recommendation

| Situation | Recommendation |
|-----------|----------------|
| **Testing, no revenue yet** | Sole proprietor + trade name. Low cost, fast. Form LLC when you have paying customers. |
| **Launching with paid plans** | Form LLC before launch. Protects you from day one. ND cost: ~$160 (filing + DBA) plus $50/year. |
| **Already have users/revenue** | Form LLC as soon as practical. |

**Domain:** Buy veldportfolio.com regardless of entity choice. It's cheap and secures the name.
