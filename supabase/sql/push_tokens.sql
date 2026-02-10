create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  token text not null,
  created_at timestamptz default now()
);

alter table public.push_tokens enable row level security;

drop policy if exists "push_tokens_select" on public.push_tokens;
create policy "push_tokens_select" on public.push_tokens
  for select using (user_id = auth.uid());

drop policy if exists "push_tokens_insert" on public.push_tokens;
create policy "push_tokens_insert" on public.push_tokens
  for insert with check (user_id = auth.uid());

drop policy if exists "push_tokens_delete" on public.push_tokens;
create policy "push_tokens_delete" on public.push_tokens
  for delete using (user_id = auth.uid());
