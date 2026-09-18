# INOUT savings tracker

The root `index.html` is a responsive React/Tailwind prototype that runs directly on GitHub Pages. It includes the landing, auth, dashboard, create plan, plan detail, contribution logging, reminders, and maturity states. Demo data is kept in localStorage so the experience works without payment integrations.

## Supabase production setup

`supabase/schema.sql` contains the requested `users`, `plans`, `contributions`, and `notifications` tables plus row-level security policies. Replace the localStorage adapter in `index.html` with Supabase Auth and the Supabase JavaScript client after adding your project URL and anon key. Scheduled reminders should run from a Supabase Edge Function using `pg_cron` (two days before each plan's calculated next due date).

INOUT never holds, moves, or connects to users' money. A contribution is only a user-confirmed record of a transfer they made independently to their own account.
