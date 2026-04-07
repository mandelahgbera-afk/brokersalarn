# Brokerr — Crypto Copy-Trading Platform

A production-ready cryptocurrency copy-trading platform built with **React 18 + Vite + Supabase**, deployable to Vercel in under 10 minutes.

---

## Features

**User Dashboard**
- Portfolio overview with balance, P&L charts, allocation donut
- Buy/sell cryptocurrencies
- Copy professional traders with allocation management
- Deposit/withdrawal requests with admin approval
- Transaction history

**Admin Panel** _(role-gated, DB-enforced)_
- Platform analytics — user count, volumes, pending actions
- Manage users — promote/demote admin, suspend/reactivate
- Manage cryptocurrencies — add, edit, toggle active
- Manage copy traders — full CRUD with all DB fields
- Review transactions — approve or reject deposits/withdrawals
- Platform settings — deposit wallet addresses

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion, Recharts |
| Backend / DB | Supabase (PostgreSQL + Auth + Row Level Security) |
| Routing | React Router v6 with nested layouts |
| Notifications | Sonner toast |
| Deployment | Vercel (static SPA with rewrites) |

---

## Environment Variables

Create a `.env.local` file in the project root (never commit this):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

These are the **only** two required variables. Get them from:  
**Supabase Dashboard → Project Settings → API**

---

## Supabase Setup

### Step 1 — Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and note your **Project URL** and **anon public key**.

### Step 2 — Run the schema

1. Open **Supabase Dashboard → SQL Editor → New query**
2. Paste the entire contents of `src/schema.sql`
3. Click **Run**

This creates all tables, indexes, RLS policies, triggers (including auto-user-creation on signup), and seeds cryptocurrency + copy trader data.

### Step 3 — Promote your first admin

After running the schema and creating your first account (via the app's sign-up flow):

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

Run this in **Supabase SQL Editor**. That user will immediately have admin access on next login.

### Step 4 — Verify RLS is active

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`.

---

## Running Locally

```bash
cp .env.example .env.local   # or create .env.local manually
npm install
npm run dev
```

App runs at `http://localhost:5173`.

---

## Deploying to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

When prompted, set the two environment variables.

### Option B — Vercel Dashboard

1. Push this folder to a GitHub repository
2. Import the repository at [vercel.com/new](https://vercel.com/new)
3. Set environment variables in **Project Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**

The included `vercel.json` handles:
- SPA rewrites (React Router page refresh works)
- Immutable cache headers for hashed assets
- No-cache for `index.html`

---

## Admin Access

Admin status is stored in `public.users.role` (enum: `user` | `admin`).

- The React app queries the DB after login to determine `isAdmin`
- All admin routes in React are guarded client-side by `AdminRoute`
- All admin DB operations are guarded server-side by RLS `is_admin()` which uses `SECURITY DEFINER` to avoid recursion
- There is no way for a regular user to escalate privileges — the `users_update_own` policy explicitly prevents changing your own `role`

---

## Testing Both Roles

### Admin user
1. Sign up with any email
2. Run the SQL above to promote to admin
3. Log out and back in
4. You'll see the Admin navigation and have access to all `/admin/*` routes

### Regular user
1. Sign up with a different email
2. Log in — you'll see the user dashboard only
3. Attempting to navigate to `/admin` will show a 404 page
4. Direct Supabase API calls from the user's JWT will be blocked by RLS

---

## Project Structure

```
src/
├── api/
│   ├── base44Client.js      # Supabase entity CRUD adapter
│   ├── supabaseClient.js    # Supabase client + auth helpers
│   └── emailService.js      # Email notification service
├── components/
│   ├── layout/              # AppLayout, Sidebar, MobileBottomNav
│   └── ui/                  # Button, Input, PageHeader, etc.
├── lib/
│   ├── AuthContext.jsx      # Auth provider (isAdmin reads from DB)
│   └── emailTemplates.js    # HTML email templates
├── pages/
│   ├── admin/               # AdminDashboard, ManageUsers, ManageTraders, etc.
│   ├── Dashboard.jsx
│   ├── Portfolio.jsx
│   ├── Trade.jsx
│   ├── CopyTrading.jsx
│   ├── Transactions.jsx
│   └── Settings.jsx
├── App.jsx                  # Router configuration + AdminRoute guard
├── main.jsx                 # Entry point
└── schema.sql               # Full database schema (run in Supabase SQL Editor)
```

---

## Security Notes

- RLS is enabled on all 9 tables
- `is_admin()` is `SECURITY DEFINER` to prevent infinite recursion
- Users cannot modify their own `role` column (policy enforces this)
- `platform_settings` is admin-write only; users can only read `deposit_*` keys
- No secrets are embedded in the build — all credentials come from environment variables
- The Supabase anon key is safe to expose in client-side code (it's public by design; RLS enforces access control)
