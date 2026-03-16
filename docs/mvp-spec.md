
# Veld Portfolio — MVP Specification

## Project Vision

Build a lightweight SaaS platform for **small real estate investors (1–20 properties)** to track portfolio performance, analyze returns, and understand their investment position in real time.

The platform will function as a **portfolio intelligence dashboard**, not a property management tool.

Unlike existing landlord software that focuses on tenants, rent collection, and maintenance, this platform focuses on **investment analytics and portfolio-level insights**.

Primary value proposition:

> Replace investor spreadsheets with a centralized analytics dashboard that automatically calculates key real estate investment metrics.

---

# Target Users

Primary users:

Small real estate investors who:

* own **1–20 rental properties**
* manage investments themselves
* currently track portfolio performance using spreadsheets
* want to better understand returns and leverage

Examples:

* individual landlords
* small rental investors
* BRRR investors
* house hackers
* early-stage real estate portfolio builders

---

# Core Problems Solved

Most small investors currently track properties using:

* Excel
* Google Sheets
* scattered financial documents

These solutions make it difficult to:

* visualize portfolio performance
* track equity growth
* monitor leverage
* evaluate refinance or sale timing

The platform will solve this by providing:

* a centralized portfolio dashboard
* automated investment metrics
* historical performance visualization

---

# Product Scope

## What This Product Is

* portfolio analytics software
* investment performance tracker
* financial dashboard for rental properties

## What This Product Is Not

* property management software
* tenant management
* rent collection
* maintenance tracking

Those features are intentionally excluded from the MVP.

---

# Core MVP Features

## 1. User Authentication

Users must be able to:

* create accounts
* log in
* securely store portfolio data

Requirements:

* email/password authentication
* secure session handling

Future enhancements:

* OAuth login
* two-factor authentication

---

## 2. Portfolio Dashboard

The dashboard will display a summary of the investor’s portfolio.

Metrics:

* total property value
* total loan balance
* total equity
* monthly cash flow
* portfolio cap rate
* loan-to-value ratio

Example dashboard layout:

```
Portfolio Summary

Total Properties: 4
Total Property Value: $1,120,000
Total Debt: $720,000
Total Equity: $400,000

Monthly Cash Flow: $2,450
Portfolio Cap Rate: 7.3%
Portfolio LTV: 64%
```

---

## 3. Property Management (Data Storage)

Users can create and manage properties within their portfolio.

Each property record should include:

```
Property Name
Address
Purchase Price
Purchase Date
Current Estimated Value

Mortgage Balance
Interest Rate
Loan Term
Monthly Payment

Monthly Rent
Operating Expenses
```

The system must support:

* creating properties
* editing property data
* deleting properties

---

## 4. Investment Metrics Engine

The system automatically calculates investment metrics.

Metrics per property:

* cap rate
* cash flow
* equity
* loan-to-value
* cash-on-cash return

Portfolio metrics:

* total equity
* total leverage
* weighted cap rate
* monthly portfolio cash flow

All metrics should update dynamically when property data changes.

---

## 5. Mortgage Amortization Tracking

Given mortgage parameters:

```
loan amount
interest rate
loan term
```

The system should compute:

* remaining balance
* principal vs interest
* payoff timeline

Display:

* amortization chart
* balance over time

---

## 6. Portfolio Visualization

The system should generate visualizations for:

* equity growth
* portfolio value over time
* cash flow trends

Charts:

* equity chart
* portfolio value chart
* leverage ratio chart

---

# Optional Post-MVP Integrations

These features are not required for the first release.

Possible integrations:

| Data Source   | Purpose                  |
| ------------- | ------------------------ |
| RentCast      | rent estimates           |
| Zillow API    | property value estimates |
| Census / FHFA | market trends            |

Initial MVP should rely primarily on **manual user input**.

---

# Technical Architecture

## Frontend

Recommended stack:

* Next.js
* React
* TypeScript

Responsibilities:

* dashboard UI
* property forms
* charts
* authentication flows

---

## Backend

Recommended stack:

Node.js API (or Next.js API routes)

Responsibilities:

* portfolio data storage
* metric calculations
* user authentication
* API endpoints

---

## Database

Recommended database:

PostgreSQL

Core tables:

```
users
properties
mortgages
portfolio_metrics
```

---

## Authentication

Possible solutions:

* Supabase Auth
* Clerk
* Auth0

Requirements:

* secure user sessions
* encrypted passwords

---

## Payments

Stripe integration.

Pricing tiers example:

```
Free Tier
1 property

Investor
$9/month
5 properties

Pro
$19/month
20 properties
```

Stripe responsibilities:

* subscriptions
* billing
* plan enforcement

---

## Hosting

Suggested deployment stack:

Frontend:

* Vercel

Backend:

* Vercel / Fly.io / Render

Database:

* Supabase
* Neon
* Railway

---

# Data Model (MVP)

## Users

```
id
email
password_hash
created_at
```

---

## Properties

```
id
user_id
address
purchase_price
purchase_date
current_value
monthly_rent
monthly_expenses
```

---

## Mortgages

```
id
property_id
loan_amount
interest_rate
loan_term_years
monthly_payment
remaining_balance
```

---

# API Endpoints

Example endpoints:

```
POST /auth/signup
POST /auth/login

GET /properties
POST /properties
PUT /properties/:id
DELETE /properties/:id

GET /portfolio/metrics
```

---

# Development Roadmap

## Phase 1 — Project Setup

Tasks:

* create repository
* configure Next.js project
* set up database
* configure authentication

Goal:

Basic user login system working.

---

## Phase 2 — Property CRUD

Tasks:

* create property model
* build property input form
* implement property CRUD API
* connect UI to backend

Goal:

Users can store and manage properties.

---

## Phase 3 — Metrics Engine

Tasks:

* implement investment calculations
* compute portfolio metrics
* expose metrics API

Goal:

System calculates investment analytics automatically.

---

## Phase 4 — Dashboard

Tasks:

* implement dashboard UI
* display metrics
* add charts

Goal:

Users can visualize their portfolio.

---

## Phase 5 — Mortgage Tracking

Tasks:

* implement amortization logic
* build mortgage visualizations

Goal:

Users see loan payoff timelines.

---

## Phase 6 — Stripe Integration

Tasks:

* implement subscription tiers
* enforce property limits

Goal:

Monetization ready.

---

# MVP Launch Criteria

The MVP is complete when users can:

* create accounts
* add properties
* view portfolio metrics
* visualize investment performance

External integrations are not required for launch.

---

# Success Metrics

Key indicators of early success:

* number of registered users
* number of active portfolios
* conversion rate from free → paid

Early milestone targets:

```
100 users
25 paid users
```

---

# Long-Term Vision

**See `docs/roadmap.md`** — Long-term vision, value-add features, and future initiatives are consolidated there.

Ultimate goal: Create a **portfolio intelligence platform for real estate investors**.

