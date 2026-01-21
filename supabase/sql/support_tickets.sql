-- Run once in Supabase SQL editor to create support_tickets
create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  email text,
  type text check (type in ('support','bug')),
  message text,
  reply text,
  created_at timestamptz default now()
);

alter table public.support_tickets enable row level security;

drop policy if exists "support_insert_own" on public.support_tickets;
create policy "support_insert_own" on public.support_tickets
  for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "support_select_own" on public.support_tickets;
create policy "support_select_own" on public.support_tickets
  for select
  using (auth.uid() = user_id);

-- Admin select all (reuse your profiles role check, or simplify as below):
drop policy if exists "support_select_admin" on public.support_tickets;
create policy "support_select_admin" on public.support_tickets
  for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
