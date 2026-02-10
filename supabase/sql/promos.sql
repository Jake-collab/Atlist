create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  stripe_promo_code_id text,
  percent_off int,
  active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table public.promo_codes enable row level security;

drop policy if exists "promo_codes_select_admin" on public.promo_codes;
create policy "promo_codes_select_admin" on public.promo_codes
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "promo_codes_modify_admin" on public.promo_codes;
create policy "promo_codes_modify_admin" on public.promo_codes
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
