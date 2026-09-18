-- INOUT savings tracker schema for Supabase
create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  amount numeric(12,2) not null check (amount > 0),
  frequency text not null check (frequency in ('weekly','monthly')),
  start_date date not null,
  maturity_date date not null,
  status text not null default 'active' check (status in ('active','paused','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.contributions (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  date_logged date not null default current_date,
  confirmed_by_user boolean not null default false
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete cascade,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.plans enable row level security;
alter table public.contributions enable row level security;
alter table public.notifications enable row level security;
create policy "users own profile" on public.users for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "users own plans" on public.plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own contributions" on public.contributions for all using (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid())) with check (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()));
create policy "users own notifications" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
