# Taqueria Sabrina — Order App

A mobile-first realtime order board for the Taqueria Sabrina pop-up. Vite + React

- TypeScript + Tailwind v4.

- **Public menu board** at `/` — live menu, no login.

- **Staff back-of-house** at `/app/*` (passcode-gated): order entry, kitchen queue, sales dashboard, order history, weekly archives, menu editor.

## Realtime sync (Supabase)

Orders sync live across **separate devices** (the counter phone and the kitchen screen) via Supabase Postgres + realtime subscriptions. Credentials live in `.env.local` (gitignored):

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable / anon key>
```

If those are absent, the app falls back to **same-device-only** sync (BroadcastChannel) so local dev and the Tempo canvas still work.

### One-time database setup

Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query):

```sql
-- Orders: one row per ticket. `env` separates the demo namespace ('demo')
-- from real data ('live') so the admin/admin demo can't touch live orders.
create table if not exists orders (
  id           text primary key,
  number       int  not null,
  name         text not null default '',
  items        jsonb not null default '{}',
  note         text not null default '',
  status       text not null default 'new',
  created_at   bigint not null,
  completed_at bigint,
  env          text not null default 'live'
);
-- If orders already exists from an earlier setup, add the column:
alter table orders add column if not exists env text not null default 'live';

-- Archives: one row per closed-out service (a JSON snapshot of its orders)
create table if not exists archives (
  id        text primary key,
  closed_at bigint not null,
  orders    jsonb  not null default '[]',
  env       text not null default 'live'
);
alter table archives add column if not exists env text not null default 'live';

-- App state: a single row (id = 1) holding the menu, next ticket number, and
-- storefront settings (open/closed, location, next-event date + service hours)
create table if not exists app_state (
  id          int primary key,
  menu        jsonb not null,
  next_number int   not null default 1,
  open        boolean not null default true,
  location    text    not null default 'La Cocina Lot',
  event_date  text    not null default '',
  open_time   text    not null default '21:00',
  close_time  text    not null default '23:00'
);
-- If app_state already exists from an earlier setup, add the new columns:
alter table app_state add column if not exists open       boolean not null default true;
alter table app_state add column if not exists location   text    not null default 'La Cocina Lot';
alter table app_state add column if not exists event_date text    not null default '';
alter table app_state add column if not exists open_time  text    not null default '21:00';
alter table app_state add column if not exists close_time text    not null default '23:00';

-- Enable Row Level Security, then allow the anon key full access (prototype:
-- the app is gated by a client-side crew passcode, not per-user auth).
alter table orders    enable row level security;
alter table archives  enable row level security;
alter table app_state enable row level security;

create policy "anon all orders"    on orders    for all using (true) with check (true);
create policy "anon all archives"  on archives  for all using (true) with check (true);
create policy "anon all app_state" on app_state for all using (true) with check (true);

-- Turn on realtime for all three tables
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table archives;
alter publication supabase_realtime add table app_state;
```

The app seeds the default menu into `app_state` automatically on first load.

> **Security note (prototype):** RLS is on but policies are open to the anon key, so anyone with the publishable key could read/write. That's fine for a pop-up prototype. Before this handles real customer data at scale, add Supabase Auth + per-user row policies.