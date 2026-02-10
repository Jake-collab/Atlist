-- Run in Supabase SQL editor to create otp_codes table for 2FA
create table if not exists public.otp_codes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  email text,
  code text,
  expires_at timestamptz,
  used boolean default false,
  created_at timestamptz default now()
);

alter table public.otp_codes enable row level security;

drop policy if exists "otp_insert_own" on public.otp_codes;
create policy "otp_insert_own" on public.otp_codes
  for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "otp_select_own" on public.otp_codes;
create policy "otp_select_own" on public.otp_codes
  for select
  using (auth.uid() = user_id);
